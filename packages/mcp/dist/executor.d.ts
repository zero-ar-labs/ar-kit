import type { InteropBindingManifest, McpImportedToolPlan, McpPeerSnapshot, RemoteToolTaskHandle, ToolExecutionOutcome, ToolHostEgressContext } from '@zero-ar/contracts';
import type { ToolManifest } from '@zero-ar/tool-kit';
import type { McpCredentialResolver, McpEgressPort } from './client.js';
export interface McpImportedToolRuntimeBinding {
    binding: InteropBindingManifest;
    snapshot: McpPeerSnapshot;
    manifest: ToolManifest;
    plan: McpImportedToolPlan;
    authenticated_peer: string;
}
export interface McpToolExecutionResult {
    ok: boolean;
    outcome: ToolExecutionOutcome;
    output?: Record<string, unknown>;
    error?: string;
    used?: number;
    pending?: RemoteToolTaskHandle;
}
export declare class McpRemoteToolExecutor {
    private readonly tools;
    private readonly credentials;
    private readonly egress;
    private readonly now;
    constructor(options: {
        tools: readonly McpImportedToolRuntimeBinding[];
        credentials: McpCredentialResolver;
        egress: McpEgressPort;
        now?: () => Date;
    });
    names(): string[];
    registrations(): Array<ToolManifest & {
        contract_ref: string;
        binding_ref: string;
    }>;
    invoke(tool: string, input: Record<string, unknown>, timeoutMs: number, signal?: AbortSignal, context?: Partial<ToolHostEgressContext>): Promise<McpToolExecutionResult>;
    reconcile(handle: RemoteToolTaskHandle, timeoutMs: number, signal?: AbortSignal, context?: Partial<ToolHostEgressContext>): Promise<McpToolExecutionResult>;
    private contextError;
    private invokeOrdinary;
    private invokeTask;
    private taskRequest;
    private resolveCredential;
}
