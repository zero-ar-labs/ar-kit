import type { DiagnosticSeverity } from './vocab.js';
export interface Diagnostic {
    code: string;
    severity: DiagnosticSeverity;
    message: string;
    path?: string;
    received?: string;
    alternatives?: string[];
    fix?: string;
    clause?: string;
}
export declare class DiagnosticError extends Error {
    readonly diagnostic: Diagnostic;
    constructor(diagnostic: Diagnostic);
}
export declare function refuse(diagnostic: Omit<Diagnostic, 'severity'>): never;
export declare function renderDiagnostic(d: Diagnostic): string;
