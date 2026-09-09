/**
 * Bounded MCP peer discovery client.
 *
 * What this is: the network edge that reads one fresh MCP catalogue through
 * an admitted egress port and compiles it into an immutable peer snapshot.
 *
 * How it fits: credential bytes exist only during each outbound request.
 * Discovery remains observation. Publication and admission happen later in
 * the import compiler, and active runs pin those separately reviewed refs.
 */
import type { FetchLike } from '@modelcontextprotocol/client';
import type { InteropBindingManifest, McpPeerSnapshot } from '@zero-ar/contracts';
export interface McpCredentialResolutionContext {
    tenant: string;
    binding_ref: string;
    destination_ref: string;
    signal: AbortSignal;
}
export interface McpCredentialResolver {
    /** Resolve the named secret for this request. Do not cache the returned bytes. */
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
    /** Send one already bounded request through the deployment's admitted egress boundary. */
    fetch(request: Request, context: McpEgressContext): Promise<Response>;
}
export interface DiscoverMcpPeerOptions {
    binding: InteropBindingManifest;
    authenticated_peer: string;
    credentials: McpCredentialResolver;
    egress: McpEgressPort;
    now?: () => Date;
}
/** Build the one bounded fetch function shared by discovery and invocation. */
export declare function admittedMcpFetch(binding: InteropBindingManifest & {
    connection: {
        kind: 'endpoint';
        endpoint: string;
        destination_ref: string;
    };
}, egress: McpEgressPort): FetchLike;
/** Discover one fresh peer catalogue and return only its immutable normalized snapshot. */
export declare function discoverMcpPeer(options: DiscoverMcpPeerOptions): Promise<McpPeerSnapshot>;
/** The first client release supports the core revision and optional Tasks metadata. */
export declare const ZERO_AR_MCP_CLIENT_CAPABILITIES: Readonly<{
    protocol_version: "2026-07-28";
    understood_extensions: string[];
    imports: string[];
    prompts: "omitted";
}>;
