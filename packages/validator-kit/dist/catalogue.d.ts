import type { ValidatorAvailabilitySnapshot, ValidatorCatalogueEntry, ValidatorCatalogueEntryBody, ValidatorEvidenceGrade } from '@zero-ar/contracts';
export type ValidatorCatalogueEntrySource = Omit<ValidatorCatalogueEntryBody, 'schema' | 'evidence_grade'>;
export declare function deriveValidatorEvidenceGrade(entry: Pick<ValidatorCatalogueEntryBody, 'finding_contract' | 'evidence'>): ValidatorEvidenceGrade;
export declare function defineCatalogueEntry(source: ValidatorCatalogueEntrySource): ValidatorCatalogueEntry;
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
export declare function defineAvailabilitySnapshot(deployment: string, inputs: readonly AvailabilityInput[]): ValidatorAvailabilitySnapshot;
export declare function admitAvailabilitySnapshot(input: unknown): ValidatorAvailabilitySnapshot;
export declare function catalogueDefaults(): Pick<ValidatorCatalogueEntrySource, 'finding_contract' | 'input_contract' | 'cost_envelope' | 'evidence' | 'runtime_needs'>;
export declare function catalogueEvidenceRef(entrypoint: string, evidence: string): string;
export interface FirstPartyCatalogueInput {
    name: string;
    version: string;
    class?: 'deterministic' | 'sampled-oracle' | 'heuristic' | 'named-human';
    entrypoint: string;
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
export declare function defineCustomCatalogueEntry(input: CustomCatalogueInput): ValidatorCatalogueEntry;
export declare function defineFirstPartyCatalogueEntry(input: FirstPartyCatalogueInput): ValidatorCatalogueEntry;
export declare function canonicalCatalogueEntry(entry: ValidatorCatalogueEntry): string;
