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
 * (QLT-031, QLT-032, C-ARCH-VERIFIED-COMPLETION-005). The browser destination
 * proposal table below is capability state, not a fifth trusted machine.
 */
import type { BrowserDestinationProposalState, CompletionState, EffectState, LeaseState, RecordType, RunStatus } from './vocab.js';
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
    readonly run: readonly Transition<"cancelled" | "created" | "running" | "suspended" | "finished">[];
    readonly completion: readonly Transition<"working" | "checkpoint_verifying" | "completion_proposed" | "verifying" | "gap_open" | "repair" | "complete" | "unverified_artifact">[];
    readonly lease: readonly Transition<"reserved" | "settled" | "charged">[];
    readonly effect: readonly Transition<"committed" | "prepared" | "dispatched" | "withdrawn" | "outcome_unknown" | "unreconcilable">[];
};
export type MachineName = keyof typeof MACHINES;
/**
 * One browser destination proposal (BRC-012, BRC-013). A participant opens
 * it through the operator route, and one authenticated disposition settles
 * it. The model has no move here, and a refusal grants nothing. It stays
 * outside MACHINES because it moves no run, completion, lease or effect
 * state; the relay refuses the origin until an approval is recorded.
 */
export declare const BROWSER_DESTINATION_PROPOSAL_TRANSITIONS: readonly Transition<BrowserDestinationProposalState>[];
/** The matched transition, or null when the machine does not permit the move. */
export declare function findTransition<S extends string>(machine: MachineName, from: S, to: S, on: string, actor: Actor): Transition<string> | null;
/**
 * The single deciding function for state movement. Returns the matched
 * transition or throws naming the machine, the states, and the legal moves.
 */
export declare function assertTransition<S extends string>(machine: MachineName, from: S, to: S, on: string, actor: Actor): Transition<string>;
/** The record types that move an effect after its prepared record. */
export type EffectMoveRecordType = Extract<RecordType, 'effect.dispatched' | 'effect.resolved' | 'effect.unreconcilable'>;
/**
 * The effect machine move one effect record asks for, read from the state
 * the effect stands in. The run head fold and the effect dispatcher both
 * read effect records through this function, so they agree on which record
 * is which event; each then checks the move against EFFECT_MACHINE.
 */
export declare function effectRecordTransition(type: EffectMoveRecordType, payload: Record<string, unknown>, from: EffectState): Transition<EffectState>;
/** States with no outgoing transition. The honest ends of each machine. */
export declare function terminalStates(machine: MachineName): string[];
