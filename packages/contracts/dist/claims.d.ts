/**
 * The structured claim representation and the evidence facts spans carry.
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
/** The per-run artifact fence nonce: 128 random bits, minted at intake and outside identity. */
export declare const ContextFenceNonceSchema: z.ZodString;
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
/**
 * The evidence facts an entry carries beside its text, so the content hash
 * covers them and forks and exports copy them (CTX-002, CTX-008). An entry
 * that reads an artifact names the handle and range instead of the bytes.
 */
export declare const EntryEvidenceSchema: z.ZodObject<{
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    evidence_grade: z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>;
    artifact: z.ZodOptional<z.ZodObject<{
        artifact_ref: z.ZodString;
        content_hash: z.ZodString;
        start: z.ZodNumber;
        end: z.ZodNumber;
        required_for_completion: z.ZodBoolean;
        span_hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EntryEvidence = z.infer<typeof EntryEvidenceSchema>;
/** One artifact range placed in a context window behind the run's fence nonce (CTX-007). */
export declare const ArtifactContextSpanSchema: z.ZodObject<{
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
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    media_type: z.ZodString;
    fence_nonce: z.ZodString;
}, z.core.$strict>;
export type ArtifactContextSpan = z.infer<typeof ArtifactContextSpanSchema>;
/** Cited artifact evidence that could not stand, and whether it blocks verified completion (QLT-031). */
export declare const ArtifactEvidenceBlockerSchema: z.ZodObject<{
    entry_id: z.ZodString;
    artifact_ref: z.ZodString;
    reason: z.ZodEnum<{
        "artifact.hash-mismatch": "artifact.hash-mismatch";
        "artifact.classification-mismatch": "artifact.classification-mismatch";
        "artifact.object-missing": "artifact.object-missing";
        "artifact.not-found-or-not-authorized": "artifact.not-found-or-not-authorized";
        "artifact.range-invalid": "artifact.range-invalid";
        "artifact.range-budget": "artifact.range-budget";
        "artifact.store-unavailable": "artifact.store-unavailable";
        "memory.envelope-erased": "memory.envelope-erased";
        token_budget: "token_budget";
    }>;
    blocks_verified_completion: z.ZodBoolean;
}, z.core.$strict>;
export type ArtifactEvidenceBlocker = z.infer<typeof ArtifactEvidenceBlockerSchema>;
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
/**
 * Name the exact slice of an artifact a claim leans on. The hash still
 * decides; the locator only says where to look. artifact.read returns one
 * for the range it read, because a model cannot compute sha256 itself.
 */
export declare function artifactCitation(artifact_ref: string, bytes: string, offset: number): Citation;
/** The byte range an artifact citation locator names, or null when it names none. */
export declare function parseArtifactLocator(locator: string | undefined): {
    offset: number;
    length: number;
} | null;
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
    /**
     * Resolve a complete set against current storage when reads are
     * asynchronous. The returned positions correspond to the citations.
     * Callers fall back to resolve() when this port is absent.
     */
    resolveCurrent?(citations: readonly Citation[]): Promise<readonly SpanResolution[]>;
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
