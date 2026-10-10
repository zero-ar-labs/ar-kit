import type { OperationClass, ToolDisclosureClass, TrustTier } from '@zero-ar/contracts';
export interface Schema<T> {
    readonly json: Record<string, unknown>;
    parse(value: unknown, path?: string): T;
}
export declare function string(options?: {
    description?: string;
}): Schema<string>;
export declare function number(options?: {
    description?: string;
}): Schema<number>;
export declare function boolean(options?: {
    description?: string;
}): Schema<boolean>;
export declare function integer(options?: {
    description?: string;
    minimum?: number;
    maximum?: number;
}): Schema<number>;
export declare function enumOf<const V extends readonly (string | number | boolean)[]>(values: V, options?: {
    description?: string;
}): Schema<V[number]>;
export declare function array<T>(items: Schema<T>, options?: {
    description?: string;
    minItems?: number;
    maxItems?: number;
}): Schema<T[]>;
export declare function nullable<T>(schema: Schema<T>): Schema<T | null>;
export interface OptionalSchema<T> extends Schema<T> {
    readonly optional: true;
}
export declare function optional<T>(schema: Schema<T>): OptionalSchema<T>;
type Shape = Record<string, Schema<unknown>>;
type RequiredKeys<S extends Shape> = {
    [K in keyof S]: S[K] extends {
        optional: true;
    } ? never : K;
}[keyof S];
type OptionalKeys<S extends Shape> = {
    [K in keyof S]: S[K] extends {
        optional: true;
    } ? K : never;
}[keyof S];
type Infer<S extends Shape> = {
    [K in RequiredKeys<S>]: S[K] extends Schema<infer T> ? T : never;
} & {
    [K in OptionalKeys<S>]?: S[K] extends Schema<infer T> ? T : never;
};
export declare function object<S extends Shape>(shape: S, options?: {
    description?: string;
}): Schema<Infer<S>>;
export interface ToolContext {
    readonly run_id: string;
    readonly invoke_id: string;
    readonly signal: AbortSignal;
    readonly deadline_ms: number;
}
export interface ToolDefinition<I = unknown, O = unknown> {
    name: string;
    version: string;
    description: string;
    input: Schema<I>;
    output: Schema<O>;
    operationClass: OperationClass;
    isolation: TrustTier;
    cost?: {
        denomination: 'bytes' | 'compute_ms';
        maximum: number;
    };
    timeout_ms?: number;
    disclosure?: {
        purpose?: string;
        use_when?: string;
        do_not_use_when?: string;
        cost?: ToolDisclosureClass;
        latency?: ToolDisclosureClass;
        result_size?: ToolDisclosureClass;
        preactivate?: boolean;
    };
    execute(input: I, context: ToolContext): Promise<O> | O;
}
export interface ToolManifest {
    kind: 'tool';
    name: string;
    version: string;
    description: string;
    input_schema: Record<string, unknown>;
    output_schema: Record<string, unknown>;
    operation_class: OperationClass;
    isolation: TrustTier;
    cost: {
        denomination: 'bytes' | 'compute_ms';
        enforced_max: number;
    } | null;
    timeout_ms: number | null;
    disclosure?: ToolDefinition['disclosure'];
}
export interface HostedTool {
    name: string;
    version: string;
    manifest: ToolManifest;
    manifest_ref: string;
    timeout_ms?: number;
    parseInput(value: unknown): unknown;
    parseOutput(value: unknown): unknown;
    run(input: unknown, context: ToolContext): Promise<unknown> | unknown;
}
export interface DefinedTool<I = unknown, O = unknown> extends ToolDefinition<I, O>, HostedTool {
}
export declare function defineTool<I, O>(definition: ToolDefinition<I, O>): DefinedTool<I, O>;
export interface ToolHostRequest {
    invoke_id: string;
    run_id: string;
    tool: string;
    input: Record<string, unknown>;
    timeout_ms?: number;
}
export interface ToolHostResponse {
    invoke_id: string;
    ok: boolean;
    output?: Record<string, unknown>;
    error?: string;
    used?: number;
}
export declare function redact(text: string): string;
export declare class ToolHost {
    readonly tools: Map<string, HostedTool>;
    constructor(tools: HostedTool[]);
    handshake(): {
        protocol: string;
        tools: {
            name: string;
            version: string;
            manifest_ref: string;
        }[];
    };
    health(): {
        ready: true;
        tools: number;
    };
    invoke(request: ToolHostRequest, signal?: AbortSignal): Promise<ToolHostResponse>;
    stdio(streams?: {
        input?: NodeJS.ReadableStream;
        output?: NodeJS.WritableStream;
    }): Promise<void>;
}
export declare function serveTools(options: {
    tools: HostedTool[];
}): ToolHost;
export declare function conformance(tool: HostedTool, samples: {
    input: unknown;
    ok: boolean;
}[]): Promise<{
    passed: number;
    failed: {
        input: unknown;
        reason: string;
    }[];
}>;
export {};
