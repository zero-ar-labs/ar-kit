import { z } from 'zod';
import { ArtifactContextSpanSchema, ArtifactEvidenceBlockerSchema, CitedSpanSchema, ContextFenceNonceSchema } from "./claims.js";
import { ContextSegmentManifestSchema } from "./context-hierarchy.js";
import { CONTEXT_REPLAY_SPAN_STATUSES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const count = z.number().int().nonnegative();
const replayReason = z.string().min(1).max(500).nullable();
export const ContextReplaySpanSchema = z.strictObject({
    span: CitedSpanSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
export const ContextReplayArtifactSpanSchema = z.strictObject({
    span: ArtifactContextSpanSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
export const ContextReplaySegmentSchema = z.strictObject({
    manifest: ContextSegmentManifestSchema,
    status: z.enum(CONTEXT_REPLAY_SPAN_STATUSES),
    reason: replayReason,
});
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
