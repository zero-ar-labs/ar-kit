/**
 * Subject-scoped helpers for the public memory routes.
 *
 * What this is: a small SDK journey that binds one operator-selected subject
 * once, then delegates assertion, history, erasure and run-read operations to
 * the generated client. It adds no memory store and holds no key material.
 *
 * How it fits: applications use the same public routes as the CLI. Runtime
 * publication bindings still govern every model-visible memory operation.
 */
import type { ZeroARClient } from '@zero-ar/client';
import type { MemoryAssertionInput, MemoryReadRequest, MemorySubjectTransferBundle } from '@zero-ar/contracts';
type SubjectAssertion = Omit<MemoryAssertionInput, 'subject'>;
type SubjectRead = Omit<MemoryReadRequest, 'subject'>;
type PublicMemoryClient = Pick<ZeroARClient, 'writeMemoryAssertion' | 'supersedeMemoryAssertion' | 'readMemoryHistory' | 'eraseMemorySubject' | 'exportMemorySubject' | 'importMemorySubject' | 'readRunMemory'>;
export declare class SubjectMemory {
    private readonly client;
    readonly subject: string;
    constructor(client: PublicMemoryClient, subject: string);
    /** Admit one cited assertion for this subject through the public service. */
    assert(input: SubjectAssertion): Promise<{
        assertion_id: string;
        supports_recorded: number;
        watermark: {
            sequence: number;
            at: string | null;
        };
    }>;
    /** Replace one current assertion while preserving both identities in history. */
    supersede(assertion_id: string, replacement: SubjectAssertion): Promise<{
        superseded_assertion_id: string;
        replacement_assertion_id: string;
        watermark: {
            sequence: number;
            at: string | null;
        };
    }>;
    /** Read the subject's durable history for one predicate. */
    history(predicate: string): Promise<{
        subject: string;
        predicate: string;
        erased: boolean;
        assertions: {
            assertion_id: string;
            subject: string;
            predicate: string;
            object: string;
            writer: string;
            classification: "public" | "internal" | "confidential" | "restricted";
            valid_from: string;
            valid_to: string | null;
            recorded_at: string;
            state: "superseded" | "proposed" | "established" | "support-dead";
            superseded_by: string | null;
            support_ids: string[];
            live_supports: number;
            meaning: "established-means-live-support-only" | null;
        }[];
        redacted_records: {
            kind: "assertion.admitted" | "assertion.superseded" | "subject.erased";
            assertion_id: string | null;
            at: string;
        }[];
        watermark: {
            sequence: number;
            at: string | null;
        };
    }>;
    /** Erase the subject stream under the caller's already-authorized route. */
    erase(by: string, reason: string): Promise<{
        subject_ref: string;
        erased: boolean;
        records_redacted: number;
    }>;
    /** Export this subject's canonical encrypted stream and permitted wrapped custody rows. */
    exportTransfer(): Promise<{
        schema: "zero-ar-memory-subject-transfer/1";
        subject_ref: string;
        stream_id: string;
        watermark: {
            sequence: number;
            at: string | null;
        };
        record_count: number;
        canonical_log_bundle: string;
        key_material: {
            schema: "zero-ar-memory-subject-key-material/1";
            binding_ref: string;
            index_key: {
                wrapped_key: string;
                nonce: string;
                tag: string;
            };
            subject_key: {
                subject_ref: string;
                state: "erased" | "active";
                wrapped_key: string | null;
                nonce: string | null;
                tag: string | null;
            };
        };
        content_ref: string;
    }>;
    /** Import one verified transfer for this subject into a fresh compatible custody. */
    importTransfer(bundle: MemorySubjectTransferBundle): Promise<{
        subject_ref: string;
        stream_id: string;
        content_ref: string;
        watermark: {
            sequence: number;
            at: string | null;
        };
        records: number;
        erased: boolean;
    }>;
    /** Ask one run to perform its recorded memory read for this subject. */
    readForRun(run_id: string, input: SubjectRead): Promise<{
        run_id: string;
        query_ref: string;
        scope: "cross-run" | "session";
        status: "available" | "stale" | "unavailable";
        reason: string | null;
        read: {
            subject: string;
            predicate: string;
            valid_at: string;
            current: {
                assertion_id: string;
                subject: string;
                predicate: string;
                object: string;
                writer: string;
                classification: "public" | "internal" | "confidential" | "restricted";
                valid_from: string;
                valid_to: string | null;
                recorded_at: string;
                state: "superseded" | "proposed" | "established" | "support-dead";
                superseded_by: string | null;
                support_ids: string[];
                live_supports: number;
                meaning: "established-means-live-support-only" | null;
            }[];
            conflicts: {
                conflict_id: string;
                assertion_ids: string[];
            }[];
            unique_live_supports: number;
            watermark: {
                sequence: number;
                at: string | null;
            };
        } | null;
    }>;
}
/** Bind one subject to an SDK helper without creating a second service plane. */
export declare function memoryFor(client: PublicMemoryClient, subject: string): SubjectMemory;
export {};
