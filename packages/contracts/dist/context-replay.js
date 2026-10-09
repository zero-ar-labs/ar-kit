/**
 * Context replay contracts.
 *
 * What this is: the answer to rebuilding one recorded model window from the
 * log alone: the recorded and recomputed context refs, whether they agree,
 * and every recorded span resolved against the bytes stored now. Erased or
 * changed bytes read as stale, never as equal (CTX-002, CTX-012).
 *
 * How it fits: served at GET /v1/runs/{run_id}/contexts/{turn} and read
 * through the generated client. A run recorded before spans were persisted
 * answers spans_recorded false instead of a guess.
 */
import { z } from 'zod';
import { ArtifactContextSpanSchema, ArtifactEvidenceBlockerSchema, CitedSpanSchema, ContextFenceNonceSchema } from "./claims.js";
import { ContextSegmentManifestSchema } from "./context-hierarchy.js";
import { CONTEXT_REPLAY_SPAN_STATUSES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const count = z.number().int().nonnegative();
const replayReason = z.string().min(1).max(500).nullable();
/** One recorded whole-entry span and how it reads against current bytes. */
export const ContextReplaySpanSchema = z.strictObject({
    span: CitedSpanSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
/** One recorded artifact range reread under the run's recorded fence nonce. */
export const ContextReplayArtifactSpanSchema = z.strictObject({
    span: ArtifactContextSpanSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
/** One summary artifact from the recorded window and how it reads now. */
export const ContextReplaySegmentSchema = z.strictObject({
    manifest: ContextSegmentManifestSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
/** The replay of one turn's window. Equal holds only when every span resolves and the refs match. */
export const ContextReplaySchema = z.strictObject({
    run_id: runId,
    turn: count,
    recorded_context_ref: hash,
    replayed_context_ref: hash,
    equal: z.boolean(),
    instructions_hash: hash,
    spans_recorded: z.boolean(),
    spans: z.array(ContextReplaySpanSchema),
    artifact_spans: z.array(ContextReplayArtifactSpanSchema),
    segments: z.array(ContextReplaySegmentSchema),
    fence_nonce: ContextFenceNonceSchema.nullable(),
    evidence_blockers: z.array(ArtifactEvidenceBlockerSchema),
});
