/**
 * The product identity release-signing policy.
 *
 * Junior guide: a release manifest needs to say which identity signs new
 * artifacts and which identity may only verify old artifacts. This file does
 * not hold private keys. It records the policy a release builder and verifier
 * must compare before a package set or image can be treated as a successor
 * release.
 */
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { LEGACY_PRODUCT_IDENTITY, PRODUCT_IDENTITY_SOURCE_REF, PRODUCT_IDENTITY_MIGRATION, SUCCESSOR_PRODUCT_IDENTITY, } from "./product-identity.generated.js";
import { PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS } from "./vocab.js";
export const PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA = 'zero-ar-release-signing-plan/v1';
/** Produce the signing plan a successor release manifest must carry. */
export function productReleaseSigningPlan(artifact_kind) {
    if (!PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS.includes(artifact_kind)) {
        refuse({
            code: 'identity.release-signing.artifact',
            message: `${artifact_kind} is not a product release signing artifact kind.`,
            alternatives: [...PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS],
            fix: 'choose the exact release artifact family before signing',
            clause: 'IDM-082',
        });
    }
    const body = {
        schema: PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA,
        product_identity_source_ref: PRODUCT_IDENTITY_SOURCE_REF,
        artifact_kind,
        product_slug: SUCCESSOR_PRODUCT_IDENTITY.slug,
        signing_identity: `openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release`,
        purpose: 'successor-release',
        subject: `${SUCCESSOR_PRODUCT_IDENTITY.slug}:${artifact_kind}`,
        legacy_verification: {
            product_slug: LEGACY_PRODUCT_IDENTITY.slug,
            signing_identity: `openpgp:${LEGACY_PRODUCT_IDENTITY.slug}-release`,
            purpose: 'legacy-history',
            may_sign_new_releases: false,
            retained_until: PRODUCT_IDENTITY_MIGRATION.legacy_support_ends,
        },
    };
    return { ...body, plan_ref: contentHash(body) };
}
/** Explain why a release-signing plan does not match the identity policy. */
export function productReleaseSigningPlanRefusals(plan) {
    const { plan_ref, ...body } = plan;
    const refusals = [];
    if (plan.schema !== PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA) {
        refusals.push(`release signing plan schema is ${plan.schema}, not ${PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA}.`);
    }
    if (!PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS.includes(plan.artifact_kind)) {
        refusals.push(`${plan.artifact_kind} is not a known release signing artifact kind.`);
    }
    if (plan.product_identity_source_ref !== PRODUCT_IDENTITY_SOURCE_REF) {
        refusals.push('release signing plan does not point at the ratified product identity source.');
    }
    if (plan.product_slug !== SUCCESSOR_PRODUCT_IDENTITY.slug) {
        refusals.push(`successor releases must sign as ${SUCCESSOR_PRODUCT_IDENTITY.slug}, not ${plan.product_slug}.`);
    }
    if (plan.signing_identity !== `openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release`) {
        refusals.push(`successor releases must use openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release, not ${plan.signing_identity}.`);
    }
    if (plan.purpose !== 'successor-release') {
        refusals.push(`successor releases must carry purpose successor-release, not ${plan.purpose}.`);
    }
    if (plan.subject !== `${SUCCESSOR_PRODUCT_IDENTITY.slug}:${plan.artifact_kind}`) {
        refusals.push(`release signing subject is ${plan.subject}, not ${SUCCESSOR_PRODUCT_IDENTITY.slug}:${plan.artifact_kind}.`);
    }
    if (plan.legacy_verification.product_slug !== LEGACY_PRODUCT_IDENTITY.slug) {
        refusals.push(`legacy verification policy must name ${LEGACY_PRODUCT_IDENTITY.slug}.`);
    }
    if (plan.legacy_verification.signing_identity !== `openpgp:${LEGACY_PRODUCT_IDENTITY.slug}-release`) {
        refusals.push(`legacy verification policy must keep openpgp:${LEGACY_PRODUCT_IDENTITY.slug}-release for old artifacts only.`);
    }
    if (plan.legacy_verification.purpose !== 'legacy-history') {
        refusals.push(`legacy verification purpose is ${plan.legacy_verification.purpose}, not legacy-history.`);
    }
    if (plan.legacy_verification.may_sign_new_releases !== false) {
        refusals.push('legacy verification material may not sign new successor releases.');
    }
    if (plan.legacy_verification.signing_identity === plan.signing_identity) {
        refusals.push('successor release signing and legacy verification cannot use the same identity string.');
    }
    if (plan_ref !== contentHash(body))
        refusals.push('release signing plan ref does not match its body.');
    return refusals;
}
/** Refuse a release-signing plan before an artifact is published. */
export function assertProductReleaseSigningPlan(plan) {
    const refusals = productReleaseSigningPlanRefusals(plan);
    if (refusals.length > 0) {
        refuse({
            code: 'identity.release-signing.plan',
            message: `the release signing plan does not match product identity policy. ${refusals.join(' ')}`,
            fix: 'generate the release signing plan from PRODUCT_IDENTITY.yaml and sign the successor artifact with the successor release identity',
            clause: 'IDM-082',
        });
    }
}
