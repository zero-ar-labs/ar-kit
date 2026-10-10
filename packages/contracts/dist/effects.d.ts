import { z } from 'zod';
export declare const EffectDescriptorSchema: z.ZodObject<{
    effect_id: z.ZodString;
    target: z.ZodString;
    operation: z.ZodString;
    params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    param_hash: z.ZodString;
    magnitude: z.ZodNullable<z.ZodNumber>;
    idempotency_key: z.ZodString;
    natural_reference: z.ZodNullable<z.ZodString>;
    evidence_spans: z.ZodArray<z.ZodObject<{
        source_id: z.ZodString;
        span_hash: z.ZodString;
        locator: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    reversibility: z.ZodObject<{
        reversible: z.ZodBoolean;
        residual_consequences: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    reverses: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type EffectDescriptor = z.infer<typeof EffectDescriptorSchema>;
export declare const ReceiptSchema: z.ZodObject<{
    effect_id: z.ZodString;
    target: z.ZodString;
    operation: z.ZodString;
    param_hash: z.ZodString;
    idempotency_key: z.ZodString;
    outcome: z.ZodEnum<{
        refused: "refused";
        applied: "applied";
        already_applied: "already_applied";
    }>;
    owner_response: z.ZodString;
    assurance: z.ZodEnum<{
        "owner-signed": "owner-signed";
        "authenticated-response": "authenticated-response";
        "authenticated-reconciliation": "authenticated-reconciliation";
    }>;
    attestation: z.ZodNullable<z.ZodString>;
    target_adapter_version: z.ZodString;
    valid_time: z.ZodString;
    transaction_time: z.ZodString;
}, z.core.$strict>;
export type Receipt = z.infer<typeof ReceiptSchema>;
export declare const StaticGrantSchema: z.ZodObject<{
    target: z.ZodString;
    operation: z.ZodString;
    agent_ref: z.ZodString;
    accountable: z.ZodString;
    approver: z.ZodString;
    expires_at: z.ZodString;
    max_magnitude: z.ZodNullable<z.ZodNumber>;
    attestation: z.ZodString;
}, z.core.$strict>;
export type StaticGrant = z.infer<typeof StaticGrantSchema>;
export declare function receiptBinding(receipt: Pick<Receipt, 'effect_id' | 'target' | 'operation' | 'param_hash' | 'idempotency_key' | 'outcome' | 'owner_response'>): string;
export declare function receiptBindingMismatch(receipt: Pick<Receipt, 'effect_id' | 'target' | 'operation' | 'param_hash' | 'idempotency_key'>, descriptor: Pick<EffectDescriptor, 'effect_id' | 'target' | 'operation' | 'param_hash' | 'idempotency_key'>): 'effect_id' | 'target' | 'operation' | 'param_hash' | 'idempotency_key' | null;
export declare function grantBinding(grant: Omit<StaticGrant, 'attestation'>): string;
