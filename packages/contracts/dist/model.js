import { refuse } from "./diagnostics.js";
import { IMAGE_MEDIA_TYPES } from "./vocab.js";
function validToolCallId(value) {
    return value.length > 0 && value.length <= 512 && !/[\u0000-\u001f\u007f]/.test(value);
}
export function messageText(content) {
    if (typeof content === 'string')
        return content;
    return content.flatMap((part) => (part.type === 'text' ? [part.text] : [])).join('\n');
}
export function messageImageCount(content) {
    return typeof content === 'string' ? 0 : content.filter((part) => part.type === 'image').length;
}
export const TOOL_CATALOGUE_OPERATIONS = ['tool.search', 'tool.describe', 'tool.activate'];
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
export function adapterAcceptsImages(adapter) {
    return adapter.image_input === 'supported';
}
export function approxTokens(text) {
    return Math.ceil(text.length / 4);
}
export const MESSAGE_FRAME_TOKENS = 16;
export const TOOL_FRAME_TOKENS = 64;
export const DEFAULT_INPUT_TOKEN_OVERHEAD = 2_048;
const utf8 = new TextEncoder();
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
export const IMAGE_INPUT_DEFAULTS = Object.freeze({
    max_image_bytes: 3_750_000,
    max_images_per_turn: 8,
});
export const IMAGE_TOKENS_UNREAD = 1_600;
const IMAGE_LONG_EDGE_MAX = 1_568;
export function isImageMediaType(media_type) {
    return IMAGE_MEDIA_TYPES.includes(media_type);
}
export function imageDimensions(bytes) {
    const at = (index) => bytes[index] ?? 0;
    const be16 = (index) => (at(index) << 8) | at(index + 1);
    const le16 = (index) => at(index) | (at(index + 1) << 8);
    const le24 = (index) => at(index) | (at(index + 1) << 8) | (at(index + 2) << 16);
    const be32 = (index) => ((at(index) << 24) >>> 0) + ((at(index + 1) << 16) | (at(index + 2) << 8) | at(index + 3));
    const ascii = (index, length) => String.fromCharCode(...bytes.subarray(index, index + length));
    const sized = (width, height) => (width > 0 && height > 0 ? { width, height } : null);
    if (bytes.length >= 24 && at(0) === 0x89 && ascii(1, 3) === 'PNG' && ascii(12, 4) === 'IHDR') {
        return sized(be32(16), be32(20));
    }
    if (bytes.length >= 10 && (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a')) {
        return sized(le16(6), le16(8));
    }
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
export function imageTokens(dimensions) {
    if (!dimensions)
        return IMAGE_TOKENS_UNREAD;
    const long = Math.max(dimensions.width, dimensions.height);
    const scale = long > IMAGE_LONG_EDGE_MAX ? IMAGE_LONG_EDGE_MAX / long : 1;
    const width = Math.max(1, Math.round(dimensions.width * scale));
    const height = Math.max(1, Math.round(dimensions.height * scale));
    return Math.ceil((width * height) / 750);
}
