export const effectCommand = {
    command: 'effect',
    state: 'wired',
    local: (args, context) => {
        if (args[0] === 'targets')
            return null;
        console.error(`error: ${context.command} effect needs targets.`);
        return 1;
    },
    remote: async (client, args) => {
        if (args[0] !== 'targets')
            return null;
        console.log(JSON.stringify(await client.listEffectTargets(), null, 2));
        return 0;
    },
};
