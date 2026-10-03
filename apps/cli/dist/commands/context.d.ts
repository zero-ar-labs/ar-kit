/**
 * The context command.
 *
 * What this is: the terminal home of context replay. context <run> <turn>
 * rebuilds that turn's model window from the log through the client and
 * prints whether it still equals what the model saw, naming every span that
 * no longer resolves (CTX-012). --json prints the typed payload instead.
 *
 * How it fits: it reaches GET /v1/runs/{run_id}/contexts/{turn} through
 * @zero-ar/client only, against bundled Local Lite or a hosted target. It
 * exits 0 when the replay is equal and 1 when it is not.
 */
import type { CliCommandModule } from './command.js';
export declare const contextCommand: CliCommandModule;
