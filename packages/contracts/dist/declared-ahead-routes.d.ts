/**
 * Routes declared ahead of their mechanisms.
 *
 * What this is: every public route whose contract ships before the code
 * behind it, with the typed diagnostic it answers after authorization. The
 * server refuses these routes from this table, and the OpenAPI document and
 * the examples mark them from it, so no surface shows them as working.
 *
 * How it fits: rows are grouped by the wiring package. The change that wires
 * a route deletes its row, and the route then answers from its handler.
 */
import type { Diagnostic } from './diagnostics.js';
import type { RouteName } from './routes.js';
import type { ConditionalRefusalCode, UnwiredDiagnosticCode } from './vocab.js';
export interface DeclaredAheadRoute {
    /** An unwired code, or a conditional code the wired route keeps answering where the condition is absent. */
    code: UnwiredDiagnosticCode | ConditionalRefusalCode;
    /** The mechanism this build lacks, as the refusal names it. */
    missing: string;
    /** What would change the outcome for the caller. */
    remedy: string;
    clause: string;
}
export declare const DECLARED_AHEAD_ROUTES: Readonly<Partial<Record<RouteName, DeclaredAheadRoute>>>;
/** The refusal one declared-ahead route answers once its authorization passes. */
export declare function declaredAheadDiagnostic(name: RouteName): Diagnostic;
