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
export declare const SandboxWorkspacePolicySchema: z.ZodObject<{
    contract: z.ZodLiteral<"sandbox-workspace-policy/1">;
    source_max_bytes: z.ZodNumber;
    scratch_max_bytes: z.ZodNumber;
    outputs: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        max_bytes: z.ZodNumber;
    }, z.core.$strict>>;
    retention_ms: z.ZodNumber;
}, z.core.$strict>;
export type SandboxWorkspacePolicy = z.infer<typeof SandboxWorkspacePolicySchema>;
export declare const SandboxWorkspaceTransferEntrySchema: z.ZodObject<{
    zone: z.ZodEnum<{
        sources: "sources";
        scratch: "scratch";
        outputs: "outputs";
    }>;
    path: z.ZodString;
    content_hash: z.ZodString;
    bytes: z.ZodNumber;
    mode: z.ZodNumber;
    content_base64: z.ZodString;
}, z.core.$strict>;
export type SandboxWorkspaceTransferEntry = z.infer<typeof SandboxWorkspaceTransferEntrySchema>;
export declare const SandboxWorkspaceTransferBundleSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-sandbox-workspace-transfer/1">;
    source_handle: z.ZodObject<{
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
    policy: z.ZodObject<{
        contract: z.ZodLiteral<"sandbox-workspace-policy/1">;
        source_max_bytes: z.ZodNumber;
        scratch_max_bytes: z.ZodNumber;
        outputs: z.ZodArray<z.ZodObject<{
            path: z.ZodString;
            max_bytes: z.ZodNumber;
        }, z.core.$strict>>;
        retention_ms: z.ZodNumber;
    }, z.core.$strict>;
    entries: z.ZodArray<z.ZodObject<{
        zone: z.ZodEnum<{
            sources: "sources";
            scratch: "scratch";
            outputs: "outputs";
        }>;
        path: z.ZodString;
        content_hash: z.ZodString;
        bytes: z.ZodNumber;
        mode: z.ZodNumber;
        content_base64: z.ZodString;
    }, z.core.$strict>>;
    logical_bytes: z.ZodNumber;
    sealed_at: z.ZodString;
    content_ref: z.ZodString;
}, z.core.$strict>;
export type SandboxWorkspaceTransferBundle = z.infer<typeof SandboxWorkspaceTransferBundleSchema>;
export interface SandboxWorkspaceRunTransferPort {
    exportGeneration(reference: {
        tenant: string;
        run_id: string;
        profile_ref: string;
        workspace_handle: string;
        generation: number;
    }): Promise<SandboxWorkspaceTransferBundle>;
    importGeneration(bundle: SandboxWorkspaceTransferBundle): Promise<SandboxWorkspaceHandle>;
}
export declare function deriveSandboxWorkspaceIdentity(handle: Omit<SandboxWorkspaceHandle, 'identity_ref'>): string;
export declare function sandboxWorkspaceHandleHasValidIdentity(handle: SandboxWorkspaceHandle): boolean;
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
