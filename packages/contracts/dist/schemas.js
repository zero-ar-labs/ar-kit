import { z } from 'zod';
import { ITEM_OUTPUT_SCHEMA_BINDINGS_MAX, ItemOutputSchemaBindingSchema, MODEL_CONTROL_OPERATIONS_MAX } from "./item-output.js";
import { INPUT_ARTIFACT_ALIAS_PATTERN } from "./artifact-aliases.js";
import { CapabilityAdmissionAcceptedSchema, CapabilityAdmissionCancellationRequestSchema, CapabilityAdmissionDecisionRequestSchema, CapabilityAdmissionListSchema, CapabilityAdmissionListRequestSchema, CapabilityAdmissionPlanSchema, CapabilityAdmissionPolicySchema, CapabilityAdmissionRequestSchema, CapabilityAdmissionViewSchema, CapabilityConsequenceDiffSchema, CapabilityNextActionSchema, } from "./capability-admission.js";
import { ArtifactContextSpanSchema, ArtifactEvidenceBlockerSchema, CitedSpanSchema, ClaimSetSchema, ContextFenceNonceSchema, ContextImageRecordSchema, ENTRY_IMAGE_MAX, EntryEvidenceSchema, EntryImageSchema, } from "./claims.js";
import { ContextReplayArtifactSpanSchema, ContextReplaySchema, ContextReplaySpanSchema } from "./context-replay.js";
import { ContextExpandRequestSchema, ContextExpansionResultSchema, ContextSegmentCoverageSchema, ContextHierarchyWindowSchema, ContextSegmentManifestSchema, ContextSegmentSummarizerSchema, HierarchicalContextPolicySchema, } from "./context-hierarchy.js";
import { ControllersViewSchema, PinnedCheckpointDecisionSchema } from "./controllers-view.js";
import { WakeClockDiagnosticSchema, WakeSchedulerDeclarationSchema, WakeSchedulerReportSchema } from "./wake-scheduler.js";
import { AttentionCalibrationReportSchema, AttentionCalibrationRequestSchema, AttentionCapacitySnapshotPublishRequestSchema, AttentionCapacitySnapshotSchema, AttentionClassModelSchema, AttentionDashboardSchema, AttentionDistributionSchema, } from "./attention.js";
import { EffectTargetListSchema } from "./effect-authority.js";
import { ResolvedWorkspaceInstanceSchema, WorkspaceIntakeBindingSchema } from "./workspace-instances.js";
import { ProfileCapabilityEntrySchema, ProfileCapabilityManifestSchema, ProfileCapabilitySummarySchema, } from "./capability-profile.js";
import { AliasHistorySchema, AliasMutationRequestSchema, DrainOutcomeSchema, DrainRequestSchema, IdentityMigrationEventOutcomeSchema, IdentityMigrationEventRequestSchema, OperatorAuditPageSchema, ReconciliationOutcomeSchema, AliasMutationResultSchema, DeclarationViewSchema, DeprecationRequestSchema, ProcedureManifestSchema, PublicationAssetEntrySchema, PublicationBlobAckSchema, PublicationBlobFrameSchema, PublicationBlobUploadFinishSchema, PublicationBlobUploadStatusSchema, PublicationBundleManifestSchema, PublicationCommitRequestSchema, PublicationDeclarationEntrySchema, PublicationDependencyEdgeSchema, PublicationExportFrameSchema, PublicationImportOutcomeSchema, PublicationReceiptSchema, PublicationSessionRequestSchema, PublicationSessionSchema, PublicationViewSchema, QuarantineRequestSchema, RegistryActOutcomeSchema, RegistryRebuildOutcomeSchema, } from "./publication.js";
import { EffectDescriptorSchema, ReceiptSchema, StaticGrantSchema } from "./effects.js";
import { EffectApprovalAcceptedSchema, EffectApprovalActorSchema, EffectApprovalInvalidatedSchema, EffectApprovalRecordedSchema, EffectApprovalRequestSchema, EffectAuthorityDecisionCommandSchema, EffectAuthorityDecisionLookupSchema, } from "./effect-approvals.js";
import { AbandonEnvironmentRequestSchema, AbandonEnvironmentResultSchema, CancelEnvironmentJobRequestSchema, CancelEnvironmentJobResultSchema, CollectEnvironmentArtifactRequestSchema, CollectEnvironmentArtifactResultSchema, CollectedEnvironmentArtifactSchema, EnvironmentAdapterDescriptorSchema, EnvironmentExecutionRequestSchema, EnvironmentExecutionResultSchema, EnvironmentHandleBindingSchema, EnvironmentHandleSchema, EnvironmentJobHandleSchema, EnvironmentLifecycleAssuranceSchema, EnvironmentLimitsSchema, EnvironmentMountPolicySchema, EnvironmentNetworkPolicySchema, EnvironmentOutputDeclarationSchema, EnvironmentProfileRegistrationSchema, EnvironmentProfileSchema, EnvironmentResumeContextSchema, EnvironmentReuseRecordSchema, EnvironmentSegmentEndedSchema, EnvironmentSegmentEndingSchema, EnvironmentSegmentStartedSchema, ObserveEnvironmentJobRequestSchema, ObserveEnvironmentJobResultSchema, PrepareEnvironmentRequestSchema, PrepareEnvironmentResultSchema, ReconcileEnvironmentJobRequestSchema, ReconcileEnvironmentJobResultSchema, SubmitEnvironmentJobRequestSchema, SubmitEnvironmentJobResultSchema, SuspendedEnvironmentHandleSchema, TeardownEnvironmentRequestSchema, TeardownEnvironmentResultSchema, } from "./environment.js";
import { SandboxWorkspaceAccessRequestSchema, SandboxWorkspaceBindingSchema, SandboxWorkspaceHandleSchema, SandboxWorkspacePolicySchema, SandboxWorkspaceTransferBundleSchema, SandboxWorkspaceTransferEntrySchema, } from "./environment-workspace.js";
import { EnvironmentAbandonJobRequestSchema, EnvironmentConformanceRequestSchema, EnvironmentConformanceResultSchema, EnvironmentCredentialRotationRequestSchema, EnvironmentDoctorRequestSchema, EnvironmentDoctorResultSchema, EnvironmentJobActionRequestSchema, EnvironmentJobListSchema, EnvironmentJobRefRequestSchema, EnvironmentMeasurementSummarySchema, EnvironmentMetricsSchema, EnvironmentProfileListSchema, EnvironmentProfileRefRequestSchema, EnvironmentProfileStateRequestSchema, EnvironmentSweepRequestSchema, EnvironmentSweepResultSchema, EnvironmentResolutionRequestSchema, EnvironmentResolutionResultSchema, RegisterEnvironmentRequestSchema, } from "./environment-management.js";
import { EnvironmentAdapterCompatibilitySchema, EnvironmentAdapterReleaseBodySchema, EnvironmentAdapterReleaseManifestSchema, } from "./environment-release.js";
import { EnvironmentAcceptanceLifecycleSchema, EnvironmentAcceptanceReportBodySchema, EnvironmentAcceptanceReportSchema, EnvironmentDeploymentCapabilityListSchema, EnvironmentDeploymentCapabilitySchema, EnvironmentHostObservationSchema, EnvironmentPrerequisiteObservationSchema, } from "./environment-deployment.js";
import { ArtifactSweepRequestSchema, ArtifactSweepResultSchema, ArtifactTransferOmissionSchema, RunStateClosureManifestSchema, RunStateClosureMemberSchema, RunStateRehydrationMemberSchema, RunStateRehydrationReportSchema, RuntimeArtifactCommittedRecordSchema, RuntimeArtifactCommittedSessionSchema, RuntimeArtifactIntendedUseSchema, RuntimeArtifactManifestSchema, RuntimeArtifactProvenanceInputSchema, RuntimeArtifactReadySessionSchema, RuntimeArtifactSessionRequestSchema, RuntimeArtifactSessionStatusSchema, } from "./runtime-artifacts.js";
import { RunContinuationAcceptedSchema, RunContinuationAdmissionRequestSchema, RunContinuationCapsuleSchema, RunContinuationCompatibilityReportSchema, RunContinuationDeclarationSchema, RunContinuationExecutorSchema, RunContinuationDestinationIdentitySchema, RunHandoffReceiptSchema, RunHandoffRecordedSchema, RunHandoffRequestSchema, } from "./run-transfer.js";
import { ExternalObservationAcceptedSchema, ExternalObservationAppliedSchema, ExternalObservationArtifactSchema, ExternalObservationContentSchema, ExternalObservationProvenanceSchema, ExternalObservationRecordedSchema, ExternalObservationRequestSchema, VerifiedRepresentedActorSchema, } from "./external-observations.js";
import { GatewayAdapterManifestSchema, GatewayDeliveryCursorSchema, ArtifactReadRequestSchema, DeclareFallbackSetRequestSchema, ModelFallbackSetSchema, ResolvedModelPlanSchema, SetDefaultModelAliasRequestSchema, SetModelAliasRequestSchema, SkillDescriptorSchema, SkillLoadResultSchema, SkillOpenRequestSchema, SkillReadRequestSchema, SkillSearchRequestSchema, SkillSearchResultSchema, TenantModelPoolSchema, } from "./integration.js";
import { AdmitModelAdapterRequestSchema, AdmittedModelAdapterSchema, CreateExternalCredentialBindingRequestSchema, CreateProviderInstanceRequestSchema, CredentialBindingSchema, EnableProviderModelRequestSchema, ModelSelectionSchema, ProtectedCredentialIngestRequestSchema, ProviderCompatibilitySchema, ProviderCatalogueSchema, ProviderInstanceListSchema, ProviderInstanceSchema, ProviderModelEntrySchema, RevokeCredentialRequestSchema, RotateExternalCredentialRequestSchema, RotateProtectedCredentialRequestSchema, SyncProviderCatalogueRequestSchema, } from "./providers.js";
import { EnableToolSourceToolsRequestSchema, RegisterToolSourceRequestSchema, SyncToolSourceCatalogueRequestSchema, ToolSourceCatalogueSchema, ToolSourceDriftRecordSchema, ToolSourceDriftReportSchema, ToolSourceEnablementSchema, ToolSourceListSchema, ToolSourceSchema, ToolSourceStateRequestSchema, ToolSourceTestResultSchema, ToolSourceToolEntrySchema, } from "./tool-sources.js";
import { DocumentExtractionPageSchema, DocumentExtractionResultSchema, RegisterSourceRequestSchema, ResolvedSourceBindingSchema, SourceBindingInputSchema, SourceInstanceSchema, SourceExtractorIdentitySchema, SourceListSchema, SourceLocatorSchema, SourceBoundsSchema, SourceOperationRequestSchema, SourceOperationResultSchema, SourcePreflightSchema, SourceSnapshotMemberSchema, SourceSnapshotPageRequestSchema, SourceSnapshotPageSchema, SourceSnapshotSchema, } from "./sources.js";
import { MemoryAssertionInputSchema, MemoryAssertionSchema, MemorySubjectErasureRequestSchema, MemorySubjectErasureOutcomeSchema, MemorySubjectImportOutcomeSchema, MemorySubjectImportRequestSchema, MemorySubjectKeyMaterialSchema, MemorySubjectTransferBundleSchema, MemorySubjectTransferRequestSchema, MemoryWrappedKeySchema, MemoryHistoryRequestSchema, MemoryHistoryResponseSchema, MemoryBindingSchema, MemoryReadEnvelopeSchema, MemoryReadRequestSchema, MemoryReadResponseSchema, ModelMemoryProposalSchema, ModelMemoryReadRequestSchema, ProtectedMemoryReadEnvelopeSchema, ResolvedMemoryBindingSchema, MemorySupersedeRequestSchema, MemorySupersedeOutcomeSchema, MemoryWriteOutcomeSchema, RunMemoryReadOutcomeSchema, } from "./memory.js";
import { AssuranceEnvelopeSchema, InteropBindingManifestBodySchema, InteropBindingManifestSchema, InteropCapabilitySchema, InteropConnectionSchema, InteropJsonSchema, InteropProtocolRegistryEntrySchema, InteropProtocolRegistrySchema, McpImportedToolPlanSchema, McpImportedResourcePlanSchema, McpPeerResourceSchema, McpPeerSnapshotBodySchema, McpPeerSnapshotSchema, McpPeerToolSchema, McpPendingInputSchema, McpPublishedWorkEntrypointSchema, McpTaskAliasSchema, McpTaskProjectionSchema, } from "./interop.js";
import { ATTENTION_ADMISSION_RESULTS, BLOCKING_OUTCOME_KINDS, BRANCH_REASONS, CLAIM_REPRESENTATIONS, ASK_TIMINGS, VALIDATOR_INPUT_EXTENSIONS, CHECKPOINT_VIEWS, CONTROLLER_MODES, SAMPLED_ORACLE_OUTCOMES, SEQUENTIAL_STOP_REASONS, WAKE_CLAIM_VIAS, OPERATION_CLASSES, PACK_CLAIM_KINDS, TOOL_EXECUTION_OUTCOMES, TOOL_METERING, TOOL_VIEW_SELECTION_REASONS, WORKSPACE_SLOTS, CONTROL_VERBS, DURABLE_EVENTS, ENTRY_ROLES, EVIDENCE_GRADES, EXTERNAL_EVIDENCE_CLASSIFICATIONS, EXTERNAL_EVIDENCE_CAMPAIGN_MODES, EXTERNAL_EVIDENCE_DECISION_KINDS, EXTERNAL_EVIDENCE_DEGRADATIONS, EXTERNAL_EVIDENCE_DEMONSTRATION_SIDES, EXTERNAL_EVIDENCE_ENVIRONMENT_KINDS, EXTERNAL_EVIDENCE_INVARIANTS, EXTERNAL_EVIDENCE_INVARIANT_STATUSES, EXTERNAL_EVIDENCE_PROPERTY_FAMILIES, EXTERNAL_EVIDENCE_REFERENCE_VECTORS, EXTERNAL_EVIDENCE_STANDINGS, EXTERNAL_EVIDENCE_STRENGTHS, FAILURE_CLASSES, ITEM_STATES, LEASE_DENOMINATIONS, LEASE_POOLS, LEASE_STATES, MEMORY_CLASSIFICATIONS, MEMORY_EVENT_KINDS, MCP_REMOTE_TASK_CAUSES, MCP_REMOTE_TASK_STATES, MODEL_CATALOGUE_SOURCES, MODEL_CONTROL_OPERATION_KINDS, MODEL_CREDENTIAL_MODES, MODEL_PROTOCOL_ADAPTERS, MODEL_PROVIDERS, MODEL_PROVIDER_PROFILES, MODEL_USAGE_MEASUREMENTS, INPUT_BOUND_BASES, PROFILES, PRODUCT_EVENT_FAMILIES, PRODUCT_RUN_BUNDLE_FORMATS, RECORD_TYPES, RECORD_TYPE_VERSIONS, SKILL_RETENTIONS, REVIEW_ITEM_KINDS, REVIEW_ITEM_STATES, RUN_REVIEW_STATES, RUN_STATUSES, RUN_TERMINALS, RUN_RESUME_BLOCK_CATEGORIES, RUN_LIFECYCLE_COMMANDS, RUN_BUNDLE_CANONICALIZATIONS, RUN_HEAD_FOLD_PROFILES, SUSPEND_REASONS, COMPLETION_STATES, STOP_REASONS, POSTGRES_DEPLOYMENT_MODES, POSTGRES_LATENCY_OPERATIONS, POSTGRES_LATENCY_REPORT_STATUSES, POSTGRES_LATENCY_TOPOLOGIES, STORE_KINDS, VALIDATOR_CLASSES, VALIDATOR_EVIDENCE_GRADES, VERIFICATION_PLAN_REFUSAL_CODES, VALIDATOR_OUTCOMES, VERDICTS, DIAGNOSTIC_SEVERITIES, TRUST_TIERS, ASSURANCE_COMPLETION_CLASSES, PLAN_CHECK_KINDS, } from "./vocab.js";
const id = (prefix) => z.string().regex(new RegExp(`^${prefix}_[0-9a-f]{32}$`), `expected a ${prefix} id`);
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const count = z.number().int().nonnegative();
const modelToolCallId = z.string().min(1).max(512).regex(/^[^\u0000-\u001f\u007f]+$/, 'expected an opaque tool-call id without control characters');
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
const ModelControlOperationSchema = z.strictObject({
    kind: z.enum(MODEL_CONTROL_OPERATION_KINDS),
    name: z.string().min(1).max(256),
    description: z.string().min(1).max(4_096),
    input_schema: z.record(z.string(), z.unknown()).refine((value) => value['type'] === 'object', {
        message: 'a model control operation must publish an object input schema',
    }),
    strict: z.boolean().optional(),
});
export const LeaseStateSchema = z.enum(LEASE_STATES);
export const StoreKindSchema = z.enum(STORE_KINDS);
export const PrincipalsSchema = z.strictObject({
    executing: z.string().min(1),
    originating: z.string().min(1),
    accountable: z.string().min(1),
});
export const ConsumptionSchema = z.strictObject({
    model_tokens: count,
    tool_calls: count.optional(),
    bytes: count.optional(),
    compute_ms: count.optional(),
});
export const BudgetsSchema = z.strictObject({
    consumption: ConsumptionSchema,
    attention: count,
    verification_reserve_fraction: z.number().min(0).max(0.9),
    max_turns: z.number().int().positive().max(10_000),
});
export function turnCeilingForBudget(model_tokens, items = 0) {
    const bySpend = Math.ceil(model_tokens / 2_000);
    const byItems = Math.ceil(items / 2) + 12;
    return Math.min(10_000, Math.max(bySpend, byItems));
}
const artifactHandle = z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle');
const mediaType = z.string().regex(/^[^\s/]+\/[^\s]+$/, 'expected a media type').max(128);
export const InputArtifactBindingSchema = z.strictObject({
    alias: z.string().regex(INPUT_ARTIFACT_ALIAS_PATTERN).optional(),
    artifact_ref: artifactHandle,
    content_hash: hash,
    bytes: count,
    media_type: mediaType,
    classification: z.enum(MEMORY_CLASSIFICATIONS),
    evidence_grade: z.enum(EVIDENCE_GRADES),
    required_for_completion: z.boolean().default(true),
});
export const ResolvedInputArtifactSchema = z.strictObject({
    alias: z.string().regex(INPUT_ARTIFACT_ALIAS_PATTERN).optional(),
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
export const RemoteToolTaskHandleSchema = z.strictObject({
    protocol: z.literal('mcp'),
    invoke_id: z.string().min(1).max(256),
    model_tool_call_id: modelToolCallId.optional(),
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
export const IntakeRequestSchema = z.strictObject({
    objective: z.string().min(1).max(100_000),
    agent_ref: hash.optional(),
    principals: PrincipalsSchema,
    budgets: BudgetsSchema,
    task_contract_ref: hash.optional(),
    posture_ref: hash.optional(),
    inputs: z
        .strictObject({
        items: z.array(z.string().min(1).max(200)).max(100_000).optional(),
        artifacts: z.array(InputArtifactBindingSchema).max(1_000).optional(),
        sources: z.array(SourceBindingInputSchema).max(64).optional(),
        memory_subjects: z.record(z.string().regex(/^[a-z][a-z0-9-]{0,62}$/), z.string().min(1).max(256)).optional(),
        workspace: reserved(z.array(WorkspaceIntakeBindingSchema).min(1).max(32), 'inputs.workspace', 'workspace.instances.unwired').optional(),
    })
        .optional(),
    idempotency_key: z.string().min(1).max(256),
    correlation_id: z.string().min(1).max(256).optional(),
});
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
    model_plan: ResolvedModelPlanSchema.nullable().optional(),
    input_artifacts: z.array(ResolvedInputArtifactSchema).default([]),
    source_bindings: z.array(ResolvedSourceBindingSchema).optional(),
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
    environment_profiles: z.record(z.string().min(1).max(200), hash).optional(),
    workspace_instances: z.array(ResolvedWorkspaceInstanceSchema).max(32).optional(),
});
export const TaskContractSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    invariants: z.array(z.string().min(1)).min(1),
    acceptance_rules: z.array(z.string().min(1)).min(1),
    checkpoint_every_items: z.number().int().positive(),
    checkpoint_phase_boundaries: z
        .array(z.strictObject({
        phase: z.string().min(1),
        starts_after_items: z.number().int().nonnegative(),
        checkpoint_every_items: z.number().int().positive(),
    }))
        .optional(),
    dependency_frontier: z.enum(['independent-items', 'run-start', 'declared-dependencies']),
    repair_budget_attempts: z.number().int().min(0).max(100),
    item_output_schemas: z.array(ItemOutputSchemaBindingSchema).min(1).max(ITEM_OUTPUT_SCHEMA_BINDINGS_MAX).optional(),
    claim_representation: z.enum(CLAIM_REPRESENTATIONS).optional(),
    ask_when: z.enum(ASK_TIMINGS).optional(),
    max_agent_questions: z.number().int().min(0).max(64).optional(),
    validator_inputs: z.array(z.enum(VALIDATOR_INPUT_EXTENSIONS)).min(1).max(4).optional(),
    checkpoint_view: z.enum(CHECKPOINT_VIEWS).optional(),
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
        sufficient_for: z.array(z.string()),
        cost_wall_ms: z.number().int().positive().max(600_000),
        timeout_ms: z.number().int().positive().max(600_000).optional(),
    }))
        .min(1),
    validator_concurrency_groups: z
        .array(z.strictObject({
        name: z.string().min(1).max(200),
        rules: z.array(z.string().min(1)).min(2),
    }))
        .optional(),
});
const planFieldName = z.string().regex(/^[a-z][a-z0-9_]{0,63}$/);
export const PlanCheckSchema = z.discriminatedUnion('kind', [
    z.strictObject({
        kind: z.literal(PLAN_CHECK_KINDS[0]),
        properties: z.record(planFieldName, z.enum(['string', 'number', 'integer', 'boolean']))
            .refine((properties) => Object.keys(properties).length >= 1 && Object.keys(properties).length <= 32, 'a json-shape check names between 1 and 32 fields'),
        required: z.array(planFieldName).max(32),
    }),
    z.strictObject({
        kind: z.literal(PLAN_CHECK_KINDS[1]),
        command: z.string().min(1).max(2_000),
        timeout_ms: z.number().int().min(1_000).max(50_000).optional(),
    }),
]);
export const PlanItemSchema = z.strictObject({
    item_id: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/, 'item ids are lowercase letters, digits, dots, dashes and underscores'),
    objective: z.string().min(1).max(2_000),
    checks: z.array(PlanCheckSchema).min(1).max(8),
});
export const PlanRecordRequestSchema = z.strictObject({
    items: z.array(PlanItemSchema).min(1).max(200),
    reason: z.string().min(1).max(1_000),
});
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
export const GAP_ANSWER_MAX_CHARS = 4_096;
export const AgentQuestionRecordSchema = z.strictObject({
    asked_by: z.literal('agent'),
    text: z.string().min(1).max(500),
    why: z.string().min(1).max(300),
    choices: z.array(z.string().min(1).max(120)).min(2).max(8).nullable(),
    allow_other: z.boolean(),
});
export const ControlRequestSchema = z.strictObject({
    verb: z.enum(CONTROL_VERBS),
    control_id: z.string().min(1).max(128),
    text: z.string().min(1).max(100_000).optional(),
    choice: z.string().min(1).max(120).optional(),
    handle: z.string().optional(),
    reason: z.string().max(1_000).optional(),
    active_handling_ms: z.number().int().min(0).max(31_536_000_000).optional(),
}).superRefine((control, context) => {
    if (control.choice !== undefined && (control.verb !== 'answer' || control.text !== undefined || control.reason !== undefined)) {
        context.addIssue({
            code: 'custom',
            path: ['choice'],
            message: 'choice answers an agent\'s question with one of its offered choices, alone. Send it with verb answer and without text or reason',
        });
    }
    if (control.active_handling_ms !== undefined && control.verb !== 'answer') {
        context.addIssue({
            code: 'custom',
            path: ['active_handling_ms'],
            message: `active_handling_ms measures how long a reviewer handled an answer, and a ${control.verb} control has no review to measure. Remove it, or send it with verb answer`,
        });
    }
});
export const RunLifecycleCommandRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    reason: z.string().min(1).max(1_000).optional(),
});
export const BudgetAdditionSchema = z.strictObject({
    model_tokens: z.number().int().positive().optional(),
    tool_calls: z.number().int().positive().optional(),
    bytes: z.number().int().positive().optional(),
    compute_ms: z.number().int().positive().optional(),
    attention: z.number().int().positive().optional(),
    max_turns: z.number().int().positive().max(10_000).optional(),
}).refine((added) => Object.keys(added).length > 0, { message: 'an amendment adds at least one of model_tokens, tool_calls, bytes, compute_ms, attention or max_turns' });
export const BudgetAmendmentRequestSchema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    add: BudgetAdditionSchema,
    reason: z.string().min(1).max(1_000).optional(),
});
export const RunResumeDeferredRequestSchema = RunLifecycleCommandRequestSchema.extend({
    not_before: z.string().datetime().optional(),
});
export const ForkRequestSchema = z.strictObject({
    at_entry_id: id('ent'),
    reason: z.string().max(1_000).optional(),
    budgets: BudgetsSchema.optional(),
    idempotency_key: z.string().min(1).max(256),
});
export const ReexecuteRequestSchema = z.strictObject({
    at_entry_id: id('ent').optional(),
    reason: z.string().max(1_000).optional(),
    budgets: BudgetsSchema.optional(),
    posture_ref: hash.optional(),
    idempotency_key: z.string().min(1).max(256),
});
export const EntrySchema = z.strictObject({
    entry_id: id('ent'),
    run_id: id('run'),
    parent_id: id('ent').nullable(),
    role: z.enum(ENTRY_ROLES),
    content: z.strictObject({
        text: z.string(),
        evidence: EntryEvidenceSchema.optional(),
        images: z.array(EntryImageSchema).min(1).max(ENTRY_IMAGE_MAX).optional(),
        tool_calls: z.array(z.strictObject({
            call_id: modelToolCallId,
            name: z.string().min(1).max(256),
            input: z.record(z.string(), z.unknown()),
        })).min(1).max(128).optional(),
        tool_result: z.strictObject({
            call_id: modelToolCallId,
            name: z.string().min(1).max(256),
        }).optional(),
    }),
    content_hash: hash,
}).superRefine((entry, ctx) => {
    if (entry.content.tool_calls && entry.role !== 'assistant') {
        ctx.addIssue({ code: 'custom', path: ['content', 'tool_calls'], message: 'tool calls belong on an assistant entry.' });
    }
    if (entry.content.tool_result && entry.role !== 'tool_result') {
        ctx.addIssue({ code: 'custom', path: ['content', 'tool_result'], message: 'tool correlation belongs on a tool_result entry.' });
    }
});
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
export const PortableRecordEnvelopeSchema = RecordEnvelopeSchema.omit({ seq: true });
const RunBundleManifestBaseSchema = z.strictObject({
    run_id: id('run'),
    entry_count: count,
    record_count: count,
    chain_head: hash.nullable(),
    head_projection_hash: hash,
});
export const RunBundleManifestV1Schema = RunBundleManifestBaseSchema.extend({
    format: z.enum(PRODUCT_RUN_BUNDLE_FORMATS),
    format_version: z.literal(1),
});
export const RunBundleManifestV2Schema = RunBundleManifestBaseSchema.extend({
    format: z.enum(PRODUCT_RUN_BUNDLE_FORMATS),
    format_version: z.literal(2),
    canonicalization: z.enum(RUN_BUNDLE_CANONICALIZATIONS),
    record_catalogue_ref: hash,
    projection_kind: z.literal('run-head'),
    fold_profile: z.enum(RUN_HEAD_FOLD_PROFILES),
});
export const RunBundleManifestSchema = z.discriminatedUnion('format_version', [
    RunBundleManifestV1Schema,
    RunBundleManifestV2Schema,
]);
export const RunMaterializationSchema = z.strictObject({
    schema: z.literal('zero-ar-run-materialization/1'),
    level: z.literal('materialize'),
    run_id: id('run'),
    format_version: z.union([z.literal(1), z.literal(2)]),
    canonicalization: z.enum(RUN_BUNDLE_CANONICALIZATIONS),
    record_catalogue_ref: hash,
    projection_kind: z.literal('run-head'),
    fold_profile: z.enum(RUN_HEAD_FOLD_PROFILES),
    frontier: z.strictObject({
        record_count: count,
        logical_clock: count,
        record_id: id('rec').nullable(),
        chain_head: hash.nullable(),
    }),
    state_hash: hash,
    projection: z.record(z.string(), z.unknown()),
    diagnostics: z.array(z.never()),
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
export const AttentionEstimateRecordSchema = z.strictObject({
    class: z.string().min(1).max(200),
    items: count,
    setup_ms: count,
    per_item_ms: count,
    total_ms: count,
    amortized_per_item_ms: count,
});
const ModelCallStartedV1Shape = {
    turn: count,
    call_id: hash,
    adapter: z.string(),
    model_ref: z.string(),
    context_ref: hash,
    lease_id: id('lea'),
    credential_epoch: z.number().int().min(1).nullable(),
    tool_view: ToolViewRecordSchema.optional(),
    input_bound: z.strictObject({ tokens: count, basis: z.enum(INPUT_BOUND_BASES) }).optional(),
};
const ModelCallStartedV1Schema = closureAttributed(ModelCallStartedV1Shape);
const ModelCallStartedV2Schema = closureAttributed({
    ...ModelCallStartedV1Shape,
    max_output_tokens: z.number().int().min(1),
});
const ModelCallStartedV1ReaderSchema = z.union([ModelCallStartedV1Schema, ModelCallStartedV2Schema]);
const StateClosureRehydratedV1Schema = z.strictObject({
    report: RunStateRehydrationReportSchema,
    capsule_ref: hash,
});
const StateClosureRehydratedV2Schema = StateClosureRehydratedV1Schema.extend({
    continuation_authority_ref: hash.nullable(),
});
const ExecutorContinuationAcceptedV1Schema = z.strictObject({
    idempotency_key: z.string().min(1).max(256),
    request_fingerprint: hash,
    executor: RunContinuationExecutorSchema,
    capsule: RunContinuationCapsuleSchema,
});
const ExecutorContinuationAcceptedV2Schema = ExecutorContinuationAcceptedV1Schema.extend({
    destination_ref: hash,
    authorized_by: z.strictObject({
        principal: z.string().min(1).max(512),
        scopes: z.tuple([z.literal('operator:restore'), z.literal('run:resume')]),
        scope_epoch: z.number().int().positive(),
    }),
    fence: z.strictObject({
        authority_ref: hash,
        claim_ref: hash,
        source_capsule_ref: hash,
    }),
});
export const RECORD_PAYLOADS = {
    'run.created': z.strictObject({
        created_at: z.string().datetime().optional(),
        objective: z.string(),
        agent_ref: hash,
        agent_name: z.string(),
        model_ref: z.string(),
        principals: PrincipalsSchema,
        budgets: BudgetsSchema,
        task_contract_ref: hash.nullable(),
        items: z.array(z.string()),
        idempotency_key: z.string(),
        request_fingerprint: hash.optional(),
        correlation_id: z.string().nullable(),
        profile: z.enum(PROFILES),
        context_fence_nonce: ContextFenceNonceSchema.optional(),
        resolved: z.strictObject({
            manifest: ResolvedRunManifestSchema.optional(),
            narration: z.array(z.string()),
            verified_completion_reachable: z.boolean(),
            contract_name: z.string().nullable(),
            posture: z.strictObject({ ref: hash, name: z.string(), version: z.string() }).nullable(),
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
        not_before: z.string().datetime().nullable().optional(),
    }),
    'entry.appended': z.strictObject({
        entry_id: id('ent'),
        parent_id: id('ent').nullable(),
        role: z.enum(ENTRY_ROLES),
        content_hash: hash,
        branch_id: id('brn'),
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
        head_entry_id: id('ent').nullable(),
        budget_tokens: count,
        window: z.strictObject({
            context_window: count,
            output_tokens: count,
            schema_tokens: count,
            framing_tokens: count,
        }).optional(),
        instructions_hash: hash,
        covers: z.literal('discovered-candidates-only'),
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
        tools: ToolViewRecordSchema.optional(),
        control_operations: z.array(ModelControlOperationSchema).max(MODEL_CONTROL_OPERATIONS_MAX).optional(),
        spans: z.array(CitedSpanSchema).optional(),
        artifact_entries: z.array(z.strictObject({
            entry_id: id('ent'),
            artifact_ref: artifactHandle,
            expected_content_hash: hash,
            start: count,
            end: count,
            required_for_completion: z.boolean(),
        })).optional(),
        artifact_spans: z.array(ArtifactContextSpanSchema).optional(),
        fence_nonce: ContextFenceNonceSchema.optional(),
        evidence_blockers: z.array(ArtifactEvidenceBlockerSchema).optional(),
        images: z.array(ContextImageRecordSchema).optional(),
        hierarchy: ContextHierarchyWindowSchema.optional(),
        instructions_tokens: count.optional(),
        work_status: z.strictObject({ items_declared: count, remaining: z.array(z.string()).max(13), untouched: count }).optional(),
    }),
    'context.segment.started': closureAttributed({
        request_ref: hash,
        plan_ref: hash,
        policy_ref: hash,
        branch_id: id('brn'),
        frontier_ref: hash,
        coverage: ContextSegmentCoverageSchema,
        children: z.array(hash).max(16),
        summarizer: ContextSegmentSummarizerSchema.omit({ call_id: true }),
        call_id: hash,
        context_ref: hash,
        lease_id: id('lea'),
        credential_epoch: z.number().int().min(1).nullable(),
        source_tokens: z.number().int().positive(),
        maximum_output_tokens: z.number().int().positive(),
    }),
    'context.segment.committed': closureAttributed({
        request_ref: hash,
        manifest: ContextSegmentManifestSchema,
    }),
    'context.segment.failed': closureAttributed({
        request_ref: hash,
        provider_code: z.string().min(1).max(200),
        message: z.string().min(1).max(2_000),
    }),
    'context.segment.expanded': closureAttributed({
        turn: count,
        request: ContextExpandRequestSchema,
        result: ContextExpansionResultSchema,
        lease_id: id('lea'),
    }),
    'model.call.started': ModelCallStartedV2Schema,
    'model.call.finished': closureAttributed({
        turn: count,
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
        choice: z.string().optional(),
        reason: z.string().nullable(),
        handle: z.string().nullable(),
        principal: z.string().min(1).optional(),
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
        overrun: z.number().int().positive().optional(),
    })
        .superRefine((value, context) => {
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
        model_tool_call_id: modelToolCallId.optional(),
        input: z.record(z.string(), z.unknown()).optional(),
        input_digest: hash.optional(),
        tool: z.string(),
        version: z.string(),
        operation_class: z.enum(OPERATION_CLASSES),
        isolation: z.enum(TRUST_TIERS),
        metering: z.enum(TOOL_METERING),
        refused: z.boolean(),
        clause: z.string().nullable(),
        source_alias: z.string().regex(/^[a-z][a-z0-9-]{0,62}$/).optional(),
        binding_ref: z.string().regex(/^source-binding:\/\/sha256:[0-9a-f]{64}$/).optional(),
        snapshot_ref: z.string().regex(/^source-snapshot:\/\/sha256:[0-9a-f]{64}$/).optional(),
        activated_contract_ref: hash.optional(),
    }),
    'tool.remote.pending': closureAttributedSchema(RemoteToolTaskHandleSchema),
    'tool.finished': closureAttributed({
        invoke_id: z.string(),
        model_tool_call_id: modelToolCallId.optional(),
        ok: z.boolean(),
        outcome: z.enum(TOOL_EXECUTION_OUTCOMES).optional(),
        elapsed_ms: count,
        output: z.string().max(4_096).nullable(),
        error: z.string().nullable(),
    }),
    'environment.prepare.requested': closureAttributedSchema(PrepareEnvironmentRequestSchema),
    'environment.prepared': closureAttributedSchema(PrepareEnvironmentResultSchema),
    'environment.reused': closureAttributedSchema(EnvironmentReuseRecordSchema),
    'environment.segment.started': EnvironmentSegmentStartedSchema,
    'environment.segment.ending': EnvironmentSegmentEndingSchema,
    'environment.segment.ended': EnvironmentSegmentEndedSchema,
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
    'effect.prepared': z.strictObject({
        descriptor: EffectDescriptorSchema,
        grant_ref: hash,
        evidence_resolved: count,
        decide_by: z.string().datetime().optional(),
    }),
    'effect.authority.decision': EffectApprovalRecordedSchema,
    'effect.authority.invalidated': EffectApprovalInvalidatedSchema,
    'effect.dispatched': z.strictObject({
        effect_id: id('eff'),
        target: z.string(),
        operation: z.string(),
        authority_epoch: count.nullable(),
    }),
    'effect.resolved': z.strictObject({
        effect_id: id('eff'),
        state: z.enum(['committed', 'outcome_unknown', 'prepared', 'withdrawn']),
        via: z.enum(['dispatch', 'reconciliation', 'recovery', 'withdrawal', 'authority-decision', 'decision-deadline']),
        receipt: ReceiptSchema.nullable(),
        reason: z.string(),
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
            z.strictObject({
                decide_by: z.string().datetime(),
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
    'effect.answer.late': z.strictObject({
        effect_id: id('eff'),
        state: z.enum(['prepared', 'withdrawn', 'unreconcilable']),
        via: z.enum(['dispatch', 'reconciliation']),
        receipt: ReceiptSchema,
        reason: z.string(),
    }),
    'grant.superseded': z.strictObject({
        superseded_ref: z.string().min(1),
        replacement_ref: z.string().min(1),
        identity_diff: z.array(z.string().min(1).max(300)),
        approver: z.string().min(1).max(128),
        replacement_grant: StaticGrantSchema.optional(),
    }),
    'item.attempted': closureAttributed({
        item_id: z.string(),
        output: z.string().max(4_096),
        attempt: count,
        turn: count,
        branch_id: id('brn').nullable().optional(),
        reads: z.array(z.string()).nullable(),
        refused: z.boolean().optional(),
        refusal_state: z.enum(ITEM_STATES).optional(),
        refusal_reason: z.string().max(1_000).optional(),
    }),
    'item.parked': z.strictObject({
        item_id: z.string(),
        reason: z.string(),
        checkpoint_id: z.string(),
        escalation_class: z.string().min(1).max(200).optional(),
        question: AgentQuestionRecordSchema.optional(),
    }),
    'item.invalidated': z.strictObject({
        item_id: z.string(),
        checkpoint_id: z.string(),
        widened: z.boolean(),
    }),
    'gap.settled': z.strictObject({
        item_id: z.string(),
        resolver: z.string(),
        output: z.string().max(GAP_ANSWER_MAX_CHARS),
        active_handling_ms: count.optional(),
        reopened: z.literal(true).optional(),
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
            projection_hash: hash.optional(),
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
        examined: z.array(z.strictObject({ validator: z.string(), input_hash: z.string(), items: z.number() })),
        evidence_blockers: z.array(ArtifactEvidenceBlockerSchema).optional(),
    }),
    'run.suspended': z.strictObject({
        reason: z.enum(SUSPEND_REASONS),
        detail: z.string(),
        pending: z.strictObject({
            model: z.string().nullable(),
            tools: z.array(z.string()),
            validators: z.array(z.string()),
            effects: z.array(z.string()),
            attention: z.array(z.string()),
            environments: z.array(SuspendedEnvironmentHandleSchema),
            remote_tools: z.array(RemoteToolTaskHandleSchema).default([]),
        }),
        wake: z.strictObject({ condition: z.string().min(1).max(200), detail: z.string().nullable() }),
        leases: z.array(z.strictObject({
            pool: z.string(),
            denomination: z.string(),
            reserved: z.number(),
            consumed: z.number(),
            disposition: z.enum(['retained', 'released']),
            amount: z.number(),
            reason: z.string().min(1).max(300),
        })),
        attention_estimate: AttentionEstimateRecordSchema.optional(),
    }),
    'run.resume.blocked': z.strictObject({
        category: z.enum(RUN_RESUME_BLOCK_CATEGORIES),
        message: z.string().min(1),
        next: z.string().min(1),
    }),
    'run.resumed': z.strictObject({}),
    'run.cancelled': z.strictObject({
        reason: z.string(),
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
    'subject.erasure.completed': z.strictObject({
        subject: z.string().min(1),
        entry_ids: z.array(id('ent')).min(1),
        by: z.string().min(1),
        reason: z.string().min(1),
        kept_entries: z.array(z.strictObject({ entry_id: id('ent'), content_hash: hash })).optional(),
    }),
    'wake.scheduled': z.strictObject({
        wake_id: id('wak'),
        due_at: z.string().datetime(),
        condition: z.string().min(1).max(200),
        tenant_class: z.string().min(1).max(200).optional(),
    }),
    'wake.claimed': z.strictObject({
        wake_id: id('wak'),
        via: z.enum(WAKE_CLAIM_VIAS).optional(),
    }),
    'memory.event.recorded': z.strictObject({
        subject_ref: hash,
        memory_kind: z.enum(MEMORY_EVENT_KINDS),
        assertion_id: hash.nullable(),
        event_ref: hash,
        nonce: z.string().min(1),
        ciphertext: z.string().min(1),
        tag: z.string().min(1),
    }),
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
        reason: z.string(),
        copied_entries: count,
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
    'state.closure.rehydrated': StateClosureRehydratedV2Schema,
    'executor.continuation.accepted': ExecutorContinuationAcceptedV2Schema,
    'run.handoff.recorded': RunHandoffRecordedSchema,
    'plan.recorded': z.strictObject({
        revision: z.number().int().positive(),
        items: z.array(PlanItemSchema).min(1).max(200),
        added: z.array(z.string()),
        revised: z.array(z.string()),
        loosened: z.array(z.string()),
        reason: z.string().min(1).max(1_000),
    }),
    'budgets.amended': z.strictObject({
        idempotency_key: z.string().min(1).max(256),
        request_fingerprint: hash,
        added: BudgetAdditionSchema,
        budgets: BudgetsSchema,
        pools: z.array(z.strictObject({ pool: z.enum(LEASE_POOLS), denomination: z.enum(LEASE_DENOMINATIONS), amount: count })),
        principal: z.string().min(1),
        reason: z.string().max(1_000).nullable(),
    }),
};
const HISTORICAL_RECORD_PAYLOADS = {
    'model.call.started': { 1: ModelCallStartedV1ReaderSchema },
    'state.closure.rehydrated': { 1: StateClosureRehydratedV1Schema },
    'executor.continuation.accepted': { 1: ExecutorContinuationAcceptedV1Schema },
};
export function recordPayloadSchema(type, version) {
    if (!RECORD_TYPES.includes(type))
        return null;
    const recordType = type;
    const versions = RECORD_TYPE_VERSIONS[recordType];
    if (!versions.includes(version))
        return null;
    return HISTORICAL_RECORD_PAYLOADS[recordType]?.[version] ?? RECORD_PAYLOADS[recordType];
}
export function latestRecordPayloadVersion(type) {
    return Math.max(...RECORD_TYPE_VERSIONS[type]);
}
export function recordVersionCatalogue() {
    return {
        schema: 'zero-ar-record-version-catalogue/1',
        records: Object.fromEntries(RECORD_TYPES.map((type) => [
            type,
            { versions: [...RECORD_TYPE_VERSIONS[type]] },
        ])),
    };
}
export function recordSchemaCatalogue() {
    return {
        schema: 'zero-ar-record-schema-catalogue/1',
        records: Object.fromEntries(RECORD_TYPES.map((type) => [
            type,
            {
                versions: Object.fromEntries(RECORD_TYPE_VERSIONS[type].map((version) => [
                    String(version),
                    z.toJSONSchema(recordPayloadSchema(type, version), { io: 'input' }),
                ])),
            },
        ])),
    };
}
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
    usage: z.record(z.string(), z.strictObject({ reserved: count, consumed: count, overrun: z.number().int().positive().optional() })),
    verified_completion_reachable: z.boolean(),
    items: z.record(z.enum(ITEM_STATES), count).nullable(),
    contract: z.strictObject({ name: z.string(), ref: hash, repair_attempts_used: count, repair_budget: count }).nullable(),
    tool_view: ToolViewRecordSchema.nullable().optional(),
    active_closure_epoch: z.number().int().min(1).optional(),
    active_closure_ref: hash.optional(),
    pending_capability_admission_count: count.optional(),
    snapshot_version: count,
});
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
export const RunResultSchema = z.strictObject({
    run_id: id('run'),
    status: z.enum(RUN_STATUSES),
    terminal: z.enum(RUN_TERMINALS).nullable(),
    completion_state: z.enum(COMPLETION_STATES),
    verdict: z.enum(VERDICTS).nullable(),
    verdict_reason: z.string().nullable(),
    artifact: z.strictObject({ entry_id: id('ent'), text: z.string() }).nullable(),
    items: z.strictObject({
        verified: count,
        completed_unverified: count,
        parked: count,
        dismissed: count,
        failed: count,
        invalidated: count,
        untouched: count,
    }).nullable(),
    effects: z.strictObject({ prepared: count, dispatched: count, committed: count, withdrawn: count, outcome_unknown: count, unreconcilable: count, refused: count.optional() }),
    blocking_operational_outcomes: z.array(z.strictObject({ kind: z.enum(BLOCKING_OUTCOME_KINDS), reference: z.string(), state: z.string(), next: z.string() })),
    not_established: z.array(z.string()),
    handover: z.array(z.string()),
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
export const ObservationEventSchema = z.strictObject({
    seq: z.number().int().positive(),
    record_seq: z.number().int().positive(),
    event: z.enum(DURABLE_EVENTS),
    family: z.enum(PRODUCT_EVENT_FAMILIES),
    run_id: id('run'),
    at: z.string(),
    payload: z.record(z.string(), z.unknown()),
});
export const ProgressEventSchema = z.strictObject({
    text: z.string(),
});
export const HealthResponseSchema = z.strictObject({
    product: z.string(),
    contract_version: z.string(),
    profile: z.enum(PROFILES),
    status: z.enum(['ready', 'degraded', 'unready']),
    liveness: z.literal('live'),
    readiness: z.enum(['ready', 'unready']),
    components: z.record(z.string(), z.enum(['ready', 'unreachable'])),
    required_components: z.array(z.string()),
    guarantee_exclusions: z.array(z.string()),
    capability_manifest: ProfileCapabilitySummarySchema,
    task_contracts: z.array(z.strictObject({ name: z.string(), version: z.string(), ref: hash })),
    integrity: IntegrityHealthSchema.nullable().optional(),
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
export const BudgetAmendmentAcceptedSchema = z.strictObject({
    run_id: id('run'),
    accepted: z.literal(true),
    repeated: z.boolean(),
    accepted_seq: z.number().int().positive(),
    budgets: BudgetsSchema,
});
export const RebuildOutcomeSchema = z.strictObject({ equal: z.boolean(), healed: z.boolean() });
export const ImportOutcomeSchema = z.strictObject({
    run_id: id('run'),
    head_equal: z.boolean(),
    records: count,
    artifacts: z.strictObject({
        imported: z.array(artifactHandle),
        not_transferred: z.array(ArtifactTransferOmissionSchema),
    }).optional(),
    state_closure: RunStateRehydrationReportSchema.optional(),
    continuation: RunContinuationCapsuleSchema.optional(),
});
export const RecordsPageSchema = z.strictObject({ records: z.array(RecordEnvelopeSchema) });
export const ReviewItemSchema = z.strictObject({
    run_id: id('run'),
    item_id: z.string().min(1).max(512),
    kind: z.enum(REVIEW_ITEM_KINDS),
    state: z.enum(REVIEW_ITEM_STATES),
    opened_seq: z.number().int().positive(),
    opened_at: z.string().min(1),
    reason: z.string().min(1),
    checkpoint_id: z.string().min(1),
    due_at: z.string().datetime().nullable().optional(),
    question: AgentQuestionRecordSchema.optional(),
});
export const ReviewInboxSchema = z.strictObject({
    items: z.array(ReviewItemSchema),
    truncated: z.boolean(),
});
export const ErasureRequestSchema = z.strictObject({
    subject: z.string().min(1).max(256),
    entry_ids: z.array(id('ent')).min(1).max(10_000),
    by: z.string().min(1).max(256),
    reason: z.string().min(1).max(1_000),
});
export const ErasureOutcomeSchema = z.strictObject({ run_id: id('run'), erased: count });
export const BindingProfileSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    slot: z.enum(WORKSPACE_SLOTS),
    path_prefix: z.string().min(1).max(512),
    operations: z.array(z.strictObject({ name: z.string().min(1), operation_class: z.enum(OPERATION_CLASSES) })).min(1).max(50),
});
export const PostureSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    owner: z.string().min(1),
    verification_reserve_fraction: z.number().min(0).max(0.9),
    optimization: z
        .strictObject({
        checkpoint: z
            .strictObject({
            selector: z.literal('young-daly-items-v1'),
            mode: z.enum(CONTROLLER_MODES),
            checkpoint_cost: z.number().int().min(1),
            recompute_cost: z.number().int().min(1),
            hazard_per_million: z.number().int().min(0),
            minimum_items: z.number().int().min(1),
            maximum_items: z.number().int().min(1),
            fallback_interval: z.number().int().min(1),
            arithmetic: z.literal('integer-sqrt-v1'),
            statistics: reserved(z.strictObject({ source: z.literal('tenant-history-v1'), minimum_exposure: z.number().int().min(1) }), 'optimization.checkpoint.statistics', 'checkpoint.statistics.unwired').optional(),
        })
            .optional(),
        context: z
            .union([
            z.strictObject({
                selector: z.literal('coverage-mmr-v1'),
                mode: z.enum(CONTROLLER_MODES),
                coverage_weight_ppm: z.number().int().min(0),
                recency_weight_ppm: z.number().int().min(0),
                redundancy_weight_ppm: z.number().int().min(0),
                candidate_cutoff: z.number().int().min(1),
                arithmetic: z.literal('integer-score-v1'),
            }),
            HierarchicalContextPolicySchema,
        ])
            .optional(),
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
export const MACHINE_PREDICATE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const PackClaimSchema = z.strictObject({
    predicate: z.string().min(1).max(200),
    kind: z.enum(PACK_CLAIM_KINDS),
    evidence: z.strictObject({ validator: z.string().min(1), version: z.string().min(1) }),
});
export const DomainPackSchema = z.strictObject({
    name: z.string().min(1),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    task_contract: TaskContractSchema.optional(),
    claims: z.array(PackClaimSchema).min(1).max(200),
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
    SandboxWorkspacePolicySchema: { schema: SandboxWorkspacePolicySchema, placement: 'environment', owner: 'runtime-environments' },
    SandboxWorkspaceTransferEntrySchema: { schema: SandboxWorkspaceTransferEntrySchema, placement: 'environment', owner: 'runtime-environments' },
    SandboxWorkspaceTransferBundleSchema: { schema: SandboxWorkspaceTransferBundleSchema, placement: 'environment', owner: 'runtime-environments' },
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
    PortableRecordEnvelopeSchema: { schema: PortableRecordEnvelopeSchema, placement: 'observation', owner: 'runtime-core' },
    RunBundleManifestV1Schema: { schema: RunBundleManifestV1Schema, placement: 'observation', owner: 'runtime-core' },
    RunBundleManifestV2Schema: { schema: RunBundleManifestV2Schema, placement: 'observation', owner: 'runtime-core' },
    RunBundleManifestSchema: { schema: RunBundleManifestSchema, placement: 'observation', owner: 'runtime-core' },
    RunMaterializationSchema: { schema: RunMaterializationSchema, placement: 'observation', owner: 'runtime-core' },
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
    BudgetAmendmentRequestSchema: { schema: BudgetAmendmentRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    BudgetAmendmentAcceptedSchema: { schema: BudgetAmendmentAcceptedSchema, placement: 'run-management', owner: 'runtime-core' },
    RunRefSchema: { schema: RunRefSchema, placement: 'run-management', owner: 'runtime-core' },
    StartAcceptedSchema: { schema: StartAcceptedSchema, placement: 'run-management', owner: 'runtime-core' },
    RebuildOutcomeSchema: { schema: RebuildOutcomeSchema, placement: 'run-management', owner: 'runtime-core' },
    ImportOutcomeSchema: { schema: ImportOutcomeSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationCapsuleSchema: { schema: RunContinuationCapsuleSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationExecutorSchema: { schema: RunContinuationExecutorSchema, placement: 'run-management', owner: 'runtime-core' },
    RunHandoffRequestSchema: { schema: RunHandoffRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    RunHandoffReceiptSchema: { schema: RunHandoffReceiptSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationDestinationIdentitySchema: { schema: RunContinuationDestinationIdentitySchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationDeclarationSchema: { schema: RunContinuationDeclarationSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationAdmissionRequestSchema: { schema: RunContinuationAdmissionRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationCompatibilityReportSchema: { schema: RunContinuationCompatibilityReportSchema, placement: 'run-management', owner: 'runtime-core' },
    RunContinuationAcceptedSchema: { schema: RunContinuationAcceptedSchema, placement: 'run-management', owner: 'runtime-core' },
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
    HierarchicalContextPolicySchema: { schema: HierarchicalContextPolicySchema, placement: 'runtime-identity', owner: 'runtime-core' },
    ContextSegmentCoverageSchema: { schema: ContextSegmentCoverageSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    ContextSegmentSummarizerSchema: { schema: ContextSegmentSummarizerSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    ContextSegmentManifestSchema: { schema: ContextSegmentManifestSchema, placement: 'observation', owner: 'runtime-core' },
    ContextExpandRequestSchema: { schema: ContextExpandRequestSchema, placement: 'run-management', owner: 'runtime-core' },
    ContextExpansionResultSchema: { schema: ContextExpansionResultSchema, placement: 'observation', owner: 'runtime-core' },
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
    ArtifactSweepRequestSchema: { schema: ArtifactSweepRequestSchema, placement: 'operator-management', owner: 'runtime-core' },
    ArtifactSweepResultSchema: { schema: ArtifactSweepResultSchema, placement: 'operator-management', owner: 'runtime-core' },
    ArtifactTransferOmissionSchema: { schema: ArtifactTransferOmissionSchema, placement: 'run-management', owner: 'runtime-core' },
    RunStateClosureMemberSchema: { schema: RunStateClosureMemberSchema, placement: 'run-management', owner: 'runtime-core' },
    RunStateClosureManifestSchema: { schema: RunStateClosureManifestSchema, placement: 'run-management', owner: 'runtime-core' },
    RunStateRehydrationMemberSchema: { schema: RunStateRehydrationMemberSchema, placement: 'run-management', owner: 'runtime-core' },
    RunStateRehydrationReportSchema: { schema: RunStateRehydrationReportSchema, placement: 'run-management', owner: 'runtime-core' },
    AliasHistorySchema: { schema: AliasHistorySchema, placement: 'publication', owner: 'contracts-dx' },
    RegistryRebuildOutcomeSchema: { schema: RegistryRebuildOutcomeSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationExportFrameSchema: { schema: PublicationExportFrameSchema, placement: 'publication', owner: 'contracts-dx' },
    PublicationImportOutcomeSchema: { schema: PublicationImportOutcomeSchema, placement: 'publication', owner: 'contracts-dx' },
    ToolSourceDriftRecordSchema: { schema: ToolSourceDriftRecordSchema, placement: 'operator-management', owner: 'runtime-core' },
    ToolSourceDriftReportSchema: { schema: ToolSourceDriftReportSchema, placement: 'operator-management', owner: 'runtime-core' },
    EffectTargetListSchema: { schema: EffectTargetListSchema, placement: 'effect-dispatch', owner: 'effect-plane' },
    WorkspaceIntakeBindingSchema: { schema: WorkspaceIntakeBindingSchema, placement: 'intake', owner: 'runtime-core' },
    ResolvedWorkspaceInstanceSchema: { schema: ResolvedWorkspaceInstanceSchema, placement: 'runtime-identity', owner: 'runtime-core' },
    RunResumeDeferredRequestSchema: { schema: RunResumeDeferredRequestSchema, placement: 'run-management', owner: 'runtime-core' },
};
