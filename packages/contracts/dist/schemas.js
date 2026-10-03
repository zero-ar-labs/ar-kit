/**
 * Public payload schemas.
 *
 * What this is: the zod definitions for everything that crosses a public
 * boundary: intake, controls, records, entries, snapshots, results, and the
 * management operations. TypeScript types infer from these, JSON Schema
 * generates from these, and the server validates with these. One source,
 * many projections (section 9.1 of the ERD).
 *
 * How it fits: every schema registers its structural placement and owner in
 * SCHEMA_REGISTRY, which generates the footprint inventory. A shape missing
 * from the registry fails the build (DX-016, XCV-011).
 */
import { z } from 'zod';
import { CapabilityAdmissionAcceptedSchema, CapabilityAdmissionCancellationRequestSchema, CapabilityAdmissionDecisionRequestSchema, CapabilityAdmissionListSchema, CapabilityAdmissionListRequestSchema, CapabilityAdmissionPlanSchema, CapabilityAdmissionPolicySchema, CapabilityAdmissionRequestSchema, CapabilityAdmissionViewSchema, CapabilityConsequenceDiffSchema, CapabilityNextActionSchema, } from "./capability-admission.js";
import { ArtifactContextSpanSchema, ArtifactEvidenceBlockerSchema, CitedSpanSchema, ClaimSetSchema, ContextFenceNonceSchema, EntryEvidenceSchema, } from "./claims.js";
import { ContextReplayArtifactSpanSchema, ContextReplaySchema, ContextReplaySpanSchema } from "./context-replay.js";
import { ControllersViewSchema, PinnedCheckpointDecisionSchema } from "./controllers-view.js";
import { WakeClockDiagnosticSchema, WakeSchedulerDeclarationSchema, WakeSchedulerReportSchema } from "./wake-scheduler.js";
import { AttentionCalibrationReportSchema, AttentionCalibrationRequestSchema, AttentionCapacitySnapshotPublishRequestSchema, AttentionCapacitySnapshotSchema, AttentionClassModelSchema, AttentionDashboardSchema, AttentionDistributionSchema, } from "./attention.js";
import { EffectAuthorityEpochAdvanceOutcomeSchema, EffectAuthorityEpochAdvanceRequestSchema, EffectGrantReissueOutcomeSchema, EffectGrantReissueRequestSchema, EffectGrantRevocationOutcomeSchema, EffectGrantRevocationRequestSchema, EffectTargetListSchema, } from "./effect-authority.js";
import { RegisterWorkspaceInstanceRequestSchema, ResolvedWorkspaceInstanceSchema, WorkspaceInstanceListSchema, WorkspaceInstanceSchema, WorkspaceIntakeBindingSchema, } from "./workspace-instances.js";
import { BrowserAdapterDescriptorSchema, BrowserBindingSchema, BrowserBindingTemplateSchema, BrowserCredentialBindingSchema, BrowserDestinationDecisionRequestSchema, BrowserDestinationDecisionSchema, BrowserDestinationProposalRequestSchema, BrowserDestinationProposalSchema, BrowserDestinationSchema, BrowserIntakeInputSchema, ResolvedBrowserTemplateSchema, BrowserEffectParametersSchema, BrowserEffectPolicySchema, BrowserLatencySummarySchema, BrowserLimitsSchema, BrowserMeasurementReportSchema, BrowserObservationResultSchema, BrowserProfileHealthSchema, BrowserProvenanceSchema, BrowserRequestProvenanceSchema, } from "./browser.js";
import { ProfileCapabilityEntrySchema, ProfileCapabilityManifestSchema, ProfileCapabilitySummarySchema, } from "./capability-profile.js";
import { AliasHistorySchema, AliasMutationRequestSchema, DrainOutcomeSchema, DrainRequestSchema, IdentityMigrationEventOutcomeSchema, IdentityMigrationEventRequestSchema, OperatorAuditPageSchema, ReconciliationOutcomeSchema, AliasMutationResultSchema, DeclarationViewSchema, DeprecationRequestSchema, ProcedureManifestSchema, PublicationAssetEntrySchema, PublicationBlobAckSchema, PublicationBlobFrameSchema, PublicationBlobUploadFinishSchema, PublicationBlobUploadStatusSchema, PublicationBundleManifestSchema, PublicationCommitRequestSchema, PublicationDeclarationEntrySchema, PublicationDependencyEdgeSchema, PublicationExportFrameSchema, PublicationImportOutcomeSchema, PublicationReceiptSchema, PublicationSessionRequestSchema, PublicationSessionSchema, PublicationViewSchema, QuarantineRequestSchema, RegistryActOutcomeSchema, RegistryRebuildOutcomeSchema, } from "./publication.js";
import { EffectDescriptorSchema, ReceiptSchema, StaticGrantSchema } from "./effects.js";
import { EffectApprovalAcceptedSchema, EffectApprovalActorSchema, EffectApprovalInvalidatedSchema, EffectApprovalRecordedSchema, EffectApprovalRequestSchema, EffectAuthorityDecisionCommandSchema, EffectAuthorityDecisionLookupSchema, } from "./effect-approvals.js";
import { AbandonEnvironmentRequestSchema, AbandonEnvironmentResultSchema, CancelEnvironmentJobRequestSchema, CancelEnvironmentJobResultSchema, CollectEnvironmentArtifactRequestSchema, CollectEnvironmentArtifactResultSchema, CollectedEnvironmentArtifactSchema, EnvironmentAdapterDescriptorSchema, EnvironmentExecutionRequestSchema, EnvironmentExecutionResultSchema, EnvironmentHandleBindingSchema, EnvironmentHandleSchema, EnvironmentJobHandleSchema, EnvironmentLifecycleAssuranceSchema, EnvironmentLimitsSchema, EnvironmentMountPolicySchema, EnvironmentNetworkPolicySchema, EnvironmentOutputDeclarationSchema, EnvironmentProfileRegistrationSchema, EnvironmentProfileSchema, EnvironmentResumeContextSchema, EnvironmentReuseRecordSchema, ObserveEnvironmentJobRequestSchema, ObserveEnvironmentJobResultSchema, PrepareEnvironmentRequestSchema, PrepareEnvironmentResultSchema, ReconcileEnvironmentJobRequestSchema, ReconcileEnvironmentJobResultSchema, SubmitEnvironmentJobRequestSchema, SubmitEnvironmentJobResultSchema, SuspendedEnvironmentHandleSchema, TeardownEnvironmentRequestSchema, TeardownEnvironmentResultSchema, } from "./environment.js";
import { SandboxWorkspaceAccessRequestSchema, SandboxWorkspaceBindingSchema, SandboxWorkspaceHandleSchema, } from "./environment-workspace.js";
import { EnvironmentAbandonJobRequestSchema, EnvironmentConformanceRequestSchema, EnvironmentConformanceResultSchema, EnvironmentCredentialRotationRequestSchema, EnvironmentDoctorRequestSchema, EnvironmentDoctorResultSchema, EnvironmentJobActionRequestSchema, EnvironmentJobListSchema, EnvironmentJobRefRequestSchema, EnvironmentMeasurementSummarySchema, EnvironmentMetricsSchema, EnvironmentProfileListSchema, EnvironmentProfileRefRequestSchema, EnvironmentProfileStateRequestSchema, EnvironmentSweepRequestSchema, EnvironmentSweepResultSchema, EnvironmentResolutionRequestSchema, EnvironmentResolutionResultSchema, RegisterEnvironmentRequestSchema, } from "./environment-management.js";
import { EnvironmentAdapterCompatibilitySchema, EnvironmentAdapterReleaseBodySchema, EnvironmentAdapterReleaseManifestSchema, } from "./environment-release.js";
import { EnvironmentAcceptanceLifecycleSchema, EnvironmentAcceptanceReportBodySchema, EnvironmentAcceptanceReportSchema, EnvironmentDeploymentCapabilityListSchema, EnvironmentDeploymentCapabilitySchema, EnvironmentHostObservationSchema, EnvironmentPrerequisiteObservationSchema, } from "./environment-deployment.js";
import { ArtifactSweepRequestSchema, ArtifactSweepResultSchema, ArtifactTransferOmissionSchema, RuntimeArtifactCommittedRecordSchema, RuntimeArtifactCommittedSessionSchema, RuntimeArtifactIntendedUseSchema, RuntimeArtifactManifestSchema, RuntimeArtifactProvenanceInputSchema, RuntimeArtifactReadySessionSchema, RuntimeArtifactSessionRequestSchema, RuntimeArtifactSessionStatusSchema, } from "./runtime-artifacts.js";
import { ExternalObservationAcceptedSchema, ExternalObservationAppliedSchema, ExternalObservationArtifactSchema, ExternalObservationContentSchema, ExternalObservationProvenanceSchema, ExternalObservationRecordedSchema, ExternalObservationRequestSchema, VerifiedRepresentedActorSchema, } from "./external-observations.js";
import { GatewayAdapterManifestSchema, GatewayDeliveryCursorSchema, ArtifactReadRequestSchema, DeclareFallbackSetRequestSchema, ModelFallbackSetSchema, ResolvedModelPlanSchema, SetDefaultModelAliasRequestSchema, SetModelAliasRequestSchema, SkillDescriptorSchema, SkillLoadResultSchema, SkillOpenRequestSchema, SkillReadRequestSchema, SkillSearchRequestSchema, SkillSearchResultSchema, TenantModelPoolSchema, } from "./integration.js";
import { AdmitModelAdapterRequestSchema, AdmittedModelAdapterSchema, CreateExternalCredentialBindingRequestSchema, CreateProviderInstanceRequestSchema, CredentialBindingSchema, EnableProviderModelRequestSchema, LegacyModelPoolImportRequestSchema, ModelSelectionSchema, ProtectedCredentialIngestRequestSchema, ProviderCompatibilitySchema, ProviderCatalogueSchema, ProviderInstanceListSchema, ProviderInstanceSchema, ProviderModelEntrySchema, RevokeCredentialRequestSchema, RotateExternalCredentialRequestSchema, RotateProtectedCredentialRequestSchema, SyncProviderCatalogueRequestSchema, } from "./providers.js";
import { EnableToolSourceToolsRequestSchema, RegisterToolSourceRequestSchema, SyncToolSourceCatalogueRequestSchema, ToolSourceCatalogueSchema, ToolSourceDriftRecordSchema, ToolSourceDriftReportSchema, ToolSourceEnablementSchema, ToolSourceIngressDeliverySchema, ToolSourceIngressReceiptSchema, ToolSourceListSchema, ToolSourceSchema, ToolSourceStateRequestSchema, ToolSourceTestResultSchema, ToolSourceToolEntrySchema, } from "./tool-sources.js";
import { DocumentExtractionPageSchema, DocumentExtractionResultSchema, RegisterSourceRequestSchema, ResolvedSourceBindingSchema, SourceBindingInputSchema, SourceInstanceSchema, SourceExtractorIdentitySchema, SourceListSchema, SourceLocatorSchema, SourceBoundsSchema, SourceOperationRequestSchema, SourceOperationResultSchema, SourcePreflightSchema, SourceSnapshotMemberSchema, SourceSnapshotPageRequestSchema, SourceSnapshotPageSchema, SourceSnapshotSchema, } from "./sources.js";
import { MemoryAssertionInputSchema, MemoryAssertionSchema, MemorySubjectErasureRequestSchema, MemorySubjectErasureOutcomeSchema, MemorySubjectImportOutcomeSchema, MemorySubjectImportRequestSchema, MemorySubjectKeyMaterialSchema, MemorySubjectTransferBundleSchema, MemorySubjectTransferRequestSchema, MemoryWrappedKeySchema, MemoryHistoryRequestSchema, MemoryHistoryResponseSchema, MemoryBindingSchema, MemoryReadEnvelopeSchema, MemoryReadRequestSchema, MemoryReadResponseSchema, ModelMemoryProposalSchema, ModelMemoryReadRequestSchema, ProtectedMemoryReadEnvelopeSchema, ResolvedMemoryBindingSchema, MemorySupersedeRequestSchema, MemorySupersedeOutcomeSchema, MemoryWriteOutcomeSchema, RunMemoryReadOutcomeSchema, } from "./memory.js";
import { AssuranceEnvelopeSchema, InteropBindingManifestBodySchema, InteropBindingManifestSchema, InteropCapabilitySchema, InteropConnectionSchema, InteropJsonSchema, InteropProtocolRegistryEntrySchema, InteropProtocolRegistrySchema, McpImportedToolPlanSchema, McpImportedResourcePlanSchema, McpPeerResourceSchema, McpPeerSnapshotBodySchema, McpPeerSnapshotSchema, McpPeerToolSchema, McpPendingInputSchema, McpPublishedWorkEntrypointSchema, McpTaskAliasSchema, McpTaskProjectionSchema, } from "./interop.js";
import { ATTENTION_ADMISSION_RESULTS, BLOCKING_OUTCOME_KINDS, BRANCH_REASONS, CLAIM_REPRESENTATIONS, CONTROLLER_MODES, SAMPLED_ORACLE_OUTCOMES, SEQUENTIAL_STOP_REASONS, WAKE_CLAIM_VIAS, OPERATION_CLASSES, PACK_CLAIM_KINDS, TOOL_EXECUTION_OUTCOMES, TOOL_METERING, TOOL_VIEW_SELECTION_REASONS, WORKSPACE_SLOTS, CONTROL_VERBS, DURABLE_EVENTS, ENTRY_ROLES, EVIDENCE_GRADES, EXTERNAL_EVIDENCE_CLASSIFICATIONS, EXTERNAL_EVIDENCE_CAMPAIGN_MODES, EXTERNAL_EVIDENCE_DECISION_KINDS, EXTERNAL_EVIDENCE_DEGRADATIONS, EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES, EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS, EXTERNAL_EVIDENCE_INVARIANTS, EXTERNAL_EVIDENCE_INVARIANT_STATUSES, EXTERNAL_EVIDENCE_PROPERTY_FAMILIES, EXTERNAL_EVIDENCE_REFERENCE_VECTORS, EXTERNAL_EVIDENCE_STANDINGS, EXTERNAL_EVIDENCE_STRENGTHS, FAILURE_CLASSES, ITEM_STATES, LEASE_DENOMINATIONS, LEASE_POOLS, LEASE_STATES, MEMORY_CLASSIFICATIONS, MEMORY_EVENT_KINDS, MCP_REMOTE_TASK_CAUSES, MCP_REMOTE_TASK_STATES, MODEL_CATALOGUE_SOURCES, MODEL_CREDENTIAL_MODES, MODEL_PROTOCOL_ADAPTERS, MODEL_PROVIDERS, MODEL_PROVIDER_PROFILES, MODEL_USAGE_MEASUREMENTS, PROFILES, PRODUCT_EVENT_FAMILIES, RECORD_TYPES, SKILL_RETENTIONS, REVIEW_ITEM_KINDS, REVIEW_ITEM_STATES, RUN_REVIEW_STATES, RUN_STATUSES, RUN_TERMINALS, RUN_RESUME_BLOCK_CATEGORIES, RUN_LIFECYCLE_COMMANDS, SUSPEND_REASONS, COMPLETION_STATES, STOP_REASONS, POSTGRES_DEPLOYMENT_MODES, POSTGRES_LATENCY_OPERATIONS, POSTGRES_LATENCY_REPORT_STATUSES, POSTGRES_LATENCY_TOPOLOGIES, STORE_KINDS, VALIDATOR_CLASSES, VALIDATOR_EVIDENCE_GRADES, VERIFICATION_PLAN_REFUSAL_CODES, VALIDATOR_OUTCOMES, VERDICTS, DIAGNOSTIC_SEVERITIES, TRUST_TIERS, ASSURANCE_COMPLETION_CLASSES, } from "./vocab.js";
const id = (prefix) => z.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`), `expected a ${prefix} id`);
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const count = z.number().int().nonnegative();
/**
 * An input whose shape is fixed while its mechanism is not wired in this
 * build. Any value, well formed or not, fails the parse before its shape is
 * checked, with one issue that names the code, so no caller has an input
 * accepted and then ignored. The caller receives the parse refusal of the
 * surface that read it (intake.invalid, control.invalid, or a schema error
 * from the SDK publication compiler) with the code in its message. A
 * surface that parses a narrower schema refuses the field as unknown
 * instead. The published JSON schema keeps the field's own shape and marks
 * it x-zero-ar-reserved. The package that wires the mechanism replaces
 * reserved(schema, ...) with the schema itself.
 */
function reserved(schema, field, code) {
    return z.preprocess((value, context) => {
        context.addIssue({
            code: 'custom',
            input: value,
            message: `${field} is reserved and its mechanism is not wired in this build (${code}). Remove ${field}, or send it to a build whose capability manifest lists that mechanism as wired`,
        });
        return value;
    }, schema).meta({ 'x-zero-ar-reserved': code, description: `Reserved: this build refuses any value with ${code}.` });
}
const closureAttributionFields = {
    /** Historical v0 records omit both fields and therefore mean epoch 1. */
    closure_epoch: z.number().int().min(1).optional(),
    closure_ref: hash.optional(),
};
const closureAttributionInvariant = (value, context) => {
    if ((value.closure_epoch === undefined) !== (value.closure_ref === undefined)) {
        context.addIssue({ code: 'custom', message: 'closure_epoch and closure_ref must either both be absent (legacy epoch 1) or both be present' });
    }
};
const closureAttributed = (shape) => z.strictObject({ ...shape, ...closureAttributionFields }).superRefine((value, context) => closureAttributionInvariant(value, context));
const closureAttributedSchema = (schema) => schema.extend(closureAttributionFields).superRefine((value, context) => closureAttributionInvariant(value, context));
const ToolViewRecordSchema = z.strictObject({
    schema: z.literal('zero-ar-tool-view/1'),
    ref: hash,
    closure_size: count,
    budget: z.strictObject({ schema_tokens: count, schema_bytes: count }),
    used: z.strictObject({ schema_tokens: count, schema_bytes: count }),
    visible: z.array(z.strictObject({
        name: z.string().min(1),
        contract_ref: hash,
        reason: z.enum(TOOL_VIEW_SELECTION_REASONS),
    })),
    hidden: count,
    refusals: z.array(z.strictObject({ code: z.string(), message: z.string(), alternatives: z.array(z.string()) })),
});
/** Internal persistence and composition parsers for live closed-vocabulary fields. */
export const LeaseStateSchema = z.enum(LEASE_STATES);
export const StoreKindSchema = z.enum(STORE_KINDS);
/** The three principal roles. The accountable owner is always a named person (K-18). */
export const PrincipalsSchema = z.strictObject({
    executing: z.string().min(1),
    originating: z.string().min(1),
    accountable: z.string().min(1),
});
/** Consumption amounts by denomination. Absent means zero allowance, not unlimited. */
export const ConsumptionSchema = z.strictObject({
    model_tokens: count,
    tool_calls: count.optional(),
    bytes: count.optional(),
    compute_ms: count.optional(),
});
export const BudgetsSchema = z.strictObject({
    consumption: ConsumptionSchema,
    /** Human attention units. Zero is a valid, enforced answer. */
    attention: count,
    /** Fraction of consumption reserved for verification, undrawable by work (K-17). */
    verification_reserve_fraction: z.number().min(0).max(0.9),
    max_turns: z.number().int().positive().max(10_000),
});
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const mediaType = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
/** One input artifact the caller asks the run to depend on. */
export const InputArtifactBindingSchema = z.strictObject({
    artifact_ref: artifactHandle,
    content_hash: hash,
    bytes: count,
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    required_for_completion: z.boolean().default(true),
});
/** The verified input artifact descriptor pinned into the run manifest. */
export const ResolvedInputArtifactSchema = z.strictObject({
    artifact_ref: artifactHandle,
    manifest_ref: hash,
    tenant: z.string().min(1),
    source_run_id: z.string().min(1),
    content_hash: hash,
    bytes: count,
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    required_for_completion: z.boolean(),
});
/** The credential-free handle persisted before an imported remote tool parks. */
export const RemoteToolTaskHandleSchema = z.strictObject({
    protocol: z.literal('mcp'),
    invoke_id: z.string().min(1).max(256),
    tool: z.string().min(1).max(256),
    original_call_ref: hash,
    peer_binding_ref: hash,
    execution_binding_ref: hash,
    peer_task_id: z.string().min(1).max(1_024).nullable(),
    state: z.enum(MCP_REMOTE_TASK_STATES),
    cause: z.enum(MCP_REMOTE_TASK_CAUSES),
    last_position: z.string().min(1).max(512).nullable(),
    observed_at: z.string().datetime(),
});
/** A unit of work arriving at intake (ERD 9.2). Budgets arrive with the work. */
export const IntakeRequestSchema = z.strictObject({
    objective: z.string().min(1).max(100_000),
    agent_ref: hash.optional(),
    principals: PrincipalsSchema,
    budgets: BudgetsSchema,
    task_contract_ref: hash.optional(),
    /** A registered posture, pinned by content hash. It resolves rigor and joins the transitive identity (XCV-001). */
    posture_ref: hash.optional(),
    inputs: z
        .strictObject({
        /** The declared work list. Each id is one ledger position (QLT-020). */
        items: z.array(z.string().min(1).max(200)).max(100_000).optional(),
        /** Committed artifacts this run depends on, verified before admission. */
        artifacts: z.array(InputArtifactBindingSchema).max(1_000).optional(),
        /** Immutable source snapshots named by stable aliases for bounded model operations. */
        sources: z.array(SourceBindingInputSchema).max(64).optional(),
        /** Authenticated values a published memory binding may derive its subject from. */
        memory_subjects: z.record(z.string().regex(/^[a-z][a-z0-9-]{0,62}$/), z.string().min(1).max(256)).optional(),
        /** One reviewed browser binding template, by name. Reserved until the browser run port is wired. */
        browser: reserved(BrowserIntakeInputSchema, 'inputs.browser', 'browser.capability.unavailable').optional(),
        /** Deployment workspace instances attached to published mounts. Reserved until instance attachment is wired. */
        workspace: reserved(z.array(WorkspaceIntakeBindingSchema).min(1).max(32), 'inputs.workspace', 'workspace.instances.unwired').optional(),
    })
        .optional(),
    idempotency_key: z.string().min(1).max(256),
    correlation_id: z.string().min(1).max(256).optional(),
});
/**
 * The complete execution closure one run pins before external work
 * (KRN-024). Empty arrays and nulls state that a component is not
 * applicable; omission never means discovery may fill it in later.
 */
export const ResolvedRunManifestSchema = z.strictObject({
    schema: z.literal('resolved-run-manifest/1'),
    contract_version: z.literal('v1'),
    runtime: z.strictObject({ name: z.string(), version: z.string(), ref: hash }),
    profile_manifest: ProfileCapabilitySummarySchema,
    agent: z.strictObject({
        requested_ref: z.string().nullable(),
        default_ref: z.string().nullable(),
        resolved_ref: hash,
        name: z.string(),
        definition_ref: hash,
        instructions_ref: hash,
        publication_ref: hash.nullable(),
    }),
    context: z.strictObject({ assembler: z.string(), version: z.string(), ref: hash, posture_ref: hash.nullable() }),
    model: z.strictObject({
        adapter: z.strictObject({ name: z.string(), version: z.string(), ref: hash }),
        admitted_adapter_ref: hash.nullable(),
        model_ref: z.string(),
        provider_model_id: z.string().nullable().optional(),
        provider: z.enum(MODEL_PROVIDERS).nullable().optional(),
        protocol_adapter: z.enum(MODEL_PROTOCOL_ADAPTERS).nullable().optional(),
        protocol_version: z.string().nullable().optional(),
        profile: z.enum(MODEL_PROVIDER_PROFILES).nullable().optional(),
        profile_version: z.string().nullable().optional(),
        provider_instance_ref: hash.nullable(),
        endpoint: z.string().url().nullable(),
        destination: z.string().url().nullable().optional(),
        endpoint_policy_ref: hash.nullable(),
        catalogue_source: z.enum(MODEL_CATALOGUE_SOURCES).nullable().optional(),
        compatibility: ProviderCompatibilitySchema.nullable().optional(),
        compatibility_ref: hash.nullable().optional(),
        credential_mode: z.enum(MODEL_CREDENTIAL_MODES).nullable().optional(),
        credential_binding_ref: z.string().regex(/^secret:\/\/[A-Za-z0-9._/-]+$/).nullable(),
        catalogue_entry_ref: hash.nullable(),
        provider_model_revision: z.string().nullable(),
        assurance_facts_ref: hash.nullable(),
        credential_epoch: z.number().int().min(1).nullable(),
    }),
    /**
     * The complete model plan this run pinned before its first call: the
     * selector that resolved, why, and the declared ordered fallbacks it
     * may descend. Null when the runtime serves one wired adapter (DXI-014).
     */
    model_plan: ResolvedModelPlanSchema.nullable().optional(),
    /** Committed input artifacts verified before admission and folded into identity. */
    input_artifacts: z.array(ResolvedInputArtifactSchema).default([]),
    /** Immutable source bindings resolved before admission and folded into identity. */
    source_bindings: z.array(ResolvedSourceBindingSchema).optional(),
    /** Publication-owned memory policies resolved against authenticated intake. */
    memory_bindings: z.array(ResolvedMemoryBindingSchema).max(32).default([]),
    tools: z.array(z.strictObject({
        name: z.string(),
        version: z.string(),
        contract_ref: hash,
        binding_ref: hash.nullable(),
        operation_class: z.enum(OPERATION_CLASSES),
        target_ref: hash.nullable(),
        environment_ref: hash.nullable(),
    })),
    workspace_profiles: z.array(hash),
    workspace_bindings: z.array(hash),
    procedures: z.array(hash),
    task_contract: z
        .strictObject({
        ref: hash,
        validators: z.array(z.strictObject({ name: z.string(), version: z.string(), class: z.enum(VALIDATOR_CLASSES), ref: hash })),
    })
        .nullable(),
    semantic_declarations: z.array(hash),
    domain_pack_ref: hash.nullable(),
    operation_registry: z.array(z.strictObject({ name: z.string(), operation_class: z.enum(OPERATION_CLASSES), ref: hash })),
    target_adapters: z.array(hash),
    execution_environments: z.array(hash),
    /** The browser template a run pinned. The per-run binding follows in browser.binding.pinned. */
    browser: ResolvedBrowserTemplateSchema.nullable().optional(),
    /** The registered environment profile each run-internal tool resolved to at admission (ENV-012). */
    environment_profiles: z.record(z.string().min(1).max(200), hash).optional(),
    /** Every workspace instance the run attached, with its profile and per-tool manifest hashes (ADX-013). */
    workspace_instances: z.array(ResolvedWorkspaceInstanceSchema).max(32).optional(),
});
/**
 * The task contract (QLT-001): what must hold, where it is checked, what
 * repair may assume, and which validator's coverage the contract designates
 * sufficient. The runtime enforces the protocol; the contract supplies the
 * meaning of pass (NG-2).
 */
export const TaskContractSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    /** Invariants checked at checkpoints, by rule name. */
    invariants: z.array(z.string().min(1)).min(1),
    /** Acceptance rules checked when completion is proposed. */
    acceptance_rules: z.array(z.string().min(1)).min(1),
    /** Position-based schedule: a checkpoint after every N attempted items (QLT-022). */
    checkpoint_every_items: z.number().int().positive(),
    /**
     * Optional phase boundaries. A phase can tighten the checkpoint cadence
     * only after its named boundary starts, and only from data recorded in
     * run.created before item work begins (MTH-CP-004).
     */
    checkpoint_phase_boundaries: z
        .array(z.strictObject({
        phase: z.string().min(1),
        starts_after_items: z.number().int().nonnegative(),
        checkpoint_every_items: z.number().int().positive(),
    }))
        .optional(),
    /**
     * What rejection may assume about blast radius. independent-items narrows
     * repair to the rejected items; run-start widens to everything not yet
     * verified (QLT-025, QLT-026).
     */
    dependency_frontier: z.enum(['independent-items', 'run-start', 'declared-dependencies']),
    /** Bounded retry. Exhaustion terminates as an unverified artifact (QLT-030). */
    repair_budget_attempts: z.number().int().min(0).max(100),
    /**
     * Declared only when outputs are structured claim sets. Declaring it scopes
     * every evidence-completeness statement to that shape (CLM-001); leaving it
     * out means no such statement appears on any surface.
     */
    claim_representation: z.enum(CLAIM_REPRESENTATIONS).optional(),
    /**
     * How long a parked item waits for each named-human class before its
     * deadline wake dismisses it (LIF-035). With no matching window an item
     * waits without a deadline.
     */
    answer_windows: z.array(z.strictObject({
        named_human_class: z.string().min(1).max(200),
        window_ms: z.number().int().positive().max(31_536_000_000),
    })).min(1).max(64).optional(),
    validators: z
        .array(z.strictObject({
        name: z.string().min(1),
        version: z.string(),
        class: z.enum(VALIDATOR_CLASSES),
        covers: z.array(z.string().min(1)).min(1),
        /**
         * Sufficiency is the contract's designation, never the validator's own
         * claim (Q-7). Each rule named here must also be in `covers`; publication
         * and run admission refuse a designation for a rule the binding never
         * evaluates.
         */
        sufficient_for: z.array(z.string()),
        cost_wall_ms: z.number().int().positive().max(600_000),
    }))
        .min(1),
    /**
     * Optional groups whose selected deterministic or named-human validators
     * may run together after one combined verification reservation. The rules,
     * not discovery order, define membership and canonical output positions.
     */
    validator_concurrency_groups: z
        .array(z.strictObject({
        name: z.string().min(1).max(200),
        rules: z.array(z.string().min(1)).min(2),
    }))
        .optional(),
});
// ---- validator catalogue and the read-only visible verification plan ----
const ValidatorEvidenceDimensionsSchema = z.strictObject({
    protocol_conformance: z.array(hash),
    labelled_cases: z.strictObject({
        positive: z.array(hash),
        negative: z.array(hash),
        indeterminate: z.array(hash),
        adversarial: z.array(hash),
    }),
    repeatability: z.array(hash),
    calibration: z.array(hash),
    deployment_admission: z.array(hash),
    boundary: z.string().min(1).max(500),
});
export const ValidatorCatalogueEntryBodySchema = z.strictObject({
    schema: z.literal('validator-catalogue-entry/1'),
    kind: z.enum(['first-party', 'custom']),
    identity: z.strictObject({
        name: z.string().min(1),
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        implementation_ref: hash,
        factory_ref: hash.nullable(),
        entrypoint: z.string().min(1).max(500),
    }),
    finding_contract: z.strictObject({
        class: z.enum(VALIDATOR_CLASSES),
        supported_verdicts: z.array(z.enum(VALIDATOR_OUTCOMES)).min(3),
        supported_failure_classes: z.array(z.enum(FAILURE_CLASSES)).min(1),
        indeterminate_supported: z.literal(true),
    }),
    input_contract: z.strictObject({
        representation: z.string().min(1).max(200),
        required_item_fields: z.array(z.string().min(1)).min(1),
        population: z.enum(['full', 'sampled']),
        dependencies: z.array(z.enum(['artifact-reader', 'domain-oracle', 'named-human'])),
        maximum_items: z.number().int().positive(),
    }),
    coverage_capability: z.strictObject({
        rule_kinds: z.array(z.string().min(1)).min(1),
    }),
    cost_envelope: z.strictObject({
        wall_ms: z.number().int().positive().max(600_000),
        denomination: z.literal('compute_ms'),
        compute_ms: z.number().int().positive().max(600_000),
        cpu_millis: z.number().int().positive().nullable(),
        memory_bytes: z.number().int().positive().nullable(),
        pids: z.number().int().positive().nullable(),
    }),
    evidence: ValidatorEvidenceDimensionsSchema,
    evidence_grade: z.enum(VALIDATOR_EVIDENCE_GRADES),
    runtime_needs: z.strictObject({
        host_protocol: z.string().min(1).max(200),
        package_ref: hash.nullable(),
        bundle_ref: hash.nullable(),
        artifact_reader: z.boolean(),
        network_policy: z.enum(['denied', 'declared-egress']),
        named_human_class: z.string().min(1).max(200).nullable(),
        oracle_ref: hash.nullable(),
        sampling_frame_ref: hash.nullable(),
        sampling_assumption: z.string().min(1).max(300).nullable(),
    }),
    limitations: z.array(z.string().min(1).max(1_000)).min(1),
});
export const ValidatorCatalogueEntrySchema = ValidatorCatalogueEntryBodySchema.extend({
    catalogue_entry_ref: hash,
});
export const ValidatorAvailabilitySnapshotBodySchema = z.strictObject({
    schema: z.literal('validator-availability-snapshot/1'),
    deployment: z.string().min(1).max(300),
    entries: z.array(z.strictObject({
        name: z.string().min(1),
        version: z.string().min(1),
        class: z.enum(VALIDATOR_CLASSES),
        implementation_ref: hash,
        catalogue_entry_ref: hash,
        available: z.boolean(),
        host_boundary: z.string().min(1).max(300),
        host_protocol: z.string().min(1).max(200),
        bundle_ref: hash.nullable(),
        artifact_reader_available: z.boolean(),
        oracle_ref: hash.nullable(),
        sampling_frame_ref: hash.nullable(),
        unmet_dependencies: z.array(z.string().min(1).max(500)),
    })),
});
export const ValidatorAvailabilitySnapshotSchema = ValidatorAvailabilitySnapshotBodySchema.extend({ snapshot_ref: hash });
const VerificationPhaseScheduleSchema = z.strictObject({
    phase: z.string().min(1),
    starts_after_items: count,
    interval_items: z.number().int().positive(),
    contract_ceiling: z.number().int().positive(),
    inputs_hash: hash,
    recorded_before_position: count,
});
export const VerificationCheckpointInputBodySchema = z.strictObject({
    schema: z.literal('verification-checkpoint-input/1'),
    mode: z.enum(['fixed', 'controlled']),
    interval_items: z.number().int().positive(),
    contract_ceiling: z.number().int().positive(),
    controller: z.string().min(1),
    controller_version: z.string().min(1),
    controller_inputs_ref: hash,
    fallback: z.strictObject({ used: z.boolean(), reason: z.string().min(1) }),
    phase_schedules: z.array(VerificationPhaseScheduleSchema),
    mandatory_boundaries: z.array(z.enum(['task-contract', 'effect-staging', 'completion', 'validator-coverage'])),
    projected_checkpoints: count,
    projected_cost_ms: count,
});
export const VerificationCheckpointInputSchema = VerificationCheckpointInputBodySchema.extend({ snapshot_ref: hash });
export const VerificationAttentionCapacitySnapshotBodySchema = z.strictObject({
    schema: z.literal('verification-attention-capacity-snapshot/1'),
    classes: z.array(z.strictObject({ name: z.string().min(1), available: count, expected_handling_ms: count })),
});
export const VerificationAttentionCapacitySnapshotSchema = VerificationAttentionCapacitySnapshotBodySchema.extend({ snapshot_ref: hash });
/**
 * The attention capacity the engine read at admission, version two: the
 * operator-published snapshot it pinned, the posture's gap classes, and the
 * engine's decision per class, so the plan reports what admission concluded
 * rather than recomputing it (BUD-009, MTH-AT-004).
 */
export const VerificationAttentionCapacitySnapshotV2BodySchema = z.strictObject({
    schema: z.literal('verification-attention-capacity-snapshot/2'),
    capacity_snapshot_ref: hash,
    planning_horizon_ms: count,
    confidence_posture: z.string().min(1).max(64),
    gap_classes: z.array(z.string().min(1).max(200)).max(64),
    classes: z.array(z.strictObject({
        name: z.string().min(1).max(200),
        available: count,
        expected_handling_ms: count,
        expected_escalation_ppm: z.number().int().min(0).max(1_000_000),
        batch_setup_ms: count,
        rho_ppm: count,
        admission_result: z.enum(ATTENTION_ADMISSION_RESULTS),
        reason: z.string().min(1).max(1_000),
    })).max(64),
});
export const VerificationAttentionCapacitySnapshotV2Schema = VerificationAttentionCapacitySnapshotV2BodySchema.extend({ snapshot_ref: hash });
export const VerificationPlanInputSchema = z.strictObject({
    schema: z.literal('verification-plan-input/1'),
    source: z.enum(['publication', 'runtime', 'reconstruction']),
    task_contract_ref: hash.nullable(),
    task_contract: TaskContractSchema.nullable(),
    resolved_manifest_ref: hash.nullable(),
    resolved_manifest: ResolvedRunManifestSchema.nullable(),
    publication_ref: hash.nullable(),
    catalogue: z.array(ValidatorCatalogueEntrySchema),
    availability: ValidatorAvailabilitySnapshotSchema,
    posture: z.strictObject({ ref: hash, configuration: z.lazy(() => PostureSchema) }).nullable(),
    budgets: BudgetsSchema,
    budgets_ref: hash,
    checkpoint: VerificationCheckpointInputSchema.nullable(),
    dependency_projection_ref: hash,
    attention_enforcement: z.discriminatedUnion('mode', [
        z.strictObject({ mode: z.literal('not-wired') }),
        /**
         * Observe mode (D-8) records attention without enforcing it. Reserved
         * until attention admission is wired: compileVerificationPlan would
         * otherwise read any mode but not-wired as enforce.
         */
        z.strictObject({ mode: z.literal('observe'), caller_ref: reserved(hash, 'attention_enforcement observe mode', 'attention.admission.unwired') }),
        z.strictObject({ mode: z.literal('enforce'), caller_ref: hash }),
    ]),
    attention_capacity_snapshot: z.union([VerificationAttentionCapacitySnapshotSchema, VerificationAttentionCapacitySnapshotV2Schema]).nullable(),
    profile_manifest: ProfileCapabilitySummarySchema,
    items_declared: count,
});
const VerificationPlanRefusalSchema = z.strictObject({
    code: z.enum(VERIFICATION_PLAN_REFUSAL_CODES),
    rule: z.string().nullable(),
    validator: z.string().nullable(),
    dependency: z.string().nullable(),
    message: z.string().min(1),
});
/**
 * One row per selected validator invocation: a (stage, rule, validator) triple,
 * because the runtime evaluates every validator that covers a rule. A rule
 * with no covering binding has one row whose validator is null. Selection no
 * longer skips an overlapping binding, so `skipped_overlapping_binding_positions`
 * is always empty and remains only for shape compatibility; `skip_condition`
 * names the runtime skip that can apply to a heuristic or sampled-oracle row.
 */
const VerificationPlanRuleSchema = z.strictObject({
    stage: z.enum(['invariant', 'acceptance']),
    rule: z.string().min(1),
    selected_binding_position: z.number().int().nonnegative().nullable(),
    selected_validator: z
        .strictObject({
        name: z.string().min(1),
        version: z.string().min(1),
        class: z.enum(VALIDATOR_CLASSES),
        implementation_ref: hash.nullable(),
        catalogue_entry_ref: hash.nullable(),
        evidence_grade: z.enum(VALIDATOR_EVIDENCE_GRADES).nullable(),
        coverage: z.boolean(),
        sufficient_for_rule: z.boolean(),
        available: z.boolean(),
        cost_wall_ms: count,
        limitations: z.array(z.string()),
    })
        .nullable(),
    sufficient_binding_positions: z.array(z.number().int().nonnegative()),
    skipped_overlapping_binding_positions: z.array(z.number().int().nonnegative()),
    skip_condition: z.string().nullable(),
});
export const VerificationPlanBodySchema = z.strictObject({
    schema: z.literal('verification-plan/1'),
    identity: z.strictObject({
        input_ref: hash,
        task_contract_ref: hash.nullable(),
        resolved_manifest_ref: hash.nullable(),
        publication_ref: hash.nullable(),
        catalogue_entry_refs: z.array(hash),
        availability_snapshot_ref: hash,
        budgets_ref: hash,
        posture_ref: hash.nullable(),
        checkpoint_snapshot_ref: hash.nullable(),
        dependency_projection_ref: hash,
        profile_manifest_ref: hash,
        attention_capacity_snapshot_ref: hash.nullable(),
    }),
    reachability: z.strictObject({
        verified_completion_reachable: z.boolean(),
        refusals: z.array(VerificationPlanRefusalSchema),
    }),
    rules: z.array(VerificationPlanRuleSchema),
    runtime_bindings: z.array(z.strictObject({
        binding_position: z.number().int().nonnegative(),
        name: z.string().min(1),
        version: z.string().min(1),
        class: z.enum(VALIDATOR_CLASSES),
        implementation_ref: hash.nullable(),
        catalogue_entry_ref: hash.nullable(),
        host_boundary: z.string().nullable(),
        bundle_ref: hash.nullable(),
        available: z.boolean(),
        unmet_dependencies: z.array(z.string()),
    })),
    execution_order: z.array(z.strictObject({
        position: z.number().int().nonnegative(),
        stage: z.enum(['invariant', 'acceptance']),
        rule: z.string().min(1),
        binding_position: z.number().int().nonnegative(),
        validator: z.string().min(1),
        group: z.enum(['authority-first', 'deferred-after-rejection']),
        concurrency_group: z.string().nullable(),
    })),
    checkpoints: VerificationCheckpointInputSchema.nullable(),
    cost: z.strictObject({
        pool: z.literal('verification'),
        denomination: z.literal('compute_ms'),
        validator_upper_bounds: z.array(z.strictObject({ binding_position: count, validator: z.string().min(1), wall_ms: count })),
        per_checkpoint_ms: count,
        acceptance_ms: count,
        projected_cost_ms: count,
        reserve_ms: count,
        feasible: z.boolean(),
        infeasibility: z.string().nullable(),
    }),
    repair: z.strictObject({
        dependency_frontier: z.enum(['independent-items', 'run-start', 'declared-dependencies']).nullable(),
        dependency_projection_ref: hash,
        widening: z.string().min(1),
        repair_limit: count,
        terminal_after_exhaustion: z.literal('unverified_artifact'),
    }),
    attention: z.strictObject({
        status: z.enum(['not-evaluated', 'evaluated', 'not-applicable']),
        statement: z.string().min(1),
        classes: z.array(z.string()),
        budget: count,
        capacity_snapshot_ref: hash.nullable(),
        requirements: z.array(z.strictObject({
            class: z.string().min(1),
            expected_handling_ms: count.nullable(),
            available: count.nullable(),
            admission_result: z.enum(['not-evaluated', 'admitted', 'refused']),
        })),
    }),
    active_mechanisms: z.array(z.enum(['validator-catalogue', 'verification-plan', 'young-daly-checkpoint-input', 'dependency-closure-input', 'coverage-mmr-context-input'])),
    deferred_mechanisms: z.array(z.string().min(1)),
    limits: z.array(z.string().min(1)),
});
export const VerificationPlanSchema = VerificationPlanBodySchema.extend({ plan_ref: hash });
/** A control addressed to a run. The id locates; principal and scope authorize (K-19). */
export const ControlRequestSchema = z.strictObject({
    verb: z.enum(CONTROL_VERBS),
    control_id: z.string().min(1).max(128),
    text: z.string().min(1).max(100_000).optional(),
    handle: z.string().optional(),
    reason: z.string().max(1_000).optional(),
    /**
     * The reviewer client's measure of active handling for an answer, in
     * milliseconds (MTH-AT-001, D-1). The runtime refuses a value longer than
     * the item has waited since it parked, and otherwise records it on the
     * settlement, where attention calibration reads it as service time.
     */
    active_handling_ms: z.number().int().min(0).max(31_536_000_000).optional(),
}).superRefine((control, context) => {
    if (control.active_handling_ms !== undefined && control.verb !== 'answer') {
        context.addIssue({
            code: 'custom',
            path: ['active_handling_ms'],
            message: `active_handling_ms measures how long a reviewer handled an answer, and a ${control.verb} control has no review to measure. Remove it, or send it with verb answer`,
        });
    }
});
/** One retryable public request to start or resume an existing run. */
export const RunLifecycleCommandRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    reason: z.string().min(1).max(1_000).optional(),
});
/**
 * A deferred resume. Only this command may name not_before, the earliest
 * time its timer wake may launch the run (B-2, MTH-TW-003). The scheduler
 * records this as a canonical wake before the command is accepted.
 */
export const RunResumeDeferredRequestSchema = RunLifecycleCommandRequestSchema.extend({
    not_before: z.string().datetime().optional(),
});
/** Fork management request (ERD 9.5). A fork inherits history, never authority. */
export const ForkRequestSchema = z.strictObject({
    at_entry_id: id('ent'),
    reason: z.string().max(1_000).optional(),
    budgets: BudgetsSchema.optional(),
    idempotency_key: z.string().min(1).max(256),
});
/** Re-execution request (ERD 9.5): evaluation by running the saved inputs again.
 * Omitting the frontier re-runs from the objective. */
export const ReexecuteRequestSchema = z.strictObject({
    at_entry_id: id('ent').optional(),
    reason: z.string().max(1_000).optional(),
    budgets: BudgetsSchema.optional(),
    /** Resolve under a different pinned posture; the identity diff is reported before outcomes compare (XCV-001). */
    posture_ref: hash.optional(),
    idempotency_key: z.string().min(1).max(256),
});
/** A model-visible entry. Entries form a tree; any entry is a fork target (K-8). */
export const EntrySchema = z.strictObject({
    entry_id: id('ent'),
    run_id: id('run'),
    parent_id: id('ent').nullable(),
    role: z.enum(ENTRY_ROLES),
    /** Evidence facts ride beside the text, so the content hash covers them (CTX-002). */
    content: z.strictObject({ text: z.string(), evidence: EntryEvidenceSchema.optional() }),
    content_hash: hash,
});
/** The envelope every runtime record travels in. Payloads validate per type. */
export const RecordEnvelopeSchema = z.strictObject({
    record_id: id('rec'),
    run_id: id('run'),
    seq: z.number().int().positive(),
    logical_clock: z.number().int().nonnegative(),
    causal_parent: id('rec').nullable(),
    type: z.enum(RECORD_TYPES),
    type_version: z.number().int().positive(),
    at: z.string(),
    payload: z.record(z.string(), z.unknown()),
    chain_hash: hash,
});
const leaseFields = {
    lease_id: id('lea'),
    pool: z.enum(LEASE_POOLS),
    denomination: z.enum(LEASE_DENOMINATIONS),
    amount: count,
};
const PhaseCheckpointScheduleSchema = z.strictObject({
    phase: z.string().min(1),
    starts_after_items: count,
    interval_items: count,
    contract_ceiling: count,
    inputs_hash: hash,
    recorded_before_position: count,
});
/**
 * What a sequential sampled-oracle check examined and why it stopped: the
 * pinned oracle and frame, each examined item's oracle answer, the boundary
 * trace, and the error guarantee label it can state (MTH-SV-001 to MTH-SV-010).
 */
export const SequentialSamplingRecordSchema = z.strictObject({
    oracle_ref: hash,
    frame_hash: hash.nullable(),
    population: count,
    examined: count,
    defects: count,
    stop_reason: z.enum(SEQUENTIAL_STOP_REASONS),
    items: z.array(z.strictObject({ item_id: z.string().min(1), outcome: z.enum(SAMPLED_ORACLE_OUTCOMES) })).max(100_000),
    trace: z.record(z.string(), z.unknown()),
    guarantee: z.record(z.string(), z.unknown()),
});
/** The review-time estimate recorded when a parked batch suspends a run (MTH-AT-007, GAP-004). */
export const AttentionEstimateRecordSchema = z.strictObject({
    class: z.string().min(1).max(200),
    items: count,
    setup_ms: count,
    per_item_ms: count,
    total_ms: count,
    amortized_per_item_ms: count,
});
/** Payload schemas per record type. Strict: an unknown field is a defect, not data. */
export const RECORD_PAYLOADS = {
    'run.created': z.strictObject({
        /** The admitted creation time. Older records fall back to the record envelope time. */
        created_at: z.string().datetime().optional(),
        objective: z.string(),
        agent_ref: hash,
        agent_name: z.string(),
        model_ref: z.string(),
        principals: PrincipalsSchema,
        budgets: BudgetsSchema,
        task_contract_ref: hash.nullable(),
        /** The declared work list. The ledger seeds from this on rebuild. */
        items: z.array(z.string()),
        idempotency_key: z.string(),
        /** The canonical admitted request. Reusing the key with different content refuses. */
        request_fingerprint: hash.optional(),
        correlation_id: z.string().nullable(),
        profile: z.enum(PROFILES),
        /**
         * The run's artifact fence nonce: random, minted at intake, fresh for
         * each fork and reexecution, and kept outside identity (CTX-007).
         */
        context_fence_nonce: ContextFenceNonceSchema.optional(),
        resolved: z.strictObject({
            /** The immutable transitive closure whose hash is agent_ref. */
            manifest: ResolvedRunManifestSchema.optional(),
            /** Every choice the runtime made for the caller, narrated (DX-010). */
            narration: z.array(z.string()),
            verified_completion_reachable: z.boolean(),
            contract_name: z.string().nullable(),
            posture: z.strictObject({ ref: hash, name: z.string(), version: z.string() }).nullable(),
            /** The enforced adaptive schedule, pinned at resolution (MTH-CP-002, MTH-CP-007). */
            checkpoint: z
                .strictObject({
                interval_items: count,
                contract_ceiling: count,
                controller: z.string(),
                reason: z.string(),
                fallback_used: z.boolean(),
                inputs_hash: hash,
                phase_schedules: z.array(PhaseCheckpointScheduleSchema),
                projected_checkpoints: count,
                projected_cost_ms: count,
                reserve_ms: count,
            })
                .nullable(),
            /** Exact compiler inputs; the plan itself remains a rebuildable projection. */
            verification_plan_inputs: VerificationPlanInputSchema.optional(),
            items_declared: count,
            repair_budget: count,
        }),
    }),
    'run.started': z.strictObject({}),
    'run.lifecycle.command.accepted': z.strictObject({
        command: z.enum(RUN_LIFECYCLE_COMMANDS),
        idempotency_key: z.string().min(1).max(256),
        request_fingerprint: hash,
        principal: z.string().min(1).max(512),
        reason: z.string().nullable(),
        /** Earliest launch time for resume-deferred. Older acceptances omit it. */
        not_before: z.string().datetime().nullable().optional(),
    }),
    'entry.appended': z.strictObject({
        entry_id: id('ent'),
        parent_id: id('ent').nullable(),
        role: z.enum(ENTRY_ROLES),
        content_hash: hash,
        branch_id: id('brn'),
        /** True when the entry exists but sits off the current path, as after a redirect. */
        abandoned: z.boolean(),
    }),
    'branch.created': z.strictObject({
        branch_id: id('brn'),
        reason: z.enum(BRANCH_REASONS),
        head_entry_id: id('ent').nullable(),
    }),
    'branch.head.moved': z.strictObject({
        branch_id: id('brn'),
        from_entry_id: id('ent').nullable(),
        to_entry_id: id('ent'),
        reason: z.enum(BRANCH_REASONS),
    }),
    'context.assembled': closureAttributed({
        turn: count,
        included_entries: z.array(id('ent')),
        omitted: z.array(z.strictObject({ entry_id: id('ent'), reason: z.string() })),
        token_estimate: count,
        /** The assembly inputs, so the exact window replays from the log alone (CTX-012). */
        head_entry_id: id('ent').nullable(),
        budget_tokens: count,
        instructions_hash: hash,
        /** The omission set covers found and excluded only, never undiscovered sources (CTX-004). */
        covers: z.literal('discovered-candidates-only'),
        /**
         * Progressive skill disclosure for this window (DXI-009): which pinned
         * descriptors the model could see, which the catalogue budget left out,
         * and which loaded skill bytes still stood under their retention. Absent
         * when the run pins no skill.
         */
        skills: z
            .strictObject({
            catalogue_budget_tokens: count,
            page: z.number().int().min(1),
            pages: z.number().int().min(1),
            advertised: z.array(z.strictObject({ skill_ref: hash, tokens: count })),
            omitted: z.array(z.strictObject({ skill_ref: hash, reason: z.literal('skill-catalogue-budget') })),
            retained: z.array(z.strictObject({ skill_ref: hash, entry_id: id('ent'), retention: z.enum(SKILL_RETENTIONS) })),
            expired: z.array(z.strictObject({ skill_ref: hash, entry_id: id('ent'), reason: z.literal('skill-retention-expired') })),
        })
            .optional(),
        /** New writers record the same canonical view attached to model.call.started. */
        tools: ToolViewRecordSchema.optional(),
        /** Every included entry as a cited span. Absent in windows recorded before spans were persisted (CTX-002). */
        spans: z.array(CitedSpanSchema).optional(),
        /** The artifact ranges the window asked for, by handle and range, never by bytes. */
        artifact_entries: z.array(z.strictObject({
            entry_id: id('ent'),
            artifact_ref: artifactHandle,
            expected_content_hash: hash,
            start: count,
            end: count,
            required_for_completion: z.boolean(),
        })).optional(),
        /** The artifact ranges the window placed behind the fence nonce. */
        artifact_spans: z.array(ArtifactContextSpanSchema).optional(),
        fence_nonce: ContextFenceNonceSchema.optional(),
        /** Cited artifact evidence that could not stand in this window (QLT-031). */
        evidence_blockers: z.array(ArtifactEvidenceBlockerSchema).optional(),
        instructions_tokens: count.optional(),
        /** The work status the instructions named, so replay composes them without the store's ledger order (CTX-012). */
        work_status: z.strictObject({ items_declared: count, remaining: z.array(z.string()).max(13), untouched: count }).optional(),
    }),
    'model.call.started': closureAttributed({
        turn: count,
        call_id: hash,
        adapter: z.string(),
        model_ref: z.string(),
        context_ref: hash,
        lease_id: id('lea'),
        credential_epoch: z.number().int().min(1).nullable(),
        /** Absent means historical v0 behavior: the complete pinned closure was visible. */
        tool_view: ToolViewRecordSchema.optional(),
    }),
    'model.call.finished': closureAttributed({
        turn: count,
        /** Absent when a known pre-dispatch cancellation produced no transcript entry. */
        entry_id: id('ent').optional(),
        stop_reason: z.enum(STOP_REASONS),
        usage: z.strictObject({
            input_tokens: count,
            output_tokens: count,
            measurement: z.enum(MODEL_USAGE_MEASUREMENTS).optional(),
            metered: z.boolean().optional(),
        }),
    }),
    'model.call.failed': closureAttributed({
        turn: count,
        provider_code: z.string(),
        message: z.string(),
        partial_entry_id: id('ent').nullable(),
    }),
    /** One descent through the declared ordered fallback set (DXI-015). */
    'model.fallback.switched': closureAttributed({
        turn: count,
        candidate: z.number().int().min(1),
        from_model_ref: z.string(),
        to_model_ref: z.string(),
        to_catalogue_entry_ref: hash,
        to_credential_epoch: z.number().int().min(1).nullable(),
        reason: z.string(),
    }),
    'turn.completed': closureAttributed({ turn: count }),
    'control.received': z.strictObject({
        control_id: z.string(),
        verb: z.enum(CONTROL_VERBS),
        text: z.string().nullable(),
        reason: z.string().nullable(),
        handle: z.string().nullable(),
        /** Authenticated by the transport, never accepted from the request body. */
        principal: z.string().min(1).optional(),
        /** The exact authority used for this accepted control. */
        scope: z.enum(['run:control', 'run:cancel']).optional(),
    }),
    'control.applied': z.strictObject({
        control_id: z.string(),
        verb: z.enum(CONTROL_VERBS),
        detail: z.string(),
    }),
    'lease.opened': z.strictObject({
        pool: z.enum(LEASE_POOLS),
        denomination: z.enum(LEASE_DENOMINATIONS),
        capacity: count,
    }),
    'lease.reserved': z.strictObject(leaseFields),
    'lease.consumed': z
        .strictObject({
        ...leaseFields,
        reserved: count,
        /** Measured use past the reservation, charged in full. Absent when use stayed within the reservation. */
        overrun: z.number().int().positive().optional(),
    })
        .superRefine((value, context) => {
        // The overrun is derived, never free: present exactly when the charge
        // passed the reservation, and then equal to the difference, so a fold
        // of the record can never disagree with the settlement it summarizes.
        const expected = value.amount > value.reserved ? value.amount - value.reserved : undefined;
        if (value.overrun !== expected) {
            context.addIssue({
                code: 'custom',
                path: ['overrun'],
                message: expected === undefined
                    ? `overrun appears only when amount passes reserved, and ${value.amount} is within ${value.reserved}`
                    : `amount ${value.amount} passes reserved ${value.reserved}, so overrun must be ${expected}, not ${value.overrun ?? 'absent'}`,
            });
        }
    }),
    'lease.released': z.strictObject({ ...leaseFields }),
    'subrun.opened': z.strictObject({
        child_run_id: id('run'),
        objective: z.string(),
        reserved: count,
        lease_id: id('lea'),
        depth: count,
    }),
    'subrun.finished': z.strictObject({
        child_run_id: id('run'),
        terminal: z.enum(RUN_TERMINALS).nullable(),
        /** The structured return, version one: never free prose alone (SUB-005). */
        finding: z.strictObject({
            schema: z.literal('subrun-finding/1'),
            artifact: z.string().max(4_096).nullable(),
            verdict: z.enum(VERDICTS).nullable(),
            turns: count,
        }),
        consumed: count,
    }),
    'tool.invoked': closureAttributed({
        invoke_id: z.string(),
        tool: z.string(),
        version: z.string(),
        operation_class: z.enum(OPERATION_CLASSES),
        isolation: z.enum(TRUST_TIERS),
        /** The durable trust label: unmetered runs lowered and unbounded (BUD-005). */
        metering: z.enum(TOOL_METERING),
        refused: z.boolean(),
        clause: z.string().nullable(),
        /** Present for native source operations; the resolved run manifest owns the expanded identity. */
        source_alias: z.string().regex(/^[a-z][a-z0-9-]{0,62}$/).optional(),
        binding_ref: z.string().regex(/^source-binding:\/\/sha256:[0-9a-f]{64}$/).optional(),
        snapshot_ref: z.string().regex(/^source-snapshot:\/\/sha256:[0-9a-f]{64}$/).optional(),
        /** Runtime-local activation selects this already-pinned ref for later model views. */
        activated_contract_ref: hash.optional(),
    }),
    'tool.remote.pending': closureAttributedSchema(RemoteToolTaskHandleSchema),
    'tool.finished': closureAttributed({
        invoke_id: z.string(),
        ok: z.boolean(),
        /** Older durable logs predate typed outcomes. New writers always include one. */
        outcome: z.enum(TOOL_EXECUTION_OUTCOMES).optional(),
        elapsed_ms: count,
        output: z.string().max(4_096).nullable(),
        error: z.string().nullable(),
    }),
    'environment.prepare.requested': closureAttributedSchema(PrepareEnvironmentRequestSchema),
    'environment.prepared': closureAttributedSchema(PrepareEnvironmentResultSchema),
    'environment.reused': closureAttributedSchema(EnvironmentReuseRecordSchema),
    'environment.job.submit.requested': closureAttributedSchema(SubmitEnvironmentJobRequestSchema),
    'environment.job.submitted': closureAttributedSchema(SubmitEnvironmentJobResultSchema),
    'environment.job.observe.requested': closureAttributedSchema(ObserveEnvironmentJobRequestSchema),
    'environment.job.observed': closureAttributedSchema(ObserveEnvironmentJobResultSchema),
    'environment.job.reconcile.requested': closureAttributedSchema(ReconcileEnvironmentJobRequestSchema),
    'environment.job.reconciled': closureAttributedSchema(ReconcileEnvironmentJobResultSchema),
    'environment.job.cancel.requested': closureAttributedSchema(CancelEnvironmentJobRequestSchema),
    'environment.job.cancelled': closureAttributedSchema(CancelEnvironmentJobResultSchema),
    'environment.artifact.collect.requested': closureAttributedSchema(CollectEnvironmentArtifactRequestSchema),
    'environment.artifact.collected': closureAttributedSchema(CollectEnvironmentArtifactResultSchema),
    'artifact.committed': closureAttributedSchema(RuntimeArtifactCommittedRecordSchema),
    'environment.teardown.requested': closureAttributedSchema(TeardownEnvironmentRequestSchema),
    'environment.teardown.recorded': closureAttributedSchema(TeardownEnvironmentResultSchema),
    'environment.abandon.requested': closureAttributedSchema(AbandonEnvironmentRequestSchema),
    'environment.abandoned': closureAttributedSchema(AbandonEnvironmentResultSchema),
    /** Durable before anything external happens (EFX-005). */
    'effect.prepared': z.strictObject({
        descriptor: EffectDescriptorSchema,
        grant_ref: hash,
        evidence_resolved: count,
    }),
    'effect.authority.decision': EffectApprovalRecordedSchema,
    'effect.authority.invalidated': EffectApprovalInvalidatedSchema,
    'effect.dispatched': z.strictObject({
        effect_id: id('eff'),
        target: z.string(),
        operation: z.string(),
        /** The epoch the authority answered at, or null when no authority is wired (EFX-014). */
        authority_epoch: count.nullable(),
    }),
    'effect.resolved': z.strictObject({
        effect_id: id('eff'),
        /** committed with a receipt; outcome_unknown with none; prepared again after a reconciliation found nothing (EFX-008); withdrawn by an authorized cancellation before dispatch (EFX-023). */
        state: z.enum(['committed', 'outcome_unknown', 'prepared', 'withdrawn']),
        via: z.enum(['dispatch', 'reconciliation', 'recovery', 'withdrawal', 'authority-decision']),
        receipt: ReceiptSchema.nullable(),
        reason: z.string(),
        /** Present exactly when state is withdrawn: who authorized the non-dispatch and where the fence stood (EFX-023). */
        withdrawal: z.union([
            z.strictObject({
                control_id: z.string().min(1),
                principal: z.string().min(1),
                prior_state: z.literal('prepared'),
                fence: count,
            }),
            z.strictObject({
                decision_id: z.string().regex(/^ead_[0-9a-f]{32}$/, 'expected an effect authority decision id'),
                principal: z.string().min(1),
                prior_state: z.literal('prepared'),
                fence: count,
            }),
        ]).optional(),
    }),
    'effect.unreconcilable': z.strictObject({
        effect_id: id('eff'),
        reason: z.string(),
    }),
    /**
     * An owner receipt that arrived after its effect had moved to a state
     * with no move to committed. It is kept as evidence and moves nothing,
     * so an operator and the next reconciliation see what the owner said
     * (EFX-006, EFX-008).
     */
    'effect.answer.late': z.strictObject({
        effect_id: id('eff'),
        /** Where the effect stood when the answer arrived. */
        state: z.enum(['prepared', 'withdrawn', 'unreconcilable']),
        via: z.enum(['dispatch', 'reconciliation']),
        receipt: ReceiptSchema,
        reason: z.string(),
    }),
    /** Explicit non-agent re-issuance after an identity change (ECV-012). */
    'grant.superseded': z.strictObject({
        superseded_ref: z.string().min(1),
        replacement_ref: z.string().min(1),
        identity_diff: z.array(z.string().min(1).max(300)),
        approver: z.string().min(1).max(128),
        /** The attested replacement a per-run re-issue folds into the head (IDM-024). */
        replacement_grant: StaticGrantSchema.optional(),
    }),
    'item.attempted': closureAttributed({
        item_id: z.string(),
        output: z.string().max(4_096),
        attempt: count,
        turn: count,
        /** The branch where the attempt was made, when the run has a branch head. */
        branch_id: id('brn').nullable().optional(),
        /** What producing this item read. Edges for the affected closure (MTH-RP-002). */
        reads: z.array(z.string()).nullable(),
        /** Refused attempts are durable but do not move the item state. */
        refused: z.boolean().optional(),
        refusal_state: z.enum(ITEM_STATES).optional(),
        refusal_reason: z.string().max(1_000).optional(),
    }),
    'item.parked': z.strictObject({
        item_id: z.string(),
        reason: z.string(),
        checkpoint_id: z.string(),
        /** The attention class the parked item waits in (MTH-AT-002). */
        escalation_class: z.string().min(1).max(200).optional(),
    }),
    'item.invalidated': z.strictObject({
        item_id: z.string(),
        checkpoint_id: z.string(),
        widened: z.boolean(),
    }),
    'gap.settled': z.strictObject({
        item_id: z.string(),
        /** The named person who supplied the evidence (Q-15). */
        resolver: z.string(),
        output: z.string().max(4_096),
        /** Active handling the reviewer reported, bounded by the wait (MTH-AT-001). */
        active_handling_ms: count.optional(),
    }),
    'gap.dismissed': z.strictObject({
        item_id: z.string(),
        resolver: z.string(),
        reason: z.string(),
        active_handling_ms: count.optional(),
    }),
    'checkpoint.started': closureAttributed({
        checkpoint_id: z.string(),
        position: count,
        covered_items: z.array(z.string()),
    }),
    'checkpoint.passed': closureAttributed({
        checkpoint_id: z.string(),
        covered_items: z.array(z.string()),
        validator_versions: z.array(z.string()),
        sampling: SequentialSamplingRecordSchema.optional(),
    }),
    'checkpoint.rejected': closureAttributed({
        checkpoint_id: z.string(),
        rejected_items: z.array(z.string()),
        surviving_items: z.array(z.string()),
        failure_class: z.enum(FAILURE_CLASSES),
        reason: z.string(),
        validator_versions: z.array(z.string()),
        /** The affected-closure accounting when declared dependencies decide the blast radius (MTH-RP-011). */
        repair_scope: z
            .strictObject({
            affected: count,
            traversed_edges: count,
            reused: count,
            widening_depth: count,
            recomputed_fraction_ppm: count,
            avoided_recomputation: count,
            reused_nodes: z.array(z.string()),
            reason: z.string(),
            /** The hash of the dependency projection the closure was computed over (MTH-RP-004). */
            projection_hash: hash.optional(),
            /** The declared traversal bound the closure respected. */
            max_nodes: count.optional(),
        })
            .nullable(),
        sampling: SequentialSamplingRecordSchema.optional(),
    }),
    'checkpoint.indeterminate': closureAttributed({
        checkpoint_id: z.string(),
        covered_items: z.array(z.string()),
        reason: z.string(),
        infrastructure: z.boolean(),
    }),
    'repair.started': z.strictObject({
        attempt: count,
        budget: count,
        items: z.array(z.string()),
        widened: z.boolean(),
    }),
    'completion.proposed': closureAttributed({
        turn: count,
        artifact_entry_id: id('ent'),
    }),
    'verification.concluded': closureAttributed({
        verdict: z.enum(VERDICTS),
        reason: z.string(),
        validator_versions: z.array(z.string()),
        /** What each validator actually examined, content addressed (QLT-005). */
        examined: z.array(z.strictObject({ validator: z.string(), input_hash: z.string(), items: z.number() })),
        /** Cited artifact evidence that kept the verdict from verified (QLT-031, QLT-033). */
        evidence_blockers: z.array(ArtifactEvidenceBlockerSchema).optional(),
    }),
    'run.suspended': z.strictObject({
        reason: z.enum(SUSPEND_REASONS),
        detail: z.string(),
        /** Every pending worker handle at the suspension boundary (KRN-032). */
        pending: z.strictObject({
            model: z.string().nullable(),
            tools: z.array(z.string()),
            validators: z.array(z.string()),
            effects: z.array(z.string()),
            attention: z.array(z.string()),
            environments: z.array(SuspendedEnvironmentHandleSchema),
            remote_tools: z.array(RemoteToolTaskHandleSchema).default([]),
        }),
        /** What would resume this run, stated as a condition, not a hope. */
        wake: z.strictObject({ condition: z.string().min(1).max(200), detail: z.string().nullable() }),
        /** The disposition of every open pool while the run waits (BUD-010, BUD-011). */
        leases: z.array(z.strictObject({
            pool: z.string(),
            denomination: z.string(),
            reserved: z.number(),
            consumed: z.number(),
            disposition: z.enum(['retained', 'released']),
            /** The headroom this disposition covers, and why it goes that way. */
            amount: z.number(),
            reason: z.string().min(1).max(300),
        })),
        /** The batch review estimate when parked items suspend the run awaiting answers. */
        attention_estimate: AttentionEstimateRecordSchema.optional(),
    }),
    /** A resume attempt that could not pass preflight: categorized, durable, and free of external calls (KRN-033). */
    'run.resume.blocked': z.strictObject({
        category: z.enum(RUN_RESUME_BLOCK_CATEGORIES),
        message: z.string().min(1),
        next: z.string().min(1),
    }),
    'run.resumed': z.strictObject({}),
    'run.cancelled': z.strictObject({
        reason: z.string(),
        /** Present when the cancellation worker settled a run with no live loop: what each obligation class came to before this commit (KRN-034). */
        settlement: z
            .strictObject({
            effects: z.strictObject({ committed: count, withdrawn: count, unreconcilable: count }),
            handles_dismissed: count,
            wakes_settled: count,
            descendants_cancelled: count,
            leases_released: count,
        })
            .optional(),
    }),
    'run.finished': closureAttributed({
        terminal: z.enum(RUN_TERMINALS),
        artifact_entry_id: id('ent').nullable(),
    }),
    'run.forked': z.strictObject({
        from_run_id: id('run'),
        at_entry_id: id('ent'),
        reason: z.string(),
        copied_entries: count,
    }),
    /**
     * Erasure leaves named holes: the records and their hashes stand, the
     * entry bytes are gone, and this record says who erased what and why.
     * A hole with this record is erasure; a hole without it is tampering.
     */
    'subject.erasure.completed': z.strictObject({
        subject: z.string().min(1),
        entry_ids: z.array(id('ent')).min(1),
        /** The named non-agent principal who ordered the erasure. */
        by: z.string().min(1),
        reason: z.string().min(1),
    }),
    /** The exact wake condition stays canonical; wheel buckets are projections (MTH-TW-001). */
    'wake.scheduled': z.strictObject({
        wake_id: id('wak'),
        due_at: z.string().datetime(),
        condition: z.string().min(1).max(200),
        /** Low-cardinality operator grouping. It never contains a tenant id. */
        tenant_class: z.string().min(1).max(200).optional(),
    }),
    'wake.claimed': z.strictObject({
        wake_id: id('wak'),
        /** Who claimed it, when not the ordinary tick (KRN-034, LIF-035, MTH-TW-003). */
        via: z.enum(WAKE_CLAIM_VIAS).optional(),
    }),
    /** Encrypted cross-run memory payload. Clear metadata supports folding after subject-key erasure. */
    'memory.event.recorded': z.strictObject({
        subject_ref: hash,
        memory_kind: z.enum(MEMORY_EVENT_KINDS),
        assertion_id: hash.nullable(),
        event_ref: hash,
        nonce: z.string().min(1),
        ciphertext: z.string().min(1),
        tag: z.string().min(1),
    }),
    /** A run records only references and degradation, never memory payload bytes (MEM-008, MEM-009). */
    'memory.read.recorded': z.strictObject({
        query_ref: hash,
        binding_ref: hash.optional(),
        subject_ref: hash.optional(),
        envelope_ref: artifactHandle.nullable().optional(),
        envelope_content_hash: hash.nullable().optional(),
        scope: z.enum(['cross-run', 'session']),
        status: z.enum(['available', 'stale', 'unavailable']),
        watermark: z.number().int().nonnegative().nullable(),
        assertion_ids: z.array(hash),
        reason: z.string().nullable(),
    }),
    'reexecution.started': z.strictObject({
        from_run_id: id('run'),
        at_entry_id: id('ent'),
        /** The evaluation intent: the new run deliberately calls models again (KRN-008). */
        reason: z.string(),
        copied_entries: count,
        /** The identity diff, reported before any outcome exists to compare (XCV-001). */
        posture_diff: z.strictObject({
            source_ref: hash.nullable(),
            resolved_ref: hash.nullable(),
            changes: z.array(z.string()),
        }),
    }),
    'external.observation.received': ExternalObservationRecordedSchema,
    'external.observation.applied': ExternalObservationAppliedSchema,
    'projection.rebuilt': z.strictObject({
        projection: z.string(),
        equal: z.boolean(),
        healed: z.boolean(),
    }),
    'capability.admission.requested': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        base_closure_epoch: z.number().int().min(1),
        base_closure_ref: hash,
        request: CapabilityAdmissionRequestSchema,
        idempotency_key: z.string().min(1).max(256),
        request_fingerprint: hash,
        resolution_lease: z.strictObject({
            lease_id: id('lea'),
            bytes: count,
            compute_lease_id: id('lea'),
            compute_ms: count,
        }),
        /** Bounded immutable metadata captured before byte/compute reservation. */
        candidate_estimate: z.strictObject({
            publication_ref: hash,
            root_ref: hash,
            root_kind: z.enum(['procedure', 'tool']),
            name: z.string().min(1).max(256),
            version: z.string().min(1).max(128),
            total_bytes: count,
            resource_count: count,
        }),
        requested_by: z.strictObject({
            application_principal: z.string().min(1).max(512),
            represented_principal: z.string().min(1).max(512).nullable(),
            scope: z.literal('capability:request'),
            scope_epoch: z.number().int().min(1),
        }),
        requested_at: z.string().datetime(),
    }),
    'capability.admission.classified': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        plan: CapabilityAdmissionPlanSchema,
        /** Null for a refused/superseded resolution that never built a candidate closure. */
        effective_manifest: ResolvedRunManifestSchema.nullable(),
    }),
    'capability.admission.decided': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        decision: z.enum(['approve', 'refuse']),
        status: z.enum(['approved', 'refused', 'superseded']),
        expected_plan_ref: hash,
        policy_ref: hash,
        policy_epoch: z.number().int().min(1),
        reason: z.string().min(1).max(2_000),
        idempotency_key: z.string().min(1).max(256),
        request_fingerprint: hash,
        decided_by: z.strictObject({
            application_principal: z.string().min(1).max(512),
            represented_principal: z.string().min(1).max(512).nullable(),
            scope: z.literal('capability:decide'),
            scope_epoch: z.number().int().min(1),
        }),
        decided_at: z.string().datetime(),
    }),
    'capability.admission.cancelled': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        reason: z.string().min(1).max(2_000),
        idempotency_key: z.string().min(1).max(256),
        request_fingerprint: hash,
        cancelled_by: z.strictObject({
            application_principal: z.string().min(1).max(512),
            represented_principal: z.string().min(1).max(512).nullable(),
            scope: z.literal('capability:cancel'),
            scope_epoch: z.number().int().min(1),
        }),
        cancelled_at: z.string().datetime(),
    }),
    'closure.epoch.committed': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        base_closure_epoch: z.number().int().min(1),
        base_closure_ref: hash,
        closure_epoch: z.number().int().min(2),
        closure_ref: hash,
        plan_ref: hash,
        admitted_package_ref: hash,
        consequence_diff_ref: hash,
        effective_manifest: ResolvedRunManifestSchema,
        committed_at: z.string().datetime(),
    }),
    'closure.epoch.activated': z.strictObject({
        request_id: id('cap'),
        tenant: z.string().min(1).max(256),
        closure_epoch: z.number().int().min(2),
        closure_ref: hash,
        plan_ref: hash,
        activated_at: z.string().datetime(),
    }),
    /** The run-scoped browser binding materialized from the pinned template after the run id existed (BRC-001). */
    'browser.binding.pinned': z.strictObject({
        template_ref: hash,
        binding: BrowserBindingSchema,
    }),
    /** A durable destination proposal; the relay keeps refusing the origin until a decision (BRC-012). */
    'browser.destination.proposed': z.strictObject({
        proposal: BrowserDestinationProposalSchema,
    }),
    /** An authenticated disposition on one proposal (BRC-013). A refusal grants nothing. */
    'browser.destination.decided': z.strictObject({
        decision: BrowserDestinationDecisionSchema,
    }),
    /** The successor binding an approval produced; it activates at the next turn boundary (BRC-014). */
    'browser.binding.superseded': z.strictObject({
        superseded_binding_ref: hash,
        binding: BrowserBindingSchema,
    }),
};
/** The run head snapshot: a synchronization checkpoint, never the canonical source (X-2). */
export const RunSnapshotSchema = z.strictObject({
    run_id: id('run'),
    status: z.enum(RUN_STATUSES),
    completion_state: z.enum(COMPLETION_STATES),
    terminal: z.enum(RUN_TERMINALS).nullable(),
    suspend_reason: z.enum(SUSPEND_REASONS).nullable(),
    turn: count,
    current_branch: id('brn').nullable(),
    head_entry_id: id('ent').nullable(),
    entry_count: count,
    agent_name: z.string(),
    model_ref: z.string(),
    objective: z.string(),
    budgets: BudgetsSchema.nullable(),
    /** Per pool and denomination. Consumed includes any overrun; overrun appears once settled use passes its reservations. */
    usage: z.record(z.string(), z.strictObject({ reserved: count, consumed: count, overrun: z.number().int().positive().optional() })),
    verified_completion_reachable: z.boolean(),
    /** Work-state counts from the ledger projection; null when no items were declared. */
    items: z.record(z.enum(ITEM_STATES), count).nullable(),
    contract: z.strictObject({ name: z.string(), ref: hash, repair_attempts_used: count, repair_budget: count }).nullable(),
    /** Latest recorded model-call tool view; null is the explicit legacy/full-closure default. */
    tool_view: ToolViewRecordSchema.nullable().optional(),
    /** Bounded hot projection for governed same-run capability amendments. */
    active_closure_epoch: z.number().int().min(1).optional(),
    active_closure_ref: hash.optional(),
    pending_capability_admission_count: count.optional(),
    snapshot_version: count,
});
/** Filters for the tenant run-head index. Time bounds are inclusive then exclusive. */
export const WorkQueryRequestSchema = z.strictObject({
    cursor: hash.optional(),
    limit: z.number().int().min(1).max(100).optional(),
    lifecycle_state: z.enum(RUN_STATUSES).optional(),
    completion_class: z.enum(ASSURANCE_COMPLETION_CLASSES).optional(),
    review_state: z.enum(RUN_REVIEW_STATES).optional(),
    publication_ref: hash.optional(),
    created_from: z.string().datetime().optional(),
    created_before: z.string().datetime().optional(),
    correlation_id: z.string().min(1).max(256).optional(),
}).superRefine((query, context) => {
    if (query.created_from && query.created_before && query.created_from >= query.created_before) {
        context.addIssue({
            code: 'custom',
            path: ['created_before'],
            message: 'created_before must be later than created_from. Widen or correct the work-query time window.',
        });
    }
});
/** One bounded search row from the rebuildable run-head projection. */
export const WorkQueryItemSchema = z.strictObject({
    run_id: id('run'),
    created_at: z.string().datetime(),
    status: z.enum(RUN_STATUSES),
    completion_state: z.enum(COMPLETION_STATES),
    terminal: z.enum(RUN_TERMINALS).nullable(),
    completion_class: z.enum(ASSURANCE_COMPLETION_CLASSES),
    review_state: z.enum(RUN_REVIEW_STATES),
    publication_ref: hash.nullable(),
    correlation_id: z.string().min(1).max(256).nullable(),
    agent_name: z.string(),
    objective: z.string(),
});
/** A keyset page. The cursor is an opaque hash, never a run identifier. */
export const WorkQueryPageSchema = z.strictObject({
    items: z.array(WorkQueryItemSchema).max(100),
    next_cursor: hash.nullable(),
});
export const RunIntegrityFindingSchema = z.strictObject({
    code: z.string(),
    message: z.string(),
    seq: count.optional(),
    anchor_ref: hash.optional(),
});
export const RunIntegritySummarySchema = z.strictObject({
    ok: z.boolean(),
    anchor_store_available: z.boolean(),
    last_anchored_seq: count,
    last_anchored_head: hash.nullable(),
    latest_anchor_ref: hash.nullable(),
    unanchored_tail_records: count,
    unanchored_tail: z.strictObject({ from_seq: count, to_seq: count, reason: z.string() }).nullable(),
    findings: z.array(RunIntegrityFindingSchema),
});
// ---- external evidence report shapes (EVD-014). ----
export const ExternalEvidencePropertySchema = z.strictObject({
    family: z.enum(EXTERNAL_EVIDENCE_PROPERTY_FAMILIES),
    standing: z.enum(EXTERNAL_EVIDENCE_STANDINGS),
    classification: z.enum(EXTERNAL_EVIDENCE_CLASSIFICATIONS),
    evidence_record_ids: z.array(z.string().min(1)),
    verification_strength: z.enum(EXTERNAL_EVIDENCE_STRENGTHS),
    candidate: z.record(z.string(), z.unknown()).optional(),
    conflict: z.string().min(1).nullable(),
    clause: z.string().min(1).optional(),
    requirement_id: z.string().min(1).optional(),
});
export const ExternalEvidenceDecisionSchema = z.strictObject({
    decision_id: z.string().min(1),
    kind: z.enum(EXTERNAL_EVIDENCE_DECISION_KINDS),
    anchoring_record_id: z.string().min(1),
    run_id: id('run'),
    properties: z.array(ExternalEvidencePropertySchema).length(EXTERNAL_EVIDENCE_PROPERTY_FAMILIES.length),
});
export const ExternalEvidenceMetricSummarySchema = z.strictObject({
    decision_count: count,
    property_count: count,
    sufficient_property_count: count,
    design_exclusion_property_count: count,
    gap_property_count: count,
    property_sufficiency_accuracy_ppm: count,
    overclaim_rate_ppm: count,
    underclaim_rate_ppm: count,
    gap_localization_ppm: count,
    overclaim_count: count,
});
export const ExternalEvidenceRubricSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().min(1),
    source_ref: hash,
    read_as: z.string().min(1),
});
export const ExternalEvidenceReferenceBundleSchema = z.strictObject({
    bundle_ref: hash,
    label: z.string().min(1),
    vector_id: z.string().min(1),
    run_id: id('run'),
    format: z.string().min(1),
    record_count: count,
    checksum_sha256: z.string().regex(/^[0-9a-f]{64}$/),
    chain_failure_seq: count.nullable(),
});
export const ExternalEvidenceDegradationSchema = z.strictObject({
    degradation: z.enum(EXTERNAL_EVIDENCE_DEGRADATIONS),
    integrity_finding: z.string().min(1),
    affected_properties: z.array(z.enum(EXTERNAL_EVIDENCE_PROPERTY_FAMILIES)),
    insufficient_decision_ids: z.array(z.string().min(1)),
    overclaim_count: count,
});
export const ExternalEvidenceInvariantSchema = z.strictObject({
    invariant: z.enum(EXTERNAL_EVIDENCE_INVARIANTS),
    episode_id: z.string().min(1),
    vector_id: z.string().min(1),
    obligation: z.string().min(1),
    status: z.enum(EXTERNAL_EVIDENCE_INVARIANT_STATUSES),
    evidence_record_ids: z.array(z.string().min(1)),
});
export const ExternalEvidenceDemonstrationSideSchema = z.strictObject({
    side: z.enum(EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES),
    bundle_id: z.string().min(1),
    bundle_ref: hash,
    terminal_state: z.string().min(1),
    checkpoint_rejection_count: count,
    invalidated_item_count: count,
    repair_count: count,
    verification_verdicts: z.array(z.string().min(1)),
    honest_terminal: z.boolean(),
    absence_notes: z.array(z.string().min(1)),
    evidence_record_ids: z.strictObject({
        checkpoint_rejections: z.array(z.string().min(1)),
        invalidations: z.array(z.string().min(1)),
        repairs: z.array(z.string().min(1)),
        verdicts: z.array(z.string().min(1)),
        terminals: z.array(z.string().min(1)),
    }),
});
export const ExternalEvidencePairedDemonstrationSchema = z.strictObject({
    demonstration_id: z.string().min(1),
    task_label: z.string().min(1),
    injected_fault: z.string().min(1),
    sides: z.array(ExternalEvidenceDemonstrationSideSchema).length(2),
});
export const ExternalEvidenceReportSchema = z.strictObject({
    schema: z.literal('zero-ar-external-evidence-report/1'),
    report_ref: hash,
    runtime_identity: z.strictObject({
        product: z.string().min(1),
        kernel: z.string().min(1),
        release_manifest_ref: hash.nullable(),
    }),
    source_commit: z.string().regex(/^[0-9a-f]{40}$/),
    scorer_identity: z.strictObject({
        package: z.literal('@zero-ar/evidence'),
        version: z.string().min(1),
        schema_version: z.string().min(1),
        scorer_ref: hash,
    }),
    reference_profile: hash,
    bundle_refs: z.array(hash),
    rubrics: z.array(ExternalEvidenceRubricSchema),
    reference_bundles: z.array(ExternalEvidenceReferenceBundleSchema),
    decisions: z.array(ExternalEvidenceDecisionSchema),
    degradations: z.array(ExternalEvidenceDegradationSchema),
    invariants: z.array(ExternalEvidenceInvariantSchema),
    paired_demonstrations: z.array(ExternalEvidencePairedDemonstrationSchema),
    summary: ExternalEvidenceMetricSummarySchema,
    disclaimer: z.string().min(1),
});
export const ExternalEvidenceCampaignOutcomeSchema = z.strictObject({
    bundle_ref: hash,
    vector_id: z.string().min(1),
    decision_count: count,
    terminal_state: z.string().min(1),
    verdicts: z.array(z.string().min(1)),
    effect_outcomes: z.array(z.string().min(1)),
    integrity_findings: z.array(z.string().min(1)),
});
export const ExternalEvidenceVectorReceiptSchema = z.strictObject({
    vector_id: z.enum(EXTERNAL_EVIDENCE_REFERENCE_VECTORS),
    test_path: z.string().min(1),
    test_file_ref: hash,
    log_ref: hash,
    test_count: count,
    passed_count: count,
    failed_count: count,
    skipped_count: count,
    duration_ms: z.number().min(0),
});
export const ExternalEvidenceCampaignManifestSchema = z.strictObject({
    schema: z.literal('zero-ar-external-evidence-campaign/1'),
    campaign_manifest_ref: hash,
    campaign_mode: z.enum(EXTERNAL_EVIDENCE_CAMPAIGN_MODES),
    source_commit: z.string().regex(/^[0-9a-f]{40}$/),
    source_repository: z.string().min(1),
    source_commit_available_on_origin: z.boolean(),
    runtime_image_digest: hash,
    runtime_release_manifest_ref: hash,
    environment_kind: z.enum(EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS),
    os: z.string().min(1),
    architecture: z.string().min(1),
    container_runtime: z.string().min(1),
    postgres_version: z.string().min(1),
    model_fixture_ref: hash,
    effect_target_ref: hash,
    signer_test_key_ref: hash,
    dependency_lock_ref: hash,
    node_version: z.string().min(1),
    campaign_profile_ref: hash,
    reference_bundle_refs: z.array(hash),
    reference_vector_receipts: z.array(ExternalEvidenceVectorReceiptSchema),
    frozen_bundle_report_ref: hash,
    reference_outcomes: z.array(ExternalEvidenceCampaignOutcomeSchema),
    started_at: z.string().min(1),
    finished_at: z.string().min(1),
    workflow_run_ref: z.string().min(1),
});
export const ExternalEvidenceComparisonSchema = z.strictObject({
    schema: z.literal('zero-ar-external-evidence-comparison/1'),
    comparison_ref: hash,
    source_commit: z.string().regex(/^[0-9a-f]{40}$/),
    campaign_profile_ref: hash,
    local_campaign_manifest_ref: hash,
    ci_campaign_manifest_ref: hash,
    semantic_outcomes: z.array(z.strictObject({
        bundle_ref: hash,
        vector_id: z.string().min(1),
        local: ExternalEvidenceCampaignOutcomeSchema,
        ci: ExternalEvidenceCampaignOutcomeSchema,
        equal: z.boolean(),
    })),
    frozen_bundle_report_refs: z.strictObject({
        local: hash,
        ci: hash,
        equal: z.boolean(),
    }),
    mismatches: z.array(z.string().min(1)),
    tool_identity: z.strictObject({
        package: z.literal('@zero-ar/evidence'),
        version: z.string().min(1),
        schema_version: z.string().min(1),
        tool_ref: hash,
    }),
    publishable: z.boolean(),
});
export const IntegrityHealthSchema = z.strictObject({
    available: z.boolean(),
    readiness: z.enum(['ready', 'unready']),
    anchor_backlog: count,
    pending_runs: count,
    reason: z.string().nullable(),
});
/** The result surface: artifact, completion state, and what was not established. */
export const RunResultSchema = z.strictObject({
    run_id: id('run'),
    status: z.enum(RUN_STATUSES),
    terminal: z.enum(RUN_TERMINALS).nullable(),
    completion_state: z.enum(COMPLETION_STATES),
    verdict: z.enum(VERDICTS).nullable(),
    verdict_reason: z.string().nullable(),
    artifact: z.strictObject({ entry_id: id('ent'), text: z.string() }).nullable(),
    /** Terminal item dispositions by count; parked is an item state, never a run terminal (LIF-024). */
    items: z.strictObject({
        verified: count,
        completed_unverified: count,
        parked: count,
        dismissed: count,
        failed: count,
        invalidated: count,
        untouched: count,
    }).nullable(),
    /** Effect outcomes by state; unreconcilable is an effect state, never a run terminal (LIF-024). */
    effects: z.strictObject({ prepared: count, dispatched: count, committed: count, withdrawn: count, outcome_unknown: count, unreconcilable: count }),
    /** What constrains the claim: each open condition with its reference and next action (LIF-038). */
    blocking_operational_outcomes: z.array(z.strictObject({ kind: z.enum(BLOCKING_OUTCOME_KINDS), reference: z.string(), state: z.string(), next: z.string() })),
    not_established: z.array(z.string()),
    handover: z.array(z.string()),
    /** Independent checkpoint status, when this deployment wires the integrity port. */
    integrity: RunIntegritySummarySchema.nullable().optional(),
});
export const DiagnosticSchema = z.strictObject({
    code: z.string(),
    severity: z.enum(DIAGNOSTIC_SEVERITIES),
    message: z.string(),
    path: z.string().optional(),
    received: z.string().optional(),
    alternatives: z.array(z.string()).optional(),
    fix: z.string().optional(),
    clause: z.string().optional(),
});
/** A durable observation event as served by the records endpoints. */
export const ObservationEventSchema = z.strictObject({
    seq: z.number().int().positive(),
    record_seq: z.number().int().positive(),
    event: z.enum(DURABLE_EVENTS),
    family: z.enum(PRODUCT_EVENT_FAMILIES),
    run_id: id('run'),
    at: z.string(),
    payload: z.record(z.string(), z.unknown()),
});
/** One lossy text delta from the transient progress stream. */
export const ProgressEventSchema = z.strictObject({
    text: z.string(),
});
// ---- wire answers for the public routes. Generated clients name these (XCV-003). ----
export const HealthResponseSchema = z.strictObject({
    product: z.string(),
    contract_version: z.string(),
    profile: z.enum(PROFILES),
    /** Unready means a required dependency failed; degraded names an optional failure. */
    status: z.enum(['ready', 'degraded', 'unready']),
    liveness: z.literal('live'),
    readiness: z.enum(['ready', 'unready']),
    components: z.record(z.string(), z.enum(['ready', 'unreachable'])),
    required_components: z.array(z.string()),
    /** What this profile does not claim, stated on the front door (C-OPS-PROFILE-HONESTY-010). */
    guarantee_exclusions: z.array(z.string()),
    /** The capability profile that generated required components and exclusions. */
    capability_manifest: ProfileCapabilitySummarySchema,
    task_contracts: z.array(z.strictObject({ name: z.string(), version: z.string(), ref: hash })),
    /** Independent checkpoint health, when this deployment wires the integrity port. */
    integrity: IntegrityHealthSchema.nullable().optional(),
    /** Present only when an external protocol listener is enabled in this composition. */
    protocol_registry: InteropProtocolRegistrySchema.optional(),
});
export const DatabaseMetricSummarySchema = z.strictObject({
    name: z.string(),
    unit: z.enum(['ms', 'count']),
    count,
    p50: z.number().nonnegative().nullable(),
    p95: z.number().nonnegative().nullable(),
    p99: z.number().nonnegative().nullable(),
    max: z.number().nonnegative().nullable(),
});
export const DatabaseDoctorResponseSchema = z.strictObject({
    schema: z.literal('zero-ar-database-doctor/1'),
    ok: z.boolean(),
    mode: z.enum(POSTGRES_DEPLOYMENT_MODES),
    measured_at: z.string(),
    database: z.strictObject({
        reachable: z.boolean(),
        name: z.string().nullable(),
        server_version: z.string().nullable(),
    }),
    connection_pool: z.strictObject({
        max: count,
        total: count,
        idle: count,
        waiting: count,
        saturation: z.number().nonnegative(),
    }),
    roles: z.array(z.strictObject({
        purpose: z.enum(['migration', 'runtime', 'signer']),
        role: z.string(),
        ok: z.boolean(),
        checks: z.array(z.string()),
    })),
    forced_rls: z.strictObject({
        ok: z.boolean(),
        failures: z.array(z.string()),
    }),
    latency: z.strictObject({
        rtt_ms: z.number().nonnegative().nullable(),
        critical_path_round_trips: z.number().nonnegative(),
        observed_run_transition_samples: count,
        observed_observation_samples: count,
        expected_additive_run_latency_ms: z.number().nonnegative().nullable(),
        meets_ratified_reference_targets: z.boolean(),
        warning: z.string().nullable(),
    }),
    metrics: z.array(DatabaseMetricSummarySchema),
});
export const PostgresLatencyRawSampleSchema = z.strictObject({
    topology: z.enum(POSTGRES_LATENCY_TOPOLOGIES),
    operation: z.enum(POSTGRES_LATENCY_OPERATIONS),
    database_mode: z.enum(POSTGRES_DEPLOYMENT_MODES),
    environment_ref: z.string().min(1),
    samples_ms: z.array(z.number().nonnegative()).min(1),
});
export const PostgresLatencyReportRowSchema = z.strictObject({
    topology: z.enum(POSTGRES_LATENCY_TOPOLOGIES),
    operation: z.enum(POSTGRES_LATENCY_OPERATIONS),
    database_mode: z.enum(POSTGRES_DEPLOYMENT_MODES),
    environment_ref: z.string().min(1),
    sample_count: count,
    min_ms: z.number().nonnegative(),
    p50_ms: z.number().nonnegative(),
    p95_ms: z.number().nonnegative(),
    p99_ms: z.number().nonnegative(),
    max_ms: z.number().nonnegative(),
});
export const PostgresLatencyFiveHourOverheadSchema = z.strictObject({
    topology: z.enum(POSTGRES_LATENCY_TOPOLOGIES),
    representative_transition_count: count,
    p50_control_plane_overhead_ms: z.number().nonnegative(),
    p95_control_plane_overhead_ms: z.number().nonnegative(),
    p99_control_plane_overhead_ms: z.number().nonnegative(),
    scope: z.literal('control-plane-only'),
});
export const PostgresLatencyReportSchema = z.strictObject({
    schema: z.literal('zero-ar-postgres-latency-report/1'),
    report_ref: hash,
    source_commit: z.string().regex(/^[0-9a-f]{40}$/),
    generated_at: z.string().min(1),
    measurement_status: z.enum(POSTGRES_LATENCY_REPORT_STATUSES),
    uat_evidence: z.boolean(),
    status_reason: z.string().min(1),
    representative_transition_count: count,
    row_count: count,
    rows: z.array(PostgresLatencyReportRowSchema),
    five_hour_control_plane_overhead: z.array(PostgresLatencyFiveHourOverheadSchema),
    disclaimer: z.string().min(1),
});
export const CreatedRunSchema = z.strictObject({
    run_id: id('run'),
    /** False when the idempotency key resolved to an existing run. */
    created: z.boolean(),
    snapshot: RunSnapshotSchema,
});
export const ControlAcceptedSchema = z.strictObject({ accepted_seq: count });
export const RunRefSchema = z.strictObject({ run_id: id('run') });
export const StartAcceptedSchema = z.strictObject({
    run_id: id('run'),
    accepted: z.boolean(),
    repeated: z.boolean(),
    accepted_seq: z.number().int().positive(),
});
export const RebuildOutcomeSchema = z.strictObject({ equal: z.boolean(), healed: z.boolean() });
export const ImportOutcomeSchema = z.strictObject({
    run_id: id('run'),
    head_equal: z.boolean(),
    records: count,
    /** Artifacts restored with the run, and each one named but not transferred (UAT-ART-013). */
    artifacts: z.strictObject({
        imported: z.array(artifactHandle),
        not_transferred: z.array(ArtifactTransferOmissionSchema),
    }).optional(),
});
export const RecordsPageSchema = z.strictObject({ records: z.array(RecordEnvelopeSchema) });
/** One tenant-visible review item reconstructed from its durable run records. */
export const ReviewItemSchema = z.strictObject({
    run_id: id('run'),
    item_id: z.string().min(1).max(512),
    kind: z.enum(REVIEW_ITEM_KINDS),
    state: z.enum(REVIEW_ITEM_STATES),
    opened_seq: z.number().int().positive(),
    opened_at: z.string().min(1),
    reason: z.string().min(1),
    checkpoint_id: z.string().min(1),
    /** When the item's answer deadline falls, where its task contract declares an answer window (LIF-035). */
    due_at: z.string().datetime().nullable().optional(),
});
export const ReviewInboxSchema = z.strictObject({
    items: z.array(ReviewItemSchema),
    truncated: z.boolean(),
});
/** The operator's erasure order: a named person, a subject, exact entries (ECV-006, XCV-010). */
export const ErasureRequestSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    entry_ids: z.array(id('ent')).min(1).max(10_000),
    by: z.string().min(1).max(256),
    reason: z.string().min(1).max(1_000),
});
export const ErasureOutcomeSchema = z.strictObject({ run_id: id('run'), erased: count });
// ---- workspace binding profiles: mount slots with immutable classes (EXT-018). ----
export const BindingProfileSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    slot: z.enum(WORKSPACE_SLOTS),
    /** The prefix this profile is reviewed for. An instance outside it refuses. */
    path_prefix: z.string().min(1).max(512),
    /** Operations with their immutable classes. The slot bounds what is legal. */
    operations: z.array(z.strictObject({ name: z.string().min(1), operation_class: z.enum(OPERATION_CLASSES) })).min(1).max(50),
});
// ---- postures: immutable resolved rigor, pinned by content hash (XCV-001). ----
export const PostureSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    owner: z.string().min(1),
    /** What the posture resolves for a run. A version change is an identity change. */
    verification_reserve_fraction: z.number().min(0).max(0.9),
    /**
     * Optimization controllers, compiled configuration inside the posture
     * (MTH-003). Any coefficient change is a new posture version, so active
     * runs stay pinned. Integer units only; a decision boundary never rides
     * platform floating point (MTH-007).
     */
    optimization: z
        .strictObject({
        checkpoint: z
            .strictObject({
            selector: z.literal('young-daly-items-v1'),
            mode: z.enum(CONTROLLER_MODES),
            /** Expected cost of one checkpoint, in the primary comparison unit. */
            checkpoint_cost: z.number().int().min(1),
            /** Expected recomputation cost per lost work unit. */
            recompute_cost: z.number().int().min(1),
            /** Rejection hazard per million work units. Zero is absence of evidence, never proof. */
            hazard_per_million: z.number().int().min(0),
            minimum_items: z.number().int().min(1),
            maximum_items: z.number().int().min(1),
            /** The pinned exact fallback when the estimate cannot be used (MTH-009). */
            fallback_interval: z.number().int().min(1),
            arithmetic: z.literal('integer-sqrt-v1'),
            /**
             * Tenant rejection history as the hazard source (MTH-CP-002). Below
             * the minimum exposure the pinned hazard applies. Reserved until the
             * checkpoint statistics projection is wired.
             */
            statistics: reserved(z.strictObject({ source: z.literal('tenant-history-v1'), minimum_exposure: z.number().int().min(1) }), 'optimization.checkpoint.statistics', 'checkpoint.statistics.unwired').optional(),
        })
            .optional(),
        context: z
            .strictObject({
            selector: z.literal('coverage-mmr-v1'),
            mode: z.enum(CONTROLLER_MODES),
            coverage_weight_ppm: z.number().int().min(0),
            recency_weight_ppm: z.number().int().min(0),
            redundancy_weight_ppm: z.number().int().min(0),
            candidate_cutoff: z.number().int().min(1),
            arithmetic: z.literal('integer-score-v1'),
        })
            .optional(),
        /**
         * The attention controller (BUD-009): each class's expected escalation
         * rate and batch setup, the gap class parked items wait in, and the
         * horizon admission plans over. Reserved until attention admission is
         * wired.
         */
        attention: reserved(z.strictObject({
            selector: z.literal('attention-littles-v1'),
            mode: z.enum(CONTROLLER_MODES),
            classes: z.array(z.strictObject({
                name: z.string().min(1).max(200),
                expected_escalation_ppm: z.number().int().min(0).max(1_000_000),
                batch_setup_ms: z.number().int().min(0),
            })).min(1).max(64),
            gap_class: z.string().min(1).max(200),
            planning_horizon_ms: z.number().int().min(1),
            confidence_posture: z.string().min(1).max(64),
        }), 'optimization.attention', 'attention.admission.unwired').optional(),
    })
        .optional(),
});
// ---- domain packs: machine claims with pinned evidence (XCV-012). ----
/** A machine predicate: kebab words, no prose. The compiler refuses anything else. */
export const MACHINE_PREDICATE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PackClaimSchema = z.strictObject({
    predicate: z.string().min(1).max(200),
    kind: z.enum(PACK_CLAIM_KINDS),
    /** Pinned validator evidence. Unpinned or unregistered evidence fails publication. */
    evidence: z.strictObject({ validator: z.string().min(1), version: z.string().min(1) }),
});
export const DomainPackSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    task_contract: TaskContractSchema.optional(),
    claims: z.array(PackClaimSchema).min(1).max(200),
    /** Informational prose. Never compiled as a claim, always labelled (XCV-012). */
    notes: z.array(z.string().max(2_000)).max(50),
});
export const CompiledPackSchema = z.strictObject({
    pack_ref: hash,
    name: z.string(),
    version: z.string(),
    claims: z.array(PackClaimSchema.extend({ resolved: z.literal(true) })),
    informational_notes: z.strictObject({
        authority: z.literal('none'),
        rendering: z.string(),
        notes: z.array(z.string()),
    }),
});
/**
 * The footprint registry: every public shape mapped to its structural home
 * and owner. The inventory script renders and gates this (DX-016).
 */
export const SCHEMA_REGISTRY = {
    CapabilityAdmissionRequestSchema: { schema: CapabilityAdmissionRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    CapabilityAdmissionDecisionRequestSchema: { schema: CapabilityAdmissionDecisionRequestSchema, placement: 'control', owner: 'runtime-core' },
    CapabilityAdmissionCancellationRequestSchema: { schema: CapabilityAdmissionCancellationRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    CapabilityConsequenceDiffSchema: { schema: CapabilityConsequenceDiffSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    CapabilityAdmissionPlanSchema: { schema: CapabilityAdmissionPlanSchema, placement: 'observation', owner: 'runtime-core' },
    CapabilityAdmissionPolicySchema: { schema: CapabilityAdmissionPolicySchema, placement: 'operator-management', owner: 'runtime-core' },
    CapabilityNextActionSchema: { schema: CapabilityNextActionSchema, placement: 'diagnostic', owner: 'runtime-core' },
    CapabilityAdmissionViewSchema: { schema: CapabilityAdmissionViewSchema, placement: 'observation', owner: 'runtime-core' },
    CapabilityAdmissionListRequestSchema: { schema: CapabilityAdmissionListRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    CapabilityAdmissionListSchema: { schema: CapabilityAdmissionListSchema, placement: 'observation', owner: 'runtime-core' },
    CapabilityAdmissionAcceptedSchema: { schema: CapabilityAdmissionAcceptedSchema, placement: 'observation', owner: 'runtime-core' },
    BrowserLimitsSchema: { schema: BrowserLimitsSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserDestinationSchema: { schema: BrowserDestinationSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserCredentialBindingSchema: { schema: BrowserCredentialBindingSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserEffectPolicySchema: { schema: BrowserEffectPolicySchema, placement: 'browser', owner: 'browser-capability' },
    BrowserAdapterDescriptorSchema: { schema: BrowserAdapterDescriptorSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserBindingSchema: { schema: BrowserBindingSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserDestinationProposalSchema: { schema: BrowserDestinationProposalSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserDestinationDecisionSchema: { schema: BrowserDestinationDecisionSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserRequestProvenanceSchema: { schema: BrowserRequestProvenanceSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserProvenanceSchema: { schema: BrowserProvenanceSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserObservationResultSchema: { schema: BrowserObservationResultSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserEffectParametersSchema: { schema: BrowserEffectParametersSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserProfileHealthSchema: { schema: BrowserProfileHealthSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserLatencySummarySchema: { schema: BrowserLatencySummarySchema, placement: 'browser', owner: 'browser-capability' },
    BrowserMeasurementReportSchema: { schema: BrowserMeasurementReportSchema, placement: 'browser', owner: 'browser-capability' },
    PrincipalsSchema: { schema: PrincipalsSchema, placement: 'intake', owner: 'runtime-core' },
    ConsumptionSchema: { schema: ConsumptionSchema, placement: 'intake', owner: 'runtime-resources' },
    BudgetsSchema: { schema: BudgetsSchema, placement: 'intake', owner: 'runtime-resources' },
    InputArtifactBindingSchema: { schema: InputArtifactBindingSchema, placement: 'intake', owner: 'runtime-core' },
    ResolvedInputArtifactSchema: { schema: ResolvedInputArtifactSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    SourceLocatorSchema: { schema: SourceLocatorSchema, placement: 'operator-management', owner: 'source-access' },
    SourceBoundsSchema: { schema: SourceBoundsSchema, placement: 'operator-management', owner: 'source-access' },
    RegisterSourceRequestSchema: { schema: RegisterSourceRequestSchema, placement: 'operator-management', owner: 'source-access' },
    SourceInstanceSchema: { schema: SourceInstanceSchema, placement: 'operator-management', owner: 'source-access' },
    SourceExtractorIdentitySchema: { schema: SourceExtractorIdentitySchema, placement: 'runtime-identity', owner: 'source-access' },
    SourceListSchema: { schema: SourceListSchema, placement: 'operator-management', owner: 'source-access' },
    SourceSnapshotMemberSchema: { schema: SourceSnapshotMemberSchema, placement: 'runtime-identity', owner: 'source-access' },
    SourceSnapshotSchema: { schema: SourceSnapshotSchema, placement: 'runtime-identity', owner: 'source-access' },
    SourceSnapshotPageRequestSchema: { schema: SourceSnapshotPageRequestSchema, placement: 'operator-management', owner: 'source-access' },
    SourceSnapshotPageSchema: { schema: SourceSnapshotPageSchema, placement: 'operator-management', owner: 'source-access' },
    SourceBindingInputSchema: { schema: SourceBindingInputSchema, placement: 'intake', owner: 'source-access' },
    ResolvedSourceBindingSchema: { schema: ResolvedSourceBindingSchema, placement: 'runtime-identity', owner: 'source-access' },
    SourcePreflightSchema: { schema: SourcePreflightSchema, placement: 'operator-management', owner: 'source-access' },
    SourceOperationRequestSchema: { schema: SourceOperationRequestSchema, placement: 'run-management', owner: 'source-access' },
    SourceOperationResultSchema: { schema: SourceOperationResultSchema, placement: 'observation', owner: 'source-access' },
    DocumentExtractionPageSchema: { schema: DocumentExtractionPageSchema, placement: 'observation', owner: 'source-access' },
    DocumentExtractionResultSchema: { schema: DocumentExtractionResultSchema, placement: 'observation', owner: 'source-access' },
    RuntimeArtifactIntendedUseSchema: { schema: RuntimeArtifactIntendedUseSchema, placement: 'intake', owner: 'runtime-core' },
    RuntimeArtifactProvenanceInputSchema: { schema: RuntimeArtifactProvenanceInputSchema, placement: 'intake', owner: 'runtime-core' },
    RuntimeArtifactSessionRequestSchema: { schema: RuntimeArtifactSessionRequestSchema, placement: 'intake', owner: 'runtime-core' },
    RuntimeArtifactManifestSchema: { schema: RuntimeArtifactManifestSchema, placement: 'observation', owner: 'runtime-core' },
    RuntimeArtifactCommittedRecordSchema: { schema: RuntimeArtifactCommittedRecordSchema, placement: 'observation', owner: 'runtime-core' },
    RuntimeArtifactReadySessionSchema: { schema: RuntimeArtifactReadySessionSchema, placement: 'observation', owner: 'runtime-core' },
    RuntimeArtifactCommittedSessionSchema: { schema: RuntimeArtifactCommittedSessionSchema, placement: 'observation', owner: 'runtime-core' },
    RuntimeArtifactSessionStatusSchema: { schema: RuntimeArtifactSessionStatusSchema, placement: 'observation', owner: 'runtime-core' },
    ExternalObservationContentSchema: { schema: ExternalObservationContentSchema, placement: 'intake', owner: 'runtime-core' },
    ExternalObservationArtifactSchema: { schema: ExternalObservationArtifactSchema, placement: 'intake', owner: 'runtime-core' },
    ExternalObservationProvenanceSchema: { schema: ExternalObservationProvenanceSchema, placement: 'intake', owner: 'runtime-core' },
    ExternalObservationRequestSchema: { schema: ExternalObservationRequestSchema, placement: 'intake', owner: 'runtime-core' },
    VerifiedRepresentedActorSchema: { schema: VerifiedRepresentedActorSchema, placement: 'observation', owner: 'runtime-core' },
    ExternalObservationRecordedSchema: { schema: ExternalObservationRecordedSchema, placement: 'observation', owner: 'runtime-core' },
    ExternalObservationAppliedSchema: { schema: ExternalObservationAppliedSchema, placement: 'observation', owner: 'runtime-core' },
    ExternalObservationAcceptedSchema: { schema: ExternalObservationAcceptedSchema, placement: 'observation', owner: 'runtime-core' },
    EffectApprovalRequestSchema: { schema: EffectApprovalRequestSchema, placement: 'intake', owner: 'effect-plane' },
    EffectApprovalActorSchema: { schema: EffectApprovalActorSchema, placement: 'runtime-identity', owner: 'effect-plane' },
    EffectApprovalRecordedSchema: { schema: EffectApprovalRecordedSchema, placement: 'observation', owner: 'effect-plane' },
    EffectApprovalInvalidatedSchema: { schema: EffectApprovalInvalidatedSchema, placement: 'observation', owner: 'effect-plane' },
    EffectApprovalAcceptedSchema: { schema: EffectApprovalAcceptedSchema, placement: 'observation', owner: 'effect-plane' },
    EffectAuthorityDecisionCommandSchema: { schema: EffectAuthorityDecisionCommandSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectAuthorityDecisionLookupSchema: { schema: EffectAuthorityDecisionLookupSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    RemoteToolTaskHandleSchema: { schema: RemoteToolTaskHandleSchema, placement: 'run-management', owner: 'runtime-core' },
    IntakeRequestSchema: { schema: IntakeRequestSchema, placement: 'intake', owner: 'runtime-core' },
    ResolvedRunManifestSchema: { schema: ResolvedRunManifestSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    ProfileCapabilityEntrySchema: { schema: ProfileCapabilityEntrySchema, placement: 'capability-profile', owner: 'release-engineering' },
    ProfileCapabilityManifestSchema: { schema: ProfileCapabilityManifestSchema, placement: 'capability-profile', owner: 'release-engineering' },
    ProfileCapabilitySummarySchema: { schema: ProfileCapabilitySummarySchema, placement: 'capability-profile', owner: 'release-engineering' },
    InteropJsonSchema: { schema: InteropJsonSchema, placement: 'gateway', owner: 'runtime-core' },
    InteropConnectionSchema: { schema: InteropConnectionSchema, placement: 'gateway', owner: 'runtime-core' },
    InteropBindingManifestBodySchema: { schema: InteropBindingManifestBodySchema, placement: 'gateway', owner: 'runtime-core' },
    InteropBindingManifestSchema: { schema: InteropBindingManifestSchema, placement: 'gateway', owner: 'runtime-core' },
    McpPublishedWorkEntrypointSchema: { schema: McpPublishedWorkEntrypointSchema, placement: 'publication', owner: 'runtime-core' },
    McpPeerToolSchema: { schema: McpPeerToolSchema, placement: 'gateway', owner: 'runtime-core' },
    McpPeerResourceSchema: { schema: McpPeerResourceSchema, placement: 'gateway', owner: 'runtime-core' },
    McpPeerSnapshotBodySchema: { schema: McpPeerSnapshotBodySchema, placement: 'gateway', owner: 'runtime-core' },
    McpPeerSnapshotSchema: { schema: McpPeerSnapshotSchema, placement: 'gateway', owner: 'runtime-core' },
    McpImportedToolPlanSchema: { schema: McpImportedToolPlanSchema, placement: 'publication', owner: 'runtime-core' },
    McpImportedResourcePlanSchema: { schema: McpImportedResourcePlanSchema, placement: 'publication', owner: 'runtime-core' },
    McpTaskAliasSchema: { schema: McpTaskAliasSchema, placement: 'gateway', owner: 'runtime-core' },
    McpPendingInputSchema: { schema: McpPendingInputSchema, placement: 'gateway', owner: 'runtime-core' },
    McpTaskProjectionSchema: { schema: McpTaskProjectionSchema, placement: 'gateway', owner: 'runtime-core' },
    AssuranceEnvelopeSchema: { schema: AssuranceEnvelopeSchema, placement: 'observation', owner: 'quality-plane' },
    InteropProtocolRegistryEntrySchema: { schema: InteropProtocolRegistryEntrySchema, placement: 'capability-profile', owner: 'release-engineering' },
    InteropProtocolRegistrySchema: { schema: InteropProtocolRegistrySchema, placement: 'capability-profile', owner: 'release-engineering' },
    InteropCapabilitySchema: { schema: InteropCapabilitySchema, placement: 'capability-profile', owner: 'release-engineering' },
    ControlRequestSchema: { schema: ControlRequestSchema, placement: 'control', owner: 'runtime-core' },
    ForkRequestSchema: { schema: ForkRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    ReexecuteRequestSchema: { schema: ReexecuteRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    TaskContractSchema: { schema: TaskContractSchema, placement: 'validator-seam', owner: 'quality-plane' },
    ValidatorCatalogueEntryBodySchema: { schema: ValidatorCatalogueEntryBodySchema, placement: 'validator-seam', owner: 'quality-plane' },
    ValidatorCatalogueEntrySchema: { schema: ValidatorCatalogueEntrySchema, placement: 'validator-seam', owner: 'quality-plane' },
    ValidatorAvailabilitySnapshotBodySchema: { schema: ValidatorAvailabilitySnapshotBodySchema, placement: 'runtime-identity', owner: 'quality-plane' },
    ValidatorAvailabilitySnapshotSchema: { schema: ValidatorAvailabilitySnapshotSchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationCheckpointInputBodySchema: { schema: VerificationCheckpointInputBodySchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationCheckpointInputSchema: { schema: VerificationCheckpointInputSchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationAttentionCapacitySnapshotBodySchema: { schema: VerificationAttentionCapacitySnapshotBodySchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationAttentionCapacitySnapshotSchema: { schema: VerificationAttentionCapacitySnapshotSchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationPlanInputSchema: { schema: VerificationPlanInputSchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationPlanBodySchema: { schema: VerificationPlanBodySchema, placement: 'observation', owner: 'quality-plane' },
    VerificationPlanSchema: { schema: VerificationPlanSchema, placement: 'observation', owner: 'quality-plane' },
    ClaimSetSchema: { schema: ClaimSetSchema, placement: 'validator-seam', owner: 'quality-plane' },
    CitedSpanSchema: { schema: CitedSpanSchema, placement: 'composition', owner: 'runtime-core' },
    EffectDescriptorSchema: { schema: EffectDescriptorSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    ReceiptSchema: { schema: ReceiptSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    StaticGrantSchema: { schema: StaticGrantSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EnvironmentAdapterDescriptorSchema: { schema: EnvironmentAdapterDescriptorSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAdapterCompatibilitySchema: { schema: EnvironmentAdapterCompatibilitySchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAdapterReleaseBodySchema: { schema: EnvironmentAdapterReleaseBodySchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAdapterReleaseManifestSchema: { schema: EnvironmentAdapterReleaseManifestSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentPrerequisiteObservationSchema: { schema: EnvironmentPrerequisiteObservationSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentHostObservationSchema: { schema: EnvironmentHostObservationSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAcceptanceLifecycleSchema: { schema: EnvironmentAcceptanceLifecycleSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAcceptanceReportBodySchema: { schema: EnvironmentAcceptanceReportBodySchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentAcceptanceReportSchema: { schema: EnvironmentAcceptanceReportSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentDeploymentCapabilitySchema: { schema: EnvironmentDeploymentCapabilitySchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentDeploymentCapabilityListSchema: { schema: EnvironmentDeploymentCapabilityListSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentExecutionRequestSchema: { schema: EnvironmentExecutionRequestSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentExecutionResultSchema: { schema: EnvironmentExecutionResultSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentLifecycleAssuranceSchema: { schema: EnvironmentLifecycleAssuranceSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentProfileSchema: { schema: EnvironmentProfileSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentProfileRegistrationSchema: { schema: EnvironmentProfileRegistrationSchema, placement: 'environment', owner: 'runtime-core' },
    RegisterEnvironmentRequestSchema: { schema: RegisterEnvironmentRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentProfileRefRequestSchema: { schema: EnvironmentProfileRefRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentProfileStateRequestSchema: { schema: EnvironmentProfileStateRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentCredentialRotationRequestSchema: { schema: EnvironmentCredentialRotationRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentProfileListSchema: { schema: EnvironmentProfileListSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentDoctorRequestSchema: { schema: EnvironmentDoctorRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentDoctorResultSchema: { schema: EnvironmentDoctorResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentConformanceRequestSchema: { schema: EnvironmentConformanceRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentConformanceResultSchema: { schema: EnvironmentConformanceResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentJobListSchema: { schema: EnvironmentJobListSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentJobRefRequestSchema: { schema: EnvironmentJobRefRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentJobActionRequestSchema: { schema: EnvironmentJobActionRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentAbandonJobRequestSchema: { schema: EnvironmentAbandonJobRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentMeasurementSummarySchema: { schema: EnvironmentMeasurementSummarySchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentMetricsSchema: { schema: EnvironmentMetricsSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentSweepRequestSchema: { schema: EnvironmentSweepRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentSweepResultSchema: { schema: EnvironmentSweepResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnvironmentResolutionRequestSchema: { schema: EnvironmentResolutionRequestSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentResolutionResultSchema: { schema: EnvironmentResolutionResultSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentResumeContextSchema: { schema: EnvironmentResumeContextSchema, placement: 'environment', owner: 'runtime-core' },
    SuspendedEnvironmentHandleSchema: { schema: SuspendedEnvironmentHandleSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentReuseRecordSchema: { schema: EnvironmentReuseRecordSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentLimitsSchema: { schema: EnvironmentLimitsSchema, placement: 'environment', owner: 'runtime-resources' },
    EnvironmentNetworkPolicySchema: { schema: EnvironmentNetworkPolicySchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentMountPolicySchema: { schema: EnvironmentMountPolicySchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentOutputDeclarationSchema: { schema: EnvironmentOutputDeclarationSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentHandleBindingSchema: { schema: EnvironmentHandleBindingSchema, placement: 'environment', owner: 'runtime-core' },
    EnvironmentHandleSchema: { schema: EnvironmentHandleSchema, placement: 'environment', owner: 'runtime-core' },
    SandboxWorkspaceBindingSchema: { schema: SandboxWorkspaceBindingSchema, placement: 'environment', owner: 'runtime-environments' },
    SandboxWorkspaceHandleSchema: { schema: SandboxWorkspaceHandleSchema, placement: 'environment', owner: 'runtime-environments' },
    SandboxWorkspaceAccessRequestSchema: { schema: SandboxWorkspaceAccessRequestSchema, placement: 'environment', owner: 'runtime-environments' },
    EnvironmentJobHandleSchema: { schema: EnvironmentJobHandleSchema, placement: 'environment', owner: 'runtime-core' },
    PrepareEnvironmentRequestSchema: { schema: PrepareEnvironmentRequestSchema, placement: 'environment', owner: 'runtime-core' },
    PrepareEnvironmentResultSchema: { schema: PrepareEnvironmentResultSchema, placement: 'environment', owner: 'runtime-core' },
    SubmitEnvironmentJobRequestSchema: { schema: SubmitEnvironmentJobRequestSchema, placement: 'environment', owner: 'runtime-core' },
    SubmitEnvironmentJobResultSchema: { schema: SubmitEnvironmentJobResultSchema, placement: 'environment', owner: 'runtime-core' },
    ObserveEnvironmentJobRequestSchema: { schema: ObserveEnvironmentJobRequestSchema, placement: 'environment', owner: 'runtime-core' },
    ObserveEnvironmentJobResultSchema: { schema: ObserveEnvironmentJobResultSchema, placement: 'environment', owner: 'runtime-core' },
    ReconcileEnvironmentJobRequestSchema: { schema: ReconcileEnvironmentJobRequestSchema, placement: 'environment', owner: 'runtime-core' },
    ReconcileEnvironmentJobResultSchema: { schema: ReconcileEnvironmentJobResultSchema, placement: 'environment', owner: 'runtime-core' },
    CancelEnvironmentJobRequestSchema: { schema: CancelEnvironmentJobRequestSchema, placement: 'environment', owner: 'runtime-core' },
    CancelEnvironmentJobResultSchema: { schema: CancelEnvironmentJobResultSchema, placement: 'environment', owner: 'runtime-core' },
    CollectEnvironmentArtifactRequestSchema: { schema: CollectEnvironmentArtifactRequestSchema, placement: 'environment', owner: 'runtime-core' },
    CollectEnvironmentArtifactResultSchema: { schema: CollectEnvironmentArtifactResultSchema, placement: 'environment', owner: 'runtime-core' },
    CollectedEnvironmentArtifactSchema: { schema: CollectedEnvironmentArtifactSchema, placement: 'environment', owner: 'runtime-core' },
    TeardownEnvironmentRequestSchema: { schema: TeardownEnvironmentRequestSchema, placement: 'environment', owner: 'runtime-core' },
    TeardownEnvironmentResultSchema: { schema: TeardownEnvironmentResultSchema, placement: 'environment', owner: 'runtime-core' },
    AbandonEnvironmentRequestSchema: { schema: AbandonEnvironmentRequestSchema, placement: 'environment', owner: 'runtime-core' },
    AbandonEnvironmentResultSchema: { schema: AbandonEnvironmentResultSchema, placement: 'environment', owner: 'runtime-core' },
    EntrySchema: { schema: EntrySchema, placement: 'observation', owner: 'runtime-core' },
    RecordEnvelopeSchema: { schema: RecordEnvelopeSchema, placement: 'observation', owner: 'runtime-core' },
    RunSnapshotSchema: { schema: RunSnapshotSchema, placement: 'observation', owner: 'runtime-core' },
    WorkQueryRequestSchema: { schema: WorkQueryRequestSchema, placement: 'observation', owner: 'runtime-core' },
    WorkQueryItemSchema: { schema: WorkQueryItemSchema, placement: 'observation', owner: 'runtime-core' },
    WorkQueryPageSchema: { schema: WorkQueryPageSchema, placement: 'observation', owner: 'runtime-core' },
    RunIntegrityFindingSchema: { schema: RunIntegrityFindingSchema, placement: 'observation', owner: 'runtime-core' },
    RunIntegritySummarySchema: { schema: RunIntegritySummarySchema, placement: 'observation', owner: 'runtime-core' },
    ExternalEvidencePropertySchema: { schema: ExternalEvidencePropertySchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceDecisionSchema: { schema: ExternalEvidenceDecisionSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceMetricSummarySchema: { schema: ExternalEvidenceMetricSummarySchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceRubricSchema: { schema: ExternalEvidenceRubricSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceReferenceBundleSchema: { schema: ExternalEvidenceReferenceBundleSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceDegradationSchema: { schema: ExternalEvidenceDegradationSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceInvariantSchema: { schema: ExternalEvidenceInvariantSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceDemonstrationSideSchema: { schema: ExternalEvidenceDemonstrationSideSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidencePairedDemonstrationSchema: { schema: ExternalEvidencePairedDemonstrationSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceReportSchema: { schema: ExternalEvidenceReportSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceCampaignOutcomeSchema: { schema: ExternalEvidenceCampaignOutcomeSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceCampaignManifestSchema: { schema: ExternalEvidenceCampaignManifestSchema, placement: 'observation', owner: 'external-evidence' },
    ExternalEvidenceComparisonSchema: { schema: ExternalEvidenceComparisonSchema, placement: 'observation', owner: 'external-evidence' },
    IntegrityHealthSchema: { schema: IntegrityHealthSchema, placement: 'observation', owner: 'runtime-core' },
    RunResultSchema: { schema: RunResultSchema, placement: 'observation', owner: 'quality-plane' },
    DiagnosticSchema: { schema: DiagnosticSchema, placement: 'diagnostic', owner: 'contracts-dx' },
    ObservationEventSchema: { schema: ObservationEventSchema, placement: 'observation', owner: 'runtime-core' },
    ProgressEventSchema: { schema: ProgressEventSchema, placement: 'observation', owner: 'runtime-core' },
    HealthResponseSchema: { schema: HealthResponseSchema, placement: 'observation', owner: 'runtime-core' },
    DatabaseMetricSummarySchema: { schema: DatabaseMetricSummarySchema, placement: 'operator-management', owner: 'runtime-core' },
    DatabaseDoctorResponseSchema: { schema: DatabaseDoctorResponseSchema, placement: 'operator-management', owner: 'runtime-core' },
    PostgresLatencyRawSampleSchema: { schema: PostgresLatencyRawSampleSchema, placement: 'operator-management', owner: 'runtime-core' },
    PostgresLatencyReportRowSchema: { schema: PostgresLatencyReportRowSchema, placement: 'operator-management', owner: 'runtime-core' },
    PostgresLatencyFiveHourOverheadSchema: { schema: PostgresLatencyFiveHourOverheadSchema, placement: 'operator-management', owner: 'runtime-core' },
    PostgresLatencyReportSchema: { schema: PostgresLatencyReportSchema, placement: 'operator-management', owner: 'runtime-core' },
    CreatedRunSchema: { schema: CreatedRunSchema, placement: 'intake', owner: 'runtime-core' },
    ControlAcceptedSchema: { schema: ControlAcceptedSchema, placement: 'control', owner: 'runtime-core' },
    RunLifecycleCommandRequestSchema: { schema: RunLifecycleCommandRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    RunRefSchema: { schema: RunRefSchema, placement: 'run-management', owner: 'runtime-core' },
    StartAcceptedSchema: { schema: StartAcceptedSchema, placement: 'run-management', owner: 'runtime-core' },
    RebuildOutcomeSchema: { schema: RebuildOutcomeSchema, placement: 'run-management', owner: 'runtime-core' },
    ImportOutcomeSchema: { schema: ImportOutcomeSchema, placement: 'run-management', owner: 'runtime-core' },
    RecordsPageSchema: { schema: RecordsPageSchema, placement: 'observation', owner: 'runtime-core' },
    ReviewItemSchema: { schema: ReviewItemSchema, placement: 'observation', owner: 'quality-plane' },
    ReviewInboxSchema: { schema: ReviewInboxSchema, placement: 'observation', owner: 'quality-plane' },
    ErasureRequestSchema: { schema: ErasureRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ErasureOutcomeSchema: { schema: ErasureOutcomeSchema, placement: 'operator-management', owner: 'runtime-core' },
    DomainPackSchema: { schema: DomainPackSchema, placement: 'authoring', owner: 'contracts-dx' },
    CompiledPackSchema: { schema: CompiledPackSchema, placement: 'authoring', owner: 'contracts-dx' },
    PublicationBundleManifestSchema: { schema: PublicationBundleManifestSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationDeclarationEntrySchema: { schema: PublicationDeclarationEntrySchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationAssetEntrySchema: { schema: PublicationAssetEntrySchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationDependencyEdgeSchema: { schema: PublicationDependencyEdgeSchema, placement: 'publication', owner: 'contracts-dx' },
    ProcedureManifestSchema: { schema: ProcedureManifestSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationReceiptSchema: { schema: PublicationReceiptSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationSessionRequestSchema: { schema: PublicationSessionRequestSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationSessionSchema: { schema: PublicationSessionSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationBlobFrameSchema: { schema: PublicationBlobFrameSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationBlobAckSchema: { schema: PublicationBlobAckSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationBlobUploadStatusSchema: { schema: PublicationBlobUploadStatusSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationBlobUploadFinishSchema: { schema: PublicationBlobUploadFinishSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationCommitRequestSchema: { schema: PublicationCommitRequestSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationViewSchema: { schema: PublicationViewSchema, placement: 'publication', owner: 'contracts-dx' },
    DeclarationViewSchema: { schema: DeclarationViewSchema, placement: 'publication', owner: 'contracts-dx' },
    AliasMutationRequestSchema: { schema: AliasMutationRequestSchema, placement: 'publication', owner: 'contracts-dx' },
    AliasMutationResultSchema: { schema: AliasMutationResultSchema, placement: 'publication', owner: 'contracts-dx' },
    DeprecationRequestSchema: { schema: DeprecationRequestSchema, placement: 'publication', owner: 'contracts-dx' },
    QuarantineRequestSchema: { schema: QuarantineRequestSchema, placement: 'publication', owner: 'contracts-dx' },
    RegistryActOutcomeSchema: { schema: RegistryActOutcomeSchema, placement: 'publication', owner: 'contracts-dx' },
    IdentityMigrationEventRequestSchema: { schema: IdentityMigrationEventRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    IdentityMigrationEventOutcomeSchema: { schema: IdentityMigrationEventOutcomeSchema, placement: 'operator-management', owner: 'runtime-core' },
    DrainRequestSchema: { schema: DrainRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    DrainOutcomeSchema: { schema: DrainOutcomeSchema, placement: 'operator-management', owner: 'runtime-core' },
    ReconciliationOutcomeSchema: { schema: ReconciliationOutcomeSchema, placement: 'operator-management', owner: 'runtime-core' },
    OperatorAuditPageSchema: { schema: OperatorAuditPageSchema, placement: 'operator-management', owner: 'runtime-core' },
    PostureSchema: { schema: PostureSchema, placement: 'authoring', owner: 'contracts-dx' },
    BindingProfileSchema: { schema: BindingProfileSchema, placement: 'environment', owner: 'runtime-core' },
    SkillDescriptorSchema: { schema: SkillDescriptorSchema, placement: 'publication', owner: 'contracts-dx' },
    SkillOpenRequestSchema: { schema: SkillOpenRequestSchema, placement: 'composition', owner: 'runtime-core' },
    SkillReadRequestSchema: { schema: SkillReadRequestSchema, placement: 'composition', owner: 'runtime-core' },
    SkillSearchRequestSchema: { schema: SkillSearchRequestSchema, placement: 'composition', owner: 'runtime-core' },
    SkillLoadResultSchema: { schema: SkillLoadResultSchema, placement: 'composition', owner: 'runtime-core' },
    SkillSearchResultSchema: { schema: SkillSearchResultSchema, placement: 'composition', owner: 'runtime-core' },
    ArtifactReadRequestSchema: { schema: ArtifactReadRequestSchema, placement: 'composition', owner: 'runtime-core' },
    ModelFallbackSetSchema: { schema: ModelFallbackSetSchema, placement: 'operator-management', owner: 'runtime-core' },
    TenantModelPoolSchema: { schema: TenantModelPoolSchema, placement: 'operator-management', owner: 'runtime-core' },
    ResolvedModelPlanSchema: { schema: ResolvedModelPlanSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    GatewayAdapterManifestSchema: { schema: GatewayAdapterManifestSchema, placement: 'gateway', owner: 'runtime-core' },
    GatewayDeliveryCursorSchema: { schema: GatewayDeliveryCursorSchema, placement: 'gateway', owner: 'runtime-core' },
    SetModelAliasRequestSchema: { schema: SetModelAliasRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    DeclareFallbackSetRequestSchema: { schema: DeclareFallbackSetRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    SetDefaultModelAliasRequestSchema: { schema: SetDefaultModelAliasRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    AdmitModelAdapterRequestSchema: { schema: AdmitModelAdapterRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    AdmittedModelAdapterSchema: { schema: AdmittedModelAdapterSchema, placement: 'operator-management', owner: 'runtime-core' },
    CredentialBindingSchema: { schema: CredentialBindingSchema, placement: 'operator-management', owner: 'runtime-core' },
    CreateExternalCredentialBindingRequestSchema: { schema: CreateExternalCredentialBindingRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ProtectedCredentialIngestRequestSchema: { schema: ProtectedCredentialIngestRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    RotateExternalCredentialRequestSchema: { schema: RotateExternalCredentialRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    RotateProtectedCredentialRequestSchema: { schema: RotateProtectedCredentialRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    RevokeCredentialRequestSchema: { schema: RevokeCredentialRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    CreateProviderInstanceRequestSchema: { schema: CreateProviderInstanceRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ProviderInstanceSchema: { schema: ProviderInstanceSchema, placement: 'operator-management', owner: 'runtime-core' },
    ProviderInstanceListSchema: { schema: ProviderInstanceListSchema, placement: 'operator-management', owner: 'runtime-core' },
    SyncProviderCatalogueRequestSchema: { schema: SyncProviderCatalogueRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ProviderModelEntrySchema: { schema: ProviderModelEntrySchema, placement: 'operator-management', owner: 'runtime-core' },
    ProviderCatalogueSchema: { schema: ProviderCatalogueSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnableProviderModelRequestSchema: { schema: EnableProviderModelRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ModelSelectionSchema: { schema: ModelSelectionSchema, placement: 'operator-management', owner: 'runtime-core' },
    RegisterToolSourceRequestSchema: { schema: RegisterToolSourceRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceSchema: { schema: ToolSourceSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceListSchema: { schema: ToolSourceListSchema, placement: 'operator-management', owner: 'runtime-core' },
    SyncToolSourceCatalogueRequestSchema: { schema: SyncToolSourceCatalogueRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceToolEntrySchema: { schema: ToolSourceToolEntrySchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceCatalogueSchema: { schema: ToolSourceCatalogueSchema, placement: 'operator-management', owner: 'runtime-core' },
    EnableToolSourceToolsRequestSchema: { schema: EnableToolSourceToolsRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceEnablementSchema: { schema: ToolSourceEnablementSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceStateRequestSchema: { schema: ToolSourceStateRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceTestResultSchema: { schema: ToolSourceTestResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    MemoryAssertionInputSchema: { schema: MemoryAssertionInputSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryAssertionSchema: { schema: MemoryAssertionSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryBindingSchema: { schema: MemoryBindingSchema, placement: 'publication', owner: 'runtime-core' },
    ResolvedMemoryBindingSchema: { schema: ResolvedMemoryBindingSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    ModelMemoryReadRequestSchema: { schema: ModelMemoryReadRequestSchema, placement: 'model', owner: 'runtime-core' },
    ModelMemoryProposalSchema: { schema: ModelMemoryProposalSchema, placement: 'model', owner: 'runtime-core' },
    MemoryReadEnvelopeSchema: { schema: MemoryReadEnvelopeSchema, placement: 'memory-service', owner: 'quality-plane' },
    ProtectedMemoryReadEnvelopeSchema: { schema: ProtectedMemoryReadEnvelopeSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryReadRequestSchema: { schema: MemoryReadRequestSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryReadResponseSchema: { schema: MemoryReadResponseSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryWriteOutcomeSchema: { schema: MemoryWriteOutcomeSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySupersedeRequestSchema: { schema: MemorySupersedeRequestSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySupersedeOutcomeSchema: { schema: MemorySupersedeOutcomeSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryHistoryRequestSchema: { schema: MemoryHistoryRequestSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryHistoryResponseSchema: { schema: MemoryHistoryResponseSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySubjectErasureRequestSchema: { schema: MemorySubjectErasureRequestSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySubjectErasureOutcomeSchema: { schema: MemorySubjectErasureOutcomeSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemoryWrappedKeySchema: { schema: MemoryWrappedKeySchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySubjectKeyMaterialSchema: { schema: MemorySubjectKeyMaterialSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySubjectTransferBundleSchema: { schema: MemorySubjectTransferBundleSchema, placement: 'memory-service', owner: 'quality-plane' },
    MemorySubjectTransferRequestSchema: { schema: MemorySubjectTransferRequestSchema, placement: 'operator-management', owner: 'quality-plane' },
    MemorySubjectImportRequestSchema: { schema: MemorySubjectImportRequestSchema, placement: 'operator-management', owner: 'quality-plane' },
    MemorySubjectImportOutcomeSchema: { schema: MemorySubjectImportOutcomeSchema, placement: 'operator-management', owner: 'quality-plane' },
    RunMemoryReadOutcomeSchema: { schema: RunMemoryReadOutcomeSchema, placement: 'memory-service', owner: 'runtime-core' },
    EntryEvidenceSchema: { schema: EntryEvidenceSchema, placement: 'composition', owner: 'runtime-core' },
    ArtifactContextSpanSchema: { schema: ArtifactContextSpanSchema, placement: 'composition', owner: 'runtime-core' },
    ArtifactEvidenceBlockerSchema: { schema: ArtifactEvidenceBlockerSchema, placement: 'observation', owner: 'quality-plane' },
    ContextReplaySpanSchema: { schema: ContextReplaySpanSchema, placement: 'observation', owner: 'runtime-core' },
    ContextReplayArtifactSpanSchema: { schema: ContextReplayArtifactSpanSchema, placement: 'observation', owner: 'runtime-core' },
    ContextReplaySchema: { schema: ContextReplaySchema, placement: 'observation', owner: 'runtime-core' },
    WakeSchedulerDeclarationSchema: { schema: WakeSchedulerDeclarationSchema, placement: 'operator-management', owner: 'runtime-core' },
    WakeClockDiagnosticSchema: { schema: WakeClockDiagnosticSchema, placement: 'operator-management', owner: 'runtime-core' },
    WakeSchedulerReportSchema: { schema: WakeSchedulerReportSchema, placement: 'operator-management', owner: 'runtime-core' },
    PinnedCheckpointDecisionSchema: { schema: PinnedCheckpointDecisionSchema, placement: 'observation', owner: 'quality-plane' },
    ControllersViewSchema: { schema: ControllersViewSchema, placement: 'observation', owner: 'quality-plane' },
    SequentialSamplingRecordSchema: { schema: SequentialSamplingRecordSchema, placement: 'validator-seam', owner: 'quality-plane' },
    AttentionEstimateRecordSchema: { schema: AttentionEstimateRecordSchema, placement: 'observation', owner: 'quality-plane' },
    VerificationAttentionCapacitySnapshotV2BodySchema: { schema: VerificationAttentionCapacitySnapshotV2BodySchema, placement: 'runtime-identity', owner: 'quality-plane' },
    VerificationAttentionCapacitySnapshotV2Schema: { schema: VerificationAttentionCapacitySnapshotV2Schema, placement: 'runtime-identity', owner: 'quality-plane' },
    AttentionDistributionSchema: { schema: AttentionDistributionSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionClassModelSchema: { schema: AttentionClassModelSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionCalibrationRequestSchema: { schema: AttentionCalibrationRequestSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionCalibrationReportSchema: { schema: AttentionCalibrationReportSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionCapacitySnapshotPublishRequestSchema: { schema: AttentionCapacitySnapshotPublishRequestSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionCapacitySnapshotSchema: { schema: AttentionCapacitySnapshotSchema, placement: 'operator-management', owner: 'quality-plane' },
    AttentionDashboardSchema: { schema: AttentionDashboardSchema, placement: 'operator-management', owner: 'quality-plane' },
    BrowserBindingTemplateSchema: { schema: BrowserBindingTemplateSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserIntakeInputSchema: { schema: BrowserIntakeInputSchema, placement: 'intake', owner: 'browser-capability' },
    ResolvedBrowserTemplateSchema: { schema: ResolvedBrowserTemplateSchema, placement: 'runtime-identity', owner: 'browser-capability' },
    BrowserDestinationProposalRequestSchema: { schema: BrowserDestinationProposalRequestSchema, placement: 'browser', owner: 'browser-capability' },
    BrowserDestinationDecisionRequestSchema: { schema: BrowserDestinationDecisionRequestSchema, placement: 'browser', owner: 'browser-capability' },
    ArtifactSweepRequestSchema: { schema: ArtifactSweepRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ArtifactSweepResultSchema: { schema: ArtifactSweepResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    ArtifactTransferOmissionSchema: { schema: ArtifactTransferOmissionSchema, placement: 'run-management', owner: 'runtime-core' },
    AliasHistorySchema: { schema: AliasHistorySchema, placement: 'publication', owner: 'contracts-dx' },
    RegistryRebuildOutcomeSchema: { schema: RegistryRebuildOutcomeSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationExportFrameSchema: { schema: PublicationExportFrameSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationImportOutcomeSchema: { schema: PublicationImportOutcomeSchema, placement: 'publication', owner: 'contracts-dx' },
    LegacyModelPoolImportRequestSchema: { schema: LegacyModelPoolImportRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceDriftRecordSchema: { schema: ToolSourceDriftRecordSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceDriftReportSchema: { schema: ToolSourceDriftReportSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceIngressDeliverySchema: { schema: ToolSourceIngressDeliverySchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceIngressReceiptSchema: { schema: ToolSourceIngressReceiptSchema, placement: 'operator-management', owner: 'runtime-core' },
    EffectGrantReissueRequestSchema: { schema: EffectGrantReissueRequestSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectGrantReissueOutcomeSchema: { schema: EffectGrantReissueOutcomeSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectGrantRevocationRequestSchema: { schema: EffectGrantRevocationRequestSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectGrantRevocationOutcomeSchema: { schema: EffectGrantRevocationOutcomeSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectAuthorityEpochAdvanceRequestSchema: { schema: EffectAuthorityEpochAdvanceRequestSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectAuthorityEpochAdvanceOutcomeSchema: { schema: EffectAuthorityEpochAdvanceOutcomeSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    EffectTargetListSchema: { schema: EffectTargetListSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    WorkspaceIntakeBindingSchema: { schema: WorkspaceIntakeBindingSchema, placement: 'intake', owner: 'runtime-core' },
    RegisterWorkspaceInstanceRequestSchema: { schema: RegisterWorkspaceInstanceRequestSchema, placement: 'environment', owner: 'runtime-core' },
    WorkspaceInstanceSchema: { schema: WorkspaceInstanceSchema, placement: 'environment', owner: 'runtime-core' },
    WorkspaceInstanceListSchema: { schema: WorkspaceInstanceListSchema, placement: 'environment', owner: 'runtime-core' },
    ResolvedWorkspaceInstanceSchema: { schema: ResolvedWorkspaceInstanceSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    RunResumeDeferredRequestSchema: { schema: RunResumeDeferredRequestSchema, placement: 'run-management', owner: 'runtime-core' },
};
