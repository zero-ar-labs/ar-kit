/**
 * Public contracts for the optional cross-run memory service.
 *
 * Assertions carry cited support, valid time, classification, transaction
 * time and explicit state. Run-owned reads report watermarks and degrade to
 * session scope when the optional service is missing or stale (MEM-001
 * through MEM-010, XCV-016).
 */
import { z } from 'zod';
import type { MemoryClassification } from './vocab.js';
/** The publication-owned policy that makes one narrow memory subject available to a run. */
export declare const MemoryBindingSchema: z.ZodObject<{
    name: z.ZodString;
    subject: z.ZodObject<{
        from_intake: z.ZodString;
        namespace: z.ZodString;
    }, z.core.$strict>;
    predicates: z.ZodArray<z.ZodString>;
    read: z.ZodEnum<{
        "on-demand": "on-demand";
        "at-intake": "at-intake";
        disabled: "disabled";
    }>;
    write: z.ZodEnum<{
        none: "none";
        "propose-after-verification": "propose-after-verification";
        "human-approved": "human-approved";
    }>;
    availability: z.ZodEnum<{
        optional: "optional";
        required: "required";
    }>;
    classification_ceiling: z.ZodDefault<z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>>;
    maximum_assertions_per_read: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type MemoryBinding = z.infer<typeof MemoryBindingSchema>;
/** One published binding resolved against authenticated intake and pinned into run identity. */
export declare const ResolvedMemoryBindingSchema: z.ZodObject<{
    name: z.ZodString;
    predicates: z.ZodArray<z.ZodString>;
    read: z.ZodEnum<{
        "on-demand": "on-demand";
        "at-intake": "at-intake";
        disabled: "disabled";
    }>;
    write: z.ZodEnum<{
        none: "none";
        "propose-after-verification": "propose-after-verification";
        "human-approved": "human-approved";
    }>;
    availability: z.ZodEnum<{
        optional: "optional";
        required: "required";
    }>;
    classification_ceiling: z.ZodDefault<z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>>;
    maximum_assertions_per_read: z.ZodDefault<z.ZodNumber>;
    binding_ref: z.ZodString;
    tenant: z.ZodString;
    subject: z.ZodObject<{
        from_intake: z.ZodString;
        namespace: z.ZodString;
        resolved: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ResolvedMemoryBinding = z.infer<typeof ResolvedMemoryBindingSchema>;
/** The bounded model request. Tenant and subject are absent by construction (MSH-003). */
export declare const ModelMemoryReadRequestSchema: z.ZodObject<{
    binding: z.ZodString;
    predicate: z.ZodString;
    valid_at: z.ZodString;
    minimum_watermark: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ModelMemoryReadRequest = z.infer<typeof ModelMemoryReadRequestSchema>;
/** A run-owned proposal. Its cited spans must resolve through the current run before admission. */
export declare const ModelMemoryProposalSchema: z.ZodObject<{
    binding: z.ZodString;
    predicate: z.ZodString;
    object: z.ZodString;
    valid_from: z.ZodString;
    valid_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    supports: z.ZodArray<z.ZodObject<{
        source_id: z.ZodString;
        span_hash: z.ZodString;
        locator: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ModelMemoryProposal = z.infer<typeof ModelMemoryProposalSchema>;
export declare const MemoryAssertionInputSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodString;
    object: z.ZodString;
    writer: z.ZodString;
    valid_from: z.ZodString;
    valid_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    supports: z.ZodArray<z.ZodObject<{
        source_id: z.ZodString;
        span_hash: z.ZodString;
        locator: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type MemoryAssertionInput = z.infer<typeof MemoryAssertionInputSchema>;
export declare const MemoryAssertionSchema: z.ZodObject<{
    assertion_id: z.ZodString;
    subject: z.ZodString;
    predicate: z.ZodString;
    object: z.ZodString;
    writer: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    valid_from: z.ZodString;
    valid_to: z.ZodNullable<z.ZodString>;
    recorded_at: z.ZodString;
    state: z.ZodEnum<{
        superseded: "superseded";
        proposed: "proposed";
        established: "established";
        "support-dead": "support-dead";
    }>;
    superseded_by: z.ZodNullable<z.ZodString>;
    support_ids: z.ZodArray<z.ZodString>;
    live_supports: z.ZodNumber;
    meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
}, z.core.$strict>;
export type MemoryAssertion = z.infer<typeof MemoryAssertionSchema>;
export declare const MemoryWatermarkSchema: z.ZodObject<{
    sequence: z.ZodNumber;
    at: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type MemoryWatermark = z.infer<typeof MemoryWatermarkSchema>;
export declare const MemoryReadRequestSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodString;
    valid_at: z.ZodString;
    minimum_watermark: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type MemoryReadRequest = z.infer<typeof MemoryReadRequestSchema>;
export declare const MemoryReadResponseSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodString;
    valid_at: z.ZodString;
    current: z.ZodArray<z.ZodObject<{
        assertion_id: z.ZodString;
        subject: z.ZodString;
        predicate: z.ZodString;
        object: z.ZodString;
        writer: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        valid_from: z.ZodString;
        valid_to: z.ZodNullable<z.ZodString>;
        recorded_at: z.ZodString;
        state: z.ZodEnum<{
            superseded: "superseded";
            proposed: "proposed";
            established: "established";
            "support-dead": "support-dead";
        }>;
        superseded_by: z.ZodNullable<z.ZodString>;
        support_ids: z.ZodArray<z.ZodString>;
        live_supports: z.ZodNumber;
        meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
    }, z.core.$strict>>;
    conflicts: z.ZodArray<z.ZodObject<{
        conflict_id: z.ZodString;
        assertion_ids: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    unique_live_supports: z.ZodNumber;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemoryReadResponse = z.infer<typeof MemoryReadResponseSchema>;
export declare const MemoryWriteOutcomeSchema: z.ZodObject<{
    assertion_id: z.ZodString;
    supports_recorded: z.ZodNumber;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemoryWriteOutcome = z.infer<typeof MemoryWriteOutcomeSchema>;
/** Additional admission bounds supplied by a publication-owned proposal path. */
export interface MemoryAssertionAdmission {
    classification_ceiling?: MemoryClassification;
}
export declare const MemorySupersedeRequestSchema: z.ZodObject<{
    replacement: z.ZodObject<{
        subject: z.ZodString;
        predicate: z.ZodString;
        object: z.ZodString;
        writer: z.ZodString;
        valid_from: z.ZodString;
        valid_to: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        supports: z.ZodArray<z.ZodObject<{
            source_id: z.ZodString;
            span_hash: z.ZodString;
            locator: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemorySupersedeRequest = z.infer<typeof MemorySupersedeRequestSchema>;
export declare const MemorySupersedeOutcomeSchema: z.ZodObject<{
    superseded_assertion_id: z.ZodString;
    replacement_assertion_id: z.ZodString;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemorySupersedeOutcome = z.infer<typeof MemorySupersedeOutcomeSchema>;
export declare const MemoryHistoryRequestSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodString;
}, z.core.$strict>;
export type MemoryHistoryRequest = z.infer<typeof MemoryHistoryRequestSchema>;
export declare const MemoryHistoryResponseSchema: z.ZodObject<{
    subject: z.ZodString;
    predicate: z.ZodString;
    erased: z.ZodBoolean;
    assertions: z.ZodArray<z.ZodObject<{
        assertion_id: z.ZodString;
        subject: z.ZodString;
        predicate: z.ZodString;
        object: z.ZodString;
        writer: z.ZodString;
        classification: z.ZodEnum<{
            public: "public";
            internal: "internal";
            confidential: "confidential";
            restricted: "restricted";
        }>;
        valid_from: z.ZodString;
        valid_to: z.ZodNullable<z.ZodString>;
        recorded_at: z.ZodString;
        state: z.ZodEnum<{
            superseded: "superseded";
            proposed: "proposed";
            established: "established";
            "support-dead": "support-dead";
        }>;
        superseded_by: z.ZodNullable<z.ZodString>;
        support_ids: z.ZodArray<z.ZodString>;
        live_supports: z.ZodNumber;
        meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
    }, z.core.$strict>>;
    redacted_records: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            "assertion.admitted": "assertion.admitted";
            "assertion.superseded": "assertion.superseded";
            "subject.erased": "subject.erased";
        }>;
        assertion_id: z.ZodNullable<z.ZodString>;
        at: z.ZodString;
    }, z.core.$strict>>;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemoryHistoryResponse = z.infer<typeof MemoryHistoryResponseSchema>;
export declare const MemorySubjectErasureRequestSchema: z.ZodObject<{
    subject: z.ZodString;
    by: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type MemorySubjectErasureRequest = z.infer<typeof MemorySubjectErasureRequestSchema>;
export declare const MemorySubjectErasureOutcomeSchema: z.ZodObject<{
    subject_ref: z.ZodString;
    erased: z.ZodBoolean;
    records_redacted: z.ZodNumber;
}, z.core.$strict>;
export type MemorySubjectErasureOutcome = z.infer<typeof MemorySubjectErasureOutcomeSchema>;
export declare const RunMemoryReadOutcomeSchema: z.ZodObject<{
    run_id: z.ZodString;
    query_ref: z.ZodString;
    scope: z.ZodEnum<{
        "cross-run": "cross-run";
        session: "session";
    }>;
    status: z.ZodEnum<{
        stale: "stale";
        unavailable: "unavailable";
        available: "available";
    }>;
    reason: z.ZodNullable<z.ZodString>;
    read: z.ZodNullable<z.ZodObject<{
        subject: z.ZodString;
        predicate: z.ZodString;
        valid_at: z.ZodString;
        current: z.ZodArray<z.ZodObject<{
            assertion_id: z.ZodString;
            subject: z.ZodString;
            predicate: z.ZodString;
            object: z.ZodString;
            writer: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            valid_from: z.ZodString;
            valid_to: z.ZodNullable<z.ZodString>;
            recorded_at: z.ZodString;
            state: z.ZodEnum<{
                superseded: "superseded";
                proposed: "proposed";
                established: "established";
                "support-dead": "support-dead";
            }>;
            superseded_by: z.ZodNullable<z.ZodString>;
            support_ids: z.ZodArray<z.ZodString>;
            live_supports: z.ZodNumber;
            meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
        }, z.core.$strict>>;
        conflicts: z.ZodArray<z.ZodObject<{
            conflict_id: z.ZodString;
            assertion_ids: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        unique_live_supports: z.ZodNumber;
        watermark: z.ZodObject<{
            sequence: z.ZodNumber;
            at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RunMemoryReadOutcome = z.infer<typeof RunMemoryReadOutcomeSchema>;
/** Exact model-visible memory bytes before subject-key sealing and artifact storage. */
export declare const MemoryReadEnvelopeSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-memory-read-envelope/1">;
    run_id: z.ZodString;
    binding_ref: z.ZodString;
    query_ref: z.ZodString;
    subject_ref: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    read: z.ZodObject<{
        subject: z.ZodString;
        predicate: z.ZodString;
        valid_at: z.ZodString;
        current: z.ZodArray<z.ZodObject<{
            assertion_id: z.ZodString;
            subject: z.ZodString;
            predicate: z.ZodString;
            object: z.ZodString;
            writer: z.ZodString;
            classification: z.ZodEnum<{
                public: "public";
                internal: "internal";
                confidential: "confidential";
                restricted: "restricted";
            }>;
            valid_from: z.ZodString;
            valid_to: z.ZodNullable<z.ZodString>;
            recorded_at: z.ZodString;
            state: z.ZodEnum<{
                superseded: "superseded";
                proposed: "proposed";
                established: "established";
                "support-dead": "support-dead";
            }>;
            superseded_by: z.ZodNullable<z.ZodString>;
            support_ids: z.ZodArray<z.ZodString>;
            live_supports: z.ZodNumber;
            meaning: z.ZodNullable<z.ZodLiteral<"established-means-live-support-only">>;
        }, z.core.$strict>>;
        conflicts: z.ZodArray<z.ZodObject<{
            conflict_id: z.ZodString;
            assertion_ids: z.ZodArray<z.ZodString>;
        }, z.core.$strict>>;
        unique_live_supports: z.ZodNumber;
        watermark: z.ZodObject<{
            sequence: z.ZodNumber;
            at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    created_at: z.ZodString;
}, z.core.$strict>;
export type MemoryReadEnvelope = z.infer<typeof MemoryReadEnvelopeSchema>;
/** Subject-key-sealed bytes stored by the artifact backend for one exact read envelope. */
export declare const ProtectedMemoryReadEnvelopeSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-protected-memory-read-envelope/1">;
    subject_ref: z.ZodString;
    content_hash: z.ZodString;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    nonce: z.ZodString;
    ciphertext: z.ZodString;
    tag: z.ZodString;
}, z.core.$strict>;
export type ProtectedMemoryReadEnvelope = z.infer<typeof ProtectedMemoryReadEnvelopeSchema>;
/** One durable key row as stored under a deployment wrapping key. */
export declare const MemoryWrappedKeySchema: z.ZodObject<{
    wrapped_key: z.ZodString;
    nonce: z.ZodString;
    tag: z.ZodString;
}, z.core.$strict>;
export type MemoryWrappedKey = z.infer<typeof MemoryWrappedKeySchema>;
/** The encrypted custody rows explicitly permitted to travel with one subject stream. */
export declare const MemorySubjectKeyMaterialSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-memory-subject-key-material/1">;
    binding_ref: z.ZodString;
    index_key: z.ZodObject<{
        wrapped_key: z.ZodString;
        nonce: z.ZodString;
        tag: z.ZodString;
    }, z.core.$strict>;
    subject_key: z.ZodObject<{
        subject_ref: z.ZodString;
        state: z.ZodEnum<{
            erased: "erased";
            active: "active";
        }>;
        wrapped_key: z.ZodNullable<z.ZodString>;
        nonce: z.ZodNullable<z.ZodString>;
        tag: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemorySubjectKeyMaterial = z.infer<typeof MemorySubjectKeyMaterialSchema>;
/** One content-addressed subject transfer. The subject itself travels only in the authorized request. */
export declare const MemorySubjectTransferBundleSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-memory-subject-transfer/1">;
    subject_ref: z.ZodString;
    stream_id: z.ZodString;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    record_count: z.ZodNumber;
    canonical_log_bundle: z.ZodString;
    key_material: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-memory-subject-key-material/1">;
        binding_ref: z.ZodString;
        index_key: z.ZodObject<{
            wrapped_key: z.ZodString;
            nonce: z.ZodString;
            tag: z.ZodString;
        }, z.core.$strict>;
        subject_key: z.ZodObject<{
            subject_ref: z.ZodString;
            state: z.ZodEnum<{
                erased: "erased";
                active: "active";
            }>;
            wrapped_key: z.ZodNullable<z.ZodString>;
            nonce: z.ZodNullable<z.ZodString>;
            tag: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
    }, z.core.$strict>;
    content_ref: z.ZodString;
}, z.core.$strict>;
export type MemorySubjectTransferBundle = z.infer<typeof MemorySubjectTransferBundleSchema>;
export declare const MemorySubjectTransferRequestSchema: z.ZodObject<{
    subject: z.ZodString;
}, z.core.$strict>;
export type MemorySubjectTransferRequest = z.infer<typeof MemorySubjectTransferRequestSchema>;
export declare const MemorySubjectImportRequestSchema: z.ZodObject<{
    subject: z.ZodString;
    bundle: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-memory-subject-transfer/1">;
        subject_ref: z.ZodString;
        stream_id: z.ZodString;
        watermark: z.ZodObject<{
            sequence: z.ZodNumber;
            at: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>;
        record_count: z.ZodNumber;
        canonical_log_bundle: z.ZodString;
        key_material: z.ZodObject<{
            schema: z.ZodLiteral<"zero-ar-memory-subject-key-material/1">;
            binding_ref: z.ZodString;
            index_key: z.ZodObject<{
                wrapped_key: z.ZodString;
                nonce: z.ZodString;
                tag: z.ZodString;
            }, z.core.$strict>;
            subject_key: z.ZodObject<{
                subject_ref: z.ZodString;
                state: z.ZodEnum<{
                    erased: "erased";
                    active: "active";
                }>;
                wrapped_key: z.ZodNullable<z.ZodString>;
                nonce: z.ZodNullable<z.ZodString>;
                tag: z.ZodNullable<z.ZodString>;
            }, z.core.$strict>;
        }, z.core.$strict>;
        content_ref: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type MemorySubjectImportRequest = z.infer<typeof MemorySubjectImportRequestSchema>;
export declare const MemorySubjectImportOutcomeSchema: z.ZodObject<{
    subject_ref: z.ZodString;
    stream_id: z.ZodString;
    content_ref: z.ZodString;
    watermark: z.ZodObject<{
        sequence: z.ZodNumber;
        at: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>;
    records: z.ZodNumber;
    erased: z.ZodBoolean;
}, z.core.$strict>;
export type MemorySubjectImportOutcome = z.infer<typeof MemorySubjectImportOutcomeSchema>;
/** The attachable service port. HTTP routes and the kernel depend on this contract only. */
export interface MemoryServicePort {
    assert(input: MemoryAssertionInput, admission?: MemoryAssertionAdmission): Promise<MemoryWriteOutcome>;
    supersede(assertion_id: string, request: MemorySupersedeRequest): Promise<MemorySupersedeOutcome>;
    read(input: MemoryReadRequest): Promise<MemoryReadResponse>;
    history(input: MemoryHistoryRequest): Promise<MemoryHistoryResponse>;
    erase(input: MemorySubjectErasureRequest): Promise<MemorySubjectErasureOutcome>;
    /** Return the deployment-keyed subject reference without disclosing the subject. */
    subjectReference(subject: string): Promise<string>;
    /** Seal one exact model-visible read under the subject key before artifact storage. */
    sealEnvelope(subject: string, envelope: MemoryReadEnvelope): Promise<ProtectedMemoryReadEnvelope>;
    /** Open a stored envelope only while the same subject key remains live. */
    openEnvelope(subject: string, envelope: ProtectedMemoryReadEnvelope): Promise<MemoryReadEnvelope>;
    /** Export one canonical encrypted subject stream and only its wrapped custody rows. */
    exportSubject(subject: string): Promise<MemorySubjectTransferBundle>;
    /** Import one verified subject transfer into a fresh stream and matching durable custody. */
    importSubject(subject: string, bundle: MemorySubjectTransferBundle): Promise<MemorySubjectImportOutcome>;
    probe?(): Promise<'ready' | 'unreachable'>;
}
export interface MemoryFoldAssertion extends MemoryAssertionInput {
    assertion_id: string;
    classification: z.infer<typeof MemoryAssertionSchema>['classification'];
    recorded_at: string;
    support_ids: string[];
}
export type MemoryFoldEvent = {
    kind: 'assertion.admitted';
    assertion: MemoryFoldAssertion;
} | {
    kind: 'assertion.superseded';
    assertion_id: string;
    replacement_assertion_id: string;
} | {
    kind: 'subject.erased';
    by: string;
    reason: string;
    at: string;
};
