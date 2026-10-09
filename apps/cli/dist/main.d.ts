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
 * The command table in ./commands answers reserved commands and the
 * operations a module adds before the built-in dispatch runs.
 */
import type { RunPortabilityLevel } from '@zero-ar/contracts';
export declare function runCli(options?: {
    argv?: string[];
}): Promise<number>;
export declare function runCliAndExit(options?: {
    argv?: string[];
}): void;
/** Render one actionable refusal while keeping stacks behind explicit debug output. */
export declare function renderCliFailure(error: unknown, options?: {
    command?: string;
    debug?: boolean;
}): string;
/** Remove presentation-only flags before command parsing and runtime selection. */
export declare function globalCliArguments(args: readonly string[]): {
    arguments: string[];
    no_color: boolean;
};
type RunPortabilityStatus = Readonly<Record<RunPortabilityLevel, {
    status: string;
    detail: string;
}>>;
/** Print the four levels in stable order so one success cannot imply another. */
export declare function renderRunPortability(status: RunPortabilityStatus): void;
export {};
