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
    next_steps: string[];
    scaffold_ref: string;
}
export interface ProjectScaffoldOptions {
    name?: string;
    version?: string;
    form?: AuthoringSourceForm;
}
export declare function scaffoldProject(options?: ProjectScaffoldOptions): AuthoringScaffold;
export declare function scaffoldSkill(name?: string, version?: string): AuthoringScaffold;
export declare function scaffoldTool(name?: string, version?: string): AuthoringScaffold;
export declare function scaffoldValidator(name?: string, version?: string): AuthoringScaffold;
export declare function scaffoldDomainPack(name?: string, version?: string): AuthoringScaffold;
export declare function scaffoldBindingProfile(name?: string, version?: string): AuthoringScaffold;
export declare function authoringScaffold(kind: AuthoringScaffoldKind, name?: string, options?: {
    version?: string;
    form?: AuthoringSourceForm;
}): AuthoringScaffold;
export declare function scaffoldBytes(scaffold: AuthoringScaffold): string;
