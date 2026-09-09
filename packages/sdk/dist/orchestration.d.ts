/**
 * Authored orchestration (M7): a declared multi-run plan executed above
 * the runtime through the public client alone.
 *
 * What this is: defineOrchestration seals a named sequence of run steps
 * into an immutable, content-addressed plan, and runOrchestration walks
 * it, one real run per step, handing each step the artifacts of the
 * steps before it. The orchestrator holds no runtime authority: every
 * run is created, observed, and read through the generated client, and
 * a step that does not reach verified complete halts the plan when the
 * plan says so, with the step and reason named.
 *
 * What this deliberately is not: a workflow engine inside the kernel.
 * The runtime keeps one loop per run; sequencing lives up here, in
 * authored configuration, where a person can read it.
 */
import type { IntakeRequest, RunResult } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
export interface OrchestrationStep {
    name: string;
    /** May cite earlier artifacts as {{steps.<name>.artifact}}; forward references refuse at definition. */
    objective: string;
    budgets?: IntakeRequest['budgets'];
}
export interface OrchestrationPlan {
    name: string;
    version: string;
    /** stop halts on any step that is not verified complete; continue records the terminal and moves on. */
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
/**
 * Walk the plan: one real run per step, artifacts handed forward, every
 * observation through the public client. A cited step that produced no
 * artifact refuses before any model is called for the citing step.
 */
export declare function runOrchestration(client: ZeroARClient, plan: ReturnType<typeof defineOrchestration>, options: {
    principals: IntakeRequest['principals'];
}): Promise<OrchestrationOutcome>;
