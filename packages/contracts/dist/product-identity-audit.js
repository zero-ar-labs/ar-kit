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
import { LEGACY_PRODUCT_IDENTITY, PRODUCT_IDENTITY, PRODUCT_IDENTITY_MIGRATION, SUCCESSOR_PRODUCT_IDENTITY, activeProductIdentity, } from "./product-identity.generated.js";
import { contentHash } from "./ids.js";
const KNOWN_SLUGS = [LEGACY_PRODUCT_IDENTITY.slug, SUCCESSOR_PRODUCT_IDENTITY.slug];
function displayFor(slug) {
    if (slug === SUCCESSOR_PRODUCT_IDENTITY.slug)
        return SUCCESSOR_PRODUCT_IDENTITY.display_name;
    if (slug === LEGACY_PRODUCT_IDENTITY.slug)
        return LEGACY_PRODUCT_IDENTITY.display_name;
    return slug;
}
/**
 * Render one stored record's identity beside the current one. The historical
 * slug is read from the record, never guessed from the active identity.
 */
export function renderHistoricalIdentity(historical_slug) {
    if (!historical_slug) {
        throw new Error('a historical record carries no product identity slug. Read the slug the record stored, because the active identity is not evidence of what was written.');
    }
    const active = activeProductIdentity();
    const historical = displayFor(historical_slug);
    return {
        product_identity: active.display_name,
        historical_identity: historical,
        identities_differ: historical !== active.display_name,
        legacy_names: KNOWN_SLUGS.filter((slug) => slug !== active.slug).map(displayFor),
        migration_epoch: PRODUCT_IDENTITY_MIGRATION.epoch,
        bytes_rewritten: false,
    };
}
/**
 * Compare source bytes across a rename. The refs follow bytes, not aliases,
 * so a rename-only edit still receives a new content identity.
 */
export function compareIdentitySourceBytes(before, after) {
    const beforeRef = contentHash({ bytes: before });
    const afterRef = contentHash({ bytes: after });
    return {
        before_ref: beforeRef,
        after_ref: afterRef,
        bytes_equal: before === after,
        content_changed: beforeRef !== afterRef,
        aliases_can_conceal_change: false,
    };
}
/** True when the slug is one this product has actually published under. */
export function knownProductIdentitySlug(slug) {
    return KNOWN_SLUGS.includes(slug);
}
/** The identity status the artifact currently declares. */
export function productIdentityStatus() {
    return PRODUCT_IDENTITY.status;
}
