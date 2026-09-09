/**
 * Public contracts for the optional cross-run memory service.
 *
 * Assertions carry cited support, valid time, classification, transaction
 * time and explicit state. Run-owned reads report watermarks and degrade to
 * session scope when the optional service is missing or stale (MEM-001
 * through MEM-010, XCV-016).
 */
import { z } from 'zod';
import { CitationSchema } from "./claims.js";
import { MEMORY_CLASSIFICATIONS } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const timestamp = z.string().datetime({ offset: true });
export const MemoryAssertionInputSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    predicate: z.string().min(1).max(256),
    object: z.string().min(1).max(10_000),
    writer: z.string().min(1).max(256),
    valid_from: timestamp,
    valid_to: timestamp.nullable().optional(),
    supports: z.array(CitationSchema).min(1).max(1_000),
});
export const MemoryAssertionSchema = z.strictObject({
    assertion_id: hash,
    subject: z.string(),
    predicate: z.string(),
    object: z.string(),
    writer: z.string(),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    valid_from: timestamp,
    valid_to: timestamp.nullable(),
    recorded_at: timestamp,
    state: z.enum(['proposed', 'established', 'superseded', 'support-dead']),
    superseded_by: hash.nullable(),
    support_ids: z.array(hash),
    live_supports: z.number().int().nonnegative(),
    meaning: z.literal('established-means-live-support-only').nullable(),
});
export const MemoryWatermarkSchema = z.strictObject({ sequence: z.number().int().nonnegative(), at: timestamp.nullable() });
export const MemoryReadRequestSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    predicate: z.string().min(1).max(256),
    valid_at: timestamp,
    minimum_watermark: z.number().int().nonnegative().optional(),
});
export const MemoryReadResponseSchema = z.strictObject({
    subject: z.string(),
    predicate: z.string(),
    valid_at: timestamp,
    current: z.array(MemoryAssertionSchema),
    conflicts: z.array(z.strictObject({ conflict_id: hash, assertion_ids: z.array(hash).min(2) })),
    unique_live_supports: z.number().int().nonnegative(),
    watermark: MemoryWatermarkSchema,
});
export const MemoryWriteOutcomeSchema = z.strictObject({
    assertion_id: hash,
    supports_recorded: z.number().int().nonnegative(),
    watermark: MemoryWatermarkSchema,
});
export const MemorySupersedeRequestSchema = z.strictObject({ replacement: MemoryAssertionInputSchema });
export const MemorySupersedeOutcomeSchema = z.strictObject({
    superseded_assertion_id: hash,
    replacement_assertion_id: hash,
    watermark: MemoryWatermarkSchema,
});
export const MemoryHistoryRequestSchema = z.strictObject({ subject: z.string().min(1).max(256), predicate: z.string().min(1).max(256) });
export const MemoryHistoryResponseSchema = z.strictObject({
    subject: z.string(),
    predicate: z.string(),
    erased: z.boolean(),
    assertions: z.array(MemoryAssertionSchema),
    redacted_records: z.array(z.strictObject({ kind: z.enum(['assertion.admitted', 'assertion.superseded', 'subject.erased']), assertion_id: hash.nullable(), at: timestamp })),
    watermark: MemoryWatermarkSchema,
});
export const MemorySubjectErasureRequestSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    by: z.string().min(1).max(256),
    reason: z.string().min(1).max(1_000),
});
export const MemorySubjectErasureOutcomeSchema = z.strictObject({ subject_ref: hash, erased: z.boolean(), records_redacted: z.number().int().nonnegative() });
export const RunMemoryReadOutcomeSchema = z.strictObject({
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    query_ref: hash,
    scope: z.enum(['cross-run', 'session']),
    status: z.enum(['available', 'stale', 'unavailable']),
    reason: z.string().nullable(),
    read: MemoryReadResponseSchema.nullable(),
});
