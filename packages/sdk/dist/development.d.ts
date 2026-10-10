import type { ZeroARClient } from '@zero-ar/client';
import type { CompiledBundle } from './publication.js';
import type { LoadedProject } from './project.js';
export interface ConformanceOutcome {
    passed: number;
    failures: string[];
}
export interface DevelopmentLoopOptions {
    project: LoadedProject;
    namespace: string;
    client: ZeroARClient;
    conformance?: (compiled: CompiledBundle) => Promise<ConformanceOutcome> | ConformanceOutcome;
}
export interface DevelopmentPublication {
    namespace: string;
    alias: string;
    candidate_ref: string;
    bundle_ref: string;
    previous_ref: string | null;
    published: boolean;
    conformance: ConformanceOutcome;
    narration: string[];
}
export interface DevelopmentLoop {
    readonly namespace: string;
    reload(): Promise<DevelopmentPublication>;
    current(): string | null;
}
export declare function developmentLoop(options: DevelopmentLoopOptions): DevelopmentLoop;
