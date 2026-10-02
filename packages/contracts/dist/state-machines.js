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
export const RUN_MACHINE = [
    { from: 'created', to: 'running', on: 'run.started', actor: 'runtime' },
    { from: 'running', to: 'suspended', on: 'run.suspended', actor: 'runtime' },
    { from: 'suspended', to: 'running', on: 'run.resumed', actor: 'runtime' },
    { from: 'created', to: 'cancelled', on: 'run.cancelled', actor: 'caller' },
    { from: 'running', to: 'cancelled', on: 'run.cancelled', actor: 'caller' },
    { from: 'suspended', to: 'cancelled', on: 'run.cancelled', actor: 'caller' },
    { from: 'running', to: 'finished', on: 'run.finished', actor: 'runtime' },
];
export const COMPLETION_MACHINE = [
    { from: 'working', to: 'checkpoint_verifying', on: 'checkpoint.started', actor: 'runtime' },
    { from: 'checkpoint_verifying', to: 'working', on: 'checkpoint.passed', actor: 'validator' },
    { from: 'checkpoint_verifying', to: 'working', on: 'checkpoint.indeterminate', actor: 'validator' },
    { from: 'checkpoint_verifying', to: 'repair', on: 'checkpoint.rejected', actor: 'validator' },
    { from: 'repair', to: 'working', on: 'repair.started', actor: 'runtime' },
    // The one model-actor transition in the product. A claim of being finished
    // enters here and nowhere else.
    { from: 'working', to: 'completion_proposed', on: 'completion.proposed', actor: 'model' },
    { from: 'completion_proposed', to: 'verifying', on: 'verification.started', actor: 'runtime' },
    { from: 'verifying', to: 'complete', on: 'verification.verified', actor: 'validator' },
    { from: 'verifying', to: 'repair', on: 'verification.rejected', actor: 'validator' },
    { from: 'verifying', to: 'gap_open', on: 'verification.indeterminate', actor: 'validator' },
    { from: 'gap_open', to: 'unverified_artifact', on: 'gap.unsettled', actor: 'runtime' },
    { from: 'verifying', to: 'unverified_artifact', on: 'verification.exhausted', actor: 'runtime' },
    // Repair budget exhaustion at a checkpoint ends honestly too: work exists,
    // checks failed, retries are spent, and the terminal says so.
    { from: 'repair', to: 'unverified_artifact', on: 'repair.exhausted', actor: 'runtime' },
];
export const LEASE_MACHINE = [
    { from: 'reserved', to: 'settled', on: 'lease.settled', actor: 'runtime' },
    // Charged is the recovery outcome for a reservation whose actual use was
    // lost with the process. The reservation is spent in full, never forgotten.
    { from: 'reserved', to: 'charged', on: 'lease.charged', actor: 'runtime' },
];
export const EFFECT_MACHINE = [
    { from: 'prepared', to: 'dispatched', on: 'effect.dispatched', actor: 'runtime' },
    // The one non-dispatch exit. It takes a durable cancellation control or
    // exact authority refusal from a non-agent principal and competes
    // atomically with dispatch (EFX-023, IOP-136).
    { from: 'prepared', to: 'withdrawn', on: 'effect.withdrawn', actor: 'caller' },
    { from: 'dispatched', to: 'committed', on: 'receipt.recorded', actor: 'runtime' },
    { from: 'dispatched', to: 'outcome_unknown', on: 'receipt.missing', actor: 'runtime' },
    { from: 'outcome_unknown', to: 'committed', on: 'reconciliation.confirmed', actor: 'runtime' },
    { from: 'outcome_unknown', to: 'prepared', on: 'reconciliation.absent', actor: 'runtime' },
    { from: 'outcome_unknown', to: 'unreconcilable', on: 'reconciliation.unanswerable', actor: 'runtime' },
];
export const MACHINES = {
    run: RUN_MACHINE,
    completion: COMPLETION_MACHINE,
    lease: LEASE_MACHINE,
    effect: EFFECT_MACHINE,
};
/**
 * One browser destination proposal (BRC-012, BRC-013). A participant opens
 * it through the operator route, and one authenticated disposition settles
 * it. The model has no move here, and a refusal grants nothing. It stays
 * outside MACHINES because it moves no run, completion, lease or effect
 * state; the relay refuses the origin until an approval is recorded.
 */
export const BROWSER_DESTINATION_PROPOSAL_TRANSITIONS = [
    { from: 'proposed', to: 'approved', on: 'browser.destination.decided', actor: 'caller' },
    { from: 'proposed', to: 'refused', on: 'browser.destination.decided', actor: 'caller' },
];
/** The matched transition, or null when the machine does not permit the move. */
export function findTransition(machine, from, to, on, actor) {
    const table = MACHINES[machine];
    return table.find((t) => t.from === from && t.to === to && t.on === on && t.actor === actor) ?? null;
}
/**
 * The single deciding function for state movement. Returns the matched
 * transition or throws naming the machine, the states, and the legal moves.
 */
export function assertTransition(machine, from, to, on, actor) {
    const hit = findTransition(machine, from, to, on, actor);
    if (hit)
        return hit;
    const table = MACHINES[machine];
    const legal = table.filter((t) => t.from === from).map((t) => t.to);
    throw new Error(`illegal ${machine} transition ${from} to ${to} on event ${on} by actor ${actor}. ` +
        `From ${from} the machine permits: ${legal.length > 0 ? legal.join(', ') : 'nothing, the state is terminal'}.`);
}
/**
 * The effect machine move one effect record asks for, read from the state
 * the effect stands in. The run head fold and the effect dispatcher both
 * read effect records through this function, so they agree on which record
 * is which event; each then checks the move against EFFECT_MACHINE.
 */
export function effectRecordTransition(type, payload, from) {
    if (type === 'effect.dispatched')
        return { from, to: 'dispatched', on: 'effect.dispatched', actor: 'runtime' };
    if (type === 'effect.unreconcilable')
        return { from, to: 'unreconcilable', on: 'reconciliation.unanswerable', actor: 'runtime' };
    const to = payload['state'];
    const on = to === 'withdrawn'
        ? 'effect.withdrawn'
        : to === 'outcome_unknown'
            ? 'receipt.missing'
            : to === 'prepared'
                ? 'reconciliation.absent'
                : from === 'outcome_unknown'
                    ? 'reconciliation.confirmed'
                    : 'receipt.recorded';
    return { from, to, on, actor: to === 'withdrawn' ? 'caller' : 'runtime' };
}
/** States with no outgoing transition. The honest ends of each machine. */
export function terminalStates(machine) {
    const table = MACHINES[machine];
    const froms = new Set(table.map((t) => t.from));
    const tos = new Set(table.map((t) => t.to));
    return [...tos].filter((s) => !froms.has(s));
}
