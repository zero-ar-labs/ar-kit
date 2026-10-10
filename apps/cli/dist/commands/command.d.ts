import type { Diagnostic } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
import type { CliContext } from '../identity.js';
export interface CliCommandModule {
    readonly command: string;
    readonly state: 'wired' | 'not-wired';
    local?(args: readonly string[], context: CliContext): Promise<number | null> | number | null;
    remote?(client: ZeroARClient, args: readonly string[], context: CliContext): Promise<number | null>;
}
export declare function refuseCommand(diagnostic: Diagnostic): number;
