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
import { McpImportedResourcePlanSchema, McpImportedToolPlanSchema, contentHash, refuse, } from '@zero-ar/contracts';
import { assertBoundedJsonSchema } from "./schema-policy.js";
/** Derive the host-facing binding a run pins for one reviewed remote tool. */
export function mcpToolExecutionBindingRef(input) {
    return contentHash(input);
}
function assertImportBinding(snapshot, binding) {
    if (binding.protocol !== 'mcp' || binding.direction !== 'client' || binding.connection.kind !== 'endpoint' || binding.authentication_ref === null) {
        refuse({
            code: 'interop.mcp.binding.direction',
            message: 'MCP import requires an authenticated client binding with an endpoint. Compile that binding before importing the snapshot.',
            clause: 'IOP-024',
        });
    }
    if (snapshot.binding_ref !== binding.binding_ref || snapshot.endpoint !== binding.connection.endpoint) {
        refuse({
            code: 'interop.mcp.snapshot.binding',
            message: 'the peer snapshot does not belong to this exact binding endpoint. Discover the peer again through the selected binding.',
            clause: 'IOP-025',
        });
    }
}
export function compileMcpToolImport(input) {
    assertImportBinding(input.snapshot, input.binding);
    const tool = input.snapshot.tools.find((candidate) => candidate.name === input.tool_name);
    if (!tool) {
        refuse({
            code: 'interop.mcp.tool.unknown',
            message: `the immutable peer snapshot has no tool named ${input.tool_name}. Select one of the listed tool names or refresh into a new snapshot.`,
            alternatives: input.snapshot.tools.slice(0, 20).map((candidate) => candidate.name),
            clause: 'IOP-025',
        });
    }
    const inputSchema = assertBoundedJsonSchema(tool.input_schema, input.binding.limits);
    const outputSchema = tool.output_schema === null
        ? { type: 'object', maxProperties: 256, additionalProperties: false, properties: {} }
        : assertBoundedJsonSchema(tool.output_schema, input.binding.limits);
    const manifest = {
        kind: 'tool',
        name: `mcp.${tool.name.replace(/[^a-z0-9-]+/g, '-')}`,
        version: input.version,
        description: tool.description ?? `Imported MCP tool ${tool.name}.`,
        input_schema: inputSchema,
        output_schema: outputSchema,
        operation_class: input.operation_class,
        isolation: 'remote',
        cost: null,
        timeout_ms: input.binding.timeouts.idle_ms,
    };
    const toolManifestRef = contentHash(manifest);
    const executionBindingRef = mcpToolExecutionBindingRef({
        snapshot_ref: input.snapshot.snapshot_ref,
        binding_ref: input.binding.binding_ref,
        tool_name: tool.name,
        endpoint: input.binding.connection.endpoint,
        authentication_ref: input.binding.authentication_ref,
        destination_ref: input.binding.connection.destination_ref,
        operation_class: input.operation_class,
    });
    return {
        manifest,
        plan: McpImportedToolPlanSchema.parse({
            snapshot_ref: input.snapshot.snapshot_ref,
            tool_name: tool.name,
            tool_manifest_ref: toolManifestRef,
            execution_binding_ref: executionBindingRef,
            endpoint: input.binding.connection.endpoint,
            authentication_ref: input.binding.authentication_ref,
            destination_ref: input.binding.connection.destination_ref,
            operation_class: input.operation_class,
            admitted: false,
            admission_ref: null,
            unsupported_metadata: tool.annotations === null ? [] : ['MCP annotations are retained as metadata and grant no native authority.'],
        }),
    };
}
export function admitMcpToolImport(plan, admissionRef) {
    return McpImportedToolPlanSchema.parse({ ...plan, admitted: true, admission_ref: admissionRef });
}
export function compileMcpResourceImport(input) {
    assertImportBinding(input.snapshot, input.binding);
    const resource = input.snapshot.resources.find((candidate) => candidate.uri === input.uri);
    if (!resource) {
        refuse({
            code: 'interop.mcp.resource.unknown',
            message: 'the immutable peer snapshot has no resource at this URI. Select a listed resource or refresh into a new snapshot.',
            received: input.uri.slice(0, 256),
            clause: 'IOP-027',
        });
    }
    return McpImportedResourcePlanSchema.parse({
        snapshot_ref: input.snapshot.snapshot_ref,
        uri: resource.uri,
        media_type: resource.media_type,
        content_identity: resource.content_identity,
        authorization_boundary: resource.authorization_boundary,
        endpoint: input.binding.connection.endpoint,
        authentication_ref: input.binding.authentication_ref,
        destination_ref: input.binding.connection.destination_ref,
        admitted: false,
        admission_ref: null,
    });
}
export function admitMcpResourceImport(plan, admissionRef) {
    return McpImportedResourcePlanSchema.parse({ ...plan, admitted: true, admission_ref: admissionRef });
}
