/**
 * Authenticated MCP projection over native Zero-AR work.
 *
 * What this is: the minimal work-entrypoint server for MCP 2026-07-28 and
 * the Tasks extension. The official SDK serves discovery and catalogue
 * operations. A narrow HTTP shim serves the extension methods that SDK 2.0.0
 * does not dispatch.
 *
 * How it fits: every task id resolves to a native run, and every mutation is
 * a native client command. Restarting this package loses no work because it
 * stores no task, quality, effect, cancellation, or artifact state.
 */
import type { ZeroARClient } from '@zero-ar/client';
import type { McpPublishedWorkEntrypoint } from '@zero-ar/contracts';
type NativeWorkClient = Pick<ZeroARClient, 'createDeferredRun' | 'snapshot' | 'result' | 'records' | 'control' | 'resumeDeferred'>;
export interface ZeroARMcpRequestContext {
    /** Derived from the authenticated channel by the native server. */
    tenant: string;
    /** Derived from the authenticated channel by the native server. */
    principal: string;
    /** A tenant-bound native client. The MCP body cannot replace it. */
    native: NativeWorkClient;
}
export interface ZeroARMcpServerLimits {
    request_bytes: number;
    resource_bytes: number;
    header_bytes: number;
    json_depth: number;
    schema_depth: number;
    string_bytes: number;
    list_items: number;
    page_size: number;
    poll_interval_ms: number;
}
export interface ZeroARMcpServerOptions {
    tenant: string;
    binding_ref: string;
    entrypoints: readonly McpPublishedWorkEntrypoint[];
    limits?: Partial<ZeroARMcpServerLimits>;
}
export interface ZeroARMcpHttpHandler {
    fetch(request: Request, context?: ZeroARMcpRequestContext): Promise<Response>;
    close(): Promise<void>;
}
export declare function createZeroARMcpServer(options: ZeroARMcpServerOptions): ZeroARMcpHttpHandler;
export declare const ZERO_AR_MCP_PROTOCOL_REGISTRY: Readonly<{
    format: "zero-ar-interop-registry/1";
    entries: ({
        protocol: "mcp";
        direction: "server";
        implementation: string;
        implementation_version: string;
        protocol_versions: string[];
        extensions: string[];
        sdk_packages: {
            '@modelcontextprotocol/server': string;
            '@modelcontextprotocol/client': string;
        };
        conformance_evidence: string[];
        known_deviations: string[];
        retirement_date: null;
    } | {
        protocol: "mcp";
        direction: "client";
        implementation: string;
        implementation_version: string;
        protocol_versions: string[];
        extensions: string[];
        sdk_packages: {
            '@modelcontextprotocol/client': string;
            '@modelcontextprotocol/server'?: undefined;
        };
        conformance_evidence: string[];
        known_deviations: string[];
        retirement_date: null;
    })[];
}>;
export {};
