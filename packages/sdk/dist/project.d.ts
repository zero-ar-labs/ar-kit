import type { CompiledBundle } from './publication.js';
export declare const SOURCE_KINDS: readonly ["agent", "instructions", "skill", "tool", "validator", "task-contract", "posture", "domain-pack", "context"];
export type SourceKind = (typeof SOURCE_KINDS)[number];
export interface DiscoveredResource {
    kind: SourceKind;
    path: string;
    content_ref: string;
    bytes: number;
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
    entry?: string;
    overlays?: {
        path: string;
        content: string;
    }[];
    ignore_lock?: boolean;
}
export interface LoadedProject {
    root: string;
    entry: string;
    resources(): DiscoveredResource[];
    diagnostics(): Diagnostic[];
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
export declare function loadProject(options: ProjectLoaderOptions): Promise<LoadedProject>;
export declare function renderDiagnostics(project: LoadedProject): string;
export declare function lockBytes(project: LoadedProject): string;
