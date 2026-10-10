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
export declare function resolveCommandTarget(input: CommandTargetInput): CommandTargetResolution;
