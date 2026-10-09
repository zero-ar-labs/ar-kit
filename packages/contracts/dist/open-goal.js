/**
 * The built-in open-goal contract.
 *
 * What this is: the task contract a run without an owner contract adopts
 * when its model records a plan through plan.record. Its one rule holds when
 * every planned item passes the checks its agent recorded, judged by the
 * kernel's plan-check validator.
 *
 * How it fits: the checkpoint, repair and completion machinery treats it
 * like any other contract, so an open goal is verified the same way as owner
 * work. Every result names that the checks were the agent's own.
 */
import { contentHash } from "./ids.js";
import { TaskContractSchema } from "./schemas.js";
/** The rule every planned item answers. */
export const OPEN_GOAL_RULE = 'planned-items-pass-their-checks';
/** The validator that judges OPEN_GOAL_RULE. */
export const PLAN_CHECKS_VALIDATOR = 'plan.checks';
export const OPEN_GOAL_CONTRACT = TaskContractSchema.parse({
    name: 'open.goal',
    version: '1.0.0',
    invariants: [OPEN_GOAL_RULE],
    acceptance_rules: [OPEN_GOAL_RULE],
    checkpoint_every_items: 1,
    dependency_frontier: 'independent-items',
    repair_budget_attempts: 5,
    validators: [
        {
            name: PLAN_CHECKS_VALIDATOR,
            version: '1.0.0',
            class: 'deterministic',
            covers: [OPEN_GOAL_RULE],
            sufficient_for: [OPEN_GOAL_RULE],
            // The validator's own work is a shape check; workspace check commands
            // reserve their compute separately, so the window outlasts the cost.
            cost_wall_ms: 2_000,
            timeout_ms: 60_000,
        },
    ],
});
export const OPEN_GOAL_CONTRACT_REF = contentHash(OPEN_GOAL_CONTRACT);
