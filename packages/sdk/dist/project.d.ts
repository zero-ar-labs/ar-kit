/**
 * The deterministic project loader (developer-integration appendix, DXI-1C).
 *
 * What this is: build-time discovery of declared source kinds under one
 * root, with an explicit order, a lock of exactly what resolved, and
 * diagnostics that say what was found, why it was included, what it
 * compiled to, and what shadowed it (DXI-022, DXI-023).
 *
 * How it fits: discovery happens at development, test, or publication
 * time only. Production run workers consume immutable refs from the
 * published closure and never reach this code. Nothing here executes a
 * tool, calls a model, resolves a credential, or infers an operation
 * class; a user-global directory, a parent directory, a live network
 * catalogue, and a mutable alias are all outside the build unless the
 * project pins them (DXI-024).
 */
import type { CompiledBundle } from './publication.js';
/** The declared source kinds a project may carry. Nothing else is discovered. */
export declare const SOURCE_KINDS: readonly ["agent", "instructions", "skill", "tool", "validator", "task-contract", "posture", "domain-pack", "context"];
export type SourceKind = (typeof SOURCE_KINDS)[number];
/** Why one file entered the build, and what it resolved to. */
export interface DiscoveredResource {
    kind: SourceKind;
    /** Relative to the project root; an absolute host path never publishes. */
    path: string;
    content_ref: string;
    bytes: number;
    /** Which resolution step admitted it (DXI-022). */
    source: 'loader-option' | 'entry-declaration' | 'project-lock' | 'overlay';
}
export interface Diagnostic {
    severity: 'error' | 'warning' | 'note';
    code: string;
    message: string;
    path: string | null;
    fix: string | null;
}
export interface ProjectLoaderOptions {
    root: string;
    /** The project entry. Paths inside it resolve relative to the entry file. */
    entry?: string;
    /** Test and development overrides, applied last and always narrated. */
    overlays?: {
        path: string;
        content: string;
    }[];
}
/** Everything the loader found, with the lock that makes a build repeatable. */
export interface LoadedProject {
    root: string;
    entry: string;
    resources(): DiscoveredResource[];
    diagnostics(): Diagnostic[];
    /** The exact resolved identity of every discovered source, order-free. */
    lock(): {
        entry: string;
        resources: {
            path: string;
            kind: SourceKind;
            content_ref: string;
        }[];
        lock_ref: string;
    };
    compile(): Promise<CompiledBundle>;
    reload(): Promise<LoadedProject>;
}
/**
 * Load one project deterministically. Resolution order is: explicit
 * loader options, paths the entry declares, the project lock, then
 * explicit overlays. Nothing outside the root participates.
 */
export declare function loadProject(options: ProjectLoaderOptions): Promise<LoadedProject>;
/** Render the loader's answer for a terminal, one line per finding. */
export declare function renderDiagnostics(project: LoadedProject): string;
/** The canonical bytes of a lock, for comparing two machines' builds. */
export declare function lockBytes(project: LoadedProject): string;
/** The directory a path belongs to, for diagnostics that name a location. */
export declare function projectRootOf(path: string): string;
