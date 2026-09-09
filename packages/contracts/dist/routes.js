/**
 * The public route table.
 *
 * What this is: every route the server offers and every client speaks,
 * declared once with its method, path, transport kind, and the registry
 * names of its request and response shapes. The client module is generated
 * from this table, and the parity vector drives a live server through all
 * of it (XCV-003).
 *
 * How it fits: a surface that needs an operation absent from this table
 * blocks until the contract exists (ERD 9.1). Adding a row here and
 * regenerating is the whole procedure for a new route; a hand-edited
 * client drifts from this table and the drift check refuses it.
 */
import { ASSURANCE_COMPLETION_CLASSES, PRODUCT_AREAS, RUN_REVIEW_STATES, RUN_STATUSES, } from "./vocab.js";
export { PRODUCT_AREAS, ROUTE_SCOPES } from "./vocab.js";
export const API_ROUTES = {
    health: { method: 'GET', path: '/v1/health', kind: 'json', response: 'HealthResponseSchema', area: 'administration', authorization: { public: true, reason: 'Health reports component state and no tenant run data.' } },
    databaseDoctor: { method: 'GET', path: '/v1/database/doctor', kind: 'json', response: 'DatabaseDoctorResponseSchema', area: 'administration', authorization: { scopes: ['operator:audit'] } },
    listRuns: {
        method: 'GET',
        path: '/v1/runs',
        kind: 'json',
        query_request: 'WorkQueryRequestSchema',
        query: [
            { name: 'cursor', type: 'string', pattern: '^sha256:[0-9a-f]{64}$' },
            { name: 'limit', type: 'integer', minimum: 1, maximum: 100, default: 50 },
            { name: 'lifecycle_state', type: 'string', enum: RUN_STATUSES },
            { name: 'completion_class', type: 'string', enum: ASSURANCE_COMPLETION_CLASSES },
            { name: 'review_state', type: 'string', enum: RUN_REVIEW_STATES },
            { name: 'publication_ref', type: 'string', pattern: '^sha256:[0-9a-f]{64}$' },
            { name: 'created_from', type: 'string', format: 'date-time' },
            { name: 'created_before', type: 'string', format: 'date-time' },
            { name: 'correlation_id', type: 'string', minLength: 1, maxLength: 256 },
        ],
        response: 'WorkQueryPageSchema',
        area: 'run',
        authorization: { scopes: ['run:read'] },
    },
    createRun: { method: 'POST', path: '/v1/runs', kind: 'json', request: 'IntakeRequestSchema', response: 'CreatedRunSchema', area: 'run', authorization: { scopes: ['run:create'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'intake.idempotency.reused' } },
    createDeferredRun: { method: 'POST', path: '/v1/runs/deferred', kind: 'json', request: 'IntakeRequestSchema', response: 'CreatedRunSchema', area: 'run', authorization: { scopes: ['run:create'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'intake.idempotency.reused' } },
    snapshot: { method: 'GET', path: '/v1/runs/:run_id', kind: 'json', response: 'RunSnapshotSchema', area: 'run', authorization: { scopes: ['run:read'] } },
    result: { method: 'GET', path: '/v1/runs/:run_id/result', kind: 'json', response: 'RunResultSchema', area: 'results-and-audit', authorization: { scopes: ['run:read'] } },
    records: { method: 'GET', path: '/v1/runs/:run_id/records', kind: 'json', query: [{ name: 'after', type: 'integer', minimum: 0, default: 0 }], response: 'RecordsPageSchema', area: 'results-and-audit', authorization: { scopes: ['run:read'] } },
    control: { method: 'POST', path: '/v1/runs/:run_id/controls', kind: 'json', request: 'ControlRequestSchema', response: 'ControlAcceptedSchema', area: 'run', authorization: { control_verb: { default: 'run:control', cancel: 'run:cancel', answer_any_of: ['review:answer', 'run:control'] } }, product_mutation: { idempotency_source: 'request-control-id', changed_content_code: 'control.reused' } },
    recordExternalObservation: {
        method: 'POST',
        path: '/v1/runs/:run_id/observations',
        kind: 'json',
        request: 'ExternalObservationRequestSchema',
        response: 'ExternalObservationAcceptedSchema',
        headers: [{ name: 'X-Zero-AR-Participant-Token', argument: 'participant_token', required: false, maxLength: 16_384, description: 'An optional JWT issued by the tenant\'s admitted participant identity provider. The application bearer key remains in Authorization.' }],
        area: 'run',
        authorization: { scopes: ['observation:write'] },
        product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'observation.idempotency.reused' },
    },
    decideEffect: {
        method: 'POST',
        path: '/v1/runs/:run_id/effects/:effect_id/decisions',
        kind: 'json',
        request: 'EffectApprovalRequestSchema',
        response: 'EffectApprovalAcceptedSchema',
        headers: [{ name: 'X-Zero-AR-Participant-Token', argument: 'participant_token', required: true, maxLength: 16_384, description: 'A JWT from the tenant\'s admitted participant identity provider. The verified subject becomes the exact-effect approver.' }],
        area: 'run',
        authorization: { scopes: ['effect:approve'] },
        product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'effect.approval.idempotency.reused' },
    },
    fork: { method: 'POST', path: '/v1/runs/:run_id/forks', kind: 'json', request: 'ForkRequestSchema', response: 'RunRefSchema', area: 'run', authorization: { scopes: ['run:fork'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'fork.idempotency.reused' } },
    reexecute: { method: 'POST', path: '/v1/runs/:run_id/reexecutions', kind: 'json', request: 'ReexecuteRequestSchema', response: 'RunRefSchema', area: 'run', authorization: { scopes: ['run:reexecute'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'reexecution.idempotency.reused' } },
    start: { method: 'POST', path: '/v1/runs/:run_id/start', kind: 'json', request: 'RunLifecycleCommandRequestSchema', response: 'StartAcceptedSchema', area: 'run', authorization: { scopes: ['run:start'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'run.lifecycle.idempotency.reused' } },
    resume: { method: 'POST', path: '/v1/runs/:run_id/resume', kind: 'json', request: 'RunLifecycleCommandRequestSchema', response: 'StartAcceptedSchema', area: 'run', authorization: { scopes: ['run:resume'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'run.lifecycle.idempotency.reused' } },
    resumeDeferred: { method: 'POST', path: '/v1/runs/:run_id/resume-deferred', kind: 'json', request: 'RunLifecycleCommandRequestSchema', response: 'StartAcceptedSchema', area: 'run', authorization: { scopes: ['run:resume'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'run.lifecycle.idempotency.reused' } },
    createRuntimeArtifactSession: { method: 'POST', path: '/v1/artifact-sessions', kind: 'json', request: 'RuntimeArtifactSessionRequestSchema', response: 'RuntimeArtifactSessionStatusSchema', area: 'run', authorization: { scopes: ['artifact:write'] }, product_mutation: { idempotency_source: 'request-idempotency-key', changed_content_code: 'artifact.idempotency-conflict' } },
    runtimeArtifactUploadStatus: { method: 'GET', path: '/v1/artifact-sessions/:session_id', kind: 'json', response: 'RuntimeArtifactSessionStatusSchema', area: 'run', authorization: { scopes: ['artifact:write'] } },
    stageRuntimeArtifactChunk: { method: 'POST', path: '/v1/artifact-sessions/:session_id/chunks', kind: 'bundle', request_media_type: 'application/octet-stream', response: 'RuntimeArtifactSessionStatusSchema', area: 'run', authorization: { scopes: ['artifact:write'] } },
    commitRuntimeArtifact: { method: 'POST', path: '/v1/artifact-sessions/:session_id/commits', kind: 'json', response: 'RuntimeArtifactCommittedSessionSchema', area: 'run', authorization: { scopes: ['artifact:write'] }, product_mutation: { idempotency_source: 'artifact-session-key', changed_content_code: 'artifact.idempotency-conflict' } },
    rebuildProjection: { method: 'POST', path: '/v1/runs/:run_id/projection-rebuilds', kind: 'json', response: 'RebuildOutcomeSchema', area: 'administration', authorization: { scopes: ['operator:rebuild'] } },
    eraseSubject: { method: 'POST', path: '/v1/runs/:run_id/erasures', kind: 'json', request: 'ErasureRequestSchema', response: 'ErasureOutcomeSchema', area: 'results-and-audit', authorization: { scopes: ['operator:erase'] } },
    exportRun: { method: 'GET', path: '/v1/runs/:run_id/export', kind: 'bundle', response_media_type: 'application/x-ndjson', area: 'results-and-audit', authorization: { scopes: ['run:read'] } },
    importRun: { method: 'POST', path: '/v1/imports', kind: 'bundle', request_media_type: 'application/x-ndjson', response: 'ImportOutcomeSchema', area: 'administration', authorization: { scopes: ['operator:restore'] } },
    streamRecords: { method: 'GET', path: '/v1/runs/:run_id/records/stream', kind: 'sse', query: [{ name: 'after', type: 'integer', minimum: 0, default: 0 }], response: 'ObservationEventSchema', response_media_type: 'text/event-stream', area: 'results-and-audit', authorization: { scopes: ['run:read'] } },
    streamProgress: { method: 'GET', path: '/v1/runs/:run_id/progress/stream', kind: 'sse', response: 'ProgressEventSchema', response_media_type: 'text/event-stream', area: 'run', authorization: { scopes: ['run:read'] } },
    createPublicationSession: { method: 'POST', path: '/v1/publication-sessions', kind: 'json', request: 'PublicationSessionRequestSchema', response: 'PublicationSessionSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    stagePublicationBlob: { method: 'POST', path: '/v1/publication-sessions/:session_id/blobs', kind: 'json', request: 'PublicationBlobFrameSchema', response: 'PublicationBlobAckSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    publicationBlobUploadStatus: { method: 'GET', path: '/v1/publication-sessions/:session_id/blobs/:content_ref', kind: 'json', response: 'PublicationBlobUploadStatusSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    stagePublicationBlobChunk: { method: 'POST', path: '/v1/publication-sessions/:session_id/blobs/:content_ref/chunks', kind: 'bundle', request_media_type: 'application/octet-stream', response: 'PublicationBlobUploadStatusSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    finishPublicationBlobUpload: { method: 'POST', path: '/v1/publication-sessions/:session_id/blobs/:content_ref/commits', kind: 'json', response: 'PublicationBlobUploadFinishSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    commitPublication: { method: 'POST', path: '/v1/publication-sessions/:session_id/commits', kind: 'json', request: 'PublicationCommitRequestSchema', response: 'PublicationReceiptSchema', area: 'build-and-publish', authorization: { scopes: ['publication:create'] } },
    getPublication: { method: 'GET', path: '/v1/publications/:publication_ref', kind: 'json', response: 'PublicationViewSchema', area: 'build-and-publish', authorization: { scopes: ['publication:read'] } },
    getDeclaration: { method: 'GET', path: '/v1/declarations/:content_ref', kind: 'json', response: 'DeclarationViewSchema', area: 'build-and-publish', authorization: { scopes: ['publication:read'] } },
    setRegistryAlias: { method: 'POST', path: '/v1/registry/aliases', kind: 'json', request: 'AliasMutationRequestSchema', response: 'AliasMutationResultSchema', area: 'build-and-publish', authorization: { scopes: ['registry:alias'] } },
    deprecateRef: { method: 'POST', path: '/v1/registry/deprecations', kind: 'json', request: 'DeprecationRequestSchema', response: 'RegistryActOutcomeSchema', area: 'build-and-publish', authorization: { scopes: ['registry:deprecate'] } },
    quarantineRef: { method: 'POST', path: '/v1/registry/quarantines', kind: 'json', request: 'QuarantineRequestSchema', response: 'RegistryActOutcomeSchema', area: 'build-and-publish', authorization: { scopes: ['registry:quarantine'] } },
    setIntakeDrain: { method: 'POST', path: '/v1/intake-drains', kind: 'json', request: 'DrainRequestSchema', response: 'DrainOutcomeSchema', area: 'administration', authorization: { scopes: ['operator:drain'] } },
    recordIdentityMigrationEvent: { method: 'POST', path: '/v1/product-identity/migration-events', kind: 'json', request: 'IdentityMigrationEventRequestSchema', response: 'IdentityMigrationEventOutcomeSchema', area: 'administration', authorization: { scopes: ['operator:governance'] } },
    reconcileEffects: { method: 'POST', path: '/v1/runs/:run_id/reconciliations', kind: 'json', response: 'ReconciliationOutcomeSchema', area: 'review-and-authority', authorization: { scopes: ['operator:reconcile'] } },
    operatorAudit: { method: 'GET', path: '/v1/operator-audit', kind: 'json', response: 'OperatorAuditPageSchema', area: 'results-and-audit', authorization: { scopes: ['operator:audit'] } },
    reviewInbox: { method: 'GET', path: '/v1/reviews/pending', kind: 'json', response: 'ReviewInboxSchema', area: 'review-and-authority', authorization: { scopes: ['review:read'] } },
    admitModelAdapter: { method: 'POST', path: '/v1/model-adapters', kind: 'json', request: 'AdmitModelAdapterRequestSchema', response: 'AdmittedModelAdapterSchema', area: 'administration', authorization: { scopes: ['platform:adapter-admit'] } },
    createExternalCredentialBinding: { method: 'POST', path: '/v1/credential-bindings', kind: 'json', request: 'CreateExternalCredentialBindingRequestSchema', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:write'] } },
    protectedCredentialIngest: { method: 'POST', path: '/v1/credential-bindings/protected-ingest', kind: 'json', request: 'ProtectedCredentialIngestRequestSchema', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:write'] } },
    inspectCredentialBinding: { method: 'GET', path: '/v1/credential-bindings/:binding_ref', kind: 'json', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:read'] } },
    rotateExternalCredential: { method: 'POST', path: '/v1/credential-bindings/:binding_ref/rotations', kind: 'json', request: 'RotateExternalCredentialRequestSchema', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:rotate'] } },
    rotateProtectedCredential: { method: 'POST', path: '/v1/credential-bindings/:binding_ref/protected-rotations', kind: 'json', request: 'RotateProtectedCredentialRequestSchema', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:rotate'] } },
    revokeCredentialBinding: { method: 'POST', path: '/v1/credential-bindings/:binding_ref/revocations', kind: 'json', request: 'RevokeCredentialRequestSchema', response: 'CredentialBindingSchema', area: 'administration', authorization: { scopes: ['credential:revoke'] } },
    createProviderInstance: { method: 'POST', path: '/v1/provider-instances', kind: 'json', request: 'CreateProviderInstanceRequestSchema', response: 'ProviderInstanceSchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    listProviderInstances: { method: 'GET', path: '/v1/provider-instances', kind: 'json', response: 'ProviderInstanceListSchema', area: 'administration', authorization: { scopes: ['provider:read'] } },
    syncProviderCatalogue: { method: 'POST', path: '/v1/provider-instances/:instance_ref/catalogue-syncs', kind: 'json', request: 'SyncProviderCatalogueRequestSchema', response: 'ProviderCatalogueSchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    providerCatalogue: { method: 'GET', path: '/v1/provider-instances/:instance_ref/catalogue', kind: 'json', response: 'ProviderCatalogueSchema', area: 'administration', authorization: { scopes: ['provider:read'] } },
    enableProviderModel: { method: 'POST', path: '/v1/provider-instances/:instance_ref/model-enablement', kind: 'json', request: 'EnableProviderModelRequestSchema', response: 'ProviderModelEntrySchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    modelPool: { method: 'GET', path: '/v1/model-pool', kind: 'json', response: 'TenantModelPoolSchema', area: 'administration', authorization: { scopes: ['provider:read'] } },
    setModelAlias: { method: 'POST', path: '/v1/model-pool/aliases', kind: 'json', request: 'SetModelAliasRequestSchema', response: 'TenantModelPoolSchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    declareFallbackSet: { method: 'POST', path: '/v1/model-pool/fallback-sets', kind: 'json', request: 'DeclareFallbackSetRequestSchema', response: 'TenantModelPoolSchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    setDefaultModelAlias: { method: 'POST', path: '/v1/model-pool/default-alias', kind: 'json', request: 'SetDefaultModelAliasRequestSchema', response: 'TenantModelPoolSchema', area: 'administration', authorization: { scopes: ['provider:write'] } },
    registerToolSource: { method: 'POST', path: '/v1/tool-sources', kind: 'json', request: 'RegisterToolSourceRequestSchema', response: 'ToolSourceSchema', area: 'administration', authorization: { scopes: ['tool-source:write'] } },
    listToolSources: { method: 'GET', path: '/v1/tool-sources', kind: 'json', response: 'ToolSourceListSchema', area: 'administration', authorization: { scopes: ['tool-source:read'] } },
    inspectToolSource: { method: 'GET', path: '/v1/tool-sources/:source_ref', kind: 'json', response: 'ToolSourceSchema', area: 'administration', authorization: { scopes: ['tool-source:read'] } },
    testToolSource: { method: 'POST', path: '/v1/tool-sources/:source_ref/tests', kind: 'json', response: 'ToolSourceTestResultSchema', area: 'administration', authorization: { scopes: ['tool-source:test'] } },
    syncToolSourceCatalogue: { method: 'POST', path: '/v1/tool-sources/:source_ref/catalogue-syncs', kind: 'json', request: 'SyncToolSourceCatalogueRequestSchema', response: 'ToolSourceCatalogueSchema', area: 'administration', authorization: { scopes: ['tool-source:write'] } },
    toolSourceCatalogue: { method: 'GET', path: '/v1/tool-sources/:source_ref/catalogue', kind: 'json', response: 'ToolSourceCatalogueSchema', area: 'administration', authorization: { scopes: ['tool-source:read'] } },
    enableToolSourceTools: { method: 'POST', path: '/v1/tool-sources/:source_ref/tool-enablement', kind: 'json', request: 'EnableToolSourceToolsRequestSchema', response: 'ToolSourceEnablementSchema', area: 'administration', authorization: { scopes: ['tool-source:write'] } },
    disableToolSource: { method: 'POST', path: '/v1/tool-sources/:source_ref/disablement', kind: 'json', request: 'ToolSourceStateRequestSchema', response: 'ToolSourceEnablementSchema', area: 'administration', authorization: { scopes: ['tool-source:write'] } },
    removeToolSource: { method: 'POST', path: '/v1/tool-sources/:source_ref/removal', kind: 'json', request: 'ToolSourceStateRequestSchema', response: 'ToolSourceEnablementSchema', area: 'administration', authorization: { scopes: ['tool-source:write'] } },
    registerEnvironment: { method: 'POST', path: '/v1/environments', kind: 'json', request: 'RegisterEnvironmentRequestSchema', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    environmentCapabilities: { method: 'GET', path: '/v1/environment-capabilities', kind: 'json', response: 'EnvironmentDeploymentCapabilityListSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    publishEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/publications', kind: 'json', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    enableEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/enablement', kind: 'json', request: 'EnvironmentProfileStateRequestSchema', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    drainEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/drain', kind: 'json', request: 'EnvironmentProfileStateRequestSchema', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    disableEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/disablement', kind: 'json', request: 'EnvironmentProfileStateRequestSchema', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    rotateEnvironmentCredentials: { method: 'POST', path: '/v1/environments/:profile_ref/credential-rotations', kind: 'json', request: 'EnvironmentCredentialRotationRequestSchema', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:write'] } },
    listEnvironments: { method: 'GET', path: '/v1/environments', kind: 'json', response: 'EnvironmentProfileListSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    inspectEnvironment: { method: 'GET', path: '/v1/environments/:profile_ref', kind: 'json', response: 'EnvironmentProfileRegistrationSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    doctorEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/doctor', kind: 'json', request: 'EnvironmentDoctorRequestSchema', response: 'EnvironmentDoctorResultSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    conformEnvironment: { method: 'POST', path: '/v1/environments/:profile_ref/conformance', kind: 'json', request: 'EnvironmentConformanceRequestSchema', response: 'EnvironmentConformanceResultSchema', area: 'administration', authorization: { scopes: ['environment:conformance'] } },
    listEnvironmentJobs: { method: 'GET', path: '/v1/environment-jobs', kind: 'json', response: 'EnvironmentJobListSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    observeEnvironmentJob: { method: 'GET', path: '/v1/environment-jobs/:job_id', kind: 'json', response: 'ObserveEnvironmentJobResultSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    cancelEnvironmentJob: { method: 'POST', path: '/v1/environment-job-cancellations', kind: 'json', request: 'EnvironmentJobActionRequestSchema', response: 'CancelEnvironmentJobResultSchema', area: 'administration', authorization: { scopes: ['environment:cancel'] } },
    reconcileEnvironmentJob: { method: 'POST', path: '/v1/environment-job-reconciliations', kind: 'json', request: 'EnvironmentJobRefRequestSchema', response: 'ReconcileEnvironmentJobResultSchema', area: 'administration', authorization: { scopes: ['environment:reconcile'] } },
    teardownEnvironment: { method: 'POST', path: '/v1/environment-teardowns', kind: 'json', request: 'EnvironmentJobActionRequestSchema', response: 'TeardownEnvironmentResultSchema', area: 'administration', authorization: { scopes: ['environment:teardown'] } },
    abandonEnvironment: { method: 'POST', path: '/v1/environment-abandonments', kind: 'json', request: 'EnvironmentAbandonJobRequestSchema', response: 'AbandonEnvironmentResultSchema', area: 'administration', authorization: { scopes: ['environment:abandon'] } },
    sweepEnvironments: { method: 'POST', path: '/v1/environment-sweeps', kind: 'json', request: 'EnvironmentSweepRequestSchema', response: 'EnvironmentSweepResultSchema', area: 'administration', authorization: { scopes: ['environment:reconcile', 'environment:teardown'] } },
    environmentMetrics: { method: 'GET', path: '/v1/environment-metrics', kind: 'json', response: 'EnvironmentMetricsSchema', area: 'administration', authorization: { scopes: ['environment:read'] } },
    writeMemoryAssertion: { method: 'POST', path: '/v1/memory/assertions', kind: 'json', request: 'MemoryAssertionInputSchema', response: 'MemoryWriteOutcomeSchema', area: 'results-and-audit', authorization: { scopes: ['memory:write'] } },
    supersedeMemoryAssertion: { method: 'POST', path: '/v1/memory/assertions/:assertion_id/supersessions', kind: 'json', request: 'MemorySupersedeRequestSchema', response: 'MemorySupersedeOutcomeSchema', area: 'results-and-audit', authorization: { scopes: ['memory:write'] } },
    readMemoryHistory: { method: 'POST', path: '/v1/memory/history-reads', kind: 'json', request: 'MemoryHistoryRequestSchema', response: 'MemoryHistoryResponseSchema', area: 'results-and-audit', authorization: { scopes: ['memory:read'] } },
    eraseMemorySubject: { method: 'POST', path: '/v1/memory/subject-erasures', kind: 'json', request: 'MemorySubjectErasureRequestSchema', response: 'MemorySubjectErasureOutcomeSchema', area: 'results-and-audit', authorization: { scopes: ['memory:erase'] } },
    readRunMemory: { method: 'POST', path: '/v1/runs/:run_id/memory-reads', kind: 'json', request: 'MemoryReadRequestSchema', response: 'RunMemoryReadOutcomeSchema', area: 'run', authorization: { scopes: ['memory:read'] } },
};
/** The :named parameters a route's path carries, in order. */
export function routeParams(path) {
    return path
        .split('/')
        .filter((segment) => segment.startsWith(':'))
        .map((segment) => segment.slice(1));
}
/** Substitute parameters into a route path. A missing parameter throws by name. */
export function routePath(name, params = {}) {
    return API_ROUTES[name].path
        .split('/')
        .map((segment) => {
        if (!segment.startsWith(':'))
            return segment;
        const value = params[segment.slice(1)];
        if (!value)
            throw new Error(`route ${name} needs the ${segment.slice(1)} parameter.`);
        return encodeURIComponent(value);
    })
        .join('/');
}
