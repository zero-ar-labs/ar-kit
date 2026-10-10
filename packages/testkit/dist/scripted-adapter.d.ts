import type { ModelAdapter, ModelImageInput, ModelRequest, ModelStreamEvent } from '@zero-ar/contracts';
export interface ScriptTurn {
    say?: string;
    sub_run?: {
        objective: string;
    };
    tool?: {
        name: string;
        input: Record<string, unknown>;
    };
    items?: {
        item_id: string;
        output: string;
        reads?: string[];
    }[];
    ask?: {
        item_id: string;
        question: string;
        why: string;
        choices?: string[];
        allow_other?: boolean;
    };
    propose?: string;
    delay_ms?: number;
    chunks?: number;
    fail?: {
        code: string;
        message: string;
    };
}
export interface ScriptedOptions {
    batch?: number;
    corrupt_once?: string[];
    corrupt_always?: string[];
    fail_on_call?: number;
    fail_calls?: number[];
    image_input?: ModelImageInput;
}
export declare class ScriptedAdapter implements ModelAdapter {
    readonly name = "scripted";
    readonly version = "1.0.0";
    readonly model_ref = "scripted/deterministic";
    readonly outbound_url: null;
    readonly image_input: ModelImageInput;
    calls: number;
    readonly image_counts: number[];
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
