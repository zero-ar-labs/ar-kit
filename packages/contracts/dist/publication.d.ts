/**
 * Publication contracts (hosted-publication appendix, phase HP0).
 *
 * What this is: the canonical shapes of a publication closure. A bundle
 * carries one root declaration, its complete dependency graph, and
 * content-addressed assets; a receipt names exactly what was admitted and
 * stored and what that does not establish. Names and versions are
 * discovery aids; runs pin content refs (PUB-004, PUB-005).
 *
 * How it fits: these shapes ride the operator-management contract family.
 * They add no runtime state machine and no execution authority. The SDK
 * compiles bundles, the server admits them, and both speak only these
 * generated contracts (PUB-014, PUB-024).
 */
import { z } from 'zod';
/** One compiled declaration in the closure, named for discovery, pinned by ref. */
export declare const PublicationDeclarationEntrySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        posture: "posture";
        semantic: "semantic";
        "domain-pack": "domain-pack";
        "binding-profile": "binding-profile";
    }>;
    name: z.ZodString;
    version: z.ZodString;
    content_ref: z.ZodString;
}, z.core.$strict>;
export type PublicationDeclarationEntry = z.infer<typeof PublicationDeclarationEntrySchema>;
/** One content-addressed asset: exact bytes a declaration includes. */
export declare const PublicationAssetEntrySchema: z.ZodObject<{
    content_ref: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodString;
    role: z.ZodString;
}, z.core.$strict>;
export type PublicationAssetEntry = z.infer<typeof PublicationAssetEntrySchema>;
/** One typed edge; the closure is complete when every edge resolves inside the bundle. */
export declare const PublicationDependencyEdgeSchema: z.ZodObject<{
    from_ref: z.ZodString;
    to_ref: z.ZodString;
    kind: z.ZodEnum<{
        requires: "requires";
        includes: "includes";
    }>;
}, z.core.$strict>;
export type PublicationDependencyEdge = z.infer<typeof PublicationDependencyEdgeSchema>;
/**
 * The canonical bundle manifest. Sorted lists and relative paths keep it
 * deterministic: identical sources compile to an identical bundle_ref on
 * any supported machine (PUB-001, PUB-010).
 */
export declare const PublicationBundleManifestSchema: z.ZodObject<{
    format_version: z.ZodLiteral<"1.0.0">;
    root_kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        posture: "posture";
        semantic: "semantic";
        "domain-pack": "domain-pack";
        "binding-profile": "binding-profile";
    }>;
    root_ref: z.ZodString;
    declarations: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            posture: "posture";
            semantic: "semantic";
            "domain-pack": "domain-pack";
            "binding-profile": "binding-profile";
        }>;
        name: z.ZodString;
        version: z.ZodString;
        content_ref: z.ZodString;
    }, z.core.$strict>>;
    assets: z.ZodArray<z.ZodObject<{
        content_ref: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
        classification: z.ZodString;
        role: z.ZodString;
    }, z.core.$strict>>;
    edges: z.ZodArray<z.ZodObject<{
        from_ref: z.ZodString;
        to_ref: z.ZodString;
        kind: z.ZodEnum<{
            requires: "requires";
            includes: "includes";
        }>;
    }, z.core.$strict>>;
    compiler: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        canonicalization: z.ZodString;
    }, z.core.$strict>;
    source_maps: z.ZodArray<z.ZodObject<{
        content_ref: z.ZodString;
        path: z.ZodString;
        source_content_ref: z.ZodOptional<z.ZodString>;
        source_format: z.ZodOptional<z.ZodEnum<{
            "ramsden/v1": "ramsden/v1";
            "zero-ar/v1": "zero-ar/v1";
        }>>;
    }, z.core.$strict>>;
    conformance: z.ZodArray<z.ZodObject<{
        check: z.ZodString;
        outcome: z.ZodEnum<{
            refused: "refused";
            pass: "pass";
        }>;
    }, z.core.$strict>>;
    claims: z.ZodArray<z.ZodObject<{
        kind: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>;
    requested_aliases: z.ZodArray<z.ZodString>;
    bundle_ref: z.ZodString;
}, z.core.$strict>;
export type PublicationBundleManifest = z.infer<typeof PublicationBundleManifestSchema>;
/** The compiled procedure: exact resources, discovery metadata, and no executable capability (PUB-011). */
export declare const ProcedureManifestSchema: z.ZodObject<{
    kind: z.ZodLiteral<"procedure">;
    name: z.ZodString;
    version: z.ZodString;
    entry_ref: z.ZodString;
    description: z.ZodString;
    discovery: z.ZodObject<{
        topics: z.ZodArray<z.ZodString>;
        summary: z.ZodString;
    }, z.core.$strict>;
    resources: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content_ref: z.ZodString;
        bytes: z.ZodNumber;
        media_type: z.ZodString;
    }, z.core.$strict>>;
    executable: z.ZodLiteral<false>;
    entry_bytes: z.ZodOptional<z.ZodNumber>;
    allowed_tools: z.ZodOptional<z.ZodArray<z.ZodString>>;
    activation: z.ZodOptional<z.ZodEnum<{
        progressive: "progressive";
        always: "always";
    }>>;
}, z.core.$strict>;
export type ProcedureManifest = z.infer<typeof ProcedureManifestSchema>;
/**
 * What a commit establishes: the named closure was admitted and stored,
 * immutably. It does not establish domain correctness, authorize effects,
 * or prove an external implementation benevolent (PUB-013).
 */
export declare const PublicationReceiptSchema: z.ZodObject<{
    publication_ref: z.ZodString;
    bundle_ref: z.ZodString;
    root_kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        posture: "posture";
        semantic: "semantic";
        "domain-pack": "domain-pack";
        "binding-profile": "binding-profile";
    }>;
    root_ref: z.ZodString;
    agent_ref: z.ZodNullable<z.ZodString>;
    tenant: z.ZodString;
    accountable: z.ZodString;
    compiler: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        canonicalization: z.ZodString;
    }, z.core.$strict>;
    counts: z.ZodObject<{
        declarations: z.ZodNumber;
        assets: z.ZodNumber;
        total_bytes: z.ZodNumber;
    }, z.core.$strict>;
    closure_hash: z.ZodString;
    aliases: z.ZodArray<z.ZodObject<{
        alias: z.ZodString;
        outcome: z.ZodEnum<{
            refused: "refused";
            set: "set";
        }>;
    }, z.core.$strict>>;
    committed_at: z.ZodString;
    establishes: z.ZodLiteral<"admitted-and-stored-only">;
}, z.core.$strict>;
export type PublicationReceipt = z.infer<typeof PublicationReceiptSchema>;
/**
 * Recompute everything a bundle claims: its own ref, every declaration
 * and asset hash, and every closure edge. A single changed byte or a
 * missing edge target refuses by name, before any commit (PUB-004).
 * Pure over the manifest and blobs, so the compiler, the registry, and
 * any future host all verify with the one implementation.
 */
export declare function verifyBundle(bundle: PublicationBundleManifest, blobs: Map<string, string>): void;
/** Open an upload session over one compiled bundle; nothing becomes discoverable here (PUB-006). */
export declare const PublicationSessionRequestSchema: z.ZodObject<{
    bundle: z.ZodObject<{
        format_version: z.ZodLiteral<"1.0.0">;
        root_kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            posture: "posture";
            semantic: "semantic";
            "domain-pack": "domain-pack";
            "binding-profile": "binding-profile";
        }>;
        root_ref: z.ZodString;
        declarations: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                procedure: "procedure";
                tool: "tool";
                "task-contract": "task-contract";
                agent: "agent";
                validator: "validator";
                posture: "posture";
                semantic: "semantic";
                "domain-pack": "domain-pack";
                "binding-profile": "binding-profile";
            }>;
            name: z.ZodString;
            version: z.ZodString;
            content_ref: z.ZodString;
        }, z.core.$strict>>;
        assets: z.ZodArray<z.ZodObject<{
            content_ref: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        edges: z.ZodArray<z.ZodObject<{
            from_ref: z.ZodString;
            to_ref: z.ZodString;
            kind: z.ZodEnum<{
                requires: "requires";
                includes: "includes";
            }>;
        }, z.core.$strict>>;
        compiler: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            canonicalization: z.ZodString;
        }, z.core.$strict>;
        source_maps: z.ZodArray<z.ZodObject<{
            content_ref: z.ZodString;
            path: z.ZodString;
            source_content_ref: z.ZodOptional<z.ZodString>;
            source_format: z.ZodOptional<z.ZodEnum<{
                "ramsden/v1": "ramsden/v1";
                "zero-ar/v1": "zero-ar/v1";
            }>>;
        }, z.core.$strict>>;
        conformance: z.ZodArray<z.ZodObject<{
            check: z.ZodString;
            outcome: z.ZodEnum<{
                refused: "refused";
                pass: "pass";
            }>;
        }, z.core.$strict>>;
        claims: z.ZodArray<z.ZodObject<{
            kind: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>;
        requested_aliases: z.ZodArray<z.ZodString>;
        bundle_ref: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PublicationSessionRequest = z.infer<typeof PublicationSessionRequestSchema>;
export declare const PublicationSessionSchema: z.ZodObject<{
    session_id: z.ZodString;
    missing_blobs: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type PublicationSession = z.infer<typeof PublicationSessionSchema>;
export declare const PublicationBlobFrameSchema: z.ZodObject<{
    content_ref: z.ZodString;
    bytes: z.ZodString;
}, z.core.$strict>;
export type PublicationBlobFrame = z.infer<typeof PublicationBlobFrameSchema>;
export declare const PublicationBlobAckSchema: z.ZodObject<{
    content_ref: z.ZodString;
    staged: z.ZodBoolean;
}, z.core.$strict>;
export type PublicationBlobAck = z.infer<typeof PublicationBlobAckSchema>;
/** Resumable large-blob position. Chunks travel as bounded raw bytes, not JSON strings. */
export declare const PublicationBlobUploadStatusSchema: z.ZodObject<{
    content_ref: z.ZodString;
    offset: z.ZodNumber;
}, z.core.$strict>;
export type PublicationBlobUploadStatus = z.infer<typeof PublicationBlobUploadStatusSchema>;
export declare const PublicationBlobUploadFinishSchema: z.ZodObject<{
    content_ref: z.ZodString;
    staged: z.ZodLiteral<true>;
    bytes: z.ZodNumber;
}, z.core.$strict>;
export type PublicationBlobUploadFinish = z.infer<typeof PublicationBlobUploadFinishSchema>;
export declare const PublicationCommitRequestSchema: z.ZodObject<{}, z.core.$strict>;
export type PublicationCommitRequest = z.infer<typeof PublicationCommitRequestSchema>;
export declare const PublicationViewSchema: z.ZodObject<{
    receipt: z.ZodObject<{
        publication_ref: z.ZodString;
        bundle_ref: z.ZodString;
        root_kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            posture: "posture";
            semantic: "semantic";
            "domain-pack": "domain-pack";
            "binding-profile": "binding-profile";
        }>;
        root_ref: z.ZodString;
        agent_ref: z.ZodNullable<z.ZodString>;
        tenant: z.ZodString;
        accountable: z.ZodString;
        compiler: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            canonicalization: z.ZodString;
        }, z.core.$strict>;
        counts: z.ZodObject<{
            declarations: z.ZodNumber;
            assets: z.ZodNumber;
            total_bytes: z.ZodNumber;
        }, z.core.$strict>;
        closure_hash: z.ZodString;
        aliases: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            outcome: z.ZodEnum<{
                refused: "refused";
                set: "set";
            }>;
        }, z.core.$strict>>;
        committed_at: z.ZodString;
        establishes: z.ZodLiteral<"admitted-and-stored-only">;
    }, z.core.$strict>;
}, z.core.$strict>;
export type PublicationView = z.infer<typeof PublicationViewSchema>;
/** One authorized immutable declaration, with its lifecycle annotations. */
export declare const DeclarationViewSchema: z.ZodObject<{
    content_ref: z.ZodString;
    bytes: z.ZodString;
    deprecated: z.ZodNullable<z.ZodString>;
    quarantined: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type DeclarationView = z.infer<typeof DeclarationViewSchema>;
export declare const AliasMutationRequestSchema: z.ZodObject<{
    alias: z.ZodString;
    content_ref: z.ZodString;
}, z.core.$strict>;
export type AliasMutationRequest = z.infer<typeof AliasMutationRequestSchema>;
export declare const AliasMutationResultSchema: z.ZodObject<{
    alias: z.ZodString;
    content_ref: z.ZodString;
    moved: z.ZodLiteral<true>;
}, z.core.$strict>;
export type AliasMutationResult = z.infer<typeof AliasMutationResultSchema>;
export declare const DeprecationRequestSchema: z.ZodObject<{
    content_ref: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type DeprecationRequest = z.infer<typeof DeprecationRequestSchema>;
export declare const QuarantineRequestSchema: z.ZodObject<{
    content_ref: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type QuarantineRequest = z.infer<typeof QuarantineRequestSchema>;
/** The shared outcome of an annotation act: recorded, durably, nothing rewritten. */
export declare const RegistryActOutcomeSchema: z.ZodObject<{
    content_ref: z.ZodString;
    recorded: z.ZodLiteral<true>;
}, z.core.$strict>;
export type RegistryActOutcome = z.infer<typeof RegistryActOutcomeSchema>;
/** One explicit operator/governance note that an identity migration changed a live surface. */
export declare const IdentityMigrationEventRequestSchema: z.ZodObject<{
    impact: z.ZodEnum<{
        deployment: "deployment";
        "publication-namespace": "publication-namespace";
        "compatibility-policy": "compatibility-policy";
    }>;
    surface: z.ZodString;
    decision_ref: z.ZodString;
    source_ref: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type IdentityMigrationEventRequest = z.infer<typeof IdentityMigrationEventRequestSchema>;
export declare const IdentityMigrationEventOutcomeSchema: z.ZodObject<{
    recorded: z.ZodLiteral<true>;
    action: z.ZodLiteral<"identity-migration.recorded">;
    impact: z.ZodEnum<{
        deployment: "deployment";
        "publication-namespace": "publication-namespace";
        "compatibility-policy": "compatibility-policy";
    }>;
    surface: z.ZodString;
    from_identity: z.ZodString;
    to_identity: z.ZodString;
    identity_source_ref: z.ZodString;
    decision_ref: z.ZodString;
    source_ref: z.ZodString;
}, z.core.$strict>;
export type IdentityMigrationEventOutcome = z.infer<typeof IdentityMigrationEventOutcomeSchema>;
/** Cell intake drain: new admissions refuse while drained; running work continues (operator procedure). */
export declare const DrainRequestSchema: z.ZodObject<{
    drained: z.ZodBoolean;
    reason: z.ZodString;
}, z.core.$strict>;
export type DrainRequest = z.infer<typeof DrainRequestSchema>;
export declare const DrainOutcomeSchema: z.ZodObject<{
    drained: z.ZodBoolean;
    recorded: z.ZodLiteral<true>;
}, z.core.$strict>;
export type DrainOutcome = z.infer<typeof DrainOutcomeSchema>;
/**
 * One reconciliation sweep over a run's open effects, through the dispatcher's
 * ladder. A diagnostic says why an effect did not settle on this pass: its
 * owner could not be reached, its target is no longer registered, its
 * dispatch is still in flight, or a newer record superseded the answer.
 */
export declare const ReconciliationOutcomeSchema: z.ZodObject<{
    reconciled: z.ZodArray<z.ZodObject<{
        effect_id: z.ZodString;
        state: z.ZodString;
        diagnostic: z.ZodOptional<z.ZodObject<{
            code: z.ZodString;
            message: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ReconciliationOutcome = z.infer<typeof ReconciliationOutcomeSchema>;
/** The durable operator audit trail, newest last, read through the public surface alone. */
export declare const OperatorAuditPageSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodObject<{
        seq: z.ZodNumber;
        action: z.ZodString;
        detail: z.ZodString;
        actor: z.ZodString;
        at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type OperatorAuditPage = z.infer<typeof OperatorAuditPageSchema>;
/** One alias's moves, oldest first. Earlier runs keep the ref they pinned (PUB-018). */
export declare const AliasHistorySchema: z.ZodObject<{
    alias: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        content_ref: z.ZodString;
        moved_at: z.ZodString;
        actor: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AliasHistory = z.infer<typeof AliasHistorySchema>;
/** A registry name projection rebuilt from the immutable publication records alone (PUB-029). */
export declare const RegistryRebuildOutcomeSchema: z.ZodObject<{
    publications: z.ZodNumber;
    names: z.ZodNumber;
    equal: z.ZodBoolean;
}, z.core.$strict>;
export type RegistryRebuildOutcome = z.infer<typeof RegistryRebuildOutcomeSchema>;
/**
 * One line of a framed publication export: the bundle, each blob, then a
 * checksum over every prior line. Aliases, grants and credentials are never
 * framed, so an import establishes content and nothing about authority.
 */
export declare const PublicationExportFrameSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"bundle">;
    bundle: z.ZodObject<{
        format_version: z.ZodLiteral<"1.0.0">;
        root_kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            posture: "posture";
            semantic: "semantic";
            "domain-pack": "domain-pack";
            "binding-profile": "binding-profile";
        }>;
        root_ref: z.ZodString;
        declarations: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                procedure: "procedure";
                tool: "tool";
                "task-contract": "task-contract";
                agent: "agent";
                validator: "validator";
                posture: "posture";
                semantic: "semantic";
                "domain-pack": "domain-pack";
                "binding-profile": "binding-profile";
            }>;
            name: z.ZodString;
            version: z.ZodString;
            content_ref: z.ZodString;
        }, z.core.$strict>>;
        assets: z.ZodArray<z.ZodObject<{
            content_ref: z.ZodString;
            bytes: z.ZodNumber;
            media_type: z.ZodString;
            classification: z.ZodString;
            role: z.ZodString;
        }, z.core.$strict>>;
        edges: z.ZodArray<z.ZodObject<{
            from_ref: z.ZodString;
            to_ref: z.ZodString;
            kind: z.ZodEnum<{
                requires: "requires";
                includes: "includes";
            }>;
        }, z.core.$strict>>;
        compiler: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            canonicalization: z.ZodString;
        }, z.core.$strict>;
        source_maps: z.ZodArray<z.ZodObject<{
            content_ref: z.ZodString;
            path: z.ZodString;
            source_content_ref: z.ZodOptional<z.ZodString>;
            source_format: z.ZodOptional<z.ZodEnum<{
                "ramsden/v1": "ramsden/v1";
                "zero-ar/v1": "zero-ar/v1";
            }>>;
        }, z.core.$strict>>;
        conformance: z.ZodArray<z.ZodObject<{
            check: z.ZodString;
            outcome: z.ZodEnum<{
                refused: "refused";
                pass: "pass";
            }>;
        }, z.core.$strict>>;
        claims: z.ZodArray<z.ZodObject<{
            kind: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>;
        requested_aliases: z.ZodArray<z.ZodString>;
        bundle_ref: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"blob">;
    content_ref: z.ZodString;
    encoding: z.ZodEnum<{
        utf8: "utf8";
        base64: "base64";
    }>;
    bytes: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    kind: z.ZodLiteral<"checksum">;
    sha256: z.ZodString;
}, z.core.$strict>], "kind">;
export type PublicationExportFrame = z.infer<typeof PublicationExportFrameSchema>;
/** A publication import committed under this tenant: a new receipt for the same closure refs. */
export declare const PublicationImportOutcomeSchema: z.ZodObject<{
    receipt: z.ZodObject<{
        publication_ref: z.ZodString;
        bundle_ref: z.ZodString;
        root_kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            posture: "posture";
            semantic: "semantic";
            "domain-pack": "domain-pack";
            "binding-profile": "binding-profile";
        }>;
        root_ref: z.ZodString;
        agent_ref: z.ZodNullable<z.ZodString>;
        tenant: z.ZodString;
        accountable: z.ZodString;
        compiler: z.ZodObject<{
            name: z.ZodString;
            version: z.ZodString;
            canonicalization: z.ZodString;
        }, z.core.$strict>;
        counts: z.ZodObject<{
            declarations: z.ZodNumber;
            assets: z.ZodNumber;
            total_bytes: z.ZodNumber;
        }, z.core.$strict>;
        closure_hash: z.ZodString;
        aliases: z.ZodArray<z.ZodObject<{
            alias: z.ZodString;
            outcome: z.ZodEnum<{
                refused: "refused";
                set: "set";
            }>;
        }, z.core.$strict>>;
        committed_at: z.ZodString;
        establishes: z.ZodLiteral<"admitted-and-stored-only">;
    }, z.core.$strict>;
    blobs: z.ZodNumber;
}, z.core.$strict>;
export type PublicationImportOutcome = z.infer<typeof PublicationImportOutcomeSchema>;
