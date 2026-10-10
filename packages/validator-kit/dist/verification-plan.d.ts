import type { TaskContract, VerificationCheckpointInput, VerificationCheckpointInputBody, VerificationAttentionCapacitySnapshot, VerificationAttentionCapacitySnapshotBody, VerificationPlan, VerificationPlanInput } from '@zero-ar/contracts';
export declare const ATTENTION_NOT_EVALUATED: "attention feasibility not evaluated";
export declare function defineVerificationCheckpointInput(source: Omit<VerificationCheckpointInputBody, 'schema'>): VerificationCheckpointInput;
export declare function defineVerificationAttentionCapacitySnapshot(source: Omit<VerificationAttentionCapacitySnapshotBody, 'schema'>): VerificationAttentionCapacitySnapshot;
export interface SelectedValidatorInvocation {
    rule: string;
    binding_position: number;
    binding: TaskContract['validators'][number];
    sufficient: boolean;
    deferred: boolean;
}
export declare function selectValidatorInvocations(contract: TaskContract, rules: readonly string[]): SelectedValidatorInvocation[];
export declare function selectedValidatorCost(contract: TaskContract, rules: readonly string[]): number;
export interface ControlledVerificationCheckpoint {
    interval_items: number;
    contract_ceiling: number;
    controller: string;
    controller_version: string;
    reason: string;
    fallback_used: boolean;
    inputs_hash: string;
    phase_schedules: VerificationCheckpointInputBody['phase_schedules'];
    projected_checkpoints: number;
    projected_cost_ms: number;
}
export declare function verificationCheckpointInputForContract(contract: TaskContract, items: number, controlled?: ControlledVerificationCheckpoint | null): VerificationCheckpointInput;
export declare function compileVerificationPlan(raw: VerificationPlanInput): VerificationPlan;
export declare function renderVerificationPlan(plan: VerificationPlan): string;
