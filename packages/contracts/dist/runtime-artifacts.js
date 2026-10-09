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
import { ARTIFACT_BACKENDS, ARTIFACT_TRANSFER_OMISSIONS, EVIDENCE_GRADES, MEMORY_CLASSIFICATIONS, RUN_BUNDLE_ARTIFACT_FRAME_KINDS, RUN_STATE_TRANSFER_KINDS, RUN_STATE_CLOSURE_MEMBER_KINDS, RUN_STATE_CLOSURE_MEMBER_STATUSES, RUN_STATE_REHYDRATION_STATUSES, } from "./vocab.js";
import { RunContinuationCapsuleSchema } from "./run-transfer.js";
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
const [ARTIFACT_BUNDLE_FRAME, ARTIFACT_OMISSIONS_FRAME, STATE_TRANSFER_FRAME, STATE_CLOSURE_FRAME, CONTINUATION_CAPSULE_FRAME] = RUN_BUNDLE_ARTIFACT_FRAME_KINDS;
const stateClosureMemberBase = {
    kind: z.enum(RUN_STATE_CLOSURE_MEMBER_KINDS),
    locator: z.string().min(1).max(2_048),
    required: z.boolean(),
};
/** One external or inline object that the exported run needs or names. */
export const RunStateClosureMemberSchema = z.discriminatedUnion('status', [
    z.strictObject({
        ...stateClosureMemberBase,
        status: z.literal(RUN_STATE_CLOSURE_MEMBER_STATUSES[0]),
        content_ref: hash,
        artifact_ref: artifactHandle.optional(),
        state_transfer_ref: hash.optional(),
    }),
    z.strictObject({
        ...stateClosureMemberBase,
        status: z.literal(RUN_STATE_CLOSURE_MEMBER_STATUSES[1]),
        reason: z.string().min(1).max(1_000),
    }),
    z.strictObject({
        ...stateClosureMemberBase,
        status: z.literal(RUN_STATE_CLOSURE_MEMBER_STATUSES[2]),
        reason: z.string().min(1).max(1_000),
    }),
]);
/** The exact frontier and referenced-state accounting sealed into one export. */
export const RunStateClosureManifestSchema = z.strictObject({
    schema: z.literal('zero-ar-run-state-closure/1'),
    run_id: runId,
    frontier: z.strictObject({
        record_count: z.number().int().positive(),
        logical_clock: z.number().int().nonnegative(),
        record_id: z.string().regex(/^rec_[0-9a-f]{32}$/),
        chain_head: hash,
        head_projection_hash: hash,
    }),
    members: z.array(RunStateClosureMemberSchema),
    closure_ref: hash,
});
/** One member's destination disposition after content verification and service import. */
export const RunStateRehydrationMemberSchema = z.strictObject({
    kind: z.enum(RUN_STATE_CLOSURE_MEMBER_KINDS),
    locator: z.string().min(1).max(2_048),
    required: z.boolean(),
    status: z.enum(RUN_STATE_REHYDRATION_STATUSES),
    reason: z.string().min(1).max(1_000).optional(),
});
/** Rehydrate is true only when every required closure member is available at the destination. */
export const RunStateRehydrationReportSchema = z.strictObject({
    level: z.literal('rehydrate'),
    closure_ref: hash,
    rehydrated: z.boolean(),
    members: z.array(RunStateRehydrationMemberSchema),
});
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
    z.strictObject({
        kind: z.literal(STATE_TRANSFER_FRAME),
        transfer_ref: hash,
        member_kind: z.enum(RUN_STATE_TRANSFER_KINDS),
        tenant_ref: hash,
        locator: z.string().min(1).max(2_048),
        media_type: z.string().min(1).max(256),
        content_ref: hash,
        bytes: z.number().int().nonnegative(),
        content_base64: z.string(),
    }),
    z.strictObject({
        kind: z.literal(STATE_CLOSURE_FRAME),
        manifest: RunStateClosureManifestSchema,
    }),
    z.strictObject({
        kind: z.literal(CONTINUATION_CAPSULE_FRAME),
        capsule: RunContinuationCapsuleSchema,
    }),
]);
