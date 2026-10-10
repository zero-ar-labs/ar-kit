export const INPUT_ARTIFACT_ALIAS_PATTERN = /^[a-z][a-z0-9-]{0,62}$/;
export function resolveInputArtifactAlias(inputs, alias) {
    if (!INPUT_ARTIFACT_ALIAS_PATTERN.test(alias))
        return null;
    const matches = inputs.filter((input) => input.alias === alias);
    return matches.length === 1 ? matches[0] : null;
}
