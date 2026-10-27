import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { PRODUCT_IDENTITY_SOURCE_REF, SUCCESSOR_PRODUCT_IDENTITY } from "./product-identity.generated.js";
import { PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS } from "./vocab.js";
export const PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA = 'zero-ar-release-signing-plan/v2';
const V1_IDENTITY_SOURCE_REF = 'sha256:08acc193d619e075f9221af22b92d62a604a185ea873eea15cd8e4827bc8dfb3';
const V1_VERIFICATION_POLICY_REF = 'sha256:9025642f2d922004b89e90ffd447e4fd2562fd23962b74335b13e6f5795c03fe';
export function productReleaseSigningPlan(artifact_kind) {
    if (!PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS.includes(artifact_kind)) {
        refuse({ code: 'identity.release-signing.artifact', message: `${artifact_kind} is not a product release signing artifact kind.`, alternatives: [...PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS], fix: 'choose the exact release artifact family before signing', clause: 'IDM-082' });
    }
    const body = {
        schema: PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA,
        product_identity_source_ref: PRODUCT_IDENTITY_SOURCE_REF,
        artifact_kind,
        product_slug: SUCCESSOR_PRODUCT_IDENTITY.slug,
        signing_identity: `openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release`,
        purpose: 'successor-release',
        subject: `${SUCCESSOR_PRODUCT_IDENTITY.slug}:${artifact_kind}`,
    };
    return { ...body, plan_ref: contentHash(body) };
}
export function productReleaseSigningPlanRefusals(plan, options = {}) {
    const { plan_ref, ...body } = plan;
    const refusals = [];
    const historical = plan.schema === 'zero-ar-release-signing-plan/v1';
    if (plan.schema !== PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA && (!historical || options.require_current)) {
        refusals.push(`release signing plan schema is ${plan.schema}, not ${PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA}.`);
    }
    if (!PRODUCT_RELEASE_SIGNING_ARTIFACT_KINDS.includes(plan.artifact_kind))
        refusals.push(`${plan.artifact_kind} is not a known release signing artifact kind.`);
    const expectedSource = historical ? V1_IDENTITY_SOURCE_REF : PRODUCT_IDENTITY_SOURCE_REF;
    if (plan.product_identity_source_ref !== expectedSource)
        refusals.push('release signing plan does not point at its ratified product identity source.');
    if (plan.product_slug !== SUCCESSOR_PRODUCT_IDENTITY.slug)
        refusals.push(`successor releases must sign as ${SUCCESSOR_PRODUCT_IDENTITY.slug}, not ${plan.product_slug}.`);
    if (plan.signing_identity !== `openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release`)
        refusals.push(`successor releases must use openpgp:${SUCCESSOR_PRODUCT_IDENTITY.slug}-release, not ${plan.signing_identity}.`);
    if (plan.purpose !== 'successor-release')
        refusals.push(`successor releases must carry purpose successor-release, not ${plan.purpose}.`);
    if (plan.subject !== `${SUCCESSOR_PRODUCT_IDENTITY.slug}:${plan.artifact_kind}`)
        refusals.push(`release signing subject is ${plan.subject}, not ${SUCCESSOR_PRODUCT_IDENTITY.slug}:${plan.artifact_kind}.`);
    if (historical) {
        const policy = plan.legacy_verification;
        const policyRef = contentHash({
            product_slug: policy?.product_slug ?? null,
            signing_identity: policy?.signing_identity ?? null,
            purpose: policy?.purpose ?? null,
            may_sign_new_releases: policy?.may_sign_new_releases ?? null,
        });
        if (policyRef !== V1_VERIFICATION_POLICY_REF)
            refusals.push('historical verification policy differs from the admitted v1 Zero-AR policy.');
    }
    else if (plan.legacy_verification !== undefined) {
        refusals.push('current release signing plans must not declare legacy verification material.');
    }
    if (plan_ref !== contentHash(body))
        refusals.push('release signing plan ref does not match its body.');
    return refusals;
}
export function assertProductReleaseSigningPlan(plan) {
    const refusals = productReleaseSigningPlanRefusals(plan, { require_current: true });
    if (refusals.length > 0)
        refuse({ code: 'identity.release-signing.plan', message: `the release signing plan does not match product identity policy. ${refusals.join(' ')}`, fix: 'generate the current signing plan from PRODUCT_IDENTITY.yaml', clause: 'IDM-082' });
}
