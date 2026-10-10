import { z } from 'zod';
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
export declare const ContextReplaySegmentSchema: z.ZodObject<{
    manifest: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-context-segment/1">;
        tenant_id: z.ZodString;
        run_id: z.ZodString;
        branch_id: z.ZodString;
        frontier_ref: z.ZodString;
        coverage: z.ZodObject<{
            first_entry_id: z.ZodString;
            last_entry_id: z.ZodString;
            entry_count: z.ZodNumber;
            source_hash: z.ZodString;
            entries: z.ZodArray<z.ZodObject<{
                entry_id: z.ZodString;
                content_hash: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        children: z.ZodArray<z.ZodString>;
        summary_artifact_ref: z.ZodString;
        summary_content_hash: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        evidence_grade: z.ZodLiteral<"model-generated">;
        summarizer: z.ZodObject<{
            binding: z.ZodEnum<{
                "run-primary": "run-primary";
            }>;
            adapter_ref: z.ZodString;
            model_ref: z.ZodString;
            prompt_ref: z.ZodString;
            policy_ref: z.ZodString;
            call_id: z.ZodString;
        }, z.core.$strict>;
        summary_bytes: z.ZodNumber;
        segment_ref: z.ZodString;
    }, z.core.$strict>;
    status: z.ZodEnum<{
        stale: "stale";
        resolved: "resolved";
    }>;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type ContextReplaySegment = z.infer<typeof ContextReplaySegmentSchema>;
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
    segments: z.ZodArray<z.ZodObject<{
        manifest: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-context-segment/1">;
            tenant_id: z.ZodString;
            run_id: z.ZodString;
            branch_id: z.ZodString;
            frontier_ref: z.ZodString;
            coverage: z.ZodObject<{
                first_entry_id: z.ZodString;
                last_entry_id: z.ZodString;
                entry_count: z.ZodNumber;
                source_hash: z.ZodString;
                entries: z.ZodArray<z.ZodObject<{
                    entry_id: z.ZodString;
                    content_hash: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            children: z.ZodArray<z.ZodString>;
            summary_artifact_ref: z.ZodString;
            summary_content_hash: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodLiteral<"model-generated">;
            summarizer: z.ZodObject<{
                binding: z.ZodEnum<{
                    "run-primary": "run-primary";
                }>;
                adapter_ref: z.ZodString;
                model_ref: z.ZodString;
                prompt_ref: z.ZodString;
                policy_ref: z.ZodString;
                call_id: z.ZodString;
            }, z.core.$strict>;
            summary_bytes: z.ZodNumber;
            segment_ref: z.ZodString;
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
