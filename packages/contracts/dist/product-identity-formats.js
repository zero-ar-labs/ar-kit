/**
 * The product identity stored-format policy.
 *
 * Junior guide: a reader can understand more names than a writer emits.
 * The cutover is complete, so every writer emits the successor format and
 * the readers still accept the historical ones. No clock is consulted.
 */
import { PRODUCT_RUN_BUNDLE_FORMATS, PRODUCT_SBOM_FORMATS, PRODUCT_SOURCE_API_VERSIONS, } from "./vocab.js";
export const LEGACY_SOURCE_API_VERSION = 'ramsden/v1';
export const SUCCESSOR_SOURCE_API_VERSION = 'zero-ar/v1';
export const LEGACY_RUN_BUNDLE_FORMAT = 'ramsden-run-bundle';
export const SUCCESSOR_RUN_BUNDLE_FORMAT = 'zero-ar-run-bundle';
export const LEGACY_SBOM_FORMAT = 'ramsden-sbom-2';
export const SUCCESSOR_SBOM_FORMAT = 'zero-ar-sbom-1';
export function productFormatMatrix() {
    return [
        {
            family: 'source-api',
            format: LEGACY_SOURCE_API_VERSION,
            identity: 'legacy',
            readable: true,
            writable_before_cutover: true,
            writable_after_cutover: false,
        },
        {
            family: 'source-api',
            format: SUCCESSOR_SOURCE_API_VERSION,
            identity: 'successor',
            readable: true,
            writable_before_cutover: false,
            writable_after_cutover: true,
        },
        {
            family: 'run-bundle',
            format: LEGACY_RUN_BUNDLE_FORMAT,
            identity: 'legacy',
            readable: true,
            writable_before_cutover: true,
            writable_after_cutover: false,
        },
        {
            family: 'run-bundle',
            format: SUCCESSOR_RUN_BUNDLE_FORMAT,
            identity: 'successor',
            readable: true,
            writable_before_cutover: false,
            writable_after_cutover: true,
        },
        {
            family: 'sbom',
            format: LEGACY_SBOM_FORMAT,
            identity: 'legacy',
            readable: true,
            writable_before_cutover: true,
            writable_after_cutover: false,
        },
        {
            family: 'sbom',
            format: SUCCESSOR_SBOM_FORMAT,
            identity: 'successor',
            readable: true,
            writable_before_cutover: false,
            writable_after_cutover: true,
        },
    ];
}
export function sourceApiVersionIdentity(value) {
    if (value === LEGACY_SOURCE_API_VERSION)
        return 'legacy';
    if (value === SUCCESSOR_SOURCE_API_VERSION)
        return 'successor';
    return null;
}
export function productSourceApiVersionReadable(value) {
    return PRODUCT_SOURCE_API_VERSIONS.includes(value ?? '');
}
export function productRunBundleFormatReadable(value) {
    return PRODUCT_RUN_BUNDLE_FORMATS.includes(value ?? '');
}
export function productSbomFormatReadable(value) {
    return PRODUCT_SBOM_FORMATS.includes(value ?? '');
}
/** The cutover is complete: writers use the successor identifiers, always. */
export function productWritesUseSuccessor() {
    return true;
}
export function activeSourceApiVersion() {
    return SUCCESSOR_SOURCE_API_VERSION;
}
export function activeRunBundleFormat() {
    return SUCCESSOR_RUN_BUNDLE_FORMAT;
}
export function activeSbomFormat() {
    return SUCCESSOR_SBOM_FORMAT;
}
export function activeSbomProduct() {
    return 'zero-ar';
}
