import { z } from 'zod';
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
        expired: "expired";
        approved: "approved";
        refused: "refused";
    }>;
    reason: z.ZodString;
    recorded_at: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalRecorded = z.infer<typeof EffectApprovalRecordedSchema>;
export declare const EffectAuthorityDecisionCommandSchema: z.ZodObject<{
    reason: z.ZodString;
    target: z.ZodString;
    run_id: z.ZodString;
    tenant: z.ZodString;
    effect_id: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    idempotency_key: z.ZodString;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    expires_at: z.ZodString;
    request_fingerprint: z.ZodString;
    application_principal: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    grant_ref: z.ZodString;
    scope: z.ZodLiteral<"effect:approve">;
    scope_epoch: z.ZodNumber;
}, z.core.$strict>;
export type EffectAuthorityDecisionCommand = z.infer<typeof EffectAuthorityDecisionCommandSchema>;
export declare const EffectAuthorityDecisionLookupSchema: z.ZodObject<{
    tenant: z.ZodString;
    run_id: z.ZodString;
    effect_id: z.ZodString;
}, z.core.$strict>;
export type EffectAuthorityDecisionLookup = z.infer<typeof EffectAuthorityDecisionLookupSchema>;
export declare function effectApprovalRequestFingerprint(command: Omit<EffectAuthorityDecisionCommand, 'request_fingerprint'>): string;
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
export declare const EffectApprovalAcceptedSchema: z.ZodObject<{
    run_id: z.ZodString;
    effect_id: z.ZodString;
    decision_id: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    disposition: z.ZodEnum<{
        expired: "expired";
        approved: "approved";
        refused: "refused";
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
