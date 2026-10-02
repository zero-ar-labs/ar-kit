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
/** Re-issue the grant an earlier run held for this run's changed identity (ECV-012). */
export declare const EffectGrantReissueRequestSchema: z.ZodObject<{
    superseded_grant_ref: z.ZodString;
    prior_run_id: z.ZodString;
    reason: z.ZodString;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type EffectGrantReissueRequest = z.infer<typeof EffectGrantReissueRequestSchema>;
/** The replacement grant with the server-computed identity difference and the verified approver. */
export declare const EffectGrantReissueOutcomeSchema: z.ZodObject<{
    run_id: z.ZodString;
    superseded_ref: z.ZodString;
    replacement_ref: z.ZodString;
    replacement_grant: z.ZodObject<{
        target: z.ZodString;
        operation: z.ZodString;
        agent_ref: z.ZodString;
        accountable: z.ZodString;
        approver: z.ZodString;
        expires_at: z.ZodString;
        max_magnitude: z.ZodNullable<z.ZodNumber>;
        attestation: z.ZodString;
    }, z.core.$strict>;
    identity_diff: z.ZodArray<z.ZodString>;
    approver: z.ZodString;
}, z.core.$strict>;
export type EffectGrantReissueOutcome = z.infer<typeof EffectGrantReissueOutcomeSchema>;
export declare const EffectGrantRevocationRequestSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strict>;
export type EffectGrantRevocationRequest = z.infer<typeof EffectGrantRevocationRequestSchema>;
export declare const EffectGrantRevocationOutcomeSchema: z.ZodObject<{
    grant_ref: z.ZodString;
    revoked: z.ZodLiteral<true>;
    authority_epoch: z.ZodNumber;
}, z.core.$strict>;
export type EffectGrantRevocationOutcome = z.infer<typeof EffectGrantRevocationOutcomeSchema>;
export declare const EffectAuthorityEpochAdvanceRequestSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strict>;
export type EffectAuthorityEpochAdvanceRequest = z.infer<typeof EffectAuthorityEpochAdvanceRequestSchema>;
/** Every exact decision recorded before the new epoch stops admitting dispatch (EFX-014). */
export declare const EffectAuthorityEpochAdvanceOutcomeSchema: z.ZodObject<{
    previous_epoch: z.ZodNumber;
    authority_epoch: z.ZodNumber;
}, z.core.$strict>;
export type EffectAuthorityEpochAdvanceOutcome = z.infer<typeof EffectAuthorityEpochAdvanceOutcomeSchema>;
/** The effect plane this tenant runs under and the targets it can dispatch to. */
export declare const EffectTargetListSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        "dynamic-authority": "dynamic-authority";
        absent: "absent";
        "restricted-attachment": "restricted-attachment";
    }>;
    targets: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        version: z.ZodString;
        operations: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EffectTargetList = z.infer<typeof EffectTargetListSchema>;
