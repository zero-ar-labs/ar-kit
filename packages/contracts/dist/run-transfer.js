/**
 * Cross-executor run continuation contracts.
 *
 * What this is: the content-addressed capsule, executor declaration and
 * compatibility result used when a restored run moves to another harness.
 *
 * How it fits: the capsule summarizes canonical history and referenced
 * state. It grants nothing. The kernel still takes the execution claim,
 * records acceptance and uses the existing recovery and resume paths.
 */
import { z } from 'zod';
import { COMPLETION_STATES, EFFECT_STATES, LEASE_DENOMINATIONS, LEASE_POOLS, RUN_BUNDLE_CANONICALIZATIONS, RUN_CONTINUATION_BINDING_KINDS, RUN_CONTINUATION_CHECK_KINDS, RUN_CONTINUATION_CHECK_STATUSES, RUN_HEAD_FOLD_PROFILES, RUN_STATUSES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const recordId = z.string().regex(/^rec_[0-9a-f]{32}$/, 'expected a record id');
const leaseId = z.string().regex(/^lea_[0-9a-f]{32}$/, 'expected a lease id');
export const RunContinuationExecutorSchema = z.strictObject({
    executor_ref: hash,
    name: z.string().min(1).max(200),
    version: z.string().min(1).max(100),
});
export const RunContinuationBindingRequirementSchema = z.strictObject({
    kind: z.enum(RUN_CONTINUATION_BINDING_KINDS),
    ref: z.string().min(1).max(2_048),
});
export const RunContinuationFrontierSchema = z.strictObject({
    record_count: z.number().int().positive(),
    logical_clock: z.number().int().positive(),
    record_id: recordId,
    chain_head: hash,
    head_projection_hash: hash,
});
/** A data-only description of exactly what another executor would inherit. */
export const RunContinuationCapsuleSchema = z.strictObject({
    schema: z.literal('zero-ar-run-continuation/1'),
    run_id: runId,
    frontier: RunContinuationFrontierSchema,
    protocol: z.strictObject({
        bundle_format_version: z.literal(2),
        canonicalization: z.enum(RUN_BUNDLE_CANONICALIZATIONS),
        record_catalogue_ref: hash,
        fold_profile: z.enum(RUN_HEAD_FOLD_PROFILES),
    }),
    /** The deployment authority that serializes one source frontier across stores. Null means inspectable but not continuable. */
    // Older format-2 bundles predate cross-store continuation fencing. They
    // remain readable, but null makes them data-only and therefore impossible
    // to continue until a new authority-bound export is produced.
    continuation_authority_ref: hash.nullable().default(null),
    state_closure_ref: hash,
    lifecycle: z.strictObject({
        status: z.enum(RUN_STATUSES),
        completion_state: z.enum(COMPLETION_STATES),
        turn: z.number().int().nonnegative(),
        pending_review_items: z.array(z.string().min(1).max(512)).max(100_000),
    }),
    open_leases: z.array(z.strictObject({
        lease_id: leaseId,
        pool: z.enum(LEASE_POOLS),
        denomination: z.enum(LEASE_DENOMINATIONS),
        amount: z.number().int().positive(),
    })).max(10_000),
    nonterminal_effects: z.array(z.strictObject({
        effect_id: z.string().min(1).max(256),
        state: z.enum(EFFECT_STATES),
        target: z.string().min(1).max(512),
        operation: z.string().min(1).max(512),
    })).max(10_000),
    pending_controls: z.array(z.strictObject({
        control_id: z.string().min(1).max(256),
        verb: z.string().min(1).max(100),
    })).max(10_000),
    pending_wakes: z.array(z.strictObject({
        wake_id: z.string().min(1).max(256),
        due_at: z.string().datetime(),
        condition: z.string().min(1).max(512),
    })).max(10_000),
    inflight_operations: z.array(z.string().min(1).max(1_000)).max(256),
    required_bindings: z.array(RunContinuationBindingRequirementSchema).max(10_000),
    capsule_ref: hash,
});
/** What one executor says it can interpret and bind before taking a claim. */
export const RunContinuationDeclarationSchema = z.strictObject({
    executor: RunContinuationExecutorSchema,
    supported_fold_profiles: z.array(z.enum(RUN_HEAD_FOLD_PROFILES)).min(1),
    supported_record_catalogues: z.array(hash).min(1),
    available_bindings: z.array(RunContinuationBindingRequirementSchema).max(10_000),
});
/** Transport-authenticated authority supplied beside, never inside, a continuation request. */
export const RunContinuationAuthoritySchema = z.strictObject({
    principal: z.string().min(1).max(512),
    scopes: z.tuple([z.literal('operator:restore'), z.literal('run:resume')]),
    scope_epoch: z.number().int().positive(),
});
/** One deployment-owned claim against the source capsule's continuation authority. */
export const RunContinuationFenceClaimSchema = z.strictObject({
    run_id: runId,
    source_capsule_ref: hash,
    destination_ref: hash,
    executor_ref: hash,
    idempotency_key: z.string().min(1).max(256),
    request_fingerprint: hash,
});
/** The durable authority answer. Repeated means this exact destination already owns the frontier. */
export const RunContinuationFenceReceiptSchema = z.strictObject({
    claim_ref: hash,
    source_capsule_ref: hash,
    destination_ref: hash,
    executor_ref: hash,
    request_fingerprint: hash,
    claimed_at: z.string().datetime(),
    repeated: z.boolean(),
});
export const RunContinuationAdmissionRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    declaration: RunContinuationDeclarationSchema,
});
export const RunContinuationCompatibilityCheckSchema = z.strictObject({
    kind: z.enum(RUN_CONTINUATION_CHECK_KINDS),
    status: z.enum(RUN_CONTINUATION_CHECK_STATUSES),
    message: z.string().min(1).max(2_000),
});
/** Pure compatibility says what blocks a claim without calling a model or tool. */
export const RunContinuationCompatibilityReportSchema = z.strictObject({
    schema: z.literal('zero-ar-run-continuation-compatibility/1'),
    run_id: runId,
    capsule_ref: hash,
    executor_ref: hash,
    compatible: z.boolean(),
    checks: z.array(RunContinuationCompatibilityCheckSchema).length(RUN_CONTINUATION_CHECK_KINDS.length),
    missing_bindings: z.array(RunContinuationBindingRequirementSchema),
});
export const RunContinuationAcceptedSchema = z.strictObject({
    run_id: runId,
    accepted: z.literal(true),
    repeated: z.boolean(),
    accepted_seq: z.number().int().positive(),
    capsule: RunContinuationCapsuleSchema,
    compatibility: RunContinuationCompatibilityReportSchema,
});
