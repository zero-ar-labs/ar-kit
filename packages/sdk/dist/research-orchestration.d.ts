/**
 * Research orchestration runs authored attempts and graph nodes.
 *
 * What this is: an SDK layer over the public runtime client. It creates
 * independent runs, observes durable records, scores attempts with an
 * external check, merges structured research artifacts, and submits one
 * final disposition run after blocking gaps are resolved.
 *
 * How it fits: the kernel still owns each run. This file never appends
 * records or reads projections directly.
 */
import type { Citation, IntakeRequest, RunResult } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
type PublicOrchestrationClient = Pick<ZeroARClient, 'createRun' | 'streamRecords' | 'records' | 'result' | 'control' | 'resume'>;
export interface ResearchAttempt {
    name: string;
    objective: string;
    budgets?: IntakeRequest['budgets'];
}
export interface ResearchGraphNode {
    name: string;
    objective: string;
    after?: string[];
    budgets?: IntakeRequest['budgets'];
    control_answers?: ResearchControlAnswer[];
}
export interface ResearchControlAnswer {
    handle: string;
    text?: string;
    reason?: string;
}
export interface ResearchDisposition {
    objective: string;
    budgets?: IntakeRequest['budgets'];
    required_effects?: number;
}
export interface ResearchOrchestrationPlan {
    name: string;
    version: string;
    attempts: ResearchAttempt[];
    acceptance: {
        check_ref: string;
        minimum_score: number;
    };
    graph: ResearchGraphNode[];
    disposition: ResearchDisposition;
}
export interface ResearchAcceptanceCheck {
    ref: string;
    score(input: ResearchAcceptanceInput): Promise<ResearchAcceptanceVerdict> | ResearchAcceptanceVerdict;
}
export interface ResearchAcceptanceInput {
    attempt: ResearchAttempt;
    result: RunResult;
    records: ObservationRecord[];
}
export interface ResearchAcceptanceVerdict {
    score: number;
    accepted: boolean;
    reason: string;
}
export interface ResearchAssertion {
    subject: string;
    predicate: string;
    object: string;
    citations: Citation[];
}
export interface ResearchGap {
    gap_id: string;
    description: string;
    blocking: boolean;
}
export interface ResearchGapResolution {
    gap_id: string;
    by: string;
    reason: string;
}
export interface ResearchRunSummary {
    name: string;
    run_id: string;
    terminal: RunResult['terminal'];
    verdict: RunResult['verdict'];
    artifact_entry: string | null;
    artifact_text: string | null;
    sequence_cursor: number;
    reserved_before_spend: boolean;
    effect_records: number;
    effect_dispositions: number;
    controls_applied: number;
    reattached_from_seq: number | null;
}
export interface ResearchAttemptSummary extends ResearchRunSummary {
    score: number | null;
    accepted: boolean;
    scored_by: string | null;
    score_reason: string | null;
}
export interface ResearchConflict {
    conflict_id: string;
    subject: string;
    predicate: string;
    objects: string[];
    assertion_ids: string[];
}
export interface ResearchMergeSummary {
    assertions: (ResearchAssertion & {
        assertion_id: string;
        writer: string;
    })[];
    unique_evidence: Citation[];
    conflicts: ResearchConflict[];
    gaps: ResearchGap[];
    blocking_gaps: ResearchGap[];
    resolved_gaps: ResearchGapResolution[];
}
export interface ResearchOrchestrationResumeState {
    plan_ref: string;
    attempts: {
        name: string;
        run_id: string;
        sequence_cursor: number;
    }[];
    nodes: {
        name: string;
        run_id: string;
        sequence_cursor: number;
    }[];
    disposition: {
        run_id: string;
        sequence_cursor: number;
    } | null;
}
export interface ResearchOrchestrationOutcome {
    plan_ref: string;
    attempts: ResearchAttemptSummary[];
    promoted_attempt: ResearchAttemptSummary | null;
    nodes: ResearchRunSummary[];
    merge: ResearchMergeSummary;
    disposition: ResearchRunSummary | null;
    halted: {
        reason: string;
        gaps: string[];
    } | null;
    resume_state: ResearchOrchestrationResumeState;
}
type ObservationRecord = {
    type: string;
    seq: number;
    payload: Record<string, unknown>;
};
export declare function defineResearchOrchestration(plan: ResearchOrchestrationPlan): Readonly<ResearchOrchestrationPlan> & {
    kind: 'research-orchestration';
    hash: string;
};
export declare function runResearchOrchestration(client: PublicOrchestrationClient, plan: ReturnType<typeof defineResearchOrchestration>, options: {
    principals: IntakeRequest['principals'];
    acceptance: ResearchAcceptanceCheck;
    resume_state?: ResearchOrchestrationResumeState;
    resolved_gaps?: ResearchGapResolution[];
}): Promise<ResearchOrchestrationOutcome>;
export {};
