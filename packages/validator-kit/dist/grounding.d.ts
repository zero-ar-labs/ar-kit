/**
 * Claim grounding: set-membership checks over structured claims.
 *
 * What this is: the span store that holds original source bytes, the check
 * that resolves every citation against them, and the deterministic validator
 * that wraps the check for the quality plane. Resolution re-hashes stored
 * bytes at read time, so a withdrawn source and rotted bytes both fail to
 * resolve (CLM-002). Support counts distinct span hashes, so many agents
 * citing one span are one support, and agreement without a new span adds
 * nothing (CLM-004).
 *
 * What this deliberately does not do: judge meaning. Resolution establishes
 * that cited bytes exist, not that they support the claim, and it cannot
 * detect a real span assigned to the wrong claim. The check says so in its
 * own report, and semantic support stays labelled heuristic unless a domain
 * oracle establishes it (CLM-003, CLM-005).
 */
import type { Citation, ClaimSet, SpanResolution, SpanResolver } from '@zero-ar/contracts';
import type { ValidatorImplementation } from './index.js';
export type { SpanResolution, SpanResolver };
/** The wording every grounding report carries. Tests pin it; surfaces repeat it. */
export declare const GROUNDING_LIMIT = "set membership only: resolution does not establish that a span supports its claim and does not detect a span assigned to the wrong claim";
/**
 * An in-memory span store keyed by span hash. Applications with a corpus on
 * disk implement SpanResolver over their own storage; this one carries the
 * bundled domains and every conformance fixture.
 */
export declare class CorpusStore implements SpanResolver {
    private readonly spans;
    private readonly stale;
    /** Add a source's spans and get back the citations that reference them.
     * A classification, when the application declares one, rides every span. */
    addSource(source_id: string, spans: string[], classification?: string): Citation[];
    /**
     * Restore path: bytes arriving from an export are stored under their
     * recorded hash, and the hash is not retrusted. resolve() re-hashes, so a
     * mismatch surfaces at the first read instead of never (CLM-002).
     */
    seed(span_hash: string, source_id: string, bytes: string): void;
    /**
     * The source publishes new bytes: old spans stay in history but stop
     * being current, so anything asserting them as preconditions refuses
     * until it re-reads (EFX-003).
     */
    revise(source_id: string, spans: string[], classification?: string): Citation[];
    /** A withdrawn source stops resolving; claims leaning on it lose support. */
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
    /** Distinct resolved span hashes across the whole set. Duplicates count once. */
    distinct_support: number;
    duplicate_citations: number;
    /**
     * Claims grouped by identical text. distinct_spans is the corroboration
     * that exists; asserting_claims above one is agreement, which is not
     * corroboration and adds nothing to it (CLM-004).
     */
    support: {
        claim_ids: string[];
        distinct_spans: number;
    }[];
    /** What the runtime itself can say about meaning without a domain oracle. */
    semantic_support: 'heuristic';
    limit: typeof GROUNDING_LIMIT;
}
/** Resolve every citation in a claim set and account the support. */
export declare function groundClaims(set: ClaimSet, resolver: SpanResolver): GroundingReport;
/**
 * The grounding check as a deterministic validator. An output that is not a
 * claim set is a shape rejection, because evidence-completeness only scopes
 * to the structured representation (CLM-001); a citation that does not
 * resolve is a grounding rejection and is never admitted as established
 * support (CLM-002, QCV-006).
 */
export declare function groundedClaims(resolver: SpanResolver): ValidatorImplementation;
