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
/** The three answers a validator may give. Nothing here says complete. */
export declare const VALIDATOR_FINDINGS: readonly ["pass", "reject", "indeterminate"];
export type ValidatorFindingKind = (typeof VALIDATOR_FINDINGS)[number];
/** One answer a person gave to the agent's own question on an item (GAP-013). */
export interface ExaminedAnswer {
    question: string;
    choices: readonly string[] | null;
    answer: string;
    /** The principal who answered. */
    resolver: string;
    /** The sequence of the gap.settled record that holds the answer. */
    settled_seq: number;
}
/**
 * One item placed before a validator: its ledger position, how many
 * attempts it has taken, and its output. This is the row the quality
 * plane's ledger holds, so a validator written here runs unchanged inside
 * the runtime's runner. Two optional fields say where the output came
 * from, and are absent when they do not apply.
 */
export interface ExaminedItem {
    item_id: string;
    state: ItemState;
    attempts: number;
    output: string | null;
    /**
     * The principal whose answer is this output, when a person settled the
     * item and the agent has not replaced the output since. Absent when the
     * agent produced it, so agent text never reads as a person's decision.
     */
    settled_by?: string;
    /** The answers to the agent's questions on this item, oldest first. */
    answers?: readonly ExaminedAnswer[];
}
/**
 * One workspace command the run ran and what it printed, as a check that
 * reads workspace output receives it (G22): the pages a browser workspace
 * read, so a check can find a value an item took from a page on that page.
 * Only workspace.exec calls that ran in the run's workspace are given.
 */
export interface ExaminedWorkspaceOutput {
    /** Always workspace.exec. */
    tool: string;
    /** The command the agent ran, as recorded. */
    command: string;
    exit_code: number | null;
    stdout: string;
    /** The SHA-256 of stdout, which the runtime checked any spilled copy against. */
    stdout_content_hash: string;
}
/**
 * One effect the run prepared, as a check that reads effect outcomes
 * receives it (G23): what was asked, whether its approver approved it, and
 * where it stands, so a check never takes an item's word that it was done.
 */
export interface ExaminedEffect {
    effect_id: string;
    target: string;
    operation: string;
    /** The parameters the effect was prepared with, as recorded. */
    params: Record<string, unknown>;
    /** prepared, dispatched, committed, withdrawn, outcome_unknown or unreconcilable. */
    state: EffectState;
    /** The approver's latest decision, or null when none is recorded. */
    decision: EffectAuthorityDecision | null;
    /** The reason its latest resolution gave, or null before one. */
    reason: string | null;
}
/**
 * One page the run fetched with web.fetch, as a check that reads web pages
 * receives it (WEB-017): the whole text, read from its artifact and kept
 * only when it matches its digest.
 */
export interface ExaminedWebPage {
    url: string;
    title: string;
    fetched_at: string;
    text: string;
    /** The SHA-256 the page artifact names, which the runtime checked the text against. */
    content_hash: string;
}
/** One page of a document the run extracted, as a check that reads documents receives it. */
export interface ExaminedDocumentPage {
    source_alias: string;
    /** The document's locator within its source, such as invoice.pdf. */
    locator: string;
    page: number;
    method: string;
    confidence: number | null;
    text: string;
    /** The page text's content hash, which the runtime checked the text against. */
    text_content_hash: string;
}
/** What the validator was given. The declared total is what it was told exists. */
export interface ValidatorCaseInput {
    run_id: string;
    rule: string;
    items: readonly ExaminedItem[];
    declared_total: number;
    /**
     * The text of every page the run extracted, when the task contract asks
     * for document-text: the latest extraction of each document, in source
     * and page order. Absent otherwise.
     */
    documents?: readonly ExaminedDocumentPage[];
    /**
     * True when the pages stopped at the runtime's byte bound or an
     * extraction's result could not be read, so a check knows it did not see
     * every page.
     */
    documents_truncated?: boolean;
    /**
     * Every effect the run prepared, in the order prepared, when the task
     * contract asks for effect-outcomes. Absent otherwise.
     */
    effects?: readonly ExaminedEffect[];
    /**
     * True when the effects stopped at the runtime's byte bound. A check that
     * would pass because an effect is absent answers indeterminate instead,
     * since the effect could lie past the bound.
     */
    effects_truncated?: boolean;
    /**
     * What every workspace.exec command the run ran in its workspace printed,
     * in the order run, when the task contract asks for workspace-output.
     * Absent otherwise.
     */
    workspace_outputs?: readonly ExaminedWorkspaceOutput[];
    /**
     * True when the outputs stopped at the runtime's byte bound or a
     * command's result could not be read.
     */
    workspace_outputs_truncated?: boolean;
    /**
     * The text of every page the run fetched with web.fetch, in the order
     * fetched, when the task contract asks for web-pages. Absent otherwise.
     */
    web_pages?: readonly ExaminedWebPage[];
    /**
     * True when the pages stopped at the runtime's byte bound, or a page could
     * not be read, as after its web content retention ended.
     */
    web_pages_truncated?: boolean;
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
    /**
     * The items an indeterminate finding could not decide, when it can say
     * which. A checkpoint then parks only these and judges the rest again
     * without them; absent, it parks every item it covered.
     */
    undecided_items?: readonly string[];
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
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
/**
 * What the runner hands an evaluation besides its input. The signal aborts
 * when the validator's window closes or its run is cancelled, so work the
 * evaluation started, such as a command, stops with it.
 */
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
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding> | ValidatorCaseFinding;
}
export interface DefinedValidator extends ValidatorImplementation {
    catalogue_entry: ValidatorCatalogueEntry;
    manifest: ValidatorManifest;
    evaluate(input: ValidatorCaseInput, context?: ValidatorEvaluationContext): Promise<ValidatorCaseFinding>;
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
