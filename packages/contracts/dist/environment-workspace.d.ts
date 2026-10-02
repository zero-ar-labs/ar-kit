/**
 * Public durable-workspace handles.
 *
 * A handle locates one encrypted workspace generation and carries no
 * authority. Reattachment must independently revalidate the current caller,
 * tenant, run, profile, host, key reference, generation and expiry.
 */
import { z } from 'zod';
export declare const SandboxWorkspaceStatusSchema: z.ZodEnum<{
    sealed: "sealed";
    attached: "attached";
    expired: "expired";
    deleted: "deleted";
}>;
export declare const SandboxWorkspaceBindingSchema: z.ZodObject<{
    tenant: z.ZodString;
    run_id: z.ZodString;
    profile_ref: z.ZodString;
}, z.core.$strict>;
export type SandboxWorkspaceBinding = z.infer<typeof SandboxWorkspaceBindingSchema>;
export declare const SandboxWorkspaceHandleSchema: z.ZodObject<{
    contract: z.ZodLiteral<"sandbox-workspace/1">;
    workspace_handle: z.ZodString;
    generation: z.ZodNumber;
    binding: z.ZodObject<{
        tenant: z.ZodString;
        run_id: z.ZodString;
        profile_ref: z.ZodString;
    }, z.core.$strict>;
    host_ref: z.ZodString;
    content_policy_ref: z.ZodString;
    encryption_key_ref: z.ZodString;
    quota_bytes: z.ZodNumber;
    status: z.ZodEnum<{
        sealed: "sealed";
        attached: "attached";
        expired: "expired";
        deleted: "deleted";
    }>;
    created_at: z.ZodString;
    expires_at: z.ZodString;
    identity_ref: z.ZodString;
}, z.core.$strict>;
export type SandboxWorkspaceHandle = z.infer<typeof SandboxWorkspaceHandleSchema>;
export declare function deriveSandboxWorkspaceIdentity(handle: Omit<SandboxWorkspaceHandle, 'identity_ref'>): string;
export declare function sandboxWorkspaceHandleHasValidIdentity(handle: SandboxWorkspaceHandle): boolean;
/** The full expected binding supplied when an existing generation is used. */
export declare const SandboxWorkspaceAccessRequestSchema: z.ZodObject<{
    handle: z.ZodObject<{
        contract: z.ZodLiteral<"sandbox-workspace/1">;
        workspace_handle: z.ZodString;
        generation: z.ZodNumber;
        binding: z.ZodObject<{
            tenant: z.ZodString;
            run_id: z.ZodString;
            profile_ref: z.ZodString;
        }, z.core.$strict>;
        host_ref: z.ZodString;
        content_policy_ref: z.ZodString;
        encryption_key_ref: z.ZodString;
        quota_bytes: z.ZodNumber;
        status: z.ZodEnum<{
            sealed: "sealed";
            attached: "attached";
            expired: "expired";
            deleted: "deleted";
        }>;
        created_at: z.ZodString;
        expires_at: z.ZodString;
        identity_ref: z.ZodString;
    }, z.core.$strict>;
    tenant: z.ZodString;
    run_id: z.ZodString;
    profile_ref: z.ZodString;
    host_ref: z.ZodString;
    encryption_key_ref: z.ZodString;
    authority_ref: z.ZodString;
}, z.core.$strict>;
export type SandboxWorkspaceAccessRequest = z.infer<typeof SandboxWorkspaceAccessRequestSchema>;
