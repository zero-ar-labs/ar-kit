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
export const SandboxWorkspaceTransferEntrySchema = z.strictObject({
    zone: z.enum(SANDBOX_WORKSPACE_ZONES),
    path: z.string().min(1),
    content_hash: hash,
    bytes: z.number().int().nonnegative(),
    mode: z.number().int().nonnegative().max(0o777),
    content_base64: z.string(),
});
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
export const SandboxWorkspaceAccessRequestSchema = z.strictObject({
    handle: SandboxWorkspaceHandleSchema,
    tenant: z.string().min(1),
    run_id: runId,
    profile_ref: hash,
    host_ref: hash,
    encryption_key_ref: hash,
    authority_ref: hash,
});
