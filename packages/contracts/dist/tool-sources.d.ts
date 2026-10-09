/**
 * Tool-source administration contracts.
 *
 * What this is: provider-neutral payloads for configuring Composio and
 * Merge sources, discovering provider catalogues, reviewing imports, and
 * narrowing access without rewriting prior runs.
 *
 * How it fits: the runtime still executes only Zero-AR tool contracts.
 * These shapes describe the operator acts that turn provider catalogue
 * entries into pinned tool bindings.
 */
import { z } from 'zod';
import type { AggregatorProviderName } from './vocab.js';
export declare const RegisterComposioToolSourceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    credential_binding_ref: z.ZodString;
    scope: z.ZodString;
    provider: z.ZodLiteral<"composio">;
    toolkit_slug: z.ZodString;
    toolkit_version: z.ZodString;
    tool_slugs: z.ZodArray<z.ZodString>;
    connected_account_id: z.ZodString;
}, z.core.$strict>;
export declare const RegisterMergeAgentHandlerToolSourceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    credential_binding_ref: z.ZodString;
    scope: z.ZodString;
    provider: z.ZodLiteral<"merge-agent-handler">;
    tool_pack_id: z.ZodString;
    registered_user_id: z.ZodString;
}, z.core.$strict>;
export declare const RegisterMergeUnifiedToolSourceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    endpoint: z.ZodOptional<z.ZodString>;
    credential_binding_ref: z.ZodString;
    scope: z.ZodString;
    provider: z.ZodLiteral<"merge-unified">;
}, z.core.$strict>;
export declare const RegisterToolSourceRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
export type RegisterToolSourceRequest = z.infer<typeof RegisterToolSourceRequestSchema>;
export declare const ToolSourceSchema: z.ZodIntersection<z.ZodDiscriminatedUnion<[z.ZodObject<{
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
        disabled: "disabled";
        configured: "configured";
        revoked: "revoked";
        ready: "ready";
        removed: "removed";
    }>;
    credential_epoch: z.ZodNumber;
    current_snapshot_ref: z.ZodNullable<z.ZodString>;
    registered_at: z.ZodString;
}, z.core.$strict>>;
export type ToolSource = z.infer<typeof ToolSourceSchema>;
export declare const ToolSourceListSchema: z.ZodObject<{
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
            disabled: "disabled";
            configured: "configured";
            revoked: "revoked";
            ready: "ready";
            removed: "removed";
        }>;
        credential_epoch: z.ZodNumber;
        current_snapshot_ref: z.ZodNullable<z.ZodString>;
        registered_at: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type ToolSourceList = z.infer<typeof ToolSourceListSchema>;
export declare const DiscoveredToolSourceToolSchema: z.ZodObject<{
    name: z.ZodUnion<[z.ZodString, z.ZodString]>;
    description: z.ZodString;
    input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    provider_version: z.ZodOptional<z.ZodString>;
    annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.core.$strict>;
export type DiscoveredToolSourceTool = z.infer<typeof DiscoveredToolSourceToolSchema>;
export declare const ToolSourceToolEntrySchema: z.ZodObject<{
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
        disabled: "disabled";
        discovered: "discovered";
        enabled: "enabled";
    }>;
}, z.core.$strict>;
export type ToolSourceToolEntry = z.infer<typeof ToolSourceToolEntrySchema>;
export declare const SyncToolSourceCatalogueRequestSchema: z.ZodObject<{
    tools: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodUnion<[z.ZodString, z.ZodString]>;
        description: z.ZodString;
        input_schema: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        provider_version: z.ZodOptional<z.ZodString>;
        annotations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type SyncToolSourceCatalogueRequest = z.infer<typeof SyncToolSourceCatalogueRequestSchema>;
export declare const ToolSourceCatalogueSchema: z.ZodObject<{
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
            disabled: "disabled";
            discovered: "discovered";
            enabled: "enabled";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ToolSourceCatalogue = z.infer<typeof ToolSourceCatalogueSchema>;
export declare const EnableToolSourceToolsRequestSchema: z.ZodObject<{
    tools: z.ZodArray<z.ZodObject<{
        tool_entry_ref: z.ZodString;
        operation_class: z.ZodType<"observation" | "effect-proposal", unknown, z.core.$ZodTypeInternals<"observation" | "effect-proposal", unknown>>;
        reviewer: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EnableToolSourceToolsRequest = z.infer<typeof EnableToolSourceToolsRequestSchema>;
export declare const ToolSourceEnablementSchema: z.ZodObject<{
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
            disabled: "disabled";
            configured: "configured";
            revoked: "revoked";
            ready: "ready";
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
            disabled: "disabled";
            discovered: "discovered";
            enabled: "enabled";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ToolSourceEnablement = z.infer<typeof ToolSourceEnablementSchema>;
export declare const ToolSourceStateRequestSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strict>;
export type ToolSourceStateRequest = z.infer<typeof ToolSourceStateRequestSchema>;
export declare const ToolSourceTestResultSchema: z.ZodObject<{
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
export type ToolSourceTestResult = z.infer<typeof ToolSourceTestResultSchema>;
export declare function toolSourceProvider(request: RegisterToolSourceRequest): AggregatorProviderName;
/**
 * The one content address for a discovered provider catalogue. The registry
 * and the aggregator host both hash through this function, so a snapshot one
 * pins reads as the same snapshot in the other (TAG-023). Tools sort by name
 * in UTF-16 code-unit order, which does not depend on the host locale.
 */
export declare function catalogueSnapshotRef(input: {
    provider: AggregatorProviderName;
    instance: string;
    tools: readonly {
        name: string;
    }[];
}): string;
/** One recorded difference between a source's pinned catalogue and what the provider now serves (TAG-025). */
export declare const ToolSourceDriftRecordSchema: z.ZodObject<{
    source_ref: z.ZodString;
    pinned_snapshot_ref: z.ZodString;
    observed_snapshot_ref: z.ZodString;
    added: z.ZodArray<z.ZodString>;
    removed: z.ZodArray<z.ZodString>;
    changed: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        fields: z.ZodArray<z.ZodEnum<{
            description: "description";
            input_schema: "input_schema";
            provider_version: "provider_version";
            annotations: "annotations";
        }>>;
    }, z.core.$strict>>;
    recorded_at: z.ZodString;
}, z.core.$strict>;
export type ToolSourceDriftRecord = z.infer<typeof ToolSourceDriftRecordSchema>;
/** The durable drift history of one source. Drifted means its enabled bindings refuse until re-enabled. */
export declare const ToolSourceDriftReportSchema: z.ZodObject<{
    source_ref: z.ZodString;
    drifted: z.ZodBoolean;
    records: z.ZodArray<z.ZodObject<{
        source_ref: z.ZodString;
        pinned_snapshot_ref: z.ZodString;
        observed_snapshot_ref: z.ZodString;
        added: z.ZodArray<z.ZodString>;
        removed: z.ZodArray<z.ZodString>;
        changed: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            fields: z.ZodArray<z.ZodEnum<{
                description: "description";
                input_schema: "input_schema";
                provider_version: "provider_version";
                annotations: "annotations";
            }>>;
        }, z.core.$strict>>;
        recorded_at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ToolSourceDriftReport = z.infer<typeof ToolSourceDriftReportSchema>;
