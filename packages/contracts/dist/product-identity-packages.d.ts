import type { PackageDistribution, ProductPackageGraphState, ProductPackageImplementationIdentity } from './vocab.js';
export declare const PRODUCT_PACKAGE_GRAPH_PROTOCOL: "product-package-graph/v1";
export interface ProductPackageIdentity {
    workspace_path: string;
    legacy_name: string;
    successor_name: string;
    distribution: PackageDistribution;
}
export interface ProductPackageGraphNode {
    name: string;
    implementation_identity?: ProductPackageImplementationIdentity;
    package_ref?: string;
}
export type ProductPackageGraphInput = readonly (string | ProductPackageGraphNode)[];
export interface ProductPackageGraphOptions {
    require_complete_release?: boolean;
    require_legacy_wrappers?: boolean;
}
export interface ProductPackageGraphReport {
    protocol: typeof PRODUCT_PACKAGE_GRAPH_PROTOCOL;
    source_ref: string;
    graph_ref: string;
    state: ProductPackageGraphState;
    product_package_count: number;
    legacy_packages: string[];
    successor_packages: string[];
    legacy_wrappers: string[];
    missing_legacy_packages: string[];
    missing_successor_packages: string[];
}
export declare const PRODUCT_PACKAGE_MATRIX: readonly [ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity, ProductPackageIdentity];
export declare function productPackageMatrix(): ProductPackageIdentity[];
export declare function productPackageGraphIdentity(): {
    protocol: typeof PRODUCT_PACKAGE_GRAPH_PROTOCOL;
    source_ref: string;
    graph_ref: string;
};
export declare function productPackageGraphReport(input: ProductPackageGraphInput, options?: ProductPackageGraphOptions): ProductPackageGraphReport;
export declare function assertProductPackageGraph(input: ProductPackageGraphInput, options?: ProductPackageGraphOptions): ProductPackageGraphReport;
