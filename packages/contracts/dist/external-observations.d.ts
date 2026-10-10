import { z } from 'zod';
export declare const ExternalObservationContentSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"text">;
    text: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"data">;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strict>], "kind">;
export type ExternalObservationContent = z.infer<typeof ExternalObservationContentSchema>;
export declare const ExternalObservationArtifactSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
}, z.core.$strict>;
export type ExternalObservationArtifact = z.infer<typeof ExternalObservationArtifactSchema>;
export declare const ExternalObservationRecordedArtifactSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    media_type: z.ZodOptional<z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "image/webp": "image/webp";
        "image/gif": "image/gif";
    }>>;
    bytes: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type ExternalObservationRecordedArtifact = z.infer<typeof ExternalObservationRecordedArtifactSchema>;
export declare const ExternalObservationProvenanceSchema: z.ZodObject<{
    source: z.ZodString;
    trace_ref: z.ZodOptional<z.ZodString>;
    claimed_actor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ExternalObservationProvenance = z.infer<typeof ExternalObservationProvenanceSchema>;
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
export declare const VerifiedRepresentedActorSchema: z.ZodObject<{
    subject: z.ZodString;
    issuer: z.ZodString;
    audience: z.ZodString;
    claims_ref: z.ZodString;
    credential_id: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type VerifiedRepresentedActor = z.infer<typeof VerifiedRepresentedActorSchema>;
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
        media_type: z.ZodOptional<z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
            "image/webp": "image/webp";
            "image/gif": "image/gif";
        }>>;
        bytes: z.ZodOptional<z.ZodNumber>;
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
export declare const ExternalObservationAppliedSchema: z.ZodObject<{
    observation_id: z.ZodString;
    idempotency_key: z.ZodString;
    entry_id: z.ZodString;
}, z.core.$strict>;
export type ExternalObservationApplied = z.infer<typeof ExternalObservationAppliedSchema>;
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
