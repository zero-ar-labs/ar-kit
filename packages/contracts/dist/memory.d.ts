/**
 * Public contracts for the optional cross-run memory service.
 *
 * Assertions carry cited support, valid time, classification, transaction
 * time and explicit state. Run-owned reads report watermarks and degrade to
 * session scope when the optional service is missing or stale (MEM-001
 * through MEM-010, XCV-016).
 */
import { z } from 'zod';
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
        proposed: "proposed";
        established: "established";
        superseded: "superseded";
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
            proposed: "proposed";
            established: "established";
            superseded: "superseded";
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
            proposed: "proposed";
            established: "established";
            superseded: "superseded";
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
        available: "available";
        unavailable: "unavailable";
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
                proposed: "proposed";
                established: "established";
                superseded: "superseded";
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
/** The attachable service port. HTTP routes and the kernel depend on this contract only. */
export interface MemoryServicePort {
    assert(input: MemoryAssertionInput): Promise<MemoryWriteOutcome>;
    supersede(assertion_id: string, request: MemorySupersedeRequest): Promise<MemorySupersedeOutcome>;
    read(input: MemoryReadRequest): Promise<MemoryReadResponse>;
    history(input: MemoryHistoryRequest): Promise<MemoryHistoryResponse>;
    erase(input: MemorySubjectErasureRequest): Promise<MemorySubjectErasureOutcome>;
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
