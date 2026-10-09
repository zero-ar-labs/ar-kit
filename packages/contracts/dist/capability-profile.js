/**
 * Capability profile manifests.
 *
 * What this is: the contracts-owned description of what a named profile
 * claims, what it excludes, which components it probes, and which evidence
 * names support those claims.
 *
 * How it fits: composition roots consume this instead of maintaining private
 * health or release capability maps. The manifest ref is pinned into new runs,
 * so a profile change is visible in durable history. Before changing a
 * manifest, capture it with scripts/capture-profile-manifest-history.ts so
 * runs pinned to it stay continuable (profile-compatibility.ts).
 */
import { z } from 'zod';
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { AGGREGATOR_PROVIDERS, ARTIFACT_BACKENDS, CELL_GUARANTEE_EXCLUSIONS, EFFECT_PLANE_MODES, ENVIRONMENT_BACKENDS, MODEL_PROVIDERS, OPERATION_CLASSES, PROFILE_CAPABILITIES, PROFILE_CAPABILITY_REFUSAL_POINTS, PROFILE_CAPABILITY_STATES, PROFILE_COMPONENTS, PROFILES, } from "./vocab.js";
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
/** What each deployment-observed exclusion leaves open, in the health line format `name: summary`. */
const CELL_GUARANTEE_EXCLUSION_SUMMARIES = {
    'child-code-isolation': 'Tool, aggregator, authority and validator hosts run without Landlock confinement, so a child host can read files, shared memory and the memory of dumpable processes of the cell user outside its tenant.',
    'runtime-anchor-store-custody': 'The runtime is not confined away from the custody paths this cell has: the checkpoint store, the broker metadata and the co-located PostgreSQL data. It can alter anchor files; signatures expose an altered anchor, and truncation or rollback shows only against a latest anchor ref recorded outside the cell.',
    'child-network-scoping': 'The kernel offers Landlock below ABI 4, so child hosts may open any TCP connection the cell network allows.',
    'child-signal-scoping': 'The kernel offers Landlock below ABI 6, so child hosts may signal processes of the cell user outside their domain, such as the secret broker.',
    'external-secret-store-tenant-binding': 'Credentials come from an external secret store, and the cell cannot observe whether that store binds each bearer to one tenant.',
    'signer-key-custody': 'The runtime holds the integrity signer key in its own environment, because this entrypoint has no supervisor to keep it.',
};
/** Health lines for the guarantees this deployment observed it cannot hold, in vocabulary order. */
export function cellGuaranteeExclusionLines(exclusions) {
    const named = new Set(exclusions);
    return CELL_GUARANTEE_EXCLUSIONS.filter((exclusion) => named.has(exclusion)).map((exclusion) => `${exclusion}: ${CELL_GUARANTEE_EXCLUSION_SUMMARIES[exclusion]}`);
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
    const deferredEvidence = new Set(options.deferred_evidence_vectors ?? []);
    const supportedOnlyByDeferredEvidence = manifest.capabilities
        .filter((entry) => entry.state === 'supported' &&
        entry.vectors.length > 0 &&
        entry.vectors.every((vector) => deferredEvidence.has(vector)))
        .map((entry) => entry.capability)
        .sort();
    if (supportedOnlyByDeferredEvidence.length > 0) {
        refuse({
            code: 'capability-profile.deferred-evidence',
            message: `the profile supports ${supportedOnlyByDeferredEvidence.join(', ')}, but every cited vector is deferred from this release. Make the capability conditional or excluded, or restore required passing evidence.`,
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
/** A capability available only under a named condition, refused at its own boundary with its own diagnostic. */
function conditionalAt(capability, refusal_point, diagnostic_code, summary, vectors, requirements) {
    return { capability, state: 'conditional', summary, refusal_point, diagnostic_code, requirements, vectors };
}
const localLiteSupported = [
    supported('automatic-run-recovery', 'Local Lite rebuilds accepted work from the canonical log and delivers durable retry wakes without an operator resume command.', ['KCV-008', 'UAT-CV-018']),
    supported('artifacts', 'Local artifact storage serves run artifacts and streamed publication blobs. Cited ranges are read back behind the run fence; a run export carries the committed artifacts its log cites and names any it cannot carry; an import restores them before the records and names what it did not transfer; uncommitted uploads are swept after the retention floor at start and through the operator route.', ['XCV-002', 'UAT-CV-012', 'UAT-CV-013', 'UAT-CV-016', 'PUB-CV-014', 'PUB-CV-016']),
    supported('canonical-log', 'Runs append to the canonical log and rebuild projections from it.', ['KCV-001']),
    supported('document-pdf-extraction', 'PDF text extraction uses the bounded process tool host with Poppler and Tesseract fallback.', ['SRC-CV-008'], ['SRC-011', 'SRC-012', 'SRC-013', 'SRC-017', 'SRC-029', 'SRC-030']),
    supported('environment-process', 'Local process execution is available under the development profile.', ['ENV-CV-003']),
    supported('honest-completion', 'Completion stays tied to validator verdicts and explicit unverified outcomes. A cited artifact range, required input artifact or required source binding that is changed, absent or unreadable ends the run indeterminate with the blocker named, never verified.', ['QCV-003', 'UAT-CV-013']),
    supported('local-lite', 'The local development profile runs with SQLite and deterministic providers.', ['XCV-002']),
    supported('model-image-input', 'An admitted image reaches a model adapter that declares image input support; another adapter receives a bounded text note instead.', ['WBR-CV-003']),
    supported('open-goal-execution', 'An open goal can plan, name checks, repair failed work and propose completion without an owner-authored task contract.', ['QCV-003', 'KCV-009', 'XCV-014']),
    supported('operator-pause-and-budget', 'The public control path pauses at a turn boundary, and a non-agent principal can add admitted budget before resume.', ['LIF-CV-012', 'KCV-008']),
    supported('quality-plane', 'The validator seam and quality ledger run in the local composition.', ['QCV-004']),
    supported('published-skills', 'Standard Agent Skills compile into immutable procedures. Local Lite exposes bounded descriptors and admits skill.search, skill.open and skill.read only for the run-pinned closure.', ['DXI-CV-001', 'ADX-CV-002']),
    supported('runtime-local-tools', 'Artifact, source, document, skill and tool-catalogue operations appear only when their publication and deployment bindings are present.', ['DXI-CV-001', 'SRC-CV-008']),
    supported('author-defined-tools', 'The SDK bundles a typed Tool Kit handler at authoring time, and Local Lite executes its exact published binding in a bounded child host without the author source tree.', ['ADX-CV-003']),
    supported('progressive-tool-disclosure', 'Tool descriptors are bounded, and exact tool.activate changes only the next model-call view while ordinary lease, binding and operation-class checks remain in force.', ['DXI-CV-041', 'DXI-CV-042', 'DXI-CV-043']),
    supported('research-reference-pack', 'The research pack\'s claim-set contract and citation validators run in Local Lite: claims cite artifact ranges whose citations come back from artifact.read, an unresolved citation is never admitted as support, and identical spans count once.', ['QCV-006', 'QCV-008'], ['CLM-001', 'CLM-002']),
    supported('run-fork', 'The public API forks from a named frontier into a new run, carries the plan with items restarted and inherits no active grant, lease, credential or completion state.', ['KCV-002']),
    supported('suspension', 'Suspended runs persist their handles and resume from durable state.', ['KCV-008']),
    supported('source-local-read-only', 'Local directories register as read-only source instances and commit immutable artifact-backed snapshots.', ['SRC-CV-001', 'SRC-CV-002', 'SRC-CV-003', 'SRC-CV-005', 'SRC-CV-014'], ['SRC-001', 'SRC-002', 'SRC-003', 'SRC-004', 'SRC-005', 'SRC-006', 'SRC-007', 'SRC-009', 'SRC-021', 'SRC-022', 'SRC-023']),
    supported('transformation-volume-reference-pack', 'The transformation fixture is available at conformance scale.', ['UAT-CV-015']),
];
const hostedSupported = [
    supported('authored-orchestration', 'The SDK can run authored research orchestration through public client APIs only.', ['XCV-017'], ['ORC-001']),
    supported('artifacts', 'Publication and environment artifacts use bounded streaming paths, and run export and import carry the committed artifacts a run cites. The publication transfer, registry rebuild and artifact sweep routes refuse until the hosted cell attaches their ports.', ['UAT-CV-012']),
    supported('canonical-log', 'The log remains the source for rebuild, audit and rollback checks.', ['UAT-CV-014', 'UAT-CV-019']),
    supported('document-pdf-extraction', 'PDF extraction runs in the pinned process tool host with retained originals and derived artifacts.', ['SRC-CV-008'], ['SRC-011', 'SRC-012', 'SRC-013', 'SRC-017', 'SRC-029', 'SRC-030']),
    supported('environment-process', 'The process adapter is inside the UAT profile for cancellation and teardown proof.', ['UAT-CV-010']),
    supported('honest-completion', 'Result surfaces report only validator-established completion and explicit operational blockers. Artifact-bound hosted context reconstruction remains a separate UAT-CV-013 release gate.', ['QCV-003']),
    supported('hosted-postgresql-service', 'The hosted cell uses PostgreSQL with tenant isolation, signer read-only access and operator drills.', ['UAT-CV-003', 'UAT-CV-004', 'UAT-CV-019']),
    supported('local-lite', 'Local Lite remains the verified development companion. Cross-profile import parity remains a separate UAT-CV-016 release gate.', ['XCV-002']),
    supported('quality-plane', 'The hosted run path validates the volume contract and keeps unverified outcomes explicit.', ['UAT-CV-015']),
    supported('published-skills', 'Published standard Agent Skills remain immutable and load progressively through the hosted run path and source-free Full Cell.', ['DXI-CV-001', 'XCV-007']),
    supported('runtime-local-tools', 'Hosted runtime-local artifact, source, document, skill and tool-catalogue operations appear only when their backing ports and run closure are present.', ['SRC-CV-008', 'XCV-007']),
    supported('author-defined-tools', 'The Full Cell executes an author-time bundled Tool Kit handler from the exact published binding in a bounded, confined child host; no compiler or source checkout enters the image.', ['ADX-CV-003', 'XCV-007']),
    supported('progressive-tool-disclosure', 'The hosted model view carries bounded descriptors, exact activation and the ordinary lease, binding, operation-class and authority checks.', ['DXI-CV-041', 'DXI-CV-042', 'DXI-CV-043', 'XCV-007']),
    supported('effect-proposal-tools', 'Consequential tool calls can create durable proposals through the restricted effect attachment, but the release profile excludes production dispatch.', ['UAT-CV-009']),
    supported('restricted-effect-plane-attachment', 'Consequential aggregator work can stage proposals but cannot dispatch mutation effects.', ['UAT-CV-009']),
    supported('suspension', 'A named-human suspension releases hot state and resumes through the public client on a fresh process. The seven-day shipped-runtime wake proof remains a separate UAT-CV-018 release gate.', ['LIF-CV-014']),
    supported('source-local-read-only', 'Admitted read-only directories resolve into immutable artifact-backed source bindings.', ['SRC-CV-001', 'SRC-CV-002', 'SRC-CV-003', 'SRC-CV-005', 'SRC-CV-014'], ['SRC-001', 'SRC-002', 'SRC-003', 'SRC-004', 'SRC-005', 'SRC-006', 'SRC-007', 'SRC-009', 'SRC-021', 'SRC-022', 'SRC-023']),
    supported('transformation-volume-reference-pack', 'The volume pack is the UAT domain reference.', ['UAT-CV-015']),
];
/** Version 0.3 mechanisms that Local Lite offers only with named deployment inputs. */
const localVersionThreeConditions = [
    conditionalAt('browser-workspace', 'profile-compilation', 'environment.capability.unavailable', 'The browser recipe is available when the operator builds and pins its image, selects the browser preset and supplies the reviewed seccomp profile. Without those inputs, Local Lite offers no browser workspace.', ['WBR-CV-002', 'WBR-CV-005'], ['UAT-PRO-001']),
    conditionalAt('hierarchical-context', 'publication', 'context.hierarchy.artifacts-unavailable', 'A publication can select hierarchical context when immutable artifact write, verify and bounded read support are attached. The source-bound evaluation is not a Full Cell release claim.', ['PUB-CV-005'], ['UAT-PRO-001']),
    conditionalAt('workspace-exec', 'profile-compilation', 'environment.capability.unavailable', 'Local Lite offers workspace.exec only when Docker answers and ZERO_AR_WORKSPACE_IMAGE pins an immutable image. Otherwise the tool is absent.', ['KCV-009', 'WBR-CV-001', 'WBR-CV-007', 'WBR-CV-008'], ['UAT-PRO-001']),
];
/** Version 0.3 mechanisms present in hosted bytes but still conditional on deployment or source-bound proof. */
const hostedVersionThreeConditions = [
    conditionalAt('automatic-run-recovery', 'profile-compilation', 'profile.capability.excluded', 'The kernel and durable wake path recover work without an operator command. A Full Cell release claim remains conditional until the exact candidate proves the journey after a process restart.', ['KCV-008', 'UAT-CV-018'], ['UAT-PRO-001']),
    conditionalAt('browser-workspace', 'profile-compilation', 'environment.capability.unavailable', 'The browser workspace requires a separately built digest-pinned image, the browser preset, reviewed seccomp and available OCI capacity.', ['WBR-CV-002', 'WBR-CV-005'], ['UAT-PRO-001']),
    conditionalAt('hierarchical-context', 'publication', 'context.hierarchy.artifacts-unavailable', 'The hierarchical selector is present, but its source-bound evaluation creates no Full Cell release claim until the candidate proves artifact-backed assembly and expansion.', ['PUB-CV-005'], ['UAT-PRO-001']),
    conditionalAt('model-image-input', 'profile-compilation', 'profile.capability.excluded', 'The image path is present, but a Full Cell release claim requires a candidate adapter that declares image input and a source-bound image journey.', ['WBR-CV-003'], ['UAT-PRO-001']),
    conditionalAt('open-goal-execution', 'profile-compilation', 'profile.capability.excluded', 'The kernel can execute open goals, but the Full Cell claim remains conditional until the candidate runs an open goal through the hosted topology.', ['QCV-003', 'XCV-014'], ['UAT-PRO-001']),
    conditionalAt('operator-pause-and-budget', 'profile-compilation', 'profile.capability.excluded', 'Pause and budget-amendment routes are present, but the Full Cell claim remains conditional until the candidate proves both controls through authenticated hosted APIs.', ['LIF-CV-012', 'KCV-008'], ['UAT-PRO-001']),
    conditionalAt('reversible-http-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'A hosted deployment can attach one reviewed HTTP target and dispatch a reversible operation only when the operation, reversal and active grants match. General production effect dispatch remains excluded.', [], ['UAT-PRO-001']),
    conditionalAt('run-fork', 'profile-compilation', 'profile.capability.excluded', 'The public fork contract is present, but the Full Cell claim remains conditional until the candidate proves plan and sealed-workspace inheritance through the hosted topology.', ['KCV-002'], ['UAT-PRO-001']),
    conditionalAt('workspace-exec', 'profile-compilation', 'environment.capability.unavailable', 'The hosted cell offers workspace.exec only for a tenant configuration that pins an immutable workspace image and has available OCI capacity.', ['KCV-009', 'WBR-CV-001', 'WBR-CV-007', 'WBR-CV-008'], ['UAT-PRO-001']),
];
/** Version 0.3 mechanisms excluded from the unfinished regulated profile. */
const regulatedVersionThreeExclusions = [
    excluded('automatic-run-recovery', 'profile-compilation', 'profile.capability.excluded', 'Regulated automatic recovery waits for a completed regulated composition.', ['KCV-008']),
    excluded('browser-workspace', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit the browser workspace.', ['WBR-CV-002']),
    excluded('hierarchical-context', 'publication', 'profile.capability.excluded', 'The regulated profile does not admit hierarchical context.', ['PUB-CV-005']),
    excluded('model-image-input', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit model image input.', ['WBR-CV-003']),
    excluded('open-goal-execution', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit open-goal execution.', ['QCV-003']),
    excluded('operator-pause-and-budget', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit public pause or budget amendment.', ['LIF-CV-012', 'KCV-008']),
    excluded('reversible-http-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile has no admitted HTTP effect target.', ['UAT-CV-001']),
    excluded('run-fork', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit public run forks.', ['KCV-002']),
    excluded('workspace-exec', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit workspace.exec.', ['KCV-009']),
];
/** Web search and fetch (web search appendix). Local Lite offers them under named configuration. */
const localLiteWebSearch = conditionalAt('web-search', 'profile-compilation', 'web.provider.unknown', 'Local Lite offers web.search and web.fetch only when ZERO_AR_WEB_SEARCH_PROVIDER names an admitted provider and its key is supplied. Otherwise the tools are absent and the ready line says why.', ['WEB-CV-002', 'WEB-CV-005', 'WEB-CV-006', 'WEB-CV-007'], ['WEB-002', 'WEB-003', 'WEB-008']);
/** The hosted cell offers the web tools per tenant, from its web_search block. */
const hostedWebSearch = conditionalAt('web-search', 'profile-compilation', 'web.provider.unknown', 'The hosted cell offers web.search and web.fetch only to a tenant whose web_search block names a shipped provider and an active web-search key binding, with a filesystem or S3-compatible artifact store. Otherwise the tenant has neither tool.', ['WEB-CV-009'], ['WEB-002', 'WEB-008', 'WEB-010']);
const regulatedWebSearch = excluded('web-search', 'profile-compilation', 'profile.capability.excluded', 'The regulated profile does not admit web.search or web.fetch.', ['WEB-CV-005']);
/** Required release capabilities that stay conditional until their named candidate proof passes. */
const hostedReleaseConditions = [
    conditionalAt('cross-run-memory', 'registration', 'memory.unwired', 'Cross-run memory attaches only for a tenant whose hosted configuration names an active memory-wrapping-key binding and whose PostgreSQL log, wrapped-key tables and artifact backend all pass their separate health probes. Without that exact configuration, memory routes refuse and runs keep session memory only.', ['MSH-CV-002', 'MSH-CV-003', 'MSH-CV-004', 'MSH-CV-006', 'MSH-CV-007', 'XCV-016'], ['MSH-001', 'MSH-002', 'MSH-003', 'MSH-004', 'MSH-005', 'MSH-006', 'MSH-007', 'MSH-008', 'MSH-009', 'MSH-010', 'MSH-011', 'MSH-012', 'MSH-013', 'MSH-014', 'MSH-015', 'MSH-016', 'MSH-017', 'MSH-018']),
    conditionalAt('environment-oci', 'profile-compilation', 'environment.capability.unavailable', 'The OCI adapter ships in the Full Cell bytes, but release admission remains conditional until UAT-CV-011 completes observation, bounded transfer, cancellation, reconciliation and confirmed teardown through the hosted composition.', ['UAT-CV-011'], ['UAT-PRO-001']),
    conditionalAt('provider-anthropic', 'profile-compilation', 'model.adapter.credential-missing', 'Anthropic is declared for the stabilized release campaign. It becomes a supported Full Cell claim only after source-bound UAT-CV-017 evidence passes on the candidate commit.', ['UAT-CV-017'], ['UAT-PRO-001']),
    conditionalAt('provider-openai', 'profile-compilation', 'model.adapter.credential-missing', 'OpenAI is declared for the stabilized release campaign. It becomes a supported Full Cell claim only after source-bound UAT-CV-017 evidence passes on the candidate commit.', ['UAT-CV-017'], ['UAT-PRO-001']),
];
/** Account-backed capabilities deliberately left outside this release candidate. */
const hostedDeferredReleaseCapabilities = [
    excluded('aggregator-composio-observation', 'profile-compilation', 'profile.capability.excluded', 'Composio observation remains implemented behind the aggregator boundary but is deferred from this release until a tenant-owned account campaign passes UAT-CV-007 and the release profile is revised.', ['UAT-CV-007']),
    excluded('aggregator-merge-observation', 'profile-compilation', 'profile.capability.excluded', 'Merge observation remains implemented behind the aggregator boundary but is deferred from this release until a tenant-owned account campaign passes UAT-CV-008 and the release profile is revised.', ['UAT-CV-008']),
    excluded('provider-fireworks', 'profile-compilation', 'profile.capability.excluded', 'The Fireworks adapter remains in the repository, but Full Cell excludes it until the five-provider expansion campaign passes PUB-CV-023 and the release profile is revised.', ['PUB-CV-023']),
    excluded('provider-openrouter', 'profile-compilation', 'profile.capability.excluded', 'The OpenRouter adapter remains in the repository, but Full Cell excludes it until the five-provider expansion campaign passes PUB-CV-023 and the release profile is revised.', ['PUB-CV-023']),
    excluded('provider-together', 'profile-compilation', 'profile.capability.excluded', 'The Together AI adapter remains in the repository, but Full Cell excludes it until the five-provider expansion campaign passes PUB-CV-023 and the release profile is revised.', ['PUB-CV-023']),
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
    conditional('environment-openai-agents', 'OpenAI Agents API execution is available only after the optional package, operation-scoped secret and egress ports, explicit admission and current DXI-CV-040 real-account report all pass.', ['DXI-CV-033', 'DXI-CV-040'], ['DXI-050', 'DXI-063']),
];
const allNonDefaultEnvironmentExclusions = [
    excluded('environment-ssh', 'profile-compilation', 'profile.capability.excluded', 'SSH execution is not admitted by this profile.', ['ENV-CV-006']),
    excluded('environment-firecracker', 'profile-compilation', 'profile.capability.excluded', 'Firecracker execution is not admitted by this profile.', ['ENV-CV-008']),
    excluded('environment-apptainer', 'profile-compilation', 'profile.capability.excluded', 'Apptainer execution is not admitted by this profile.', ['ENV-CV-016']),
    excluded('environment-openai-agents', 'profile-compilation', 'profile.capability.excluded', 'OpenAI Agents API execution is not admitted by this profile.', ['DXI-CV-033'], ['DXI-050', 'DXI-063']),
];
const firstBetaExclusions = [
    excluded('classification-airlocks', 'publication', 'profile.capability.excluded', 'Classification airlocks are outside first-beta UAT.', ['UAT-CV-001']),
    excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Dynamic authority is not part of the first-beta UAT profile.', ['UAT-CV-001']),
    excluded('native-packaged-self-hosting', 'profile-compilation', 'profile.capability.excluded', 'Native packaged self-hosting is outside the Docker/Linux UAT cell.', ['UAT-CV-001']),
    excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Production effect dispatch waits for the completed Effect Plane.', ['UAT-CV-009']),
    excluded('regulated-workloads', 'intake', 'profile.capability.excluded', 'Regulated workloads stay out of the first-beta UAT profile.', ['UAT-CV-001']),
    conditionalAt('research-reference-pack', 'intake', 'contract.unknown', 'Hosted tenants register the research pack\'s contract and citation validators only when the cell configures an artifact store; without one, a run that binds the research contract refuses at intake. No hosted vector covers the pack yet.', ['QCV-006', 'QCV-008'], ['CLM-001', 'CLM-002']),
    excluded('unattended-aggregator-mutations', 'publication', 'profile.capability.excluded', 'Unattended aggregator mutations compile only to staged proposals.', ['UAT-CV-009']),
    excluded('video-reference-pack', 'publication', 'profile.capability.excluded', 'The video reference pack is deferred from first-beta UAT.', ['UAT-CV-001']),
];
const localLiteExclusions = [
    excluded('aggregator-composio-observation', 'profile-compilation', 'profile.capability.excluded', 'Hosted aggregator accounts are not part of Local Lite.', ['UAT-CV-007']),
    excluded('aggregator-merge-observation', 'profile-compilation', 'profile.capability.excluded', 'Hosted aggregator accounts are not part of Local Lite.', ['UAT-CV-008']),
    excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Dynamic authority is not part of Local Lite.', ['XCV-002']),
    excluded('environment-apptainer', 'profile-compilation', 'profile.capability.excluded', 'Apptainer execution is not part of Local Lite.', ['ENV-CV-016']),
    excluded('environment-firecracker', 'profile-compilation', 'profile.capability.excluded', 'Firecracker execution is not part of Local Lite.', ['ENV-CV-008']),
    excluded('environment-oci', 'profile-compilation', 'profile.capability.excluded', 'OCI execution is not part of Local Lite.', ['ENV-CV-004']),
    excluded('environment-ssh', 'profile-compilation', 'profile.capability.excluded', 'SSH execution is not part of Local Lite.', ['ENV-CV-006']),
    excluded('environment-openai-agents', 'profile-compilation', 'profile.capability.excluded', 'OpenAI Agents API execution is optional and not part of account-free Local Lite.', ['DXI-CV-033'], ['DXI-050', 'DXI-062']),
    excluded('full-cell-docker-linux', 'profile-compilation', 'profile.capability.excluded', 'The Docker/Linux Full Cell is not part of Local Lite.', ['XCV-007']),
    excluded('effect-proposal-tools', 'profile-compilation', 'profile.capability.excluded', 'Local Lite has no effect plane, so an effect-proposal tool refuses instead of implying consequential dispatch.', ['UAT-CV-009']),
    excluded('hosted-postgresql-service', 'profile-compilation', 'profile.capability.excluded', 'Hosted PostgreSQL tenancy is not part of Local Lite.', ['XCV-002']),
    excluded('mcp-work-entrypoints', 'profile-compilation', 'profile.capability.excluded', 'MCP work entrypoints are not part of Local Lite.', ['IOP-CV-001'], ['IOP-114']),
    excluded('mcp-imported-tools', 'profile-compilation', 'profile.capability.excluded', 'Imported MCP tools are not part of Local Lite.', ['IOP-CV-028'], ['IOP-031']),
    excluded('regulated-workloads', 'intake', 'profile.capability.excluded', 'Regulated workloads are not part of Local Lite.', ['UAT-CV-001']),
    excluded('restricted-effect-plane-attachment', 'profile-compilation', 'profile.capability.excluded', 'Effect Plane attachment is not part of Local Lite.', ['UAT-CV-009']),
    excluded('unattended-aggregator-mutations', 'publication', 'profile.capability.excluded', 'Local Lite does not dispatch unattended aggregator mutations.', ['UAT-CV-009']),
    excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Production effect dispatch is not part of Local Lite.', ['UAT-CV-009']),
    excluded('video-reference-pack', 'publication', 'profile.capability.excluded', 'The video reference pack is not part of Local Lite.', ['UAT-CV-001']),
    excluded('native-packaged-self-hosting', 'profile-compilation', 'profile.capability.excluded', 'Native packaged self-hosting is not part of Local Lite.', ['UAT-CV-001']),
    excluded('classification-airlocks', 'publication', 'profile.capability.excluded', 'Classification airlocks are not part of Local Lite.', ['UAT-CV-001']),
    excluded('authored-orchestration', 'publication', 'profile.capability.excluded', 'Authored orchestration is not part of Local Lite.', ['UAT-CV-001']),
    excluded('reversible-http-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Local Lite has no HTTP effect target or authority service.', ['UAT-CV-009']),
];
/** A provider profile Local Lite builds through ZERO_AR_ADAPTER (decision J-3). */
function localLiteProvider(capability, label, profile, keyVariable, vectors) {
    return conditionalAt(capability, 'profile-compilation', 'model.adapter.credential-missing', `Local Lite builds the ${label} adapter when ZERO_AR_ADAPTER=${profile} and a key arrives through protected input, the OS credential store or ${keyVariable}; startup refuses without a key, and egress is admitted only to that adapter's host. Its release claim follows ${vectors.join(' and ')}.`, vectors, ['UAT-PRO-001']);
}
const localLiteConditional = [
    localLiteProvider('provider-anthropic', 'Anthropic', 'anthropic', 'ANTHROPIC_API_KEY', ['UAT-CV-017']),
    localLiteProvider('provider-openai', 'OpenAI', 'openai', 'OPENAI_API_KEY', ['PUB-CV-024', 'UAT-CV-017']),
    localLiteProvider('provider-fireworks', 'Fireworks AI', 'fireworks', 'FIREWORKS_API_KEY', ['PUB-CV-023']),
    localLiteProvider('provider-openrouter', 'OpenRouter', 'openrouter', 'OPENROUTER_API_KEY', ['PUB-CV-023']),
    localLiteProvider('provider-together', 'Together AI', 'together', 'TOGETHER_API_KEY', ['PUB-CV-023']),
    conditionalAt('cross-run-memory', 'registration', 'memory.unwired', 'Cross-run memory is off by default. ZERO_AR_MEMORY=durable attaches it with subject keys wrapped under a deployment key from the macOS keychain or a 0600 key file; ephemeral keeps the keys in process memory and loses its subjects at restart. There is no KMS or HSM custody. With memory off, the memory routes refuse.', ['XCV-016'], ['MEM-001', 'MEM-002', 'MEM-003', 'MEM-004', 'MEM-005', 'MEM-006', 'MEM-007', 'MEM-008', 'MEM-009', 'MEM-010']),
    conditionalAt('sequential-sampled-validation', 'intake', 'contract.validator.unregistered', 'Local Lite registers the transformation pack\'s items.sampled-output-trace check under the transform.items.sampled contract; a contract that binds any other sampled-oracle validator refuses at intake as unregistered. A sampled pass or reject records its sample on the checkpoint record; a capped check parks its items and the parked record carries only the reason.', ['MTH-CV-030', 'MTH-CV-031', 'MTH-CV-032'], ['MTH-SV-001', 'VPC-030']),
];
/**
 * A capability declared ahead of its mechanism. It stays excluded, naming
 * the unwired code that describes it, until a composition wires it and a
 * vector proves it through that composition. No such entry is supported.
 */
function unwired(capability, refusal_point, diagnostic_code, summary, vectors, requirements) {
    return excluded(capability, refusal_point, diagnostic_code, summary, vectors, requirements);
}
const unwiredInEveryComposition = [
    unwired('context-feature-cache', 'profile-compilation', 'context.cache.unwired', 'No context feature cache is built in this build; selection computes every candidate\'s features on every turn.', ['MTH-CV-090'], ['MTH-SO-001', 'MTH-SO-002']),
    unwired('content-defined-chunking', 'profile-compilation', 'source.chunking.unwired', 'Source snapshots store each member whole in this build; no chunk manifest is recorded and no chunk is reused across snapshots.', ['MTH-CV-091'], ['MTH-SO-003', 'MTH-SO-004']),
    unwired('workspace-binding-profiles', 'intake', 'workspace.instances.unwired', 'Workspace instance attachment is not wired in this build: intake refuses inputs.workspace, so a run exposes no workspace tools.', ['KCV-009', 'LIF-CV-021'], ['ADX-013', 'EXT-018']),
];
/** The gateway host is its own release bundle the CLI starts (decision J-1); it calls only public operations. */
const gatewayConditional = [
    conditionalAt('gateway-signed-webhook', 'profile-compilation', 'gateway.host.unavailable', 'Available when an operator runs zeroar gateway serve with a configuration that names a signed-webhook adapter. The gateway host is its own release bundle, calls only public operations with a scoped runtime key and reads its secrets through env: or file: references; without it, nothing turns a signed webhook into intake. The vectors run it against Local Lite; none yet runs it against a hosted cell.', ['DXI-CV-017', 'DXI-CV-018', 'DXI-CV-019'], ['DXI-029', 'DXI-030', 'DXI-031', 'DXI-032', 'DXI-033']),
    conditionalAt('gateway-interactive-messaging', 'profile-compilation', 'gateway.host.unavailable', 'Available when an operator runs zeroar gateway serve with a configuration that names an interactive adapter. Commands authenticate with an HMAC and a timestamp window and each one authorizes on its own; a thread is a routing handle only. Without the gateway host, no chat channel can deliver a control. The vectors run it against Local Lite; none yet runs it against a hosted cell.', ['DXI-CV-017', 'DXI-CV-018', 'DXI-CV-019'], ['DXI-029', 'DXI-030', 'DXI-031', 'DXI-032', 'DXI-033']),
];
const localLiteUnwired = [
    excluded('fair-cell-scheduling', 'profile-compilation', 'profile.capability.excluded', 'Local Lite serves one tenant, so fair dispatch across tenants does not apply.', ['MTH-CV-040'], ['MTH-SC-001', 'TEN-004']),
    unwired('attention-admission', 'publication', 'attention.admission.unwired', 'Attention admission is not wired in this build. Local Lite calibrates review capacity observe-only, publishes versioned capacity snapshots and serves the attention dashboard under /v1/attention; no run is admitted or refused on attention. The SDK publication compiler refuses a posture that declares an attention controller; a closure published through the raw publication API fails when a run binds it, as a server defect rather than a typed refusal. Runs record attention enforcement as not wired.', ['MTH-CV-080', 'MTH-CV-081', 'MTH-CV-082'], ['BUD-009', 'MTH-AT-004']),
    ...unwiredInEveryComposition,
    ...gatewayConditional,
];
const hostedUnwired = [
    unwired('fair-cell-scheduling', 'profile-compilation', 'scheduler.dispatch.unwired', 'Fair dispatch across tenants is not wired in this build; runs launch in arrival order and the cell applies no dominant-resource share.', ['MTH-CV-040', 'MTH-CV-041', 'MTH-CV-042'], ['MTH-SC-001', 'TEN-004']),
    unwired('sequential-sampled-validation', 'profile-compilation', 'validator.sampled.unwired', 'The hosted cell does not register the sampled check or its contract in this build, so a task contract that binds a sampled-oracle validator refuses at intake as unregistered. No hosted vector covers sampled validation or the controllers route.', ['MTH-CV-030', 'MTH-CV-031', 'MTH-CV-032'], ['MTH-SV-001', 'VPC-030']),
    unwired('attention-admission', 'publication', 'attention.admission.unwired', 'Attention admission is not wired in this build. The SDK publication compiler refuses a posture that declares an attention controller; a closure published through the raw publication API fails when a run binds it, as a server defect rather than a typed refusal. Runs record attention enforcement as not wired, and a hosted tenant has no attention service in this build, so its attention routes refuse with attention.service.unwired.', ['MTH-CV-080', 'MTH-CV-081', 'MTH-CV-082'], ['BUD-009', 'MTH-AT-004']),
    ...unwiredInEveryComposition,
    ...gatewayConditional,
];
const regulatedLaterWork = [
    excluded('fair-cell-scheduling', 'profile-compilation', 'profile.capability.excluded', 'Fair dispatch across tenants remains later work for regulated deployments.', ['MTH-CV-040'], ['MTH-SC-001']),
    excluded('sequential-sampled-validation', 'profile-compilation', 'profile.capability.excluded', 'Sequential sampled-oracle validation remains later work for regulated deployments.', ['MTH-CV-030'], ['MTH-SV-001']),
    excluded('context-feature-cache', 'profile-compilation', 'profile.capability.excluded', 'The context feature cache remains later work for regulated deployments.', ['MTH-CV-090'], ['MTH-SO-001']),
    excluded('content-defined-chunking', 'profile-compilation', 'profile.capability.excluded', 'Content-defined chunking remains later work for regulated deployments.', ['MTH-CV-091'], ['MTH-SO-003']),
    excluded('attention-admission', 'publication', 'profile.capability.excluded', 'Attention admission remains later work for regulated deployments.', ['MTH-CV-081'], ['BUD-009']),
    excluded('gateway-signed-webhook', 'profile-compilation', 'profile.capability.excluded', 'The signed-webhook gateway remains later work for regulated deployments.', ['DXI-CV-017'], ['DXI-029']),
    excluded('gateway-interactive-messaging', 'profile-compilation', 'profile.capability.excluded', 'The interactive messaging gateway remains later work for regulated deployments.', ['DXI-CV-017'], ['DXI-031']),
    excluded('workspace-binding-profiles', 'intake', 'profile.capability.excluded', 'Workspace instance attachment remains later work for regulated deployments.', ['KCV-009'], ['ADX-013']),
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
        version: '1.3.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['scripted', 'openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'openai-compatible'],
        aggregator_providers: [],
        environment_backends: ['process'],
        artifact_backends: ['filesystem'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'absent',
        components: { required: ['store'], health_probes: ['store', 'tool_host', 'secret_store'] },
        capabilities: [...localLiteSupported, ...localVersionThreeConditions, localLiteWebSearch, ...localLiteExclusions, ...localLiteConditional, ...localLiteUnwired],
    }),
    'small-production': seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'first-beta-uat',
        profile: 'small-production',
        version: '1.3.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic'],
        aggregator_providers: [],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'restricted-attachment',
        components: { required: ['artifact', 'migration', 'queue', 'store'], health_probes: ['artifact', 'migration', 'queue', 'secret_store', 'store', 'tool_host'] },
        capabilities: [...hostedSupported, ...hostedVersionThreeConditions, hostedWebSearch, ...hostedReleaseConditions, ...hostedDeferredReleaseCapabilities, hostedMcpCapability, hostedMcpClientCapability, ...conditionalHostedEnvironments, excluded('full-cell-docker-linux', 'profile-compilation', 'profile.capability.excluded', 'The self-contained Docker/Linux Full Cell uses the full-cell manifest.', ['XCV-007']), ...firstBetaExclusions, ...hostedUnwired],
    }),
    'full-cell': seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'first-beta-full-cell',
        profile: 'full-cell',
        version: '1.3.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic'],
        aggregator_providers: [],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'restricted-attachment',
        components: { required: ['artifact', 'migration', 'queue', 'store', 'tool_host', 'validator_host'], health_probes: ['artifact', 'authority', 'migration', 'queue', 'secret_store', 'store', 'tool_host', 'validator_host'] },
        capabilities: [...hostedSupported, ...hostedVersionThreeConditions, hostedWebSearch, ...hostedReleaseConditions, ...hostedDeferredReleaseCapabilities, hostedMcpCapability, hostedMcpClientCapability, ...conditionalHostedEnvironments, supported('full-cell-docker-linux', 'The Docker/Linux Full Cell packages the hosted runtime and child hosts together.', ['XCV-007']), ...firstBetaExclusions, ...hostedUnwired],
    }),
    regulated: seal({
        schema: 'zero-ar-profile-capability-manifest/1',
        manifest_id: 'regulated-future',
        profile: 'regulated',
        version: '1.3.0',
        capability_vocabulary_ref: contentHash(PROFILE_CAPABILITIES),
        model_providers: ['openai', 'anthropic'],
        aggregator_providers: [],
        environment_backends: ['process', 'oci'],
        artifact_backends: ['filesystem', 's3-compatible'],
        artifact_policy: firstBetaArtifactPolicy,
        tool_operation_classes: ['observation', 'run-internal', 'effect-proposal'],
        effect_plane: 'dynamic-authority',
        components: { required: ['artifact', 'authority', 'migration', 'queue', 'store', 'tool_host', 'validator_host'], health_probes: ['artifact', 'authority', 'migration', 'queue', 'secret_store', 'store', 'tool_host', 'validator_host'] },
        capabilities: [
            ...hostedSupported.filter((entry) => !['authored-orchestration', 'effect-proposal-tools', 'restricted-effect-plane-attachment'].includes(entry.capability)),
            ...hostedReleaseConditions.filter((entry) => entry.capability !== 'cross-run-memory'),
            ...hostedDeferredReleaseCapabilities,
            excluded('dynamic-authority', 'profile-compilation', 'profile.capability.excluded', 'Regulated dynamic authority is future wiring; this build refuses regulated profile construction until the service and target dispatch are wired.', ['UAT-CV-001']),
            excluded('production-effect-dispatch', 'profile-compilation', 'profile.capability.excluded', 'Regulated production effect dispatch is future wiring; this build records staged proposals only outside the regulated profile.', ['UAT-CV-001']),
            excluded('effect-proposal-tools', 'profile-compilation', 'profile.capability.excluded', 'Regulated effect-proposal tools wait for the regulated authority and effect-target composition.', ['UAT-CV-001']),
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
            ...regulatedLaterWork,
            ...regulatedVersionThreeExclusions,
            regulatedWebSearch,
        ],
    }),
};
