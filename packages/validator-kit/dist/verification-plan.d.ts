/**
 * The one pure visible verification-plan compiler.
 *
 * It accepts only explicit immutable inputs and returns canonical inert data.
 * There is no clock, random source, registry lookup, model, network, lease,
 * log, validator invocation, publication or authority capability in this file.
 */
import type { TaskContract, VerificationCheckpointInput, VerificationCheckpointInputBody, VerificationAttentionCapacitySnapshot, VerificationAttentionCapacitySnapshotBody, VerificationPlan, VerificationPlanInput } from '@zero-ar/contracts';
export declare const ATTENTION_NOT_EVALUATED: "attention feasibility not evaluated";
export declare function defineVerificationCheckpointInput(source: Omit<VerificationCheckpointInputBody, 'schema'>): VerificationCheckpointInput;
export declare function defineVerificationAttentionCapacitySnapshot(source: Omit<VerificationAttentionCapacitySnapshotBody, 'schema'>): VerificationAttentionCapacitySnapshot;
/** One validator invocation for one rule at one decision stage. */
export interface SelectedValidatorInvocation {
    rule: string;
    /** Position of the first declared binding for this validator that covers the rule. */
    binding_position: number;
    binding: TaskContract['validators'][number];
    /** The task contract designates this validator sufficient for this rule. */
    sufficient: boolean;
    /** Heuristic and sampled-oracle checks run after deterministic and named-human checks. */
    deferred: boolean;
}
/**
 * The one selection the runtime executes and the plan shows. Every validator
 * whose binding covers a rule is invoked once for that rule, so a
 * non-sufficient binding listed first cannot decide the rule alone.
 *
 * The unit is one validator for one rule, not one validator for the union of
 * its rules: the validator input names a single rule, the examined manifest
 * hashes it, and sufficiency is attributed per rule. A validator that covers
 * two rules at one stage therefore runs, and is budgeted, twice. A validator
 * identity (name, version and class) declared more than once still runs once
 * per rule, at the position of its first covering binding, and counts as
 * sufficient when any of its bindings both covers the rule and names it in
 * `sufficient_for`.
 *
 * Order is deterministic and named-human first, then heuristic and
 * sampled-oracle, then rule name, then declared binding position. The runtime
 * skips the heuristic and sampled-oracle group after an item-naming rejection
 * from the first group; the selection itself lists every invocation.
 */
export declare function selectValidatorInvocations(contract: TaskContract, rules: readonly string[]): SelectedValidatorInvocation[];
/** Upper bound for exactly the invocations the runtime selects for these rules. */
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
/** Compile fixed or controller-resolved cadence from exact already-decided inputs. */
export declare function verificationCheckpointInputForContract(contract: TaskContract, items: number, controlled?: ControlledVerificationCheckpoint | null): VerificationCheckpointInput;
/** Compile one content-addressed plan. The same normalized inputs return the same bytes and ref. */
export declare function compileVerificationPlan(raw: VerificationPlanInput): VerificationPlan;
/** One renderer over the canonical object; no separate explanatory state. */
export declare function renderVerificationPlan(plan: VerificationPlan): string;
