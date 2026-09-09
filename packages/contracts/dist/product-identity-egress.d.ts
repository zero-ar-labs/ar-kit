/**
 * The product identity egress review policy.
 *
 * Junior guide: a rename can make two URLs look related, but outbound access
 * is not inherited from spelling. This file normalizes URL origins and checks
 * them against reviewed configuration before hosted wiring can admit them.
 * The kernel still enforces the final per-run destination list.
 */
import type { ModelProvider, ProductEgressReviewPurpose } from './vocab.js';
export declare const PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL: "product-identity-egress-review/v1";
export type ProductHostedModelProvider = Exclude<ModelProvider, 'scripted'>;
export type ProductNamedModelProvider = Exclude<ProductHostedModelProvider, 'openai-compatible'>;
export interface ProductIdentityReviewedEgressDestination {
    url: string;
    purpose: ProductEgressReviewPurpose;
    reviewed_by: string;
    reviewed_at: string;
    change_ref: string;
}
export interface ProductIdentityRequiredEgressDestination {
    url: string;
    purpose: ProductEgressReviewPurpose;
    reason: string;
}
export interface ProductIdentityEgressReviewInput {
    reviewed: readonly ProductIdentityReviewedEgressDestination[];
    required: readonly ProductIdentityRequiredEgressDestination[];
}
export interface ProductIdentityEgressReviewReport {
    protocol: typeof PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL;
    source_ref: string;
    review_ref: string;
    reviewed: readonly ProductIdentityReviewedEgressDestination[];
    required: readonly ProductIdentityRequiredEgressDestination[];
    admitted_origins: readonly string[];
}
export declare const DEFAULT_PRODUCT_MODEL_PROVIDER_ORIGINS: Readonly<Record<ProductNamedModelProvider, string>>;
/** Normalize an endpoint to the exact origin the egress policy compares. */
export declare function productIdentityEgressOrigin(raw: string): string;
/** Return the exact host that the runtime egress guard compares. */
export declare function productIdentityEgressHost(raw: string): string;
/** Build the required destination for one model provider endpoint. */
export declare function productModelProviderEgressDestination(provider: ProductHostedModelProvider, endpoint?: string): ProductIdentityRequiredEgressDestination;
/** The reviewed default model-provider origins for the first-beta hosted cell. */
export declare function defaultProductModelProviderEgressReviews(providers?: readonly ProductNamedModelProvider[]): ProductIdentityReviewedEgressDestination[];
/** Verify that every required outbound origin has an exact reviewed entry. */
export declare function assertProductIdentityEgressReview(input: ProductIdentityEgressReviewInput): ProductIdentityEgressReviewReport;
