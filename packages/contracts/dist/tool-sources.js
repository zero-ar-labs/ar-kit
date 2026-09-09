/**
 * Tool-source administration contracts.
 *
 * What this is: provider-neutral payloads for configuring Composio and
 * Merge sources, discovering provider catalogues, reviewing imports, and
 * narrowing access without rewriting prior runs.
 *
 * How it fits: the runtime still executes only Zero-AR tool contracts.
 * These shapes describe the operator acts that turn provider catalogue
 * entries into pinned tool bindings.
 */
import { z } from 'zod';
import { AGGREGATOR_PROVIDERS, OPERATION_CLASSES, TOOL_SOURCE_STATES, TOOL_SOURCE_TOOL_STATES } from "./vocab.js";
const ref = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const name = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected lowercase dot-separated naming');
const sourceName = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/, 'expected one lowercase source instance name');
const secretRef = z.string().regex(/^secret:\/\/[A-Za-z0-9._/-]+$/, 'expected a secret:// reference, never credential bytes');
const sourceScope = z.string().min(1).max(512);
const endpoint = z.string().url().max(2_048).optional();
const operationClass = z.enum(OPERATION_CLASSES).refine((value) => value === 'observation' || value === 'effect-proposal', {
    message: 'tool-source imports may be observation or effect-proposal',
});
const BaseToolSourceRequestSchema = z.strictObject({
    name: sourceName,
    provider: z.enum(AGGREGATOR_PROVIDERS),
    endpoint,
    credential_binding_ref: secretRef,
    scope: sourceScope,
});
export const RegisterComposioToolSourceRequestSchema = BaseToolSourceRequestSchema.extend({
    provider: z.literal('composio'),
    toolkit_slug: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,127}$/),
    toolkit_version: z.string().regex(/^\d{8}_\d{2}$/),
    tool_slugs: z.array(z.string().regex(/^[A-Z0-9][A-Z0-9_]{1,255}$/)).min(1).max(512),
    connected_account_id: z.string().min(1).max(512),
});
export const RegisterMergeAgentHandlerToolSourceRequestSchema = BaseToolSourceRequestSchema.extend({
    provider: z.literal('merge-agent-handler'),
    tool_pack_id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,255}$/),
    registered_user_id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,255}$/),
});
export const RegisterMergeUnifiedToolSourceRequestSchema = BaseToolSourceRequestSchema.extend({
    provider: z.literal('merge-unified'),
});
export const RegisterToolSourceRequestSchema = z.discriminatedUnion('provider', [
    RegisterComposioToolSourceRequestSchema,
    RegisterMergeAgentHandlerToolSourceRequestSchema,
    RegisterMergeUnifiedToolSourceRequestSchema,
]);
export const ToolSourceSchema = RegisterToolSourceRequestSchema.and(z.strictObject({
    source_ref: ref,
    state: z.enum(TOOL_SOURCE_STATES),
    credential_epoch: z.number().int().min(1),
    current_snapshot_ref: ref.nullable(),
    registered_at: z.string().min(1),
}));
export const ToolSourceListSchema = z.strictObject({ sources: z.array(ToolSourceSchema) });
export const DiscoveredToolSourceToolSchema = z.strictObject({
    name: name.or(z.string().regex(/^[A-Z0-9][A-Z0-9_]{1,255}$/)),
    description: z.string().min(1).max(4_000),
    input_schema: z.record(z.string(), z.unknown()).refine((value) => value['type'] === 'object', {
        message: 'a provider tool input schema must describe an object',
    }),
    provider_version: z.string().min(1).max(512).optional(),
    annotations: z.record(z.string(), z.unknown()).optional(),
});
export const ToolSourceToolEntrySchema = DiscoveredToolSourceToolSchema.extend({
    tool_entry_ref: ref,
    source_ref: ref,
    imported_name: z.string().min(1).max(512),
    binding_ref: ref.nullable(),
    operation_class: operationClass.nullable(),
    reviewer: z.string().min(1).max(256).nullable(),
    state: z.enum(TOOL_SOURCE_TOOL_STATES),
});
export const SyncToolSourceCatalogueRequestSchema = z.strictObject({
    tools: z.array(DiscoveredToolSourceToolSchema).max(10_000).optional(),
});
export const ToolSourceCatalogueSchema = z.strictObject({
    source_ref: ref,
    snapshot_ref: ref,
    entries: z.array(ToolSourceToolEntrySchema),
});
export const EnableToolSourceToolsRequestSchema = z.strictObject({
    tools: z.array(z.strictObject({
        tool_entry_ref: ref,
        operation_class: operationClass,
        reviewer: z.string().min(1).max(256),
    })).min(1).max(1_000),
});
export const ToolSourceEnablementSchema = z.strictObject({
    source: ToolSourceSchema,
    entries: z.array(ToolSourceToolEntrySchema),
});
export const ToolSourceStateRequestSchema = z.strictObject({
    reason: z.string().min(1).max(500),
});
export const ToolSourceTestResultSchema = z.strictObject({
    source_ref: ref,
    provider: z.enum(AGGREGATOR_PROVIDERS),
    ready: z.boolean(),
    credential_status: z.string().min(1).max(128),
    catalogue_reachable: z.boolean(),
    observed_tools: z.number().int().min(0),
    reason: z.string().min(1).max(1_000),
});
export function toolSourceProvider(request) {
    return request.provider;
}
