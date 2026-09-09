/**
 * The product identity release-signing policy.
 *
 * Junior guide: a release manifest needs to say which identity signs new
 * artifacts and which identity may only verify old artifacts. This file does
 * not hold private keys. It records the policy a release builder and verifier
 * must compare before a package set or image can be treated as a successor
 * release.
 */
import { LEGACY_PRODUCT_IDENTITY, SUCCESSOR_PRODUCT_IDENTITY } from './product-identity.generated.js';
import type { ProductReleaseSigningArtifactKind } from './vocab.js';
export declare const PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA: "zero-ar-release-signing-plan/v1";
export interface LegacyReleaseVerificationPolicy {
    product_slug: typeof LEGACY_PRODUCT_IDENTITY.slug;
    signing_identity: string;
    purpose: 'legacy-history';
    may_sign_new_releases: false;
    retained_until: string | null;
}
export interface ProductReleaseSigningPlanBody {
    schema: typeof PRODUCT_RELEASE_SIGNING_PLAN_SCHEMA;
    product_identity_source_ref: string;
    artifact_kind: ProductReleaseSigningArtifactKind;
    product_slug: typeof SUCCESSOR_PRODUCT_IDENTITY.slug;
    signing_identity: string;
    purpose: 'successor-release';
    subject: string;
    legacy_verification: LegacyReleaseVerificationPolicy;
}
export interface ProductReleaseSigningPlan extends ProductReleaseSigningPlanBody {
    plan_ref: string;
}
/** Produce the signing plan a successor release manifest must carry. */
export declare function productReleaseSigningPlan(artifact_kind: ProductReleaseSigningArtifactKind): ProductReleaseSigningPlan;
/** Explain why a release-signing plan does not match the identity policy. */
export declare function productReleaseSigningPlanRefusals(plan: ProductReleaseSigningPlan): string[];
/** Refuse a release-signing plan before an artifact is published. */
export declare function assertProductReleaseSigningPlan(plan: ProductReleaseSigningPlan): void;
