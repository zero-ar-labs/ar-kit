/**
 * The hierarchical context public contracts.
 *
 * What this is: the immutable policy, source interval, segment manifest and
 * expansion shapes used to compact old within-run context without replacing
 * canonical entries.
 *
 * How it fits: postures pin the policy, canonical records pin model work and
 * committed segment artifacts, and projections rebuild the hierarchy without
 * contacting a provider.
 */
import { z } from 'zod';
import { CitedSpanSchema } from "./claims.js";
import { contentHash } from "./ids.js";
import { CONTEXT_POLICY_AVAILABILITIES, CONTEXT_SUMMARIZER_BINDINGS, MEMORY_CLASSIFICATIONS, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const id = (prefix) => z.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`), `expected a ${prefix} id`);
const count = z.number().int().nonnegative();
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
export const HierarchicalContextPolicySchema = z.strictObject({
    selector: z.literal('hierarchical-context-v1'),
    mode: z.enum(['off', 'observe', 'enforce']),
    availability: z.enum(CONTEXT_POLICY_AVAILABILITIES),
    recent_original_tokens: z.number().int().positive(),
    historical_summary_tokens: z.number().int().positive(),
    maximum_expansions_per_turn: z.number().int().min(0).max(32),
    summarizer: z.strictObject({
        binding: z.enum(CONTEXT_SUMMARIZER_BINDINGS),
        maximum_source_tokens: z.number().int().positive(),
        maximum_output_tokens: z.number().int().positive(),
    }),
    budgets: z.strictObject({
        maximum_summary_calls_per_run: z.number().int().positive(),
        maximum_summary_tokens_per_run: z.number().int().positive(),
    }),
});
export const ContextSegmentSourceEntrySchema = z.strictObject({
    entry_id: id('ent'),
    content_hash: hash,
});
export const ContextSegmentCoverageSchema = z.strictObject({
    first_entry_id: id('ent'),
    last_entry_id: id('ent'),
    entry_count: z.number().int().positive(),
    source_hash: hash,
    entries: z.array(ContextSegmentSourceEntrySchema).min(1).max(4_096),
}).superRefine((coverage, context) => {
    if (coverage.entries.length !== coverage.entry_count) {
        context.addIssue({ code: 'custom', path: ['entry_count'], message: 'entry_count must equal the exact source entry list length' });
    }
    if (coverage.entries[0]?.entry_id !== coverage.first_entry_id) {
        context.addIssue({ code: 'custom', path: ['first_entry_id'], message: 'first_entry_id must name the first exact source entry' });
    }
    if (coverage.entries.at(-1)?.entry_id !== coverage.last_entry_id) {
        context.addIssue({ code: 'custom', path: ['last_entry_id'], message: 'last_entry_id must name the last exact source entry' });
    }
    if (coverage.source_hash !== contentHash(coverage.entries)) {
        context.addIssue({ code: 'custom', path: ['source_hash'], message: 'source_hash must hash the exact ordered source entry identities' });
    }
});
export const ContextSegmentSummarizerSchema = z.strictObject({
    binding: z.enum(CONTEXT_SUMMARIZER_BINDINGS),
    adapter_ref: hash,
    model_ref: z.string().min(1).max(512),
    prompt_ref: hash,
    policy_ref: hash,
    call_id: hash,
});
export const ContextSegmentManifestBodySchema = z.strictObject({
    schema: z.literal('zero-ar-context-segment/1'),
    tenant_id: z.string().min(1).max(128),
    run_id: id('run'),
    branch_id: id('brn'),
    frontier_ref: hash,
    coverage: ContextSegmentCoverageSchema,
    children: z.array(hash).max(16),
    summary_artifact_ref: artifactHandle,
    summary_content_hash: hash,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.literal('model-generated'),
    summarizer: ContextSegmentSummarizerSchema,
    summary_bytes: count,
});
export function contextSegmentRef(body) {
    return contentHash(body);
}
export const ContextSegmentManifestSchema = ContextSegmentManifestBodySchema.extend({
    segment_ref: hash,
}).superRefine((manifest, context) => {
    const { segment_ref, ...body } = manifest;
    if (segment_ref !== contextSegmentRef(body)) {
        context.addIssue({ code: 'custom', path: ['segment_ref'], message: 'segment_ref must hash the exact segment body' });
    }
});
export const ContextExpandRequestSchema = z.strictObject({
    segment_ref: hash,
    depth: z.number().int().min(1).max(16).default(1),
    maximum_tokens: z.number().int().positive(),
});
export const ContextExpansionResultSchema = z.strictObject({
    schema: z.literal('zero-ar-context-expansion/1'),
    segment_ref: hash,
    depth: z.number().int().min(1).max(16),
    returned_segments: z.array(hash).max(256),
    returned_entries: z.array(id('ent')).max(4_096),
    /** Historical expansion records predate exact span attribution. */
    returned_spans: z.array(CitedSpanSchema).max(4_096).default([]),
    omitted: z.array(z.strictObject({ reference: z.string().min(1), reason: z.string().min(1) })).max(4_096),
    token_estimate: count,
});
/** One committed segment the selector omitted from an actual or observed view. */
export const ContextSegmentOmissionSchema = z.strictObject({
    segment_ref: hash,
    reason: z.string().min(1).max(500),
});
/** A typed optional-policy degradation, recorded instead of hidden fallback. */
export const ContextHierarchyDegradationSchema = z.strictObject({
    code: z.string().min(1).max(200),
    message: z.string().min(1).max(2_000),
});
/**
 * The hierarchy contribution to one recorded model window.
 *
 * Included manifests are the exact artifact identities placed in the model
 * request. Observe mode keeps them under observed and leaves included empty.
 */
export const ContextHierarchyWindowSchema = z.strictObject({
    policy_ref: hash,
    mode: z.enum(['observe', 'enforce']),
    availability: z.enum(CONTEXT_POLICY_AVAILABILITIES),
    included: z.array(ContextSegmentManifestSchema).max(4_096),
    omitted: z.array(ContextSegmentOmissionSchema).max(4_096),
    observed: z.strictObject({
        included: z.array(ContextSegmentManifestSchema).max(4_096),
        omitted: z.array(ContextSegmentOmissionSchema).max(4_096),
    }).nullable(),
    degradation: ContextHierarchyDegradationSchema.nullable(),
});
