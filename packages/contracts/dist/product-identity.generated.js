/**
 * The generated product identity constants.
 *
 * What this is: the typed projection of PRODUCT_IDENTITY.yaml.
 *
 * How it fits: packages import the successor identity from one generated
 * module; the retired identity stays only so readers of legacy stored
 * formats can name it.
 */
export const PRODUCT_IDENTITY_SOURCE = 'PRODUCT_IDENTITY.yaml';
export const PRODUCT_IDENTITY_SOURCE_REF = 'sha256:08acc193d619e075f9221af22b92d62a604a185ea873eea15cd8e4827bc8dfb3';
export const PRODUCT_IDENTITY = {
    "schema": "product-identity/v1",
    "status": "current",
    "version": "1.0.0",
    "current": {
        "display_name": "Ramsden",
        "slug": "ramsden",
        "package_scope": "@ramsden",
        "command": "ramsden",
        "environment_prefix": "RAMSDEN_",
        "local_data_directory": ".ramsden"
    },
    "successor": {
        "display_name": "Zero-AR",
        "wordmark": "ZERO-AR",
        "expansion": "Zero-layer Autonomous Runtime",
        "pronunciation": "zero A-R",
        "canonical_introduction": "Zero-AR is a log-native runtime for long-horizon agent work.",
        "slug": "zero-ar",
        "package_scope": "@zero-ar",
        "command": "zeroar",
        "environment_prefix": "ZERO_AR_",
        "local_data_directory": ".zero-ar",
        "run_bundle_suffix": ".zeroar.jsonl",
        "kernel": {
            "display_name": "W0 Kernel",
            "slug": "w0"
        }
    },
    "ratification": {
        "authority": "product-owner",
        "selected_at": "2026-08-31",
        "ratified_at": "2026-08-31",
        "decision_ref": "docs/product-identity-and-namespace-migration-appendix.md@0.4.1",
        "external_legal_approval_required": false
    },
    "distribution": {
        "namespace_status": "controlled-activated-channels",
        "controlled_channels": [
            "npm-scope:@zero-ar",
            "source-organization:github:@zero-ar-labs"
        ]
    },
    "migration": {
        "epoch": "cutover-1",
        "compatibility_starts": "2026-09-02T00:00:00Z",
        "new_name_default_from": "2026-09-02T00:00:00Z",
        "legacy_writes_end": "2026-09-02T00:00:00Z",
        "legacy_support_ends": "2026-09-02T00:00:00Z"
    }
};
export const LEGACY_PRODUCT_IDENTITY = PRODUCT_IDENTITY.current;
export const SUCCESSOR_PRODUCT_IDENTITY = PRODUCT_IDENTITY.successor;
export const PRODUCT_IDENTITY_MIGRATION = PRODUCT_IDENTITY.migration;
/** The identity every new surface carries. The cutover is complete, so no clock is consulted. */
export function activeProductIdentity() {
    return SUCCESSOR_PRODUCT_IDENTITY;
}
export function newSurfaceProductIdentity() {
    return SUCCESSOR_PRODUCT_IDENTITY;
}
