/**
 * The CLI release artifact generator.
 *
 * Junior guide: distribution files are part of the product, not loose docs.
 * This file renders completions, manpages, install scripts, service units and
 * examples from the same command table and identity constants used by the CLI.
 * The release builder writes these files into the attested image output.
 */
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
/** The pinned project release key. The private half never leaves the signing environment. */
export declare const RELEASE_KEY_FINGERPRINT = "7E5FE75754B236B53FDF5A1CA050DB8D0B817918";
