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
import { createInterface } from 'node:readline';
import { TOOL_HOST_PROTOCOL, contentHash, isToolHostProtocolError, parseToolHostLine, refuse } from '@zero-ar/contracts';
export function string(options = {}) {
    return {
        json: { type: 'string', ...(options.description ? { description: options.description } : {}) },
        parse(value, path = 'value') {
            if (typeof value !== 'string')
                refuse({ code: 'tool.input.invalid', message: `${path} must be a string, and ${typeof value} arrived.` });
            return value;
        },
    };
}
export function number(options = {}) {
    return {
        json: { type: 'number', ...(options.description ? { description: options.description } : {}) },
        parse(value, path = 'value') {
            if (typeof value !== 'number' || Number.isNaN(value))
                refuse({ code: 'tool.input.invalid', message: `${path} must be a number, and ${typeof value} arrived.` });
            return value;
        },
    };
}
export function boolean(options = {}) {
    return {
        json: { type: 'boolean', ...(options.description ? { description: options.description } : {}) },
        parse(value, path = 'value') {
            if (typeof value !== 'boolean')
                refuse({ code: 'tool.input.invalid', message: `${path} must be a boolean, and ${typeof value} arrived.` });
            return value;
        },
    };
}
export function integer(options = {}) {
    return {
        json: {
            type: 'integer',
            ...(options.minimum !== undefined ? { minimum: options.minimum } : {}),
            ...(options.maximum !== undefined ? { maximum: options.maximum } : {}),
            ...(options.description ? { description: options.description } : {}),
        },
        parse(value, path = 'value') {
            if (typeof value !== 'number' || !Number.isInteger(value))
                refuse({ code: 'tool.input.invalid', message: `${path} must be a whole number, and ${typeof value === 'number' ? value : typeof value} arrived.` });
            if (options.minimum !== undefined && value < options.minimum)
                refuse({ code: 'tool.input.invalid', message: `${path} must be at least ${options.minimum}, and ${value} arrived.` });
            if (options.maximum !== undefined && value > options.maximum)
                refuse({ code: 'tool.input.invalid', message: `${path} must be at most ${options.maximum}, and ${value} arrived.` });
            return value;
        },
    };
}
/** One of a fixed list of strings, numbers or booleans. */
export function enumOf(values, options = {}) {
    if (values.length === 0)
        refuse({ code: 'tool.schema.invalid', message: 'an enum needs at least one value.', fix: "enumOf(['pickup', 'delivery'])" });
    return {
        json: { enum: [...values], ...(options.description ? { description: options.description } : {}) },
        parse(value, path = 'value') {
            if (!values.some((allowed) => allowed === value))
                refuse({ code: 'tool.input.invalid', message: `${path} must be one of ${values.map((allowed) => JSON.stringify(allowed)).join(', ')}, and ${JSON.stringify(value) ?? typeof value} arrived.` });
            return value;
        },
    };
}
export function array(items, options = {}) {
    return {
        json: {
            type: 'array',
            items: items.json,
            ...(options.minItems !== undefined ? { minItems: options.minItems } : {}),
            ...(options.maxItems !== undefined ? { maxItems: options.maxItems } : {}),
            ...(options.description ? { description: options.description } : {}),
        },
        parse(value, path = 'value') {
            if (!Array.isArray(value))
                refuse({ code: 'tool.input.invalid', message: `${path} must be an array, and ${value === null ? 'null' : typeof value} arrived.` });
            if (options.minItems !== undefined && value.length < options.minItems)
                refuse({ code: 'tool.input.invalid', message: `${path} needs at least ${options.minItems} item(s), and ${value.length} arrived.` });
            if (options.maxItems !== undefined && value.length > options.maxItems)
                refuse({ code: 'tool.input.invalid', message: `${path} takes at most ${options.maxItems} item(s), and ${value.length} arrived.` });
            return value.map((item, index) => items.parse(item, `${path}[${index}]`));
        },
    };
}
/** The value, or null. A primitive keeps one type list; anything else becomes a choice with null. */
export function nullable(schema) {
    const { description, ...rest } = schema.json;
    const json = typeof rest['type'] === 'string' && ['string', 'number', 'integer', 'boolean'].includes(rest['type'])
        ? { ...rest, type: [rest['type'], 'null'] }
        : { anyOf: [rest, { type: 'null' }] };
    return {
        json: { ...json, ...(description ? { description } : {}) },
        parse(value, path = 'value') {
            return value === null ? null : schema.parse(value, path);
        },
    };
}
export function optional(schema) {
    return { json: schema.json, parse: (value, path) => schema.parse(value, path), optional: true };
}
/**
 * An object with exactly these fields. The required list keeps the order the
 * fields are written in, which is the order a model sees and fills them, and
 * leaves out each optional field.
 */
export function object(shape, options = {}) {
    const isOptional = (field) => field.optional === true;
    return {
        json: {
            type: 'object',
            properties: Object.fromEntries(Object.entries(shape).map(([key, field]) => [key, field.json])),
            required: Object.keys(shape).filter((key) => !isOptional(shape[key])),
            additionalProperties: false,
            ...(options.description ? { description: options.description } : {}),
        },
        parse(value, path = 'input') {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                refuse({ code: 'tool.input.invalid', message: `${path} must be an object, and ${Array.isArray(value) ? 'an array' : typeof value} arrived.` });
            }
            const source = value;
            const unknown = Object.keys(source).filter((key) => !(key in shape));
            if (unknown.length > 0) {
                refuse({ code: 'tool.input.unknown-field', message: `${path} carries ${unknown.join(', ')}, which the declared schema does not admit.` });
            }
            const parsed = {};
            for (const [key, field] of Object.entries(shape)) {
                if (isOptional(field) && source[key] === undefined)
                    continue;
                parsed[key] = field.parse(source[key], `${path}.${key}`);
            }
            return parsed;
        },
    };
}
const NAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
/**
 * One definition, every surface. The manifest is what publishes; the
 * handler stays here and runs only in an admitted host.
 */
export function defineTool(definition) {
    if (!NAME.test(definition.name)) {
        refuse({ code: 'tool.name.invalid', message: `tool name ${definition.name} does not fit lowercase dot-separated naming.`, fix: 'a name like archive.search' });
    }
    if (!VERSION.test(definition.version)) {
        refuse({ code: 'tool.version.invalid', message: `tool version ${definition.version} is not semantic versioning.`, fix: '1.0.0' });
    }
    const manifest = {
        kind: 'tool',
        name: definition.name,
        version: definition.version,
        description: definition.description,
        input_schema: definition.input.json,
        output_schema: definition.output.json,
        operation_class: definition.operationClass,
        isolation: definition.isolation,
        cost: definition.cost ? { denomination: definition.cost.denomination, enforced_max: definition.cost.maximum } : null,
        timeout_ms: definition.timeout_ms ?? null,
        ...(definition.disclosure ? { disclosure: definition.disclosure } : {}),
    };
    return Object.freeze({
        ...definition,
        manifest,
        manifest_ref: contentHash(manifest),
        parseInput: (value) => definition.input.parse(value),
        parseOutput: (value) => definition.output.parse(value),
        run: (input, context) => definition.execute(input, context),
    });
}
/** Secrets never ride a tool result or a host log line (DXI-021). */
const SECRET = /\b(sk-[A-Za-z0-9._-]{8,}|secret:\/\/[A-Za-z0-9._/-]+|bearer\s+[A-Za-z0-9._-]{8,})/gi;
export function redact(text) {
    return text.replace(SECRET, '[redacted]');
}
export class ToolHost {
    tools = new Map();
    constructor(tools) {
        for (const tool of tools) {
            if (this.tools.has(tool.name)) {
                refuse({ code: 'tool.host.duplicate', message: `two definitions answer to ${tool.name}. One host serves one contract per name.` });
            }
            this.tools.set(tool.name, tool);
        }
    }
    /** The version handshake a host answers before any call. */
    handshake() {
        return {
            protocol: TOOL_HOST_PROTOCOL,
            tools: [...this.tools.values()]
                .map((tool) => ({ name: tool.name, version: tool.version, manifest_ref: tool.manifest_ref }))
                .sort((left, right) => left.name.localeCompare(right.name)),
        };
    }
    /** Liveness only. It states nothing about a call in flight. */
    health() {
        return { ready: true, tools: this.tools.size };
    }
    /**
     * One call: validate against the declared schema, enforce the deadline
     * and cancellation, and answer with a typed envelope either way. A
     * handler that throws is an error result, never a host crash.
     */
    async invoke(request, signal) {
        const tool = this.tools.get(request.tool);
        if (!tool) {
            return { invoke_id: request.invoke_id, ok: false, error: `no definition in this host answers to ${request.tool}.` };
        }
        const deadline = request.timeout_ms ?? tool.timeout_ms ?? 30_000;
        const controller = new AbortController();
        const abort = () => controller.abort();
        signal?.addEventListener('abort', abort, { once: true });
        const timer = setTimeout(abort, deadline);
        const started = Date.now();
        try {
            const input = tool.parseInput(request.input);
            const output = await Promise.race([
                Promise.resolve(tool.run(input, { run_id: request.run_id, invoke_id: request.invoke_id, signal: controller.signal, deadline_ms: deadline })),
                new Promise((_resolve, reject) => {
                    controller.signal.addEventListener('abort', () => reject(new Error(signal?.aborted ? 'the run cancelled this call' : `the call passed its ${deadline} ms deadline`)), { once: true });
                }),
            ]);
            const validated = tool.parseOutput(output);
            return { invoke_id: request.invoke_id, ok: true, output: validated, used: Date.now() - started };
        }
        catch (error) {
            return { invoke_id: request.invoke_id, ok: false, error: redact(error.message), used: Date.now() - started };
        }
        finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', abort);
        }
    }
    /** Serve the same definitions over JSON lines, the way a host is launched. */
    stdio(streams = {}) {
        const input = streams.input ?? process.stdin;
        const output = streams.output ?? process.stdout;
        const lines = createInterface({ input });
        return new Promise((resolve) => {
            lines.on('line', (line) => {
                void (async () => {
                    const trimmed = line.trim();
                    if (!trimmed)
                        return;
                    const request = parseToolHostLine(trimmed, { allowed_ops: ['handshake', 'health'], require_run_id: true });
                    if (isToolHostProtocolError(request)) {
                        output.write(`${JSON.stringify(request)}\n`);
                        return;
                    }
                    const answer = 'op' in request
                        ? request.op === 'handshake'
                            ? { ...this.handshake(), invoke_id: request.invoke_id, ok: true, output: this.handshake() }
                            : { ...this.health(), invoke_id: request.invoke_id, ok: true, output: this.health() }
                        : await this.invoke(request);
                    output.write(`${JSON.stringify(answer)}\n`);
                })();
            });
            lines.on('close', () => resolve());
        });
    }
}
/** One host builder over any number of typed definitions. */
export function serveTools(options) {
    return new ToolHost(options.tools);
}
/**
 * The conformance fixtures a definition generates for itself: the schema
 * refuses what it does not declare, and the handler answers its own
 * declared shape. A developer runs these before publishing.
 */
export async function conformance(tool, samples) {
    const host = new ToolHost([tool]);
    let passed = 0;
    const failed = [];
    for (const sample of samples) {
        const answer = await host.invoke({ invoke_id: 'fixture', run_id: 'run_' + '0'.repeat(32), tool: tool.name, input: sample.input });
        if (answer.ok === sample.ok)
            passed += 1;
        else
            failed.push({ input: sample.input, reason: answer.error ?? 'the call was admitted where the fixture expected a refusal' });
    }
    return { passed, failed };
}
