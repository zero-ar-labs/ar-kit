import type { IntakeRequest, PublicationBundleManifest, Posture, ValidatorAvailabilitySnapshot, VerificationCheckpointInput, VerificationPlan } from '@zero-ar/contracts';
export interface CompiledBundle {
    bundle: PublicationBundleManifest;
    blobs: Map<string, string>;
}
export interface PublicationVerificationPreviewInput {
    budgets: IntakeRequest['budgets'];
    availability: ValidatorAvailabilitySnapshot;
    profile_manifest: import('@zero-ar/contracts').ProfileCapabilitySummary;
    items_declared: number;
    checkpoint?: VerificationCheckpointInput;
    posture?: {
        ref: string;
        configuration: Posture;
    } | null;
}
export declare function compileProject(sourcePath: string): Promise<CompiledBundle>;
export declare function compileAuthoringSource(sourcePath: string): Promise<CompiledBundle>;
export declare function compileSkill(directoryPath: string, selectedVersion?: string): Promise<CompiledBundle>;
export interface ExportedAgentSkill {
    name: string;
    version: string;
    package_ref: string;
    files: Map<string, string>;
}
export interface SkillLock {
    schema: 'zero-ar-skill-lock/v1';
    procedure_ref: string;
    activation: 'progressive' | 'always';
    files: {
        path: string;
        content_ref: string;
    }[];
}
export declare function skillLock(compiled: CompiledBundle): SkillLock;
export declare function exportAgentSkill(archive: {
    bundle: PublicationBundleManifest;
    blobs: Map<string, string> | Record<string, string>;
}, procedureRef?: string): ExportedAgentSkill;
export { verifyBundle } from '@zero-ar/contracts';
export declare function renderPlan(compiled: CompiledBundle): string;
export declare function previewPublicationVerificationPlan(compiled: CompiledBundle, input: PublicationVerificationPreviewInput): VerificationPlan;
