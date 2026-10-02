/**
 * The provider command's added operations.
 *
 * What this is: operations that extend the built-in provider command. The
 * legacy single-provider pool import is declared ahead of its mechanism, so
 * provider legacy-import answers model.legacy.unconfigured before any
 * runtime starts. Every other provider operation runs as it always has.
 *
 * How it fits: package H wires legacy-import through the client here.
 */
import { declaredAheadCommandRefusal, refuseCommand } from "./command.js";
export const providerCommand = {
    command: 'provider',
    state: 'wired',
    local: (args, context) => args[0] === 'legacy-import'
        ? refuseCommand(declaredAheadCommandRefusal(context, 'provider legacy-import', 'importLegacyModelPool'))
        : null,
};
