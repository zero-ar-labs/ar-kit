/**
 * The public deterministic model adapter for tests.
 *
 * Junior guide: test suites need a model that never calls a provider and
 * always gives the same answer for the same transcript. This file keeps that
 * adapter inside `@zero-ar/testkit`, so public test fixtures do not import a
 * private runtime package.
 */
import type { ModelAdapter, ModelRequest, ModelStreamEvent } from '@zero-ar/contracts';
export interface ScriptTurn {
    /** Text streamed as deltas. */
    say?: string;
    /** Hand part of the objective to a fresh context. */
    sub_run?: {
        objective: string;
    };
    /** Propose a tool call. The runtime routes and governs it. */
    tool?: {
        name: string;
        input: Record<string, unknown>;
    };
    /** Emit results for these items before anything else. */
    items?: {
        item_id: string;
        output: string;
        reads?: string[];
    }[];
    /** Propose completion with this artifact text after saying anything above. */
    propose?: string;
    /** Milliseconds between delta chunks, for cancellation and redirect tests. */
    delay_ms?: number;
    /** How many chunks to split the text into. */
    chunks?: number;
    /** Stream an in-band provider failure instead of finishing the turn. */
    fail?: {
        code: string;
        message: string;
    };
}
export interface ScriptedOptions {
    /** Items processed per turn in the default work mode. */
    batch?: number;
    /** Item ids that produce an empty output once, then a clean retry. */
    corrupt_once?: string[];
    /** Item ids that produce an empty output every time. */
    corrupt_always?: string[];
    /** Inject one in-band provider failure on this stream call, then recover. */
    fail_on_call?: number;
    /** Every listed call index answers with a provider failure. */
    fail_calls?: number[];
}
export declare class ScriptedAdapter implements ModelAdapter {
    readonly name = "scripted";
    readonly version = "1.0.0";
    readonly model_ref = "scripted/deterministic";
    readonly outbound_url: null;
    /** Total stream calls, so tests can assert reconstruction called nothing. */
    calls: number;
    private readonly script;
    private readonly batch;
    private readonly corruptOnce;
    private readonly corruptAlways;
    private readonly failOnCall;
    private readonly failCalls;
    constructor(script?: ScriptTurn[], options?: ScriptedOptions);
    stream(request: ModelRequest, signal: AbortSignal): AsyncGenerator<ModelStreamEvent, void, void>;
    private defaultTurn;
}
