/**
 * External observation contracts.
 *
 * What this is: the bounded command a product backend uses to add later
 * participant context to an existing run, plus the canonical acceptance it
 * receives. The application credential stays in Authorization and an optional
 * participant JWT travels in its own header, so neither credential is stored.
 *
 * How it fits: the runtime records one typed observation and queues its content
 * for the next model turn. It never accepts a caller-selected record type and
 * never treats an observation as an answer or an effect approval.
 */
import { z } from 'zod';
/** Text and structured JSON are separate so a model-visible rendering is deterministic. */
export declare const ExternalObservationContentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"data">;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>], "kind">;
export type ExternalObservationContent = z.infer<typeof ExternalObservationContentSchema>;
/** A committed artifact is pinned by both handle and expected content digest. */
export declare const ExternalObservationArtifactSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
}, z.core.$strict>;
export type ExternalObservationArtifact = z.infer<typeof ExternalObservationArtifactSchema>;
/** Caller-owned provenance remains information and grants no authority. */
export declare const ExternalObservationProvenanceSchema: z.ZodObject<{
    source: z.ZodString;
    trace_ref: z.ZodOptional<z.ZodString>;
    claimed_actor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ExternalObservationProvenance = z.infer<typeof ExternalObservationProvenanceSchema>;
/** The public command. Received time and authenticated identities are server-owned. */
export declare const ExternalObservationRequestSchema: z.ZodObject<{
    idempotency_key: z.ZodString;
    source: z.ZodObject<{
        channel: z.ZodEnum<{
            system: "system";
            web: "web";
            mobile: "mobile";
            voice: "voice";
            sms: "sms";
            email: "email";
            chat: "chat";
            other: "other";
        }>;
        event_id: z.ZodString;
    }, z.core.$strict>;
    observed_at: z.ZodString;
    content: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>], "kind">;
    artifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        artifact_ref: z.ZodString;
        content_hash: z.ZodString;
    }, z.core.$strict>>>;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        trace_ref: z.ZodOptional<z.ZodString>;
        claimed_actor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type ExternalObservationRequest = z.infer<typeof ExternalObservationRequestSchema>;
/** Identity derived from a verified participant credential, never request prose. */
export declare const VerifiedRepresentedActorSchema: z.ZodObject<{
    subject: z.ZodString;
    issuer: z.ZodString;
    audience: z.ZodString;
    claims_ref: z.ZodString;
    credential_id: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VerifiedRepresentedActor = z.infer<typeof VerifiedRepresentedActorSchema>;
/** The durable payload selected by the engine after authentication and artifact checks. */
export declare const ExternalObservationRecordedSchema: z.ZodObject<{
    observation_id: z.ZodString;
    idempotency_key: z.ZodString;
    request_fingerprint: z.ZodString;
    source: z.ZodObject<{
        channel: z.ZodEnum<{
            system: "system";
            web: "web";
            mobile: "mobile";
            voice: "voice";
            sms: "sms";
            email: "email";
            chat: "chat";
            other: "other";
        }>;
        event_id: z.ZodString;
    }, z.core.$strict>;
    observed_at: z.ZodString;
    received_at: z.ZodString;
    content: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"text">;
        text: z.ZodString;
    }, z.core.$strict>, z.ZodObject<{
        kind: z.ZodLiteral<"data">;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    }, z.core.$strict>], "kind">;
    artifacts: z.ZodArray<z.ZodObject<{
        artifact_ref: z.ZodString;
        content_hash: z.ZodString;
    }, z.core.$strict>>;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    provenance: z.ZodObject<{
        source: z.ZodString;
        trace_ref: z.ZodOptional<z.ZodString>;
        claimed_actor: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    application_principal: z.ZodString;
    represented_actor: z.ZodNullable<z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ExternalObservationRecorded = z.infer<typeof ExternalObservationRecordedSchema>;
/** The turn-boundary record that links accepted data to its model-visible entry. */
export declare const ExternalObservationAppliedSchema: z.ZodObject<{
    observation_id: z.ZodString;
    idempotency_key: z.ZodString;
    entry_id: z.ZodString;
}, z.core.$strict>;
export type ExternalObservationApplied = z.infer<typeof ExternalObservationAppliedSchema>;
/** Stable acceptance returned on the first request and every exact retry. */
export declare const ExternalObservationAcceptedSchema: z.ZodObject<{
    run_id: z.ZodString;
    observation_id: z.ZodString;
    accepted_seq: z.ZodNumber;
    received_at: z.ZodString;
    application_principal: z.ZodString;
    represented_actor: z.ZodNullable<z.ZodObject<{
        subject: z.ZodString;
        issuer: z.ZodString;
        audience: z.ZodString;
        claims_ref: z.ZodString;
        credential_id: z.ZodNullable<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ExternalObservationAccepted = z.infer<typeof ExternalObservationAcceptedSchema>;
