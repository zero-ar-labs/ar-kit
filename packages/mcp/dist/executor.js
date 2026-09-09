/**
 * Admitted MCP tool execution and remote-task reconciliation.
 *
 * What this is: a credential-free runtime catalogue that executes only the
 * exact imported binding a run pinned, through the deployment egress port.
 *
 * How it fits: ordinary calls use the official MCP client. The declared Tasks
 * extension uses its explicit JSON-RPC boundary, returns a durable handle and
 * closes every client or request before the kernel parks the run.
 */
import { CLIENT_CAPABILITIES_META_KEY, Client, PROTOCOL_VERSION_META_KEY, ProtocolError, SdkError, SdkErrorCode, StreamableHTTPClientTransport, isCallToolResult, } from '@modelcontextprotocol/client';
import { DiagnosticError, InteropBindingManifestSchema, InteropJsonSchema, McpImportedToolPlanSchema, McpPeerSnapshotSchema, RemoteToolTaskHandleSchema, canonicalJson, contentHash, } from '@zero-ar/contracts';
import { admittedMcpFetch } from "./client.js";
import { MCP_PROTOCOL_VERSION, MCP_TASKS_EXTENSION, ZERO_AR_MCP_VERSION } from "./constants.js";
import { mcpToolExecutionBindingRef } from "./import.js";
/** A peer answer arrived, but its wire shape cannot carry the declared MCP result. */
class McpMalformedResponseError extends Error {
    name = 'McpMalformedResponseError';
}
/** The named credential could not be resolved before any peer request began. */
class McpCredentialResolutionError extends Error {
    name = 'McpCredentialResolutionError';
}
function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
function boundedJson(value, label) {
    if (value === undefined)
        return null;
    const parsed = InteropJsonSchema.safeParse(value);
    if (!parsed.success)
        throw new Error(`the MCP ${label} is outside the bounded JSON vocabulary: ${parsed.error.issues[0]?.message ?? 'shape mismatch'}`);
    return parsed.data;
}
function toolDefinition(source) {
    const remote = source.snapshot.tools.find((tool) => tool.name === source.plan.tool_name);
    if (!remote)
        throw new Error(`the admitted snapshot no longer contains MCP tool ${source.plan.tool_name}`);
    return {
        name: remote.name,
        ...(remote.title === null ? {} : { title: remote.title }),
        ...(remote.description === null ? {} : { description: remote.description }),
        inputSchema: remote.input_schema,
        ...(remote.output_schema === null ? {} : { outputSchema: remote.output_schema }),
        ...(remote.annotations === null ? {} : { annotations: remote.annotations }),
    };
}
function normalizeCallResult(result) {
    const content = result.content.map((block, index) => {
        const parsed = boundedJson(block, `content block ${index + 1}`);
        const parsedRecord = record(parsed);
        if (!parsedRecord || typeof parsedRecord['type'] !== 'string')
            throw new Error(`the MCP content block ${index + 1} has no representation type`);
        return parsedRecord;
    });
    const normalized = {
        schema: 'zero-ar-mcp-tool-result/1',
        representations: content.map((block) => block['type']),
        structured_content: boundedJson(result.structuredContent, 'structured content'),
        content,
        peer_metadata: boundedJson(result._meta, 'result metadata'),
        peer_is_error: result.isError === true,
    };
    return result.isError
        ? {
            ok: false,
            outcome: 'tool-error',
            output: normalized,
            error: 'the MCP peer executed the tool and returned isError=true; inspect the retained peer content for its bounded detail',
        }
        : { ok: true, outcome: 'success', output: normalized };
}
function taskStatus(result) {
    const nested = record(result['task']);
    return nested ?? result;
}
function pendingHandle(source, context, input, state, cause, peerTaskId, lastPosition, now) {
    const invokeId = context.tool_call_id;
    return RemoteToolTaskHandleSchema.parse({
        protocol: 'mcp',
        invoke_id: invokeId,
        tool: source.manifest.name,
        original_call_ref: contentHash({ run_id: context.run_id, invoke_id: invokeId, tool: source.manifest.name, input }),
        peer_binding_ref: source.binding.binding_ref,
        execution_binding_ref: source.plan.execution_binding_ref,
        peer_task_id: peerTaskId,
        state,
        cause,
        last_position: lastPosition,
        observed_at: now().toISOString(),
    });
}
function compileBinding(source) {
    const binding = InteropBindingManifestSchema.parse(source.binding);
    const snapshot = McpPeerSnapshotSchema.parse(source.snapshot);
    const plan = McpImportedToolPlanSchema.parse(source.plan);
    if (binding.protocol !== 'mcp' || binding.direction !== 'client' || binding.connection.kind !== 'endpoint' || binding.authentication_ref === null) {
        throw new Error(`imported tool ${source.manifest.name} needs one authenticated MCP client endpoint binding`);
    }
    if (!plan.admitted || plan.admission_ref === null)
        throw new Error(`imported tool ${source.manifest.name} has no explicit admission`);
    if (snapshot.binding_ref !== binding.binding_ref || plan.snapshot_ref !== snapshot.snapshot_ref) {
        throw new Error(`imported tool ${source.manifest.name} does not belong to its exact binding and discovery snapshot`);
    }
    if (contentHash(source.manifest) !== plan.tool_manifest_ref || source.manifest.operation_class !== plan.operation_class) {
        throw new Error(`imported tool ${source.manifest.name} does not match the manifest and operation class reviewed in its admission plan`);
    }
    const expectedExecutionBinding = mcpToolExecutionBindingRef({
        snapshot_ref: snapshot.snapshot_ref,
        binding_ref: binding.binding_ref,
        tool_name: plan.tool_name,
        endpoint: binding.connection.endpoint,
        authentication_ref: binding.authentication_ref,
        destination_ref: binding.connection.destination_ref,
        operation_class: plan.operation_class,
    });
    if (plan.execution_binding_ref !== expectedExecutionBinding
        || plan.endpoint !== binding.connection.endpoint
        || plan.authentication_ref !== binding.authentication_ref
        || plan.destination_ref !== binding.connection.destination_ref) {
        throw new Error(`imported tool ${source.manifest.name} changed endpoint, credential, destination or execution identity after admission`);
    }
    if (source.manifest.isolation !== 'remote')
        throw new Error(`imported tool ${source.manifest.name} must execute in the remote tier`);
    if (!snapshot.tools.some((tool) => tool.name === plan.tool_name))
        throw new Error(`imported tool ${source.manifest.name} is absent from its pinned snapshot`);
    if (!source.authenticated_peer)
        throw new Error(`imported tool ${source.manifest.name} needs one authenticated peer identity`);
    return { ...source, binding: binding, snapshot, plan };
}
function errorMessage(error) {
    if (error instanceof DiagnosticError)
        return `${error.diagnostic.code}: ${error.diagnostic.message}`;
    if (error instanceof Error)
        return `${error.name}: ${error.message}`;
    return String(error);
}
function terminalFault(error) {
    if (error instanceof ProtocolError) {
        return { ok: false, outcome: 'protocol-error', error: `the MCP peer returned protocol error ${error.code}: ${error.message}` };
    }
    if (error instanceof SdkError && [SdkErrorCode.InvalidResult, SdkErrorCode.UnsupportedResultType, SdkErrorCode.ClientHttpUnexpectedContent].includes(error.code)) {
        return { ok: false, outcome: 'malformed-response', error: `the MCP response could not be validated: ${error.message}` };
    }
    if (error instanceof DiagnosticError) {
        return { ok: false, outcome: 'protocol-error', error: errorMessage(error) };
    }
    if (error instanceof McpMalformedResponseError || error instanceof SyntaxError) {
        return { ok: false, outcome: 'malformed-response', error: `the MCP response could not be validated: ${error.message}` };
    }
    if (error instanceof McpCredentialResolutionError) {
        return { ok: false, outcome: 'protocol-error', error: error.message };
    }
    return null;
}
/** One deployment-owned executor for a finite, reviewed imported catalogue. */
export class McpRemoteToolExecutor {
    tools;
    credentials;
    egress;
    now;
    constructor(options) {
        const compiled = options.tools.map(compileBinding);
        const names = compiled.map((source) => source.manifest.name);
        if (new Set(names).size !== names.length)
            throw new Error('the imported MCP runtime catalogue contains a duplicate native tool name');
        this.tools = new Map(compiled.map((source) => [source.manifest.name, source]));
        this.credentials = options.credentials;
        this.egress = options.egress;
        this.now = options.now ?? (() => new Date());
    }
    names() {
        return [...this.tools.keys()].sort();
    }
    registrations() {
        return [...this.tools.values()].map((source) => ({
            ...source.manifest,
            contract_ref: source.plan.tool_manifest_ref,
            binding_ref: source.plan.execution_binding_ref,
        }));
    }
    async invoke(tool, input, timeoutMs, signal, context = {}) {
        const source = this.tools.get(tool);
        if (!source)
            return { ok: false, outcome: 'tool-error', error: `tool ${tool} has no admitted MCP execution binding in this deployment` };
        const contextError = this.contextError(source, context);
        if (contextError)
            return { ok: false, outcome: 'protocol-error', error: contextError };
        if (source.manifest.operation_class !== 'observation') {
            return {
                ok: false,
                outcome: 'tool-error',
                error: `imported MCP tool ${tool} is ${source.manifest.operation_class}; it remains an effect proposal until the Effect Plane owns dispatch and reconciliation`,
            };
        }
        try {
            return source.binding.extensions.required.includes(MCP_TASKS_EXTENSION)
                ? await this.invokeTask(source, input, timeoutMs, signal, context)
                : await this.invokeOrdinary(source, input, timeoutMs, signal);
        }
        catch (error) {
            const terminal = terminalFault(error);
            if (terminal)
                return terminal;
            return {
                ok: false,
                outcome: 'transport-loss',
                error: `the MCP call lost its answer after dispatch may have begun: ${errorMessage(error)}`,
                pending: pendingHandle(source, context, input, 'outcome_unknown', 'transport-loss', null, null, this.now),
            };
        }
    }
    async reconcile(handle, timeoutMs, signal, context = {}) {
        const parsed = RemoteToolTaskHandleSchema.parse(handle);
        const source = this.tools.get(parsed.tool);
        if (!source || source.plan.execution_binding_ref !== parsed.execution_binding_ref || source.binding.binding_ref !== parsed.peer_binding_ref) {
            return { ok: false, outcome: 'protocol-error', error: `remote MCP task ${parsed.invoke_id} no longer has its exact admitted execution binding` };
        }
        const contextError = this.contextError(source, { ...context, binding_ref: parsed.execution_binding_ref, tool_call_id: parsed.invoke_id });
        if (contextError)
            return { ok: false, outcome: 'protocol-error', error: contextError };
        if (parsed.peer_task_id === null) {
            return {
                ok: false,
                outcome: 'outcome-unknown',
                error: 'the lost MCP answer supplied no remote task handle or operation-specific read, so the runtime will not repeat the original call',
                pending: { ...parsed, observed_at: this.now().toISOString() },
            };
        }
        try {
            const result = await this.taskRequest(source, 'tasks/get', parsed.peer_task_id, { taskId: parsed.peer_task_id }, timeoutMs, signal);
            const task = taskStatus(result);
            const status = task?.['status'];
            const lastPosition = typeof task?.['lastUpdatedAt'] === 'string'
                ? task['lastUpdatedAt']
                : typeof task?.['position'] === 'string' || typeof task?.['position'] === 'number'
                    ? String(task['position'])
                    : parsed.last_position;
            if (status === 'working' || status === 'input_required') {
                return {
                    ok: false,
                    outcome: 'outcome-unknown',
                    error: `the remote MCP task remains ${status}`,
                    pending: { ...parsed, state: status, last_position: lastPosition, observed_at: this.now().toISOString() },
                };
            }
            if (status === 'failed' || status === 'cancelled') {
                return { ok: false, outcome: 'tool-error', error: `the remote MCP task reached ${status}${typeof task?.['statusMessage'] === 'string' ? `: ${task['statusMessage']}` : ''}` };
            }
            if (status !== 'completed')
                throw new McpMalformedResponseError('the task status is missing or outside the admitted MCP task vocabulary');
            let payload = task?.['result'];
            if (payload === undefined) {
                const answer = await this.taskRequest(source, 'tasks/result', parsed.peer_task_id, { taskId: parsed.peer_task_id }, timeoutMs, signal);
                payload = answer['result'] ?? answer;
            }
            const complete = record(payload);
            const lifted = complete?.['resultType'] === 'complete' ? Object.fromEntries(Object.entries(complete).filter(([key]) => key !== 'resultType')) : complete;
            if (!isCallToolResult(lifted))
                throw new McpMalformedResponseError('the completed MCP task result is malformed');
            return normalizeCallResult(lifted);
        }
        catch (error) {
            const terminal = terminalFault(error);
            if (terminal)
                return terminal;
            return {
                ok: false,
                outcome: 'transport-loss',
                error: `the MCP task reconciliation lost its answer: ${errorMessage(error)}`,
                pending: { ...parsed, state: 'outcome_unknown', cause: 'transport-loss', observed_at: this.now().toISOString() },
            };
        }
    }
    contextError(source, context) {
        if (context.tenant !== source.binding.tenant)
            return `the invocation tenant does not own MCP binding ${source.binding.binding_ref}`;
        if (context.binding_ref !== source.plan.execution_binding_ref)
            return `the invocation did not carry the execution binding pinned for ${source.manifest.name}`;
        if (context.trust_tier !== 'remote')
            return `imported MCP tool ${source.manifest.name} must execute in the remote tier`;
        if (typeof context.run_id !== 'string' || typeof context.tool_call_id !== 'string')
            return 'the imported MCP invocation lacks its run and original call identity';
        return null;
    }
    async invokeOrdinary(source, input, timeoutMs, signal) {
        const client = new Client({ name: '@zero-ar/mcp', version: ZERO_AR_MCP_VERSION }, {
            capabilities: { extensions: Object.fromEntries(source.binding.extensions.required.map((extension) => [extension, {}])) },
            versionNegotiation: { mode: { pin: MCP_PROTOCOL_VERSION }, probe: { timeoutMs: source.binding.timeouts.connect_ms, maxRetries: 0 } },
            enforceStrictCapabilities: true,
            defaultCacheTtlMs: 0,
            cachePartition: `${source.binding.tenant}:${source.authenticated_peer}`,
        });
        const transport = new StreamableHTTPClientTransport(new URL(source.binding.connection.endpoint), {
            authProvider: { token: () => this.resolveCredential(source, signal) },
            fetch: admittedMcpFetch(source.binding, this.egress),
            onInsufficientScope: 'throw',
            maxStepUpRetries: 0,
        });
        try {
            await client.connect(transport, { timeout: source.binding.timeouts.connect_ms, maxTotalTimeout: source.binding.timeouts.connect_ms });
            if (client.getNegotiatedProtocolVersion() !== MCP_PROTOCOL_VERSION)
                throw new Error(`the MCP peer did not retain protocol revision ${MCP_PROTOCOL_VERSION}`);
            const result = await client.callTool({ name: source.plan.tool_name, arguments: input }, { toolDefinition: toolDefinition(source), timeout: Math.min(timeoutMs, source.binding.timeouts.idle_ms), maxTotalTimeout: Math.min(timeoutMs, source.binding.timeouts.idle_ms), ...(signal ? { signal } : {}) });
            return normalizeCallResult(result);
        }
        finally {
            await client.close();
        }
    }
    async invokeTask(source, input, timeoutMs, signal, context) {
        const result = await this.taskRequest(source, 'tools/call', source.plan.tool_name, { name: source.plan.tool_name, arguments: input }, timeoutMs, signal, context.tool_call_id);
        if (result['resultType'] === 'task' || record(result['task'])) {
            const task = taskStatus(result);
            const taskId = typeof task['taskId'] === 'string' ? task['taskId'] : null;
            const status = task['status'];
            if (!taskId || (status !== 'working' && status !== 'input_required'))
                throw new McpMalformedResponseError('the MCP Tasks extension returned a malformed non-terminal handle');
            const lastPosition = typeof task['lastUpdatedAt'] === 'string'
                ? task['lastUpdatedAt']
                : typeof task['position'] === 'string' || typeof task['position'] === 'number'
                    ? String(task['position'])
                    : null;
            return {
                ok: false,
                outcome: 'outcome-unknown',
                error: `the MCP peer accepted remote task ${taskId} and it remains ${status}`,
                pending: pendingHandle(source, context, input, status, 'peer-task', taskId, lastPosition, this.now),
            };
        }
        const lifted = result['resultType'] === 'complete'
            ? Object.fromEntries(Object.entries(result).filter(([key]) => key !== 'resultType'))
            : result;
        if (!isCallToolResult(lifted))
            throw new McpMalformedResponseError('the MCP tool result is malformed');
        return normalizeCallResult(lifted);
    }
    async taskRequest(source, method, routingName, params, timeoutMs, signal, requestId = `${method}:${routingName}`) {
        const requestSignal = AbortSignal.timeout(Math.min(timeoutMs, source.binding.timeouts.idle_ms));
        const combined = signal ? AbortSignal.any([signal, requestSignal]) : requestSignal;
        const credential = await this.resolveCredential(source, combined);
        const body = canonicalJson({
            jsonrpc: '2.0',
            id: requestId,
            method,
            params: {
                ...params,
                _meta: {
                    [PROTOCOL_VERSION_META_KEY]: MCP_PROTOCOL_VERSION,
                    [CLIENT_CAPABILITIES_META_KEY]: { extensions: { [MCP_TASKS_EXTENSION]: {} } },
                },
            },
        });
        const fetch = admittedMcpFetch(source.binding, this.egress);
        const response = await fetch(source.binding.connection.endpoint, {
            method: 'POST',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${credential}`,
                'content-type': 'application/json',
                'mcp-method': method,
                'mcp-name': routingName,
                'mcp-protocol-version': MCP_PROTOCOL_VERSION,
            },
            body,
            signal: combined,
        });
        let decoded;
        try {
            decoded = await response.json();
        }
        catch (error) {
            throw new McpMalformedResponseError(`the MCP Tasks extension returned invalid JSON: ${errorMessage(error)}`);
        }
        const envelope = record(decoded);
        if (!envelope || envelope['jsonrpc'] !== '2.0')
            throw new McpMalformedResponseError('the MCP Tasks extension returned no JSON-RPC envelope');
        const protocolError = record(envelope['error']);
        if (protocolError) {
            throw new ProtocolError(typeof protocolError['code'] === 'number' ? protocolError['code'] : -32603, typeof protocolError['message'] === 'string' ? protocolError['message'] : 'the MCP peer returned an unnamed protocol error', protocolError['data']);
        }
        const result = record(envelope['result']);
        if (!result)
            throw new McpMalformedResponseError('the MCP Tasks extension returned no result object');
        return result;
    }
    async resolveCredential(source, signal) {
        const timeout = AbortSignal.timeout(source.binding.timeouts.connect_ms);
        const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
        let credential;
        try {
            credential = await this.credentials.resolve(source.binding.authentication_ref, {
                tenant: source.binding.tenant,
                binding_ref: source.binding.binding_ref,
                destination_ref: source.binding.connection.destination_ref,
                signal: combined,
            });
        }
        catch (error) {
            throw new McpCredentialResolutionError(`the named MCP credential could not resolve before egress: ${errorMessage(error)}`);
        }
        if (credential.length === 0 || Buffer.byteLength(credential) > source.binding.limits.header_bytes) {
            throw new McpCredentialResolutionError('the named MCP credential is empty or exceeds the admitted header limit');
        }
        return credential;
    }
}
