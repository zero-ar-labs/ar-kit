/**
 * The public command target resolver.
 *
 * What this is: the one pure decision that chooses an explicit hosted URL,
 * the ZERO_AR_URL environment value, or bundled Local Lite in that order.
 *
 * How it fits: the client opens the selected target. This file never reads a
 * secret, starts a process, opens a socket, or falls back after selection.
 * Junior guide: add connection syntax here, then prove its precedence before
 * teaching any command about it.
 */
import type { CliTargetMode, CliTargetSource } from './vocab.js';
export interface CommandTarget {
    mode: CliTargetMode;
    source: CliTargetSource;
    base_url: string | null;
}
export interface CommandTargetResolution {
    target: CommandTarget;
    command_arguments: string[];
}
export interface CommandTargetInput {
    arguments: readonly string[];
    environment: Record<string, string | undefined>;
}
/** Resolve one target and remove only its connection argument from command input. */
export declare function resolveCommandTarget(input: CommandTargetInput): CommandTargetResolution;
