import type { EffectAuthorityDecision, EffectState, FailureClass, ItemState, ValidatorCatalogueEntry, ValidatorClass } from '@zero-ar/contracts';
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
export declare const VALIDATOR_FINDINGS: readonly ["pass", "reject", "indeterminate"];
export type ValidatorFindingKind = (typeof VALIDATOR_FINDINGS)[number];
export interface ExaminedAnswer {
    question: string;
    choices: readonly string[] | null;
    answer: string;
    resolver: string;
    settled_seq: number;
}
export interface ExaminedItem {
    item_id: string;
    state: ItemState;
    attempts: number;
    output: string | null;
    settled_by?: string;
    answers?: readonly ExaminedAnswer[];
}
export interface ExaminedWorkspaceOutput {
    tool: string;
    command: string;
    exit_code: number | null;
    stdout: string;
    stdout_content_hash: string;
}
export interface ExaminedEffect {
    effect_id: string;
    target: string;
    operation: string;
    params: Record<string, unknown>;
    state: EffectState;
    decision: EffectAuthorityDecision | null;
    reason: string | null;
}
export interface ExaminedWebPage {
    url: string;
    title: string;
    fetched_at: string;
    text: string;
    content_hash: string;
}
export interface ExaminedDocumentPage {
    source_alias: string;
    locator: string;
    page: number;
    method: string;
    confidence: number | null;
    text: string;
    text_content_hash: string;
}
export interface ValidatorCaseInput {
    run_id: string;
    rule: string;
    items: readonly ExaminedItem[];
    declared_total: number;
    documents?: readonly ExaminedDocumentPage[];
    documents_truncated?: boolean;
    effects?: readonly ExaminedEffect[];
    effects_truncated?: boolean;
    workspace_outputs?: readonly ExaminedWorkspaceOutput[];
    workspace_outputs_truncated?: boolean;
    web_pages?: readonly ExaminedWebPage[];
    web_pages_truncated?: boolean;
}
export interface ValidatorCaseFinding {
    verdict: ValidatorFindingKind;
    reason: string;
    rejected_items?: readonly string[];
    undecided_items?: readonly string[];
    failure_class?: FailureClass;
}
export interface ExaminedManifest {
    input_hash: string;
    items: number;
    declared_total: number;
    partial: boolean;
}
export interface ValidatorDefinition {
    name: string;
    version: string;
    description: string;
    class: ValidatorClass;
    can_answer_indeterminate: true;
    catalogue_entry: ValidatorCatalogueEntry;
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
export interface ValidatorEvaluationContext {
    signal: AbortSignal;
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
export interface ValidatorImplementation {
    name: string;
    version: string;
    class: ValidatorClass;
    catalogue_entry?: ValidatorCatalogueEntry;
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
export interface DefinedValidator extends ValidatorImplementation {
    catalogue_entry: ValidatorCatalogueEntry;
    manifest: ValidatorManifest;
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding>;
    examined(input: ValidatorCaseInput): ExaminedManifest;
}
export declare function examinedManifest(input: ValidatorCaseInput): ExaminedManifest;
export declare function defineValidator(definition: ValidatorDefinition): DefinedValidator;
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
export declare function runLabelledCases(validator: DefinedValidator, cases: readonly LabelledCase[]): Promise<CaseOutcome[]>;
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
export declare function jsonShapeValidator(name: string, version: string, schema: BoundedJsonObjectSchema): DefinedValidator;
export declare function uniquenessValidator(name: string, version: string, key: string): DefinedValidator;
export declare function referentialIntegrityValidator(name: string, version: string, key: string, reference: string): DefinedValidator;
export declare function arithmeticReconciliationValidator(name: string, version: string, totalField: string, componentsField: string, tolerance?: number): DefinedValidator;
export declare function artifactManifestValidator(name: string, version: string): DefinedValidator;
