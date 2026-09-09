/**
 * The neutral model contract.
 *
 * What this is: the one message shape, request shape, and stream event
 * vocabulary every model adapter speaks (KRN-021). Adapters translate a
 * provider's wire format into these and nothing else reaches the kernel.
 *
 * How it fits: provider failures arrive in band as a stream event that
 * terminates the turn with a well-formed partial message; adapter defects
 * throw and are never dressed as provider errors (X-3, KRN-022, KRN-023).
 * A completion proposal is a stream event too: a real adapter maps its
 * provider's propose-completion tool call onto it, the scripted adapter
 * emits it directly, and the kernel treats both identically. The loop
 * belongs to the runtime; an adapter only streams (C-ARCH-LOOP-OWNED-002).
 */
import type { ModelUsageMeasurement } from './vocab.js';
export interface NeutralMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
/** One provider-neutral callable tool from the run's immutable closure. */
export interface ModelToolSchema {
    /** Canonical Zero-AR name. Adapters translate provider name limits internally. */
    name: string;
    description: string;
    /** The one JSON Schema object published for model description and runtime use. */
    input_schema: Record<string, unknown>;
}
export interface ModelRequest {
    model_ref: string;
    messages: NeutralMessage[];
    /** Only tools pinned into this run's resolved manifest. */
    tools: ModelToolSchema[];
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
    item_id: string;
    output: string;
    reads?: string[];
} | {
    type: 'sub_run';
    objective: string;
} | {
    type: 'tool_call';
    tool: string;
    input: Record<string, unknown>;
} | {
    type: 'completion_proposal';
    artifact_text: string;
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
    stream(request: ModelRequest, signal: AbortSignal): AsyncGenerator<ModelStreamEvent, void, void>;
}
/**
 * Token estimation for budgeting and context bounds. An approximation that
 * says so: four characters per token, rounded up (the brand's rule that
 * numbers are honest or absent applies to estimates by naming them).
 */
export declare function approxTokens(text: string): number;
