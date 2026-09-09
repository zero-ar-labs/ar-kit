/**
 * The shared tool-host JSON-lines protocol.
 *
 * What this is: one parser and one protocol label used by runtime hosts,
 * developer hosts, and clients. Bad lines become typed replies, not thrown
 * exceptions, so the host can answer the next admitted call.
 *
 * How it fits: the kernel decides admission and leases before a call
 * reaches this shape. This file only preserves the process-boundary wire
 * contract.
 */
import { TRUST_TIERS } from "./vocab.js";
export const TOOL_HOST_PROTOCOL = 'zero-ar-tool-host/1';
export function isToolHostProtocolError(value) {
    return 'ok' in value;
}
export function parseToolHostLine(line, options = {}) {
    let value;
    try {
        value = JSON.parse(line);
    }
    catch {
        return { invoke_id: 'unknown', ok: false, error: 'the invocation line was not valid JSON. Send one JSON object per line and retry.' };
    }
    return parseToolHostRequest(value, options);
}
export function parseToolHostRequest(value, options = {}) {
    if (!isRecord(value)) {
        return {
            invoke_id: 'unknown',
            ok: false,
            error: 'the invocation is not a JSON object. Tool execution needs invoke_id, tool, and input fields; send that shape and retry.',
        };
    }
    const invokeId = stringField(value, 'invoke_id') ?? 'unknown';
    if (value['protocol'] !== undefined && value['protocol'] !== TOOL_HOST_PROTOCOL) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: `the tool-host protocol ${String(value['protocol'])} is not supported here. Use ${TOOL_HOST_PROTOCOL}.`,
        };
    }
    if (!stringField(value, 'invoke_id')) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: 'the invocation has no string invoke_id. Tool replies need a stable id; send invoke_id as a non-empty string.',
        };
    }
    const timeout = timeoutField(value);
    if (typeof timeout === 'string')
        return { invoke_id: invokeId, ok: false, error: timeout };
    const op = stringField(value, 'op');
    if (op) {
        if (!options.allowed_ops?.includes(op)) {
            return {
                invoke_id: invokeId,
                ok: false,
                error: `the tool-host operation ${op} is not admitted by this host.`,
            };
        }
        if (value['input'] !== undefined && !isRecord(value['input'])) {
            return {
                invoke_id: invokeId,
                ok: false,
                error: 'the tool-host operation input is not a JSON object. Send input as an object or omit it.',
            };
        }
        return {
            invoke_id: invokeId,
            op,
            ...(isRecord(value['input']) ? { input: value['input'] } : {}),
            ...(timeout === undefined ? {} : { timeout_ms: timeout }),
        };
    }
    const tool = stringField(value, 'tool');
    if (!tool) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: 'the invocation has no string tool. Tool execution needs the declared tool name; send tool as a non-empty string.',
        };
    }
    if (!isRecord(value['input'])) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: 'the invocation input is not a JSON object. Tool execution needs object input; send input as an object.',
        };
    }
    const runId = stringField(value, 'run_id');
    if (options.require_run_id && !runId) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: 'the invocation has no string run_id. Development tool hosts need the run identity for cancellation, metering, and handler context.',
        };
    }
    const trustTier = trustTierField(value);
    if (trustTier instanceof Error) {
        return {
            invoke_id: invokeId,
            ok: false,
            error: trustTier.message,
        };
    }
    return {
        invoke_id: invokeId,
        tool,
        input: value['input'],
        ...(runId ? { run_id: runId } : {}),
        ...optionalStringField(value, 'tenant'),
        ...optionalStringField(value, 'tool_call_id'),
        ...optionalStringField(value, 'binding_ref'),
        ...optionalStringField(value, 'profile_ref'),
        ...(trustTier ? { trust_tier: trustTier } : {}),
        ...(timeout === undefined ? {} : { timeout_ms: timeout }),
    };
}
function timeoutField(value) {
    if (value['timeout_ms'] === undefined)
        return undefined;
    if (!Number.isSafeInteger(value['timeout_ms']) || Number(value['timeout_ms']) <= 0) {
        return 'the invocation timeout_ms is not a positive integer. Send a bounded positive millisecond value or omit it.';
    }
    return Number(value['timeout_ms']);
}
function stringField(value, key) {
    const field = value[key];
    return typeof field === 'string' && field.length > 0 ? field : undefined;
}
function optionalStringField(value, key) {
    const field = stringField(value, key);
    return field ? { [key]: field } : {};
}
function trustTierField(value) {
    if (value['trust_tier'] === undefined)
        return undefined;
    if (typeof value['trust_tier'] !== 'string' || value['trust_tier'] === 'none' || !TRUST_TIERS.includes(value['trust_tier'])) {
        return new Error('the invocation trust_tier is outside the hosted execution vocabulary. Send process, container, or remote.');
    }
    return value['trust_tier'];
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
