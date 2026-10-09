/**
 * The artifact command.
 *
 * What this is: artifact sweep, the operator removal of runtime artifact
 * uploads that never committed (PUB-030). It calls POST /v1/artifact-sweeps
 * through the client; the runtime raises a cutoff below its retention floor
 * to the floor and sweeps only the authenticated tenant. Committed artifacts
 * are never touched. It also counts the artifact frames of an exported run
 * for the export line. Usage mistakes answer before any runtime starts.
 *
 * How it fits: runCli consults this module before its built-in dispatch, and
 * the usage table in ../identity.ts prints its row.
 */
import { RUN_BUNDLE_ARTIFACT_FRAME_KINDS, RunBundleArtifactFrameSchema } from '@zero-ar/contracts';
/** The cutoff a sweep asks for when the caller names none: one day, the default floor. */
const DEFAULT_OLDER_THAN_SECONDS = 86_400;
export const artifactCommand = {
    command: 'artifact',
    state: 'wired',
    local: (args, context) => {
        if (args[0] !== 'sweep') {
            console.error(`error: ${context.command} artifact needs an operation: sweep [--older-than seconds] --reason text.`);
            return 1;
        }
        if (!flagValue(args, '--reason')) {
            console.error(`error: ${context.command} artifact sweep needs --reason, which the audit trail records.`);
            return 1;
        }
        if (olderThan(args) === null) {
            console.error('error: --older-than takes a whole number of seconds from 1 to 31536000.');
            return 1;
        }
        return null;
    },
    async remote(client, args) {
        const result = await client.sweepArtifacts({ older_than_seconds: olderThan(args) ?? DEFAULT_OLDER_THAN_SECONDS, reason: flagValue(args, '--reason') ?? '' });
        if (args.includes('--json')) {
            console.log(JSON.stringify(result, null, 2));
            return 0;
        }
        console.log(`swept ${result.removed_staged_writes} uncommitted upload files older than ${result.cutoff}` +
            ` (retention floor ${result.retention_floor_seconds} s); committed artifacts were not touched`);
        return 0;
    },
};
function olderThan(args) {
    const raw = flagValue(args, '--older-than');
    if (raw === undefined)
        return DEFAULT_OLDER_THAN_SECONDS;
    const seconds = Number(raw);
    return /^\d+$/.test(raw) && seconds >= 1 && seconds <= 31_536_000 ? seconds : null;
}
function flagValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}
/** How many artifacts an exported run bundle carries and names without bytes, for the export line. */
export function exportedArtifactsNote(bundle) {
    const kinds = RUN_BUNDLE_ARTIFACT_FRAME_KINDS;
    let carried = 0;
    let named = 0;
    for (const line of bundle.split('\n')) {
        if (line === '')
            continue;
        const value = JSON.parse(line);
        if (typeof value.kind !== 'string' || !kinds.includes(value.kind))
            continue;
        const frame = RunBundleArtifactFrameSchema.parse(value);
        if (frame.kind === 'artifact-bundle')
            carried += frame.artifact_refs.length;
        else if (frame.kind === 'artifact-omissions')
            named += frame.omissions.length;
    }
    return carried + named === 0 ? '' : `; it carries ${carried} artifacts and names ${named} it could not carry`;
}
