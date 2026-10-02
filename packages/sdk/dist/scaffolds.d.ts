/**
 * Deterministic authoring scaffolds for projects and public extensions.
 *
 * What this is: byte-stable source templates using only public Zero-AR
 * packages. Each template names its package choices, immutable binding
 * inputs and validation command. The CLI writes these bytes without
 * adding timestamps, host paths or generated identifiers.
 *
 * How it fits: scaffolding is authoring-time work. Generated tools and
 * validators run through their public kits in child hosts; skills remain
 * inert data; domain packs compose public declarations only.
 */
import type { AuthoringScaffoldKind, AuthoringSourceForm } from '@zero-ar/contracts';
export interface ScaffoldFile {
    path: string;
    content: string;
    executable?: boolean;
}
export interface AuthoringScaffold {
    schema: 'zero-ar-authoring-scaffold/v1';
    kind: AuthoringScaffoldKind;
    name: string;
    files: ScaffoldFile[];
    /** Human-readable commands rendered by the CLI after writing the files. */
    next_steps: string[];
    scaffold_ref: string;
}
export interface ProjectScaffoldOptions {
    name?: string;
    version?: string;
    form?: AuthoringSourceForm;
}
/** One minimal project. Its agent receives no ambient tools or workspace capabilities. */
export declare function scaffoldProject(options?: ProjectScaffoldOptions): AuthoringScaffold;
/** A standards-shaped Agent Skill with progressive disclosure and an immutable source lock. */
export declare function scaffoldSkill(name?: string, version?: string): AuthoringScaffold;
/** A bounded typed tool and its out-of-process JSON-lines host. */
export declare function scaffoldTool(name?: string, version?: string): AuthoringScaffold;
/** A typed validator with labelled cases and a process-host binding identity. */
export declare function scaffoldValidator(name?: string, version?: string): AuthoringScaffold;
/** A public-SDK domain pack declaring all five machine-claim categories. */
export declare function scaffoldDomainPack(name?: string, version?: string): AuthoringScaffold;
/** A reviewed binding profile. No workspace capability is created until an agent selects it. */
export declare function scaffoldBindingProfile(name?: string, version?: string): AuthoringScaffold;
/** Select a scaffold by its contracts-owned kind vocabulary. */
export declare function authoringScaffold(kind: AuthoringScaffoldKind, name?: string, options?: {
    version?: string;
    form?: AuthoringSourceForm;
}): AuthoringScaffold;
/** Canonical bytes make repeated generation directly comparable. */
export declare function scaffoldBytes(scaffold: AuthoringScaffold): string;
