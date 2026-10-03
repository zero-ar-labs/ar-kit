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
export const ENTRY_ROLES = ['system', 'user', 'assistant', 'tool_result', 'steer', 'marker'];
/** Prefixes for sortable opaque identifiers. A prefix identifies a kind and grants no authority. */
export const ID_PREFIXES = ['run', 'rec', 'ent', 'lea', 'brn', 'ctl', 'gap', 'eff', 'ead', 'agt', 'chk', 'wak', 'pub', 'env', 'job', 'obs', 'src', 'cap', 'wsp'];
/** Durable workspace generation states owned by the Environment Plane. */
export const SANDBOX_WORKSPACE_STATUSES = ['sealed', 'attached', 'expired', 'deleted'];
/** Runtime record types. The canonical history is a hash-chained sequence of these. */
export const RECORD_TYPES = [
    'run.created',
    'run.started',
    'entry.appended',
    'branch.created',
    'branch.head.moved',
    'context.assembled',
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
    'browser.binding.pinned',
    'browser.destination.proposed',
    'browser.destination.decided',
    'browser.binding.superseded',
];
/** Governed amendments to the capability closure of one durable run (DCA-003). */
export const CAPABILITY_ADMISSION_KINDS = ['add', 'replace', 'remove'];
/** Immutable publication roots supported by the first admission slice. */
export const CAPABILITY_PACKAGE_KINDS = ['procedure', 'tool'];
/** Classification derives from inspected bytes; package metadata never chooses it. */
export const CAPABILITY_ADMISSION_CLASSES = [
    'context-only',
    'existing-tool-use',
    'signed-executable',
    'resolved-dependencies',
    'new-observation-tool',
    'new-effect-surface',
    'privilege-expansion',
];
/** Caller decisions are separate from the admission lifecycle projection. */
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
/** Events in one subject's encrypted cross-run memory stream (MEM-001 through MEM-010). */
export const MEMORY_EVENT_KINDS = ['assertion.admitted', 'assertion.superseded', 'subject.erased'];
/** The v1 memory lattice. A write stores the maximum level of its live supports. */
export const MEMORY_CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted'];
/**
 * Where the deployment wrapping key for cross-run memory subject keys comes
 * from. Ephemeral keeps keys in process memory only, so a restart forgets
 * every subject. No source here is a KMS or HSM.
 */
export const MEMORY_KEY_CUSTODY = ['keychain', 'key-file', 'secret-broker-grant', 'wrapping-key-env', 'ephemeral'];
/** Local Lite cross-run memory modes (decision E-1). Off is the default; ephemeral forgets every subject at restart. */
export const MEMORY_MODES = ['off', 'durable', 'ephemeral'];
/** How an immutable agent binding makes cross-run memory readable to its model loop (MSH-002). */
export const MEMORY_READ_MODES = ['on-demand', 'at-intake', 'disabled'];
/** The condition under which a run-owned proposal may enter cross-run memory (MSH-008, MSH-009). */
export const MEMORY_WRITE_MODES = ['none', 'propose-after-verification', 'human-approved'];
/** Whether loss of a published memory binding degrades or blocks verified completion (MSH-012, MSH-013). */
export const MEMORY_AVAILABILITY_MODES = ['optional', 'required'];
/** Runtime-local memory operations a publication may expose to its model loop. */
export const MEMORY_MODEL_OPERATIONS = ['memory.read', 'memory.propose'];
/** Why one exact tool schema entered a model call's bounded view. */
export const TOOL_VIEW_SELECTION_REASONS = [
    'reserved-local-catalogue',
    'reserved-skill',
    'reserved-artifact',
    'reserved-source',
    'reserved-memory',
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
/** Run lifecycle states. One of the four trusted state machines. */
export const RUN_STATUSES = ['created', 'running', 'suspended', 'cancelled', 'finished'];
/** Completion states. The machine that makes finished a verdict, not a declaration. */
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
/** Verification verdicts. Exhausted means the repair budget ran out while checking. */
export const VERDICTS = ['verified', 'rejected', 'indeterminate', 'exhausted'];
/** Terminal outcomes a run can reach. Nothing else ends a run. */
export const RUN_TERMINALS = ['complete', 'unverified_artifact', 'cancelled'];
/** Why a run is suspended rather than running. Suspension is resumable, never terminal. */
export const SUSPEND_REASONS = ['budget_exhausted', 'provider_failure', 'awaiting_answer', 'operator_pause', 'stagnation', 'remote_task'];
/** Why a resume preflight left the canonical run suspended. */
export const RUN_RESUME_BLOCK_CATEGORIES = ['budget-unavailable', 'answers-outstanding', 'storage-unready', 'authority-unready', 'remote-task-pending'];
/**
 * Who settled a scheduled wake other than an ordinary tick: the cancellation
 * worker, a deadline expiry, a deadline found stale, or a wake found stale or
 * duplicated, settled durably so a rebuild does not bring it back (MTH-TW-003).
 */
export const WAKE_CLAIM_VIAS = ['cancellation', 'deadline', 'deadline-stale', 'stale'];
/** Open conditions the result surface names as constraining a claim (LIF-038). */
export const BLOCKING_OUTCOME_KINDS = ['parked-item', 'open-effect', 'artifact-evidence'];
/** What a lease meters. Attention is a person's time and is leased like tokens. */
export const LEASE_DENOMINATIONS = ['model_tokens', 'tool_calls', 'bytes', 'compute_ms', 'attention'];
/** Which pool a lease draws from. Verification is reserved and undrawable by work (K-17). */
export const LEASE_POOLS = ['work', 'verification', 'repair'];
/** Per-lease lifecycle. Reserve before spend; settle with actuals; charge on loss. */
export const LEASE_STATES = ['reserved', 'settled', 'charged'];
/** The four control verbs. Distinct operations, not one interrupt (KRN-026). */
export const CONTROL_VERBS = ['steer', 'redirect', 'cancel', 'answer'];
/** Why a branch exists. Repair and forks branch; history is never rewritten. */
export const BRANCH_REASONS = ['original', 'steer', 'redirect', 'repair', 'reexecution', 'fork'];
/** How a model stream ended. Provider failures are in-band; adapter defects raise (X-3). */
export const STOP_REASONS = [
    'end_turn',
    'completion_proposal',
    'max_output',
    'cancelled',
    'redirected',
    'provider_failure',
];
/** Effect lifecycle states. Withdrawn is the authorized non-dispatch end (EFX-023). */
export const EFFECT_STATES = ['prepared', 'dispatched', 'committed', 'withdrawn', 'outcome_unknown', 'unreconcilable'];
/** The only caller choices at the exact prepared-effect authority boundary. */
export const EFFECT_AUTHORITY_DECISIONS = ['approve', 'refuse'];
/** What the authority durably concluded when it received a decision. */
export const EFFECT_AUTHORITY_DISPOSITIONS = ['approved', 'refused', 'expired'];
/** Why a recorded approval no longer admits dispatch. */
export const EFFECT_AUTHORITY_INVALIDATION_REASONS = ['expired', 'authority-epoch-changed', 'scope-epoch-changed'];
/** Terminal effects carry no authority-bearing work that can dispatch again. */
export function isTerminalEffectState(state) {
    return state === 'committed' || state === 'withdrawn' || state === 'unreconcilable';
}
/** Non-terminal effects remain owned by dispatch or reconciliation (EFX-021). */
export function isNonTerminalEffectState(state) {
    return !isTerminalEffectState(state);
}
/**
 * Receipt assurance classes (EFX-019). Each names who vouched: the owner's
 * own signature, the dispatcher's authenticated channel, or authenticated
 * reconciliation after the fact. No assurance means no commit.
 */
export const RECEIPT_ASSURANCES = ['owner-signed', 'authenticated-response', 'authenticated-reconciliation'];
/** Owner outcomes a receipt can carry. already_applied is the idempotency rung answering a retry. */
export const RECEIPT_OUTCOMES = ['applied', 'already_applied', 'refused'];
/** Work presented to a reviewer. Unsupported kinds never appear as placeholders. */
export const REVIEW_ITEM_KINDS = ['gap', 'human-validator', 'approval'];
/** The review inbox contains open work only; settlement leaves the projection. */
export const REVIEW_ITEM_STATES = ['pending'];
/** Whether a run currently has tenant-visible review work. */
export const RUN_REVIEW_STATES = ['pending', 'none'];
/** Work-state ledger positions (QLT-020). The agent's own claim never reaches verified. */
export const ITEM_STATES = [
    'untouched',
    'completed_unverified',
    'verified',
    'parked',
    'dismissed',
    'failed',
    'invalidated',
];
/** Validator classes with different verdict authority (Q-7). */
export const VALIDATOR_CLASSES = ['deterministic', 'sampled-oracle', 'heuristic', 'named-human'];
/**
 * Evidence demonstrated for one exact validator implementation. These are
 * deliberately separate from source-evidence grades such as original and
 * derived, and from a task contract's rule-specific sufficient_for decision.
 */
export const VALIDATOR_EVIDENCE_GRADES = ['declared', 'protocol-conformant', 'case-evaluated', 'deployment-admitted'];
/** Stable, typed reasons a verification arrangement cannot reach verified completion. */
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
/** Outcomes a validator implementation must be able to report. */
export const VALIDATOR_OUTCOMES = ['pass', 'reject', 'indeterminate'];
/** What a claim asserts about its own standing (Q-20). Open means unresolved on purpose. */
export const CLAIM_LABELS = ['guarantee', 'assumption', 'heuristic', 'open'];
/**
 * Claim representations a contract may declare. Evidence-completeness wording
 * attaches only to the structured form; a contract that declares nothing gets
 * no such wording anywhere (CLM-001).
 */
export const CLAIM_REPRESENTATIONS = ['structured-claims-with-citations'];
/** Failure classes stay distinguished so repair knows what kind of wrong it got (Q-10). */
export const FAILURE_CLASSES = ['shape', 'domain', 'grounding', 'infrastructure'];
/** Tool operation classes (EXT-003). Unknown resolves to effect-proposal, never quieter. */
export const OPERATION_CLASSES = ['observation', 'run-internal', 'effect-proposal'];
/** Browser engines admitted by the first-party browser contract. */
export const BROWSER_ENGINES = ['playwright-chromium'];
/** Where browser CPU, memory and descendant-process ceilings are enforced. */
export const BROWSER_LIMIT_ENFORCEMENTS = ['observed-process', 'cgroup-v2'];
/** Public-only production networking and the explicit loopback fixture mode. */
export const BROWSER_NETWORK_MODES = ['public-only', 'loopback-test-only'];
/** Playwright request classes used by immutable destination policy. */
export const BROWSER_RESOURCE_TYPES = [
    'document',
    'stylesheet',
    'image',
    'media',
    'font',
    'script',
    'texttrack',
    'xhr',
    'fetch',
    'eventsource',
    'websocket',
    'manifest',
    'other',
];
/** HTTP methods that an exact browser destination may admit. */
export const BROWSER_HTTP_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'];
/** Bounded observation forms returned by the browser host. */
export const BROWSER_OBSERVATIONS = ['text', 'dom', 'screenshot', 'download'];
/** Browser-derived content never carries instruction authority. */
export const BROWSER_CONTENT_LABELS = ['untrusted-external-content'];
export const BROWSER_INSTRUCTION_AUTHORITIES = ['none'];
/** Human dispositions on a requested destination expansion. */
export const BROWSER_DESTINATION_DISPOSITIONS = ['approved', 'refused'];
/** Where one destination proposal stands: open, or settled by one disposition (BRC-012, BRC-013). */
export const BROWSER_DESTINATION_PROPOSAL_STATES = ['proposed', 'approved', 'refused'];
/** How a browser binding isolates its engine: a host process or a container. */
export const BROWSER_ISOLATIONS = ['process', 'container'];
/** Consequential browser actions; an unknown interaction stays consequential. */
export const BROWSER_EFFECT_ACTIONS = ['click', 'submit', 'upload', 'unknown'];
/** The two admitted duplicate-prevention mechanisms for browser effects. */
export const BROWSER_IDEMPOTENCY_STRATEGIES = ['provider-key', 'natural-reference'];
/** Browser profile readiness is separate from installation and enablement. */
export const BROWSER_PROFILE_STATES = ['disabled', 'installed', 'healthy', 'admitted'];
/**
 * How a tool's consumption is bounded (BUD-005). enforced reserves a
 * declared maximum before invocation; unmetered cannot, runs at lowered
 * trust, and sits outside every hard spend bound; effect-governed spend
 * is bounded by grants in the effect plane, not by a tool lease.
 */
export const TOOL_METERING = ['enforced', 'unmetered', 'effect-governed'];
/** Deployment profiles. Every run names its profile and its exclusions (C-OPS-PROFILE-HONESTY-010). */
export const PROFILES = ['local-lite', 'full-cell', 'small-production', 'regulated'];
/** Profile capability ids used by the first-beta manifest. */
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
    'environment-cloudflare-sandbox',
    'environment-modal',
    'environment-daytona',
    'environment-vercel-sandbox',
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
    'browser-first-party-playwright',
    'fair-cell-scheduling',
    'sequential-sampled-validation',
    'context-feature-cache',
    'content-defined-chunking',
    'attention-admission',
    'aggregator-trigger-ingress',
    'gateway-signed-webhook',
    'gateway-interactive-messaging',
    'workspace-binding-profiles',
];
/** Capability manifest states. Every capability appears once in one state. */
export const PROFILE_CAPABILITY_STATES = ['supported', 'conditional', 'excluded'];
/** Product placement for an environment adapter in the first hosted release. */
export const ENVIRONMENT_PRODUCT_STATES = ['default-supported', 'conditional-supported', 'future-optional'];
/** Whether the real-host evidence attached to one environment is usable now. */
export const ENVIRONMENT_ACCEPTANCE_STATES = ['not-required', 'pending', 'current', 'expired', 'mismatched'];
/** Conditional backends whose packages are mounted into a deployment explicitly. */
export const CONDITIONAL_ENVIRONMENT_BACKENDS = ['ssh', 'firecracker', 'apptainer', 'openai-agents'];
/** The boundary where an excluded capability refuses. */
export const PROFILE_CAPABILITY_REFUSAL_POINTS = ['profile-compilation', 'publication', 'registration', 'intake', 'route', 'not-applicable'];
/** Deployment components a profile may require or probe. */
export const PROFILE_COMPONENTS = ['store', 'migration', 'queue', 'artifact', 'secret_store', 'tool_host', 'validator_host', 'authority', 'memory', 'orchestration', 'effect', 'mcp'];
/** External protocols described by one immutable interoperability binding. */
export const INTEROP_PROTOCOLS = ['mcp', 'a2a'];
/** Which side initiates work through one interoperability binding. */
export const INTEROP_DIRECTIONS = ['client', 'server'];
/** Tenant identity always comes from an authenticated deployment-owned rule. */
export const INTEROP_TENANT_DERIVATIONS = ['authenticated-principal'];
/** Consequences outside Zero-AR remain explicit even when a peer omits metadata. */
export const INTEROP_REMOTE_CONSEQUENCE_POSTURES = ['none', 'declared-external', 'unknown'];
/** Progressive deployment states for an optional protocol surface. */
export const INTEROP_CAPABILITY_STATES = ['implemented', 'configured', 'healthy', 'admitted', 'selectable'];
/** Task states defined by the MCP Tasks extension. */
export const MCP_TASK_STATUSES = ['working', 'input_required', 'completed', 'failed', 'cancelled'];
/** Durable states for an imported MCP call whose answer is not final yet. */
export const MCP_REMOTE_TASK_STATES = ['working', 'input_required', 'outcome_unknown'];
/** How an imported MCP call reached its durable non-terminal state. */
export const MCP_REMOTE_TASK_CAUSES = ['peer-task', 'transport-loss'];
/** Terminal distinctions retained for every native and imported tool call. */
export const TOOL_EXECUTION_OUTCOMES = ['success', 'tool-error', 'protocol-error', 'malformed-response', 'transport-loss', 'outcome-unknown'];
/** Native completion distinctions retained inside an external assurance envelope. */
export const ASSURANCE_COMPLETION_CLASSES = ['working', 'verified', 'unverified', 'rejected', 'indeterminate', 'exhausted', 'cancelled'];
/** The strongest unresolved effect condition visible in a result projection. */
export const ASSURANCE_EFFECT_DISPOSITIONS = ['none', 'settled', 'open', 'outcome-unknown', 'unreconcilable'];
/** Cache scope retained with immutable MCP discovery snapshots. */
export const INTEROP_CACHE_SCOPES = ['private', 'public'];
/** Artifact backends named by capability manifests. */
export const ARTIFACT_BACKENDS = ['filesystem', 's3-compatible'];
/**
 * Why cited artifact evidence could not stand in a context window or at the
 * completion gate. The artifact codes are the store's own refusals; the
 * store-unavailable reason covers a store that did not answer, and
 * token_budget names a range the window could not hold (CTX-007, QLT-031).
 */
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
/**
 * Why a run export or import named an artifact without transferring its
 * bytes (UAT-ART-013). not-in-run names a carried artifact the run's
 * verified records never cite, so an import does not restore it.
 */
export const ARTIFACT_TRANSFER_OMISSIONS = ['tenant-mismatch', 'backend-mismatch', 'no-artifact-store', 'erased', 'absent', 'not-in-run'];
/**
 * The frames a run export adds before its checksum line to carry artifacts.
 * The store's run bundle reader skips frame kinds it does not know.
 */
export const RUN_BUNDLE_ARTIFACT_FRAME_KINDS = ['artifact-bundle', 'artifact-omissions'];
/** How one recorded span reads on replay. Erased or changed bytes are stale, never equal (CTX-012). */
export const CONTEXT_REPLAY_SPAN_STATUSES = ['resolved', 'stale'];
/** The two places a product may bind a committed runtime artifact. */
export const RUNTIME_ARTIFACT_INTENDED_USES = ['run', 'intake'];
/** Effect plane modes named by capability manifests. */
export const EFFECT_PLANE_MODES = ['absent', 'restricted-attachment', 'dynamic-authority'];
/** Primary product areas. Every public operation belongs to exactly one. */
export const PRODUCT_AREAS = ['administration', 'build-and-publish', 'run', 'review-and-authority', 'results-and-audit'];
/** Media types carried by the public native API contract. */
export const API_MEDIA_TYPES = ['application/json', 'application/octet-stream', 'application/x-ndjson', 'text/event-stream'];
/** Primitive query types the route registry can publish into client contracts. */
export const API_QUERY_PARAMETER_TYPES = ['string', 'integer', 'boolean'];
/** Public authorization modes used by route enforcement. */
export const AUTHORIZATION_MODES = ['trusted-local', 'scoped'];
/** Public route authorities. Every protected API route cites these names. */
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
/**
 * Route scopes no tenant key may hold. Each authorizes an act that reaches
 * every tenant on the cell, such as advancing the shared authority epoch
 * (I-4), so only a platform operator credential carries it.
 */
export const PLATFORM_ROUTE_SCOPES = ['platform:authority-epoch'];
/** Product channels accepted as observation provenance, not as authority. */
export const EXTERNAL_OBSERVATION_CHANNELS = ['web', 'mobile', 'voice', 'sms', 'email', 'chat', 'system', 'other'];
/** Signature algorithms admitted by the first deployment-owned participant verifier. */
export const OIDC_JWT_ALGORITHMS = ['RS256'];
/** Provider families admitted by the first hosted provider contract. */
export const MODEL_PROVIDERS = ['scripted', 'openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'openai-compatible'];
/** Wire translators implemented by the runtime. Profiles never replace these identities. */
export const MODEL_PROTOCOL_ADAPTERS = ['scripted', 'openai-chat-completions', 'anthropic-messages'];
/** Tested defaults and declared deviations applied to one protocol adapter. */
export const MODEL_PROVIDER_PROFILES = ['scripted', 'openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'generic-openai-compatible', 'litellm', 'ollama'];
/** How a provider instance obtains model inventory outside the run path. */
export const MODEL_CATALOGUE_SOURCES = ['declared', 'provider-api', 'openai-compatible-models'];
/** Credential treatment is explicit, including endpoints that need no authorization header. */
export const MODEL_CREDENTIAL_MODES = ['binding', 'none'];
/** Compatibility claims do not inherit across providers that share one wire format. */
export const MODEL_COMPATIBILITY_STATES = ['supported', 'unsupported', 'unknown'];
/** Provider token counts may be usable, advisory, absent, or locally estimated. */
export const MODEL_USAGE_MEASUREMENTS = ['reported', 'untrusted', 'absent', 'estimated'];
/** Tool-aggregator providers supported by the first hosted beta. */
export const AGGREGATOR_PROVIDERS = ['composio', 'merge-agent-handler', 'merge-unified'];
/** Purposes permitted for tenant credential bindings. */
export const PROVIDER_CREDENTIAL_PURPOSES = ['openai', 'anthropic', 'openrouter', 'together', 'fireworks', 'openai-compatible', 'composio', 'merge-agent-handler', 'merge-unified', 'mcp', 's3-compatible-artifact-store', 'memory-wrapping-key'];
/**
 * Callers the hosted managed-secret broker issues a bearer to. Each bearer
 * is bound to one principal, and the broker takes the tenant from that
 * binding rather than from the request body.
 */
export const SECRET_BROKER_PRINCIPAL_KINDS = ['runtime', 'aggregator-host', 'artifact-store', 'supervisor'];
/** Operations a managed-secret broker grant may allow, one per broker route. */
export const SECRET_BROKER_OPERATIONS = ['health', 'bind-external', 'inspect', 'rotate-external', 'revoke', 'resolve'];
/** Non-secret credential lifecycle states exposed by administration. */
export const CREDENTIAL_BINDING_STATES = ['active', 'revoked'];
/** Durable control-plane states for provider instances and discovered models. */
export const PROVIDER_INSTANCE_STATES = ['configured', 'ready', 'revoked'];
export const PROVIDER_MODEL_STATES = ['discovered', 'enabled', 'disabled'];
/** Durable control-plane states for tenant tool-aggregator sources. */
export const TOOL_SOURCE_STATES = ['configured', 'ready', 'disabled', 'revoked', 'removed'];
export const TOOL_SOURCE_TOOL_STATES = ['discovered', 'enabled', 'disabled'];
/** Which provider-authored fields of one catalogue entry changed since the pinned snapshot (TAG-025). */
export const TOOL_SOURCE_DRIFT_FIELDS = ['description', 'input_schema', 'provider_version', 'annotations'];
/** Storage kinds a deployment can wire. Profiles name which they require. */
export const STORE_KINDS = ['sqlite', 'postgres'];
/** PostgreSQL modes a packaged hosted cell can select at startup. */
export const POSTGRES_DEPLOYMENT_MODES = ['colocated', 'external'];
/**
 * Where an integrity signer's active key stands against its interval. Only
 * an active key signs new checkpoints; hosted signer health reports the state.
 */
export const SIGNER_KEY_STATES = ['active', 'not-yet-valid', 'expired'];
/**
 * Children a Full Cell runtime may ask its supervisor to launch. The
 * supervisor sets each child's argv and environment itself and never takes
 * a path, an argument or an environment value from the runtime.
 */
export const CELL_LAUNCH_ROLES = ['integrity-signer'];
/**
 * The Full Cell processes that write startup progress lines to stderr. Each
 * line's cell_startup field names one of them, so an operator reading the
 * container log can tell which process a stalled step belongs to.
 */
export const CELL_STARTUP_PROCESSES = ['supervisor', 'runtime'];
/**
 * How much process isolation a hosted cell requires before it starts.
 * required refuses a cell whose Node processes are dumpable, whose SIGUSR1
 * inspector is enabled, or whose child hosts are not confined by Landlock
 * with an observed self-test; best-effort records what it observed and
 * starts, and is accepted only for a cell with exactly one tenant.
 */
export const CELL_ISOLATION_MODES = ['required', 'best-effort'];
/**
 * Guarantees a running hosted cell names in health and its startup report
 * when the host cannot enforce them. child-code-isolation: child hosts run
 * unconfined. runtime-anchor-store-custody: the runtime is not confined away
 * from the cell's custody paths, so it can write the checkpoint store; a
 * cell with no custody path does not list it. child-network-scoping: child hosts may open any TCP
 * connection (Landlock below ABI 4). child-signal-scoping: child hosts may
 * signal processes outside their domain (Landlock below ABI 6).
 * external-secret-store-tenant-binding: tenant binding happens inside an
 * external secret store the cell cannot observe. signer-key-custody: the
 * runtime itself holds a signer key, as the standalone hosted entrypoint does.
 */
export const CELL_GUARANTEE_EXCLUSIONS = [
    'child-code-isolation',
    'runtime-anchor-store-custody',
    'child-network-scoping',
    'child-signal-scoping',
    'external-secret-store-tenant-binding',
    'signer-key-custody',
];
/** Processes a hosted cell confines with Landlock, each under its own policy. */
export const CELL_CONFINEMENT_ROLES = ['runtime', 'tool-host', 'aggregator-host', 'authority-host', 'validator-host'];
/**
 * Where one confined process class stands after the Landlock probe and its
 * self-tests, as the startup report names it. confined: a probe child under
 * the policy observed every denial. self-test-failed: the kernel offers the
 * ABI, but a probe child did not observe a denial or did not run.
 * unavailable: the kernel offers no Landlock, or too low an ABI for the
 * role. not-offered: the entrypoint does not confine this class, as the
 * standalone hosted entrypoint does not confine its runtime. not-needed: the
 * cell has no custody path to keep from the runtime, so no runtime policy
 * is built.
 */
export const CELL_CONFINEMENT_STATES = ['confined', 'self-test-failed', 'unavailable', 'not-offered', 'not-needed'];
/** The outcome of one confinement self-test in the startup report. */
export const CELL_SELF_TEST_RESULTS = ['passed', 'failed'];
/** What the startup gating matrix decides for a hosted cell: start, or refuse with cell.isolation.unmet. */
export const CELL_ISOLATION_DECISIONS = ['start', 'refuse'];
/** PostgreSQL latency report topologies measured before a UAT evidence claim. */
export const POSTGRES_LATENCY_TOPOLOGIES = ['colocated', 'same-region-external', 'controlled-added-latency'];
/** PostgreSQL latency report operations on the canonical-log control path. */
export const POSTGRES_LATENCY_OPERATIONS = ['append', 'reconstruction', 'checkpoint', 'representative-run-transition'];
/** PostgreSQL latency report standing. Fixture format checks are not UAT evidence. */
export const POSTGRES_LATENCY_REPORT_STATUSES = ['fixture-format-only', 'uat-measured'];
/**
 * Optimization controller modes (MTH-002). Resolved configuration values,
 * not lifecycle states: off computes nothing, observe recommends without
 * touching a run, enforce acts and pins transitively.
 */
export const CONTROLLER_MODES = ['off', 'observe', 'enforce'];
/**
 * Standing of one published attention capacity snapshot (MTH-AT-008). Only
 * a current snapshot can admit enforced intake; drift beyond the registered
 * tolerance marks it invalid until an operator publishes the next version.
 */
export const ATTENTION_SNAPSHOT_STATES = ['current', 'invalid', 'superseded'];
/** What the attention preflight concluded for one class at admission (BUD-009). */
export const ATTENTION_ADMISSION_RESULTS = ['not-evaluated', 'admitted', 'refused'];
/** What a pinned sampling oracle said about one examined item (MTH-SV-001). */
export const SAMPLED_ORACLE_OUTCOMES = ['good', 'defect'];
/** Why a sequential sampled check stopped examining items (MTH-SV-003, MTH-SV-006). */
export const SEQUENTIAL_STOP_REASONS = ['accept-boundary', 'reject-boundary', 'sample-cap', 'lease-exhausted'];
/** Workspace mount slots (EXT-018). The slot decides what classes its operations may carry. */
export const WORKSPACE_SLOTS = ['runtime-scratch', 'customer-readable-external'];
/** Who ends a workspace instance: the run that attached it, or the deployment that registered it. */
export const WORKSPACE_INSTANCE_LIFECYCLES = ['run-scoped', 'deployment-owned'];
/** What a domain-pack machine claim asserts (XCV-012). Limitations are claims too. */
export const PACK_CLAIM_KINDS = ['capability', 'coverage', 'limitation', 'requirement', 'omission'];
/** Diagnostic severities. Severity depends on what happens next, not on drama. */
export const DIAGNOSTIC_SEVERITIES = ['error', 'warning', 'info'];
/**
 * Codes that name a mechanism this build does not wire. A declared route
 * answers its code after authorization. A reserved input refuses at parse
 * time: the caller receives that surface's parse refusal (intake.invalid,
 * control.invalid, or a schema error from the SDK publication compiler)
 * with this code in its message. An excluded capability entry names its
 * code. The change that wires one mechanism stops answering its code.
 */
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
    'tool-source.ingress.unwired',
    'effect.authority.unwired',
    'workspace.instances.unwired',
    'gateway.unwired',
];
/**
 * Codes that name a condition this deployment lacks. The wired mechanism
 * keeps answering them wherever the condition is absent: no browser port on
 * the cell, no dynamic effect authority, or no legacy provider fields to
 * import. A build that does not wire the mechanism lacks the condition too,
 * so its declared route or reserved input answers the same code now.
 */
export const CONDITIONAL_REFUSAL_CODES = [
    'browser.capability.unavailable',
    'effect.grant.reissue.unavailable',
    'model.legacy.unconfigured',
];
/**
 * Refusals a wired mechanism answers when its check fails. The capability
 * inventory already answers capability-profile.unimplemented. The attention
 * preflight, browser health, storage writer fence and artifact export
 * ceiling answer theirs once their packages land. Each code is named once
 * here so every composition and client reads the same code.
 */
export const MECHANISM_REFUSAL_CODES = [
    'attention.preflight.refused',
    'attention.snapshot.invalid',
    'attention.batch.flat-without-evidence',
    'browser.capability.stale',
    'browser.capability.unhealthy',
    'storage.writer.stale',
    'storage.writer.unavailable',
    'artifact.bundle-too-large',
    'capability-profile.unimplemented',
];
/**
 * The complete durable observation vocabulary from ERD 9.3. The runtime
 * publishes the subset its current phase emits; the vocabulary itself is
 * closed and stable so clients never meet an unnamed event.
 */
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
/** Product-facing families on the resumable record stream. */
export const PRODUCT_EVENT_FAMILIES = ['work', 'review', 'artifact', 'quality', 'effect', 'terminal', 'consumption', 'environment', 'maintenance'];
/** Where a public product mutation obtains the identity that makes retries converge. */
export const PRODUCT_MUTATION_IDEMPOTENCY_SOURCES = ['request-idempotency-key', 'request-control-id', 'artifact-session-key'];
/** Lifecycle commands exposed to product backends. Detached changes response ownership, not run semantics. */
export const RUN_LIFECYCLE_COMMANDS = ['start', 'resume', 'resume-deferred'];
/**
 * Where a capability executes, from the engine process outward. A declared
 * tier is a boundary the wiring must actually host, never a label
 * (C-SEC-BOUNDARIES-DEFAULT-DENY-007).
 */
export const TRUST_TIERS = ['none', 'process', 'container', 'remote'];
/** Provider families behind the versioned environment lifecycle. */
export const ENVIRONMENT_BACKENDS = [
    'process',
    'oci',
    'ssh',
    'firecracker',
    'cloudflare-sandbox',
    'modal',
    'daytona',
    'vercel-sandbox',
    'openai-agents',
    'apptainer',
];
/** The exact boundary an environment profile claims. */
export const ENVIRONMENT_ISOLATIONS = ['none', 'process', 'container', 'remote-host', 'microvm', 'hosted-sandbox'];
/** Remote schedulers the SSH environment adapter can declare and pin. */
export const ENVIRONMENT_SSH_SCHEDULERS = ['direct', 'slurm'];
/** How Zero-AR reaches one Cloudflare Sandbox deployment. */
export const ENVIRONMENT_CLOUDFLARE_CONNECTION_MODES = ['worker-binding', 'authenticated-bridge'];
/** The Sandbox SDK transport pinned inside the Worker deployment. */
export const ENVIRONMENT_CLOUDFLARE_TRANSPORT_MODES = ['rpc'];
/** Separately reported timing and transfer dimensions for environment work. */
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
/** Units stay explicit so latency and transfer rates cannot be combined. */
export const ENVIRONMENT_MEASUREMENT_UNITS = ['milliseconds', 'bytes-per-second'];
/** Signature algorithms admitted for environment adapter release manifests. */
export const ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS = ['ed25519'];
/** One contract, including descriptor discovery and every lifecycle operation. */
export const ENVIRONMENT_LIFECYCLE_OPERATIONS = ['descriptor', 'prepare', 'submit', 'observe', 'reconcile', 'cancel', 'collect', 'teardown', 'abandon'];
/** Normalized lifecycle observations. Provider-native status remains provider data. */
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
/** Public statuses for the local identity data-directory migration plan. */
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
export const PRODUCT_SBOM_FORMATS = [
    'ramsden-sbom-2',
    'zero-ar-sbom-1',
];
/** Developer-facing files that must ship as release artifacts during identity migration. */
export const PRODUCT_CLI_RELEASE_ARTIFACT_KINDS = ['shell-completion', 'manpage', 'install-script', 'service-unit', 'example'];
/** Release artifact families governed by product identity signing policy. */
export const PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS = ['npm-package-set', 'full-cell-release', 'legacy-artifact'];
/** Why release signing material is admitted during the identity migration. */
export const PRODUCT_RELEASE_SIGNING_PURPOSES = ['successor-release', 'legacy-history'];
export const PRODUCT_EGRESS_REVIEW_PURPOSES = [
    'model-provider',
    'artifact-store',
    'artifact-health',
    'tool-provider',
    'effect-target',
    'oauth-redirect',
    'webhook-callback',
];
/** How a package participates in the Zero-AR package graph during migration. */
export const PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES = ['legacy', 'successor', 'legacy-wrapper'];
/** Public package-graph outcomes reported by the identity migration guard. */
export const PRODUCT_PACKAGE_GRAPH_STATES = ['legacy-compatible', 'successor-compatible', 'mixed-incompatible'];
/** Operator/governance surfaces where identity migration changes live behaviour. */
export const PRODUCT_IDENTITY_MIGRATION_IMPACTS = ['deployment', 'publication-namespace', 'compatibility-policy'];
/** Deployment targets covered by the identity migration plan. */
export const PRODUCT_IDENTITY_DEPLOYMENT_TARGETS = ['local-lite', 'hosted-cell', 'full-cell', 'tool-host', 'validator-host', 'dispatcher', 'optional-services'];
/** Operator-owned identifiers that a product rename must not move implicitly. */
export const PRODUCT_IDENTITY_DEPLOYMENT_IDENTIFIER_KINDS = ['database', 'database-role', 'database-schema', 'object-store-prefix', 'kubernetes-namespace', 'secret-name', 'service-account'];
/** Physical identifier rename decisions for product identity migration. */
export const PRODUCT_IDENTITY_PHYSICAL_RENAME_ACTIONS = ['preserve-by-config', 'physical-rename-refused', 'physical-rename-staged'];
/** Ordered stages for an explicit physical identifier rename procedure. */
export const PRODUCT_IDENTITY_PHYSICAL_RENAME_STAGES = ['record-event', 'pause-writes', 'copy-or-rename', 'verify-target', 'switch-binding', 'retain-marker'];
/** Operator-controlled profile availability. Profiles themselves stay immutable. */
export const ENVIRONMENT_PROFILE_STATES = ['registered', 'enabled', 'disabled', 'draining'];
/** Declared workload network posture. */
export const ENVIRONMENT_NETWORK_MODES = ['deny', 'allowlist', 'unrestricted'];
/** Mount mutability in one admitted profile. */
export const ENVIRONMENT_MOUNT_MODES = ['read-only', 'read-write'];
/** Whether an environment resource belongs to one tenant or the deployment. */
export const ENVIRONMENT_TENANT_SHARING = ['tenant-owned', 'deployment-shared'];
/**
 * Whether one lifecycle runtime serves later calls from an environment it
 * already prepared. run: a ready environment serves later calls in the same
 * run, tenant, and profile until run teardown. none: every call prepares its
 * own environment and tears it down once the call settles.
 */
export const ENVIRONMENT_REUSE_POLICIES = ['none', 'run'];
/** What suspension does with one nonterminal environment handle. */
export const ENVIRONMENT_SUSPENSION_DISPOSITIONS = [
    'continue-and-observe',
    'request-cancel-and-reconcile',
    'retain-ready-environment-with-expiry',
    'teardown-after-collection',
    'operator-review-required',
];
/** Deterministic conformance faults, never provider production status. */
export const ENVIRONMENT_FAULTS = ['throw-before', 'throw-after', 'malformed-result', 'teardown-failure'];
/**
 * How close cited material stands to its origin: bytes a person or an
 * external system supplied, bytes an admitted tool computed, or bytes a
 * model generated (CTX-002).
 */
export const EVIDENCE_GRADES = ['original', 'derived', 'model-generated'];
/** External evidence report standings. Uncertain evidence never upgrades itself. */
export const EXTERNAL_EVIDENCE_STANDINGS = ['sufficient', 'partial', 'missing', 'conflicting', 'opaque'];
/** Why a property stands or does not stand in an external evidence report. */
export const EXTERNAL_EVIDENCE_CLASSIFICATIONS = ['sufficient', 'design-exclusion', 'gap'];
/** How a property is backed inside an external evidence report. */
export const EXTERNAL_EVIDENCE_STRENGTHS = ['cryptographic', 'schema-validated', 'replayable', 'attested', 'narrated'];
/** The decision families scored by the external-evidence adapter. */
export const EXTERNAL_EVIDENCE_DECISION_KINDS = ['effect-dispatch', 'verification-verdict', 'checkpoint-rejection'];
/** The DEMM property families as read by the external evidence appendix. */
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
/** Bundle degradations applied by the external evidence campaign. */
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
/** AOEP invariants scored from reference episodes. */
export const EXTERNAL_EVIDENCE_INVARIANTS = [
    'authority-monotonicity',
    'scope-non-expansion',
    'deletion-propagation',
    'provenance-preservation',
    'rollback-traceability',
];
/** Execution environments admitted for the external evidence campaign. */
export const EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS = ['orbstack-linux', 'github-actions-linux'];
/** Whether a campaign manifest comes from executed vectors or format fixtures. */
export const EXTERNAL_EVIDENCE_CAMPAIGN_MODES = ['fixture', 'executed'];
/** The four runtime paths every publishable external evidence campaign executes. */
export const EXTERNAL_EVIDENCE_REFERENCE_VECTORS = [
    'transformation-volume',
    'http-effect',
    'parked-human-answer',
    'subject-erasure',
];
/** AOEP invariant verdicts. A skipped episode is not a verdict. */
export const EXTERNAL_EVIDENCE_INVARIANT_STATUSES = ['met', 'not-met'];
/** The two sides in the paired external evidence demonstration. */
export const EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES = ['zero-ar', 'conventional-agent'];
/** The declaration kinds a publication closure may root or contain (PUB-002). */
export const PUBLICATION_KINDS = ['agent', 'tool', 'procedure', 'validator', 'posture', 'task-contract', 'semantic', 'domain-pack', 'binding-profile'];
/** Typed closure edges: a declaration requires another, or includes exact asset bytes. */
/**
 * When a pinned skill's body enters a model window (DXI-006). Progressive
 * advertises the descriptor and loads on an admitted request; always
 * includes the entry in every applicable window and is charged in full.
 */
export const SKILL_ACTIVATION_POLICIES = ['progressive', 'always'];
/** How long loaded skill bytes stay a high-priority candidate (DXI-007). */
export const SKILL_RETENTIONS = ['turn', 'checkpoint'];
/** The reserved runtime context operations a progressive closure exposes. */
export const SKILL_OPERATIONS = ['skill.open', 'skill.read', 'skill.search'];
export const ARTIFACT_OPERATIONS = ['artifact.read'];
/** Gateway adapter families in the beta acceptance set (DXI-033). */
export const GATEWAY_FAMILIES = ['signed-webhook', 'interactive-messaging'];
/**
 * The public run operations a gateway may translate to. A gateway owns no
 * loop and no run truth, so nothing here reaches storage or a model.
 */
export const GATEWAY_OPERATIONS = ['create-run', 'observe', 'steer', 'redirect', 'answer', 'cancel', 'result'];
/** Where a public command sends remote-capable work (DXI-037). */
export const CLI_TARGET_MODES = ['bundled', 'hosted'];
/** Which non-secret input selected a public command target (DXI-037). */
export const CLI_TARGET_SOURCES = ['explicit-url', 'environment-url', 'bundled-default'];
export const PUBLICATION_EDGE_KINDS = ['requires', 'includes'];
/** How a publication export frame carries one blob: text as UTF-8, binary assets as base64 (PUB-023). */
export const PUBLICATION_BLOB_ENCODINGS = ['utf8', 'base64'];
/** Editable source forms accepted by the ahead-of-time authoring compiler. */
export const AUTHORING_SOURCE_FORMS = ['yaml', 'json', 'markdown', 'typescript'];
/** Project and extension shapes emitted by the public scaffold generator. */
export const AUTHORING_SCAFFOLD_KINDS = ['project', 'skill', 'tool', 'validator', 'domain-pack', 'binding-profile'];
/**
 * How a workspace package is distributed. The classification is intent, not
 * current manifest state: a package declared public-npm still ships with
 * private true until the successor scope rename lands, because publishing it
 * before then would publish the legacy identity.
 */
export const PACKAGE_DISTRIBUTIONS = ['public-npm', 'private-workspace', 'signed-distribution', 'conditional-hosted', 'future-optional'];
/** External channels that may carry the product identity during a release. */
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
