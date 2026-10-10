import type { InteropBindingManifest, McpImportedResourcePlan, McpImportedToolPlan, McpPeerSnapshot, OperationClass } from '@zero-ar/contracts';
import type { ToolManifest } from '@zero-ar/tool-kit';
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
