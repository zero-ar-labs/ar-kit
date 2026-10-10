import { parseClaimSet, spanHash } from '@zero-ar/contracts';
export const GROUNDING_LIMIT = 'set membership only: resolution does not establish that a span supports its claim and does not detect a span assigned to the wrong claim';
export class CorpusStore {
    spans = new Map();
    stale = new Map();
    addSource(source_id, spans, classification) {
        return spans.map((bytes) => {
            const hash = spanHash(bytes);
            this.spans.set(hash, { source_id, bytes, ...(classification !== undefined ? { classification } : {}) });
            return { source_id, span_hash: hash };
        });
    }
    seed(span_hash, source_id, bytes) {
        this.spans.set(span_hash, { source_id, bytes });
    }
    revise(source_id, spans, classification) {
        for (const [hash, span] of this.spans) {
            if (span.source_id === source_id)
                this.stale.set(hash, `source ${source_id} published new bytes; this span is not current`);
        }
        return this.addSource(source_id, spans, classification);
    }
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
export function groundClaims(set, resolver) {
    const unresolved = [];
    const uncited_guarantees = [];
    const resolvedHashes = new Set();
    let citations = 0;
    const byText = new Map();
    for (const claim of set.claims) {
        const group = byText.get(claim.text) ?? { claim_ids: [], spans: new Set() };
        group.claim_ids.push(claim.claim_id);
        byText.set(claim.text, group);
        if (claim.label === 'guarantee' && claim.citations.length === 0)
            uncited_guarantees.push(claim.claim_id);
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
        uncited_guarantees,
        distinct_support: resolvedHashes.size,
        duplicate_citations: citations - unresolved.length - resolvedHashes.size,
        support: [...byText.values()].map((g) => ({ claim_ids: g.claim_ids, distinct_spans: g.spans.size })),
        semantic_support: 'heuristic',
        limit: GROUNDING_LIMIT,
    };
}
export function groundedClaims(resolver) {
    return {
        name: 'claims.grounded',
        version: '1.0.0',
        class: 'deterministic',
        evaluate(input) {
            const unstructured = [];
            const ungrounded = [];
            const uncited = [];
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
                else if (report.uncited_guarantees.length > 0)
                    uncited.push(item.item_id);
                else
                    resolvedSpans += report.distinct_support;
            }
            const rejected = [...unstructured, ...ungrounded, ...uncited];
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
                    (uncited.length > 0 ? `${uncited.length} outputs state a guarantee that cites nothing; cite the span that supports it or label it an assumption, heuristic or open question. ` : '') +
                    `This check is ${GROUNDING_LIMIT}`,
            };
        },
    };
}
