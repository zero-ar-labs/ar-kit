/**
 * Canonical validator catalogue identity and admission.
 *
 * Catalogue declarations are inert, content-addressed data. They describe
 * one exact implementation or factory and the evidence observed around it;
 * they cannot designate task-contract sufficiency or execute a validator.
 */
import type { ValidatorAvailabilitySnapshot, ValidatorCatalogueEntry, ValidatorCatalogueEntryBody, ValidatorEvidenceGrade } from '@zero-ar/contracts';
export type ValidatorCatalogueEntrySource = Omit<ValidatorCatalogueEntryBody, 'schema' | 'evidence_grade'>;
/** Evidence grade is derived from named evidence; callers never assign it. */
export declare function deriveValidatorEvidenceGrade(entry: Pick<ValidatorCatalogueEntryBody, 'finding_contract' | 'evidence'>): ValidatorEvidenceGrade;
/** Admit one exact catalogue declaration and seal its content identity. */
export declare function defineCatalogueEntry(source: ValidatorCatalogueEntrySource): ValidatorCatalogueEntry;
/** Re-validate a transported entry, including its derived grade and ref. */
export declare function admitCatalogueEntry(input: unknown): ValidatorCatalogueEntry;
export interface AvailabilityInput {
    entry: ValidatorCatalogueEntry;
    available: boolean;
    host_boundary: string;
    host_protocol?: string;
    bundle_ref?: string | null;
    artifact_reader_available?: boolean;
    oracle_ref?: string | null;
    sampling_frame_ref?: string | null;
    unmet_dependencies?: readonly string[];
}
/** Seal mutable deployment availability into one immutable snapshot. */
export declare function defineAvailabilitySnapshot(deployment: string, inputs: readonly AvailabilityInput[]): ValidatorAvailabilitySnapshot;
/** Re-validate availability bytes without discovery or a runtime read. */
export declare function admitAvailabilitySnapshot(input: unknown): ValidatorAvailabilitySnapshot;
/** Shared complete defaults for bounded item validators. */
export declare function catalogueDefaults(): Pick<ValidatorCatalogueEntrySource, 'finding_contract' | 'input_contract' | 'cost_envelope' | 'evidence' | 'runtime_needs'>;
/** A stable evidence ref for repository-bound first-party proof declarations. */
export declare function catalogueEvidenceRef(entrypoint: string, evidence: string): string;
export interface FirstPartyCatalogueInput {
    name: string;
    version: string;
    class?: 'deterministic' | 'sampled-oracle' | 'heuristic' | 'named-human';
    entrypoint: string;
    /** Stable description of the shipped implementation or configured factory. */
    implementation_identity: Record<string, unknown>;
    factory_identity?: Record<string, unknown>;
    rule_kinds: string[];
    limitations: string[];
    population?: 'full' | 'sampled';
    dependencies?: ('artifact-reader' | 'domain-oracle' | 'named-human')[];
    artifact_reader?: boolean;
    named_human_class?: string | null;
    oracle_ref?: string | null;
    sampling_frame_ref?: string | null;
    sampling_assumption?: string | null;
    wall_ms?: number;
    evidence_boundary?: string;
}
export interface CustomCatalogueInput {
    name: string;
    version: string;
    class: 'deterministic' | 'sampled-oracle' | 'heuristic' | 'named-human';
    description_boundary: string;
    implementation_ref?: string;
    implementation_identity?: Record<string, unknown>;
    factory_ref?: string | null;
    entrypoint: string;
    rule_kinds: string[];
    limitations: string[];
    wall_ms: number;
    evidence?: ValidatorCatalogueEntryBody['evidence'];
    runtime_needs?: Partial<ValidatorCatalogueEntryBody['runtime_needs']>;
}
/** Compact custom-validator authoring over the same canonical entry contract. */
export declare function defineCustomCatalogueEntry(input: CustomCatalogueInput): ValidatorCatalogueEntry;
/**
 * Seal the compact first-party catalogue with independently visible evidence
 * dimensions. The named VG0 vectors execute the cases these refs identify.
 */
export declare function defineFirstPartyCatalogueEntry(input: FirstPartyCatalogueInput): ValidatorCatalogueEntry;
/** Canonical bytes are useful for catalogue/API equality checks. */
export declare function canonicalCatalogueEntry(entry: ValidatorCatalogueEntry): string;
