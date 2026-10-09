/**
 * The neutral model contract.
 *
 * What this is: the one message shape, request shape, and stream event
 * vocabulary every model adapter speaks (KRN-021). Adapters translate a
 * provider's wire format into these and nothing else reaches the kernel.
 * A message is text, or text and image parts; the token estimators for
 * both live here (WBR-007, WBR-013).
 *
 * How it fits: provider failures arrive in band as a stream event that
 * terminates the turn with a well-formed partial message; adapter defects
 * throw and are never dressed as provider errors (X-3, KRN-022, KRN-023).
 * A completion proposal is a stream event too: a real adapter maps its
 * provider's propose-completion tool call onto it, the scripted adapter
 * emits it directly, and the kernel treats both identically. The loop
 * belongs to the runtime; an adapter only streams (C-ARCH-LOOP-OWNED-002).
 */
import type { ImageMediaType, ModelControlOperationKind, ModelImageInput, ModelUsageMeasurement, ToolViewSelectionReason } from './vocab.js';
/** One part of a message: text, or one image's bytes with the digest they were checked against. */
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
    /** Provider id when one was valid, otherwise a deterministic run-owned id. */
    call_id: string;
    /** Canonical Zero-AR name. Adapters translate provider name limits internally. */
    name: string;
    /** The exact parsed JSON object emitted for this call. */
    input: Record<string, unknown>;
}
export interface NeutralToolResult {
    call_id: string;
    name: string;
}
export type NeutralMessage = {
    role: 'system' | 'user' | 'assistant';
    /** Plain text, or parts when the message carries images. */
    content: string | NeutralContentPart[];
    /** Calls emitted together in this assistant turn, in provider order. */
    tool_calls?: NeutralToolCall[];
} | {
    role: 'tool';
    /** Tool results are canonical JSON or bounded plain text. */
    content: string | NeutralContentPart[];
    tool_result: NeutralToolResult;
};
/** The text a message carries: the string itself, or its text parts joined by newlines. */
export declare function messageText(content: NeutralMessage['content']): string;
/** How many image parts a message carries. */
export declare function messageImageCount(content: NeutralMessage['content']): number;
/** One provider-neutral callable tool from the run's immutable closure. */
export interface ModelToolSchema {
    /** Canonical Zero-AR name. Adapters translate provider name limits internally. */
    name: string;
    description: string;
    /** The one JSON Schema object published for model description and runtime use. */
    input_schema: Record<string, unknown>;
    /** Whether the schema is compatible with and requests provider strict mode. */
    strict?: boolean;
}
/** One runtime-owned control operation. Omission from a request hides it. */
export interface ModelControlOperation extends ModelToolSchema {
    kind: ModelControlOperationKind;
}
/** Runtime-local catalogue operations. They inspect visibility, never capability. */
export declare const TOOL_CATALOGUE_OPERATIONS: readonly ["tool.search", "tool.describe", "tool.activate"];
export type ToolCatalogueOperation = (typeof TOOL_CATALOGUE_OPERATIONS)[number];
export type ToolDisclosureClass = 'small' | 'medium' | 'large' | 'unknown';
/** Compact, provider-neutral metadata for one contract already pinned to a run. */
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
/** Canonical record of exactly what one model call could see. */
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
    /** Only tools pinned into this run's resolved manifest. */
    tools: ModelToolSchema[];
    /**
     * Runtime-owned operations for completion and item submission. When this
     * field is absent, adapters expose their version-one defaults. When it is
     * present, adapters expose exactly these operations, including none.
     */
    control_operations?: ModelControlOperation[];
    max_output_tokens: number;
    /** Durable run ownership committed before the adapter may egress. */
    ownership: {
        run_id: string;
        call_id: string;
        context_ref: string;
        lease_id: string;
    };
}
/** Refuse an adapter call that is not tied to the kernel's durable run step. */
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
}
/** A question the model proposes to a person. The kernel decides whether it is asked. */
 | {
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
    /** Reference this adapter serves, for example scripted/deterministic. */
    readonly model_ref: string;
    /** Exact outbound URL checked by the kernel, or null for local adapters. */
    readonly outbound_url: string | null;
    /** Whether this adapter sends image parts to its model. Absent means text only (WBR-007). */
    readonly image_input?: ModelImageInput;
    /**
     * The tokens this adapter adds to a request beyond its messages and the
     * run's tools, at most: its own control tools and the provider's tool
     * prompt. Absent holds a remote adapter to DEFAULT_INPUT_TOKEN_OVERHEAD
     * and a local one, which reaches no provider, to none.
     */
    readonly input_token_overhead?: number;
    /**
     * The most output tokens one call may ask this adapter's model for, as
     * the model's catalogue entry declares it. The kernel asks for this many,
     * up to the deployment's ceiling. Absent leaves the call to that ceiling
     * or the kernel default.
     */
    readonly max_output_tokens?: number;
    /**
     * The model's context window in tokens, as its catalogue entry declares
     * it: what one request's input and output share. The kernel sizes each
     * call's context from it (CTX-003). Absent leaves the call to the
     * deployment's context budget or the kernel default.
     */
    readonly context_window?: number;
    /**
     * The provider's own count of a request's input tokens, when the provider
     * offers one, or null when the count could not be had. The kernel then
     * falls back to the byte bound.
     */
    countInputTokens?(request: Pick<ModelRequest, 'messages' | 'tools' | 'control_operations'>, signal: AbortSignal): Promise<number | null>;
    stream(request: ModelRequest, signal: AbortSignal): AsyncGenerator<ModelStreamEvent, void, void>;
}
/** Whether an adapter declares that its model accepts image parts. */
export declare function adapterAcceptsImages(adapter: Pick<ModelAdapter, 'image_input'>): boolean;
/**
 * Token estimation for budgeting and context bounds. An approximation that
 * says so: four characters per token, rounded up (the brand's rule that
 * numbers are honest or absent applies to estimates by naming them).
 */
export declare function approxTokens(text: string): number;
/** Tokens a provider can add around one message for its role and turn markers, at most. */
export declare const MESSAGE_FRAME_TOKENS = 16;
/** Tokens a provider can add around one tool definition beyond its JSON, at most. */
export declare const TOOL_FRAME_TOKENS = 64;
/** The request overhead an adapter that declares none is held to. */
export declare const DEFAULT_INPUT_TOKEN_OVERHEAD = 2048;
/**
 * An upper bound on the input tokens a provider can count for one request.
 * A byte-level BPE tokenizer, which every admitted provider uses, emits at
 * most one token per UTF-8 byte, so the bytes of each text part and each
 * tool definition bound their tokens. Each image costs what imageTokens
 * names, and framing per message and per tool comes on top of the adapter's
 * own overhead. A reservation sized from it is not exceeded by any count
 * such a tokenizer reports.
 */
export declare function inputTokenBound(request: Pick<ModelRequest, 'messages' | 'tools'> & Partial<Pick<ModelRequest, 'control_operations'>>, overhead?: number): number;
/** The deployment's image bounds: bytes per image and images per window (WBR-013). */
export interface ImageInputLimits {
    max_image_bytes: number;
    max_images_per_turn: number;
}
/** The bounds a deployment gets when it declares none. */
export declare const IMAGE_INPUT_DEFAULTS: Readonly<ImageInputLimits>;
/** The estimate for an image whose header does not yield its dimensions. */
export declare const IMAGE_TOKENS_UNREAD = 1600;
/** Whether a media type is one a model may see as an image. */
export declare function isImageMediaType(media_type: string): media_type is ImageMediaType;
/**
 * The pixel dimensions a PNG, JPEG, GIF or WebP header declares, or null
 * when the bytes are none of these or the header is cut short. It reads the
 * header only and never decodes pixels.
 */
export declare function imageDimensions(bytes: Uint8Array): {
    width: number;
    height: number;
} | null;
/**
 * The model tokens one image costs, by the provider rule this estimate
 * names: scale the long edge to at most 1,568 pixels, then one token per
 * 750 pixels, rounded up. An image whose dimensions cannot be read costs
 * a flat 1,600, which is an estimate and says so.
 */
export declare function imageTokens(dimensions: {
    width: number;
    height: number;
} | null): number;
