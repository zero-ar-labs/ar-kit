/**
 * The product identity channel gate.
 *
 * What this is: a small parser and refusal helper for external channels that
 * may carry the Zero-AR name, such as npm scopes and source organizations.
 *
 * Junior guide: before a release script publishes anywhere, it asks this
 * file whether that destination appears in PRODUCT_IDENTITY.yaml. If not, the
 * operation stops and tells the operator where to record custody.
 */
import { refuse } from "./diagnostics.js";
import { PRODUCT_IDENTITY, PRODUCT_IDENTITY_SOURCE_REF } from "./product-identity.generated.js";
import { PRODUCT_DISTRIBUTION_CHANNEL_KINDS } from "./vocab.js";
export const PRODUCT_IDENTITY_CHANNEL_PROTOCOL = 'product-identity-channels/v1';
export function productDistributionChannelRef(channel) {
    return `${channel.kind}:${channel.identifier}`;
}
export function parseProductDistributionChannel(value) {
    const separator = value.indexOf(':');
    if (separator <= 0 || separator === value.length - 1) {
        refuse({
            code: 'identity.channel.syntax',
            message: 'the product distribution channel is not written as kind:identifier, so it cannot be compared with the custody inventory.',
            received: redactIfNeeded(value),
            fix: 'use a channel such as npm-scope:@zero-ar or source-organization:github:@zero-ar-labs.',
            clause: 'IDM-005',
        });
    }
    const kind = value.slice(0, separator);
    const identifier = value.slice(separator + 1);
    if (!isProductDistributionChannelKind(kind)) {
        refuse({
            code: 'identity.channel.kind',
            message: `${kind} is not a product distribution channel kind, so the custody inventory cannot classify it.`,
            alternatives: [...PRODUCT_DISTRIBUTION_CHANNEL_KINDS],
            fix: 'use a channel kind from the closed vocabulary.',
            clause: 'IDM-005',
        });
    }
    if (looksLikeSecret(identifier)) {
        refuse({
            code: 'identity.channel.secret',
            message: 'the product distribution channel identifier looks like credential material, so it cannot be written into the identity artifact.',
            received: '[redacted]',
            fix: 'record only the public channel identifier, and keep tokens in the configured secret store.',
            clause: 'IDM-043',
        });
    }
    return { kind, identifier };
}
export function controlledProductChannels() {
    return PRODUCT_IDENTITY.distribution.controlled_channels
        .map((channel) => parseProductDistributionChannel(channel))
        .sort((left, right) => productDistributionChannelRef(left).localeCompare(productDistributionChannelRef(right)));
}
export function isControlledProductChannel(channel) {
    return controlledRefs().has(productDistributionChannelRef(channel));
}
export function assertControlledProductChannel(channel) {
    const channelRef = productDistributionChannelRef(channel);
    const allowed = [...controlledRefs()].sort();
    if (!allowed.includes(channelRef)) {
        refuse({
            code: 'identity.channel.uncontrolled',
            message: `${channelRef} is not recorded as a controlled product channel, so publication cannot continue there.`,
            alternatives: allowed,
            fix: 'record custody in PRODUCT_IDENTITY.yaml and governance/product-identity-custody.md, or choose a controlled channel.',
            clause: 'IDM-005',
        });
    }
    return {
        protocol: PRODUCT_IDENTITY_CHANNEL_PROTOCOL,
        source_ref: PRODUCT_IDENTITY_SOURCE_REF,
        channel_ref: channelRef,
        controlled: true,
        controlled_channels: allowed,
    };
}
function controlledRefs() {
    return new Set(PRODUCT_IDENTITY.distribution.controlled_channels.map((channel) => productDistributionChannelRef(parseProductDistributionChannel(channel))));
}
function isProductDistributionChannelKind(value) {
    return PRODUCT_DISTRIBUTION_CHANNEL_KINDS.includes(value);
}
function looksLikeSecret(value) {
    return /\b(?:sk-[A-Za-z0-9_-]{8,}|[A-Za-z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY)[A-Za-z0-9_]*=)\b/.test(value);
}
function redactIfNeeded(value) {
    return looksLikeSecret(value) ? '[redacted]' : value;
}
