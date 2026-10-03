/**
 * Effect authority operator contracts.
 *
 * What this is: the non-agent acts over effect authority: re-issuing a
 * static grant after an identity change, revoking one grant, advancing the
 * authority epoch, and listing the registered effect targets. Each act names
 * a verified operator; no agent output can author one (EFX-015, IDM-024).
 *
 * How it fits: re-issue needs effect:grant and a participant token, revoke
 * needs effect:grant and tenant ownership of the grant, the epoch advance is
 * a platform scope, and the target list is effect:read. A deployment with
 * no dynamic authority refuses each act with a typed diagnostic.
 */
import { z } from 'zod';
import { StaticGrantSchema } from "./effects.js";
import { EFFECT_PLANE_MODES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const count = z.number().int().nonnegative();
const reason = z.string().min(1).max(1_000);
/** Re-issue the grant an earlier run held for this run's changed identity (ECV-012). */
export const EffectGrantReissueRequestSchema = z.strictObject({
    superseded_grant_ref: hash,
    prior_run_id: runId,
    reason,
    idempotency_key: z.string().min(1).max(256),
});
/** The replacement grant with the server-computed identity difference and the verified approver. */
export const EffectGrantReissueOutcomeSchema = z.strictObject({
    run_id: runId,
    superseded_ref: hash,
    replacement_ref: hash,
    replacement_grant: StaticGrantSchema,
    identity_diff: z.array(z.string().min(1).max(300)),
    approver: z.string().min(1).max(256),
});
export const EffectGrantRevocationRequestSchema = z.strictObject({ reason });
export const EffectGrantRevocationOutcomeSchema = z.strictObject({
    grant_ref: hash,
    revoked: z.literal(true),
    authority_epoch: count,
});
export const EffectAuthorityEpochAdvanceRequestSchema = z.strictObject({ reason });
/** Every exact decision recorded before the new epoch stops admitting dispatch (EFX-014). */
export const EffectAuthorityEpochAdvanceOutcomeSchema = z.strictObject({
    previous_epoch: count,
    authority_epoch: count,
});
/** The effect plane this tenant runs under and the targets it can dispatch to. */
export const EffectTargetListSchema = z.strictObject({
    mode: z.enum(EFFECT_PLANE_MODES),
    targets: z.array(z.strictObject({
        target: z.string().min(1).max(128),
        version: z.string().min(1).max(64),
        operations: z.array(z.string().min(1).max(128)).max(256),
    })).max(1_000),
});
