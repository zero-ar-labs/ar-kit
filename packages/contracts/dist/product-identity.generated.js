export const PRODUCT_IDENTITY_SOURCE = 'PRODUCT_IDENTITY.yaml';
export const PRODUCT_IDENTITY_SOURCE_REF = 'sha256:46fb9415570c213db5eb10224ae2c19b6b9daa86111b714ad1f6dfdf8faaf2de';
const IDENTITY_ARTIFACT = {
    "schema": "product-identity/v2",
    "status": "current",
    "version": "2.0.0",
    "current": {
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
        "ratified_at": "2026-10-14",
        "decision_ref": "docs/product-identity-and-namespace-migration-appendix.md@0.5.0",
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
export const PRODUCT_IDENTITY = { ...IDENTITY_ARTIFACT, successor: IDENTITY_ARTIFACT.current };
export const CURRENT_PRODUCT_IDENTITY = PRODUCT_IDENTITY.current;
export const SUCCESSOR_PRODUCT_IDENTITY = CURRENT_PRODUCT_IDENTITY;
export const PRODUCT_IDENTITY_MIGRATION = PRODUCT_IDENTITY.migration;
export function activeProductIdentity() {
    return SUCCESSOR_PRODUCT_IDENTITY;
}
export function newSurfaceProductIdentity() {
    return SUCCESSOR_PRODUCT_IDENTITY;
}
