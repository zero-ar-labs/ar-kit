/**
 * Public environment administration contracts.
 *
 * This file is the shared language used by the server, generated client, SDK,
 * and CLI. A junior developer should add an operation here and to the route
 * table before adding transport code. The runtime implementation sits behind
 * EnvironmentManagementPort, so public surfaces never import an adapter.
 */
import { z } from 'zod';
import type { AbandonEnvironmentResult, CancelEnvironmentJobResult, EnvironmentAdapterDescriptor, EnvironmentJobHandle, EnvironmentProfileRegistration, ObserveEnvironmentJobResult, ReconcileEnvironmentJobResult, TeardownEnvironmentResult } from './environment.js';
import type { EnvironmentDeploymentCapability } from './environment-deployment.js';
export declare const RegisterEnvironmentRequestSchema: z.ZodObject<{
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
export type RegisterEnvironmentRequest = z.infer<typeof RegisterEnvironmentRequestSchema>;
export declare const EnvironmentProfileRefRequestSchema: z.ZodObject<{
    profile_ref: z.ZodString;
}, z.core.$strict>;
export type EnvironmentProfileRefRequest = z.infer<typeof EnvironmentProfileRefRequestSchema>;
export declare const EnvironmentProfileStateRequestSchema: z.ZodObject<{
    state: z.ZodEnum<{
        enabled: "enabled";
        disabled: "disabled";
        registered: "registered";
        draining: "draining";
    }>;
    reason: z.ZodString;
}, z.core.$strict>;
export type EnvironmentProfileStateRequest = z.infer<typeof EnvironmentProfileStateRequestSchema>;
export declare const EnvironmentCredentialRotationRequestSchema: z.ZodObject<{
    secret_issuance_epoch: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strict>;
export type EnvironmentCredentialRotationRequest = z.infer<typeof EnvironmentCredentialRotationRequestSchema>;
export declare const EnvironmentProfileListSchema: z.ZodObject<{
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
export type EnvironmentProfileList = z.infer<typeof EnvironmentProfileListSchema>;
export declare const EnvironmentDoctorRequestSchema: z.ZodObject<{
    active_check: z.ZodBoolean;
}, z.core.$strict>;
export type EnvironmentDoctorRequest = z.infer<typeof EnvironmentDoctorRequestSchema>;
export declare const EnvironmentDoctorResultSchema: z.ZodObject<{
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
export type EnvironmentDoctorResult = z.infer<typeof EnvironmentDoctorResultSchema>;
export declare const EnvironmentConformanceRequestSchema: z.ZodObject<{
    real_provider: z.ZodBoolean;
}, z.core.$strict>;
export type EnvironmentConformanceRequest = z.infer<typeof EnvironmentConformanceRequestSchema>;
export declare const EnvironmentConformanceResultSchema: z.ZodObject<{
    profile_ref: z.ZodString;
    adapter_digest: z.ZodString;
    passed: z.ZodBoolean;
    real_provider: z.ZodBoolean;
    evidence_refs: z.ZodArray<z.ZodString>;
    omissions: z.ZodArray<z.ZodString>;
    diagnostic: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type EnvironmentConformanceResult = z.infer<typeof EnvironmentConformanceResultSchema>;
export declare const EnvironmentJobListSchema: z.ZodObject<{
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
export type EnvironmentJobList = z.infer<typeof EnvironmentJobListSchema>;
export declare const EnvironmentJobRefRequestSchema: z.ZodObject<{
    job_id: z.ZodString;
}, z.core.$strict>;
export type EnvironmentJobRefRequest = z.infer<typeof EnvironmentJobRefRequestSchema>;
export declare const EnvironmentJobActionRequestSchema: z.ZodObject<{
    job_id: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type EnvironmentJobActionRequest = z.infer<typeof EnvironmentJobActionRequestSchema>;
export declare const EnvironmentAbandonJobRequestSchema: z.ZodObject<{
    job_id: z.ZodString;
    reason: z.ZodString;
    remaining_uncertainty: z.ZodArray<z.ZodString>;
    known_cost: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, z.core.$strict>;
export type EnvironmentAbandonJobRequest = z.infer<typeof EnvironmentAbandonJobRequestSchema>;
export declare const EnvironmentSweepRequestSchema: z.ZodObject<{
    adapter_digest: z.ZodNullable<z.ZodString>;
    profile_ref: z.ZodNullable<z.ZodString>;
    limit: z.ZodNumber;
    teardown_terminal: z.ZodBoolean;
    inspect_provider_resources: z.ZodBoolean;
    remove_confirmed_orphans: z.ZodBoolean;
    orphan_grace_ms: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strict>;
export type EnvironmentSweepRequest = z.infer<typeof EnvironmentSweepRequestSchema>;
export declare const EnvironmentSweepResultSchema: z.ZodObject<{
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
export type EnvironmentSweepResult = z.infer<typeof EnvironmentSweepResultSchema>;
export declare const EnvironmentMeasurementSummarySchema: z.ZodObject<{
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
export type EnvironmentMeasurementSummary = z.infer<typeof EnvironmentMeasurementSummarySchema>;
export declare const EnvironmentMetricsSchema: z.ZodObject<{
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
export type EnvironmentMetrics = z.infer<typeof EnvironmentMetricsSchema>;
/** Published tool requirements plus operator preference, never model input. */
export declare const EnvironmentResolutionRequestSchema: z.ZodObject<{
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
export type EnvironmentResolutionRequest = z.infer<typeof EnvironmentResolutionRequestSchema>;
export declare const EnvironmentResolutionResultSchema: z.ZodObject<{
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
export type EnvironmentResolutionResult = z.infer<typeof EnvironmentResolutionResultSchema>;
export interface EnvironmentActorContext {
    tenant: string;
    principal: string;
}
/** The sole server-side port behind all generated environment operations. */
export interface EnvironmentManagementPort {
    capabilities(context: EnvironmentActorContext): Promise<EnvironmentDeploymentCapability[]>;
    register(context: EnvironmentActorContext, request: RegisterEnvironmentRequest): Promise<EnvironmentProfileRegistration>;
    publish(context: EnvironmentActorContext, profile_ref: string): Promise<EnvironmentProfileRegistration>;
    setProfileState(context: EnvironmentActorContext, profile_ref: string, request: EnvironmentProfileStateRequest): Promise<EnvironmentProfileRegistration>;
    rotateCredentials(context: EnvironmentActorContext, profile_ref: string, request: EnvironmentCredentialRotationRequest): Promise<EnvironmentProfileRegistration>;
    list(context: EnvironmentActorContext): Promise<EnvironmentProfileRegistration[]>;
    inspect(context: EnvironmentActorContext, profile_ref: string): Promise<EnvironmentProfileRegistration>;
    doctor(context: EnvironmentActorContext, profile_ref: string, request: EnvironmentDoctorRequest): Promise<EnvironmentDoctorResult>;
    conformance(context: EnvironmentActorContext, profile_ref: string, request: EnvironmentConformanceRequest): Promise<EnvironmentConformanceResult>;
    jobs(context: EnvironmentActorContext): Promise<EnvironmentJobHandle[]>;
    observe(context: EnvironmentActorContext, job_id: string): Promise<ObserveEnvironmentJobResult>;
    cancel(context: EnvironmentActorContext, request: EnvironmentJobActionRequest): Promise<CancelEnvironmentJobResult>;
    reconcile(context: EnvironmentActorContext, job_id: string): Promise<ReconcileEnvironmentJobResult>;
    teardown(context: EnvironmentActorContext, request: EnvironmentJobActionRequest): Promise<TeardownEnvironmentResult>;
    abandon(context: EnvironmentActorContext, request: EnvironmentAbandonJobRequest): Promise<AbandonEnvironmentResult>;
    sweep(context: EnvironmentActorContext, request: EnvironmentSweepRequest): Promise<EnvironmentSweepResult>;
    metrics(context: EnvironmentActorContext): Promise<z.infer<typeof EnvironmentMetricsSchema>>;
}
export type EnvironmentManagementAnswer = EnvironmentProfileRegistration | EnvironmentAdapterDescriptor | EnvironmentJobHandle | ObserveEnvironmentJobResult | ReconcileEnvironmentJobResult | CancelEnvironmentJobResult | TeardownEnvironmentResult | AbandonEnvironmentResult;
