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
import { renderDiagnostic } from '@zero-ar/contracts';
/** Print one refusal the way every command error prints, and answer the failing exit code. */
export function refuseCommand(diagnostic) {
    console.error(renderDiagnostic(diagnostic));
    return 1;
}
