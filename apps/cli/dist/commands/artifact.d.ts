/**
 * The artifact command.
 *
 * What this is: artifact sweep, the operator removal of runtime artifact
 * uploads that never committed (PUB-030). It calls POST /v1/artifact-sweeps
 * through the client; the runtime raises a cutoff below its retention floor
 * to the floor and sweeps only the authenticated tenant. Committed artifacts
 * are never touched. It also counts the artifact frames of an exported run
 * for the export line. Usage mistakes answer before any runtime starts.
 *
 * How it fits: runCli consults this module before its built-in dispatch, and
 * the usage table in ../identity.ts prints its row.
 */
import type { CliCommandModule } from './command.js';
export declare const artifactCommand: CliCommandModule;
/** How many artifacts an exported run bundle carries and names without bytes, for the export line. */
export declare function exportedArtifactsNote(bundle: string): string;
