/**
 * The embedding facade (developer-integration appendix, DXI-1C).
 *
 * What this is: one configured Zero-AR handle and one typed run handle over
 * the generated public client. Every method here calls an existing
 * public route and adds no semantics of its own: no second transport, no
 * cached run truth, no completion rule, no private import.
 *
 * How it fits: an application embeds this, not the kernel. Reattaching by
 * run id after a restart gives the same observable behaviour, because the
 * handle holds nothing the server does not (DXI-001 through DXI-004).
 */
import { DiagnosticError, SourceBindingInputSchema, assertProductPackageGraph, makeId, productEnvironmentValue, refuse } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
import { publishCapabilitySource } from "./capability-admission.js";
const DEFAULT_BUDGETS = {
    consumption: { model_tokens: 100_000 },
    attention: 0,
    verification_reserve_fraction: 0.2,
    max_turns: 24,
};
const DEFAULT_PRINCIPALS = {
    executing: 'svc:application',
    originating: 'application',
    accountable: 'application-owner',
};
const EMBEDDED_SDK_PACKAGE_GRAPH = [
    { name: '@zero-ar/contracts', implementation_identity: 'successor' },
    { name: '@zero-ar/client', implementation_identity: 'successor' },
    { name: '@zero-ar/sdk', implementation_identity: 'successor' },
];
/**
 * One durable run, addressed by id. The handle is a convenience over
 * public routes and holds no state authority: recreate it from an id and
 * it behaves identically (DXI-004).
 */
export class RunHandle {
    id;
    client;
    constructor(client, run_id) {
        this.client = client;
        this.id = run_id;
    }
    snapshot() {
        return this.client.snapshot(this.id);
    }
    /** The canonical, content-addressed plan reconstructed from run.created. */
    verificationPlan() {
        return this.client.verificationPlan(this.id);
    }
    /**
     * Durable records in order, resuming from a record cursor. The stream ends
     * when nothing further can arrive on its own: a terminal, or a suspension
     * waiting on an act nobody has taken yet. A caller stops earlier with a
     * signal. The snapshot is read before each page, so a page read after a
     * settled snapshot holds every record up to the settle point. Between
     * pages the handle waits on the durable event stream, which reconnects
     * from its cursor, never on a timer.
     */
    async *events(options = {}) {
        let after = options.after ?? 0;
        let wake = null;
        let latestEvent = 0;
        try {
            for (;;) {
                if (options.signal?.aborted)
                    return;
                const snapshot = await answered(() => this.client.snapshot(this.id), options.signal);
                const page = await answered(() => this.client.records(this.id, after), options.signal);
                for (const record of page.records) {
                    yield record;
                    after = record.seq;
                }
                if (snapshot.terminal || snapshot.status === 'suspended')
                    return;
                if (page.records.length > 0)
                    continue;
                // Nothing new since a running snapshot: wait for the next durable
                // event past the cursor. Replayed events at or below it are skipped.
                wake ??= this.client.followRecords(this.id, { after: 0, ...(options.signal ? { signal: options.signal } : {}) });
                while (latestEvent <= after) {
                    const next = await wake.next();
                    if (next.done) {
                        // The follow settled or the signal aborted; the next snapshot says which.
                        wake = null;
                        break;
                    }
                    latestEvent = Math.max(latestEvent, next.value.record_seq);
                }
            }
        }
        finally {
            await wake?.return(undefined);
        }
    }
    steer(text, control_id = makeId('ctl')) {
        return this.control({ verb: 'steer', control_id, text });
    }
    redirect(text, control_id = makeId('ctl')) {
        return this.control({ verb: 'redirect', control_id, text });
    }
    /** Settle one parked handle with output, or dismiss it with a reason. */
    answer(handle, settlement, control_id = makeId('ctl')) {
        return this.control({ verb: 'answer', control_id, handle, ...settlement });
    }
    cancel(reason = 'cancelled by the application', control_id = makeId('ctl')) {
        return this.control({ verb: 'cancel', control_id, reason });
    }
    control(request) {
        return this.client.control(this.id, request);
    }
    /** Request one immutable publication already available to the runtime. */
    requestCapability(request) {
        return this.client.requestCapabilityAdmission(this.id, request);
    }
    /** Compile and publish a local Agent Skill, then request its exact hashes. */
    async requestCapabilityFromPath(sourcePath, input) {
        const candidate = await publishCapabilitySource(this.client, sourcePath);
        return this.requestCapability({
            kind: 'add',
            candidate_locator: candidate.publication_ref,
            expected_content_hash: candidate.root_ref,
            declared_package_kind: 'procedure',
            requested_capabilities: [...new Set([candidate.procedure.name, ...(candidate.procedure.allowed_tools ?? [])])].sort(),
            reason: input.reason,
            requested_activation_mode: 'next-safe-boundary',
            ...(input.expected_active_epoch === undefined ? {} : { expected_active_epoch: input.expected_active_epoch }),
            idempotency_key: input.idempotency_key ?? makeId('ctl'),
        });
    }
    capabilityAdmissions(query = {}) {
        return this.client.listCapabilityAdmissions(this.id, query);
    }
    inspectCapability(request_id) {
        return this.client.inspectCapabilityAdmission(this.id, request_id);
    }
    decideCapability(request_id, decision) {
        return this.client.decideCapabilityAdmission(this.id, request_id, decision);
    }
    approveCapability(request_id, input) {
        return this.decideCapability(request_id, { ...input, decision: 'approve' });
    }
    refuseCapability(request_id, input) {
        return this.decideCapability(request_id, { ...input, decision: 'refuse' });
    }
    cancelCapability(request_id, input) {
        return this.client.cancelCapabilityAdmission(this.id, request_id, input);
    }
    /**
     * The typed result. With wait, the handle follows durable records until
     * the run reaches a terminal; the verdict, gaps, effects, and blocking
     * outcomes arrive exactly as the public contract states them, never
     * collapsed into success (DXI-005).
     */
    async result(options = {}) {
        if (options.wait) {
            for await (const _record of this.events(options.signal ? { signal: options.signal } : {})) {
                // Draining the stream is how a caller waits; the records are the
                // application's to read through events() when it wants them.
            }
        }
        return this.client.result(this.id);
    }
    /** Explain from the same complete canonical object returned by the public API and CLI. */
    explain() {
        return this.verificationPlan();
    }
}
/**
 * Retry a read the runtime did not answer, as while it restarts, for up to
 * sixty seconds. A refusal the runtime answered with a diagnostic throws at
 * once, and so does an abort.
 */
async function answered(read, signal) {
    const started = Date.now();
    let delay = 250;
    for (;;) {
        try {
            return await read();
        }
        catch (error) {
            if (error instanceof DiagnosticError || signal?.aborted || Date.now() - started >= 60_000)
                throw error;
            await new Promise((resolve) => {
                const done = () => {
                    clearTimeout(timer);
                    signal?.removeEventListener('abort', done);
                    resolve();
                };
                const timer = setTimeout(done, delay);
                signal?.addEventListener('abort', done, { once: true });
            });
            delay = Math.min(delay * 2, 5_000);
        }
    }
}
/** The configured handle an application holds. It wraps the public client and nothing else. */
export class ZeroAR {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Create and start one run, then hand back its durable handle at
     * acceptance. The run works on in the runtime; follow it with events()
     * or wait for it with result({ wait: true }).
     */
    async run(input) {
        const spec = typeof input === 'string' ? { objective: input } : input;
        if (spec.items && spec.inputs?.items)
            refuse({ code: 'sdk.input.ambiguous', message: 'Supply items through either RunInput.items or RunInput.inputs.items, not both.', clause: 'SRC-024' });
        if (spec.sources && spec.inputs?.sources)
            refuse({ code: 'sdk.input.ambiguous', message: 'Supply sources through either RunInput.sources or RunInput.inputs.sources, not both.', clause: 'SRC-024' });
        const items = spec.inputs?.items ?? spec.items;
        const artifacts = spec.inputs?.artifacts;
        const sources = spec.inputs?.sources ?? spec.sources;
        const request = {
            objective: spec.objective,
            principals: spec.principals ?? DEFAULT_PRINCIPALS,
            budgets: spec.budgets ?? DEFAULT_BUDGETS,
            idempotency_key: spec.idempotency_key ?? makeId('ctl'),
            ...(spec.agent ? { agent_ref: spec.agent } : {}),
            ...(spec.task_contract_ref ? { task_contract_ref: spec.task_contract_ref } : {}),
            ...(spec.posture_ref ? { posture_ref: spec.posture_ref } : {}),
            ...(items || artifacts || sources ? { inputs: {
                    ...(items ? { items } : {}),
                    ...(artifacts ? { artifacts } : {}),
                    ...(sources ? { sources: sources.map((source) => SourceBindingInputSchema.parse(source)) } : {}),
                } } : {}),
        };
        const created = spec.detached
            ? await this.client.createDeferredRun(request)
            : await this.client.createRun(request);
        // Creation is idempotent: a key that resolved to an existing run hands
        // back that run rather than starting it a second time. A runtime that
        // admits without starting leaves the run created, and the start key is
        // derived from the create key so a retry converges on one start.
        if (!spec.detached && created.snapshot.status === 'created') {
            await this.client.start(created.run_id, {
                idempotency_key: `${request.idempotency_key}:start`,
                reason: 'start work accepted by the embedding facade',
            });
        }
        return new RunHandle(this.client, created.run_id);
    }
    /** The same handle for a run this process did not create (DXI-004). */
    attach(run_id) {
        return new RunHandle(this.client, run_id);
    }
    registerSource(request) {
        return this.client.registerSource(request);
    }
    sources() {
        return this.client.listSources();
    }
    inspectSource(source_ref) {
        return this.client.inspectSource(source_ref);
    }
    snapshotSource(source_ref) {
        return this.client.snapshotSource(source_ref);
    }
    sourceSnapshotMembers(source_ref, query = {}) {
        return this.client.listSourceSnapshotMembers(source_ref, query);
    }
    preflightSource(source_ref) {
        return this.client.preflightSource(source_ref);
    }
}
/**
 * Configure one Zero-AR handle. This constructs a public client and
 * nothing else: no kernel, no database, no provider SDK (DXI-001).
 */
export function createZeroAR(options = {}) {
    assertProductPackageGraph(options.packageGraph ?? EMBEDDED_SDK_PACKAGE_GRAPH);
    const endpoint = options.endpoint ?? endpointFromEnvironment(options.profile, process.env);
    if (!endpoint) {
        refuse({
            code: 'sdk.endpoint.missing',
            message: 'createZeroAR needs an endpoint because the server chooses its local port at startup unless deployment pins one.',
            fix: 'Pass createZeroAR({ endpoint }) after reading the server ready JSON, or set ZERO_AR_URL or ZERO_AR_PORT.',
        });
    }
    const headers = {
        ...(options.headers ?? {}),
        ...(options.apiKey ? { authorization: `Bearer ${options.apiKey}` } : {}),
    };
    return new ZeroAR(new ZeroARClient(endpoint, { headers }));
}
function endpointFromEnvironment(profile, env) {
    const direct = productEnvironmentValue('URL', env);
    if (direct)
        return direct;
    if (profile !== 'local-lite')
        return undefined;
    const port = productEnvironmentValue('PORT', env);
    if (!port)
        return undefined;
    const parsed = Number.parseInt(port, 10);
    if (!/^[0-9]+$/.test(port) || parsed < 1 || parsed > 65_535) {
        refuse({
            code: 'sdk.endpoint.port.invalid',
            message: `local-lite port ${port} is not a TCP port number, so the SDK cannot derive a loopback endpoint.`,
            fix: 'Use the server ready JSON URL, or set ZERO_AR_PORT to a number from 1 through 65535.',
        });
    }
    return `http://127.0.0.1:${parsed}`;
}
