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
import { DECLARED_AHEAD_ROUTES, API_ROUTES, renderDiagnostic } from '@zero-ar/contracts';
/** The not-wired refusal for a terminal operation whose route this build declares ahead of its mechanism. */
export function declaredAheadCommandRefusal(context, operation, route) {
    const row = DECLARED_AHEAD_ROUTES[route];
    if (!row)
        throw new Error(`route ${route} is wired, so ${context.command} ${operation} has no not-wired refusal. Wire the command through the client.`);
    return {
        severity: 'error',
        code: row.code,
        message: `${context.command} ${operation} reaches ${API_ROUTES[route].method} ${API_ROUTES[route].path}, and this build does not wire ${row.missing}. ${row.remedy}.`,
        ...(row.clause ? { clause: row.clause } : {}),
    };
}
/** Print one refusal the way every command error prints, and answer the failing exit code. */
export function refuseCommand(diagnostic) {
    console.error(renderDiagnostic(diagnostic));
    return 1;
}
