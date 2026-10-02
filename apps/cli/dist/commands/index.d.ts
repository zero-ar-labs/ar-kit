/**
 * The terminal command table.
 *
 * What this is: every command module runCli consults before its built-in
 * dispatch, keyed by command. Reserved commands answer their typed
 * not-wired error; wired ones add operations to a built-in command.
 *
 * How it fits: a package that wires a command edits its own module and the
 * usage table; this list stays as it is.
 */
import type { CliCommandModule } from './command.js';
export declare const CLI_COMMAND_MODULES: ReadonlyMap<string, CliCommandModule>;
