import { z } from 'zod';
export declare const FOLLOW_UP_LIMITS: Readonly<{
    constraints: 16;
    values: 50;
    max_uses: 100;
}>;
export declare const EffectFollowUpConstraintSchema: z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodObject<{
    max: z.ZodNumber;
}, z.core.$strict>]>;
export type EffectFollowUpConstraint = z.infer<typeof EffectFollowUpConstraintSchema>;
export declare const EffectFollowUpGrantSchema: z.ZodObject<{
    type: z.ZodLiteral<"zero-ar.follow-up">;
    locations: z.ZodArray<z.ZodString>;
    actions: z.ZodArray<z.ZodString>;
    constraints: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodObject<{
        max: z.ZodNumber;
    }, z.core.$strict>]>>;
    max_uses: z.ZodNumber;
    expires_at: z.ZodString;
}, z.core.$strict>;
export type EffectFollowUpGrant = z.infer<typeof EffectFollowUpGrantSchema>;
export declare function followUpUncovered(grant: EffectFollowUpGrant, action: {
    target: string;
    operation: string;
    params: Record<string, unknown>;
}): string | null;
export declare function followUpRefusal(grant: EffectFollowUpGrant, approval: {
    decision: string;
    expires_at: string;
}, approved: {
    target: string;
    operation: string;
    params: Record<string, unknown>;
}): string | null;
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
    follow_up: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"zero-ar.follow-up">;
        locations: z.ZodArray<z.ZodString>;
        actions: z.ZodArray<z.ZodString>;
        constraints: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodObject<{
            max: z.ZodNumber;
        }, z.core.$strict>]>>;
        max_uses: z.ZodNumber;
        expires_at: z.ZodString;
    }, z.core.$strict>>;
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
    follow_up: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"zero-ar.follow-up">;
        locations: z.ZodArray<z.ZodString>;
        actions: z.ZodArray<z.ZodString>;
        constraints: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodObject<{
            max: z.ZodNumber;
        }, z.core.$strict>]>>;
        max_uses: z.ZodNumber;
        expires_at: z.ZodString;
    }, z.core.$strict>>;
    recorded_at: z.ZodString;
}, z.core.$strict>;
export type EffectApprovalRecorded = z.infer<typeof EffectApprovalRecordedSchema>;
export declare const EffectAuthorityDecisionCommandSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    request_fingerprint: z.ZodString;
    application_principal: z.ZodString;
    run_id: z.ZodString;
    tenant: z.ZodString;
    reason: z.ZodString;
    target: z.ZodString;
    effect_id: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    approver: z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    expires_at: z.ZodString;
    decision: z.ZodEnum<{
        approve: "approve";
        refuse: "refuse";
    }>;
    follow_up: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"zero-ar.follow-up">;
        locations: z.ZodArray<z.ZodString>;
        actions: z.ZodArray<z.ZodString>;
        constraints: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodArray<z.ZodUnknown>, z.ZodObject<{
            max: z.ZodNumber;
        }, z.core.$strict>]>>;
        max_uses: z.ZodNumber;
        expires_at: z.ZodString;
    }, z.core.$strict>>;
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
