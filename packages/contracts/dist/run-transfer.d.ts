import { z } from 'zod';
export declare const RunContinuationExecutorSchema: z.ZodObject<{
    executor_ref: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
}, z.core.$strict>;
export type RunContinuationExecutor = z.infer<typeof RunContinuationExecutorSchema>;
export declare const RunContinuationBindingRequirementSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        publication: "publication";
        memory: "memory";
        agent: "agent";
        closure: "closure";
        "model-adapter": "model-adapter";
        validator: "validator";
        workspace: "workspace";
        source: "source";
        environment: "environment";
        "domain-pack": "domain-pack";
        "target-adapter": "target-adapter";
        profile: "profile";
    }>;
    ref: z.ZodString;
}, z.core.$strict>;
export type RunContinuationBindingRequirement = z.infer<typeof RunContinuationBindingRequirementSchema>;
export declare const RunContinuationFrontierSchema: z.ZodObject<{
    record_count: z.ZodNumber;
    logical_clock: z.ZodNumber;
    record_id: z.ZodString;
    chain_head: z.ZodString;
    head_projection_hash: z.ZodString;
}, z.core.$strict>;
export type RunContinuationFrontier = z.infer<typeof RunContinuationFrontierSchema>;
export declare const RunContinuationCapsuleSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-run-continuation/1">;
    run_id: z.ZodString;
    frontier: z.ZodObject<{
        record_count: z.ZodNumber;
        logical_clock: z.ZodNumber;
        record_id: z.ZodString;
        chain_head: z.ZodString;
        head_projection_hash: z.ZodString;
    }, z.core.$strict>;
    protocol: z.ZodObject<{
        bundle_format_version: z.ZodLiteral<2>;
        canonicalization: z.ZodEnum<{
            "canonical-json-1": "canonical-json-1";
        }>;
        record_catalogue_ref: z.ZodString;
        fold_profile: z.ZodEnum<{
            "run-head-v9": "run-head-v9";
        }>;
    }, z.core.$strict>;
    continuation_authority_ref: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    state_closure_ref: z.ZodString;
    lifecycle: z.ZodObject<{
        status: z.ZodEnum<{
            cancelled: "cancelled";
            created: "created";
            running: "running";
            suspended: "suspended";
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
        turn: z.ZodNumber;
        pending_review_items: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    open_leases: z.ZodArray<z.ZodObject<{
        lease_id: z.ZodString;
        pool: z.ZodEnum<{
            repair: "repair";
            work: "work";
            verification: "verification";
        }>;
        denomination: z.ZodEnum<{
            model_tokens: "model_tokens";
            tool_calls: "tool_calls";
            bytes: "bytes";
            compute_ms: "compute_ms";
            attention: "attention";
        }>;
        amount: z.ZodNumber;
    }, z.core.$strict>>;
    nonterminal_effects: z.ZodArray<z.ZodObject<{
        effect_id: z.ZodString;
        state: z.ZodEnum<{
            committed: "committed";
            prepared: "prepared";
            dispatched: "dispatched";
            withdrawn: "withdrawn";
            outcome_unknown: "outcome_unknown";
            unreconcilable: "unreconcilable";
        }>;
        target: z.ZodString;
        operation: z.ZodString;
    }, z.core.$strict>>;
    pending_controls: z.ZodArray<z.ZodObject<{
        control_id: z.ZodString;
        verb: z.ZodString;
    }, z.core.$strict>>;
    pending_wakes: z.ZodArray<z.ZodObject<{
        wake_id: z.ZodString;
        due_at: z.ZodString;
        condition: z.ZodString;
    }, z.core.$strict>>;
    inflight_operations: z.ZodArray<z.ZodString>;
    required_bindings: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            publication: "publication";
            memory: "memory";
            agent: "agent";
            closure: "closure";
            "model-adapter": "model-adapter";
            validator: "validator";
            workspace: "workspace";
            source: "source";
            environment: "environment";
            "domain-pack": "domain-pack";
            "target-adapter": "target-adapter";
            profile: "profile";
        }>;
        ref: z.ZodString;
    }, z.core.$strict>>;
    capsule_ref: z.ZodString;
}, z.core.$strict>;
export type RunContinuationCapsule = z.infer<typeof RunContinuationCapsuleSchema>;
export declare const RunContinuationDeclarationSchema: z.ZodObject<{
    executor: z.ZodObject<{
        executor_ref: z.ZodString;
        name: z.ZodString;
        version: z.ZodString;
    }, z.core.$strict>;
    supported_fold_profiles: z.ZodArray<z.ZodEnum<{
        "run-head-v9": "run-head-v9";
    }>>;
    supported_record_catalogues: z.ZodArray<z.ZodString>;
    available_bindings: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            publication: "publication";
            memory: "memory";
            agent: "agent";
            closure: "closure";
            "model-adapter": "model-adapter";
            validator: "validator";
            workspace: "workspace";
            source: "source";
            environment: "environment";
            "domain-pack": "domain-pack";
            "target-adapter": "target-adapter";
            profile: "profile";
        }>;
        ref: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RunContinuationDeclaration = z.infer<typeof RunContinuationDeclarationSchema>;
export declare const RunContinuationAuthoritySchema: z.ZodObject<{
    principal: z.ZodString;
    scopes: z.ZodTuple<[z.ZodLiteral<"operator:restore">, z.ZodLiteral<"run:resume">], null>;
    scope_epoch: z.ZodNumber;
}, z.core.$strict>;
export type RunContinuationAuthority = z.infer<typeof RunContinuationAuthoritySchema>;
export declare const RunContinuationFenceClaimSchema: z.ZodObject<{
    run_id: z.ZodString;
    source_capsule_ref: z.ZodString;
    destination_ref: z.ZodString;
    executor_ref: z.ZodString;
    idempotency_key: z.ZodString;
    request_fingerprint: z.ZodString;
}, z.core.$strict>;
export type RunContinuationFenceClaim = z.infer<typeof RunContinuationFenceClaimSchema>;
export declare const RunContinuationFenceReceiptSchema: z.ZodObject<{
    claim_ref: z.ZodString;
    source_capsule_ref: z.ZodString;
    destination_ref: z.ZodString;
    executor_ref: z.ZodString;
    request_fingerprint: z.ZodString;
    claimed_at: z.ZodString;
    repeated: z.ZodBoolean;
}, z.core.$strict>;
export type RunContinuationFenceReceipt = z.infer<typeof RunContinuationFenceReceiptSchema>;
export declare const RunContinuationAdmissionRequestSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    declaration: z.ZodObject<{
        executor: z.ZodObject<{
            executor_ref: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
        }, z.core.$strict>;
        supported_fold_profiles: z.ZodArray<z.ZodEnum<{
            "run-head-v9": "run-head-v9";
        }>>;
        supported_record_catalogues: z.ZodArray<z.ZodString>;
        available_bindings: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                procedure: "procedure";
                tool: "tool";
                publication: "publication";
                memory: "memory";
                agent: "agent";
                closure: "closure";
                "model-adapter": "model-adapter";
                validator: "validator";
                workspace: "workspace";
                source: "source";
                environment: "environment";
                "domain-pack": "domain-pack";
                "target-adapter": "target-adapter";
                profile: "profile";
            }>;
            ref: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type RunContinuationAdmissionRequest = z.infer<typeof RunContinuationAdmissionRequestSchema>;
export declare const RunContinuationCompatibilityCheckSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        "state-closure": "state-closure";
        executor: "executor";
        protocol: "protocol";
        lifecycle: "lifecycle";
        effects: "effects";
        operations: "operations";
        bindings: "bindings";
        fence: "fence";
    }>;
    status: z.ZodEnum<{
        refused: "refused";
        passed: "passed";
    }>;
    message: z.ZodString;
}, z.core.$strict>;
export type RunContinuationCompatibilityCheck = z.infer<typeof RunContinuationCompatibilityCheckSchema>;
export declare const RunContinuationCompatibilityReportSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-run-continuation-compatibility/1">;
    run_id: z.ZodString;
    capsule_ref: z.ZodString;
    executor_ref: z.ZodString;
    compatible: z.ZodBoolean;
    checks: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            "state-closure": "state-closure";
            executor: "executor";
            protocol: "protocol";
            lifecycle: "lifecycle";
            effects: "effects";
            operations: "operations";
            bindings: "bindings";
            fence: "fence";
        }>;
        status: z.ZodEnum<{
            refused: "refused";
            passed: "passed";
        }>;
        message: z.ZodString;
    }, z.core.$strict>>;
    missing_bindings: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            publication: "publication";
            memory: "memory";
            agent: "agent";
            closure: "closure";
            "model-adapter": "model-adapter";
            validator: "validator";
            workspace: "workspace";
            source: "source";
            environment: "environment";
            "domain-pack": "domain-pack";
            "target-adapter": "target-adapter";
            profile: "profile";
        }>;
        ref: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RunContinuationCompatibilityReport = z.infer<typeof RunContinuationCompatibilityReportSchema>;
export declare const RunContinuationAcceptedSchema: z.ZodObject<{
    run_id: z.ZodString;
    accepted: z.ZodLiteral<true>;
    repeated: z.ZodBoolean;
    accepted_seq: z.ZodNumber;
    capsule: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-run-continuation/1">;
        run_id: z.ZodString;
        frontier: z.ZodObject<{
            record_count: z.ZodNumber;
            logical_clock: z.ZodNumber;
            record_id: z.ZodString;
            chain_head: z.ZodString;
            head_projection_hash: z.ZodString;
        }, z.core.$strict>;
        protocol: z.ZodObject<{
            bundle_format_version: z.ZodLiteral<2>;
            canonicalization: z.ZodEnum<{
                "canonical-json-1": "canonical-json-1";
            }>;
            record_catalogue_ref: z.ZodString;
            fold_profile: z.ZodEnum<{
                "run-head-v9": "run-head-v9";
            }>;
        }, z.core.$strict>;
        continuation_authority_ref: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        state_closure_ref: z.ZodString;
        lifecycle: z.ZodObject<{
            status: z.ZodEnum<{
                cancelled: "cancelled";
                created: "created";
                running: "running";
                suspended: "suspended";
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
            turn: z.ZodNumber;
            pending_review_items: z.ZodArray<z.ZodString>;
        }, z.core.$strict>;
        open_leases: z.ZodArray<z.ZodObject<{
            lease_id: z.ZodString;
            pool: z.ZodEnum<{
                repair: "repair";
                work: "work";
                verification: "verification";
            }>;
            denomination: z.ZodEnum<{
                model_tokens: "model_tokens";
                tool_calls: "tool_calls";
                bytes: "bytes";
                compute_ms: "compute_ms";
                attention: "attention";
            }>;
            amount: z.ZodNumber;
        }, z.core.$strict>>;
        nonterminal_effects: z.ZodArray<z.ZodObject<{
            effect_id: z.ZodString;
            state: z.ZodEnum<{
                committed: "committed";
                prepared: "prepared";
                dispatched: "dispatched";
                withdrawn: "withdrawn";
                outcome_unknown: "outcome_unknown";
                unreconcilable: "unreconcilable";
            }>;
            target: z.ZodString;
            operation: z.ZodString;
        }, z.core.$strict>>;
        pending_controls: z.ZodArray<z.ZodObject<{
            control_id: z.ZodString;
            verb: z.ZodString;
        }, z.core.$strict>>;
        pending_wakes: z.ZodArray<z.ZodObject<{
            wake_id: z.ZodString;
            due_at: z.ZodString;
            condition: z.ZodString;
        }, z.core.$strict>>;
        inflight_operations: z.ZodArray<z.ZodString>;
        required_bindings: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                procedure: "procedure";
                tool: "tool";
                publication: "publication";
                memory: "memory";
                agent: "agent";
                closure: "closure";
                "model-adapter": "model-adapter";
                validator: "validator";
                workspace: "workspace";
                source: "source";
                environment: "environment";
                "domain-pack": "domain-pack";
                "target-adapter": "target-adapter";
                profile: "profile";
            }>;
            ref: z.ZodString;
        }, z.core.$strict>>;
        capsule_ref: z.ZodString;
    }, z.core.$strict>;
    compatibility: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-run-continuation-compatibility/1">;
        run_id: z.ZodString;
        capsule_ref: z.ZodString;
        executor_ref: z.ZodString;
        compatible: z.ZodBoolean;
        checks: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                "state-closure": "state-closure";
                executor: "executor";
                protocol: "protocol";
                lifecycle: "lifecycle";
                effects: "effects";
                operations: "operations";
                bindings: "bindings";
                fence: "fence";
            }>;
            status: z.ZodEnum<{
                refused: "refused";
                passed: "passed";
            }>;
            message: z.ZodString;
        }, z.core.$strict>>;
        missing_bindings: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                procedure: "procedure";
                tool: "tool";
                publication: "publication";
                memory: "memory";
                agent: "agent";
                closure: "closure";
                "model-adapter": "model-adapter";
                validator: "validator";
                workspace: "workspace";
                source: "source";
                environment: "environment";
                "domain-pack": "domain-pack";
                "target-adapter": "target-adapter";
                profile: "profile";
            }>;
            ref: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type RunContinuationAccepted = z.infer<typeof RunContinuationAcceptedSchema>;
export declare const RunHandoffDocumentSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-run-handoff/1">;
    run_id: z.ZodString;
    destination_ref: z.ZodString;
    frontier: z.ZodObject<{
        record_count: z.ZodNumber;
        logical_clock: z.ZodNumber;
        record_id: z.ZodString;
        chain_head: z.ZodString;
        head_projection_hash: z.ZodString;
    }, z.core.$strict>;
    issued_at: z.ZodString;
}, z.core.$strict>;
export type RunHandoffDocument = z.infer<typeof RunHandoffDocumentSchema>;
export declare const RunHandoffSignatureSchema: z.ZodObject<{
    key_id: z.ZodString;
    signing_key_ref: z.ZodString;
    public_key_pem: z.ZodString;
    signature: z.ZodString;
}, z.core.$strict>;
export type RunHandoffSignature = z.infer<typeof RunHandoffSignatureSchema>;
export declare const RunHandoffRecordedSchema: z.ZodObject<{
    handoff: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-run-handoff/1">;
        run_id: z.ZodString;
        destination_ref: z.ZodString;
        frontier: z.ZodObject<{
            record_count: z.ZodNumber;
            logical_clock: z.ZodNumber;
            record_id: z.ZodString;
            chain_head: z.ZodString;
            head_projection_hash: z.ZodString;
        }, z.core.$strict>;
        issued_at: z.ZodString;
    }, z.core.$strict>;
    signer: z.ZodObject<{
        key_id: z.ZodString;
        signing_key_ref: z.ZodString;
        public_key_pem: z.ZodString;
        signature: z.ZodString;
    }, z.core.$strict>;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type RunHandoffRecorded = z.infer<typeof RunHandoffRecordedSchema>;
export declare const RunHandoffRequestSchema: z.ZodObject<{
    destination_ref: z.ZodString;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type RunHandoffRequest = z.infer<typeof RunHandoffRequestSchema>;
export declare const RunHandoffReceiptSchema: z.ZodObject<{
    run_id: z.ZodString;
    destination_ref: z.ZodString;
    handoff_ref: z.ZodString;
    recorded_seq: z.ZodNumber;
    signing_key_ref: z.ZodString;
    repeated: z.ZodBoolean;
}, z.core.$strict>;
export type RunHandoffReceipt = z.infer<typeof RunHandoffReceiptSchema>;
export declare const RunContinuationDestinationIdentitySchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-run-continuation-destination/1">;
    destination_ref: z.ZodString;
    executor_ref: z.ZodString;
    authority_ref: z.ZodString;
    handoff_signing: z.ZodBoolean;
}, z.core.$strict>;
export type RunContinuationDestinationIdentity = z.infer<typeof RunContinuationDestinationIdentitySchema>;
export interface HandoffKeyTrustInput {
    key_id: string;
    signing_key_ref: string;
    commit: boolean;
}
export interface HandoffKeyTrust {
    trusted: boolean;
    first_use: boolean;
    pinned_ref: string | null;
}
export declare function trustHandoffKeyIn(pins: Map<string, string> | Record<string, string>, input: HandoffKeyTrustInput): {
    trust: HandoffKeyTrust;
    pinned_now: boolean;
};
