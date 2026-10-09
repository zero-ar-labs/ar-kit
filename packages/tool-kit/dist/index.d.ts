/**
 * @zero-ar/tool-kit: one typed tool definition and its development host.
 *
 * What this is: defineTool derives the model schema, the runtime
 * validation, the documentation, the fixtures and the handler typing from
 * one authoritative schema, and serveTools runs those handlers over the
 * admitted out-of-process protocol (DXI-019, DXI-021).
 *
 * How it fits: a handler defined here never enters an agent declaration
 * and never executes inside zero-ar-server. The toolkit reaches no
 * runtime package, holds no effect credential, and cannot commit a
 * receipt; publication and the tool host decide what actually runs
 * (DXI-020).
 */
import type { OperationClass, ToolDisclosureClass, TrustTier } from '@zero-ar/contracts';
/** A schema node that carries its own TypeScript type. */
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
/** One of a fixed list of strings, numbers or booleans. */
export declare function enumOf<const V extends readonly (string | number | boolean)[]>(values: V, options?: {
    description?: string;
}): Schema<V[number]>;
export declare function array<T>(items: Schema<T>, options?: {
    description?: string;
    minItems?: number;
    maxItems?: number;
}): Schema<T[]>;
/** The value, or null. A primitive keeps one type list; anything else becomes a choice with null. */
export declare function nullable<T>(schema: Schema<T>): Schema<T | null>;
/** A field an object may leave out. It is not required, and a value given is checked as the schema says. */
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
/**
 * An object with exactly these fields. The required list keeps the order the
 * fields are written in, which is the order a model sees and fills them, and
 * leaves out each optional field.
 */
export declare function object<S extends Shape>(shape: S, options?: {
    description?: string;
}): Schema<Infer<S>>;
/** What one call may know about the run it serves. It carries no credential. */
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
    /** Development handler. Publication carries the contract; a host runs this out of process. */
    execute(input: I, context: ToolContext): Promise<O> | O;
}
/** The published half: contract only, with no handler and no host detail. */
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
/**
 * The erased view a host serves: the contract, the declared bounds, and
 * three functions that validate and run without the caller knowing the
 * definition's types. One definition satisfies both views at once.
 */
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
/**
 * One definition, every surface. The manifest is what publishes; the
 * handler stays here and runs only in an admitted host.
 */
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
    /** The version handshake a host answers before any call. */
    handshake(): {
        protocol: string;
        tools: {
            name: string;
            version: string;
            manifest_ref: string;
        }[];
    };
    /** Liveness only. It states nothing about a call in flight. */
    health(): {
        ready: true;
        tools: number;
    };
    /**
     * One call: validate against the declared schema, enforce the deadline
     * and cancellation, and answer with a typed envelope either way. A
     * handler that throws is an error result, never a host crash.
     */
    invoke(request: ToolHostRequest, signal?: AbortSignal): Promise<ToolHostResponse>;
    /** Serve the same definitions over JSON lines, the way a host is launched. */
    stdio(streams?: {
        input?: NodeJS.ReadableStream;
        output?: NodeJS.WritableStream;
    }): Promise<void>;
}
/** One host builder over any number of typed definitions. */
export declare function serveTools(options: {
    tools: HostedTool[];
}): ToolHost;
/**
 * The conformance fixtures a definition generates for itself: the schema
 * refuses what it does not declare, and the handler answers its own
 * declared shape. A developer runs these before publishing.
 */
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
