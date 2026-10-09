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
import type { BudgetAddition, BudgetAmendmentAccepted, CapabilityAdmissionAccepted, CapabilityAdmissionCancellationRequest, CapabilityAdmissionDecisionRequest, CapabilityAdmissionList, CapabilityAdmissionListRequest, CapabilityAdmissionRequest, CapabilityAdmissionView, ControlAccepted, ControlRequest, IntakeRequest, ProductPackageGraphInput, RecordEnvelope, RunResult, RunSnapshot, RegisterSourceRequest, SourceBindingInput, SourceInstance, SourceList, SourcePreflight, SourceSnapshot, SourceSnapshotPage, SourceSnapshotPageRequest, VerificationPlan } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
export interface LocalCapabilityAdmissionInput {
    reason: string;
    expected_active_epoch?: number;
    idempotency_key?: string;
}
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
    /** Start in the server and return immediately so another process can attach by id. */
    detached?: boolean;
    agent?: string;
    principals?: IntakeRequest['principals'];
    budgets?: IntakeRequest['budgets'];
    items?: string[];
    /** Immutable tenant source bindings, resolved by the runtime before any model call. */
    sources?: SourceBindingInput[];
    /** Native input parity. Flat items/sources remain compatibility conveniences. */
    inputs?: {
        items?: string[];
        artifacts?: NonNullable<IntakeRequest['inputs']>['artifacts'];
        sources?: SourceBindingInput[];
    };
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
    /** The canonical, content-addressed plan reconstructed from run.created. */
    verificationPlan(): Promise<VerificationPlan>;
    /**
     * Durable records in order, resuming from a record cursor. The stream ends
     * when nothing further can arrive on its own: a terminal, or a suspension
     * waiting on an act nobody has taken yet. A caller stops earlier with a
     * signal. The snapshot is read before each page, so a page read after a
     * settled snapshot holds every record up to the settle point. Between
     * pages the handle waits on the durable event stream, which reconnects
     * from its cursor, never on a timer.
     */
    events(options?: {
        after?: number;
        signal?: AbortSignal;
    }): AsyncIterable<RecordEnvelope>;
    steer(text: string, control_id?: string): Promise<ControlAccepted>;
    redirect(text: string, control_id?: string): Promise<ControlAccepted>;
    /** Suspend the run at its next turn boundary, or now if it is suspended, until a person resumes it. */
    pause(reason?: string, control_id?: string): Promise<ControlAccepted>;
    /** Settle one parked handle with output or one of its question's choices, or dismiss it with a reason. */
    answer(handle: string, settlement: {
        text: string;
    } | {
        choice: string;
    } | {
        reason: string;
    }, control_id?: string): Promise<ControlAccepted>;
    cancel(reason?: string, control_id?: string): Promise<ControlAccepted>;
    control(request: ControlRequest): Promise<ControlAccepted>;
    /** Add budget to this run. A suspended run keeps waiting until resume() continues it. */
    amendBudgets(add: BudgetAddition, reason?: string, idempotency_key?: string): Promise<BudgetAmendmentAccepted>;
    /** Request one immutable publication already available to the runtime. */
    requestCapability(request: CapabilityAdmissionRequest): Promise<CapabilityAdmissionAccepted>;
    /** Compile and publish a local Agent Skill, then request its exact hashes. */
    requestCapabilityFromPath(sourcePath: string, input: LocalCapabilityAdmissionInput): Promise<CapabilityAdmissionAccepted>;
    capabilityAdmissions(query?: CapabilityAdmissionListRequest): Promise<CapabilityAdmissionList>;
    inspectCapability(request_id: string): Promise<CapabilityAdmissionView>;
    decideCapability(request_id: string, decision: CapabilityAdmissionDecisionRequest): Promise<CapabilityAdmissionAccepted>;
    approveCapability(request_id: string, input: Omit<CapabilityAdmissionDecisionRequest, 'decision'>): Promise<CapabilityAdmissionAccepted>;
    refuseCapability(request_id: string, input: Omit<CapabilityAdmissionDecisionRequest, 'decision'>): Promise<CapabilityAdmissionAccepted>;
    cancelCapability(request_id: string, input: CapabilityAdmissionCancellationRequest): Promise<CapabilityAdmissionAccepted>;
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
    /** Explain from the same complete canonical object returned by the public API and CLI. */
    explain(): Promise<VerificationPlan>;
}
/** The configured handle an application holds. It wraps the public client and nothing else. */
export declare class ZeroAR {
    readonly client: ZeroARClient;
    constructor(client: ZeroARClient);
    /**
     * Create and start one run, then hand back its durable handle at
     * acceptance. The run works on in the runtime; follow it with events()
     * or wait for it with result({ wait: true }).
     */
    run(input: string | RunInput): Promise<RunHandle>;
    /** The same handle for a run this process did not create (DXI-004). */
    attach(run_id: string): RunHandle;
    registerSource(request: RegisterSourceRequest): Promise<SourceInstance>;
    sources(): Promise<SourceList>;
    inspectSource(source_ref: string): Promise<SourceInstance>;
    snapshotSource(source_ref: string): Promise<SourceSnapshot>;
    sourceSnapshotMembers(source_ref: string, query?: SourceSnapshotPageRequest): Promise<SourceSnapshotPage>;
    preflightSource(source_ref: string): Promise<SourcePreflight>;
}
/**
 * Configure one Zero-AR handle. This constructs a public client and
 * nothing else: no kernel, no database, no provider SDK (DXI-001).
 */
export declare function createZeroAR(options?: ZeroAROptions): ZeroAR;
