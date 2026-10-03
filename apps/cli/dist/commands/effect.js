/**
 * The effect command.
 *
 * What this is: the terminal home of effect authority acts. effect targets
 * lists the targets the runtime's effect plane can dispatch to, through the
 * client, and says absent where no effect plane is attached. Grant re-issue
 * and grant revocation are declared ahead of their mechanism, so they
 * answer effect.grant.reissue.unavailable and effect.authority.unwired
 * before any runtime starts.
 *
 * How it fits: runCli asks this module before its built-in dispatch, so the
 * refusals start nothing and effect targets reaches the runtime the command
 * targets, bundled or hosted.
 */
import { declaredAheadCommandRefusal, refuseCommand } from "./command.js";
export const effectCommand = {
    command: 'effect',
    state: 'wired',
    local: (args, context) => {
        if (args[0] === 'targets')
            return null;
        if (args[0] === 'reissue')
            return refuseCommand(declaredAheadCommandRefusal(context, 'effect reissue', 'reissueEffectGrant'));
        if (args[0] === 'revoke')
            return refuseCommand(declaredAheadCommandRefusal(context, 'effect revoke', 'revokeEffectGrant'));
        console.error(`error: ${context.command} effect needs targets. Re-issue and revocation are not wired in this build.`);
        return 1;
    },
    remote: async (client, args) => {
        if (args[0] !== 'targets')
            return null;
        console.log(JSON.stringify(await client.listEffectTargets(), null, 2));
        return 0;
    },
};
