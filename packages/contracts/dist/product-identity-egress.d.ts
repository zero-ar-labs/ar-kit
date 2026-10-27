import type { ModelProvider, ProductEgressReviewPurpose } from './vocab.js';
export declare const PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL: "product-identity-egress-review/v1";
export declare const PRODUCT_DEFAULT_EGRESS_REVIEW: {
    readonly reviewed_by: "operator:first-beta-runtime";
    readonly reviewed_at: "2026-08-31";
    readonly change_ref: "docs/product-identity-and-namespace-migration-appendix.md@0.4.1";
};
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
export declare const DEFAULT_PRODUCT_WEB_SEARCH_ORIGINS: {
    readonly parallel: "https://api.parallel.ai";
    readonly exa: "https://api.exa.ai";
    readonly deepseek: "https://api.deepseek.com";
};
export declare function productIdentityEgressOrigin(raw: string): string;
export declare function productIdentityEgressHost(raw: string): string;
export declare function productModelProviderEgressDestination(provider: ProductHostedModelProvider, endpoint?: string): ProductIdentityRequiredEgressDestination;
export declare function defaultProductModelProviderEgressReviews(providers?: readonly ProductNamedModelProvider[]): ProductIdentityReviewedEgressDestination[];
export declare function defaultProductWebSearchEgressReviews(): ProductIdentityReviewedEgressDestination[];
export declare function assertProductIdentityEgressReview(input: ProductIdentityEgressReviewInput): ProductIdentityEgressReviewReport;
