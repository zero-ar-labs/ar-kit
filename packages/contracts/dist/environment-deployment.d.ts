/**
 * Conditional environment deployment and acceptance contracts.
 *
 * What this is: the public, non-secret account of whether an adapter exists,
 * is installed, is configured, passed its host checks, is admitted, and can
 * be selected. It also defines the retained real-host acceptance record.
 *
 * How it fits: hosted composition compiles these states before serving work,
 * while the native API and generated client expose the same facts to operators.
 */
import { z } from 'zod';
import type { EnvironmentAdapter, EnvironmentProfile } from './environment.js';
import { CONDITIONAL_ENVIRONMENT_BACKENDS } from './vocab.js';
export declare const EnvironmentPrerequisiteObservationSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    ready: z.ZodBoolean;
    detail: z.ZodString;
}, z.core.$strict>;
export type EnvironmentPrerequisiteObservation = z.infer<typeof EnvironmentPrerequisiteObservationSchema>;
export declare const EnvironmentHostObservationSchema: z.ZodObject<{
    host_class: z.ZodString;
    host_identity_ref: z.ZodString;
    prerequisites: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        ready: z.ZodBoolean;
        detail: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EnvironmentHostObservation = z.infer<typeof EnvironmentHostObservationSchema>;
export declare const EnvironmentAcceptanceLifecycleSchema: z.ZodObject<{
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
export type EnvironmentAcceptanceLifecycle = z.infer<typeof EnvironmentAcceptanceLifecycleSchema>;
export declare const EnvironmentAcceptanceReportBodySchema: z.ZodObject<{
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
export type EnvironmentAcceptanceReportBody = z.infer<typeof EnvironmentAcceptanceReportBodySchema>;
export declare const EnvironmentAcceptanceReportSchema: z.ZodObject<{
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
export type EnvironmentAcceptanceReport = z.infer<typeof EnvironmentAcceptanceReportSchema>;
export declare const EnvironmentDeploymentCapabilitySchema: z.ZodObject<{
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
export type EnvironmentDeploymentCapability = z.infer<typeof EnvironmentDeploymentCapabilitySchema>;
export declare const EnvironmentDeploymentCapabilityListSchema: z.ZodObject<{
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
export type EnvironmentDeploymentCapabilityList = z.infer<typeof EnvironmentDeploymentCapabilityListSchema>;
/** Runtime-only seam implemented by an explicitly installed adapter package. */
export interface ConditionalEnvironmentDeployment {
    adapter: EnvironmentAdapter;
    profile: EnvironmentProfile;
    configuration_ref: string;
    probe(): Promise<EnvironmentHostObservation>;
}
/** The common export every conditional adapter package supplies. */
export interface ConditionalEnvironmentDeploymentModule {
    openEnvironmentDeployment(input: {
        configuration: unknown;
        resolve_environment(name: string): string;
    }): Promise<ConditionalEnvironmentDeployment> | ConditionalEnvironmentDeployment;
}
export declare function compileEnvironmentAcceptanceReport(input: EnvironmentAcceptanceReportBody): EnvironmentAcceptanceReport;
export declare function environmentAcceptanceReportHasValidRef(input: EnvironmentAcceptanceReport): boolean;
export declare function assertCurrentEnvironmentAcceptance(input: {
    report: EnvironmentAcceptanceReport;
    source_commit: string;
    backend: (typeof CONDITIONAL_ENVIRONMENT_BACKENDS)[number];
    adapter_name: string;
    adapter_version: string;
    adapter_digest: string;
    profile_ref: string;
    configuration_ref: string;
    host_identity_ref: string;
    now: Date;
    max_age_ms: number;
}): EnvironmentAcceptanceReport;
