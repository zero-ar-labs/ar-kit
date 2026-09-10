/**
 * @zero-ar/contracts
 *
 * The one source for public payloads, closed vocabularies, identifiers,
 * canonical serialization, diagnostics, and the four state machines. Every
 * other package imports from here; nothing here imports a runtime package.
 */
export * from './vocab.js';
export * from './events.js';
export * from './canonical.js';
export * from './ids.js';
export * from './state-machines.js';
export * from './diagnostics.js';
export * from './schemas.js';
export * from './routes.js';
export * from './claims.js';
export * from './effects.js';
export * from './effect-approvals.js';
export * from './model.js';
export * from './publication.js';
export * from './providers.js';
export * from './tool-sources.js';
export * from './sources.js';
export * from './memory.js';
export * from './integration.js';
export * from './environment.js';
export * from './environment-management.js';
export * from './environment-release.js';
export * from './environment-deployment.js';
export * from './runtime-artifacts.js';
export * from './external-observations.js';
export * from './interop.js';
export * from './tool-host-protocol.js';
export * from './capability-profile.js';
export * from './product-identity.generated.js';
export * from './product-identity-env.js';
export * from './product-identity-formats.js';
export * from './product-identity-audit.js';
export * from './product-identity-local.js';
export * from './product-identity-packages.js';
export * from './product-identity-channels.js';
export * from './product-identity-egress.js';
export * from './product-identity-templates.js';
export * from './product-identity-release.js';
export * from './connection-target.js';
/** Public API contract version. Major-version path, additive minor evolution. */
export declare const CONTRACT_VERSION = "v1";
