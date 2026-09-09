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
/** Caller-owned meaning. Run, effect, identity, and epochs come from the route and deployment. */
export declare const EffectApprovalRequestSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    target: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    expires_at: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    reason: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalRequest = z.infer<typeof EffectApprovalRequestSchema>;
/** Authenticated identities derived outside the body. */
export declare const EffectApprovalActorSchema: z.ZodObject<{
    application_principal: z.ZodString;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type EffectApprovalActor = z.infer<typeof EffectApprovalActorSchema>;
/** The canonical authority decision, including every server-owned binding. */
export declare const EffectApprovalRecordedSchema: z.ZodObject<{
    decision_id: z.ZodString;
    idempotency_key: z.ZodString;
    request_fingerprint: z.ZodString;
    tenant: z.ZodString;
    run_id: z.ZodString;
    effect_id: z.ZodString;
    target: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    grant_ref: z.ZodString;
    application_principal: z.ZodString;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    scope: z.ZodLiteral<"effect:approve">;
    scope_epoch: z.ZodNumber;
    authority_epoch: z.ZodNumber;
    expires_at: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    disposition: z.ZodEnum<{
        approved: "approved";
        refused: "refused";
        expired: "expired";
    }>;
    reason: z.ZodString;
    recorded_at: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalRecorded = z.infer<typeof EffectApprovalRecordedSchema>;
/** Internal command sent from the Effect Plane to the deployment-owned authority service. */
export declare const EffectAuthorityDecisionCommandSchema: z.ZodObject<{
    reason: z.ZodString;
    idempotency_key: z.ZodString;
    request_fingerprint: z.ZodString;
    application_principal: z.ZodString;
    run_id: z.ZodString;
    target: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    expires_at: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    tenant: z.ZodString;
    effect_id: z.ZodString;
    grant_ref: z.ZodString;
    scope: z.ZodLiteral<"effect:approve">;
    scope_epoch: z.ZodNumber;
}, z.core.$strict>;
export type EffectAuthorityDecisionCommand = z.infer<typeof EffectAuthorityDecisionCommandSchema>;
/** The smallest lookup that can retrieve one effect's latest authority decision. */
export declare const EffectAuthorityDecisionLookupSchema: z.ZodObject<{
    tenant: z.ZodString;
    run_id: z.ZodString;
    effect_id: z.ZodString;
}, z.core.$strict>;
export type EffectAuthorityDecisionLookup = z.infer<typeof EffectAuthorityDecisionLookupSchema>;
/** One canonical hash for caller meaning plus every authority binding. */
export declare function effectApprovalRequestFingerprint(command: Omit<EffectAuthorityDecisionCommand, 'request_fingerprint'>): string;
/** A once-current approval that no longer satisfies the dispatch boundary. */
export declare const EffectApprovalInvalidatedSchema: z.ZodObject<{
    decision_id: z.ZodString;
    run_id: z.ZodString;
    effect_id: z.ZodString;
    reason: z.ZodEnum<{
        expired: "expired";
        "authority-epoch-changed": "authority-epoch-changed";
        "scope-epoch-changed": "scope-epoch-changed";
    }>;
    approved_authority_epoch: z.ZodNumber;
    current_authority_epoch: z.ZodNumber;
    approved_scope_epoch: z.ZodNumber;
    current_scope_epoch: z.ZodNumber;
    invalidated_at: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalInvalidated = z.infer<typeof EffectApprovalInvalidatedSchema>;
/** Stable public result returned for the first decision and every exact retry. */
export declare const EffectApprovalAcceptedSchema: z.ZodObject<{
    run_id: z.ZodString;
    effect_id: z.ZodString;
    decision_id: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    disposition: z.ZodEnum<{
        approved: "approved";
        refused: "refused";
        expired: "expired";
    }>;
    application_principal: z.ZodString;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    scope_epoch: z.ZodNumber;
    authority_epoch: z.ZodNumber;
    expires_at: z.ZodString;
    recorded_at: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalAccepted = z.infer<typeof EffectApprovalAcceptedSchema>;
