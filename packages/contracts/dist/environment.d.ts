/**
 * Environment lifecycle contracts.
 *
 * These schemas define the one provider-neutral protocol for disposable or
 * externally recoverable compute. Adapters translate provider operations;
 * Zero-AR keeps run, lease, effect, artifact, and completion meaning outside
 * the environment boundary (ENV-001 and ENV-002).
 */
import { z } from 'zod';
export declare const EnvironmentBackendSchema: z.ZodEnum<{
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
export declare const EnvironmentIsolationSchema: z.ZodEnum<{
    none: "none";
    process: "process";
    container: "container";
    "remote-host": "remote-host";
    microvm: "microvm";
    "hosted-sandbox": "hosted-sandbox";
}>;
export declare const EnvironmentLifecycleOperationSchema: z.ZodEnum<{
    cancel: "cancel";
    observe: "observe";
    teardown: "teardown";
    descriptor: "descriptor";
    prepare: "prepare";
    submit: "submit";
    reconcile: "reconcile";
    collect: "collect";
    abandon: "abandon";
}>;
export declare const EnvironmentMountModeSchema: z.ZodEnum<{
    "read-only": "read-only";
    "read-write": "read-write";
}>;
export declare const EnvironmentNetworkModeSchema: z.ZodEnum<{
    deny: "deny";
    allowlist: "allowlist";
    unrestricted: "unrestricted";
}>;
export declare const EnvironmentProfileStateSchema: z.ZodEnum<{
    enabled: "enabled";
    disabled: "disabled";
    registered: "registered";
    draining: "draining";
}>;
export declare const EnvironmentStatusSchema: z.ZodEnum<{
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
export declare const EnvironmentSuspensionDispositionSchema: z.ZodEnum<{
    "continue-and-observe": "continue-and-observe";
    "request-cancel-and-reconcile": "request-cancel-and-reconcile";
    "retain-ready-environment-with-expiry": "retain-ready-environment-with-expiry";
    "teardown-after-collection": "teardown-after-collection";
    "operator-review-required": "operator-review-required";
}>;
export declare const EnvironmentTenantSharingSchema: z.ZodEnum<{
    "tenant-owned": "tenant-owned";
    "deployment-shared": "deployment-shared";
}>;
/** Generic environments can host only work that carries no effect dispatch. */
export declare const EnvironmentOperationClassSchema: z.ZodEnum<{
    observation: "observation";
    "run-internal": "run-internal";
    "effect-proposal": "effect-proposal";
}> & z.ZodType<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal", z.core.$ZodTypeInternals<"observation" | "run-internal", "observation" | "run-internal" | "effect-proposal">>;
export declare const EnvironmentLimitsSchema: z.ZodObject<{
    cpu_millis: z.ZodNumber;
    memory_mib: z.ZodNumber;
    disk_mib: z.ZodNumber;
    gpu_count: z.ZodNumber;
    wall_time_ms: z.ZodNumber;
    process_count: z.ZodNumber;
    concurrency: z.ZodNumber;
    output_bytes: z.ZodNumber;
}, z.core.$strict>;
export type EnvironmentLimits = z.infer<typeof EnvironmentLimitsSchema>;
export declare const EnvironmentNetworkPolicySchema: z.ZodObject<{
    mode: z.ZodEnum<{
        deny: "deny";
        allowlist: "allowlist";
        unrestricted: "unrestricted";
    }>;
    destinations: z.ZodArray<z.ZodString>;
    enforced_at: z.ZodString;
    name_resolution: z.ZodString;
}, z.core.$strict>;
export type EnvironmentNetworkPolicy = z.infer<typeof EnvironmentNetworkPolicySchema>;
export declare const EnvironmentMountPolicySchema: z.ZodObject<{
    name: z.ZodString;
    mode: z.ZodEnum<{
        "read-only": "read-only";
        "read-write": "read-write";
    }>;
    source_ref: z.ZodNullable<z.ZodString>;
    target: z.ZodString;
    max_bytes: z.ZodNumber;
}, z.core.$strict>;
export type EnvironmentMountPolicy = z.infer<typeof EnvironmentMountPolicySchema>;
export declare const EnvironmentOutputDeclarationSchema: z.ZodObject<{
    path: z.ZodString;
    max_bytes: z.ZodNumber;
    classification: z.ZodString;
    required: z.ZodBoolean;
}, z.core.$strict>;
export type EnvironmentOutputDeclaration = z.infer<typeof EnvironmentOutputDeclarationSchema>;
export declare const EnvironmentLifecycleAssuranceSchema: z.ZodObject<{
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
export type EnvironmentLifecycleAssurance = z.infer<typeof EnvironmentLifecycleAssuranceSchema>;
/** One versioned adapter capability and omission declaration (ENV-038). */
export declare const EnvironmentAdapterDescriptorSchema: z.ZodObject<{
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
export type EnvironmentAdapterDescriptor = z.infer<typeof EnvironmentAdapterDescriptorSchema>;
/** Immutable operator configuration. Enablement is separate mutable state. */
export declare const EnvironmentProfileSchema: z.ZodObject<{
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
export type EnvironmentProfile = z.infer<typeof EnvironmentProfileSchema>;
/**
 * Compute the immutable profile identity from every material field. The
 * mutable enablement state and credential issuance epoch live outside this
 * value, so rotating the same scoped credential does not move active runs.
 */
export declare function deriveEnvironmentProfileRef(profile: Omit<EnvironmentProfile, 'profile_ref'>): string;
export declare function environmentProfileHasValidRef(profile: EnvironmentProfile): boolean;
/** Mutable admission state kept beside, rather than inside, the immutable profile. */
export declare const EnvironmentProfileRegistrationSchema: z.ZodObject<{
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
export type EnvironmentProfileRegistration = z.infer<typeof EnvironmentProfileRegistrationSchema>;
/** Every provider handle is bound to the admitted Zero-AR operation. */
export declare const EnvironmentHandleBindingSchema: z.ZodObject<{
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
export type EnvironmentHandleBinding = z.infer<typeof EnvironmentHandleBindingSchema>;
export declare const EnvironmentHandleSchema: z.ZodObject<{
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
export type EnvironmentHandle = z.infer<typeof EnvironmentHandleSchema>;
export declare const EnvironmentJobHandleSchema: z.ZodObject<{
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
export type EnvironmentJobHandle = z.infer<typeof EnvironmentJobHandleSchema>;
export declare const PrepareEnvironmentRequestSchema: z.ZodObject<{
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
export type PrepareEnvironmentRequest = z.infer<typeof PrepareEnvironmentRequestSchema>;
export declare const PrepareEnvironmentResultSchema: z.ZodObject<{
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
export type PrepareEnvironmentResult = z.infer<typeof PrepareEnvironmentResultSchema>;
export declare const SubmitEnvironmentJobRequestSchema: z.ZodObject<{
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
export type SubmitEnvironmentJobRequest = z.infer<typeof SubmitEnvironmentJobRequestSchema>;
export declare const SubmitEnvironmentJobResultSchema: z.ZodObject<{
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
export type SubmitEnvironmentJobResult = z.infer<typeof SubmitEnvironmentJobResultSchema>;
export declare const ObserveEnvironmentJobRequestSchema: z.ZodObject<{
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
export type ObserveEnvironmentJobRequest = z.infer<typeof ObserveEnvironmentJobRequestSchema>;
export declare const ObserveEnvironmentJobResultSchema: z.ZodObject<{
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
export type ObserveEnvironmentJobResult = z.infer<typeof ObserveEnvironmentJobResultSchema>;
export declare const ReconcileEnvironmentJobRequestSchema: z.ZodObject<{
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
export type ReconcileEnvironmentJobRequest = z.infer<typeof ReconcileEnvironmentJobRequestSchema>;
export declare const ReconcileEnvironmentJobResultSchema: z.ZodObject<{
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
export type ReconcileEnvironmentJobResult = z.infer<typeof ReconcileEnvironmentJobResultSchema>;
export declare const CancelEnvironmentJobRequestSchema: z.ZodObject<{
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
export type CancelEnvironmentJobRequest = z.infer<typeof CancelEnvironmentJobRequestSchema>;
export declare const CancelEnvironmentJobResultSchema: z.ZodObject<{
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
export type CancelEnvironmentJobResult = z.infer<typeof CancelEnvironmentJobResultSchema>;
export declare const CollectEnvironmentArtifactRequestSchema: z.ZodObject<{
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
export type CollectEnvironmentArtifactRequest = z.infer<typeof CollectEnvironmentArtifactRequestSchema>;
export declare const CollectedEnvironmentArtifactSchema: z.ZodObject<{
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
export type CollectedEnvironmentArtifact = z.infer<typeof CollectedEnvironmentArtifactSchema>;
export declare const CollectEnvironmentArtifactResultSchema: z.ZodObject<{
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
export type CollectEnvironmentArtifactResult = z.infer<typeof CollectEnvironmentArtifactResultSchema>;
export declare const TeardownEnvironmentRequestSchema: z.ZodObject<{
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
export type TeardownEnvironmentRequest = z.infer<typeof TeardownEnvironmentRequestSchema>;
export declare const TeardownEnvironmentResultSchema: z.ZodObject<{
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
export type TeardownEnvironmentResult = z.infer<typeof TeardownEnvironmentResultSchema>;
export declare const AbandonEnvironmentRequestSchema: z.ZodObject<{
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
export type AbandonEnvironmentRequest = z.infer<typeof AbandonEnvironmentRequestSchema>;
export declare const AbandonEnvironmentResultSchema: z.ZodObject<{
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
export type AbandonEnvironmentResult = z.infer<typeof AbandonEnvironmentResultSchema>;
/** Durable suspension disposition for every environment handle still open. */
export declare const SuspendedEnvironmentHandleSchema: z.ZodObject<{
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
export type SuspendedEnvironmentHandle = z.infer<typeof SuspendedEnvironmentHandleSchema>;
/** Current facts that resume must revalidate before it contacts a provider. */
export declare const EnvironmentResumeContextSchema: z.ZodObject<{
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
export type EnvironmentResumeContext = z.infer<typeof EnvironmentResumeContextSchema>;
/** One already-admitted run-internal invocation crossing from the kernel. */
export declare const EnvironmentExecutionRequestSchema: z.ZodObject<{
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
export type EnvironmentExecutionRequest = z.infer<typeof EnvironmentExecutionRequestSchema>;
export declare const EnvironmentExecutionResultSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    error: z.ZodOptional<z.ZodString>;
    used: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type EnvironmentExecutionResult = z.infer<typeof EnvironmentExecutionResultSchema>;
/** The lifecycle-backed port the kernel can call after admission and lease reservation. */
export interface EnvironmentExecutionPort {
    readonly identity: {
        name: string;
        version: string;
    };
    readonly profiles: Readonly<Record<string, string>>;
    execute(request: EnvironmentExecutionRequest, signal?: AbortSignal): Promise<EnvironmentExecutionResult>;
    suspendRun(run_id: string): Promise<SuspendedEnvironmentHandle[]>;
    resumeRun(run_id: string): Promise<{
        reconciled_jobs: number;
    }>;
    cancelRun(run_id: string, reason: string): Promise<{
        jobs: number;
        uncertainties: string[];
    }>;
    teardownRun(run_id: string): Promise<{
        removed: string[];
    }>;
}
/** The full adapter protocol. Short execute compiles into these methods. */
export interface EnvironmentAdapter {
    descriptor(): Promise<EnvironmentAdapterDescriptor>;
    prepare(request: PrepareEnvironmentRequest): Promise<PrepareEnvironmentResult>;
    submit(request: SubmitEnvironmentJobRequest): Promise<SubmitEnvironmentJobResult>;
    observe(request: ObserveEnvironmentJobRequest): Promise<ObserveEnvironmentJobResult>;
    reconcile(request: ReconcileEnvironmentJobRequest): Promise<ReconcileEnvironmentJobResult>;
    cancel(request: CancelEnvironmentJobRequest): Promise<CancelEnvironmentJobResult>;
    collect(request: CollectEnvironmentArtifactRequest): Promise<CollectEnvironmentArtifactResult>;
    teardown(request: TeardownEnvironmentRequest): Promise<TeardownEnvironmentResult>;
    abandon(request: AbandonEnvironmentRequest): Promise<AbandonEnvironmentResult>;
}
/** Only these lifecycle states carry work that still needs disposition. */
export declare function isNonTerminalEnvironmentStatus(status: z.infer<typeof EnvironmentStatusSchema>): boolean;
