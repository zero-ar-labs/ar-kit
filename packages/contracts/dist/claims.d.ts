import { z } from 'zod';
export declare const ContextFenceNonceSchema: z.ZodString;
export declare const CitationSchema: z.ZodObject<{
    source_id: z.ZodString;
    span_hash: z.ZodString;
    locator: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type Citation = z.infer<typeof CitationSchema>;
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
export declare const EntryImageSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "image/webp": "image/webp";
        "image/gif": "image/gif";
    }>;
    bytes: z.ZodNumber;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
}, z.core.$strict>;
export type EntryImage = z.infer<typeof EntryImageSchema>;
export declare const ENTRY_IMAGE_MAX = 64;
export declare const ContextImageRecordSchema: z.ZodObject<{
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "image/webp": "image/webp";
        "image/gif": "image/gif";
    }>;
    bytes: z.ZodNumber;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    entry_id: z.ZodString;
    delivery: z.ZodEnum<{
        image: "image";
        note: "note";
    }>;
    tokens: z.ZodNumber;
    reason: z.ZodOptional<z.ZodEnum<{
        "model-without-image-input": "model-without-image-input";
        "image-too-large": "image-too-large";
        "image-count-limit": "image-count-limit";
        "image-unavailable": "image-unavailable";
    }>>;
}, z.core.$strict>;
export type ContextImageRecord = z.infer<typeof ContextImageRecordSchema>;
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
export declare function spanHash(bytes: string): string;
export declare function artifactCitation(artifact_ref: string, bytes: string, offset: number): Citation;
export declare function parseArtifactLocator(locator: string | undefined): {
    offset: number;
    length: number;
} | null;
export type SpanResolution = {
    status: 'resolved';
    bytes: string;
    classification?: string;
} | {
    status: 'missing';
} | {
    status: 'hash_mismatch';
} | {
    status: 'stale';
    reason: string;
};
export interface SpanResolver {
    resolve(citation: Citation): SpanResolution;
    resolveCurrent?(citations: readonly Citation[]): Promise<readonly SpanResolution[]>;
}
export declare function parseClaimSet(text: string): {
    ok: true;
    set: ClaimSet;
} | {
    ok: false;
    reason: string;
};
