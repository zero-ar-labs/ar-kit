import type { EnvironmentAdapter, EnvironmentHandleBinding, EnvironmentProfile } from '@zero-ar/contracts';
export interface EnvironmentAdapterConformanceInput {
    adapter: EnvironmentAdapter;
    profile: EnvironmentProfile;
    binding: EnvironmentHandleBinding;
    argv?: string[];
    working_directory?: string;
    artifact_destination_ref?: string;
    maximum_observations?: number;
}
export interface EnvironmentAdapterConformanceReport {
    adapter_digest: string;
    environment_id: string;
    job_id: string;
    observation_count: number;
    collected_artifact_refs: string[];
    operations: string[];
}
export declare function runEnvironmentAdapterConformance(input: EnvironmentAdapterConformanceInput): Promise<EnvironmentAdapterConformanceReport>;
