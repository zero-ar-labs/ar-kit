export const toolSourceCommand = {
    command: 'tool-source',
    state: 'wired',
    remote: async (client, args, context) => {
        if (args[0] !== 'drift')
            return null;
        const source_ref = args[1];
        if (!source_ref) {
            console.error(`error: ${context.command} tool-source drift needs a source reference.`);
            return 1;
        }
        console.log(JSON.stringify(await client.toolSourceDrift(source_ref), null, 2));
        return 0;
    },
};
