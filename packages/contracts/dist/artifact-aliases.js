/**
 * Run-local intake artifact aliases.
 *
 * What this is: the short name format and pure resolution against the exact
 * immutable input descriptors already pinned into one run manifest.
 *
 * How it fits: models never need to copy digest-bearing artifact handles.
 * Resolution has no global lookup, so an alias cannot cross a run or tenant.
 */
export const INPUT_ARTIFACT_ALIAS_PATTERN = /^[a-z][a-z0-9-]{0,62}$/;
/** Resolve only a short alias from one run's pinned immutable input list. */
export function resolveInputArtifactAlias(inputs, alias) {
    if (!INPUT_ARTIFACT_ALIAS_PATTERN.test(alias))
        return null;
    const matches = inputs.filter((input) => input.alias === alias);
    return matches.length === 1 ? matches[0] : null;
}
