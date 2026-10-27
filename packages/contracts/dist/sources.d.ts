import { z } from 'zod';
import type { MemoryClassification, SourceSearchMatch, SourceSearchSkip } from './vocab.js';
export declare const SOURCE_ACCESS_PROFILES: readonly ["local-read-only"];
export declare const SOURCE_INSTANCE_STATES: readonly ["ready", "disabled", "removed"];
export declare const SOURCE_LOCATOR_KINDS: readonly ["local-directory"];
export declare const SOURCE_OPERATIONS: readonly ["list", "stat", "read", "search", "document.extract"];
export declare const SOURCE_EXTRACTION_METHODS: readonly ["poppler-text", "tesseract-ocr"];
export declare const LOCAL_READ_ONLY_SOURCE_POLICY: Readonly<{
    readonly classification_floor: "public";
    readonly classification_ceiling: "internal";
}>;
export declare function sourceClassificationAdmitted(classification: MemoryClassification, floor?: MemoryClassification, ceiling?: MemoryClassification): boolean;
export declare const DOCUMENT_OCR_LANGUAGE_PATTERN: RegExp;
export declare const DOCUMENT_OCR_DEFAULT_LANGUAGES: readonly string[];
export declare const DOCUMENT_OCR_MAX_LANGUAGES = 4;
export declare const DOCUMENT_EXTRACTION_LIMITS: Readonly<{
    max_document_bytes: number;
    max_pages: 500;
    max_text_bytes: number;
    max_command_output_bytes: number;
    command_timeout_ms: 30000;
    max_image_edge_pixels: 12000;
    max_image_pixels: 50000000;
    max_page_image_bytes: number;
    max_extraction_image_bytes: number;
}>;
export declare const SourceExtractorIdentitySchema: z.ZodObject<{
    name: z.ZodLiteral<"zero-ar.pdf-extractor">;
    version: z.ZodString;
    poppler_version: z.ZodString;
    tesseract_version: z.ZodNullable<z.ZodString>;
    languages: z.ZodArray<z.ZodString>;
    dpi: z.ZodNumber;
    sandbox_mode: z.ZodEnum<{
        "linux-bwrap-no-network": "linux-bwrap-no-network";
        "resource-limited-process": "resource-limited-process";
        "oci-no-network-read-only": "oci-no-network-read-only";
    }>;
    binding: z.ZodEnum<{
        "host-process": "host-process";
        "oci-document": "oci-document";
    }>;
    image_digest: z.ZodNullable<z.ZodString>;
    code_hash: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type SourceExtractorIdentity = z.infer<typeof SourceExtractorIdentitySchema>;
export declare const SourceExtractorIdentityV1Schema: z.ZodObject<{
    name: z.ZodLiteral<"zero-ar.pdf-extractor">;
    version: z.ZodString;
    poppler_version: z.ZodString;
    tesseract_version: z.ZodNullable<z.ZodString>;
    language: z.ZodLiteral<"eng">;
    dpi: z.ZodNumber;
    sandbox_mode: z.ZodEnum<{
        "linux-bwrap-no-network": "linux-bwrap-no-network";
        "resource-limited-process": "resource-limited-process";
    }>;
}, z.core.$strict>;
export type SourceExtractorIdentityV1 = z.infer<typeof SourceExtractorIdentityV1Schema>;
export declare function extractorDefaultLanguages(identity: SourceExtractorIdentity | SourceExtractorIdentityV1): readonly string[];
export declare const SOURCE_SEARCH_LIMITS: Readonly<{
    max_sources: 16;
    max_terms: 16;
    default_max_matches: 10;
    max_matches: 1000;
    default_max_matches_per_document: 3;
    max_matches_per_document: 100;
    default_window_chars: 200;
    max_window_chars: 4096;
    default_scan_bytes: 1048576;
    max_scan_bytes: number;
    read_window_bytes: 1048576;
    window_overlap_bytes: 16384;
    max_member_bytes: number;
    max_members_visited: 10000;
    max_skipped_named: 20;
    max_cursor_chars: 1024;
}>;
export declare function sourceTextMediaType(mediaType: string): boolean;
export declare const SourceLocatorSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"local-directory">;
    path: z.ZodString;
}, z.core.$strict>], "kind">;
export type SourceLocator = z.infer<typeof SourceLocatorSchema>;
export declare const SourceBoundsSchema: z.ZodObject<{
    max_items: z.ZodDefault<z.ZodNumber>;
    max_total_bytes: z.ZodDefault<z.ZodNumber>;
    max_item_bytes: z.ZodDefault<z.ZodNumber>;
    max_depth: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type SourceBounds = z.infer<typeof SourceBoundsSchema>;
export declare const RegisterSourceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    profile: z.ZodEnum<{
        "local-read-only": "local-read-only";
    }>;
    locator: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"local-directory">;
        path: z.ZodString;
    }, z.core.$strict>], "kind">;
    classification: z.ZodDefault<z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>>;
    evidence_grade: z.ZodDefault<z.ZodEnum<{
        original: "original";
        derived: "derived";
        "model-generated": "model-generated";
    }>>;
    bounds: z.ZodDefault<z.ZodObject<{
        max_items: z.ZodDefault<z.ZodNumber>;
        max_total_bytes: z.ZodDefault<z.ZodNumber>;
        max_item_bytes: z.ZodDefault<z.ZodNumber>;
        max_depth: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type RegisterSourceRequest = z.input<typeof RegisterSourceRequestSchema>;
export declare const SourceInstanceSchema: z.ZodObject<{
    source_ref: z.ZodString;
    name: z.ZodString;
    profile: z.ZodEnum<{
        "local-read-only": "local-read-only";
    }>;
    locator: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"local-directory">;
        path: z.ZodString;
    }, z.core.$strict>], "kind">;
    admitted_root_ref: z.ZodString;
    access: z.ZodLiteral<"read-only">;
    operations: z.ZodArray<z.ZodEnum<{
        search: "search";
        list: "list";
        stat: "stat";
        read: "read";
        "document.extract": "document.extract";
    }>>;
    destinations: z.ZodArray<z.ZodString>;
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
    bounds: z.ZodObject<{
        max_items: z.ZodDefault<z.ZodNumber>;
        max_total_bytes: z.ZodDefault<z.ZodNumber>;
        max_item_bytes: z.ZodDefault<z.ZodNumber>;
        max_depth: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    state: z.ZodEnum<{
        disabled: "disabled";
        ready: "ready";
        removed: "removed";
    }>;
    current_snapshot_ref: z.ZodNullable<z.ZodString>;
    registered_at: z.ZodString;
}, z.core.$strict>;
export type SourceInstance = z.infer<typeof SourceInstanceSchema>;
export declare const SourceListSchema: z.ZodObject<{
    sources: z.ZodArray<z.ZodObject<{
        source_ref: z.ZodString;
        name: z.ZodString;
        profile: z.ZodEnum<{
            "local-read-only": "local-read-only";
        }>;
        locator: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"local-directory">;
            path: z.ZodString;
        }, z.core.$strict>], "kind">;
        admitted_root_ref: z.ZodString;
        access: z.ZodLiteral<"read-only">;
        operations: z.ZodArray<z.ZodEnum<{
            search: "search";
            list: "list";
            stat: "stat";
            read: "read";
            "document.extract": "document.extract";
        }>>;
        destinations: z.ZodArray<z.ZodString>;
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
        bounds: z.ZodObject<{
            max_items: z.ZodDefault<z.ZodNumber>;
            max_total_bytes: z.ZodDefault<z.ZodNumber>;
            max_item_bytes: z.ZodDefault<z.ZodNumber>;
            max_depth: z.ZodDefault<z.ZodNumber>;
        }, z.core.$strict>;
        state: z.ZodEnum<{
            disabled: "disabled";
            ready: "ready";
            removed: "removed";
        }>;
        current_snapshot_ref: z.ZodNullable<z.ZodString>;
        registered_at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type SourceList = z.infer<typeof SourceListSchema>;
export declare const SourceSnapshotMemberSchema: z.ZodObject<{
    member_ref: z.ZodString;
    snapshot_ref: z.ZodString;
    locator: z.ZodString;
    artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
}, z.core.$strict>;
export type SourceSnapshotMember = z.infer<typeof SourceSnapshotMemberSchema>;
export declare const SourceSnapshotSchema: z.ZodObject<{
    snapshot_ref: z.ZodString;
    collection_ref: z.ZodString;
    binding_ref: z.ZodString;
    source_ref: z.ZodString;
    source_name: z.ZodString;
    profile: z.ZodEnum<{
        "local-read-only": "local-read-only";
    }>;
    item_count: z.ZodNumber;
    total_bytes: z.ZodNumber;
    manifest_artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    created_at: z.ZodString;
}, z.core.$strict>;
export type SourceSnapshot = z.infer<typeof SourceSnapshotSchema>;
export declare const SourceSnapshotPageRequestSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type SourceSnapshotPageRequest = z.infer<typeof SourceSnapshotPageRequestSchema>;
export declare const SourceSnapshotPageSchema: z.ZodObject<{
    snapshot: z.ZodObject<{
        snapshot_ref: z.ZodString;
        collection_ref: z.ZodString;
        binding_ref: z.ZodString;
        source_ref: z.ZodString;
        source_name: z.ZodString;
        profile: z.ZodEnum<{
            "local-read-only": "local-read-only";
        }>;
        item_count: z.ZodNumber;
        total_bytes: z.ZodNumber;
        manifest_artifact_ref: z.ZodString;
        manifest_ref: z.ZodString;
        created_at: z.ZodString;
    }, z.core.$strict>;
    members: z.ZodArray<z.ZodObject<{
        member_ref: z.ZodString;
        snapshot_ref: z.ZodString;
        locator: z.ZodString;
        artifact_ref: z.ZodString;
        manifest_ref: z.ZodString;
        content_hash: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
    }, z.core.$strict>>;
    next_cursor: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type SourceSnapshotPage = z.infer<typeof SourceSnapshotPageSchema>;
export declare const SourceBindingInputSchema: z.ZodObject<{
    alias: z.ZodString;
    binding_ref: z.ZodString;
    required_for_completion: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strict>;
export type SourceBindingInput = z.input<typeof SourceBindingInputSchema>;
export declare const ResolvedSourceBindingSchema: z.ZodObject<{
    alias: z.ZodString;
    binding_ref: z.ZodString;
    source_ref: z.ZodString;
    source_name: z.ZodString;
    snapshot_ref: z.ZodString;
    collection_ref: z.ZodString;
    profile: z.ZodEnum<{
        "local-read-only": "local-read-only";
    }>;
    profile_ref: z.ZodString;
    admitted_root_ref: z.ZodString;
    classification_floor: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    classification_ceiling: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    destination_policy_ref: z.ZodString;
    operation_contract_ref: z.ZodString;
    operations: z.ZodArray<z.ZodEnum<{
        search: "search";
        list: "list";
        stat: "stat";
        read: "read";
        "document.extract": "document.extract";
    }>>;
    destinations: z.ZodArray<z.ZodString>;
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
    item_count: z.ZodNumber;
    total_bytes: z.ZodNumber;
    manifest_artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    extractor: z.ZodUnion<readonly [z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.pdf-extractor">;
        version: z.ZodString;
        poppler_version: z.ZodString;
        tesseract_version: z.ZodNullable<z.ZodString>;
        languages: z.ZodArray<z.ZodString>;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
            "oci-no-network-read-only": "oci-no-network-read-only";
        }>;
        binding: z.ZodEnum<{
            "host-process": "host-process";
            "oci-document": "oci-document";
        }>;
        image_digest: z.ZodNullable<z.ZodString>;
        code_hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>, z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.pdf-extractor">;
        version: z.ZodString;
        poppler_version: z.ZodString;
        tesseract_version: z.ZodNullable<z.ZodString>;
        language: z.ZodLiteral<"eng">;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
        }>;
    }, z.core.$strict>]>;
    required_for_completion: z.ZodBoolean;
}, z.core.$strict>;
export type ResolvedSourceBinding = z.infer<typeof ResolvedSourceBindingSchema>;
export declare const SourcePreflightSchema: z.ZodObject<{
    source_ref: z.ZodString;
    source_name: z.ZodString;
    profile: z.ZodEnum<{
        "local-read-only": "local-read-only";
    }>;
    state: z.ZodEnum<{
        disabled: "disabled";
        ready: "ready";
        removed: "removed";
    }>;
    resolved_path: z.ZodString;
    readable: z.ZodBoolean;
    operations: z.ZodArray<z.ZodEnum<{
        search: "search";
        list: "list";
        stat: "stat";
        read: "read";
        "document.extract": "document.extract";
    }>>;
    destinations: z.ZodArray<z.ZodString>;
    classification: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    classification_floor: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    classification_ceiling: z.ZodEnum<{
        public: "public";
        internal: "internal";
        confidential: "confidential";
        restricted: "restricted";
    }>;
    admitted_root_ref: z.ZodString;
    destination_policy_ref: z.ZodString;
    bounds: z.ZodObject<{
        max_items: z.ZodDefault<z.ZodNumber>;
        max_total_bytes: z.ZodDefault<z.ZodNumber>;
        max_item_bytes: z.ZodDefault<z.ZodNumber>;
        max_depth: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
    extractor: z.ZodNullable<z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.pdf-extractor">;
        version: z.ZodString;
        poppler_version: z.ZodString;
        tesseract_version: z.ZodNullable<z.ZodString>;
        languages: z.ZodArray<z.ZodString>;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
            "oci-no-network-read-only": "oci-no-network-read-only";
        }>;
        binding: z.ZodEnum<{
            "host-process": "host-process";
            "oci-document": "oci-document";
        }>;
        image_digest: z.ZodNullable<z.ZodString>;
        code_hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    budget_requirements: z.ZodObject<{
        tool_calls_per_operation: z.ZodLiteral<1>;
        max_read_bytes: z.ZodNumber;
        max_extract_input_bytes: z.ZodNumber;
        max_extract_compute_ms: z.ZodNumber;
    }, z.core.$strict>;
    extraction_limits: z.ZodObject<{
        max_pdf_bytes: z.ZodNumber;
        max_pages: z.ZodNumber;
        max_text_bytes: z.ZodNumber;
        max_command_output_bytes: z.ZodNumber;
        command_timeout_ms: z.ZodNumber;
        max_image_edge_pixels: z.ZodNumber;
        max_image_pixels: z.ZodNumber;
        max_page_image_bytes: z.ZodNumber;
        max_extraction_image_bytes: z.ZodNumber;
    }, z.core.$strict>;
    validator_coverage: z.ZodArray<z.ZodString>;
    completion_reachability: z.ZodLiteral<"run-contract-dependent">;
    snapshot_ready: z.ZodBoolean;
    current_snapshot_ref: z.ZodNullable<z.ZodString>;
    item_count: z.ZodNullable<z.ZodNumber>;
    total_bytes: z.ZodNullable<z.ZodNumber>;
    refusals: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type SourcePreflight = z.infer<typeof SourcePreflightSchema>;
export declare const SourceOperationRequestSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    source_alias: z.ZodString;
    operation: z.ZodLiteral<"list">;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    source_alias: z.ZodString;
    operation: z.ZodLiteral<"stat">;
    locator: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    source_alias: z.ZodString;
    operation: z.ZodLiteral<"read">;
    locator: z.ZodString;
    offset: z.ZodNumber;
    length: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    source_alias: z.ZodOptional<z.ZodString>;
    source_aliases: z.ZodOptional<z.ZodArray<z.ZodString>>;
    operation: z.ZodLiteral<"search">;
    query: z.ZodString;
    match: z.ZodOptional<z.ZodEnum<{
        exact: "exact";
        "all-terms": "all-terms";
        "any-term": "any-term";
        phrase: "phrase";
    }>>;
    window_chars: z.ZodOptional<z.ZodNumber>;
    max_matches: z.ZodOptional<z.ZodNumber>;
    max_matches_per_document: z.ZodOptional<z.ZodNumber>;
    max_scan_bytes: z.ZodOptional<z.ZodNumber>;
    cursor: z.ZodOptional<z.ZodString>;
}, z.core.$strict>, z.ZodObject<{
    source_alias: z.ZodOptional<z.ZodString>;
    operation: z.ZodLiteral<"document.extract">;
    locator: z.ZodOptional<z.ZodString>;
    artifact_ref: z.ZodOptional<z.ZodString>;
    max_pages: z.ZodOptional<z.ZodNumber>;
    languages: z.ZodOptional<z.ZodArray<z.ZodString>>;
    first_page: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>], "operation">;
export type SourceOperationRequest = z.infer<typeof SourceOperationRequestSchema>;
export interface SourceSearchRequest {
    query: string;
    match: SourceSearchMatch;
    window_chars: number;
    max_matches: number;
    max_matches_per_document: number;
    max_scan_bytes: number;
    cursor?: string;
}
export interface SourceSearchMatchHit {
    source_alias: string;
    locator: string;
    page?: number;
    offset: number;
    length: number;
    context: string;
    score: number;
}
export interface SourceSearchSkipped {
    source_alias: string;
    locator: string;
    bytes: number;
    reason: SourceSearchSkip;
}
export interface SourceSearchResult {
    query: string;
    match: SourceSearchMatch;
    source_aliases: string[];
    matches: SourceSearchMatchHit[];
    documents_matched: number;
    matches_not_returned: number;
    scanned_bytes: number;
    scanned_members: number;
    skipped: SourceSearchSkipped[];
    skipped_count: number;
    truncated: boolean;
    next_cursor: string | null;
}
export declare const SourceOperationResultSchema: z.ZodObject<{
    source_alias: z.ZodString;
    operation: z.ZodEnum<{
        search: "search";
        list: "list";
        stat: "stat";
        read: "read";
        "document.extract": "document.extract";
    }>;
    snapshot_ref: z.ZodString;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    bytes_read: z.ZodNumber;
    compute_ms: z.ZodNumber;
    provenance_ref: z.ZodString;
}, z.core.$strict>;
export type SourceOperationResult = z.infer<typeof SourceOperationResultSchema>;
export declare const DOCUMENT_EXTRACTION_INLINE_TEXT_BYTES = 2048;
export declare const DocumentPageImageSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kept: z.ZodLiteral<true>;
    artifact_ref: z.ZodString;
    content_hash: z.ZodString;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
    }>;
    bytes: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    kept: z.ZodLiteral<false>;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
    }>;
    bytes: z.ZodNumber;
    reason: z.ZodEnum<{
        "page-image-bytes": "page-image-bytes";
        "extraction-image-bytes": "extraction-image-bytes";
    }>;
    max_bytes: z.ZodNumber;
}, z.core.$strict>], "kept">;
export type DocumentPageImage = z.infer<typeof DocumentPageImageSchema>;
export declare const DocumentExtractionPageSchema: z.ZodObject<{
    page: z.ZodNumber;
    width: z.ZodNullable<z.ZodNumber>;
    height: z.ZodNullable<z.ZodNumber>;
    coordinate_space: z.ZodEnum<{
        "pdf-points": "pdf-points";
        "image-pixels": "image-pixels";
    }>;
    text_artifact_ref: z.ZodString;
    text_content_hash: z.ZodString;
    text_bytes: z.ZodNumber;
    method: z.ZodEnum<{
        "poppler-text": "poppler-text";
        "tesseract-ocr": "tesseract-ocr";
    }>;
    confidence: z.ZodNullable<z.ZodNumber>;
    text: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
        kept: z.ZodLiteral<true>;
        artifact_ref: z.ZodString;
        content_hash: z.ZodString;
        media_type: z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
        }>;
        bytes: z.ZodNumber;
    }, z.core.$strict>, z.ZodObject<{
        kept: z.ZodLiteral<false>;
        media_type: z.ZodEnum<{
            "image/png": "image/png";
            "image/jpeg": "image/jpeg";
        }>;
        bytes: z.ZodNumber;
        reason: z.ZodEnum<{
            "page-image-bytes": "page-image-bytes";
            "extraction-image-bytes": "extraction-image-bytes";
        }>;
        max_bytes: z.ZodNumber;
    }, z.core.$strict>], "kept">>;
}, z.core.$strict>;
export type DocumentExtractionPage = z.infer<typeof DocumentExtractionPageSchema>;
export declare function inlinePageNumbers(pages: readonly {
    page: number;
    text_bytes: number;
}[], budget?: number): Set<number>;
export declare const DOCUMENT_EXTRACTION_DEFAULT_MAX_PAGES = 100;
export declare const DOCUMENT_EXTRACTION_TEXT_WINDOW_BYTES = 3072;
export declare const DocumentTextWindowPageSchema: z.ZodObject<{
    page: z.ZodNumber;
    text_artifact_ref: z.ZodString;
    text_content_hash: z.ZodString;
    text_bytes: z.ZodNumber;
    shown_bytes: z.ZodNumber;
}, z.core.$strict>;
export declare const DocumentTextWindowSchema: z.ZodObject<{
    first_page: z.ZodNumber;
    text: z.ZodString;
    pages: z.ZodArray<z.ZodObject<{
        page: z.ZodNumber;
        text_artifact_ref: z.ZodString;
        text_content_hash: z.ZodString;
        text_bytes: z.ZodNumber;
        shown_bytes: z.ZodNumber;
    }, z.core.$strict>>;
    next: z.ZodNullable<z.ZodObject<{
        page: z.ZodNumber;
        offset: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DocumentTextWindow = z.infer<typeof DocumentTextWindowSchema>;
export declare function documentTextWindow(pages: readonly {
    page: number;
    text_artifact_ref: string;
    text_content_hash: string;
    text_bytes: number;
}[], texts: ReadonlyMap<number, string>, firstPage?: number, budget?: number): DocumentTextWindow | null;
export declare const DocumentExtractionReuseSchema: z.ZodObject<{
    extraction_ref: z.ZodString;
    run_id: z.ZodString;
    record_id: z.ZodString;
}, z.core.$strict>;
export type DocumentExtractionReuse = z.infer<typeof DocumentExtractionReuseSchema>;
export declare const KeptDocumentExtractionSchema: z.ZodObject<{
    extraction_ref: z.ZodString;
    content_hash: z.ZodString;
    extractor_ref: z.ZodString;
    extractor: z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.pdf-extractor">;
        version: z.ZodString;
        poppler_version: z.ZodString;
        tesseract_version: z.ZodNullable<z.ZodString>;
        languages: z.ZodArray<z.ZodString>;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
            "oci-no-network-read-only": "oci-no-network-read-only";
        }>;
        binding: z.ZodEnum<{
            "host-process": "host-process";
            "oci-document": "oci-document";
        }>;
        image_digest: z.ZodNullable<z.ZodString>;
        code_hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "application/pdf": "application/pdf";
    }>;
    page_count: z.ZodNumber;
    truncated: z.ZodBoolean;
    max_pages: z.ZodNumber;
    pages: z.ZodArray<z.ZodObject<{
        page: z.ZodNumber;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        coordinate_space: z.ZodEnum<{
            "pdf-points": "pdf-points";
            "image-pixels": "image-pixels";
        }>;
        text_artifact_ref: z.ZodString;
        text_content_hash: z.ZodString;
        text_bytes: z.ZodNumber;
        method: z.ZodEnum<{
            "poppler-text": "poppler-text";
            "tesseract-ocr": "tesseract-ocr";
        }>;
        confidence: z.ZodNullable<z.ZodNumber>;
        image: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kept: z.ZodLiteral<true>;
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
            media_type: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
            }>;
            bytes: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kept: z.ZodLiteral<false>;
            media_type: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
            }>;
            bytes: z.ZodNumber;
            reason: z.ZodEnum<{
                "page-image-bytes": "page-image-bytes";
                "extraction-image-bytes": "extraction-image-bytes";
            }>;
            max_bytes: z.ZodNumber;
        }, z.core.$strict>], "kept">>;
    }, z.core.$strict>>;
    run_id: z.ZodString;
    record_id: z.ZodString;
    manifest_artifact_ref: z.ZodString;
    kept_at: z.ZodString;
}, z.core.$strict>;
export type KeptDocumentExtraction = z.infer<typeof KeptDocumentExtractionSchema>;
export declare function documentExtractorRef(identity: SourceExtractorIdentity): string;
export declare const DocumentExtractionResultSchema: z.ZodObject<{
    source_alias: z.ZodString;
    member_ref: z.ZodString;
    original_artifact_ref: z.ZodString;
    original_content_hash: z.ZodString;
    media_type: z.ZodEnum<{
        "image/png": "image/png";
        "image/jpeg": "image/jpeg";
        "application/pdf": "application/pdf";
    }>;
    extractor: z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.pdf-extractor">;
        version: z.ZodString;
        poppler_version: z.ZodString;
        tesseract_version: z.ZodNullable<z.ZodString>;
        languages: z.ZodArray<z.ZodString>;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
            "oci-no-network-read-only": "oci-no-network-read-only";
        }>;
        binding: z.ZodEnum<{
            "host-process": "host-process";
            "oci-document": "oci-document";
        }>;
        image_digest: z.ZodNullable<z.ZodString>;
        code_hash: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    pages: z.ZodArray<z.ZodObject<{
        page: z.ZodNumber;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        coordinate_space: z.ZodEnum<{
            "pdf-points": "pdf-points";
            "image-pixels": "image-pixels";
        }>;
        text_artifact_ref: z.ZodString;
        text_content_hash: z.ZodString;
        text_bytes: z.ZodNumber;
        method: z.ZodEnum<{
            "poppler-text": "poppler-text";
            "tesseract-ocr": "tesseract-ocr";
        }>;
        confidence: z.ZodNullable<z.ZodNumber>;
        text: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodDiscriminatedUnion<[z.ZodObject<{
            kept: z.ZodLiteral<true>;
            artifact_ref: z.ZodString;
            content_hash: z.ZodString;
            media_type: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
            }>;
            bytes: z.ZodNumber;
        }, z.core.$strict>, z.ZodObject<{
            kept: z.ZodLiteral<false>;
            media_type: z.ZodEnum<{
                "image/png": "image/png";
                "image/jpeg": "image/jpeg";
            }>;
            bytes: z.ZodNumber;
            reason: z.ZodEnum<{
                "page-image-bytes": "page-image-bytes";
                "extraction-image-bytes": "extraction-image-bytes";
            }>;
            max_bytes: z.ZodNumber;
        }, z.core.$strict>], "kept">>;
    }, z.core.$strict>>;
    page_count: z.ZodNumber;
    total_text_bytes: z.ZodNumber;
    truncated: z.ZodBoolean;
    max_pages: z.ZodOptional<z.ZodNumber>;
    manifest_artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    provenance_ref: z.ZodString;
    text_window: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        first_page: z.ZodNumber;
        text: z.ZodString;
        pages: z.ZodArray<z.ZodObject<{
            page: z.ZodNumber;
            text_artifact_ref: z.ZodString;
            text_content_hash: z.ZodString;
            text_bytes: z.ZodNumber;
            shown_bytes: z.ZodNumber;
        }, z.core.$strict>>;
        next: z.ZodNullable<z.ZodObject<{
            page: z.ZodNumber;
            offset: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>>;
    reused_from: z.ZodOptional<z.ZodObject<{
        extraction_ref: z.ZodString;
        run_id: z.ZodString;
        record_id: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DocumentExtractionResult = z.infer<typeof DocumentExtractionResultSchema>;
