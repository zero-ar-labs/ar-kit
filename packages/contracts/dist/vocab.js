export const ENTRY_ROLES = ['system', 'user', 'assistant', 'tool_result', 'steer', 'marker'];
export const MODEL_CONTROL_OPERATION_KINDS = ['completion_proposal', 'item_result', 'question'];
export const ID_PREFIXES = ['run', 'rec', 'ent', 'lea', 'brn', 'ctl', 'gap', 'eff', 'ead', 'agt', 'chk', 'wak', 'pub', 'env', 'job', 'obs', 'src', 'cap', 'wsp'];
export const SANDBOX_WORKSPACE_STATUSES = ['sealed', 'attached', 'expired', 'deleted'];
export const SANDBOX_WORKSPACE_ZONES = ['sources', 'scratch', 'outputs'];
export const RECORD_TYPES = [
    'run.created',
    'run.started',
    'entry.appended',
    'branch.created',
    'branch.head.moved',
    'context.assembled',
    'context.segment.started',
    'context.segment.committed',
    'context.segment.failed',
    'context.segment.expanded',
    'model.call.started',
    'model.call.finished',
    'model.call.failed',
    'model.fallback.switched',
    'turn.completed',
    'control.received',
    'control.applied',
    'lease.opened',
    'lease.reserved',
    'lease.consumed',
    'lease.released',
    'subrun.opened',
    'subrun.finished',
    'tool.invoked',
    'tool.remote.pending',
    'tool.finished',
    'environment.prepare.requested',
    'environment.prepared',
    'environment.reused',
    'environment.segment.started',
    'environment.segment.ending',
    'environment.segment.ended',
    'environment.job.submit.requested',
    'environment.job.submitted',
    'environment.job.observe.requested',
    'environment.job.observed',
    'environment.job.reconcile.requested',
    'environment.job.reconciled',
    'environment.job.cancel.requested',
    'environment.job.cancelled',
    'environment.artifact.collect.requested',
    'environment.artifact.collected',
    'artifact.committed',
    'environment.teardown.requested',
    'environment.teardown.recorded',
    'environment.abandon.requested',
    'environment.abandoned',
    'effect.prepared',
    'effect.authority.decision',
    'effect.authority.invalidated',
    'effect.dispatched',
    'effect.resolved',
    'effect.unreconcilable',
    'effect.answer.late',
    'grant.superseded',
    'item.attempted',
    'item.parked',
    'item.invalidated',
    'plan.recorded',
    'budgets.amended',
    'gap.settled',
    'gap.dismissed',
    'checkpoint.started',
    'checkpoint.passed',
    'checkpoint.rejected',
    'checkpoint.indeterminate',
    'repair.started',
    'completion.proposed',
    'verification.concluded',
    'run.suspended',
    'run.resume.blocked',
    'run.resumed',
    'run.cancelled',
    'run.finished',
    'run.forked',
    'reexecution.started',
    'subject.erasure.completed',
    'wake.scheduled',
    'wake.claimed',
    'memory.event.recorded',
    'memory.read.recorded',
    'external.observation.received',
    'external.observation.applied',
    'projection.rebuilt',
    'run.lifecycle.command.accepted',
    'capability.admission.requested',
    'capability.admission.classified',
    'capability.admission.decided',
    'capability.admission.cancelled',
    'closure.epoch.committed',
    'closure.epoch.activated',
    'state.closure.rehydrated',
    'executor.continuation.accepted',
    'run.handoff.recorded',
];
const recordTypeVersions = RECORD_TYPES.reduce((versions, type) => {
    versions[type] = Object.freeze([1]);
    return versions;
}, {});
recordTypeVersions['state.closure.rehydrated'] = Object.freeze([1, 2]);
recordTypeVersions['executor.continuation.accepted'] = Object.freeze([1, 2]);
recordTypeVersions['model.call.started'] = Object.freeze([1, 2]);
export const RECORD_TYPE_VERSIONS = Object.freeze(recordTypeVersions);
export const RUN_PORTABILITY_LEVELS = ['verify', 'materialize', 'rehydrate', 'continue'];
export const CAPABILITY_ADMISSION_KINDS = ['add', 'replace', 'remove'];
export const CAPABILITY_PACKAGE_KINDS = ['procedure', 'tool'];
export const CAPABILITY_ADMISSION_CLASSES = [
    'context-only',
    'existing-tool-use',
    'signed-executable',
    'resolved-dependencies',
    'new-observation-tool',
    'new-effect-surface',
    'privilege-expansion',
];
export const CAPABILITY_ADMISSION_DECISIONS = ['approve', 'refuse'];
export const CAPABILITY_ADMISSION_STATUSES = [
    'resolving',
    'awaiting-review',
    'awaiting-budget',
    'awaiting-build',
    'approved',
    'committed',
    'activated',
    'refused',
    'superseded',
    'cancelled',
    'closed-by-terminal',
];
export const CAPABILITY_INVALIDATION_STRATEGIES = [
    'future-only',
    'reconsider-named-items',
    'invalidate-downstream',
    'fork-required',
];
export const CAPABILITY_NEXT_ACTIONS = [
    'inspect',
    'approve',
    'refuse',
    'cancel',
    'wait-for-safe-boundary',
    'continue-run',
    'retry-against-active-epoch',
    'publish-exact-candidate',
    'request-later-phase',
    'fork-or-continue',
];
export const MEMORY_EVENT_KINDS = ['assertion.admitted', 'assertion.superseded', 'subject.erased'];
export const MEMORY_CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted'];
export const MEMORY_KEY_CUSTODY = ['keychain', 'key-file', 'secret-broker-grant', 'wrapping-key-env', 'ephemeral'];
export const MEMORY_MODES = ['off', 'durable', 'ephemeral'];
export const MEMORY_READ_MODES = ['on-demand', 'at-intake', 'disabled'];
export const MEMORY_WRITE_MODES = ['none', 'propose-after-verification', 'human-approved'];
export const MEMORY_AVAILABILITY_MODES = ['optional', 'required'];
export const MEMORY_MODEL_OPERATIONS = ['memory.read', 'memory.propose'];
export const PLAN_OPERATIONS = ['plan.record'];
export const RUN_OPERATIONS = ['run.wait'];
export const PLAN_CHECK_KINDS = ['json-shape', 'workspace-command'];
export const TOOL_VIEW_SELECTION_REASONS = [
    'reserved-local-catalogue',
    'reserved-skill',
    'reserved-artifact',
    'reserved-source',
    'reserved-memory',
    'reserved-plan',
    'reserved-context',
    'reserved-run',
    'explicit-author',
    'explicit-operator',
    'skill-allowed-tools',
    'prior-activation',
    'prior-tool-view',
    'task-contract',
    'lifecycle-phase',
    'objective-match',
    'small-closure',
];
export const CONTEXT_MODEL_OPERATIONS = ['context.expand'];
export const RUN_STATUSES = ['created', 'running', 'suspended', 'cancelled', 'finished'];
export const COMPLETION_STATES = [
    'working',
    'checkpoint_verifying',
    'completion_proposed',
    'verifying',
    'gap_open',
    'repair',
    'complete',
    'unverified_artifact',
];
export const VERDICTS = ['verified', 'rejected', 'indeterminate', 'exhausted'];
export const RUN_TERMINALS = ['complete', 'unverified_artifact', 'cancelled'];
export const SUSPEND_REASONS = ['budget_exhausted', 'provider_failure', 'awaiting_answer', 'operator_pause', 'stagnation', 'remote_task', 'awaiting_approval', 'awaiting_external'];
export const RUN_RESUME_BLOCK_CATEGORIES = ['budget-unavailable', 'answers-outstanding', 'storage-unready', 'authority-unready', 'remote-task-pending'];
export const WAKE_CLAIM_VIAS = ['cancellation', 'deadline', 'deadline-stale', 'stale'];
export const BLOCKING_OUTCOME_KINDS = ['parked-item', 'open-effect', 'artifact-evidence'];
export const LEASE_DENOMINATIONS = ['model_tokens', 'tool_calls', 'bytes', 'compute_ms', 'attention'];
export const LEASE_POOLS = ['work', 'verification', 'repair'];
export const LEASE_STATES = ['reserved', 'settled', 'charged'];
export const CONTROL_VERBS = ['steer', 'redirect', 'cancel', 'answer', 'pause'];
export const BRANCH_REASONS = ['original', 'steer', 'redirect', 'repair', 'reexecution', 'fork'];
export const STOP_REASONS = [
    'end_turn',
    'completion_proposal',
    'max_output',
    'cancelled',
    'redirected',
    'provider_failure',
];
export const EFFECT_STATES = ['prepared', 'dispatched', 'committed', 'withdrawn', 'outcome_unknown', 'unreconcilable'];
export const EFFECT_AUTHORITY_DECISIONS = ['approve', 'refuse'];
export const EFFECT_AUTHORITY_DISPOSITIONS = ['approved', 'refused', 'expired'];
export const EFFECT_AUTHORITY_INVALIDATION_REASONS = ['expired', 'authority-epoch-changed', 'scope-epoch-changed'];
export function isTerminalEffectState(state) {
    return state === 'committed' || state === 'withdrawn' || state === 'unreconcilable';
}
export function isNonTerminalEffectState(state) {
    return !isTerminalEffectState(state);
}
export const RECEIPT_ASSURANCES = ['owner-signed', 'authenticated-response', 'authenticated-reconciliation'];
export const RECEIPT_OUTCOMES = ['applied', 'already_applied', 'refused'];
export const REVIEW_ITEM_KINDS = ['gap', 'human-validator', 'approval'];
export const REVIEW_ITEM_STATES = ['pending'];
export const RUN_REVIEW_STATES = ['pending', 'none'];
export const ITEM_STATES = [
    'untouched',
    'completed_unverified',
    'verified',
    'parked',
    'dismissed',
    'failed',
    'invalidated',
];
export const VALIDATOR_CLASSES = ['deterministic', 'sampled-oracle', 'heuristic', 'named-human'];
export const VALIDATOR_EVIDENCE_GRADES = ['declared', 'protocol-conformant', 'case-evaluated', 'deployment-admitted'];
export const VERIFICATION_PLAN_REFUSAL_CODES = [
    'contract-absent',
    'rule-uncovered',
    'sufficiency-missing',
    'heuristic-sufficiency',
    'catalogue-entry-missing',
    'catalogue-identity-mismatch',
    'evidence-missing',
    'validator-unavailable',
    'host-unavailable',
    'artifact-reader-unavailable',
    'oracle-unavailable',
    'sample-frame-unpinned',
    'attention-capacity-unavailable',
    'lease-unavailable',
    'schedule-infeasible',
    'authority-conflict',
];
export const VALIDATOR_OUTCOMES = ['pass', 'reject', 'indeterminate'];
export const CLAIM_LABELS = ['guarantee', 'assumption', 'heuristic', 'open'];
export const ASK_TIMINGS = ['at-completion', 'when-parked'];
export const VALIDATOR_INPUT_EXTENSIONS = ['document-text', 'effect-outcomes', 'workspace-output', 'web-pages'];
export const CHECKPOINT_VIEWS = ['covered-items', 'worked-items'];
export const CLAIM_REPRESENTATIONS = ['structured-claims-with-citations'];
export const FAILURE_CLASSES = ['shape', 'domain', 'grounding', 'infrastructure'];
export const OPERATION_CLASSES = ['observation', 'run-internal', 'effect-proposal'];
export const TOOL_METERING = ['enforced', 'unmetered', 'effect-governed'];
export const PROFILES = ['local-lite', 'full-cell', 'small-production', 'regulated'];
export const PROFILE_CAPABILITIES = [
    'hosted-postgresql-service',
    'local-lite',
    'transformation-volume-reference-pack',
    'provider-openai',
    'provider-anthropic',
    'provider-openrouter',
    'provider-together',
    'provider-fireworks',
    'aggregator-composio-observation',
    'aggregator-merge-observation',
    'restricted-effect-plane-attachment',
    'environment-process',
    'environment-oci',
    'environment-ssh',
    'environment-firecracker',
    'environment-openai-agents',
    'environment-apptainer',
    'full-cell-docker-linux',
    'canonical-log',
    'quality-plane',
    'artifacts',
    'suspension',
    'honest-completion',
    'published-skills',
    'runtime-local-tools',
    'author-defined-tools',
    'progressive-tool-disclosure',
    'effect-proposal-tools',
    'unattended-aggregator-mutations',
    'dynamic-authority',
    'production-effect-dispatch',
    'research-reference-pack',
    'video-reference-pack',
    'native-packaged-self-hosting',
    'classification-airlocks',
    'regulated-workloads',
    'cross-run-memory',
    'authored-orchestration',
    'mcp-work-entrypoints',
    'mcp-imported-tools',
    'source-local-read-only',
    'document-pdf-extraction',
    'fair-cell-scheduling',
    'sequential-sampled-validation',
    'context-feature-cache',
    'content-defined-chunking',
    'attention-admission',
    'gateway-signed-webhook',
    'gateway-interactive-messaging',
    'workspace-binding-profiles',
    'automatic-run-recovery',
    'open-goal-execution',
    'operator-pause-and-budget',
    'run-fork',
    'model-image-input',
    'workspace-exec',
    'browser-workspace',
    'hierarchical-context',
    'reversible-http-effect-dispatch',
    'web-search',
];
export const PROFILE_CAPABILITY_STATES = ['supported', 'conditional', 'excluded'];
export const ENVIRONMENT_PRODUCT_STATES = ['default-supported', 'conditional-supported', 'future-optional'];
export const ENVIRONMENT_ACCEPTANCE_STATES = ['not-required', 'pending', 'current', 'expired', 'mismatched'];
export const CONDITIONAL_ENVIRONMENT_BACKENDS = ['ssh', 'firecracker', 'apptainer', 'openai-agents'];
export const PROFILE_CAPABILITY_REFUSAL_POINTS = ['profile-compilation', 'publication', 'registration', 'intake', 'route', 'not-applicable'];
export const PROFILE_COMPONENTS = ['store', 'migration', 'queue', 'artifact', 'secret_store', 'tool_host', 'validator_host', 'authority', 'memory', 'orchestration', 'effect', 'mcp'];
export const INTEROP_PROTOCOLS = ['mcp', 'a2a'];
export const INTEROP_DIRECTIONS = ['client', 'server'];
export const INTEROP_TENANT_DERIVATIONS = ['authenticated-principal'];
export const INTEROP_REMOTE_CONSEQUENCE_POSTURES = ['none', 'declared-external', 'unknown'];
export const INTEROP_CAPABILITY_STATES = ['implemented', 'configured', 'healthy', 'admitted', 'selectable'];
export const MCP_TASK_STATUSES = ['working', 'input_required', 'completed', 'failed', 'cancelled'];
export const MCP_REMOTE_TASK_STATES = ['working', 'input_required', 'outcome_unknown'];
export const MCP_REMOTE_TASK_CAUSES = ['peer-task', 'transport-loss'];
export const TOOL_EXECUTION_OUTCOMES = ['success', 'tool-error', 'protocol-error', 'malformed-response', 'transport-loss', 'outcome-unknown'];
export const ASSURANCE_COMPLETION_CLASSES = ['working', 'verified', 'unverified', 'rejected', 'indeterminate', 'exhausted', 'cancelled'];
export const ASSURANCE_EFFECT_DISPOSITIONS = ['none', 'settled', 'open', 'outcome-unknown', 'unreconcilable'];
export const INTEROP_CACHE_SCOPES = ['private', 'public'];
export const ARTIFACT_BACKENDS = ['filesystem', 's3-compatible'];
export const ARTIFACT_EVIDENCE_REASONS = [
    'artifact.hash-mismatch',
    'artifact.classification-mismatch',
    'artifact.object-missing',
    'artifact.not-found-or-not-authorized',
    'artifact.range-invalid',
    'artifact.range-budget',
    'artifact.store-unavailable',
    'memory.envelope-erased',
    'token_budget',
];
export const ARTIFACT_TRANSFER_OMISSIONS = ['tenant-mismatch', 'backend-mismatch', 'no-artifact-store', 'erased', 'absent', 'not-in-run'];
export const RUN_BUNDLE_ARTIFACT_FRAME_KINDS = ['artifact-bundle', 'artifact-omissions', 'state-transfer', 'state-closure', 'continuation-capsule'];
export const RUN_BUNDLE_EXTENSION_FRAME_KINDS = [...RUN_BUNDLE_ARTIFACT_FRAME_KINDS, 'integrity'];
export const RUN_CONTINUATION_BINDING_KINDS = [
    'agent',
    'closure',
    'publication',
    'model-adapter',
    'tool',
    'validator',
    'procedure',
    'workspace',
    'source',
    'memory',
    'environment',
    'domain-pack',
    'target-adapter',
    'profile',
];
export const RUN_CONTINUATION_CHECK_KINDS = ['executor', 'protocol', 'state-closure', 'lifecycle', 'effects', 'operations', 'bindings', 'fence'];
export const RUN_CONTINUATION_CHECK_STATUSES = ['passed', 'refused'];
export const RUN_STATE_CLOSURE_MEMBER_KINDS = ['artifact', 'publication', 'workspace', 'memory', 'context', 'integrity'];
export const RUN_STATE_TRANSFER_KINDS = ['publication', 'workspace', 'memory'];
export const RUN_STATE_CLOSURE_MEMBER_STATUSES = ['present', 'omitted', 'unavailable'];
export const RUN_STATE_REHYDRATION_STATUSES = ['rehydrated', 'present-inline', 'omitted', 'unavailable'];
export const CONTEXT_REPLAY_SPAN_STATUSES = ['resolved', 'stale'];
export const CONTEXT_POLICY_SELECTORS = ['coverage-mmr-v1', 'hierarchical-context-v1'];
export const CONTEXT_POLICY_AVAILABILITIES = ['optional', 'required'];
export const CONTEXT_SUMMARIZER_BINDINGS = ['run-primary'];
export const CONTEXT_SEGMENT_INELIGIBILITY_REASONS = [
    'source-erased',
    'source-changed',
    'source-inaccessible',
    'branch-mismatch',
    'frontier-mismatch',
];
export const RUNTIME_ARTIFACT_INTENDED_USES = ['run', 'intake'];
export const EFFECT_PLANE_MODES = ['absent', 'restricted-attachment', 'dynamic-authority'];
export const PRODUCT_AREAS = ['administration', 'build-and-publish', 'run', 'review-and-authority', 'results-and-audit'];
export const API_MEDIA_TYPES = ['application/json', 'application/octet-stream', 'application/x-ndjson', 'text/event-stream'];
export const API_QUERY_PARAMETER_TYPES = ['string', 'integer', 'boolean'];
export const AUTHORIZATION_MODES = ['trusted-local', 'scoped'];
export const ROUTE_SCOPES = [
    'artifact:write',
    'capability:cancel',
    'capability:decide',
    'capability:read',
    'capability:request',
    'credential:read',
    'credential:revoke',
    'credential:rotate',
    'credential:write',
    'environment:abandon',
    'environment:cancel',
    'environment:conformance',
    'environment:read',
    'environment:reconcile',
    'environment:teardown',
    'environment:write',
    'effect:approve',
    'effect:grant',
    'effect:read',
    'memory:erase',
    'memory:read',
    'memory:write',
    'operator:attention',
    'operator:audit',
    'operator:drain',
    'operator:erase',
    'operator:governance',
    'operator:rebuild',
    'operator:reconcile',
    'operator:restore',
    'observation:write',
    'platform:adapter-admit',
    'platform:authority-epoch',
    'provider:read',
    'provider:write',
    'publication:create',
    'publication:read',
    'registry:alias',
    'registry:deprecate',
    'registry:quarantine',
    'review:answer',
    'review:read',
    'run:budget',
    'run:cancel',
    'run:control',
    'run:create',
    'run:fork',
    'run:read',
    'run:reexecute',
    'run:resume',
    'run:start',
    'source:read',
    'source:write',
    'tool-source:read',
    'tool-source:test',
    'tool-source:write',
];
export const PLATFORM_ROUTE_SCOPES = ['platform:authority-epoch'];
export const EXTERNAL_OBSERVATION_CHANNELS = ['web', 'mobile', 'voice', 'sms', 'email', 'chat', 'system', 'other'];
export const OIDC_JWT_ALGORITHMS = ['RS256'];
export const MODEL_PROVIDERS = ['scripted', 'openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'openai-compatible'];
export const MODEL_PROTOCOL_ADAPTERS = ['scripted', 'openai-chat-completions', 'anthropic-messages'];
export const MODEL_PROVIDER_PROFILES = ['scripted', 'openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'generic-openai-compatible', 'litellm', 'ollama'];
export const MODEL_CATALOGUE_SOURCES = ['declared', 'provider-api', 'openai-compatible-models'];
export const MODEL_CREDENTIAL_MODES = ['binding', 'none'];
export const MODEL_COMPATIBILITY_STATES = ['supported', 'unsupported', 'unknown'];
export const MODEL_IMAGE_INPUT_STATES = ['supported', 'unsupported'];
export const IMAGE_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
export const DOCUMENT_EXTRACTION_MEDIA_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const DOCUMENT_PAGE_IMAGE_MEDIA_TYPES = ['image/jpeg', 'image/png'];
export const DOCUMENT_COORDINATE_SPACES = ['pdf-points', 'image-pixels'];
export const DOCUMENT_EXTRACTOR_BINDINGS = ['host-process', 'oci-document'];
export const DOCUMENT_EXTRACTOR_SANDBOX_MODES = ['linux-bwrap-no-network', 'resource-limited-process', 'oci-no-network-read-only'];
export const DOCUMENT_PAGE_IMAGE_OMISSIONS = ['page-image-bytes', 'extraction-image-bytes'];
export const CONTEXT_IMAGE_DELIVERIES = ['image', 'note'];
export const CONTEXT_IMAGE_NOTE_REASONS = [
    'model-without-image-input',
    'image-too-large',
    'image-count-limit',
    'image-unavailable',
];
export const MODEL_USAGE_MEASUREMENTS = ['reported', 'untrusted', 'absent', 'estimated'];
export const INPUT_BOUND_BASES = ['provider-count', 'byte-bound'];
export const AGGREGATOR_PROVIDERS = ['composio', 'merge-agent-handler', 'merge-unified'];
export const PROVIDER_CREDENTIAL_PURPOSES = ['openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'openai-compatible', 'composio', 'merge-agent-handler', 'merge-unified', 'mcp', 's3-compatible-artifact-store', 'memory-wrapping-key', 'web-search'];
export const SECRET_BROKER_PRINCIPAL_KINDS = ['runtime', 'aggregator-host', 'artifact-store', 'supervisor'];
export const SECRET_BROKER_OPERATIONS = ['health', 'bind-external', 'inspect', 'rotate-external', 'revoke', 'resolve'];
export const CREDENTIAL_BINDING_STATES = ['active', 'revoked'];
export const PROVIDER_INSTANCE_STATES = ['configured', 'ready', 'revoked'];
export const PROVIDER_MODEL_STATES = ['discovered', 'enabled', 'disabled'];
export const TOOL_SOURCE_STATES = ['configured', 'ready', 'disabled', 'revoked', 'removed'];
export const TOOL_SOURCE_TOOL_STATES = ['discovered', 'enabled', 'disabled'];
export const TOOL_SOURCE_DRIFT_FIELDS = ['description', 'input_schema', 'provider_version', 'annotations'];
export const STORE_KINDS = ['sqlite', 'postgres'];
export const POSTGRES_DEPLOYMENT_MODES = ['colocated', 'external'];
export const SIGNER_KEY_STATES = ['active', 'not-yet-valid', 'expired'];
export const CELL_LAUNCH_ROLES = ['integrity-signer'];
export const CELL_STARTUP_PROCESSES = ['supervisor', 'runtime'];
export const CELL_ISOLATION_MODES = ['required', 'best-effort'];
export const CELL_GUARANTEE_EXCLUSIONS = [
    'child-code-isolation',
    'runtime-anchor-store-custody',
    'child-network-scoping',
    'child-signal-scoping',
    'external-secret-store-tenant-binding',
    'signer-key-custody',
];
export const CELL_CONFINEMENT_ROLES = ['runtime', 'tool-host', 'aggregator-host', 'authority-host', 'validator-host'];
export const CELL_CONFINEMENT_STATES = ['confined', 'self-test-failed', 'unavailable', 'not-offered', 'not-needed'];
export const CELL_SELF_TEST_RESULTS = ['passed', 'failed'];
export const CELL_ISOLATION_DECISIONS = ['start', 'refuse'];
export const POSTGRES_LATENCY_TOPOLOGIES = ['colocated', 'same-region-external', 'controlled-added-latency'];
export const POSTGRES_LATENCY_OPERATIONS = ['append', 'reconstruction', 'checkpoint', 'representative-run-transition'];
export const POSTGRES_LATENCY_REPORT_STATUSES = ['fixture-format-only', 'uat-measured'];
export const CONTROLLER_MODES = ['off', 'observe', 'enforce'];
export const ATTENTION_SNAPSHOT_STATES = ['current', 'invalid', 'superseded'];
export const ATTENTION_ADMISSION_RESULTS = ['not-evaluated', 'admitted', 'refused'];
export const SAMPLED_ORACLE_OUTCOMES = ['good', 'defect'];
export const SEQUENTIAL_STOP_REASONS = ['accept-boundary', 'reject-boundary', 'sample-cap', 'lease-exhausted'];
export const WORKSPACE_SLOTS = ['runtime-scratch', 'customer-readable-external'];
export const WORKSPACE_INSTANCE_LIFECYCLES = ['run-scoped', 'deployment-owned'];
export const PACK_CLAIM_KINDS = ['capability', 'coverage', 'limitation', 'requirement', 'omission'];
export const DIAGNOSTIC_SEVERITIES = ['error', 'warning', 'info'];
export const UNWIRED_DIAGNOSTIC_CODES = [
    'wake.scheduler.unwired',
    'controllers.view.unwired',
    'scheduler.dispatch.unwired',
    'validator.sampled.unwired',
    'checkpoint.statistics.unwired',
    'context.cache.unwired',
    'source.chunking.unwired',
    'attention.service.unwired',
    'attention.admission.unwired',
    'artifact.sweep.unwired',
    'publication.transfer.unwired',
    'registry.rebuild.unwired',
    'registry.alias-history.unwired',
    'tool-source.drift.unwired',
    'effect.authority.unwired',
    'workspace.instances.unwired',
    'gateway.unwired',
];
export const MECHANISM_REFUSAL_CODES = [
    'attention.preflight.refused',
    'attention.snapshot.invalid',
    'attention.batch.flat-without-evidence',
    'storage.writer.stale',
    'storage.writer.unavailable',
    'artifact.bundle-too-large',
    'capability-profile.unimplemented',
];
export const DURABLE_EVENTS = [
    'run.started',
    'turn.completed',
    'checkpoint.started',
    'checkpoint.passed',
    'checkpoint.rejected',
    'checkpoint.indeterminate',
    'gap.settled',
    'gap.dismissed',
    'item.parked',
    'item.invalidated',
    'effect.prepared',
    'effect.authority.decision',
    'effect.authority.invalidated',
    'effect.dispatched',
    'effect.resolved',
    'effect.unreconcilable',
    'effect.answer.late',
    'subrun.opened',
    'subrun.finished',
    'tool.invoked',
    'tool.remote.pending',
    'tool.finished',
    'environment.prepared',
    'environment.job.submitted',
    'environment.job.observed',
    'environment.job.reconciled',
    'environment.job.cancelled',
    'environment.artifact.collected',
    'artifact.committed',
    'environment.teardown.recorded',
    'environment.abandoned',
    'lease.reserved',
    'lease.consumed',
    'lease.released',
    'grant.superseded',
    'subject.erasure.completed',
    'completion.proposed',
    'verification.concluded',
    'run.cancelled',
    'run.suspended',
    'run.resume.blocked',
    'run.resumed',
    'run.forked',
    'reexecution.started',
    'projection.rebuilt',
    'run.finished',
    'external.observation.received',
    'external.observation.applied',
    'capability.admission.requested',
    'capability.admission.decided',
    'capability.admission.cancelled',
    'closure.epoch.committed',
    'closure.epoch.activated',
];
export const PRODUCT_EVENT_FAMILIES = ['work', 'review', 'artifact', 'quality', 'effect', 'terminal', 'consumption', 'environment', 'maintenance'];
export const PRODUCT_MUTATION_IDEMPOTENCY_SOURCES = ['request-idempotency-key', 'request-control-id', 'artifact-session-key'];
export const RUN_LIFECYCLE_COMMANDS = ['start', 'resume', 'resume-deferred'];
export const TRUST_TIERS = ['none', 'process', 'container', 'remote'];
export const ENVIRONMENT_BACKENDS = [
    'process',
    'oci',
    'ssh',
    'firecracker',
    'openai-agents',
    'apptainer',
];
export const ENVIRONMENT_ISOLATIONS = ['none', 'process', 'container', 'remote-host', 'microvm', 'hosted-sandbox'];
export const ENVIRONMENT_SSH_SCHEDULERS = ['direct', 'slurm'];
export const ENVIRONMENT_MEASUREMENT_PHASES = [
    'server-cold-start',
    'adapter-coordinator-overhead',
    'environment-cold-start',
    'environment-warm-start',
    'submit-to-running',
    'observation',
    'reconciliation',
    'cancellation',
    'teardown',
    'artifact-upload-throughput',
    'artifact-download-throughput',
];
export const ENVIRONMENT_MEASUREMENT_UNITS = ['milliseconds', 'bytes-per-second'];
export const ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS = ['ed25519'];
export const ENVIRONMENT_LIFECYCLE_OPERATIONS = ['descriptor', 'prepare', 'submit', 'observe', 'reconcile', 'cancel', 'collect', 'teardown', 'abandon'];
export const ENVIRONMENT_STATUSES = [
    'preparing',
    'ready',
    'submitted',
    'running',
    'collectible',
    'collected',
    'cancel-requested',
    'cancelled',
    'outcome-unknown',
    'failed',
    'teardown-pending',
    'torn-down',
    'abandoned',
];
export const PRODUCT_LOCAL_MIGRATION_STATUSES = [
    'empty',
    'ready',
    'migrated',
    'recoverable',
    'refused',
    'rolled-back',
];
export const PRODUCT_SOURCE_API_VERSIONS = [
    'ramsden/v1',
    'zero-ar/v1',
];
export const PRODUCT_RUN_BUNDLE_FORMATS = [
    'ramsden-run-bundle',
    'zero-ar-run-bundle',
];
export const RUN_BUNDLE_CANONICALIZATIONS = ['canonical-json-1'];
export const RUN_HEAD_FOLD_PROFILES = ['run-head-v9'];
export const PRODUCT_SBOM_FORMATS = [
    'ramsden-sbom-2',
    'zero-ar-sbom-1',
];
export const PRODUCT_CLI_RELEASE_ARTIFACT_KINDS = ['shell-completion', 'manpage', 'install-script', 'service-unit', 'example'];
export const PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS = ['npm-package-set', 'full-cell-release', 'legacy-artifact'];
export const PRODUCT_RELEASE_SIGNING_PURPOSES = ['successor-release', 'legacy-history'];
export const PRODUCT_EGRESS_REVIEW_PURPOSES = [
    'model-provider',
    'artifact-store',
    'artifact-health',
    'tool-provider',
    'effect-target',
    'oauth-redirect',
    'webhook-callback',
    'workspace',
    'web-search',
];
export const PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES = ['legacy', 'successor', 'legacy-wrapper'];
export const PRODUCT_PACKAGE_GRAPH_STATES = ['legacy-compatible', 'successor-compatible', 'mixed-incompatible'];
export const PRODUCT_IDENTITY_MIGRATION_IMPACTS = ['deployment', 'publication-namespace', 'compatibility-policy'];
export const PRODUCT_IDENTITY_DEPLOYMENT_TARGETS = ['local-lite', 'hosted-cell', 'full-cell', 'tool-host', 'validator-host', 'dispatcher', 'optional-services'];
export const PRODUCT_IDENTITY_DEPLOYMENT_IDENTIFIER_KINDS = ['database', 'database-role', 'database-schema', 'object-store-prefix', 'kubernetes-namespace', 'secret-name', 'service-account'];
export const PRODUCT_IDENTITY_PHYSICAL_RENAME_ACTIONS = ['preserve-by-config', 'physical-rename-refused', 'physical-rename-staged'];
export const PRODUCT_IDENTITY_PHYSICAL_RENAME_STAGES = ['record-event', 'pause-writes', 'copy-or-rename', 'verify-target', 'switch-binding', 'retain-marker'];
export const ENVIRONMENT_PROFILE_STATES = ['registered', 'enabled', 'disabled', 'draining'];
export const ENVIRONMENT_NETWORK_MODES = ['deny', 'allowlist', 'unrestricted'];
export const BROWSER_SANDBOX_MODES = ['enabled', 'disabled-by-declaration'];
export const CONTAINER_LIFETIMES = ['per-command', 'per-run'];
export const SEGMENT_PROCESSES = ['keepalive', 'image'];
export const SEGMENT_END_REASONS = ['idle', 'suspended', 'ended', 'lifetime', 'capacity', 'cancelled', 'crashed', 'stranded', 'unfreezable', 'quota'];
export const ENVIRONMENT_MOUNT_MODES = ['read-only', 'read-write'];
export const ENVIRONMENT_TENANT_SHARING = ['tenant-owned', 'deployment-shared'];
export const ENVIRONMENT_REUSE_POLICIES = ['none', 'run'];
export const ENVIRONMENT_SUSPENSION_DISPOSITIONS = [
    'continue-and-observe',
    'request-cancel-and-reconcile',
    'retain-ready-environment-with-expiry',
    'teardown-after-collection',
    'operator-review-required',
];
export const ENVIRONMENT_FAULTS = ['throw-before', 'throw-after', 'malformed-result', 'teardown-failure'];
export const EVIDENCE_GRADES = ['original', 'derived', 'model-generated'];
export const EXTERNAL_EVIDENCE_STANDINGS = ['sufficient', 'partial', 'missing', 'conflicting', 'opaque'];
export const EXTERNAL_EVIDENCE_CLASSIFICATIONS = ['sufficient', 'design-exclusion', 'gap'];
export const EXTERNAL_EVIDENCE_STRENGTHS = ['cryptographic', 'schema-validated', 'replayable', 'attested', 'narrated'];
export const EXTERNAL_EVIDENCE_DECISION_KINDS = ['effect-dispatch', 'verification-verdict', 'checkpoint-rejection'];
export const EXTERNAL_EVIDENCE_PROPERTY_FAMILIES = [
    'actor-identity',
    'principal-authority',
    'action-boundary',
    'policy-basis',
    'decision-basis',
    'data-and-resource-touch',
    'lifecycle-context',
    'verification-strength',
];
export const EXTERNAL_EVIDENCE_DEGRADATIONS = [
    'record-removal',
    'truncation',
    'rewrite',
    'conflicting-copies',
    'anchor-loss',
    'signer-substitution',
    'rollback',
    'narration-only',
];
export const EXTERNAL_EVIDENCE_INVARIANTS = [
    'authority-monotonicity',
    'scope-non-expansion',
    'deletion-propagation',
    'provenance-preservation',
    'rollback-traceability',
];
export const EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS = ['orbstack-linux', 'github-actions-linux'];
export const EXTERNAL_EVIDENCE_CAMPAIGN_MODES = ['fixture', 'executed'];
export const EXTERNAL_EVIDENCE_REFERENCE_VECTORS = [
    'transformation-volume',
    'http-effect',
    'parked-human-answer',
    'subject-erasure',
];
export const EXTERNAL_EVIDENCE_INVARIANT_STATUSES = ['met', 'not-met'];
export const EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES = ['zero-ar', 'conventional-agent'];
export const PUBLICATION_KINDS = ['agent', 'tool', 'procedure', 'validator', 'posture', 'task-contract', 'semantic', 'domain-pack', 'binding-profile'];
export const SKILL_ACTIVATION_POLICIES = ['progressive', 'always'];
export const SKILL_RETENTIONS = ['turn', 'checkpoint'];
export const SKILL_OPERATIONS = ['skill.open', 'skill.read', 'skill.search'];
export const ARTIFACT_OPERATIONS = ['artifact.read'];
export const GATEWAY_FAMILIES = ['signed-webhook', 'interactive-messaging'];
export const GATEWAY_OPERATIONS = ['create-run', 'observe', 'steer', 'redirect', 'answer', 'cancel', 'result'];
export const CLI_TARGET_MODES = ['bundled', 'hosted'];
export const CLI_TARGET_SOURCES = ['explicit-url', 'environment-url', 'bundled-default'];
export const PUBLICATION_EDGE_KINDS = ['requires', 'includes'];
export const PUBLICATION_BLOB_ENCODINGS = ['utf8', 'base64'];
export const AUTHORING_SOURCE_FORMS = ['yaml', 'json', 'markdown', 'typescript'];
export const AUTHORING_SCAFFOLD_KINDS = ['project', 'skill', 'tool', 'validator', 'domain-pack', 'binding-profile'];
export const PACKAGE_DISTRIBUTIONS = ['public-npm', 'private-workspace', 'signed-distribution', 'conditional-hosted', 'future-optional'];
export const PRODUCT_DISTRIBUTION_CHANNEL_KINDS = [
    'product-domain',
    'documentation-domain',
    'api-domain',
    'status-domain',
    'npm-scope',
    'source-organization',
    'container-registry-namespace',
    'chart-name',
    'command-distribution',
    'social-channel',
    'support-channel',
    'signing-identity',
];
