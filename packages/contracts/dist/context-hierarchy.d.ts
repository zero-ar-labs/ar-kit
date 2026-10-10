import { z } from 'zod';
export declare const HierarchicalContextPolicySchema: z.ZodObject<{
    selector: z.ZodLiteral<"hierarchical-context-v1">;
    mode: z.ZodEnum<{
        off: "off";
        observe: "observe";
        enforce: "enforce";
    }>;
    availability: z.ZodEnum<{
        optional: "optional";
        required: "required";
    }>;
    recent_original_tokens: z.ZodNumber;
    historical_summary_tokens: z.ZodNumber;
    maximum_expansions_per_turn: z.ZodNumber;
    summarizer: z.ZodObject<{
        binding: z.ZodEnum<{
            "run-primary": "run-primary";
        }>;
        maximum_source_tokens: z.ZodNumber;
        maximum_output_tokens: z.ZodNumber;
    }, z.core.$strict>;
    budgets: z.ZodObject<{
        maximum_summary_calls_per_run: z.ZodNumber;
        maximum_summary_tokens_per_run: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type HierarchicalContextPolicy = z.infer<typeof HierarchicalContextPolicySchema>;
export declare const ContextSegmentSourceEntrySchema: z.ZodObject<{
    entry_id: z.ZodString;
    content_hash: z.ZodString;
}, z.core.$strict>;
export type ContextSegmentSourceEntry = z.infer<typeof ContextSegmentSourceEntrySchema>;
export declare const ContextSegmentCoverageSchema: z.ZodObject<{
    first_entry_id: z.ZodString;
    last_entry_id: z.ZodString;
    entry_count: z.ZodNumber;
    source_hash: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        entry_id: z.ZodString;
        content_hash: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ContextSegmentCoverage = z.infer<typeof ContextSegmentCoverageSchema>;
export declare const ContextSegmentSummarizerSchema: z.ZodObject<{
    binding: z.ZodEnum<{
        "run-primary": "run-primary";
    }>;
    adapter_ref: z.ZodString;
    model_ref: z.ZodString;
    prompt_ref: z.ZodString;
    policy_ref: z.ZodString;
    call_id: z.ZodString;
}, z.core.$strict>;
export type ContextSegmentSummarizer = z.infer<typeof ContextSegmentSummarizerSchema>;
export declare const ContextSegmentManifestBodySchema: z.ZodObject<{
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
}, z.core.$strict>;
export type ContextSegmentManifestBody = z.infer<typeof ContextSegmentManifestBodySchema>;
export declare function contextSegmentRef(body: ContextSegmentManifestBody): string;
export declare const ContextSegmentManifestSchema: z.ZodObject<{
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
export type ContextSegmentManifest = z.infer<typeof ContextSegmentManifestSchema>;
export declare const ContextExpandRequestSchema: z.ZodObject<{
    segment_ref: z.ZodString;
    depth: z.ZodDefault<z.ZodNumber>;
    maximum_tokens: z.ZodNumber;
}, z.core.$strict>;
export type ContextExpandRequest = z.infer<typeof ContextExpandRequestSchema>;
export declare const ContextExpansionResultSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-context-expansion/1">;
    segment_ref: z.ZodString;
    depth: z.ZodNumber;
    returned_segments: z.ZodArray<z.ZodString>;
    returned_entries: z.ZodArray<z.ZodString>;
    returned_spans: z.ZodDefault<z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>>;
    omitted: z.ZodArray<z.ZodObject<{
        reference: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
    token_estimate: z.ZodNumber;
}, z.core.$strict>;
export type ContextExpansionResult = z.infer<typeof ContextExpansionResultSchema>;
export declare const ContextSegmentOmissionSchema: z.ZodObject<{
    segment_ref: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type ContextSegmentOmission = z.infer<typeof ContextSegmentOmissionSchema>;
export declare const ContextHierarchyDegradationSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
}, z.core.$strict>;
export type ContextHierarchyDegradation = z.infer<typeof ContextHierarchyDegradationSchema>;
export declare const ContextHierarchyWindowSchema: z.ZodObject<{
    policy_ref: z.ZodString;
    mode: z.ZodEnum<{
        observe: "observe";
        enforce: "enforce";
    }>;
    availability: z.ZodEnum<{
        optional: "optional";
        required: "required";
    }>;
    included: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
    omitted: z.ZodArray<z.ZodObject<{
        segment_ref: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strict>>;
    observed: z.ZodNullable<z.ZodObject<{
        included: z.ZodArray<z.ZodObject<{
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
        }, z.core.$strict>>;
        omitted: z.ZodArray<z.ZodObject<{
            segment_ref: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    degradation: z.ZodNullable<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ContextHierarchyWindow = z.infer<typeof ContextHierarchyWindowSchema>;
