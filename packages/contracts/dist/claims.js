/**
 * The structured claim representation and the evidence facts spans carry.
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
import { ARTIFACT_EVIDENCE_REASONS, CLAIM_LABELS, EVIDENCE_GRADES, MEMORY_CLASSIFICATIONS } from "./vocab.js";
const spanHashShape = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const mediaTypeShape = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
/** The per-run artifact fence nonce: 128 random bits, minted at intake and outside identity. */
export const ContextFenceNonceSchema = z.string().regex(/^[0-9a-f]{32}$/, 'expected a 32 hex character fence nonce');
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
/**
 * The evidence facts an entry carries beside its text, so the content hash
 * covers them and forks and exports copy them (CTX-002, CTX-008). An entry
 * that reads an artifact names the handle and range instead of the bytes.
 */
export const EntryEvidenceSchema = z.strictObject({
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    artifact: z
        .strictObject({
        artifact_ref: artifactHandle,
        content_hash: spanHashShape,
        start: z.number().int().min(0),
        end: z.number().int().min(0),
        /**
         * Whether a window that cannot read this range back may block
         * completion by itself. The runtime records false: the completion
         * gate decides which pinned and cited evidence is required (A-2).
         */
        required_for_completion: z.boolean(),
        /** The span hash of the range as it was read, so bytes read back later that differ are changed evidence. */
        span_hash: spanHashShape.optional(),
    })
        .optional(),
});
/** One artifact range placed in a context window behind the run's fence nonce (CTX-007). */
export const ArtifactContextSpanSchema = CitedSpanSchema.extend({
    artifact_ref: artifactHandle,
    content_hash: spanHashShape,
    media_type: mediaTypeShape,
    fence_nonce: ContextFenceNonceSchema,
});
/** Cited artifact evidence that could not stand, and whether it blocks verified completion (QLT-031). */
export const ArtifactEvidenceBlockerSchema = z.strictObject({
    entry_id: z.string().min(1).max(256),
    artifact_ref: artifactHandle,
    reason: z.enum(ARTIFACT_EVIDENCE_REASONS),
    blocks_verified_completion: z.boolean(),
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
/** The locator grammar an artifact-backed citation carries: exact byte offsets into one artifact. */
const ARTIFACT_LOCATOR = /^bytes=(\d+)-(\d+)$/;
/**
 * Name the exact slice of an artifact a claim leans on. The hash still
 * decides; the locator only says where to look. artifact.read returns one
 * for the range it read, because a model cannot compute sha256 itself.
 */
export function artifactCitation(artifact_ref, bytes, offset) {
    return { source_id: artifact_ref, span_hash: spanHash(bytes), locator: `bytes=${offset}-${offset + Buffer.byteLength(bytes)}` };
}
/** The byte range an artifact citation locator names, or null when it names none. */
export function parseArtifactLocator(locator) {
    const match = locator?.match(ARTIFACT_LOCATOR);
    if (!match)
        return null;
    const offset = Number(match[1]);
    const end = Number(match[2]);
    if (!Number.isInteger(offset) || !Number.isInteger(end) || end < offset)
        return null;
    return { offset, length: end - offset };
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
