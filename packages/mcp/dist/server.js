/**
 * Authenticated MCP projection over native Zero-AR work.
 *
 * What this is: the minimal work-entrypoint server for MCP 2026-07-28 and
 * the Tasks extension. The official SDK serves discovery and catalogue
 * operations. A narrow HTTP shim serves the extension methods that SDK 2.0.0
 * does not dispatch.
 *
 * How it fits: every task id resolves to a native run, and every mutation is
 * a native client command. Restarting this package loses no work because it
 * stores no task, quality, effect, cancellation, or artifact state.
 */
import { CLIENT_CAPABILITIES_META_KEY, PROTOCOL_VERSION_META_KEY, SERVER_INFO_META_KEY, SUBSCRIPTION_ID_META_KEY, Server, classifyInboundRequest, createMcpHandler, isJsonContentType, } from '@modelcontextprotocol/server';
import { fromJsonSchema } from '@modelcontextprotocol/client';
import { DiagnosticError, McpPublishedWorkEntrypointSchema, SourceBindingInputSchema, assuranceEnvelopeFromRunResult, canonicalJson, contentHash, nativeRunIdFromMcpTask, projectMcpTask, } from '@zero-ar/contracts';
import { MCP_OFFICIAL_SDK_VERSION, MCP_PROTOCOL_VERSION, MCP_TASKS_EXTENSION, ZERO_AR_MCP_VERSION, ZERO_AR_REQUEST_META_KEY, } from "./constants.js";
import { assertBoundedJsonSchema } from "./schema-policy.js";
const DEFAULT_LIMITS = {
    request_bytes: 1_048_576,
    resource_bytes: 8_388_608,
    header_bytes: 65_536,
    json_depth: 32,
    schema_depth: 32,
    string_bytes: 1_048_576,
    list_items: 10_000,
    page_size: 100,
    poll_interval_ms: 1_000,
};
class McpProtocolError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message);
        this.name = 'McpProtocolError';
        this.code = code;
        this.data = data;
    }
}
function objectValue(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
function parserWalk(value, limits) {
    const stack = [{ value, depth: 0 }];
    while (stack.length > 0) {
        const current = stack.pop();
        if (current.depth > limits.json_depth) {
            throw new McpProtocolError(-32602, `The request passes the ${limits.json_depth}-level JSON depth limit.`);
        }
        if (typeof current.value === 'string' && Buffer.byteLength(current.value) > limits.string_bytes) {
            throw new McpProtocolError(-32602, `A request string passes the ${limits.string_bytes}-byte limit.`);
        }
        if (Array.isArray(current.value)) {
            if (current.value.length > limits.list_items) {
                throw new McpProtocolError(-32602, `A request list passes the ${limits.list_items}-entry limit.`);
            }
            for (const item of current.value)
                stack.push({ value: item, depth: current.depth + 1 });
            continue;
        }
        const object = objectValue(current.value);
        if (object) {
            const entries = Object.entries(object);
            if (entries.length > limits.list_items) {
                throw new McpProtocolError(-32602, `A request object passes the ${limits.list_items}-property limit.`);
            }
            for (const [key, item] of entries) {
                if (Buffer.byteLength(key) > limits.string_bytes) {
                    throw new McpProtocolError(-32602, `A request property name passes the ${limits.string_bytes}-byte limit.`);
                }
                stack.push({ value: item, depth: current.depth + 1 });
            }
        }
    }
}
async function parseRequest(request, limits) {
    if (request.method !== 'POST' || !isJsonContentType(request.headers.get('content-type'))) {
        throw new McpProtocolError(-32600, 'MCP extension requests require POST with application/json.');
    }
    const contentEncoding = request.headers.get('content-encoding');
    if (contentEncoding !== null && contentEncoding !== 'identity') {
        throw new McpProtocolError(-32600, 'MCP requests must be uncompressed so their byte ceiling is established before parsing.');
    }
    let headerBytes = 0;
    for (const [name, value] of request.headers)
        headerBytes += Buffer.byteLength(name) + Buffer.byteLength(value) + 4;
    if (headerBytes > limits.header_bytes) {
        throw new McpProtocolError(-32600, `The request headers pass the ${limits.header_bytes}-byte limit.`);
    }
    const declared = Number(request.headers.get('content-length') ?? 0);
    if (Number.isFinite(declared) && declared > limits.request_bytes) {
        throw new McpProtocolError(-32600, `The request passes the ${limits.request_bytes}-byte body limit.`);
    }
    const text = await request.text();
    if (Buffer.byteLength(text) > limits.request_bytes) {
        throw new McpProtocolError(-32600, `The request passes the ${limits.request_bytes}-byte body limit.`);
    }
    let raw;
    try {
        raw = JSON.parse(text);
    }
    catch {
        throw new McpProtocolError(-32700, 'The request body is not valid JSON.');
    }
    parserWalk(raw, limits);
    const object = objectValue(raw);
    const id = object?.['id'];
    if (!object || object['jsonrpc'] !== '2.0' || typeof object['method'] !== 'string'
        || !((typeof id === 'string' || typeof id === 'number') && Number.isFinite(typeof id === 'number' ? id : 0))) {
        throw new McpProtocolError(-32600, 'The body is not one JSON-RPC 2.0 request with a string or number id.');
    }
    const params = objectValue(object['params']) ?? {};
    return { id, method: object['method'], params, raw: object };
}
function assertModernHeaders(request, parsed) {
    const protocolHeader = request.headers.get('mcp-protocol-version');
    if (protocolHeader !== MCP_PROTOCOL_VERSION) {
        throw new McpProtocolError(-32000, `This binding serves MCP ${MCP_PROTOCOL_VERSION}.`, { supportedVersions: [MCP_PROTOCOL_VERSION] });
    }
    if (request.headers.get('mcp-method') !== parsed.method) {
        throw new McpProtocolError(-32020, 'Mcp-Method must match the JSON-RPC method.');
    }
    const meta = objectValue(parsed.params['_meta']);
    if (meta?.[PROTOCOL_VERSION_META_KEY] !== MCP_PROTOCOL_VERSION) {
        throw new McpProtocolError(-32602, `The request _meta must name protocol revision ${MCP_PROTOCOL_VERSION}.`);
    }
    const capabilities = objectValue(meta[CLIENT_CAPABILITIES_META_KEY]);
    const extensions = objectValue(capabilities?.['extensions']);
    if (!objectValue(extensions?.[MCP_TASKS_EXTENSION])) {
        throw new McpProtocolError(-32021, 'The request did not declare the MCP Tasks extension.', {
            requiredCapabilities: { extensions: { [MCP_TASKS_EXTENSION]: {} } },
        });
    }
}
function assertRoutingName(request, expected) {
    if (request.headers.get('mcp-name') !== expected) {
        throw new McpProtocolError(-32020, 'Mcp-Name must match the addressed tool or task.');
    }
}
function jsonRpcResult(id, result) {
    return Response.json({ jsonrpc: '2.0', id, result: {
            ...result,
            _meta: {
                ...(objectValue(result['_meta']) ?? {}),
                [SERVER_INFO_META_KEY]: { name: '@zero-ar/mcp', version: ZERO_AR_MCP_VERSION },
            },
        } });
}
function jsonRpcError(id, error) {
    const protocol = error instanceof McpProtocolError
        ? error
        : error instanceof DiagnosticError
            ? new McpProtocolError(error.diagnostic.code.includes('unknown') || error.diagnostic.code.includes('not-parked') ? -32602 : -32603, error.diagnostic.message, { diagnosticCode: error.diagnostic.code, clause: error.diagnostic.clause })
            : new McpProtocolError(-32603, 'The request could not be completed because the native runtime returned an unexpected error.');
    return Response.json({
        jsonrpc: '2.0',
        id,
        error: {
            code: protocol.code,
            message: protocol.message,
            ...(protocol.data !== undefined ? { data: protocol.data } : {}),
        },
    }, { status: protocol.code === -32700 || protocol.code === -32600 || protocol.code === -32602 ? 400 : 200 });
}
function pageOffset(cursor) {
    if (cursor === undefined)
        return 0;
    const match = /^offset:(\d+)$/.exec(cursor);
    if (!match)
        throw new McpProtocolError(-32602, 'The catalogue cursor is invalid. Restart listing without a cursor.');
    return Number(match[1]);
}
function page(items, cursor, size) {
    const offset = pageOffset(cursor);
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > items.length) {
        throw new McpProtocolError(-32602, 'The catalogue cursor is outside the current immutable catalogue.');
    }
    const selected = items.slice(offset, offset + size);
    const next = offset + selected.length;
    return { items: selected, ...(next < items.length ? { nextCursor: `offset:${next}` } : {}) };
}
function pendingInputs(records) {
    const open = new Map();
    for (const record of records) {
        if (record.type === 'item.parked') {
            const itemId = String(record.payload['item_id'] ?? '');
            const reason = String(record.payload['reason'] ?? 'This item needs an answer.');
            if (itemId) {
                open.set(itemId, {
                    request_id: `input:${record.record_id}`,
                    handle: itemId,
                    message: reason,
                    schema: {
                        type: 'object',
                        properties: {
                            action: { type: 'string', enum: ['accept', 'decline'] },
                            answer: { type: 'string', maxLength: 100_000 },
                            reason: { type: 'string', maxLength: 1_000 },
                        },
                        required: ['action'],
                        maxProperties: 3,
                        additionalProperties: false,
                    },
                });
            }
        }
        else if (record.type === 'gap.settled' || record.type === 'gap.dismissed') {
            open.delete(String(record.payload['item_id'] ?? ''));
        }
    }
    return [...open.values()];
}
function taskTimes(records) {
    const first = records[0];
    const last = records[records.length - 1];
    if (!first || !last)
        throw new McpProtocolError(-32603, 'The native run has no canonical records, so no task projection can be produced.');
    return { createdAt: first.at, lastUpdatedAt: last.at, position: last.seq };
}
function taskBase(projection, records, pollInterval) {
    const times = taskTimes(records);
    return {
        taskId: projection.task_id,
        status: projection.status,
        statusMessage: projection.status_message,
        createdAt: times.createdAt,
        lastUpdatedAt: times.lastUpdatedAt,
        ttlMs: null,
        pollIntervalMs: pollInterval,
    };
}
function inputRequests(inputs) {
    return Object.fromEntries(inputs.map((input) => [input.request_id, {
            method: 'elicitation/create',
            params: {
                mode: 'form',
                message: input.message,
                requestedSchema: input.schema,
            },
        }]));
}
function callToolResult(result, position, generatedAt) {
    const assurance = assuranceEnvelopeFromRunResult({ result, canonical_position: position, generated_at: generatedAt });
    const succeeded = assurance.completion_class === 'verified';
    const task = `task_run_${result.run_id.slice(4)}`;
    const summary = `Zero-AR completion class: ${assurance.completion_class}. ${result.verdict_reason ?? 'No additional verdict reason was recorded.'}`;
    return {
        content: [
            { type: 'text', text: summary },
            ...(result.artifact ? [{ type: 'text', text: result.artifact.text }] : []),
        ],
        structuredContent: {
            run_id: result.run_id,
            assurance,
            resources: {
                result: `zero-ar://tasks/${task}/result`,
                assurance: `zero-ar://tasks/${task}/assurance`,
                ...(result.artifact ? { artifact: `zero-ar://tasks/${task}/artifact` } : {}),
            },
        },
        isError: !succeeded,
    };
}
function parseTaskId(params) {
    if (typeof params['taskId'] !== 'string')
        throw new McpProtocolError(-32602, 'The request needs one taskId string.');
    nativeRunIdFromMcpTask(params['taskId']);
    return params['taskId'];
}
function nativeControlId(kind, taskId, material) {
    return `mcp-${kind}-${contentHash({ taskId, material }).slice('sha256:'.length, 'sha256:'.length + 32)}`;
}
function parseInputResponse(value) {
    const object = objectValue(value);
    const result = objectValue(object?.['result']);
    const answer = objectValue(result?.['content']) ?? objectValue(object?.['content']);
    if (!object || !answer || !['accept', 'decline'].includes(String(answer['action']))) {
        throw new McpProtocolError(-32602, 'Each input response must contain result.content with action accept or decline.');
    }
    const allowedEnvelope = new Set(['result']);
    const allowedResult = new Set(['content']);
    const allowedContent = new Set(['action', 'answer', 'reason']);
    if (Object.keys(object).some((key) => !allowedEnvelope.has(key))
        || Object.keys(result ?? {}).some((key) => !allowedResult.has(key))
        || Object.keys(answer).some((key) => !allowedContent.has(key))) {
        throw new McpProtocolError(-32602, 'An input response contains fields outside the exact answer contract. Remove steering, grants, routing, or other extra fields.');
    }
    if (answer['action'] === 'accept' && typeof answer['answer'] === 'string' && answer['answer'].length > 0) {
        return { text: answer['answer'] };
    }
    if (answer['action'] === 'decline' && typeof answer['reason'] === 'string' && answer['reason'].length > 0) {
        return { reason: answer['reason'] };
    }
    throw new McpProtocolError(-32602, 'Accept needs a non-empty answer, and decline needs a non-empty reason.');
}
function taskResource(uri) {
    const match = /^zero-ar:\/\/tasks\/(task_run_[0-9a-f]{32})\/(result|assurance|artifact)$/.exec(uri);
    return match ? { taskId: match[1], kind: match[2] } : null;
}
export function createZeroARMcpServer(options) {
    const limits = { ...DEFAULT_LIMITS, ...options.limits };
    const entrypoints = options.entrypoints.map((entrypoint) => McpPublishedWorkEntrypointSchema.parse(entrypoint));
    if (entrypoints.length > limits.list_items)
        throw new RangeError(`the MCP catalogue passes the ${limits.list_items}-entry limit.`);
    if (new Set(entrypoints.map((entrypoint) => entrypoint.name)).size !== entrypoints.length)
        throw new RangeError('MCP work entrypoint names must be unique.');
    const validators = new Map(entrypoints.map((entrypoint) => {
        const schema = assertBoundedJsonSchema(entrypoint.input_schema, limits);
        return [entrypoint.name, {
                schema: schema,
                validator: fromJsonSchema(schema),
            }];
    }));
    const core = createMcpHandler(() => {
        const server = new Server({ name: '@zero-ar/mcp', version: ZERO_AR_MCP_VERSION }, {
            supportedProtocolVersions: [MCP_PROTOCOL_VERSION],
            capabilities: {
                tools: { listChanged: false },
                resources: { listChanged: false, subscribe: false },
                extensions: { [MCP_TASKS_EXTENSION]: {} },
            },
            cacheHints: {
                'tools/list': { ttlMs: 5_000, cacheScope: 'private' },
                'resources/list': { ttlMs: 5_000, cacheScope: 'private' },
                'resources/read': { ttlMs: 0, cacheScope: 'private' },
                'server/discover': { ttlMs: 5_000, cacheScope: 'private' },
            },
        });
        server.setRequestHandler('tools/list', async (request) => {
            const selected = page(entrypoints, request.params?.cursor, limits.page_size);
            return {
                tools: selected.items.map((entrypoint) => ({
                    name: entrypoint.name,
                    title: entrypoint.title,
                    description: entrypoint.description,
                    inputSchema: validators.get(entrypoint.name)?.schema,
                    outputSchema: entrypoint.output_schema,
                    _meta: {
                        'io.zero-ar/workEntrypoint': {
                            entrypointRef: entrypoint.entrypoint_ref,
                            publicationRef: entrypoint.publication_ref,
                            agentRef: entrypoint.agent_ref,
                            assuranceExtensionRequired: entrypoint.assurance_extension_required,
                        },
                    },
                })),
                ...(selected.nextCursor ? { nextCursor: selected.nextCursor } : {}),
            };
        });
        server.setRequestHandler('tools/call', async () => server.projectCallToolResult({
            content: [{ type: 'text', text: 'This work entrypoint requires the MCP Tasks extension on protocol revision 2026-07-28.' }],
            isError: true,
        }, undefined));
        server.setRequestHandler('resources/list', async (request) => {
            const selected = page(entrypoints, request.params?.cursor, limits.page_size);
            return {
                resources: selected.items.map((entrypoint) => ({
                    uri: `zero-ar://entrypoints/${encodeURIComponent(entrypoint.name)}`,
                    name: entrypoint.name,
                    title: entrypoint.title,
                    description: entrypoint.description,
                    mimeType: 'application/json',
                })),
                ...(selected.nextCursor ? { nextCursor: selected.nextCursor } : {}),
            };
        });
        server.setRequestHandler('resources/read', async (request) => {
            const prefix = 'zero-ar://entrypoints/';
            const uri = request.params.uri;
            const entrypoint = uri.startsWith(prefix) ? entrypoints.find((candidate) => candidate.name === decodeURIComponent(uri.slice(prefix.length))) : undefined;
            if (!entrypoint)
                throw new McpProtocolError(-32602, 'The requested resource is not an exposed work entrypoint.');
            return { contents: [{ uri, mimeType: 'application/json', text: canonicalJson(entrypoint) }] };
        });
        return server;
    }, { legacy: 'reject' });
    async function state(client, taskId) {
        const runId = nativeRunIdFromMcpTask(taskId);
        const [snapshot, recordsPage] = await Promise.all([client.snapshot(runId), client.records(runId, 0)]);
        const pending = pendingInputs(recordsPage.records);
        return { runId, snapshot, records: recordsPage.records, pending, projection: projectMcpTask(snapshot, pending) };
    }
    async function taskDetail(client, taskId) {
        const current = await state(client, taskId);
        const detail = taskBase(current.projection, current.records, limits.poll_interval_ms);
        if (current.projection.status === 'input_required')
            detail['inputRequests'] = inputRequests(current.pending);
        if (current.projection.status === 'completed') {
            const result = await client.result(current.runId);
            const times = taskTimes(current.records);
            detail['result'] = callToolResult(result, times.position, times.lastUpdatedAt);
        }
        return detail;
    }
    async function dispatch(request, parsed, context) {
        assertModernHeaders(request, parsed);
        if (context.tenant !== options.tenant) {
            throw new McpProtocolError(-32602, 'The authenticated tenant does not own this MCP binding.');
        }
        if (parsed.method === 'tools/call') {
            if (typeof parsed.params['name'] !== 'string')
                throw new McpProtocolError(-32602, 'The tool call needs one published work entrypoint name.');
            const name = parsed.params['name'];
            assertRoutingName(request, name);
            const entrypoint = entrypoints.find((candidate) => candidate.name === name);
            if (!entrypoint)
                throw new McpProtocolError(-32602, 'This binding has no published work entrypoint by that name.');
            const args = objectValue(parsed.params['arguments']) ?? {};
            const validation = await validators.get(name)?.validator['~standard'].validate(args);
            if (!validation || validation.issues) {
                throw new McpProtocolError(-32602, `The work input does not match the published schema: ${validation?.issues?.[0]?.message ?? 'schema mismatch'}.`);
            }
            const meta = objectValue(parsed.params['_meta']);
            const requestMeta = objectValue(meta[ZERO_AR_REQUEST_META_KEY]);
            const idempotencyKey = requestMeta?.['idempotencyKey'];
            if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 1 || idempotencyKey.length > 256) {
                throw new McpProtocolError(-32602, `${ZERO_AR_REQUEST_META_KEY}.idempotencyKey must contain 1 to 256 characters.`);
            }
            const objective = typeof args['objective'] === 'string'
                ? args['objective']
                : `${entrypoint.title}\n\nInput: ${canonicalJson(args)}`;
            if (objective.length > 100_000)
                throw new McpProtocolError(-32602, 'The projected objective passes the native 100000-character limit.');
            const items = Array.isArray(args['items']) && args['items'].every((item) => typeof item === 'string') ? args['items'] : undefined;
            const sources = args['sources'] === undefined
                ? undefined
                : SourceBindingInputSchema.array().max(64).parse(args['sources']);
            const created = await context.native.createDeferredRun({
                objective,
                agent_ref: entrypoint.agent_ref,
                principals: {
                    executing: context.principal,
                    originating: `mcp:${context.principal}`,
                    accountable: entrypoint.accountable_principal,
                },
                budgets: {
                    consumption: {
                        model_tokens: entrypoint.default_budgets.model_tokens,
                        ...(entrypoint.default_budgets.tool_calls !== undefined ? { tool_calls: entrypoint.default_budgets.tool_calls } : {}),
                        ...(entrypoint.default_budgets.bytes !== undefined ? { bytes: entrypoint.default_budgets.bytes } : {}),
                        ...(entrypoint.default_budgets.compute_ms !== undefined ? { compute_ms: entrypoint.default_budgets.compute_ms } : {}),
                    },
                    attention: entrypoint.default_budgets.attention,
                    verification_reserve_fraction: entrypoint.default_budgets.verification_reserve_fraction,
                    max_turns: entrypoint.default_budgets.max_turns,
                },
                ...(items || sources ? { inputs: { ...(items ? { items } : {}), ...(sources ? { sources } : {}) } } : {}),
                idempotency_key: idempotencyKey,
                correlation_id: `mcp:${options.binding_ref}`,
            });
            const records = (await context.native.records(created.run_id, 0)).records;
            const projection = projectMcpTask(created.snapshot, pendingInputs(records));
            return jsonRpcResult(parsed.id, {
                resultType: 'task',
                ...taskBase(projection, records, limits.poll_interval_ms),
            });
        }
        if (parsed.method === 'tasks/get') {
            const taskId = parseTaskId(parsed.params);
            assertRoutingName(request, taskId);
            return jsonRpcResult(parsed.id, { resultType: 'complete', ...await taskDetail(context.native, taskId) });
        }
        if (parsed.method === 'tasks/update') {
            const taskId = parseTaskId(parsed.params);
            assertRoutingName(request, taskId);
            const responses = objectValue(parsed.params['inputResponses']);
            if (!responses)
                throw new McpProtocolError(-32602, 'The task update needs one inputResponses object.');
            const current = await state(context.native, taskId);
            const openByRequest = new Map(current.pending.map((pending) => [pending.request_id, pending]));
            let answered = 0;
            for (const [requestId, rawResponse] of Object.entries(responses)) {
                const pending = openByRequest.get(requestId);
                if (!pending)
                    continue;
                const answer = parseInputResponse(rawResponse);
                await context.native.control(current.runId, {
                    verb: 'answer',
                    control_id: nativeControlId('answer', taskId, { requestId, answer }),
                    handle: pending.handle,
                    ...answer,
                });
                answered += 1;
            }
            if (answered > 0 && answered === current.pending.length) {
                await context.native.resumeDeferred(current.runId, {
                    idempotency_key: nativeControlId('resume', taskId, Object.keys(responses).sort()),
                    reason: 'resume after the complete MCP input response set',
                });
            }
            return jsonRpcResult(parsed.id, { resultType: 'complete' });
        }
        if (parsed.method === 'tasks/cancel') {
            const taskId = parseTaskId(parsed.params);
            assertRoutingName(request, taskId);
            const current = await state(context.native, taskId);
            if (current.projection.status !== 'completed' && current.projection.status !== 'cancelled') {
                await context.native.control(current.runId, {
                    verb: 'cancel',
                    control_id: nativeControlId('cancel', taskId, 'cancel'),
                    reason: `MCP cancellation requested by ${context.principal}`,
                });
            }
            return jsonRpcResult(parsed.id, { resultType: 'complete' });
        }
        if (parsed.method === 'subscriptions/listen') {
            if (!request.headers.get('accept')?.includes('text/event-stream')) {
                throw new McpProtocolError(-32602, 'Task notification subscriptions require Accept: text/event-stream.');
            }
            const notifications = objectValue(parsed.params['notifications']);
            const requested = notifications?.['taskIds'];
            if (!Array.isArray(requested) || requested.length === 0 || requested.length > limits.page_size || requested.some((taskId) => typeof taskId !== 'string')) {
                throw new McpProtocolError(-32602, `Task notification subscriptions require 1 to ${limits.page_size} taskIds.`);
            }
            const taskIds = [...new Set(requested)];
            for (const taskId of taskIds) {
                nativeRunIdFromMcpTask(taskId);
                await state(context.native, taskId);
            }
            return taskSubscriptionResponse({
                request,
                subscriptionId: parsed.id,
                taskIds,
                native: context.native,
                detail: taskDetail,
                pollIntervalMs: limits.poll_interval_ms,
            });
        }
        if (parsed.method === 'resources/read') {
            if (typeof parsed.params['uri'] !== 'string')
                throw new McpProtocolError(-32602, 'The resource read needs one URI.');
            const resource = taskResource(parsed.params['uri']);
            if (!resource)
                throw new McpProtocolError(-32602, 'The task resource URI is invalid.');
            assertRoutingName(request, parsed.params['uri']);
            const current = await state(context.native, resource.taskId);
            const result = await context.native.result(current.runId);
            const times = taskTimes(current.records);
            const assurance = assuranceEnvelopeFromRunResult({ result, canonical_position: times.position, generated_at: times.lastUpdatedAt });
            const value = resource.kind === 'artifact' ? result.artifact : resource.kind === 'assurance' ? assurance : result;
            if (resource.kind === 'artifact' && result.artifact === null)
                throw new McpProtocolError(-32602, 'This native run has no result artifact.');
            const text = resource.kind === 'artifact' ? result.artifact.text : canonicalJson(value);
            if (Buffer.byteLength(text) > limits.resource_bytes) {
                throw new McpProtocolError(-32602, `The resource passes the ${limits.resource_bytes}-byte inline limit. Retrieve it through the authorized native artifact surface.`);
            }
            return jsonRpcResult(parsed.id, {
                resultType: 'complete',
                ttlMs: 0,
                cacheScope: 'private',
                contents: [{ uri: parsed.params['uri'], mimeType: resource.kind === 'artifact' ? 'text/plain' : 'application/json', text }],
            });
        }
        throw new McpProtocolError(-32601, `The Tasks extension does not define ${parsed.method}.`);
    }
    return {
        async fetch(request, context) {
            let parsed = null;
            try {
                const clone = request.clone();
                const body = await parseRequest(clone, limits);
                parsed = body;
                const custom = body.method === 'tools/call'
                    || body.method === 'tasks/get'
                    || body.method === 'tasks/update'
                    || body.method === 'tasks/cancel'
                    || body.method === 'subscriptions/listen'
                    || (body.method === 'resources/read' && typeof body.params['uri'] === 'string' && taskResource(body.params['uri']) !== null);
                if (!custom) {
                    const protocolVersionHeader = request.headers.get('mcp-protocol-version');
                    const mcpMethodHeader = request.headers.get('mcp-method');
                    const mcpNameHeader = request.headers.get('mcp-name');
                    const classified = classifyInboundRequest({
                        httpMethod: request.method,
                        ...(protocolVersionHeader !== null ? { protocolVersionHeader } : {}),
                        ...(mcpMethodHeader !== null ? { mcpMethodHeader } : {}),
                        ...(mcpNameHeader !== null ? { mcpNameHeader } : {}),
                        body: body.raw,
                    });
                    if (classified.kind === 'reject')
                        throw new McpProtocolError(classified.code, classified.message, classified.data);
                    if (!context || context.tenant !== options.tenant)
                        throw new McpProtocolError(-32602, 'This MCP binding requires an authenticated tenant channel.');
                    return core.fetch(request, {
                        authInfo: { token: 'resolved-by-zero-ar', clientId: context.principal, scopes: [] },
                    });
                }
                if (!context)
                    throw new McpProtocolError(-32602, 'This MCP binding requires an authenticated tenant channel.');
                return await dispatch(request, body, context);
            }
            catch (error) {
                return jsonRpcError(parsed?.id ?? null, error);
            }
        },
        close: core.close,
    };
}
function taskSubscriptionResponse(input) {
    const encoder = new TextEncoder();
    let stopped = false;
    const stream = new ReadableStream({
        start(controller) {
            const write = (message) => {
                if (!stopped)
                    controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(message)}\n\n`));
            };
            write({
                jsonrpc: '2.0',
                method: 'notifications/subscriptions/acknowledged',
                params: {
                    notifications: { taskIds: input.taskIds },
                    _meta: { [SUBSCRIPTION_ID_META_KEY]: input.subscriptionId },
                },
            });
            void (async () => {
                const last = new Map();
                while (!stopped && !input.request.signal.aborted) {
                    for (const taskId of input.taskIds) {
                        const detail = await input.detail(input.native, taskId);
                        const identity = contentHash(detail);
                        if (last.get(taskId) === identity)
                            continue;
                        last.set(taskId, identity);
                        write({
                            jsonrpc: '2.0',
                            method: 'notifications/tasks',
                            params: {
                                ...detail,
                                _meta: { [SUBSCRIPTION_ID_META_KEY]: input.subscriptionId },
                            },
                        });
                    }
                    await cancellableDelay(input.pollIntervalMs, input.request.signal);
                }
            })().catch((error) => {
                if (stopped || input.request.signal.aborted)
                    return;
                stopped = true;
                controller.error(error);
            });
        },
        cancel() {
            stopped = true;
        },
    });
    return new Response(stream, {
        status: 200,
        headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache, no-transform',
            connection: 'keep-alive',
            'x-accel-buffering': 'no',
        },
    });
}
function cancellableDelay(milliseconds, signal) {
    if (signal.aborted)
        return Promise.resolve();
    return new Promise((resolve) => {
        const timeout = setTimeout(done, milliseconds);
        signal.addEventListener('abort', done, { once: true });
        function done() {
            clearTimeout(timeout);
            signal.removeEventListener('abort', done);
            resolve();
        }
    });
}
export const ZERO_AR_MCP_PROTOCOL_REGISTRY = Object.freeze({
    format: 'zero-ar-interop-registry/1',
    entries: [
        {
            protocol: 'mcp',
            direction: 'server',
            implementation: '@zero-ar/mcp',
            implementation_version: ZERO_AR_MCP_VERSION,
            protocol_versions: [MCP_PROTOCOL_VERSION],
            extensions: [MCP_TASKS_EXTENSION],
            sdk_packages: {
                '@modelcontextprotocol/server': MCP_OFFICIAL_SDK_VERSION,
                '@modelcontextprotocol/client': MCP_OFFICIAL_SDK_VERSION,
            },
            conformance_evidence: [
                'IOP-CV-001', 'IOP-CV-002', 'IOP-CV-003', 'IOP-CV-006', 'IOP-CV-007',
                'IOP-CV-008', 'IOP-CV-009', 'IOP-CV-010', 'IOP-CV-024', 'IOP-CV-025', 'IOP-CV-027',
            ],
            known_deviations: ['The official SDK 2.0.0 does not dispatch the 2026-07-28 Tasks methods or task notification filters, so the package validates and routes that extension at the HTTP boundary.'],
            retirement_date: null,
        },
        {
            protocol: 'mcp',
            direction: 'client',
            implementation: '@zero-ar/mcp',
            implementation_version: ZERO_AR_MCP_VERSION,
            protocol_versions: [MCP_PROTOCOL_VERSION],
            extensions: [MCP_TASKS_EXTENSION],
            sdk_packages: { '@modelcontextprotocol/client': MCP_OFFICIAL_SDK_VERSION },
            conformance_evidence: ['IOP-CV-003', 'IOP-CV-004', 'IOP-CV-005', 'IOP-CV-024', 'IOP-CV-027', 'IOP-CV-028', 'IOP-CV-029', 'IOP-CV-030', 'IOP-CV-031'],
            known_deviations: [
                'Prompt import is omitted from the first client surface. Peer prompts never become native agent instructions.',
                'The official SDK 2.0.0 does not expose the Zero-AR-pinned 2026-07-28 Tasks extension runtime, so that extension uses the same bounded JSON-RPC egress boundary directly.',
            ],
            retirement_date: null,
        },
    ],
});
