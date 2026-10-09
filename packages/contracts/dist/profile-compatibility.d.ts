/**
 * Profile manifest compatibility for run continuation.
 *
 * What this is: the rule for which profile manifests a destination accepts
 * from an imported run. A destination accepts its own current manifest, and
 * an earlier manifest of the same profile that the current one extends:
 * every capability entry of the earlier manifest appears in the current one
 * with the same state, refusal point, diagnostic code, requirements and
 * vectors. New entries may be added. A changed or removed entry breaks it.
 *
 * How it fits: the earlier manifests are data in profile-manifest-history.ts,
 * checked here each time the rule runs, so no compatible ref is written by
 * hand. A continuation destination puts the result in its binding
 * inventory, and the kernel still matches each required binding exactly.
 */
import type { ProfileCapabilityManifest } from './capability-profile.js';
import type { Profile } from './vocab.js';
/** Whether a current manifest extends one earlier manifest, and what breaks it when not. */
export interface ProfileManifestExtension {
    manifest_ref: string;
    extended: boolean;
    /** One line per problem, empty when the earlier manifest is extended. */
    breaks: string[];
}
/** Optional replacements for the contracts manifest and the stored history, for a destination or a proof. */
export interface ProfileManifestLineage {
    current?: ProfileCapabilityManifest;
    predecessors?: readonly ProfileCapabilityManifest[];
}
/** Check that `current` extends `earlier` under the compatible-match rule. */
export declare function profileManifestExtension(current: ProfileCapabilityManifest, earlier: ProfileCapabilityManifest): ProfileManifestExtension;
/**
 * The manifests a destination running `profile` accepts: its current
 * manifest first, then each earlier manifest the current one extends, oldest
 * first. An earlier manifest the current one does not extend is left out.
 */
export declare function compatibleProfileManifests(profile: Profile, lineage?: ProfileManifestLineage): ProfileCapabilityManifest[];
/** The profile manifest refs a destination running `profile` lists in its continuation inventory. */
export declare function compatibleProfileManifestRefs(profile: Profile, lineage?: ProfileManifestLineage): string[];
