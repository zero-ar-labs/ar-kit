import type { Diagnostic } from './diagnostics.js';
import type { ProductSourceApiVersion } from './vocab.js';
export type ProductProjectTemplateIdentity = 'legacy' | 'successor';
export type ProductProjectTemplateRole = 'agent-source' | 'instructions' | 'project-manifest';
export type LegacyProductSurfaceKind = 'command' | 'package' | 'environment' | 'local-data' | 'source-api' | 'run-bundle' | 'sbom' | 'project-manifest' | 'deployment-identifier' | 'egress-destination' | 'telemetry';
export interface ProductProjectTemplateOptions {
    agent_name?: string;
    agent_version?: string;
}
export interface ProductProjectTemplateFile {
    path: string;
    role: ProductProjectTemplateRole;
    identity: ProductProjectTemplateIdentity;
    content: string;
}
export interface ProductProjectTemplate {
    identity: ProductProjectTemplateIdentity;
    source_api_version: ProductSourceApiVersion;
    command: string;
    environment_prefix: string;
    local_data_directory: string;
    project_file: string;
    start_command: string;
    files: ProductProjectTemplateFile[];
}
export interface LegacyProductSurfaceDiagnosticOptions {
    surface: LegacyProductSurfaceKind;
    found: string;
    still_works?: boolean;
    support_ends?: string | null;
    migration_action?: string;
}
export declare function productProjectTemplate(options?: ProductProjectTemplateOptions): ProductProjectTemplate;
export declare function legacyProductSurfaceDiagnostic(options: LegacyProductSurfaceDiagnosticOptions): Diagnostic;
