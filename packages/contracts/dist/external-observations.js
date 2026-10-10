import { z } from 'zod';
import { EXTERNAL_OBSERVATION_CHANNELS, IMAGE_MEDIA_TYPES, MEMORY_CLASSIFICATIONS, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const observationId = z.string().regex(/^obs_[0-9a-f]{32}$/, 'expected an observation id');
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
export const ExternalObservationContentSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('text'), text: z.string().min(1).max(100_000) }),
    z.strictObject({ kind: z.literal('data'), data: z.record(z.string(), z.unknown()) }),
]);
export const ExternalObservationArtifactSchema = z.strictObject({
    artifact_ref: artifactHandle,
    content_hash: hash,
});
export const ExternalObservationRecordedArtifactSchema = ExternalObservationArtifactSchema.extend({
    media_type: z.enum(IMAGE_MEDIA_TYPES).optional(),
    bytes: z.number().int().min(1).optional(),
});
export const ExternalObservationProvenanceSchema = z.strictObject({
    source: z.string().min(1).max(256),
    trace_ref: z.string().min(1).max(512).optional(),
    claimed_actor: z.string().min(1).max(512).optional(),
});
export const ExternalObservationRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    source: z.strictObject({
        channel: z.enum(EXTERNAL_OBSERVATION_CHANNELS),
        event_id: z.string().min(1).max(512),
    }),
    observed_at: z.string().datetime(),
    content: ExternalObservationContentSchema,
    artifacts: z.array(ExternalObservationArtifactSchema).max(100).default([]),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    provenance: ExternalObservationProvenanceSchema,
});
export const VerifiedRepresentedActorSchema = z.strictObject({
    subject: z.string().min(1).max(512),
    issuer: z.string().url().max(2_048),
    audience: z.string().min(1).max(512),
    claims_ref: hash,
    credential_id: z.string().min(1).max(512).nullable(),
});
export const ExternalObservationRecordedSchema = z.strictObject({
    observation_id: observationId,
    idempotency_key: z.string().min(1).max(256),
    request_fingerprint: hash,
    source: ExternalObservationRequestSchema.shape.source,
    observed_at: z.string().datetime(),
    received_at: z.string().datetime(),
    content: ExternalObservationContentSchema,
    artifacts: z.array(ExternalObservationRecordedArtifactSchema).max(100),
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    provenance: ExternalObservationProvenanceSchema,
    application_principal: z.string().min(1).max(512),
    represented_actor: VerifiedRepresentedActorSchema.nullable(),
});
export const ExternalObservationAppliedSchema = z.strictObject({
    observation_id: observationId,
    idempotency_key: z.string().min(1).max(256),
    entry_id: z.string().regex(/^ent_[0-9a-f]{32}$/, 'expected an entry id'),
});
export const ExternalObservationAcceptedSchema = z.strictObject({
    run_id: runId,
    observation_id: observationId,
    accepted_seq: z.number().int().positive(),
    received_at: z.string().datetime(),
    application_principal: z.string().min(1).max(512),
    represented_actor: VerifiedRepresentedActorSchema.nullable(),
});
