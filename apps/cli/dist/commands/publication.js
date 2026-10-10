import { readFileSync, writeFileSync } from 'node:fs';
export const publicationCommand = {
    command: 'publication',
    state: 'wired',
    local: (args, context) => {
        if ((args[0] === 'export' || args[0] === 'import') && args[1] && !args[1].startsWith('--'))
            return null;
        console.error(`error: ${context.command} publication needs an operation: export <publication-ref> [--out file], or import <file>.`);
        return 1;
    },
    async remote(client, args) {
        if (args[0] === 'export') {
            const publication_ref = args[1];
            const text = await client.exportPublication(publication_ref);
            const out = flagValue(args, '--out') ?? `${publication_ref.replace(/^sha256:/, '').slice(0, 16)}.publication.ndjson`;
            writeFileSync(out, text);
            const blobs = text.split('\n').filter((line) => line !== '' && JSON.parse(line).kind === 'blob').length;
            console.log(`exported the closure with ${blobs} blobs to ${out}, checksummed; aliases and credentials are not in it`);
            return 0;
        }
        const outcome = await client.importPublication(readFileSync(args[1], 'utf8'));
        if (args.includes('--json')) {
            console.log(JSON.stringify(outcome, null, 2));
            return 0;
        }
        console.log(`imported ${outcome.receipt.publication_ref} with root ${outcome.receipt.root_ref}: ${outcome.blobs} blobs staged; ` +
            'set aliases and grants here as separate acts');
        return 0;
    },
};
function flagValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}
