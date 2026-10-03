/**
 * The publication command.
 *
 * What this is: publication export and import between registries (PUB-023).
 * Export writes one closure as checksummed JSON lines; import commits it
 * under the target tenant with identical content refs and a new receipt.
 * Aliases, grants and credentials never travel. Publishing a source stays
 * with the publish command. Usage mistakes answer before any runtime starts.
 *
 * How it fits: runCli consults this module before its built-in dispatch, and
 * the usage table in ../identity.ts prints its rows.
 */
import type { CliCommandModule } from './command.js';
export declare const publicationCommand: CliCommandModule;
