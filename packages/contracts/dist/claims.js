import { createHash } from 'node:crypto';
import { z } from 'zod';
import { ARTIFACT_EVIDENCE_REASONS, CLAIM_LABELS, CONTEXT_IMAGE_DELIVERIES, CONTEXT_IMAGE_NOTE_REASONS, EVIDENCE_GRADES, IMAGE_MEDIA_TYPES, MEMORY_CLASSIFICATIONS, } from "./vocab.js";
const spanHashShape = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const mediaTypeShape = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
export const ContextFenceNonceSchema = z.string().regex(/^[0-9a-f]{32}$/, 'expected a 32 hex character fence nonce');
export const CitationSchema = z.strictObject({
    source_id: z.string().min(1).max(256),
    span_hash: spanHashShape,
    locator: z.string().min(1).max(500).optional(),
});
export const CitedSpanSchema = z.strictObject({
    entry_id: z.string().min(1).max(256),
    start: z.number().int().min(0),
    end: z.number().int().min(0),
    span_hash: spanHashShape,
    classification: z.string().min(1).max(64),
    evidence_grade: z.enum(EVIDENCE_GRADES),
});
export const EntryEvidenceSchema = z.strictObject({
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    artifact: z
        .strictObject({
        artifact_ref: artifactHandle,
        content_hash: spanHashShape,
        start: z.number().int().min(0),
        end: z.number().int().min(0),
        required_for_completion: z.boolean(),
        span_hash: spanHashShape.optional(),
    })
        .optional(),
});
export const EntryImageSchema = z.strictObject({
    artifact_ref: artifactHandle,
    content_hash: spanHashShape,
    media_type: z.enum(IMAGE_MEDIA_TYPES),
    bytes: z.number().int().min(1),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
});
export const ENTRY_IMAGE_MAX = 64;
export const ContextImageRecordSchema = EntryImageSchema.extend({
    entry_id: z.string().min(1).max(256),
    delivery: z.enum(CONTEXT_IMAGE_DELIVERIES),
    tokens: z.number().int().min(0),
    reason: z.enum(CONTEXT_IMAGE_NOTE_REASONS).optional(),
});
export const ArtifactContextSpanSchema = CitedSpanSchema.extend({
    artifact_ref: artifactHandle,
    content_hash: spanHashShape,
    media_type: mediaTypeShape,
    fence_nonce: ContextFenceNonceSchema,
});
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
export function spanHash(bytes) {
    return 'sha256:' + createHash('sha256').update(bytes).digest('hex');
}
const ARTIFACT_LOCATOR = /^bytes=(\d+)-(\d+)$/;
export function artifactCitation(artifact_ref, bytes, offset) {
    return { source_id: artifact_ref, span_hash: spanHash(bytes), locator: `bytes=${offset}-${offset + Buffer.byteLength(bytes)}` };
}
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
