import type { ProductCliReleaseArtifactKind } from '@zero-ar/contracts';
export type CliReleaseArtifactTarget = 'successor';
export interface CliReleaseArtifact {
    path: string;
    kind: ProductCliReleaseArtifactKind;
    command: string;
    target: CliReleaseArtifactTarget;
    executable: boolean;
    sha256: string;
    content: string;
}
export declare function cliReleaseArtifacts(): CliReleaseArtifact[];
export declare function writeCliReleaseArtifacts(root: string): CliReleaseArtifact[];
export declare const RELEASE_KEY_FINGERPRINT = "7E5FE75754B236B53FDF5A1CA050DB8D0B817918";
