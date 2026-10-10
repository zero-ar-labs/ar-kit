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
export const RunContinuationDeclarationSchema = z.strictObject({
    executor: RunContinuationExecutorSchema,
    supported_fold_profiles: z.array(z.enum(RUN_HEAD_FOLD_PROFILES)).min(1),
    supported_record_catalogues: z.array(hash).min(1),
    available_bindings: z.array(RunContinuationBindingRequirementSchema).max(10_000),
});
export const RunContinuationAuthoritySchema = z.strictObject({
    principal: z.string().min(1).max(512),
    scopes: z.tuple([z.literal('operator:restore'), z.literal('run:resume')]),
    scope_epoch: z.number().int().positive(),
});
export const RunContinuationFenceClaimSchema = z.strictObject({
    run_id: runId,
    source_capsule_ref: hash,
    destination_ref: hash,
    executor_ref: hash,
    idempotency_key: z.string().min(1).max(256),
    request_fingerprint: hash,
});
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
export const RunHandoffDocumentSchema = z.strictObject({
    schema: z.literal('zero-ar-run-handoff/1'),
    run_id: runId,
    destination_ref: hash,
    frontier: RunContinuationFrontierSchema,
    issued_at: z.string().datetime(),
});
export const RunHandoffSignatureSchema = z.strictObject({
    key_id: z.string().min(1).max(256),
    signing_key_ref: hash,
    public_key_pem: z.string().min(1).max(4_096),
    signature: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/, 'expected base64').max(512),
});
export const RunHandoffRecordedSchema = z.strictObject({
    handoff: RunHandoffDocumentSchema,
    signer: RunHandoffSignatureSchema,
    idempotency_key: z.string().min(1).max(256),
});
export const RunHandoffRequestSchema = z.strictObject({
    destination_ref: hash,
    idempotency_key: z.string().min(1).max(256),
});
export const RunHandoffReceiptSchema = z.strictObject({
    run_id: runId,
    destination_ref: hash,
    handoff_ref: hash,
    recorded_seq: z.number().int().positive(),
    signing_key_ref: hash,
    repeated: z.boolean(),
});
export const RunContinuationDestinationIdentitySchema = z.strictObject({
    schema: z.literal('zero-ar-run-continuation-destination/1'),
    destination_ref: hash,
    executor_ref: hash,
    authority_ref: hash,
    handoff_signing: z.boolean(),
});
export function trustHandoffKeyIn(pins, input) {
    const read = (key) => (pins instanceof Map ? pins.get(key) : pins[key]);
    const pinned = read(input.key_id);
    if (pinned !== undefined)
        return { trust: { trusted: pinned === input.signing_key_ref, first_use: false, pinned_ref: pinned }, pinned_now: false };
    if (input.commit) {
        if (pins instanceof Map)
            pins.set(input.key_id, input.signing_key_ref);
        else
            pins[input.key_id] = input.signing_key_ref;
    }
    return { trust: { trusted: true, first_use: true, pinned_ref: null }, pinned_now: input.commit };
}
