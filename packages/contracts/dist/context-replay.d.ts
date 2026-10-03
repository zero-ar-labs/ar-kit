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
/** One recorded whole-entry span and how it reads against current bytes. */
export declare const ContextReplaySpanSchema: z.ZodObject<{
    span: z.ZodObject<{
        entry_id: z.ZodString;
        start: z.ZodNumber;
        end: z.ZodNumber;
        span_hash: z.ZodString;
        classification: z.ZodString;
        evidence_grade: z.ZodEnum<{
            original: "original";
            derived: "derived";
            "model-generated": "model-generated";
        }>;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        stale: "stale";
        resolved: "resolved";
    }>;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type ContextReplaySpan = z.infer<typeof ContextReplaySpanSchema>;
/** One recorded artifact range reread under the run's recorded fence nonce. */
export declare const ContextReplayArtifactSpanSchema: z.ZodObject<{
    span: z.ZodObject<{
        entry_id: z.ZodString;
        start: z.ZodNumber;
        end: z.ZodNumber;
        span_hash: z.ZodString;
        classification: z.ZodString;
        evidence_grade: z.ZodEnum<{
            original: "original";
            derived: "derived";
            "model-generated": "model-generated";
        }>;
        artifact_ref: z.ZodString;
        content_hash: z.ZodString;
        media_type: z.ZodString;
        fence_nonce: z.ZodString;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        stale: "stale";
        resolved: "resolved";
    }>;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type ContextReplayArtifactSpan = z.infer<typeof ContextReplayArtifactSpanSchema>;
/** The replay of one turn's window. Equal holds only when every span resolves and the refs match. */
export declare const ContextReplaySchema: z.ZodObject<{
    run_id: z.ZodString;
    turn: z.ZodNumber;
    recorded_context_ref: z.ZodString;
    replayed_context_ref: z.ZodString;
    equal: z.ZodBoolean;
    instructions_hash: z.ZodString;
    spans_recorded: z.ZodBoolean;
    spans: z.ZodArray<z.ZodObject<{
        span: z.ZodObject<{
            entry_id: z.ZodString;
            start: z.ZodNumber;
            end: z.ZodNumber;
            span_hash: z.ZodString;
            classification: z.ZodString;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
        }, z.core.$strict>;
        status: z.ZodEnum<{
            stale: "stale";
            resolved: "resolved";
        }>;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    artifact_spans: z.ZodArray<z.ZodObject<{
        span: z.ZodObject<{
            entry_id: z.ZodString;
            start: z.ZodNumber;
            end: z.ZodNumber;
            span_hash: z.ZodString;
            classification: z.ZodString;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
            media_type: z.ZodString;
            fence_nonce: z.ZodString;
        }, z.core.$strict>;
        status: z.ZodEnum<{
            stale: "stale";
            resolved: "resolved";
        }>;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    fence_nonce: z.ZodNullable<z.ZodString>;
    evidence_blockers: z.ZodArray<z.ZodObject<{
        entry_id: z.ZodString;
        artifact_ref: z.ZodString;
        reason: z.ZodEnum<{
            "artifact.hash-mismatch": "artifact.hash-mismatch";
            "artifact.classification-mismatch": "artifact.classification-mismatch";
            "artifact.object-missing": "artifact.object-missing";
            "artifact.not-found-or-not-authorized": "artifact.not-found-or-not-authorized";
            "artifact.range-invalid": "artifact.range-invalid";
            "artifact.range-budget": "artifact.range-budget";
            "artifact.store-unavailable": "artifact.store-unavailable";
            "memory.envelope-erased": "memory.envelope-erased";
            token_budget: "token_budget";
        }>;
        blocks_verified_completion: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ContextReplay = z.infer<typeof ContextReplaySchema>;
