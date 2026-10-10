import { artifactCommand } from "./artifact.js";
import { attentionCommand } from "./attention.js";
import { contextCommand } from "./context.js";
import { effectCommand } from "./effect.js";
import { gatewayCommand } from "./gateway.js";
import { memoryCommand } from "./memory.js";
import { publicationCommand } from "./publication.js";
import { registryCommand } from "./registry.js";
import { toolSourceCommand } from "./tool-source.js";
export const CLI_COMMAND_MODULES = new Map([
    contextCommand,
    attentionCommand,
    artifactCommand,
    registryCommand,
    publicationCommand,
    effectCommand,
    toolSourceCommand,
    gatewayCommand,
    memoryCommand,
].map((module) => [module.command, module]));
