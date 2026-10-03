/**
 * @zero-ar/validator-kit: declaring a validator and proving it on cases.
 *
 * What this is: one typed declaration for a validator, the content-addressed
 * manifest of what it examined, fixtures that run labelled cases against
 * it, and the pure checkers domain packs build on: claim grounding, the
 * classification airlock and sequential sampling. A validator states what
 * it found. It never promotes a run to complete and never touches runtime
 * state, so nothing here reaches a kernel, a store or a projection.
 *
 * How it fits: ERD 16.3 names validator-kit a supported public package and
 * says domain packs depend on it, so the item a validator examines carries
 * the same fields the quality plane's ledger holds. The runner in the
 * quality plane remains the seam that admits a finding; this package only
 * helps an author write one and test it out of process.
 */
import type { FailureClass, ItemState, ValidatorCatalogueEntry, ValidatorClass } from '@zero-ar/contracts';
export { validatorFindingProblem } from './finding.js';
export type { ValidatorFindingProblem } from './finding.js';
export { admitAvailabilitySnapshot, admitCatalogueEntry, canonicalCatalogueEntry, catalogueDefaults, catalogueEvidenceRef, defineAvailabilitySnapshot, defineCatalogueEntry, defineCustomCatalogueEntry, defineFirstPartyCatalogueEntry, deriveValidatorEvidenceGrade, } from './catalogue.js';
export type { AvailabilityInput, CustomCatalogueInput, FirstPartyCatalogueInput, ValidatorCatalogueEntrySource } from './catalogue.js';
export { ATTENTION_NOT_EVALUATED, compileVerificationPlan, defineVerificationAttentionCapacitySnapshot, defineVerificationCheckpointInput, renderVerificationPlan, selectValidatorInvocations, selectedValidatorCost, verificationCheckpointInputForContract, } from './verification-plan.js';
export type { ControlledVerificationCheckpoint, SelectedValidatorInvocation } from './verification-plan.js';
export { SEQUENTIAL_MAX_SAMPLE, sampledFindingProblem, sequentialBoundaryTrace, sequentialErrorGuarantee, sequentialFrameHash, sequentialGuaranteeStatement, sequentialSampledValidator, sequentialSamplingFrame, } from './sequential.js';
export type { SampledFindingContext, SequentialBoundaryTrace, SequentialErrorAssumption, SequentialErrorGuarantee, SequentialFinding, SequentialSamplingConfig, SequentialSamplingModel, } from './sequential.js';
export { CorpusStore, GROUNDING_LIMIT, groundClaims, groundedClaims } from './grounding.js';
export type { GroundingReport, SpanResolution, SpanResolver } from './grounding.js';
export { airlockExtract, assertLevel, classifiedDerivation, conformAirlockValue, declareAirlockType, joinClassification } from './classification.js';
export type { AirlockField, AirlockType, ClassificationLattice } from './classification.js';
/** The three answers a validator may give. Nothing here says complete. */
export declare const VALIDATOR_FINDINGS: readonly ["pass", "reject", "indeterminate"];
export type ValidatorFindingKind = (typeof VALIDATOR_FINDINGS)[number];
/**
 * One item placed before a validator: its ledger position, how many
 * attempts it has taken, and the output the agent produced for it. This is
 * the row the quality plane's ledger holds, so a validator written here
 * runs unchanged inside the runtime's runner.
 */
export interface ExaminedItem {
    item_id: string;
    state: ItemState;
    attempts: number;
    output: string | null;
}
/** What the validator was given. The declared total is what it was told exists. */
export interface ValidatorCaseInput {
    run_id: string;
    rule: string;
    items: readonly ExaminedItem[];
    declared_total: number;
}
/**
 * What the validator found, and why. The reason is required and non-empty.
 * A reject names at least one item it was given and a pass names none;
 * `validatorFindingProblem` states the whole rule the runtime applies.
 */
export interface ValidatorCaseFinding {
    verdict: ValidatorFindingKind;
    reason: string;
    rejected_items?: readonly string[];
    /** Which kind of wrong, so repair knows what it got (Q-10). */
    failure_class?: FailureClass;
}
/** What a validator actually received, content addressed for audit (QLT-005). */
export interface ExaminedManifest {
    input_hash: string;
    items: number;
    declared_total: number;
    /** True when the validator saw fewer items than the run declared exist. */
    partial: boolean;
}
export interface ValidatorDefinition {
    name: string;
    version: string;
    description: string;
    class: ValidatorClass;
    /**
     * Whether this validator can answer indeterminate. A validator that cannot
     * is refused, because one that must answer pass or reject will answer pass
     * when it does not know.
     */
    can_answer_indeterminate: true;
    /** Exact inert catalogue declaration for this implementation or factory. */
    catalogue_entry: ValidatorCatalogueEntry;
    evaluate(input: ValidatorCaseInput): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
export interface ValidatorManifest {
    kind: 'validator';
    name: string;
    version: string;
    description: string;
    class: ValidatorClass;
    findings: readonly ValidatorFindingKind[];
    implementation_ref: string;
    catalogue_entry_ref: string;
}
/**
 * The runtime-facing shape of a validator: what the quality plane's runner
 * registers. A defined validator carries one of these so a pack can hand
 * its validators to a deployment without importing the runtime.
 */
export interface ValidatorImplementation {
    name: string;
    version: string;
    class: ValidatorClass;
    catalogue_entry?: ValidatorCatalogueEntry;
    evaluate(input: ValidatorCaseInput): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
export interface DefinedValidator extends ValidatorImplementation {
    catalogue_entry: ValidatorCatalogueEntry;
    manifest: ValidatorManifest;
    evaluate(input: ValidatorCaseInput): Promise<ValidatorCaseFinding>;
    examined(input: ValidatorCaseInput): ExaminedManifest;
}
/** The manifest of exactly what was placed before a validator. */
export declare function examinedManifest(input: ValidatorCaseInput): ExaminedManifest;
/** Declare one validator. The declaration is the whole contract. */
export declare function defineValidator(definition: ValidatorDefinition): DefinedValidator;
/** One labelled case: the input, and the finding the author expects. */
export interface LabelledCase {
    label: string;
    input: ValidatorCaseInput;
    expect: ValidatorFindingKind;
}
export interface CaseOutcome {
    label: string;
    expected: ValidatorFindingKind;
    actual: ValidatorFindingKind;
    agreed: boolean;
    examined: ExaminedManifest;
}
/**
 * Run labelled cases against a validator and report each outcome. This
 * compares answers; it does not decide whether the validator is good enough,
 * which is a judgement its author records against the declared class.
 *
 * Each case applies the runtime runner's finding rule: the examined manifest
 * and the item population are fixed before the validator runs, the validator
 * receives its own copy of the input, and a malformed finding refuses the
 * case run, so no case reports agreement for a finding the runtime would
 * record as infrastructure indeterminate.
 */
export declare function runLabelledCases(validator: DefinedValidator, cases: readonly LabelledCase[]): Promise<CaseOutcome[]>;
/** Build a worked item for a labelled case without spelling every field. */
export declare function examinedItem(item_id: string, output: string | null, state?: ItemState, attempts?: number): ExaminedItem;
type JsonPrimitiveKind = 'string' | 'number' | 'integer' | 'boolean';
export interface BoundedJsonObjectSchema {
    type: 'object';
    properties: Record<string, {
        type: JsonPrimitiveKind;
    }>;
    required: string[];
    additionalProperties: false;
}
/** Deterministic exact-object JSON shape factory over a deliberately bounded schema subset. */
export declare function jsonShapeValidator(name: string, version: string, schema: BoundedJsonObjectSchema): DefinedValidator;
/** Deterministic uniqueness factory over one exact top-level JSON key. */
export declare function uniquenessValidator(name: string, version: string, key: string): DefinedValidator;
/** Deterministic referential-integrity factory inside one examined JSON population. */
export declare function referentialIntegrityValidator(name: string, version: string, key: string, reference: string): DefinedValidator;
/** Deterministic arithmetic reconciliation over a total and numeric component array. */
export declare function arithmeticReconciliationValidator(name: string, version: string, totalField: string, componentsField: string, tolerance?: number): DefinedValidator;
/** Deterministic manifest reconciliation over declared members and byte totals. */
export declare function artifactManifestValidator(name: string, version: string): DefinedValidator;
