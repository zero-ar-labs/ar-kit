/**
 * The product identity project-template policy.
 *
 * Junior guide: a generated project is a writer, and writers emit the
 * successor identity now that the cutover is complete. Keeping the template
 * in contracts lets the CLI, SDK fixtures and release checks agree, and the
 * legacy-surface diagnostic still explains what an old project carries.
 */
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
/** Build the starter project files from the writer policy in one place. */
export declare function productProjectTemplate(options?: ProductProjectTemplateOptions): ProductProjectTemplate;
/** Explain a legacy surface without hiding whether it still works. */
export declare function legacyProductSurfaceDiagnostic(options: LegacyProductSurfaceDiagnosticOptions): Diagnostic;
