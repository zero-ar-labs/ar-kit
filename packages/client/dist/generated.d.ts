/**
 * Generated from the contract route table by scripts/generate-client.ts.
 * Do not edit by hand; add the route to API_ROUTES and regenerate. The
 * drift check in XCV-003 compares these bytes against a fresh render.
 */
import type { AbandonEnvironmentResult, AdmitModelAdapterRequest, AdmittedModelAdapter, AliasMutationRequest, AliasMutationResult, CancelEnvironmentJobResult, ControlAccepted, ControlRequest, CreateExternalCredentialBindingRequest, CreateProviderInstanceRequest, CreatedRun, CredentialBinding, DatabaseDoctorResponse, DeclarationView, DeclareFallbackSetRequest, DeprecationRequest, DrainOutcome, DrainRequest, EffectApprovalAccepted, EffectApprovalRequest, EnableProviderModelRequest, EnableToolSourceToolsRequest, EnvironmentAbandonJobRequest, EnvironmentConformanceRequest, EnvironmentConformanceResult, EnvironmentCredentialRotationRequest, EnvironmentDeploymentCapabilityList, EnvironmentDoctorRequest, EnvironmentDoctorResult, EnvironmentJobActionRequest, EnvironmentJobList, EnvironmentJobRefRequest, EnvironmentMetrics, EnvironmentProfileList, EnvironmentProfileRegistration, EnvironmentProfileStateRequest, EnvironmentSweepRequest, EnvironmentSweepResult, ErasureOutcome, ErasureRequest, ExternalObservationAccepted, ExternalObservationRequest, ForkRequest, HealthResponse, IdentityMigrationEventOutcome, IdentityMigrationEventRequest, IntakeRequest, MemoryAssertionInput, MemoryHistoryRequest, MemoryHistoryResponse, MemoryReadRequest, MemorySubjectErasureOutcome, MemorySubjectErasureRequest, MemorySupersedeOutcome, MemorySupersedeRequest, MemoryWriteOutcome, ObserveEnvironmentJobResult, OperatorAuditPage, ProtectedCredentialIngestRequest, ProviderCatalogue, ProviderInstance, ProviderInstanceList, ProviderModelEntry, PublicationBlobAck, PublicationBlobFrame, PublicationBlobUploadFinish, PublicationBlobUploadStatus, PublicationCommitRequest, PublicationReceipt, PublicationSession, PublicationSessionRequest, PublicationView, QuarantineRequest, RebuildOutcome, ReconcileEnvironmentJobResult, ReconciliationOutcome, RecordsPage, ReexecuteRequest, RegisterEnvironmentRequest, RegisterToolSourceRequest, RegistryActOutcome, ReviewInbox, RevokeCredentialRequest, RotateExternalCredentialRequest, RotateProtectedCredentialRequest, RunLifecycleCommandRequest, RunMemoryReadOutcome, RunRef, RunResult, RunSnapshot, RuntimeArtifactCommittedSession, RuntimeArtifactSessionRequest, RuntimeArtifactSessionStatus, SetDefaultModelAliasRequest, SetModelAliasRequest, StartAccepted, SyncProviderCatalogueRequest, SyncToolSourceCatalogueRequest, TeardownEnvironmentResult, TenantModelPool, ToolSource, ToolSourceCatalogue, ToolSourceEnablement, ToolSourceList, ToolSourceStateRequest, ToolSourceTestResult, WorkQueryPage, WorkQueryRequest } from '@zero-ar/contracts';
/** The transport a client supplies: one json call, refusals as thrown diagnostics. */
export interface GeneratedTransport {
    json<T>(method: string, path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
}
export declare class GeneratedRoutes {
    protected readonly transport: GeneratedTransport;
    constructor(transport: GeneratedTransport);
    health(): Promise<HealthResponse>;
    databaseDoctor(): Promise<DatabaseDoctorResponse>;
    listRuns(query?: WorkQueryRequest): Promise<WorkQueryPage>;
    createRun(body: IntakeRequest): Promise<CreatedRun>;
    createDeferredRun(body: IntakeRequest): Promise<CreatedRun>;
    snapshot(run_id: string): Promise<RunSnapshot>;
    result(run_id: string): Promise<RunResult>;
    records(run_id: string, after?: number | undefined): Promise<RecordsPage>;
    control(run_id: string, body: ControlRequest): Promise<ControlAccepted>;
    recordExternalObservation(run_id: string, body: ExternalObservationRequest, participant_token?: string | undefined): Promise<ExternalObservationAccepted>;
    decideEffect(run_id: string, effect_id: string, body: EffectApprovalRequest, participant_token: string): Promise<EffectApprovalAccepted>;
    fork(run_id: string, body: ForkRequest): Promise<RunRef>;
    reexecute(run_id: string, body: ReexecuteRequest): Promise<RunRef>;
    start(run_id: string, body: RunLifecycleCommandRequest): Promise<StartAccepted>;
    resume(run_id: string, body: RunLifecycleCommandRequest): Promise<StartAccepted>;
    resumeDeferred(run_id: string, body: RunLifecycleCommandRequest): Promise<StartAccepted>;
    createRuntimeArtifactSession(body: RuntimeArtifactSessionRequest): Promise<RuntimeArtifactSessionStatus>;
    runtimeArtifactUploadStatus(session_id: string): Promise<RuntimeArtifactSessionStatus>;
    commitRuntimeArtifact(session_id: string): Promise<RuntimeArtifactCommittedSession>;
    rebuildProjection(run_id: string): Promise<RebuildOutcome>;
    eraseSubject(run_id: string, body: ErasureRequest): Promise<ErasureOutcome>;
    createPublicationSession(body: PublicationSessionRequest): Promise<PublicationSession>;
    stagePublicationBlob(session_id: string, body: PublicationBlobFrame): Promise<PublicationBlobAck>;
    publicationBlobUploadStatus(session_id: string, content_ref: string): Promise<PublicationBlobUploadStatus>;
    finishPublicationBlobUpload(session_id: string, content_ref: string): Promise<PublicationBlobUploadFinish>;
    commitPublication(session_id: string, body: PublicationCommitRequest): Promise<PublicationReceipt>;
    getPublication(publication_ref: string): Promise<PublicationView>;
    getDeclaration(content_ref: string): Promise<DeclarationView>;
    setRegistryAlias(body: AliasMutationRequest): Promise<AliasMutationResult>;
    deprecateRef(body: DeprecationRequest): Promise<RegistryActOutcome>;
    quarantineRef(body: QuarantineRequest): Promise<RegistryActOutcome>;
    setIntakeDrain(body: DrainRequest): Promise<DrainOutcome>;
    recordIdentityMigrationEvent(body: IdentityMigrationEventRequest): Promise<IdentityMigrationEventOutcome>;
    reconcileEffects(run_id: string): Promise<ReconciliationOutcome>;
    operatorAudit(): Promise<OperatorAuditPage>;
    reviewInbox(): Promise<ReviewInbox>;
    admitModelAdapter(body: AdmitModelAdapterRequest): Promise<AdmittedModelAdapter>;
    createExternalCredentialBinding(body: CreateExternalCredentialBindingRequest): Promise<CredentialBinding>;
    protectedCredentialIngest(body: ProtectedCredentialIngestRequest): Promise<CredentialBinding>;
    inspectCredentialBinding(binding_ref: string): Promise<CredentialBinding>;
    rotateExternalCredential(binding_ref: string, body: RotateExternalCredentialRequest): Promise<CredentialBinding>;
    rotateProtectedCredential(binding_ref: string, body: RotateProtectedCredentialRequest): Promise<CredentialBinding>;
    revokeCredentialBinding(binding_ref: string, body: RevokeCredentialRequest): Promise<CredentialBinding>;
    createProviderInstance(body: CreateProviderInstanceRequest): Promise<ProviderInstance>;
    listProviderInstances(): Promise<ProviderInstanceList>;
    syncProviderCatalogue(instance_ref: string, body: SyncProviderCatalogueRequest): Promise<ProviderCatalogue>;
    providerCatalogue(instance_ref: string): Promise<ProviderCatalogue>;
    enableProviderModel(instance_ref: string, body: EnableProviderModelRequest): Promise<ProviderModelEntry>;
    modelPool(): Promise<TenantModelPool>;
    setModelAlias(body: SetModelAliasRequest): Promise<TenantModelPool>;
    declareFallbackSet(body: DeclareFallbackSetRequest): Promise<TenantModelPool>;
    setDefaultModelAlias(body: SetDefaultModelAliasRequest): Promise<TenantModelPool>;
    registerToolSource(body: RegisterToolSourceRequest): Promise<ToolSource>;
    listToolSources(): Promise<ToolSourceList>;
    inspectToolSource(source_ref: string): Promise<ToolSource>;
    testToolSource(source_ref: string): Promise<ToolSourceTestResult>;
    syncToolSourceCatalogue(source_ref: string, body: SyncToolSourceCatalogueRequest): Promise<ToolSourceCatalogue>;
    toolSourceCatalogue(source_ref: string): Promise<ToolSourceCatalogue>;
    enableToolSourceTools(source_ref: string, body: EnableToolSourceToolsRequest): Promise<ToolSourceEnablement>;
    disableToolSource(source_ref: string, body: ToolSourceStateRequest): Promise<ToolSourceEnablement>;
    removeToolSource(source_ref: string, body: ToolSourceStateRequest): Promise<ToolSourceEnablement>;
    registerEnvironment(body: RegisterEnvironmentRequest): Promise<EnvironmentProfileRegistration>;
    environmentCapabilities(): Promise<EnvironmentDeploymentCapabilityList>;
    publishEnvironment(profile_ref: string): Promise<EnvironmentProfileRegistration>;
    enableEnvironment(profile_ref: string, body: EnvironmentProfileStateRequest): Promise<EnvironmentProfileRegistration>;
    drainEnvironment(profile_ref: string, body: EnvironmentProfileStateRequest): Promise<EnvironmentProfileRegistration>;
    disableEnvironment(profile_ref: string, body: EnvironmentProfileStateRequest): Promise<EnvironmentProfileRegistration>;
    rotateEnvironmentCredentials(profile_ref: string, body: EnvironmentCredentialRotationRequest): Promise<EnvironmentProfileRegistration>;
    listEnvironments(): Promise<EnvironmentProfileList>;
    inspectEnvironment(profile_ref: string): Promise<EnvironmentProfileRegistration>;
    doctorEnvironment(profile_ref: string, body: EnvironmentDoctorRequest): Promise<EnvironmentDoctorResult>;
    conformEnvironment(profile_ref: string, body: EnvironmentConformanceRequest): Promise<EnvironmentConformanceResult>;
    listEnvironmentJobs(): Promise<EnvironmentJobList>;
    observeEnvironmentJob(job_id: string): Promise<ObserveEnvironmentJobResult>;
    cancelEnvironmentJob(body: EnvironmentJobActionRequest): Promise<CancelEnvironmentJobResult>;
    reconcileEnvironmentJob(body: EnvironmentJobRefRequest): Promise<ReconcileEnvironmentJobResult>;
    teardownEnvironment(body: EnvironmentJobActionRequest): Promise<TeardownEnvironmentResult>;
    abandonEnvironment(body: EnvironmentAbandonJobRequest): Promise<AbandonEnvironmentResult>;
    sweepEnvironments(body: EnvironmentSweepRequest): Promise<EnvironmentSweepResult>;
    environmentMetrics(): Promise<EnvironmentMetrics>;
    writeMemoryAssertion(body: MemoryAssertionInput): Promise<MemoryWriteOutcome>;
    supersedeMemoryAssertion(assertion_id: string, body: MemorySupersedeRequest): Promise<MemorySupersedeOutcome>;
    readMemoryHistory(body: MemoryHistoryRequest): Promise<MemoryHistoryResponse>;
    eraseMemorySubject(body: MemorySubjectErasureRequest): Promise<MemorySubjectErasureOutcome>;
    readRunMemory(run_id: string, body: MemoryReadRequest): Promise<RunMemoryReadOutcome>;
}
