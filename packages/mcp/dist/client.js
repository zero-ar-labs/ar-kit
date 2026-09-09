/**
 * Bounded MCP peer discovery client.
 *
 * What this is: the network edge that reads one fresh MCP catalogue through
 * an admitted egress port and compiles it into an immutable peer snapshot.
 *
 * How it fits: credential bytes exist only during each outbound request.
 * Discovery remains observation. Publication and admission happen later in
 * the import compiler, and active runs pin those separately reviewed refs.
 */
import { Client, StreamableHTTPClientTransport, } from '@modelcontextprotocol/client';
import { InteropBindingManifestSchema, InteropJsonSchema, compileMcpPeerSnapshot, contentHash, refuse, } from '@zero-ar/contracts';
import { MCP_PROTOCOL_VERSION, MCP_TASKS_EXTENSION, ZERO_AR_MCP_VERSION, } from "./constants.js";
function endpointBinding(binding) {
    if (binding.protocol !== 'mcp'
        || binding.direction !== 'client'
        || binding.connection.kind !== 'endpoint'
        || binding.authentication_ref === null) {
        refuse({
            code: 'interop.mcp.client.binding',
            message: 'MCP discovery requires an authenticated client binding with one admitted endpoint. Compile that binding before discovery.',
            clause: 'IOP-024',
        });
    }
    if (!binding.protocol_versions.includes(MCP_PROTOCOL_VERSION)) {
        refuse({
            code: 'interop.mcp.client.version',
            message: `The MCP client requires protocol revision ${MCP_PROTOCOL_VERSION}. Add that exact revision to the binding or use a separately tested compatibility profile.`,
            alternatives: binding.protocol_versions,
            clause: 'IOP-024',
        });
    }
}
function headerBytes(headers) {
    let bytes = 0;
    for (const [name, value] of headers)
        bytes += Buffer.byteLength(name) + Buffer.byteLength(value) + 4;
    return bytes;
}
function bodyBytes(body) {
    if (body === null || body === undefined)
        return 0;
    if (typeof body === 'string')
        return Buffer.byteLength(body);
    if (body instanceof URLSearchParams)
        return Buffer.byteLength(body.toString());
    if (body instanceof ArrayBuffer)
        return body.byteLength;
    if (ArrayBuffer.isView(body))
        return body.byteLength;
    if (body instanceof Blob)
        return body.size;
    refuse({
        code: 'interop.mcp.client.body-shape',
        message: 'The MCP transport produced a request body whose size cannot be established before egress. Use the official JSON request transport.',
        clause: 'IOP-023',
    });
}
function assertBoundedPeerJson(value, binding) {
    const stack = [{ value, depth: 0 }];
    while (stack.length > 0) {
        const current = stack.pop();
        if (current.depth > binding.limits.json_depth) {
            refuse({
                code: 'interop.mcp.client.response-depth',
                message: `The MCP response passes the ${binding.limits.json_depth}-level JSON limit. Raise the reviewed limit or correct the peer response.`,
                clause: 'IOP-023',
            });
        }
        if (typeof current.value === 'string' && Buffer.byteLength(current.value) > binding.limits.string_bytes) {
            refuse({
                code: 'interop.mcp.client.response-string',
                message: `The MCP response contains a string above the ${binding.limits.string_bytes}-byte limit. Raise the reviewed limit or correct the peer response.`,
                clause: 'IOP-023',
            });
        }
        if (Array.isArray(current.value)) {
            if (current.value.length > binding.limits.list_items) {
                refuse({
                    code: 'interop.mcp.client.response-list',
                    message: `The MCP response contains a list above the ${binding.limits.list_items}-entry limit. Raise the reviewed limit or correct the peer response.`,
                    clause: 'IOP-023',
                });
            }
            for (const item of current.value)
                stack.push({ value: item, depth: current.depth + 1 });
            continue;
        }
        if (current.value !== null && typeof current.value === 'object') {
            const entries = Object.entries(current.value);
            if (entries.length > binding.limits.list_items) {
                refuse({
                    code: 'interop.mcp.client.response-object',
                    message: `The MCP response contains an object above the ${binding.limits.list_items}-property limit. Raise the reviewed limit or correct the peer response.`,
                    clause: 'IOP-023',
                });
            }
            for (const [key, item] of entries) {
                if (Buffer.byteLength(key) > binding.limits.string_bytes) {
                    refuse({
                        code: 'interop.mcp.client.response-property',
                        message: `The MCP response contains a property name above the ${binding.limits.string_bytes}-byte limit. Raise the reviewed limit or correct the peer response.`,
                        clause: 'IOP-023',
                    });
                }
                stack.push({ value: item, depth: current.depth + 1 });
            }
        }
    }
}
async function boundedResponse(response, binding) {
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        refuse({
            code: 'interop.mcp.client.redirect',
            message: 'The MCP peer returned a redirect. Admit the destination as a new binding endpoint before following it.',
            ...(location === null ? {} : { received: location.slice(0, 256) }),
            clause: 'IOP-023',
        });
    }
    if (headerBytes(response.headers) > binding.limits.header_bytes) {
        refuse({
            code: 'interop.mcp.client.response-headers',
            message: `The MCP response headers pass the ${binding.limits.header_bytes}-byte binding limit. Raise the reviewed limit or correct the peer response.`,
            clause: 'IOP-023',
        });
    }
    const declared = Number(response.headers.get('content-length') ?? 0);
    if (Number.isFinite(declared) && declared > binding.limits.response_bytes) {
        refuse({
            code: 'interop.mcp.client.response-size',
            message: `The MCP response passes the ${binding.limits.response_bytes}-byte binding limit. Raise the reviewed limit or narrow the peer response.`,
            received: String(declared),
            clause: 'IOP-023',
        });
    }
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > binding.limits.response_bytes) {
        refuse({
            code: 'interop.mcp.client.response-size',
            message: `The MCP response passes the ${binding.limits.response_bytes}-byte binding limit. Raise the reviewed limit or narrow the peer response.`,
            received: String(bytes.byteLength),
            clause: 'IOP-023',
        });
    }
    const encoding = response.headers.get('content-encoding');
    if (encoding !== null && encoding !== 'identity' && declared > 0 && bytes.byteLength / declared > binding.limits.compression_ratio) {
        refuse({
            code: 'interop.mcp.client.compression-ratio',
            message: `The expanded MCP response passes the ${binding.limits.compression_ratio}:1 binding ratio. Raise the reviewed limit or correct the peer response.`,
            received: `${bytes.byteLength}:${declared}`,
            clause: 'IOP-023',
        });
    }
    const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    if (contentType === 'application/json') {
        const started = performance.now();
        let parsed;
        try {
            parsed = JSON.parse(new TextDecoder().decode(bytes));
        }
        catch {
            refuse({
                code: 'interop.mcp.client.response-json',
                message: 'The MCP peer returned invalid JSON. Correct the peer response before discovery.',
                clause: 'IOP-023',
            });
        }
        assertBoundedPeerJson(parsed, binding);
        if (performance.now() - started > binding.limits.validation_ms) {
            refuse({
                code: 'interop.mcp.client.validation-time',
                message: `The MCP response validation passed the ${binding.limits.validation_ms}-millisecond limit. Narrow the response or raise the reviewed limit.`,
                clause: 'IOP-023',
            });
        }
    }
    return new Response(bytes, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}
/** Build the one bounded fetch function shared by discovery and invocation. */
export function admittedMcpFetch(binding, egress) {
    const endpoint = new URL(binding.connection.endpoint).href;
    return async (input, init) => {
        const requested = new URL(input).href;
        if (requested !== endpoint) {
            refuse({
                code: 'interop.mcp.client.destination',
                message: 'The MCP transport attempted a destination outside the immutable binding. Admit that endpoint separately before egress.',
                received: requested.slice(0, 256),
                clause: 'IOP-032',
            });
        }
        const headers = new Headers(init?.headers);
        if (headerBytes(headers) > binding.limits.header_bytes) {
            refuse({
                code: 'interop.mcp.client.request-headers',
                message: `The MCP request headers pass the ${binding.limits.header_bytes}-byte binding limit. Raise the reviewed limit or correct the request.`,
                clause: 'IOP-023',
            });
        }
        const measuredBodyBytes = bodyBytes(init?.body);
        if (measuredBodyBytes > binding.limits.request_bytes) {
            refuse({
                code: 'interop.mcp.client.request-size',
                message: `The MCP request passes the ${binding.limits.request_bytes}-byte binding limit. Raise the reviewed limit or narrow the request.`,
                received: String(measuredBodyBytes),
                clause: 'IOP-023',
            });
        }
        const timeout = AbortSignal.timeout(binding.timeouts.idle_ms);
        const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
        const response = await egress.fetch(new Request(endpoint, {
            ...init,
            headers,
            redirect: 'manual',
            signal,
        }), {
            tenant: binding.tenant,
            binding_ref: binding.binding_ref,
            destination_ref: binding.connection.destination_ref,
            response_bytes: binding.limits.response_bytes,
            timeout_ms: binding.timeouts.idle_ms,
        });
        return boundedResponse(response, binding);
    };
}
function json(value, field) {
    const parsed = InteropJsonSchema.safeParse(value);
    if (!parsed.success) {
        refuse({
            code: 'interop.mcp.client.peer-json',
            message: `The MCP peer returned ${field} outside the bounded JSON vocabulary. Correct the peer response before discovery.`,
            clause: 'IOP-023',
        });
    }
    return parsed.data;
}
function normalizedTool(tool) {
    return {
        name: tool.name,
        title: tool.title ?? null,
        description: tool.description ?? null,
        input_schema: json(tool.inputSchema, `the input schema for ${tool.name}`),
        output_schema: tool.outputSchema === undefined ? null : json(tool.outputSchema, `the output schema for ${tool.name}`),
        annotations: tool.annotations === undefined ? null : json(tool.annotations, `the annotations for ${tool.name}`),
    };
}
function normalizedResource(resource) {
    const metadata = resource._meta;
    const declaredIdentity = metadata?.['io.zero-ar/contentIdentity'];
    const contentIdentity = typeof declaredIdentity === 'string' && /^sha256:[0-9a-f]{64}$/.test(declaredIdentity)
        && declaredIdentity !== `sha256:${'0'.repeat(64)}`
        ? declaredIdentity
        : null;
    return {
        uri: resource.uri,
        name: resource.name,
        media_type: resource.mimeType ?? null,
        content_identity: contentIdentity,
        authorization_boundary: 'binding-principal',
    };
}
function resultTtl(value) {
    const ttl = value.ttlMs;
    return typeof ttl === 'number' && Number.isInteger(ttl) && ttl >= 0 ? ttl : 0;
}
function resultScope(value) {
    return value.cacheScope === 'public' ? 'public' : 'private';
}
/** Discover one fresh peer catalogue and return only its immutable normalized snapshot. */
export async function discoverMcpPeer(options) {
    const binding = InteropBindingManifestSchema.parse(options.binding);
    endpointBinding(binding);
    const fetch = admittedMcpFetch(binding, options.egress);
    const credentials = options.credentials;
    const client = new Client({ name: '@zero-ar/mcp', version: ZERO_AR_MCP_VERSION }, {
        capabilities: { extensions: Object.fromEntries(binding.extensions.required.map((extension) => [extension, {}])) },
        versionNegotiation: { mode: { pin: MCP_PROTOCOL_VERSION }, probe: { timeoutMs: binding.timeouts.connect_ms, maxRetries: 0 } },
        enforceStrictCapabilities: true,
        listMaxPages: Math.max(1, Math.ceil(binding.limits.list_items / 100)),
        defaultCacheTtlMs: 0,
        cachePartition: `${binding.tenant}:${options.authenticated_peer}`,
    });
    const transport = new StreamableHTTPClientTransport(new URL(binding.connection.endpoint), {
        authProvider: {
            token: async () => {
                const signal = AbortSignal.timeout(binding.timeouts.connect_ms);
                const credential = await credentials.resolve(binding.authentication_ref, {
                    tenant: binding.tenant,
                    binding_ref: binding.binding_ref,
                    destination_ref: binding.connection.destination_ref,
                    signal,
                });
                if (credential.length === 0 || Buffer.byteLength(credential) > binding.limits.header_bytes) {
                    refuse({
                        code: 'interop.mcp.client.credential',
                        message: 'The named MCP credential is empty or passes the binding header limit. Correct the secret without placing its bytes in configuration.',
                        clause: 'IOP-032',
                    });
                }
                return credential;
            },
        },
        fetch,
        onInsufficientScope: 'throw',
        maxStepUpRetries: 0,
    });
    try {
        await client.connect(transport, { timeout: binding.timeouts.connect_ms, maxTotalTimeout: binding.timeouts.connect_ms });
        const discover = client.getDiscoverResult();
        if (!discover || client.getNegotiatedProtocolVersion() !== MCP_PROTOCOL_VERSION || !discover.supportedVersions.includes(MCP_PROTOCOL_VERSION)) {
            refuse({
                code: 'interop.mcp.client.negotiation',
                message: `The peer did not negotiate MCP ${MCP_PROTOCOL_VERSION}. Use an endpoint that offers the pinned revision or compile a separately tested compatibility profile.`,
                clause: 'IOP-019',
            });
        }
        const extensions = Object.keys(discover.capabilities.extensions ?? {}).sort();
        const missing = binding.extensions.required.filter((extension) => !extensions.includes(extension));
        if (missing.length > 0) {
            refuse({
                code: 'interop.mcp.client.extension',
                message: `The peer does not offer required extensions: ${missing.join(', ')}. Change the binding or use a peer with those capabilities.`,
                alternatives: extensions,
                clause: 'IOP-021',
            });
        }
        const [toolsResult, resourcesResult] = await Promise.all([
            client.listTools(undefined, { cacheMode: 'bypass', timeout: binding.timeouts.idle_ms, maxTotalTimeout: binding.timeouts.idle_ms }),
            client.listResources(undefined, { cacheMode: 'bypass', timeout: binding.timeouts.idle_ms, maxTotalTimeout: binding.timeouts.idle_ms }),
        ]);
        if (toolsResult.tools.length > binding.limits.list_items || resourcesResult.resources.length > binding.limits.list_items) {
            refuse({
                code: 'interop.mcp.client.catalogue-size',
                message: `The MCP catalogue passes the ${binding.limits.list_items}-entry binding limit. Narrow the peer view or raise the reviewed limit.`,
                clause: 'IOP-023',
            });
        }
        const tools = toolsResult.tools.map(normalizedTool).sort((left, right) => left.name.localeCompare(right.name));
        const resources = resourcesResult.resources.map(normalizedResource).sort((left, right) => left.uri.localeCompare(right.uri));
        const ttlMs = Math.min(resultTtl(discover), resultTtl(toolsResult), resultTtl(resourcesResult));
        const cacheScope = [resultScope(discover), resultScope(toolsResult), resultScope(resourcesResult)].includes('private') ? 'private' : 'public';
        const retrievedAt = (options.now ?? (() => new Date()))();
        const warnings = [
            'Peer instructions and prompts were not imported.',
            ...(resources.some((resource) => resource.content_identity === null)
                ? ['One or more peer resources lack content identity and cannot serve as immutable evidence by URI alone.']
                : []),
        ];
        const normalized = {
            binding_ref: binding.binding_ref,
            endpoint: binding.connection.endpoint,
            authenticated_peer: options.authenticated_peer,
            protocol: 'mcp',
            protocol_version: MCP_PROTOCOL_VERSION,
            extensions,
            tools,
            resources,
            warnings,
        };
        return compileMcpPeerSnapshot({
            format: 'zero-ar-interop-peer-snapshot/1',
            ...normalized,
            normalized_ref: contentHash(normalized),
            retrieved_at: retrievedAt.toISOString(),
            expires_at: new Date(retrievedAt.getTime() + ttlMs).toISOString(),
            cache: { ttl_ms: ttlMs, scope: cacheScope },
        });
    }
    finally {
        await client.close();
    }
}
/** The first client release supports the core revision and optional Tasks metadata. */
export const ZERO_AR_MCP_CLIENT_CAPABILITIES = Object.freeze({
    protocol_version: MCP_PROTOCOL_VERSION,
    understood_extensions: [MCP_TASKS_EXTENSION],
    imports: ['tools', 'resources'],
    prompts: 'omitted',
});
