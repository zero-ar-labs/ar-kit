/**
 * The registry command.
 *
 * What this is: registry rebuild, which refolds the name projection from the
 * immutable publication records (PUB-029), and registry alias-history, which
 * lists each move of one alias (PUB-018). Both go through the client; usage
 * mistakes answer before any runtime starts.
 *
 * How it fits: runCli consults this module before its built-in dispatch, and
 * the usage table in ../identity.ts prints its rows.
 */
import type { CliCommandModule } from './command.js';
export declare const registryCommand: CliCommandModule;
