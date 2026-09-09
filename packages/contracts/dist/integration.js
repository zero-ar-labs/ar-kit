/**
 * Developer-integration contracts (developer-integration appendix, DXI-0).
 *
 * What this is: the shapes progressive skill disclosure, tenant model
 * composition, and gateway adapters speak. A skill descriptor says a
 * pinned skill exists without carrying its body; a load request names an
 * exact pinned ref and nothing else; a resolved model plan expands the
 * model identity a run already pins; a gateway manifest describes a
 * translator that reaches only public operations.
 *
 * How it fits: none of this adds a runtime plane, a state machine, an
 * extension kind, or a private path (DXI-034, DXI-035). Descriptors are
 * derived from published procedure manifests, load results name immutable
 * refs, model plans ride the resolved run manifest, and gateway state
 * lives outside Zero-AR as adapter-local delivery bookkeeping.
 */
import { z } from 'zod';
import { ModelSelectionSchema } from "./providers.js";
import { GATEWAY_FAMILIES, GATEWAY_OPERATIONS, SKILL_ACTIVATION_POLICIES, SKILL_RETENTIONS } from "./vocab.js";
const ref = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const name = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected lowercase dot-separated naming');
const version = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const count = z.number().int().nonnegative();
// ---- progressive skill disclosure (DXI-005 through DXI-012) ----
/**
 * The compact form the model sees for a pinned skill: enough to decide
 * whether to open it, and no instruction bytes beyond the standard
 * description (DXI-007). Everything here derives from the published
 * manifest, so a descriptor is never a second source of truth.
 */
export const SkillDescriptorSchema = z.strictObject({
    skill_ref: ref,
    name,
    version,
    description: z.string().min(1).max(2_000),
    topics: z.array(z.string().min(1).max(64)).max(16),
    summary: z.string().min(1).max(500),
    entry_bytes: count,
    resource_count: count,
    /** Stated compatibility against tools the run already pins; it grants nothing (DXI-008). */
    allowed_tools: z.array(name).max(64),
    activation: z.enum(SKILL_ACTIVATION_POLICIES),
});
/**
 * Derive the descriptor from the published manifest. A manifest compiled
 * before progressive disclosure carries no activation field, and its
 * historical eager behaviour is what absence means (DXI-012).
 */
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
/** Load the exact entry artifact of one pinned skill. */
export const SkillOpenRequestSchema = z.strictObject({
    skill_ref: ref,
    retention: z.enum(SKILL_RETENTIONS).optional(),
});
/** Load one declared resource, optionally a bounded line range inside it. */
export const SkillReadRequestSchema = z.strictObject({
    skill_ref: ref,
    path: z.string().min(1).max(512),
    start_line: z.number().int().min(1).optional(),
    end_line: z.number().int().min(1).optional(),
    retention: z.enum(SKILL_RETENTIONS).optional(),
});
/** Page the pinned descriptor set. Metadata only: no provider call, no network, no embedding. */
export const SkillSearchRequestSchema = z.strictObject({
    query: z.string().max(200).optional(),
    page: z.number().int().min(1).optional(),
});
/** What a load admitted: exact bytes by ref, with the range and retention in force. */
export const SkillLoadResultSchema = z.strictObject({
    skill_ref: ref,
    /** Null for an entry load; the declared resource path for a resource read. */
    path: z.string().max(512).nullable(),
    content_ref: ref,
    bytes: count,
    lines: z.strictObject({ start: z.number().int().min(1), end: z.number().int().min(1) }).nullable(),
    retention: z.enum(SKILL_RETENTIONS),
});
/** One deterministic page over pinned descriptors, with the rest accounted. */
export const SkillSearchResultSchema = z.strictObject({
    page: z.number().int().min(1),
    pages: z.number().int().min(1),
    descriptors: z.array(SkillDescriptorSchema),
    omitted: count,
});
// ---- artifact context reads (UAT-ART-007) ----
/** Read one bounded byte range from a committed artifact handle. */
export const ArtifactReadRequestSchema = z.strictObject({
    artifact_ref: z.string().regex(/^artifact:\/\/[A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+$/, 'expected an artifact handle'),
    offset: z.number().int().min(0),
    length: z.number().int().min(1),
});
// ---- tenant model composition (DXI-013 through DXI-018) ----
/** One declared ordered fallback set a tenant permits by name (DXI-015). */
export const ModelFallbackSetSchema = z.strictObject({
    name,
    /** Catalogue entry refs in the exact order a run may descend. */
    members: z.array(ref).min(1).max(8),
});
/**
 * The tenant's model inventory: which admitted instances are configured,
 * which exact catalogue entries are enabled, and what names resolve to
 * them. Configuration and inventory only; it holds no secret and performs
 * no inference (DXI-013, DXI-018).
 */
export const TenantModelPoolSchema = z.strictObject({
    tenant: z.string().min(1).max(128),
    provider_instances: z.array(ref).max(64),
    /** Enabled exact catalogue entry refs. Discovery alone never appears here. */
    enabled_models: z.array(ref).max(1_000),
    /** Alias to exact catalogue entry ref. An alias names one entry, never a policy. */
    aliases: z.record(name, ref),
    default_alias: name.nullable(),
    fallback_sets: z.array(ModelFallbackSetSchema).max(32),
    quota_policy_ref: ref.nullable(),
});
/**
 * The complete model plan a run pins before its first call: one exact
 * primary, the declared ordered fallbacks, and why this selector resolved
 * here. It enters the resolved run manifest and the transitive identity,
 * so a substitution nobody declared cannot happen quietly (DXI-014).
 */
export const ResolvedModelPlanSchema = z.strictObject({
    primary: ModelSelectionSchema,
    fallbacks: z.array(ModelSelectionSchema).max(8),
    selector: z.string().min(1).max(512),
    selection_reason: z.string().min(1).max(500),
    catalogue_refs: z.array(ref).max(16),
    resolution_policy_ref: ref,
});
/** Point one alias at one exact enabled catalogue entry (DXI-018). */
export const SetModelAliasRequestSchema = z.strictObject({
    alias: name,
    catalogue_entry_ref: ref,
});
/** Declare one ordered fallback set a run may pin by name (DXI-015). */
export const DeclareFallbackSetRequestSchema = ModelFallbackSetSchema;
/** Name the alias intake resolves when an agent asks for the project default. */
export const SetDefaultModelAliasRequestSchema = z.strictObject({ alias: name });
// ---- gateway adapters (DXI-029 through DXI-033) ----
/**
 * What an admitted gateway adapter is and may reach. It authenticates at
 * the channel boundary, maps trusted configuration to tenant identity,
 * and calls generated public operations. It owns no model loop and holds
 * no secret value: only refs into the deployment secret facility.
 */
export const GatewayAdapterManifestSchema = z.strictObject({
    name,
    version,
    family: z.enum(GATEWAY_FAMILIES),
    /** The public operations this adapter is permitted to invoke. */
    operations: z.array(z.enum(GATEWAY_OPERATIONS)).min(1),
    /** Trusted deployment mapping from channel identity to tenant and principals. */
    tenant: z.string().min(1).max(128),
    principal: z.string().min(1).max(256),
    scopes: z.array(z.string().min(1).max(64)).min(1),
    /** Secret references only. A value here would be a contract violation (DXI-032). */
    secret_refs: z.array(z.string().min(1).max(512)).max(16),
    rate_limit: z.strictObject({ per_caller_per_minute: z.number().int().min(1).max(10_000) }),
});
/**
 * Adapter-local delivery bookkeeping. This is not canonical run state:
 * losing it costs redelivery, never run truth (DXI-029, DXI-031).
 */
export const GatewayDeliveryCursorSchema = z.strictObject({
    adapter: name,
    /** The channel thread or subscription this cursor serves. Routing only, never authorization. */
    channel_key: z.string().min(1).max(256),
    run_id: z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id'),
    after_seq: count,
    attempts: count,
});
