export interface HistoricalIdentityRendering {
    product_identity: string;
    historical_identity: string;
    identities_differ: boolean;
    legacy_names: readonly string[];
    migration_epoch: string | null;
    bytes_rewritten: false;
}
export interface IdentitySourceByteComparison {
    before_ref: string;
    after_ref: string;
    bytes_equal: boolean;
    content_changed: boolean;
    aliases_can_conceal_change: false;
}
export declare function renderHistoricalIdentity(historical_slug: string): HistoricalIdentityRendering;
export declare function compareIdentitySourceBytes(before: string, after: string): IdentitySourceByteComparison;
export declare function knownProductIdentitySlug(slug: string): boolean;
export declare function productIdentityStatus(): string;
