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
import { assertProductPackageGraph, makeId, productEnvironmentValue, refuse } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
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
    /**
     * Durable records in order, resuming from a cursor. The stream ends when
     * nothing further can arrive on its own: a terminal, or a suspension
     * waiting on an act nobody has taken yet. A caller stops earlier with a
     * signal.
     */
    async *events(options = {}) {
        let after = options.after ?? 0;
        for (;;) {
            if (options.signal?.aborted)
                return;
            const page = await this.client.records(this.id, after);
            for (const record of page.records) {
                yield record;
                after = record.seq;
            }
            const snapshot = await this.client.snapshot(this.id);
            if (snapshot.terminal || snapshot.status === 'suspended')
                return;
            if (page.records.length === 0)
                await new Promise((resolve) => setTimeout(resolve, 25));
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
    /** What this run resolved before any external work: agent, model plan, tools, contract. */
    async explain() {
        const snapshot = await this.snapshot();
        return {
            agent: snapshot.agent_name,
            model: snapshot.model_ref,
            verified_completion_reachable: snapshot.verified_completion_reachable,
            contract: snapshot.contract?.name ?? null,
        };
    }
}
/** The configured handle an application holds. It wraps the public client and nothing else. */
export class ZeroAR {
    client;
    constructor(client) {
        this.client = client;
    }
    /** Create and start one run, then hand back its durable handle. */
    async run(input) {
        const spec = typeof input === 'string' ? { objective: input } : input;
        const request = {
            objective: spec.objective,
            principals: spec.principals ?? DEFAULT_PRINCIPALS,
            budgets: spec.budgets ?? DEFAULT_BUDGETS,
            idempotency_key: spec.idempotency_key ?? makeId('ctl'),
            ...(spec.agent ? { agent_ref: spec.agent } : {}),
            ...(spec.task_contract_ref ? { task_contract_ref: spec.task_contract_ref } : {}),
            ...(spec.posture_ref ? { posture_ref: spec.posture_ref } : {}),
            ...(spec.items ? { inputs: { items: spec.items } } : {}),
        };
        const created = await this.client.createRun(request);
        // Creation is idempotent: a key that resolved to an existing run
        // hands back that run rather than starting it a second time.
        if (created.created && created.snapshot.status === 'created') {
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
