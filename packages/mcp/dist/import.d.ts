/**
 * MCP discovery import compiler.
 *
 * What this is: the review boundary that turns one immutable peer snapshot
 * into a native tool or resource publication plan. Remote descriptions and
 * annotations remain metadata and cannot choose authority or operation class.
 *
 * How it fits: callers inspect the dry-run plan, then attach a separate
 * admission reference. Active runs pin that admitted content rather than a
 * mutable endpoint catalogue.
 */
import type { InteropBindingManifest, McpImportedResourcePlan, McpImportedToolPlan, McpPeerSnapshot, OperationClass } from '@zero-ar/contracts';
import type { ToolManifest } from '@zero-ar/tool-kit';
/** Derive the host-facing binding a run pins for one reviewed remote tool. */
export declare function mcpToolExecutionBindingRef(input: {
    snapshot_ref: string;
    binding_ref: string;
    tool_name: string;
    endpoint: string;
    authentication_ref: string;
    destination_ref: string;
    operation_class: OperationClass;
}): string;
export declare function compileMcpToolImport(input: {
    snapshot: McpPeerSnapshot;
    binding: InteropBindingManifest;
    tool_name: string;
    version: string;
    operation_class: OperationClass;
}): {
    manifest: ToolManifest;
    plan: McpImportedToolPlan;
};
export declare function admitMcpToolImport(plan: McpImportedToolPlan, admissionRef: string): McpImportedToolPlan;
export declare function compileMcpResourceImport(input: {
    snapshot: McpPeerSnapshot;
    binding: InteropBindingManifest;
    uri: string;
}): McpImportedResourcePlan;
export declare function admitMcpResourceImport(plan: McpImportedResourcePlan, admissionRef: string): McpImportedResourcePlan;
