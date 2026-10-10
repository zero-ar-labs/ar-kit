import type { SequentialSamplingRecord, ValidatorClass } from '@zero-ar/contracts';
import type { ExaminedItem, ValidatorCaseFinding, ValidatorImplementation } from './index.js';
export type SequentialSamplingModel = 'bernoulli-independent' | 'finite-population-without-replacement';
export type SequentialErrorAssumption = 'bernoulli-independent-fixed-order-v1' | 'hypergeometric-without-replacement-fixed-frame-v1';
export declare const SEQUENTIAL_MAX_SAMPLE = 10000;
export interface SequentialSamplingConfig {
    name: string;
    version: string;
    p0_ppm: number;
    p1_ppm: number;
    alpha_ppm: number;
    beta_ppm: number;
    max_sample: number;
    ordering: 'sorted-item-id-v1';
    sampling_model?: SequentialSamplingModel;
    expected_frame_hash?: string;
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
export type SequentialFinding = ValidatorCaseFinding & {
    sampling?: SequentialSamplingRecord;
};
export declare function sequentialErrorGuarantee(config: SequentialSamplingConfig, population_size?: number): SequentialErrorGuarantee;
export declare function sequentialBoundaryTrace(config: SequentialSamplingConfig, examined: number, defects: number, population_size?: number): SequentialBoundaryTrace;
export declare function sequentialSamplingFrame(items: readonly ExaminedItem[]): ExaminedItem[];
export declare function sequentialFrameHash(items: readonly ExaminedItem[]): string;
export declare function sequentialGuaranteeStatement(config: SequentialSamplingConfig): string;
export declare function sequentialSampledValidator(config: SequentialSamplingConfig, klass?: 'sampled-oracle' | 'heuristic'): ValidatorImplementation;
export interface SampledFindingContext {
    class: ValidatorClass;
    oracle_ref: string | null;
    items: readonly ExaminedItem[];
}
export declare function sampledFindingProblem(finding: {
    verdict?: unknown;
    rejected_items?: readonly string[] | undefined;
    sampling?: unknown;
}, context: SampledFindingContext): string | null;
