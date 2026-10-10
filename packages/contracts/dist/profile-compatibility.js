import { canonicalJson } from "./canonical.js";
import { compileProfileCapabilityManifest, profileCapabilityManifestFor, profileCapabilityManifestRef, ProfileCapabilityManifestSchema } from "./capability-profile.js";
import { refuse } from "./diagnostics.js";
import { PROFILE_MANIFEST_PREDECESSORS } from "./profile-manifest-history.js";
const KEPT_ENTRY_FIELDS = ['state', 'refusal_point', 'diagnostic_code', 'requirements', 'vectors'];
export function profileManifestExtension(current, earlier) {
    const manifest_ref = String(earlier.manifest_ref);
    if (!ProfileCapabilityManifestSchema.safeParse(earlier).success) {
        return { manifest_ref, extended: false, breaks: ['the earlier manifest uses a capability, state or field outside the current contracts vocabulary'] };
    }
    const breaks = [];
    if (earlier.profile !== current.profile)
        breaks.push(`the earlier manifest describes profile ${earlier.profile}, not ${current.profile}`);
    if (earlier.schema !== current.schema)
        breaks.push(`the earlier manifest uses schema ${earlier.schema}, not ${current.schema}`);
    if (profileCapabilityManifestRef(earlier) !== earlier.manifest_ref)
        breaks.push(`the earlier manifest material does not hash to ${earlier.manifest_ref}`);
    const currentEntries = new Map(current.capabilities.map((entry) => [entry.capability, entry]));
    for (const entry of earlier.capabilities) {
        const now = currentEntries.get(entry.capability);
        if (!now) {
            breaks.push(`the current manifest removes ${entry.capability}`);
            continue;
        }
        const changed = KEPT_ENTRY_FIELDS.filter((field) => canonicalJson(entry[field]) !== canonicalJson(now[field]));
        if (changed.length > 0)
            breaks.push(`the current manifest changes the ${changed.join(', ')} of ${entry.capability}`);
    }
    return { manifest_ref, extended: breaks.length === 0, breaks };
}
export function compatibleProfileManifests(profile, lineage = {}) {
    const current = compileProfileCapabilityManifest(lineage.current ?? profileCapabilityManifestFor(profile));
    if (current.profile !== profile) {
        refuse({
            code: 'capability-profile.profile-mismatch',
            message: `the current manifest ${current.manifest_id} describes profile ${current.profile}, but compatibility was asked for ${profile}. Pass the manifest of the profile the destination runs.`,
            clause: 'ODX-007',
        });
    }
    const compatible = [current];
    for (const earlier of lineage.predecessors ?? PROFILE_MANIFEST_PREDECESSORS[profile]) {
        if (compatible.some((manifest) => manifest.manifest_ref === earlier.manifest_ref))
            continue;
        if (profileManifestExtension(current, earlier).extended)
            compatible.push(earlier);
    }
    return compatible;
}
export function compatibleProfileManifestRefs(profile, lineage = {}) {
    return compatibleProfileManifests(profile, lineage).map((manifest) => manifest.manifest_ref);
}
