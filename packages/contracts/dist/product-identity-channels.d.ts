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
import type { ProductDistributionChannelKind } from './vocab.js';
export declare const PRODUCT_IDENTITY_CHANNEL_PROTOCOL: "product-identity-channels/v1";
export interface ProductDistributionChannel {
    kind: ProductDistributionChannelKind;
    identifier: string;
}
export interface ProductIdentityChannelReport {
    protocol: typeof PRODUCT_IDENTITY_CHANNEL_PROTOCOL;
    source_ref: string;
    channel_ref: string;
    controlled: boolean;
    controlled_channels: string[];
}
export declare function productDistributionChannelRef(channel: ProductDistributionChannel): string;
export declare function parseProductDistributionChannel(value: string): ProductDistributionChannel;
export declare function controlledProductChannels(): ProductDistributionChannel[];
export declare function isControlledProductChannel(channel: ProductDistributionChannel): boolean;
export declare function assertControlledProductChannel(channel: ProductDistributionChannel): ProductIdentityChannelReport;
