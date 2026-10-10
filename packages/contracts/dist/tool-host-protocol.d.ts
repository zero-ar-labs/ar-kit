import type { TrustTier } from './vocab.js';
export declare const TOOL_HOST_PROTOCOL = "zero-ar-tool-host/1";
export interface ToolHostEgressContext {
    tenant: string;
    run_id: string;
    tool_call_id: string;
    binding_ref: string;
    profile_ref: string;
    trust_tier: Exclude<TrustTier, 'none'>;
}
export interface ToolHostInvocation {
    invoke_id: string;
    tool: string;
    input: Record<string, unknown>;
    run_id?: string;
    tenant?: string;
    tool_call_id?: string;
    binding_ref?: string;
    profile_ref?: string;
    trust_tier?: Exclude<TrustTier, 'none'>;
    timeout_ms?: number;
}
export interface ToolHostControlInvocation {
    invoke_id: string;
    op: string;
    input?: Record<string, unknown>;
    timeout_ms?: number;
}
export interface ToolHostProtocolError {
    invoke_id: string;
    ok: false;
    error: string;
}
export type ParsedToolHostRequest = ToolHostInvocation | ToolHostControlInvocation;
export interface ToolHostParseOptions {
    allowed_ops?: readonly string[];
    require_run_id?: boolean;
}
export declare function isToolHostProtocolError(value: ParsedToolHostRequest | ToolHostProtocolError): value is ToolHostProtocolError;
export declare function parseToolHostLine(line: string, options?: ToolHostParseOptions): ParsedToolHostRequest | ToolHostProtocolError;
export declare function parseToolHostRequest(value: unknown, options?: ToolHostParseOptions): ParsedToolHostRequest | ToolHostProtocolError;
