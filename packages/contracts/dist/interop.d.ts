/**
 * Protocol interoperability contracts and canonical projections.
 *
 * What this is: immutable protocol bindings, discovery snapshots, published
 * work entrypoints, MCP task aliases and assurance envelopes. Secret material
 * has no field in these shapes.
 *
 * How it fits: protocol packages translate these contracts to native client
 * calls. The functions here project canonical native state and never own a
 * second run, cancellation, quality or effect state machine.
 */
import { z } from 'zod';
import type { RunResult, RunSnapshot } from './schemas.js';
/** A bounded JSON value used for schemas and normalized peer metadata. */
export type InteropJson = null | boolean | number | string | InteropJson[] | {
    [key: string]: InteropJson;
};
export declare const InteropJsonSchema: z.ZodType<InteropJson>;
export declare const InteropConnectionSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"endpoint">;
    endpoint: z.ZodString;
    destination_ref: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"listener">;
    listener: z.ZodString;
    listener_identity_ref: z.ZodString;
}, z.core.$strict>], "kind">;
export type InteropConnection = z.infer<typeof InteropConnectionSchema>;
export declare const InteropBindingManifestBodySchema: z.ZodObject<{
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
export type InteropBindingManifestBody = z.infer<typeof InteropBindingManifestBodySchema>;
export declare const InteropBindingManifestSchema: z.ZodObject<{
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
export type InteropBindingManifest = z.infer<typeof InteropBindingManifestSchema>;
export declare function compileInteropBinding(input: InteropBindingManifestBody): InteropBindingManifest;
export declare const McpPublishedWorkEntrypointBodySchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    publication_ref: z.ZodString;
    agent_ref: z.ZodString;
    accountable_principal: z.ZodString;
    input_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
    output_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
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
}, z.core.$strict>;
export type McpPublishedWorkEntrypointBody = z.infer<typeof McpPublishedWorkEntrypointBodySchema>;
export declare const McpPublishedWorkEntrypointSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    publication_ref: z.ZodString;
    agent_ref: z.ZodString;
    accountable_principal: z.ZodString;
    input_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
    output_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
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
export type McpPublishedWorkEntrypoint = z.infer<typeof McpPublishedWorkEntrypointSchema>;
/** Compile one immutable work entrypoint after publication selected its exact agent. */
export declare function compileMcpPublishedWorkEntrypoint(input: McpPublishedWorkEntrypointBody): McpPublishedWorkEntrypoint;
export declare const McpPeerToolSchema: z.ZodObject<{
    name: z.ZodString;
    title: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
    input_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
    output_schema: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
    annotations: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
}, z.core.$strict>;
export type McpPeerTool = z.infer<typeof McpPeerToolSchema>;
export declare const McpPeerResourceSchema: z.ZodObject<{
    uri: z.ZodString;
    name: z.ZodString;
    media_type: z.ZodNullable<z.ZodString>;
    content_identity: z.ZodNullable<z.ZodString>;
    authorization_boundary: z.ZodString;
}, z.core.$strict>;
export type McpPeerResource = z.infer<typeof McpPeerResourceSchema>;
export declare const McpPeerSnapshotBodySchema: z.ZodObject<{
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
        input_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
        output_schema: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
        annotations: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
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
export type McpPeerSnapshotBody = z.infer<typeof McpPeerSnapshotBodySchema>;
export declare const McpPeerSnapshotSchema: z.ZodObject<{
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
        input_schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
        output_schema: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
        annotations: z.ZodNullable<z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>>;
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
export type McpPeerSnapshot = z.infer<typeof McpPeerSnapshotSchema>;
export declare function compileMcpPeerSnapshot(input: McpPeerSnapshotBody): McpPeerSnapshot;
export declare const McpImportedToolPlanSchema: z.ZodObject<{
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
export type McpImportedToolPlan = z.infer<typeof McpImportedToolPlanSchema>;
export declare const McpImportedResourcePlanSchema: z.ZodObject<{
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
export type McpImportedResourcePlan = z.infer<typeof McpImportedResourcePlanSchema>;
export declare const McpTaskAliasSchema: z.ZodObject<{
    task_id: z.ZodString;
    run_id: z.ZodString;
}, z.core.$strict>;
export type McpTaskAlias = z.infer<typeof McpTaskAliasSchema>;
export declare function mcpTaskAlias(runId: string): McpTaskAlias;
export declare function nativeRunIdFromMcpTask(task: string): string;
export declare const McpPendingInputSchema: z.ZodObject<{
    request_id: z.ZodString;
    handle: z.ZodString;
    message: z.ZodString;
    schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
}, z.core.$strict>;
export type McpPendingInput = z.infer<typeof McpPendingInputSchema>;
export declare const McpTaskProjectionSchema: z.ZodObject<{
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
        schema: z.ZodType<InteropJson, unknown, z.core.$ZodTypeInternals<InteropJson, unknown>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type McpTaskProjection = z.infer<typeof McpTaskProjectionSchema>;
export declare function projectMcpTask(snapshot: RunSnapshot, pendingInputs: readonly McpPendingInput[]): McpTaskProjection;
export declare const AssuranceEnvelopeSchema: z.ZodObject<{
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
export type AssuranceEnvelope = z.infer<typeof AssuranceEnvelopeSchema>;
export declare function assuranceEnvelopeFromRunResult(input: {
    result: RunResult;
    canonical_position: number;
    generated_at: string;
    coverage?: readonly string[];
    evidence_refs?: readonly string[];
}): AssuranceEnvelope;
export declare const InteropProtocolRegistryEntrySchema: z.ZodObject<{
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
export type InteropProtocolRegistryEntry = z.infer<typeof InteropProtocolRegistryEntrySchema>;
export declare const InteropProtocolRegistrySchema: z.ZodObject<{
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
export type InteropProtocolRegistry = z.infer<typeof InteropProtocolRegistrySchema>;
export declare const InteropCapabilitySchema: z.ZodObject<{
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
export type InteropCapability = z.infer<typeof InteropCapabilitySchema>;
