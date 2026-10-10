export interface ValidatorFindingProblem {
    code: 'validator.finding.shape' | 'validator.finding.unknown' | 'validator.finding.reason-missing' | 'validator.finding.failure-class-unknown' | 'validator.reject.unnamed' | 'validator.finding.contradictory' | 'validator.finding.outside-population';
    problem: string;
}
export declare function validatorFindingProblem(raw: unknown, population: ReadonlySet<string>): ValidatorFindingProblem | null;
