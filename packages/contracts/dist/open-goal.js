import { contentHash } from "./ids.js";
import { TaskContractSchema } from "./schemas.js";
export const OPEN_GOAL_RULE = 'planned-items-pass-their-checks';
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
            cost_wall_ms: 2_000,
            timeout_ms: 60_000,
        },
    ],
});
export const OPEN_GOAL_CONTRACT_REF = contentHash(OPEN_GOAL_CONTRACT);
