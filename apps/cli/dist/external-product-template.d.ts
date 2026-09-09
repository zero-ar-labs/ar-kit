/**
 * The versioned external-product repository template.
 *
 * Junior guide: this module writes application code, not runtime code. Both
 * reference products share the native Zero-AR boundary while keeping their
 * channel, language and projection files different. Dependency overrides let
 * conformance install one exact set of packed release artifacts.
 */
export declare const EXTERNAL_PRODUCT_SCAFFOLD_VERSION: "1.0.0";
export declare const EXTERNAL_PRODUCT_API_VERSION: "v1";
export declare const EXTERNAL_PRODUCT_PACKAGE_VERSION: "0.1.0";
export type ExternalProductFixture = 'facilities-operations' | 'large-corpus-review';
export interface ExternalProductTemplateOptions {
    fixture: ExternalProductFixture;
    package_specs?: Partial<Record<'@zero-ar/contracts' | '@zero-ar/client' | '@zero-ar/sdk', string>>;
    source_commit?: string;
    release_manifest_ref?: string;
}
export interface ExternalProductTemplateFile {
    path: string;
    content: string;
    role: 'configuration' | 'domain' | 'boundary' | 'adapter' | 'projection' | 'presentation' | 'test' | 'documentation';
}
export interface ExternalProductTemplate {
    schema: 'zero-ar-external-product-template/v1';
    scaffold_version: typeof EXTERNAL_PRODUCT_SCAFFOLD_VERSION;
    fixture: ExternalProductFixture;
    files: ExternalProductTemplateFile[];
}
/** Render one complete external repository without touching the filesystem. */
export declare function externalProductTemplate(options: ExternalProductTemplateOptions): ExternalProductTemplate;
