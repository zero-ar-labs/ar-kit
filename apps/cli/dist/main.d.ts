/**
 * The Zero-AR command implementation.
 *
 * What this is: the human surface over the public API and nothing else.
 * The `zeroar` entrypoint calls this file, so command behaviour has one
 * source.
 *
 * Commands in this surface include run control, replay, export, import,
 * local checks, hosted diagnostics, publication dry runs, environment
 * administration, provider administration, and tool-source administration.
 */
export declare function runCli(options?: {
    argv?: string[];
}): Promise<number>;
export declare function runCliAndExit(options?: {
    argv?: string[];
}): void;
