import type { BudgetAddition, BudgetAmendmentAccepted, CapabilityAdmissionAccepted, CapabilityAdmissionCancellationRequest, CapabilityAdmissionDecisionRequest, CapabilityAdmissionList, CapabilityAdmissionListRequest, CapabilityAdmissionRequest, CapabilityAdmissionView, ControlAccepted, ControlRequest, IntakeRequest, ProductPackageGraphInput, RecordEnvelope, RunResult, RunSnapshot, RegisterSourceRequest, SourceBindingInput, SourceInstance, SourceList, SourcePreflight, SourceSnapshot, SourceSnapshotPage, SourceSnapshotPageRequest, VerificationPlan } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
export interface LocalCapabilityAdmissionInput {
    reason: string;
    expected_active_epoch?: number;
    idempotency_key?: string;
}
export interface ZeroAROptions {
    endpoint?: string;
    apiKey?: string;
    profile?: 'hosted' | 'local-lite';
    headers?: Record<string, string>;
    packageGraph?: ProductPackageGraphInput;
}
export interface RunInput {
    objective: string;
    detached?: boolean;
    agent?: string;
    principals?: IntakeRequest['principals'];
    budgets?: IntakeRequest['budgets'];
    items?: string[];
    sources?: SourceBindingInput[];
    inputs?: {
        items?: string[];
        artifacts?: NonNullable<IntakeRequest['inputs']>['artifacts'];
        sources?: SourceBindingInput[];
    };
    task_contract_ref?: string;
    posture_ref?: string;
    idempotency_key?: string;
}
export declare class RunHandle {
    readonly id: string;
    private readonly client;
    constructor(client: ZeroARClient, run_id: string);
    snapshot(): Promise<RunSnapshot>;
    verificationPlan(): Promise<VerificationPlan>;
    events(options?: {
        after?: number;
        signal?: AbortSignal;
    }): AsyncIterable<RecordEnvelope>;
    steer(text: string, control_id?: string): Promise<ControlAccepted>;
    redirect(text: string, control_id?: string): Promise<ControlAccepted>;
    pause(reason?: string, control_id?: string): Promise<ControlAccepted>;
    answer(handle: string, settlement: {
        text: string;
    } | {
        choice: string;
    } | {
        reason: string;
    }, control_id?: string): Promise<ControlAccepted>;
    cancel(reason?: string, control_id?: string): Promise<ControlAccepted>;
    control(request: ControlRequest): Promise<ControlAccepted>;
    amendBudgets(add: BudgetAddition, reason?: string, idempotency_key?: string): Promise<BudgetAmendmentAccepted>;
    requestCapability(request: CapabilityAdmissionRequest): Promise<CapabilityAdmissionAccepted>;
    requestCapabilityFromPath(sourcePath: string, input: LocalCapabilityAdmissionInput): Promise<CapabilityAdmissionAccepted>;
    capabilityAdmissions(query?: CapabilityAdmissionListRequest): Promise<CapabilityAdmissionList>;
    inspectCapability(request_id: string): Promise<CapabilityAdmissionView>;
    decideCapability(request_id: string, decision: CapabilityAdmissionDecisionRequest): Promise<CapabilityAdmissionAccepted>;
    approveCapability(request_id: string, input: Omit<CapabilityAdmissionDecisionRequest, 'decision'>): Promise<CapabilityAdmissionAccepted>;
    refuseCapability(request_id: string, input: Omit<CapabilityAdmissionDecisionRequest, 'decision'>): Promise<CapabilityAdmissionAccepted>;
    cancelCapability(request_id: string, input: CapabilityAdmissionCancellationRequest): Promise<CapabilityAdmissionAccepted>;
    result(options?: {
        wait?: boolean;
        signal?: AbortSignal;
    }): Promise<RunResult>;
    explain(): Promise<VerificationPlan>;
}
export declare class ZeroAR {
    readonly client: ZeroARClient;
    constructor(client: ZeroARClient);
    run(input: string | RunInput): Promise<RunHandle>;
    attach(run_id: string): RunHandle;
    registerSource(request: RegisterSourceRequest): Promise<SourceInstance>;
    sources(): Promise<SourceList>;
    inspectSource(source_ref: string): Promise<SourceInstance>;
    snapshotSource(source_ref: string): Promise<SourceSnapshot>;
    sourceSnapshotMembers(source_ref: string, query?: SourceSnapshotPageRequest): Promise<SourceSnapshotPage>;
    preflightSource(source_ref: string): Promise<SourcePreflight>;
}
export declare function createZeroAR(options?: ZeroAROptions): ZeroAR;
