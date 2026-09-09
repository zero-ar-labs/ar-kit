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
import { refuse } from "./diagnostics.js";
/** Refuse an adapter call that is not tied to the kernel's durable run step. */
export function assertRunOwnedModelRequest(request) {
    const ownership = request.ownership;
    const malformedTool = !Array.isArray(request.tools) || request.tools.some((tool) => (!tool.name
        || !tool.description
        || !tool.input_schema
        || typeof tool.input_schema !== 'object'
        || Array.isArray(tool.input_schema)
        || tool.input_schema['type'] !== 'object'));
    if (!ownership?.run_id || !ownership.call_id || !ownership.context_ref || !ownership.lease_id || !request.model_ref || request.messages.length === 0 || request.max_output_tokens <= 0 || malformedTool) {
        refuse({
            code: 'model.call.unowned',
            message: 'the model adapter call is missing its run id, call id, pinned model, context ref, budget lease, or valid tool closure. Only the runtime-owned loop may invoke an admitted adapter.',
            clause: 'PUB-038',
        });
    }
}
/**
 * Token estimation for budgeting and context bounds. An approximation that
 * says so: four characters per token, rounded up (the brand's rule that
 * numbers are honest or absent applies to estimates by naming them).
 */
export function approxTokens(text) {
    return Math.ceil(text.length / 4);
}
