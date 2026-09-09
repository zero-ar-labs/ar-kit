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
import { canonicalJson } from "./canonical.js";
import { CitationSchema } from "./claims.js";
import { RECEIPT_ASSURANCES, RECEIPT_OUTCOMES } from "./vocab.js";
const effectId = z.string().regex(/^eff_[0-9a-f]{32}$/, 'expected an eff id');
const sha = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
/** What would change, stated fully before dispatch (EFX-001, EFX-002). */
export const EffectDescriptorSchema = z.strictObject({
    effect_id: effectId,
    target: z.string().min(1).max(128),
    operation: z.string().min(1).max(128),
    params: z.record(z.string(), z.unknown()),
    param_hash: sha,
    /** Money, rows, recipients; null where magnitude has no meaning. */
    magnitude: z.number().nonnegative().nullable(),
    /** Stable across redispatch, so the owner can answer a retry (EFX-007). */
    idempotency_key: z.string().min(1).max(200),
    natural_reference: z.string().max(256).nullable(),
    /** Asserted preconditions. Dispatch refuses while any is unresolved (EFX-003). */
    evidence_spans: z.array(CitationSchema).max(100),
    reversibility: z.strictObject({
        reversible: z.boolean(),
        /** What a reversal cannot undo. Compensation is not erasure (E-9). */
        residual_consequences: z.array(z.string().max(500)).max(20),
    }),
    /** A compensating effect names the effect it reverses (EFX-009). */
    reverses: effectId.nullable(),
});
/** The evidence an effect occurred, and who vouched for it (EFX-006, EFX-019). */
export const ReceiptSchema = z.strictObject({
    effect_id: effectId,
    target: z.string().min(1),
    operation: z.string().min(1),
    param_hash: sha,
    idempotency_key: z.string().min(1),
    outcome: z.enum(RECEIPT_OUTCOMES),
    /** Raw owner response bytes or identifier, as returned (EFX-018). */
    owner_response: z.string().max(4_096),
    assurance: z.enum(RECEIPT_ASSURANCES),
    /** The dispatcher's request-and-response attestation when the owner does not sign. */
    attestation: z.string().nullable(),
    target_adapter_version: z.string(),
    /** When the owner applied it and when the record landed (EFX-009). */
    valid_time: z.string(),
    transaction_time: z.string(),
});
/** Immutable authorization for one operation by one identity (EFX-016). */
export const StaticGrantSchema = z.strictObject({
    target: z.string().min(1),
    operation: z.string().min(1),
    /** The full agent identity hash. A changed identity stops matching (EFX-020). */
    agent_ref: sha,
    accountable: z.string().min(1),
    /** The named non-agent approver. An agent has no path to author this (EFX-015). */
    approver: z.string().min(1),
    expires_at: z.string().min(1),
    max_magnitude: z.number().nonnegative().nullable(),
    /** The deployment's attestation over every other field. */
    attestation: z.string().min(1),
});
/** The bytes a receipt attestation or owner signature covers. One serialization for signing and verifying. */
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
/** The bytes a grant attestation covers: every field except the attestation itself. */
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
