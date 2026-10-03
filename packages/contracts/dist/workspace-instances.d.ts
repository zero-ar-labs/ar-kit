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
 * each instance, profile and tool hash before any tool is exposed. This
 * build answers the instance routes with workspace.instances.unwired.
 */
import { z } from 'zod';
/** The workspace input a run names: one published mount and the instance it attaches there. */
export declare const WorkspaceIntakeBindingSchema: z.ZodObject<{
    mount: z.ZodString;
    instance_ref: z.ZodString;
}, z.core.$strict>;
export type WorkspaceIntakeBinding = z.infer<typeof WorkspaceIntakeBindingSchema>;
/**
 * Register one instance. Local Lite resolves the path under its admitted
 * root and refuses a path outside it; a hosted cell refuses registration
 * here. The path grants nothing by itself.
 */
export declare const RegisterWorkspaceInstanceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    binding_profile_ref: z.ZodString;
    locator: z.ZodObject<{
        kind: z.ZodLiteral<"local-directory">;
        path: z.ZodString;
    }, z.core.$strict>;
    access: z.ZodEnum<{
        "read-only": "read-only";
        "read-write": "read-write";
    }>;
    lifecycle: z.ZodEnum<{
        "run-scoped": "run-scoped";
        "deployment-owned": "deployment-owned";
    }>;
}, z.core.$strict>;
export type RegisterWorkspaceInstanceRequest = z.infer<typeof RegisterWorkspaceInstanceRequestSchema>;
export declare const WorkspaceInstanceSchema: z.ZodObject<{
    instance_ref: z.ZodString;
    name: z.ZodString;
    binding_profile_ref: z.ZodString;
    slot: z.ZodEnum<{
        "runtime-scratch": "runtime-scratch";
        "customer-readable-external": "customer-readable-external";
    }>;
    mount_prefix: z.ZodString;
    access: z.ZodEnum<{
        "read-only": "read-only";
        "read-write": "read-write";
    }>;
    lifecycle: z.ZodEnum<{
        "run-scoped": "run-scoped";
        "deployment-owned": "deployment-owned";
    }>;
    registered_at: z.ZodString;
}, z.core.$strict>;
export type WorkspaceInstance = z.infer<typeof WorkspaceInstanceSchema>;
export declare const WorkspaceInstanceListSchema: z.ZodObject<{
    instances: z.ZodArray<z.ZodObject<{
        instance_ref: z.ZodString;
        name: z.ZodString;
        binding_profile_ref: z.ZodString;
        slot: z.ZodEnum<{
            "runtime-scratch": "runtime-scratch";
            "customer-readable-external": "customer-readable-external";
        }>;
        mount_prefix: z.ZodString;
        access: z.ZodEnum<{
            "read-only": "read-only";
            "read-write": "read-write";
        }>;
        lifecycle: z.ZodEnum<{
            "run-scoped": "run-scoped";
            "deployment-owned": "deployment-owned";
        }>;
        registered_at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type WorkspaceInstanceList = z.infer<typeof WorkspaceInstanceListSchema>;
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
