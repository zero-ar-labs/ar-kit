import type { FetchLike } from '@modelcontextprotocol/client';
import type { InteropBindingManifest, McpPeerSnapshot } from '@zero-ar/contracts';
export interface McpCredentialResolutionContext {
    tenant: string;
    binding_ref: string;
    destination_ref: string;
    signal: AbortSignal;
}
export interface McpCredentialResolver {
    resolve(authenticationRef: string, context: McpCredentialResolutionContext): Promise<string>;
}
export interface McpEgressContext {
    tenant: string;
    binding_ref: string;
    destination_ref: string;
    response_bytes: number;
    timeout_ms: number;
}
export interface McpEgressPort {
    fetch(request: Request, context: McpEgressContext): Promise<Response>;
}
export interface DiscoverMcpPeerOptions {
    binding: InteropBindingManifest;
    authenticated_peer: string;
    credentials: McpCredentialResolver;
    egress: McpEgressPort;
    now?: () => Date;
}
export declare function admittedMcpFetch(binding: InteropBindingManifest & {
    connection: {
        kind: 'endpoint';
        endpoint: string;
        destination_ref: string;
    };
}, egress: McpEgressPort): FetchLike;
export declare function discoverMcpPeer(options: DiscoverMcpPeerOptions): Promise<McpPeerSnapshot>;
export declare const ZERO_AR_MCP_CLIENT_CAPABILITIES: Readonly<{
    protocol_version: "2026-07-28";
    understood_extensions: string[];
    imports: string[];
    prompts: "omitted";
}>;
