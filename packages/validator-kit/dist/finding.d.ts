/**
 * The one finding check shared by the validator kit and the runtime runner.
 *
 * What this is: a pure function that names what makes a raw finding
 * malformed. The verdict must be pass, reject or indeterminate, the reason
 * non-empty, any failure class from the closed vocabulary; a reject names at
 * least one item, a pass names none, only an indeterminate names undecided
 * items, and every named item was given to it.
 *
 * How it fits: defineValidator and runLabelledCases refuse a malformed finding
 * with the code returned here, and the quality plane's runner turns the same
 * problem into infrastructure indeterminate, so case evidence and runtime
 * admission agree on every finding (VAL-004, C-ARCH-VERIFIED-COMPLETION-005).
 */
/** Why a raw finding is not admissible, with the refusal code the kit uses. */
export interface ValidatorFindingProblem {
    code: 'validator.finding.shape' | 'validator.finding.unknown' | 'validator.finding.reason-missing' | 'validator.finding.failure-class-unknown' | 'validator.reject.unnamed' | 'validator.finding.contradictory' | 'validator.finding.outside-population';
    problem: string;
}
/**
 * Check one raw finding against the validator seam. `population` is the set
 * of item ids the validator was given, captured before its code ran. Returns
 * null for a well-formed finding.
 */
export declare function validatorFindingProblem(raw: unknown, population: ReadonlySet<string>): ValidatorFindingProblem | null;
