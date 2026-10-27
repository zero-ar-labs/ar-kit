export declare const PRODUCT_IDENTITY_SOURCE = "PRODUCT_IDENTITY.yaml";
export declare const PRODUCT_IDENTITY_SOURCE_REF = "sha256:46fb9415570c213db5eb10224ae2c19b6b9daa86111b714ad1f6dfdf8faaf2de";
export declare const PRODUCT_IDENTITY: {
    readonly successor: {
        readonly display_name: "Zero-AR";
        readonly wordmark: "ZERO-AR";
        readonly expansion: "Zero-layer Autonomous Runtime";
        readonly pronunciation: "zero A-R";
        readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
        readonly slug: "zero-ar";
        readonly package_scope: "@zero-ar";
        readonly command: "zeroar";
        readonly environment_prefix: "ZERO_AR_";
        readonly local_data_directory: ".zero-ar";
        readonly run_bundle_suffix: ".zeroar.jsonl";
        readonly kernel: {
            readonly display_name: "W0 Kernel";
            readonly slug: "w0";
        };
    };
    readonly schema: "product-identity/v2";
    readonly status: "current";
    readonly version: "2.0.0";
    readonly current: {
        readonly display_name: "Zero-AR";
        readonly wordmark: "ZERO-AR";
        readonly expansion: "Zero-layer Autonomous Runtime";
        readonly pronunciation: "zero A-R";
        readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
        readonly slug: "zero-ar";
        readonly package_scope: "@zero-ar";
        readonly command: "zeroar";
        readonly environment_prefix: "ZERO_AR_";
        readonly local_data_directory: ".zero-ar";
        readonly run_bundle_suffix: ".zeroar.jsonl";
        readonly kernel: {
            readonly display_name: "W0 Kernel";
            readonly slug: "w0";
        };
    };
    readonly ratification: {
        readonly authority: "product-owner";
        readonly selected_at: "2026-08-31";
        readonly ratified_at: "2026-10-14";
        readonly decision_ref: "docs/product-identity-and-namespace-migration-appendix.md@0.5.0";
        readonly external_legal_approval_required: false;
    };
    readonly distribution: {
        readonly namespace_status: "controlled-activated-channels";
        readonly controlled_channels: readonly ["npm-scope:@zero-ar", "source-organization:github:@zero-ar-labs"];
    };
    readonly migration: {
        readonly epoch: "cutover-1";
        readonly compatibility_starts: "2026-09-02T00:00:00Z";
        readonly new_name_default_from: "2026-09-02T00:00:00Z";
        readonly legacy_writes_end: "2026-09-02T00:00:00Z";
        readonly legacy_support_ends: "2026-09-02T00:00:00Z";
    };
};
export type ProductIdentity = typeof PRODUCT_IDENTITY;
export type ProductIdentityStatus = 'proposed' | 'selected' | 'ratified' | 'migrating' | 'current' | 'retired';
export declare const CURRENT_PRODUCT_IDENTITY: {
    readonly display_name: "Zero-AR";
    readonly wordmark: "ZERO-AR";
    readonly expansion: "Zero-layer Autonomous Runtime";
    readonly pronunciation: "zero A-R";
    readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
    readonly slug: "zero-ar";
    readonly package_scope: "@zero-ar";
    readonly command: "zeroar";
    readonly environment_prefix: "ZERO_AR_";
    readonly local_data_directory: ".zero-ar";
    readonly run_bundle_suffix: ".zeroar.jsonl";
    readonly kernel: {
        readonly display_name: "W0 Kernel";
        readonly slug: "w0";
    };
};
export declare const SUCCESSOR_PRODUCT_IDENTITY: {
    readonly display_name: "Zero-AR";
    readonly wordmark: "ZERO-AR";
    readonly expansion: "Zero-layer Autonomous Runtime";
    readonly pronunciation: "zero A-R";
    readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
    readonly slug: "zero-ar";
    readonly package_scope: "@zero-ar";
    readonly command: "zeroar";
    readonly environment_prefix: "ZERO_AR_";
    readonly local_data_directory: ".zero-ar";
    readonly run_bundle_suffix: ".zeroar.jsonl";
    readonly kernel: {
        readonly display_name: "W0 Kernel";
        readonly slug: "w0";
    };
};
export declare const PRODUCT_IDENTITY_MIGRATION: {
    readonly epoch: "cutover-1";
    readonly compatibility_starts: "2026-09-02T00:00:00Z";
    readonly new_name_default_from: "2026-09-02T00:00:00Z";
    readonly legacy_writes_end: "2026-09-02T00:00:00Z";
    readonly legacy_support_ends: "2026-09-02T00:00:00Z";
};
export declare function activeProductIdentity(): {
    readonly display_name: "Zero-AR";
    readonly wordmark: "ZERO-AR";
    readonly expansion: "Zero-layer Autonomous Runtime";
    readonly pronunciation: "zero A-R";
    readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
    readonly slug: "zero-ar";
    readonly package_scope: "@zero-ar";
    readonly command: "zeroar";
    readonly environment_prefix: "ZERO_AR_";
    readonly local_data_directory: ".zero-ar";
    readonly run_bundle_suffix: ".zeroar.jsonl";
    readonly kernel: {
        readonly display_name: "W0 Kernel";
        readonly slug: "w0";
    };
};
export declare function newSurfaceProductIdentity(): {
    readonly display_name: "Zero-AR";
    readonly wordmark: "ZERO-AR";
    readonly expansion: "Zero-layer Autonomous Runtime";
    readonly pronunciation: "zero A-R";
    readonly canonical_introduction: "Zero-AR is a log-native runtime for long-horizon agent work.";
    readonly slug: "zero-ar";
    readonly package_scope: "@zero-ar";
    readonly command: "zeroar";
    readonly environment_prefix: "ZERO_AR_";
    readonly local_data_directory: ".zero-ar";
    readonly run_bundle_suffix: ".zeroar.jsonl";
    readonly kernel: {
        readonly display_name: "W0 Kernel";
        readonly slug: "w0";
    };
};
