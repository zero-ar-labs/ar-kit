/**
 * The closed vocabularies.
 *
 * What this is: every word the runtime speaks as a state, a type, a verb, or
 * an event name, each defined exactly once. Nothing outside this file may
 * declare one of these sets, and no string may stand in for a member.
 *
 * How it fits: where a closed vocabulary appears more than once, one side is
 * generated from the other (X-7). Storage columns, wire payloads, fold
 * functions, and the terminal all import these names. Adding a word here is
 * a contract change and carries a footprint diff (DX-016).
 */
/** Model-visible entry roles. Entries form a tree; records never reach a model. */
export declare const ENTRY_ROLES: readonly ["system", "user", "assistant", "tool_result", "steer", "marker"];
export type EntryRole = (typeof ENTRY_ROLES)[number];
/** Prefixes for sortable opaque identifiers. A prefix identifies a kind and grants no authority. */
export declare const ID_PREFIXES: readonly ["run", "rec", "ent", "lea", "brn", "ctl", "gap", "eff", "ead", "agt", "chk", "wak", "pub", "env", "job", "obs"];
export type IdPrefix = (typeof ID_PREFIXES)[number];
/** Runtime record types. The canonical history is a hash-chained sequence of these. */
export declare const RECORD_TYPES: readonly ["run.created", "run.started", "entry.appended", "branch.created", "branch.head.moved", "context.assembled", "model.call.started", "model.call.finished", "model.call.failed", "model.fallback.switched", "turn.completed", "control.received", "control.applied", "lease.opened", "lease.reserved", "lease.consumed", "lease.released", "subrun.opened", "subrun.finished", "tool.invoked", "tool.remote.pending", "tool.finished", "environment.prepare.requested", "environment.prepared", "environment.job.submit.requested", "environment.job.submitted", "environment.job.observe.requested", "environment.job.observed", "environment.job.reconcile.requested", "environment.job.reconciled", "environment.job.cancel.requested", "environment.job.cancelled", "environment.artifact.collect.requested", "environment.artifact.collected", "artifact.committed", "environment.teardown.requested", "environment.teardown.recorded", "environment.abandon.requested", "environment.abandoned", "effect.prepared", "effect.authority.decision", "effect.authority.invalidated", "effect.dispatched", "effect.resolved", "effect.unreconcilable", "grant.superseded", "item.attempted", "item.parked", "item.invalidated", "gap.settled", "gap.dismissed", "checkpoint.started", "checkpoint.passed", "checkpoint.rejected", "checkpoint.indeterminate", "repair.started", "completion.proposed", "verification.concluded", "run.suspended", "run.resume.blocked", "run.resumed", "run.cancelled", "run.finished", "run.forked", "reexecution.started", "subject.erasure.completed", "wake.scheduled", "wake.claimed", "memory.event.recorded", "memory.read.recorded", "external.observation.received", "external.observation.applied", "projection.rebuilt", "run.lifecycle.command.accepted"];
export type RecordType = (typeof RECORD_TYPES)[number];
/** Events in one subject's encrypted cross-run memory stream (MEM-001 through MEM-010). */
export declare const MEMORY_EVENT_KINDS: readonly ["assertion.admitted", "assertion.superseded", "subject.erased"];
export type MemoryEventKind = (typeof MEMORY_EVENT_KINDS)[number];
/** The v1 memory lattice. A write stores the maximum level of its live supports. */
export declare const MEMORY_CLASSIFICATIONS: readonly ["public", "internal", "confidential", "restricted"];
export type MemoryClassification = (typeof MEMORY_CLASSIFICATIONS)[number];
/** Run lifecycle states. One of the four trusted state machines. */
export declare const RUN_STATUSES: readonly ["created", "running", "suspended", "cancelled", "finished"];
export type RunStatus = (typeof RUN_STATUSES)[number];
/** Completion states. The machine that makes finished a verdict, not a declaration. */
export declare const COMPLETION_STATES: readonly ["working", "checkpoint_verifying", "completion_proposed", "verifying", "gap_open", "repair", "complete", "unverified_artifact"];
export type CompletionState = (typeof COMPLETION_STATES)[number];
/** Verification verdicts. Exhausted means the repair budget ran out while checking. */
export declare const VERDICTS: readonly ["verified", "rejected", "indeterminate", "exhausted"];
export type Verdict = (typeof VERDICTS)[number];
/** Terminal outcomes a run can reach. Nothing else ends a run. */
export declare const RUN_TERMINALS: readonly ["complete", "unverified_artifact", "cancelled"];
export type RunTerminal = (typeof RUN_TERMINALS)[number];
/** Why a run is suspended rather than running. Suspension is resumable, never terminal. */
export declare const SUSPEND_REASONS: readonly ["budget_exhausted", "provider_failure", "awaiting_answer", "operator_pause", "stagnation", "remote_task"];
export type SuspendReason = (typeof SUSPEND_REASONS)[number];
/** Why a resume preflight left the canonical run suspended. */
export declare const RUN_RESUME_BLOCK_CATEGORIES: readonly ["budget-unavailable", "answers-outstanding", "storage-unready", "authority-unready", "remote-task-pending"];
export type RunResumeBlockCategory = (typeof RUN_RESUME_BLOCK_CATEGORIES)[number];
/** What a lease meters. Attention is a person's time and is leased like tokens. */
export declare const LEASE_DENOMINATIONS: readonly ["model_tokens", "tool_calls", "bytes", "compute_ms", "attention"];
export type LeaseDenomination = (typeof LEASE_DENOMINATIONS)[number];
/** Which pool a lease draws from. Verification is reserved and undrawable by work (K-17). */
export declare const LEASE_POOLS: readonly ["work", "verification", "repair"];
export type LeasePool = (typeof LEASE_POOLS)[number];
/** Per-lease lifecycle. Reserve before spend; settle with actuals; charge on loss. */
export declare const LEASE_STATES: readonly ["reserved", "settled", "charged"];
export type LeaseState = (typeof LEASE_STATES)[number];
/** The four control verbs. Distinct operations, not one interrupt (KRN-026). */
export declare const CONTROL_VERBS: readonly ["steer", "redirect", "cancel", "answer"];
export type ControlVerb = (typeof CONTROL_VERBS)[number];
/** Why a branch exists. Repair and forks branch; history is never rewritten. */
export declare const BRANCH_REASONS: readonly ["original", "steer", "redirect", "repair", "reexecution", "fork"];
export type BranchReason = (typeof BRANCH_REASONS)[number];
/** How a model stream ended. Provider failures are in-band; adapter defects raise (X-3). */
export declare const STOP_REASONS: readonly ["end_turn", "completion_proposal", "max_output", "cancelled", "redirected", "provider_failure"];
export type StopReason = (typeof STOP_REASONS)[number];
/** Effect lifecycle states. Withdrawn is the authorized non-dispatch end (EFX-023). */
export declare const EFFECT_STATES: readonly ["prepared", "dispatched", "committed", "withdrawn", "outcome_unknown", "unreconcilable"];
export type EffectState = (typeof EFFECT_STATES)[number];
/** The only caller choices at the exact prepared-effect authority boundary. */
export declare const EFFECT_AUTHORITY_DECISIONS: readonly ["approve", "refuse"];
export type EffectAuthorityDecision = (typeof EFFECT_AUTHORITY_DECISIONS)[number];
/** What the authority durably concluded when it received a decision. */
export declare const EFFECT_AUTHORITY_DISPOSITIONS: readonly ["approved", "refused", "expired"];
export type EffectAuthorityDisposition = (typeof EFFECT_AUTHORITY_DISPOSITIONS)[number];
/** Why a recorded approval no longer admits dispatch. */
export declare const EFFECT_AUTHORITY_INVALIDATION_REASONS: readonly ["expired", "authority-epoch-changed", "scope-epoch-changed"];
export type EffectAuthorityInvalidationReason = (typeof EFFECT_AUTHORITY_INVALIDATION_REASONS)[number];
/** Terminal effects carry no authority-bearing work that can dispatch again. */
export declare function isTerminalEffectState(state: EffectState): boolean;
/** Non-terminal effects remain owned by dispatch or reconciliation (EFX-021). */
export declare function isNonTerminalEffectState(state: EffectState): boolean;
/**
 * Receipt assurance classes (EFX-019). Each names who vouched: the owner's
 * own signature, the dispatcher's authenticated channel, or authenticated
 * reconciliation after the fact. No assurance means no commit.
 */
export declare const RECEIPT_ASSURANCES: readonly ["owner-signed", "authenticated-response", "authenticated-reconciliation"];
export type ReceiptAssurance = (typeof RECEIPT_ASSURANCES)[number];
/** Owner outcomes a receipt can carry. already_applied is the idempotency rung answering a retry. */
export declare const RECEIPT_OUTCOMES: readonly ["applied", "already_applied", "refused"];
export type ReceiptOutcome = (typeof RECEIPT_OUTCOMES)[number];
/** Work presented to a reviewer. Unsupported kinds never appear as placeholders. */
export declare const REVIEW_ITEM_KINDS: readonly ["gap", "human-validator", "approval"];
export type ReviewItemKind = (typeof REVIEW_ITEM_KINDS)[number];
/** The review inbox contains open work only; settlement leaves the projection. */
export declare const REVIEW_ITEM_STATES: readonly ["pending"];
export type ReviewItemState = (typeof REVIEW_ITEM_STATES)[number];
/** Whether a run currently has tenant-visible review work. */
export declare const RUN_REVIEW_STATES: readonly ["pending", "none"];
export type RunReviewState = (typeof RUN_REVIEW_STATES)[number];
/** Work-state ledger positions (QLT-020). The agent's own claim never reaches verified. */
export declare const ITEM_STATES: readonly ["untouched", "completed_unverified", "verified", "parked", "dismissed", "failed", "invalidated"];
export type ItemState = (typeof ITEM_STATES)[number];
/** Validator classes with different verdict authority (Q-7). */
export declare const VALIDATOR_CLASSES: readonly ["deterministic", "sampled-oracle", "heuristic", "named-human"];
export type ValidatorClass = (typeof VALIDATOR_CLASSES)[number];
/** Outcomes a validator implementation must be able to report. */
export declare const VALIDATOR_OUTCOMES: readonly ["pass", "reject", "indeterminate"];
export type ValidatorOutcomeKind = (typeof VALIDATOR_OUTCOMES)[number];
/** What a claim asserts about its own standing (Q-20). Open means unresolved on purpose. */
export declare const CLAIM_LABELS: readonly ["guarantee", "assumption", "heuristic", "open"];
export type ClaimLabel = (typeof CLAIM_LABELS)[number];
/**
 * Claim representations a contract may declare. Evidence-completeness wording
 * attaches only to the structured form; a contract that declares nothing gets
 * no such wording anywhere (CLM-001).
 */
export declare const CLAIM_REPRESENTATIONS: readonly ["structured-claims-with-citations"];
export type ClaimRepresentation = (typeof CLAIM_REPRESENTATIONS)[number];
/** Failure classes stay distinguished so repair knows what kind of wrong it got (Q-10). */
export declare const FAILURE_CLASSES: readonly ["shape", "domain", "grounding", "infrastructure"];
export type FailureClass = (typeof FAILURE_CLASSES)[number];
/** Tool operation classes (EXT-003). Unknown resolves to effect-proposal, never quieter. */
export declare const OPERATION_CLASSES: readonly ["observation", "run-internal", "effect-proposal"];
export type OperationClass = (typeof OPERATION_CLASSES)[number];
/**
 * How a tool's consumption is bounded (BUD-005). enforced reserves a
 * declared maximum before invocation; unmetered cannot, runs at lowered
 * trust, and sits outside every hard spend bound; effect-governed spend
 * is bounded by grants in the effect plane, not by a tool lease.
 */
export declare const TOOL_METERING: readonly ["enforced", "unmetered", "effect-governed"];
export type ToolMetering = (typeof TOOL_METERING)[number];
/** Deployment profiles. Every run names its profile and its exclusions (C-OPS-PROFILE-HONESTY-010). */
export declare const PROFILES: readonly ["local-lite", "full-cell", "small-production", "regulated"];
export type Profile = (typeof PROFILES)[number];
/** Profile capability ids used by the first-beta manifest. */
export declare const PROFILE_CAPABILITIES: readonly ["hosted-postgresql-service", "local-lite", "transformation-volume-reference-pack", "provider-openai", "provider-anthropic", "provider-openrouter", "provider-together", "provider-fireworks", "aggregator-composio-observation", "aggregator-merge-observation", "restricted-effect-plane-attachment", "environment-process", "environment-oci", "environment-ssh", "environment-firecracker", "environment-cloudflare-sandbox", "environment-modal", "environment-daytona", "environment-vercel-sandbox", "environment-apptainer", "full-cell-docker-linux", "canonical-log", "quality-plane", "artifacts", "suspension", "honest-completion", "unattended-aggregator-mutations", "dynamic-authority", "production-effect-dispatch", "research-reference-pack", "video-reference-pack", "native-packaged-self-hosting", "classification-airlocks", "regulated-workloads", "cross-run-memory", "authored-orchestration", "mcp-work-entrypoints", "mcp-imported-tools"];
export type ProfileCapability = (typeof PROFILE_CAPABILITIES)[number];
/** Capability manifest states. Every capability appears once in one state. */
export declare const PROFILE_CAPABILITY_STATES: readonly ["supported", "conditional", "excluded"];
export type ProfileCapabilityState = (typeof PROFILE_CAPABILITY_STATES)[number];
/** Product placement for an environment adapter in the first hosted release. */
export declare const ENVIRONMENT_PRODUCT_STATES: readonly ["default-supported", "conditional-supported", "future-optional"];
export type EnvironmentProductState = (typeof ENVIRONMENT_PRODUCT_STATES)[number];
/** Whether the real-host evidence attached to one environment is usable now. */
export declare const ENVIRONMENT_ACCEPTANCE_STATES: readonly ["not-required", "pending", "current", "expired", "mismatched"];
export type EnvironmentAcceptanceState = (typeof ENVIRONMENT_ACCEPTANCE_STATES)[number];
/** Conditional backends whose packages are mounted into a deployment explicitly. */
export declare const CONDITIONAL_ENVIRONMENT_BACKENDS: readonly ["ssh", "firecracker", "apptainer"];
export type ConditionalEnvironmentBackend = (typeof CONDITIONAL_ENVIRONMENT_BACKENDS)[number];
/** The boundary where an excluded capability refuses. */
export declare const PROFILE_CAPABILITY_REFUSAL_POINTS: readonly ["profile-compilation", "publication", "registration", "intake", "route", "not-applicable"];
export type ProfileCapabilityRefusalPoint = (typeof PROFILE_CAPABILITY_REFUSAL_POINTS)[number];
/** Deployment components a profile may require or probe. */
export declare const PROFILE_COMPONENTS: readonly ["store", "migration", "queue", "artifact", "secret_store", "tool_host", "validator_host", "authority", "memory", "orchestration", "effect", "mcp"];
export type ProfileComponent = (typeof PROFILE_COMPONENTS)[number];
/** External protocols described by one immutable interoperability binding. */
export declare const INTEROP_PROTOCOLS: readonly ["mcp", "a2a"];
export type InteropProtocol = (typeof INTEROP_PROTOCOLS)[number];
/** Which side initiates work through one interoperability binding. */
export declare const INTEROP_DIRECTIONS: readonly ["client", "server"];
export type InteropDirection = (typeof INTEROP_DIRECTIONS)[number];
/** Tenant identity always comes from an authenticated deployment-owned rule. */
export declare const INTEROP_TENANT_DERIVATIONS: readonly ["authenticated-principal"];
export type InteropTenantDerivation = (typeof INTEROP_TENANT_DERIVATIONS)[number];
/** Consequences outside Zero-AR remain explicit even when a peer omits metadata. */
export declare const INTEROP_REMOTE_CONSEQUENCE_POSTURES: readonly ["none", "declared-external", "unknown"];
export type InteropRemoteConsequencePosture = (typeof INTEROP_REMOTE_CONSEQUENCE_POSTURES)[number];
/** Progressive deployment states for an optional protocol surface. */
export declare const INTEROP_CAPABILITY_STATES: readonly ["implemented", "configured", "healthy", "admitted", "selectable"];
export type InteropCapabilityState = (typeof INTEROP_CAPABILITY_STATES)[number];
/** Task states defined by the MCP Tasks extension. */
export declare const MCP_TASK_STATUSES: readonly ["working", "input_required", "completed", "failed", "cancelled"];
export type McpTaskStatus = (typeof MCP_TASK_STATUSES)[number];
/** Durable states for an imported MCP call whose answer is not final yet. */
export declare const MCP_REMOTE_TASK_STATES: readonly ["working", "input_required", "outcome_unknown"];
export type McpRemoteTaskState = (typeof MCP_REMOTE_TASK_STATES)[number];
/** How an imported MCP call reached its durable non-terminal state. */
export declare const MCP_REMOTE_TASK_CAUSES: readonly ["peer-task", "transport-loss"];
export type McpRemoteTaskCause = (typeof MCP_REMOTE_TASK_CAUSES)[number];
/** Terminal distinctions retained for every native and imported tool call. */
export declare const TOOL_EXECUTION_OUTCOMES: readonly ["success", "tool-error", "protocol-error", "malformed-response", "transport-loss", "outcome-unknown"];
export type ToolExecutionOutcome = (typeof TOOL_EXECUTION_OUTCOMES)[number];
/** Native completion distinctions retained inside an external assurance envelope. */
export declare const ASSURANCE_COMPLETION_CLASSES: readonly ["working", "verified", "unverified", "rejected", "indeterminate", "exhausted", "cancelled"];
export type AssuranceCompletionClass = (typeof ASSURANCE_COMPLETION_CLASSES)[number];
/** The strongest unresolved effect condition visible in a result projection. */
export declare const ASSURANCE_EFFECT_DISPOSITIONS: readonly ["none", "settled", "open", "outcome-unknown", "unreconcilable"];
export type AssuranceEffectDisposition = (typeof ASSURANCE_EFFECT_DISPOSITIONS)[number];
/** Cache scope retained with immutable MCP discovery snapshots. */
export declare const INTEROP_CACHE_SCOPES: readonly ["private", "public"];
export type InteropCacheScope = (typeof INTEROP_CACHE_SCOPES)[number];
/** Artifact backends named by capability manifests. */
export declare const ARTIFACT_BACKENDS: readonly ["filesystem", "s3-compatible"];
export type ArtifactBackend = (typeof ARTIFACT_BACKENDS)[number];
/** The two places a product may bind a committed runtime artifact. */
export declare const RUNTIME_ARTIFACT_INTENDED_USES: readonly ["run", "intake"];
export type RuntimeArtifactIntendedUseKind = (typeof RUNTIME_ARTIFACT_INTENDED_USES)[number];
/** Effect plane modes named by capability manifests. */
export declare const EFFECT_PLANE_MODES: readonly ["absent", "restricted-attachment", "dynamic-authority"];
export type EffectPlaneMode = (typeof EFFECT_PLANE_MODES)[number];
/** Primary product areas. Every public operation belongs to exactly one. */
export declare const PRODUCT_AREAS: readonly ["administration", "build-and-publish", "run", "review-and-authority", "results-and-audit"];
export type ProductArea = (typeof PRODUCT_AREAS)[number];
/** Media types carried by the public native API contract. */
export declare const API_MEDIA_TYPES: readonly ["application/json", "application/octet-stream", "application/x-ndjson", "text/event-stream"];
export type ApiMediaType = (typeof API_MEDIA_TYPES)[number];
/** Primitive query types the route registry can publish into client contracts. */
export declare const API_QUERY_PARAMETER_TYPES: readonly ["string", "integer", "boolean"];
export type ApiQueryParameterType = (typeof API_QUERY_PARAMETER_TYPES)[number];
/** Public authorization modes used by route enforcement. */
export declare const AUTHORIZATION_MODES: readonly ["trusted-local", "scoped"];
export type AuthorizationMode = (typeof AUTHORIZATION_MODES)[number];
/** Public route authorities. Every protected API route cites these names. */
export declare const ROUTE_SCOPES: readonly ["artifact:write", "credential:read", "credential:revoke", "credential:rotate", "credential:write", "environment:abandon", "environment:cancel", "environment:conformance", "environment:read", "environment:reconcile", "environment:teardown", "environment:write", "effect:approve", "memory:erase", "memory:read", "memory:write", "operator:audit", "operator:drain", "operator:erase", "operator:governance", "operator:rebuild", "operator:reconcile", "operator:restore", "observation:write", "platform:adapter-admit", "provider:read", "provider:write", "publication:create", "publication:read", "registry:alias", "registry:deprecate", "registry:quarantine", "review:answer", "review:read", "run:cancel", "run:control", "run:create", "run:fork", "run:read", "run:reexecute", "run:resume", "run:start", "tool-source:read", "tool-source:test", "tool-source:write"];
export type RouteScope = (typeof ROUTE_SCOPES)[number];
/** Product channels accepted as observation provenance, not as authority. */
export declare const EXTERNAL_OBSERVATION_CHANNELS: readonly ["web", "mobile", "voice", "sms", "email", "chat", "system", "other"];
export type ExternalObservationChannel = (typeof EXTERNAL_OBSERVATION_CHANNELS)[number];
/** Signature algorithms admitted by the first deployment-owned participant verifier. */
export declare const OIDC_JWT_ALGORITHMS: readonly ["RS256"];
export type OidcJwtAlgorithm = (typeof OIDC_JWT_ALGORITHMS)[number];
/** Provider families admitted by the first hosted provider contract. */
export declare const MODEL_PROVIDERS: readonly ["scripted", "openai", "anthropic", "openrouter", "together", "fireworks", "openai-compatible"];
export type ModelProvider = (typeof MODEL_PROVIDERS)[number];
/** Wire translators implemented by the runtime. Profiles never replace these identities. */
export declare const MODEL_PROTOCOL_ADAPTERS: readonly ["scripted", "openai-chat-completions", "anthropic-messages"];
export type ModelProtocolAdapter = (typeof MODEL_PROTOCOL_ADAPTERS)[number];
/** Tested defaults and declared deviations applied to one protocol adapter. */
export declare const MODEL_PROVIDER_PROFILES: readonly ["scripted", "openai", "anthropic", "openrouter", "together", "fireworks", "generic-openai-compatible", "litellm", "ollama"];
export type ModelProviderProfile = (typeof MODEL_PROVIDER_PROFILES)[number];
/** How a provider instance obtains model inventory outside the run path. */
export declare const MODEL_CATALOGUE_SOURCES: readonly ["declared", "provider-api", "openai-compatible-models"];
export type ModelCatalogueSource = (typeof MODEL_CATALOGUE_SOURCES)[number];
/** Credential treatment is explicit, including endpoints that need no authorization header. */
export declare const MODEL_CREDENTIAL_MODES: readonly ["binding", "none"];
export type ModelCredentialMode = (typeof MODEL_CREDENTIAL_MODES)[number];
/** Compatibility claims do not inherit across providers that share one wire format. */
export declare const MODEL_COMPATIBILITY_STATES: readonly ["supported", "unsupported", "unknown"];
export type ModelCompatibilityState = (typeof MODEL_COMPATIBILITY_STATES)[number];
/** Provider token counts may be usable, advisory, absent, or locally estimated. */
export declare const MODEL_USAGE_MEASUREMENTS: readonly ["reported", "untrusted", "absent", "estimated"];
export type ModelUsageMeasurement = (typeof MODEL_USAGE_MEASUREMENTS)[number];
/** Tool-aggregator providers supported by the first hosted beta. */
export declare const AGGREGATOR_PROVIDERS: readonly ["composio", "merge-agent-handler", "merge-unified"];
export type AggregatorProviderName = (typeof AGGREGATOR_PROVIDERS)[number];
/** Purposes permitted for tenant credential bindings. */
export declare const PROVIDER_CREDENTIAL_PURPOSES: readonly ["openai", "anthropic", "openrouter", "together", "fireworks", "openai-compatible", "composio", "merge-agent-handler", "merge-unified", "mcp", "s3-compatible-artifact-store"];
export type ProviderCredentialPurpose = (typeof PROVIDER_CREDENTIAL_PURPOSES)[number];
/** Non-secret credential lifecycle states exposed by administration. */
export declare const CREDENTIAL_BINDING_STATES: readonly ["active", "revoked"];
export type CredentialBindingState = (typeof CREDENTIAL_BINDING_STATES)[number];
/** Durable control-plane states for provider instances and discovered models. */
export declare const PROVIDER_INSTANCE_STATES: readonly ["configured", "ready", "revoked"];
export type ProviderInstanceState = (typeof PROVIDER_INSTANCE_STATES)[number];
export declare const PROVIDER_MODEL_STATES: readonly ["discovered", "enabled", "disabled"];
export type ProviderModelState = (typeof PROVIDER_MODEL_STATES)[number];
/** Durable control-plane states for tenant tool-aggregator sources. */
export declare const TOOL_SOURCE_STATES: readonly ["configured", "ready", "disabled", "revoked", "removed"];
export type ToolSourceState = (typeof TOOL_SOURCE_STATES)[number];
export declare const TOOL_SOURCE_TOOL_STATES: readonly ["discovered", "enabled", "disabled"];
export type ToolSourceToolState = (typeof TOOL_SOURCE_TOOL_STATES)[number];
/** Storage kinds a deployment can wire. Profiles name which they require. */
export declare const STORE_KINDS: readonly ["sqlite", "postgres"];
export type StoreKind = (typeof STORE_KINDS)[number];
/** PostgreSQL modes a packaged hosted cell can select at startup. */
export declare const POSTGRES_DEPLOYMENT_MODES: readonly ["colocated", "external"];
export type PostgresDeploymentMode = (typeof POSTGRES_DEPLOYMENT_MODES)[number];
/** PostgreSQL latency report topologies measured before a UAT evidence claim. */
export declare const POSTGRES_LATENCY_TOPOLOGIES: readonly ["colocated", "same-region-external", "controlled-added-latency"];
export type PostgresLatencyTopology = (typeof POSTGRES_LATENCY_TOPOLOGIES)[number];
/** PostgreSQL latency report operations on the canonical-log control path. */
export declare const POSTGRES_LATENCY_OPERATIONS: readonly ["append", "reconstruction", "checkpoint", "representative-run-transition"];
export type PostgresLatencyOperation = (typeof POSTGRES_LATENCY_OPERATIONS)[number];
/** PostgreSQL latency report standing. Fixture format checks are not UAT evidence. */
export declare const POSTGRES_LATENCY_REPORT_STATUSES: readonly ["fixture-format-only", "uat-measured"];
export type PostgresLatencyReportStatus = (typeof POSTGRES_LATENCY_REPORT_STATUSES)[number];
/**
 * Optimization controller modes (MTH-002). Resolved configuration values,
 * not lifecycle states: off computes nothing, observe recommends without
 * touching a run, enforce acts and pins transitively.
 */
export declare const CONTROLLER_MODES: readonly ["off", "observe", "enforce"];
export type ControllerMode = (typeof CONTROLLER_MODES)[number];
/** Workspace mount slots (EXT-018). The slot decides what classes its operations may carry. */
export declare const WORKSPACE_SLOTS: readonly ["runtime-scratch", "customer-readable-external"];
export type WorkspaceSlot = (typeof WORKSPACE_SLOTS)[number];
/** What a domain-pack machine claim asserts (XCV-012). Limitations are claims too. */
export declare const PACK_CLAIM_KINDS: readonly ["capability", "coverage", "limitation"];
export type PackClaimKind = (typeof PACK_CLAIM_KINDS)[number];
/** Diagnostic severities. Severity depends on what happens next, not on drama. */
export declare const DIAGNOSTIC_SEVERITIES: readonly ["error", "warning", "info"];
export type DiagnosticSeverity = (typeof DIAGNOSTIC_SEVERITIES)[number];
/**
 * The complete durable observation vocabulary from ERD 9.3. The runtime
 * publishes the subset its current phase emits; the vocabulary itself is
 * closed and stable so clients never meet an unnamed event.
 */
export declare const DURABLE_EVENTS: readonly ["run.started", "turn.completed", "checkpoint.started", "checkpoint.passed", "checkpoint.rejected", "checkpoint.indeterminate", "gap.settled", "gap.dismissed", "item.parked", "item.invalidated", "effect.prepared", "effect.authority.decision", "effect.authority.invalidated", "effect.dispatched", "effect.resolved", "effect.unreconcilable", "subrun.opened", "subrun.finished", "tool.invoked", "tool.remote.pending", "tool.finished", "environment.prepared", "environment.job.submitted", "environment.job.observed", "environment.job.reconciled", "environment.job.cancelled", "environment.artifact.collected", "artifact.committed", "environment.teardown.recorded", "environment.abandoned", "lease.reserved", "lease.consumed", "lease.released", "grant.superseded", "subject.erasure.completed", "completion.proposed", "verification.concluded", "run.cancelled", "run.suspended", "run.resume.blocked", "run.resumed", "run.forked", "reexecution.started", "projection.rebuilt", "run.finished", "external.observation.received", "external.observation.applied"];
export type DurableEvent = (typeof DURABLE_EVENTS)[number];
/** Product-facing families on the resumable record stream. */
export declare const PRODUCT_EVENT_FAMILIES: readonly ["work", "review", "artifact", "quality", "effect", "terminal", "consumption", "environment", "maintenance"];
export type ProductEventFamily = (typeof PRODUCT_EVENT_FAMILIES)[number];
/** Where a public product mutation obtains the identity that makes retries converge. */
export declare const PRODUCT_MUTATION_IDEMPOTENCY_SOURCES: readonly ["request-idempotency-key", "request-control-id", "artifact-session-key"];
export type ProductMutationIdempotencySource = (typeof PRODUCT_MUTATION_IDEMPOTENCY_SOURCES)[number];
/** Lifecycle commands exposed to product backends. Detached changes response ownership, not run semantics. */
export declare const RUN_LIFECYCLE_COMMANDS: readonly ["start", "resume", "resume-deferred"];
export type RunLifecycleCommand = (typeof RUN_LIFECYCLE_COMMANDS)[number];
/**
 * Where a capability executes, from the engine process outward. A declared
 * tier is a boundary the wiring must actually host, never a label
 * (C-SEC-BOUNDARIES-DEFAULT-DENY-007).
 */
export declare const TRUST_TIERS: readonly ["none", "process", "container", "remote"];
export type TrustTier = (typeof TRUST_TIERS)[number];
/** Provider families behind the versioned environment lifecycle. */
export declare const ENVIRONMENT_BACKENDS: readonly ["process", "oci", "ssh", "firecracker", "cloudflare-sandbox", "modal", "daytona", "vercel-sandbox", "apptainer"];
export type EnvironmentBackend = (typeof ENVIRONMENT_BACKENDS)[number];
/** The exact boundary an environment profile claims. */
export declare const ENVIRONMENT_ISOLATIONS: readonly ["none", "process", "container", "remote-host", "microvm", "hosted-sandbox"];
export type EnvironmentIsolation = (typeof ENVIRONMENT_ISOLATIONS)[number];
/** Remote schedulers the SSH environment adapter can declare and pin. */
export declare const ENVIRONMENT_SSH_SCHEDULERS: readonly ["direct", "slurm"];
export type EnvironmentSshScheduler = (typeof ENVIRONMENT_SSH_SCHEDULERS)[number];
/** How Zero-AR reaches one Cloudflare Sandbox deployment. */
export declare const ENVIRONMENT_CLOUDFLARE_CONNECTION_MODES: readonly ["worker-binding", "authenticated-bridge"];
export type EnvironmentCloudflareConnectionMode = (typeof ENVIRONMENT_CLOUDFLARE_CONNECTION_MODES)[number];
/** The Sandbox SDK transport pinned inside the Worker deployment. */
export declare const ENVIRONMENT_CLOUDFLARE_TRANSPORT_MODES: readonly ["rpc"];
export type EnvironmentCloudflareTransportMode = (typeof ENVIRONMENT_CLOUDFLARE_TRANSPORT_MODES)[number];
/** Separately reported timing and transfer dimensions for environment work. */
export declare const ENVIRONMENT_MEASUREMENT_PHASES: readonly ["server-cold-start", "adapter-coordinator-overhead", "environment-cold-start", "environment-warm-start", "submit-to-running", "observation", "reconciliation", "cancellation", "teardown", "artifact-upload-throughput", "artifact-download-throughput"];
export type EnvironmentMeasurementPhase = (typeof ENVIRONMENT_MEASUREMENT_PHASES)[number];
/** Units stay explicit so latency and transfer rates cannot be combined. */
export declare const ENVIRONMENT_MEASUREMENT_UNITS: readonly ["milliseconds", "bytes-per-second"];
export type EnvironmentMeasurementUnit = (typeof ENVIRONMENT_MEASUREMENT_UNITS)[number];
/** Signature algorithms admitted for environment adapter release manifests. */
export declare const ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS: readonly ["ed25519"];
export type EnvironmentReleaseSignatureAlgorithm = (typeof ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS)[number];
/** One contract, including descriptor discovery and every lifecycle operation. */
export declare const ENVIRONMENT_LIFECYCLE_OPERATIONS: readonly ["descriptor", "prepare", "submit", "observe", "reconcile", "cancel", "collect", "teardown", "abandon"];
export type EnvironmentLifecycleOperation = (typeof ENVIRONMENT_LIFECYCLE_OPERATIONS)[number];
/** Normalized lifecycle observations. Provider-native status remains provider data. */
export declare const ENVIRONMENT_STATUSES: readonly ["preparing", "ready", "submitted", "running", "collectible", "collected", "cancel-requested", "cancelled", "outcome-unknown", "failed", "teardown-pending", "torn-down", "abandoned"];
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUSES)[number];
/** Public statuses for the local identity data-directory migration plan. */
export declare const PRODUCT_LOCAL_MIGRATION_STATUSES: readonly ["empty", "ready", "migrated", "recoverable", "refused", "rolled-back"];
export type ProductLocalMigrationStatus = (typeof PRODUCT_LOCAL_MIGRATION_STATUSES)[number];
export declare const PRODUCT_SOURCE_API_VERSIONS: readonly ["ramsden/v1", "zero-ar/v1"];
export type ProductSourceApiVersion = (typeof PRODUCT_SOURCE_API_VERSIONS)[number];
export declare const PRODUCT_RUN_BUNDLE_FORMATS: readonly ["ramsden-run-bundle", "zero-ar-run-bundle"];
export type ProductRunBundleFormat = (typeof PRODUCT_RUN_BUNDLE_FORMATS)[number];
export declare const PRODUCT_SBOM_FORMATS: readonly ["ramsden-sbom-2", "zero-ar-sbom-1"];
export type ProductSbomFormat = (typeof PRODUCT_SBOM_FORMATS)[number];
/** Developer-facing files that must ship as release artifacts during identity migration. */
export declare const PRODUCT_CLI_RELEASE_ARTIFACT_KINDS: readonly ["shell-completion", "manpage", "install-script", "service-unit", "example"];
export type ProductCliReleaseArtifactKind = (typeof PRODUCT_CLI_RELEASE_ARTIFACT_KINDS)[number];
/** Release artifact families governed by product identity signing policy. */
export declare const PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS: readonly ["npm-package-set", "full-cell-release", "legacy-artifact"];
export type ProductReleaseSigningArtifactKind = (typeof PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS)[number];
/** Why release signing material is admitted during the identity migration. */
export declare const PRODUCT_RELEASE_SIGNING_PURPOSES: readonly ["successor-release", "legacy-history"];
export type ProductReleaseSigningPurpose = (typeof PRODUCT_RELEASE_SIGNING_PURPOSES)[number];
export declare const PRODUCT_EGRESS_REVIEW_PURPOSES: readonly ["model-provider", "artifact-store", "artifact-health", "tool-provider", "effect-target", "oauth-redirect", "webhook-callback"];
export type ProductEgressReviewPurpose = (typeof PRODUCT_EGRESS_REVIEW_PURPOSES)[number];
/** How a package participates in the Zero-AR package graph during migration. */
export declare const PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES: readonly ["legacy", "successor", "legacy-wrapper"];
export type ProductPackageImplementationIdentity = (typeof PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES)[number];
/** Public package-graph outcomes reported by the identity migration guard. */
export declare const PRODUCT_PACKAGE_GRAPH_STATES: readonly ["legacy-compatible", "successor-compatible", "mixed-incompatible"];
export type ProductPackageGraphState = (typeof PRODUCT_PACKAGE_GRAPH_STATES)[number];
/** Operator/governance surfaces where identity migration changes live behaviour. */
export declare const PRODUCT_IDENTITY_MIGRATION_IMPACTS: readonly ["deployment", "publication-namespace", "compatibility-policy"];
export type ProductIdentityMigrationImpact = (typeof PRODUCT_IDENTITY_MIGRATION_IMPACTS)[number];
/** Deployment targets covered by the identity migration plan. */
export declare const PRODUCT_IDENTITY_DEPLOYMENT_TARGETS: readonly ["local-lite", "hosted-cell", "full-cell", "tool-host", "validator-host", "dispatcher", "optional-services"];
export type ProductIdentityDeploymentTarget = (typeof PRODUCT_IDENTITY_DEPLOYMENT_TARGETS)[number];
/** Operator-owned identifiers that a product rename must not move implicitly. */
export declare const PRODUCT_IDENTITY_DEPLOYMENT_IDENTIFIER_KINDS: readonly ["database", "database-role", "database-schema", "object-store-prefix", "kubernetes-namespace", "secret-name", "service-account"];
export type ProductIdentityDeploymentIdentifierKind = (typeof PRODUCT_IDENTITY_DEPLOYMENT_IDENTIFIER_KINDS)[number];
/** Physical identifier rename decisions for product identity migration. */
export declare const PRODUCT_IDENTITY_PHYSICAL_RENAME_ACTIONS: readonly ["preserve-by-config", "physical-rename-refused", "physical-rename-staged"];
export type ProductIdentityPhysicalRenameAction = (typeof PRODUCT_IDENTITY_PHYSICAL_RENAME_ACTIONS)[number];
/** Ordered stages for an explicit physical identifier rename procedure. */
export declare const PRODUCT_IDENTITY_PHYSICAL_RENAME_STAGES: readonly ["record-event", "pause-writes", "copy-or-rename", "verify-target", "switch-binding", "retain-marker"];
export type ProductIdentityPhysicalRenameStage = (typeof PRODUCT_IDENTITY_PHYSICAL_RENAME_STAGES)[number];
/** Operator-controlled profile availability. Profiles themselves stay immutable. */
export declare const ENVIRONMENT_PROFILE_STATES: readonly ["registered", "enabled", "disabled", "draining"];
export type EnvironmentProfileState = (typeof ENVIRONMENT_PROFILE_STATES)[number];
/** Declared workload network posture. */
export declare const ENVIRONMENT_NETWORK_MODES: readonly ["deny", "allowlist", "unrestricted"];
export type EnvironmentNetworkMode = (typeof ENVIRONMENT_NETWORK_MODES)[number];
/** Mount mutability in one admitted profile. */
export declare const ENVIRONMENT_MOUNT_MODES: readonly ["read-only", "read-write"];
export type EnvironmentMountMode = (typeof ENVIRONMENT_MOUNT_MODES)[number];
/** Whether an environment resource belongs to one tenant or the deployment. */
export declare const ENVIRONMENT_TENANT_SHARING: readonly ["tenant-owned", "deployment-shared"];
export type EnvironmentTenantSharing = (typeof ENVIRONMENT_TENANT_SHARING)[number];
/** What suspension does with one nonterminal environment handle. */
export declare const ENVIRONMENT_SUSPENSION_DISPOSITIONS: readonly ["continue-and-observe", "request-cancel-and-reconcile", "retain-ready-environment-with-expiry", "teardown-after-collection", "operator-review-required"];
export type EnvironmentSuspensionDisposition = (typeof ENVIRONMENT_SUSPENSION_DISPOSITIONS)[number];
/** Deterministic conformance faults, never provider production status. */
export declare const ENVIRONMENT_FAULTS: readonly ["throw-before", "throw-after", "malformed-result", "teardown-failure"];
export type EnvironmentFault = (typeof ENVIRONMENT_FAULTS)[number];
/**
 * How close cited material stands to its origin: bytes a person or an
 * external system supplied, bytes an admitted tool computed, or bytes a
 * model generated (CTX-002).
 */
export declare const EVIDENCE_GRADES: readonly ["original", "derived", "model-generated"];
export type EvidenceGrade = (typeof EVIDENCE_GRADES)[number];
/** External evidence report standings. Uncertain evidence never upgrades itself. */
export declare const EXTERNAL_EVIDENCE_STANDINGS: readonly ["sufficient", "partial", "missing", "conflicting", "opaque"];
export type ExternalEvidenceStanding = (typeof EXTERNAL_EVIDENCE_STANDINGS)[number];
/** Why a property stands or does not stand in an external evidence report. */
export declare const EXTERNAL_EVIDENCE_CLASSIFICATIONS: readonly ["sufficient", "design-exclusion", "gap"];
export type ExternalEvidenceClassification = (typeof EXTERNAL_EVIDENCE_CLASSIFICATIONS)[number];
/** How a property is backed inside an external evidence report. */
export declare const EXTERNAL_EVIDENCE_STRENGTHS: readonly ["cryptographic", "schema-validated", "replayable", "attested", "narrated"];
export type ExternalEvidenceStrength = (typeof EXTERNAL_EVIDENCE_STRENGTHS)[number];
/** The decision families scored by the external-evidence adapter. */
export declare const EXTERNAL_EVIDENCE_DECISION_KINDS: readonly ["effect-dispatch", "verification-verdict", "checkpoint-rejection"];
export type ExternalEvidenceDecisionKind = (typeof EXTERNAL_EVIDENCE_DECISION_KINDS)[number];
/** The DEMM property families as read by the external evidence appendix. */
export declare const EXTERNAL_EVIDENCE_PROPERTY_FAMILIES: readonly ["actor-identity", "principal-authority", "action-boundary", "policy-basis", "decision-basis", "data-and-resource-touch", "lifecycle-context", "verification-strength"];
export type ExternalEvidencePropertyFamily = (typeof EXTERNAL_EVIDENCE_PROPERTY_FAMILIES)[number];
/** Bundle degradations applied by the external evidence campaign. */
export declare const EXTERNAL_EVIDENCE_DEGRADATIONS: readonly ["record-removal", "truncation", "rewrite", "conflicting-copies", "anchor-loss", "signer-substitution", "rollback", "narration-only"];
export type ExternalEvidenceDegradation = (typeof EXTERNAL_EVIDENCE_DEGRADATIONS)[number];
/** AOEP invariants scored from reference episodes. */
export declare const EXTERNAL_EVIDENCE_INVARIANTS: readonly ["authority-monotonicity", "scope-non-expansion", "deletion-propagation", "provenance-preservation", "rollback-traceability"];
export type ExternalEvidenceInvariant = (typeof EXTERNAL_EVIDENCE_INVARIANTS)[number];
/** Execution environments admitted for the external evidence campaign. */
export declare const EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS: readonly ["orbstack-linux", "github-actions-linux"];
export type ExternalEvidenceEnvironmentKind = (typeof EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS)[number];
/** Whether a campaign manifest comes from executed vectors or format fixtures. */
export declare const EXTERNAL_EVIDENCE_CAMPAIGN_MODES: readonly ["fixture", "executed"];
export type ExternalEvidenceCampaignMode = (typeof EXTERNAL_EVIDENCE_CAMPAIGN_MODES)[number];
/** The four runtime paths every publishable external evidence campaign executes. */
export declare const EXTERNAL_EVIDENCE_REFERENCE_VECTORS: readonly ["transformation-volume", "http-effect", "parked-human-answer", "subject-erasure"];
export type ExternalEvidenceReferenceVector = (typeof EXTERNAL_EVIDENCE_REFERENCE_VECTORS)[number];
/** AOEP invariant verdicts. A skipped episode is not a verdict. */
export declare const EXTERNAL_EVIDENCE_INVARIANT_STATUSES: readonly ["met", "not-met"];
export type ExternalEvidenceInvariantStatus = (typeof EXTERNAL_EVIDENCE_INVARIANT_STATUSES)[number];
/** The two sides in the paired external evidence demonstration. */
export declare const EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES: readonly ["zero-ar", "conventional-agent"];
export type ExternalEvidenceDemonstrationSide = (typeof EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES)[number];
/** The declaration kinds a publication closure may root or contain (PUB-002). */
export declare const PUBLICATION_KINDS: readonly ["agent", "tool", "procedure", "validator", "posture", "task-contract", "semantic", "domain-pack", "binding-profile"];
export type PublicationKind = (typeof PUBLICATION_KINDS)[number];
/** Typed closure edges: a declaration requires another, or includes exact asset bytes. */
/**
 * When a pinned skill's body enters a model window (DXI-006). Progressive
 * advertises the descriptor and loads on an admitted request; always
 * includes the entry in every applicable window and is charged in full.
 */
export declare const SKILL_ACTIVATION_POLICIES: readonly ["progressive", "always"];
export type SkillActivationPolicy = (typeof SKILL_ACTIVATION_POLICIES)[number];
/** How long loaded skill bytes stay a high-priority candidate (DXI-007). */
export declare const SKILL_RETENTIONS: readonly ["turn", "checkpoint"];
export type SkillRetention = (typeof SKILL_RETENTIONS)[number];
/** The reserved runtime context operations a progressive closure exposes. */
export declare const SKILL_OPERATIONS: readonly ["skill.open", "skill.read", "skill.search"];
export type SkillOperation = (typeof SKILL_OPERATIONS)[number];
export declare const ARTIFACT_OPERATIONS: readonly ["artifact.read"];
export type ArtifactOperation = (typeof ARTIFACT_OPERATIONS)[number];
/** Gateway adapter families in the beta acceptance set (DXI-033). */
export declare const GATEWAY_FAMILIES: readonly ["signed-webhook", "interactive-messaging"];
export type GatewayFamily = (typeof GATEWAY_FAMILIES)[number];
/**
 * The public run operations a gateway may translate to. A gateway owns no
 * loop and no run truth, so nothing here reaches storage or a model.
 */
export declare const GATEWAY_OPERATIONS: readonly ["create-run", "observe", "steer", "redirect", "answer", "cancel", "result"];
export type GatewayOperation = (typeof GATEWAY_OPERATIONS)[number];
/** Where a public command sends remote-capable work (DXI-037). */
export declare const CLI_TARGET_MODES: readonly ["bundled", "hosted"];
export type CliTargetMode = (typeof CLI_TARGET_MODES)[number];
/** Which non-secret input selected a public command target (DXI-037). */
export declare const CLI_TARGET_SOURCES: readonly ["explicit-url", "environment-url", "bundled-default"];
export type CliTargetSource = (typeof CLI_TARGET_SOURCES)[number];
export declare const PUBLICATION_EDGE_KINDS: readonly ["requires", "includes"];
export type PublicationEdgeKind = (typeof PUBLICATION_EDGE_KINDS)[number];
/**
 * How a workspace package is distributed. The classification is intent, not
 * current manifest state: a package declared public-npm still ships with
 * private true until the successor scope rename lands, because publishing it
 * before then would publish the legacy identity.
 */
export declare const PACKAGE_DISTRIBUTIONS: readonly ["public-npm", "private-workspace", "signed-distribution", "conditional-hosted", "future-optional"];
export type PackageDistribution = (typeof PACKAGE_DISTRIBUTIONS)[number];
/** External channels that may carry the product identity during a release. */
export declare const PRODUCT_DISTRIBUTION_CHANNEL_KINDS: readonly ["product-domain", "documentation-domain", "api-domain", "status-domain", "npm-scope", "source-organization", "container-registry-namespace", "chart-name", "command-distribution", "social-channel", "support-channel", "signing-identity"];
export type ProductDistributionChannelKind = (typeof PRODUCT_DISTRIBUTION_CHANNEL_KINDS)[number];
