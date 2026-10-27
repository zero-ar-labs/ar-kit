import { z } from 'zod';
export declare const EffectTargetListSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        absent: "absent";
        "dynamic-authority": "dynamic-authority";
        "restricted-attachment": "restricted-attachment";
    }>;
    targets: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        version: z.ZodString;
        operations: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EffectTargetList = z.infer<typeof EffectTargetListSchema>;
export declare const EffectGrantReissueRequestSchema: z.ZodObject<{
    superseded_grant_ref: z.ZodString;
    prior_run_id: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type EffectGrantReissueRequest = z.infer<typeof EffectGrantReissueRequestSchema>;
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
        pre_approved_within_cap: z.ZodOptional<z.ZodLiteral<true>>;
        attestation: z.ZodString;
    }, z.core.$strict>;
    identity_diff: z.ZodArray<z.ZodString>;
    approver: z.ZodString;
}, z.core.$strict>;
export type EffectGrantReissueOutcome = z.infer<typeof EffectGrantReissueOutcomeSchema>;
