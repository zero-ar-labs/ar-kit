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
import type { CliCommandModule } from './command.js';
export declare const toolSourceCommand: CliCommandModule;
