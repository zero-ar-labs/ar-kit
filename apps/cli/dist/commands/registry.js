/**
 * The registry command.
 *
 * What this is: registry rebuild, which refolds the name projection from the
 * immutable publication records (PUB-029), and registry alias-history, which
 * lists each move of one alias (PUB-018). Both go through the client; usage
 * mistakes answer before any runtime starts.
 *
 * How it fits: runCli consults this module before its built-in dispatch, and
 * the usage table in ../identity.ts prints its rows.
 */
export const registryCommand = {
    command: 'registry',
    state: 'wired',
    local: (args, context) => {
        if (args[0] === 'rebuild')
            return null;
        if (args[0] === 'alias-history' && args[1] && !args[1].startsWith('--'))
            return null;
        console.error(`error: ${context.command} registry needs an operation: rebuild, or alias-history <alias>.`);
        return 1;
    },
    async remote(client, args) {
        const json = args.includes('--json');
        if (args[0] === 'rebuild') {
            const outcome = await client.rebuildRegistry();
            if (json) {
                console.log(JSON.stringify(outcome, null, 2));
                return 0;
            }
            console.log(`rebuilt ${outcome.names} names from ${outcome.publications} publications; ` +
                (outcome.equal ? 'the projection already matched its records' : 'the projection was restored from its records'));
            return 0;
        }
        const history = await client.registryAliasHistory(args[1]);
        if (json) {
            console.log(JSON.stringify(history, null, 2));
            return 0;
        }
        if (history.entries.length === 0) {
            console.log(`${history.alias} has never moved in this registry`);
            return 0;
        }
        for (const entry of history.entries)
            console.log(`${entry.moved_at}  ${entry.content_ref}  by ${entry.actor}`);
        return 0;
    },
};
