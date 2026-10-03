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
import { artifactCommand } from "./artifact.js";
import { attentionCommand } from "./attention.js";
import { contextCommand } from "./context.js";
import { effectCommand } from "./effect.js";
import { gatewayCommand } from "./gateway.js";
import { memoryCommand } from "./memory.js";
import { providerCommand } from "./provider.js";
import { publicationCommand } from "./publication.js";
import { registryCommand } from "./registry.js";
import { toolSourceCommand } from "./tool-source.js";
export const CLI_COMMAND_MODULES = new Map([
    contextCommand,
    attentionCommand,
    artifactCommand,
    registryCommand,
    publicationCommand,
    providerCommand,
    effectCommand,
    toolSourceCommand,
    gatewayCommand,
    memoryCommand,
].map((module) => [module.command, module]));
