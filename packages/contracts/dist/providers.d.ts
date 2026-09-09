/**
 * Provider control-plane contracts.
 *
 * What this is: admitted adapter metadata, tenant provider instances,
 * discovered catalogue entries, explicit enablement, and the exact model
 * selection the kernel pins. Credential bytes have no field here.
 *
 * How it fits: administrators configure and enable models through these
 * generated contracts. Only a run-owned adapter call consumes a selection;
 * no contract in this file is an inference request.
 */
import { z } from 'zod';
import type { ModelProtocolAdapter, ModelProvider, ModelProviderProfile } from './vocab.js';
declare const ModelAdapterIdentitySchema: z.ZodObject<{
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
export type ModelAdapterIdentity = z.infer<typeof ModelAdapterIdentitySchema>;
export declare const AdmitModelAdapterRequestSchema: z.ZodObject<{
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
export type AdmitModelAdapterRequest = z.infer<typeof AdmitModelAdapterRequestSchema>;
/** Exact signed adapter body, shared by the platform signer and admission verifier. */
export declare function modelAdapterIdentity(request: AdmitModelAdapterRequest): ModelAdapterIdentity;
export declare function modelAdapterRef(request: AdmitModelAdapterRequest): string;
export declare const AdmittedModelAdapterSchema: z.ZodObject<{
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
export type AdmittedModelAdapter = z.infer<typeof AdmittedModelAdapterSchema>;
export declare const CredentialBindingSchema: z.ZodObject<{
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
export type CredentialBinding = z.infer<typeof CredentialBindingSchema>;
export declare const CreateExternalCredentialBindingRequestSchema: z.ZodObject<{
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
export type CreateExternalCredentialBindingRequest = z.infer<typeof CreateExternalCredentialBindingRequestSchema>;
/** The only public JSON shape that may carry provider secret bytes. */
export declare const ProtectedCredentialIngestRequestSchema: z.ZodObject<{
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
export type ProtectedCredentialIngestRequest = z.infer<typeof ProtectedCredentialIngestRequestSchema>;
export declare const RotateExternalCredentialRequestSchema: z.ZodObject<{
    external_ref: z.ZodString;
}, z.core.$strict>;
export type RotateExternalCredentialRequest = z.infer<typeof RotateExternalCredentialRequestSchema>;
/** Rotation counterpart to protected ingest. The secret is never returned. */
export declare const RotateProtectedCredentialRequestSchema: z.ZodObject<{
    secret: z.ZodString;
}, z.core.$strict>;
export type RotateProtectedCredentialRequest = z.infer<typeof RotateProtectedCredentialRequestSchema>;
export declare const RevokeCredentialRequestSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strict>;
export type RevokeCredentialRequest = z.infer<typeof RevokeCredentialRequestSchema>;
/** Exact compatible behavior one tenant admits for a configured endpoint. */
export declare const ProviderCompatibilitySchema: z.ZodObject<{
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
export type ProviderCompatibility = z.infer<typeof ProviderCompatibilitySchema>;
/** Content identity for the admitted compatibility statement. */
export declare function modelCompatibilityRef(compatibility: ProviderCompatibility): string;
/** The wire adapter one provider profile is allowed to use. */
export declare function providerProfileProtocol(profile: ModelProviderProfile): ModelProtocolAdapter;
/** The provider family a profile belongs to without collapsing profile identity. */
export declare function providerProfileFamily(profile: ModelProviderProfile): ModelProvider;
/** Conservative compatibility defaults for each tested profile. */
export declare function providerProfileCompatibility(profile: ModelProviderProfile): ProviderCompatibility;
export declare const CreateProviderInstanceRequestSchema: z.ZodObject<{
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
export type CreateProviderInstanceRequest = z.infer<typeof CreateProviderInstanceRequestSchema>;
/** Build the explicit profile fields used by the SDK, CLI examples, and tests. */
export declare function providerInstanceProfile(profile: ModelProviderProfile, endpoint: string, credential: {
    mode: 'binding';
    binding_ref: string;
} | {
    mode: 'none';
}, options?: {
    profile_version?: string;
    protocol_version?: string;
    catalogue_source?: CreateProviderInstanceRequest['catalogue_source'];
    compatibility?: ProviderCompatibility;
}): Omit<CreateProviderInstanceRequest, 'name' | 'adapter_ref' | 'endpoint_policy_ref'>;
export declare const ProviderInstanceSchema: z.ZodObject<{
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
export type ProviderInstance = z.infer<typeof ProviderInstanceSchema>;
export declare const ProviderInstanceListSchema: z.ZodObject<{
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
export type ProviderInstanceList = z.infer<typeof ProviderInstanceListSchema>;
export declare const DiscoveredProviderModelSchema: z.ZodObject<{
    provider_model_id: z.ZodString;
    provider_model_revision: z.ZodString;
    context_window: z.ZodNumber;
    max_output_tokens: z.ZodNumber;
    assurance_facts_ref: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type DiscoveredProviderModel = z.infer<typeof DiscoveredProviderModelSchema>;
export declare const SyncProviderCatalogueRequestSchema: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        provider_model_id: z.ZodString;
        provider_model_revision: z.ZodString;
        context_window: z.ZodNumber;
        max_output_tokens: z.ZodNumber;
        assurance_facts_ref: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SyncProviderCatalogueRequest = z.infer<typeof SyncProviderCatalogueRequestSchema>;
export declare const ProviderModelEntrySchema: z.ZodObject<{
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
export type ProviderModelEntry = z.infer<typeof ProviderModelEntrySchema>;
export declare const ProviderCatalogueSchema: z.ZodObject<{
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
export type ProviderCatalogue = z.infer<typeof ProviderCatalogueSchema>;
export declare const EnableProviderModelRequestSchema: z.ZodObject<{
    catalogue_entry_ref: z.ZodString;
}, z.core.$strict>;
export type EnableProviderModelRequest = z.infer<typeof EnableProviderModelRequestSchema>;
export declare const ModelSelectionSchema: z.ZodObject<{
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
export type ModelSelection = z.infer<typeof ModelSelectionSchema>;
export {};
