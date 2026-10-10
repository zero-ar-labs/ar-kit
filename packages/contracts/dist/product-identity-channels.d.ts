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
