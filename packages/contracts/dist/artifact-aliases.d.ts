export declare const INPUT_ARTIFACT_ALIAS_PATTERN: RegExp;
export interface AliasedInputArtifact {
    alias?: string | undefined;
    artifact_ref: string;
    tenant: string;
    content_hash: string;
}
export declare function resolveInputArtifactAlias(inputs: readonly AliasedInputArtifact[], alias: string): AliasedInputArtifact | null;
