/**
 * The tool-source command's added operations.
 *
 * What this is: operations that extend the built-in tool-source command.
 * tool-source drift prints a source's durable drift records and whether its
 * enabled bindings still wait for a new enablement. Every other tool-source
 * operation runs as it always has.
 *
 * How it fits: the drift operation reaches the runtime through the client,
 * after runCli connects, before the built-in tool-source dispatch.
 */
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
