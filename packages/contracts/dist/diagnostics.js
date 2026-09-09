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
/** One-line rendering shared by server logs and the CLI's no-colour tier. */
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
    return parts.join('. ');
}
