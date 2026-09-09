/**
 * The structured claim representation.
 *
 * What this is: the one shape a claim takes when a contract wants
 * evidence-completeness checked. A claim carries its label, its text, and
 * the citations that support it; a citation names a source and the hash of
 * the exact span it leans on. Guarantees about evidence completeness scope
 * to this shape and to nothing else, so prose that asserts support carries
 * no such coverage (CLM-001).
 *
 * How it fits: item outputs and sub-run findings carry claim sets as JSON.
 * The quality plane's grounding check resolves each citation against the
 * application's span store; parseClaimSet is the border where unstructured
 * text is told apart from a claim set, with the reason.
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { CLAIM_LABELS, EVIDENCE_GRADES } from "./vocab.js";
const spanHashShape = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
/** One support: a source and the hash of the exact span cited from it. */
export const CitationSchema = z.strictObject({
    source_id: z.string().min(1).max(256),
    span_hash: spanHashShape,
    /** Where in the source, for a person retracing the span. Optional and unhashed. */
    locator: z.string().min(1).max(500).optional(),
});
/**
 * Selected context material as CTX-002 represents it: the original-byte
 * handle, exact offsets, the content hash of that exact slice, the
 * classification it carries, and how close it stands to its origin.
 */
export const CitedSpanSchema = z.strictObject({
    entry_id: z.string().min(1).max(256),
    start: z.number().int().min(0),
    end: z.number().int().min(0),
    span_hash: spanHashShape,
    classification: z.string().min(1).max(64),
    evidence_grade: z.enum(EVIDENCE_GRADES),
});
export const ClaimSchema = z.strictObject({
    claim_id: z.string().min(1).max(128),
    text: z.string().min(1).max(10_000),
    label: z.enum(CLAIM_LABELS),
    citations: z.array(CitationSchema).max(100),
});
export const ClaimSetSchema = z.strictObject({
    schema: z.literal('claim-set/1'),
    claims: z.array(ClaimSchema).min(1).max(1_000),
});
/** The hash a citation must carry for a span: sha256 over the exact bytes. */
export function spanHash(bytes) {
    return 'sha256:' + createHash('sha256').update(bytes).digest('hex');
}
/**
 * Tell a claim set apart from anything else, with the reason. Output that
 * does not parse here is unstructured, and no evidence-completeness wording
 * applies to it.
 */
export function parseClaimSet(text) {
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        return { ok: false, reason: 'the output is not JSON, so it is prose, not a claim set' };
    }
    const parsed = ClaimSetSchema.safeParse(value);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return { ok: false, reason: `the output is JSON but not a claim-set/1: ${issue?.message ?? 'shape mismatch'}` };
    }
    return { ok: true, set: parsed.data };
}
