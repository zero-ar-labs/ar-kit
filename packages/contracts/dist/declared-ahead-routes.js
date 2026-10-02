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
import { API_ROUTES } from "./routes.js";
const browserDestinations = {
    code: 'browser.capability.unavailable',
    missing: 'the browser run port, so no run here holds a browser binding',
    remedy: 'Run the work on a cell whose capability manifest lists browser-first-party-playwright as wired',
};
const effectAuthority = {
    code: 'effect.authority.unwired',
    missing: 'operator acts over effect authority',
    remedy: 'Use a cell whose effect plane runs dynamic authority, on a build that wires these acts',
};
const workspaceInstances = {
    code: 'workspace.instances.unwired',
    missing: 'the workspace instance registry, so runs expose no workspace tools',
    remedy: 'Use a build that wires workspace instance attachment',
    clause: 'ADX-013',
};
export const DECLARED_AHEAD_ROUTES = {
    // F: browser.
    proposeBrowserDestination: { ...browserDestinations, clause: 'BRC-012' },
    decideBrowserDestination: { ...browserDestinations, clause: 'BRC-013' },
    // H: artifacts and registry.
    importLegacyModelPool: {
        code: 'model.legacy.unconfigured',
        missing: 'the legacy single-provider pool import, and this runtime holds no legacy provider fields to import',
        remedy: 'Configure the tenant model pool through the provider instance and model pool routes',
        clause: 'DXI-017',
    },
    // I: aggregators and effects.
    toolSourceIngress: {
        code: 'tool-source.ingress.unwired',
        missing: 'provider trigger ingress, so this delivery started no run and was not retained',
        remedy: 'Point the provider at a cell that wires trigger ingress for this source',
        clause: 'TAG-060',
    },
    reissueEffectGrant: {
        code: 'effect.grant.reissue.unavailable',
        missing: 'effect grant re-issuance',
        remedy: 'Use a cell whose effect plane runs dynamic authority, on a build that wires re-issuance',
        clause: 'IDM-024',
    },
    revokeEffectGrant: { ...effectAuthority, clause: 'TAG-015' },
    advanceEffectAuthorityEpoch: { ...effectAuthority, clause: 'EFX-014' },
    // J: workspace instances.
    registerWorkspaceInstance: workspaceInstances,
    listWorkspaceInstances: workspaceInstances,
    inspectWorkspaceInstance: workspaceInstances,
};
/** The refusal one declared-ahead route answers once its authorization passes. */
export function declaredAheadDiagnostic(name) {
    const row = DECLARED_AHEAD_ROUTES[name];
    const route = API_ROUTES[name];
    if (!row)
        throw new Error(`route ${name} is not declared ahead, so it has no unwired refusal. Its handler answers it.`);
    return {
        severity: 'error',
        code: row.code,
        message: `${route.method} ${route.path} is declared, but this build does not wire ${row.missing}. ${row.remedy}.`,
        clause: row.clause,
    };
}
