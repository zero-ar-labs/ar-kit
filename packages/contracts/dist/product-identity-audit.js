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
export function knownProductIdentitySlug(slug) {
    return KNOWN_SLUGS.includes(slug);
}
export function productIdentityStatus() {
    return PRODUCT_IDENTITY.status;
}
