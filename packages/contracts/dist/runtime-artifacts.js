import { z } from 'zod';
import { ARTIFACT_BACKENDS, ARTIFACT_TRANSFER_OMISSIONS, EVIDENCE_GRADES, MEMORY_CLASSIFICATIONS, RUN_BUNDLE_ARTIFACT_FRAME_KINDS, RUN_STATE_TRANSFER_KINDS, RUN_STATE_CLOSURE_MEMBER_KINDS, RUN_STATE_CLOSURE_MEMBER_STATUSES, RUN_STATE_REHYDRATION_STATUSES, } from "./vocab.js";
import { RunContinuationCapsuleSchema } from "./run-transfer.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const sessionId = z.string().regex(/^artw_[0-9a-f]{32}$/, 'expected an artifact session id');
const mediaType = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
export const RuntimeArtifactIntendedUseSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('run'), run_id: runId }),
    z.strictObject({ kind: z.literal('intake'), intake_ref: hash }),
]);
export const RuntimeArtifactProvenanceInputSchema = z.strictObject({
    source: z.string().min(1).max(256),
    source_event_id: z.string().min(1).max(512).optional(),
    observed_at: z.string().datetime().optional(),
});
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
export const ArtifactSweepRequestSchema = z.strictObject({
    older_than_seconds: z.number().int().positive().max(31_536_000),
    reason: z.string().min(1).max(500),
});
export const ArtifactSweepResultSchema = z.strictObject({
    cutoff: z.string().datetime(),
    retention_floor_seconds: z.number().int().nonnegative(),
    removed_staged_writes: z.number().int().nonnegative(),
    removed_uncommitted_objects: z.number().int().nonnegative(),
});
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
export const RunStateRehydrationMemberSchema = z.strictObject({
    kind: z.enum(RUN_STATE_CLOSURE_MEMBER_KINDS),
    locator: z.string().min(1).max(2_048),
    required: z.boolean(),
    status: z.enum(RUN_STATE_REHYDRATION_STATUSES),
    reason: z.string().min(1).max(1_000).optional(),
});
export const RunStateRehydrationReportSchema = z.strictObject({
    level: z.literal('rehydrate'),
    closure_ref: hash,
    rehydrated: z.boolean(),
    members: z.array(RunStateRehydrationMemberSchema),
});
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
