import { z } from 'zod';
import { ENVIRONMENT_MOUNT_MODES, WORKSPACE_INSTANCE_LIFECYCLES, WORKSPACE_SLOTS } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const mountName = z.string().regex(/^[a-z][a-z0-9-]{0,62}$/, 'expected one lowercase mount name');
export const WorkspaceIntakeBindingSchema = z.strictObject({
    mount: mountName,
    instance_ref: hash,
});
export const ResolvedWorkspaceInstanceSchema = z.strictObject({
    mount: mountName,
    instance_ref: hash,
    binding_profile_ref: hash,
    slot: z.enum(WORKSPACE_SLOTS),
    tools: z.array(z.strictObject({ name: z.string().min(1).max(256), manifest_ref: hash })).max(64),
});
