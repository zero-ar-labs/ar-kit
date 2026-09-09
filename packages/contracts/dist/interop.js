/**
 * Protocol interoperability contracts and canonical projections.
 *
 * What this is: immutable protocol bindings, discovery snapshots, published
 * work entrypoints, MCP task aliases and assurance envelopes. Secret material
 * has no field in these shapes.
 *
 * How it fits: protocol packages translate these contracts to native client
 * calls. The functions here project canonical native state and never own a
 * second run, cancellation, quality or effect state machine.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { refuse } from "./diagnostics.js";
import { ASSURANCE_COMPLETION_CLASSES, ASSURANCE_EFFECT_DISPOSITIONS, COMPLETION_STATES, INTEROP_CACHE_SCOPES, INTEROP_CAPABILITY_STATES, INTEROP_DIRECTIONS, INTEROP_PROTOCOLS, INTEROP_REMOTE_CONSEQUENCE_POSTURES, INTEROP_TENANT_DERIVATIONS, MCP_TASK_STATUSES, OPERATION_CLASSES, RUN_STATUSES, RUN_TERMINALS, SUSPEND_REASONS, VERDICTS, } from "./vocab.js";
const hash = z.string()
    .regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>')
    .refine((value) => value !== `sha256:${'0'.repeat(64)}`, 'an all-zero digest is a placeholder, not an admitted identity');
const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const protocolVersion = z.string().min(1).max(100);
const boundedName = z.string().regex(/^[a-z][a-z0-9._-]{0,127}$/, 'expected a bounded lowercase name');
const authenticationRef = z.string().regex(/^secret:\/\/[A-Za-z0-9._/-]+$/, 'expected a secret:// reference, never credential bytes');
const destinationRef = z.string().regex(/^destination:\/\/[A-Za-z0-9._:/-]+$/, 'expected a destination:// reference');
const taskId = z.string().regex(/^task_run_[0-9a-f]{32}$/, 'expected a task alias for one native run id');
export const InteropJsonSchema = z.lazy(() => z.union([
    z.null(),
    z.boolean(),
    z.number().finite(),
    z.string().max(100_000),
    z.array(InteropJsonSchema).max(10_000),
    z.record(z.string().max(256), InteropJsonSchema),
]));
export const InteropConnectionSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal('endpoint'),
        endpoint: z.string().url().max(2_048),
        destination_ref: destinationRef,
    }),
    z.strictObject({
        kind: z.literal('listener'),
        listener: z.string().min(1).max(2_048),
        listener_identity_ref: hash,
    }),
]);
const interopBindingBodySchema = z.strictObject({
    api_version: z.literal('zero-ar/v1'),
    kind: z.literal('InteropBinding'),
    name: boundedName,
    version: semver,
    tenant: z.string().min(1).max(256),
    owner: z.string().min(1).max(256),
    protocol: z.enum(INTEROP_PROTOCOLS),
    direction: z.enum(INTEROP_DIRECTIONS),
    protocol_versions: z.array(protocolVersion).min(1).max(16),
    connection: InteropConnectionSchema,
    authentication_ref: authenticationRef.nullable(),
    tenant_derivation: z.enum(INTEROP_TENANT_DERIVATIONS),
    capabilities: z.array(boundedName).max(10_000),
    extensions: z.strictObject({
        required: z.array(z.string().min(1).max(512)).max(64),
        optional: z.array(z.string().min(1).max(512)).max(64),
    }),
    operation_class: z.enum(OPERATION_CLASSES),
    remote_consequence_posture: z.enum(INTEROP_REMOTE_CONSEQUENCE_POSTURES),
    timeouts: z.strictObject({
        connect_ms: z.number().int().positive().max(600_000),
        idle_ms: z.number().int().positive().max(86_400_000),
    }),
    limits: z.strictObject({
        request_bytes: z.number().int().positive().max(64 * 1024 * 1024),
        response_bytes: z.number().int().positive().max(64 * 1024 * 1024),
        artifact_bytes: z.number().int().positive().max(4 * 1024 * 1024 * 1024),
        json_depth: z.number().int().positive().max(128),
        schema_depth: z.number().int().positive().max(128),
        string_bytes: z.number().int().positive().max(16 * 1024 * 1024),
        list_items: z.number().int().positive().max(100_000),
        header_bytes: z.number().int().positive().max(256 * 1024),
        compression_ratio: z.number().positive().max(10_000),
        validation_ms: z.number().int().positive().max(60_000),
    }),
    created_at: z.string().datetime(),
});
export const InteropBindingManifestBodySchema = interopBindingBodySchema.superRefine((binding, context) => {
    if (binding.direction === 'client' && binding.connection.kind !== 'endpoint') {
        context.addIssue({ code: 'custom', path: ['connection'], message: 'a client binding requires an endpoint connection.' });
    }
    if (binding.direction === 'client' && binding.authentication_ref === null) {
        context.addIssue({ code: 'custom', path: ['authentication_ref'], message: 'a client binding requires an authentication reference.' });
    }
    if (binding.protocol === 'mcp' && !binding.protocol_versions.includes('2026-07-28')) {
        context.addIssue({ code: 'custom', path: ['protocol_versions'], message: 'the first MCP binding requires protocol revision 2026-07-28.' });
    }
    const overlap = binding.extensions.required.filter((extension) => binding.extensions.optional.includes(extension));
    if (overlap.length > 0) {
        context.addIssue({ code: 'custom', path: ['extensions'], message: `an extension cannot be both required and optional: ${overlap.join(', ')}.` });
    }
});
export const InteropBindingManifestSchema = interopBindingBodySchema.extend({ binding_ref: hash }).superRefine((binding, context) => {
    const { binding_ref: _bindingRef, ...body } = binding;
    const parsed = InteropBindingManifestBodySchema.safeParse(body);
    if (!parsed.success) {
        context.addIssue({ code: 'custom', path: parsed.error.issues[0]?.path ?? [], message: parsed.error.issues[0]?.message ?? 'the binding body is invalid.' });
        return;
    }
    if (binding.binding_ref !== contentHash(parsed.data)) {
        context.addIssue({ code: 'custom', path: ['binding_ref'], message: 'the binding reference must identify the exact manifest body.' });
    }
});
export function compileInteropBinding(input) {
    const body = InteropBindingManifestBodySchema.parse(input);
    return InteropBindingManifestSchema.parse({ ...body, binding_ref: contentHash(body) });
}
const mcpPublishedWorkEntrypointBodySchema = z.strictObject({
    name: boundedName,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2_000),
    publication_ref: hash,
    agent_ref: hash,
    accountable_principal: z.string().min(1).max(256),
    input_schema: InteropJsonSchema,
    output_schema: InteropJsonSchema,
    default_budgets: z.strictObject({
        model_tokens: z.number().int().nonnegative(),
        tool_calls: z.number().int().nonnegative().optional(),
        bytes: z.number().int().nonnegative().optional(),
        compute_ms: z.number().int().nonnegative().optional(),
        attention: z.number().int().nonnegative(),
        verification_reserve_fraction: z.number().min(0).max(1),
        max_turns: z.number().int().positive(),
    }),
    mcp_visible: z.literal(true),
    assurance_extension_required: z.boolean(),
});
export const McpPublishedWorkEntrypointBodySchema = mcpPublishedWorkEntrypointBodySchema.superRefine((entrypoint, context) => {
    const output = entrypoint.output_schema;
    const properties = output && typeof output === 'object' && !Array.isArray(output)
        ? output['properties']
        : null;
    const required = output && typeof output === 'object' && !Array.isArray(output)
        ? output['required']
        : null;
    const assurance = properties && typeof properties === 'object' && !Array.isArray(properties)
        ? properties['assurance']
        : null;
    if (!output
        || typeof output !== 'object'
        || Array.isArray(output)
        || output['type'] !== 'object'
        || !Array.isArray(required)
        || !required.includes('assurance')
        || !assurance
        || typeof assurance !== 'object'
        || Array.isArray(assurance)
        || assurance['type'] !== 'object') {
        context.addIssue({
            code: 'custom',
            path: ['output_schema'],
            message: 'an MCP work entrypoint output schema must require one object property named assurance so every outcome carries the native assurance envelope.',
        });
    }
});
export const McpPublishedWorkEntrypointSchema = mcpPublishedWorkEntrypointBodySchema.extend({ entrypoint_ref: hash }).superRefine((entrypoint, context) => {
    const { entrypoint_ref: _entrypointRef, ...body } = entrypoint;
    const parsed = McpPublishedWorkEntrypointBodySchema.safeParse(body);
    if (!parsed.success) {
        context.addIssue({
            code: 'custom',
            path: parsed.error.issues[0]?.path ?? [],
            message: parsed.error.issues[0]?.message ?? 'the work entrypoint body is invalid.',
        });
        return;
    }
    if (entrypoint.entrypoint_ref !== contentHash(parsed.data)) {
        context.addIssue({ code: 'custom', path: ['entrypoint_ref'], message: 'the entrypoint reference must identify the exact published work-entrypoint body.' });
    }
});
/** Compile one immutable work entrypoint after publication selected its exact agent. */
export function compileMcpPublishedWorkEntrypoint(input) {
    const body = McpPublishedWorkEntrypointBodySchema.parse(input);
    return McpPublishedWorkEntrypointSchema.parse({ ...body, entrypoint_ref: contentHash(body) });
}
export const McpPeerToolSchema = z.strictObject({
    name: boundedName,
    title: z.string().min(1).max(200).nullable(),
    description: z.string().max(2_000).nullable(),
    input_schema: InteropJsonSchema,
    output_schema: InteropJsonSchema.nullable(),
    annotations: InteropJsonSchema.nullable(),
});
export const McpPeerResourceSchema = z.strictObject({
    uri: z.string().url().max(4_096),
    name: z.string().min(1).max(256),
    media_type: z.string().min(1).max(256).nullable(),
    content_identity: hash.nullable(),
    authorization_boundary: z.string().min(1).max(256),
});
const peerSnapshotBodySchema = z.strictObject({
    format: z.literal('zero-ar-interop-peer-snapshot/1'),
    binding_ref: hash,
    endpoint: z.string().url().max(2_048),
    authenticated_peer: z.string().min(1).max(512),
    protocol: z.literal('mcp'),
    protocol_version: z.literal('2026-07-28'),
    extensions: z.array(z.string().min(1).max(512)).max(64),
    normalized_ref: hash,
    retrieved_at: z.string().datetime(),
    expires_at: z.string().datetime().nullable(),
    cache: z.strictObject({ ttl_ms: z.number().int().nonnegative(), scope: z.enum(INTEROP_CACHE_SCOPES) }),
    tools: z.array(McpPeerToolSchema).max(10_000),
    resources: z.array(McpPeerResourceSchema).max(10_000),
    warnings: z.array(z.string().min(1).max(2_000)).max(1_000),
});
export const McpPeerSnapshotBodySchema = peerSnapshotBodySchema.superRefine((snapshot, context) => {
    if (snapshot.expires_at !== null && Date.parse(snapshot.expires_at) < Date.parse(snapshot.retrieved_at)) {
        context.addIssue({ code: 'custom', path: ['expires_at'], message: 'snapshot expiry cannot precede retrieval.' });
    }
});
export const McpPeerSnapshotSchema = peerSnapshotBodySchema.extend({ snapshot_ref: hash }).superRefine((snapshot, context) => {
    const { snapshot_ref: _snapshotRef, ...body } = snapshot;
    const parsed = McpPeerSnapshotBodySchema.safeParse(body);
    if (!parsed.success) {
        context.addIssue({ code: 'custom', path: parsed.error.issues[0]?.path ?? [], message: parsed.error.issues[0]?.message ?? 'the peer snapshot body is invalid.' });
        return;
    }
    if (snapshot.snapshot_ref !== contentHash(parsed.data)) {
        context.addIssue({ code: 'custom', path: ['snapshot_ref'], message: 'the snapshot reference must identify the exact normalized discovery result.' });
    }
});
export function compileMcpPeerSnapshot(input) {
    const body = McpPeerSnapshotBodySchema.parse(input);
    return McpPeerSnapshotSchema.parse({ ...body, snapshot_ref: contentHash(body) });
}
export const McpImportedToolPlanSchema = z.strictObject({
    snapshot_ref: hash,
    tool_name: boundedName,
    tool_manifest_ref: hash,
    execution_binding_ref: hash,
    endpoint: z.string().url().max(2_048),
    authentication_ref: authenticationRef,
    destination_ref: destinationRef,
    operation_class: z.enum(OPERATION_CLASSES),
    admitted: z.boolean(),
    admission_ref: hash.nullable(),
    unsupported_metadata: z.array(z.string().min(1).max(512)).max(128),
}).superRefine((plan, context) => {
    if (plan.admitted !== (plan.admission_ref !== null)) {
        context.addIssue({ code: 'custom', path: ['admission_ref'], message: 'an imported tool is admitted only when an explicit admission reference is present.' });
    }
});
export const McpImportedResourcePlanSchema = z.strictObject({
    snapshot_ref: hash,
    uri: z.string().url().max(4_096),
    media_type: z.string().min(1).max(256).nullable(),
    content_identity: hash.nullable(),
    authorization_boundary: z.string().min(1).max(256),
    endpoint: z.string().url().max(2_048),
    authentication_ref: authenticationRef,
    destination_ref: destinationRef,
    admitted: z.boolean(),
    admission_ref: hash.nullable(),
}).superRefine((plan, context) => {
    if (plan.admitted !== (plan.admission_ref !== null)) {
        context.addIssue({ code: 'custom', path: ['admission_ref'], message: 'an imported resource is admitted only when an explicit admission reference is present.' });
    }
});
export const McpTaskAliasSchema = z.strictObject({
    task_id: taskId,
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
});
export function mcpTaskAlias(runId) {
    const parsed = z.string().regex(/^run_[0-9a-f]{32}$/).parse(runId);
    return { task_id: `task_run_${parsed.slice(4)}`, run_id: parsed };
}
export function nativeRunIdFromMcpTask(task) {
    const parsed = taskId.safeParse(task);
    if (!parsed.success) {
        refuse({
            code: 'interop.mcp.task.invalid',
            message: 'the MCP task id is not a native run alias. Supply the task id returned by this binding.',
            received: task.slice(0, 256),
            clause: 'IOP-005',
        });
    }
    return `run_${parsed.data.slice('task_run_'.length)}`;
}
export const McpPendingInputSchema = z.strictObject({
    request_id: z.string().min(1).max(256),
    handle: z.string().min(1).max(256),
    message: z.string().min(1).max(2_000),
    schema: InteropJsonSchema,
});
export const McpTaskProjectionSchema = z.strictObject({
    task_id: taskId,
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    status: z.enum(MCP_TASK_STATUSES),
    status_message: z.string().min(1).max(2_000),
    pending_inputs: z.array(McpPendingInputSchema).max(10_000),
});
export function projectMcpTask(snapshot, pendingInputs) {
    if (!RUN_STATUSES.includes(snapshot.status)) {
        refuse({
            code: 'interop.mcp.native-state.unknown',
            message: 'the native run status has no MCP task mapping. Add an explicit mapping before exposing this state.',
            received: String(snapshot.status).slice(0, 256),
            clause: 'IOP-004',
        });
    }
    if (snapshot.terminal !== null && !RUN_TERMINALS.includes(snapshot.terminal)) {
        refuse({
            code: 'interop.mcp.native-terminal.unknown',
            message: 'the native run terminal has no MCP task mapping. Add an explicit mapping before exposing this terminal.',
            received: String(snapshot.terminal).slice(0, 256),
            clause: 'IOP-004',
        });
    }
    if (!COMPLETION_STATES.includes(snapshot.completion_state)) {
        refuse({
            code: 'interop.mcp.native-completion.unknown',
            message: 'the native completion state has no MCP task mapping. Add an explicit mapping before exposing this state.',
            received: String(snapshot.completion_state).slice(0, 256),
            clause: 'IOP-004',
        });
    }
    if (snapshot.suspend_reason !== null && !SUSPEND_REASONS.includes(snapshot.suspend_reason)) {
        refuse({
            code: 'interop.mcp.native-suspension.unknown',
            message: 'the native suspension reason has no MCP task mapping. Add an explicit mapping before exposing this state.',
            received: String(snapshot.suspend_reason).slice(0, 256),
            clause: 'IOP-004',
        });
    }
    const alias = mcpTaskAlias(snapshot.run_id);
    if (snapshot.status === 'cancelled' || snapshot.terminal === 'cancelled') {
        return { ...alias, status: 'cancelled', status_message: 'The native run reached its cancellation terminal.', pending_inputs: [] };
    }
    if (snapshot.status === 'finished') {
        return { ...alias, status: 'completed', status_message: 'The native run reached an honest terminal result.', pending_inputs: [] };
    }
    if (snapshot.status === 'suspended' && snapshot.suspend_reason === 'awaiting_answer' && pendingInputs.length > 0) {
        return { ...alias, status: 'input_required', status_message: 'The native run is waiting for the listed answers.', pending_inputs: [...pendingInputs] };
    }
    return {
        ...alias,
        status: 'working',
        status_message: snapshot.status === 'suspended'
            ? `The native run is suspended for ${snapshot.suspend_reason ?? 'an unspecified reason'} and has no client-answerable request.`
            : `The native run is ${snapshot.status}.`,
        pending_inputs: [],
    };
}
export const AssuranceEnvelopeSchema = z.strictObject({
    schema: z.literal('zero-ar-assurance/v1'),
    run_ref: z.string().regex(/^run_[0-9a-f]{32}$/),
    completion_class: z.enum(ASSURANCE_COMPLETION_CLASSES),
    native_terminal: z.string().nullable(),
    verdict: z.string().nullable(),
    coverage: z.array(z.string().min(1).max(512)).max(10_000),
    gaps: z.array(z.string().min(1).max(2_000)).max(10_000),
    evidence_refs: z.array(hash).max(10_000),
    effect_disposition: z.enum(ASSURANCE_EFFECT_DISPOSITIONS),
    canonical_position: z.number().int().nonnegative(),
    generated_at: z.string().datetime(),
});
export function assuranceEnvelopeFromRunResult(input) {
    const { result } = input;
    if (!RUN_STATUSES.includes(result.status)
        || (result.terminal !== null && !RUN_TERMINALS.includes(result.terminal))
        || !COMPLETION_STATES.includes(result.completion_state)
        || (result.verdict !== null && !VERDICTS.includes(result.verdict))) {
        refuse({
            code: 'interop.assurance.native-state.unknown',
            message: 'the native result contains a state with no assurance mapping. Add an explicit mapping before presenting this result.',
            clause: 'IOP-004',
        });
    }
    const completionClass = result.status === 'cancelled' || result.terminal === 'cancelled'
        ? 'cancelled'
        : result.status !== 'finished'
            ? 'working'
            : result.terminal === 'complete' && result.verdict === 'verified'
                ? 'verified'
                : result.verdict === 'rejected'
                    ? 'rejected'
                    : result.verdict === 'indeterminate'
                        ? 'indeterminate'
                        : result.verdict === 'exhausted'
                            ? 'exhausted'
                            : 'unverified';
    const effectDisposition = result.effects.unreconcilable > 0
        ? 'unreconcilable'
        : result.effects.outcome_unknown > 0
            ? 'outcome-unknown'
            : result.effects.prepared + result.effects.dispatched > 0
                ? 'open'
                : result.effects.committed + result.effects.withdrawn > 0
                    ? 'settled'
                    : 'none';
    return AssuranceEnvelopeSchema.parse({
        schema: 'zero-ar-assurance/v1',
        run_ref: result.run_id,
        completion_class: completionClass,
        native_terminal: result.terminal,
        verdict: result.verdict,
        coverage: [...(input.coverage ?? [])],
        gaps: [...result.not_established, ...result.blocking_operational_outcomes.map((outcome) => `${outcome.kind}:${outcome.reference}:${outcome.state}`)],
        evidence_refs: [...(input.evidence_refs ?? [])],
        effect_disposition: effectDisposition,
        canonical_position: input.canonical_position,
        generated_at: input.generated_at,
    });
}
export const InteropProtocolRegistryEntrySchema = z.strictObject({
    protocol: z.enum(INTEROP_PROTOCOLS),
    direction: z.enum(INTEROP_DIRECTIONS),
    implementation: z.string().min(1).max(256),
    implementation_version: semver,
    protocol_versions: z.array(protocolVersion).min(1).max(16),
    extensions: z.array(z.string().min(1).max(512)).max(64),
    sdk_packages: z.record(z.string().min(1).max(256), semver),
    conformance_evidence: z.array(z.string().min(1).max(256)).max(256),
    known_deviations: z.array(z.string().min(1).max(2_000)).max(256),
    retirement_date: z.string().date().nullable(),
});
export const InteropProtocolRegistrySchema = z.strictObject({
    format: z.literal('zero-ar-interop-registry/1'),
    entries: z.array(InteropProtocolRegistryEntrySchema).max(256),
});
export const InteropCapabilitySchema = z.strictObject({
    protocol: z.enum(INTEROP_PROTOCOLS),
    direction: z.enum(INTEROP_DIRECTIONS),
    state: z.enum(INTEROP_CAPABILITY_STATES),
    configured: z.boolean(),
    healthy: z.boolean(),
    admitted: z.boolean(),
    selectable: z.boolean(),
    binding_ref: hash.nullable(),
    detail: z.string().min(1).max(2_000),
}).superRefine((capability, context) => {
    const ordered = [capability.configured, capability.healthy, capability.admitted, capability.selectable];
    for (let index = 1; index < ordered.length; index += 1) {
        if (ordered[index] && !ordered[index - 1]) {
            context.addIssue({ code: 'custom', path: [['configured', 'healthy', 'admitted', 'selectable'][index]], message: 'a later interoperability capability state requires every preceding state.' });
        }
    }
    const expected = capability.selectable ? 'selectable' : capability.admitted ? 'admitted' : capability.healthy ? 'healthy' : capability.configured ? 'configured' : 'implemented';
    if (capability.state !== expected) {
        context.addIssue({ code: 'custom', path: ['state'], message: `the state must be ${expected} for the declared progression flags.` });
    }
});
