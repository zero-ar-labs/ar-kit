/**
 * The terminal command module seam.
 *
 * What this is: the shape of a command module and the refusal a reserved
 * command answers. A module either reserves a command this build does not
 * wire, answering a typed not-wired error before any runtime starts, or
 * adds operations to a built-in command and lets everything else through.
 *
 * How it fits: runCli asks the module for a command twice, once before it
 * chooses a runtime target and once with the connected client, before the
 * built-in dispatch. Modules reach the runtime through @zero-ar/client only.
 */
import type { Diagnostic, RouteName } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
import type { CliContext } from '../identity.js';
export interface CliCommandModule {
    /** The terminal command this module owns. */
    readonly command: string;
    /**
     * not-wired: the command is reserved, printed in no usage, and answers its
     * typed error; wired: the command works and the module may add operations.
     */
    readonly state: 'wired' | 'not-wired';
    /** Runs before a runtime target is chosen. Answer an exit code, or null to let the built-in command run. */
    local?(args: readonly string[], context: CliContext): Promise<number | null> | number | null;
    /** Runs with the connected client before the built-in command. Answer an exit code, or null to let it run. */
    remote?(client: ZeroARClient, args: readonly string[], context: CliContext): Promise<number | null>;
}
/** The not-wired refusal for a terminal operation whose route this build declares ahead of its mechanism. */
export declare function declaredAheadCommandRefusal(context: CliContext, operation: string, route: RouteName): Diagnostic;
/** Print one refusal the way every command error prints, and answer the failing exit code. */
export declare function refuseCommand(diagnostic: Diagnostic): number;
