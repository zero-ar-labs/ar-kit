import type { ProfileCapabilityManifest, ProfileCapabilitySummary } from './capability-profile.js';
import type { CapabilityMechanism, ProfileCapability } from './vocab.js';
export declare const CAPABILITY_MECHANISM_MAP: Readonly<Record<ProfileCapability, readonly CapabilityMechanism[]>>;
export declare const FULL_CELL_RELEASE_PROFILE = "full-cell";
export interface CapabilityInventory {
    mechanisms: CapabilityMechanism[];
    implemented: ProfileCapability[];
}
export interface CompiledCapabilityProfile {
    manifest: ProfileCapabilityManifest;
    summary: ProfileCapabilitySummary;
    inventory: CapabilityInventory;
}
export declare function capabilityInventory(constructed: Iterable<CapabilityMechanism>): CapabilityInventory;
export declare function compileCapabilityInventory(manifest: ProfileCapabilityManifest, constructed: Iterable<CapabilityMechanism>, composition: string): CompiledCapabilityProfile;
