/**
 * The development hot-reload loop (developer-integration appendix 7.4,
 * DXI-025).
 *
 * What this is: recompile changed project source into a new publication
 * candidate, run the conformance that candidate answers for itself, and
 * move one development-namespace alias only when nothing failed.
 *
 * How it fits: an alias move changes later intake and nothing else. A run
 * that already pinned a closure keeps every ref it pinned, so this loop
 * never reaches active work. The candidate is the ordinary compiled
 * bundle a hosted commit carries, so hot reload bypasses no publication
 * identity. A namespace prefixes the alias, because an alias is a
 * lowercase dot-separated name: namespace development and agent assistant
 * make the alias development.assistant.
 */
import type { ZeroARClient } from '@zero-ar/client';
import type { CompiledBundle } from './publication.js';
import type { LoadedProject } from './project.js';
/** What a candidate proved about itself before the alias was allowed to move. */
export interface ConformanceOutcome {
    passed: number;
    failures: string[];
}
export interface DevelopmentLoopOptions {
    project: LoadedProject;
    /** The namespace later runs select. It prefixes the alias, never the ref. */
    namespace: string;
    client: ZeroARClient;
    /**
     * Conformance beyond the closure check: tool fixtures, validator
     * samples, whatever a developer runs before publishing. A failure here
     * keeps the alias where it is.
     */
    conformance?: (compiled: CompiledBundle) => Promise<ConformanceOutcome> | ConformanceOutcome;
}
/** One pass of the loop: what compiled, what it proved, where the name points now. */
export interface DevelopmentPublication {
    namespace: string;
    alias: string;
    /** The root declaration of the new candidate. Unchanged source yields the same ref. */
    candidate_ref: string;
    bundle_ref: string;
    /** Where this loop last pointed the alias, or null before its first pass. */
    previous_ref: string | null;
    /** True only when this pass commits the candidate and moves the alias. */
    published: boolean;
    conformance: ConformanceOutcome;
    /** What a terminal prints, including which runs use the new ref (7.4). */
    narration: string[];
}
export interface DevelopmentLoop {
    readonly namespace: string;
    /** One pass: reload, compile, prove, and publish when the proof holds. */
    reload(): Promise<DevelopmentPublication>;
    /** The ref this loop last published into the namespace, or null. */
    current(): string | null;
}
/**
 * Open a hot-reload loop over one project. The loop carries the ref it
 * last published, so each pass can say what changed and what did not.
 */
export declare function developmentLoop(options: DevelopmentLoopOptions): DevelopmentLoop;
