import { z } from 'zod';
import { canonicalJson } from "./canonical.js";
import { CitationSchema } from "./claims.js";
import { RECEIPT_ASSURANCES, RECEIPT_OUTCOMES } from "./vocab.js";
const effectId = z.string().regex(/^eff_[0-9a-f]{32}$/, 'expected an eff id');
const sha = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
export const EffectDescriptorSchema = z.strictObject({
    effect_id: effectId,
    target: z.string().min(1).max(128),
    operation: z.string().min(1).max(128),
    params: z.record(z.string(), z.unknown()),
    param_hash: sha,
    magnitude: z.number().nonnegative().nullable(),
    idempotency_key: z.string().min(1).max(200),
    natural_reference: z.string().max(256).nullable(),
    evidence_spans: z.array(CitationSchema).max(100),
    reversibility: z.strictObject({
        reversible: z.boolean(),
        residual_consequences: z.array(z.string().max(500)).max(20),
    }),
    reverses: effectId.nullable(),
});
export const ReceiptSchema = z.strictObject({
    effect_id: effectId,
    target: z.string().min(1),
    operation: z.string().min(1),
    param_hash: sha,
    idempotency_key: z.string().min(1),
    outcome: z.enum(RECEIPT_OUTCOMES),
    owner_response: z.string().max(4_096),
    assurance: z.enum(RECEIPT_ASSURANCES),
    attestation: z.string().nullable(),
    target_adapter_version: z.string(),
    valid_time: z.string(),
    transaction_time: z.string(),
});
export const StaticGrantSchema = z.strictObject({
    target: z.string().min(1),
    operation: z.string().min(1),
    agent_ref: sha,
    accountable: z.string().min(1),
    approver: z.string().min(1),
    expires_at: z.string().datetime(),
    max_magnitude: z.number().nonnegative().nullable(),
    attestation: z.string().min(1),
});
export function receiptBinding(receipt) {
    return canonicalJson({
        effect_id: receipt.effect_id,
        target: receipt.target,
        operation: receipt.operation,
        param_hash: receipt.param_hash,
        idempotency_key: receipt.idempotency_key,
        outcome: receipt.outcome,
        owner_response: receipt.owner_response,
    });
}
export function receiptBindingMismatch(receipt, descriptor) {
    for (const field of ['effect_id', 'target', 'operation', 'param_hash', 'idempotency_key']) {
        if (receipt[field] !== descriptor[field])
            return field;
    }
    return null;
}
export function grantBinding(grant) {
    return canonicalJson({
        target: grant.target,
        operation: grant.operation,
        agent_ref: grant.agent_ref,
        accountable: grant.accountable,
        approver: grant.approver,
        expires_at: grant.expires_at,
        max_magnitude: grant.max_magnitude,
    });
}
