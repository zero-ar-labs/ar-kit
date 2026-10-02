/**
 * Sequential sampled validation (appendix MTH, algorithm 3).
 *
 * What this is: Wald's sequential probability ratio test as a validator
 * factory over pinned hypotheses, error bounds, cap, ordering, sampling
 * model and domain oracle. The exact rational ratio updates once per item,
 * so a crossing decides the same everywhere (MTH-007), and a finding records
 * the frame, each oracle answer, the trace, the stop reason and the label.
 *
 * How it fits: domain packs ship sampled validators through the public kit,
 * and the quality runner checks each record against the input it admitted.
 * Evaluation is synchronous, so the cap, not the wall clock, bounds it.
 */
import type { SequentialSamplingRecord, ValidatorClass } from '@zero-ar/contracts';
import type { ExaminedItem, ValidatorCaseFinding, ValidatorImplementation } from './index.js';
export type SequentialSamplingModel = 'bernoulli-independent' | 'finite-population-without-replacement';
export type SequentialErrorAssumption = 'bernoulli-independent-fixed-order-v1' | 'hypergeometric-without-replacement-fixed-frame-v1';
/**
 * The most items one sampled check may examine. In-process evaluation is
 * synchronous and the ratio's digits grow with every item, so the declared
 * wall clock cannot interrupt a long sample. At this bound the slowest
 * measured case, a Bernoulli sample that never crosses, took about a quarter
 * of a second; the domain oracle's own cost per item comes on top.
 */
export declare const SEQUENTIAL_MAX_SAMPLE = 10000;
export interface SequentialSamplingConfig {
    name: string;
    version: string;
    /** Largest defect rate acceptable as good, parts per million. */
    p0_ppm: number;
    /** Smallest defect rate treated as bad, parts per million. Above p0. */
    p1_ppm: number;
    /** Declared false-reject bound, parts per million. */
    alpha_ppm: number;
    /** Declared false-pass bound, parts per million. */
    beta_ppm: number;
    /** The sample cap. Reaching it without a boundary crossing is indeterminate. */
    max_sample: number;
    /** Deterministic, agent-independent selection. Sorted ids need no seed. */
    ordering: 'sorted-item-id-v1';
    /** Defaults to the independent Bernoulli model used before MTH-SV-008. */
    sampling_model?: SequentialSamplingModel;
    /** Pin the frame; a drifted population returns indeterminate. */
    expected_frame_hash?: string;
    /** Exact domain oracle identity; a function without this pin is not admitted. */
    oracle_ref: string;
    oracle: (item: ExaminedItem) => 'good' | 'defect';
}
export interface SequentialErrorGuarantee {
    p0_ppm: number;
    p1_ppm: number;
    alpha_ppm: number;
    beta_ppm: number;
    sampling_model: SequentialSamplingModel;
    assumption: SequentialErrorAssumption;
    measured_false_pass_rate: 'deployment-metric:QLT-010';
    measured_false_rejection_rate: 'deployment-metric:QLT-010';
    population_size?: number;
    acceptable_defects?: number;
    bad_defects?: number;
}
export interface SequentialBoundaryTrace {
    sampling_model: SequentialSamplingModel;
    assumption: SequentialErrorAssumption;
    examined: number;
    defects: number;
    likelihood_ratio_num: string;
    likelihood_ratio_den: string;
    reject_boundary_num: string;
    reject_boundary_den: string;
    accept_boundary_num: string;
    accept_boundary_den: string;
    decision: 'accept' | 'reject' | 'continue';
    population_size?: number;
    acceptable_defects?: number;
    bad_defects?: number;
}
/** A finding from a sequential check: the ordinary finding plus its sampling record. */
export type SequentialFinding = ValidatorCaseFinding & {
    sampling?: SequentialSamplingRecord;
};
export declare function sequentialErrorGuarantee(config: SequentialSamplingConfig, population_size?: number): SequentialErrorGuarantee;
export declare function sequentialBoundaryTrace(config: SequentialSamplingConfig, examined: number, defects: number, population_size?: number): SequentialBoundaryTrace;
/** The worked rows a sequential check samples, in the pinned order. */
export declare function sequentialSamplingFrame(items: readonly ExaminedItem[]): ExaminedItem[];
/** The content identity of a sampling frame: the sorted worked item ids. */
export declare function sequentialFrameHash(items: readonly ExaminedItem[]): string;
/** The guarantee a configuration states, as one line a verification plan can show. */
export declare function sequentialGuaranteeStatement(config: SequentialSamplingConfig): string;
export declare function sequentialSampledValidator(config: SequentialSamplingConfig, klass?: 'sampled-oracle' | 'heuristic'): ValidatorImplementation;
/** What the runtime admitted to one sequential check, for binding its sampling record. */
export interface SampledFindingContext {
    /** The class the task contract binds the validator under. */
    class: ValidatorClass;
    /** The oracle the registered catalogue entry pins, or null when none is declared. */
    oracle_ref: string | null;
    /** The items the runtime admitted, before the validator ran. */
    items: readonly ExaminedItem[];
}
/**
 * Name what makes a finding's sampling record unusable against the input the
 * runtime admitted, or null when the record is sound or none is needed. A
 * sampled-oracle pass or reject needs one; an indeterminate finding and any
 * other class may carry none. The record must parse, name the registered
 * oracle (a sampled-oracle validator must have one pinned), cover exactly
 * the admitted frame, count what it lists, and stop for the reason its
 * verdict implies.
 */
export declare function sampledFindingProblem(finding: {
    verdict?: unknown;
    rejected_items?: readonly string[] | undefined;
    sampling?: unknown;
}, context: SampledFindingContext): string | null;
