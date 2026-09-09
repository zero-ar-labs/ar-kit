/**
 * @zero-ar/sdk: authoring builders.
 *
 * What this is: defineAgent, defineTool, defineValidator, and definePosture,
 * each producing an immutable, content-addressed manifest validated at
 * declaration time (ADX-001). The SDK holds no loop, no storage, and no way
 * to promote completion; it authors declarations and talks to the runtime
 * through the public client alone.
 *
 * How it fits: this milestone carries the minimal builder set the ERD asks
 * of the runway. Tool bindings, validator conformance, posture registries,
 * and the compiler for YAML and Markdown forms grow through milestones two
 * and three without changing what a manifest is: frozen data plus a hash.
 */
import type { CompiledPack, DomainPack, TrustTier } from '@zero-ar/contracts';
import { ZeroARClient } from '@zero-ar/client';
interface Named {
    name: string;
    version: string;
}
export interface AgentSpec extends Named {
    instructions: string;
    model?: string;
    tools?: string[];
}
export declare function defineAgent(spec: AgentSpec): Readonly<{
    instructions: string;
    model: string;
    tools: string[];
    name: string;
    version: string;
}> & {
    kind: string;
    hash: string;
};
export interface ToolSpec extends Named {
    description: string;
    /** The single authoritative input contract used by every generated surface. */
    input_schema: Record<string, unknown>;
    operation_class: 'observation' | 'run-internal' | 'effect-proposal';
    isolation: TrustTier;
    /** Effect-proposal tools name the target operation they can propose. */
    target?: string;
    operation?: string;
}
export declare function defineTool(spec: ToolSpec): Readonly<ToolSpec> & {
    kind: string;
    hash: string;
};
export interface ValidatorSpec extends Named {
    class: 'deterministic' | 'sampled-oracle' | 'heuristic' | 'named-human';
    covers: string[];
    verdicts: ('pass' | 'reject' | 'indeterminate')[];
}
export declare function defineValidator(spec: ValidatorSpec): Readonly<ValidatorSpec> & {
    kind: string;
    hash: string;
};
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
export { SOURCE_KINDS, loadProject, lockBytes, renderDiagnostics } from './project.js';
export type { DiscoveredResource, Diagnostic as ProjectDiagnostic, LoadedProject, ProjectLoaderOptions, SourceKind } from './project.js';
export { developmentLoop } from './development.js';
export type { ConformanceOutcome, DevelopmentLoop, DevelopmentLoopOptions, DevelopmentPublication } from './development.js';
export type { ZeroAROptions, RunInput } from './embed.js';
export declare function createRuntimeClient(baseUrl: string): ZeroARClient;
/**
 * Compile a domain pack for publication (XCV-012). Machine claims must be
 * versioned predicates whose evidence names a validator the deployment
 * really has; a prose claim or unresolved evidence fails here, before
 * anything publishes. Notes pass through labelled as informational, with
 * no authority, so a pack cannot smuggle a claim through a sentence.
 */
export declare function compileDomainPack(pack: DomainPack, available: {
    name: string;
    version: string;
}[]): CompiledPack;
export { compileProject, compileSkill, exportAgentSkill, renderPlan } from './publication.js';
export { verifyBundle } from '@zero-ar/contracts';
export type { CompiledBundle, ExportedAgentSkill } from './publication.js';
export { defineOrchestration, runOrchestration } from './orchestration.js';
export type { OrchestrationOutcome, OrchestrationPlan, OrchestrationStep } from './orchestration.js';
export { defineResearchOrchestration, runResearchOrchestration } from './research-orchestration.js';
export type { ResearchAcceptanceCheck, ResearchAcceptanceInput, ResearchAcceptanceVerdict, ResearchAssertion, ResearchAttempt, ResearchAttemptSummary, ResearchConflict, ResearchControlAnswer, ResearchDisposition, ResearchGap, ResearchGapResolution, ResearchGraphNode, ResearchMergeSummary, ResearchOrchestrationOutcome, ResearchOrchestrationPlan, ResearchOrchestrationResumeState, ResearchRunSummary, } from './research-orchestration.js';
