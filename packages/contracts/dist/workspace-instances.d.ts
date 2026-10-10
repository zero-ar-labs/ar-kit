import { z } from 'zod';
export declare const WorkspaceIntakeBindingSchema: z.ZodObject<{
    mount: z.ZodString;
    instance_ref: z.ZodString;
}, z.core.$strict>;
export type WorkspaceIntakeBinding = z.infer<typeof WorkspaceIntakeBindingSchema>;
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
