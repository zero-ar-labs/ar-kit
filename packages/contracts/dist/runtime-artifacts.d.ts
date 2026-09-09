/**
 * Runtime artifact ingest contracts.
 *
 * What this is: the public metadata, durable upload position and committed
 * handle a product backend uses for input or later run evidence. Raw chunks
 * travel on the binary route, so these schemas never turn large bytes into
 * JSON. Publication uploads use a separate contract and lifecycle.
 *
 * How it fits: the authenticated tenant and application principal come from
 * deployment, while the request declares content and intended use. Commit
 * returns a manifest only after the artifact store verifies both byte count
 * and hash.
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
