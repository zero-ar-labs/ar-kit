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
    async exportPublication(publication_ref) {
        const response = await fetch(this.base + routePath('exportPublication', { publication_ref }), { headers: this.headers });
        if (!response.ok)
            throw await toError(response);
        return response.text();
    }
    async importPublication(bundle) {
        const response = await fetch(this.base + routePath('importPublication'), {
            method: 'POST',
            headers: { ...this.headers, 'content-type': 'application/x-ndjson' },
            body: bundle,
        });
        if (!response.ok)
            throw await toError(response);
        return (await response.json());
    }
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
    async streamRecords(run_id, after, onEvent, signal, options = {}) {
        for await (const event of this.followRecords(run_id, { ...options, after, signal }))
            onEvent(event);
    }
    async *followRecords(run_id, options = {}) {
        const signal = options.signal;
        const floor = options.settle_after_record_seq ?? 0;
        const budget = options.retry_budget_ms ?? 60_000;
        const idle = options.idle_timeout_ms ?? 60_000;
        let cursor = options.after ?? 0;
        let backoff = FOLLOW_INITIAL_BACKOFF_MS;
        let failingSince = null;
        let unchecked = null;
        while (!signal?.aborted) {
            try {
                if (unchecked) {
                    if (await this.settles(run_id, unchecked, floor, options.terminal_only ?? false))
                        return;
                    unchecked = null;
                }
                for await (const frame of this.frames(`${routePath('streamRecords', { run_id })}?after=${cursor}`, signal, idle)) {
                    if (!frame.data)
                        continue;
                    const event = readObservationFrame(run_id, frame);
                    failingSince = null;
                    backoff = FOLLOW_INITIAL_BACKOFF_MS;
                    cursor = frame.id !== null && /^[0-9]+$/.test(frame.id) ? Number(frame.id) : event.seq;
                    yield event;
                    unchecked = event;
                    if (await this.settles(run_id, event, floor, options.terminal_only ?? false))
                        return;
                    unchecked = null;
                }
                failingSince = null;
            }
            catch (error) {
                if (signal?.aborted)
                    return;
                if (refusals.has(error) || (unchecked && error instanceof DiagnosticError))
                    throw error;
                failingSince ??= Date.now();
                if (Date.now() - failingSince >= budget) {
                    throw new DiagnosticError({
                        severity: 'error',
                        code: 'client.stream.unavailable',
                        message: `the durable record stream for run ${run_id} stayed unreachable for ${Math.round(budget / 1_000)} s after cursor ${cursor}: ${error instanceof Error ? error.message : String(error)}. The run's durable state is unchanged; follow it again from cursor ${cursor} once the runtime is reachable.`,
                        path: 'after',
                        received: String(cursor),
                        fix: `attach ${run_id} --after ${cursor}`,
                    });
                }
            }
            await pause(backoff, signal);
            backoff = Math.min(backoff * 2, FOLLOW_MAX_BACKOFF_MS);
        }
    }
    async streamProgress(run_id, onText, signal) {
        try {
            for await (const frame of this.frames(routePath('streamProgress', { run_id }), signal, null)) {
                if (frame.event === 'text_delta' && frame.data)
                    onText(JSON.parse(frame.data).text);
            }
        }
        catch (error) {
            if (signal.aborted)
                return;
            throw error;
        }
    }
    async settles(run_id, event, floor, terminalOnly) {
        if (event.event === 'run.finished' || event.event === 'run.cancelled')
            return true;
        if (terminalOnly)
            return false;
        if (event.event !== 'run.suspended' || event.record_seq <= floor)
            return false;
        const later = await this.records(run_id, event.record_seq);
        return !later.records.some((record) => record.type === 'run.resumed' || record.type === 'run.started');
    }
    async *frames(path, signal, idle_ms) {
        const connection = new AbortController();
        const forward = () => connection.abort(signal?.reason);
        if (signal?.aborted)
            return;
        signal?.addEventListener('abort', forward, { once: true });
        let idleTimer;
        let idleExpired = false;
        const armIdle = () => {
            if (idle_ms === null)
                return;
            if (idleTimer)
                clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                idleExpired = true;
                connection.abort(new Error(`the stream carried no bytes for ${idle_ms} ms`));
            }, idle_ms);
            idleTimer.unref?.();
        };
        let reader = null;
        try {
            armIdle();
            let response;
            try {
                response = await fetch(this.base + path, { signal: connection.signal, headers: { ...this.headers, accept: 'text/event-stream' } });
            }
            catch (error) {
                if (signal?.aborted)
                    return;
                throw idleExpired ? new Error(`the stream carried no bytes for ${idle_ms} ms`) : error;
            }
            if (!response.ok || !response.body) {
                const error = await toError(response);
                if (response.status >= 400 && response.status < 500)
                    refusals.add(error);
                throw error;
            }
            reader = response.body.getReader();
            const decoder = new TextDecoder();
            const parser = new EventStreamParser();
            while (true) {
                let chunk;
                try {
                    chunk = await reader.read();
                }
                catch (error) {
                    if (signal?.aborted)
                        return;
                    throw idleExpired ? new Error(`the stream carried no bytes for ${idle_ms} ms`) : error;
                }
                if (chunk.done) {
                    for (const frame of parser.push(decoder.decode(), true))
                        yield frame;
                    return;
                }
                armIdle();
                for (const frame of parser.push(decoder.decode(chunk.value, { stream: true }), false)) {
                    yield frame;
                    if (signal?.aborted)
                        return;
                }
            }
        }
        finally {
            if (idleTimer)
                clearTimeout(idleTimer);
            signal?.removeEventListener('abort', forward);
            if (reader)
                await reader.cancel().catch(() => undefined);
            connection.abort();
        }
    }
}
const FOLLOW_INITIAL_BACKOFF_MS = 250;
const FOLLOW_MAX_BACKOFF_MS = 5_000;
const refusals = new WeakSet();
export class EventStreamParser {
    buffer = '';
    data = [];
    event = '';
    lastId = null;
    push(text, final) {
        this.buffer += text;
        const frames = [];
        let start = 0;
        for (let index = 0; index < this.buffer.length; index += 1) {
            const character = this.buffer[index];
            if (character !== '\n' && character !== '\r')
                continue;
            if (character === '\r' && index === this.buffer.length - 1 && !final)
                break;
            const line = this.buffer.slice(start, index);
            if (character === '\r' && this.buffer[index + 1] === '\n')
                index += 1;
            start = index + 1;
            const frame = this.line(line);
            if (frame)
                frames.push(frame);
        }
        this.buffer = this.buffer.slice(start);
        if (final && this.buffer.length > 0) {
            const frame = this.line(this.buffer);
            if (frame)
                frames.push(frame);
            this.buffer = '';
        }
        return frames;
    }
    line(line) {
        if (line === '') {
            if (this.data.length === 0) {
                this.event = '';
                return null;
            }
            const frame = { event: this.event || 'message', data: this.data.join('\n'), id: this.lastId };
            this.data = [];
            this.event = '';
            return frame;
        }
        if (line.startsWith(':'))
            return null;
        const colon = line.indexOf(':');
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? '' : line.slice(colon + 1);
        if (value.startsWith(' '))
            value = value.slice(1);
        if (field === 'data')
            this.data.push(value);
        else if (field === 'event')
            this.event = value;
        else if (field === 'id' && !value.includes('\u0000'))
            this.lastId = value;
        return null;
    }
}
function readObservationFrame(run_id, frame) {
    let reason;
    try {
        const parsed = ObservationEventSchema.safeParse(JSON.parse(frame.data));
        if (parsed.success)
            return parsed.data;
        reason = parsed.error.issues[0]?.message ?? 'the event does not match the observation schema';
    }
    catch (error) {
        reason = `the data is not JSON: ${error instanceof Error ? error.message : String(error)}`;
    }
    const failure = new DiagnosticError({
        severity: 'error',
        code: 'client.stream.unreadable',
        message: `the durable record stream for run ${run_id} sent event ${frame.event} with id ${frame.id ?? 'none'} that this client cannot read: ${reason}. A newer runtime may send events this client does not know; upgrade the client, then follow again from the last id read.`,
        path: 'event',
        received: frame.event,
    });
    refusals.add(failure);
    throw failure;
}
function pause(ms, signal) {
    if (signal?.aborted)
        return Promise.resolve();
    return new Promise((resolve) => {
        const done = () => {
            clearTimeout(timer);
            signal?.removeEventListener('abort', done);
            resolve();
        };
        const timer = setTimeout(done, ms);
        signal?.addEventListener('abort', done, { once: true });
    });
}
async function toError(response) {
    try {
        const body = (await response.json());
        if (body.diagnostic)
            return new DiagnosticError(body.diagnostic);
    }
    catch {
    }
    return new Error(`the server answered ${response.status} with no diagnostic envelope.`);
}
