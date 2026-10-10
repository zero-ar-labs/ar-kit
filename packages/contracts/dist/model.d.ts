import type { ImageMediaType, ModelControlOperationKind, ModelImageInput, ModelUsageMeasurement, ToolViewSelectionReason } from './vocab.js';
export type NeutralContentPart = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    media_type: ImageMediaType;
    data_base64: string;
    content_hash: string;
};
export interface NeutralToolCall {
    call_id: string;
    name: string;
    input: Record<string, unknown>;
}
export interface NeutralToolResult {
    call_id: string;
    name: string;
}
export type NeutralMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string | NeutralContentPart[];
    tool_calls?: NeutralToolCall[];
} | {
    role: 'tool';
    content: string | NeutralContentPart[];
    tool_result: NeutralToolResult;
};
export declare function messageText(content: NeutralMessage['content']): string;
export declare function messageImageCount(content: NeutralMessage['content']): number;
export interface ModelToolSchema {
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
    strict?: boolean;
}
export interface ModelControlOperation extends ModelToolSchema {
    kind: ModelControlOperationKind;
}
export declare const TOOL_CATALOGUE_OPERATIONS: readonly ["tool.search", "tool.describe", "tool.activate"];
export type ToolCatalogueOperation = (typeof TOOL_CATALOGUE_OPERATIONS)[number];
export type ToolDisclosureClass = 'small' | 'medium' | 'large' | 'unknown';
export interface ToolCatalogueDescriptor {
    name: string;
    purpose: string;
    use_when: string;
    do_not_use_when: string;
    operation_class: 'observation' | 'run-internal' | 'effect-proposal';
    expected_cost: ToolDisclosureClass;
    expected_latency: ToolDisclosureClass;
    expected_result_size: ToolDisclosureClass;
    contract_ref: string;
    visible: boolean;
}
export interface ModelToolViewRecord {
    schema: 'zero-ar-tool-view/1';
    ref: string;
    closure_size: number;
    budget: {
        schema_tokens: number;
        schema_bytes: number;
    };
    used: {
        schema_tokens: number;
        schema_bytes: number;
    };
    visible: {
        name: string;
        contract_ref: string;
        reason: ToolViewSelectionReason;
    }[];
    hidden: number;
    refusals: {
        code: string;
        message: string;
        alternatives: string[];
    }[];
}
export interface ModelRequest {
    model_ref: string;
    messages: NeutralMessage[];
    tools: ModelToolSchema[];
    control_operations?: ModelControlOperation[];
    max_output_tokens: number;
    ownership: {
        run_id: string;
        call_id: string;
        context_ref: string;
        lease_id: string;
    };
}
export declare function assertRunOwnedModelRequest(request: ModelRequest): void;
export type ModelStreamEvent = ({
    type: 'text_delta';
    text: string;
} | {
    type: 'item_result';
    call_id: string;
    operation: string;
    input: Record<string, unknown>;
    item_id: string;
    output: unknown;
    reads?: string[];
} | {
    type: 'sub_run';
    objective: string;
} | {
    type: 'tool_call';
    call_id: string;
    tool: string;
    input: Record<string, unknown>;
} | {
    type: 'completion_proposal';
    call_id: string;
    operation: string;
    input: Record<string, unknown>;
    artifact_text: string;
} | {
    type: 'question_proposal';
    call_id: string;
    operation: string;
    input: Record<string, unknown>;
} | {
    type: 'usage';
    input_tokens: number;
    output_tokens: number;
    measurement?: ModelUsageMeasurement;
} | {
    type: 'stop';
    reason: 'end_turn' | 'completion_proposal' | 'max_output';
} | {
    type: 'provider_failure';
    code: string;
    message: string;
}) & {
    extensions?: Record<string, unknown>;
};
export interface ModelAdapter {
    readonly name: string;
    readonly version: string;
    readonly model_ref: string;
    readonly outbound_url: string | null;
    readonly image_input?: ModelImageInput;
    readonly input_token_overhead?: number;
    readonly max_output_tokens?: number;
    readonly context_window?: number;
    countInputTokens?(request: Pick<ModelRequest, 'messages' | 'tools' | 'control_operations'>, signal: AbortSignal): Promise<number | null>;
    stream(request: ModelRequest, signal: AbortSignal): AsyncGenerator<ModelStreamEvent, void, void>;
}
export declare function adapterAcceptsImages(adapter: Pick<ModelAdapter, 'image_input'>): boolean;
export declare function approxTokens(text: string): number;
export declare const MESSAGE_FRAME_TOKENS = 16;
export declare const TOOL_FRAME_TOKENS = 64;
export declare const DEFAULT_INPUT_TOKEN_OVERHEAD = 2048;
export declare function inputTokenBound(request: Pick<ModelRequest, 'messages' | 'tools'> & Partial<Pick<ModelRequest, 'control_operations'>>, overhead?: number): number;
export interface ImageInputLimits {
    max_image_bytes: number;
    max_images_per_turn: number;
}
export declare const IMAGE_INPUT_DEFAULTS: Readonly<ImageInputLimits>;
export declare const IMAGE_TOKENS_UNREAD = 1600;
export declare function isImageMediaType(media_type: string): media_type is ImageMediaType;
export declare function imageDimensions(bytes: Uint8Array): {
    width: number;
    height: number;
} | null;
export declare function imageTokens(dimensions: {
    width: number;
    height: number;
} | null): number;
