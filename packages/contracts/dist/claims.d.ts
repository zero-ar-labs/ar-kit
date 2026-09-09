/**
 * The structured claim representation.
 *
 * What this is: the one shape a claim takes when a contract wants
 * evidence-completeness checked. A claim carries its label, its text, and
 * the citations that support it; a citation names a source and the hash of
 * the exact span it leans on. Guarantees about evidence completeness scope
 * to this shape and to nothing else, so prose that asserts support carries
 * no such coverage (CLM-001).
 *
 * How it fits: item outputs and sub-run findings carry claim sets as JSON.
 * The quality plane's grounding check resolves each citation against the
 * application's span store; parseClaimSet is the border where unstructured
 * text is told apart from a claim set, with the reason.
 */
import { z } from 'zod';
/** One support: a source and the hash of the exact span cited from it. */
export declare const CitationSchema: z.ZodObject<{
    source_id: z.ZodString;
    span_hash: z.ZodString;
    locator: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type Citation = z.infer<typeof CitationSchema>;
/**
 * Selected context material as CTX-002 represents it: the original-byte
 * handle, exact offsets, the content hash of that exact slice, the
 * classification it carries, and how close it stands to its origin.
 */
export declare const CitedSpanSchema: z.ZodObject<{
    entry_id: z.ZodString;
    start: z.ZodNumber;
    end: z.ZodNumber;
    span_hash: z.ZodString;
    classification: z.ZodString;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
}, z.core.$strict>;
export type CitedSpan = z.infer<typeof CitedSpanSchema>;
export declare const ClaimSchema: z.ZodObject<{
    claim_id: z.ZodString;
    text: z.ZodString;
    label: z.ZodEnum<{
        heuristic: "heuristic";
        guarantee: "guarantee";
        assumption: "assumption";
        open: "open";
    }>;
    citations: z.ZodArray<z.ZodObject<{
        source_id: z.ZodString;
        span_hash: z.ZodString;
        locator: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type Claim = z.infer<typeof ClaimSchema>;
export declare const ClaimSetSchema: z.ZodObject<{
    schema: z.ZodLiteral<"claim-set/1">;
    claims: z.ZodArray<z.ZodObject<{
        claim_id: z.ZodString;
        text: z.ZodString;
        label: z.ZodEnum<{
            heuristic: "heuristic";
            guarantee: "guarantee";
            assumption: "assumption";
            open: "open";
        }>;
        citations: z.ZodArray<z.ZodObject<{
            source_id: z.ZodString;
            span_hash: z.ZodString;
            locator: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ClaimSet = z.infer<typeof ClaimSetSchema>;
/** The hash a citation must carry for a span: sha256 over the exact bytes. */
export declare function spanHash(bytes: string): string;
/** What resolving one citation can find. Anything but resolved is no support.
 * A resolved span may carry its classification; derivations keep it (CLS-006). */
export type SpanResolution = {
    status: 'resolved';
    bytes: string;
    classification?: string;
} | {
    status: 'missing';
} | {
    status: 'hash_mismatch';
}
/** The source moved on: the bytes exist in history but are not current (EFX-003). */
 | {
    status: 'stale';
    reason: string;
};
/**
 * The seam every span store implements. The quality plane grounds claims
 * through it and the effect plane checks asserted preconditions through it
 * (CLM-002, EFX-003); implementations live with the application's corpus.
 */
export interface SpanResolver {
    resolve(citation: Citation): SpanResolution;
}
/**
 * Tell a claim set apart from anything else, with the reason. Output that
 * does not parse here is unstructured, and no evidence-completeness wording
 * applies to it.
 */
export declare function parseClaimSet(text: string): {
    ok: true;
    set: ClaimSet;
} | {
    ok: false;
    reason: string;
};
