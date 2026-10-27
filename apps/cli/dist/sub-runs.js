import { shortId, subRunCountsLine } from '@zero-ar/contracts';
export function subRunRows(snapshot) {
    const rows = [];
    if (snapshot.sub_run)
        rows.push(['parent', `${snapshot.sub_run.parent_run_id}, depth ${snapshot.sub_run.depth}`]);
    if (snapshot.sub_runs)
        rows.push(...subRunSummaryRows(snapshot.sub_runs));
    return rows;
}
export function subRunSummaryRows(summary) {
    return [
        ['sub-runs', subRunCountsLine(summary.counts)],
        ...summary.children.map((child) => [
            `  ${shortId(child.run_id)}`,
            `${child.state}, ${child.spent_model_tokens} of ${child.slice_model_tokens} model tokens, finding ${child.finding}${child.gap ? ` (${child.gap.slice(0, 120)})` : ''}: ${child.objective.length > 60 ? `${child.objective.slice(0, 57)}...` : child.objective}`,
        ]),
    ];
}
export function subRunEventLine(event) {
    const child = typeof event.payload['child_run_id'] === 'string' ? shortId(event.payload['child_run_id']) : 'unknown';
    if (event.event === 'subrun.opened') {
        const objective = String(event.payload['objective'] ?? '');
        return `sub-run ${child} started: ${objective.length > 80 ? `${objective.slice(0, 77)}...` : objective}`;
    }
    if (event.event === 'subrun.finished') {
        const finding = event.payload['finding'];
        const terminal = typeof event.payload['terminal'] === 'string' ? event.payload['terminal'].replace('_', ' ') : 'stopped';
        return finding?.gap ? `sub-run ${child} settled ${terminal}, finding gap: ${finding.gap.slice(0, 120)}` : `sub-run ${child} settled ${terminal}, finding returned`;
    }
    return null;
}
