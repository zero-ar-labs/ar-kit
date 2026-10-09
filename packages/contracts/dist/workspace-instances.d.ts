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
/** The workspace input a run names: one published mount and the instance it attaches there. */
export declare const WorkspaceIntakeBindingSchema: z.ZodObject<{
    mount: z.ZodString;
    instance_ref: z.ZodString;
}, z.core.$strict>;
export type WorkspaceIntakeBinding = z.infer<typeof WorkspaceIntakeBindingSchema>;
/** What a run pins about one attached instance: the instance, its profile and each tool's manifest hash. */
export declare const ResolvedWorkspaceInstanceSchema: z.ZodObject<{
    mount: z.ZodString;
    instance_ref: z.ZodString;
    binding_profile_ref: z.ZodString;
    slot: z.ZodEnum<{
        "runtime-scratch": "runtime-scratch";
        "customer-readable-external": "customer-readable-external";
    }>;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        manifest_ref: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ResolvedWorkspaceInstance = z.infer<typeof ResolvedWorkspaceInstanceSchema>;
