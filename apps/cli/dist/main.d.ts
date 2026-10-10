import type { RunPortabilityLevel } from '@zero-ar/contracts';
export declare function runCli(options?: {
    argv?: string[];
}): Promise<number>;
export declare function runCliAndExit(options?: {
    argv?: string[];
}): void;
export declare function renderCliFailure(error: unknown, options?: {
    command?: string;
    debug?: boolean;
}): string;
export declare function globalCliArguments(args: readonly string[]): {
    arguments: string[];
    no_color: boolean;
};
type RunPortabilityStatus = Readonly<Record<RunPortabilityLevel, {
    status: string;
    detail: string;
}>>;
export declare function renderRunPortability(status: RunPortabilityStatus): void;
export {};
