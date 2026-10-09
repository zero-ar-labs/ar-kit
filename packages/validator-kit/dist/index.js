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
import { VALIDATOR_CLASSES, contentHash, refuse } from '@zero-ar/contracts';
import { admitCatalogueEntry, defineFirstPartyCatalogueEntry } from "./catalogue.js";
import { validatorFindingProblem } from "./finding.js";
export { validatorFindingProblem } from "./finding.js";
export { admitAvailabilitySnapshot, admitCatalogueEntry, canonicalCatalogueEntry, catalogueDefaults, catalogueEvidenceRef, defineAvailabilitySnapshot, defineCatalogueEntry, defineCustomCatalogueEntry, defineFirstPartyCatalogueEntry, deriveValidatorEvidenceGrade, } from "./catalogue.js";
export { ATTENTION_NOT_EVALUATED, compileVerificationPlan, defineVerificationAttentionCapacitySnapshot, defineVerificationCheckpointInput, renderVerificationPlan, selectValidatorInvocations, selectedValidatorCost, verificationCheckpointInputForContract, } from "./verification-plan.js";
export { SEQUENTIAL_MAX_SAMPLE, sampledFindingProblem, sequentialBoundaryTrace, sequentialErrorGuarantee, sequentialFrameHash, sequentialGuaranteeStatement, sequentialSampledValidator, sequentialSamplingFrame, } from "./sequential.js";
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
const FINDING_FIXES = {
    'validator.finding.shape': 'return an object with a verdict, a reason and, for a reject, a list of item ids',
    'validator.finding.unknown': VALIDATOR_FINDINGS.join(', '),
    'validator.finding.reason-missing': 'say in the reason what the validator found, because the runtime records it with the verdict',
    'validator.finding.failure-class-unknown': 'use a failure class from the closed vocabulary, or leave it out',
    'validator.reject.unnamed': 'name the rejected items, because a rejection nobody can locate cannot be repaired',
    'validator.finding.contradictory': 'return reject with the failing items, or pass with none',
    'validator.finding.outside-population': 'name only items from the input the validator was given',
};
/**
 * Refuse a malformed finding with the same rule the runtime runner applies.
 * `population` is captured before the validator runs, so a validator that
 * changes its input cannot widen the set of items it may name.
 */
function refuseMalformedFinding(name, finding, population) {
    const problem = validatorFindingProblem(finding, population);
    if (!problem)
        return;
    refuse({
        code: problem.code,
        message: `validator ${name} returned a malformed finding: ${problem.problem}. The runtime records such a finding as infrastructure indeterminate, never as pass.`,
        fix: FINDING_FIXES[problem.code],
    });
}
function givenItems(input) {
    return new Set(input.items.map((item) => item.item_id));
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
    if (!definition.description.trim()) {
        refuse({
            code: 'validator.description.missing',
            message: `validator ${definition.name} needs a plain description of what it checks.`,
            clause: 'VPC-014',
        });
    }
    const catalogueEntry = admitCatalogueEntry(definition.catalogue_entry);
    const catalogueIdentity = catalogueEntry.identity;
    if (catalogueIdentity.name !== definition.name
        || catalogueIdentity.version !== definition.version
        || catalogueEntry.finding_contract.class !== definition.class) {
        refuse({
            code: 'validator.catalogue.identity-mismatch',
            message: `validator ${definition.name}@${definition.version} (${definition.class}) does not match catalogue identity ${catalogueIdentity.name}@${catalogueIdentity.version} (${catalogueEntry.finding_contract.class}).`,
            clause: 'VPC-008',
        });
    }
    const manifest = {
        kind: 'validator',
        name: definition.name,
        version: definition.version,
        description: definition.description,
        class: definition.class,
        findings: VALIDATOR_FINDINGS,
        implementation_ref: catalogueIdentity.implementation_ref,
        catalogue_entry_ref: catalogueEntry.catalogue_entry_ref,
    };
    return {
        manifest,
        name: definition.name,
        version: definition.version,
        class: definition.class,
        catalogue_entry: catalogueEntry,
        examined: (input) => examinedManifest(input),
        evaluate: async (input, context) => {
            const population = givenItems(input);
            const finding = await definition.evaluate(input, context);
            refuseMalformedFinding(definition.name, finding, population);
            return finding;
        },
    };
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
export async function runLabelledCases(validator, cases) {
    const outcomes = [];
    for (const item of cases) {
        const examined = validator.examined(item.input);
        const population = givenItems(item.input);
        const finding = await validator.evaluate(structuredClone(item.input));
        refuseMalformedFinding(validator.name, finding, population);
        outcomes.push({
            label: item.label,
            expected: item.expect,
            actual: finding.verdict,
            agreed: finding.verdict === item.expect,
            examined,
        });
    }
    return outcomes;
}
/** Build a worked item for a labelled case without spelling every field. */
export function examinedItem(item_id, output, state = 'completed_unverified', attempts = 1) {
    return { item_id, state, attempts, output };
}
function workedJson(input) {
    return input.items
        .filter((item) => item.state === 'completed_unverified' || item.state === 'verified')
        .map((item) => {
        try {
            const value = JSON.parse(item.output ?? 'null');
            return { item, value: value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null };
        }
        catch {
            return { item, value: null };
        }
    });
}
function rejection(rejected, reason) {
    return rejected.length === 0
        ? { verdict: 'pass', reason }
        : { verdict: 'reject', rejected_items: rejected, failure_class: 'shape', reason: `${rejected.length} items failed ${reason}: ${rejected.slice(0, 5).join(', ')}` };
}
/** Deterministic exact-object JSON shape factory over a deliberately bounded schema subset. */
export function jsonShapeValidator(name, version, schema) {
    const schemaRef = contentHash(schema);
    return defineValidator({
        name,
        version,
        description: 'worked JSON objects conform exactly to one pinned bounded schema',
        class: 'deterministic',
        can_answer_indeterminate: true,
        catalogue_entry: defineFirstPartyEntryForFactory({
            name,
            version,
            entrypoint: '@zero-ar/validator-kit#jsonShapeValidator',
            algorithm: { family: 'bounded-json-object-shape-v1', schema_ref: schemaRef },
            ruleKind: 'structured-shape',
            limitation: 'A pass establishes the declared JSON shape only; it does not establish semantic correctness.',
        }),
        evaluate(input) {
            const rejected = [];
            const required = new Set(schema.required);
            const allowed = new Set(Object.keys(schema.properties));
            for (const { item, value } of workedJson(input)) {
                if (!value || Object.keys(value).some((key) => !allowed.has(key)) || [...required].some((key) => !(key in value))) {
                    rejected.push(item.item_id);
                    continue;
                }
                for (const [key, spec] of Object.entries(schema.properties)) {
                    if (!(key in value))
                        continue;
                    const actual = value[key];
                    const valid = spec.type === 'integer' ? Number.isInteger(actual) : typeof actual === spec.type;
                    if (!valid) {
                        rejected.push(item.item_id);
                        break;
                    }
                }
            }
            return rejection(rejected, `bounded JSON schema ${schemaRef}`);
        },
    });
}
/** Deterministic uniqueness factory over one exact top-level JSON key. */
export function uniquenessValidator(name, version, key) {
    return defineValidator({
        name,
        version,
        description: `the ${key} field is present and unique across worked JSON objects`,
        class: 'deterministic',
        can_answer_indeterminate: true,
        catalogue_entry: defineFirstPartyEntryForFactory({
            name,
            version,
            entrypoint: '@zero-ar/validator-kit#uniquenessValidator',
            algorithm: { family: 'json-key-uniqueness-v1', key },
            ruleKind: 'uniqueness',
            limitation: 'A pass establishes uniqueness of the declared key in the examined population only.',
        }),
        evaluate(input) {
            const rejected = [];
            const seen = new Map();
            for (const { item, value } of workedJson(input)) {
                const raw = value?.[key];
                if (typeof raw !== 'string' && typeof raw !== 'number') {
                    rejected.push(item.item_id);
                    continue;
                }
                const identity = `${typeof raw}:${String(raw)}`;
                const prior = seen.get(identity);
                if (prior)
                    rejected.push(prior, item.item_id);
                else
                    seen.set(identity, item.item_id);
            }
            return rejection([...new Set(rejected)], `unique key ${key}`);
        },
    });
}
/** Deterministic referential-integrity factory inside one examined JSON population. */
export function referentialIntegrityValidator(name, version, key, reference) {
    return defineValidator({
        name,
        version,
        description: `every ${reference} value resolves to a ${key} value in the examined population`,
        class: 'deterministic',
        can_answer_indeterminate: true,
        catalogue_entry: defineFirstPartyEntryForFactory({
            name,
            version,
            entrypoint: '@zero-ar/validator-kit#referentialIntegrityValidator',
            algorithm: { family: 'json-referential-integrity-v1', key, reference },
            ruleKind: 'referential-integrity',
            limitation: 'A pass establishes internal reference resolution only; it does not establish that referenced entities are correct or complete.',
        }),
        evaluate(input) {
            const rows = workedJson(input);
            const keys = new Set(rows.flatMap(({ value }) => {
                const raw = value?.[key];
                return typeof raw === 'string' || typeof raw === 'number' ? [`${typeof raw}:${String(raw)}`] : [];
            }));
            const rejected = rows.flatMap(({ item, value }) => {
                const raw = value?.[reference];
                return (typeof raw === 'string' || typeof raw === 'number') && keys.has(`${typeof raw}:${String(raw)}`) ? [] : [item.item_id];
            });
            return rejection(rejected, `referential integrity ${reference} -> ${key}`);
        },
    });
}
/** Deterministic arithmetic reconciliation over a total and numeric component array. */
export function arithmeticReconciliationValidator(name, version, totalField, componentsField, tolerance = 0) {
    if (!Number.isFinite(tolerance) || tolerance < 0) {
        refuse({ code: 'validator.arithmetic.tolerance', message: 'arithmetic reconciliation needs a finite non-negative tolerance.', clause: 'VPC-007' });
    }
    return defineValidator({
        name,
        version,
        description: `${totalField} reconciles with the sum of ${componentsField} inside the pinned tolerance`,
        class: 'deterministic',
        can_answer_indeterminate: true,
        catalogue_entry: defineFirstPartyEntryForFactory({
            name,
            version,
            entrypoint: '@zero-ar/validator-kit#arithmeticReconciliationValidator',
            algorithm: { family: 'json-arithmetic-reconciliation-v1', total_field: totalField, components_field: componentsField, tolerance },
            ruleKind: 'arithmetic-reconciliation',
            limitation: 'A pass establishes arithmetic reconciliation only; it does not establish the provenance or meaning of the numbers.',
        }),
        evaluate(input) {
            const rejected = workedJson(input).flatMap(({ item, value }) => {
                const total = value?.[totalField];
                const components = value?.[componentsField];
                if (typeof total !== 'number' || !Number.isFinite(total) || !Array.isArray(components) || components.some((part) => typeof part !== 'number' || !Number.isFinite(part)))
                    return [item.item_id];
                const sum = components.reduce((value, part) => value + part, 0);
                return Math.abs(total - sum) <= tolerance ? [] : [item.item_id];
            });
            return rejection(rejected, `arithmetic fields ${totalField} and ${componentsField}`);
        },
    });
}
/** Deterministic manifest reconciliation over declared members and byte totals. */
export function artifactManifestValidator(name, version) {
    return defineValidator({
        name,
        version,
        description: 'artifact manifest members, byte total, media type and content refs reconcile',
        class: 'deterministic',
        can_answer_indeterminate: true,
        catalogue_entry: defineFirstPartyEntryForFactory({
            name,
            version,
            entrypoint: '@zero-ar/validator-kit#artifactManifestValidator',
            algorithm: { family: 'artifact-manifest-reconciliation-v1' },
            ruleKind: 'artifact-manifest',
            limitation: 'A pass establishes internal manifest reconciliation only; it does not read or judge the referenced artifact bytes.',
        }),
        evaluate(input) {
            const hash = /^sha256:[0-9a-f]{64}$/;
            const media = /^[^\s/]+\/[^\s]+$/;
            const rejected = workedJson(input).flatMap(({ item, value }) => {
                const members = value?.['members'];
                const bytes = value?.['bytes'];
                const mediaType = value?.['media_type'];
                const contentRef = value?.['content_ref'];
                if (!Array.isArray(members) || typeof bytes !== 'number' || !Number.isInteger(bytes) || bytes < 0 || typeof mediaType !== 'string' || !media.test(mediaType) || typeof contentRef !== 'string' || !hash.test(contentRef))
                    return [item.item_id];
                const validMembers = members.every((member) => member !== null && typeof member === 'object' && !Array.isArray(member)
                    && typeof member['bytes'] === 'number'
                    && Number.isInteger(member['bytes'])
                    && member['bytes'] >= 0
                    && typeof member['content_ref'] === 'string'
                    && hash.test(member['content_ref']));
                const summed = validMembers ? members.reduce((sum, member) => sum + (member['bytes'] ?? 0), 0) : -1;
                return validMembers && summed === bytes ? [] : [item.item_id];
            });
            return rejection(rejected, 'artifact manifest reconciliation');
        },
    });
}
function defineFirstPartyEntryForFactory(input) {
    // Kept local to avoid giving factories a second authoring format.
    return defineFirstPartyCatalogueEntry({
        name: input.name,
        version: input.version,
        entrypoint: input.entrypoint,
        implementation_identity: input.algorithm,
        factory_identity: { family: input.algorithm['family'] },
        rule_kinds: [input.ruleKind],
        limitations: [input.limitation],
    });
}
