/**
 * The one finding check shared by the validator kit and the runtime runner.
 *
 * What this is: a pure function that names what makes a raw finding
 * malformed. The verdict must be pass, reject or indeterminate, the reason
 * non-empty, any failure class from the closed vocabulary; a reject names at
 * least one item, a pass names none, and every named item was given to it.
 *
 * How it fits: defineValidator and runLabelledCases refuse a malformed finding
 * with the code returned here, and the quality plane's runner turns the same
 * problem into infrastructure indeterminate, so case evidence and runtime
 * admission agree on every finding (VAL-004, C-ARCH-VERIFIED-COMPLETION-005).
 */
import { FAILURE_CLASSES, VALIDATOR_OUTCOMES } from '@zero-ar/contracts';
function describeValue(value) {
    try {
        return JSON.stringify(value) ?? String(value);
    }
    catch {
        return String(value);
    }
}
/**
 * Check one raw finding against the validator seam. `population` is the set
 * of item ids the validator was given, captured before its code ran. Returns
 * null for a well-formed finding.
 */
export function validatorFindingProblem(raw, population) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return { code: 'validator.finding.shape', problem: 'the finding is not an object' };
    }
    const finding = raw;
    const verdict = finding['verdict'];
    if (typeof verdict !== 'string' || !VALIDATOR_OUTCOMES.includes(verdict)) {
        return {
            code: 'validator.finding.unknown',
            problem: `the verdict ${describeValue(verdict)} is not one of ${VALIDATOR_OUTCOMES.join(', ')}`,
        };
    }
    const reason = finding['reason'];
    if (typeof reason !== 'string' || reason.trim() === '') {
        return { code: 'validator.finding.reason-missing', problem: 'the finding gives no reason' };
    }
    const failureClass = finding['failure_class'];
    if (failureClass !== undefined && (typeof failureClass !== 'string' || !FAILURE_CLASSES.includes(failureClass))) {
        return {
            code: 'validator.finding.failure-class-unknown',
            problem: `the failure class ${describeValue(failureClass)} is not one of ${FAILURE_CLASSES.join(', ')}`,
        };
    }
    const rejected = finding['rejected_items'];
    if (rejected !== undefined && (!Array.isArray(rejected) || rejected.some((item) => typeof item !== 'string'))) {
        return { code: 'validator.finding.shape', problem: 'rejected_items is not a list of item ids' };
    }
    const named = (rejected ?? []);
    if (verdict === 'reject' && named.length === 0) {
        return { code: 'validator.reject.unnamed', problem: 'the reject names no item, so repair could not locate what failed' };
    }
    if (verdict === 'pass' && named.length > 0) {
        return { code: 'validator.finding.contradictory', problem: 'the pass also names rejected items, so the finding contradicts itself' };
    }
    const outside = [...new Set(named.filter((item) => !population.has(item)))];
    if (outside.length > 0) {
        const listed = `${outside.slice(0, 5).join(', ')}${outside.length > 5 ? ` and ${outside.length - 5} more` : ''}`;
        return {
            code: 'validator.finding.outside-population',
            problem: `rejected items ${listed} are not among the ${population.size} items the validator was given`,
        };
    }
    return null;
}
