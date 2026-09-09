/**
 * The product identity egress review policy.
 *
 * Junior guide: a rename can make two URLs look related, but outbound access
 * is not inherited from spelling. This file normalizes URL origins and checks
 * them against reviewed configuration before hosted wiring can admit them.
 * The kernel still enforces the final per-run destination list.
 */
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { PRODUCT_IDENTITY, PRODUCT_IDENTITY_SOURCE_REF } from "./product-identity.generated.js";
import { MODEL_PROVIDERS, PRODUCT_EGRESS_REVIEW_PURPOSES } from "./vocab.js";
export const PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL = 'product-identity-egress-review/v1';
export const DEFAULT_PRODUCT_MODEL_PROVIDER_ORIGINS = {
    anthropic: 'https://api.anthropic.com',
    openai: 'https://api.openai.com',
    openrouter: 'https://openrouter.ai',
    together: 'https://api.together.ai',
    fireworks: 'https://api.fireworks.ai',
};
/** Normalize an endpoint to the exact origin the egress policy compares. */
export function productIdentityEgressOrigin(raw) {
    return parsedEgressUrl(raw).origin;
}
/** Return the exact host that the runtime egress guard compares. */
export function productIdentityEgressHost(raw) {
    return parsedEgressUrl(raw).host;
}
/** Build the required destination for one model provider endpoint. */
export function productModelProviderEgressDestination(provider, endpoint) {
    if (!MODEL_PROVIDERS.includes(provider)) {
        refuse({
            code: 'identity.egress.provider',
            message: `${provider} is not a model provider with a reviewed hosted endpoint, so the egress policy cannot derive a destination.`,
            alternatives: MODEL_PROVIDERS.filter((candidate) => candidate !== 'scripted'),
            fix: 'choose one first-beta hosted model provider or add an explicit reviewed destination.',
            clause: 'IDM-085',
        });
    }
    if (provider === 'openai-compatible' && !endpoint) {
        refuse({
            code: 'identity.egress.compatible-endpoint-missing',
            message: 'an OpenAI-compatible provider instance has no default destination. Register its exact endpoint before egress review.',
            fix: 'set the provider instance endpoint and add its origin to reviewed egress configuration.',
            clause: 'KRN-037',
        });
    }
    return {
        url: endpoint ?? DEFAULT_PRODUCT_MODEL_PROVIDER_ORIGINS[provider],
        purpose: 'model-provider',
        reason: `the ${provider} model adapter endpoint`,
    };
}
/** The reviewed default model-provider origins for the first-beta hosted cell. */
export function defaultProductModelProviderEgressReviews(providers = ['openai', 'anthropic', 'openrouter', 'together', 'fireworks']) {
    return providers.map((provider) => ({
        url: DEFAULT_PRODUCT_MODEL_PROVIDER_ORIGINS[provider],
        purpose: 'model-provider',
        reviewed_by: 'operator:first-beta-runtime',
        reviewed_at: PRODUCT_IDENTITY.ratification.ratified_at,
        change_ref: PRODUCT_IDENTITY.ratification.decision_ref,
    }));
}
/** Verify that every required outbound origin has an exact reviewed entry. */
export function assertProductIdentityEgressReview(input) {
    const reviewed = input.reviewed.map((entry) => normalizeReviewed(entry));
    const required = input.required.map((entry) => normalizeRequired(entry));
    const reviewedKeys = new Set(reviewed.map((entry) => destinationKey(entry)));
    for (const destination of required) {
        if (reviewedKeys.has(destinationKey(destination)))
            continue;
        const sameOrigin = reviewed.filter((entry) => productIdentityEgressOrigin(entry.url) === productIdentityEgressOrigin(destination.url));
        refuse({
            code: 'identity.egress.unreviewed',
            message: `${productIdentityEgressOrigin(destination.url)} is not reviewed for ${destination.purpose}, so a rename or similar spelling cannot admit the outbound destination.`,
            alternatives: sameOrigin.length > 0 ? sameOrigin.map((entry) => `${entry.purpose}:${productIdentityEgressOrigin(entry.url)}`) : reviewed.map((entry) => destinationKey(entry)),
            fix: 'add the exact origin and purpose to reviewed egress configuration, or remove the outbound endpoint.',
            clause: 'IDM-085',
        });
    }
    return {
        protocol: PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL,
        source_ref: PRODUCT_IDENTITY_SOURCE_REF,
        review_ref: contentHash({ protocol: PRODUCT_IDENTITY_EGRESS_REVIEW_PROTOCOL, source_ref: PRODUCT_IDENTITY_SOURCE_REF, reviewed, required }),
        reviewed,
        required,
        admitted_origins: [...new Set(reviewed.map((entry) => productIdentityEgressOrigin(entry.url)))].sort(),
    };
}
function normalizeReviewed(entry) {
    const url = parsedEgressUrl(entry.url);
    if (!PRODUCT_EGRESS_REVIEW_PURPOSES.includes(entry.purpose)) {
        refuse({
            code: 'identity.egress.purpose',
            message: `${entry.purpose} is not an egress review purpose, so the destination cannot be compared.`,
            alternatives: [...PRODUCT_EGRESS_REVIEW_PURPOSES],
            fix: 'use a purpose from the contracts vocabulary.',
            clause: 'IDM-085',
        });
    }
    if (!plainToken(entry.reviewed_by)) {
        refuse({
            code: 'identity.egress.reviewer',
            message: 'the reviewed egress destination has no bounded reviewer identifier, so the review cannot be attributed.',
            fix: 'set reviewed_by to an operator or procedure identifier, not credential material.',
            clause: 'IDM-085',
        });
    }
    if (Number.isNaN(Date.parse(entry.reviewed_at))) {
        refuse({
            code: 'identity.egress.review-date',
            message: `reviewed_at ${entry.reviewed_at} is not a parseable date, so the egress review has no review point.`,
            fix: 'use an ISO date or timestamp for reviewed_at.',
            clause: 'IDM-085',
        });
    }
    if (!plainToken(entry.change_ref)) {
        refuse({
            code: 'identity.egress.change-ref',
            message: 'the reviewed egress destination has no bounded change reference, so the review cannot be tied to a migration act.',
            fix: 'set change_ref to a document, ticket or release reference.',
            clause: 'IDM-085',
        });
    }
    return { ...entry, url: url.origin };
}
function normalizeRequired(entry) {
    const url = parsedEgressUrl(entry.url);
    if (!PRODUCT_EGRESS_REVIEW_PURPOSES.includes(entry.purpose)) {
        refuse({
            code: 'identity.egress.required-purpose',
            message: `${entry.purpose} is not an egress review purpose, so the required destination cannot be compared.`,
            alternatives: [...PRODUCT_EGRESS_REVIEW_PURPOSES],
            fix: 'use a purpose from the contracts vocabulary.',
            clause: 'IDM-085',
        });
    }
    if (entry.reason.trim().length === 0) {
        refuse({
            code: 'identity.egress.reason',
            message: `the required destination ${url.origin} has no reason, so a reviewer cannot tell why it leaves the cell.`,
            fix: 'state which provider, artifact store or integration needs the destination.',
            clause: 'IDM-085',
        });
    }
    return { ...entry, url: url.origin };
}
function parsedEgressUrl(raw) {
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        refuse({
            code: 'identity.egress.url',
            message: `egress destination ${raw} is not a URL, so it cannot be compared with reviewed configuration.`,
            fix: 'use a full http or https URL.',
            clause: 'IDM-085',
        });
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        refuse({
            code: 'identity.egress.scheme',
            message: `egress destination ${url.href} uses ${url.protocol}. The review policy compares http and https origins only.`,
            alternatives: ['https:', 'http:'],
            fix: 'use an http or https endpoint, or handle the protocol through a different reviewed control.',
            clause: 'IDM-085',
        });
    }
    if (url.username || url.password || [...url.searchParams.keys()].some((name) => /token|secret|password|key/i.test(name))) {
        refuse({
            code: 'identity.egress.credential-url',
            message: `egress destination ${url.origin} includes credential-shaped URL material, so it cannot be written into reviewed configuration.`,
            fix: 'store credentials by reference and keep reviewed egress configuration to public origins.',
            clause: 'IDM-043',
        });
    }
    return url;
}
function destinationKey(destination) {
    return `${destination.purpose}:${productIdentityEgressOrigin(destination.url)}`;
}
function plainToken(value) {
    return value.trim().length > 0 && value.length <= 256 && !/token|secret|password|api[_-]?key/i.test(value);
}
