/**
 * @zero-ar/validator-kit: declaring a validator and proving it on cases.
 *
 * What this is: one typed declaration for a validator, the content-addressed
 * manifest of what it examined, fixtures that run labelled cases against
 * it, and the two pure checkers domain packs build on: claim grounding and
 * the classification airlock. A validator states what it found. It never
 * promotes a run to complete and never touches runtime state, so nothing
 * here reaches a kernel, a store or a projection.
 *
 * How it fits: ERD 16.3 names validator-kit a supported public package and
 * says domain packs depend on it, so the item a validator examines carries
 * the same fields the quality plane's ledger holds. The runner in the
 * quality plane remains the seam that admits a finding; this package only
 * helps an author write one and test it out of process.
 */
import { VALIDATOR_CLASSES, contentHash, refuse } from '@zero-ar/contracts';
export { CorpusStore, GROUNDING_LIMIT, groundClaims, groundedClaims } from "./grounding.js";
export { airlockExtract, assertLevel, classifiedDerivation, conformAirlockValue, declareAirlockType, joinClassification } from "./classification.js";
const NAME = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
/** The three answers a validator may give. Nothing here says complete. */
export const VALIDATOR_FINDINGS = ['pass', 'reject', 'indeterminate'];
/** The manifest of exactly what was placed before a validator. */
export function examinedManifest(input) {
    return {
        input_hash: contentHash(input),
        items: input.items.length,
        declared_total: input.declared_total,
        partial: input.items.length < input.declared_total,
    };
}
/** Declare one validator. The declaration is the whole contract. */
export function defineValidator(definition) {
    if (!NAME.test(definition.name)) {
        refuse({ code: 'validator.name.invalid', message: `validator name ${definition.name} does not fit lowercase dot-separated naming.`, fix: 'a name like schema.rows-present' });
    }
    if (!VERSION.test(definition.version)) {
        refuse({ code: 'validator.version.invalid', message: `validator version ${definition.version} is not semantic versioning.`, fix: '1.0.0' });
    }
    if (!VALIDATOR_CLASSES.includes(definition.class)) {
        refuse({ code: 'validator.class.unknown', message: `validator class ${definition.class} is not a declared class.`, fix: VALIDATOR_CLASSES.join(', ') });
    }
    if (definition.can_answer_indeterminate !== true) {
        refuse({
            code: 'validator.indeterminate.absent',
            message: `validator ${definition.name} declares it cannot answer indeterminate.`,
            fix: 'a validator that must answer pass or reject answers pass when it does not know, so declare can_answer_indeterminate true and return indeterminate where the evidence does not decide',
        });
    }
    const manifest = {
        kind: 'validator',
        name: definition.name,
        version: definition.version,
        description: definition.description,
        class: definition.class,
        findings: VALIDATOR_FINDINGS,
    };
    return {
        manifest,
        name: definition.name,
        version: definition.version,
        class: definition.class,
        examined: (input) => examinedManifest(input),
        evaluate: async (input) => {
            const finding = await definition.evaluate(input);
            if (!VALIDATOR_FINDINGS.includes(finding.verdict)) {
                refuse({
                    code: 'validator.finding.unknown',
                    message: `validator ${definition.name} answered ${finding.verdict}, which is not a finding a validator may give.`,
                    fix: VALIDATOR_FINDINGS.join(', '),
                });
            }
            if (finding.verdict === 'reject' && (finding.rejected_items?.length ?? 0) === 0) {
                refuse({
                    code: 'validator.reject.unnamed',
                    message: `validator ${definition.name} rejected without naming an item.`,
                    fix: 'name the rejected items, because a rejection nobody can locate cannot be repaired',
                });
            }
            return finding;
        },
    };
}
/**
 * Run labelled cases against a validator and report each outcome. This
 * compares answers; it does not decide whether the validator is good enough,
 * which is a judgement its author records against the declared class.
 */
export async function runLabelledCases(validator, cases) {
    const outcomes = [];
    for (const item of cases) {
        const finding = await validator.evaluate(item.input);
        outcomes.push({
            label: item.label,
            expected: item.expect,
            actual: finding.verdict,
            agreed: finding.verdict === item.expect,
            examined: validator.examined(item.input),
        });
    }
    return outcomes;
}
/** Build a worked item for a labelled case without spelling every field. */
export function examinedItem(item_id, output, state = 'completed_unverified', attempts = 1) {
    return { item_id, state, attempts, output };
}
