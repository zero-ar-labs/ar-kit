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
import { MEMORY_AVAILABILITY_MODES, MEMORY_CLASSIFICATIONS, MEMORY_READ_MODES, MEMORY_WRITE_MODES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const timestamp = z.string().datetime({ offset: true });
const name = z.string().regex(/^[a-z][a-z0-9-]{0,62}$/, 'expected a lowercase name');
/** The publication-owned policy that makes one narrow memory subject available to a run. */
export const MemoryBindingSchema = z.strictObject({
    name,
    subject: z.strictObject({
        from_intake: name,
        namespace: name,
    }),
    predicates: z.array(name).min(1).max(200).superRefine((values, context) => {
        if (new Set(values).size !== values.length)
            context.addIssue({ code: 'custom', message: 'memory binding predicates must be unique' });
    }),
    read: z.enum(MEMORY_READ_MODES),
    write: z.enum(MEMORY_WRITE_MODES),
    availability: z.enum(MEMORY_AVAILABILITY_MODES),
    classification_ceiling: z.enum(MEMORY_CLASSIFICATIONS).default('internal'),
    maximum_assertions_per_read: z.number().int().min(1).max(200).default(50),
});
/** One published binding resolved against authenticated intake and pinned into run identity. */
export const ResolvedMemoryBindingSchema = MemoryBindingSchema.extend({
    binding_ref: hash,
    tenant: z.string().min(1).max(128),
    subject: MemoryBindingSchema.shape.subject.extend({
        /** The runtime, never the model, derives this exact namespaced subject. */
        resolved: z.string().min(1).max(512),
    }),
});
/** The bounded model request. Tenant and subject are absent by construction (MSH-003). */
export const ModelMemoryReadRequestSchema = z.strictObject({
    binding: name,
    predicate: name,
    valid_at: timestamp,
    minimum_watermark: z.number().int().nonnegative().optional(),
});
/** A run-owned proposal. Its cited spans must resolve through the current run before admission. */
export const ModelMemoryProposalSchema = z.strictObject({
    binding: name,
    predicate: name,
    object: z.string().min(1).max(10_000),
    valid_from: timestamp,
    valid_to: timestamp.nullable().optional(),
    supports: z.array(CitationSchema).min(1).max(1_000),
});
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
/** Exact model-visible memory bytes before subject-key sealing and artifact storage. */
export const MemoryReadEnvelopeSchema = z.strictObject({
    schema: z.literal('zero-ar-memory-read-envelope/1'),
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    binding_ref: hash,
    query_ref: hash,
    subject_ref: hash,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    read: MemoryReadResponseSchema,
    created_at: timestamp,
});
/** Subject-key-sealed bytes stored by the artifact backend for one exact read envelope. */
export const ProtectedMemoryReadEnvelopeSchema = z.strictObject({
    schema: z.literal('zero-ar-protected-memory-read-envelope/1'),
    subject_ref: hash,
    content_hash: hash,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    nonce: z.string().min(1),
    ciphertext: z.string().min(1),
    tag: z.string().min(1),
});
/** One durable key row as stored under a deployment wrapping key. */
export const MemoryWrappedKeySchema = z.strictObject({
    wrapped_key: z.string().min(1).max(1_024),
    nonce: z.string().min(1).max(256),
    tag: z.string().min(1).max(256),
});
/** The encrypted custody rows explicitly permitted to travel with one subject stream. */
export const MemorySubjectKeyMaterialSchema = z.strictObject({
    schema: z.literal('zero-ar-memory-subject-key-material/1'),
    binding_ref: hash,
    index_key: MemoryWrappedKeySchema,
    subject_key: z.strictObject({
        subject_ref: hash,
        state: z.enum(['active', 'erased']),
        wrapped_key: z.string().min(1).max(1_024).nullable(),
        nonce: z.string().min(1).max(256).nullable(),
        tag: z.string().min(1).max(256).nullable(),
    }),
});
/** One content-addressed subject transfer. The subject itself travels only in the authorized request. */
export const MemorySubjectTransferBundleSchema = z.strictObject({
    schema: z.literal('zero-ar-memory-subject-transfer/1'),
    subject_ref: hash,
    stream_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    watermark: MemoryWatermarkSchema,
    record_count: z.number().int().positive(),
    canonical_log_bundle: z.string().min(1).max(12 * 1024 * 1024),
    key_material: MemorySubjectKeyMaterialSchema,
    content_ref: hash,
});
export const MemorySubjectTransferRequestSchema = z.strictObject({ subject: z.string().min(1).max(256) });
export const MemorySubjectImportRequestSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    bundle: MemorySubjectTransferBundleSchema,
});
export const MemorySubjectImportOutcomeSchema = z.strictObject({
    subject_ref: hash,
    stream_id: z.string().regex(/^run_[0-9a-f]{32}$/),
    content_ref: hash,
    watermark: MemoryWatermarkSchema,
    records: z.number().int().positive(),
    erased: z.boolean(),
});
