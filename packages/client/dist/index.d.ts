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
import type { CommandTarget, ImportOutcome, ObservationEvent, PublicationBlobUploadStatus, PublicationImportOutcome, RuntimeArtifactSessionStatus } from '@zero-ar/contracts';
import { GeneratedRoutes } from './generated.js';
export type { CreatedRun } from '@zero-ar/contracts';
export { GeneratedRoutes } from './generated.js';
export type { GeneratedTransport } from './generated.js';
export interface ClientOptions {
    /** Sent with every request. A shared cell reads the tenant key from Authorization. */
    headers?: Record<string, string>;
}
export interface BundledRuntimeEndpoint {
    base_url: string;
    stop: () => void | Promise<void>;
}
export interface RuntimeTargetConnection {
    client: ZeroARClient;
    target: CommandTarget;
    close: () => Promise<void>;
}
export interface ConnectRuntimeTargetOptions {
    target: CommandTarget;
    environment: Record<string, string | undefined>;
    start_bundled: () => Promise<BundledRuntimeEndpoint>;
}
/** Open exactly the selected target, prove compatibility, and never fall back. */
export declare function connectRuntimeTarget(options: ConnectRuntimeTargetOptions): Promise<RuntimeTargetConnection>;
export declare class ZeroARClient extends GeneratedRoutes {
    private readonly base;
    private readonly headers;
    constructor(baseUrl: string, options?: ClientOptions);
    /** The canonical run bundle as framed JSON lines. */
    exportRun(run_id: string): Promise<string>;
    importRun(bundle: string): Promise<ImportOutcome>;
    /** One publication closure as framed JSON lines: the bundle, its blobs, then a checksum. */
    exportPublication(publication_ref: string): Promise<string>;
    /** Commit an exported publication closure under this tenant. Aliases, grants and credentials never travel. */
    importPublication(bundle: string): Promise<PublicationImportOutcome>;
    /** One bounded raw publication chunk. The caller resumes from the returned offset. */
    stagePublicationBlobChunk(session_id: string, content_ref: string, offset: number, bytes: Uint8Array): Promise<PublicationBlobUploadStatus>;
    /** One bounded runtime artifact chunk. The durable session owns the next offset. */
    stageRuntimeArtifactChunk(session_id: string, offset: number, bytes: Uint8Array): Promise<RuntimeArtifactSessionStatus>;
    /**
     * Follow durable observation until the run settles or the signal aborts.
     * The run settles at its terminal, or at a suspension after
     * settle_after_record_seq that no later resume or start replaced, so a
     * replay from an early cursor passes over suspensions already resumed.
     * A terminal-only follow crosses every suspension and ends only at a
     * durable terminal record.
     * A dropped stream resumes from its cursor; losing a connection loses
     * nothing.
     */
    streamRecords(run_id: string, after: number, onEvent: (event: ObservationEvent) => void, signal: AbortSignal, options?: {
        settle_after_record_seq?: number;
        terminal_only?: boolean;
    }): Promise<void>;
    /**
     * The durable record stream as an async iterable that reconnects from the
     * last event id whenever the stream ends or the connection drops, until
     * the run settles as streamRecords defines it or the signal aborts. A
     * refusal such as an unknown run throws at once, and so does a frame this
     * client cannot read, as client.stream.unreadable naming the event; a
     * runtime unreachable for the whole retry budget throws
     * client.stream.unavailable naming the cursor to follow again from.
     */
    followRecords(run_id: string, options?: FollowRecordsOptions): AsyncGenerator<ObservationEvent, void, void>;
    /** Follow the lossy transient channel. Never treat these as state (X-1). It does not reconnect. */
    streamProgress(run_id: string, onText: (text: string) => void, signal: AbortSignal): Promise<void>;
    /** A suspension settles only when the caller accepts suspension as an outcome. */
    private settles;
    /**
     * One event-stream connection as parsed frames. It ends when the server
     * ends the body, throws on a dropped connection or an idle gap longer
     * than idle_ms, and marks a refusal the server answered so followers do
     * not retry it.
     */
    private frames;
}
export interface FollowRecordsOptions {
    /** The outbox sequence to follow from. Zero replays from the start. */
    after?: number;
    signal?: AbortSignal;
    /** A suspension at or below this record sequence never settles the follow. Default zero. */
    settle_after_record_seq?: number;
    /** Follow past every suspension until a terminal record arrives. Default false. */
    terminal_only?: boolean;
    /** How long consecutive failed connections may last before the follow throws. Default 60000 ms. */
    retry_budget_ms?: number;
    /** How long a connection may carry no bytes before it counts as dropped. Default 60000 ms. */
    idle_timeout_ms?: number;
}
/** One dispatched event-stream frame. */
export interface EventStreamFrame {
    event: string;
    data: string;
    /** The last event id in force when the frame dispatched, or null when none was sent. */
    id: string | null;
}
/**
 * The event-stream line grammar: CRLF, LF and lone CR all end a line, a
 * trailing CR waits for the next chunk in case LF follows, lines starting
 * with a colon are comments, one space after the field colon is optional,
 * data lines join with a line feed, and a blank line dispatches.
 */
export declare class EventStreamParser {
    private buffer;
    private data;
    private event;
    private lastId;
    push(text: string, final: boolean): EventStreamFrame[];
    private line;
}
