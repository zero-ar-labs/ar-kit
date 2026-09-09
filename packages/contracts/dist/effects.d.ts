/**
 * Effect plane shapes: descriptors, receipts, and static grants.
 *
 * What this is: the closed forms behind every consequential mutation. A
 * descriptor states exactly what would change before anything dispatches
 * (EFX-001). A receipt is the only evidence an effect occurred, bound to the
 * effect, the operation, the parameters, and the outcome (EFX-006). A static
 * grant is immutable, content-addressed, expiring authorization for one
 * target operation by one agent identity, approved by a named person and
 * attested by the deployment (EFX-016).
 *
 * How it fits: the dispatcher in @zero-ar/effects enforces these shapes; the
 * kernel routes proposals to it; a generic tool host can author a proposal
 * and nothing else (EFX-017). The binding functions here are the one
 * serialization both signing and verification use.
 */
import { z } from 'zod';
/** What would change, stated fully before dispatch (EFX-001, EFX-002). */
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
/** The evidence an effect occurred, and who vouched for it (EFX-006, EFX-019). */
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
/** Immutable authorization for one operation by one identity (EFX-016). */
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
/** The bytes a receipt attestation or owner signature covers. One serialization for signing and verifying. */
export declare function receiptBinding(receipt: Pick<Receipt, 'effect_id' | 'target' | 'operation' | 'param_hash' | 'idempotency_key' | 'outcome' | 'owner_response'>): string;
/** The bytes a grant attestation covers: every field except the attestation itself. */
export declare function grantBinding(grant: Omit<StaticGrant, 'attestation'>): string;
