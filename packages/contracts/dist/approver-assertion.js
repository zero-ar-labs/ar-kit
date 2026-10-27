import { randomUUID } from 'node:crypto';
import { jwsKeyMatches, signCompactJws } from "./compact-jws.js";
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { APPROVER_ASSERTION_ALGORITHMS } from "./vocab.js";
export const APPROVER_ASSERTION_TYPE = 'zero-ar-approver+jwt';
export const APPROVER_ASSERTION_MAX_LIFETIME_SECONDS = 600;
export const APPROVER_ASSERTION_MAX_CLOCK_SKEW_SECONDS = 300;
export const APPROVER_ASSERTION_USE_RETENTION_SECONDS = APPROVER_ASSERTION_MAX_LIFETIME_SECONDS + 2 * APPROVER_ASSERTION_MAX_CLOCK_SKEW_SECONDS;
export const APPLICATION_ATTESTED_ISSUER_PREFIX = 'urn:zero-ar:application:';
export function applicationAttestedIssuer(application_principal) {
    if (typeof application_principal !== 'string' || application_principal.length < 1 || application_principal.length > 512) {
        throw new Error('an application principal must contain 1 to 512 characters before it can name an attested issuer.');
    }
    return APPLICATION_ATTESTED_ISSUER_PREFIX + [...application_principal]
        .map((character) => /^[A-Za-z0-9\-._~!$&'()*+,;=:@/]$/.test(character) ? character : encodeURIComponent(character))
        .join('');
}
export function isApplicationAttestedIssuer(issuer) {
    return typeof issuer === 'string' && issuer.startsWith(APPLICATION_ATTESTED_ISSUER_PREFIX);
}
export function approverAssertionAlgorithm(key) {
    return APPROVER_ASSERTION_ALGORITHMS.find((alg) => jwsKeyMatches(alg, key)) ?? null;
}
export function signApproverAssertion(input, key) {
    const alg = approverAssertionAlgorithm(key);
    if (!alg) {
        throw new Error('the approver assertion key is not an Ed25519 key, a P-256 key or an HMAC secret of at least 32 bytes. Sign with the key type the deployment registered.');
    }
    const lifetime = input.lifetime_seconds ?? 300;
    if (!Number.isInteger(lifetime) || lifetime < 1 || lifetime > APPROVER_ASSERTION_MAX_LIFETIME_SECONDS) {
        throw new Error(`an approver assertion lifetime must be a whole number of seconds from 1 through ${APPROVER_ASSERTION_MAX_LIFETIME_SECONDS}.`);
    }
    const issuedAt = Math.floor((input.now ?? new Date()).getTime() / 1_000);
    return signCompactJws({ alg, kid: input.key_id, typ: APPROVER_ASSERTION_TYPE }, {
        sub: input.subject,
        aud: input.audience,
        tenant: input.tenant,
        iat: issuedAt,
        exp: issuedAt + lifetime,
        jti: input.credential_id ?? randomUUID(),
    }, key);
}
export function approverAssertionUse(actor, request_binding, now_ms) {
    if (!actor || !isApplicationAttestedIssuer(actor.issuer) || actor.credential_id === null)
        return null;
    return {
        use_ref: contentHash({ issuer: actor.issuer, credential_id: actor.credential_id }),
        request_binding,
        expires_at: new Date(now_ms + APPROVER_ASSERTION_USE_RETENTION_SECONDS * 1_000).toISOString(),
        now: new Date(now_ms).toISOString(),
    };
}
export async function recordApproverAssertionUse(claim, use) {
    if (!use)
        return;
    if (!claim) {
        refuse({
            code: 'auth.actor.replay-unrecorded',
            message: 'this store cannot record which request an approver assertion served, so a replay could not be refused. Run the cell on its SQLite or PostgreSQL store, or approve with an identity provider JWT.',
            clause: 'IOP-135',
        });
    }
    if (!(await claim(use))) {
        refuse({
            code: 'auth.actor.replayed',
            message: 'this approver assertion already served another request, so it cannot serve this one. Sign a new assertion for this request; to retry the earlier request, send that request unchanged.',
            clause: 'IOP-135',
        });
    }
}
