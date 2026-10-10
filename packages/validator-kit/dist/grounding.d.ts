import type { Citation, ClaimSet, SpanResolution, SpanResolver } from '@zero-ar/contracts';
import type { ValidatorImplementation } from './index.js';
export type { SpanResolution, SpanResolver };
export declare const GROUNDING_LIMIT = "set membership only: resolution does not establish that a span supports its claim and does not detect a span assigned to the wrong claim";
export declare class CorpusStore implements SpanResolver {
    private readonly spans;
    private readonly stale;
    addSource(source_id: string, spans: string[], classification?: string): Citation[];
    seed(span_hash: string, source_id: string, bytes: string): void;
    revise(source_id: string, spans: string[], classification?: string): Citation[];
    withdraw(source_id: string): number;
    resolve(citation: Citation): SpanResolution;
}
export interface GroundingReport {
    claims: number;
    citations: number;
    unresolved: {
        claim_id: string;
        source_id: string;
        span_hash: string;
        status: 'missing' | 'hash_mismatch' | 'stale';
    }[];
    uncited_guarantees: string[];
    distinct_support: number;
    duplicate_citations: number;
    support: {
        claim_ids: string[];
        distinct_spans: number;
    }[];
    semantic_support: 'heuristic';
    limit: typeof GROUNDING_LIMIT;
}
export declare function groundClaims(set: ClaimSet, resolver: SpanResolver): GroundingReport;
export declare function groundedClaims(resolver: SpanResolver): ValidatorImplementation;
