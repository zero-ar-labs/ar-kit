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
import { refuse } from "./diagnostics.js";
import { IMAGE_MEDIA_TYPES } from "./vocab.js";
function validToolCallId(value) {
    return value.length > 0 && value.length <= 512 && !/[\u0000-\u001f\u007f]/.test(value);
}
/** The text a message carries: the string itself, or its text parts joined by newlines. */
export function messageText(content) {
    if (typeof content === 'string')
        return content;
    return content.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('\n');
}
/** How many image parts a message carries. */
export function messageImageCount(content) {
    return typeof content === 'string' ? 0 : content.filter((part) => part.type === 'image').length;
}
/** Runtime-local catalogue operations. They inspect visibility, never capability. */
export const TOOL_CATALOGUE_OPERATIONS = ['tool.search', 'tool.describe', 'tool.activate'];
/** Refuse an adapter call that is not tied to the kernel's durable run step. */
export function assertRunOwnedModelRequest(request) {
    const ownership = request.ownership;
    const malformedTool = !Array.isArray(request.tools) || request.tools.some((tool) => (!tool.name
        || !tool.description
        || !tool.input_schema
        || typeof tool.input_schema !== 'object'
        || Array.isArray(tool.input_schema)
        || tool.input_schema['type'] !== 'object'));
    const controls = request.control_operations;
    const malformedControl = controls !== undefined && (!Array.isArray(controls)
        || controls.filter((operation) => operation.kind === 'completion_proposal').length > 1
        || new Set(controls.map((operation) => operation.name)).size !== controls.length
        || controls.some((operation) => (!operation.name
            || !operation.description
            || !operation.input_schema
            || typeof operation.input_schema !== 'object'
            || Array.isArray(operation.input_schema)
            || operation.input_schema['type'] !== 'object')));
    const malformedMessage = !Array.isArray(request.messages) || request.messages.some((message) => (message.role === 'tool'
        ? !validToolCallId(message.tool_result.call_id) || !message.tool_result.name
        : message.role === 'assistant' && message.tool_calls?.some((call) => (!validToolCallId(call.call_id) || !call.name || !call.input || typeof call.input !== 'object' || Array.isArray(call.input)))));
    if (!ownership?.run_id || !ownership.call_id || !ownership.context_ref || !ownership.lease_id || !request.model_ref || request.messages.length === 0 || request.max_output_tokens <= 0 || malformedTool || malformedControl || malformedMessage) {
        refuse({
            code: 'model.call.unowned',
            message: 'the model adapter call is missing its run id, call id, pinned model, context ref, budget lease, or valid tool closure. Only the runtime-owned loop may invoke an admitted adapter.',
            clause: 'PUB-038',
        });
    }
}
/** Whether an adapter declares that its model accepts image parts. */
export function adapterAcceptsImages(adapter) {
    return adapter.image_input === 'supported';
}
/**
 * Token estimation for budgeting and context bounds. An approximation that
 * says so: four characters per token, rounded up (the brand's rule that
 * numbers are honest or absent applies to estimates by naming them).
 */
export function approxTokens(text) {
    return Math.ceil(text.length / 4);
}
/** Tokens a provider can add around one message for its role and turn markers, at most. */
export const MESSAGE_FRAME_TOKENS = 16;
/** Tokens a provider can add around one tool definition beyond its JSON, at most. */
export const TOOL_FRAME_TOKENS = 64;
/** The request overhead an adapter that declares none is held to. */
export const DEFAULT_INPUT_TOKEN_OVERHEAD = 2_048;
const utf8 = new TextEncoder();
/**
 * An upper bound on the input tokens a provider can count for one request.
 * A byte-level BPE tokenizer, which every admitted provider uses, emits at
 * most one token per UTF-8 byte, so the bytes of each text part and each
 * tool definition bound their tokens. Each image costs what imageTokens
 * names, and framing per message and per tool comes on top of the adapter's
 * own overhead. A reservation sized from it is not exceeded by any count
 * such a tokenizer reports.
 */
export function inputTokenBound(request, overhead = DEFAULT_INPUT_TOKEN_OVERHEAD) {
    let tokens = overhead;
    for (const message of request.messages) {
        tokens += MESSAGE_FRAME_TOKENS;
        if (typeof message.content === 'string') {
            tokens += utf8.encode(message.content).byteLength;
            continue;
        }
        for (const part of message.content) {
            tokens += part.type === 'text'
                ? utf8.encode(part.text).byteLength
                : imageTokens(imageDimensions(Uint8Array.from(atob(part.data_base64), (character) => character.charCodeAt(0))));
        }
        if (message.role === 'assistant' && message.tool_calls)
            tokens += utf8.encode(JSON.stringify(message.tool_calls)).byteLength;
        if (message.role === 'tool')
            tokens += utf8.encode(JSON.stringify(message.tool_result)).byteLength;
    }
    for (const tool of request.tools)
        tokens += TOOL_FRAME_TOKENS + utf8.encode(JSON.stringify(tool)).byteLength;
    for (const operation of request.control_operations ?? [])
        tokens += TOOL_FRAME_TOKENS + utf8.encode(JSON.stringify(operation)).byteLength;
    return tokens;
}
/** The bounds a deployment gets when it declares none. */
export const IMAGE_INPUT_DEFAULTS = Object.freeze({
    max_image_bytes: 3_750_000,
    max_images_per_turn: 8,
});
/** The estimate for an image whose header does not yield its dimensions. */
export const IMAGE_TOKENS_UNREAD = 1_600;
/** The longest edge a provider sees before it scales an image down. */
const IMAGE_LONG_EDGE_MAX = 1_568;
/** Whether a media type is one a model may see as an image. */
export function isImageMediaType(media_type) {
    return IMAGE_MEDIA_TYPES.includes(media_type);
}
/**
 * The pixel dimensions a PNG, JPEG, GIF or WebP header declares, or null
 * when the bytes are none of these or the header is cut short. It reads the
 * header only and never decodes pixels.
 */
export function imageDimensions(bytes) {
    const at = (index) => bytes[index] ?? 0;
    const be16 = (index) => (at(index) << 8) | at(index + 1);
    const le16 = (index) => at(index) | (at(index + 1) << 8);
    const le24 = (index) => at(index) | (at(index + 1) << 8) | (at(index + 2) << 16);
    const be32 = (index) => ((at(index) << 24) >>> 0) + ((at(index + 1) << 16) | (at(index + 2) << 8) | at(index + 3));
    const ascii = (index, length) => String.fromCharCode(...bytes.subarray(index, index + length));
    const sized = (width, height) => (width > 0 && height > 0 ? { width, height } : null);
    // PNG: the signature, then the IHDR chunk with big-endian width and height.
    if (bytes.length >= 24 && at(0) === 0x89 && ascii(1, 3) === 'PNG' && ascii(12, 4) === 'IHDR') {
        return sized(be32(16), be32(20));
    }
    // GIF: GIF87a or GIF89a, then the logical screen size, little-endian.
    if (bytes.length >= 10 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) {
        return sized(le16(6), le16(8));
    }
    // WebP: a RIFF container whose first chunk is lossy, lossless or extended.
    if (bytes.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') {
        const chunk = ascii(12, 4);
        if (chunk === 'VP8 ' && at(23) === 0x9d && at(24) === 0x01 && at(25) === 0x2a) {
            return sized(le16(26) & 0x3fff, le16(28) & 0x3fff);
        }
        if (chunk === 'VP8L' && at(20) === 0x2f) {
            const width = 1 + (((at(22) & 0x3f) << 8) | at(21));
            const height = 1 + (((at(24) & 0x0f) << 10) | (at(23) << 2) | ((at(22) & 0xc0) >> 6));
            return sized(width, height);
        }
        if (chunk === 'VP8X')
            return sized(1 + le24(24), 1 + le24(27));
        return null;
    }
    // JPEG: walk the marker segments to the first start-of-frame.
    if (bytes.length >= 4 && at(0) === 0xff && at(1) === 0xd8) {
        let offset = 2;
        while (offset + 3 < bytes.length) {
            if (at(offset) !== 0xff)
                return null;
            const marker = at(offset + 1);
            if (marker === 0xff) {
                offset += 1;
                continue;
            }
            if (marker === 0xd9 || marker === 0xda)
                return null;
            if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
                offset += 2;
                continue;
            }
            const length = be16(offset + 2);
            if (length < 2)
                return null;
            const frame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
            if (frame)
                return offset + 8 < bytes.length ? sized(be16(offset + 7), be16(offset + 5)) : null;
            offset += 2 + length;
        }
    }
    return null;
}
/**
 * The model tokens one image costs, by the provider rule this estimate
 * names: scale the long edge to at most 1,568 pixels, then one token per
 * 750 pixels, rounded up. An image whose dimensions cannot be read costs
 * a flat 1,600, which is an estimate and says so.
 */
export function imageTokens(dimensions) {
    if (!dimensions)
        return IMAGE_TOKENS_UNREAD;
    const long = Math.max(dimensions.width, dimensions.height);
    const scale = long > IMAGE_LONG_EDGE_MAX ? IMAGE_LONG_EDGE_MAX / long : 1;
    const width = Math.max(1, Math.round(dimensions.width * scale));
    const height = Math.max(1, Math.round(dimensions.height * scale));
    return Math.ceil((width * height) / 750);
}
