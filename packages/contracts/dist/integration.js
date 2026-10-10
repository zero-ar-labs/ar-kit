import { z } from 'zod';
import { ModelSelectionSchema } from "./providers.js";
import { GATEWAY_FAMILIES, GATEWAY_OPERATIONS, SKILL_ACTIVATION_POLICIES, SKILL_RETENTIONS } from "./vocab.js";
const ref = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const name = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected lowercase dot-separated naming');
const version = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const count = z.number().int().nonnegative();
export const SkillDescriptorSchema = z.strictObject({
    skill_ref: ref,
    name,
    version,
    description: z.string().min(1).max(2_000),
    topics: z.array(z.string().min(1).max(64)).max(16),
    summary: z.string().min(1).max(500),
    entry_bytes: count,
    resource_count: count,
    allowed_tools: z.array(name).max(64),
    activation: z.enum(SKILL_ACTIVATION_POLICIES),
});
export function skillDescriptor(manifest, skill_ref) {
    return SkillDescriptorSchema.parse({
        skill_ref,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        topics: manifest.discovery.topics,
        summary: manifest.discovery.summary,
        entry_bytes: manifest.entry_bytes ?? 0,
        resource_count: manifest.resources.length,
        allowed_tools: manifest.allowed_tools ?? [],
        activation: manifest.activation ?? 'always',
    });
}
export const SkillOpenRequestSchema = z.strictObject({
    skill_ref: ref,
    retention: z.enum(SKILL_RETENTIONS).optional(),
});
export const SkillReadRequestSchema = z.strictObject({
    skill_ref: ref,
    path: z.string().min(1).max(512),
    start_line: z.number().int().min(1).optional(),
    end_line: z.number().int().min(1).optional(),
    retention: z.enum(SKILL_RETENTIONS).optional(),
});
export const SkillSearchRequestSchema = z.strictObject({
    query: z.string().max(200).optional(),
    page: z.number().int().min(1).optional(),
});
export const SkillLoadResultSchema = z.strictObject({
    skill_ref: ref,
    path: z.string().max(512).nullable(),
    content_ref: ref,
    bytes: count,
    lines: z.strictObject({ start: z.number().int().min(1), end: z.number().int().min(1) }).nullable(),
    retention: z.enum(SKILL_RETENTIONS),
});
export const SkillSearchResultSchema = z.strictObject({
    page: z.number().int().min(1),
    pages: z.number().int().min(1),
    descriptors: z.array(SkillDescriptorSchema),
    omitted: count,
});
export const ArtifactReadRequestSchema = z.strictObject({
    artifact_ref: z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle'),
    offset: z.number().int().min(0),
    length: z.number().int().min(1),
});
export const ModelFallbackSetSchema = z.strictObject({
    name,
    members: z.array(ref).min(1).max(8),
});
export const TenantModelPoolSchema = z.strictObject({
    tenant: z.string().min(1).max(128),
    provider_instances: z.array(ref).max(64),
    enabled_models: z.array(ref).max(1_000),
    aliases: z.record(name, ref),
    default_alias: name.nullable(),
    fallback_sets: z.array(ModelFallbackSetSchema).max(32),
    quota_policy_ref: ref.nullable(),
});
export const ResolvedModelPlanSchema = z.strictObject({
    primary: ModelSelectionSchema,
    fallbacks: z.array(ModelSelectionSchema).max(8),
    selector: z.string().min(1).max(512),
    selection_reason: z.string().min(1).max(500),
    catalogue_refs: z.array(ref).max(16),
    resolution_policy_ref: ref,
});
export const SetModelAliasRequestSchema = z.strictObject({
    alias: name,
    catalogue_entry_ref: ref,
});
export const DeclareFallbackSetRequestSchema = ModelFallbackSetSchema;
export const SetDefaultModelAliasRequestSchema = z.strictObject({ alias: name });
export const GatewayAdapterManifestSchema = z.strictObject({
    name,
    version,
    family: z.enum(GATEWAY_FAMILIES),
    operations: z.array(z.enum(GATEWAY_OPERATIONS)).min(1),
    tenant: z.string().min(1).max(128),
    principal: z.string().min(1).max(256),
    scopes: z.array(z.string().min(1).max(64)).min(1),
    secret_refs: z.array(z.string().min(1).max(512)).max(16),
    rate_limit: z.strictObject({ per_caller_per_minute: z.number().int().min(1).max(10_000) }),
});
export const GatewayDeliveryCursorSchema = z.strictObject({
    adapter: name,
    channel_key: z.string().min(1).max(256),
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id'),
    after_seq: count,
    attempts: count,
});
