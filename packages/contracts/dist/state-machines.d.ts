/**
 * The four trusted state machines, as data.
 *
 * What this is: every legal transition for the run, completion, lease, and
 * effect lifecycles, each carrying the actor allowed to cause it. The tables
 * are the specification; the kernel moves state only through assertTransition,
 * and the model-based tests walk these same tables (section 3.7 of the ERD).
 *
 * How it fits: the central honesty claim is structural here. The only
 * transition a model may cause is proposing completion. Complete is reachable
 * through a verification verdict alone, so no model output can reach it
 * (QLT-031, QLT-032, C-ARCH-VERIFIED-COMPLETION-005).
 */
import type { CompletionState, EffectState, LeaseState, RunStatus } from './vocab.js';
/** Who may cause a transition. The model appears exactly once in these tables. */
export type Actor = 'runtime' | 'caller' | 'model' | 'validator';
export interface Transition<S extends string> {
    readonly from: S;
    readonly to: S;
    readonly on: string;
    readonly actor: Actor;
}
export declare const RUN_MACHINE: readonly Transition<RunStatus>[];
export declare const COMPLETION_MACHINE: readonly Transition<CompletionState>[];
export declare const LEASE_MACHINE: readonly Transition<LeaseState>[];
export declare const EFFECT_MACHINE: readonly Transition<EffectState>[];
export declare const MACHINES: {
    readonly run: readonly Transition<"created" | "running" | "suspended" | "cancelled" | "finished">[];
    readonly completion: readonly Transition<"working" | "checkpoint_verifying" | "completion_proposed" | "verifying" | "gap_open" | "repair" | "complete" | "unverified_artifact">[];
    readonly lease: readonly Transition<"reserved" | "settled" | "charged">[];
    readonly effect: readonly Transition<"prepared" | "dispatched" | "committed" | "withdrawn" | "outcome_unknown" | "unreconcilable">[];
};
export type MachineName = keyof typeof MACHINES;
/**
 * The single deciding function for state movement. Returns the matched
 * transition or throws naming the machine, the states, and the legal moves.
 */
export declare function assertTransition<S extends string>(machine: MachineName, from: S, to: S, on: string, actor: Actor): Transition<string>;
/** States with no outgoing transition. The honest ends of each machine. */
export declare function terminalStates(machine: MachineName): string[];
