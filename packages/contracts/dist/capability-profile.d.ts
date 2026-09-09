/**
 * Capability profile manifests.
 *
 * What this is: the contracts-owned description of what a named profile
 * claims, what it excludes, which components it probes, and which evidence
 * names support those claims.
 *
 * How it fits: composition roots consume this instead of maintaining private
 * health or release capability maps. The manifest ref is pinned into new runs,
 * so a profile change is visible in durable history.
 */
import { z } from 'zod';
import type { Profile, ProfileCapability, ProfileCapabilityRefusalPoint } from './vocab.js';
export declare const ProfileArtifactPolicySchema: z.ZodObject<{
    tool_result_inline_threshold_bytes: z.ZodNumber;
    tool_result_max_artifact_bytes: z.ZodNumber;
    tool_result_range_read_max_bytes: z.ZodNumber;
}, z.core.$strict>;
export type ProfileArtifactPolicy = z.infer<typeof ProfileArtifactPolicySchema>;
export declare const ProfileCapabilityEntrySchema: z.ZodObject<{
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
export type ProfileCapabilityEntry = z.infer<typeof ProfileCapabilityEntrySchema>;
export declare const ProfileCapabilityManifestSchema: z.ZodObject<{
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
export type ProfileCapabilityManifest = z.infer<typeof ProfileCapabilityManifestSchema>;
export declare const ProfileCapabilitySummarySchema: z.ZodObject<{
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
export type ProfileCapabilitySummary = z.infer<typeof ProfileCapabilitySummarySchema>;
interface CompileOptions {
    implemented_capabilities?: readonly ProfileCapability[];
    expected_manifest_ref?: string;
}
export declare function profileCapabilityManifestFor(profile: Profile): ProfileCapabilityManifest;
export declare function profileCapabilityManifestRef(manifest: ProfileCapabilityManifest): string;
export declare function profileCapabilitySummary(manifest: ProfileCapabilityManifest): ProfileCapabilitySummary;
export declare function profileCapabilitySummaryFor(profile: Profile): ProfileCapabilitySummary;
export declare function profileGuaranteeExclusions(profile: Profile): string[];
export declare function compileProfileCapabilityManifest(value: unknown, options?: CompileOptions): ProfileCapabilityManifest;
export declare function assertProfileCapabilitySupported(manifest: ProfileCapabilityManifest, capability: ProfileCapability, boundary?: ProfileCapabilityRefusalPoint): ProfileCapabilityEntry;
export declare function renderProfileCapabilityPage(manifest: ProfileCapabilityManifest): string;
export declare const PROFILE_CAPABILITY_MANIFESTS: Record<Profile, ProfileCapabilityManifest>;
export {};
