/**
 * Runtime artifact ingest and run state-closure contracts.
 *
 * What this is: the public metadata, durable upload position and committed
 * handle a product backend uses for input or later run evidence. Raw chunks
 * travel on the binary route, so these schemas never turn large bytes into
 * JSON. Publication uploads use a separate contract and lifecycle.
 *
 * How it fits: the authenticated tenant and application principal come from
 * deployment. Commit returns a manifest only after byte verification. Run
 * export keeps ordinary evidence in artifact bundles, carries protected
 * runtime state only in an authorized transfer, and accounts for every
 * member in one content-addressed closure.
 */
import { z } from 'zod';
/** One immutable destination for the artifact after commit. */
export declare const RuntimeArtifactIntendedUseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"run">;
    run_id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"intake">;
    intake_ref: z.ZodString;
}, z.core.$strict>], "kind">;
export type RuntimeArtifactIntendedUse = z.infer<typeof RuntimeArtifactIntendedUseSchema>;
/** Caller-known origin facts. Authentication supplies the application principal. */
export declare const RuntimeArtifactProvenanceInputSchema: z.ZodObject<{
    source: z.ZodString;
    source_event_id: z.ZodOptional<z.ZodString>;
    observed_at: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RuntimeArtifactProvenanceInput = z.infer<typeof RuntimeArtifactProvenanceInputSchema>;
/** Open one durable upload with its final content declared before bytes arrive. */
export declare const RuntimeArtifactSessionRequestSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    expected_content_hash: z.ZodString;
    expected_bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        source_event_id: z.ZodOptional<z.ZodString>;
        observed_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"run">;
        run_id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"intake">;
        intake_ref: z.ZodString;
    }, z.core.$strict>], "kind">;
    retention_expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strict>;
export type RuntimeArtifactSessionRequest = z.infer<typeof RuntimeArtifactSessionRequestSchema>;
export declare const RuntimeArtifactManifestSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    backend: z.ZodEnum<{
        filesystem: "filesystem";
        "s3-compatible": "s3-compatible";
    }>;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    application_principal: z.ZodString;
    intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"run">;
        run_id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"intake">;
        intake_ref: z.ZodString;
    }, z.core.$strict>], "kind">;
    provenance: z.ZodObject<{
        source: z.ZodString;
        source_event_id: z.ZodOptional<z.ZodString>;
        observed_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    created_at: z.ZodString;
    retention_expires_at: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type RuntimeArtifactManifest = z.infer<typeof RuntimeArtifactManifestSchema>;
/** Canonical notice that one run-bound artifact crossed verified commit. */
export declare const RuntimeArtifactCommittedRecordSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    application_principal: z.ZodString;
}, z.core.$strict>;
export type RuntimeArtifactCommittedRecord = z.infer<typeof RuntimeArtifactCommittedRecordSchema>;
export declare const RuntimeArtifactReadySessionSchema: z.ZodObject<{
    session_id: z.ZodString;
    status: z.ZodLiteral<"ready">;
    offset: z.ZodNumber;
    expected_bytes: z.ZodNumber;
    expected_content_hash: z.ZodString;
    max_chunk_bytes: z.ZodNumber;
    application_principal: z.ZodString;
    intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"run">;
        run_id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"intake">;
        intake_ref: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>;
export type RuntimeArtifactReadySession = z.infer<typeof RuntimeArtifactReadySessionSchema>;
export declare const RuntimeArtifactCommittedSessionSchema: z.ZodObject<{
    session_id: z.ZodString;
    status: z.ZodLiteral<"committed">;
    artifact: z.ZodObject<{
        artifact_ref: z.ZodString;
        manifest_ref: z.ZodString;
        backend: z.ZodEnum<{
            filesystem: "filesystem";
            "s3-compatible": "s3-compatible";
        }>;
        content_hash: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        evidence_grade: z.ZodEnum<{
            original: "original";
            derived: "derived";
            "model-generated": "model-generated";
        }>;
        application_principal: z.ZodString;
        intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"run">;
            run_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"intake">;
            intake_ref: z.ZodString;
        }, z.core.$strict>], "kind">;
        provenance: z.ZodObject<{
            source: z.ZodString;
            source_event_id: z.ZodOptional<z.ZodString>;
            observed_at: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        created_at: z.ZodString;
        retention_expires_at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type RuntimeArtifactCommittedSession = z.infer<typeof RuntimeArtifactCommittedSessionSchema>;
export declare const RuntimeArtifactSessionStatusSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    session_id: z.ZodString;
    status: z.ZodLiteral<"ready">;
    offset: z.ZodNumber;
    expected_bytes: z.ZodNumber;
    expected_content_hash: z.ZodString;
    max_chunk_bytes: z.ZodNumber;
    application_principal: z.ZodString;
    intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"run">;
        run_id: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"intake">;
        intake_ref: z.ZodString;
    }, z.core.$strict>], "kind">;
}, z.core.$strict>, z.ZodObject<{
    session_id: z.ZodString;
    status: z.ZodLiteral<"committed">;
    artifact: z.ZodObject<{
        artifact_ref: z.ZodString;
        manifest_ref: z.ZodString;
        backend: z.ZodEnum<{
            filesystem: "filesystem";
            "s3-compatible": "s3-compatible";
        }>;
        content_hash: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        evidence_grade: z.ZodEnum<{
            original: "original";
            derived: "derived";
            "model-generated": "model-generated";
        }>;
        application_principal: z.ZodString;
        intended_use: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"run">;
            run_id: z.ZodString;
        }, z.core.$strict>, z.ZodObject<{
            kind: z.ZodLiteral<"intake">;
            intake_ref: z.ZodString;
        }, z.core.$strict>], "kind">;
        provenance: z.ZodObject<{
            source: z.ZodString;
            source_event_id: z.ZodOptional<z.ZodString>;
            observed_at: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        created_at: z.ZodString;
        retention_expires_at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>], "status">;
export type RuntimeArtifactSessionStatus = z.infer<typeof RuntimeArtifactSessionStatusSchema>;
/**
 * An operator's sweep of uncommitted uploads for the authenticated tenant.
 * The runtime raises a cutoff below the deployment's retention floor to that
 * floor, so a sweep never removes an upload younger than the floor (PUB-030).
 */
export declare const ArtifactSweepRequestSchema: z.ZodObject<{
    older_than_seconds: z.ZodNumber;
    reason: z.ZodString;
}, z.core.$strict>;
export type ArtifactSweepRequest = z.infer<typeof ArtifactSweepRequestSchema>;
/** What one tenant sweep removed, and the cutoff it applied after the retention floor. */
export declare const ArtifactSweepResultSchema: z.ZodObject<{
    cutoff: z.ZodString;
    retention_floor_seconds: z.ZodNumber;
    removed_staged_writes: z.ZodNumber;
    removed_uncommitted_objects: z.ZodNumber;
}, z.core.$strict>;
export type ArtifactSweepResult = z.infer<typeof ArtifactSweepResultSchema>;
/** Why a run export or import named an artifact without carrying its bytes (UAT-ART-013). */
export declare const ArtifactTransferOmissionSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    reason: z.ZodEnum<{
        "tenant-mismatch": "tenant-mismatch";
        "backend-mismatch": "backend-mismatch";
        "no-artifact-store": "no-artifact-store";
        erased: "erased";
        absent: "absent";
        "not-in-run": "not-in-run";
    }>;
}, z.core.$strict>;
export type ArtifactTransferOmission = z.infer<typeof ArtifactTransferOmissionSchema>;
/** One external or inline object that the exported run needs or names. */
export declare const RunStateClosureMemberSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    status: z.ZodLiteral<"present">;
    content_ref: z.ZodString;
    artifact_ref: z.ZodOptional<z.ZodString>;
    state_transfer_ref: z.ZodOptional<z.ZodString>;
    kind: z.ZodEnum<{
        publication: "publication";
        artifact: "artifact";
        memory: "memory";
        integrity: "integrity";
        workspace: "workspace";
        context: "context";
    }>;
    locator: z.ZodString;
    required: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"omitted">;
    reason: z.ZodString;
    kind: z.ZodEnum<{
        publication: "publication";
        artifact: "artifact";
        memory: "memory";
        integrity: "integrity";
        workspace: "workspace";
        context: "context";
    }>;
    locator: z.ZodString;
    required: z.ZodBoolean;
}, z.core.$strict>, z.ZodObject<{
    status: z.ZodLiteral<"unavailable">;
    reason: z.ZodString;
    kind: z.ZodEnum<{
        publication: "publication";
        artifact: "artifact";
        memory: "memory";
        integrity: "integrity";
        workspace: "workspace";
        context: "context";
    }>;
    locator: z.ZodString;
    required: z.ZodBoolean;
}, z.core.$strict>], "status">;
export type RunStateClosureMember = z.infer<typeof RunStateClosureMemberSchema>;
/** The exact frontier and referenced-state accounting sealed into one export. */
export declare const RunStateClosureManifestSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-run-state-closure/1">;
    run_id: z.ZodString;
    frontier: z.ZodObject<{
        record_count: z.ZodNumber;
        logical_clock: z.ZodNumber;
        record_id: z.ZodString;
        chain_head: z.ZodString;
        head_projection_hash: z.ZodString;
    }, z.core.$strict>;
    members: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        status: z.ZodLiteral<"present">;
        content_ref: z.ZodString;
        artifact_ref: z.ZodOptional<z.ZodString>;
        state_transfer_ref: z.ZodOptional<z.ZodString>;
        kind: z.ZodEnum<{
            publication: "publication";
            artifact: "artifact";
            memory: "memory";
            integrity: "integrity";
            workspace: "workspace";
            context: "context";
        }>;
        locator: z.ZodString;
        required: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"omitted">;
        reason: z.ZodString;
        kind: z.ZodEnum<{
            publication: "publication";
            artifact: "artifact";
            memory: "memory";
            integrity: "integrity";
            workspace: "workspace";
            context: "context";
        }>;
        locator: z.ZodString;
        required: z.ZodBoolean;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
        reason: z.ZodString;
        kind: z.ZodEnum<{
            publication: "publication";
            artifact: "artifact";
            memory: "memory";
            integrity: "integrity";
            workspace: "workspace";
            context: "context";
        }>;
        locator: z.ZodString;
        required: z.ZodBoolean;
    }, z.core.$strict>], "status">>;
    closure_ref: z.ZodString;
}, z.core.$strict>;
export type RunStateClosureManifest = z.infer<typeof RunStateClosureManifestSchema>;
/** One member's destination disposition after content verification and service import. */
export declare const RunStateRehydrationMemberSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        publication: "publication";
        artifact: "artifact";
        memory: "memory";
        integrity: "integrity";
        workspace: "workspace";
        context: "context";
    }>;
    locator: z.ZodString;
    required: z.ZodBoolean;
    status: z.ZodEnum<{
        omitted: "omitted";
        unavailable: "unavailable";
        rehydrated: "rehydrated";
        "present-inline": "present-inline";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type RunStateRehydrationMember = z.infer<typeof RunStateRehydrationMemberSchema>;
/** Rehydrate is true only when every required closure member is available at the destination. */
export declare const RunStateRehydrationReportSchema: z.ZodObject<{
    level: z.ZodLiteral<"rehydrate">;
    closure_ref: z.ZodString;
    rehydrated: z.ZodBoolean;
    members: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            publication: "publication";
            artifact: "artifact";
            memory: "memory";
            integrity: "integrity";
            workspace: "workspace";
            context: "context";
        }>;
        locator: z.ZodString;
        required: z.ZodBoolean;
        status: z.ZodEnum<{
            omitted: "omitted";
            unavailable: "unavailable";
            rehydrated: "rehydrated";
            "present-inline": "present-inline";
        }>;
        reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RunStateRehydrationReport = z.infer<typeof RunStateRehydrationReportSchema>;
/**
 * One artifact frame of a run export (UAT-ART-013): an artifact bundle for
 * one committed scope, a run id or intake:<ref>, with the handles it
 * carries, or the handles the export named without bytes.
 */
export declare const RunBundleArtifactFrameSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"artifact-bundle">;
    scope: z.ZodString;
    artifact_refs: z.ZodArray<z.ZodString>;
    text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"artifact-omissions">;
    omissions: z.ZodArray<z.ZodObject<{
        artifact_ref: z.ZodString;
        reason: z.ZodEnum<{
            "tenant-mismatch": "tenant-mismatch";
            "backend-mismatch": "backend-mismatch";
            "no-artifact-store": "no-artifact-store";
            erased: "erased";
            absent: "absent";
            "not-in-run": "not-in-run";
        }>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"state-transfer">;
    transfer_ref: z.ZodString;
    member_kind: z.ZodEnum<{
        publication: "publication";
        memory: "memory";
        workspace: "workspace";
    }>;
    tenant_ref: z.ZodString;
    locator: z.ZodString;
    media_type: z.ZodString;
    content_ref: z.ZodString;
    bytes: z.ZodNumber;
    content_base64: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"state-closure">;
    manifest: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-run-state-closure/1">;
        run_id: z.ZodString;
        frontier: z.ZodObject<{
            record_count: z.ZodNumber;
            logical_clock: z.ZodNumber;
            record_id: z.ZodString;
            chain_head: z.ZodString;
            head_projection_hash: z.ZodString;
        }, z.core.$strict>;
        members: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
            status: z.ZodLiteral<"present">;
            content_ref: z.ZodString;
            artifact_ref: z.ZodOptional<z.ZodString>;
            state_transfer_ref: z.ZodOptional<z.ZodString>;
            kind: z.ZodEnum<{
                publication: "publication";
                artifact: "artifact";
                memory: "memory";
                integrity: "integrity";
                workspace: "workspace";
                context: "context";
            }>;
            locator: z.ZodString;
            required: z.ZodBoolean;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"omitted">;
            reason: z.ZodString;
            kind: z.ZodEnum<{
                publication: "publication";
                artifact: "artifact";
                memory: "memory";
                integrity: "integrity";
                workspace: "workspace";
                context: "context";
            }>;
            locator: z.ZodString;
            required: z.ZodBoolean;
        }, z.core.$strict>, z.ZodObject<{
            status: z.ZodLiteral<"unavailable">;
            reason: z.ZodString;
            kind: z.ZodEnum<{
                publication: "publication";
                artifact: "artifact";
                memory: "memory";
                integrity: "integrity";
                workspace: "workspace";
                context: "context";
            }>;
            locator: z.ZodString;
            required: z.ZodBoolean;
        }, z.core.$strict>], "status">>;
        closure_ref: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"continuation-capsule">;
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
}, z.core.$strict>], "kind">;
export type RunBundleArtifactFrame = z.infer<typeof RunBundleArtifactFrameSchema>;
