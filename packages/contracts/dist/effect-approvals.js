import { z } from 'zod';
import { contentHash } from "./ids.js";
import { VerifiedRepresentedActorSchema } from "./external-observations.js";
import { EFFECT_AUTHORITY_DECISIONS, EFFECT_AUTHORITY_DISPOSITIONS, EFFECT_AUTHORITY_INVALIDATION_REASONS, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const effectId = z.string().regex(/^eff_[0-9a-f]{32}$/, 'expected an effect id');
const decisionId = z.string().regex(/^ead_[0-9a-f]{32}$/, 'expected an effect authority decision id');
const epoch = z.number().int().positive();
export const FOLLOW_UP_LIMITS = Object.freeze({ constraints: 16, values: 50, max_uses: 100 });
export const EffectFollowUpGrantSchema = z.strictObject({
    type: z.literal('zero-ar.follow-up'),
    locations: z.array(z.string().min(1).max(128)).length(1),
    actions: z.array(z.string().min(1).max(128)).length(1),
    constraints: z.record(z.string().min(1).max(128), z.array(z.unknown()).min(1).max(FOLLOW_UP_LIMITS.values))
        .refine((constraints) => Object.keys(constraints).length <= FOLLOW_UP_LIMITS.constraints, `a follow-up pins at most ${FOLLOW_UP_LIMITS.constraints} parameters`),
    max_uses: z.number().int().min(1).max(FOLLOW_UP_LIMITS.max_uses),
    expires_at: z.string().datetime(),
});
export function followUpUncovered(grant, action) {
    if (grant.locations[0] !== action.target || grant.actions[0] !== action.operation) {
        return `the follow-up allows ${grant.locations[0]}.${grant.actions[0]}, not ${action.target}.${action.operation}`;
    }
    for (const [name, allowed] of Object.entries(grant.constraints)) {
        const value = action.params[name];
        if (value === undefined)
            return `the follow-up pins ${name}, and the action names none`;
        const permitted = new Set(allowed.map((entry) => contentHash(entry)));
        const values = Array.isArray(value) ? value : [value];
        if (values.length === 0 || values.some((entry) => !permitted.has(contentHash(entry)))) {
            return `the follow-up allows ${name} only as ${allowed.map((entry) => JSON.stringify(entry)).join(', ')}`;
        }
    }
    return null;
}
export function followUpRefusal(grant, approval, approved) {
    if (approval.decision !== 'approve')
        return 'only an approval can issue a follow-up grant';
    if (Date.parse(grant.expires_at) > Date.parse(approval.expires_at)) {
        return `the follow-up expires at ${grant.expires_at}, after the approval it comes with expires at ${approval.expires_at}`;
    }
    const uncovered = followUpUncovered(grant, approved);
    return uncovered ? `the approved action itself falls outside its follow-up: ${uncovered}` : null;
}
export const EffectApprovalRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    target: z.string().min(1).max(128),
    operation: z.string().min(1).max(128),
    param_hash: hash,
    magnitude: z.number().nonnegative().nullable(),
    expires_at: z.string().datetime(),
    decision: z.enum(EFFECT_AUTHORITY_DECISIONS),
    reason: z.string().min(1).max(1_000),
    follow_up: EffectFollowUpGrantSchema.optional(),
});
export const EffectApprovalActorSchema = z.strictObject({
    application_principal: z.string().min(1).max(512),
    approver: VerifiedRepresentedActorSchema,
});
export const EffectApprovalRecordedSchema = z.strictObject({
    decision_id: decisionId,
    idempotency_key: z.string().min(1).max(256),
    request_fingerprint: hash,
    tenant: z.string().min(1).max(128),
    run_id: runId,
    effect_id: effectId,
    target: z.string().min(1).max(128),
    operation: z.string().min(1).max(128),
    param_hash: hash,
    magnitude: z.number().nonnegative().nullable(),
    grant_ref: hash,
    application_principal: z.string().min(1).max(512),
    approver: VerifiedRepresentedActorSchema,
    scope: z.literal('effect:approve'),
    scope_epoch: epoch,
    authority_epoch: epoch,
    expires_at: z.string().datetime(),
    decision: z.enum(EFFECT_AUTHORITY_DECISIONS),
    disposition: z.enum(EFFECT_AUTHORITY_DISPOSITIONS),
    reason: z.string().min(1).max(1_000),
    follow_up: EffectFollowUpGrantSchema.optional(),
    recorded_at: z.string().datetime(),
});
export const EffectAuthorityDecisionCommandSchema = EffectApprovalRecordedSchema.omit({
    decision_id: true,
    authority_epoch: true,
    disposition: true,
    recorded_at: true,
});
export const EffectAuthorityDecisionLookupSchema = z.strictObject({
    tenant: z.string().min(1).max(128),
    run_id: runId,
    effect_id: effectId,
});
export function effectApprovalRequestFingerprint(command) {
    return contentHash(command);
}
export const EffectApprovalInvalidatedSchema = z.strictObject({
    decision_id: decisionId,
    run_id: runId,
    effect_id: effectId,
    reason: z.enum(EFFECT_AUTHORITY_INVALIDATION_REASONS),
    approved_authority_epoch: epoch,
    current_authority_epoch: epoch,
    approved_scope_epoch: epoch,
    current_scope_epoch: epoch,
    invalidated_at: z.string().datetime(),
});
export const EffectApprovalAcceptedSchema = z.strictObject({
    run_id: runId,
    effect_id: effectId,
    decision_id: decisionId,
    decision: z.enum(EFFECT_AUTHORITY_DECISIONS),
    disposition: z.enum(EFFECT_AUTHORITY_DISPOSITIONS),
    application_principal: z.string().min(1).max(512),
    approver: VerifiedRepresentedActorSchema,
    scope_epoch: epoch,
    authority_epoch: epoch,
    expires_at: z.string().datetime(),
    recorded_at: z.string().datetime(),
});
