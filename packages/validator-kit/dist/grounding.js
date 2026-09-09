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
import { parseClaimSet, spanHash } from '@zero-ar/contracts';
/** The wording every grounding report carries. Tests pin it; surfaces repeat it. */
export const GROUNDING_LIMIT = 'set membership only: resolution does not establish that a span supports its claim and does not detect a span assigned to the wrong claim';
/**
 * An in-memory span store keyed by span hash. Applications with a corpus on
 * disk implement SpanResolver over their own storage; this one carries the
 * bundled domains and every conformance fixture.
 */
export class CorpusStore {
    spans = new Map();
    stale = new Map();
    /** Add a source's spans and get back the citations that reference them.
     * A classification, when the application declares one, rides every span. */
    addSource(source_id, spans, classification) {
        return spans.map((bytes) => {
            const hash = spanHash(bytes);
            this.spans.set(hash, { source_id, bytes, ...(classification !== undefined ? { classification } : {}) });
            return { source_id, span_hash: hash };
        });
    }
    /**
     * Restore path: bytes arriving from an export are stored under their
     * recorded hash, and the hash is not retrusted. resolve() re-hashes, so a
     * mismatch surfaces at the first read instead of never (CLM-002).
     */
    seed(span_hash, source_id, bytes) {
        this.spans.set(span_hash, { source_id, bytes });
    }
    /**
     * The source publishes new bytes: old spans stay in history but stop
     * being current, so anything asserting them as preconditions refuses
     * until it re-reads (EFX-003).
     */
    revise(source_id, spans, classification) {
        for (const [hash, span] of this.spans) {
            if (span.source_id === source_id)
                this.stale.set(hash, `source ${source_id} published new bytes; this span is not current`);
        }
        return this.addSource(source_id, spans, classification);
    }
    /** A withdrawn source stops resolving; claims leaning on it lose support. */
    withdraw(source_id) {
        let removed = 0;
        for (const [hash, span] of this.spans) {
            if (span.source_id === source_id) {
                this.spans.delete(hash);
                removed += 1;
            }
        }
        return removed;
    }
    resolve(citation) {
        const staleReason = this.stale.get(citation.span_hash);
        if (staleReason !== undefined)
            return { status: 'stale', reason: staleReason };
        const span = this.spans.get(citation.span_hash);
        if (!span)
            return { status: 'missing' };
        if (spanHash(span.bytes) !== citation.span_hash)
            return { status: 'hash_mismatch' };
        return { status: 'resolved', bytes: span.bytes, ...(span.classification !== undefined ? { classification: span.classification } : {}) };
    }
}
/** Resolve every citation in a claim set and account the support. */
export function groundClaims(set, resolver) {
    const unresolved = [];
    const resolvedHashes = new Set();
    let citations = 0;
    const byText = new Map();
    for (const claim of set.claims) {
        const group = byText.get(claim.text) ?? { claim_ids: [], spans: new Set() };
        group.claim_ids.push(claim.claim_id);
        byText.set(claim.text, group);
        for (const citation of claim.citations) {
            citations += 1;
            const resolution = resolver.resolve(citation);
            if (resolution.status === 'resolved') {
                resolvedHashes.add(citation.span_hash);
                group.spans.add(citation.span_hash);
            }
            else {
                unresolved.push({ claim_id: claim.claim_id, source_id: citation.source_id, span_hash: citation.span_hash, status: resolution.status });
            }
        }
    }
    return {
        claims: set.claims.length,
        citations,
        unresolved,
        distinct_support: resolvedHashes.size,
        duplicate_citations: citations - unresolved.length - resolvedHashes.size,
        support: [...byText.values()].map((g) => ({ claim_ids: g.claim_ids, distinct_spans: g.spans.size })),
        semantic_support: 'heuristic',
        limit: GROUNDING_LIMIT,
    };
}
/**
 * The grounding check as a deterministic validator. An output that is not a
 * claim set is a shape rejection, because evidence-completeness only scopes
 * to the structured representation (CLM-001); a citation that does not
 * resolve is a grounding rejection and is never admitted as established
 * support (CLM-002, QCV-006).
 */
export function groundedClaims(resolver) {
    return {
        name: 'claims.grounded',
        version: '1.0.0',
        class: 'deterministic',
        evaluate(input) {
            const unstructured = [];
            const ungrounded = [];
            let resolvedSpans = 0;
            for (const item of input.items) {
                if (item.state !== 'completed_unverified' && item.state !== 'verified')
                    continue;
                const parsed = parseClaimSet(item.output ?? '');
                if (!parsed.ok) {
                    unstructured.push(item.item_id);
                    continue;
                }
                const report = groundClaims(parsed.set, resolver);
                if (report.unresolved.length > 0)
                    ungrounded.push(item.item_id);
                else
                    resolvedSpans += report.distinct_support;
            }
            const rejected = [...unstructured, ...ungrounded];
            if (rejected.length === 0) {
                return {
                    verdict: 'pass',
                    reason: `every citation resolves to original bytes, ${resolvedSpans} distinct spans in support. This is ${GROUNDING_LIMIT}`,
                };
            }
            return {
                verdict: 'reject',
                rejected_items: rejected,
                failure_class: unstructured.length > 0 ? 'shape' : 'grounding',
                reason: (unstructured.length > 0 ? `${unstructured.length} outputs are not structured claim sets, so no completeness statement covers them. ` : '') +
                    (ungrounded.length > 0 ? `${ungrounded.length} outputs cite spans that do not resolve to original bytes. ` : '') +
                    `This check is ${GROUNDING_LIMIT}`,
            };
        },
    };
}
