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
import { ARTIFACT_BACKENDS, ARTIFACT_TRANSFER_OMISSIONS, EVIDENCE_GRADES, MEMORY_CLASSIFICATIONS, RUN_BUNDLE_ARTIFACT_FRAME_KINDS, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const sessionId = z.string().regex(/^artw_[0-9a-f]{32}$/, 'expected an artifact session id');
const mediaType = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
/** One immutable destination for the artifact after commit. */
export const RuntimeArtifactIntendedUseSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('run'), run_id: runId }),
    z.strictObject({ kind: z.literal('intake'), intake_ref: hash }),
]);
/** Caller-known origin facts. Authentication supplies the application principal. */
export const RuntimeArtifactProvenanceInputSchema = z.strictObject({
    source: z.string().min(1).max(256),
    source_event_id: z.string().min(1).max(512).optional(),
    observed_at: z.string().datetime().optional(),
});
/** Open one durable upload with its final content declared before bytes arrive. */
export const RuntimeArtifactSessionRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    expected_content_hash: hash,
    expected_bytes: z.number().int().positive().max(1_073_741_824),
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    provenance: RuntimeArtifactProvenanceInputSchema,
    intended_use: RuntimeArtifactIntendedUseSchema,
    retention_expires_at: z.string().datetime().nullable().optional(),
});
export const RuntimeArtifactManifestSchema = z.strictObject({
    artifact_ref: artifactHandle,
    manifest_ref: hash,
    backend: z.enum(ARTIFACT_BACKENDS),
    content_hash: hash,
    bytes: z.number().int().positive(),
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    application_principal: z.string().min(1).max(512),
    intended_use: RuntimeArtifactIntendedUseSchema,
    provenance: RuntimeArtifactProvenanceInputSchema,
    created_at: z.string().datetime(),
    retention_expires_at: z.string().datetime().nullable(),
});
/** Canonical notice that one run-bound artifact crossed verified commit. */
export const RuntimeArtifactCommittedRecordSchema = z.strictObject({
    idempotency_key: hash,
    artifact_ref: artifactHandle,
    manifest_ref: hash,
    content_hash: hash,
    bytes: z.number().int().positive(),
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    application_principal: z.string().min(1).max(512),
});
export const RuntimeArtifactReadySessionSchema = z.strictObject({
    session_id: sessionId,
    status: z.literal('ready'),
    offset: z.number().int().nonnegative(),
    expected_bytes: z.number().int().positive(),
    expected_content_hash: hash,
    max_chunk_bytes: z.number().int().positive(),
    application_principal: z.string().min(1).max(512),
    intended_use: RuntimeArtifactIntendedUseSchema,
});
export const RuntimeArtifactCommittedSessionSchema = z.strictObject({
    session_id: sessionId,
    status: z.literal('committed'),
    artifact: RuntimeArtifactManifestSchema,
});
export const RuntimeArtifactSessionStatusSchema = z.discriminatedUnion('status', [
    RuntimeArtifactReadySessionSchema,
    RuntimeArtifactCommittedSessionSchema,
]);
/**
 * An operator's sweep of uncommitted uploads for the authenticated tenant.
 * The runtime raises a cutoff below the deployment's retention floor to that
 * floor, so a sweep never removes an upload younger than the floor (PUB-030).
 */
export const ArtifactSweepRequestSchema = z.strictObject({
    older_than_seconds: z.number().int().positive().max(31_536_000),
    reason: z.string().min(1).max(500),
});
/** What one tenant sweep removed, and the cutoff it applied after the retention floor. */
export const ArtifactSweepResultSchema = z.strictObject({
    cutoff: z.string().datetime(),
    retention_floor_seconds: z.number().int().nonnegative(),
    removed_staged_writes: z.number().int().nonnegative(),
    removed_uncommitted_objects: z.number().int().nonnegative(),
});
/** Why a run export or import named an artifact without carrying its bytes (UAT-ART-013). */
export const ArtifactTransferOmissionSchema = z.strictObject({
    artifact_ref: artifactHandle,
    reason: z.enum(ARTIFACT_TRANSFER_OMISSIONS),
});
const [ARTIFACT_BUNDLE_FRAME, ARTIFACT_OMISSIONS_FRAME] = RUN_BUNDLE_ARTIFACT_FRAME_KINDS;
/**
 * One artifact frame of a run export (UAT-ART-013): an artifact bundle for
 * one committed scope, a run id or intake:<ref>, with the handles it
 * carries, or the handles the export named without bytes.
 */
export const RunBundleArtifactFrameSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal(ARTIFACT_BUNDLE_FRAME),
        scope: z.string().min(1).max(256),
        artifact_refs: z.array(artifactHandle).min(1),
        text: z.string().min(1),
    }),
    z.strictObject({
        kind: z.literal(ARTIFACT_OMISSIONS_FRAME),
        omissions: z.array(ArtifactTransferOmissionSchema).min(1),
    }),
]);
