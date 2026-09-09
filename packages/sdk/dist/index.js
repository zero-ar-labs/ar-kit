/**
 * @zero-ar/sdk: authoring builders.
 *
 * What this is: defineAgent, defineTool, defineValidator, and definePosture,
 * each producing an immutable, content-addressed manifest validated at
 * declaration time (ADX-001). The SDK holds no loop, no storage, and no way
 * to promote completion; it authors declarations and talks to the runtime
 * through the public client alone.
 *
 * How it fits: this milestone carries the minimal builder set the ERD asks
 * of the runway. Tool bindings, validator conformance, posture registries,
 * and the compiler for YAML and Markdown forms grow through milestones two
 * and three without changing what a manifest is: frozen data plus a hash.
 */
import { DomainPackSchema, MACHINE_PREDICATE, contentHash, refuse } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
const NAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
function sealed(kind, manifest) {
    if (!NAME.test(manifest.name)) {
        refuse({
            code: 'sdk.name.invalid',
            message: `${kind} name ${manifest.name} does not fit lowercase dot-separated naming.`,
            fix: 'a name like research.citations-resolve',
        });
    }
    if (!VERSION.test(manifest.version)) {
        refuse({ code: 'sdk.version.invalid', message: `${kind} version ${manifest.version} is not semantic versioning.`, fix: '1.0.0' });
    }
    const body = { kind, ...manifest };
    return Object.freeze({ ...body, hash: contentHash(body) });
}
export function defineAgent(spec) {
    return sealed('agent', { model: 'project-default', tools: [], ...spec });
}
export function defineTool(spec) {
    return sealed('tool', spec);
}
export function defineValidator(spec) {
    if (!spec.verdicts.includes('indeterminate')) {
        refuse({
            code: 'sdk.validator.no-indeterminate',
            message: `validator ${spec.name} cannot return indeterminate, which means it is lying about at least one of its inputs.`,
            clause: 'companion, the validator contract',
        });
    }
    return sealed('validator', spec);
}
export function definePosture(spec) {
    return sealed('posture', spec);
}
export { createZeroAR, ZeroAR, RunHandle } from "./embed.js";
export { SOURCE_KINDS, loadProject, lockBytes, renderDiagnostics } from "./project.js";
export { developmentLoop } from "./development.js";
export function createRuntimeClient(baseUrl) {
    return new ZeroARClient(baseUrl);
}
/**
 * Compile a domain pack for publication (XCV-012). Machine claims must be
 * versioned predicates whose evidence names a validator the deployment
 * really has; a prose claim or unresolved evidence fails here, before
 * anything publishes. Notes pass through labelled as informational, with
 * no authority, so a pack cannot smuggle a claim through a sentence.
 */
export function compileDomainPack(pack, available) {
    const parsed = DomainPackSchema.safeParse(pack);
    if (!parsed.success) {
        refuse({
            code: 'pack.malformed',
            message: `the pack does not parse as a domain pack: ${parsed.error.issues[0]?.message ?? 'shape mismatch'}.`,
            clause: 'XCV-012',
        });
    }
    for (const claim of pack.claims) {
        if (!MACHINE_PREDICATE.test(claim.predicate)) {
            refuse({
                code: 'pack.claim.prose',
                message: `claim "${claim.predicate}" is prose, not a machine predicate, and prose publishes no claim. ` +
                    'Write a kebab-case predicate with pinned evidence, or move the sentence to notes, which stay informational.',
                clause: 'XCV-012',
            });
        }
        const resolved = available.some((v) => v.name === claim.evidence.validator && v.version === claim.evidence.version);
        if (!resolved) {
            refuse({
                code: 'pack.claim.unresolved',
                message: `claim ${claim.predicate} pins evidence to ${claim.evidence.validator}@${claim.evidence.version}, ` +
                    'which this deployment does not have, so the claim cannot publish.',
                alternatives: available.map((v) => `${v.name}@${v.version}`),
                clause: 'XCV-012',
            });
        }
    }
    return {
        pack_ref: contentHash(pack),
        name: pack.name,
        version: pack.version,
        claims: pack.claims.map((claim) => ({ ...claim, resolved: true })),
        informational_notes: {
            authority: 'none',
            rendering: 'informational notes. Not compiled as claims; nothing here carries authority',
            notes: pack.notes,
        },
    };
}
export { compileProject, compileSkill, exportAgentSkill, renderPlan } from "./publication.js";
export { verifyBundle } from '@zero-ar/contracts';
export { defineOrchestration, runOrchestration } from "./orchestration.js";
export { defineResearchOrchestration, runResearchOrchestration } from "./research-orchestration.js";
