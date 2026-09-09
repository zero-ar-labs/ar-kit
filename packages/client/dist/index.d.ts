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
import type { CommandTarget, ImportOutcome, ObservationEvent, PublicationBlobUploadStatus, RuntimeArtifactSessionStatus } from '@zero-ar/contracts';
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
    /** One bounded raw publication chunk. The caller resumes from the returned offset. */
    stagePublicationBlobChunk(session_id: string, content_ref: string, offset: number, bytes: Uint8Array): Promise<PublicationBlobUploadStatus>;
    /** One bounded runtime artifact chunk. The durable session owns the next offset. */
    stageRuntimeArtifactChunk(session_id: string, offset: number, bytes: Uint8Array): Promise<RuntimeArtifactSessionStatus>;
    /** Follow durable observation until the signal aborts or the run finishes. */
    streamRecords(run_id: string, after: number, onEvent: (event: ObservationEvent) => void, signal: AbortSignal): Promise<void>;
    /** Follow the lossy transient channel. Never treat these as state (X-1). */
    streamProgress(run_id: string, onText: (text: string) => void, signal: AbortSignal): Promise<void>;
    private stream;
}
