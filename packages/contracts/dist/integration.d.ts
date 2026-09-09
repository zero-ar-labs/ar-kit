/**
 * Developer-integration contracts (developer-integration appendix, DXI-0).
 *
 * What this is: the shapes progressive skill disclosure, tenant model
 * composition, and gateway adapters speak. A skill descriptor says a
 * pinned skill exists without carrying its body; a load request names an
 * exact pinned ref and nothing else; a resolved model plan expands the
 * model identity a run already pins; a gateway manifest describes a
 * translator that reaches only public operations.
 *
 * How it fits: none of this adds a runtime plane, a state machine, an
 * extension kind, or a private path (DXI-034, DXI-035). Descriptors are
 * derived from published procedure manifests, load results name immutable
 * refs, model plans ride the resolved run manifest, and gateway state
 * lives outside Zero-AR as adapter-local delivery bookkeeping.
 */
import { z } from 'zod';
import type { ProcedureManifest } from './publication.js';
/**
 * The compact form the model sees for a pinned skill: enough to decide
 * whether to open it, and no instruction bytes beyond the standard
 * description (DXI-007). Everything here derives from the published
 * manifest, so a descriptor is never a second source of truth.
 */
export declare const SkillDescriptorSchema: z.ZodObject<{
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
export type SkillDescriptor = z.infer<typeof SkillDescriptorSchema>;
/**
 * Derive the descriptor from the published manifest. A manifest compiled
 * before progressive disclosure carries no activation field, and its
 * historical eager behaviour is what absence means (DXI-012).
 */
export declare function skillDescriptor(manifest: ProcedureManifest, skill_ref: string): SkillDescriptor;
/** Load the exact entry artifact of one pinned skill. */
export declare const SkillOpenRequestSchema: z.ZodObject<{
    skill_ref: z.ZodString;
    retention: z.ZodOptional<z.ZodEnum<{
        checkpoint: "checkpoint";
        turn: "turn";
    }>>;
}, z.core.$strict>;
export type SkillOpenRequest = z.infer<typeof SkillOpenRequestSchema>;
/** Load one declared resource, optionally a bounded line range inside it. */
export declare const SkillReadRequestSchema: z.ZodObject<{
    skill_ref: z.ZodString;
    path: z.ZodString;
    start_line: z.ZodOptional<z.ZodNumber>;
    end_line: z.ZodOptional<z.ZodNumber>;
    retention: z.ZodOptional<z.ZodEnum<{
        checkpoint: "checkpoint";
        turn: "turn";
    }>>;
}, z.core.$strict>;
export type SkillReadRequest = z.infer<typeof SkillReadRequestSchema>;
/** Page the pinned descriptor set. Metadata only: no provider call, no network, no embedding. */
export declare const SkillSearchRequestSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type SkillSearchRequest = z.infer<typeof SkillSearchRequestSchema>;
/** What a load admitted: exact bytes by ref, with the range and retention in force. */
export declare const SkillLoadResultSchema: z.ZodObject<{
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
export type SkillLoadResult = z.infer<typeof SkillLoadResultSchema>;
/** One deterministic page over pinned descriptors, with the rest accounted. */
export declare const SkillSearchResultSchema: z.ZodObject<{
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
export type SkillSearchResult = z.infer<typeof SkillSearchResultSchema>;
/** Read one bounded byte range from a committed artifact handle. */
export declare const ArtifactReadRequestSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    offset: z.ZodNumber;
    length: z.ZodNumber;
}, z.core.$strict>;
export type ArtifactReadRequest = z.infer<typeof ArtifactReadRequestSchema>;
/** One declared ordered fallback set a tenant permits by name (DXI-015). */
export declare const ModelFallbackSetSchema: z.ZodObject<{
    name: z.ZodString;
    members: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type ModelFallbackSet = z.infer<typeof ModelFallbackSetSchema>;
/**
 * The tenant's model inventory: which admitted instances are configured,
 * which exact catalogue entries are enabled, and what names resolve to
 * them. Configuration and inventory only; it holds no secret and performs
 * no inference (DXI-013, DXI-018).
 */
export declare const TenantModelPoolSchema: z.ZodObject<{
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
export type TenantModelPool = z.infer<typeof TenantModelPoolSchema>;
/**
 * The complete model plan a run pins before its first call: one exact
 * primary, the declared ordered fallbacks, and why this selector resolved
 * here. It enters the resolved run manifest and the transitive identity,
 * so a substitution nobody declared cannot happen quietly (DXI-014).
 */
export declare const ResolvedModelPlanSchema: z.ZodObject<{
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
export type ResolvedModelPlan = z.infer<typeof ResolvedModelPlanSchema>;
/** Point one alias at one exact enabled catalogue entry (DXI-018). */
export declare const SetModelAliasRequestSchema: z.ZodObject<{
    alias: z.ZodString;
    catalogue_entry_ref: z.ZodString;
}, z.core.$strict>;
export type SetModelAliasRequest = z.infer<typeof SetModelAliasRequestSchema>;
/** Declare one ordered fallback set a run may pin by name (DXI-015). */
export declare const DeclareFallbackSetRequestSchema: z.ZodObject<{
    name: z.ZodString;
    members: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type DeclareFallbackSetRequest = z.infer<typeof DeclareFallbackSetRequestSchema>;
/** Name the alias intake resolves when an agent asks for the project default. */
export declare const SetDefaultModelAliasRequestSchema: z.ZodObject<{
    alias: z.ZodString;
}, z.core.$strict>;
export type SetDefaultModelAliasRequest = z.infer<typeof SetDefaultModelAliasRequestSchema>;
/**
 * What an admitted gateway adapter is and may reach. It authenticates at
 * the channel boundary, maps trusted configuration to tenant identity,
 * and calls generated public operations. It owns no model loop and holds
 * no secret value: only refs into the deployment secret facility.
 */
export declare const GatewayAdapterManifestSchema: z.ZodObject<{
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
export type GatewayAdapterManifest = z.infer<typeof GatewayAdapterManifestSchema>;
/**
 * Adapter-local delivery bookkeeping. This is not canonical run state:
 * losing it costs redelivery, never run truth (DXI-029, DXI-031).
 */
export declare const GatewayDeliveryCursorSchema: z.ZodObject<{
    adapter: z.ZodString;
    channel_key: z.ZodString;
    run_id: z.ZodString;
    after_seq: z.ZodNumber;
    attempts: z.ZodNumber;
}, z.core.$strict>;
export type GatewayDeliveryCursor = z.infer<typeof GatewayDeliveryCursorSchema>;
