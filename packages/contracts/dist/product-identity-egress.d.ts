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
export declare const DEFAULT_PRODUCT_WEB_SEARCH_ORIGINS: Readonly<Record<'parallel' | 'exa', string>>;
export declare function productIdentityEgressOrigin(raw: string): string;
export declare function productIdentityEgressHost(raw: string): string;
export declare function productModelProviderEgressDestination(provider: ProductHostedModelProvider, endpoint?: string): ProductIdentityRequiredEgressDestination;
export declare function defaultProductModelProviderEgressReviews(providers?: readonly ProductNamedModelProvider[]): ProductIdentityReviewedEgressDestination[];
export declare function defaultProductWebSearchEgressReviews(): ProductIdentityReviewedEgressDestination[];
export declare function assertProductIdentityEgressReview(input: ProductIdentityEgressReviewInput): ProductIdentityEgressReviewReport;
