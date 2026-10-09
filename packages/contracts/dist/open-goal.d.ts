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
import type { TaskContract } from './schemas.js';
/** The rule every planned item answers. */
export declare const OPEN_GOAL_RULE = "planned-items-pass-their-checks";
/** The validator that judges OPEN_GOAL_RULE. */
export declare const PLAN_CHECKS_VALIDATOR = "plan.checks";
export declare const OPEN_GOAL_CONTRACT: TaskContract;
export declare const OPEN_GOAL_CONTRACT_REF: string;
