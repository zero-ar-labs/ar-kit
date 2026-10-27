import { DEFAULT_CONTEXT_BUDGET_TOKENS, POLICY_SKILL_WINDOW_DEFAULT_SHARE_PPM, PostureSchema, ProcedureManifestSchema, approxTokens, publishedSkillInstructions, refuse } from '@zero-ar/contracts';
export function publicationSkillWarnings(compiled, options = {}) {
    const budget = options.context_budget_tokens ?? DEFAULT_CONTEXT_BUDGET_TOKENS;
    if (!Number.isSafeInteger(budget) || budget < 0) {
        refuse({ code: 'publish.skill.context-budget', clause: 'DXI-010', message: 'skill sizing needs a nonnegative integer admitted context budget. Supply the context allowance after output, schemas and framing, or omit it for the default estimate.' });
    }
    const root = JSON.parse(compiled.blobs.get(compiled.bundle.root_ref) ?? '{}');
    const attached = root.kind === 'agent' ? new Set(root.procedures ?? []) : null;
    const skills = compiled.bundle.declarations.filter(entry => entry.kind === 'procedure' && (!attached || attached.has(entry.content_ref)))
        .sort((left, right) => left.content_ref.localeCompare(right.content_ref))
        .map(entry => ({ ref: entry.content_ref, manifest: ProcedureManifestSchema.parse(JSON.parse(compiled.blobs.get(entry.content_ref) ?? 'null')) }))
        .map(({ ref, manifest }) => ({ ref, manifest, text: compiled.blobs.get(manifest.entry_ref) ?? '' }));
    const base = root.instructions_ref ? approxTokens(compiled.blobs.get(root.instructions_ref) ?? '') : 0;
    const fixed = skills.filter(skill => skill.manifest.activation !== 'progressive');
    const fixedCost = fixed.reduce((sum, skill) => sum + approxTokens(publishedSkillInstructions({ ref: skill.ref, name: skill.manifest.name, version: skill.manifest.version, instructions: skill.text })), 0);
    const posture = root.posture_ref ? PostureSchema.parse(JSON.parse(compiled.blobs.get(root.posture_ref) ?? 'null')) : null;
    const share = posture?.skill_context?.maximum_window_share_ppm ?? POLICY_SKILL_WINDOW_DEFAULT_SHARE_PPM;
    const policies = fixed.filter(skill => skill.manifest.context_policy === 'bounded-run-v1');
    const policyCost = policies.reduce((sum, skill) => sum + approxTokens(publishedSkillInstructions({ ref: skill.ref, name: skill.manifest.name, version: skill.manifest.version, instructions: skill.text })), 0);
    const allowance = Number(BigInt(budget) * BigInt(share) / 1000000n);
    const basis = options.context_budget_tokens === undefined ? `the default ${budget}-token admitted context estimate` : `the supplied ${budget}-token admitted context estimate`;
    const warnings = [];
    for (const skill of skills) {
        const rendered = approxTokens(publishedSkillInstructions({ ref: skill.ref, name: skill.manifest.name, version: skill.manifest.version, instructions: skill.text }));
        const cost = skill.manifest.activation === 'progressive' ? approxTokens(skill.text) : rendered;
        const available = Math.max(0, budget - base - fixedCost + (skill.manifest.activation === 'progressive' ? 0 : rendered));
        if (cost <= available)
            continue;
        const paths = skill.manifest.resources.map(resource => resource.path);
        warnings.push({ code: 'publish.skill.entry-too-large', severity: 'warning', clause: 'DXI-010', path: skill.ref,
            message: `${skill.manifest.name} ${skill.manifest.version} has ${Buffer.byteLength(skill.text)} entry bytes and needs at least ${cost} estimated tokens, above the ${available} left by known fixed instructions in ${basis}. Move detailed material into declared resources and read it with skill.read using start_line and end_line${paths.length ? `, for example ${paths[0]}` : ''}. Runtime admission also accounts for the objective, catalogue and call overhead; a smaller serving window can lower this allowance.` });
    }
    if (fixed.length && base + fixedCost > budget && !warnings.length) {
        warnings.push({ code: 'publish.skill.fixed-context-too-large', severity: 'warning', clause: 'DXI-010',
            message: `agent instructions and fixed skill entries need about ${base + fixedCost} tokens, above ${basis}. Reduce fixed instructions or move detailed skill material into declared resources read by line range. Runtime admission still checks the actual call window.` });
    }
    if (policies.length && policyCost > allowance) {
        warnings.push({ code: 'publish.skill.policy-share-exceeded', severity: 'warning', clause: 'DXI-010',
            message: `run-long policy skills ${policies.map(skill => skill.manifest.name).join(', ')} need about ${policyCost} tokens including published identity headers, above their ${allowance}-token share (${share} ppm) of ${basis}. Publish a smaller policy, a larger pinned posture share or a larger admitted context budget. Move supporting detail to declared resources read by line range. The runtime enforces this share before a model call.` });
    }
    return warnings;
}
