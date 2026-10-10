import type { CompiledPack, DomainPack, ToolDisclosureClass, TrustTier, ValidatorCatalogueEntryBody } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
interface Named {
    name: string;
    version: string;
}
export interface AgentSpec extends Named {
    instructions: string;
    model?: string;
    model_fallback_set?: string;
    tools?: string[];
    procedures?: string[];
    skills?: string[];
    task_contract?: string;
    validators?: string[];
    posture?: string;
    semantic_declarations?: string[];
    domain_pack?: string;
    binding_profiles?: string[];
    workspace?: {
        mounts?: Record<string, {
            binding_profile: string;
            operations: string[];
        }>;
    };
    overrides?: {
        models?: string[];
        tools?: string[];
        workspace_operations?: string[];
    };
}
export declare function defineAgent(spec: AgentSpec): Readonly<{
    instructions: string;
    model: string;
    model_fallback_set?: string;
    tools: string[];
    procedures?: string[];
    skills?: string[];
    task_contract?: string;
    validators?: string[];
    posture?: string;
    semantic_declarations?: string[];
    domain_pack?: string;
    binding_profiles?: string[];
    workspace?: {
        mounts?: Record<string, {
            binding_profile: string;
            operations: string[];
        }>;
    };
    overrides?: {
        models?: string[];
        tools?: string[];
        workspace_operations?: string[];
    };
    name: string;
    version: string;
}> & {
    kind: string;
    hash: string;
};
export interface ToolSpec extends Named {
    description: string;
    input_schema: Record<string, unknown>;
    operation_class: 'observation' | 'run-internal' | 'effect-proposal';
    isolation: TrustTier;
    target?: string;
    operation?: string;
    disclosure?: {
        purpose?: string;
        use_when?: string;
        do_not_use_when?: string;
        cost?: ToolDisclosureClass;
        latency?: ToolDisclosureClass;
        result_size?: ToolDisclosureClass;
        preactivate?: boolean;
    };
}
export declare function defineTool(spec: ToolSpec): Readonly<ToolSpec> & {
    kind: string;
    hash: string;
};
export interface ValidatorSpec extends Named {
    class: 'deterministic' | 'sampled-oracle' | 'heuristic' | 'named-human';
    description: string;
    covers: string[];
    verdicts: ('pass' | 'reject' | 'indeterminate')[];
    implementation_ref: string;
    factory_ref?: string;
    entrypoint: string;
    cost_wall_ms: number;
    rule_kinds: string[];
    limitations: string[];
    evidence?: ValidatorCatalogueEntryBody['evidence'];
    runtime_needs?: Partial<ValidatorCatalogueEntryBody['runtime_needs']>;
}
export declare function defineValidator(spec: ValidatorSpec): Readonly<{
    verdicts: ("indeterminate" | "pass" | "reject")[];
    catalogue_entry: {
        schema: "validator-catalogue-entry/1";
        kind: "custom" | "first-party";
        identity: {
            name: string;
            version: string;
            implementation_ref: string;
            factory_ref: string | null;
            entrypoint: string;
        };
        finding_contract: {
            class: "deterministic" | "sampled-oracle" | "heuristic" | "named-human";
            supported_verdicts: ("indeterminate" | "pass" | "reject")[];
            supported_failure_classes: ("shape" | "domain" | "grounding" | "infrastructure")[];
            indeterminate_supported: true;
        };
        input_contract: {
            representation: string;
            required_item_fields: string[];
            population: "full" | "sampled";
            dependencies: ("named-human" | "artifact-reader" | "domain-oracle")[];
            maximum_items: number;
        };
        coverage_capability: {
            rule_kinds: string[];
        };
        cost_envelope: {
            wall_ms: number;
            denomination: "compute_ms";
            compute_ms: number;
            cpu_millis: number | null;
            memory_bytes: number | null;
            pids: number | null;
        };
        evidence: {
            protocol_conformance: string[];
            labelled_cases: {
                positive: string[];
                negative: string[];
                indeterminate: string[];
                adversarial: string[];
            };
            repeatability: string[];
            calibration: string[];
            deployment_admission: string[];
            boundary: string;
        };
        evidence_grade: "declared" | "protocol-conformant" | "case-evaluated" | "deployment-admitted";
        runtime_needs: {
            host_protocol: string;
            package_ref: string | null;
            bundle_ref: string | null;
            artifact_reader: boolean;
            network_policy: "denied" | "declared-egress";
            named_human_class: string | null;
            oracle_ref: string | null;
            sampling_frame_ref: string | null;
            sampling_assumption: string | null;
        };
        limitations: string[];
        catalogue_entry_ref: string;
    };
    class: "deterministic" | "sampled-oracle" | "heuristic" | "named-human";
    description: string;
    covers: string[];
    implementation_ref: string;
    factory_ref?: string;
    entrypoint: string;
    cost_wall_ms: number;
    rule_kinds: string[];
    limitations: string[];
    evidence?: ValidatorCatalogueEntryBody["evidence"];
    runtime_needs?: Partial<ValidatorCatalogueEntryBody["runtime_needs"]>;
    name: string;
    version: string;
}> & {
    kind: string;
    hash: string;
};
export interface ModelValidatorAuthoringProposal {
    schema: 'model-validator-authoring-proposal/1';
    status: 'unadmitted';
    proposal_ref: string;
    candidate: unknown;
}
export declare function modelValidatorAuthoringProposal(candidate: unknown): ModelValidatorAuthoringProposal;
export declare function admitModelValidatorAuthoringProposal(proposal: ModelValidatorAuthoringProposal, selection: {
    selected_by: string;
    validator: ValidatorSpec;
}): Readonly<{
    validator: Readonly<{
        verdicts: ("indeterminate" | "pass" | "reject")[];
        catalogue_entry: {
            schema: "validator-catalogue-entry/1";
            kind: "custom" | "first-party";
            identity: {
                name: string;
                version: string;
                implementation_ref: string;
                factory_ref: string | null;
                entrypoint: string;
            };
            finding_contract: {
                class: "deterministic" | "sampled-oracle" | "heuristic" | "named-human";
                supported_verdicts: ("indeterminate" | "pass" | "reject")[];
                supported_failure_classes: ("shape" | "domain" | "grounding" | "infrastructure")[];
                indeterminate_supported: true;
            };
            input_contract: {
                representation: string;
                required_item_fields: string[];
                population: "full" | "sampled";
                dependencies: ("named-human" | "artifact-reader" | "domain-oracle")[];
                maximum_items: number;
            };
            coverage_capability: {
                rule_kinds: string[];
            };
            cost_envelope: {
                wall_ms: number;
                denomination: "compute_ms";
                compute_ms: number;
                cpu_millis: number | null;
                memory_bytes: number | null;
                pids: number | null;
            };
            evidence: {
                protocol_conformance: string[];
                labelled_cases: {
                    positive: string[];
                    negative: string[];
                    indeterminate: string[];
                    adversarial: string[];
                };
                repeatability: string[];
                calibration: string[];
                deployment_admission: string[];
                boundary: string;
            };
            evidence_grade: "declared" | "protocol-conformant" | "case-evaluated" | "deployment-admitted";
            runtime_needs: {
                host_protocol: string;
                package_ref: string | null;
                bundle_ref: string | null;
                artifact_reader: boolean;
                network_policy: "denied" | "declared-egress";
                named_human_class: string | null;
                oracle_ref: string | null;
                sampling_frame_ref: string | null;
                sampling_assumption: string | null;
            };
            limitations: string[];
            catalogue_entry_ref: string;
        };
        class: "deterministic" | "sampled-oracle" | "heuristic" | "named-human";
        description: string;
        covers: string[];
        implementation_ref: string;
        factory_ref?: string;
        entrypoint: string;
        cost_wall_ms: number;
        rule_kinds: string[];
        limitations: string[];
        evidence?: ValidatorCatalogueEntryBody["evidence"];
        runtime_needs?: Partial<ValidatorCatalogueEntryBody["runtime_needs"]>;
        name: string;
        version: string;
    }> & {
        kind: string;
        hash: string;
    };
    proposal_ref: string;
    selected_by: string;
    author_selection_ref: string;
}>;
export interface PostureSpec extends Named {
    owner: string;
    budgets: 'small-bounded' | 'long-bounded';
    verification_reserve_fraction: number;
}
export declare function definePosture(spec: PostureSpec): Readonly<PostureSpec> & {
    kind: string;
    hash: string;
};
export { createZeroAR, ZeroAR, RunHandle } from './embed.js';
export { commitCompiledPublication, publishCapabilitySource } from './capability-admission.js';
export { SOURCE_KINDS, loadProject, lockBytes, renderDiagnostics } from './project.js';
export type { DiscoveredResource, Diagnostic as ProjectDiagnostic, LoadedProject, ProjectLoaderOptions, SourceKind } from './project.js';
export { developmentLoop } from './development.js';
export type { ConformanceOutcome, DevelopmentLoop, DevelopmentLoopOptions, DevelopmentPublication } from './development.js';
export type { ZeroAROptions, RunInput, LocalCapabilityAdmissionInput } from './embed.js';
export type { PublishedCapabilityCandidate } from './capability-admission.js';
export { authoringScaffold, scaffoldBindingProfile, scaffoldBytes, scaffoldDomainPack, scaffoldProject, scaffoldSkill, scaffoldTool, scaffoldValidator, } from './scaffolds.js';
export type { AuthoringScaffold, ProjectScaffoldOptions, ScaffoldFile } from './scaffolds.js';
export declare function createRuntimeClient(baseUrl: string): ZeroARClient;
export declare function compileDomainPack(pack: DomainPack, available: {
    name: string;
    version: string;
}[]): CompiledPack;
export { compileAuthoringSource, compileProject, compileSkill, exportAgentSkill, previewPublicationVerificationPlan, renderPlan, skillLock, } from './publication.js';
export { verifyBundle } from '@zero-ar/contracts';
export type { CompiledBundle, ExportedAgentSkill, PublicationVerificationPreviewInput, SkillLock } from './publication.js';
export { renderVerificationPlan } from '@zero-ar/validator-kit';
export { defineOrchestration, runOrchestration } from './orchestration.js';
export type { OrchestrationOutcome, OrchestrationPlan, OrchestrationStep } from './orchestration.js';
export { defineResearchOrchestration, runResearchOrchestration } from './research-orchestration.js';
export { memoryFor, SubjectMemory } from './memory.js';
export type { ResearchAcceptanceCheck, ResearchAcceptanceInput, ResearchAcceptanceVerdict, ResearchAssertion, ResearchAttempt, ResearchAttemptSummary, ResearchConflict, ResearchControlAnswer, ResearchDisposition, ResearchGap, ResearchGapResolution, ResearchGraphNode, ResearchMergeSummary, ResearchOrchestrationOutcome, ResearchOrchestrationPlan, ResearchOrchestrationResumeState, ResearchRunSummary, } from './research-orchestration.js';
