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
    { from: 'working', to: 'completion_proposed', on: 'completion.proposed', actor: 'model' },
    { from: 'completion_proposed', to: 'verifying', on: 'verification.started', actor: 'runtime' },
    { from: 'verifying', to: 'complete', on: 'verification.verified', actor: 'validator' },
    { from: 'verifying', to: 'repair', on: 'verification.rejected', actor: 'validator' },
    { from: 'verifying', to: 'gap_open', on: 'verification.indeterminate', actor: 'validator' },
    { from: 'gap_open', to: 'unverified_artifact', on: 'gap.unsettled', actor: 'runtime' },
    { from: 'verifying', to: 'unverified_artifact', on: 'verification.exhausted', actor: 'runtime' },
    { from: 'repair', to: 'unverified_artifact', on: 'repair.exhausted', actor: 'runtime' },
];
export const LEASE_MACHINE = [
    { from: 'reserved', to: 'settled', on: 'lease.settled', actor: 'runtime' },
    { from: 'reserved', to: 'charged', on: 'lease.charged', actor: 'runtime' },
];
export const EFFECT_MACHINE = [
    { from: 'prepared', to: 'dispatched', on: 'effect.dispatched', actor: 'runtime' },
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
export function findTransition(machine, from, to, on, actor) {
    const table = MACHINES[machine];
    return table.find((t) => t.from === from && t.to === to && t.on === on && t.actor === actor) ?? null;
}
export function assertTransition(machine, from, to, on, actor) {
    const hit = findTransition(machine, from, to, on, actor);
    if (hit)
        return hit;
    const table = MACHINES[machine];
    const legal = table.filter((t) => t.from === from).map((t) => t.to);
    throw new Error(`illegal ${machine} transition ${from} to ${to} on event ${on} by actor ${actor}. ` +
        `From ${from} the machine permits: ${legal.length > 0 ? legal.join(', ') : 'nothing, the state is terminal'}.`);
}
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
export function terminalStates(machine) {
    const table = MACHINES[machine];
    const froms = new Set(table.map((t) => t.from));
    const tos = new Set(table.map((t) => t.to));
    return [...tos].filter((s) => !froms.has(s));
}
