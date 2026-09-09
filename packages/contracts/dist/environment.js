/**
 * Environment lifecycle contracts.
 *
 * These schemas define the one provider-neutral protocol for disposable or
 * externally recoverable compute. Adapters translate provider operations;
 * Zero-AR keeps run, lease, effect, artifact, and completion meaning outside
 * the environment boundary (ENV-001 and ENV-002).
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { ENVIRONMENT_BACKENDS, ENVIRONMENT_ISOLATIONS, ENVIRONMENT_LIFECYCLE_OPERATIONS, ENVIRONMENT_MOUNT_MODES, ENVIRONMENT_NETWORK_MODES, ENVIRONMENT_PROFILE_STATES, ENVIRONMENT_STATUSES, ENVIRONMENT_SUSPENSION_DISPOSITIONS, ENVIRONMENT_TENANT_SHARING, OPERATION_CLASSES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const leaseId = z.string().regex(/^lea_[0-9a-f]{32}$/, 'expected a lease id');
const controlId = z.string().regex(/^ctl_[0-9a-f]{32}$/, 'expected a control id');
const environmentId = z.string().regex(/^env_[0-9a-f]{32}$/, 'expected an environment id');
const jobId = z.string().regex(/^job_[0-9a-f]{32}$/, 'expected an environment job id');
const count = z.number().int().nonnegative();
const name = z.string().min(1).max(200);
export const EnvironmentBackendSchema = z.enum(ENVIRONMENT_BACKENDS);
export const EnvironmentIsolationSchema = z.enum(ENVIRONMENT_ISOLATIONS);
export const EnvironmentLifecycleOperationSchema = z.enum(ENVIRONMENT_LIFECYCLE_OPERATIONS);
export const EnvironmentMountModeSchema = z.enum(ENVIRONMENT_MOUNT_MODES);
export const EnvironmentNetworkModeSchema = z.enum(ENVIRONMENT_NETWORK_MODES);
export const EnvironmentProfileStateSchema = z.enum(ENVIRONMENT_PROFILE_STATES);
export const EnvironmentStatusSchema = z.enum(ENVIRONMENT_STATUSES);
export const EnvironmentSuspensionDispositionSchema = z.enum(ENVIRONMENT_SUSPENSION_DISPOSITIONS);
export const EnvironmentTenantSharingSchema = z.enum(ENVIRONMENT_TENANT_SHARING);
/** Generic environments can host only work that carries no effect dispatch. */
export const EnvironmentOperationClassSchema = z
    .enum(OPERATION_CLASSES)
    .refine((value) => value !== 'effect-proposal', 'effect-proposal work dispatches only through the Effect Plane (ENV-009)');
export const EnvironmentLimitsSchema = z.strictObject({
    cpu_millis: z.number().int().positive(),
    memory_mib: z.number().int().positive(),
    disk_mib: z.number().int().positive(),
    gpu_count: count,
    wall_time_ms: z.number().int().positive(),
    process_count: z.number().int().positive(),
    concurrency: z.number().int().positive(),
    output_bytes: count,
});
export const EnvironmentNetworkPolicySchema = z
    .strictObject({
    mode: EnvironmentNetworkModeSchema,
    destinations: z.array(z.string().url()).max(256),
    enforced_at: z.string().min(1),
    name_resolution: z.string().min(1),
})
    .superRefine((policy, context) => {
    if (policy.mode === 'deny' && policy.destinations.length > 0) {
        context.addIssue({ code: 'custom', message: 'network deny carries no destinations.' });
    }
    if (policy.mode === 'allowlist' && policy.destinations.length === 0) {
        context.addIssue({ code: 'custom', message: 'network allowlist names at least one destination.' });
    }
});
export const EnvironmentMountPolicySchema = z.strictObject({
    name,
    mode: EnvironmentMountModeSchema,
    source_ref: hash.nullable(),
    target: z.string().startsWith('/'),
    max_bytes: count,
});
export const EnvironmentOutputDeclarationSchema = z.strictObject({
    path: z.string().min(1),
    max_bytes: count,
    classification: z.string().min(1),
    required: z.boolean(),
});
export const EnvironmentLifecycleAssuranceSchema = z.strictObject({
    provider_idempotency: z.boolean(),
    idempotency_scope: z.string().min(1),
    idempotency_retention_ms: count,
    stable_environment_handle: z.boolean(),
    stable_job_handle: z.boolean(),
    observe_without_mutation: z.boolean(),
    reconciliation: z.boolean(),
    cancellation: z.boolean(),
    teardown: z.boolean(),
    automatic_expiry_ms: count.nullable(),
    retained_resources: z.array(z.string().min(1)).max(64),
});
/** One versioned adapter capability and omission declaration (ENV-038). */
export const EnvironmentAdapterDescriptorSchema = z.strictObject({
    contract: z.literal('environment-adapter/1'),
    name,
    version: z.string().min(1),
    adapter_digest: hash,
    backend: EnvironmentBackendSchema,
    operations: z.array(EnvironmentLifecycleOperationSchema).min(1),
    operation_classes: z.array(EnvironmentOperationClassSchema).min(1),
    isolation: EnvironmentIsolationSchema,
    lifecycle: EnvironmentLifecycleAssuranceSchema,
    omissions: z.array(z.string().min(1)).max(128),
    owner: z.string().min(1),
    reviewer: z.string().min(1),
    conformance_refs: z.array(hash).min(1),
});
/** Immutable operator configuration. Enablement is separate mutable state. */
export const EnvironmentProfileSchema = z.strictObject({
    profile_ref: hash,
    name,
    version: z.string().min(1),
    adapter: EnvironmentAdapterDescriptorSchema,
    endpoint: z.string().url().nullable(),
    region: z.string().min(1).nullable(),
    provider_account_ref: hash.nullable(),
    provider_scope_ref: hash.nullable(),
    secret_refs: z.array(z.string().min(1)).max(32),
    image_ref: hash.nullable(),
    template_ref: hash.nullable(),
    limits: EnvironmentLimitsSchema,
    mounts: z.array(EnvironmentMountPolicySchema).max(64),
    outputs: z.array(EnvironmentOutputDeclarationSchema).max(64),
    network: EnvironmentNetworkPolicySchema,
    classification_ceiling: z.string().min(1),
    residency: z.string().min(1),
    retention: z.string().min(1),
    tenant_sharing: EnvironmentTenantSharingSchema,
    tenant_resource_refs: z.array(hash).max(128).superRefine((refs, context) => {
        if (new Set(refs).size !== refs.length) {
            context.addIssue({ code: 'custom', message: 'tenant resource references must be unique.' });
        }
    }),
    cost_dimensions: z.array(z.string().min(1)).max(32),
    created_by: z.string().min(1),
    reviewed_by: z.string().min(1),
});
/**
 * Compute the immutable profile identity from every material field. The
 * mutable enablement state and credential issuance epoch live outside this
 * value, so rotating the same scoped credential does not move active runs.
 */
export function deriveEnvironmentProfileRef(profile) {
    return contentHash(profile);
}
export function environmentProfileHasValidRef(profile) {
    const { profile_ref, ...material } = profile;
    return profile_ref === deriveEnvironmentProfileRef(material);
}
/** Mutable admission state kept beside, rather than inside, the immutable profile. */
export const EnvironmentProfileRegistrationSchema = z.strictObject({
    profile: EnvironmentProfileSchema,
    state: EnvironmentProfileStateSchema,
    secret_issuance_epoch: z.number().int().positive(),
    published_at: z.string().datetime().nullable(),
});
/** Every provider handle is bound to the admitted Zero-AR operation. */
export const EnvironmentHandleBindingSchema = z.strictObject({
    tenant: z.string().min(1),
    run_id: runId,
    profile_ref: hash,
    adapter_digest: hash,
    operation_class: EnvironmentOperationClassSchema,
    operation: name,
    tool_call_id: z.string().min(1),
    lease_id: leaseId,
    executing_principal: z.string().min(1),
    accountable_owner: z.string().min(1),
});
export const EnvironmentHandleSchema = z.strictObject({
    environment_id: environmentId,
    provider_handle: z.string().min(1),
    binding: EnvironmentHandleBindingSchema,
    identity_ref: hash,
    status: EnvironmentStatusSchema,
    credential_epoch: z.number().int().positive().nullable(),
    expires_at: z.string().datetime().nullable(),
});
export const EnvironmentJobHandleSchema = z.strictObject({
    job_id: jobId,
    provider_job_handle: z.string().min(1),
    environment: EnvironmentHandleSchema,
    submission_request_id: controlId,
    request_hash: hash,
    idempotency_key: z.string().min(1),
    status: EnvironmentStatusSchema,
});
const requestBase = {
    request_id: controlId,
    binding: EnvironmentHandleBindingSchema,
    idempotency_key: z.string().min(1).max(256),
};
const resultBase = {
    request_id: controlId,
    status: EnvironmentStatusSchema,
    may_have_reached_provider: z.boolean(),
    provider_response_ref: hash.nullable(),
    diagnostic: z.string().max(4_096).nullable(),
};
export const PrepareEnvironmentRequestSchema = z.strictObject({
    ...requestBase,
    profile: EnvironmentProfileSchema,
});
export const PrepareEnvironmentResultSchema = z
    .strictObject({
    ...resultBase,
    environment: EnvironmentHandleSchema.nullable(),
})
    .superRefine((result, context) => matchingStatus(result, result.environment, 'environment', context));
export const SubmitEnvironmentJobRequestSchema = z.strictObject({
    ...requestBase,
    environment: EnvironmentHandleSchema,
    argv: z.array(z.string()).min(1).max(1_024),
    working_directory: z.string().startsWith('/'),
    environment_variables: z.record(z.string(), z.string()),
    operation_input: z.record(z.string(), z.unknown()).nullable(),
    outputs: z.array(EnvironmentOutputDeclarationSchema).max(64),
});
export const SubmitEnvironmentJobResultSchema = z
    .strictObject({
    ...resultBase,
    job: EnvironmentJobHandleSchema.nullable(),
})
    .superRefine((result, context) => matchingStatus(result, result.job, 'job', context));
const jobRequestBase = {
    ...requestBase,
    environment: EnvironmentHandleSchema,
    job: EnvironmentJobHandleSchema,
};
export const ObserveEnvironmentJobRequestSchema = z.strictObject(jobRequestBase);
export const ObserveEnvironmentJobResultSchema = z
    .strictObject({
    ...resultBase,
    job: EnvironmentJobHandleSchema,
    provider_time: z.string().datetime().nullable(),
    stdout_bytes: count,
    stderr_bytes: count,
    inline_output_json: z.string().max(4_096).nullable(),
})
    .superRefine((result, context) => matchingStatus(result, result.job, 'job', context));
export const ReconcileEnvironmentJobRequestSchema = z.strictObject({
    ...requestBase,
    environment: EnvironmentHandleSchema,
    job: EnvironmentJobHandleSchema.nullable(),
    original_request_id: controlId,
    original_idempotency_key: z.string().min(1).max(256),
});
export const ReconcileEnvironmentJobResultSchema = z
    .strictObject({
    ...resultBase,
    job: EnvironmentJobHandleSchema.nullable(),
    provider_time: z.string().datetime().nullable(),
    stdout_bytes: count,
    stderr_bytes: count,
    inline_output_json: z.string().max(4_096).nullable(),
})
    .superRefine((result, context) => matchingStatus(result, result.job, 'job', context));
export const CancelEnvironmentJobRequestSchema = z.strictObject({
    ...jobRequestBase,
    reason: z.string().min(1).max(2_000),
});
export const CancelEnvironmentJobResultSchema = z
    .strictObject({
    ...resultBase,
    job: EnvironmentJobHandleSchema,
    cannot_continue: z.boolean(),
})
    .superRefine((result, context) => matchingStatus(result, result.job, 'job', context));
export const CollectEnvironmentArtifactRequestSchema = z.strictObject({
    ...jobRequestBase,
    source_path: z.string().min(1),
    expected_hash: hash.nullable(),
    expected_bytes: count.nullable(),
    max_bytes: count,
    classification: z.string().min(1),
    artifact_destination_ref: z.string().min(1),
});
export const CollectedEnvironmentArtifactSchema = z.strictObject({
    artifact_ref: z.string().min(1),
    source_path: z.string().min(1),
    content_hash: hash,
    bytes: count,
    classification: z.string().min(1),
    source_environment_id: environmentId,
    source_job_id: jobId,
    adapter_digest: hash,
    destination_ref: z.string().min(1),
});
export const CollectEnvironmentArtifactResultSchema = z
    .strictObject({
    ...resultBase,
    artifact: CollectedEnvironmentArtifactSchema.nullable(),
})
    .superRefine((result, context) => {
    if (result.status === 'collected' && !result.artifact) {
        context.addIssue({ code: 'custom', path: ['artifact'], message: 'collected status requires an admitted artifact.' });
    }
    if (result.artifact && result.status !== 'collected') {
        context.addIssue({ code: 'custom', path: ['status'], message: 'an admitted artifact requires collected status.' });
    }
});
export const TeardownEnvironmentRequestSchema = z.strictObject({
    ...requestBase,
    environment: EnvironmentHandleSchema,
    reason: z.string().min(1).max(2_000),
});
export const TeardownEnvironmentResultSchema = z
    .strictObject({
    ...resultBase,
    environment: EnvironmentHandleSchema,
    retained_resources: z.array(z.string().min(1)).max(128),
})
    .superRefine((result, context) => matchingStatus(result, result.environment, 'environment', context));
export const AbandonEnvironmentRequestSchema = z.strictObject({
    ...requestBase,
    environment: EnvironmentHandleSchema,
    job: EnvironmentJobHandleSchema.nullable(),
    actor: z.string().min(1),
    reason: z.string().min(1).max(4_096),
    known_cost: z.record(z.string(), count),
    remaining_uncertainty: z.array(z.string().min(1)).min(1),
    affected_artifacts: z.array(z.string().min(1)),
    blocks_verified_completion: z.boolean(),
});
export const AbandonEnvironmentResultSchema = z
    .strictObject({
    ...resultBase,
    environment: EnvironmentHandleSchema,
    job: EnvironmentJobHandleSchema.nullable(),
    blocks_verified_completion: z.boolean(),
})
    .superRefine((result, context) => {
    matchingStatus(result, result.environment, 'environment', context);
    matchingStatus(result, result.job, 'job', context);
});
/** Durable suspension disposition for every environment handle still open. */
export const SuspendedEnvironmentHandleSchema = z.strictObject({
    environment: EnvironmentHandleSchema,
    jobs: z.array(EnvironmentJobHandleSchema),
    disposition: EnvironmentSuspensionDispositionSchema,
    recorded_at: z.string().datetime(),
});
/** Current facts that resume must revalidate before it contacts a provider. */
export const EnvironmentResumeContextSchema = z.strictObject({
    tenant: z.string().min(1),
    accepted_adapter_digest: hash,
    profile_state: EnvironmentProfileStateSchema,
    credential_ready: z.boolean(),
    secret_issuance_epoch: z.number().int().positive(),
    endpoint: z.string().url().nullable(),
    region: z.string().min(1).nullable(),
    provider_account_ref: hash.nullable(),
    provider_scope_ref: hash.nullable(),
    egress_destinations: z.array(z.string().url()),
    classification_ceiling: z.string().min(1),
});
/** One already-admitted run-internal invocation crossing from the kernel. */
export const EnvironmentExecutionRequestSchema = z.strictObject({
    tool: name,
    input: z.record(z.string(), z.unknown()),
    timeout_ms: z.number().int().positive(),
    run_id: runId,
    tool_call_id: controlId,
    lease_id: leaseId,
    tenant: z.string().min(1),
    executing_principal: z.string().min(1),
    accountable_owner: z.string().min(1),
});
export const EnvironmentExecutionResultSchema = z.strictObject({
    ok: z.boolean(),
    output: z.record(z.string(), z.unknown()).optional(),
    error: z.string().optional(),
    used: count.optional(),
});
/** Only these lifecycle states carry work that still needs disposition. */
export function isNonTerminalEnvironmentStatus(status) {
    return status !== 'collected' && status !== 'cancelled' && status !== 'failed' && status !== 'torn-down' && status !== 'abandoned';
}
function matchingStatus(result, handle, path, context) {
    if (handle && handle.status !== result.status) {
        context.addIssue({ code: 'custom', path: [path, 'status'], message: `the ${path} status must match the normalized result status.` });
    }
}
