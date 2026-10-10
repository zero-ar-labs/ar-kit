import type { CompletionState, EffectState, LeaseState, RecordType, RunStatus } from './vocab.js';
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
export declare function findTransition<S extends string>(machine: MachineName, from: S, to: S, on: string, actor: Actor): Transition<string> | null;
export declare function assertTransition<S extends string>(machine: MachineName, from: S, to: S, on: string, actor: Actor): Transition<string>;
export type EffectMoveRecordType = Extract<RecordType, 'effect.dispatched' | 'effect.resolved' | 'effect.unreconcilable'>;
export declare function effectRecordTransition(type: EffectMoveRecordType, payload: Record<string, unknown>, from: EffectState): Transition<EffectState>;
export declare function terminalStates(machine: MachineName): string[];
