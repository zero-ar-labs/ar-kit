import type { ProductRunBundleFormat, ProductSbomFormat, ProductSourceApiVersion } from './vocab.js';
export declare const LEGACY_SOURCE_API_VERSION: "ramsden/v1";
export declare const SUCCESSOR_SOURCE_API_VERSION: "zero-ar/v1";
export declare const LEGACY_RUN_BUNDLE_FORMAT: "ramsden-run-bundle";
export declare const SUCCESSOR_RUN_BUNDLE_FORMAT: "zero-ar-run-bundle";
export declare const LEGACY_SBOM_FORMAT: "ramsden-sbom-2";
export declare const SUCCESSOR_SBOM_FORMAT: "zero-ar-sbom-1";
export type ProductFormatFamily = 'source-api' | 'run-bundle' | 'sbom';
export type ProductFormatIdentity = 'legacy' | 'successor';
export interface ProductFormatPolicy {
    family: ProductFormatFamily;
    format: ProductSourceApiVersion | ProductRunBundleFormat | ProductSbomFormat;
    identity: ProductFormatIdentity;
    readable: boolean;
    writable_before_cutover: boolean;
    writable_after_cutover: boolean;
}
export declare function productFormatMatrix(): ProductFormatPolicy[];
export declare function sourceApiVersionIdentity(value: string | undefined): ProductFormatIdentity | null;
export declare function productSourceApiVersionReadable(value: string | undefined): value is ProductSourceApiVersion;
export declare function productRunBundleFormatReadable(value: string | undefined): value is ProductRunBundleFormat;
export declare function productSbomFormatReadable(value: string | undefined): value is ProductSbomFormat;
export declare function productWritesUseSuccessor(): boolean;
export declare function activeSourceApiVersion(): ProductSourceApiVersion;
export declare function activeRunBundleFormat(): ProductRunBundleFormat;
export declare function activeSbomFormat(): ProductSbomFormat;
export declare function activeSbomProduct(): 'ramsden' | 'zero-ar';
