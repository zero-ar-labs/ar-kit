import { canonicalJson } from '@zero-ar/contracts';
import { neutralize } from "../terminal.js";
export const contextCommand = {
    command: 'context',
    state: 'wired',
    async remote(client, args, context) {
        const positional = args.filter((arg) => !arg.startsWith('--'));
        const [run_id, turn] = positional;
        if (!run_id || !turn) {
            console.error(`error: ${context.command} context needs a run id and a turn number, for example ${context.command} context <run> 0.`);
            return 1;
        }
        const replay = await client.contextReplay(run_id, turn);
        if (args.includes('--json')) {
            console.log(canonicalJson(replay));
            return replay.equal ? 0 : 1;
        }
        const stale = [...replay.spans, ...replay.artifact_spans].filter((span) => span.status === 'stale');
        console.log(`context  run ${replay.run_id} turn ${replay.turn}: ${replay.equal ? 'equal to the recorded window' : 'not equal to the recorded window'}`);
        console.log(`  recorded ${replay.recorded_context_ref}`);
        console.log(`  replayed ${replay.replayed_context_ref}`);
        console.log(replay.spans_recorded
            ? `  spans: ${replay.spans.length} entries and ${replay.artifact_spans.length} artifact ranges, ${stale.length} stale`
            : '  spans: this window was recorded before spans were kept, so only the context refs compare');
        for (const span of stale)
            console.log(`  stale ${span.span.entry_id}: ${neutralize(span.reason ?? 'no reason recorded')}`);
        for (const blocker of replay.evidence_blockers) {
            console.log(`  blocked ${neutralize(blocker.artifact_ref)} (${blocker.entry_id}): ${blocker.reason}`);
        }
        return replay.equal ? 0 : 1;
    },
};
