/**
 * The diagnostic envelope.
 *
 * What this is: the one shape every user-correctable error takes, and the
 * helper that builds it. A diagnostic names the problem, the clause behind
 * the refusal, the valid alternatives, and the fix when one is mechanically
 * constructible (ERD 9.10).
 *
 * How it fits: the brand's refusal grammar is the limit, the reason, and the
 * change. This envelope is that grammar as data, so the CLI, the API, and a
 * log line all render the same refusal the same way (BND-006).
 */
import type { DiagnosticSeverity } from './vocab.js';
export interface Diagnostic {
    /** Stable machine code, dot separated, lowercase. Localization never changes it. */
    code: string;
    severity: DiagnosticSeverity;
    /** Plain language. State, reason, next. */
    message: string;
    /** Where the problem sits: a payload path, a file, a field. */
    path?: string;
    /** What arrived, secrets redacted. */
    received?: string;
    /** What would have been accepted. */
    alternatives?: string[];
    /** A corrected value or command, when one can be constructed. */
    fix?: string;
    /** The constraint or requirement responsible, for example C-OPS-LEASE-BEFORE-SPEND-004. */
    clause?: string;
}
export declare class DiagnosticError extends Error {
    readonly diagnostic: Diagnostic;
    constructor(diagnostic: Diagnostic);
}
export declare function refuse(diagnostic: Omit<Diagnostic, 'severity'>): never;
/** One-line rendering shared by server logs and the CLI's no-colour tier. */
export declare function renderDiagnostic(d: Diagnostic): string;
