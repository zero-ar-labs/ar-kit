/**
 * Signed environment adapter release contracts.
 *
 * A junior developer uses the body to describe one exact adapter package,
 * source revision, dependency inventory, runtime artifacts, and supported
 * hosts. Release tooling signs that body. Runtime admission verifies the
 * signature and compares it with the adapter descriptor before enablement.
 */
import { z } from 'zod';
export declare const EnvironmentAdapterCompatibilitySchema: z.ZodObject<{
    contract: z.ZodLiteral<"environment-adapter/1">;
    node: z.ZodString;
    operating_systems: z.ZodArray<z.ZodString>;
    architectures: z.ZodArray<z.ZodString>;
    provider_runtime: z.ZodNullable<z.ZodString>;
    provider_runtime_version: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type EnvironmentAdapterCompatibility = z.infer<typeof EnvironmentAdapterCompatibilitySchema>;
export declare const EnvironmentAdapterReleaseBodySchema: z.ZodObject<{
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
export type EnvironmentAdapterReleaseBody = z.infer<typeof EnvironmentAdapterReleaseBodySchema>;
export declare const EnvironmentAdapterReleaseManifestSchema: z.ZodObject<{
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
export type EnvironmentAdapterReleaseManifest = z.infer<typeof EnvironmentAdapterReleaseManifestSchema>;
