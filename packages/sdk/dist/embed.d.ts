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
import type { ControlAccepted, ControlRequest, IntakeRequest, ProductPackageGraphInput, RecordEnvelope, RunResult, RunSnapshot } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
export interface ZeroAROptions {
    /** The hosted or Local Lite endpoint. Required unless a profile supplies one. */
    endpoint?: string;
    apiKey?: string;
    /** local-lite connects to an already-running local service through an explicit endpoint or environment binding. */
    profile?: 'hosted' | 'local-lite';
    headers?: Record<string, string>;
    /** Optional package graph supplied by packaging tests or embedded hosts. */
    packageGraph?: ProductPackageGraphInput;
}
/** What a run needs to start. The objective alone is legal where a default agent is authorized. */
export interface RunInput {
    objective: string;
    agent?: string;
    principals?: IntakeRequest['principals'];
    budgets?: IntakeRequest['budgets'];
    items?: string[];
    task_contract_ref?: string;
    posture_ref?: string;
    idempotency_key?: string;
}
/**
 * One durable run, addressed by id. The handle is a convenience over
 * public routes and holds no state authority: recreate it from an id and
 * it behaves identically (DXI-004).
 */
export declare class RunHandle {
    readonly id: string;
    private readonly client;
    constructor(client: ZeroARClient, run_id: string);
    snapshot(): Promise<RunSnapshot>;
    /**
     * Durable records in order, resuming from a cursor. The stream ends when
     * nothing further can arrive on its own: a terminal, or a suspension
     * waiting on an act nobody has taken yet. A caller stops earlier with a
     * signal.
     */
    events(options?: {
        after?: number;
        signal?: AbortSignal;
    }): AsyncIterable<RecordEnvelope>;
    steer(text: string, control_id?: string): Promise<ControlAccepted>;
    redirect(text: string, control_id?: string): Promise<ControlAccepted>;
    /** Settle one parked handle with output, or dismiss it with a reason. */
    answer(handle: string, settlement: {
        text: string;
    } | {
        reason: string;
    }, control_id?: string): Promise<ControlAccepted>;
    cancel(reason?: string, control_id?: string): Promise<ControlAccepted>;
    control(request: ControlRequest): Promise<ControlAccepted>;
    /**
     * The typed result. With wait, the handle follows durable records until
     * the run reaches a terminal; the verdict, gaps, effects, and blocking
     * outcomes arrive exactly as the public contract states them, never
     * collapsed into success (DXI-005).
     */
    result(options?: {
        wait?: boolean;
        signal?: AbortSignal;
    }): Promise<RunResult>;
    /** What this run resolved before any external work: agent, model plan, tools, contract. */
    explain(): Promise<{
        agent: string;
        model: string;
        verified_completion_reachable: boolean;
        contract: string | null;
    }>;
}
/** The configured handle an application holds. It wraps the public client and nothing else. */
export declare class ZeroAR {
    readonly client: ZeroARClient;
    constructor(client: ZeroARClient);
    /** Create and start one run, then hand back its durable handle. */
    run(input: string | RunInput): Promise<RunHandle>;
    /** The same handle for a run this process did not create (DXI-004). */
    attach(run_id: string): RunHandle;
}
/**
 * Configure one Zero-AR handle. This constructs a public client and
 * nothing else: no kernel, no database, no provider SDK (DXI-001).
 */
export declare function createZeroAR(options?: ZeroAROptions): ZeroAR;
