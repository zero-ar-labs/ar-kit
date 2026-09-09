/**
 * Historical identity rendering for audit and result surfaces.
 *
 * What this is: given the product identity a record carried when it was
 * written, this returns what a surface should show now. When the historical
 * and active identities differ it returns both, and it states that the stored
 * bytes were not rewritten, because showing one name over old bytes is what
 * makes a reader think history changed.
 *
 * How it fits: IDM-027. The migration renames the product without renaming
 * history, so every surface that renders an old record has to say which name
 * belongs to the record and which belongs to the product today.
 */
/** What an audit or result surface shows for one historically written record. */
export interface HistoricalIdentityRendering {
    /** The product identity in force now. */
    product_identity: string;
    /** The identity the record carried when it was written. */
    historical_identity: string;
    /** True when the reader is looking at a record from a different identity. */
    identities_differ: boolean;
    /** Every identity this product has published under, oldest first. */
    legacy_names: readonly string[];
    /** The ratified migration epoch, or null before one is declared. */
    migration_epoch: string | null;
    /** Always false. Renaming the product never rewrote a stored record. */
    bytes_rewritten: false;
}
export interface IdentitySourceByteComparison {
    before_ref: string;
    after_ref: string;
    bytes_equal: boolean;
    content_changed: boolean;
    aliases_can_conceal_change: false;
}
/**
 * Render one stored record's identity beside the current one. The historical
 * slug is read from the record, never guessed from the active identity.
 */
export declare function renderHistoricalIdentity(historical_slug: string): HistoricalIdentityRendering;
/**
 * Compare source bytes across a rename. The refs follow bytes, not aliases,
 * so a rename-only edit still receives a new content identity.
 */
export declare function compareIdentitySourceBytes(before: string, after: string): IdentitySourceByteComparison;
/** True when the slug is one this product has actually published under. */
export declare function knownProductIdentitySlug(slug: string): boolean;
/** The identity status the artifact currently declares. */
export declare function productIdentityStatus(): string;
