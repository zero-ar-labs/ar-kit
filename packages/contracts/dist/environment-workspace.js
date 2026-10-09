/**
 * Public durable-workspace handles and transfer bundles.
 *
 * A handle locates one encrypted workspace generation and carries no
 * authority. A transfer carries verified file bytes without a host path,
 * authority or key. Reattachment independently revalidates every binding.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { SANDBOX_WORKSPACE_STATUSES, SANDBOX_WORKSPACE_ZONES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const workspaceId = z.string().regex(/^wsp_[0-9a-f]{32}$/, 'expected a workspace id');
export const SandboxWorkspaceStatusSchema = z.enum(SANDBOX_WORKSPACE_STATUSES);
export const SandboxWorkspaceBindingSchema = z.strictObject({
    tenant: z.string().min(1),
    run_id: runId,
    profile_ref: hash,
});
export const SandboxWorkspaceHandleSchema = z.strictObject({
    contract: z.literal('sandbox-workspace/1'),
    workspace_handle: workspaceId,
    generation: z.number().int().positive(),
    binding: SandboxWorkspaceBindingSchema,
    host_ref: hash,
    content_policy_ref: hash,
    encryption_key_ref: hash,
    quota_bytes: z.number().int().positive(),
    status: SandboxWorkspaceStatusSchema,
    created_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    identity_ref: hash,
});
/** The byte and retention limits that travel with a portable generation. */
export const SandboxWorkspacePolicySchema = z.strictObject({
    contract: z.literal('sandbox-workspace-policy/1'),
    source_max_bytes: z.number().int().nonnegative(),
    scratch_max_bytes: z.number().int().nonnegative(),
    outputs: z.array(z.strictObject({
        path: z.string().min(1),
        max_bytes: z.number().int().nonnegative(),
    })),
    retention_ms: z.number().int().positive(),
});
/** One plaintext file in a transfer bundle, named only by its portable relative path. */
export const SandboxWorkspaceTransferEntrySchema = z.strictObject({
    zone: z.enum(SANDBOX_WORKSPACE_ZONES),
    path: z.string().min(1),
    content_hash: hash,
    bytes: z.number().int().nonnegative(),
    mode: z.number().int().nonnegative().max(0o777),
    content_base64: z.string(),
});
/**
 * One sealed generation that another workspace controller can re-encrypt.
 * Host and key references in source_handle identify the source but grant no
 * access. The bundle carries no host path, authority reference or key bytes.
 */
export const SandboxWorkspaceTransferBundleSchema = z.strictObject({
    schema: z.literal('zero-ar-sandbox-workspace-transfer/1'),
    source_handle: SandboxWorkspaceHandleSchema,
    policy: SandboxWorkspacePolicySchema,
    entries: z.array(SandboxWorkspaceTransferEntrySchema),
    logical_bytes: z.number().int().nonnegative(),
    sealed_at: z.string().datetime(),
    content_ref: hash,
});
export function deriveSandboxWorkspaceIdentity(handle) {
    return contentHash(handle);
}
export function sandboxWorkspaceHandleHasValidIdentity(handle) {
    const { identity_ref, ...material } = handle;
    return identity_ref === deriveSandboxWorkspaceIdentity(material);
}
/** The full expected binding supplied when an existing generation is used. */
export const SandboxWorkspaceAccessRequestSchema = z.strictObject({
    handle: SandboxWorkspaceHandleSchema,
    tenant: z.string().min(1),
    run_id: runId,
    profile_ref: hash,
    host_ref: hash,
    encryption_key_ref: hash,
    authority_ref: hash,
});
