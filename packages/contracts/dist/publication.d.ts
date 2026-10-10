import { z } from 'zod';
export declare const PublicationDeclarationEntrySchema: z.ZodObject<{
    kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        "domain-pack": "domain-pack";
        posture: "posture";
        semantic: "semantic";
        "binding-profile": "binding-profile";
    }>;
    name: z.ZodString;
    version: z.ZodString;
    content_ref: z.ZodString;
}, z.core.$strict>;
export type PublicationDeclarationEntry = z.infer<typeof PublicationDeclarationEntrySchema>;
export declare const PublicationAssetEntrySchema: z.ZodObject<{
    content_ref: z.ZodString;
    bytes: z.ZodNumber;
    media_type: z.ZodString;
    classification: z.ZodString;
    role: z.ZodString;
}, z.core.$strict>;
export type PublicationAssetEntry = z.infer<typeof PublicationAssetEntrySchema>;
export declare const PublicationDependencyEdgeSchema: z.ZodObject<{
    from_ref: z.ZodString;
    to_ref: z.ZodString;
    kind: z.ZodEnum<{
        requires: "requires";
        includes: "includes";
    }>;
}, z.core.$strict>;
export type PublicationDependencyEdge = z.infer<typeof PublicationDependencyEdgeSchema>;
export declare const PublicationBundleManifestSchema: z.ZodObject<{
    format_version: z.ZodLiteral<"1.0.0">;
    root_kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        "domain-pack": "domain-pack";
        posture: "posture";
        semantic: "semantic";
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
            "domain-pack": "domain-pack";
            posture: "posture";
            semantic: "semantic";
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
export declare const PublicationReceiptSchema: z.ZodObject<{
    publication_ref: z.ZodString;
    bundle_ref: z.ZodString;
    root_kind: z.ZodEnum<{
        procedure: "procedure";
        tool: "tool";
        "task-contract": "task-contract";
        agent: "agent";
        validator: "validator";
        "domain-pack": "domain-pack";
        posture: "posture";
        semantic: "semantic";
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
export declare function verifyBundle(bundle: PublicationBundleManifest, blobs: Map<string, string>): void;
export declare const PublicationSessionRequestSchema: z.ZodObject<{
    bundle: z.ZodObject<{
        format_version: z.ZodLiteral<"1.0.0">;
        root_kind: z.ZodEnum<{
            procedure: "procedure";
            tool: "tool";
            "task-contract": "task-contract";
            agent: "agent";
            validator: "validator";
            "domain-pack": "domain-pack";
            posture: "posture";
            semantic: "semantic";
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
                "domain-pack": "domain-pack";
                posture: "posture";
                semantic: "semantic";
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
            "domain-pack": "domain-pack";
            posture: "posture";
            semantic: "semantic";
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
export declare const RegistryActOutcomeSchema: z.ZodObject<{
    content_ref: z.ZodString;
    recorded: z.ZodLiteral<true>;
}, z.core.$strict>;
export type RegistryActOutcome = z.infer<typeof RegistryActOutcomeSchema>;
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
export declare const AliasHistorySchema: z.ZodObject<{
    alias: z.ZodString;
    entries: z.ZodArray<z.ZodObject<{
        content_ref: z.ZodString;
        moved_at: z.ZodString;
        actor: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AliasHistory = z.infer<typeof AliasHistorySchema>;
export declare const RegistryRebuildOutcomeSchema: z.ZodObject<{
    publications: z.ZodNumber;
    names: z.ZodNumber;
    equal: z.ZodBoolean;
}, z.core.$strict>;
export type RegistryRebuildOutcome = z.infer<typeof RegistryRebuildOutcomeSchema>;
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
            "domain-pack": "domain-pack";
            posture: "posture";
            semantic: "semantic";
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
                "domain-pack": "domain-pack";
                posture: "posture";
                semantic: "semantic";
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
            "domain-pack": "domain-pack";
            posture: "posture";
            semantic: "semantic";
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
