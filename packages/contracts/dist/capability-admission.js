/**
 * Dynamic governed capability admission contracts (DCA0-DCA2).
 *
 * A request asks to amend one run's immutable capability closure. It grants
 * nothing. Classification binds inspected, content-addressed publication
 * bytes to a complete consequence diff. Approval binds that exact plan, and
 * a later safe-boundary activation changes only future work in the same run.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { CAPABILITY_ADMISSION_CLASSES, CAPABILITY_ADMISSION_DECISIONS, CAPABILITY_ADMISSION_KINDS, CAPABILITY_ADMISSION_STATUSES, CAPABILITY_INVALIDATION_STRATEGIES, CAPABILITY_NEXT_ACTIONS, CAPABILITY_PACKAGE_KINDS, ROUTE_SCOPES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const capabilityId = z.string().regex(/^cap_[0-9a-f]{32}$/, 'expected a capability admission id');
const count = z.number().int().nonnegative();
const epoch = z.number().int().min(1);
const boundedHashes = z.array(hash).max(256);
export const CapabilityAdmissionRequestSchema = z.strictObject({
    kind: z.enum(CAPABILITY_ADMISSION_KINDS).default('add'),
    /** Exact tenant publication ref. Host paths, URLs and aliases never enter the log. */
    candidate_locator: hash,
    expected_content_hash: hash.optional(),
    declared_package_kind: z.enum(CAPABILITY_PACKAGE_KINDS),
    requested_capabilities: z.array(z.string().min(1).max(256)).max(128).default([]),
    reason: z.string().min(1).max(2_000),
    requested_activation_mode: z.literal('next-safe-boundary').default('next-safe-boundary'),
    /** Optional optimistic guard for callers that already inspected the run. */
    expected_active_epoch: epoch.optional(),
    idempotency_key: z.string().min(1).max(256),
});
export const CapabilityAdmissionDecisionRequestSchema = z.strictObject({
    decision: z.enum(CAPABILITY_ADMISSION_DECISIONS),
    expected_plan_ref: hash,
    reason: z.string().min(1).max(2_000),
    idempotency_key: z.string().min(1).max(256),
});
export const CapabilityAdmissionCancellationRequestSchema = z.strictObject({
    reason: z.string().min(1).max(2_000),
    idempotency_key: z.string().min(1).max(256),
});
export const CapabilityConsequenceDiffSchema = z.strictObject({
    schema: z.literal('capability-consequence-diff/1'),
    procedures: z.strictObject({ added: boundedHashes, removed: boundedHashes }),
    tools: z.strictObject({
        added: boundedHashes,
        removed: boundedHashes,
        required_existing: z.array(z.strictObject({
            name: z.string().min(1).max(256),
            contract_ref: hash,
            binding_ref: hash.nullable(),
            operation_class: z.literal('observation'),
        })).max(256),
    }),
    executable_refs: boundedHashes,
    dependency_refs: boundedHashes,
    filesystem_expansions: z.array(z.string().min(1).max(512)).max(256),
    egress_expansions: z.array(z.string().min(1).max(512)).max(256),
    credential_expansions: z.array(z.string().min(1).max(512)).max(256),
    destination_expansions: z.array(z.string().min(1).max(512)).max(256),
    effect_classes: z.array(z.string().min(1).max(256)).max(256),
    budget: z.strictObject({ bytes: count, compute_ms: count, attention: count }),
});
export const CapabilityAdmissionBlockerSchema = z.strictObject({
    code: z.string().min(1).max(160),
    message: z.string().min(1).max(2_000),
    required_phase: z.enum(['DCA2', 'DCA3', 'DCA4', 'DCA5']).nullable(),
});
export const CapabilityNextActionSchema = z.strictObject({
    action: z.enum(CAPABILITY_NEXT_ACTIONS),
    required_scope: z.enum(ROUTE_SCOPES).nullable(),
    reason: z.string().min(1).max(1_000),
});
const CapabilityAdmissionPlanBodySchema = z.strictObject({
    schema: z.literal('capability-admission-plan/1'),
    request_id: capabilityId,
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    base_closure_epoch: epoch,
    base_closure_ref: hash,
    resolved_package_ref: hash,
    publication_ref: hash,
    candidate: z.strictObject({
        kind: z.enum(CAPABILITY_PACKAGE_KINDS),
        name: z.string().min(1).max(256),
        version: z.string().min(1).max(128),
        root_ref: hash,
        total_bytes: count,
        resource_count: count,
    }),
    tenant: z.string().min(1).max(256),
    policy_ref: hash,
    policy_epoch: epoch,
    candidate_closure_ref: hash,
    consequence_diff: CapabilityConsequenceDiffSchema,
    consequence_diff_ref: hash,
    admission_classes: z.array(z.enum(CAPABILITY_ADMISSION_CLASSES)).max(CAPABILITY_ADMISSION_CLASSES.length),
    required_environment_profile_ref: hash.nullable(),
    required_budget: z.strictObject({ bytes: count, compute_ms: count, attention: count }),
    required_reviews: z.array(z.string().min(1).max(256)).max(32),
    build_receipt_refs: boundedHashes,
    scan_receipt_refs: boundedHashes,
    compatibility_report_ref: hash,
    invalidation: z.strictObject({ strategy: z.enum(CAPABILITY_INVALIDATION_STRATEGIES), item_ids: z.array(z.string().min(1).max(256)).max(1_000) }),
    status: z.enum(['awaiting-review', 'awaiting-budget', 'awaiting-build', 'refused', 'superseded']),
    blockers: z.array(CapabilityAdmissionBlockerSchema).max(128),
    next_actions: z.array(CapabilityNextActionSchema).max(16),
    expires_at: z.string().datetime().nullable(),
});
export const CapabilityAdmissionPlanSchema = CapabilityAdmissionPlanBodySchema.extend({ plan_ref: hash }).superRefine((value, context) => {
    const { plan_ref: _planRef, ...body } = value;
    if (value.plan_ref !== contentHash(body))
        context.addIssue({ code: 'custom', path: ['plan_ref'], message: 'plan_ref must hash the exact plan body' });
    if (value.consequence_diff_ref !== contentHash(value.consequence_diff))
        context.addIssue({ code: 'custom', path: ['consequence_diff_ref'], message: 'consequence_diff_ref must hash the exact consequence diff' });
    if (value.candidate.root_ref !== value.resolved_package_ref)
        context.addIssue({ code: 'custom', path: ['candidate', 'root_ref'], message: 'candidate root_ref must equal the inspected resolved_package_ref' });
    if (contentHash(value.required_budget) !== contentHash(value.consequence_diff.budget))
        context.addIssue({ code: 'custom', path: ['required_budget'], message: 'required_budget must equal the consequence diff budget' });
});
const CapabilityAdmissionPolicyBodySchema = z.strictObject({
    schema: z.literal('capability-admission-policy/1'),
    tenant: z.string().min(1).max(256),
    epoch,
    auto_approve_context_only: z.union([
        z.literal(false),
        z.strictObject({
            max_bytes: count.max(8 * 1_048_576),
            max_resources: count.max(256),
            max_effective_procedures: count.max(256),
            allow_existing_observation_tools: z.boolean(),
        }),
    ]),
});
export const CapabilityAdmissionPolicySchema = CapabilityAdmissionPolicyBodySchema.extend({ ref: hash }).superRefine((value, context) => {
    const { ref: _ref, ...body } = value;
    if (value.ref !== contentHash(body))
        context.addIssue({ code: 'custom', path: ['ref'], message: 'policy ref must hash the exact policy body' });
});
export const CapabilityAdmissionViewSchema = z.strictObject({
    request_id: capabilityId,
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    tenant: z.string().min(1).max(256),
    request: CapabilityAdmissionRequestSchema,
    requested_by: z.strictObject({
        application_principal: z.string().min(1).max(512),
        represented_principal: z.string().min(1).max(512).nullable(),
        scope: z.enum(ROUTE_SCOPES),
        scope_epoch: epoch,
    }),
    requested_at: z.string().datetime(),
    /** Null only while an exact publication is being resolved and classified. */
    plan: CapabilityAdmissionPlanSchema.nullable(),
    status: z.enum(CAPABILITY_ADMISSION_STATUSES),
    decision: z.enum(CAPABILITY_ADMISSION_DECISIONS).nullable(),
    decision_reason: z.string().nullable(),
    committed_epoch: epoch.nullable(),
    activated_at: z.string().datetime().nullable(),
    waiting_to_activate: z.boolean(),
    pending_successor: z.strictObject({ closure_epoch: epoch, closure_ref: hash, activation_condition: z.literal('next_run_loop_safe_boundary') }).nullable(),
    active_closure_epoch: epoch,
    active_closure_ref: hash,
    next_actions: z.array(CapabilityNextActionSchema).max(16),
});
export const CapabilityAdmissionListSchema = z.strictObject({
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    active_closure_epoch: epoch,
    active_closure_ref: hash,
    admissions: z.array(CapabilityAdmissionViewSchema).max(100),
    next_cursor: capabilityId.nullable(),
});
export const CapabilityAdmissionListRequestSchema = z.strictObject({
    cursor: capabilityId.optional(),
    limit: z.number().int().min(1).max(100).default(20),
});
export const CapabilityAdmissionAcceptedSchema = z.strictObject({
    accepted: z.literal(true),
    repeated: z.boolean(),
    admission: CapabilityAdmissionViewSchema,
});
