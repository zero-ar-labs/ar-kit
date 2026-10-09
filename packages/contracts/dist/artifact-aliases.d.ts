/**
 * Run-local intake artifact aliases.
 *
 * What this is: the short name format and pure resolution against the exact
 * immutable input descriptors already pinned into one run manifest.
 *
 * How it fits: models never need to copy digest-bearing artifact handles.
 * Resolution has no global lookup, so an alias cannot cross a run or tenant.
 */
export declare const INPUT_ARTIFACT_ALIAS_PATTERN: RegExp;
export interface AliasedInputArtifact {
    alias?: string | undefined;
    artifact_ref: string;
    tenant: string;
    content_hash: string;
}
/** Resolve only a short alias from one run's pinned immutable input list. */
export declare function resolveInputArtifactAlias(inputs: readonly AliasedInputArtifact[], alias: string): AliasedInputArtifact | null;
