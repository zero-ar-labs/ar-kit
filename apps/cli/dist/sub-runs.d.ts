import type { RunSnapshot, SubRunSummary } from '@zero-ar/contracts';
export declare function subRunRows(snapshot: Pick<RunSnapshot, 'sub_runs' | 'sub_run'>): [string, string][];
export declare function subRunSummaryRows(summary: SubRunSummary): [string, string][];
export declare function subRunEventLine(event: {
    event: string;
    payload: Record<string, unknown>;
}): string | null;
