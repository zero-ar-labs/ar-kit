/**
 * Public payload schemas.
 *
 * What this is: the zod definitions for everything that crosses a public
 * boundary: intake, controls, records, entries, snapshots, results, and the
 * management operations. TypeScript types infer from these, JSON Schema
 * generates from these, and the server validates with these. One source,
 * many projections (section 9.1 of the ERD).
 *
 * How it fits: every schema registers its structural placement and owner in
 * SCHEMA_REGISTRY, which generates the footprint inventory. A shape missing
 * from the registry fails the build (DX-016, XCV-011).
 */
import { z } from 'zod';
import { RECORD_TYPES } from './vocab.js';
/** Internal persistence and composition parsers for live closed-vocabulary fields. */
export declare const LeaseStateSchema: z.ZodEnum<{
    reserved: "reserved";
    settled: "settled";
    charged: "charged";
}>;
export declare const StoreKindSchema: z.ZodEnum<{
    sqlite: "sqlite";
    postgres: "postgres";
}>;
/** The three principal roles. The accountable owner is always a named person (K-18). */
export declare const PrincipalsSchema: z.ZodObject<{
    executing: z.ZodString;
    originating: z.ZodString;
    accountable: z.ZodString;
}, z.core.$strict>;
/** Consumption amounts by denomination. Absent means zero allowance, not unlimited. */
export declare const ConsumptionSchema: z.ZodObject<{
    model_tokens: z.ZodNumber;
    tool_calls: z.ZodOptional<z.ZodNumber>;
    bytes: z.ZodOptional<z.ZodNumber>;
    compute_ms: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const BudgetsSchema: z.ZodObject<{
    consumption: z.ZodObject<{
        model_tokens: z.ZodNumber;
        tool_calls: z.ZodOptional<z.ZodNumber>;
        bytes: z.ZodOptional<z.ZodNumber>;
        compute_ms: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>;
    attention: z.ZodNumber;
    verification_reserve_fraction: z.ZodNumber;
    max_turns: z.ZodNumber;
}, z.core.$strict>;
/** One input artifact the caller asks the run to depend on. */
export declare const InputArtifactBindingSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    required_for_completion: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export type InputArtifactBinding = z.infer<typeof InputArtifactBindingSchema>;
/** The verified input artifact descriptor pinned into the run manifest. */
export declare const ResolvedInputArtifactSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    tenant: z.ZodString;
    source_run_id: z.ZodString;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    required_for_completion: z.ZodBoolean;
}, z.core.$strict>;
export type ResolvedInputArtifact = z.infer<typeof ResolvedInputArtifactSchema>;
/** The credential-free handle persisted before an imported remote tool parks. */
export declare const RemoteToolTaskHandleSchema: z.ZodObject<{
    protocol: z.ZodLiteral<"mcp">;
    invoke_id: z.ZodString;
    tool: z.ZodString;
    original_call_ref: z.ZodString;
    peer_binding_ref: z.ZodString;
    execution_binding_ref: z.ZodString;
    peer_task_id: z.ZodNullable<z.ZodString>;
    state: z.ZodEnum<{
        working: "working";
        outcome_unknown: "outcome_unknown";
        input_required: "input_required";
    }>;
    cause: z.ZodEnum<{
        "peer-task": "peer-task";
        "transport-loss": "transport-loss";
    }>;
    last_position: z.ZodNullable<z.ZodString>;
    observed_at: z.ZodString;
}, z.core.$strict>;
export type RemoteToolTaskHandle = z.infer<typeof RemoteToolTaskHandleSchema>;
/** A unit of work arriving at intake (ERD 9.2). Budgets arrive with the work. */
export declare const IntakeRequestSchema: z.ZodObject<{
    objective: z.ZodString;
    agent_ref: z.ZodOptional<z.ZodString>;
    principals: z.ZodObject<{
        executing: z.ZodString;
        originating: z.ZodString;
        accountable: z.ZodString;
    }, z.core.$strict>;
    budgets: z.ZodObject<{
        consumption: z.ZodObject<{
            model_tokens: z.ZodNumber;
            tool_calls: z.ZodOptional<z.ZodNumber>;
            bytes: z.ZodOptional<z.ZodNumber>;
            compute_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        attention: z.ZodNumber;
        verification_reserve_fraction: z.ZodNumber;
        max_turns: z.ZodNumber;
    }, z.core.$strict>;
    task_contract_ref: z.ZodOptional<z.ZodString>;
    posture_ref: z.ZodOptional<z.ZodString>;
    inputs: z.ZodOptional<z.ZodObject<{
        items: z.ZodOptional<z.ZodArray<z.ZodString>>;
        artifacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            required_for_completion: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    idempotency_key: z.ZodString;
    correlation_id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type IntakeRequest = z.infer<typeof IntakeRequestSchema>;
/**
 * The complete execution closure one run pins before external work
 * (KRN-024). Empty arrays and nulls state that a component is not
 * applicable; omission never means discovery may fill it in later.
 */
export declare const ResolvedRunManifestSchema: z.ZodObject<{
    schema: z.ZodLiteral<"resolved-run-manifest/1">;
    contract_version: z.ZodLiteral<"v1">;
    runtime: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        ref: z.ZodString;
    }, z.core.$strict>;
    profile_manifest: z.ZodObject<{
        manifest_id: z.ZodString;
        manifest_ref: z.ZodString;
        profile: z.ZodEnum<{
            "local-lite": "local-lite";
            "full-cell": "full-cell";
            "small-production": "small-production";
            regulated: "regulated";
        }>;
        version: z.ZodString;
        supported: z.ZodArray<z.ZodEnum<{
            "local-lite": "local-lite";
            "hosted-postgresql-service": "hosted-postgresql-service";
            "transformation-volume-reference-pack": "transformation-volume-reference-pack";
            "provider-openai": "provider-openai";
            "provider-anthropic": "provider-anthropic";
            "provider-openrouter": "provider-openrouter";
            "provider-together": "provider-together";
            "provider-fireworks": "provider-fireworks";
            "aggregator-composio-observation": "aggregator-composio-observation";
            "aggregator-merge-observation": "aggregator-merge-observation";
            "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
            "environment-process": "environment-process";
            "environment-oci": "environment-oci";
            "environment-ssh": "environment-ssh";
            "environment-firecracker": "environment-firecracker";
            "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
            "environment-modal": "environment-modal";
            "environment-daytona": "environment-daytona";
            "environment-vercel-sandbox": "environment-vercel-sandbox";
            "environment-apptainer": "environment-apptainer";
            "full-cell-docker-linux": "full-cell-docker-linux";
            "canonical-log": "canonical-log";
            "quality-plane": "quality-plane";
            artifacts: "artifacts";
            suspension: "suspension";
            "honest-completion": "honest-completion";
            "unattended-aggregator-mutations": "unattended-aggregator-mutations";
            "dynamic-authority": "dynamic-authority";
            "production-effect-dispatch": "production-effect-dispatch";
            "research-reference-pack": "research-reference-pack";
            "video-reference-pack": "video-reference-pack";
            "native-packaged-self-hosting": "native-packaged-self-hosting";
            "classification-airlocks": "classification-airlocks";
            "regulated-workloads": "regulated-workloads";
            "cross-run-memory": "cross-run-memory";
            "authored-orchestration": "authored-orchestration";
            "mcp-work-entrypoints": "mcp-work-entrypoints";
            "mcp-imported-tools": "mcp-imported-tools";
        }>>;
        conditional: z.ZodArray<z.ZodObject<{
            capability: z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>;
            refusal_point: z.ZodEnum<{
                "profile-compilation": "profile-compilation";
                publication: "publication";
                registration: "registration";
                intake: "intake";
                route: "route";
                "not-applicable": "not-applicable";
            }>;
            diagnostic_code: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        excluded: z.ZodArray<z.ZodObject<{
            capability: z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>;
            refusal_point: z.ZodEnum<{
                "profile-compilation": "profile-compilation";
                publication: "publication";
                registration: "registration";
                intake: "intake";
                route: "route";
                "not-applicable": "not-applicable";
            }>;
            diagnostic_code: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        required_components: z.ZodArray<z.ZodEnum<{
            store: "store";
            migration: "migration";
            queue: "queue";
            artifact: "artifact";
            secret_store: "secret_store";
            tool_host: "tool_host";
            validator_host: "validator_host";
            authority: "authority";
            memory: "memory";
            orchestration: "orchestration";
            effect: "effect";
            mcp: "mcp";
        }>>;
        health_probes: z.ZodArray<z.ZodEnum<{
            store: "store";
            migration: "migration";
            queue: "queue";
            artifact: "artifact";
            secret_store: "secret_store";
            tool_host: "tool_host";
            validator_host: "validator_host";
            authority: "authority";
            memory: "memory";
            orchestration: "orchestration";
            effect: "effect";
            mcp: "mcp";
        }>>;
        artifact_policy: z.ZodObject<{
            tool_result_inline_threshold_bytes: z.ZodNumber;
            tool_result_max_artifact_bytes: z.ZodNumber;
            tool_result_range_read_max_bytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    agent: z.ZodObject<{
        requested_ref: z.ZodNullable<z.ZodString>;
        default_ref: z.ZodNullable<z.ZodString>;
        resolved_ref: z.ZodString;
        name: z.ZodString;
        definition_ref: z.ZodString;
        instructions_ref: z.ZodString;
        publication_ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    context: z.ZodObject<{
        assembler: z.ZodString;
        version: z.ZodString;
        ref: z.ZodString;
        posture_ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    model: z.ZodObject<{
        adapter: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            ref: z.ZodString;
        }, z.core.$strict>;
        admitted_adapter_ref: z.ZodNullable<z.ZodString>;
        model_ref: z.ZodString;
        provider_model_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        provider: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            scripted: "scripted";
            openai: "openai";
            anthropic: "anthropic";
            openrouter: "openrouter";
            together: "together";
            fireworks: "fireworks";
            "openai-compatible": "openai-compatible";
        }>>>;
        protocol_adapter: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            scripted: "scripted";
            "openai-chat-completions": "openai-chat-completions";
            "anthropic-messages": "anthropic-messages";
        }>>>;
        protocol_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        profile: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            scripted: "scripted";
            openai: "openai";
            anthropic: "anthropic";
            openrouter: "openrouter";
            together: "together";
            fireworks: "fireworks";
            "generic-openai-compatible": "generic-openai-compatible";
            litellm: "litellm";
            ollama: "ollama";
        }>>>;
        profile_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        provider_instance_ref: z.ZodNullable<z.ZodString>;
        endpoint: z.ZodNullable<z.ZodString>;
        destination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        endpoint_policy_ref: z.ZodNullable<z.ZodString>;
        catalogue_source: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            declared: "declared";
            "provider-api": "provider-api";
            "openai-compatible-models": "openai-compatible-models";
        }>>>;
        compatibility: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            streaming: z.ZodEnum<{
                supported: "supported";
                unknown: "unknown";
                unsupported: "unsupported";
            }>;
            tools: z.ZodEnum<{
                supported: "supported";
                unknown: "unknown";
                unsupported: "unsupported";
            }>;
            cancellation: z.ZodEnum<{
                supported: "supported";
                unknown: "unknown";
                unsupported: "unsupported";
            }>;
            context_limits: z.ZodEnum<{
                supported: "supported";
                unknown: "unknown";
                unsupported: "unsupported";
            }>;
            usage: z.ZodEnum<{
                absent: "absent";
                reported: "reported";
                untrusted: "untrusted";
            }>;
            upstream_attestation_ref: z.ZodNullable<z.ZodString>;
            notes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>>;
        compatibility_ref: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        credential_mode: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            none: "none";
            binding: "binding";
        }>>>;
        credential_binding_ref: z.ZodNullable<z.ZodString>;
        catalogue_entry_ref: z.ZodNullable<z.ZodString>;
        provider_model_revision: z.ZodNullable<z.ZodString>;
        assurance_facts_ref: z.ZodNullable<z.ZodString>;
        credential_epoch: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>;
    model_plan: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        primary: z.ZodObject<{
            model_ref: z.ZodString;
            provider_model_id: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            profile: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "generic-openai-compatible": "generic-openai-compatible";
                litellm: "litellm";
                ollama: "ollama";
            }>;
            profile_version: z.ZodString;
            provider_instance_ref: z.ZodString;
            adapter_ref: z.ZodString;
            endpoint: z.ZodString;
            destination: z.ZodString;
            endpoint_policy_ref: z.ZodString;
            catalogue_source: z.ZodEnum<{
                declared: "declared";
                "provider-api": "provider-api";
                "openai-compatible-models": "openai-compatible-models";
            }>;
            compatibility: z.ZodObject<{
                streaming: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                tools: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                cancellation: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                context_limits: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                usage: z.ZodEnum<{
                    absent: "absent";
                    reported: "reported";
                    untrusted: "untrusted";
                }>;
                upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            compatibility_ref: z.ZodString;
            credential_mode: z.ZodEnum<{
                none: "none";
                binding: "binding";
            }>;
            credential_binding_ref: z.ZodNullable<z.ZodString>;
            catalogue_entry_ref: z.ZodString;
            provider_model_revision: z.ZodString;
            assurance_facts_ref: z.ZodNullable<z.ZodString>;
            credential_epoch: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        fallbacks: z.ZodArray<z.ZodObject<{
            model_ref: z.ZodString;
            provider_model_id: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            profile: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "generic-openai-compatible": "generic-openai-compatible";
                litellm: "litellm";
                ollama: "ollama";
            }>;
            profile_version: z.ZodString;
            provider_instance_ref: z.ZodString;
            adapter_ref: z.ZodString;
            endpoint: z.ZodString;
            destination: z.ZodString;
            endpoint_policy_ref: z.ZodString;
            catalogue_source: z.ZodEnum<{
                declared: "declared";
                "provider-api": "provider-api";
                "openai-compatible-models": "openai-compatible-models";
            }>;
            compatibility: z.ZodObject<{
                streaming: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                tools: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                cancellation: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                context_limits: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                usage: z.ZodEnum<{
                    absent: "absent";
                    reported: "reported";
                    untrusted: "untrusted";
                }>;
                upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            compatibility_ref: z.ZodString;
            credential_mode: z.ZodEnum<{
                none: "none";
                binding: "binding";
            }>;
            credential_binding_ref: z.ZodNullable<z.ZodString>;
            catalogue_entry_ref: z.ZodString;
            provider_model_revision: z.ZodString;
            assurance_facts_ref: z.ZodNullable<z.ZodString>;
            credential_epoch: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>>;
        selector: z.ZodString;
        selection_reason: z.ZodString;
        catalogue_refs: z.ZodArray<z.ZodString>;
        resolution_policy_ref: z.ZodString;
    }, z.core.$strict>>>;
    input_artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        artifact_ref: z.ZodString;
        manifest_ref: z.ZodString;
        tenant: z.ZodString;
        source_run_id: z.ZodString;
        content_hash: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        evidence_grade: z.ZodEnum<{
            original: "original";
            derived: "derived";
            "model-generated": "model-generated";
        }>;
        required_for_completion: z.ZodBoolean;
    }, z.core.$strict>>>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        contract_ref: z.ZodString;
        binding_ref: z.ZodNullable<z.ZodString>;
        operation_class: z.ZodEnum<{
            observation: "observation";
            "run-internal": "run-internal";
            "effect-proposal": "effect-proposal";
        }>;
        target_ref: z.ZodNullable<z.ZodString>;
        environment_ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
    workspace_profiles: z.ZodArray<z.ZodString>;
    workspace_bindings: z.ZodArray<z.ZodString>;
    procedures: z.ZodArray<z.ZodString>;
    task_contract: z.ZodNullable<z.ZodObject<{
        ref: z.ZodString;
        validators: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            class: z.ZodEnum<{
                deterministic: "deterministic";
                "sampled-oracle": "sampled-oracle";
                heuristic: "heuristic";
                "named-human": "named-human";
            }>;
            ref: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    semantic_declarations: z.ZodArray<z.ZodString>;
    domain_pack_ref: z.ZodNullable<z.ZodString>;
    operation_registry: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        operation_class: z.ZodEnum<{
            observation: "observation";
            "run-internal": "run-internal";
            "effect-proposal": "effect-proposal";
        }>;
        ref: z.ZodString;
    }, z.core.$strict>>;
    target_adapters: z.ZodArray<z.ZodString>;
    execution_environments: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ResolvedRunManifest = z.infer<typeof ResolvedRunManifestSchema>;
/**
 * The task contract (QLT-001): what must hold, where it is checked, what
 * repair may assume, and which validator's coverage the contract designates
 * sufficient. The runtime enforces the protocol; the contract supplies the
 * meaning of pass (NG-2).
 */
export declare const TaskContractSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    invariants: z.ZodArray<z.ZodString>;
    acceptance_rules: z.ZodArray<z.ZodString>;
    checkpoint_every_items: z.ZodNumber;
    checkpoint_phase_boundaries: z.ZodOptional<z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        starts_after_items: z.ZodNumber;
        checkpoint_every_items: z.ZodNumber;
    }, z.core.$strict>>>;
    dependency_frontier: z.ZodEnum<{
        "independent-items": "independent-items";
        "run-start": "run-start";
        "declared-dependencies": "declared-dependencies";
    }>;
    repair_budget_attempts: z.ZodNumber;
    claim_representation: z.ZodOptional<z.ZodEnum<{
        "structured-claims-with-citations": "structured-claims-with-citations";
    }>>;
    validators: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        class: z.ZodEnum<{
            deterministic: "deterministic";
            "sampled-oracle": "sampled-oracle";
            heuristic: "heuristic";
            "named-human": "named-human";
        }>;
        covers: z.ZodArray<z.ZodString>;
        sufficient_for: z.ZodArray<z.ZodString>;
        cost_wall_ms: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type TaskContract = z.infer<typeof TaskContractSchema>;
/** A control addressed to a run. The id locates; principal and scope authorize (K-19). */
export declare const ControlRequestSchema: z.ZodObject<{
    verb: z.ZodEnum<{
        steer: "steer";
        redirect: "redirect";
        cancel: "cancel";
        answer: "answer";
    }>;
    control_id: z.ZodString;
    text: z.ZodOptional<z.ZodString>;
    handle: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ControlRequest = z.infer<typeof ControlRequestSchema>;
/** One retryable public request to start or resume an existing run. */
export declare const RunLifecycleCommandRequestSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RunLifecycleCommandRequest = z.infer<typeof RunLifecycleCommandRequestSchema>;
/** Fork management request (ERD 9.5). A fork inherits history, never authority. */
export declare const ForkRequestSchema: z.ZodObject<{
    at_entry_id: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    budgets: z.ZodOptional<z.ZodObject<{
        consumption: z.ZodObject<{
            model_tokens: z.ZodNumber;
            tool_calls: z.ZodOptional<z.ZodNumber>;
            bytes: z.ZodOptional<z.ZodNumber>;
            compute_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        attention: z.ZodNumber;
        verification_reserve_fraction: z.ZodNumber;
        max_turns: z.ZodNumber;
    }, z.core.$strict>>;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type ForkRequest = z.infer<typeof ForkRequestSchema>;
/** Re-execution request (ERD 9.5): evaluation by running the saved inputs again.
 * Omitting the frontier re-runs from the objective. */
export declare const ReexecuteRequestSchema: z.ZodObject<{
    at_entry_id: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    budgets: z.ZodOptional<z.ZodObject<{
        consumption: z.ZodObject<{
            model_tokens: z.ZodNumber;
            tool_calls: z.ZodOptional<z.ZodNumber>;
            bytes: z.ZodOptional<z.ZodNumber>;
            compute_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        attention: z.ZodNumber;
        verification_reserve_fraction: z.ZodNumber;
        max_turns: z.ZodNumber;
    }, z.core.$strict>>;
    posture_ref: z.ZodOptional<z.ZodString>;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type ReexecuteRequest = z.infer<typeof ReexecuteRequestSchema>;
/** A model-visible entry. Entries form a tree; any entry is a fork target (K-8). */
export declare const EntrySchema: z.ZodObject<{
    entry_id: z.ZodString;
    run_id: z.ZodString;
    parent_id: z.ZodNullable<z.ZodString>;
    role: z.ZodEnum<{
        system: "system";
        user: "user";
        assistant: "assistant";
        tool_result: "tool_result";
        steer: "steer";
        marker: "marker";
    }>;
    content: z.ZodObject<{
        text: z.ZodString;
    }, z.core.$strict>;
    content_hash: z.ZodString;
}, z.core.$strict>;
export type Entry = z.infer<typeof EntrySchema>;
/** The envelope every runtime record travels in. Payloads validate per type. */
export declare const RecordEnvelopeSchema: z.ZodObject<{
    record_id: z.ZodString;
    run_id: z.ZodString;
    seq: z.ZodNumber;
    logical_clock: z.ZodNumber;
    causal_parent: z.ZodNullable<z.ZodString>;
    type: z.ZodEnum<{
        "run.created": "run.created";
        "run.started": "run.started";
        "entry.appended": "entry.appended";
        "branch.created": "branch.created";
        "branch.head.moved": "branch.head.moved";
        "context.assembled": "context.assembled";
        "model.call.started": "model.call.started";
        "model.call.finished": "model.call.finished";
        "model.call.failed": "model.call.failed";
        "model.fallback.switched": "model.fallback.switched";
        "turn.completed": "turn.completed";
        "control.received": "control.received";
        "control.applied": "control.applied";
        "lease.opened": "lease.opened";
        "lease.reserved": "lease.reserved";
        "lease.consumed": "lease.consumed";
        "lease.released": "lease.released";
        "subrun.opened": "subrun.opened";
        "subrun.finished": "subrun.finished";
        "tool.invoked": "tool.invoked";
        "tool.remote.pending": "tool.remote.pending";
        "tool.finished": "tool.finished";
        "environment.prepare.requested": "environment.prepare.requested";
        "environment.prepared": "environment.prepared";
        "environment.job.submit.requested": "environment.job.submit.requested";
        "environment.job.submitted": "environment.job.submitted";
        "environment.job.observe.requested": "environment.job.observe.requested";
        "environment.job.observed": "environment.job.observed";
        "environment.job.reconcile.requested": "environment.job.reconcile.requested";
        "environment.job.reconciled": "environment.job.reconciled";
        "environment.job.cancel.requested": "environment.job.cancel.requested";
        "environment.job.cancelled": "environment.job.cancelled";
        "environment.artifact.collect.requested": "environment.artifact.collect.requested";
        "environment.artifact.collected": "environment.artifact.collected";
        "artifact.committed": "artifact.committed";
        "environment.teardown.requested": "environment.teardown.requested";
        "environment.teardown.recorded": "environment.teardown.recorded";
        "environment.abandon.requested": "environment.abandon.requested";
        "environment.abandoned": "environment.abandoned";
        "effect.prepared": "effect.prepared";
        "effect.authority.decision": "effect.authority.decision";
        "effect.authority.invalidated": "effect.authority.invalidated";
        "effect.dispatched": "effect.dispatched";
        "effect.resolved": "effect.resolved";
        "effect.unreconcilable": "effect.unreconcilable";
        "grant.superseded": "grant.superseded";
        "item.attempted": "item.attempted";
        "item.parked": "item.parked";
        "item.invalidated": "item.invalidated";
        "gap.settled": "gap.settled";
        "gap.dismissed": "gap.dismissed";
        "checkpoint.started": "checkpoint.started";
        "checkpoint.passed": "checkpoint.passed";
        "checkpoint.rejected": "checkpoint.rejected";
        "checkpoint.indeterminate": "checkpoint.indeterminate";
        "repair.started": "repair.started";
        "completion.proposed": "completion.proposed";
        "verification.concluded": "verification.concluded";
        "run.suspended": "run.suspended";
        "run.resume.blocked": "run.resume.blocked";
        "run.resumed": "run.resumed";
        "run.cancelled": "run.cancelled";
        "run.finished": "run.finished";
        "run.forked": "run.forked";
        "reexecution.started": "reexecution.started";
        "subject.erasure.completed": "subject.erasure.completed";
        "wake.scheduled": "wake.scheduled";
        "wake.claimed": "wake.claimed";
        "memory.event.recorded": "memory.event.recorded";
        "memory.read.recorded": "memory.read.recorded";
        "external.observation.received": "external.observation.received";
        "external.observation.applied": "external.observation.applied";
        "projection.rebuilt": "projection.rebuilt";
        "run.lifecycle.command.accepted": "run.lifecycle.command.accepted";
    }>;
    type_version: z.ZodNumber;
    at: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    chain_hash: z.ZodString;
}, z.core.$strict>;
export type RecordEnvelope = z.infer<typeof RecordEnvelopeSchema>;
/** Payload schemas per record type. Strict: an unknown field is a defect, not data. */
export declare const RECORD_PAYLOADS: Record<(typeof RECORD_TYPES)[number], z.ZodType>;
/** The run head snapshot: a synchronization checkpoint, never the canonical source (X-2). */
export declare const RunSnapshotSchema: z.ZodObject<{
    run_id: z.ZodString;
    status: z.ZodEnum<{
        created: "created";
        running: "running";
        suspended: "suspended";
        cancelled: "cancelled";
        finished: "finished";
    }>;
    completion_state: z.ZodEnum<{
        working: "working";
        checkpoint_verifying: "checkpoint_verifying";
        completion_proposed: "completion_proposed";
        verifying: "verifying";
        gap_open: "gap_open";
        repair: "repair";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>;
    terminal: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>>;
    suspend_reason: z.ZodNullable<z.ZodEnum<{
        budget_exhausted: "budget_exhausted";
        provider_failure: "provider_failure";
        awaiting_answer: "awaiting_answer";
        operator_pause: "operator_pause";
        stagnation: "stagnation";
        remote_task: "remote_task";
    }>>;
    turn: z.ZodNumber;
    current_branch: z.ZodNullable<z.ZodString>;
    head_entry_id: z.ZodNullable<z.ZodString>;
    entry_count: z.ZodNumber;
    agent_name: z.ZodString;
    model_ref: z.ZodString;
    objective: z.ZodString;
    budgets: z.ZodNullable<z.ZodObject<{
        consumption: z.ZodObject<{
            model_tokens: z.ZodNumber;
            tool_calls: z.ZodOptional<z.ZodNumber>;
            bytes: z.ZodOptional<z.ZodNumber>;
            compute_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        attention: z.ZodNumber;
        verification_reserve_fraction: z.ZodNumber;
        max_turns: z.ZodNumber;
    }, z.core.$strict>>;
    usage: z.ZodRecord<z.ZodString, z.ZodObject<{
        reserved: z.ZodNumber;
        consumed: z.ZodNumber;
    }, z.core.$strict>>;
    verified_completion_reachable: z.ZodBoolean;
    items: z.ZodNullable<z.ZodRecord<z.ZodEnum<{
        verified: "verified";
        untouched: "untouched";
        completed_unverified: "completed_unverified";
        parked: "parked";
        dismissed: "dismissed";
        failed: "failed";
        invalidated: "invalidated";
    }>, z.ZodNumber>>;
    contract: z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        ref: z.ZodString;
        repair_attempts_used: z.ZodNumber;
        repair_budget: z.ZodNumber;
    }, z.core.$strict>>;
    snapshot_version: z.ZodNumber;
}, z.core.$strict>;
export type RunSnapshot = z.infer<typeof RunSnapshotSchema>;
/** Filters for the tenant run-head index. Time bounds are inclusive then exclusive. */
export declare const WorkQueryRequestSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    lifecycle_state: z.ZodOptional<z.ZodEnum<{
        created: "created";
        running: "running";
        suspended: "suspended";
        cancelled: "cancelled";
        finished: "finished";
    }>>;
    completion_class: z.ZodOptional<z.ZodEnum<{
        cancelled: "cancelled";
        working: "working";
        verified: "verified";
        rejected: "rejected";
        indeterminate: "indeterminate";
        exhausted: "exhausted";
        unverified: "unverified";
    }>>;
    review_state: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        none: "none";
    }>>;
    publication_ref: z.ZodOptional<z.ZodString>;
    created_from: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
    correlation_id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type WorkQueryRequest = z.infer<typeof WorkQueryRequestSchema>;
/** One bounded search row from the rebuildable run-head projection. */
export declare const WorkQueryItemSchema: z.ZodObject<{
    run_id: z.ZodString;
    created_at: z.ZodString;
    status: z.ZodEnum<{
        created: "created";
        running: "running";
        suspended: "suspended";
        cancelled: "cancelled";
        finished: "finished";
    }>;
    completion_state: z.ZodEnum<{
        working: "working";
        checkpoint_verifying: "checkpoint_verifying";
        completion_proposed: "completion_proposed";
        verifying: "verifying";
        gap_open: "gap_open";
        repair: "repair";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>;
    terminal: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>>;
    completion_class: z.ZodEnum<{
        cancelled: "cancelled";
        working: "working";
        verified: "verified";
        rejected: "rejected";
        indeterminate: "indeterminate";
        exhausted: "exhausted";
        unverified: "unverified";
    }>;
    review_state: z.ZodEnum<{
        pending: "pending";
        none: "none";
    }>;
    publication_ref: z.ZodNullable<z.ZodString>;
    correlation_id: z.ZodNullable<z.ZodString>;
    agent_name: z.ZodString;
    objective: z.ZodString;
}, z.core.$strict>;
export type WorkQueryItem = z.infer<typeof WorkQueryItemSchema>;
/** A keyset page. The cursor is an opaque hash, never a run identifier. */
export declare const WorkQueryPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        run_id: z.ZodString;
        created_at: z.ZodString;
        status: z.ZodEnum<{
            created: "created";
            running: "running";
            suspended: "suspended";
            cancelled: "cancelled";
            finished: "finished";
        }>;
        completion_state: z.ZodEnum<{
            working: "working";
            checkpoint_verifying: "checkpoint_verifying";
            completion_proposed: "completion_proposed";
            verifying: "verifying";
            gap_open: "gap_open";
            repair: "repair";
            complete: "complete";
            unverified_artifact: "unverified_artifact";
        }>;
        terminal: z.ZodNullable<z.ZodEnum<{
            cancelled: "cancelled";
            complete: "complete";
            unverified_artifact: "unverified_artifact";
        }>>;
        completion_class: z.ZodEnum<{
            cancelled: "cancelled";
            working: "working";
            verified: "verified";
            rejected: "rejected";
            indeterminate: "indeterminate";
            exhausted: "exhausted";
            unverified: "unverified";
        }>;
        review_state: z.ZodEnum<{
            pending: "pending";
            none: "none";
        }>;
        publication_ref: z.ZodNullable<z.ZodString>;
        correlation_id: z.ZodNullable<z.ZodString>;
        agent_name: z.ZodString;
        objective: z.ZodString;
    }, z.core.$strict>>;
    next_cursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type WorkQueryPage = z.infer<typeof WorkQueryPageSchema>;
export declare const RunIntegrityFindingSchema: z.ZodObject<{
    code: z.ZodString;
    message: z.ZodString;
    seq: z.ZodOptional<z.ZodNumber>;
    anchor_ref: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RunIntegrityFinding = z.infer<typeof RunIntegrityFindingSchema>;
export declare const RunIntegritySummarySchema: z.ZodObject<{
    ok: z.ZodBoolean;
    anchor_store_available: z.ZodBoolean;
    last_anchored_seq: z.ZodNumber;
    last_anchored_head: z.ZodNullable<z.ZodString>;
    latest_anchor_ref: z.ZodNullable<z.ZodString>;
    unanchored_tail_records: z.ZodNumber;
    unanchored_tail: z.ZodNullable<z.ZodObject<{
        from_seq: z.ZodNumber;
        to_seq: z.ZodNumber;
        reason: z.ZodString;
    }, z.core.$strict>>;
    findings: z.ZodArray<z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        seq: z.ZodOptional<z.ZodNumber>;
        anchor_ref: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RunIntegritySummary = z.infer<typeof RunIntegritySummarySchema>;
export declare const ExternalEvidencePropertySchema: z.ZodObject<{
    family: z.ZodEnum<{
        "actor-identity": "actor-identity";
        "principal-authority": "principal-authority";
        "action-boundary": "action-boundary";
        "policy-basis": "policy-basis";
        "decision-basis": "decision-basis";
        "data-and-resource-touch": "data-and-resource-touch";
        "lifecycle-context": "lifecycle-context";
        "verification-strength": "verification-strength";
    }>;
    standing: z.ZodEnum<{
        sufficient: "sufficient";
        partial: "partial";
        missing: "missing";
        conflicting: "conflicting";
        opaque: "opaque";
    }>;
    classification: z.ZodEnum<{
        gap: "gap";
        sufficient: "sufficient";
        "design-exclusion": "design-exclusion";
    }>;
    evidence_record_ids: z.ZodArray<z.ZodString>;
    verification_strength: z.ZodEnum<{
        cryptographic: "cryptographic";
        "schema-validated": "schema-validated";
        replayable: "replayable";
        attested: "attested";
        narrated: "narrated";
    }>;
    candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    conflict: z.ZodNullable<z.ZodString>;
    clause: z.ZodOptional<z.ZodString>;
    requirement_id: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ExternalEvidenceProperty = z.infer<typeof ExternalEvidencePropertySchema>;
export declare const ExternalEvidenceDecisionSchema: z.ZodObject<{
    decision_id: z.ZodString;
    kind: z.ZodEnum<{
        "effect-dispatch": "effect-dispatch";
        "verification-verdict": "verification-verdict";
        "checkpoint-rejection": "checkpoint-rejection";
    }>;
    anchoring_record_id: z.ZodString;
    run_id: z.ZodString;
    properties: z.ZodArray<z.ZodObject<{
        family: z.ZodEnum<{
            "actor-identity": "actor-identity";
            "principal-authority": "principal-authority";
            "action-boundary": "action-boundary";
            "policy-basis": "policy-basis";
            "decision-basis": "decision-basis";
            "data-and-resource-touch": "data-and-resource-touch";
            "lifecycle-context": "lifecycle-context";
            "verification-strength": "verification-strength";
        }>;
        standing: z.ZodEnum<{
            sufficient: "sufficient";
            partial: "partial";
            missing: "missing";
            conflicting: "conflicting";
            opaque: "opaque";
        }>;
        classification: z.ZodEnum<{
            gap: "gap";
            sufficient: "sufficient";
            "design-exclusion": "design-exclusion";
        }>;
        evidence_record_ids: z.ZodArray<z.ZodString>;
        verification_strength: z.ZodEnum<{
            cryptographic: "cryptographic";
            "schema-validated": "schema-validated";
            replayable: "replayable";
            attested: "attested";
            narrated: "narrated";
        }>;
        candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        conflict: z.ZodNullable<z.ZodString>;
        clause: z.ZodOptional<z.ZodString>;
        requirement_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ExternalEvidenceDecision = z.infer<typeof ExternalEvidenceDecisionSchema>;
export declare const ExternalEvidenceMetricSummarySchema: z.ZodObject<{
    decision_count: z.ZodNumber;
    property_count: z.ZodNumber;
    sufficient_property_count: z.ZodNumber;
    design_exclusion_property_count: z.ZodNumber;
    gap_property_count: z.ZodNumber;
    property_sufficiency_accuracy_ppm: z.ZodNumber;
    overclaim_rate_ppm: z.ZodNumber;
    underclaim_rate_ppm: z.ZodNumber;
    gap_localization_ppm: z.ZodNumber;
    overclaim_count: z.ZodNumber;
}, z.core.$strict>;
export type ExternalEvidenceMetricSummary = z.infer<typeof ExternalEvidenceMetricSummarySchema>;
export declare const ExternalEvidenceRubricSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    source_ref: z.ZodString;
    read_as: z.ZodString;
}, z.core.$strict>;
export type ExternalEvidenceRubric = z.infer<typeof ExternalEvidenceRubricSchema>;
export declare const ExternalEvidenceReferenceBundleSchema: z.ZodObject<{
    bundle_ref: z.ZodString;
    label: z.ZodString;
    vector_id: z.ZodString;
    run_id: z.ZodString;
    format: z.ZodString;
    record_count: z.ZodNumber;
    checksum_sha256: z.ZodString;
    chain_failure_seq: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type ExternalEvidenceReferenceBundle = z.infer<typeof ExternalEvidenceReferenceBundleSchema>;
export declare const ExternalEvidenceDegradationSchema: z.ZodObject<{
    degradation: z.ZodEnum<{
        "record-removal": "record-removal";
        truncation: "truncation";
        rewrite: "rewrite";
        "conflicting-copies": "conflicting-copies";
        "anchor-loss": "anchor-loss";
        "signer-substitution": "signer-substitution";
        rollback: "rollback";
        "narration-only": "narration-only";
    }>;
    integrity_finding: z.ZodString;
    affected_properties: z.ZodArray<z.ZodEnum<{
        "actor-identity": "actor-identity";
        "principal-authority": "principal-authority";
        "action-boundary": "action-boundary";
        "policy-basis": "policy-basis";
        "decision-basis": "decision-basis";
        "data-and-resource-touch": "data-and-resource-touch";
        "lifecycle-context": "lifecycle-context";
        "verification-strength": "verification-strength";
    }>>;
    insufficient_decision_ids: z.ZodArray<z.ZodString>;
    overclaim_count: z.ZodNumber;
}, z.core.$strict>;
export type ExternalEvidenceDegradationResult = z.infer<typeof ExternalEvidenceDegradationSchema>;
export declare const ExternalEvidenceInvariantSchema: z.ZodObject<{
    invariant: z.ZodEnum<{
        "authority-monotonicity": "authority-monotonicity";
        "scope-non-expansion": "scope-non-expansion";
        "deletion-propagation": "deletion-propagation";
        "provenance-preservation": "provenance-preservation";
        "rollback-traceability": "rollback-traceability";
    }>;
    episode_id: z.ZodString;
    vector_id: z.ZodString;
    obligation: z.ZodString;
    status: z.ZodEnum<{
        met: "met";
        "not-met": "not-met";
    }>;
    evidence_record_ids: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ExternalEvidenceInvariantResult = z.infer<typeof ExternalEvidenceInvariantSchema>;
export declare const ExternalEvidenceDemonstrationSideSchema: z.ZodObject<{
    side: z.ZodEnum<{
        "zero-ar": "zero-ar";
        "conventional-agent": "conventional-agent";
    }>;
    bundle_id: z.ZodString;
    bundle_ref: z.ZodString;
    terminal_state: z.ZodString;
    checkpoint_rejection_count: z.ZodNumber;
    invalidated_item_count: z.ZodNumber;
    repair_count: z.ZodNumber;
    verification_verdicts: z.ZodArray<z.ZodString>;
    honest_terminal: z.ZodBoolean;
    absence_notes: z.ZodArray<z.ZodString>;
    evidence_record_ids: z.ZodObject<{
        checkpoint_rejections: z.ZodArray<z.ZodString>;
        invalidations: z.ZodArray<z.ZodString>;
        repairs: z.ZodArray<z.ZodString>;
        verdicts: z.ZodArray<z.ZodString>;
        terminals: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ExternalEvidenceDemonstrationSideResult = z.infer<typeof ExternalEvidenceDemonstrationSideSchema>;
export declare const ExternalEvidencePairedDemonstrationSchema: z.ZodObject<{
    demonstration_id: z.ZodString;
    task_label: z.ZodString;
    injected_fault: z.ZodString;
    sides: z.ZodArray<z.ZodObject<{
        side: z.ZodEnum<{
            "zero-ar": "zero-ar";
            "conventional-agent": "conventional-agent";
        }>;
        bundle_id: z.ZodString;
        bundle_ref: z.ZodString;
        terminal_state: z.ZodString;
        checkpoint_rejection_count: z.ZodNumber;
        invalidated_item_count: z.ZodNumber;
        repair_count: z.ZodNumber;
        verification_verdicts: z.ZodArray<z.ZodString>;
        honest_terminal: z.ZodBoolean;
        absence_notes: z.ZodArray<z.ZodString>;
        evidence_record_ids: z.ZodObject<{
            checkpoint_rejections: z.ZodArray<z.ZodString>;
            invalidations: z.ZodArray<z.ZodString>;
            repairs: z.ZodArray<z.ZodString>;
            verdicts: z.ZodArray<z.ZodString>;
            terminals: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ExternalEvidencePairedDemonstration = z.infer<typeof ExternalEvidencePairedDemonstrationSchema>;
export declare const ExternalEvidenceReportSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-external-evidence-report/1">;
    report_ref: z.ZodString;
    runtime_identity: z.ZodObject<{
        product: z.ZodString;
        kernel: z.ZodString;
        release_manifest_ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    source_commit: z.ZodString;
    scorer_identity: z.ZodObject<{
        package: z.ZodLiteral<"@zero-ar/evidence">;
        version: z.ZodString;
        schema_version: z.ZodString;
        scorer_ref: z.ZodString;
    }, z.core.$strict>;
    reference_profile: z.ZodString;
    bundle_refs: z.ZodArray<z.ZodString>;
    rubrics: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        source_ref: z.ZodString;
        read_as: z.ZodString;
    }, z.core.$strict>>;
    reference_bundles: z.ZodArray<z.ZodObject<{
        bundle_ref: z.ZodString;
        label: z.ZodString;
        vector_id: z.ZodString;
        run_id: z.ZodString;
        format: z.ZodString;
        record_count: z.ZodNumber;
        checksum_sha256: z.ZodString;
        chain_failure_seq: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    decisions: z.ZodArray<z.ZodObject<{
        decision_id: z.ZodString;
        kind: z.ZodEnum<{
            "effect-dispatch": "effect-dispatch";
            "verification-verdict": "verification-verdict";
            "checkpoint-rejection": "checkpoint-rejection";
        }>;
        anchoring_record_id: z.ZodString;
        run_id: z.ZodString;
        properties: z.ZodArray<z.ZodObject<{
            family: z.ZodEnum<{
                "actor-identity": "actor-identity";
                "principal-authority": "principal-authority";
                "action-boundary": "action-boundary";
                "policy-basis": "policy-basis";
                "decision-basis": "decision-basis";
                "data-and-resource-touch": "data-and-resource-touch";
                "lifecycle-context": "lifecycle-context";
                "verification-strength": "verification-strength";
            }>;
            standing: z.ZodEnum<{
                sufficient: "sufficient";
                partial: "partial";
                missing: "missing";
                conflicting: "conflicting";
                opaque: "opaque";
            }>;
            classification: z.ZodEnum<{
                gap: "gap";
                sufficient: "sufficient";
                "design-exclusion": "design-exclusion";
            }>;
            evidence_record_ids: z.ZodArray<z.ZodString>;
            verification_strength: z.ZodEnum<{
                cryptographic: "cryptographic";
                "schema-validated": "schema-validated";
                replayable: "replayable";
                attested: "attested";
                narrated: "narrated";
            }>;
            candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            conflict: z.ZodNullable<z.ZodString>;
            clause: z.ZodOptional<z.ZodString>;
            requirement_id: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    degradations: z.ZodArray<z.ZodObject<{
        degradation: z.ZodEnum<{
            "record-removal": "record-removal";
            truncation: "truncation";
            rewrite: "rewrite";
            "conflicting-copies": "conflicting-copies";
            "anchor-loss": "anchor-loss";
            "signer-substitution": "signer-substitution";
            rollback: "rollback";
            "narration-only": "narration-only";
        }>;
        integrity_finding: z.ZodString;
        affected_properties: z.ZodArray<z.ZodEnum<{
            "actor-identity": "actor-identity";
            "principal-authority": "principal-authority";
            "action-boundary": "action-boundary";
            "policy-basis": "policy-basis";
            "decision-basis": "decision-basis";
            "data-and-resource-touch": "data-and-resource-touch";
            "lifecycle-context": "lifecycle-context";
            "verification-strength": "verification-strength";
        }>>;
        insufficient_decision_ids: z.ZodArray<z.ZodString>;
        overclaim_count: z.ZodNumber;
    }, z.core.$strict>>;
    invariants: z.ZodArray<z.ZodObject<{
        invariant: z.ZodEnum<{
            "authority-monotonicity": "authority-monotonicity";
            "scope-non-expansion": "scope-non-expansion";
            "deletion-propagation": "deletion-propagation";
            "provenance-preservation": "provenance-preservation";
            "rollback-traceability": "rollback-traceability";
        }>;
        episode_id: z.ZodString;
        vector_id: z.ZodString;
        obligation: z.ZodString;
        status: z.ZodEnum<{
            met: "met";
            "not-met": "not-met";
        }>;
        evidence_record_ids: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    paired_demonstrations: z.ZodArray<z.ZodObject<{
        demonstration_id: z.ZodString;
        task_label: z.ZodString;
        injected_fault: z.ZodString;
        sides: z.ZodArray<z.ZodObject<{
            side: z.ZodEnum<{
                "zero-ar": "zero-ar";
                "conventional-agent": "conventional-agent";
            }>;
            bundle_id: z.ZodString;
            bundle_ref: z.ZodString;
            terminal_state: z.ZodString;
            checkpoint_rejection_count: z.ZodNumber;
            invalidated_item_count: z.ZodNumber;
            repair_count: z.ZodNumber;
            verification_verdicts: z.ZodArray<z.ZodString>;
            honest_terminal: z.ZodBoolean;
            absence_notes: z.ZodArray<z.ZodString>;
            evidence_record_ids: z.ZodObject<{
                checkpoint_rejections: z.ZodArray<z.ZodString>;
                invalidations: z.ZodArray<z.ZodString>;
                repairs: z.ZodArray<z.ZodString>;
                verdicts: z.ZodArray<z.ZodString>;
                terminals: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    summary: z.ZodObject<{
        decision_count: z.ZodNumber;
        property_count: z.ZodNumber;
        sufficient_property_count: z.ZodNumber;
        design_exclusion_property_count: z.ZodNumber;
        gap_property_count: z.ZodNumber;
        property_sufficiency_accuracy_ppm: z.ZodNumber;
        overclaim_rate_ppm: z.ZodNumber;
        underclaim_rate_ppm: z.ZodNumber;
        gap_localization_ppm: z.ZodNumber;
        overclaim_count: z.ZodNumber;
    }, z.core.$strict>;
    disclaimer: z.ZodString;
}, z.core.$strict>;
export type ExternalEvidenceReport = z.infer<typeof ExternalEvidenceReportSchema>;
export declare const ExternalEvidenceCampaignOutcomeSchema: z.ZodObject<{
    bundle_ref: z.ZodString;
    vector_id: z.ZodString;
    decision_count: z.ZodNumber;
    terminal_state: z.ZodString;
    verdicts: z.ZodArray<z.ZodString>;
    effect_outcomes: z.ZodArray<z.ZodString>;
    integrity_findings: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ExternalEvidenceCampaignOutcome = z.infer<typeof ExternalEvidenceCampaignOutcomeSchema>;
export declare const ExternalEvidenceVectorReceiptSchema: z.ZodObject<{
    vector_id: z.ZodEnum<{
        "transformation-volume": "transformation-volume";
        "http-effect": "http-effect";
        "parked-human-answer": "parked-human-answer";
        "subject-erasure": "subject-erasure";
    }>;
    test_path: z.ZodString;
    test_file_ref: z.ZodString;
    log_ref: z.ZodString;
    test_count: z.ZodNumber;
    passed_count: z.ZodNumber;
    failed_count: z.ZodNumber;
    skipped_count: z.ZodNumber;
    duration_ms: z.ZodNumber;
}, z.core.$strict>;
export type ExternalEvidenceVectorReceipt = z.infer<typeof ExternalEvidenceVectorReceiptSchema>;
export declare const ExternalEvidenceCampaignManifestSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-external-evidence-campaign/1">;
    campaign_manifest_ref: z.ZodString;
    campaign_mode: z.ZodEnum<{
        fixture: "fixture";
        executed: "executed";
    }>;
    source_commit: z.ZodString;
    source_repository: z.ZodString;
    source_commit_available_on_origin: z.ZodBoolean;
    runtime_image_digest: z.ZodString;
    runtime_release_manifest_ref: z.ZodString;
    environment_kind: z.ZodEnum<{
        "orbstack-linux": "orbstack-linux";
        "github-actions-linux": "github-actions-linux";
    }>;
    os: z.ZodString;
    architecture: z.ZodString;
    container_runtime: z.ZodString;
    postgres_version: z.ZodString;
    model_fixture_ref: z.ZodString;
    effect_target_ref: z.ZodString;
    signer_test_key_ref: z.ZodString;
    dependency_lock_ref: z.ZodString;
    node_version: z.ZodString;
    campaign_profile_ref: z.ZodString;
    reference_bundle_refs: z.ZodArray<z.ZodString>;
    reference_vector_receipts: z.ZodArray<z.ZodObject<{
        vector_id: z.ZodEnum<{
            "transformation-volume": "transformation-volume";
            "http-effect": "http-effect";
            "parked-human-answer": "parked-human-answer";
            "subject-erasure": "subject-erasure";
        }>;
        test_path: z.ZodString;
        test_file_ref: z.ZodString;
        log_ref: z.ZodString;
        test_count: z.ZodNumber;
        passed_count: z.ZodNumber;
        failed_count: z.ZodNumber;
        skipped_count: z.ZodNumber;
        duration_ms: z.ZodNumber;
    }, z.core.$strict>>;
    frozen_bundle_report_ref: z.ZodString;
    reference_outcomes: z.ZodArray<z.ZodObject<{
        bundle_ref: z.ZodString;
        vector_id: z.ZodString;
        decision_count: z.ZodNumber;
        terminal_state: z.ZodString;
        verdicts: z.ZodArray<z.ZodString>;
        effect_outcomes: z.ZodArray<z.ZodString>;
        integrity_findings: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    started_at: z.ZodString;
    finished_at: z.ZodString;
    workflow_run_ref: z.ZodString;
}, z.core.$strict>;
export type ExternalEvidenceCampaignManifest = z.infer<typeof ExternalEvidenceCampaignManifestSchema>;
export declare const ExternalEvidenceComparisonSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-external-evidence-comparison/1">;
    comparison_ref: z.ZodString;
    source_commit: z.ZodString;
    campaign_profile_ref: z.ZodString;
    local_campaign_manifest_ref: z.ZodString;
    ci_campaign_manifest_ref: z.ZodString;
    semantic_outcomes: z.ZodArray<z.ZodObject<{
        bundle_ref: z.ZodString;
        vector_id: z.ZodString;
        local: z.ZodObject<{
            bundle_ref: z.ZodString;
            vector_id: z.ZodString;
            decision_count: z.ZodNumber;
            terminal_state: z.ZodString;
            verdicts: z.ZodArray<z.ZodString>;
            effect_outcomes: z.ZodArray<z.ZodString>;
            integrity_findings: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        ci: z.ZodObject<{
            bundle_ref: z.ZodString;
            vector_id: z.ZodString;
            decision_count: z.ZodNumber;
            terminal_state: z.ZodString;
            verdicts: z.ZodArray<z.ZodString>;
            effect_outcomes: z.ZodArray<z.ZodString>;
            integrity_findings: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        equal: z.ZodBoolean;
    }, z.core.$strict>>;
    frozen_bundle_report_refs: z.ZodObject<{
        local: z.ZodString;
        ci: z.ZodString;
        equal: z.ZodBoolean;
    }, z.core.$strict>;
    mismatches: z.ZodArray<z.ZodString>;
    tool_identity: z.ZodObject<{
        package: z.ZodLiteral<"@zero-ar/evidence">;
        version: z.ZodString;
        schema_version: z.ZodString;
        tool_ref: z.ZodString;
    }, z.core.$strict>;
    publishable: z.ZodBoolean;
}, z.core.$strict>;
export type ExternalEvidenceComparison = z.infer<typeof ExternalEvidenceComparisonSchema>;
export declare const IntegrityHealthSchema: z.ZodObject<{
    available: z.ZodBoolean;
    readiness: z.ZodEnum<{
        ready: "ready";
        unready: "unready";
    }>;
    anchor_backlog: z.ZodNumber;
    pending_runs: z.ZodNumber;
    reason: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type IntegrityHealth = z.infer<typeof IntegrityHealthSchema>;
/** The result surface: artifact, completion state, and what was not established. */
export declare const RunResultSchema: z.ZodObject<{
    run_id: z.ZodString;
    status: z.ZodEnum<{
        created: "created";
        running: "running";
        suspended: "suspended";
        cancelled: "cancelled";
        finished: "finished";
    }>;
    terminal: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>>;
    completion_state: z.ZodEnum<{
        working: "working";
        checkpoint_verifying: "checkpoint_verifying";
        completion_proposed: "completion_proposed";
        verifying: "verifying";
        gap_open: "gap_open";
        repair: "repair";
        complete: "complete";
        unverified_artifact: "unverified_artifact";
    }>;
    verdict: z.ZodNullable<z.ZodEnum<{
        verified: "verified";
        rejected: "rejected";
        indeterminate: "indeterminate";
        exhausted: "exhausted";
    }>>;
    verdict_reason: z.ZodNullable<z.ZodString>;
    artifact: z.ZodNullable<z.ZodObject<{
        entry_id: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>;
    items: z.ZodNullable<z.ZodObject<{
        verified: z.ZodNumber;
        completed_unverified: z.ZodNumber;
        parked: z.ZodNumber;
        dismissed: z.ZodNumber;
        failed: z.ZodNumber;
        invalidated: z.ZodNumber;
        untouched: z.ZodNumber;
    }, z.core.$strict>>;
    effects: z.ZodObject<{
        prepared: z.ZodNumber;
        dispatched: z.ZodNumber;
        committed: z.ZodNumber;
        withdrawn: z.ZodNumber;
        outcome_unknown: z.ZodNumber;
        unreconcilable: z.ZodNumber;
    }, z.core.$strict>;
    blocking_operational_outcomes: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            "parked-item": "parked-item";
            "open-effect": "open-effect";
        }>;
        reference: z.ZodString;
        state: z.ZodString;
        next: z.ZodString;
    }, z.core.$strict>>;
    not_established: z.ZodArray<z.ZodString>;
    handover: z.ZodArray<z.ZodString>;
    integrity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        ok: z.ZodBoolean;
        anchor_store_available: z.ZodBoolean;
        last_anchored_seq: z.ZodNumber;
        last_anchored_head: z.ZodNullable<z.ZodString>;
        latest_anchor_ref: z.ZodNullable<z.ZodString>;
        unanchored_tail_records: z.ZodNumber;
        unanchored_tail: z.ZodNullable<z.ZodObject<{
            from_seq: z.ZodNumber;
            to_seq: z.ZodNumber;
            reason: z.ZodString;
        }, z.core.$strict>>;
        findings: z.ZodArray<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            seq: z.ZodOptional<z.ZodNumber>;
            anchor_ref: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type RunResult = z.infer<typeof RunResultSchema>;
export declare const DiagnosticSchema: z.ZodObject<{
    code: z.ZodString;
    severity: z.ZodEnum<{
        error: "error";
        warning: "warning";
        info: "info";
    }>;
    message: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    received: z.ZodOptional<z.ZodString>;
    alternatives: z.ZodOptional<z.ZodArray<z.ZodString>>;
    fix: z.ZodOptional<z.ZodString>;
    clause: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** A durable observation event as served by the records endpoints. */
export declare const ObservationEventSchema: z.ZodObject<{
    seq: z.ZodNumber;
    record_seq: z.ZodNumber;
    event: z.ZodEnum<{
        "run.started": "run.started";
        "turn.completed": "turn.completed";
        "lease.reserved": "lease.reserved";
        "lease.consumed": "lease.consumed";
        "lease.released": "lease.released";
        "subrun.opened": "subrun.opened";
        "subrun.finished": "subrun.finished";
        "tool.invoked": "tool.invoked";
        "tool.remote.pending": "tool.remote.pending";
        "tool.finished": "tool.finished";
        "environment.prepared": "environment.prepared";
        "environment.job.submitted": "environment.job.submitted";
        "environment.job.observed": "environment.job.observed";
        "environment.job.reconciled": "environment.job.reconciled";
        "environment.job.cancelled": "environment.job.cancelled";
        "environment.artifact.collected": "environment.artifact.collected";
        "artifact.committed": "artifact.committed";
        "environment.teardown.recorded": "environment.teardown.recorded";
        "environment.abandoned": "environment.abandoned";
        "effect.prepared": "effect.prepared";
        "effect.authority.decision": "effect.authority.decision";
        "effect.authority.invalidated": "effect.authority.invalidated";
        "effect.dispatched": "effect.dispatched";
        "effect.resolved": "effect.resolved";
        "effect.unreconcilable": "effect.unreconcilable";
        "grant.superseded": "grant.superseded";
        "item.parked": "item.parked";
        "item.invalidated": "item.invalidated";
        "gap.settled": "gap.settled";
        "gap.dismissed": "gap.dismissed";
        "checkpoint.started": "checkpoint.started";
        "checkpoint.passed": "checkpoint.passed";
        "checkpoint.rejected": "checkpoint.rejected";
        "checkpoint.indeterminate": "checkpoint.indeterminate";
        "completion.proposed": "completion.proposed";
        "verification.concluded": "verification.concluded";
        "run.suspended": "run.suspended";
        "run.resume.blocked": "run.resume.blocked";
        "run.resumed": "run.resumed";
        "run.cancelled": "run.cancelled";
        "run.finished": "run.finished";
        "run.forked": "run.forked";
        "reexecution.started": "reexecution.started";
        "subject.erasure.completed": "subject.erasure.completed";
        "external.observation.received": "external.observation.received";
        "external.observation.applied": "external.observation.applied";
        "projection.rebuilt": "projection.rebuilt";
    }>;
    family: z.ZodEnum<{
        work: "work";
        artifact: "artifact";
        effect: "effect";
        review: "review";
        quality: "quality";
        terminal: "terminal";
        consumption: "consumption";
        environment: "environment";
        maintenance: "maintenance";
    }>;
    run_id: z.ZodString;
    at: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>;
export type ObservationEvent = z.infer<typeof ObservationEventSchema>;
/** One lossy text delta from the transient progress stream. */
export declare const ProgressEventSchema: z.ZodObject<{
    text: z.ZodString;
}, z.core.$strict>;
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;
export declare const HealthResponseSchema: z.ZodObject<{
    product: z.ZodString;
    contract_version: z.ZodString;
    profile: z.ZodEnum<{
        "local-lite": "local-lite";
        "full-cell": "full-cell";
        "small-production": "small-production";
        regulated: "regulated";
    }>;
    status: z.ZodEnum<{
        ready: "ready";
        unready: "unready";
        degraded: "degraded";
    }>;
    liveness: z.ZodLiteral<"live">;
    readiness: z.ZodEnum<{
        ready: "ready";
        unready: "unready";
    }>;
    components: z.ZodRecord<z.ZodString, z.ZodEnum<{
        ready: "ready";
        unreachable: "unreachable";
    }>>;
    required_components: z.ZodArray<z.ZodString>;
    guarantee_exclusions: z.ZodArray<z.ZodString>;
    capability_manifest: z.ZodObject<{
        manifest_id: z.ZodString;
        manifest_ref: z.ZodString;
        profile: z.ZodEnum<{
            "local-lite": "local-lite";
            "full-cell": "full-cell";
            "small-production": "small-production";
            regulated: "regulated";
        }>;
        version: z.ZodString;
        supported: z.ZodArray<z.ZodEnum<{
            "local-lite": "local-lite";
            "hosted-postgresql-service": "hosted-postgresql-service";
            "transformation-volume-reference-pack": "transformation-volume-reference-pack";
            "provider-openai": "provider-openai";
            "provider-anthropic": "provider-anthropic";
            "provider-openrouter": "provider-openrouter";
            "provider-together": "provider-together";
            "provider-fireworks": "provider-fireworks";
            "aggregator-composio-observation": "aggregator-composio-observation";
            "aggregator-merge-observation": "aggregator-merge-observation";
            "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
            "environment-process": "environment-process";
            "environment-oci": "environment-oci";
            "environment-ssh": "environment-ssh";
            "environment-firecracker": "environment-firecracker";
            "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
            "environment-modal": "environment-modal";
            "environment-daytona": "environment-daytona";
            "environment-vercel-sandbox": "environment-vercel-sandbox";
            "environment-apptainer": "environment-apptainer";
            "full-cell-docker-linux": "full-cell-docker-linux";
            "canonical-log": "canonical-log";
            "quality-plane": "quality-plane";
            artifacts: "artifacts";
            suspension: "suspension";
            "honest-completion": "honest-completion";
            "unattended-aggregator-mutations": "unattended-aggregator-mutations";
            "dynamic-authority": "dynamic-authority";
            "production-effect-dispatch": "production-effect-dispatch";
            "research-reference-pack": "research-reference-pack";
            "video-reference-pack": "video-reference-pack";
            "native-packaged-self-hosting": "native-packaged-self-hosting";
            "classification-airlocks": "classification-airlocks";
            "regulated-workloads": "regulated-workloads";
            "cross-run-memory": "cross-run-memory";
            "authored-orchestration": "authored-orchestration";
            "mcp-work-entrypoints": "mcp-work-entrypoints";
            "mcp-imported-tools": "mcp-imported-tools";
        }>>;
        conditional: z.ZodArray<z.ZodObject<{
            capability: z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>;
            refusal_point: z.ZodEnum<{
                "profile-compilation": "profile-compilation";
                publication: "publication";
                registration: "registration";
                intake: "intake";
                route: "route";
                "not-applicable": "not-applicable";
            }>;
            diagnostic_code: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        excluded: z.ZodArray<z.ZodObject<{
            capability: z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>;
            refusal_point: z.ZodEnum<{
                "profile-compilation": "profile-compilation";
                publication: "publication";
                registration: "registration";
                intake: "intake";
                route: "route";
                "not-applicable": "not-applicable";
            }>;
            diagnostic_code: z.ZodString;
            summary: z.ZodString;
        }, z.core.$strict>>;
        required_components: z.ZodArray<z.ZodEnum<{
            store: "store";
            migration: "migration";
            queue: "queue";
            artifact: "artifact";
            secret_store: "secret_store";
            tool_host: "tool_host";
            validator_host: "validator_host";
            authority: "authority";
            memory: "memory";
            orchestration: "orchestration";
            effect: "effect";
            mcp: "mcp";
        }>>;
        health_probes: z.ZodArray<z.ZodEnum<{
            store: "store";
            migration: "migration";
            queue: "queue";
            artifact: "artifact";
            secret_store: "secret_store";
            tool_host: "tool_host";
            validator_host: "validator_host";
            authority: "authority";
            memory: "memory";
            orchestration: "orchestration";
            effect: "effect";
            mcp: "mcp";
        }>>;
        artifact_policy: z.ZodObject<{
            tool_result_inline_threshold_bytes: z.ZodNumber;
            tool_result_max_artifact_bytes: z.ZodNumber;
            tool_result_range_read_max_bytes: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    task_contracts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        ref: z.ZodString;
    }, z.core.$strict>>;
    integrity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        available: z.ZodBoolean;
        readiness: z.ZodEnum<{
            ready: "ready";
            unready: "unready";
        }>;
        anchor_backlog: z.ZodNumber;
        pending_runs: z.ZodNumber;
        reason: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>>;
    protocol_registry: z.ZodOptional<z.ZodObject<{
        format: z.ZodLiteral<"zero-ar-interop-registry/1">;
        entries: z.ZodArray<z.ZodObject<{
            protocol: z.ZodEnum<{
                mcp: "mcp";
                a2a: "a2a";
            }>;
            direction: z.ZodEnum<{
                client: "client";
                server: "server";
            }>;
            implementation: z.ZodString;
            implementation_version: z.ZodString;
            protocol_versions: z.ZodArray<z.ZodString>;
            extensions: z.ZodArray<z.ZodString>;
            sdk_packages: z.ZodRecord<z.ZodString, z.ZodString>;
            conformance_evidence: z.ZodArray<z.ZodString>;
            known_deviations: z.ZodArray<z.ZodString>;
            retirement_date: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export declare const DatabaseMetricSummarySchema: z.ZodObject<{
    name: z.ZodString;
    unit: z.ZodEnum<{
        count: "count";
        ms: "ms";
    }>;
    count: z.ZodNumber;
    p50: z.ZodNullable<z.ZodNumber>;
    p95: z.ZodNullable<z.ZodNumber>;
    p99: z.ZodNullable<z.ZodNumber>;
    max: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type DatabaseMetricSummary = z.infer<typeof DatabaseMetricSummarySchema>;
export declare const DatabaseDoctorResponseSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-database-doctor/1">;
    ok: z.ZodBoolean;
    mode: z.ZodEnum<{
        colocated: "colocated";
        external: "external";
    }>;
    measured_at: z.ZodString;
    database: z.ZodObject<{
        reachable: z.ZodBoolean;
        name: z.ZodNullable<z.ZodString>;
        server_version: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    connection_pool: z.ZodObject<{
        max: z.ZodNumber;
        total: z.ZodNumber;
        idle: z.ZodNumber;
        waiting: z.ZodNumber;
        saturation: z.ZodNumber;
    }, z.core.$strict>;
    roles: z.ZodArray<z.ZodObject<{
        purpose: z.ZodEnum<{
            migration: "migration";
            runtime: "runtime";
            signer: "signer";
        }>;
        role: z.ZodString;
        ok: z.ZodBoolean;
        checks: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    forced_rls: z.ZodObject<{
        ok: z.ZodBoolean;
        failures: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    latency: z.ZodObject<{
        rtt_ms: z.ZodNullable<z.ZodNumber>;
        critical_path_round_trips: z.ZodNumber;
        observed_run_transition_samples: z.ZodNumber;
        observed_observation_samples: z.ZodNumber;
        expected_additive_run_latency_ms: z.ZodNullable<z.ZodNumber>;
        meets_ratified_reference_targets: z.ZodBoolean;
        warning: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    metrics: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        unit: z.ZodEnum<{
            count: "count";
            ms: "ms";
        }>;
        count: z.ZodNumber;
        p50: z.ZodNullable<z.ZodNumber>;
        p95: z.ZodNullable<z.ZodNumber>;
        p99: z.ZodNullable<z.ZodNumber>;
        max: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DatabaseDoctorResponse = z.infer<typeof DatabaseDoctorResponseSchema>;
export declare const PostgresLatencyRawSampleSchema: z.ZodObject<{
    topology: z.ZodEnum<{
        colocated: "colocated";
        "same-region-external": "same-region-external";
        "controlled-added-latency": "controlled-added-latency";
    }>;
    operation: z.ZodEnum<{
        append: "append";
        reconstruction: "reconstruction";
        checkpoint: "checkpoint";
        "representative-run-transition": "representative-run-transition";
    }>;
    database_mode: z.ZodEnum<{
        colocated: "colocated";
        external: "external";
    }>;
    environment_ref: z.ZodString;
    samples_ms: z.ZodArray<z.ZodNumber>;
}, z.core.$strict>;
export type PostgresLatencyRawSample = z.infer<typeof PostgresLatencyRawSampleSchema>;
export declare const PostgresLatencyReportRowSchema: z.ZodObject<{
    topology: z.ZodEnum<{
        colocated: "colocated";
        "same-region-external": "same-region-external";
        "controlled-added-latency": "controlled-added-latency";
    }>;
    operation: z.ZodEnum<{
        append: "append";
        reconstruction: "reconstruction";
        checkpoint: "checkpoint";
        "representative-run-transition": "representative-run-transition";
    }>;
    database_mode: z.ZodEnum<{
        colocated: "colocated";
        external: "external";
    }>;
    environment_ref: z.ZodString;
    sample_count: z.ZodNumber;
    min_ms: z.ZodNumber;
    p50_ms: z.ZodNumber;
    p95_ms: z.ZodNumber;
    p99_ms: z.ZodNumber;
    max_ms: z.ZodNumber;
}, z.core.$strict>;
export type PostgresLatencyReportRow = z.infer<typeof PostgresLatencyReportRowSchema>;
export declare const PostgresLatencyFiveHourOverheadSchema: z.ZodObject<{
    topology: z.ZodEnum<{
        colocated: "colocated";
        "same-region-external": "same-region-external";
        "controlled-added-latency": "controlled-added-latency";
    }>;
    representative_transition_count: z.ZodNumber;
    p50_control_plane_overhead_ms: z.ZodNumber;
    p95_control_plane_overhead_ms: z.ZodNumber;
    p99_control_plane_overhead_ms: z.ZodNumber;
    scope: z.ZodLiteral<"control-plane-only">;
}, z.core.$strict>;
export type PostgresLatencyFiveHourOverhead = z.infer<typeof PostgresLatencyFiveHourOverheadSchema>;
export declare const PostgresLatencyReportSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-postgres-latency-report/1">;
    report_ref: z.ZodString;
    source_commit: z.ZodString;
    generated_at: z.ZodString;
    measurement_status: z.ZodEnum<{
        "fixture-format-only": "fixture-format-only";
        "uat-measured": "uat-measured";
    }>;
    uat_evidence: z.ZodBoolean;
    status_reason: z.ZodString;
    representative_transition_count: z.ZodNumber;
    row_count: z.ZodNumber;
    rows: z.ZodArray<z.ZodObject<{
        topology: z.ZodEnum<{
            colocated: "colocated";
            "same-region-external": "same-region-external";
            "controlled-added-latency": "controlled-added-latency";
        }>;
        operation: z.ZodEnum<{
            append: "append";
            reconstruction: "reconstruction";
            checkpoint: "checkpoint";
            "representative-run-transition": "representative-run-transition";
        }>;
        database_mode: z.ZodEnum<{
            colocated: "colocated";
            external: "external";
        }>;
        environment_ref: z.ZodString;
        sample_count: z.ZodNumber;
        min_ms: z.ZodNumber;
        p50_ms: z.ZodNumber;
        p95_ms: z.ZodNumber;
        p99_ms: z.ZodNumber;
        max_ms: z.ZodNumber;
    }, z.core.$strict>>;
    five_hour_control_plane_overhead: z.ZodArray<z.ZodObject<{
        topology: z.ZodEnum<{
            colocated: "colocated";
            "same-region-external": "same-region-external";
            "controlled-added-latency": "controlled-added-latency";
        }>;
        representative_transition_count: z.ZodNumber;
        p50_control_plane_overhead_ms: z.ZodNumber;
        p95_control_plane_overhead_ms: z.ZodNumber;
        p99_control_plane_overhead_ms: z.ZodNumber;
        scope: z.ZodLiteral<"control-plane-only">;
    }, z.core.$strict>>;
    disclaimer: z.ZodString;
}, z.core.$strict>;
export type PostgresLatencyReport = z.infer<typeof PostgresLatencyReportSchema>;
export declare const CreatedRunSchema: z.ZodObject<{
    run_id: z.ZodString;
    created: z.ZodBoolean;
    snapshot: z.ZodObject<{
        run_id: z.ZodString;
        status: z.ZodEnum<{
            created: "created";
            running: "running";
            suspended: "suspended";
            cancelled: "cancelled";
            finished: "finished";
        }>;
        completion_state: z.ZodEnum<{
            working: "working";
            checkpoint_verifying: "checkpoint_verifying";
            completion_proposed: "completion_proposed";
            verifying: "verifying";
            gap_open: "gap_open";
            repair: "repair";
            complete: "complete";
            unverified_artifact: "unverified_artifact";
        }>;
        terminal: z.ZodNullable<z.ZodEnum<{
            cancelled: "cancelled";
            complete: "complete";
            unverified_artifact: "unverified_artifact";
        }>>;
        suspend_reason: z.ZodNullable<z.ZodEnum<{
            budget_exhausted: "budget_exhausted";
            provider_failure: "provider_failure";
            awaiting_answer: "awaiting_answer";
            operator_pause: "operator_pause";
            stagnation: "stagnation";
            remote_task: "remote_task";
        }>>;
        turn: z.ZodNumber;
        current_branch: z.ZodNullable<z.ZodString>;
        head_entry_id: z.ZodNullable<z.ZodString>;
        entry_count: z.ZodNumber;
        agent_name: z.ZodString;
        model_ref: z.ZodString;
        objective: z.ZodString;
        budgets: z.ZodNullable<z.ZodObject<{
            consumption: z.ZodObject<{
                model_tokens: z.ZodNumber;
                tool_calls: z.ZodOptional<z.ZodNumber>;
                bytes: z.ZodOptional<z.ZodNumber>;
                compute_ms: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>;
            attention: z.ZodNumber;
            verification_reserve_fraction: z.ZodNumber;
            max_turns: z.ZodNumber;
        }, z.core.$strict>>;
        usage: z.ZodRecord<z.ZodString, z.ZodObject<{
            reserved: z.ZodNumber;
            consumed: z.ZodNumber;
        }, z.core.$strict>>;
        verified_completion_reachable: z.ZodBoolean;
        items: z.ZodNullable<z.ZodRecord<z.ZodEnum<{
            verified: "verified";
            untouched: "untouched";
            completed_unverified: "completed_unverified";
            parked: "parked";
            dismissed: "dismissed";
            failed: "failed";
            invalidated: "invalidated";
        }>, z.ZodNumber>>;
        contract: z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
            ref: z.ZodString;
            repair_attempts_used: z.ZodNumber;
            repair_budget: z.ZodNumber;
        }, z.core.$strict>>;
        snapshot_version: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CreatedRun = z.infer<typeof CreatedRunSchema>;
export declare const ControlAcceptedSchema: z.ZodObject<{
    accepted_seq: z.ZodNumber;
}, z.core.$strict>;
export type ControlAccepted = z.infer<typeof ControlAcceptedSchema>;
export declare const RunRefSchema: z.ZodObject<{
    run_id: z.ZodString;
}, z.core.$strict>;
export type RunRef = z.infer<typeof RunRefSchema>;
export declare const StartAcceptedSchema: z.ZodObject<{
    run_id: z.ZodString;
    accepted: z.ZodBoolean;
    repeated: z.ZodBoolean;
    accepted_seq: z.ZodNumber;
}, z.core.$strict>;
export type StartAccepted = z.infer<typeof StartAcceptedSchema>;
export declare const RebuildOutcomeSchema: z.ZodObject<{
    equal: z.ZodBoolean;
    healed: z.ZodBoolean;
}, z.core.$strict>;
export type RebuildOutcome = z.infer<typeof RebuildOutcomeSchema>;
export declare const ImportOutcomeSchema: z.ZodObject<{
    run_id: z.ZodString;
    head_equal: z.ZodBoolean;
    records: z.ZodNumber;
}, z.core.$strict>;
export type ImportOutcome = z.infer<typeof ImportOutcomeSchema>;
export declare const RecordsPageSchema: z.ZodObject<{
    records: z.ZodArray<z.ZodObject<{
        record_id: z.ZodString;
        run_id: z.ZodString;
        seq: z.ZodNumber;
        logical_clock: z.ZodNumber;
        causal_parent: z.ZodNullable<z.ZodString>;
        type: z.ZodEnum<{
            "run.created": "run.created";
            "run.started": "run.started";
            "entry.appended": "entry.appended";
            "branch.created": "branch.created";
            "branch.head.moved": "branch.head.moved";
            "context.assembled": "context.assembled";
            "model.call.started": "model.call.started";
            "model.call.finished": "model.call.finished";
            "model.call.failed": "model.call.failed";
            "model.fallback.switched": "model.fallback.switched";
            "turn.completed": "turn.completed";
            "control.received": "control.received";
            "control.applied": "control.applied";
            "lease.opened": "lease.opened";
            "lease.reserved": "lease.reserved";
            "lease.consumed": "lease.consumed";
            "lease.released": "lease.released";
            "subrun.opened": "subrun.opened";
            "subrun.finished": "subrun.finished";
            "tool.invoked": "tool.invoked";
            "tool.remote.pending": "tool.remote.pending";
            "tool.finished": "tool.finished";
            "environment.prepare.requested": "environment.prepare.requested";
            "environment.prepared": "environment.prepared";
            "environment.job.submit.requested": "environment.job.submit.requested";
            "environment.job.submitted": "environment.job.submitted";
            "environment.job.observe.requested": "environment.job.observe.requested";
            "environment.job.observed": "environment.job.observed";
            "environment.job.reconcile.requested": "environment.job.reconcile.requested";
            "environment.job.reconciled": "environment.job.reconciled";
            "environment.job.cancel.requested": "environment.job.cancel.requested";
            "environment.job.cancelled": "environment.job.cancelled";
            "environment.artifact.collect.requested": "environment.artifact.collect.requested";
            "environment.artifact.collected": "environment.artifact.collected";
            "artifact.committed": "artifact.committed";
            "environment.teardown.requested": "environment.teardown.requested";
            "environment.teardown.recorded": "environment.teardown.recorded";
            "environment.abandon.requested": "environment.abandon.requested";
            "environment.abandoned": "environment.abandoned";
            "effect.prepared": "effect.prepared";
            "effect.authority.decision": "effect.authority.decision";
            "effect.authority.invalidated": "effect.authority.invalidated";
            "effect.dispatched": "effect.dispatched";
            "effect.resolved": "effect.resolved";
            "effect.unreconcilable": "effect.unreconcilable";
            "grant.superseded": "grant.superseded";
            "item.attempted": "item.attempted";
            "item.parked": "item.parked";
            "item.invalidated": "item.invalidated";
            "gap.settled": "gap.settled";
            "gap.dismissed": "gap.dismissed";
            "checkpoint.started": "checkpoint.started";
            "checkpoint.passed": "checkpoint.passed";
            "checkpoint.rejected": "checkpoint.rejected";
            "checkpoint.indeterminate": "checkpoint.indeterminate";
            "repair.started": "repair.started";
            "completion.proposed": "completion.proposed";
            "verification.concluded": "verification.concluded";
            "run.suspended": "run.suspended";
            "run.resume.blocked": "run.resume.blocked";
            "run.resumed": "run.resumed";
            "run.cancelled": "run.cancelled";
            "run.finished": "run.finished";
            "run.forked": "run.forked";
            "reexecution.started": "reexecution.started";
            "subject.erasure.completed": "subject.erasure.completed";
            "wake.scheduled": "wake.scheduled";
            "wake.claimed": "wake.claimed";
            "memory.event.recorded": "memory.event.recorded";
            "memory.read.recorded": "memory.read.recorded";
            "external.observation.received": "external.observation.received";
            "external.observation.applied": "external.observation.applied";
            "projection.rebuilt": "projection.rebuilt";
            "run.lifecycle.command.accepted": "run.lifecycle.command.accepted";
        }>;
        type_version: z.ZodNumber;
        at: z.ZodString;
        payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        chain_hash: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RecordsPage = z.infer<typeof RecordsPageSchema>;
/** One tenant-visible review item reconstructed from its durable run records. */
export declare const ReviewItemSchema: z.ZodObject<{
    run_id: z.ZodString;
    item_id: z.ZodString;
    kind: z.ZodEnum<{
        gap: "gap";
        "human-validator": "human-validator";
        approval: "approval";
    }>;
    state: z.ZodEnum<{
        pending: "pending";
    }>;
    opened_seq: z.ZodNumber;
    opened_at: z.ZodString;
    reason: z.ZodString;
    checkpoint_id: z.ZodString;
}, z.core.$strict>;
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
export declare const ReviewInboxSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        run_id: z.ZodString;
        item_id: z.ZodString;
        kind: z.ZodEnum<{
            gap: "gap";
            "human-validator": "human-validator";
            approval: "approval";
        }>;
        state: z.ZodEnum<{
            pending: "pending";
        }>;
        opened_seq: z.ZodNumber;
        opened_at: z.ZodString;
        reason: z.ZodString;
        checkpoint_id: z.ZodString;
    }, z.core.$strict>>;
    truncated: z.ZodBoolean;
}, z.core.$strict>;
export type ReviewInbox = z.infer<typeof ReviewInboxSchema>;
/** The operator's erasure order: a named person, a subject, exact entries (ECV-006, XCV-010). */
export declare const ErasureRequestSchema: z.ZodObject<{
    subject: z.ZodString;
    entry_ids: z.ZodArray<z.ZodString>;
    by: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type ErasureRequest = z.infer<typeof ErasureRequestSchema>;
export declare const ErasureOutcomeSchema: z.ZodObject<{
    run_id: z.ZodString;
    erased: z.ZodNumber;
}, z.core.$strict>;
export type ErasureOutcome = z.infer<typeof ErasureOutcomeSchema>;
export declare const BindingProfileSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    slot: z.ZodEnum<{
        "runtime-scratch": "runtime-scratch";
        "customer-readable-external": "customer-readable-external";
    }>;
    path_prefix: z.ZodString;
    operations: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        operation_class: z.ZodEnum<{
            observation: "observation";
            "run-internal": "run-internal";
            "effect-proposal": "effect-proposal";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BindingProfile = z.infer<typeof BindingProfileSchema>;
export declare const PostureSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    owner: z.ZodString;
    verification_reserve_fraction: z.ZodNumber;
    optimization: z.ZodOptional<z.ZodObject<{
        checkpoint: z.ZodOptional<z.ZodObject<{
            selector: z.ZodLiteral<"young-daly-items-v1">;
            mode: z.ZodEnum<{
                off: "off";
                observe: "observe";
                enforce: "enforce";
            }>;
            checkpoint_cost: z.ZodNumber;
            recompute_cost: z.ZodNumber;
            hazard_per_million: z.ZodNumber;
            minimum_items: z.ZodNumber;
            maximum_items: z.ZodNumber;
            fallback_interval: z.ZodNumber;
            arithmetic: z.ZodLiteral<"integer-sqrt-v1">;
        }, z.core.$strict>>;
        context: z.ZodOptional<z.ZodObject<{
            selector: z.ZodLiteral<"coverage-mmr-v1">;
            mode: z.ZodEnum<{
                off: "off";
                observe: "observe";
                enforce: "enforce";
            }>;
            coverage_weight_ppm: z.ZodNumber;
            recency_weight_ppm: z.ZodNumber;
            redundancy_weight_ppm: z.ZodNumber;
            candidate_cutoff: z.ZodNumber;
            arithmetic: z.ZodLiteral<"integer-score-v1">;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type Posture = z.infer<typeof PostureSchema>;
/** A machine predicate: kebab words, no prose. The compiler refuses anything else. */
export declare const MACHINE_PREDICATE: RegExp;
export declare const PackClaimSchema: z.ZodObject<{
    predicate: z.ZodString;
    kind: z.ZodEnum<{
        capability: "capability";
        coverage: "coverage";
        limitation: "limitation";
    }>;
    evidence: z.ZodObject<{
        validator: z.ZodString;
        version: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PackClaim = z.infer<typeof PackClaimSchema>;
export declare const DomainPackSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    task_contract: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        invariants: z.ZodArray<z.ZodString>;
        acceptance_rules: z.ZodArray<z.ZodString>;
        checkpoint_every_items: z.ZodNumber;
        checkpoint_phase_boundaries: z.ZodOptional<z.ZodArray<z.ZodObject<{
            phase: z.ZodString;
            starts_after_items: z.ZodNumber;
            checkpoint_every_items: z.ZodNumber;
        }, z.core.$strict>>>;
        dependency_frontier: z.ZodEnum<{
            "independent-items": "independent-items";
            "run-start": "run-start";
            "declared-dependencies": "declared-dependencies";
        }>;
        repair_budget_attempts: z.ZodNumber;
        claim_representation: z.ZodOptional<z.ZodEnum<{
            "structured-claims-with-citations": "structured-claims-with-citations";
        }>>;
        validators: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            class: z.ZodEnum<{
                deterministic: "deterministic";
                "sampled-oracle": "sampled-oracle";
                heuristic: "heuristic";
                "named-human": "named-human";
            }>;
            covers: z.ZodArray<z.ZodString>;
            sufficient_for: z.ZodArray<z.ZodString>;
            cost_wall_ms: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        predicate: z.ZodString;
        kind: z.ZodEnum<{
            capability: "capability";
            coverage: "coverage";
            limitation: "limitation";
        }>;
        evidence: z.ZodObject<{
            validator: z.ZodString;
            version: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    notes: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type DomainPack = z.infer<typeof DomainPackSchema>;
export declare const CompiledPackSchema: z.ZodObject<{
    pack_ref: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    claims: z.ZodArray<z.ZodObject<{
        predicate: z.ZodString;
        kind: z.ZodEnum<{
            capability: "capability";
            coverage: "coverage";
            limitation: "limitation";
        }>;
        evidence: z.ZodObject<{
            validator: z.ZodString;
            version: z.ZodString;
        }, z.core.$strict>;
        resolved: z.ZodLiteral<true>;
    }, z.core.$strict>>;
    informational_notes: z.ZodObject<{
        authority: z.ZodLiteral<"none">;
        rendering: z.ZodString;
        notes: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type CompiledPack = z.infer<typeof CompiledPackSchema>;
/**
 * The footprint registry: every public shape mapped to its structural home
 * and owner. The inventory script renders and gates this (DX-016).
 */
export declare const SCHEMA_REGISTRY: {
    readonly PrincipalsSchema: {
        readonly schema: z.ZodObject<{
            executing: z.ZodString;
            originating: z.ZodString;
            accountable: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ConsumptionSchema: {
        readonly schema: z.ZodObject<{
            model_tokens: z.ZodNumber;
            tool_calls: z.ZodOptional<z.ZodNumber>;
            bytes: z.ZodOptional<z.ZodNumber>;
            compute_ms: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-resources";
    };
    readonly BudgetsSchema: {
        readonly schema: z.ZodObject<{
            consumption: z.ZodObject<{
                model_tokens: z.ZodNumber;
                tool_calls: z.ZodOptional<z.ZodNumber>;
                bytes: z.ZodOptional<z.ZodNumber>;
                compute_ms: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>;
            attention: z.ZodNumber;
            verification_reserve_fraction: z.ZodNumber;
            max_turns: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-resources";
    };
    readonly InputArtifactBindingSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            required_for_completion: z.ZodDefault<z.ZodBoolean>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ResolvedInputArtifactSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            manifest_ref: z.ZodString;
            tenant: z.ZodString;
            source_run_id: z.ZodString;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            required_for_completion: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "runtime-identity";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactIntendedUseSchema: {
        readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"run">;
            run_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"intake">;
            intake_ref: z.ZodString;
        }, z.core.$strict>], "kind">;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactProvenanceInputSchema: {
        readonly schema: z.ZodObject<{
            source: z.ZodString;
            source_event_id: z.ZodOptional<z.ZodString>;
            observed_at: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactSessionRequestSchema: {
        readonly schema: z.ZodObject<{
            idempotency_key: z.ZodString;
            expected_content_hash: z.ZodString;
            expected_bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            provenance: z.ZodObject<{
                source: z.ZodString;
                source_event_id: z.ZodOptional<z.ZodString>;
                observed_at: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"run">;
                run_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"intake">;
                intake_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
            retention_expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactManifestSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            manifest_ref: z.ZodString;
            backend: z.ZodEnum<{
                filesystem: "filesystem";
                "s3-compatible": "s3-compatible";
            }>;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            application_principal: z.ZodString;
            intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"run">;
                run_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"intake">;
                intake_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
            provenance: z.ZodObject<{
                source: z.ZodString;
                source_event_id: z.ZodOptional<z.ZodString>;
                observed_at: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            created_at: z.ZodString;
            retention_expires_at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactCommittedRecordSchema: {
        readonly schema: z.ZodObject<{
            idempotency_key: z.ZodString;
            artifact_ref: z.ZodString;
            manifest_ref: z.ZodString;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            evidence_grade: z.ZodEnum<{
                original: "original";
                derived: "derived";
                "model-generated": "model-generated";
            }>;
            application_principal: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactReadySessionSchema: {
        readonly schema: z.ZodObject<{
            session_id: z.ZodString;
            status: z.ZodLiteral<"ready">;
            offset: z.ZodNumber;
            expected_bytes: z.ZodNumber;
            expected_content_hash: z.ZodString;
            max_chunk_bytes: z.ZodNumber;
            application_principal: z.ZodString;
            intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"run">;
                run_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"intake">;
                intake_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactCommittedSessionSchema: {
        readonly schema: z.ZodObject<{
            session_id: z.ZodString;
            status: z.ZodLiteral<"committed">;
            artifact: z.ZodObject<{
                artifact_ref: z.ZodString;
                manifest_ref: z.ZodString;
                backend: z.ZodEnum<{
                    filesystem: "filesystem";
                    "s3-compatible": "s3-compatible";
                }>;
                content_hash: z.ZodString;
                bytes: z.ZodNumber;
                media_type: z.ZodString;
                classification: z.ZodEnum<{
                    public: "public";
                    internal: "internal";
                    confidential: "confidential";
                    restricted: "restricted";
                }>;
                evidence_grade: z.ZodEnum<{
                    original: "original";
                    derived: "derived";
                    "model-generated": "model-generated";
                }>;
                application_principal: z.ZodString;
                intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"run">;
                    run_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"intake">;
                    intake_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                provenance: z.ZodObject<{
                    source: z.ZodString;
                    source_event_id: z.ZodOptional<z.ZodString>;
                    observed_at: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                created_at: z.ZodString;
                retention_expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RuntimeArtifactSessionStatusSchema: {
        readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
            session_id: z.ZodString;
            status: z.ZodLiteral<"ready">;
            offset: z.ZodNumber;
            expected_bytes: z.ZodNumber;
            expected_content_hash: z.ZodString;
            max_chunk_bytes: z.ZodNumber;
            application_principal: z.ZodString;
            intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"run">;
                run_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"intake">;
                intake_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
        }, z.core.$strict>, z.ZodObject<{
            session_id: z.ZodString;
            status: z.ZodLiteral<"committed">;
            artifact: z.ZodObject<{
                artifact_ref: z.ZodString;
                manifest_ref: z.ZodString;
                backend: z.ZodEnum<{
                    filesystem: "filesystem";
                    "s3-compatible": "s3-compatible";
                }>;
                content_hash: z.ZodString;
                bytes: z.ZodNumber;
                media_type: z.ZodString;
                classification: z.ZodEnum<{
                    public: "public";
                    internal: "internal";
                    confidential: "confidential";
                    restricted: "restricted";
                }>;
                evidence_grade: z.ZodEnum<{
                    original: "original";
                    derived: "derived";
                    "model-generated": "model-generated";
                }>;
                application_principal: z.ZodString;
                intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
                    kind: z.ZodLiteral<"run">;
                    run_id: z.ZodString;
                }, z.core.$strict>, z.ZodObject<{
                    kind: z.ZodLiteral<"intake">;
                    intake_ref: z.ZodString;
                }, z.core.$strict>], "kind">;
                provenance: z.ZodObject<{
                    source: z.ZodString;
                    source_event_id: z.ZodOptional<z.ZodString>;
                    observed_at: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>;
                created_at: z.ZodString;
                retention_expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>], "status">;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationContentSchema: {
        readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"text">;
            text: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"data">;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>], "kind">;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationArtifactSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationProvenanceSchema: {
        readonly schema: z.ZodObject<{
            source: z.ZodString;
            trace_ref: z.ZodOptional<z.ZodString>;
            claimed_actor: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationRequestSchema: {
        readonly schema: z.ZodObject<{
            idempotency_key: z.ZodString;
            source: z.ZodObject<{
                channel: z.ZodEnum<{
                    system: "system";
                    web: "web";
                    mobile: "mobile";
                    voice: "voice";
                    sms: "sms";
                    email: "email";
                    chat: "chat";
                    other: "other";
                }>;
                event_id: z.ZodString;
            }, z.core.$strict>;
            observed_at: z.ZodString;
            content: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strict>], "kind">;
            artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                artifact_ref: z.ZodString;
                content_hash: z.ZodString;
            }, z.core.$strict>>>;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            provenance: z.ZodObject<{
                source: z.ZodString;
                trace_ref: z.ZodOptional<z.ZodString>;
                claimed_actor: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly VerifiedRepresentedActorSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            issuer: z.ZodString;
            audience: z.ZodString;
            claims_ref: z.ZodString;
            credential_id: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationRecordedSchema: {
        readonly schema: z.ZodObject<{
            observation_id: z.ZodString;
            idempotency_key: z.ZodString;
            request_fingerprint: z.ZodString;
            source: z.ZodObject<{
                channel: z.ZodEnum<{
                    system: "system";
                    web: "web";
                    mobile: "mobile";
                    voice: "voice";
                    sms: "sms";
                    email: "email";
                    chat: "chat";
                    other: "other";
                }>;
                event_id: z.ZodString;
            }, z.core.$strict>;
            observed_at: z.ZodString;
            received_at: z.ZodString;
            content: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"text">;
                text: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"data">;
                data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, z.core.$strict>], "kind">;
            artifacts: z.ZodArray<z.ZodObject<{
                artifact_ref: z.ZodString;
                content_hash: z.ZodString;
            }, z.core.$strict>>;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            provenance: z.ZodObject<{
                source: z.ZodString;
                trace_ref: z.ZodOptional<z.ZodString>;
                claimed_actor: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            application_principal: z.ZodString;
            represented_actor: z.ZodNullable<z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationAppliedSchema: {
        readonly schema: z.ZodObject<{
            observation_id: z.ZodString;
            idempotency_key: z.ZodString;
            entry_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ExternalObservationAcceptedSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            observation_id: z.ZodString;
            accepted_seq: z.ZodNumber;
            received_at: z.ZodString;
            application_principal: z.ZodString;
            represented_actor: z.ZodNullable<z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly EffectApprovalRequestSchema: {
        readonly schema: z.ZodObject<{
            idempotency_key: z.ZodString;
            target: z.ZodString;
            operation: z.ZodString;
            param_hash: z.ZodString;
            magnitude: z.ZodNullable<z.ZodNumber>;
            expires_at: z.ZodString;
            decision: z.ZodEnum<{
                approve: "approve";
                refuse: "refuse";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "effect-plane";
    };
    readonly EffectApprovalActorSchema: {
        readonly schema: z.ZodObject<{
            application_principal: z.ZodString;
            approver: z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "runtime-identity";
        readonly owner: "effect-plane";
    };
    readonly EffectApprovalRecordedSchema: {
        readonly schema: z.ZodObject<{
            decision_id: z.ZodString;
            idempotency_key: z.ZodString;
            request_fingerprint: z.ZodString;
            tenant: z.ZodString;
            run_id: z.ZodString;
            effect_id: z.ZodString;
            target: z.ZodString;
            operation: z.ZodString;
            param_hash: z.ZodString;
            magnitude: z.ZodNullable<z.ZodNumber>;
            grant_ref: z.ZodString;
            application_principal: z.ZodString;
            approver: z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            scope: z.ZodLiteral<"effect:approve">;
            scope_epoch: z.ZodNumber;
            authority_epoch: z.ZodNumber;
            expires_at: z.ZodString;
            decision: z.ZodEnum<{
                approve: "approve";
                refuse: "refuse";
            }>;
            disposition: z.ZodEnum<{
                approved: "approved";
                refused: "refused";
                expired: "expired";
            }>;
            reason: z.ZodString;
            recorded_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "effect-plane";
    };
    readonly EffectApprovalInvalidatedSchema: {
        readonly schema: z.ZodObject<{
            decision_id: z.ZodString;
            run_id: z.ZodString;
            effect_id: z.ZodString;
            reason: z.ZodEnum<{
                expired: "expired";
                "authority-epoch-changed": "authority-epoch-changed";
                "scope-epoch-changed": "scope-epoch-changed";
            }>;
            approved_authority_epoch: z.ZodNumber;
            current_authority_epoch: z.ZodNumber;
            approved_scope_epoch: z.ZodNumber;
            current_scope_epoch: z.ZodNumber;
            invalidated_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "effect-plane";
    };
    readonly EffectApprovalAcceptedSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            effect_id: z.ZodString;
            decision_id: z.ZodString;
            decision: z.ZodEnum<{
                approve: "approve";
                refuse: "refuse";
            }>;
            disposition: z.ZodEnum<{
                approved: "approved";
                refused: "refused";
                expired: "expired";
            }>;
            application_principal: z.ZodString;
            approver: z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            scope_epoch: z.ZodNumber;
            authority_epoch: z.ZodNumber;
            expires_at: z.ZodString;
            recorded_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "effect-plane";
    };
    readonly EffectAuthorityDecisionCommandSchema: {
        readonly schema: z.ZodObject<{
            reason: z.ZodString;
            idempotency_key: z.ZodString;
            request_fingerprint: z.ZodString;
            application_principal: z.ZodString;
            run_id: z.ZodString;
            target: z.ZodString;
            operation: z.ZodString;
            param_hash: z.ZodString;
            magnitude: z.ZodNullable<z.ZodNumber>;
            expires_at: z.ZodString;
            decision: z.ZodEnum<{
                approve: "approve";
                refuse: "refuse";
            }>;
            approver: z.ZodObject<{
                subject: z.ZodString;
                issuer: z.ZodString;
                audience: z.ZodString;
                claims_ref: z.ZodString;
                credential_id: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            tenant: z.ZodString;
            effect_id: z.ZodString;
            grant_ref: z.ZodString;
            scope: z.ZodLiteral<"effect:approve">;
            scope_epoch: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "effect-dispatch";
        readonly owner: "effect-plane";
    };
    readonly EffectAuthorityDecisionLookupSchema: {
        readonly schema: z.ZodObject<{
            tenant: z.ZodString;
            run_id: z.ZodString;
            effect_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "effect-dispatch";
        readonly owner: "effect-plane";
    };
    readonly RemoteToolTaskHandleSchema: {
        readonly schema: z.ZodObject<{
            protocol: z.ZodLiteral<"mcp">;
            invoke_id: z.ZodString;
            tool: z.ZodString;
            original_call_ref: z.ZodString;
            peer_binding_ref: z.ZodString;
            execution_binding_ref: z.ZodString;
            peer_task_id: z.ZodNullable<z.ZodString>;
            state: z.ZodEnum<{
                working: "working";
                outcome_unknown: "outcome_unknown";
                input_required: "input_required";
            }>;
            cause: z.ZodEnum<{
                "peer-task": "peer-task";
                "transport-loss": "transport-loss";
            }>;
            last_position: z.ZodNullable<z.ZodString>;
            observed_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly IntakeRequestSchema: {
        readonly schema: z.ZodObject<{
            objective: z.ZodString;
            agent_ref: z.ZodOptional<z.ZodString>;
            principals: z.ZodObject<{
                executing: z.ZodString;
                originating: z.ZodString;
                accountable: z.ZodString;
            }, z.core.$strict>;
            budgets: z.ZodObject<{
                consumption: z.ZodObject<{
                    model_tokens: z.ZodNumber;
                    tool_calls: z.ZodOptional<z.ZodNumber>;
                    bytes: z.ZodOptional<z.ZodNumber>;
                    compute_ms: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                attention: z.ZodNumber;
                verification_reserve_fraction: z.ZodNumber;
                max_turns: z.ZodNumber;
            }, z.core.$strict>;
            task_contract_ref: z.ZodOptional<z.ZodString>;
            posture_ref: z.ZodOptional<z.ZodString>;
            inputs: z.ZodOptional<z.ZodObject<{
                items: z.ZodOptional<z.ZodArray<z.ZodString>>;
                artifacts: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    artifact_ref: z.ZodString;
                    content_hash: z.ZodString;
                    bytes: z.ZodNumber;
                    media_type: z.ZodString;
                    classification: z.ZodEnum<{
                        public: "public";
                        internal: "internal";
                        confidential: "confidential";
                        restricted: "restricted";
                    }>;
                    evidence_grade: z.ZodEnum<{
                        original: "original";
                        derived: "derived";
                        "model-generated": "model-generated";
                    }>;
                    required_for_completion: z.ZodDefault<z.ZodBoolean>;
                }, z.core.$strict>>>;
            }, z.core.$strict>>;
            idempotency_key: z.ZodString;
            correlation_id: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ResolvedRunManifestSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"resolved-run-manifest/1">;
            contract_version: z.ZodLiteral<"v1">;
            runtime: z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                ref: z.ZodString;
            }, z.core.$strict>;
            profile_manifest: z.ZodObject<{
                manifest_id: z.ZodString;
                manifest_ref: z.ZodString;
                profile: z.ZodEnum<{
                    "local-lite": "local-lite";
                    "full-cell": "full-cell";
                    "small-production": "small-production";
                    regulated: "regulated";
                }>;
                version: z.ZodString;
                supported: z.ZodArray<z.ZodEnum<{
                    "local-lite": "local-lite";
                    "hosted-postgresql-service": "hosted-postgresql-service";
                    "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                    "provider-openai": "provider-openai";
                    "provider-anthropic": "provider-anthropic";
                    "provider-openrouter": "provider-openrouter";
                    "provider-together": "provider-together";
                    "provider-fireworks": "provider-fireworks";
                    "aggregator-composio-observation": "aggregator-composio-observation";
                    "aggregator-merge-observation": "aggregator-merge-observation";
                    "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                    "environment-process": "environment-process";
                    "environment-oci": "environment-oci";
                    "environment-ssh": "environment-ssh";
                    "environment-firecracker": "environment-firecracker";
                    "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                    "environment-modal": "environment-modal";
                    "environment-daytona": "environment-daytona";
                    "environment-vercel-sandbox": "environment-vercel-sandbox";
                    "environment-apptainer": "environment-apptainer";
                    "full-cell-docker-linux": "full-cell-docker-linux";
                    "canonical-log": "canonical-log";
                    "quality-plane": "quality-plane";
                    artifacts: "artifacts";
                    suspension: "suspension";
                    "honest-completion": "honest-completion";
                    "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                    "dynamic-authority": "dynamic-authority";
                    "production-effect-dispatch": "production-effect-dispatch";
                    "research-reference-pack": "research-reference-pack";
                    "video-reference-pack": "video-reference-pack";
                    "native-packaged-self-hosting": "native-packaged-self-hosting";
                    "classification-airlocks": "classification-airlocks";
                    "regulated-workloads": "regulated-workloads";
                    "cross-run-memory": "cross-run-memory";
                    "authored-orchestration": "authored-orchestration";
                    "mcp-work-entrypoints": "mcp-work-entrypoints";
                    "mcp-imported-tools": "mcp-imported-tools";
                }>>;
                conditional: z.ZodArray<z.ZodObject<{
                    capability: z.ZodEnum<{
                        "local-lite": "local-lite";
                        "hosted-postgresql-service": "hosted-postgresql-service";
                        "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                        "provider-openai": "provider-openai";
                        "provider-anthropic": "provider-anthropic";
                        "provider-openrouter": "provider-openrouter";
                        "provider-together": "provider-together";
                        "provider-fireworks": "provider-fireworks";
                        "aggregator-composio-observation": "aggregator-composio-observation";
                        "aggregator-merge-observation": "aggregator-merge-observation";
                        "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                        "environment-process": "environment-process";
                        "environment-oci": "environment-oci";
                        "environment-ssh": "environment-ssh";
                        "environment-firecracker": "environment-firecracker";
                        "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                        "environment-modal": "environment-modal";
                        "environment-daytona": "environment-daytona";
                        "environment-vercel-sandbox": "environment-vercel-sandbox";
                        "environment-apptainer": "environment-apptainer";
                        "full-cell-docker-linux": "full-cell-docker-linux";
                        "canonical-log": "canonical-log";
                        "quality-plane": "quality-plane";
                        artifacts: "artifacts";
                        suspension: "suspension";
                        "honest-completion": "honest-completion";
                        "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                        "dynamic-authority": "dynamic-authority";
                        "production-effect-dispatch": "production-effect-dispatch";
                        "research-reference-pack": "research-reference-pack";
                        "video-reference-pack": "video-reference-pack";
                        "native-packaged-self-hosting": "native-packaged-self-hosting";
                        "classification-airlocks": "classification-airlocks";
                        "regulated-workloads": "regulated-workloads";
                        "cross-run-memory": "cross-run-memory";
                        "authored-orchestration": "authored-orchestration";
                        "mcp-work-entrypoints": "mcp-work-entrypoints";
                        "mcp-imported-tools": "mcp-imported-tools";
                    }>;
                    refusal_point: z.ZodEnum<{
                        "profile-compilation": "profile-compilation";
                        publication: "publication";
                        registration: "registration";
                        intake: "intake";
                        route: "route";
                        "not-applicable": "not-applicable";
                    }>;
                    diagnostic_code: z.ZodString;
                    summary: z.ZodString;
                }, z.core.$strict>>;
                excluded: z.ZodArray<z.ZodObject<{
                    capability: z.ZodEnum<{
                        "local-lite": "local-lite";
                        "hosted-postgresql-service": "hosted-postgresql-service";
                        "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                        "provider-openai": "provider-openai";
                        "provider-anthropic": "provider-anthropic";
                        "provider-openrouter": "provider-openrouter";
                        "provider-together": "provider-together";
                        "provider-fireworks": "provider-fireworks";
                        "aggregator-composio-observation": "aggregator-composio-observation";
                        "aggregator-merge-observation": "aggregator-merge-observation";
                        "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                        "environment-process": "environment-process";
                        "environment-oci": "environment-oci";
                        "environment-ssh": "environment-ssh";
                        "environment-firecracker": "environment-firecracker";
                        "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                        "environment-modal": "environment-modal";
                        "environment-daytona": "environment-daytona";
                        "environment-vercel-sandbox": "environment-vercel-sandbox";
                        "environment-apptainer": "environment-apptainer";
                        "full-cell-docker-linux": "full-cell-docker-linux";
                        "canonical-log": "canonical-log";
                        "quality-plane": "quality-plane";
                        artifacts: "artifacts";
                        suspension: "suspension";
                        "honest-completion": "honest-completion";
                        "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                        "dynamic-authority": "dynamic-authority";
                        "production-effect-dispatch": "production-effect-dispatch";
                        "research-reference-pack": "research-reference-pack";
                        "video-reference-pack": "video-reference-pack";
                        "native-packaged-self-hosting": "native-packaged-self-hosting";
                        "classification-airlocks": "classification-airlocks";
                        "regulated-workloads": "regulated-workloads";
                        "cross-run-memory": "cross-run-memory";
                        "authored-orchestration": "authored-orchestration";
                        "mcp-work-entrypoints": "mcp-work-entrypoints";
                        "mcp-imported-tools": "mcp-imported-tools";
                    }>;
                    refusal_point: z.ZodEnum<{
                        "profile-compilation": "profile-compilation";
                        publication: "publication";
                        registration: "registration";
                        intake: "intake";
                        route: "route";
                        "not-applicable": "not-applicable";
                    }>;
                    diagnostic_code: z.ZodString;
                    summary: z.ZodString;
                }, z.core.$strict>>;
                required_components: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
                health_probes: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
                artifact_policy: z.ZodObject<{
                    tool_result_inline_threshold_bytes: z.ZodNumber;
                    tool_result_max_artifact_bytes: z.ZodNumber;
                    tool_result_range_read_max_bytes: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>;
            agent: z.ZodObject<{
                requested_ref: z.ZodNullable<z.ZodString>;
                default_ref: z.ZodNullable<z.ZodString>;
                resolved_ref: z.ZodString;
                name: z.ZodString;
                definition_ref: z.ZodString;
                instructions_ref: z.ZodString;
                publication_ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            context: z.ZodObject<{
                assembler: z.ZodString;
                version: z.ZodString;
                ref: z.ZodString;
                posture_ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            model: z.ZodObject<{
                adapter: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    ref: z.ZodString;
                }, z.core.$strict>;
                admitted_adapter_ref: z.ZodNullable<z.ZodString>;
                model_ref: z.ZodString;
                provider_model_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                provider: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "openai-compatible": "openai-compatible";
                }>>>;
                protocol_adapter: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    scripted: "scripted";
                    "openai-chat-completions": "openai-chat-completions";
                    "anthropic-messages": "anthropic-messages";
                }>>>;
                protocol_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                profile: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "generic-openai-compatible": "generic-openai-compatible";
                    litellm: "litellm";
                    ollama: "ollama";
                }>>>;
                profile_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                provider_instance_ref: z.ZodNullable<z.ZodString>;
                endpoint: z.ZodNullable<z.ZodString>;
                destination: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                endpoint_policy_ref: z.ZodNullable<z.ZodString>;
                catalogue_source: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    declared: "declared";
                    "provider-api": "provider-api";
                    "openai-compatible-models": "openai-compatible-models";
                }>>>;
                compatibility: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                    streaming: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    tools: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    cancellation: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    context_limits: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    usage: z.ZodEnum<{
                        absent: "absent";
                        reported: "reported";
                        untrusted: "untrusted";
                    }>;
                    upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                    notes: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>>;
                compatibility_ref: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                credential_mode: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    none: "none";
                    binding: "binding";
                }>>>;
                credential_binding_ref: z.ZodNullable<z.ZodString>;
                catalogue_entry_ref: z.ZodNullable<z.ZodString>;
                provider_model_revision: z.ZodNullable<z.ZodString>;
                assurance_facts_ref: z.ZodNullable<z.ZodString>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>;
            model_plan: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                primary: z.ZodObject<{
                    model_ref: z.ZodString;
                    provider_model_id: z.ZodString;
                    provider: z.ZodEnum<{
                        scripted: "scripted";
                        openai: "openai";
                        anthropic: "anthropic";
                        openrouter: "openrouter";
                        together: "together";
                        fireworks: "fireworks";
                        "openai-compatible": "openai-compatible";
                    }>;
                    protocol_adapter: z.ZodEnum<{
                        scripted: "scripted";
                        "openai-chat-completions": "openai-chat-completions";
                        "anthropic-messages": "anthropic-messages";
                    }>;
                    protocol_version: z.ZodString;
                    profile: z.ZodEnum<{
                        scripted: "scripted";
                        openai: "openai";
                        anthropic: "anthropic";
                        openrouter: "openrouter";
                        together: "together";
                        fireworks: "fireworks";
                        "generic-openai-compatible": "generic-openai-compatible";
                        litellm: "litellm";
                        ollama: "ollama";
                    }>;
                    profile_version: z.ZodString;
                    provider_instance_ref: z.ZodString;
                    adapter_ref: z.ZodString;
                    endpoint: z.ZodString;
                    destination: z.ZodString;
                    endpoint_policy_ref: z.ZodString;
                    catalogue_source: z.ZodEnum<{
                        declared: "declared";
                        "provider-api": "provider-api";
                        "openai-compatible-models": "openai-compatible-models";
                    }>;
                    compatibility: z.ZodObject<{
                        streaming: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        tools: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        cancellation: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        context_limits: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        usage: z.ZodEnum<{
                            absent: "absent";
                            reported: "reported";
                            untrusted: "untrusted";
                        }>;
                        upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                        notes: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    compatibility_ref: z.ZodString;
                    credential_mode: z.ZodEnum<{
                        none: "none";
                        binding: "binding";
                    }>;
                    credential_binding_ref: z.ZodNullable<z.ZodString>;
                    catalogue_entry_ref: z.ZodString;
                    provider_model_revision: z.ZodString;
                    assurance_facts_ref: z.ZodNullable<z.ZodString>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>;
                fallbacks: z.ZodArray<z.ZodObject<{
                    model_ref: z.ZodString;
                    provider_model_id: z.ZodString;
                    provider: z.ZodEnum<{
                        scripted: "scripted";
                        openai: "openai";
                        anthropic: "anthropic";
                        openrouter: "openrouter";
                        together: "together";
                        fireworks: "fireworks";
                        "openai-compatible": "openai-compatible";
                    }>;
                    protocol_adapter: z.ZodEnum<{
                        scripted: "scripted";
                        "openai-chat-completions": "openai-chat-completions";
                        "anthropic-messages": "anthropic-messages";
                    }>;
                    protocol_version: z.ZodString;
                    profile: z.ZodEnum<{
                        scripted: "scripted";
                        openai: "openai";
                        anthropic: "anthropic";
                        openrouter: "openrouter";
                        together: "together";
                        fireworks: "fireworks";
                        "generic-openai-compatible": "generic-openai-compatible";
                        litellm: "litellm";
                        ollama: "ollama";
                    }>;
                    profile_version: z.ZodString;
                    provider_instance_ref: z.ZodString;
                    adapter_ref: z.ZodString;
                    endpoint: z.ZodString;
                    destination: z.ZodString;
                    endpoint_policy_ref: z.ZodString;
                    catalogue_source: z.ZodEnum<{
                        declared: "declared";
                        "provider-api": "provider-api";
                        "openai-compatible-models": "openai-compatible-models";
                    }>;
                    compatibility: z.ZodObject<{
                        streaming: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        tools: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        cancellation: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        context_limits: z.ZodEnum<{
                            supported: "supported";
                            unknown: "unknown";
                            unsupported: "unsupported";
                        }>;
                        usage: z.ZodEnum<{
                            absent: "absent";
                            reported: "reported";
                            untrusted: "untrusted";
                        }>;
                        upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                        notes: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    compatibility_ref: z.ZodString;
                    credential_mode: z.ZodEnum<{
                        none: "none";
                        binding: "binding";
                    }>;
                    credential_binding_ref: z.ZodNullable<z.ZodString>;
                    catalogue_entry_ref: z.ZodString;
                    provider_model_revision: z.ZodString;
                    assurance_facts_ref: z.ZodNullable<z.ZodString>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strict>>;
                selector: z.ZodString;
                selection_reason: z.ZodString;
                catalogue_refs: z.ZodArray<z.ZodString>;
                resolution_policy_ref: z.ZodString;
            }, z.core.$strict>>>;
            input_artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
                artifact_ref: z.ZodString;
                manifest_ref: z.ZodString;
                tenant: z.ZodString;
                source_run_id: z.ZodString;
                content_hash: z.ZodString;
                bytes: z.ZodNumber;
                media_type: z.ZodString;
                classification: z.ZodEnum<{
                    public: "public";
                    internal: "internal";
                    confidential: "confidential";
                    restricted: "restricted";
                }>;
                evidence_grade: z.ZodEnum<{
                    original: "original";
                    derived: "derived";
                    "model-generated": "model-generated";
                }>;
                required_for_completion: z.ZodBoolean;
            }, z.core.$strict>>>;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                contract_ref: z.ZodString;
                binding_ref: z.ZodNullable<z.ZodString>;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }>;
                target_ref: z.ZodNullable<z.ZodString>;
                environment_ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            workspace_profiles: z.ZodArray<z.ZodString>;
            workspace_bindings: z.ZodArray<z.ZodString>;
            procedures: z.ZodArray<z.ZodString>;
            task_contract: z.ZodNullable<z.ZodObject<{
                ref: z.ZodString;
                validators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    class: z.ZodEnum<{
                        deterministic: "deterministic";
                        "sampled-oracle": "sampled-oracle";
                        heuristic: "heuristic";
                        "named-human": "named-human";
                    }>;
                    ref: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            semantic_declarations: z.ZodArray<z.ZodString>;
            domain_pack_ref: z.ZodNullable<z.ZodString>;
            operation_registry: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }>;
                ref: z.ZodString;
            }, z.core.$strict>>;
            target_adapters: z.ZodArray<z.ZodString>;
            execution_environments: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "runtime-identity";
        readonly owner: "runtime-core";
    };
    readonly ProfileCapabilityEntrySchema: {
        readonly schema: z.ZodObject<{
            capability: z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>;
            state: z.ZodEnum<{
                supported: "supported";
                conditional: "conditional";
                excluded: "excluded";
            }>;
            summary: z.ZodString;
            refusal_point: z.ZodEnum<{
                "profile-compilation": "profile-compilation";
                publication: "publication";
                registration: "registration";
                intake: "intake";
                route: "route";
                "not-applicable": "not-applicable";
            }>;
            diagnostic_code: z.ZodNullable<z.ZodString>;
            requirements: z.ZodArray<z.ZodString>;
            vectors: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly ProfileCapabilityManifestSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-profile-capability-manifest/1">;
            manifest_id: z.ZodString;
            profile: z.ZodEnum<{
                "local-lite": "local-lite";
                "full-cell": "full-cell";
                "small-production": "small-production";
                regulated: "regulated";
            }>;
            version: z.ZodString;
            manifest_ref: z.ZodString;
            capability_vocabulary_ref: z.ZodString;
            model_providers: z.ZodArray<z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>>;
            aggregator_providers: z.ZodArray<z.ZodEnum<{
                composio: "composio";
                "merge-agent-handler": "merge-agent-handler";
                "merge-unified": "merge-unified";
            }>>;
            environment_backends: z.ZodArray<z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>>;
            artifact_backends: z.ZodArray<z.ZodEnum<{
                filesystem: "filesystem";
                "s3-compatible": "s3-compatible";
            }>>;
            artifact_policy: z.ZodObject<{
                tool_result_inline_threshold_bytes: z.ZodNumber;
                tool_result_max_artifact_bytes: z.ZodNumber;
                tool_result_range_read_max_bytes: z.ZodNumber;
            }, z.core.$strict>;
            tool_operation_classes: z.ZodArray<z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }>>;
            effect_plane: z.ZodEnum<{
                "dynamic-authority": "dynamic-authority";
                absent: "absent";
                "restricted-attachment": "restricted-attachment";
            }>;
            components: z.ZodObject<{
                required: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
                health_probes: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
            }, z.core.$strict>;
            capabilities: z.ZodArray<z.ZodObject<{
                capability: z.ZodEnum<{
                    "local-lite": "local-lite";
                    "hosted-postgresql-service": "hosted-postgresql-service";
                    "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                    "provider-openai": "provider-openai";
                    "provider-anthropic": "provider-anthropic";
                    "provider-openrouter": "provider-openrouter";
                    "provider-together": "provider-together";
                    "provider-fireworks": "provider-fireworks";
                    "aggregator-composio-observation": "aggregator-composio-observation";
                    "aggregator-merge-observation": "aggregator-merge-observation";
                    "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                    "environment-process": "environment-process";
                    "environment-oci": "environment-oci";
                    "environment-ssh": "environment-ssh";
                    "environment-firecracker": "environment-firecracker";
                    "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                    "environment-modal": "environment-modal";
                    "environment-daytona": "environment-daytona";
                    "environment-vercel-sandbox": "environment-vercel-sandbox";
                    "environment-apptainer": "environment-apptainer";
                    "full-cell-docker-linux": "full-cell-docker-linux";
                    "canonical-log": "canonical-log";
                    "quality-plane": "quality-plane";
                    artifacts: "artifacts";
                    suspension: "suspension";
                    "honest-completion": "honest-completion";
                    "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                    "dynamic-authority": "dynamic-authority";
                    "production-effect-dispatch": "production-effect-dispatch";
                    "research-reference-pack": "research-reference-pack";
                    "video-reference-pack": "video-reference-pack";
                    "native-packaged-self-hosting": "native-packaged-self-hosting";
                    "classification-airlocks": "classification-airlocks";
                    "regulated-workloads": "regulated-workloads";
                    "cross-run-memory": "cross-run-memory";
                    "authored-orchestration": "authored-orchestration";
                    "mcp-work-entrypoints": "mcp-work-entrypoints";
                    "mcp-imported-tools": "mcp-imported-tools";
                }>;
                state: z.ZodEnum<{
                    supported: "supported";
                    conditional: "conditional";
                    excluded: "excluded";
                }>;
                summary: z.ZodString;
                refusal_point: z.ZodEnum<{
                    "profile-compilation": "profile-compilation";
                    publication: "publication";
                    registration: "registration";
                    intake: "intake";
                    route: "route";
                    "not-applicable": "not-applicable";
                }>;
                diagnostic_code: z.ZodNullable<z.ZodString>;
                requirements: z.ZodArray<z.ZodString>;
                vectors: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly ProfileCapabilitySummarySchema: {
        readonly schema: z.ZodObject<{
            manifest_id: z.ZodString;
            manifest_ref: z.ZodString;
            profile: z.ZodEnum<{
                "local-lite": "local-lite";
                "full-cell": "full-cell";
                "small-production": "small-production";
                regulated: "regulated";
            }>;
            version: z.ZodString;
            supported: z.ZodArray<z.ZodEnum<{
                "local-lite": "local-lite";
                "hosted-postgresql-service": "hosted-postgresql-service";
                "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                "provider-openai": "provider-openai";
                "provider-anthropic": "provider-anthropic";
                "provider-openrouter": "provider-openrouter";
                "provider-together": "provider-together";
                "provider-fireworks": "provider-fireworks";
                "aggregator-composio-observation": "aggregator-composio-observation";
                "aggregator-merge-observation": "aggregator-merge-observation";
                "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                "environment-process": "environment-process";
                "environment-oci": "environment-oci";
                "environment-ssh": "environment-ssh";
                "environment-firecracker": "environment-firecracker";
                "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                "environment-modal": "environment-modal";
                "environment-daytona": "environment-daytona";
                "environment-vercel-sandbox": "environment-vercel-sandbox";
                "environment-apptainer": "environment-apptainer";
                "full-cell-docker-linux": "full-cell-docker-linux";
                "canonical-log": "canonical-log";
                "quality-plane": "quality-plane";
                artifacts: "artifacts";
                suspension: "suspension";
                "honest-completion": "honest-completion";
                "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                "dynamic-authority": "dynamic-authority";
                "production-effect-dispatch": "production-effect-dispatch";
                "research-reference-pack": "research-reference-pack";
                "video-reference-pack": "video-reference-pack";
                "native-packaged-self-hosting": "native-packaged-self-hosting";
                "classification-airlocks": "classification-airlocks";
                "regulated-workloads": "regulated-workloads";
                "cross-run-memory": "cross-run-memory";
                "authored-orchestration": "authored-orchestration";
                "mcp-work-entrypoints": "mcp-work-entrypoints";
                "mcp-imported-tools": "mcp-imported-tools";
            }>>;
            conditional: z.ZodArray<z.ZodObject<{
                capability: z.ZodEnum<{
                    "local-lite": "local-lite";
                    "hosted-postgresql-service": "hosted-postgresql-service";
                    "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                    "provider-openai": "provider-openai";
                    "provider-anthropic": "provider-anthropic";
                    "provider-openrouter": "provider-openrouter";
                    "provider-together": "provider-together";
                    "provider-fireworks": "provider-fireworks";
                    "aggregator-composio-observation": "aggregator-composio-observation";
                    "aggregator-merge-observation": "aggregator-merge-observation";
                    "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                    "environment-process": "environment-process";
                    "environment-oci": "environment-oci";
                    "environment-ssh": "environment-ssh";
                    "environment-firecracker": "environment-firecracker";
                    "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                    "environment-modal": "environment-modal";
                    "environment-daytona": "environment-daytona";
                    "environment-vercel-sandbox": "environment-vercel-sandbox";
                    "environment-apptainer": "environment-apptainer";
                    "full-cell-docker-linux": "full-cell-docker-linux";
                    "canonical-log": "canonical-log";
                    "quality-plane": "quality-plane";
                    artifacts: "artifacts";
                    suspension: "suspension";
                    "honest-completion": "honest-completion";
                    "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                    "dynamic-authority": "dynamic-authority";
                    "production-effect-dispatch": "production-effect-dispatch";
                    "research-reference-pack": "research-reference-pack";
                    "video-reference-pack": "video-reference-pack";
                    "native-packaged-self-hosting": "native-packaged-self-hosting";
                    "classification-airlocks": "classification-airlocks";
                    "regulated-workloads": "regulated-workloads";
                    "cross-run-memory": "cross-run-memory";
                    "authored-orchestration": "authored-orchestration";
                    "mcp-work-entrypoints": "mcp-work-entrypoints";
                    "mcp-imported-tools": "mcp-imported-tools";
                }>;
                refusal_point: z.ZodEnum<{
                    "profile-compilation": "profile-compilation";
                    publication: "publication";
                    registration: "registration";
                    intake: "intake";
                    route: "route";
                    "not-applicable": "not-applicable";
                }>;
                diagnostic_code: z.ZodString;
                summary: z.ZodString;
            }, z.core.$strict>>;
            excluded: z.ZodArray<z.ZodObject<{
                capability: z.ZodEnum<{
                    "local-lite": "local-lite";
                    "hosted-postgresql-service": "hosted-postgresql-service";
                    "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                    "provider-openai": "provider-openai";
                    "provider-anthropic": "provider-anthropic";
                    "provider-openrouter": "provider-openrouter";
                    "provider-together": "provider-together";
                    "provider-fireworks": "provider-fireworks";
                    "aggregator-composio-observation": "aggregator-composio-observation";
                    "aggregator-merge-observation": "aggregator-merge-observation";
                    "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                    "environment-process": "environment-process";
                    "environment-oci": "environment-oci";
                    "environment-ssh": "environment-ssh";
                    "environment-firecracker": "environment-firecracker";
                    "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                    "environment-modal": "environment-modal";
                    "environment-daytona": "environment-daytona";
                    "environment-vercel-sandbox": "environment-vercel-sandbox";
                    "environment-apptainer": "environment-apptainer";
                    "full-cell-docker-linux": "full-cell-docker-linux";
                    "canonical-log": "canonical-log";
                    "quality-plane": "quality-plane";
                    artifacts: "artifacts";
                    suspension: "suspension";
                    "honest-completion": "honest-completion";
                    "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                    "dynamic-authority": "dynamic-authority";
                    "production-effect-dispatch": "production-effect-dispatch";
                    "research-reference-pack": "research-reference-pack";
                    "video-reference-pack": "video-reference-pack";
                    "native-packaged-self-hosting": "native-packaged-self-hosting";
                    "classification-airlocks": "classification-airlocks";
                    "regulated-workloads": "regulated-workloads";
                    "cross-run-memory": "cross-run-memory";
                    "authored-orchestration": "authored-orchestration";
                    "mcp-work-entrypoints": "mcp-work-entrypoints";
                    "mcp-imported-tools": "mcp-imported-tools";
                }>;
                refusal_point: z.ZodEnum<{
                    "profile-compilation": "profile-compilation";
                    publication: "publication";
                    registration: "registration";
                    intake: "intake";
                    route: "route";
                    "not-applicable": "not-applicable";
                }>;
                diagnostic_code: z.ZodString;
                summary: z.ZodString;
            }, z.core.$strict>>;
            required_components: z.ZodArray<z.ZodEnum<{
                store: "store";
                migration: "migration";
                queue: "queue";
                artifact: "artifact";
                secret_store: "secret_store";
                tool_host: "tool_host";
                validator_host: "validator_host";
                authority: "authority";
                memory: "memory";
                orchestration: "orchestration";
                effect: "effect";
                mcp: "mcp";
            }>>;
            health_probes: z.ZodArray<z.ZodEnum<{
                store: "store";
                migration: "migration";
                queue: "queue";
                artifact: "artifact";
                secret_store: "secret_store";
                tool_host: "tool_host";
                validator_host: "validator_host";
                authority: "authority";
                memory: "memory";
                orchestration: "orchestration";
                effect: "effect";
                mcp: "mcp";
            }>>;
            artifact_policy: z.ZodObject<{
                tool_result_inline_threshold_bytes: z.ZodNumber;
                tool_result_max_artifact_bytes: z.ZodNumber;
                tool_result_range_read_max_bytes: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly InteropJsonSchema: {
        readonly schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly InteropConnectionSchema: {
        readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"endpoint">;
            endpoint: z.ZodString;
            destination_ref: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"listener">;
            listener: z.ZodString;
            listener_identity_ref: z.ZodString;
        }, z.core.$strict>], "kind">;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly InteropBindingManifestBodySchema: {
        readonly schema: z.ZodObject<{
            api_version: z.ZodLiteral<"zero-ar/v1">;
            kind: z.ZodLiteral<"InteropBinding">;
            name: z.ZodString;
            version: z.ZodString;
            tenant: z.ZodString;
            owner: z.ZodString;
            protocol: z.ZodEnum<{
                mcp: "mcp";
                a2a: "a2a";
            }>;
            direction: z.ZodEnum<{
                client: "client";
                server: "server";
            }>;
            protocol_versions: z.ZodArray<z.ZodString>;
            connection: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"endpoint">;
                endpoint: z.ZodString;
                destination_ref: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"listener">;
                listener: z.ZodString;
                listener_identity_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
            authentication_ref: z.ZodNullable<z.ZodString>;
            tenant_derivation: z.ZodEnum<{
                "authenticated-principal": "authenticated-principal";
            }>;
            capabilities: z.ZodArray<z.ZodString>;
            extensions: z.ZodObject<{
                required: z.ZodArray<z.ZodString>;
                optional: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            operation_class: z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }>;
            remote_consequence_posture: z.ZodEnum<{
                none: "none";
                "declared-external": "declared-external";
                unknown: "unknown";
            }>;
            timeouts: z.ZodObject<{
                connect_ms: z.ZodNumber;
                idle_ms: z.ZodNumber;
            }, z.core.$strict>;
            limits: z.ZodObject<{
                request_bytes: z.ZodNumber;
                response_bytes: z.ZodNumber;
                artifact_bytes: z.ZodNumber;
                json_depth: z.ZodNumber;
                schema_depth: z.ZodNumber;
                string_bytes: z.ZodNumber;
                list_items: z.ZodNumber;
                header_bytes: z.ZodNumber;
                compression_ratio: z.ZodNumber;
                validation_ms: z.ZodNumber;
            }, z.core.$strict>;
            created_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly InteropBindingManifestSchema: {
        readonly schema: z.ZodObject<{
            api_version: z.ZodLiteral<"zero-ar/v1">;
            kind: z.ZodLiteral<"InteropBinding">;
            name: z.ZodString;
            version: z.ZodString;
            tenant: z.ZodString;
            owner: z.ZodString;
            protocol: z.ZodEnum<{
                mcp: "mcp";
                a2a: "a2a";
            }>;
            direction: z.ZodEnum<{
                client: "client";
                server: "server";
            }>;
            protocol_versions: z.ZodArray<z.ZodString>;
            connection: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"endpoint">;
                endpoint: z.ZodString;
                destination_ref: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                kind: z.ZodLiteral<"listener">;
                listener: z.ZodString;
                listener_identity_ref: z.ZodString;
            }, z.core.$strict>], "kind">;
            authentication_ref: z.ZodNullable<z.ZodString>;
            tenant_derivation: z.ZodEnum<{
                "authenticated-principal": "authenticated-principal";
            }>;
            capabilities: z.ZodArray<z.ZodString>;
            extensions: z.ZodObject<{
                required: z.ZodArray<z.ZodString>;
                optional: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            operation_class: z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }>;
            remote_consequence_posture: z.ZodEnum<{
                none: "none";
                "declared-external": "declared-external";
                unknown: "unknown";
            }>;
            timeouts: z.ZodObject<{
                connect_ms: z.ZodNumber;
                idle_ms: z.ZodNumber;
            }, z.core.$strict>;
            limits: z.ZodObject<{
                request_bytes: z.ZodNumber;
                response_bytes: z.ZodNumber;
                artifact_bytes: z.ZodNumber;
                json_depth: z.ZodNumber;
                schema_depth: z.ZodNumber;
                string_bytes: z.ZodNumber;
                list_items: z.ZodNumber;
                header_bytes: z.ZodNumber;
                compression_ratio: z.ZodNumber;
                validation_ms: z.ZodNumber;
            }, z.core.$strict>;
            created_at: z.ZodString;
            binding_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpPublishedWorkEntrypointSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            title: z.ZodString;
            description: z.ZodString;
            publication_ref: z.ZodString;
            agent_ref: z.ZodString;
            accountable_principal: z.ZodString;
            input_schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
            output_schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
            default_budgets: z.ZodObject<{
                model_tokens: z.ZodNumber;
                tool_calls: z.ZodOptional<z.ZodNumber>;
                bytes: z.ZodOptional<z.ZodNumber>;
                compute_ms: z.ZodOptional<z.ZodNumber>;
                attention: z.ZodNumber;
                verification_reserve_fraction: z.ZodNumber;
                max_turns: z.ZodNumber;
            }, z.core.$strict>;
            mcp_visible: z.ZodLiteral<true>;
            assurance_extension_required: z.ZodBoolean;
            entrypoint_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "runtime-core";
    };
    readonly McpPeerToolSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            title: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            input_schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
            output_schema: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
            annotations: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpPeerResourceSchema: {
        readonly schema: z.ZodObject<{
            uri: z.ZodString;
            name: z.ZodString;
            media_type: z.ZodNullable<z.ZodString>;
            content_identity: z.ZodNullable<z.ZodString>;
            authorization_boundary: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpPeerSnapshotBodySchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-interop-peer-snapshot/1">;
            binding_ref: z.ZodString;
            endpoint: z.ZodString;
            authenticated_peer: z.ZodString;
            protocol: z.ZodLiteral<"mcp">;
            protocol_version: z.ZodLiteral<"2026-07-28">;
            extensions: z.ZodArray<z.ZodString>;
            normalized_ref: z.ZodString;
            retrieved_at: z.ZodString;
            expires_at: z.ZodNullable<z.ZodString>;
            cache: z.ZodObject<{
                ttl_ms: z.ZodNumber;
                scope: z.ZodEnum<{
                    public: "public";
                    private: "private";
                }>;
            }, z.core.$strict>;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                title: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                input_schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
                output_schema: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
                annotations: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
            }, z.core.$strict>>;
            resources: z.ZodArray<z.ZodObject<{
                uri: z.ZodString;
                name: z.ZodString;
                media_type: z.ZodNullable<z.ZodString>;
                content_identity: z.ZodNullable<z.ZodString>;
                authorization_boundary: z.ZodString;
            }, z.core.$strict>>;
            warnings: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpPeerSnapshotSchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-interop-peer-snapshot/1">;
            binding_ref: z.ZodString;
            endpoint: z.ZodString;
            authenticated_peer: z.ZodString;
            protocol: z.ZodLiteral<"mcp">;
            protocol_version: z.ZodLiteral<"2026-07-28">;
            extensions: z.ZodArray<z.ZodString>;
            normalized_ref: z.ZodString;
            retrieved_at: z.ZodString;
            expires_at: z.ZodNullable<z.ZodString>;
            cache: z.ZodObject<{
                ttl_ms: z.ZodNumber;
                scope: z.ZodEnum<{
                    public: "public";
                    private: "private";
                }>;
            }, z.core.$strict>;
            tools: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                title: z.ZodNullable<z.ZodString>;
                description: z.ZodNullable<z.ZodString>;
                input_schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
                output_schema: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
                annotations: z.ZodNullable<z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>>;
            }, z.core.$strict>>;
            resources: z.ZodArray<z.ZodObject<{
                uri: z.ZodString;
                name: z.ZodString;
                media_type: z.ZodNullable<z.ZodString>;
                content_identity: z.ZodNullable<z.ZodString>;
                authorization_boundary: z.ZodString;
            }, z.core.$strict>>;
            warnings: z.ZodArray<z.ZodString>;
            snapshot_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpImportedToolPlanSchema: {
        readonly schema: z.ZodObject<{
            snapshot_ref: z.ZodString;
            tool_name: z.ZodString;
            tool_manifest_ref: z.ZodString;
            execution_binding_ref: z.ZodString;
            endpoint: z.ZodString;
            authentication_ref: z.ZodString;
            destination_ref: z.ZodString;
            operation_class: z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }>;
            admitted: z.ZodBoolean;
            admission_ref: z.ZodNullable<z.ZodString>;
            unsupported_metadata: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "runtime-core";
    };
    readonly McpImportedResourcePlanSchema: {
        readonly schema: z.ZodObject<{
            snapshot_ref: z.ZodString;
            uri: z.ZodString;
            media_type: z.ZodNullable<z.ZodString>;
            content_identity: z.ZodNullable<z.ZodString>;
            authorization_boundary: z.ZodString;
            endpoint: z.ZodString;
            authentication_ref: z.ZodString;
            destination_ref: z.ZodString;
            admitted: z.ZodBoolean;
            admission_ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "runtime-core";
    };
    readonly McpTaskAliasSchema: {
        readonly schema: z.ZodObject<{
            task_id: z.ZodString;
            run_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpPendingInputSchema: {
        readonly schema: z.ZodObject<{
            request_id: z.ZodString;
            handle: z.ZodString;
            message: z.ZodString;
            schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly McpTaskProjectionSchema: {
        readonly schema: z.ZodObject<{
            task_id: z.ZodString;
            run_id: z.ZodString;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                working: "working";
                failed: "failed";
                input_required: "input_required";
                completed: "completed";
            }>;
            status_message: z.ZodString;
            pending_inputs: z.ZodArray<z.ZodObject<{
                request_id: z.ZodString;
                handle: z.ZodString;
                message: z.ZodString;
                schema: z.ZodType<import("./interop.js").InteropJson, unknown, z.core.$ZodTypeInternals<import("./interop.js").InteropJson, unknown>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly AssuranceEnvelopeSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-assurance/v1">;
            run_ref: z.ZodString;
            completion_class: z.ZodEnum<{
                cancelled: "cancelled";
                working: "working";
                verified: "verified";
                rejected: "rejected";
                indeterminate: "indeterminate";
                exhausted: "exhausted";
                unverified: "unverified";
            }>;
            native_terminal: z.ZodNullable<z.ZodString>;
            verdict: z.ZodNullable<z.ZodString>;
            coverage: z.ZodArray<z.ZodString>;
            gaps: z.ZodArray<z.ZodString>;
            evidence_refs: z.ZodArray<z.ZodString>;
            effect_disposition: z.ZodEnum<{
                settled: "settled";
                unreconcilable: "unreconcilable";
                none: "none";
                open: "open";
                "outcome-unknown": "outcome-unknown";
            }>;
            canonical_position: z.ZodNumber;
            generated_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "quality-plane";
    };
    readonly InteropProtocolRegistryEntrySchema: {
        readonly schema: z.ZodObject<{
            protocol: z.ZodEnum<{
                mcp: "mcp";
                a2a: "a2a";
            }>;
            direction: z.ZodEnum<{
                client: "client";
                server: "server";
            }>;
            implementation: z.ZodString;
            implementation_version: z.ZodString;
            protocol_versions: z.ZodArray<z.ZodString>;
            extensions: z.ZodArray<z.ZodString>;
            sdk_packages: z.ZodRecord<z.ZodString, z.ZodString>;
            conformance_evidence: z.ZodArray<z.ZodString>;
            known_deviations: z.ZodArray<z.ZodString>;
            retirement_date: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly InteropProtocolRegistrySchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-interop-registry/1">;
            entries: z.ZodArray<z.ZodObject<{
                protocol: z.ZodEnum<{
                    mcp: "mcp";
                    a2a: "a2a";
                }>;
                direction: z.ZodEnum<{
                    client: "client";
                    server: "server";
                }>;
                implementation: z.ZodString;
                implementation_version: z.ZodString;
                protocol_versions: z.ZodArray<z.ZodString>;
                extensions: z.ZodArray<z.ZodString>;
                sdk_packages: z.ZodRecord<z.ZodString, z.ZodString>;
                conformance_evidence: z.ZodArray<z.ZodString>;
                known_deviations: z.ZodArray<z.ZodString>;
                retirement_date: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly InteropCapabilitySchema: {
        readonly schema: z.ZodObject<{
            protocol: z.ZodEnum<{
                mcp: "mcp";
                a2a: "a2a";
            }>;
            direction: z.ZodEnum<{
                client: "client";
                server: "server";
            }>;
            state: z.ZodEnum<{
                implemented: "implemented";
                configured: "configured";
                healthy: "healthy";
                admitted: "admitted";
                selectable: "selectable";
            }>;
            configured: z.ZodBoolean;
            healthy: z.ZodBoolean;
            admitted: z.ZodBoolean;
            selectable: z.ZodBoolean;
            binding_ref: z.ZodNullable<z.ZodString>;
            detail: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "capability-profile";
        readonly owner: "release-engineering";
    };
    readonly ControlRequestSchema: {
        readonly schema: z.ZodObject<{
            verb: z.ZodEnum<{
                steer: "steer";
                redirect: "redirect";
                cancel: "cancel";
                answer: "answer";
            }>;
            control_id: z.ZodString;
            text: z.ZodOptional<z.ZodString>;
            handle: z.ZodOptional<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "control";
        readonly owner: "runtime-core";
    };
    readonly ForkRequestSchema: {
        readonly schema: z.ZodObject<{
            at_entry_id: z.ZodString;
            reason: z.ZodOptional<z.ZodString>;
            budgets: z.ZodOptional<z.ZodObject<{
                consumption: z.ZodObject<{
                    model_tokens: z.ZodNumber;
                    tool_calls: z.ZodOptional<z.ZodNumber>;
                    bytes: z.ZodOptional<z.ZodNumber>;
                    compute_ms: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                attention: z.ZodNumber;
                verification_reserve_fraction: z.ZodNumber;
                max_turns: z.ZodNumber;
            }, z.core.$strict>>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly ReexecuteRequestSchema: {
        readonly schema: z.ZodObject<{
            at_entry_id: z.ZodOptional<z.ZodString>;
            reason: z.ZodOptional<z.ZodString>;
            budgets: z.ZodOptional<z.ZodObject<{
                consumption: z.ZodObject<{
                    model_tokens: z.ZodNumber;
                    tool_calls: z.ZodOptional<z.ZodNumber>;
                    bytes: z.ZodOptional<z.ZodNumber>;
                    compute_ms: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                attention: z.ZodNumber;
                verification_reserve_fraction: z.ZodNumber;
                max_turns: z.ZodNumber;
            }, z.core.$strict>>;
            posture_ref: z.ZodOptional<z.ZodString>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly TaskContractSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            invariants: z.ZodArray<z.ZodString>;
            acceptance_rules: z.ZodArray<z.ZodString>;
            checkpoint_every_items: z.ZodNumber;
            checkpoint_phase_boundaries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                phase: z.ZodString;
                starts_after_items: z.ZodNumber;
                checkpoint_every_items: z.ZodNumber;
            }, z.core.$strict>>>;
            dependency_frontier: z.ZodEnum<{
                "independent-items": "independent-items";
                "run-start": "run-start";
                "declared-dependencies": "declared-dependencies";
            }>;
            repair_budget_attempts: z.ZodNumber;
            claim_representation: z.ZodOptional<z.ZodEnum<{
                "structured-claims-with-citations": "structured-claims-with-citations";
            }>>;
            validators: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                class: z.ZodEnum<{
                    deterministic: "deterministic";
                    "sampled-oracle": "sampled-oracle";
                    heuristic: "heuristic";
                    "named-human": "named-human";
                }>;
                covers: z.ZodArray<z.ZodString>;
                sufficient_for: z.ZodArray<z.ZodString>;
                cost_wall_ms: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "validator-seam";
        readonly owner: "quality-plane";
    };
    readonly ClaimSetSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"claim-set/1">;
            claims: z.ZodArray<z.ZodObject<{
                claim_id: z.ZodString;
                text: z.ZodString;
                label: z.ZodEnum<{
                    heuristic: "heuristic";
                    guarantee: "guarantee";
                    assumption: "assumption";
                    open: "open";
                }>;
                citations: z.ZodArray<z.ZodObject<{
                    source_id: z.ZodString;
                    span_hash: z.ZodString;
                    locator: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "validator-seam";
        readonly owner: "quality-plane";
    };
    readonly CitedSpanSchema: {
        readonly schema: z.ZodObject<{
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
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly EffectDescriptorSchema: {
        readonly schema: z.ZodObject<{
            effect_id: z.ZodString;
            target: z.ZodString;
            operation: z.ZodString;
            params: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            param_hash: z.ZodString;
            magnitude: z.ZodNullable<z.ZodNumber>;
            idempotency_key: z.ZodString;
            natural_reference: z.ZodNullable<z.ZodString>;
            evidence_spans: z.ZodArray<z.ZodObject<{
                source_id: z.ZodString;
                span_hash: z.ZodString;
                locator: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
            reversibility: z.ZodObject<{
                reversible: z.ZodBoolean;
                residual_consequences: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            reverses: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "effect-dispatch";
        readonly owner: "effect-plane";
    };
    readonly ReceiptSchema: {
        readonly schema: z.ZodObject<{
            effect_id: z.ZodString;
            target: z.ZodString;
            operation: z.ZodString;
            param_hash: z.ZodString;
            idempotency_key: z.ZodString;
            outcome: z.ZodEnum<{
                refused: "refused";
                applied: "applied";
                already_applied: "already_applied";
            }>;
            owner_response: z.ZodString;
            assurance: z.ZodEnum<{
                "owner-signed": "owner-signed";
                "authenticated-response": "authenticated-response";
                "authenticated-reconciliation": "authenticated-reconciliation";
            }>;
            attestation: z.ZodNullable<z.ZodString>;
            target_adapter_version: z.ZodString;
            valid_time: z.ZodString;
            transaction_time: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "effect-dispatch";
        readonly owner: "effect-plane";
    };
    readonly StaticGrantSchema: {
        readonly schema: z.ZodObject<{
            target: z.ZodString;
            operation: z.ZodString;
            agent_ref: z.ZodString;
            accountable: z.ZodString;
            approver: z.ZodString;
            expires_at: z.ZodString;
            max_magnitude: z.ZodNullable<z.ZodNumber>;
            attestation: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "effect-dispatch";
        readonly owner: "effect-plane";
    };
    readonly EnvironmentAdapterDescriptorSchema: {
        readonly schema: z.ZodObject<{
            contract: z.ZodLiteral<"environment-adapter/1">;
            name: z.ZodString;
            version: z.ZodString;
            adapter_digest: z.ZodString;
            backend: z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>;
            operations: z.ZodArray<z.ZodEnum<{
                cancel: "cancel";
                observe: "observe";
                teardown: "teardown";
                descriptor: "descriptor";
                prepare: "prepare";
                submit: "submit";
                reconcile: "reconcile";
                collect: "collect";
                abandon: "abandon";
            }>>;
            operation_classes: z.ZodArray<z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
            isolation: z.ZodEnum<{
                none: "none";
                process: "process";
                container: "container";
                "remote-host": "remote-host";
                microvm: "microvm";
                "hosted-sandbox": "hosted-sandbox";
            }>;
            lifecycle: z.ZodObject<{
                provider_idempotency: z.ZodBoolean;
                idempotency_scope: z.ZodString;
                idempotency_retention_ms: z.ZodNumber;
                stable_environment_handle: z.ZodBoolean;
                stable_job_handle: z.ZodBoolean;
                observe_without_mutation: z.ZodBoolean;
                reconciliation: z.ZodBoolean;
                cancellation: z.ZodBoolean;
                teardown: z.ZodBoolean;
                automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                retained_resources: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            omissions: z.ZodArray<z.ZodString>;
            owner: z.ZodString;
            reviewer: z.ZodString;
            conformance_refs: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAdapterCompatibilitySchema: {
        readonly schema: z.ZodObject<{
            contract: z.ZodLiteral<"environment-adapter/1">;
            node: z.ZodString;
            operating_systems: z.ZodArray<z.ZodString>;
            architectures: z.ZodArray<z.ZodString>;
            provider_runtime: z.ZodNullable<z.ZodString>;
            provider_runtime_version: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAdapterReleaseBodySchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-environment-adapter-release/1">;
            descriptor: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            descriptor_ref: z.ZodString;
            source_revision: z.ZodString;
            package_integrity: z.ZodString;
            dependency_inventory_ref: z.ZodString;
            runtime_artifact_refs: z.ZodArray<z.ZodString>;
            workload_artifact_refs: z.ZodArray<z.ZodString>;
            compatibility: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                node: z.ZodString;
                operating_systems: z.ZodArray<z.ZodString>;
                architectures: z.ZodArray<z.ZodString>;
                provider_runtime: z.ZodNullable<z.ZodString>;
                provider_runtime_version: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            signing_key_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAdapterReleaseManifestSchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-environment-adapter-release/1">;
            descriptor: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            descriptor_ref: z.ZodString;
            source_revision: z.ZodString;
            package_integrity: z.ZodString;
            dependency_inventory_ref: z.ZodString;
            runtime_artifact_refs: z.ZodArray<z.ZodString>;
            workload_artifact_refs: z.ZodArray<z.ZodString>;
            compatibility: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                node: z.ZodString;
                operating_systems: z.ZodArray<z.ZodString>;
                architectures: z.ZodArray<z.ZodString>;
                provider_runtime: z.ZodNullable<z.ZodString>;
                provider_runtime_version: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            signing_key_ref: z.ZodString;
            signature_algorithm: z.ZodEnum<{
                ed25519: "ed25519";
            }>;
            signature: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentPrerequisiteObservationSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            ready: z.ZodBoolean;
            detail: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentHostObservationSchema: {
        readonly schema: z.ZodObject<{
            host_class: z.ZodString;
            host_identity_ref: z.ZodString;
            prerequisites: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                ready: z.ZodBoolean;
                detail: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAcceptanceLifecycleSchema: {
        readonly schema: z.ZodObject<{
            prepare: z.ZodBoolean;
            submit: z.ZodBoolean;
            workload_identity: z.ZodBoolean;
            observe: z.ZodBoolean;
            cancel: z.ZodBoolean;
            reconcile: z.ZodBoolean;
            collect: z.ZodBoolean;
            teardown: z.ZodBoolean;
            capacity_release: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAcceptanceReportBodySchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-environment-acceptance/1">;
            vector_id: z.ZodString;
            source_commit: z.ZodString;
            backend: z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>;
            adapter: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            profile_ref: z.ZodString;
            configuration_ref: z.ZodString;
            host: z.ZodObject<{
                host_class: z.ZodString;
                host_identity_ref: z.ZodString;
                prerequisites: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    ready: z.ZodBoolean;
                    detail: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            workload_identity_ref: z.ZodString;
            lifecycle: z.ZodObject<{
                prepare: z.ZodBoolean;
                submit: z.ZodBoolean;
                workload_identity: z.ZodBoolean;
                observe: z.ZodBoolean;
                cancel: z.ZodBoolean;
                reconcile: z.ZodBoolean;
                collect: z.ZodBoolean;
                teardown: z.ZodBoolean;
                capacity_release: z.ZodBoolean;
            }, z.core.$strict>;
            started_at: z.ZodString;
            finished_at: z.ZodString;
            omissions: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAcceptanceReportSchema: {
        readonly schema: z.ZodObject<{
            format: z.ZodLiteral<"zero-ar-environment-acceptance/1">;
            vector_id: z.ZodString;
            source_commit: z.ZodString;
            backend: z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>;
            adapter: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            profile_ref: z.ZodString;
            configuration_ref: z.ZodString;
            host: z.ZodObject<{
                host_class: z.ZodString;
                host_identity_ref: z.ZodString;
                prerequisites: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    ready: z.ZodBoolean;
                    detail: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            workload_identity_ref: z.ZodString;
            lifecycle: z.ZodObject<{
                prepare: z.ZodBoolean;
                submit: z.ZodBoolean;
                workload_identity: z.ZodBoolean;
                observe: z.ZodBoolean;
                cancel: z.ZodBoolean;
                reconcile: z.ZodBoolean;
                collect: z.ZodBoolean;
                teardown: z.ZodBoolean;
                capacity_release: z.ZodBoolean;
            }, z.core.$strict>;
            started_at: z.ZodString;
            finished_at: z.ZodString;
            omissions: z.ZodArray<z.ZodString>;
            report_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentDeploymentCapabilitySchema: {
        readonly schema: z.ZodObject<{
            backend: z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>;
            package: z.ZodString;
            adapter_name: z.ZodNullable<z.ZodString>;
            adapter_version: z.ZodNullable<z.ZodString>;
            adapter_digest: z.ZodNullable<z.ZodString>;
            profile_ref: z.ZodNullable<z.ZodString>;
            product_state: z.ZodEnum<{
                "default-supported": "default-supported";
                "conditional-supported": "conditional-supported";
                "future-optional": "future-optional";
            }>;
            implemented: z.ZodBoolean;
            installed: z.ZodBoolean;
            configured: z.ZodBoolean;
            healthy: z.ZodBoolean;
            admitted: z.ZodBoolean;
            selectable: z.ZodBoolean;
            acceptance_state: z.ZodEnum<{
                expired: "expired";
                pending: "pending";
                "not-required": "not-required";
                current: "current";
                mismatched: "mismatched";
            }>;
            acceptance_report_ref: z.ZodNullable<z.ZodString>;
            diagnostic_code: z.ZodNullable<z.ZodString>;
            detail: z.ZodString;
            corrective_action: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentDeploymentCapabilityListSchema: {
        readonly schema: z.ZodObject<{
            capabilities: z.ZodArray<z.ZodObject<{
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                package: z.ZodString;
                adapter_name: z.ZodNullable<z.ZodString>;
                adapter_version: z.ZodNullable<z.ZodString>;
                adapter_digest: z.ZodNullable<z.ZodString>;
                profile_ref: z.ZodNullable<z.ZodString>;
                product_state: z.ZodEnum<{
                    "default-supported": "default-supported";
                    "conditional-supported": "conditional-supported";
                    "future-optional": "future-optional";
                }>;
                implemented: z.ZodBoolean;
                installed: z.ZodBoolean;
                configured: z.ZodBoolean;
                healthy: z.ZodBoolean;
                admitted: z.ZodBoolean;
                selectable: z.ZodBoolean;
                acceptance_state: z.ZodEnum<{
                    expired: "expired";
                    pending: "pending";
                    "not-required": "not-required";
                    current: "current";
                    mismatched: "mismatched";
                }>;
                acceptance_report_ref: z.ZodNullable<z.ZodString>;
                diagnostic_code: z.ZodNullable<z.ZodString>;
                detail: z.ZodString;
                corrective_action: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentExecutionRequestSchema: {
        readonly schema: z.ZodObject<{
            tool: z.ZodString;
            input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            timeout_ms: z.ZodNumber;
            run_id: z.ZodString;
            tool_call_id: z.ZodString;
            lease_id: z.ZodString;
            tenant: z.ZodString;
            executing_principal: z.ZodString;
            accountable_owner: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentExecutionResultSchema: {
        readonly schema: z.ZodObject<{
            ok: z.ZodBoolean;
            output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            error: z.ZodOptional<z.ZodString>;
            used: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentLifecycleAssuranceSchema: {
        readonly schema: z.ZodObject<{
            provider_idempotency: z.ZodBoolean;
            idempotency_scope: z.ZodString;
            idempotency_retention_ms: z.ZodNumber;
            stable_environment_handle: z.ZodBoolean;
            stable_job_handle: z.ZodBoolean;
            observe_without_mutation: z.ZodBoolean;
            reconciliation: z.ZodBoolean;
            cancellation: z.ZodBoolean;
            teardown: z.ZodBoolean;
            automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
            retained_resources: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentProfileSchema: {
        readonly schema: z.ZodObject<{
            profile_ref: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            adapter: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            endpoint: z.ZodNullable<z.ZodString>;
            region: z.ZodNullable<z.ZodString>;
            provider_account_ref: z.ZodNullable<z.ZodString>;
            provider_scope_ref: z.ZodNullable<z.ZodString>;
            secret_refs: z.ZodArray<z.ZodString>;
            image_ref: z.ZodNullable<z.ZodString>;
            template_ref: z.ZodNullable<z.ZodString>;
            limits: z.ZodObject<{
                cpu_millis: z.ZodNumber;
                memory_mib: z.ZodNumber;
                disk_mib: z.ZodNumber;
                gpu_count: z.ZodNumber;
                wall_time_ms: z.ZodNumber;
                process_count: z.ZodNumber;
                concurrency: z.ZodNumber;
                output_bytes: z.ZodNumber;
            }, z.core.$strict>;
            mounts: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                mode: z.ZodEnum<{
                    "read-only": "read-only";
                    "read-write": "read-write";
                }>;
                source_ref: z.ZodNullable<z.ZodString>;
                target: z.ZodString;
                max_bytes: z.ZodNumber;
            }, z.core.$strict>>;
            outputs: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                max_bytes: z.ZodNumber;
                classification: z.ZodString;
                required: z.ZodBoolean;
            }, z.core.$strict>>;
            network: z.ZodObject<{
                mode: z.ZodEnum<{
                    deny: "deny";
                    allowlist: "allowlist";
                    unrestricted: "unrestricted";
                }>;
                destinations: z.ZodArray<z.ZodString>;
                enforced_at: z.ZodString;
                name_resolution: z.ZodString;
            }, z.core.$strict>;
            classification_ceiling: z.ZodString;
            residency: z.ZodString;
            retention: z.ZodString;
            tenant_sharing: z.ZodEnum<{
                "tenant-owned": "tenant-owned";
                "deployment-shared": "deployment-shared";
            }>;
            tenant_resource_refs: z.ZodArray<z.ZodString>;
            cost_dimensions: z.ZodArray<z.ZodString>;
            created_by: z.ZodString;
            reviewed_by: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentProfileRegistrationSchema: {
        readonly schema: z.ZodObject<{
            profile: z.ZodObject<{
                profile_ref: z.ZodString;
                name: z.ZodString;
                version: z.ZodString;
                adapter: z.ZodObject<{
                    contract: z.ZodLiteral<"environment-adapter/1">;
                    name: z.ZodString;
                    version: z.ZodString;
                    adapter_digest: z.ZodString;
                    backend: z.ZodEnum<{
                        ssh: "ssh";
                        firecracker: "firecracker";
                        apptainer: "apptainer";
                        process: "process";
                        oci: "oci";
                        "cloudflare-sandbox": "cloudflare-sandbox";
                        modal: "modal";
                        daytona: "daytona";
                        "vercel-sandbox": "vercel-sandbox";
                    }>;
                    operations: z.ZodArray<z.ZodEnum<{
                        cancel: "cancel";
                        observe: "observe";
                        teardown: "teardown";
                        descriptor: "descriptor";
                        prepare: "prepare";
                        submit: "submit";
                        reconcile: "reconcile";
                        collect: "collect";
                        abandon: "abandon";
                    }>>;
                    operation_classes: z.ZodArray<z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                    isolation: z.ZodEnum<{
                        none: "none";
                        process: "process";
                        container: "container";
                        "remote-host": "remote-host";
                        microvm: "microvm";
                        "hosted-sandbox": "hosted-sandbox";
                    }>;
                    lifecycle: z.ZodObject<{
                        provider_idempotency: z.ZodBoolean;
                        idempotency_scope: z.ZodString;
                        idempotency_retention_ms: z.ZodNumber;
                        stable_environment_handle: z.ZodBoolean;
                        stable_job_handle: z.ZodBoolean;
                        observe_without_mutation: z.ZodBoolean;
                        reconciliation: z.ZodBoolean;
                        cancellation: z.ZodBoolean;
                        teardown: z.ZodBoolean;
                        automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                        retained_resources: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    omissions: z.ZodArray<z.ZodString>;
                    owner: z.ZodString;
                    reviewer: z.ZodString;
                    conformance_refs: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                endpoint: z.ZodNullable<z.ZodString>;
                region: z.ZodNullable<z.ZodString>;
                provider_account_ref: z.ZodNullable<z.ZodString>;
                provider_scope_ref: z.ZodNullable<z.ZodString>;
                secret_refs: z.ZodArray<z.ZodString>;
                image_ref: z.ZodNullable<z.ZodString>;
                template_ref: z.ZodNullable<z.ZodString>;
                limits: z.ZodObject<{
                    cpu_millis: z.ZodNumber;
                    memory_mib: z.ZodNumber;
                    disk_mib: z.ZodNumber;
                    gpu_count: z.ZodNumber;
                    wall_time_ms: z.ZodNumber;
                    process_count: z.ZodNumber;
                    concurrency: z.ZodNumber;
                    output_bytes: z.ZodNumber;
                }, z.core.$strict>;
                mounts: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    mode: z.ZodEnum<{
                        "read-only": "read-only";
                        "read-write": "read-write";
                    }>;
                    source_ref: z.ZodNullable<z.ZodString>;
                    target: z.ZodString;
                    max_bytes: z.ZodNumber;
                }, z.core.$strict>>;
                outputs: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    max_bytes: z.ZodNumber;
                    classification: z.ZodString;
                    required: z.ZodBoolean;
                }, z.core.$strict>>;
                network: z.ZodObject<{
                    mode: z.ZodEnum<{
                        deny: "deny";
                        allowlist: "allowlist";
                        unrestricted: "unrestricted";
                    }>;
                    destinations: z.ZodArray<z.ZodString>;
                    enforced_at: z.ZodString;
                    name_resolution: z.ZodString;
                }, z.core.$strict>;
                classification_ceiling: z.ZodString;
                residency: z.ZodString;
                retention: z.ZodString;
                tenant_sharing: z.ZodEnum<{
                    "tenant-owned": "tenant-owned";
                    "deployment-shared": "deployment-shared";
                }>;
                tenant_resource_refs: z.ZodArray<z.ZodString>;
                cost_dimensions: z.ZodArray<z.ZodString>;
                created_by: z.ZodString;
                reviewed_by: z.ZodString;
            }, z.core.$strict>;
            state: z.ZodEnum<{
                enabled: "enabled";
                disabled: "disabled";
                registered: "registered";
                draining: "draining";
            }>;
            secret_issuance_epoch: z.ZodNumber;
            published_at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly RegisterEnvironmentRequestSchema: {
        readonly schema: z.ZodObject<{
            profile: z.ZodObject<{
                profile_ref: z.ZodString;
                name: z.ZodString;
                version: z.ZodString;
                adapter: z.ZodObject<{
                    contract: z.ZodLiteral<"environment-adapter/1">;
                    name: z.ZodString;
                    version: z.ZodString;
                    adapter_digest: z.ZodString;
                    backend: z.ZodEnum<{
                        ssh: "ssh";
                        firecracker: "firecracker";
                        apptainer: "apptainer";
                        process: "process";
                        oci: "oci";
                        "cloudflare-sandbox": "cloudflare-sandbox";
                        modal: "modal";
                        daytona: "daytona";
                        "vercel-sandbox": "vercel-sandbox";
                    }>;
                    operations: z.ZodArray<z.ZodEnum<{
                        cancel: "cancel";
                        observe: "observe";
                        teardown: "teardown";
                        descriptor: "descriptor";
                        prepare: "prepare";
                        submit: "submit";
                        reconcile: "reconcile";
                        collect: "collect";
                        abandon: "abandon";
                    }>>;
                    operation_classes: z.ZodArray<z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                    isolation: z.ZodEnum<{
                        none: "none";
                        process: "process";
                        container: "container";
                        "remote-host": "remote-host";
                        microvm: "microvm";
                        "hosted-sandbox": "hosted-sandbox";
                    }>;
                    lifecycle: z.ZodObject<{
                        provider_idempotency: z.ZodBoolean;
                        idempotency_scope: z.ZodString;
                        idempotency_retention_ms: z.ZodNumber;
                        stable_environment_handle: z.ZodBoolean;
                        stable_job_handle: z.ZodBoolean;
                        observe_without_mutation: z.ZodBoolean;
                        reconciliation: z.ZodBoolean;
                        cancellation: z.ZodBoolean;
                        teardown: z.ZodBoolean;
                        automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                        retained_resources: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    omissions: z.ZodArray<z.ZodString>;
                    owner: z.ZodString;
                    reviewer: z.ZodString;
                    conformance_refs: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                endpoint: z.ZodNullable<z.ZodString>;
                region: z.ZodNullable<z.ZodString>;
                provider_account_ref: z.ZodNullable<z.ZodString>;
                provider_scope_ref: z.ZodNullable<z.ZodString>;
                secret_refs: z.ZodArray<z.ZodString>;
                image_ref: z.ZodNullable<z.ZodString>;
                template_ref: z.ZodNullable<z.ZodString>;
                limits: z.ZodObject<{
                    cpu_millis: z.ZodNumber;
                    memory_mib: z.ZodNumber;
                    disk_mib: z.ZodNumber;
                    gpu_count: z.ZodNumber;
                    wall_time_ms: z.ZodNumber;
                    process_count: z.ZodNumber;
                    concurrency: z.ZodNumber;
                    output_bytes: z.ZodNumber;
                }, z.core.$strict>;
                mounts: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    mode: z.ZodEnum<{
                        "read-only": "read-only";
                        "read-write": "read-write";
                    }>;
                    source_ref: z.ZodNullable<z.ZodString>;
                    target: z.ZodString;
                    max_bytes: z.ZodNumber;
                }, z.core.$strict>>;
                outputs: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    max_bytes: z.ZodNumber;
                    classification: z.ZodString;
                    required: z.ZodBoolean;
                }, z.core.$strict>>;
                network: z.ZodObject<{
                    mode: z.ZodEnum<{
                        deny: "deny";
                        allowlist: "allowlist";
                        unrestricted: "unrestricted";
                    }>;
                    destinations: z.ZodArray<z.ZodString>;
                    enforced_at: z.ZodString;
                    name_resolution: z.ZodString;
                }, z.core.$strict>;
                classification_ceiling: z.ZodString;
                residency: z.ZodString;
                retention: z.ZodString;
                tenant_sharing: z.ZodEnum<{
                    "tenant-owned": "tenant-owned";
                    "deployment-shared": "deployment-shared";
                }>;
                tenant_resource_refs: z.ZodArray<z.ZodString>;
                cost_dimensions: z.ZodArray<z.ZodString>;
                created_by: z.ZodString;
                reviewed_by: z.ZodString;
            }, z.core.$strict>;
            secret_issuance_epoch: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentProfileRefRequestSchema: {
        readonly schema: z.ZodObject<{
            profile_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentProfileStateRequestSchema: {
        readonly schema: z.ZodObject<{
            state: z.ZodEnum<{
                enabled: "enabled";
                disabled: "disabled";
                registered: "registered";
                draining: "draining";
            }>;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentCredentialRotationRequestSchema: {
        readonly schema: z.ZodObject<{
            secret_issuance_epoch: z.ZodNumber;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentProfileListSchema: {
        readonly schema: z.ZodObject<{
            profiles: z.ZodArray<z.ZodObject<{
                profile: z.ZodObject<{
                    profile_ref: z.ZodString;
                    name: z.ZodString;
                    version: z.ZodString;
                    adapter: z.ZodObject<{
                        contract: z.ZodLiteral<"environment-adapter/1">;
                        name: z.ZodString;
                        version: z.ZodString;
                        adapter_digest: z.ZodString;
                        backend: z.ZodEnum<{
                            ssh: "ssh";
                            firecracker: "firecracker";
                            apptainer: "apptainer";
                            process: "process";
                            oci: "oci";
                            "cloudflare-sandbox": "cloudflare-sandbox";
                            modal: "modal";
                            daytona: "daytona";
                            "vercel-sandbox": "vercel-sandbox";
                        }>;
                        operations: z.ZodArray<z.ZodEnum<{
                            cancel: "cancel";
                            observe: "observe";
                            teardown: "teardown";
                            descriptor: "descriptor";
                            prepare: "prepare";
                            submit: "submit";
                            reconcile: "reconcile";
                            collect: "collect";
                            abandon: "abandon";
                        }>>;
                        operation_classes: z.ZodArray<z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                        isolation: z.ZodEnum<{
                            none: "none";
                            process: "process";
                            container: "container";
                            "remote-host": "remote-host";
                            microvm: "microvm";
                            "hosted-sandbox": "hosted-sandbox";
                        }>;
                        lifecycle: z.ZodObject<{
                            provider_idempotency: z.ZodBoolean;
                            idempotency_scope: z.ZodString;
                            idempotency_retention_ms: z.ZodNumber;
                            stable_environment_handle: z.ZodBoolean;
                            stable_job_handle: z.ZodBoolean;
                            observe_without_mutation: z.ZodBoolean;
                            reconciliation: z.ZodBoolean;
                            cancellation: z.ZodBoolean;
                            teardown: z.ZodBoolean;
                            automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                            retained_resources: z.ZodArray<z.ZodString>;
                        }, z.core.$strict>;
                        omissions: z.ZodArray<z.ZodString>;
                        owner: z.ZodString;
                        reviewer: z.ZodString;
                        conformance_refs: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    endpoint: z.ZodNullable<z.ZodString>;
                    region: z.ZodNullable<z.ZodString>;
                    provider_account_ref: z.ZodNullable<z.ZodString>;
                    provider_scope_ref: z.ZodNullable<z.ZodString>;
                    secret_refs: z.ZodArray<z.ZodString>;
                    image_ref: z.ZodNullable<z.ZodString>;
                    template_ref: z.ZodNullable<z.ZodString>;
                    limits: z.ZodObject<{
                        cpu_millis: z.ZodNumber;
                        memory_mib: z.ZodNumber;
                        disk_mib: z.ZodNumber;
                        gpu_count: z.ZodNumber;
                        wall_time_ms: z.ZodNumber;
                        process_count: z.ZodNumber;
                        concurrency: z.ZodNumber;
                        output_bytes: z.ZodNumber;
                    }, z.core.$strict>;
                    mounts: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        mode: z.ZodEnum<{
                            "read-only": "read-only";
                            "read-write": "read-write";
                        }>;
                        source_ref: z.ZodNullable<z.ZodString>;
                        target: z.ZodString;
                        max_bytes: z.ZodNumber;
                    }, z.core.$strict>>;
                    outputs: z.ZodArray<z.ZodObject<{
                        path: z.ZodString;
                        max_bytes: z.ZodNumber;
                        classification: z.ZodString;
                        required: z.ZodBoolean;
                    }, z.core.$strict>>;
                    network: z.ZodObject<{
                        mode: z.ZodEnum<{
                            deny: "deny";
                            allowlist: "allowlist";
                            unrestricted: "unrestricted";
                        }>;
                        destinations: z.ZodArray<z.ZodString>;
                        enforced_at: z.ZodString;
                        name_resolution: z.ZodString;
                    }, z.core.$strict>;
                    classification_ceiling: z.ZodString;
                    residency: z.ZodString;
                    retention: z.ZodString;
                    tenant_sharing: z.ZodEnum<{
                        "tenant-owned": "tenant-owned";
                        "deployment-shared": "deployment-shared";
                    }>;
                    tenant_resource_refs: z.ZodArray<z.ZodString>;
                    cost_dimensions: z.ZodArray<z.ZodString>;
                    created_by: z.ZodString;
                    reviewed_by: z.ZodString;
                }, z.core.$strict>;
                state: z.ZodEnum<{
                    enabled: "enabled";
                    disabled: "disabled";
                    registered: "registered";
                    draining: "draining";
                }>;
                secret_issuance_epoch: z.ZodNumber;
                published_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentDoctorRequestSchema: {
        readonly schema: z.ZodObject<{
            active_check: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentDoctorResultSchema: {
        readonly schema: z.ZodObject<{
            profile_ref: z.ZodString;
            ready: z.ZodBoolean;
            adapter: z.ZodObject<{
                contract: z.ZodLiteral<"environment-adapter/1">;
                name: z.ZodString;
                version: z.ZodString;
                adapter_digest: z.ZodString;
                backend: z.ZodEnum<{
                    ssh: "ssh";
                    firecracker: "firecracker";
                    apptainer: "apptainer";
                    process: "process";
                    oci: "oci";
                    "cloudflare-sandbox": "cloudflare-sandbox";
                    modal: "modal";
                    daytona: "daytona";
                    "vercel-sandbox": "vercel-sandbox";
                }>;
                operations: z.ZodArray<z.ZodEnum<{
                    cancel: "cancel";
                    observe: "observe";
                    teardown: "teardown";
                    descriptor: "descriptor";
                    prepare: "prepare";
                    submit: "submit";
                    reconcile: "reconcile";
                    collect: "collect";
                    abandon: "abandon";
                }>>;
                operation_classes: z.ZodArray<z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                isolation: z.ZodEnum<{
                    none: "none";
                    process: "process";
                    container: "container";
                    "remote-host": "remote-host";
                    microvm: "microvm";
                    "hosted-sandbox": "hosted-sandbox";
                }>;
                lifecycle: z.ZodObject<{
                    provider_idempotency: z.ZodBoolean;
                    idempotency_scope: z.ZodString;
                    idempotency_retention_ms: z.ZodNumber;
                    stable_environment_handle: z.ZodBoolean;
                    stable_job_handle: z.ZodBoolean;
                    observe_without_mutation: z.ZodBoolean;
                    reconciliation: z.ZodBoolean;
                    cancellation: z.ZodBoolean;
                    teardown: z.ZodBoolean;
                    automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                    retained_resources: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                omissions: z.ZodArray<z.ZodString>;
                owner: z.ZodString;
                reviewer: z.ZodString;
                conformance_refs: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            checks: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                passed: z.ZodBoolean;
                detail: z.ZodString;
            }, z.core.$strict>>;
            checked_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentConformanceRequestSchema: {
        readonly schema: z.ZodObject<{
            real_provider: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentConformanceResultSchema: {
        readonly schema: z.ZodObject<{
            profile_ref: z.ZodString;
            adapter_digest: z.ZodString;
            passed: z.ZodBoolean;
            real_provider: z.ZodBoolean;
            evidence_refs: z.ZodArray<z.ZodString>;
            omissions: z.ZodArray<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentJobListSchema: {
        readonly schema: z.ZodObject<{
            jobs: z.ZodArray<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentJobRefRequestSchema: {
        readonly schema: z.ZodObject<{
            job_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentJobActionRequestSchema: {
        readonly schema: z.ZodObject<{
            job_id: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentAbandonJobRequestSchema: {
        readonly schema: z.ZodObject<{
            job_id: z.ZodString;
            reason: z.ZodString;
            remaining_uncertainty: z.ZodArray<z.ZodString>;
            known_cost: z.ZodRecord<z.ZodString, z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentMeasurementSummarySchema: {
        readonly schema: z.ZodObject<{
            phase: z.ZodEnum<{
                observation: "observation";
                "server-cold-start": "server-cold-start";
                "adapter-coordinator-overhead": "adapter-coordinator-overhead";
                "environment-cold-start": "environment-cold-start";
                "environment-warm-start": "environment-warm-start";
                "submit-to-running": "submit-to-running";
                reconciliation: "reconciliation";
                cancellation: "cancellation";
                teardown: "teardown";
                "artifact-upload-throughput": "artifact-upload-throughput";
                "artifact-download-throughput": "artifact-download-throughput";
            }>;
            unit: z.ZodEnum<{
                milliseconds: "milliseconds";
                "bytes-per-second": "bytes-per-second";
            }>;
            count: z.ZodNumber;
            sample_window: z.ZodNumber;
            minimum: z.ZodNumber;
            p50: z.ZodNumber;
            p95: z.ZodNumber;
            p99: z.ZodNumber;
            maximum: z.ZodNumber;
            mean: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentMetricsSchema: {
        readonly schema: z.ZodObject<{
            tenant: z.ZodString;
            by_adapter: z.ZodRecord<z.ZodString, z.ZodObject<{
                active: z.ZodNumber;
                outcome_unknown: z.ZodNumber;
                cancel_requested: z.ZodNumber;
                teardown_pending: z.ZodNumber;
                torn_down: z.ZodNumber;
                abandoned: z.ZodNumber;
            }, z.core.$strict>>;
            measurements_by_adapter: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
                phase: z.ZodEnum<{
                    observation: "observation";
                    "server-cold-start": "server-cold-start";
                    "adapter-coordinator-overhead": "adapter-coordinator-overhead";
                    "environment-cold-start": "environment-cold-start";
                    "environment-warm-start": "environment-warm-start";
                    "submit-to-running": "submit-to-running";
                    reconciliation: "reconciliation";
                    cancellation: "cancellation";
                    teardown: "teardown";
                    "artifact-upload-throughput": "artifact-upload-throughput";
                    "artifact-download-throughput": "artifact-download-throughput";
                }>;
                unit: z.ZodEnum<{
                    milliseconds: "milliseconds";
                    "bytes-per-second": "bytes-per-second";
                }>;
                count: z.ZodNumber;
                sample_window: z.ZodNumber;
                minimum: z.ZodNumber;
                p50: z.ZodNumber;
                p95: z.ZodNumber;
                p99: z.ZodNumber;
                maximum: z.ZodNumber;
                mean: z.ZodNumber;
            }, z.core.$strict>>>;
            cost_by_adapter: z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodNumber>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentSweepRequestSchema: {
        readonly schema: z.ZodObject<{
            adapter_digest: z.ZodNullable<z.ZodString>;
            profile_ref: z.ZodNullable<z.ZodString>;
            limit: z.ZodNumber;
            teardown_terminal: z.ZodBoolean;
            inspect_provider_resources: z.ZodBoolean;
            remove_confirmed_orphans: z.ZodBoolean;
            orphan_grace_ms: z.ZodNumber;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentSweepResultSchema: {
        readonly schema: z.ZodObject<{
            inspected: z.ZodNumber;
            reconciled_job_ids: z.ZodArray<z.ZodString>;
            torn_down_job_ids: z.ZodArray<z.ZodString>;
            unresolved: z.ZodArray<z.ZodObject<{
                job_id: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                diagnostic: z.ZodString;
            }, z.core.$strict>>;
            provider_inventory_available: z.ZodBoolean;
            suspected_provider_handles: z.ZodArray<z.ZodString>;
            removed_provider_handles: z.ZodArray<z.ZodString>;
            unresolved_provider_resources: z.ZodArray<z.ZodObject<{
                provider_handle: z.ZodString;
                diagnostic: z.ZodString;
            }, z.core.$strict>>;
            truncated: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentResolutionRequestSchema: {
        readonly schema: z.ZodObject<{
            operation_class: z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
            acceptable_backends: z.ZodArray<z.ZodEnum<{
                ssh: "ssh";
                firecracker: "firecracker";
                apptainer: "apptainer";
                process: "process";
                oci: "oci";
                "cloudflare-sandbox": "cloudflare-sandbox";
                modal: "modal";
                daytona: "daytona";
                "vercel-sandbox": "vercel-sandbox";
            }>>;
            acceptable_isolations: z.ZodArray<z.ZodEnum<{
                none: "none";
                process: "process";
                container: "container";
                "remote-host": "remote-host";
                microvm: "microvm";
                "hosted-sandbox": "hosted-sandbox";
            }>>;
            minimum_limits: z.ZodObject<{
                cpu_millis: z.ZodNumber;
                memory_mib: z.ZodNumber;
                disk_mib: z.ZodNumber;
                gpu_count: z.ZodNumber;
                wall_time_ms: z.ZodNumber;
                process_count: z.ZodNumber;
                output_bytes: z.ZodNumber;
            }, z.core.$strict>;
            required_destinations: z.ZodArray<z.ZodString>;
            region: z.ZodNullable<z.ZodString>;
            classification: z.ZodString;
            preference_order: z.ZodArray<z.ZodString>;
            pinned_profile_ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentResolutionResultSchema: {
        readonly schema: z.ZodObject<{
            profile: z.ZodObject<{
                profile_ref: z.ZodString;
                name: z.ZodString;
                version: z.ZodString;
                adapter: z.ZodObject<{
                    contract: z.ZodLiteral<"environment-adapter/1">;
                    name: z.ZodString;
                    version: z.ZodString;
                    adapter_digest: z.ZodString;
                    backend: z.ZodEnum<{
                        ssh: "ssh";
                        firecracker: "firecracker";
                        apptainer: "apptainer";
                        process: "process";
                        oci: "oci";
                        "cloudflare-sandbox": "cloudflare-sandbox";
                        modal: "modal";
                        daytona: "daytona";
                        "vercel-sandbox": "vercel-sandbox";
                    }>;
                    operations: z.ZodArray<z.ZodEnum<{
                        cancel: "cancel";
                        observe: "observe";
                        teardown: "teardown";
                        descriptor: "descriptor";
                        prepare: "prepare";
                        submit: "submit";
                        reconcile: "reconcile";
                        collect: "collect";
                        abandon: "abandon";
                    }>>;
                    operation_classes: z.ZodArray<z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                    isolation: z.ZodEnum<{
                        none: "none";
                        process: "process";
                        container: "container";
                        "remote-host": "remote-host";
                        microvm: "microvm";
                        "hosted-sandbox": "hosted-sandbox";
                    }>;
                    lifecycle: z.ZodObject<{
                        provider_idempotency: z.ZodBoolean;
                        idempotency_scope: z.ZodString;
                        idempotency_retention_ms: z.ZodNumber;
                        stable_environment_handle: z.ZodBoolean;
                        stable_job_handle: z.ZodBoolean;
                        observe_without_mutation: z.ZodBoolean;
                        reconciliation: z.ZodBoolean;
                        cancellation: z.ZodBoolean;
                        teardown: z.ZodBoolean;
                        automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                        retained_resources: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    omissions: z.ZodArray<z.ZodString>;
                    owner: z.ZodString;
                    reviewer: z.ZodString;
                    conformance_refs: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                endpoint: z.ZodNullable<z.ZodString>;
                region: z.ZodNullable<z.ZodString>;
                provider_account_ref: z.ZodNullable<z.ZodString>;
                provider_scope_ref: z.ZodNullable<z.ZodString>;
                secret_refs: z.ZodArray<z.ZodString>;
                image_ref: z.ZodNullable<z.ZodString>;
                template_ref: z.ZodNullable<z.ZodString>;
                limits: z.ZodObject<{
                    cpu_millis: z.ZodNumber;
                    memory_mib: z.ZodNumber;
                    disk_mib: z.ZodNumber;
                    gpu_count: z.ZodNumber;
                    wall_time_ms: z.ZodNumber;
                    process_count: z.ZodNumber;
                    concurrency: z.ZodNumber;
                    output_bytes: z.ZodNumber;
                }, z.core.$strict>;
                mounts: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    mode: z.ZodEnum<{
                        "read-only": "read-only";
                        "read-write": "read-write";
                    }>;
                    source_ref: z.ZodNullable<z.ZodString>;
                    target: z.ZodString;
                    max_bytes: z.ZodNumber;
                }, z.core.$strict>>;
                outputs: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    max_bytes: z.ZodNumber;
                    classification: z.ZodString;
                    required: z.ZodBoolean;
                }, z.core.$strict>>;
                network: z.ZodObject<{
                    mode: z.ZodEnum<{
                        deny: "deny";
                        allowlist: "allowlist";
                        unrestricted: "unrestricted";
                    }>;
                    destinations: z.ZodArray<z.ZodString>;
                    enforced_at: z.ZodString;
                    name_resolution: z.ZodString;
                }, z.core.$strict>;
                classification_ceiling: z.ZodString;
                residency: z.ZodString;
                retention: z.ZodString;
                tenant_sharing: z.ZodEnum<{
                    "tenant-owned": "tenant-owned";
                    "deployment-shared": "deployment-shared";
                }>;
                tenant_resource_refs: z.ZodArray<z.ZodString>;
                cost_dimensions: z.ZodArray<z.ZodString>;
                created_by: z.ZodString;
                reviewed_by: z.ZodString;
            }, z.core.$strict>;
            considered_profile_refs: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentResumeContextSchema: {
        readonly schema: z.ZodObject<{
            tenant: z.ZodString;
            accepted_adapter_digest: z.ZodString;
            profile_state: z.ZodEnum<{
                enabled: "enabled";
                disabled: "disabled";
                registered: "registered";
                draining: "draining";
            }>;
            credential_ready: z.ZodBoolean;
            secret_issuance_epoch: z.ZodNumber;
            endpoint: z.ZodNullable<z.ZodString>;
            region: z.ZodNullable<z.ZodString>;
            provider_account_ref: z.ZodNullable<z.ZodString>;
            provider_scope_ref: z.ZodNullable<z.ZodString>;
            egress_destinations: z.ZodArray<z.ZodString>;
            classification_ceiling: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly SuspendedEnvironmentHandleSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            jobs: z.ZodArray<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            disposition: z.ZodEnum<{
                "continue-and-observe": "continue-and-observe";
                "request-cancel-and-reconcile": "request-cancel-and-reconcile";
                "retain-ready-environment-with-expiry": "retain-ready-environment-with-expiry";
                "teardown-after-collection": "teardown-after-collection";
                "operator-review-required": "operator-review-required";
            }>;
            recorded_at: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentLimitsSchema: {
        readonly schema: z.ZodObject<{
            cpu_millis: z.ZodNumber;
            memory_mib: z.ZodNumber;
            disk_mib: z.ZodNumber;
            gpu_count: z.ZodNumber;
            wall_time_ms: z.ZodNumber;
            process_count: z.ZodNumber;
            concurrency: z.ZodNumber;
            output_bytes: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-resources";
    };
    readonly EnvironmentNetworkPolicySchema: {
        readonly schema: z.ZodObject<{
            mode: z.ZodEnum<{
                deny: "deny";
                allowlist: "allowlist";
                unrestricted: "unrestricted";
            }>;
            destinations: z.ZodArray<z.ZodString>;
            enforced_at: z.ZodString;
            name_resolution: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentMountPolicySchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            mode: z.ZodEnum<{
                "read-only": "read-only";
                "read-write": "read-write";
            }>;
            source_ref: z.ZodNullable<z.ZodString>;
            target: z.ZodString;
            max_bytes: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentOutputDeclarationSchema: {
        readonly schema: z.ZodObject<{
            path: z.ZodString;
            max_bytes: z.ZodNumber;
            classification: z.ZodString;
            required: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentHandleBindingSchema: {
        readonly schema: z.ZodObject<{
            tenant: z.ZodString;
            run_id: z.ZodString;
            profile_ref: z.ZodString;
            adapter_digest: z.ZodString;
            operation_class: z.ZodEnum<{
                observation: "observation";
                "run-internal": "run-internal";
                "effect-proposal": "effect-proposal";
            }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
            operation: z.ZodString;
            tool_call_id: z.ZodString;
            lease_id: z.ZodString;
            executing_principal: z.ZodString;
            accountable_owner: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentHandleSchema: {
        readonly schema: z.ZodObject<{
            environment_id: z.ZodString;
            provider_handle: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            identity_ref: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            credential_epoch: z.ZodNullable<z.ZodNumber>;
            expires_at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EnvironmentJobHandleSchema: {
        readonly schema: z.ZodObject<{
            job_id: z.ZodString;
            provider_job_handle: z.ZodString;
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            submission_request_id: z.ZodString;
            request_hash: z.ZodString;
            idempotency_key: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly PrepareEnvironmentRequestSchema: {
        readonly schema: z.ZodObject<{
            profile: z.ZodObject<{
                profile_ref: z.ZodString;
                name: z.ZodString;
                version: z.ZodString;
                adapter: z.ZodObject<{
                    contract: z.ZodLiteral<"environment-adapter/1">;
                    name: z.ZodString;
                    version: z.ZodString;
                    adapter_digest: z.ZodString;
                    backend: z.ZodEnum<{
                        ssh: "ssh";
                        firecracker: "firecracker";
                        apptainer: "apptainer";
                        process: "process";
                        oci: "oci";
                        "cloudflare-sandbox": "cloudflare-sandbox";
                        modal: "modal";
                        daytona: "daytona";
                        "vercel-sandbox": "vercel-sandbox";
                    }>;
                    operations: z.ZodArray<z.ZodEnum<{
                        cancel: "cancel";
                        observe: "observe";
                        teardown: "teardown";
                        descriptor: "descriptor";
                        prepare: "prepare";
                        submit: "submit";
                        reconcile: "reconcile";
                        collect: "collect";
                        abandon: "abandon";
                    }>>;
                    operation_classes: z.ZodArray<z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>>;
                    isolation: z.ZodEnum<{
                        none: "none";
                        process: "process";
                        container: "container";
                        "remote-host": "remote-host";
                        microvm: "microvm";
                        "hosted-sandbox": "hosted-sandbox";
                    }>;
                    lifecycle: z.ZodObject<{
                        provider_idempotency: z.ZodBoolean;
                        idempotency_scope: z.ZodString;
                        idempotency_retention_ms: z.ZodNumber;
                        stable_environment_handle: z.ZodBoolean;
                        stable_job_handle: z.ZodBoolean;
                        observe_without_mutation: z.ZodBoolean;
                        reconciliation: z.ZodBoolean;
                        cancellation: z.ZodBoolean;
                        teardown: z.ZodBoolean;
                        automatic_expiry_ms: z.ZodNullable<z.ZodNumber>;
                        retained_resources: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                    omissions: z.ZodArray<z.ZodString>;
                    owner: z.ZodString;
                    reviewer: z.ZodString;
                    conformance_refs: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                endpoint: z.ZodNullable<z.ZodString>;
                region: z.ZodNullable<z.ZodString>;
                provider_account_ref: z.ZodNullable<z.ZodString>;
                provider_scope_ref: z.ZodNullable<z.ZodString>;
                secret_refs: z.ZodArray<z.ZodString>;
                image_ref: z.ZodNullable<z.ZodString>;
                template_ref: z.ZodNullable<z.ZodString>;
                limits: z.ZodObject<{
                    cpu_millis: z.ZodNumber;
                    memory_mib: z.ZodNumber;
                    disk_mib: z.ZodNumber;
                    gpu_count: z.ZodNumber;
                    wall_time_ms: z.ZodNumber;
                    process_count: z.ZodNumber;
                    concurrency: z.ZodNumber;
                    output_bytes: z.ZodNumber;
                }, z.core.$strict>;
                mounts: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    mode: z.ZodEnum<{
                        "read-only": "read-only";
                        "read-write": "read-write";
                    }>;
                    source_ref: z.ZodNullable<z.ZodString>;
                    target: z.ZodString;
                    max_bytes: z.ZodNumber;
                }, z.core.$strict>>;
                outputs: z.ZodArray<z.ZodObject<{
                    path: z.ZodString;
                    max_bytes: z.ZodNumber;
                    classification: z.ZodString;
                    required: z.ZodBoolean;
                }, z.core.$strict>>;
                network: z.ZodObject<{
                    mode: z.ZodEnum<{
                        deny: "deny";
                        allowlist: "allowlist";
                        unrestricted: "unrestricted";
                    }>;
                    destinations: z.ZodArray<z.ZodString>;
                    enforced_at: z.ZodString;
                    name_resolution: z.ZodString;
                }, z.core.$strict>;
                classification_ceiling: z.ZodString;
                residency: z.ZodString;
                retention: z.ZodString;
                tenant_sharing: z.ZodEnum<{
                    "tenant-owned": "tenant-owned";
                    "deployment-shared": "deployment-shared";
                }>;
                tenant_resource_refs: z.ZodArray<z.ZodString>;
                cost_dimensions: z.ZodArray<z.ZodString>;
                created_by: z.ZodString;
                reviewed_by: z.ZodString;
            }, z.core.$strict>;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly PrepareEnvironmentResultSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodNullable<z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly SubmitEnvironmentJobRequestSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            argv: z.ZodArray<z.ZodString>;
            working_directory: z.ZodString;
            environment_variables: z.ZodRecord<z.ZodString, z.ZodString>;
            operation_input: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            outputs: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                max_bytes: z.ZodNumber;
                classification: z.ZodString;
                required: z.ZodBoolean;
            }, z.core.$strict>>;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly SubmitEnvironmentJobResultSchema: {
        readonly schema: z.ZodObject<{
            job: z.ZodNullable<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly ObserveEnvironmentJobRequestSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly ObserveEnvironmentJobResultSchema: {
        readonly schema: z.ZodObject<{
            job: z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>;
            provider_time: z.ZodNullable<z.ZodString>;
            stdout_bytes: z.ZodNumber;
            stderr_bytes: z.ZodNumber;
            inline_output_json: z.ZodNullable<z.ZodString>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly ReconcileEnvironmentJobRequestSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodNullable<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            original_request_id: z.ZodString;
            original_idempotency_key: z.ZodString;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly ReconcileEnvironmentJobResultSchema: {
        readonly schema: z.ZodObject<{
            job: z.ZodNullable<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            provider_time: z.ZodNullable<z.ZodString>;
            stdout_bytes: z.ZodNumber;
            stderr_bytes: z.ZodNumber;
            inline_output_json: z.ZodNullable<z.ZodString>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly CancelEnvironmentJobRequestSchema: {
        readonly schema: z.ZodObject<{
            reason: z.ZodString;
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly CancelEnvironmentJobResultSchema: {
        readonly schema: z.ZodObject<{
            job: z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>;
            cannot_continue: z.ZodBoolean;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly CollectEnvironmentArtifactRequestSchema: {
        readonly schema: z.ZodObject<{
            source_path: z.ZodString;
            expected_hash: z.ZodNullable<z.ZodString>;
            expected_bytes: z.ZodNullable<z.ZodNumber>;
            max_bytes: z.ZodNumber;
            classification: z.ZodString;
            artifact_destination_ref: z.ZodString;
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly CollectEnvironmentArtifactResultSchema: {
        readonly schema: z.ZodObject<{
            artifact: z.ZodNullable<z.ZodObject<{
                artifact_ref: z.ZodString;
                source_path: z.ZodString;
                content_hash: z.ZodString;
                bytes: z.ZodNumber;
                classification: z.ZodString;
                source_environment_id: z.ZodString;
                source_job_id: z.ZodString;
                adapter_digest: z.ZodString;
                destination_ref: z.ZodString;
            }, z.core.$strict>>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly CollectedEnvironmentArtifactSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            source_path: z.ZodString;
            content_hash: z.ZodString;
            bytes: z.ZodNumber;
            classification: z.ZodString;
            source_environment_id: z.ZodString;
            source_job_id: z.ZodString;
            adapter_digest: z.ZodString;
            destination_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly TeardownEnvironmentRequestSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            reason: z.ZodString;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly TeardownEnvironmentResultSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            retained_resources: z.ZodArray<z.ZodString>;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly AbandonEnvironmentRequestSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodNullable<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            actor: z.ZodString;
            reason: z.ZodString;
            known_cost: z.ZodRecord<z.ZodString, z.ZodNumber>;
            remaining_uncertainty: z.ZodArray<z.ZodString>;
            affected_artifacts: z.ZodArray<z.ZodString>;
            blocks_verified_completion: z.ZodBoolean;
            request_id: z.ZodString;
            binding: z.ZodObject<{
                tenant: z.ZodString;
                run_id: z.ZodString;
                profile_ref: z.ZodString;
                adapter_digest: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                operation: z.ZodString;
                tool_call_id: z.ZodString;
                lease_id: z.ZodString;
                executing_principal: z.ZodString;
                accountable_owner: z.ZodString;
            }, z.core.$strict>;
            idempotency_key: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly AbandonEnvironmentResultSchema: {
        readonly schema: z.ZodObject<{
            environment: z.ZodObject<{
                environment_id: z.ZodString;
                provider_handle: z.ZodString;
                binding: z.ZodObject<{
                    tenant: z.ZodString;
                    run_id: z.ZodString;
                    profile_ref: z.ZodString;
                    adapter_digest: z.ZodString;
                    operation_class: z.ZodEnum<{
                        observation: "observation";
                        "run-internal": "run-internal";
                        "effect-proposal": "effect-proposal";
                    }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                    operation: z.ZodString;
                    tool_call_id: z.ZodString;
                    lease_id: z.ZodString;
                    executing_principal: z.ZodString;
                    accountable_owner: z.ZodString;
                }, z.core.$strict>;
                identity_ref: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
                expires_at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            job: z.ZodNullable<z.ZodObject<{
                job_id: z.ZodString;
                provider_job_handle: z.ZodString;
                environment: z.ZodObject<{
                    environment_id: z.ZodString;
                    provider_handle: z.ZodString;
                    binding: z.ZodObject<{
                        tenant: z.ZodString;
                        run_id: z.ZodString;
                        profile_ref: z.ZodString;
                        adapter_digest: z.ZodString;
                        operation_class: z.ZodEnum<{
                            observation: "observation";
                            "run-internal": "run-internal";
                            "effect-proposal": "effect-proposal";
                        }> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
                        operation: z.ZodString;
                        tool_call_id: z.ZodString;
                        lease_id: z.ZodString;
                        executing_principal: z.ZodString;
                        accountable_owner: z.ZodString;
                    }, z.core.$strict>;
                    identity_ref: z.ZodString;
                    status: z.ZodEnum<{
                        running: "running";
                        cancelled: "cancelled";
                        failed: "failed";
                        "outcome-unknown": "outcome-unknown";
                        ready: "ready";
                        preparing: "preparing";
                        submitted: "submitted";
                        collectible: "collectible";
                        collected: "collected";
                        "cancel-requested": "cancel-requested";
                        "teardown-pending": "teardown-pending";
                        "torn-down": "torn-down";
                        abandoned: "abandoned";
                    }>;
                    credential_epoch: z.ZodNullable<z.ZodNumber>;
                    expires_at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
                submission_request_id: z.ZodString;
                request_hash: z.ZodString;
                idempotency_key: z.ZodString;
                status: z.ZodEnum<{
                    running: "running";
                    cancelled: "cancelled";
                    failed: "failed";
                    "outcome-unknown": "outcome-unknown";
                    ready: "ready";
                    preparing: "preparing";
                    submitted: "submitted";
                    collectible: "collectible";
                    collected: "collected";
                    "cancel-requested": "cancel-requested";
                    "teardown-pending": "teardown-pending";
                    "torn-down": "torn-down";
                    abandoned: "abandoned";
                }>;
            }, z.core.$strict>>;
            blocks_verified_completion: z.ZodBoolean;
            request_id: z.ZodString;
            status: z.ZodEnum<{
                running: "running";
                cancelled: "cancelled";
                failed: "failed";
                "outcome-unknown": "outcome-unknown";
                ready: "ready";
                preparing: "preparing";
                submitted: "submitted";
                collectible: "collectible";
                collected: "collected";
                "cancel-requested": "cancel-requested";
                "teardown-pending": "teardown-pending";
                "torn-down": "torn-down";
                abandoned: "abandoned";
            }>;
            may_have_reached_provider: z.ZodBoolean;
            provider_response_ref: z.ZodNullable<z.ZodString>;
            diagnostic: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly EntrySchema: {
        readonly schema: z.ZodObject<{
            entry_id: z.ZodString;
            run_id: z.ZodString;
            parent_id: z.ZodNullable<z.ZodString>;
            role: z.ZodEnum<{
                system: "system";
                user: "user";
                assistant: "assistant";
                tool_result: "tool_result";
                steer: "steer";
                marker: "marker";
            }>;
            content: z.ZodObject<{
                text: z.ZodString;
            }, z.core.$strict>;
            content_hash: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RecordEnvelopeSchema: {
        readonly schema: z.ZodObject<{
            record_id: z.ZodString;
            run_id: z.ZodString;
            seq: z.ZodNumber;
            logical_clock: z.ZodNumber;
            causal_parent: z.ZodNullable<z.ZodString>;
            type: z.ZodEnum<{
                "run.created": "run.created";
                "run.started": "run.started";
                "entry.appended": "entry.appended";
                "branch.created": "branch.created";
                "branch.head.moved": "branch.head.moved";
                "context.assembled": "context.assembled";
                "model.call.started": "model.call.started";
                "model.call.finished": "model.call.finished";
                "model.call.failed": "model.call.failed";
                "model.fallback.switched": "model.fallback.switched";
                "turn.completed": "turn.completed";
                "control.received": "control.received";
                "control.applied": "control.applied";
                "lease.opened": "lease.opened";
                "lease.reserved": "lease.reserved";
                "lease.consumed": "lease.consumed";
                "lease.released": "lease.released";
                "subrun.opened": "subrun.opened";
                "subrun.finished": "subrun.finished";
                "tool.invoked": "tool.invoked";
                "tool.remote.pending": "tool.remote.pending";
                "tool.finished": "tool.finished";
                "environment.prepare.requested": "environment.prepare.requested";
                "environment.prepared": "environment.prepared";
                "environment.job.submit.requested": "environment.job.submit.requested";
                "environment.job.submitted": "environment.job.submitted";
                "environment.job.observe.requested": "environment.job.observe.requested";
                "environment.job.observed": "environment.job.observed";
                "environment.job.reconcile.requested": "environment.job.reconcile.requested";
                "environment.job.reconciled": "environment.job.reconciled";
                "environment.job.cancel.requested": "environment.job.cancel.requested";
                "environment.job.cancelled": "environment.job.cancelled";
                "environment.artifact.collect.requested": "environment.artifact.collect.requested";
                "environment.artifact.collected": "environment.artifact.collected";
                "artifact.committed": "artifact.committed";
                "environment.teardown.requested": "environment.teardown.requested";
                "environment.teardown.recorded": "environment.teardown.recorded";
                "environment.abandon.requested": "environment.abandon.requested";
                "environment.abandoned": "environment.abandoned";
                "effect.prepared": "effect.prepared";
                "effect.authority.decision": "effect.authority.decision";
                "effect.authority.invalidated": "effect.authority.invalidated";
                "effect.dispatched": "effect.dispatched";
                "effect.resolved": "effect.resolved";
                "effect.unreconcilable": "effect.unreconcilable";
                "grant.superseded": "grant.superseded";
                "item.attempted": "item.attempted";
                "item.parked": "item.parked";
                "item.invalidated": "item.invalidated";
                "gap.settled": "gap.settled";
                "gap.dismissed": "gap.dismissed";
                "checkpoint.started": "checkpoint.started";
                "checkpoint.passed": "checkpoint.passed";
                "checkpoint.rejected": "checkpoint.rejected";
                "checkpoint.indeterminate": "checkpoint.indeterminate";
                "repair.started": "repair.started";
                "completion.proposed": "completion.proposed";
                "verification.concluded": "verification.concluded";
                "run.suspended": "run.suspended";
                "run.resume.blocked": "run.resume.blocked";
                "run.resumed": "run.resumed";
                "run.cancelled": "run.cancelled";
                "run.finished": "run.finished";
                "run.forked": "run.forked";
                "reexecution.started": "reexecution.started";
                "subject.erasure.completed": "subject.erasure.completed";
                "wake.scheduled": "wake.scheduled";
                "wake.claimed": "wake.claimed";
                "memory.event.recorded": "memory.event.recorded";
                "memory.read.recorded": "memory.read.recorded";
                "external.observation.received": "external.observation.received";
                "external.observation.applied": "external.observation.applied";
                "projection.rebuilt": "projection.rebuilt";
                "run.lifecycle.command.accepted": "run.lifecycle.command.accepted";
            }>;
            type_version: z.ZodNumber;
            at: z.ZodString;
            payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            chain_hash: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RunSnapshotSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            status: z.ZodEnum<{
                created: "created";
                running: "running";
                suspended: "suspended";
                cancelled: "cancelled";
                finished: "finished";
            }>;
            completion_state: z.ZodEnum<{
                working: "working";
                checkpoint_verifying: "checkpoint_verifying";
                completion_proposed: "completion_proposed";
                verifying: "verifying";
                gap_open: "gap_open";
                repair: "repair";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>;
            terminal: z.ZodNullable<z.ZodEnum<{
                cancelled: "cancelled";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>>;
            suspend_reason: z.ZodNullable<z.ZodEnum<{
                budget_exhausted: "budget_exhausted";
                provider_failure: "provider_failure";
                awaiting_answer: "awaiting_answer";
                operator_pause: "operator_pause";
                stagnation: "stagnation";
                remote_task: "remote_task";
            }>>;
            turn: z.ZodNumber;
            current_branch: z.ZodNullable<z.ZodString>;
            head_entry_id: z.ZodNullable<z.ZodString>;
            entry_count: z.ZodNumber;
            agent_name: z.ZodString;
            model_ref: z.ZodString;
            objective: z.ZodString;
            budgets: z.ZodNullable<z.ZodObject<{
                consumption: z.ZodObject<{
                    model_tokens: z.ZodNumber;
                    tool_calls: z.ZodOptional<z.ZodNumber>;
                    bytes: z.ZodOptional<z.ZodNumber>;
                    compute_ms: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strict>;
                attention: z.ZodNumber;
                verification_reserve_fraction: z.ZodNumber;
                max_turns: z.ZodNumber;
            }, z.core.$strict>>;
            usage: z.ZodRecord<z.ZodString, z.ZodObject<{
                reserved: z.ZodNumber;
                consumed: z.ZodNumber;
            }, z.core.$strict>>;
            verified_completion_reachable: z.ZodBoolean;
            items: z.ZodNullable<z.ZodRecord<z.ZodEnum<{
                verified: "verified";
                untouched: "untouched";
                completed_unverified: "completed_unverified";
                parked: "parked";
                dismissed: "dismissed";
                failed: "failed";
                invalidated: "invalidated";
            }>, z.ZodNumber>>;
            contract: z.ZodNullable<z.ZodObject<{
                name: z.ZodString;
                ref: z.ZodString;
                repair_attempts_used: z.ZodNumber;
                repair_budget: z.ZodNumber;
            }, z.core.$strict>>;
            snapshot_version: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly WorkQueryRequestSchema: {
        readonly schema: z.ZodObject<{
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodOptional<z.ZodNumber>;
            lifecycle_state: z.ZodOptional<z.ZodEnum<{
                created: "created";
                running: "running";
                suspended: "suspended";
                cancelled: "cancelled";
                finished: "finished";
            }>>;
            completion_class: z.ZodOptional<z.ZodEnum<{
                cancelled: "cancelled";
                working: "working";
                verified: "verified";
                rejected: "rejected";
                indeterminate: "indeterminate";
                exhausted: "exhausted";
                unverified: "unverified";
            }>>;
            review_state: z.ZodOptional<z.ZodEnum<{
                pending: "pending";
                none: "none";
            }>>;
            publication_ref: z.ZodOptional<z.ZodString>;
            created_from: z.ZodOptional<z.ZodString>;
            created_before: z.ZodOptional<z.ZodString>;
            correlation_id: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly WorkQueryItemSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            created_at: z.ZodString;
            status: z.ZodEnum<{
                created: "created";
                running: "running";
                suspended: "suspended";
                cancelled: "cancelled";
                finished: "finished";
            }>;
            completion_state: z.ZodEnum<{
                working: "working";
                checkpoint_verifying: "checkpoint_verifying";
                completion_proposed: "completion_proposed";
                verifying: "verifying";
                gap_open: "gap_open";
                repair: "repair";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>;
            terminal: z.ZodNullable<z.ZodEnum<{
                cancelled: "cancelled";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>>;
            completion_class: z.ZodEnum<{
                cancelled: "cancelled";
                working: "working";
                verified: "verified";
                rejected: "rejected";
                indeterminate: "indeterminate";
                exhausted: "exhausted";
                unverified: "unverified";
            }>;
            review_state: z.ZodEnum<{
                pending: "pending";
                none: "none";
            }>;
            publication_ref: z.ZodNullable<z.ZodString>;
            correlation_id: z.ZodNullable<z.ZodString>;
            agent_name: z.ZodString;
            objective: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly WorkQueryPageSchema: {
        readonly schema: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                run_id: z.ZodString;
                created_at: z.ZodString;
                status: z.ZodEnum<{
                    created: "created";
                    running: "running";
                    suspended: "suspended";
                    cancelled: "cancelled";
                    finished: "finished";
                }>;
                completion_state: z.ZodEnum<{
                    working: "working";
                    checkpoint_verifying: "checkpoint_verifying";
                    completion_proposed: "completion_proposed";
                    verifying: "verifying";
                    gap_open: "gap_open";
                    repair: "repair";
                    complete: "complete";
                    unverified_artifact: "unverified_artifact";
                }>;
                terminal: z.ZodNullable<z.ZodEnum<{
                    cancelled: "cancelled";
                    complete: "complete";
                    unverified_artifact: "unverified_artifact";
                }>>;
                completion_class: z.ZodEnum<{
                    cancelled: "cancelled";
                    working: "working";
                    verified: "verified";
                    rejected: "rejected";
                    indeterminate: "indeterminate";
                    exhausted: "exhausted";
                    unverified: "unverified";
                }>;
                review_state: z.ZodEnum<{
                    pending: "pending";
                    none: "none";
                }>;
                publication_ref: z.ZodNullable<z.ZodString>;
                correlation_id: z.ZodNullable<z.ZodString>;
                agent_name: z.ZodString;
                objective: z.ZodString;
            }, z.core.$strict>>;
            next_cursor: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RunIntegrityFindingSchema: {
        readonly schema: z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
            seq: z.ZodOptional<z.ZodNumber>;
            anchor_ref: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RunIntegritySummarySchema: {
        readonly schema: z.ZodObject<{
            ok: z.ZodBoolean;
            anchor_store_available: z.ZodBoolean;
            last_anchored_seq: z.ZodNumber;
            last_anchored_head: z.ZodNullable<z.ZodString>;
            latest_anchor_ref: z.ZodNullable<z.ZodString>;
            unanchored_tail_records: z.ZodNumber;
            unanchored_tail: z.ZodNullable<z.ZodObject<{
                from_seq: z.ZodNumber;
                to_seq: z.ZodNumber;
                reason: z.ZodString;
            }, z.core.$strict>>;
            findings: z.ZodArray<z.ZodObject<{
                code: z.ZodString;
                message: z.ZodString;
                seq: z.ZodOptional<z.ZodNumber>;
                anchor_ref: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ExternalEvidencePropertySchema: {
        readonly schema: z.ZodObject<{
            family: z.ZodEnum<{
                "actor-identity": "actor-identity";
                "principal-authority": "principal-authority";
                "action-boundary": "action-boundary";
                "policy-basis": "policy-basis";
                "decision-basis": "decision-basis";
                "data-and-resource-touch": "data-and-resource-touch";
                "lifecycle-context": "lifecycle-context";
                "verification-strength": "verification-strength";
            }>;
            standing: z.ZodEnum<{
                sufficient: "sufficient";
                partial: "partial";
                missing: "missing";
                conflicting: "conflicting";
                opaque: "opaque";
            }>;
            classification: z.ZodEnum<{
                gap: "gap";
                sufficient: "sufficient";
                "design-exclusion": "design-exclusion";
            }>;
            evidence_record_ids: z.ZodArray<z.ZodString>;
            verification_strength: z.ZodEnum<{
                cryptographic: "cryptographic";
                "schema-validated": "schema-validated";
                replayable: "replayable";
                attested: "attested";
                narrated: "narrated";
            }>;
            candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            conflict: z.ZodNullable<z.ZodString>;
            clause: z.ZodOptional<z.ZodString>;
            requirement_id: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceDecisionSchema: {
        readonly schema: z.ZodObject<{
            decision_id: z.ZodString;
            kind: z.ZodEnum<{
                "effect-dispatch": "effect-dispatch";
                "verification-verdict": "verification-verdict";
                "checkpoint-rejection": "checkpoint-rejection";
            }>;
            anchoring_record_id: z.ZodString;
            run_id: z.ZodString;
            properties: z.ZodArray<z.ZodObject<{
                family: z.ZodEnum<{
                    "actor-identity": "actor-identity";
                    "principal-authority": "principal-authority";
                    "action-boundary": "action-boundary";
                    "policy-basis": "policy-basis";
                    "decision-basis": "decision-basis";
                    "data-and-resource-touch": "data-and-resource-touch";
                    "lifecycle-context": "lifecycle-context";
                    "verification-strength": "verification-strength";
                }>;
                standing: z.ZodEnum<{
                    sufficient: "sufficient";
                    partial: "partial";
                    missing: "missing";
                    conflicting: "conflicting";
                    opaque: "opaque";
                }>;
                classification: z.ZodEnum<{
                    gap: "gap";
                    sufficient: "sufficient";
                    "design-exclusion": "design-exclusion";
                }>;
                evidence_record_ids: z.ZodArray<z.ZodString>;
                verification_strength: z.ZodEnum<{
                    cryptographic: "cryptographic";
                    "schema-validated": "schema-validated";
                    replayable: "replayable";
                    attested: "attested";
                    narrated: "narrated";
                }>;
                candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                conflict: z.ZodNullable<z.ZodString>;
                clause: z.ZodOptional<z.ZodString>;
                requirement_id: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceMetricSummarySchema: {
        readonly schema: z.ZodObject<{
            decision_count: z.ZodNumber;
            property_count: z.ZodNumber;
            sufficient_property_count: z.ZodNumber;
            design_exclusion_property_count: z.ZodNumber;
            gap_property_count: z.ZodNumber;
            property_sufficiency_accuracy_ppm: z.ZodNumber;
            overclaim_rate_ppm: z.ZodNumber;
            underclaim_rate_ppm: z.ZodNumber;
            gap_localization_ppm: z.ZodNumber;
            overclaim_count: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceRubricSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            source_ref: z.ZodString;
            read_as: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceReferenceBundleSchema: {
        readonly schema: z.ZodObject<{
            bundle_ref: z.ZodString;
            label: z.ZodString;
            vector_id: z.ZodString;
            run_id: z.ZodString;
            format: z.ZodString;
            record_count: z.ZodNumber;
            checksum_sha256: z.ZodString;
            chain_failure_seq: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceDegradationSchema: {
        readonly schema: z.ZodObject<{
            degradation: z.ZodEnum<{
                "record-removal": "record-removal";
                truncation: "truncation";
                rewrite: "rewrite";
                "conflicting-copies": "conflicting-copies";
                "anchor-loss": "anchor-loss";
                "signer-substitution": "signer-substitution";
                rollback: "rollback";
                "narration-only": "narration-only";
            }>;
            integrity_finding: z.ZodString;
            affected_properties: z.ZodArray<z.ZodEnum<{
                "actor-identity": "actor-identity";
                "principal-authority": "principal-authority";
                "action-boundary": "action-boundary";
                "policy-basis": "policy-basis";
                "decision-basis": "decision-basis";
                "data-and-resource-touch": "data-and-resource-touch";
                "lifecycle-context": "lifecycle-context";
                "verification-strength": "verification-strength";
            }>>;
            insufficient_decision_ids: z.ZodArray<z.ZodString>;
            overclaim_count: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceInvariantSchema: {
        readonly schema: z.ZodObject<{
            invariant: z.ZodEnum<{
                "authority-monotonicity": "authority-monotonicity";
                "scope-non-expansion": "scope-non-expansion";
                "deletion-propagation": "deletion-propagation";
                "provenance-preservation": "provenance-preservation";
                "rollback-traceability": "rollback-traceability";
            }>;
            episode_id: z.ZodString;
            vector_id: z.ZodString;
            obligation: z.ZodString;
            status: z.ZodEnum<{
                met: "met";
                "not-met": "not-met";
            }>;
            evidence_record_ids: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceDemonstrationSideSchema: {
        readonly schema: z.ZodObject<{
            side: z.ZodEnum<{
                "zero-ar": "zero-ar";
                "conventional-agent": "conventional-agent";
            }>;
            bundle_id: z.ZodString;
            bundle_ref: z.ZodString;
            terminal_state: z.ZodString;
            checkpoint_rejection_count: z.ZodNumber;
            invalidated_item_count: z.ZodNumber;
            repair_count: z.ZodNumber;
            verification_verdicts: z.ZodArray<z.ZodString>;
            honest_terminal: z.ZodBoolean;
            absence_notes: z.ZodArray<z.ZodString>;
            evidence_record_ids: z.ZodObject<{
                checkpoint_rejections: z.ZodArray<z.ZodString>;
                invalidations: z.ZodArray<z.ZodString>;
                repairs: z.ZodArray<z.ZodString>;
                verdicts: z.ZodArray<z.ZodString>;
                terminals: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidencePairedDemonstrationSchema: {
        readonly schema: z.ZodObject<{
            demonstration_id: z.ZodString;
            task_label: z.ZodString;
            injected_fault: z.ZodString;
            sides: z.ZodArray<z.ZodObject<{
                side: z.ZodEnum<{
                    "zero-ar": "zero-ar";
                    "conventional-agent": "conventional-agent";
                }>;
                bundle_id: z.ZodString;
                bundle_ref: z.ZodString;
                terminal_state: z.ZodString;
                checkpoint_rejection_count: z.ZodNumber;
                invalidated_item_count: z.ZodNumber;
                repair_count: z.ZodNumber;
                verification_verdicts: z.ZodArray<z.ZodString>;
                honest_terminal: z.ZodBoolean;
                absence_notes: z.ZodArray<z.ZodString>;
                evidence_record_ids: z.ZodObject<{
                    checkpoint_rejections: z.ZodArray<z.ZodString>;
                    invalidations: z.ZodArray<z.ZodString>;
                    repairs: z.ZodArray<z.ZodString>;
                    verdicts: z.ZodArray<z.ZodString>;
                    terminals: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceReportSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-external-evidence-report/1">;
            report_ref: z.ZodString;
            runtime_identity: z.ZodObject<{
                product: z.ZodString;
                kernel: z.ZodString;
                release_manifest_ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            source_commit: z.ZodString;
            scorer_identity: z.ZodObject<{
                package: z.ZodLiteral<"@zero-ar/evidence">;
                version: z.ZodString;
                schema_version: z.ZodString;
                scorer_ref: z.ZodString;
            }, z.core.$strict>;
            reference_profile: z.ZodString;
            bundle_refs: z.ZodArray<z.ZodString>;
            rubrics: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                source_ref: z.ZodString;
                read_as: z.ZodString;
            }, z.core.$strict>>;
            reference_bundles: z.ZodArray<z.ZodObject<{
                bundle_ref: z.ZodString;
                label: z.ZodString;
                vector_id: z.ZodString;
                run_id: z.ZodString;
                format: z.ZodString;
                record_count: z.ZodNumber;
                checksum_sha256: z.ZodString;
                chain_failure_seq: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            decisions: z.ZodArray<z.ZodObject<{
                decision_id: z.ZodString;
                kind: z.ZodEnum<{
                    "effect-dispatch": "effect-dispatch";
                    "verification-verdict": "verification-verdict";
                    "checkpoint-rejection": "checkpoint-rejection";
                }>;
                anchoring_record_id: z.ZodString;
                run_id: z.ZodString;
                properties: z.ZodArray<z.ZodObject<{
                    family: z.ZodEnum<{
                        "actor-identity": "actor-identity";
                        "principal-authority": "principal-authority";
                        "action-boundary": "action-boundary";
                        "policy-basis": "policy-basis";
                        "decision-basis": "decision-basis";
                        "data-and-resource-touch": "data-and-resource-touch";
                        "lifecycle-context": "lifecycle-context";
                        "verification-strength": "verification-strength";
                    }>;
                    standing: z.ZodEnum<{
                        sufficient: "sufficient";
                        partial: "partial";
                        missing: "missing";
                        conflicting: "conflicting";
                        opaque: "opaque";
                    }>;
                    classification: z.ZodEnum<{
                        gap: "gap";
                        sufficient: "sufficient";
                        "design-exclusion": "design-exclusion";
                    }>;
                    evidence_record_ids: z.ZodArray<z.ZodString>;
                    verification_strength: z.ZodEnum<{
                        cryptographic: "cryptographic";
                        "schema-validated": "schema-validated";
                        replayable: "replayable";
                        attested: "attested";
                        narrated: "narrated";
                    }>;
                    candidate: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                    conflict: z.ZodNullable<z.ZodString>;
                    clause: z.ZodOptional<z.ZodString>;
                    requirement_id: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            degradations: z.ZodArray<z.ZodObject<{
                degradation: z.ZodEnum<{
                    "record-removal": "record-removal";
                    truncation: "truncation";
                    rewrite: "rewrite";
                    "conflicting-copies": "conflicting-copies";
                    "anchor-loss": "anchor-loss";
                    "signer-substitution": "signer-substitution";
                    rollback: "rollback";
                    "narration-only": "narration-only";
                }>;
                integrity_finding: z.ZodString;
                affected_properties: z.ZodArray<z.ZodEnum<{
                    "actor-identity": "actor-identity";
                    "principal-authority": "principal-authority";
                    "action-boundary": "action-boundary";
                    "policy-basis": "policy-basis";
                    "decision-basis": "decision-basis";
                    "data-and-resource-touch": "data-and-resource-touch";
                    "lifecycle-context": "lifecycle-context";
                    "verification-strength": "verification-strength";
                }>>;
                insufficient_decision_ids: z.ZodArray<z.ZodString>;
                overclaim_count: z.ZodNumber;
            }, z.core.$strict>>;
            invariants: z.ZodArray<z.ZodObject<{
                invariant: z.ZodEnum<{
                    "authority-monotonicity": "authority-monotonicity";
                    "scope-non-expansion": "scope-non-expansion";
                    "deletion-propagation": "deletion-propagation";
                    "provenance-preservation": "provenance-preservation";
                    "rollback-traceability": "rollback-traceability";
                }>;
                episode_id: z.ZodString;
                vector_id: z.ZodString;
                obligation: z.ZodString;
                status: z.ZodEnum<{
                    met: "met";
                    "not-met": "not-met";
                }>;
                evidence_record_ids: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            paired_demonstrations: z.ZodArray<z.ZodObject<{
                demonstration_id: z.ZodString;
                task_label: z.ZodString;
                injected_fault: z.ZodString;
                sides: z.ZodArray<z.ZodObject<{
                    side: z.ZodEnum<{
                        "zero-ar": "zero-ar";
                        "conventional-agent": "conventional-agent";
                    }>;
                    bundle_id: z.ZodString;
                    bundle_ref: z.ZodString;
                    terminal_state: z.ZodString;
                    checkpoint_rejection_count: z.ZodNumber;
                    invalidated_item_count: z.ZodNumber;
                    repair_count: z.ZodNumber;
                    verification_verdicts: z.ZodArray<z.ZodString>;
                    honest_terminal: z.ZodBoolean;
                    absence_notes: z.ZodArray<z.ZodString>;
                    evidence_record_ids: z.ZodObject<{
                        checkpoint_rejections: z.ZodArray<z.ZodString>;
                        invalidations: z.ZodArray<z.ZodString>;
                        repairs: z.ZodArray<z.ZodString>;
                        verdicts: z.ZodArray<z.ZodString>;
                        terminals: z.ZodArray<z.ZodString>;
                    }, z.core.$strict>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            summary: z.ZodObject<{
                decision_count: z.ZodNumber;
                property_count: z.ZodNumber;
                sufficient_property_count: z.ZodNumber;
                design_exclusion_property_count: z.ZodNumber;
                gap_property_count: z.ZodNumber;
                property_sufficiency_accuracy_ppm: z.ZodNumber;
                overclaim_rate_ppm: z.ZodNumber;
                underclaim_rate_ppm: z.ZodNumber;
                gap_localization_ppm: z.ZodNumber;
                overclaim_count: z.ZodNumber;
            }, z.core.$strict>;
            disclaimer: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceCampaignOutcomeSchema: {
        readonly schema: z.ZodObject<{
            bundle_ref: z.ZodString;
            vector_id: z.ZodString;
            decision_count: z.ZodNumber;
            terminal_state: z.ZodString;
            verdicts: z.ZodArray<z.ZodString>;
            effect_outcomes: z.ZodArray<z.ZodString>;
            integrity_findings: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceCampaignManifestSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-external-evidence-campaign/1">;
            campaign_manifest_ref: z.ZodString;
            campaign_mode: z.ZodEnum<{
                fixture: "fixture";
                executed: "executed";
            }>;
            source_commit: z.ZodString;
            source_repository: z.ZodString;
            source_commit_available_on_origin: z.ZodBoolean;
            runtime_image_digest: z.ZodString;
            runtime_release_manifest_ref: z.ZodString;
            environment_kind: z.ZodEnum<{
                "orbstack-linux": "orbstack-linux";
                "github-actions-linux": "github-actions-linux";
            }>;
            os: z.ZodString;
            architecture: z.ZodString;
            container_runtime: z.ZodString;
            postgres_version: z.ZodString;
            model_fixture_ref: z.ZodString;
            effect_target_ref: z.ZodString;
            signer_test_key_ref: z.ZodString;
            dependency_lock_ref: z.ZodString;
            node_version: z.ZodString;
            campaign_profile_ref: z.ZodString;
            reference_bundle_refs: z.ZodArray<z.ZodString>;
            reference_vector_receipts: z.ZodArray<z.ZodObject<{
                vector_id: z.ZodEnum<{
                    "transformation-volume": "transformation-volume";
                    "http-effect": "http-effect";
                    "parked-human-answer": "parked-human-answer";
                    "subject-erasure": "subject-erasure";
                }>;
                test_path: z.ZodString;
                test_file_ref: z.ZodString;
                log_ref: z.ZodString;
                test_count: z.ZodNumber;
                passed_count: z.ZodNumber;
                failed_count: z.ZodNumber;
                skipped_count: z.ZodNumber;
                duration_ms: z.ZodNumber;
            }, z.core.$strict>>;
            frozen_bundle_report_ref: z.ZodString;
            reference_outcomes: z.ZodArray<z.ZodObject<{
                bundle_ref: z.ZodString;
                vector_id: z.ZodString;
                decision_count: z.ZodNumber;
                terminal_state: z.ZodString;
                verdicts: z.ZodArray<z.ZodString>;
                effect_outcomes: z.ZodArray<z.ZodString>;
                integrity_findings: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            started_at: z.ZodString;
            finished_at: z.ZodString;
            workflow_run_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly ExternalEvidenceComparisonSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-external-evidence-comparison/1">;
            comparison_ref: z.ZodString;
            source_commit: z.ZodString;
            campaign_profile_ref: z.ZodString;
            local_campaign_manifest_ref: z.ZodString;
            ci_campaign_manifest_ref: z.ZodString;
            semantic_outcomes: z.ZodArray<z.ZodObject<{
                bundle_ref: z.ZodString;
                vector_id: z.ZodString;
                local: z.ZodObject<{
                    bundle_ref: z.ZodString;
                    vector_id: z.ZodString;
                    decision_count: z.ZodNumber;
                    terminal_state: z.ZodString;
                    verdicts: z.ZodArray<z.ZodString>;
                    effect_outcomes: z.ZodArray<z.ZodString>;
                    integrity_findings: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                ci: z.ZodObject<{
                    bundle_ref: z.ZodString;
                    vector_id: z.ZodString;
                    decision_count: z.ZodNumber;
                    terminal_state: z.ZodString;
                    verdicts: z.ZodArray<z.ZodString>;
                    effect_outcomes: z.ZodArray<z.ZodString>;
                    integrity_findings: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                equal: z.ZodBoolean;
            }, z.core.$strict>>;
            frozen_bundle_report_refs: z.ZodObject<{
                local: z.ZodString;
                ci: z.ZodString;
                equal: z.ZodBoolean;
            }, z.core.$strict>;
            mismatches: z.ZodArray<z.ZodString>;
            tool_identity: z.ZodObject<{
                package: z.ZodLiteral<"@zero-ar/evidence">;
                version: z.ZodString;
                schema_version: z.ZodString;
                tool_ref: z.ZodString;
            }, z.core.$strict>;
            publishable: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "external-evidence";
    };
    readonly IntegrityHealthSchema: {
        readonly schema: z.ZodObject<{
            available: z.ZodBoolean;
            readiness: z.ZodEnum<{
                ready: "ready";
                unready: "unready";
            }>;
            anchor_backlog: z.ZodNumber;
            pending_runs: z.ZodNumber;
            reason: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly RunResultSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            status: z.ZodEnum<{
                created: "created";
                running: "running";
                suspended: "suspended";
                cancelled: "cancelled";
                finished: "finished";
            }>;
            terminal: z.ZodNullable<z.ZodEnum<{
                cancelled: "cancelled";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>>;
            completion_state: z.ZodEnum<{
                working: "working";
                checkpoint_verifying: "checkpoint_verifying";
                completion_proposed: "completion_proposed";
                verifying: "verifying";
                gap_open: "gap_open";
                repair: "repair";
                complete: "complete";
                unverified_artifact: "unverified_artifact";
            }>;
            verdict: z.ZodNullable<z.ZodEnum<{
                verified: "verified";
                rejected: "rejected";
                indeterminate: "indeterminate";
                exhausted: "exhausted";
            }>>;
            verdict_reason: z.ZodNullable<z.ZodString>;
            artifact: z.ZodNullable<z.ZodObject<{
                entry_id: z.ZodString;
                text: z.ZodString;
            }, z.core.$strict>>;
            items: z.ZodNullable<z.ZodObject<{
                verified: z.ZodNumber;
                completed_unverified: z.ZodNumber;
                parked: z.ZodNumber;
                dismissed: z.ZodNumber;
                failed: z.ZodNumber;
                invalidated: z.ZodNumber;
                untouched: z.ZodNumber;
            }, z.core.$strict>>;
            effects: z.ZodObject<{
                prepared: z.ZodNumber;
                dispatched: z.ZodNumber;
                committed: z.ZodNumber;
                withdrawn: z.ZodNumber;
                outcome_unknown: z.ZodNumber;
                unreconcilable: z.ZodNumber;
            }, z.core.$strict>;
            blocking_operational_outcomes: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    "parked-item": "parked-item";
                    "open-effect": "open-effect";
                }>;
                reference: z.ZodString;
                state: z.ZodString;
                next: z.ZodString;
            }, z.core.$strict>>;
            not_established: z.ZodArray<z.ZodString>;
            handover: z.ZodArray<z.ZodString>;
            integrity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                ok: z.ZodBoolean;
                anchor_store_available: z.ZodBoolean;
                last_anchored_seq: z.ZodNumber;
                last_anchored_head: z.ZodNullable<z.ZodString>;
                latest_anchor_ref: z.ZodNullable<z.ZodString>;
                unanchored_tail_records: z.ZodNumber;
                unanchored_tail: z.ZodNullable<z.ZodObject<{
                    from_seq: z.ZodNumber;
                    to_seq: z.ZodNumber;
                    reason: z.ZodString;
                }, z.core.$strict>>;
                findings: z.ZodArray<z.ZodObject<{
                    code: z.ZodString;
                    message: z.ZodString;
                    seq: z.ZodOptional<z.ZodNumber>;
                    anchor_ref: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "quality-plane";
    };
    readonly DiagnosticSchema: {
        readonly schema: z.ZodObject<{
            code: z.ZodString;
            severity: z.ZodEnum<{
                error: "error";
                warning: "warning";
                info: "info";
            }>;
            message: z.ZodString;
            path: z.ZodOptional<z.ZodString>;
            received: z.ZodOptional<z.ZodString>;
            alternatives: z.ZodOptional<z.ZodArray<z.ZodString>>;
            fix: z.ZodOptional<z.ZodString>;
            clause: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "diagnostic";
        readonly owner: "contracts-dx";
    };
    readonly ObservationEventSchema: {
        readonly schema: z.ZodObject<{
            seq: z.ZodNumber;
            record_seq: z.ZodNumber;
            event: z.ZodEnum<{
                "run.started": "run.started";
                "turn.completed": "turn.completed";
                "lease.reserved": "lease.reserved";
                "lease.consumed": "lease.consumed";
                "lease.released": "lease.released";
                "subrun.opened": "subrun.opened";
                "subrun.finished": "subrun.finished";
                "tool.invoked": "tool.invoked";
                "tool.remote.pending": "tool.remote.pending";
                "tool.finished": "tool.finished";
                "environment.prepared": "environment.prepared";
                "environment.job.submitted": "environment.job.submitted";
                "environment.job.observed": "environment.job.observed";
                "environment.job.reconciled": "environment.job.reconciled";
                "environment.job.cancelled": "environment.job.cancelled";
                "environment.artifact.collected": "environment.artifact.collected";
                "artifact.committed": "artifact.committed";
                "environment.teardown.recorded": "environment.teardown.recorded";
                "environment.abandoned": "environment.abandoned";
                "effect.prepared": "effect.prepared";
                "effect.authority.decision": "effect.authority.decision";
                "effect.authority.invalidated": "effect.authority.invalidated";
                "effect.dispatched": "effect.dispatched";
                "effect.resolved": "effect.resolved";
                "effect.unreconcilable": "effect.unreconcilable";
                "grant.superseded": "grant.superseded";
                "item.parked": "item.parked";
                "item.invalidated": "item.invalidated";
                "gap.settled": "gap.settled";
                "gap.dismissed": "gap.dismissed";
                "checkpoint.started": "checkpoint.started";
                "checkpoint.passed": "checkpoint.passed";
                "checkpoint.rejected": "checkpoint.rejected";
                "checkpoint.indeterminate": "checkpoint.indeterminate";
                "completion.proposed": "completion.proposed";
                "verification.concluded": "verification.concluded";
                "run.suspended": "run.suspended";
                "run.resume.blocked": "run.resume.blocked";
                "run.resumed": "run.resumed";
                "run.cancelled": "run.cancelled";
                "run.finished": "run.finished";
                "run.forked": "run.forked";
                "reexecution.started": "reexecution.started";
                "subject.erasure.completed": "subject.erasure.completed";
                "external.observation.received": "external.observation.received";
                "external.observation.applied": "external.observation.applied";
                "projection.rebuilt": "projection.rebuilt";
            }>;
            family: z.ZodEnum<{
                work: "work";
                artifact: "artifact";
                effect: "effect";
                review: "review";
                quality: "quality";
                terminal: "terminal";
                consumption: "consumption";
                environment: "environment";
                maintenance: "maintenance";
            }>;
            run_id: z.ZodString;
            at: z.ZodString;
            payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ProgressEventSchema: {
        readonly schema: z.ZodObject<{
            text: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly HealthResponseSchema: {
        readonly schema: z.ZodObject<{
            product: z.ZodString;
            contract_version: z.ZodString;
            profile: z.ZodEnum<{
                "local-lite": "local-lite";
                "full-cell": "full-cell";
                "small-production": "small-production";
                regulated: "regulated";
            }>;
            status: z.ZodEnum<{
                ready: "ready";
                unready: "unready";
                degraded: "degraded";
            }>;
            liveness: z.ZodLiteral<"live">;
            readiness: z.ZodEnum<{
                ready: "ready";
                unready: "unready";
            }>;
            components: z.ZodRecord<z.ZodString, z.ZodEnum<{
                ready: "ready";
                unreachable: "unreachable";
            }>>;
            required_components: z.ZodArray<z.ZodString>;
            guarantee_exclusions: z.ZodArray<z.ZodString>;
            capability_manifest: z.ZodObject<{
                manifest_id: z.ZodString;
                manifest_ref: z.ZodString;
                profile: z.ZodEnum<{
                    "local-lite": "local-lite";
                    "full-cell": "full-cell";
                    "small-production": "small-production";
                    regulated: "regulated";
                }>;
                version: z.ZodString;
                supported: z.ZodArray<z.ZodEnum<{
                    "local-lite": "local-lite";
                    "hosted-postgresql-service": "hosted-postgresql-service";
                    "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                    "provider-openai": "provider-openai";
                    "provider-anthropic": "provider-anthropic";
                    "provider-openrouter": "provider-openrouter";
                    "provider-together": "provider-together";
                    "provider-fireworks": "provider-fireworks";
                    "aggregator-composio-observation": "aggregator-composio-observation";
                    "aggregator-merge-observation": "aggregator-merge-observation";
                    "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                    "environment-process": "environment-process";
                    "environment-oci": "environment-oci";
                    "environment-ssh": "environment-ssh";
                    "environment-firecracker": "environment-firecracker";
                    "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                    "environment-modal": "environment-modal";
                    "environment-daytona": "environment-daytona";
                    "environment-vercel-sandbox": "environment-vercel-sandbox";
                    "environment-apptainer": "environment-apptainer";
                    "full-cell-docker-linux": "full-cell-docker-linux";
                    "canonical-log": "canonical-log";
                    "quality-plane": "quality-plane";
                    artifacts: "artifacts";
                    suspension: "suspension";
                    "honest-completion": "honest-completion";
                    "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                    "dynamic-authority": "dynamic-authority";
                    "production-effect-dispatch": "production-effect-dispatch";
                    "research-reference-pack": "research-reference-pack";
                    "video-reference-pack": "video-reference-pack";
                    "native-packaged-self-hosting": "native-packaged-self-hosting";
                    "classification-airlocks": "classification-airlocks";
                    "regulated-workloads": "regulated-workloads";
                    "cross-run-memory": "cross-run-memory";
                    "authored-orchestration": "authored-orchestration";
                    "mcp-work-entrypoints": "mcp-work-entrypoints";
                    "mcp-imported-tools": "mcp-imported-tools";
                }>>;
                conditional: z.ZodArray<z.ZodObject<{
                    capability: z.ZodEnum<{
                        "local-lite": "local-lite";
                        "hosted-postgresql-service": "hosted-postgresql-service";
                        "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                        "provider-openai": "provider-openai";
                        "provider-anthropic": "provider-anthropic";
                        "provider-openrouter": "provider-openrouter";
                        "provider-together": "provider-together";
                        "provider-fireworks": "provider-fireworks";
                        "aggregator-composio-observation": "aggregator-composio-observation";
                        "aggregator-merge-observation": "aggregator-merge-observation";
                        "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                        "environment-process": "environment-process";
                        "environment-oci": "environment-oci";
                        "environment-ssh": "environment-ssh";
                        "environment-firecracker": "environment-firecracker";
                        "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                        "environment-modal": "environment-modal";
                        "environment-daytona": "environment-daytona";
                        "environment-vercel-sandbox": "environment-vercel-sandbox";
                        "environment-apptainer": "environment-apptainer";
                        "full-cell-docker-linux": "full-cell-docker-linux";
                        "canonical-log": "canonical-log";
                        "quality-plane": "quality-plane";
                        artifacts: "artifacts";
                        suspension: "suspension";
                        "honest-completion": "honest-completion";
                        "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                        "dynamic-authority": "dynamic-authority";
                        "production-effect-dispatch": "production-effect-dispatch";
                        "research-reference-pack": "research-reference-pack";
                        "video-reference-pack": "video-reference-pack";
                        "native-packaged-self-hosting": "native-packaged-self-hosting";
                        "classification-airlocks": "classification-airlocks";
                        "regulated-workloads": "regulated-workloads";
                        "cross-run-memory": "cross-run-memory";
                        "authored-orchestration": "authored-orchestration";
                        "mcp-work-entrypoints": "mcp-work-entrypoints";
                        "mcp-imported-tools": "mcp-imported-tools";
                    }>;
                    refusal_point: z.ZodEnum<{
                        "profile-compilation": "profile-compilation";
                        publication: "publication";
                        registration: "registration";
                        intake: "intake";
                        route: "route";
                        "not-applicable": "not-applicable";
                    }>;
                    diagnostic_code: z.ZodString;
                    summary: z.ZodString;
                }, z.core.$strict>>;
                excluded: z.ZodArray<z.ZodObject<{
                    capability: z.ZodEnum<{
                        "local-lite": "local-lite";
                        "hosted-postgresql-service": "hosted-postgresql-service";
                        "transformation-volume-reference-pack": "transformation-volume-reference-pack";
                        "provider-openai": "provider-openai";
                        "provider-anthropic": "provider-anthropic";
                        "provider-openrouter": "provider-openrouter";
                        "provider-together": "provider-together";
                        "provider-fireworks": "provider-fireworks";
                        "aggregator-composio-observation": "aggregator-composio-observation";
                        "aggregator-merge-observation": "aggregator-merge-observation";
                        "restricted-effect-plane-attachment": "restricted-effect-plane-attachment";
                        "environment-process": "environment-process";
                        "environment-oci": "environment-oci";
                        "environment-ssh": "environment-ssh";
                        "environment-firecracker": "environment-firecracker";
                        "environment-cloudflare-sandbox": "environment-cloudflare-sandbox";
                        "environment-modal": "environment-modal";
                        "environment-daytona": "environment-daytona";
                        "environment-vercel-sandbox": "environment-vercel-sandbox";
                        "environment-apptainer": "environment-apptainer";
                        "full-cell-docker-linux": "full-cell-docker-linux";
                        "canonical-log": "canonical-log";
                        "quality-plane": "quality-plane";
                        artifacts: "artifacts";
                        suspension: "suspension";
                        "honest-completion": "honest-completion";
                        "unattended-aggregator-mutations": "unattended-aggregator-mutations";
                        "dynamic-authority": "dynamic-authority";
                        "production-effect-dispatch": "production-effect-dispatch";
                        "research-reference-pack": "research-reference-pack";
                        "video-reference-pack": "video-reference-pack";
                        "native-packaged-self-hosting": "native-packaged-self-hosting";
                        "classification-airlocks": "classification-airlocks";
                        "regulated-workloads": "regulated-workloads";
                        "cross-run-memory": "cross-run-memory";
                        "authored-orchestration": "authored-orchestration";
                        "mcp-work-entrypoints": "mcp-work-entrypoints";
                        "mcp-imported-tools": "mcp-imported-tools";
                    }>;
                    refusal_point: z.ZodEnum<{
                        "profile-compilation": "profile-compilation";
                        publication: "publication";
                        registration: "registration";
                        intake: "intake";
                        route: "route";
                        "not-applicable": "not-applicable";
                    }>;
                    diagnostic_code: z.ZodString;
                    summary: z.ZodString;
                }, z.core.$strict>>;
                required_components: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
                health_probes: z.ZodArray<z.ZodEnum<{
                    store: "store";
                    migration: "migration";
                    queue: "queue";
                    artifact: "artifact";
                    secret_store: "secret_store";
                    tool_host: "tool_host";
                    validator_host: "validator_host";
                    authority: "authority";
                    memory: "memory";
                    orchestration: "orchestration";
                    effect: "effect";
                    mcp: "mcp";
                }>>;
                artifact_policy: z.ZodObject<{
                    tool_result_inline_threshold_bytes: z.ZodNumber;
                    tool_result_max_artifact_bytes: z.ZodNumber;
                    tool_result_range_read_max_bytes: z.ZodNumber;
                }, z.core.$strict>;
            }, z.core.$strict>;
            task_contracts: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                ref: z.ZodString;
            }, z.core.$strict>>;
            integrity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                available: z.ZodBoolean;
                readiness: z.ZodEnum<{
                    ready: "ready";
                    unready: "unready";
                }>;
                anchor_backlog: z.ZodNumber;
                pending_runs: z.ZodNumber;
                reason: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>>;
            protocol_registry: z.ZodOptional<z.ZodObject<{
                format: z.ZodLiteral<"zero-ar-interop-registry/1">;
                entries: z.ZodArray<z.ZodObject<{
                    protocol: z.ZodEnum<{
                        mcp: "mcp";
                        a2a: "a2a";
                    }>;
                    direction: z.ZodEnum<{
                        client: "client";
                        server: "server";
                    }>;
                    implementation: z.ZodString;
                    implementation_version: z.ZodString;
                    protocol_versions: z.ZodArray<z.ZodString>;
                    extensions: z.ZodArray<z.ZodString>;
                    sdk_packages: z.ZodRecord<z.ZodString, z.ZodString>;
                    conformance_evidence: z.ZodArray<z.ZodString>;
                    known_deviations: z.ZodArray<z.ZodString>;
                    retirement_date: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly DatabaseMetricSummarySchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            unit: z.ZodEnum<{
                count: "count";
                ms: "ms";
            }>;
            count: z.ZodNumber;
            p50: z.ZodNullable<z.ZodNumber>;
            p95: z.ZodNullable<z.ZodNumber>;
            p99: z.ZodNullable<z.ZodNumber>;
            max: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly DatabaseDoctorResponseSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-database-doctor/1">;
            ok: z.ZodBoolean;
            mode: z.ZodEnum<{
                colocated: "colocated";
                external: "external";
            }>;
            measured_at: z.ZodString;
            database: z.ZodObject<{
                reachable: z.ZodBoolean;
                name: z.ZodNullable<z.ZodString>;
                server_version: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            connection_pool: z.ZodObject<{
                max: z.ZodNumber;
                total: z.ZodNumber;
                idle: z.ZodNumber;
                waiting: z.ZodNumber;
                saturation: z.ZodNumber;
            }, z.core.$strict>;
            roles: z.ZodArray<z.ZodObject<{
                purpose: z.ZodEnum<{
                    migration: "migration";
                    runtime: "runtime";
                    signer: "signer";
                }>;
                role: z.ZodString;
                ok: z.ZodBoolean;
                checks: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            forced_rls: z.ZodObject<{
                ok: z.ZodBoolean;
                failures: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            latency: z.ZodObject<{
                rtt_ms: z.ZodNullable<z.ZodNumber>;
                critical_path_round_trips: z.ZodNumber;
                observed_run_transition_samples: z.ZodNumber;
                observed_observation_samples: z.ZodNumber;
                expected_additive_run_latency_ms: z.ZodNullable<z.ZodNumber>;
                meets_ratified_reference_targets: z.ZodBoolean;
                warning: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
            metrics: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                unit: z.ZodEnum<{
                    count: "count";
                    ms: "ms";
                }>;
                count: z.ZodNumber;
                p50: z.ZodNullable<z.ZodNumber>;
                p95: z.ZodNullable<z.ZodNumber>;
                p99: z.ZodNullable<z.ZodNumber>;
                max: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly PostgresLatencyRawSampleSchema: {
        readonly schema: z.ZodObject<{
            topology: z.ZodEnum<{
                colocated: "colocated";
                "same-region-external": "same-region-external";
                "controlled-added-latency": "controlled-added-latency";
            }>;
            operation: z.ZodEnum<{
                append: "append";
                reconstruction: "reconstruction";
                checkpoint: "checkpoint";
                "representative-run-transition": "representative-run-transition";
            }>;
            database_mode: z.ZodEnum<{
                colocated: "colocated";
                external: "external";
            }>;
            environment_ref: z.ZodString;
            samples_ms: z.ZodArray<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly PostgresLatencyReportRowSchema: {
        readonly schema: z.ZodObject<{
            topology: z.ZodEnum<{
                colocated: "colocated";
                "same-region-external": "same-region-external";
                "controlled-added-latency": "controlled-added-latency";
            }>;
            operation: z.ZodEnum<{
                append: "append";
                reconstruction: "reconstruction";
                checkpoint: "checkpoint";
                "representative-run-transition": "representative-run-transition";
            }>;
            database_mode: z.ZodEnum<{
                colocated: "colocated";
                external: "external";
            }>;
            environment_ref: z.ZodString;
            sample_count: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            p99_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly PostgresLatencyFiveHourOverheadSchema: {
        readonly schema: z.ZodObject<{
            topology: z.ZodEnum<{
                colocated: "colocated";
                "same-region-external": "same-region-external";
                "controlled-added-latency": "controlled-added-latency";
            }>;
            representative_transition_count: z.ZodNumber;
            p50_control_plane_overhead_ms: z.ZodNumber;
            p95_control_plane_overhead_ms: z.ZodNumber;
            p99_control_plane_overhead_ms: z.ZodNumber;
            scope: z.ZodLiteral<"control-plane-only">;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly PostgresLatencyReportSchema: {
        readonly schema: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-postgres-latency-report/1">;
            report_ref: z.ZodString;
            source_commit: z.ZodString;
            generated_at: z.ZodString;
            measurement_status: z.ZodEnum<{
                "fixture-format-only": "fixture-format-only";
                "uat-measured": "uat-measured";
            }>;
            uat_evidence: z.ZodBoolean;
            status_reason: z.ZodString;
            representative_transition_count: z.ZodNumber;
            row_count: z.ZodNumber;
            rows: z.ZodArray<z.ZodObject<{
                topology: z.ZodEnum<{
                    colocated: "colocated";
                    "same-region-external": "same-region-external";
                    "controlled-added-latency": "controlled-added-latency";
                }>;
                operation: z.ZodEnum<{
                    append: "append";
                    reconstruction: "reconstruction";
                    checkpoint: "checkpoint";
                    "representative-run-transition": "representative-run-transition";
                }>;
                database_mode: z.ZodEnum<{
                    colocated: "colocated";
                    external: "external";
                }>;
                environment_ref: z.ZodString;
                sample_count: z.ZodNumber;
                min_ms: z.ZodNumber;
                p50_ms: z.ZodNumber;
                p95_ms: z.ZodNumber;
                p99_ms: z.ZodNumber;
                max_ms: z.ZodNumber;
            }, z.core.$strict>>;
            five_hour_control_plane_overhead: z.ZodArray<z.ZodObject<{
                topology: z.ZodEnum<{
                    colocated: "colocated";
                    "same-region-external": "same-region-external";
                    "controlled-added-latency": "controlled-added-latency";
                }>;
                representative_transition_count: z.ZodNumber;
                p50_control_plane_overhead_ms: z.ZodNumber;
                p95_control_plane_overhead_ms: z.ZodNumber;
                p99_control_plane_overhead_ms: z.ZodNumber;
                scope: z.ZodLiteral<"control-plane-only">;
            }, z.core.$strict>>;
            disclaimer: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly CreatedRunSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            created: z.ZodBoolean;
            snapshot: z.ZodObject<{
                run_id: z.ZodString;
                status: z.ZodEnum<{
                    created: "created";
                    running: "running";
                    suspended: "suspended";
                    cancelled: "cancelled";
                    finished: "finished";
                }>;
                completion_state: z.ZodEnum<{
                    working: "working";
                    checkpoint_verifying: "checkpoint_verifying";
                    completion_proposed: "completion_proposed";
                    verifying: "verifying";
                    gap_open: "gap_open";
                    repair: "repair";
                    complete: "complete";
                    unverified_artifact: "unverified_artifact";
                }>;
                terminal: z.ZodNullable<z.ZodEnum<{
                    cancelled: "cancelled";
                    complete: "complete";
                    unverified_artifact: "unverified_artifact";
                }>>;
                suspend_reason: z.ZodNullable<z.ZodEnum<{
                    budget_exhausted: "budget_exhausted";
                    provider_failure: "provider_failure";
                    awaiting_answer: "awaiting_answer";
                    operator_pause: "operator_pause";
                    stagnation: "stagnation";
                    remote_task: "remote_task";
                }>>;
                turn: z.ZodNumber;
                current_branch: z.ZodNullable<z.ZodString>;
                head_entry_id: z.ZodNullable<z.ZodString>;
                entry_count: z.ZodNumber;
                agent_name: z.ZodString;
                model_ref: z.ZodString;
                objective: z.ZodString;
                budgets: z.ZodNullable<z.ZodObject<{
                    consumption: z.ZodObject<{
                        model_tokens: z.ZodNumber;
                        tool_calls: z.ZodOptional<z.ZodNumber>;
                        bytes: z.ZodOptional<z.ZodNumber>;
                        compute_ms: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>;
                    attention: z.ZodNumber;
                    verification_reserve_fraction: z.ZodNumber;
                    max_turns: z.ZodNumber;
                }, z.core.$strict>>;
                usage: z.ZodRecord<z.ZodString, z.ZodObject<{
                    reserved: z.ZodNumber;
                    consumed: z.ZodNumber;
                }, z.core.$strict>>;
                verified_completion_reachable: z.ZodBoolean;
                items: z.ZodNullable<z.ZodRecord<z.ZodEnum<{
                    verified: "verified";
                    untouched: "untouched";
                    completed_unverified: "completed_unverified";
                    parked: "parked";
                    dismissed: "dismissed";
                    failed: "failed";
                    invalidated: "invalidated";
                }>, z.ZodNumber>>;
                contract: z.ZodNullable<z.ZodObject<{
                    name: z.ZodString;
                    ref: z.ZodString;
                    repair_attempts_used: z.ZodNumber;
                    repair_budget: z.ZodNumber;
                }, z.core.$strict>>;
                snapshot_version: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "intake";
        readonly owner: "runtime-core";
    };
    readonly ControlAcceptedSchema: {
        readonly schema: z.ZodObject<{
            accepted_seq: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "control";
        readonly owner: "runtime-core";
    };
    readonly RunLifecycleCommandRequestSchema: {
        readonly schema: z.ZodObject<{
            idempotency_key: z.ZodString;
            reason: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly RunRefSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly StartAcceptedSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            accepted: z.ZodBoolean;
            repeated: z.ZodBoolean;
            accepted_seq: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly RebuildOutcomeSchema: {
        readonly schema: z.ZodObject<{
            equal: z.ZodBoolean;
            healed: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly ImportOutcomeSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            head_equal: z.ZodBoolean;
            records: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "run-management";
        readonly owner: "runtime-core";
    };
    readonly RecordsPageSchema: {
        readonly schema: z.ZodObject<{
            records: z.ZodArray<z.ZodObject<{
                record_id: z.ZodString;
                run_id: z.ZodString;
                seq: z.ZodNumber;
                logical_clock: z.ZodNumber;
                causal_parent: z.ZodNullable<z.ZodString>;
                type: z.ZodEnum<{
                    "run.created": "run.created";
                    "run.started": "run.started";
                    "entry.appended": "entry.appended";
                    "branch.created": "branch.created";
                    "branch.head.moved": "branch.head.moved";
                    "context.assembled": "context.assembled";
                    "model.call.started": "model.call.started";
                    "model.call.finished": "model.call.finished";
                    "model.call.failed": "model.call.failed";
                    "model.fallback.switched": "model.fallback.switched";
                    "turn.completed": "turn.completed";
                    "control.received": "control.received";
                    "control.applied": "control.applied";
                    "lease.opened": "lease.opened";
                    "lease.reserved": "lease.reserved";
                    "lease.consumed": "lease.consumed";
                    "lease.released": "lease.released";
                    "subrun.opened": "subrun.opened";
                    "subrun.finished": "subrun.finished";
                    "tool.invoked": "tool.invoked";
                    "tool.remote.pending": "tool.remote.pending";
                    "tool.finished": "tool.finished";
                    "environment.prepare.requested": "environment.prepare.requested";
                    "environment.prepared": "environment.prepared";
                    "environment.job.submit.requested": "environment.job.submit.requested";
                    "environment.job.submitted": "environment.job.submitted";
                    "environment.job.observe.requested": "environment.job.observe.requested";
                    "environment.job.observed": "environment.job.observed";
                    "environment.job.reconcile.requested": "environment.job.reconcile.requested";
                    "environment.job.reconciled": "environment.job.reconciled";
                    "environment.job.cancel.requested": "environment.job.cancel.requested";
                    "environment.job.cancelled": "environment.job.cancelled";
                    "environment.artifact.collect.requested": "environment.artifact.collect.requested";
                    "environment.artifact.collected": "environment.artifact.collected";
                    "artifact.committed": "artifact.committed";
                    "environment.teardown.requested": "environment.teardown.requested";
                    "environment.teardown.recorded": "environment.teardown.recorded";
                    "environment.abandon.requested": "environment.abandon.requested";
                    "environment.abandoned": "environment.abandoned";
                    "effect.prepared": "effect.prepared";
                    "effect.authority.decision": "effect.authority.decision";
                    "effect.authority.invalidated": "effect.authority.invalidated";
                    "effect.dispatched": "effect.dispatched";
                    "effect.resolved": "effect.resolved";
                    "effect.unreconcilable": "effect.unreconcilable";
                    "grant.superseded": "grant.superseded";
                    "item.attempted": "item.attempted";
                    "item.parked": "item.parked";
                    "item.invalidated": "item.invalidated";
                    "gap.settled": "gap.settled";
                    "gap.dismissed": "gap.dismissed";
                    "checkpoint.started": "checkpoint.started";
                    "checkpoint.passed": "checkpoint.passed";
                    "checkpoint.rejected": "checkpoint.rejected";
                    "checkpoint.indeterminate": "checkpoint.indeterminate";
                    "repair.started": "repair.started";
                    "completion.proposed": "completion.proposed";
                    "verification.concluded": "verification.concluded";
                    "run.suspended": "run.suspended";
                    "run.resume.blocked": "run.resume.blocked";
                    "run.resumed": "run.resumed";
                    "run.cancelled": "run.cancelled";
                    "run.finished": "run.finished";
                    "run.forked": "run.forked";
                    "reexecution.started": "reexecution.started";
                    "subject.erasure.completed": "subject.erasure.completed";
                    "wake.scheduled": "wake.scheduled";
                    "wake.claimed": "wake.claimed";
                    "memory.event.recorded": "memory.event.recorded";
                    "memory.read.recorded": "memory.read.recorded";
                    "external.observation.received": "external.observation.received";
                    "external.observation.applied": "external.observation.applied";
                    "projection.rebuilt": "projection.rebuilt";
                    "run.lifecycle.command.accepted": "run.lifecycle.command.accepted";
                }>;
                type_version: z.ZodNumber;
                at: z.ZodString;
                payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                chain_hash: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "runtime-core";
    };
    readonly ReviewItemSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            item_id: z.ZodString;
            kind: z.ZodEnum<{
                gap: "gap";
                "human-validator": "human-validator";
                approval: "approval";
            }>;
            state: z.ZodEnum<{
                pending: "pending";
            }>;
            opened_seq: z.ZodNumber;
            opened_at: z.ZodString;
            reason: z.ZodString;
            checkpoint_id: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "quality-plane";
    };
    readonly ReviewInboxSchema: {
        readonly schema: z.ZodObject<{
            items: z.ZodArray<z.ZodObject<{
                run_id: z.ZodString;
                item_id: z.ZodString;
                kind: z.ZodEnum<{
                    gap: "gap";
                    "human-validator": "human-validator";
                    approval: "approval";
                }>;
                state: z.ZodEnum<{
                    pending: "pending";
                }>;
                opened_seq: z.ZodNumber;
                opened_at: z.ZodString;
                reason: z.ZodString;
                checkpoint_id: z.ZodString;
            }, z.core.$strict>>;
            truncated: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "observation";
        readonly owner: "quality-plane";
    };
    readonly ErasureRequestSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            entry_ids: z.ZodArray<z.ZodString>;
            by: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ErasureOutcomeSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            erased: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly DomainPackSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            task_contract: z.ZodOptional<z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                invariants: z.ZodArray<z.ZodString>;
                acceptance_rules: z.ZodArray<z.ZodString>;
                checkpoint_every_items: z.ZodNumber;
                checkpoint_phase_boundaries: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    phase: z.ZodString;
                    starts_after_items: z.ZodNumber;
                    checkpoint_every_items: z.ZodNumber;
                }, z.core.$strict>>>;
                dependency_frontier: z.ZodEnum<{
                    "independent-items": "independent-items";
                    "run-start": "run-start";
                    "declared-dependencies": "declared-dependencies";
                }>;
                repair_budget_attempts: z.ZodNumber;
                claim_representation: z.ZodOptional<z.ZodEnum<{
                    "structured-claims-with-citations": "structured-claims-with-citations";
                }>>;
                validators: z.ZodArray<z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    class: z.ZodEnum<{
                        deterministic: "deterministic";
                        "sampled-oracle": "sampled-oracle";
                        heuristic: "heuristic";
                        "named-human": "named-human";
                    }>;
                    covers: z.ZodArray<z.ZodString>;
                    sufficient_for: z.ZodArray<z.ZodString>;
                    cost_wall_ms: z.ZodNumber;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
            claims: z.ZodArray<z.ZodObject<{
                predicate: z.ZodString;
                kind: z.ZodEnum<{
                    capability: "capability";
                    coverage: "coverage";
                    limitation: "limitation";
                }>;
                evidence: z.ZodObject<{
                    validator: z.ZodString;
                    version: z.ZodString;
                }, z.core.$strict>;
            }, z.core.$strict>>;
            notes: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "authoring";
        readonly owner: "contracts-dx";
    };
    readonly CompiledPackSchema: {
        readonly schema: z.ZodObject<{
            pack_ref: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            claims: z.ZodArray<z.ZodObject<{
                predicate: z.ZodString;
                kind: z.ZodEnum<{
                    capability: "capability";
                    coverage: "coverage";
                    limitation: "limitation";
                }>;
                evidence: z.ZodObject<{
                    validator: z.ZodString;
                    version: z.ZodString;
                }, z.core.$strict>;
                resolved: z.ZodLiteral<true>;
            }, z.core.$strict>>;
            informational_notes: z.ZodObject<{
                authority: z.ZodLiteral<"none">;
                rendering: z.ZodString;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "authoring";
        readonly owner: "contracts-dx";
    };
    readonly PublicationBundleManifestSchema: {
        readonly schema: z.ZodObject<{
            format_version: z.ZodLiteral<"1.0.0">;
            root_kind: z.ZodEnum<{
                agent: "agent";
                tool: "tool";
                procedure: "procedure";
                validator: "validator";
                posture: "posture";
                "task-contract": "task-contract";
                semantic: "semantic";
                "domain-pack": "domain-pack";
                "binding-profile": "binding-profile";
            }>;
            root_ref: z.ZodString;
            declarations: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    agent: "agent";
                    tool: "tool";
                    procedure: "procedure";
                    validator: "validator";
                    posture: "posture";
                    "task-contract": "task-contract";
                    semantic: "semantic";
                    "domain-pack": "domain-pack";
                    "binding-profile": "binding-profile";
                }>;
                name: z.ZodString;
                version: z.ZodString;
                content_ref: z.ZodString;
            }, z.core.$strict>>;
            assets: z.ZodArray<z.ZodObject<{
                content_ref: z.ZodString;
                bytes: z.ZodNumber;
                media_type: z.ZodString;
                classification: z.ZodString;
                role: z.ZodString;
            }, z.core.$strict>>;
            edges: z.ZodArray<z.ZodObject<{
                from_ref: z.ZodString;
                to_ref: z.ZodString;
                kind: z.ZodEnum<{
                    requires: "requires";
                    includes: "includes";
                }>;
            }, z.core.$strict>>;
            compiler: z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                canonicalization: z.ZodString;
            }, z.core.$strict>;
            source_maps: z.ZodArray<z.ZodObject<{
                content_ref: z.ZodString;
                path: z.ZodString;
                source_content_ref: z.ZodOptional<z.ZodString>;
                source_format: z.ZodOptional<z.ZodEnum<{
                    "ramsden/v1": "ramsden/v1";
                    "zero-ar/v1": "zero-ar/v1";
                }>>;
            }, z.core.$strict>>;
            conformance: z.ZodArray<z.ZodObject<{
                check: z.ZodString;
                outcome: z.ZodEnum<{
                    refused: "refused";
                    pass: "pass";
                }>;
            }, z.core.$strict>>;
            claims: z.ZodArray<z.ZodObject<{
                kind: z.ZodString;
                text: z.ZodString;
            }, z.core.$strict>>;
            requested_aliases: z.ZodArray<z.ZodString>;
            bundle_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationDeclarationEntrySchema: {
        readonly schema: z.ZodObject<{
            kind: z.ZodEnum<{
                agent: "agent";
                tool: "tool";
                procedure: "procedure";
                validator: "validator";
                posture: "posture";
                "task-contract": "task-contract";
                semantic: "semantic";
                "domain-pack": "domain-pack";
                "binding-profile": "binding-profile";
            }>;
            name: z.ZodString;
            version: z.ZodString;
            content_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationAssetEntrySchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationDependencyEdgeSchema: {
        readonly schema: z.ZodObject<{
            from_ref: z.ZodString;
            to_ref: z.ZodString;
            kind: z.ZodEnum<{
                requires: "requires";
                includes: "includes";
            }>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly ProcedureManifestSchema: {
        readonly schema: z.ZodObject<{
            kind: z.ZodLiteral<"procedure">;
            name: z.ZodString;
            version: z.ZodString;
            entry_ref: z.ZodString;
            description: z.ZodString;
            discovery: z.ZodObject<{
                topics: z.ZodArray<z.ZodString>;
                summary: z.ZodString;
            }, z.core.$strict>;
            resources: z.ZodArray<z.ZodObject<{
                path: z.ZodString;
                content_ref: z.ZodString;
                bytes: z.ZodNumber;
                media_type: z.ZodString;
            }, z.core.$strict>>;
            executable: z.ZodLiteral<false>;
            entry_bytes: z.ZodOptional<z.ZodNumber>;
            allowed_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
            activation: z.ZodOptional<z.ZodEnum<{
                progressive: "progressive";
                always: "always";
            }>>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationReceiptSchema: {
        readonly schema: z.ZodObject<{
            publication_ref: z.ZodString;
            bundle_ref: z.ZodString;
            root_kind: z.ZodEnum<{
                agent: "agent";
                tool: "tool";
                procedure: "procedure";
                validator: "validator";
                posture: "posture";
                "task-contract": "task-contract";
                semantic: "semantic";
                "domain-pack": "domain-pack";
                "binding-profile": "binding-profile";
            }>;
            root_ref: z.ZodString;
            agent_ref: z.ZodNullable<z.ZodString>;
            tenant: z.ZodString;
            accountable: z.ZodString;
            compiler: z.ZodObject<{
                name: z.ZodString;
                version: z.ZodString;
                canonicalization: z.ZodString;
            }, z.core.$strict>;
            counts: z.ZodObject<{
                declarations: z.ZodNumber;
                assets: z.ZodNumber;
                total_bytes: z.ZodNumber;
            }, z.core.$strict>;
            closure_hash: z.ZodString;
            aliases: z.ZodArray<z.ZodObject<{
                alias: z.ZodString;
                outcome: z.ZodEnum<{
                    refused: "refused";
                    set: "set";
                }>;
            }, z.core.$strict>>;
            committed_at: z.ZodString;
            establishes: z.ZodLiteral<"admitted-and-stored-only">;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationSessionRequestSchema: {
        readonly schema: z.ZodObject<{
            bundle: z.ZodObject<{
                format_version: z.ZodLiteral<"1.0.0">;
                root_kind: z.ZodEnum<{
                    agent: "agent";
                    tool: "tool";
                    procedure: "procedure";
                    validator: "validator";
                    posture: "posture";
                    "task-contract": "task-contract";
                    semantic: "semantic";
                    "domain-pack": "domain-pack";
                    "binding-profile": "binding-profile";
                }>;
                root_ref: z.ZodString;
                declarations: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        agent: "agent";
                        tool: "tool";
                        procedure: "procedure";
                        validator: "validator";
                        posture: "posture";
                        "task-contract": "task-contract";
                        semantic: "semantic";
                        "domain-pack": "domain-pack";
                        "binding-profile": "binding-profile";
                    }>;
                    name: z.ZodString;
                    version: z.ZodString;
                    content_ref: z.ZodString;
                }, z.core.$strict>>;
                assets: z.ZodArray<z.ZodObject<{
                    content_ref: z.ZodString;
                    bytes: z.ZodNumber;
                    media_type: z.ZodString;
                    classification: z.ZodString;
                    role: z.ZodString;
                }, z.core.$strict>>;
                edges: z.ZodArray<z.ZodObject<{
                    from_ref: z.ZodString;
                    to_ref: z.ZodString;
                    kind: z.ZodEnum<{
                        requires: "requires";
                        includes: "includes";
                    }>;
                }, z.core.$strict>>;
                compiler: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    canonicalization: z.ZodString;
                }, z.core.$strict>;
                source_maps: z.ZodArray<z.ZodObject<{
                    content_ref: z.ZodString;
                    path: z.ZodString;
                    source_content_ref: z.ZodOptional<z.ZodString>;
                    source_format: z.ZodOptional<z.ZodEnum<{
                        "ramsden/v1": "ramsden/v1";
                        "zero-ar/v1": "zero-ar/v1";
                    }>>;
                }, z.core.$strict>>;
                conformance: z.ZodArray<z.ZodObject<{
                    check: z.ZodString;
                    outcome: z.ZodEnum<{
                        refused: "refused";
                        pass: "pass";
                    }>;
                }, z.core.$strict>>;
                claims: z.ZodArray<z.ZodObject<{
                    kind: z.ZodString;
                    text: z.ZodString;
                }, z.core.$strict>>;
                requested_aliases: z.ZodArray<z.ZodString>;
                bundle_ref: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationSessionSchema: {
        readonly schema: z.ZodObject<{
            session_id: z.ZodString;
            missing_blobs: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationBlobFrameSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            bytes: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationBlobAckSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            staged: z.ZodBoolean;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationBlobUploadStatusSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            offset: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationBlobUploadFinishSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            staged: z.ZodLiteral<true>;
            bytes: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationCommitRequestSchema: {
        readonly schema: z.ZodObject<{}, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly PublicationViewSchema: {
        readonly schema: z.ZodObject<{
            receipt: z.ZodObject<{
                publication_ref: z.ZodString;
                bundle_ref: z.ZodString;
                root_kind: z.ZodEnum<{
                    agent: "agent";
                    tool: "tool";
                    procedure: "procedure";
                    validator: "validator";
                    posture: "posture";
                    "task-contract": "task-contract";
                    semantic: "semantic";
                    "domain-pack": "domain-pack";
                    "binding-profile": "binding-profile";
                }>;
                root_ref: z.ZodString;
                agent_ref: z.ZodNullable<z.ZodString>;
                tenant: z.ZodString;
                accountable: z.ZodString;
                compiler: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    canonicalization: z.ZodString;
                }, z.core.$strict>;
                counts: z.ZodObject<{
                    declarations: z.ZodNumber;
                    assets: z.ZodNumber;
                    total_bytes: z.ZodNumber;
                }, z.core.$strict>;
                closure_hash: z.ZodString;
                aliases: z.ZodArray<z.ZodObject<{
                    alias: z.ZodString;
                    outcome: z.ZodEnum<{
                        refused: "refused";
                        set: "set";
                    }>;
                }, z.core.$strict>>;
                committed_at: z.ZodString;
                establishes: z.ZodLiteral<"admitted-and-stored-only">;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly DeclarationViewSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            bytes: z.ZodString;
            deprecated: z.ZodNullable<z.ZodString>;
            quarantined: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly AliasMutationRequestSchema: {
        readonly schema: z.ZodObject<{
            alias: z.ZodString;
            content_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly AliasMutationResultSchema: {
        readonly schema: z.ZodObject<{
            alias: z.ZodString;
            content_ref: z.ZodString;
            moved: z.ZodLiteral<true>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly DeprecationRequestSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly QuarantineRequestSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly RegistryActOutcomeSchema: {
        readonly schema: z.ZodObject<{
            content_ref: z.ZodString;
            recorded: z.ZodLiteral<true>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly IdentityMigrationEventRequestSchema: {
        readonly schema: z.ZodObject<{
            impact: z.ZodEnum<{
                deployment: "deployment";
                "publication-namespace": "publication-namespace";
                "compatibility-policy": "compatibility-policy";
            }>;
            surface: z.ZodString;
            decision_ref: z.ZodString;
            source_ref: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly IdentityMigrationEventOutcomeSchema: {
        readonly schema: z.ZodObject<{
            recorded: z.ZodLiteral<true>;
            action: z.ZodLiteral<"identity-migration.recorded">;
            impact: z.ZodEnum<{
                deployment: "deployment";
                "publication-namespace": "publication-namespace";
                "compatibility-policy": "compatibility-policy";
            }>;
            surface: z.ZodString;
            from_identity: z.ZodString;
            to_identity: z.ZodString;
            identity_source_ref: z.ZodString;
            decision_ref: z.ZodString;
            source_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly DrainRequestSchema: {
        readonly schema: z.ZodObject<{
            drained: z.ZodBoolean;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly DrainOutcomeSchema: {
        readonly schema: z.ZodObject<{
            drained: z.ZodBoolean;
            recorded: z.ZodLiteral<true>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ReconciliationOutcomeSchema: {
        readonly schema: z.ZodObject<{
            reconciled: z.ZodArray<z.ZodObject<{
                effect_id: z.ZodString;
                state: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly OperatorAuditPageSchema: {
        readonly schema: z.ZodObject<{
            entries: z.ZodArray<z.ZodObject<{
                seq: z.ZodNumber;
                action: z.ZodString;
                detail: z.ZodString;
                actor: z.ZodString;
                at: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly PostureSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            owner: z.ZodString;
            verification_reserve_fraction: z.ZodNumber;
            optimization: z.ZodOptional<z.ZodObject<{
                checkpoint: z.ZodOptional<z.ZodObject<{
                    selector: z.ZodLiteral<"young-daly-items-v1">;
                    mode: z.ZodEnum<{
                        off: "off";
                        observe: "observe";
                        enforce: "enforce";
                    }>;
                    checkpoint_cost: z.ZodNumber;
                    recompute_cost: z.ZodNumber;
                    hazard_per_million: z.ZodNumber;
                    minimum_items: z.ZodNumber;
                    maximum_items: z.ZodNumber;
                    fallback_interval: z.ZodNumber;
                    arithmetic: z.ZodLiteral<"integer-sqrt-v1">;
                }, z.core.$strict>>;
                context: z.ZodOptional<z.ZodObject<{
                    selector: z.ZodLiteral<"coverage-mmr-v1">;
                    mode: z.ZodEnum<{
                        off: "off";
                        observe: "observe";
                        enforce: "enforce";
                    }>;
                    coverage_weight_ppm: z.ZodNumber;
                    recency_weight_ppm: z.ZodNumber;
                    redundancy_weight_ppm: z.ZodNumber;
                    candidate_cutoff: z.ZodNumber;
                    arithmetic: z.ZodLiteral<"integer-score-v1">;
                }, z.core.$strict>>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "authoring";
        readonly owner: "contracts-dx";
    };
    readonly BindingProfileSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            slot: z.ZodEnum<{
                "runtime-scratch": "runtime-scratch";
                "customer-readable-external": "customer-readable-external";
            }>;
            path_prefix: z.ZodString;
            operations: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                operation_class: z.ZodEnum<{
                    observation: "observation";
                    "run-internal": "run-internal";
                    "effect-proposal": "effect-proposal";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "environment";
        readonly owner: "runtime-core";
    };
    readonly SkillDescriptorSchema: {
        readonly schema: z.ZodObject<{
            skill_ref: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            description: z.ZodString;
            topics: z.ZodArray<z.ZodString>;
            summary: z.ZodString;
            entry_bytes: z.ZodNumber;
            resource_count: z.ZodNumber;
            allowed_tools: z.ZodArray<z.ZodString>;
            activation: z.ZodEnum<{
                progressive: "progressive";
                always: "always";
            }>;
        }, z.core.$strict>;
        readonly placement: "publication";
        readonly owner: "contracts-dx";
    };
    readonly SkillOpenRequestSchema: {
        readonly schema: z.ZodObject<{
            skill_ref: z.ZodString;
            retention: z.ZodOptional<z.ZodEnum<{
                checkpoint: "checkpoint";
                turn: "turn";
            }>>;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly SkillReadRequestSchema: {
        readonly schema: z.ZodObject<{
            skill_ref: z.ZodString;
            path: z.ZodString;
            start_line: z.ZodOptional<z.ZodNumber>;
            end_line: z.ZodOptional<z.ZodNumber>;
            retention: z.ZodOptional<z.ZodEnum<{
                checkpoint: "checkpoint";
                turn: "turn";
            }>>;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly SkillSearchRequestSchema: {
        readonly schema: z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            page: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly SkillLoadResultSchema: {
        readonly schema: z.ZodObject<{
            skill_ref: z.ZodString;
            path: z.ZodNullable<z.ZodString>;
            content_ref: z.ZodString;
            bytes: z.ZodNumber;
            lines: z.ZodNullable<z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, z.core.$strict>>;
            retention: z.ZodEnum<{
                checkpoint: "checkpoint";
                turn: "turn";
            }>;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly SkillSearchResultSchema: {
        readonly schema: z.ZodObject<{
            page: z.ZodNumber;
            pages: z.ZodNumber;
            descriptors: z.ZodArray<z.ZodObject<{
                skill_ref: z.ZodString;
                name: z.ZodString;
                version: z.ZodString;
                description: z.ZodString;
                topics: z.ZodArray<z.ZodString>;
                summary: z.ZodString;
                entry_bytes: z.ZodNumber;
                resource_count: z.ZodNumber;
                allowed_tools: z.ZodArray<z.ZodString>;
                activation: z.ZodEnum<{
                    progressive: "progressive";
                    always: "always";
                }>;
            }, z.core.$strict>>;
            omitted: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly ArtifactReadRequestSchema: {
        readonly schema: z.ZodObject<{
            artifact_ref: z.ZodString;
            offset: z.ZodNumber;
            length: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "composition";
        readonly owner: "runtime-core";
    };
    readonly ModelFallbackSetSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            members: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly TenantModelPoolSchema: {
        readonly schema: z.ZodObject<{
            tenant: z.ZodString;
            provider_instances: z.ZodArray<z.ZodString>;
            enabled_models: z.ZodArray<z.ZodString>;
            aliases: z.ZodRecord<z.ZodString, z.ZodString>;
            default_alias: z.ZodNullable<z.ZodString>;
            fallback_sets: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                members: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            quota_policy_ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ResolvedModelPlanSchema: {
        readonly schema: z.ZodObject<{
            primary: z.ZodObject<{
                model_ref: z.ZodString;
                provider_model_id: z.ZodString;
                provider: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "openai-compatible": "openai-compatible";
                }>;
                protocol_adapter: z.ZodEnum<{
                    scripted: "scripted";
                    "openai-chat-completions": "openai-chat-completions";
                    "anthropic-messages": "anthropic-messages";
                }>;
                protocol_version: z.ZodString;
                profile: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "generic-openai-compatible": "generic-openai-compatible";
                    litellm: "litellm";
                    ollama: "ollama";
                }>;
                profile_version: z.ZodString;
                provider_instance_ref: z.ZodString;
                adapter_ref: z.ZodString;
                endpoint: z.ZodString;
                destination: z.ZodString;
                endpoint_policy_ref: z.ZodString;
                catalogue_source: z.ZodEnum<{
                    declared: "declared";
                    "provider-api": "provider-api";
                    "openai-compatible-models": "openai-compatible-models";
                }>;
                compatibility: z.ZodObject<{
                    streaming: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    tools: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    cancellation: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    context_limits: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    usage: z.ZodEnum<{
                        absent: "absent";
                        reported: "reported";
                        untrusted: "untrusted";
                    }>;
                    upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                    notes: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                compatibility_ref: z.ZodString;
                credential_mode: z.ZodEnum<{
                    none: "none";
                    binding: "binding";
                }>;
                credential_binding_ref: z.ZodNullable<z.ZodString>;
                catalogue_entry_ref: z.ZodString;
                provider_model_revision: z.ZodString;
                assurance_facts_ref: z.ZodNullable<z.ZodString>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>;
            fallbacks: z.ZodArray<z.ZodObject<{
                model_ref: z.ZodString;
                provider_model_id: z.ZodString;
                provider: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "openai-compatible": "openai-compatible";
                }>;
                protocol_adapter: z.ZodEnum<{
                    scripted: "scripted";
                    "openai-chat-completions": "openai-chat-completions";
                    "anthropic-messages": "anthropic-messages";
                }>;
                protocol_version: z.ZodString;
                profile: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "generic-openai-compatible": "generic-openai-compatible";
                    litellm: "litellm";
                    ollama: "ollama";
                }>;
                profile_version: z.ZodString;
                provider_instance_ref: z.ZodString;
                adapter_ref: z.ZodString;
                endpoint: z.ZodString;
                destination: z.ZodString;
                endpoint_policy_ref: z.ZodString;
                catalogue_source: z.ZodEnum<{
                    declared: "declared";
                    "provider-api": "provider-api";
                    "openai-compatible-models": "openai-compatible-models";
                }>;
                compatibility: z.ZodObject<{
                    streaming: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    tools: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    cancellation: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    context_limits: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    usage: z.ZodEnum<{
                        absent: "absent";
                        reported: "reported";
                        untrusted: "untrusted";
                    }>;
                    upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                    notes: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                compatibility_ref: z.ZodString;
                credential_mode: z.ZodEnum<{
                    none: "none";
                    binding: "binding";
                }>;
                credential_binding_ref: z.ZodNullable<z.ZodString>;
                catalogue_entry_ref: z.ZodString;
                provider_model_revision: z.ZodString;
                assurance_facts_ref: z.ZodNullable<z.ZodString>;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
            selector: z.ZodString;
            selection_reason: z.ZodString;
            catalogue_refs: z.ZodArray<z.ZodString>;
            resolution_policy_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "runtime-identity";
        readonly owner: "runtime-core";
    };
    readonly GatewayAdapterManifestSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            family: z.ZodEnum<{
                "signed-webhook": "signed-webhook";
                "interactive-messaging": "interactive-messaging";
            }>;
            operations: z.ZodArray<z.ZodEnum<{
                steer: "steer";
                redirect: "redirect";
                cancel: "cancel";
                answer: "answer";
                observe: "observe";
                "create-run": "create-run";
                result: "result";
            }>>;
            tenant: z.ZodString;
            principal: z.ZodString;
            scopes: z.ZodArray<z.ZodString>;
            secret_refs: z.ZodArray<z.ZodString>;
            rate_limit: z.ZodObject<{
                per_caller_per_minute: z.ZodNumber;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly GatewayDeliveryCursorSchema: {
        readonly schema: z.ZodObject<{
            adapter: z.ZodString;
            channel_key: z.ZodString;
            run_id: z.ZodString;
            after_seq: z.ZodNumber;
            attempts: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "gateway";
        readonly owner: "runtime-core";
    };
    readonly SetModelAliasRequestSchema: {
        readonly schema: z.ZodObject<{
            alias: z.ZodString;
            catalogue_entry_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly DeclareFallbackSetRequestSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            members: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly SetDefaultModelAliasRequestSchema: {
        readonly schema: z.ZodObject<{
            alias: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly AdmitModelAdapterRequestSchema: {
        readonly schema: z.ZodObject<{
            signature: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            provenance_ref: z.ZodString;
            conformance_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly AdmittedModelAdapterSchema: {
        readonly schema: z.ZodObject<{
            adapter_ref: z.ZodString;
            signature_ref: z.ZodString;
            admitted_by: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            provenance_ref: z.ZodString;
            conformance_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly CredentialBindingSchema: {
        readonly schema: z.ZodObject<{
            binding_ref: z.ZodString;
            name: z.ZodString;
            tenant: z.ZodString;
            owner: z.ZodString;
            purpose: z.ZodEnum<{
                mcp: "mcp";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
                composio: "composio";
                "merge-agent-handler": "merge-agent-handler";
                "merge-unified": "merge-unified";
                "s3-compatible-artifact-store": "s3-compatible-artifact-store";
            }>;
            status: z.ZodEnum<{
                active: "active";
                revoked: "revoked";
            }>;
            epoch: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly CreateExternalCredentialBindingRequestSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            purpose: z.ZodEnum<{
                mcp: "mcp";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
                composio: "composio";
                "merge-agent-handler": "merge-agent-handler";
                "merge-unified": "merge-unified";
                "s3-compatible-artifact-store": "s3-compatible-artifact-store";
            }>;
            external_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ProtectedCredentialIngestRequestSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            purpose: z.ZodEnum<{
                mcp: "mcp";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
                composio: "composio";
                "merge-agent-handler": "merge-agent-handler";
                "merge-unified": "merge-unified";
                "s3-compatible-artifact-store": "s3-compatible-artifact-store";
            }>;
            secret: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly RotateExternalCredentialRequestSchema: {
        readonly schema: z.ZodObject<{
            external_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly RotateProtectedCredentialRequestSchema: {
        readonly schema: z.ZodObject<{
            secret: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly RevokeCredentialRequestSchema: {
        readonly schema: z.ZodObject<{
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly CreateProviderInstanceRequestSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            adapter_ref: z.ZodString;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            profile: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "generic-openai-compatible": "generic-openai-compatible";
                litellm: "litellm";
                ollama: "ollama";
            }>;
            profile_version: z.ZodString;
            endpoint: z.ZodString;
            destination: z.ZodString;
            endpoint_policy_ref: z.ZodString;
            catalogue_source: z.ZodEnum<{
                declared: "declared";
                "provider-api": "provider-api";
                "openai-compatible-models": "openai-compatible-models";
            }>;
            compatibility: z.ZodObject<{
                streaming: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                tools: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                cancellation: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                context_limits: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                usage: z.ZodEnum<{
                    absent: "absent";
                    reported: "reported";
                    untrusted: "untrusted";
                }>;
                upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            credential_mode: z.ZodEnum<{
                none: "none";
                binding: "binding";
            }>;
            credential_binding_ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ProviderInstanceSchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodString;
            adapter_ref: z.ZodString;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            profile: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "generic-openai-compatible": "generic-openai-compatible";
                litellm: "litellm";
                ollama: "ollama";
            }>;
            profile_version: z.ZodString;
            endpoint: z.ZodString;
            destination: z.ZodString;
            endpoint_policy_ref: z.ZodString;
            catalogue_source: z.ZodEnum<{
                declared: "declared";
                "provider-api": "provider-api";
                "openai-compatible-models": "openai-compatible-models";
            }>;
            compatibility: z.ZodObject<{
                streaming: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                tools: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                cancellation: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                context_limits: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                usage: z.ZodEnum<{
                    absent: "absent";
                    reported: "reported";
                    untrusted: "untrusted";
                }>;
                upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            credential_mode: z.ZodEnum<{
                none: "none";
                binding: "binding";
            }>;
            credential_binding_ref: z.ZodNullable<z.ZodString>;
            instance_ref: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            state: z.ZodEnum<{
                configured: "configured";
                revoked: "revoked";
                ready: "ready";
            }>;
            compatibility_ref: z.ZodString;
            credential_epoch: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ProviderInstanceListSchema: {
        readonly schema: z.ZodObject<{
            instances: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                adapter_ref: z.ZodString;
                protocol_adapter: z.ZodEnum<{
                    scripted: "scripted";
                    "openai-chat-completions": "openai-chat-completions";
                    "anthropic-messages": "anthropic-messages";
                }>;
                protocol_version: z.ZodString;
                profile: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "generic-openai-compatible": "generic-openai-compatible";
                    litellm: "litellm";
                    ollama: "ollama";
                }>;
                profile_version: z.ZodString;
                endpoint: z.ZodString;
                destination: z.ZodString;
                endpoint_policy_ref: z.ZodString;
                catalogue_source: z.ZodEnum<{
                    declared: "declared";
                    "provider-api": "provider-api";
                    "openai-compatible-models": "openai-compatible-models";
                }>;
                compatibility: z.ZodObject<{
                    streaming: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    tools: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    cancellation: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    context_limits: z.ZodEnum<{
                        supported: "supported";
                        unknown: "unknown";
                        unsupported: "unsupported";
                    }>;
                    usage: z.ZodEnum<{
                        absent: "absent";
                        reported: "reported";
                        untrusted: "untrusted";
                    }>;
                    upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                    notes: z.ZodArray<z.ZodString>;
                }, z.core.$strict>;
                credential_mode: z.ZodEnum<{
                    none: "none";
                    binding: "binding";
                }>;
                credential_binding_ref: z.ZodNullable<z.ZodString>;
                instance_ref: z.ZodString;
                provider: z.ZodEnum<{
                    scripted: "scripted";
                    openai: "openai";
                    anthropic: "anthropic";
                    openrouter: "openrouter";
                    together: "together";
                    fireworks: "fireworks";
                    "openai-compatible": "openai-compatible";
                }>;
                state: z.ZodEnum<{
                    configured: "configured";
                    revoked: "revoked";
                    ready: "ready";
                }>;
                compatibility_ref: z.ZodString;
                credential_epoch: z.ZodNullable<z.ZodNumber>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly SyncProviderCatalogueRequestSchema: {
        readonly schema: z.ZodObject<{
            models: z.ZodArray<z.ZodObject<{
                provider_model_id: z.ZodString;
                provider_model_revision: z.ZodString;
                context_window: z.ZodNumber;
                max_output_tokens: z.ZodNumber;
                assurance_facts_ref: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ProviderModelEntrySchema: {
        readonly schema: z.ZodObject<{
            provider_model_id: z.ZodString;
            provider_model_revision: z.ZodString;
            context_window: z.ZodNumber;
            max_output_tokens: z.ZodNumber;
            assurance_facts_ref: z.ZodNullable<z.ZodString>;
            catalogue_entry_ref: z.ZodString;
            instance_ref: z.ZodString;
            adapter_ref: z.ZodString;
            model_ref: z.ZodString;
            state: z.ZodEnum<{
                discovered: "discovered";
                enabled: "enabled";
                disabled: "disabled";
            }>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ProviderCatalogueSchema: {
        readonly schema: z.ZodObject<{
            instance_ref: z.ZodString;
            snapshot_ref: z.ZodString;
            entries: z.ZodArray<z.ZodObject<{
                provider_model_id: z.ZodString;
                provider_model_revision: z.ZodString;
                context_window: z.ZodNumber;
                max_output_tokens: z.ZodNumber;
                assurance_facts_ref: z.ZodNullable<z.ZodString>;
                catalogue_entry_ref: z.ZodString;
                instance_ref: z.ZodString;
                adapter_ref: z.ZodString;
                model_ref: z.ZodString;
                state: z.ZodEnum<{
                    discovered: "discovered";
                    enabled: "enabled";
                    disabled: "disabled";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnableProviderModelRequestSchema: {
        readonly schema: z.ZodObject<{
            catalogue_entry_ref: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ModelSelectionSchema: {
        readonly schema: z.ZodObject<{
            model_ref: z.ZodString;
            provider_model_id: z.ZodString;
            provider: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "openai-compatible": "openai-compatible";
            }>;
            protocol_adapter: z.ZodEnum<{
                scripted: "scripted";
                "openai-chat-completions": "openai-chat-completions";
                "anthropic-messages": "anthropic-messages";
            }>;
            protocol_version: z.ZodString;
            profile: z.ZodEnum<{
                scripted: "scripted";
                openai: "openai";
                anthropic: "anthropic";
                openrouter: "openrouter";
                together: "together";
                fireworks: "fireworks";
                "generic-openai-compatible": "generic-openai-compatible";
                litellm: "litellm";
                ollama: "ollama";
            }>;
            profile_version: z.ZodString;
            provider_instance_ref: z.ZodString;
            adapter_ref: z.ZodString;
            endpoint: z.ZodString;
            destination: z.ZodString;
            endpoint_policy_ref: z.ZodString;
            catalogue_source: z.ZodEnum<{
                declared: "declared";
                "provider-api": "provider-api";
                "openai-compatible-models": "openai-compatible-models";
            }>;
            compatibility: z.ZodObject<{
                streaming: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                tools: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                cancellation: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                context_limits: z.ZodEnum<{
                    supported: "supported";
                    unknown: "unknown";
                    unsupported: "unsupported";
                }>;
                usage: z.ZodEnum<{
                    absent: "absent";
                    reported: "reported";
                    untrusted: "untrusted";
                }>;
                upstream_attestation_ref: z.ZodNullable<z.ZodString>;
                notes: z.ZodArray<z.ZodString>;
            }, z.core.$strict>;
            compatibility_ref: z.ZodString;
            credential_mode: z.ZodEnum<{
                none: "none";
                binding: "binding";
            }>;
            credential_binding_ref: z.ZodNullable<z.ZodString>;
            catalogue_entry_ref: z.ZodString;
            provider_model_revision: z.ZodString;
            assurance_facts_ref: z.ZodNullable<z.ZodString>;
            credential_epoch: z.ZodNullable<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly RegisterToolSourceRequestSchema: {
        readonly schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"composio">;
            toolkit_slug: z.ZodString;
            toolkit_version: z.ZodString;
            tool_slugs: z.ZodArray<z.ZodString>;
            connected_account_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"merge-agent-handler">;
            tool_pack_id: z.ZodString;
            registered_user_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"merge-unified">;
        }, z.core.$strict>], "provider">;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceSchema: {
        readonly schema: z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"composio">;
            toolkit_slug: z.ZodString;
            toolkit_version: z.ZodString;
            tool_slugs: z.ZodArray<z.ZodString>;
            connected_account_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"merge-agent-handler">;
            tool_pack_id: z.ZodString;
            registered_user_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            name: z.ZodString;
            endpoint: z.ZodOptional<z.ZodString>;
            credential_binding_ref: z.ZodString;
            scope: z.ZodString;
            provider: z.ZodLiteral<"merge-unified">;
        }, z.core.$strict>], "provider">, z.ZodObject<{
            source_ref: z.ZodString;
            state: z.ZodEnum<{
                configured: "configured";
                revoked: "revoked";
                ready: "ready";
                disabled: "disabled";
                removed: "removed";
            }>;
            credential_epoch: z.ZodNumber;
            current_snapshot_ref: z.ZodNullable<z.ZodString>;
            registered_at: z.ZodString;
        }, z.core.$strict>>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceListSchema: {
        readonly schema: z.ZodObject<{
            sources: z.ZodArray<z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"composio">;
                toolkit_slug: z.ZodString;
                toolkit_version: z.ZodString;
                tool_slugs: z.ZodArray<z.ZodString>;
                connected_account_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"merge-agent-handler">;
                tool_pack_id: z.ZodString;
                registered_user_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"merge-unified">;
            }, z.core.$strict>], "provider">, z.ZodObject<{
                source_ref: z.ZodString;
                state: z.ZodEnum<{
                    configured: "configured";
                    revoked: "revoked";
                    ready: "ready";
                    disabled: "disabled";
                    removed: "removed";
                }>;
                credential_epoch: z.ZodNumber;
                current_snapshot_ref: z.ZodNullable<z.ZodString>;
                registered_at: z.ZodString;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly SyncToolSourceCatalogueRequestSchema: {
        readonly schema: z.ZodObject<{
            tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodUnion<[z.ZodString, z.ZodString]>;
                description: z.ZodString;
                input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                provider_version: z.ZodOptional<z.ZodString>;
                annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            }, z.core.$strict>>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceToolEntrySchema: {
        readonly schema: z.ZodObject<{
            name: z.ZodUnion<[z.ZodString, z.ZodString]>;
            description: z.ZodString;
            input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            provider_version: z.ZodOptional<z.ZodString>;
            annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
            tool_entry_ref: z.ZodString;
            source_ref: z.ZodString;
            imported_name: z.ZodString;
            binding_ref: z.ZodNullable<z.ZodString>;
            operation_class: z.ZodNullable<z.ZodType<"observation" | "effect-proposal", unknown, z.core.$ZodTypeInternals<"observation" | "effect-proposal", unknown>>>;
            reviewer: z.ZodNullable<z.ZodString>;
            state: z.ZodEnum<{
                discovered: "discovered";
                enabled: "enabled";
                disabled: "disabled";
            }>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceCatalogueSchema: {
        readonly schema: z.ZodObject<{
            source_ref: z.ZodString;
            snapshot_ref: z.ZodString;
            entries: z.ZodArray<z.ZodObject<{
                name: z.ZodUnion<[z.ZodString, z.ZodString]>;
                description: z.ZodString;
                input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                provider_version: z.ZodOptional<z.ZodString>;
                annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                tool_entry_ref: z.ZodString;
                source_ref: z.ZodString;
                imported_name: z.ZodString;
                binding_ref: z.ZodNullable<z.ZodString>;
                operation_class: z.ZodNullable<z.ZodType<"observation" | "effect-proposal", unknown, z.core.$ZodTypeInternals<"observation" | "effect-proposal", unknown>>>;
                reviewer: z.ZodNullable<z.ZodString>;
                state: z.ZodEnum<{
                    discovered: "discovered";
                    enabled: "enabled";
                    disabled: "disabled";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly EnableToolSourceToolsRequestSchema: {
        readonly schema: z.ZodObject<{
            tools: z.ZodArray<z.ZodObject<{
                tool_entry_ref: z.ZodString;
                operation_class: z.ZodType<"observation" | "effect-proposal", unknown, z.core.$ZodTypeInternals<"observation" | "effect-proposal", unknown>>;
                reviewer: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceEnablementSchema: {
        readonly schema: z.ZodObject<{
            source: z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"composio">;
                toolkit_slug: z.ZodString;
                toolkit_version: z.ZodString;
                tool_slugs: z.ZodArray<z.ZodString>;
                connected_account_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"merge-agent-handler">;
                tool_pack_id: z.ZodString;
                registered_user_id: z.ZodString;
            }, z.core.$strict>, z.ZodObject<{
                name: z.ZodString;
                endpoint: z.ZodOptional<z.ZodString>;
                credential_binding_ref: z.ZodString;
                scope: z.ZodString;
                provider: z.ZodLiteral<"merge-unified">;
            }, z.core.$strict>], "provider">, z.ZodObject<{
                source_ref: z.ZodString;
                state: z.ZodEnum<{
                    configured: "configured";
                    revoked: "revoked";
                    ready: "ready";
                    disabled: "disabled";
                    removed: "removed";
                }>;
                credential_epoch: z.ZodNumber;
                current_snapshot_ref: z.ZodNullable<z.ZodString>;
                registered_at: z.ZodString;
            }, z.core.$strict>>;
            entries: z.ZodArray<z.ZodObject<{
                name: z.ZodUnion<[z.ZodString, z.ZodString]>;
                description: z.ZodString;
                input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
                provider_version: z.ZodOptional<z.ZodString>;
                annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                tool_entry_ref: z.ZodString;
                source_ref: z.ZodString;
                imported_name: z.ZodString;
                binding_ref: z.ZodNullable<z.ZodString>;
                operation_class: z.ZodNullable<z.ZodType<"observation" | "effect-proposal", unknown, z.core.$ZodTypeInternals<"observation" | "effect-proposal", unknown>>>;
                reviewer: z.ZodNullable<z.ZodString>;
                state: z.ZodEnum<{
                    discovered: "discovered";
                    enabled: "enabled";
                    disabled: "disabled";
                }>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceStateRequestSchema: {
        readonly schema: z.ZodObject<{
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly ToolSourceTestResultSchema: {
        readonly schema: z.ZodObject<{
            source_ref: z.ZodString;
            provider: z.ZodEnum<{
                composio: "composio";
                "merge-agent-handler": "merge-agent-handler";
                "merge-unified": "merge-unified";
            }>;
            ready: z.ZodBoolean;
            credential_status: z.ZodString;
            catalogue_reachable: z.ZodBoolean;
            observed_tools: z.ZodNumber;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "operator-management";
        readonly owner: "runtime-core";
    };
    readonly MemoryAssertionInputSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            predicate: z.ZodString;
            object: z.ZodString;
            writer: z.ZodString;
            valid_from: z.ZodString;
            valid_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            supports: z.ZodArray<z.ZodObject<{
                source_id: z.ZodString;
                span_hash: z.ZodString;
                locator: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryAssertionSchema: {
        readonly schema: z.ZodObject<{
            assertion_id: z.ZodString;
            subject: z.ZodString;
            predicate: z.ZodString;
            object: z.ZodString;
            writer: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            valid_from: z.ZodString;
            valid_to: z.ZodNullable<z.ZodString>;
            recorded_at: z.ZodString;
            state: z.ZodEnum<{
                proposed: "proposed";
                established: "established";
                superseded: "superseded";
                "support-dead": "support-dead";
            }>;
            superseded_by: z.ZodNullable<z.ZodString>;
            support_ids: z.ZodArray<z.ZodString>;
            live_supports: z.ZodNumber;
            meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryReadRequestSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            predicate: z.ZodString;
            valid_at: z.ZodString;
            minimum_watermark: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryReadResponseSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            predicate: z.ZodString;
            valid_at: z.ZodString;
            current: z.ZodArray<z.ZodObject<{
                assertion_id: z.ZodString;
                subject: z.ZodString;
                predicate: z.ZodString;
                object: z.ZodString;
                writer: z.ZodString;
                classification: z.ZodEnum<{
                    public: "public";
                    internal: "internal";
                    confidential: "confidential";
                    restricted: "restricted";
                }>;
                valid_from: z.ZodString;
                valid_to: z.ZodNullable<z.ZodString>;
                recorded_at: z.ZodString;
                state: z.ZodEnum<{
                    proposed: "proposed";
                    established: "established";
                    superseded: "superseded";
                    "support-dead": "support-dead";
                }>;
                superseded_by: z.ZodNullable<z.ZodString>;
                support_ids: z.ZodArray<z.ZodString>;
                live_supports: z.ZodNumber;
                meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
            }, z.core.$strict>>;
            conflicts: z.ZodArray<z.ZodObject<{
                conflict_id: z.ZodString;
                assertion_ids: z.ZodArray<z.ZodString>;
            }, z.core.$strict>>;
            unique_live_supports: z.ZodNumber;
            watermark: z.ZodObject<{
                sequence: z.ZodNumber;
                at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryWriteOutcomeSchema: {
        readonly schema: z.ZodObject<{
            assertion_id: z.ZodString;
            supports_recorded: z.ZodNumber;
            watermark: z.ZodObject<{
                sequence: z.ZodNumber;
                at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemorySupersedeRequestSchema: {
        readonly schema: z.ZodObject<{
            replacement: z.ZodObject<{
                subject: z.ZodString;
                predicate: z.ZodString;
                object: z.ZodString;
                writer: z.ZodString;
                valid_from: z.ZodString;
                valid_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                supports: z.ZodArray<z.ZodObject<{
                    source_id: z.ZodString;
                    span_hash: z.ZodString;
                    locator: z.ZodOptional<z.ZodString>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemorySupersedeOutcomeSchema: {
        readonly schema: z.ZodObject<{
            superseded_assertion_id: z.ZodString;
            replacement_assertion_id: z.ZodString;
            watermark: z.ZodObject<{
                sequence: z.ZodNumber;
                at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryHistoryRequestSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            predicate: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemoryHistoryResponseSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            predicate: z.ZodString;
            erased: z.ZodBoolean;
            assertions: z.ZodArray<z.ZodObject<{
                assertion_id: z.ZodString;
                subject: z.ZodString;
                predicate: z.ZodString;
                object: z.ZodString;
                writer: z.ZodString;
                classification: z.ZodEnum<{
                    public: "public";
                    internal: "internal";
                    confidential: "confidential";
                    restricted: "restricted";
                }>;
                valid_from: z.ZodString;
                valid_to: z.ZodNullable<z.ZodString>;
                recorded_at: z.ZodString;
                state: z.ZodEnum<{
                    proposed: "proposed";
                    established: "established";
                    superseded: "superseded";
                    "support-dead": "support-dead";
                }>;
                superseded_by: z.ZodNullable<z.ZodString>;
                support_ids: z.ZodArray<z.ZodString>;
                live_supports: z.ZodNumber;
                meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
            }, z.core.$strict>>;
            redacted_records: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    "assertion.admitted": "assertion.admitted";
                    "assertion.superseded": "assertion.superseded";
                    "subject.erased": "subject.erased";
                }>;
                assertion_id: z.ZodNullable<z.ZodString>;
                at: z.ZodString;
            }, z.core.$strict>>;
            watermark: z.ZodObject<{
                sequence: z.ZodNumber;
                at: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemorySubjectErasureRequestSchema: {
        readonly schema: z.ZodObject<{
            subject: z.ZodString;
            by: z.ZodString;
            reason: z.ZodString;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly MemorySubjectErasureOutcomeSchema: {
        readonly schema: z.ZodObject<{
            subject_ref: z.ZodString;
            erased: z.ZodBoolean;
            records_redacted: z.ZodNumber;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "quality-plane";
    };
    readonly RunMemoryReadOutcomeSchema: {
        readonly schema: z.ZodObject<{
            run_id: z.ZodString;
            query_ref: z.ZodString;
            scope: z.ZodEnum<{
                "cross-run": "cross-run";
                session: "session";
            }>;
            status: z.ZodEnum<{
                stale: "stale";
                available: "available";
                unavailable: "unavailable";
            }>;
            reason: z.ZodNullable<z.ZodString>;
            read: z.ZodNullable<z.ZodObject<{
                subject: z.ZodString;
                predicate: z.ZodString;
                valid_at: z.ZodString;
                current: z.ZodArray<z.ZodObject<{
                    assertion_id: z.ZodString;
                    subject: z.ZodString;
                    predicate: z.ZodString;
                    object: z.ZodString;
                    writer: z.ZodString;
                    classification: z.ZodEnum<{
                        public: "public";
                        internal: "internal";
                        confidential: "confidential";
                        restricted: "restricted";
                    }>;
                    valid_from: z.ZodString;
                    valid_to: z.ZodNullable<z.ZodString>;
                    recorded_at: z.ZodString;
                    state: z.ZodEnum<{
                        proposed: "proposed";
                        established: "established";
                        superseded: "superseded";
                        "support-dead": "support-dead";
                    }>;
                    superseded_by: z.ZodNullable<z.ZodString>;
                    support_ids: z.ZodArray<z.ZodString>;
                    live_supports: z.ZodNumber;
                    meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
                }, z.core.$strict>>;
                conflicts: z.ZodArray<z.ZodObject<{
                    conflict_id: z.ZodString;
                    assertion_ids: z.ZodArray<z.ZodString>;
                }, z.core.$strict>>;
                unique_live_supports: z.ZodNumber;
                watermark: z.ZodObject<{
                    sequence: z.ZodNumber;
                    at: z.ZodNullable<z.ZodString>;
                }, z.core.$strict>;
            }, z.core.$strict>>;
        }, z.core.$strict>;
        readonly placement: "memory-service";
        readonly owner: "runtime-core";
    };
};
