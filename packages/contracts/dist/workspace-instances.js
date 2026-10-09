/**
 * Workspace instance contracts.
 *
 * What this is: the deployment registry of workspace instances and the
 * intake binding that attaches one to a published mount. A publication
 * declares a mount and its binding profile; the deployment supplies the
 * instance; a run names both, and model arguments never choose either
 * (ADX-013, EXT-018). Tools read as workspace.<mount>.<op>.
 *
 * How it fits: Local Lite registers instances under its admitted root; a
 * hosted cell takes them from deployment configuration only. A run pins
 * each instance, profile and tool hash before any tool is exposed. The
 * register, list and inspect routes retired under the autonomy plan, rule 2.
 */
import { z } from 'zod';
import { ENVIRONMENT_MOUNT_MODES, WORKSPACE_INSTANCE_LIFECYCLES, WORKSPACE_SLOTS } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const mountName = z.string().regex(/^[a-z][a-z0-9-]{0,62}$/, 'expected one lowercase mount name');
/** The workspace input a run names: one published mount and the instance it attaches there. */
export const WorkspaceIntakeBindingSchema = z.strictObject({
    mount: mountName,
    instance_ref: hash,
});
/** What a run pins about one attached instance: the instance, its profile and each tool's manifest hash. */
export const ResolvedWorkspaceInstanceSchema = z.strictObject({
    mount: mountName,
    instance_ref: hash,
    binding_profile_ref: hash,
    slot: z.enum(WORKSPACE_SLOTS),
    tools: z.array(z.strictObject({ name: z.string().min(1).max(256), manifest_ref: hash })).max(64),
});
