import { DiagnosticError, SourceBindingInputSchema, assertProductPackageGraph, makeId, productEnvironmentValue, refuse, turnCeilingForBudget } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
import { publishCapabilitySource } from "./capability-admission.js";
const DEFAULT_BUDGETS = {
    consumption: { model_tokens: 100_000, compute_ms: 600_000, tool_calls: 64, bytes: 64 * 1_048_576 },
    attention: 0,
    verification_reserve_fraction: 0.2,
    max_turns: turnCeilingForBudget(100_000),
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
    verificationPlan() {
        return this.client.verificationPlan(this.id);
    }
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
                wake ??= this.client.followRecords(this.id, { after: 0, ...(options.signal ? { signal: options.signal } : {}) });
                while (latestEvent <= after) {
                    const next = await wake.next();
                    if (next.done) {
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
    pause(reason, control_id = makeId('ctl')) {
        return this.control({ verb: 'pause', control_id, ...(reason ? { reason } : {}) });
    }
    answer(handle, settlement, control_id = makeId('ctl')) {
        return this.control({ verb: 'answer', control_id, handle, ...settlement });
    }
    cancel(reason = 'cancelled by the application', control_id = makeId('ctl')) {
        return this.control({ verb: 'cancel', control_id, reason });
    }
    control(request) {
        return this.client.control(this.id, request);
    }
    amendBudgets(add, reason, idempotency_key = makeId('ctl')) {
        return this.client.amendBudgets(this.id, { idempotency_key, add, ...(reason ? { reason } : {}) });
    }
    requestCapability(request) {
        return this.client.requestCapabilityAdmission(this.id, request);
    }
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
    async result(options = {}) {
        if (options.wait) {
            for await (const _record of this.events(options.signal ? { signal: options.signal } : {})) {
            }
        }
        return this.client.result(this.id);
    }
    explain() {
        return this.verificationPlan();
    }
}
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
export class ZeroAR {
    client;
    constructor(client) {
        this.client = client;
    }
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
        if (!spec.detached && created.snapshot.status === 'created') {
            await this.client.start(created.run_id, {
                idempotency_key: `${request.idempotency_key}:start`,
                reason: 'start work accepted by the embedding facade',
            });
        }
        return new RunHandle(this.client, created.run_id);
    }
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
