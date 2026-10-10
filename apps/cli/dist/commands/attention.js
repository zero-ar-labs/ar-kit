import { refuseCommand } from "./command.js";
const OPERATIONS = ['calibrate', 'publish', 'current', 'dashboard'];
export const attentionCommand = {
    command: 'attention',
    state: 'wired',
    local: (args, context) => {
        const operation = args[0];
        if (!OPERATIONS.includes(operation))
            return refuseCommand(usage(context, `attention needs ${OPERATIONS.join(', ')}, and ${operation ? `"${operation}" is none of them` : 'none was given'}`));
        if (operation === 'calibrate' || operation === 'publish') {
            for (const flag of operation === 'publish' ? ['--reviewers', '--window-ms', '--tolerance-ppm'] : ['--reviewers', '--window-ms']) {
                if (integerFlag(args, flag) === undefined)
                    return refuseCommand(usage(context, `attention ${operation} needs ${flag} as a whole number`));
            }
            if (args.includes('--horizon-ms') && integerFlag(args, '--horizon-ms') === undefined) {
                return refuseCommand(usage(context, `attention ${operation} reads --horizon-ms as a whole number of milliseconds`));
            }
        }
        return null;
    },
    remote: async (client, args) => {
        const operation = args[0];
        const json = args.includes('--json');
        if (operation === 'calibrate' || operation === 'publish') {
            const classes = flagValues(args, '--class');
            const request = {
                reviewers: integerFlag(args, '--reviewers'),
                window_ms: integerFlag(args, '--window-ms'),
                ...(integerFlag(args, '--horizon-ms') !== undefined ? { planning_horizon_ms: integerFlag(args, '--horizon-ms') } : {}),
                ...(flagValues(args, '--confidence')[0] ? { confidence_posture: flagValues(args, '--confidence')[0] } : {}),
                ...(classes.length > 0 ? { classes } : {}),
            };
            if (operation === 'calibrate') {
                const report = await client.calibrateAttention(request);
                print(json, report, () => calibrationLines(report));
            }
            else {
                const snapshot = await client.publishAttentionCapacitySnapshot({ ...request, tolerance_ppm: integerFlag(args, '--tolerance-ppm') });
                print(json, snapshot, () => snapshotLines(snapshot));
            }
        }
        else if (operation === 'current') {
            const snapshot = await client.currentAttentionCapacitySnapshot();
            print(json, snapshot, () => snapshotLines(snapshot));
        }
        else {
            const view = await client.attentionDashboard();
            print(json, view, () => dashboardLines(view));
        }
        return 0;
    },
};
function usage(context, problem) {
    return {
        severity: 'error',
        code: 'command.usage',
        message: `${problem}. Run ${context.command} help for the attention syntax.`,
    };
}
function flagValues(args, flag) {
    return args.flatMap((value, index) => (value === flag && args[index + 1] !== undefined ? [args[index + 1]] : []));
}
function integerFlag(args, flag) {
    const raw = flagValues(args, flag)[0];
    if (raw === undefined || !/^\d+$/.test(raw))
        return undefined;
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : undefined;
}
function print(json, value, lines) {
    console.log(json ? JSON.stringify(value, null, 2) : lines().join('\n'));
}
function calibrationLines(report) {
    const classes = Object.entries(report.classes);
    return [
        `calibration ${report.calibration_mode}: ${report.reviewers} reviewers over ${report.window_ms} ms, horizon ${report.planning_horizon_ms} ms, ${report.confidence_posture}`,
        ...(classes.length === 0 ? ['no review was observed in this window'] : classes.map(([name, model]) => `  ${name}: ${model.sample} measured, service mean ${model.mean_service_ms} ms (p90 ${model.p90_service_ms} ms), wait mean ${model.mean_wait_ms} ms, ` +
            `utilization ${model.rho_ppm} ppm, missing start ${model.missing_data.started_ms} finish ${model.missing_data.finished_ms}, ${model.model_fit.usable ? 'usable' : `not usable: ${model.model_fit.reason}`}`)),
        `ref ${report.ref}; nothing was stored and nothing admits on this report`,
    ];
}
function snapshotLines(snapshot) {
    return [
        `capacity snapshot version ${snapshot.version}, ${snapshot.state}, published by ${snapshot.published_by} at ${snapshot.published_at}`,
        `  tolerance ${snapshot.tolerance_ppm} ppm, classes ${Object.keys(snapshot.calibration.classes).sort().join(', ') || 'none'}`,
        ...(snapshot.invalid_reason ? [`  invalid: ${snapshot.invalid_reason}`] : []),
        `  ref ${snapshot.snapshot_ref}`,
    ];
}
function dashboardLines(view) {
    const classes = Object.entries(view.classes);
    return [
        `attention at ${view.measured_at}${view.snapshot_ref ? `, snapshot ${view.snapshot_state} ${view.snapshot_ref}` : ''}`,
        ...(view.reason ? [view.reason] : []),
        ...classes.map(([name, row]) => `  ${name}: backlog ${row.backlog} (oldest ${row.oldest_age_ms} ms), arrivals ${row.arrivals}, handling ${row.active_handling}, throughput ${row.throughput}, ` +
            `utilization ${row.utilization_ppm} ppm, abandoned ${row.abandonment}, resubmitted ${row.resubmission}, ` +
            `prediction ${row.prediction_interval_ms[0]}-${row.prediction_interval_ms[1]} ms, blocked intake ${row.blocked_intake}`),
    ];
}
