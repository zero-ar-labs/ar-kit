import type { ProfileCapabilityManifest } from './capability-profile.js';
import type { Profile } from './vocab.js';
export interface ProfileManifestExtension {
    manifest_ref: string;
    extended: boolean;
    breaks: string[];
}
export interface ProfileManifestLineage {
    current?: ProfileCapabilityManifest;
    predecessors?: readonly ProfileCapabilityManifest[];
}
export declare function profileManifestExtension(current: ProfileCapabilityManifest, earlier: ProfileCapabilityManifest): ProfileManifestExtension;
export declare function compatibleProfileManifests(profile: Profile, lineage?: ProfileManifestLineage): ProfileCapabilityManifest[];
export declare function compatibleProfileManifestRefs(profile: Profile, lineage?: ProfileManifestLineage): string[];
