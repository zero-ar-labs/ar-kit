import type { IntakeRequest, RunResult } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
export interface OrchestrationStep {
    name: string;
    objective: string;
    budgets?: IntakeRequest['budgets'];
}
export interface OrchestrationPlan {
    name: string;
    version: string;
    on_unverified: 'stop' | 'continue';
    steps: OrchestrationStep[];
}
export declare function defineOrchestration(plan: OrchestrationPlan): Readonly<OrchestrationPlan> & {
    kind: 'orchestration';
    hash: string;
};
export interface OrchestrationOutcome {
    plan_ref: string;
    steps: {
        name: string;
        run_id: string;
        terminal: RunResult['terminal'];
        verdict: RunResult['verdict'];
        artifact_entry: string | null;
    }[];
    halted: {
        step: string;
        reason: string;
    } | null;
}
export declare function runOrchestration(client: ZeroARClient, plan: ReturnType<typeof defineOrchestration>, options: {
    principals: IntakeRequest['principals'];
}): Promise<OrchestrationOutcome>;
