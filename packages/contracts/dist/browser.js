/**
 * First-party browser contracts.
 *
 * These shapes bind a run to one browser profile, finite resource limits and
 * exact destinations. They are implementation-neutral: Playwright lives in
 * the conditional browser package, while authority stays in the runtime.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { BROWSER_CONTENT_LABELS, BROWSER_DESTINATION_DISPOSITIONS, BROWSER_EFFECT_ACTIONS, BROWSER_ENGINES, BROWSER_IDEMPOTENCY_STRATEGIES, BROWSER_INSTRUCTION_AUTHORITIES, BROWSER_HTTP_METHODS, BROWSER_ISOLATIONS, BROWSER_LIMIT_ENFORCEMENTS, BROWSER_NETWORK_MODES, BROWSER_OBSERVATIONS, BROWSER_PROFILE_STATES, BROWSER_RESOURCE_TYPES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const secretRef = z.string().regex(/^secret:\/\/[A-Za-z0-9._/-]+$/, 'expected a secret reference, never credential bytes');
const artifactRef = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const sourceBindingRef = z.string().regex(/^source-binding:\/\/sha256:[0-9a-f]{64}$/, 'expected a source binding ref');
const positive = z.number().int().positive();
const count = z.number().int().nonnegative();
const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const address = z.string().refine((value) => isIpAddress(stripIpv6Brackets(value)), 'expected an IPv4 or IPv6 address');
export const BrowserLimitsSchema = z.strictObject({
    max_processes: positive.max(64),
    max_contexts_per_process: positive.max(32),
    max_pages_per_context: z.literal(1),
    max_active_sessions: positive.max(256),
    max_queued_sessions: count.max(1_024),
    max_navigations_per_session: positive.max(100),
    max_requests_per_session: positive.max(100_000),
    max_redirects: count.max(20),
    max_response_bytes: positive.max(1_073_741_824),
    max_network_bytes: positive.max(10_737_418_240),
    max_artifact_bytes: positive.max(1_073_741_824),
    max_downloads_per_session: count.max(100),
    max_observation_retries: count.max(5),
    navigation_timeout_ms: positive.max(300_000),
    idle_timeout_ms: positive.max(300_000),
    wall_time_ms: positive.max(900_000),
    cpu_time_ms: positive.max(900_000),
    memory_mib: positive.max(32_768),
    process_count: positive.max(4_096),
}).superRefine((limits, context) => {
    if (limits.max_active_sessions > limits.max_processes * limits.max_contexts_per_process) {
        context.addIssue({ code: 'custom', path: ['max_active_sessions'], message: 'active sessions exceed total process context slots.' });
    }
    if (limits.navigation_timeout_ms > limits.wall_time_ms || limits.idle_timeout_ms > limits.wall_time_ms) {
        context.addIssue({ code: 'custom', path: ['wall_time_ms'], message: 'wall time must cover navigation and idle timeouts.' });
    }
});
export const BrowserDestinationSchema = z.strictObject({
    origin: z.string().url().max(2_048),
    methods: z.array(z.enum(BROWSER_HTTP_METHODS)).min(1).max(BROWSER_HTTP_METHODS.length),
    resource_types: z.array(z.enum(BROWSER_RESOURCE_TYPES)).min(1).max(BROWSER_RESOURCE_TYPES.length),
    path_prefixes: z.array(z.string().startsWith('/').max(2_048)).min(1).max(128),
    resolved_addresses: z.array(address).min(1).max(32),
    credential_scope: z.string().min(1).max(256).nullable(),
    sensitive_query_fields: z.array(z.string().min(1).max(128)).max(64),
}).superRefine((destination, context) => {
    const parsed = new URL(destination.origin);
    if (!['https:', 'http:'].includes(parsed.protocol)) {
        context.addIssue({ code: 'custom', path: ['origin'], message: 'browser origins use HTTP or HTTPS.' });
    }
    if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
        context.addIssue({ code: 'custom', path: ['origin'], message: 'origin must contain only scheme, host and optional port.' });
    }
    if (parsed.origin !== destination.origin) {
        context.addIssue({ code: 'custom', path: ['origin'], message: `origin must be canonical as ${parsed.origin}.` });
    }
    if (isIpAddress(stripIpv6Brackets(parsed.hostname))) {
        context.addIssue({ code: 'custom', path: ['origin'], message: 'IP-literal origins are not admitted.' });
    }
    uniqueIssues(destination.methods, 'methods', context);
    uniqueIssues(destination.resource_types, 'resource_types', context);
    uniqueIssues(destination.path_prefixes, 'path_prefixes', context);
    uniqueIssues(destination.resolved_addresses.map(stripIpv6Brackets), 'resolved_addresses', context);
});
export const BrowserCredentialBindingSchema = z.strictObject({
    credential_ref: secretRef,
    epoch: positive,
    scope: z.string().min(1).max(256),
    origins: z.array(z.string().url()).min(1).max(64),
});
export const BrowserEffectPolicySchema = z.strictObject({
    operation: z.string().regex(/^[a-z][a-z0-9.-]*$/).max(128),
    origin: z.string().url().max(2_048),
    action: z.enum(BROWSER_EFFECT_ACTIONS),
    selectors: z.array(z.string().min(1).max(2_048)).min(1).max(128),
    idempotency_strategy: z.enum(BROWSER_IDEMPOTENCY_STRATEGIES),
    reconciliation_url_template: z.string().url().max(4_096),
    found_selector: z.string().min(1).max(2_048),
    absent_selector: z.string().min(1).max(2_048),
    receipt_selector: z.string().min(1).max(2_048),
});
export const BrowserAdapterDescriptorSchema = z.strictObject({
    name: z.literal('zero-ar.playwright-chromium'),
    version: semver,
    engine: z.enum(BROWSER_ENGINES),
    playwright_version: semver,
    chromium_revision: z.string().min(1).max(128),
    executable_ref: hash,
    conformance_refs: z.array(hash).min(1).max(64),
});
export const BrowserBindingSchema = z.strictObject({
    contract: z.literal('zero-ar-browser-binding/1'),
    binding_ref: hash,
    run_id: runId,
    tenant: z.string().min(1).max(256),
    profile_ref: hash,
    adapter: BrowserAdapterDescriptorSchema,
    isolation: z.enum(BROWSER_ISOLATIONS),
    limit_enforcement: z.enum(BROWSER_LIMIT_ENFORCEMENTS),
    network_mode: z.enum(BROWSER_NETWORK_MODES),
    destinations: z.array(BrowserDestinationSchema).max(256),
    credentials: z.array(BrowserCredentialBindingSchema).max(32),
    effect_policies: z.array(BrowserEffectPolicySchema).max(128),
    limits: BrowserLimitsSchema,
    supersedes_binding_ref: hash.nullable(),
    destination_decision_ref: hash.nullable(),
    created_by: z.string().min(1).max(256),
    reviewed_by: z.string().min(1).max(256),
    created_at: z.string().datetime(),
}).superRefine((binding, context) => {
    if (binding.network_mode === 'public-only' && binding.destinations.some((item) => item.origin.startsWith('http:'))) {
        context.addIssue({ code: 'custom', path: ['destinations'], message: 'public-only bindings require HTTPS origins.' });
    }
    if (binding.network_mode === 'loopback-test-only' && (binding.isolation !== 'process' || binding.limit_enforcement !== 'observed-process')) {
        context.addIssue({ code: 'custom', path: ['network_mode'], message: 'loopback fixture mode is valid only for observed development processes.' });
    }
    if (binding.isolation === 'container' && binding.limit_enforcement !== 'cgroup-v2') {
        context.addIssue({ code: 'custom', path: ['limit_enforcement'], message: 'container browser bindings require cgroup-v2 limit enforcement.' });
    }
    if (binding.isolation === 'process' && binding.limit_enforcement !== 'observed-process') {
        context.addIssue({ code: 'custom', path: ['limit_enforcement'], message: 'process browser bindings use observed-process limit enforcement.' });
    }
    const origins = binding.destinations.map((item) => item.origin);
    uniqueIssues(origins, 'destinations', context);
    for (const credential of binding.credentials) {
        for (const origin of credential.origins) {
            if (!binding.destinations.some((destination) => destination.origin === origin && destination.credential_scope === credential.scope)) {
                context.addIssue({ code: 'custom', path: ['credentials'], message: `credential origin ${origin} does not admit scope ${credential.scope}.` });
            }
        }
    }
    for (const destination of binding.destinations) {
        if (!destination.credential_scope)
            continue;
        const matches = binding.credentials.filter((credential) => credential.scope === destination.credential_scope && credential.origins.includes(destination.origin));
        if (matches.length !== 1) {
            context.addIssue({ code: 'custom', path: ['credentials'], message: `destination ${destination.origin} scope ${destination.credential_scope} must select exactly one credential binding.` });
        }
    }
    for (const policy of binding.effect_policies) {
        if (!origins.includes(policy.origin))
            context.addIssue({ code: 'custom', path: ['effect_policies'], message: `effect origin ${policy.origin} is not an admitted destination.` });
        if (!policy.reconciliation_url_template.includes('{idempotency_key}'))
            context.addIssue({ code: 'custom', path: ['effect_policies'], message: `effect policy ${policy.operation} reconciliation URL must contain {idempotency_key}.` });
    }
});
export function deriveBrowserBindingRef(binding) {
    return contentHash(binding);
}
export function compileBrowserBinding(value) {
    const binding = BrowserBindingSchema.parse(value);
    const { binding_ref, ...material } = binding;
    if (binding_ref !== deriveBrowserBindingRef(material))
        throw new Error('browser binding ref does not match its material fields. Rebuild the immutable binding before admission.');
    return Object.freeze(binding);
}
const templateName = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected a lowercase dot-separated template name').max(128);
/**
 * A reviewed browser binding template from deployment configuration. Intake
 * names a template; the kernel pins the template ref into identity and
 * materializes the run-scoped binding after the run id exists, so identity
 * never depends on one run and the kernel injects binding_ref (BRC-001).
 */
export const BrowserBindingTemplateSchema = z.strictObject({
    contract: z.literal('zero-ar-browser-binding-template/1'),
    name: templateName,
    version: semver,
    profile_ref: hash,
    adapter: BrowserAdapterDescriptorSchema,
    isolation: z.enum(BROWSER_ISOLATIONS),
    limit_enforcement: z.enum(BROWSER_LIMIT_ENFORCEMENTS),
    network_mode: z.enum(BROWSER_NETWORK_MODES),
    destinations: z.array(BrowserDestinationSchema).max(256),
    credentials: z.array(BrowserCredentialBindingSchema).max(32),
    effect_policies: z.array(BrowserEffectPolicySchema).max(128),
    limits: BrowserLimitsSchema,
    reviewed_by: z.string().min(1).max(256),
});
/** The browser input a run asks for: one reviewed template, by name. */
export const BrowserIntakeInputSchema = z.strictObject({ template: templateName });
/** What a resolved run manifest pins about its browser: the template, never the per-run binding. */
export const ResolvedBrowserTemplateSchema = z.strictObject({ template: templateName, template_ref: hash });
/** A request to widen one run's destinations. The proposer comes from authentication, never the body (BRC-012). */
export const BrowserDestinationProposalRequestSchema = z.strictObject({
    requested_destination: BrowserDestinationSchema,
    reason: z.string().min(1).max(2_000),
    idempotency_key: z.string().min(1).max(256),
});
/** A disposition on one proposal. The approver is the verified participant, never the body (BRC-013). */
export const BrowserDestinationDecisionRequestSchema = z.strictObject({
    disposition: z.enum(BROWSER_DESTINATION_DISPOSITIONS),
    reason: z.string().min(1).max(2_000),
    idempotency_key: z.string().min(1).max(256),
});
export const BrowserDestinationProposalSchema = z.strictObject({
    proposal_ref: hash,
    run_id: runId,
    tenant: z.string().min(1).max(256),
    participant: z.string().min(1).max(256),
    current_binding_ref: hash,
    requested_destination: BrowserDestinationSchema,
    reason: z.string().min(1).max(2_000),
    proposed_at: z.string().datetime(),
});
export function deriveBrowserDestinationProposalRef(proposal) {
    return contentHash(proposal);
}
export const BrowserDestinationDecisionSchema = z.strictObject({
    decision_ref: hash,
    proposal_ref: hash,
    run_id: runId,
    current_binding_ref: hash,
    disposition: z.enum(BROWSER_DESTINATION_DISPOSITIONS),
    approver: z.string().regex(/^operator:[A-Za-z0-9._/-]+$/).max(256),
    authentication_ref: hash,
    authority_epoch: positive,
    reason: z.string().min(1).max(2_000),
    decided_at: z.string().datetime(),
});
export function deriveBrowserDestinationDecisionRef(decision) {
    return contentHash(decision);
}
export function applyBrowserDestinationDecision(bindingInput, proposalInput, decisionInput) {
    const binding = compileBrowserBinding(bindingInput);
    const proposal = BrowserDestinationProposalSchema.parse(proposalInput);
    const decision = BrowserDestinationDecisionSchema.parse(decisionInput);
    const { proposal_ref, ...proposalMaterial } = proposal;
    const { decision_ref, ...decisionMaterial } = decision;
    if (proposal_ref !== deriveBrowserDestinationProposalRef(proposalMaterial))
        throw new Error('browser destination proposal ref does not match its content.');
    if (decision_ref !== deriveBrowserDestinationDecisionRef(decisionMaterial))
        throw new Error('browser destination decision ref does not match its content.');
    if (decision.disposition !== 'approved')
        throw new Error('a refused browser destination decision grants no destination.');
    if (proposal.current_binding_ref !== binding.binding_ref || decision.current_binding_ref !== binding.binding_ref)
        throw new Error('browser destination approval does not bind the current immutable binding.');
    if (proposal.proposal_ref !== decision.proposal_ref || proposal.run_id !== binding.run_id || decision.run_id !== binding.run_id || proposal.tenant !== binding.tenant) {
        throw new Error('browser destination approval does not bind the same proposal, run and tenant.');
    }
    const destinations = [...binding.destinations, proposal.requested_destination].sort((left, right) => left.origin.localeCompare(right.origin));
    const { binding_ref: _oldBindingRef, ...priorMaterial } = binding;
    const material = {
        ...priorMaterial,
        destinations,
        supersedes_binding_ref: binding.binding_ref,
        destination_decision_ref: decision.decision_ref,
    };
    return compileBrowserBinding({ ...material, binding_ref: deriveBrowserBindingRef(material) });
}
export const BrowserRequestProvenanceSchema = z.strictObject({
    url: z.string().url().max(4_096),
    redacted_url: z.string().url().max(4_096),
    method: z.string().regex(/^[A-Z]+$/),
    resource_type: z.enum(BROWSER_RESOURCE_TYPES),
    resolved_address: address.nullable(),
    decision: z.enum(['allowed', 'refused']),
    response_status: z.number().int().min(100).max(599).nullable(),
    response_bytes: count,
});
export const BrowserProvenanceSchema = z.strictObject({
    schema: z.literal('zero-ar-browser-provenance/1'),
    run_id: runId,
    invoke_id: z.string().min(1).max(256),
    binding_ref: hash,
    profile_ref: hash,
    observation: z.enum(BROWSER_OBSERVATIONS),
    requested_url: z.string().url().max(4_096),
    final_url: z.string().url().max(4_096),
    redirects: z.array(z.string().url().max(4_096)).max(20),
    requests: z.array(BrowserRequestProvenanceSchema).max(100_000),
    content_hash: hash,
    artifact_ref: artifactRef.nullable(),
    artifact_manifest_ref: hash.nullable(),
    source_binding_ref: sourceBindingRef.nullable(),
    browser_engine: z.enum(BROWSER_ENGINES),
    browser_revision: z.string().min(1).max(128),
    captured_at: z.string().datetime(),
    content_label: z.enum(BROWSER_CONTENT_LABELS),
    instruction_authority: z.enum(BROWSER_INSTRUCTION_AUTHORITIES),
});
export const BrowserObservationResultSchema = z.strictObject({
    observation: z.enum(BROWSER_OBSERVATIONS),
    text: z.string().nullable(),
    truncated: z.boolean(),
    bytes: count,
    artifact_ref: artifactRef.nullable(),
    source_binding_ref: sourceBindingRef.nullable(),
    content_label: z.enum(BROWSER_CONTENT_LABELS),
    instruction_authority: z.enum(BROWSER_INSTRUCTION_AUTHORITIES),
    provenance: BrowserProvenanceSchema,
});
export const BrowserEffectParametersSchema = z.strictObject({
    binding_ref: hash,
    action: z.enum(BROWSER_EFFECT_ACTIONS),
    url: z.string().url().max(4_096),
    selector: z.string().min(1).max(2_048),
    fields: z.record(z.string().max(256), z.string().max(16_384)),
    artifact_ref: artifactRef.nullable(),
    artifact_hash: hash.nullable(),
    idempotency_strategy: z.enum(BROWSER_IDEMPOTENCY_STRATEGIES),
    natural_reference: z.string().min(1).max(512).nullable(),
}).superRefine((effect, context) => {
    if (effect.action === 'upload' && (!effect.artifact_ref || !effect.artifact_hash))
        context.addIssue({ code: 'custom', message: 'upload actions require the exact artifact ref and hash.' });
    if (effect.idempotency_strategy === 'natural-reference' && !effect.natural_reference)
        context.addIssue({ code: 'custom', message: 'natural-reference idempotency requires a reconciliation reference.' });
    if (Object.keys(effect.fields).length > 128)
        context.addIssue({ code: 'custom', path: ['fields'], message: 'browser effects accept at most 128 form fields.' });
});
export const BrowserProfileHealthSchema = z.strictObject({
    profile_ref: hash,
    state: z.enum(BROWSER_PROFILE_STATES),
    engine_revision: z.string().min(1).max(128),
    executable_ref: hash,
    proxy_ready: z.boolean(),
    limit_enforcement: z.enum(BROWSER_LIMIT_ENFORCEMENTS),
    checked_at: z.string().datetime(),
    reason: z.string().min(1).max(2_000),
});
export const BrowserLatencySummarySchema = z.strictObject({
    samples: positive,
    min_ms: z.number().nonnegative(),
    p50_ms: z.number().nonnegative(),
    p95_ms: z.number().nonnegative(),
    max_ms: z.number().nonnegative(),
});
export const BrowserMeasurementReportSchema = z.strictObject({
    format: z.literal('zero-ar-browser-measurement/1'),
    source_commit: z.string().regex(/^[0-9a-f]{40}$/),
    generated_at: z.string().datetime(),
    platform: z.string().min(1).max(128),
    architecture: z.string().min(1).max(128),
    node_version: z.string().min(1).max(128),
    playwright_version: semver,
    chromium_revision: z.string().min(1).max(128),
    executable_ref: hash,
    topology_ref: hash,
    fixture_ref: hash,
    samples: positive,
    concurrency: positive,
    limits: BrowserLimitsSchema,
    latency: z.strictObject({
        cold_process_context: BrowserLatencySummarySchema,
        warm_context: BrowserLatencySummarySchema,
        navigation: BrowserLatencySummarySchema,
        text_extraction: BrowserLatencySummarySchema,
        screenshot_artifact_commit: BrowserLatencySummarySchema,
        cancellation_teardown: BrowserLatencySummarySchema,
        context_teardown: BrowserLatencySummarySchema,
    }),
    peak_process_tree: z.strictObject({
        memory_mib: z.number().nonnegative(),
        process_count: count,
        cpu_time_ms: z.number().nonnegative(),
    }),
    errors: z.array(z.string().max(2_000)).max(1_000),
    publishable: z.literal(true),
    unavailable_reason: z.null(),
});
export function browserToolDeclarations(binding) {
    const isolation = binding.isolation;
    const common = {
        type: 'object',
        properties: {
            url: { type: 'string', format: 'uri', description: 'An URL already admitted by the immutable browser binding.' },
        },
        required: ['url'],
        additionalProperties: false,
    };
    const observations = [
        observationDeclaration('browser.text', 'Read bounded visible text from one URL.', { ...common, properties: { ...common.properties, selector: { type: 'string' }, max_bytes: { type: 'integer', minimum: 1, maximum: binding.limits.max_response_bytes } }, required: ['url', 'selector', 'max_bytes'] }, binding, 'bytes'),
        observationDeclaration('browser.dom', 'Read bounded markup from one URL as untrusted external content.', { ...common, properties: { ...common.properties, selector: { type: 'string' }, max_bytes: { type: 'integer', minimum: 1, maximum: binding.limits.max_response_bytes } }, required: ['url', 'selector', 'max_bytes'] }, binding, 'bytes'),
        observationDeclaration('browser.screenshot', 'Capture one URL to a content-addressed artifact.', { ...common, properties: { ...common.properties, full_page: { type: 'boolean' } }, required: ['url', 'full_page'] }, binding, 'compute_ms'),
        observationDeclaration('browser.download', 'Download one admitted URL to an artifact and optional source binding.', common, binding, 'bytes'),
    ];
    const actionMaterial = {
        name: 'browser.action',
        version: '1.0.0',
        description: 'Propose an exact consequential browser action for Effect Plane review.',
        input_schema: {
            type: 'object',
            properties: {
                binding_ref: { type: 'string', const: binding.binding_ref },
                action: { type: 'string', enum: [...BROWSER_EFFECT_ACTIONS] },
                url: { type: 'string', format: 'uri' },
                selector: { type: 'string' },
                fields: { type: 'object', additionalProperties: { type: 'string' } },
                artifact_ref: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                artifact_hash: { anyOf: [{ type: 'string' }, { type: 'null' }] },
                idempotency_strategy: { type: 'string', enum: [...BROWSER_IDEMPOTENCY_STRATEGIES] },
                natural_reference: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            },
            required: ['binding_ref', 'action', 'url', 'selector', 'fields', 'artifact_ref', 'artifact_hash', 'idempotency_strategy', 'natural_reference'],
            additionalProperties: false,
        },
        operation_class: 'effect-proposal',
        isolation,
        timeout_ms: binding.limits.wall_time_ms,
        target: 'browser',
        operation: 'execute',
        output_classification: 'internal',
        cost: { denomination: 'compute_ms', enforced_max: binding.limits.cpu_time_ms },
    };
    return [
        ...observations.map((material) => ({ ...material, contract_ref: contentHash(material) })),
        { ...actionMaterial, contract_ref: contentHash(actionMaterial) },
    ];
}
function observationDeclaration(name, description, input_schema, binding, denomination) {
    return {
        name,
        version: '1.0.0',
        description,
        input_schema,
        operation_class: 'observation',
        isolation: binding.isolation,
        timeout_ms: binding.limits.wall_time_ms,
        output_classification: 'internal',
        cost: {
            denomination,
            enforced_max: denomination === 'bytes' ? binding.limits.max_artifact_bytes : binding.limits.cpu_time_ms,
        },
    };
}
function stripIpv6Brackets(value) {
    return value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value;
}
function isIpAddress(value) {
    return isIpv4Address(value) || isIpv6Address(value);
}
function isIpv4Address(value) {
    const parts = value.split('.');
    return parts.length === 4 && parts.every((part) => /^(?:0|[1-9][0-9]{0,2})$/.test(part) && Number(part) <= 255);
}
function isIpv6Address(value) {
    if (!value.includes(':') || value.includes('%'))
        return false;
    const halves = value.split('::');
    if (halves.length > 2)
        return false;
    const segments = halves.flatMap((half) => half === '' ? [] : half.split(':'));
    if (segments.some((segment) => segment === ''))
        return false;
    const dotted = segments.findIndex((segment) => segment.includes('.'));
    if (dotted !== -1 && (dotted !== segments.length - 1 || !isIpv4Address(segments[dotted])))
        return false;
    if (segments.some((segment, index) => index !== dotted && !/^[0-9a-f]{1,4}$/i.test(segment)))
        return false;
    const width = segments.length + (dotted === -1 ? 0 : 1);
    return halves.length === 2 ? width < 8 : width === 8;
}
function uniqueIssues(values, path, context) {
    if (new Set(values.map((value) => value.toLowerCase())).size !== values.length) {
        context.addIssue({ code: 'custom', path: [path], message: `${path} entries must be unique.` });
    }
}
