/**
 * The generated product identity constants.
 *
 * What this is: the typed projection of PRODUCT_IDENTITY.yaml.
 *
 * How it fits: packages import the successor identity from one generated
 * module; the retired identity stays only so readers of legacy stored
 * formats can name it.
 */
export declare const PRODUCT_IDENTITY_SOURCE = "PRODUCT_IDENTITY.yaml";
export declare const PRODUCT_IDENTITY_SOURCE_REF = "sha256:08acc193d619e075f9221af22b92d62a604a185ea873eea15cd8e4827bc8dfb3";
export declare const PRODUCT_IDENTITY: {
    readonly schema: "product-identity/v1";
    readonly status: "current";
    readonly version: "1.0.0";
    readonly current: {
        readonly display_name: "Ramsden";
        readonly slug: "ramsden";
        readonly package_scope: "@ramsden";
        readonly command: "ramsden";
        readonly environment_prefix: "RAMSDEN_";
        readonly local_data_directory: ".ramsden";
    };
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
    readonly ratification: {
        readonly authority: "product-owner";
        readonly selected_at: "2026-08-31";
        readonly ratified_at: "2026-08-31";
        readonly decision_ref: "docs/product-identity-and-namespace-migration-appendix.md@0.4.1";
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
export declare const LEGACY_PRODUCT_IDENTITY: {
    readonly display_name: "Ramsden";
    readonly slug: "ramsden";
    readonly package_scope: "@ramsden";
    readonly command: "ramsden";
    readonly environment_prefix: "RAMSDEN_";
    readonly local_data_directory: ".ramsden";
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
/** The identity every new surface carries. The cutover is complete, so no clock is consulted. */
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
