export class DiagnosticError extends Error {
    diagnostic;
    constructor(diagnostic) {
        super(diagnostic.message);
        this.name = 'DiagnosticError';
        this.diagnostic = diagnostic;
    }
}
export function refuse(diagnostic) {
    throw new DiagnosticError({ severity: 'error', ...diagnostic });
}
export function renderDiagnostic(d) {
    const parts = [`${d.severity} ${d.code}: ${d.message}`];
    if (d.path)
        parts.push(`at ${d.path}`);
    if (d.alternatives && d.alternatives.length > 0)
        parts.push(`valid: ${d.alternatives.join(', ')}`);
    if (d.fix)
        parts.push(`fix: ${d.fix}`);
    if (d.clause)
        parts.push(`clause ${d.clause}`);
    return parts.map((part, index) => (index < parts.length - 1 ? part.replace(/\.$/, '') : part)).join('. ');
}
