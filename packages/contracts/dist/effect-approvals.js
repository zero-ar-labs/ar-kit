/**
 * Exact effect-approval contracts.
 *
 * What this is: one bounded product decision for one already prepared effect.
 * The caller repeats the visible descriptor fields, while the server derives
 * the application, approver, scope epoch, authority epoch, and grant binding.
 *
 * How it fits: the authority service records the decision before the Effect
 * Plane may dispatch. A decision cannot edit a grant, mint an attestation, or
 * authorize a different effect.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { VerifiedRepresentedActorSchema } from "./external-observations.js";
import { EFFECT_AUTHORITY_DECISIONS, EFFECT_AUTHORITY_DISPOSITIONS, EFFECT_AUTHORITY_INVALIDATION_REASONS, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const effectId = z.string().regex(/^eff_[0-9a-f]{32}$/, 'expected an effect id');
const decisionId = z.string().regex(/^ead_[0-9a-f]{32}$/, 'expected an effect authority decision id');
const epoch = z.number().int().positive();
/** Caller-owned meaning. Run, effect, identity, and epochs come from the route and deployment. */
export const EffectApprovalRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    target: z.string().min(1).max(128),
    operation: z.string().min(1).max(128),
    param_hash: hash,
    magnitude: z.number().nonnegative().nullable(),
    expires_at: z.string().datetime(),
    decision: z.enum(EFFECT_AUTHORITY_DECISIONS),
    reason: z.string().min(1).max(1_000),
});
/** Authenticated identities derived outside the body. */
export const EffectApprovalActorSchema = z.strictObject({
    application_principal: z.string().min(1).max(512),
    approver: VerifiedRepresentedActorSchema,
});
/** The canonical authority decision, including every server-owned binding. */
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
    recorded_at: z.string().datetime(),
});
/** Internal command sent from the Effect Plane to the deployment-owned authority service. */
export const EffectAuthorityDecisionCommandSchema = EffectApprovalRecordedSchema.omit({
    decision_id: true,
    authority_epoch: true,
    disposition: true,
    recorded_at: true,
});
/** The smallest lookup that can retrieve one effect's latest authority decision. */
export const EffectAuthorityDecisionLookupSchema = z.strictObject({
    tenant: z.string().min(1).max(128),
    run_id: runId,
    effect_id: effectId,
});
/** One canonical hash for caller meaning plus every authority binding. */
export function effectApprovalRequestFingerprint(command) {
    return contentHash(command);
}
/** A once-current approval that no longer satisfies the dispatch boundary. */
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
/** Stable public result returned for the first decision and every exact retry. */
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
