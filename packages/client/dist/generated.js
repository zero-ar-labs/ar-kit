/**
 * Generated from the contract route table by scripts/generate-client.ts.
 * Do not edit by hand; add the route to API_ROUTES and regenerate. The
 * drift check in XCV-003 compares these bytes against a fresh render.
 */
function withQuery(path, values) {
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(values)) {
        if (value !== undefined)
            query.set(name, String(value));
    }
    const encoded = query.toString();
    return encoded ? path + '?' + encoded : path;
}
export class GeneratedRoutes {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    health() {
        return this.transport.json('GET', `/v1/health`);
    }
    databaseDoctor() {
        return this.transport.json('GET', `/v1/database/doctor`);
    }
    listRuns(query = {}) {
        return this.transport.json('GET', withQuery(`/v1/runs`, { cursor: query.cursor, limit: query.limit, lifecycle_state: query.lifecycle_state, completion_class: query.completion_class, review_state: query.review_state, publication_ref: query.publication_ref, created_from: query.created_from, created_before: query.created_before, correlation_id: query.correlation_id }));
    }
    createRun(body) {
        return this.transport.json('POST', `/v1/runs`, body);
    }
    createDeferredRun(body) {
        return this.transport.json('POST', `/v1/runs/deferred`, body);
    }
    snapshot(run_id) {
        return this.transport.json('GET', `/v1/runs/${encodeURIComponent(run_id)}`);
    }
    result(run_id) {
        return this.transport.json('GET', `/v1/runs/${encodeURIComponent(run_id)}/result`);
    }
    records(run_id, after = 0) {
        return this.transport.json('GET', withQuery(`/v1/runs/${encodeURIComponent(run_id)}/records`, { after: after }));
    }
    control(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/controls`, body);
    }
    recordExternalObservation(run_id, body, participant_token = undefined) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/observations`, body, { ...(participant_token !== undefined ? { "X-Zero-AR-Participant-Token": participant_token } : {}) });
    }
    decideEffect(run_id, effect_id, body, participant_token) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/effects/${encodeURIComponent(effect_id)}/decisions`, body, { "X-Zero-AR-Participant-Token": participant_token });
    }
    fork(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/forks`, body);
    }
    reexecute(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/reexecutions`, body);
    }
    start(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/start`, body);
    }
    resume(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/resume`, body);
    }
    resumeDeferred(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/resume-deferred`, body);
    }
    createRuntimeArtifactSession(body) {
        return this.transport.json('POST', `/v1/artifact-sessions`, body);
    }
    runtimeArtifactUploadStatus(session_id) {
        return this.transport.json('GET', `/v1/artifact-sessions/${encodeURIComponent(session_id)}`);
    }
    commitRuntimeArtifact(session_id) {
        return this.transport.json('POST', `/v1/artifact-sessions/${encodeURIComponent(session_id)}/commits`);
    }
    rebuildProjection(run_id) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/projection-rebuilds`);
    }
    eraseSubject(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/erasures`, body);
    }
    createPublicationSession(body) {
        return this.transport.json('POST', `/v1/publication-sessions`, body);
    }
    stagePublicationBlob(session_id, body) {
        return this.transport.json('POST', `/v1/publication-sessions/${encodeURIComponent(session_id)}/blobs`, body);
    }
    publicationBlobUploadStatus(session_id, content_ref) {
        return this.transport.json('GET', `/v1/publication-sessions/${encodeURIComponent(session_id)}/blobs/${encodeURIComponent(content_ref)}`);
    }
    finishPublicationBlobUpload(session_id, content_ref) {
        return this.transport.json('POST', `/v1/publication-sessions/${encodeURIComponent(session_id)}/blobs/${encodeURIComponent(content_ref)}/commits`);
    }
    commitPublication(session_id, body) {
        return this.transport.json('POST', `/v1/publication-sessions/${encodeURIComponent(session_id)}/commits`, body);
    }
    getPublication(publication_ref) {
        return this.transport.json('GET', `/v1/publications/${encodeURIComponent(publication_ref)}`);
    }
    getDeclaration(content_ref) {
        return this.transport.json('GET', `/v1/declarations/${encodeURIComponent(content_ref)}`);
    }
    setRegistryAlias(body) {
        return this.transport.json('POST', `/v1/registry/aliases`, body);
    }
    deprecateRef(body) {
        return this.transport.json('POST', `/v1/registry/deprecations`, body);
    }
    quarantineRef(body) {
        return this.transport.json('POST', `/v1/registry/quarantines`, body);
    }
    setIntakeDrain(body) {
        return this.transport.json('POST', `/v1/intake-drains`, body);
    }
    recordIdentityMigrationEvent(body) {
        return this.transport.json('POST', `/v1/product-identity/migration-events`, body);
    }
    reconcileEffects(run_id) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/reconciliations`);
    }
    operatorAudit() {
        return this.transport.json('GET', `/v1/operator-audit`);
    }
    reviewInbox() {
        return this.transport.json('GET', `/v1/reviews/pending`);
    }
    admitModelAdapter(body) {
        return this.transport.json('POST', `/v1/model-adapters`, body);
    }
    createExternalCredentialBinding(body) {
        return this.transport.json('POST', `/v1/credential-bindings`, body);
    }
    protectedCredentialIngest(body) {
        return this.transport.json('POST', `/v1/credential-bindings/protected-ingest`, body);
    }
    inspectCredentialBinding(binding_ref) {
        return this.transport.json('GET', `/v1/credential-bindings/${encodeURIComponent(binding_ref)}`);
    }
    rotateExternalCredential(binding_ref, body) {
        return this.transport.json('POST', `/v1/credential-bindings/${encodeURIComponent(binding_ref)}/rotations`, body);
    }
    rotateProtectedCredential(binding_ref, body) {
        return this.transport.json('POST', `/v1/credential-bindings/${encodeURIComponent(binding_ref)}/protected-rotations`, body);
    }
    revokeCredentialBinding(binding_ref, body) {
        return this.transport.json('POST', `/v1/credential-bindings/${encodeURIComponent(binding_ref)}/revocations`, body);
    }
    createProviderInstance(body) {
        return this.transport.json('POST', `/v1/provider-instances`, body);
    }
    listProviderInstances() {
        return this.transport.json('GET', `/v1/provider-instances`);
    }
    syncProviderCatalogue(instance_ref, body) {
        return this.transport.json('POST', `/v1/provider-instances/${encodeURIComponent(instance_ref)}/catalogue-syncs`, body);
    }
    providerCatalogue(instance_ref) {
        return this.transport.json('GET', `/v1/provider-instances/${encodeURIComponent(instance_ref)}/catalogue`);
    }
    enableProviderModel(instance_ref, body) {
        return this.transport.json('POST', `/v1/provider-instances/${encodeURIComponent(instance_ref)}/model-enablement`, body);
    }
    modelPool() {
        return this.transport.json('GET', `/v1/model-pool`);
    }
    setModelAlias(body) {
        return this.transport.json('POST', `/v1/model-pool/aliases`, body);
    }
    declareFallbackSet(body) {
        return this.transport.json('POST', `/v1/model-pool/fallback-sets`, body);
    }
    setDefaultModelAlias(body) {
        return this.transport.json('POST', `/v1/model-pool/default-alias`, body);
    }
    registerToolSource(body) {
        return this.transport.json('POST', `/v1/tool-sources`, body);
    }
    listToolSources() {
        return this.transport.json('GET', `/v1/tool-sources`);
    }
    inspectToolSource(source_ref) {
        return this.transport.json('GET', `/v1/tool-sources/${encodeURIComponent(source_ref)}`);
    }
    testToolSource(source_ref) {
        return this.transport.json('POST', `/v1/tool-sources/${encodeURIComponent(source_ref)}/tests`);
    }
    syncToolSourceCatalogue(source_ref, body) {
        return this.transport.json('POST', `/v1/tool-sources/${encodeURIComponent(source_ref)}/catalogue-syncs`, body);
    }
    toolSourceCatalogue(source_ref) {
        return this.transport.json('GET', `/v1/tool-sources/${encodeURIComponent(source_ref)}/catalogue`);
    }
    enableToolSourceTools(source_ref, body) {
        return this.transport.json('POST', `/v1/tool-sources/${encodeURIComponent(source_ref)}/tool-enablement`, body);
    }
    disableToolSource(source_ref, body) {
        return this.transport.json('POST', `/v1/tool-sources/${encodeURIComponent(source_ref)}/disablement`, body);
    }
    removeToolSource(source_ref, body) {
        return this.transport.json('POST', `/v1/tool-sources/${encodeURIComponent(source_ref)}/removal`, body);
    }
    registerEnvironment(body) {
        return this.transport.json('POST', `/v1/environments`, body);
    }
    environmentCapabilities() {
        return this.transport.json('GET', `/v1/environment-capabilities`);
    }
    publishEnvironment(profile_ref) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/publications`);
    }
    enableEnvironment(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/enablement`, body);
    }
    drainEnvironment(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/drain`, body);
    }
    disableEnvironment(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/disablement`, body);
    }
    rotateEnvironmentCredentials(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/credential-rotations`, body);
    }
    listEnvironments() {
        return this.transport.json('GET', `/v1/environments`);
    }
    inspectEnvironment(profile_ref) {
        return this.transport.json('GET', `/v1/environments/${encodeURIComponent(profile_ref)}`);
    }
    doctorEnvironment(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/doctor`, body);
    }
    conformEnvironment(profile_ref, body) {
        return this.transport.json('POST', `/v1/environments/${encodeURIComponent(profile_ref)}/conformance`, body);
    }
    listEnvironmentJobs() {
        return this.transport.json('GET', `/v1/environment-jobs`);
    }
    observeEnvironmentJob(job_id) {
        return this.transport.json('GET', `/v1/environment-jobs/${encodeURIComponent(job_id)}`);
    }
    cancelEnvironmentJob(body) {
        return this.transport.json('POST', `/v1/environment-job-cancellations`, body);
    }
    reconcileEnvironmentJob(body) {
        return this.transport.json('POST', `/v1/environment-job-reconciliations`, body);
    }
    teardownEnvironment(body) {
        return this.transport.json('POST', `/v1/environment-teardowns`, body);
    }
    abandonEnvironment(body) {
        return this.transport.json('POST', `/v1/environment-abandonments`, body);
    }
    sweepEnvironments(body) {
        return this.transport.json('POST', `/v1/environment-sweeps`, body);
    }
    environmentMetrics() {
        return this.transport.json('GET', `/v1/environment-metrics`);
    }
    writeMemoryAssertion(body) {
        return this.transport.json('POST', `/v1/memory/assertions`, body);
    }
    supersedeMemoryAssertion(assertion_id, body) {
        return this.transport.json('POST', `/v1/memory/assertions/${encodeURIComponent(assertion_id)}/supersessions`, body);
    }
    readMemoryHistory(body) {
        return this.transport.json('POST', `/v1/memory/history-reads`, body);
    }
    eraseMemorySubject(body) {
        return this.transport.json('POST', `/v1/memory/subject-erasures`, body);
    }
    readRunMemory(run_id, body) {
        return this.transport.json('POST', `/v1/runs/${encodeURIComponent(run_id)}/memory-reads`, body);
    }
}
