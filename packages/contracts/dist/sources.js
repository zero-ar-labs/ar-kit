/**
 * Public source registration, snapshot and run-binding contracts.
 *
 * A source instance is mutable operator configuration. A snapshot,
 * collection, member and binding are separate immutable identities. Runs
 * accept only resolved binding refs, then pin the expanded descriptor.
 */
import { z } from 'zod';
import { EVIDENCE_GRADES, MEMORY_CLASSIFICATIONS } from "./vocab.js";
export const SOURCE_ACCESS_PROFILES = ['local-read-only'];
export const SOURCE_INSTANCE_STATES = ['ready', 'disabled', 'removed'];
export const SOURCE_LOCATOR_KINDS = ['local-directory'];
export const SOURCE_OPERATIONS = ['list', 'stat', 'read', 'search', 'document.extract'];
export const SOURCE_EXTRACTION_METHODS = ['poppler-text', 'tesseract-ocr'];
/** The active profile's fixed classification range. Deployment destinations remain separately configured. */
export const LOCAL_READ_ONLY_SOURCE_POLICY = Object.freeze({
    classification_floor: 'public',
    classification_ceiling: 'internal',
});
/** Compare labels using the one contracts-owned classification ordering. */
export function sourceClassificationAdmitted(classification, floor = LOCAL_READ_ONLY_SOURCE_POLICY.classification_floor, ceiling = LOCAL_READ_ONLY_SOURCE_POLICY.classification_ceiling) {
    const rank = (value) => MEMORY_CLASSIFICATIONS.indexOf(value);
    return rank(classification) >= rank(floor) && rank(classification) <= rank(ceiling);
}
const count = z.number().int().nonnegative();
const positiveCount = z.number().int().positive();
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const mediaType = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
const sourceName = z.string().regex(/^[a-z][a-z0-9-]{0,62}$/, 'expected a lowercase source name');
const sourceAlias = z.string().regex(/^[a-z][a-z0-9-]{0,62}$/, 'expected a lowercase source alias');
const sourceRef = z.string().regex(/^src_[0-9a-f]{32}$/, 'expected a source instance ref');
const snapshotRef = z.string().regex(/^source-snapshot:\/\/sha256:[0-9a-f]{64}$/, 'expected a source snapshot ref');
const collectionRef = z.string().regex(/^source-collection:\/\/sha256:[0-9a-f]{64}$/, 'expected a source collection ref');
const memberRef = z.string().regex(/^source-member:\/\/sha256:[0-9a-f]{64}$/, 'expected a source member ref');
const bindingRef = z.string().regex(/^source-binding:\/\/sha256:[0-9a-f]{64}$/, 'expected a resolved source binding ref');
export const SourceExtractorIdentitySchema = z.strictObject({
    name: z.literal('zero-ar.pdf-extractor'),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    poppler_version: z.string().min(1),
    tesseract_version: z.string().min(1).nullable(),
    language: z.literal('eng'),
    dpi: positiveCount,
    sandbox_mode: z.enum(['linux-bwrap-no-network', 'resource-limited-process']),
});
export const SourceLocatorSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal('local-directory'),
        path: z.string().min(1).max(4_096),
    }),
]);
export const SourceBoundsSchema = z.strictObject({
    max_items: positiveCount.max(100_000).default(20_000),
    max_total_bytes: positiveCount.max(10 * 1_073_741_824).default(1_073_741_824),
    max_item_bytes: positiveCount.max(1_073_741_824).default(64 * 1_048_576),
    max_depth: positiveCount.max(128).default(32),
});
export const RegisterSourceRequestSchema = z.strictObject({
    name: sourceName,
    profile: z.enum(SOURCE_ACCESS_PROFILES),
    locator: SourceLocatorSchema,
    classification: z.enum(MEMORY_CLASSIFICATIONS).default('internal'),
    evidence_grade: z.enum(EVIDENCE_GRADES).default('original'),
    bounds: SourceBoundsSchema.default({
        max_items: 20_000,
        max_total_bytes: 1_073_741_824,
        max_item_bytes: 64 * 1_048_576,
        max_depth: 32,
    }),
});
export const SourceInstanceSchema = z.strictObject({
    source_ref: sourceRef,
    name: sourceName,
    profile: z.enum(SOURCE_ACCESS_PROFILES),
    locator: SourceLocatorSchema,
    admitted_root_ref: hash,
    access: z.literal('read-only'),
    operations: z.array(z.enum(SOURCE_OPERATIONS)).min(1),
    destinations: z.array(z.string().min(1).max(1_000)),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    bounds: SourceBoundsSchema,
    state: z.enum(SOURCE_INSTANCE_STATES),
    current_snapshot_ref: snapshotRef.nullable(),
    registered_at: z.string().datetime(),
});
export const SourceListSchema = z.strictObject({
    sources: z.array(SourceInstanceSchema),
});
export const SourceSnapshotMemberSchema = z.strictObject({
    member_ref: memberRef,
    snapshot_ref: snapshotRef,
    locator: z.string().min(1).max(4_096),
    artifact_ref: artifactHandle,
    manifest_ref: hash,
    content_hash: hash,
    bytes: count,
    media_type: mediaType,
});
export const SourceSnapshotSchema = z.strictObject({
    snapshot_ref: snapshotRef,
    collection_ref: collectionRef,
    binding_ref: bindingRef,
    source_ref: sourceRef,
    source_name: sourceName,
    profile: z.enum(SOURCE_ACCESS_PROFILES),
    item_count: count,
    total_bytes: count,
    manifest_artifact_ref: artifactHandle,
    manifest_ref: hash,
    created_at: z.string().datetime(),
});
export const SourceSnapshotPageRequestSchema = z.strictObject({
    cursor: z.string().min(1).max(512).optional(),
    limit: positiveCount.max(100).optional(),
});
export const SourceSnapshotPageSchema = z.strictObject({
    snapshot: SourceSnapshotSchema,
    members: z.array(SourceSnapshotMemberSchema).max(100),
    next_cursor: z.string().min(1).max(512).nullable(),
});
export const SourceBindingInputSchema = z.strictObject({
    alias: sourceAlias,
    binding_ref: bindingRef,
    required_for_completion: z.boolean().default(true),
});
export const ResolvedSourceBindingSchema = z.strictObject({
    alias: sourceAlias,
    binding_ref: bindingRef,
    source_ref: sourceRef,
    source_name: sourceName,
    snapshot_ref: snapshotRef,
    collection_ref: collectionRef,
    profile: z.enum(SOURCE_ACCESS_PROFILES),
    profile_ref: hash,
    admitted_root_ref: hash,
    classification_floor: z.enum(MEMORY_CLASSIFICATIONS),
    classification_ceiling: z.enum(MEMORY_CLASSIFICATIONS),
    destination_policy_ref: hash,
    operation_contract_ref: hash,
    operations: z.array(z.enum(SOURCE_OPERATIONS)).min(1),
    destinations: z.array(z.string().min(1).max(1_000)),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    item_count: count,
    total_bytes: count,
    manifest_artifact_ref: artifactHandle,
    manifest_ref: hash,
    extractor: SourceExtractorIdentitySchema,
    required_for_completion: z.boolean(),
});
export const SourcePreflightSchema = z.strictObject({
    source_ref: sourceRef,
    source_name: sourceName,
    profile: z.enum(SOURCE_ACCESS_PROFILES),
    state: z.enum(SOURCE_INSTANCE_STATES),
    resolved_path: z.string().min(1).max(4_096),
    readable: z.boolean(),
    operations: z.array(z.enum(SOURCE_OPERATIONS)),
    destinations: z.array(z.string().min(1).max(1_000)),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    classification_floor: z.enum(MEMORY_CLASSIFICATIONS),
    classification_ceiling: z.enum(MEMORY_CLASSIFICATIONS),
    admitted_root_ref: hash,
    destination_policy_ref: hash,
    bounds: SourceBoundsSchema,
    extractor: SourceExtractorIdentitySchema.nullable(),
    budget_requirements: z.strictObject({
        tool_calls_per_operation: z.literal(1),
        max_read_bytes: positiveCount,
        max_extract_input_bytes: positiveCount,
        max_extract_compute_ms: positiveCount,
    }),
    extraction_limits: z.strictObject({
        max_pdf_bytes: positiveCount,
        max_pages: positiveCount,
        max_text_bytes: positiveCount,
        max_command_output_bytes: positiveCount,
        command_timeout_ms: positiveCount,
    }),
    validator_coverage: z.array(z.string().min(1).max(256)),
    completion_reachability: z.literal('run-contract-dependent'),
    snapshot_ready: z.boolean(),
    current_snapshot_ref: snapshotRef.nullable(),
    item_count: count.nullable(),
    total_bytes: count.nullable(),
    refusals: z.array(z.string().min(1).max(1_000)),
});
export const SourceOperationRequestSchema = z.discriminatedUnion('operation', [
    z.strictObject({
        source_alias: sourceAlias,
        operation: z.literal('list'),
        cursor: z.string().min(1).max(512).optional(),
        limit: positiveCount.max(100).optional(),
    }),
    z.strictObject({
        source_alias: sourceAlias,
        operation: z.literal('stat'),
        locator: z.string().min(1).max(4_096),
    }),
    z.strictObject({
        source_alias: sourceAlias,
        operation: z.literal('read'),
        locator: z.string().min(1).max(4_096),
        offset: count.max(1_073_741_824),
        length: positiveCount.max(1_048_576),
    }),
    z.strictObject({
        source_alias: sourceAlias,
        operation: z.literal('search'),
        query: z.string().min(1).max(4_096),
        max_matches: positiveCount.max(1_000).optional(),
        max_scan_bytes: positiveCount.max(16 * 1_048_576).optional(),
    }),
    z.strictObject({
        source_alias: sourceAlias,
        operation: z.literal('document.extract'),
        locator: z.string().min(1).max(4_096),
        max_pages: positiveCount.max(500).optional(),
    }),
]);
export const SourceOperationResultSchema = z.strictObject({
    source_alias: sourceAlias,
    operation: z.enum(SOURCE_OPERATIONS),
    snapshot_ref: snapshotRef,
    payload: z.record(z.string(), z.unknown()),
    bytes_read: count,
    compute_ms: count,
    provenance_ref: hash,
});
export const DocumentExtractionPageSchema = z.strictObject({
    page: positiveCount,
    width: z.number().positive().nullable(),
    height: z.number().positive().nullable(),
    coordinate_space: z.literal('pdf-points'),
    text_artifact_ref: artifactHandle,
    text_content_hash: hash,
    text_bytes: count,
    method: z.enum(SOURCE_EXTRACTION_METHODS),
    confidence: z.number().min(0).max(1).nullable(),
});
export const DocumentExtractionResultSchema = z.strictObject({
    source_alias: sourceAlias,
    member_ref: memberRef,
    original_artifact_ref: artifactHandle,
    original_content_hash: hash,
    media_type: z.literal('application/pdf'),
    extractor: SourceExtractorIdentitySchema,
    pages: z.array(DocumentExtractionPageSchema).min(1).max(10_000),
    page_count: positiveCount,
    total_text_bytes: count,
    truncated: z.boolean(),
    manifest_artifact_ref: artifactHandle,
    manifest_ref: hash,
    provenance_ref: hash,
});
