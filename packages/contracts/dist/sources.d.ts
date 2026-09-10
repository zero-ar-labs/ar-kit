/**
 * Public source registration, snapshot and run-binding contracts.
 *
 * A source instance is mutable operator configuration. A snapshot,
 * collection, member and binding are separate immutable identities. Runs
 * accept only resolved binding refs, then pin the expanded descriptor.
 */
import { z } from 'zod';
import type { MemoryClassification } from './vocab.js';
export declare const SOURCE_ACCESS_PROFILES: readonly ["local-read-only"];
export declare const SOURCE_INSTANCE_STATES: readonly ["ready", "disabled", "removed"];
export declare const SOURCE_LOCATOR_KINDS: readonly ["local-directory"];
export declare const SOURCE_OPERATIONS: readonly ["list", "stat", "read", "search", "document.extract"];
export declare const SOURCE_EXTRACTION_METHODS: readonly ["poppler-text", "tesseract-ocr"];
/** The active profile's fixed classification range. Deployment destinations remain separately configured. */
export declare const LOCAL_READ_ONLY_SOURCE_POLICY: Readonly<{
    readonly classification_floor: "public";
    readonly classification_ceiling: "internal";
}>;
/** Compare labels using the one contracts-owned classification ordering. */
export declare function sourceClassificationAdmitted(classification: MemoryClassification, floor?: MemoryClassification, ceiling?: MemoryClassification): boolean;
export declare const SourceExtractorIdentitySchema: z.ZodObject<{
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
export type SourceExtractorIdentity = z.infer<typeof SourceExtractorIdentitySchema>;
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
/** Public caller input; the schema fills classification, evidence and bounds defaults. */
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
        ready: "ready";
        disabled: "disabled";
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
            ready: "ready";
            disabled: "disabled";
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
/** Public caller input; required_for_completion defaults to true at intake. */
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
    extractor: z.ZodObject<{
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
        ready: "ready";
        disabled: "disabled";
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
        language: z.ZodLiteral<"eng">;
        dpi: z.ZodNumber;
        sandbox_mode: z.ZodEnum<{
            "linux-bwrap-no-network": "linux-bwrap-no-network";
            "resource-limited-process": "resource-limited-process";
        }>;
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
    source_alias: z.ZodString;
    operation: z.ZodLiteral<"search">;
    query: z.ZodString;
    max_matches: z.ZodOptional<z.ZodNumber>;
    max_scan_bytes: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    source_alias: z.ZodString;
    operation: z.ZodLiteral<"document.extract">;
    locator: z.ZodString;
    max_pages: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>], "operation">;
export type SourceOperationRequest = z.infer<typeof SourceOperationRequestSchema>;
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
export declare const DocumentExtractionPageSchema: z.ZodObject<{
    page: z.ZodNumber;
    width: z.ZodNullable<z.ZodNumber>;
    height: z.ZodNullable<z.ZodNumber>;
    coordinate_space: z.ZodLiteral<"pdf-points">;
    text_artifact_ref: z.ZodString;
    text_content_hash: z.ZodString;
    text_bytes: z.ZodNumber;
    method: z.ZodEnum<{
        "poppler-text": "poppler-text";
        "tesseract-ocr": "tesseract-ocr";
    }>;
    confidence: z.ZodNullable<z.ZodNumber>;
}, z.core.$strict>;
export type DocumentExtractionPage = z.infer<typeof DocumentExtractionPageSchema>;
export declare const DocumentExtractionResultSchema: z.ZodObject<{
    source_alias: z.ZodString;
    member_ref: z.ZodString;
    original_artifact_ref: z.ZodString;
    original_content_hash: z.ZodString;
    media_type: z.ZodLiteral<"application/pdf">;
    extractor: z.ZodObject<{
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
    pages: z.ZodArray<z.ZodObject<{
        page: z.ZodNumber;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        coordinate_space: z.ZodLiteral<"pdf-points">;
        text_artifact_ref: z.ZodString;
        text_content_hash: z.ZodString;
        text_bytes: z.ZodNumber;
        method: z.ZodEnum<{
            "poppler-text": "poppler-text";
            "tesseract-ocr": "tesseract-ocr";
        }>;
        confidence: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strict>>;
    page_count: z.ZodNumber;
    total_text_bytes: z.ZodNumber;
    truncated: z.ZodBoolean;
    manifest_artifact_ref: z.ZodString;
    manifest_ref: z.ZodString;
    provenance_ref: z.ZodString;
}, z.core.$strict>;
export type DocumentExtractionResult = z.infer<typeof DocumentExtractionResultSchema>;
