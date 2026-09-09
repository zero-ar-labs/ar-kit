/**
 * @zero-ar/client: the typed public API client.
 *
 * What this is: the only supported path to the runtime for the CLI, the
 * SDK, and every other surface. The json routes come from the generated
 * module, rendered from the contract route table, so this file cannot
 * invent a path the contract does not declare (XCV-003). What stays
 * hand-written is transport: fetch, the diagnostic envelope, bundle
 * transfer, and server-sent events parsed by hand.
 *
 * How it fits: a refused request throws DiagnosticError carrying the
 * server's envelope, so a caller renders the same refusal the server
 * wrote. Durable streaming resumes from a sequence cursor; losing the
 * connection loses nothing.
 */
import { CONTRACT_VERSION, DiagnosticError, ObservationEventSchema, refuse, resolveProductEnvironment, routePath } from '@zero-ar/contracts';
import { GeneratedRoutes } from "./generated.js";
export { GeneratedRoutes } from "./generated.js";
const RAW_UPLOAD_TRANSFER_CHUNK_BYTES = 256 * 1024;
function uploadByteStream(bytes) {
    let position = 0;
    return new ReadableStream({
        pull(controller) {
            if (position >= bytes.byteLength) {
                controller.close();
                return;
            }
            const next = Math.min(position + RAW_UPLOAD_TRANSFER_CHUNK_BYTES, bytes.byteLength);
            controller.enqueue(bytes.subarray(position, next));
            position = next;
        },
    });
}
class FetchTransport {
    base;
    headers;
    constructor(base, headers) {
        this.base = base;
        this.headers = headers;
    }
    async json(method, path, body, requestHeaders = {}) {
        const response = await fetch(this.base + path, {
            method,
            headers: { ...this.headers, ...requestHeaders, ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        if (!response.ok)
            throw await toError(response);
        return (await response.json());
    }
}
/** Open exactly the selected target, prove compatibility, and never fall back. */
export async function connectRuntimeTarget(options) {
    let bundled = null;
    let client;
    if (options.target.mode === 'hosted') {
        const credential = resolveProductEnvironment('API_KEY', options.environment);
        if (!credential.value?.trim()) {
            refuse({
                code: 'cli.target.auth.missing',
                message: `the hosted target was selected by ${options.target.source}, but ZERO_AR_API_KEY is absent. Set it for this invocation and retry the same target.`,
                path: credential.name,
                alternatives: [credential.name],
                clause: 'DXI-038',
            });
        }
        client = new ZeroARClient(options.target.base_url, { headers: { authorization: `Bearer ${credential.value}` } });
    }
    else {
        bundled = await options.start_bundled();
        client = new ZeroARClient(bundled.base_url);
    }
    try {
        const health = await client.health();
        if (health.product !== 'zero-ar' || health.contract_version !== CONTRACT_VERSION) {
            refuse({
                code: 'cli.target.contract.incompatible',
                message: `the selected ${options.target.mode} target does not expose the ${CONTRACT_VERSION} Zero-AR contract. Point the command at a compatible target.`,
                path: options.target.source,
                alternatives: [`Zero-AR ${CONTRACT_VERSION}`],
                clause: 'DXI-038',
            });
        }
        if (health.readiness !== 'ready') {
            refuse({
                code: 'cli.target.readiness.unavailable',
                message: `the selected ${options.target.mode} target is reachable but not ready. Restore its required components and retry the same target.`,
                path: options.target.source,
                clause: 'DXI-038',
            });
        }
    }
    catch (error) {
        if (bundled)
            await bundled.stop();
        if (error instanceof DiagnosticError)
            throw error;
        refuse({
            code: 'cli.target.unreachable',
            message: `the selected ${options.target.mode} target could not answer its compatibility probe. Restore reachability and retry the same target.`,
            path: options.target.source,
            clause: 'DXI-038',
        });
    }
    let closed = false;
    return {
        client,
        target: options.target,
        close: async () => {
            if (closed)
                return;
            closed = true;
            await bundled?.stop();
        },
    };
}
export class ZeroARClient extends GeneratedRoutes {
    base;
    headers;
    constructor(baseUrl, options = {}) {
        const base = baseUrl.replace(/\/$/, '');
        const headers = options.headers ?? {};
        super(new FetchTransport(base, headers));
        this.base = base;
        this.headers = headers;
    }
    /** The canonical run bundle as framed JSON lines. */
    async exportRun(run_id) {
        const response = await fetch(this.base + routePath('exportRun', { run_id }), { headers: this.headers });
        if (!response.ok)
            throw await toError(response);
        return response.text();
    }
    async importRun(bundle) {
        const response = await fetch(this.base + routePath('importRun'), {
            method: 'POST',
            headers: { ...this.headers, 'content-type': 'application/x-ndjson' },
            body: bundle,
        });
        if (!response.ok)
            throw await toError(response);
        return (await response.json());
    }
    /** One bounded raw publication chunk. The caller resumes from the returned offset. */
    async stagePublicationBlobChunk(session_id, content_ref, offset, bytes) {
        const response = await fetch(this.base + routePath('stagePublicationBlobChunk', { session_id, content_ref }), {
            method: 'POST',
            headers: { ...this.headers, 'content-type': 'application/octet-stream', 'content-length': String(bytes.byteLength), 'upload-offset': String(offset) },
            body: uploadByteStream(bytes),
            duplex: 'half',
        });
        if (!response.ok)
            throw await toError(response);
        return (await response.json());
    }
    /** One bounded runtime artifact chunk. The durable session owns the next offset. */
    async stageRuntimeArtifactChunk(session_id, offset, bytes) {
        const response = await fetch(this.base + routePath('stageRuntimeArtifactChunk', { session_id }), {
            method: 'POST',
            headers: { ...this.headers, 'content-type': 'application/octet-stream', 'content-length': String(bytes.byteLength), 'upload-offset': String(offset) },
            body: uploadByteStream(bytes),
            duplex: 'half',
        });
        if (!response.ok)
            throw await toError(response);
        return (await response.json());
    }
    /** Follow durable observation until the signal aborts or the run finishes. */
    async streamRecords(run_id, after, onEvent, signal) {
        await this.stream(`${routePath('streamRecords', { run_id })}?after=${after}`, signal, (name, data) => {
            const event = ObservationEventSchema.parse(JSON.parse(data));
            onEvent(event);
            if (name === 'run.finished' || name === 'run.cancelled' || name === 'run.suspended')
                return 'stop';
            return 'continue';
        });
    }
    /** Follow the lossy transient channel. Never treat these as state (X-1). */
    streamProgress(run_id, onText, signal) {
        return this.stream(routePath('streamProgress', { run_id }), signal, (name, data) => {
            if (name === 'text_delta')
                onText(JSON.parse(data).text);
            return 'continue';
        });
    }
    async stream(path, signal, onEvent) {
        const response = await fetch(this.base + path, { signal, headers: this.headers });
        if (!response.ok || !response.body)
            throw await toError(response);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    return;
                buffer += decoder.decode(value, { stream: true });
                let boundary;
                while ((boundary = buffer.indexOf('\n\n')) >= 0) {
                    const frame = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 2);
                    let name = 'message';
                    let data = '';
                    for (const line of frame.split('\n')) {
                        if (line.startsWith('event: '))
                            name = line.slice(7);
                        else if (line.startsWith('data: '))
                            data = line.slice(6);
                    }
                    if (data && onEvent(name, data) === 'stop') {
                        await reader.cancel();
                        return;
                    }
                    if (signal.aborted) {
                        await reader.cancel();
                        return;
                    }
                }
            }
        }
        catch (error) {
            if (signal.aborted)
                return;
            throw error;
        }
    }
}
async function toError(response) {
    try {
        const body = (await response.json());
        if (body.diagnostic)
            return new DiagnosticError(body.diagnostic);
    }
    catch {
        // fall through to the plain error below
    }
    return new Error(`the server answered ${response.status} with no diagnostic envelope.`);
}
