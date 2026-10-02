/**
 * The publication compiler (hosted-publication appendix, phase HP0).
 *
 * What this is: compileProject turns one authored project, YAML or
 * TypeScript rooted, into a deterministic PublicationBundle: canonical
 * declarations, content-addressed assets, complete typed edges, and a
 * bundle ref that is a pure function of the source bytes. verifyBundle
 * recomputes every hash and closure edge, so tampering refuses before
 * any commit (PUB-001, PUB-002, PUB-004).
 *
 * How it fits: this is mechanism, not policy. Nothing here talks to a
 * server, executes a procedure, or grants authority; globs expand and
 * die here, paths stay relative, and a procedure compiles inert
 * (PUB-010, PUB-011).
 */
import type { IntakeRequest, PublicationBundleManifest, Posture, ValidatorAvailabilitySnapshot, VerificationCheckpointInput, VerificationPlan } from '@zero-ar/contracts';
export interface CompiledBundle {
    bundle: PublicationBundleManifest;
    /** Every byte the closure needs, keyed by content ref: declarations as canonical JSON, assets verbatim. */
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
/**
 * Compile one project rooted at an agent source into its complete,
 * deterministic publication bundle. Identical source bytes give an
 * identical bundle_ref; nothing here reads a clock or an absolute path
 * into the output.
 */
export declare function compileProject(sourcePath: string): Promise<CompiledBundle>;
/** Compile an agent, standard skill or standalone public extension through one entry point. */
export declare function compileAuthoringSource(sourcePath: string): Promise<CompiledBundle>;
/** Compile one reusable standard Agent Skill with no wrapper manifest. */
export declare function compileSkill(directoryPath: string, selectedVersion?: string): Promise<CompiledBundle>;
export interface ExportedAgentSkill {
    name: string;
    version: string;
    /** The generated procedure ref is the stable identity of the complete package bytes and paths. */
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
/** Derive the source lock for one compiled Agent Skill. */
export declare function skillLock(compiled: CompiledBundle): SkillLock;
/** Recover a standard Agent Skill directory from a publication archive without rewriting source bytes. */
export declare function exportAgentSkill(archive: {
    bundle: PublicationBundleManifest;
    blobs: Map<string, string> | Record<string, string>;
}, procedureRef?: string): ExportedAgentSkill;
export { verifyBundle } from '@zero-ar/contracts';
/** The readable dry-run plan: what would publish, and what that would not establish. */
export declare function renderPlan(compiled: CompiledBundle): string;
/**
 * Publication preflight over exact caller-supplied deployment and budget
 * snapshots. It reads only the already-compiled closure and calls the same
 * pure compiler used at runtime.
 */
export declare function previewPublicationVerificationPlan(compiled: CompiledBundle, input: PublicationVerificationPreviewInput): VerificationPlan;
