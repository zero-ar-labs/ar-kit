/**
 * Capability profile manifests.
 *
 * What this is: the contracts-owned description of what a named profile
 * claims, what it excludes, which components it probes, and which evidence
 * names support those claims.
 *
 * How it fits: composition roots consume this instead of maintaining private
 * health or release capability maps. The manifest ref is pinned into new runs,
 * so a profile change is visible in durable history.
 */
import { z } from 'zod';
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { AGGREGATOR_PROVIDERS, ARTIFACT_BACKENDS, EFFECT_PLANE_MODES, ENVIRONMENT_BACKENDS, MODEL_PROVIDERS, OPERATION_CLASSES, PROFILE_CAPABILITIES, PROFILE_CAPABILITY_REFUSAL_POINTS, PROFILE_CAPABILITY_STATES, PROFILE_COMPONENTS, PROFILES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const requirementId = z.string().regex(/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-\d{2,3}$/, 'expected a requirement id');
const vectorId = z.string().regex(/^(?:[KQEX]CV|[A-Z0-9-]+-CV)-\d{3}$/, 'expected a conformance vector id');
const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const oneMiB = 1_048_576;
const sixtyFourKiB = 65_536;
export const ProfileArtifactPolicySchema = z.strictObject({
    tool_result_inline_threshold_bytes: z.number().int().min(0).max(sixtyFourKiB),
    tool_result_max_artifact_bytes: z.number().int().min(1).max(16 * oneMiB),
    tool_result_range_read_max_bytes: z.number().int().min(1).max(oneMiB),
}).superRefine((policy, ctx) => {
    if (policy.tool_result_max_artifact_bytes < policy.tool_result_inline_threshold_bytes) {
        ctx.addIssue({
            code: 'custom',
            path: ['tool_result_max_artifact_bytes'],
            message: 'the tool-result artifact maximum must be at least the inline threshold.',
        });
    }
    if (policy.tool_result_range_read_max_bytes > policy.tool_result_max_artifact_bytes) {
        ctx.addIssue({
            code: 'custom',
            path: ['tool_result_range_read_max_bytes'],
            message: 'the artifact range-read ceiling must fit inside the admitted artifact maximum.',
        });
    }
});
export const ProfileCapabilityEntrySchema = z.strictObject({
    capability: z.enum(PROFILE_CAPABILITIES),
    state: z.enum(PROFILE_CAPABILITY_STATES),
    summary: z.string().min(1).max(1_000),
    refusal_point: z.enum(PROFILE_CAPABILITY_REFUSAL_POINTS),
    diagnostic_code: z.string().min(1).max(128).nullable(),
    requirements: z.array(requirementId).max(64),
    vectors: z.array(vectorId).max(64),
});
export const ProfileCapabilityManifestSchema = z.strictObject({
    schema: z.literal('zero-ar-profile-capability-manifest/1'),
    manifest_id: z.string().regex(/^[a-z0-9][a-z0-9.-]*$/, 'expected lowercase dot or dash separated manifest id'),
    profile: z.enum(PROFILES),
    version: semver,
    manifest_ref: hash,
    capability_vocabulary_ref: hash,
    model_providers: z.array(z.enum(MODEL_PROVIDERS)),
    aggregator_providers: z.array(z.enum(AGGREGATOR_PROVIDERS)),
    environment_backends: z.array(z.enum(ENVIRONMENT_BACKENDS)),
    artifact_backends: z.array(z.enum(ARTIFACT_BACKENDS)),
    artifact_policy: ProfileArtifactPolicySchema,
    tool_operation_classes: z.array(z.enum(OPERATION_CLASSES)),
    effect_plane: z.enum(EFFECT_PLANE_MODES),
    components: z.strictObject({
        required: z.array(z.enum(PROFILE_COMPONENTS)),
        health_probes: z.array(z.enum(PROFILE_COMPONENTS)),
    }),
    capabilities: z.array(ProfileCapabilityEntrySchema),
});
export const ProfileCapabilitySummarySchema = z.strictObject({
    manifest_id: z.string(),
    manifest_ref: hash,
    profile: z.enum(PROFILES),
    version: semver,
    supported: z.array(z.enum(PROFILE_CAPABILITIES)),
    conditional: z.array(z.strictObject({
        capability: z.enum(PROFILE_CAPABILITIES),
        refusal_point: z.enum(PROFILE_CAPABILITY_REFUSAL_POINTS),
        diagnostic_code: z.string(),
        summary: z.string(),
    })),
    excluded: z.array(z.strictObject({
        capability: z.enum(PROFILE_CAPABILITIES),
        refusal_point: z.enum(PROFILE_CAPABILITY_REFUSAL_POINTS),
        diagnostic_code: z.string(),
        summary: z.string(),
    })),
    required_components: z.array(z.enum(PROFILE_COMPONENTS)),
    health_probes: z.array(z.enum(PROFILE_COMPONENTS)),
    artifact_policy: ProfileArtifactPolicySchema,
});
export function profileCapabilityManifestFor(profile) {
    return PROFILE_CAPABILITY_MANIFESTS[profile];
}
export function profileCapabilityManifestRef(manifest) {
    const { manifest_ref: _manifestRef, ...material } = manifest;
    return contentHash(material);
}
export function profileCapabilitySummary(manifest) {
    return ProfileCapabilitySummarySchema.parse({
        manifest_id: manifest.manifest_id,
        manifest_ref: manifest.manifest_ref,
        profile: manifest.profile,
        version: manifest.version,
        supported: manifest.capabilities.filter((entry) => entry.state === 'supported').map((entry) => entry.capability),
        conditional: manifest.capabilities
            .filter((entry) => entry.state === 'conditional')
            .map((entry) => ({
            capability: entry.capability,
            refusal_point: entry.refusal_point,
            diagnostic_code: entry.diagnostic_code,
            summary: entry.summary,
        })),
        excluded: manifest.capabilities
            .filter((entry) => entry.state === 'excluded')
            .map((entry) => ({
            capability: entry.capability,
            refusal_point: entry.refusal_point,
            diagnostic_code: entry.diagnostic_code,
            summary: entry.summary,
        })),
        required_components: manifest.components.required,
        health_probes: manifest.components.health_probes,
        artifact_policy: manifest.artifact_policy,
    });
}
export function profileCapabilitySummaryFor(profile) {
    return profileCapabilitySummary(profileCapabilityManifestFor(profile));
}
export function profileGuaranteeExclusions(profile) {
    return profileCapabilitySummaryFor(profile).excluded.map((entry) => `${entry.capability}: ${entry.summary}`);
}
export function compileProfileCapabilityManifest(value, options = {}) {
    const parsed = ProfileCapabilityManifestSchema.safeParse(value);
    if (!parsed.success) {
        refuse({
            code: 'capability-profile.unknown',
            message: 'the profile capability manifest uses a capability, component, provider, backend or field outside the contracts vocabulary. Use the closed vocabularies in @ramsden/contracts.',
            clause: 'UAT-PRO-002',
        });
    }
    const manifest = parsed.data;
    const actualRef = profileCapabilityManifestRef(manifest);
    if (manifest.manifest_ref !== actualRef || (options.expected_manifest_ref && options.expected_manifest_ref !== actualRef)) {
        refuse({
            code: 'capability-profile.hash-mismatch',
            message: 'the profile capability manifest hash does not match its material fields. Recompute the manifest ref from the same release bytes before profile compilation.',
            clause: 'UAT-PRO-002',
        });
    }
    const entries = new Map();
    const duplicated = new Set();
    for (const entry of manifest.capabilities) {
        if (entries.has(entry.capability))
            duplicated.add(entry.capability);
        entries.set(entry.capability, entry);
    }
    if (duplicated.size > 0) {
        refuse({
            code: 'capability-profile.duplicate',
            message: `the profile capability manifest classifies ${[...duplicated].sort().join(', ')} more than once. Put each capability in one state only.`,
            clause: 'UAT-PRO-002',
        });
    }
    const missing = PROFILE_CAPABILITIES.filter((capability) => !entries.has(capability));
    if (missing.length > 0) {
        refuse({
            code: 'capability-profile.incomplete',
            message: `the profile capability manifest omits ${missing.join(', ')}. Classify every capability before release.`,
            clause: 'UAT-PRO-001',
        });
    }
    const missingRefusal = manifest.capabilities.filter((entry) => entry.state !== 'supported' && (entry.refusal_point === 'not-applicable' || entry.diagnostic_code === null));
    if (missingRefusal.length > 0) {
        refuse({
            code: 'capability-profile.refusal-missing',
            message: `the unavailable capabilities ${missingRefusal.map((entry) => entry.capability).sort().join(', ')} do not name a refusal point and diagnostic. Add both before release.`,
            clause: 'UAT-PRO-001',
        });
    }
    const implemented = new Set(options.implemented_capabilities ?? PROFILE_CAPABILITIES);
    const unimplemented = manifest.capabilities
        .filter((entry) => entry.state === 'supported' && !implemented.has(entry.capability))
        .map((entry) => entry.capability)
        .sort();
    if (unimplemented.length > 0) {
        refuse({
            code: 'capability-profile.unimplemented',
            message: `the profile supports ${unimplemented.join(', ')}, but this release composition did not declare that implementation. Wire it or exclude it at a named boundary.`,
            clause: 'UAT-PRO-002',
        });
    }
    return manifest;
}
export function assertProfileCapabilitySupported(manifest, capability, boundary) {
    const compiled = compileProfileCapabilityManifest(manifest);
    const entry = compiled.capabilities.find((candidate) => candidate.capability === capability);
    if (!entry) {
        refuse({
            code: 'capability-profile.capability-absent',
            message: `capability ${capability} is not present in ${compiled.manifest_id}. Classify it before using the profile.`,
            clause: 'UAT-PRO-001',
        });
    }
    if (entry.state !== 'supported') {
        const at = boundary ?? entry.refusal_point;
        refuse({
            code: entry.diagnostic_code ?? 'capability-profile.unavailable',
            message: `${entry.capability} is ${entry.state} in ${compiled.manifest_id} at ${entry.refusal_point}; request reached ${at}. ${entry.summary}`,
            clause: 'UAT-PRO-002',
        });
    }
    return entry;
}
export function renderProfileCapabilityPage(manifest) {
    const summary = profileCapabilitySummary(manifest);
    const lines = [
        '# Zero-AR first-beta capability page',
        '',
        'Generated from `@zero-ar/contracts`. Do not edit by hand.',
        '',
        `Manifest: ${summary.manifest_id}`,
        `Profile: ${summary.profile}`,
        `Version: ${summary.version}`,
        `Reference: ${summary.manifest_ref}`,
        '',
        '## Supported capabilities',
        '',
        '| Capability | Evidence |',
        '|---|---|',
        ...manifest.capabilities
            .filter((entry) => entry.state === 'supported')
            .map((entry) => `| ${entry.capability} | ${entry.vectors.join(' ') || 'not yet mapped'} |`),
        '',
        '## Excluded capabilities',
        '',
        '| Capability | Refusal point | Diagnostic |',
        '|---|---|---|',
        ...summary.excluded.map((entry) => `| ${entry.capability} | ${entry.refusal_point} | ${entry.diagnostic_code} |`),
        '',
        '## Conditional capabilities',
        '',
        '| Capability | Admission boundary | Diagnostic |',
        '|---|---|---|',
        ...summary.conditional.map((entry) => `| ${entry.capability} | ${entry.refusal_point} | ${entry.diagnostic_code} |`),
        '',
        '## Artifact policy',
        '',
        '| Limit | Bytes |',
        '|---|---:|',
        `| Tool result inline threshold | ${summary.artifact_policy.tool_result_inline_threshold_bytes} |`,
        `| Tool result artifact maximum | ${summary.artifact_policy.tool_result_max_artifact_bytes} |`,
        `| Tool result range-read maximum | ${summary.artifact_policy.tool_result_range_read_max_bytes} |`,
        '',
    ];
    return `${lines.join('\n')}\n`;
}
function seal(material) {
    const normalized = {
        ...material,
        model_providers: [...material.model_providers].sort(),
        aggregator_providers: [...material.aggregator_providers].sort(),
        environment_backends: [...material.environment_backends].sort(),
        artifact_backends: [...material.artifact_backends].sort(),
        tool_operation_classes: [...material.tool_operation_classes].sort(),
        components: {
            required: [...material.components.required].sort(),
            health_probes: [...material.components.health_probes].sort(),
        },
        capabilities: [...material.capabilities].sort((left, right) => left.capability.localeCompare(right.capability)),
    };
    return ProfileCapabilityManifestSchema.parse({
        ...normalized,
        manifest_ref: contentHash(normalized),
    });
}
function supported(capability, summary, vectors = [], requirements = ['UAT-PRO-001']) {
    return { capability, state: 'supported', summary, refusal_point: 'not-applicable', diagnostic_code: null, requirements, vectors };
}
function excluded(capability, refusal_point, diagnostic_code, summary, vectors = [], requirements = ['UAT-PRO-002']) {
    return { capability, state: 'excluded', summary, refusal_point, diagnostic_code, requirements, vectors };
}
function conditional(capability, summary, vectors, requirements = ['ENV-040', 'ENV-041', 'ENV-042']) {
    return {
        capability,
        state: 'conditional',
        summary,
        refusal_point: 'profile-compilation',
        diagnostic_code: 'environment.capability.unavailable',
        requirements,
        vectors,
    };
}
const localLiteSupported = [
    supported('artifacts', 'Local artifact storage exists for development and conformance work.', ['XCV-002']),
    supported('canonical-log', 'Runs append to the canonical log and rebuild projections from it.', ['KCV-001']),
    supported('environment-process', 'Local process execution is available under the development profile.', ['ENV-CV-003']),
    supported('honest-completion', 'Completion stays tied to validator verdicts and explicit unverified outcomes.', ['QCV-003']),
    supported('local-lite', 'The local development profile runs with SQLite and deterministic providers.', ['XCV-002']),
    supported('quality-plane', 'The validator seam and quality ledger run in the local composition.', ['QCV-004']),
    supported('suspension', 'Suspended runs persist their handles and resume from durable state.', ['KCV-008']),
    supported('transformation-volume-reference-pack', 'The transformation fixture is available at conformance scale.', ['UAT-CV-015']),
];
const hostedSupported = [
    supported('aggregator-composio-observation', 'Composio observation sources are in first-beta scope and wait on real account evidence.', ['UAT-CV-007']),
    supported('aggregator-merge-observation', 'Merge observation sources are in first-beta scope and wait on real account evidence.', ['UAT-CV-008']),
    supported('authored-orchestration', 'The SDK can run authored research orchestration through public client APIs only.', ['XCV-017'], ['ORC-001']),
    supported('artifacts', 'Publication and environment artifacts use bounded streaming paths.', ['UAT-CV-012']),
    supported('canonical-log', 'The log remains the source for rebuild, audit and rollback checks.', ['UAT-CV-014', 'UAT-CV-019']),
    supported('environment-oci', 'The Docker/Linux container adapter is inside the UAT profile.', ['UAT-CV-011']),
    supported('environment-process', 'The process adapter is inside the UAT profile for cancellation and teardown proof.', ['UAT-CV-010']),
    supported('honest-completion', 'Result surfaces report only established evidence and explicit operational blockers.', ['UAT-CV-013']),
    supported('hosted-postgresql-service', 'The hosted cell uses PostgreSQL with tenant isolation, signer read-only access and operator drills.', ['UAT-CV-003', 'UAT-CV-004', 'UAT-CV-019']),
    supported('local-lite', 'Local Lite remains the development companion and import source, not a hosted claim.', ['UAT-CV-016']),
    supported('provider-anthropic', 'Anthropic is a first-beta model provider and waits on real account evidence.', ['UAT-CV-017']),
    supported('provider-fireworks', 'Fireworks is a first-beta model provider and waits on real account evidence.', ['UAT-CV-017']),
    supported('provider-openai', 'OpenAI is a first-beta model provider and waits on real account evidence.', ['UAT-CV-017']),
    supported('provider-openrouter', 'OpenRouter is a first-beta model provider and waits on real account evidence.', ['UAT-CV-017']),
    supported('provider-together', 'Together AI is a first-beta model provider and waits on real account evidence.', ['UAT-CV-017']),
    supported('quality-plane', 'The hosted run path validates contracts and keeps unverified outcomes explicit.', ['UAT-CV-013', 'UAT-CV-015']),
    supported('restricted-effect-plane-attachment', 'Consequential aggregator work can stage proposals but cannot dispatch mutation effects.', ['UAT-CV-009']),
    supported('suspension', 'Long suspensions resume with budget, position and credential epochs rechecked.', ['UAT-CV-018']),
    supported('transformation-volume-reference-pack', 'The volume pack is the UAT domain reference.', ['UAT-CV-015']),
];
const hostedMcpCapability = {
    capability: 'mcp-work-entrypoints',
    state: 'conditional',
    summary: 'MCP work entrypoints require an authenticated listener and exact tenant-published entrypoints enabled by deployment configuration.',
    refusal_point: 'profile-compilation',
    diagnostic_code: 'protocol.capability.unavailable',
    requirements: ['IOP-039', 'IOP-114'],
    vectors: ['IOP-CV-001', 'IOP-CV-003'],
};
const hostedMcpClientCapability = {
    capability: 'mcp-imported-tools',
    state: 'conditional',
    summary: 'Imported MCP tools require an admitted client binding, immutable discovery snapshot, reviewed execution plan, deployment egress and a resolvable credential binding.',
    refusal_point: 'profile-compilation',
    diagnostic_code: 'protocol.capability.unavailable',
    requirements: ['IOP-031', 'IOP-032', 'IOP-033', 'IOP-034', 'IOP-035', 'IOP-036', 'IOP-037', 'IOP-038'],
    vectors: ['IOP-CV-028', 'IOP-CV-029', 'IOP-CV-030', 'IOP-CV-031'],
};
const conditionalHostedEnvironments = [
    conditional('environment-ssh', 'SSH is available only after its separate package, pinned host checks, explicit admission and current ENV-CV-020 report all pass.', ['ENV-CV-006', 'ENV-CV-007', 'ENV-CV-020']),
    conditional('environment-firecracker', 'Firecracker is available only on an admitted Linux KVM host with pinned boot artifacts and a current ENV-CV-008 report.', ['ENV-CV-008']),
    conditional('environment-apptainer', 'Apptainer is available only on an admitted Linux host or cluster with a pinned SIF and a current ENV-CV-019 report.', ['ENV-CV-016', 'ENV-CV-019']),
];
const futureEnvironmentExclusions = [
    excluded('environment-cloudflare-sandbox', 'profile-compilation', 'profile.capability.excluded', 'Cloudflare Sandbox execution waits for a real account campaign.', ['ENV-CV-009']),
    excluded('environment-modal', 'profile-compilation', 'profile.capability.excluded', 'Modal execution is a later optional environment.', ['ENV-CV-016']),
    excluded('environment-daytona', 'profile-compilation', 'profile.capability.excluded', 'Daytona execution is a later optional environment.', ['ENV-CV-016']),
    excluded('environment-vercel-sandbox', 'profile-compilation', 'profile.capability.excluded', 'Vercel Sandbox execution is a later optional environment.', ['ENV-CV-016']),
];
const allNonDefaultEnvironmentExclusions = [
    excluded('environment-ssh', 'profile-compilation', 'profile.capability.excluded', 'SSH execution is not admitted by this profile.', ['ENV-CV-006']),
    excluded('environment-firecracker', 'profile-compilation', 'profile.capability.excluded', 'Firecracker execution is not admitted by this profile.', ['ENV-CV-008']),
    excluded('environment-apptainer', 'profile-compilation', 'profile.capability.excluded', 'Apptainer execution is not admitted by this profile.', ['ENV-CV-016']),
    ...futureEnvironmentExclusions,
];
const firstBetaExclusions = [
    ...futureEnvironmentExclusions,
    excluded('classification-airlocks', 'publication', 'profile.capability.excluded', 'Classification airlocks are outside first-beta UAT.', ['UAT-CV-001']),
    excluded('cross-run-memory', 'registration', 'profile.capability.excluded', 'Cross-run memory remains a later service for first-beta UAT.', ['UAT-CV-001']),
    excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Dynamic authority is not part of the first-beta UAT profile.', ['UAT-CV-001']),
    excluded('native-packaged-self-hosting', 'profile-compilation', 'profile.capability.excluded', 'Native packaged self-hosting is outside the Docker/Linux UAT cell.', ['UAT-CV-001']),
    excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Production effect dispatch waits for the completed Effect Plane.', ['UAT-CV-009']),
    excluded('regulated-workloads', 'intake', 'profile.capability.excluded', 'Regulated workloads stay out of the first-beta UAT profile.', ['UAT-CV-001']),
    excluded('research-reference-pack', 'publication', 'profile.capability.excluded', 'The research reference pack is deferred from first-beta UAT.', ['UAT-CV-001']),
    excluded('unattended-aggregator-mutations', 'publication', 'profile.capability.excluded', 'Unattended aggregator mutations compile only to staged proposals.', ['UAT-CV-009']),
    excluded('video-reference-pack', 'publication', 'profile.capability.excluded', 'The video reference pack is deferred from first-beta UAT.', ['UAT-CV-001']),
];
const localLiteExclusions = [
    excluded('aggregator-composio-observation', 'profile-compilation', 'profile.capability.excluded', 'Hosted aggregator accounts are not part of Local Lite.', ['UAT-CV-007']),
    excluded('aggregator-merge-observation', 'profile-compilation', 'profile.capability.excluded', 'Hosted aggregator accounts are not part of Local Lite.', ['UAT-CV-008']),
    excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Dynamic authority is not part of Local Lite.', ['XCV-002']),
    excluded('environment-apptainer', 'profile-compilation', 'profile.capability.excluded', 'Apptainer execution is not part of Local Lite.', ['ENV-CV-016']),
    excluded('environment-cloudflare-sandbox', 'profile-compilation', 'profile.capability.excluded', 'Cloudflare Sandbox execution is not part of Local Lite.', ['ENV-CV-009']),
    excluded('environment-daytona', 'profile-compilation', 'profile.capability.excluded', 'Daytona execution is not part of Local Lite.', ['ENV-CV-016']),
    excluded('environment-firecracker', 'profile-compilation', 'profile.capability.excluded', 'Firecracker execution is not part of Local Lite.', ['ENV-CV-008']),
    excluded('environment-modal', 'profile-compilation', 'profile.capability.excluded', 'Modal execution is not part of Local Lite.', ['ENV-CV-016']),
    excluded('environment-oci', 'profile-compilation', 'profile.capability.excluded', 'OCI execution is not part of Local Lite.', ['ENV-CV-004']),
    excluded('environment-ssh', 'profile-compilation', 'profile.capability.excluded', 'SSH execution is not part of Local Lite.', ['ENV-CV-006']),
    excluded('environment-vercel-sandbox', 'profile-compilation', 'profile.capability.excluded', 'Vercel Sandbox execution is not part of Local Lite.', ['ENV-CV-016']),
    excluded('full-cell-docker-linux', 'profile-compilation', 'profile.capability.excluded', 'The Docker/Linux Full Cell is not part of Local Lite.', ['XCV-007']),
    excluded('hosted-postgresql-service', 'profile-compilation', 'profile.capability.excluded', 'Hosted PostgreSQL tenancy is not part of Local Lite.', ['XCV-002']),
    excluded('mcp-work-entrypoints', 'profile-compilation', 'profile.capability.excluded', 'MCP work entrypoints are not part of Local Lite.', ['IOP-CV-001'], ['IOP-114']),
    excluded('mcp-imported-tools', 'profile-compilation', 'profile.capability.excluded', 'Imported MCP tools are not part of Local Lite.', ['IOP-CV-028'], ['IOP-031']),
    excluded('provider-anthropic', 'profile-compilation', 'profile.capability.excluded', 'Real provider accounts are not part of Local Lite.', ['UAT-CV-017']),
    excluded('provider-fireworks', 'profile-compilation', 'profile.capability.excluded', 'Real provider accounts are not part of Local Lite.', ['UAT-CV-017']),
    excluded('provider-openai', 'profile-compilation', 'profile.capability.excluded', 'Real provider accounts are not part of Local Lite.', ['UAT-CV-017']),
    excluded('provider-openrouter', 'profile-compilation', 'profile.capability.excluded', 'Real provider accounts are not part of Local Lite.', ['UAT-CV-017']),
    excluded('provider-together', 'profile-compilation', 'profile.capability.excluded', 'Real provider accounts are not part of Local Lite.', ['UAT-CV-017']),
    excluded('regulated-workloads', 'intake', 'profile.capability.excluded', 'Regulated workloads are not part of Local Lite.', ['UAT-CV-001']),
    excluded('restricted-effect-plane-attachment', 'profile-compilation', 'profile.capability.excluded', 'Effect Plane attachment is not part of Local Lite.', ['UAT-CV-009']),
    excluded('unattended-aggregator-mutations', 'publication', 'profile.capability.excluded', 'Local Lite does not dispatch unattended aggregator mutations.', ['UAT-CV-009']),
    excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Production effect dispatch is not part of Local Lite.', ['UAT-CV-009']),
    excluded('research-reference-pack', 'publication', 'profile.capability.excluded', 'The research reference pack is not part of Local Lite.', ['UAT-CV-001']),
    excluded('video-reference-pack', 'publication', 'profile.capability.excluded', 'The video reference pack is not part of Local Lite.', ['UAT-CV-001']),
    excluded('native-packaged-self-hosting', 'profile-compilation', 'profile.capability.excluded', 'Native packaged self-hosting is not part of Local Lite.', ['UAT-CV-001']),
    excluded('classification-airlocks', 'publication', 'profile.capability.excluded', 'Classification airlocks are not part of Local Lite.', ['UAT-CV-001']),
    excluded('cross-run-memory', 'registration', 'profile.capability.excluded', 'Cross-run memory is not part of Local Lite.', ['UAT-CV-001']),
    excluded('authored-orchestration', 'publication', 'profile.capability.excluded', 'Authored orchestration is not part of Local Lite.', ['UAT-CV-001']),
];
const firstBetaArtifactPolicy = {
    tool_result_inline_threshold_bytes: 4_096,
    tool_result_max_artifact_bytes: oneMiB,
    tool_result_range_read_max_bytes: sixtyFourKiB,
};
export const PROFILE_CAPABILITY_MANIFESTS = {
    'local-lite': seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'local-lite',
        profile: 'local-lite',
        version: '1.0.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['scripted'],
        aggregator_providers: [],
        environment_backends: ['process'],
        artifact_backends: ['filesystem'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'absent',
        components: { required: ['store'], health_probes: ['store', 'tool_host', 'secret_store'] },
        capabilities: [...localLiteSupported, ...localLiteExclusions],
    }),
    'small-production': seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'first-beta-uat',
        profile: 'small-production',
        version: '1.0.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic', 'openrouter', 'together', 'fireworks'],
        aggregator_providers: ['composio', 'merge-agent-handler', 'merge-unified'],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'restricted-attachment',
        components: { required: ['artifact', 'migration', 'queue', 'store'], health_probes: ['artifact', 'migration', 'queue', 'secret_store', 'store', 'tool_host'] },
        capabilities: [...hostedSupported, hostedMcpCapability, hostedMcpClientCapability, ...conditionalHostedEnvironments, excluded('full-cell-docker-linux', 'profile-compilation', 'profile.capability.excluded', 'The self-contained Docker/Linux Full Cell uses the full-cell manifest.', ['XCV-007']), ...firstBetaExclusions],
    }),
    'full-cell': seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'first-beta-full-cell',
        profile: 'full-cell',
        version: '1.0.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic', 'openrouter', 'together', 'fireworks'],
        aggregator_providers: ['composio', 'merge-agent-handler', 'merge-unified'],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'restricted-attachment',
        components: { required: ['artifact', 'migration', 'queue', 'store', 'tool_host', 'validator_host'], health_probes: ['artifact', 'authority', 'migration', 'queue', 'secret_store', 'store', 'tool_host', 'validator_host'] },
        capabilities: [...hostedSupported, hostedMcpCapability, hostedMcpClientCapability, ...conditionalHostedEnvironments, supported('full-cell-docker-linux', 'The Docker/Linux Full Cell packages the hosted runtime and child hosts together.', ['XCV-007']), ...firstBetaExclusions],
    }),
    regulated: seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'regulated-future',
        profile: 'regulated',
        version: '1.0.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic', 'openrouter', 'together', 'fireworks'],
        aggregator_providers: ['composio', 'merge-agent-handler', 'merge-unified'],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'dynamic-authority',
        components: { required: ['artifact', 'authority', 'migration', 'queue', 'store', 'tool_host', 'validator_host'], health_probes: ['artifact', 'authority', 'migration', 'queue', 'secret_store', 'store', 'tool_host', 'validator_host'] },
        capabilities: [
            ...hostedSupported.filter((entry) => !['authored-orchestration', 'restricted-effect-plane-attachment'].includes(entry.capability)),
            excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Regulated dynamic authority is future wiring; this build refuses regulated profile construction until the service and target dispatch are wired.', ['UAT-CV-001']),
            excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Regulated production effect dispatch is future wiring; this build records staged proposals only outside the regulated profile.', ['UAT-CV-001']),
            excluded('regulated-workloads', 'intake', 'profile.capability.excluded', 'Regulated workloads remain outside UAT until the regulated profile has complete authority and effect-target wiring.', ['UAT-CV-001']),
            excluded('restricted-effect-plane-attachment', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile uses dynamic authority instead of the restricted attachment.', ['UAT-CV-001']),
            excluded('full-cell-docker-linux', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile waits for its own packaged cell profile.', ['UAT-CV-001']),
            excluded('mcp-work-entrypoints', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile waits for a separately admitted interoperability listener.', ['IOP-CV-001'], ['IOP-114']),
            excluded('mcp-imported-tools', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile waits for separately admitted imported-tool egress.', ['IOP-CV-028'], ['IOP-031']),
            ...allNonDefaultEnvironmentExclusions,
            excluded('authored-orchestration', 'publication', 'profile.capability.excluded', 'Authored orchestration remains later work for regulated deployments.', ['UAT-CV-001']),
            excluded('classification-airlocks', 'publication', 'profile.capability.excluded', 'Classification airlocks remain later work for regulated deployments.', ['UAT-CV-001']),
            excluded('cross-run-memory', 'registration', 'profile.capability.excluded', 'Cross-run memory remains later work for regulated deployments.', ['UAT-CV-001']),
            excluded('native-packaged-self-hosting', 'profile-compilation', 'profile.capability.excluded', 'Native packaged self-hosting remains later work for regulated deployments.', ['UAT-CV-001']),
            excluded('research-reference-pack', 'publication', 'profile.capability.excluded', 'The research reference pack remains later work for regulated deployments.', ['UAT-CV-001']),
            excluded('unattended-aggregator-mutations', 'publication', 'profile.capability.excluded', 'Unattended aggregator mutations remain later work for regulated deployments.', ['UAT-CV-001']),
            excluded('video-reference-pack', 'publication', 'profile.capability.excluded', 'The video reference pack remains later work for regulated deployments.', ['UAT-CV-001']),
        ],
    }),
};
