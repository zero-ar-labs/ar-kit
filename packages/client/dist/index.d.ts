import type { CommandTarget, ImportOutcome, ObservationEvent, PublicationBlobUploadStatus, PublicationImportOutcome, RuntimeArtifactSessionStatus } from '@zero-ar/contracts';
import { GeneratedRoutes } from './generated.js';
export type { CreatedRun } from '@zero-ar/contracts';
export { GeneratedRoutes } from './generated.js';
export type { GeneratedTransport } from './generated.js';
export interface ClientOptions {
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
export declare function connectRuntimeTarget(options: ConnectRuntimeTargetOptions): Promise<RuntimeTargetConnection>;
export declare class ZeroARClient extends GeneratedRoutes {
    private readonly base;
    private readonly headers;
    constructor(baseUrl: string, options?: ClientOptions);
    exportRun(run_id: string): Promise<string>;
    importRun(bundle: string): Promise<ImportOutcome>;
    exportPublication(publication_ref: string): Promise<string>;
    importPublication(bundle: string): Promise<PublicationImportOutcome>;
    stagePublicationBlobChunk(session_id: string, content_ref: string, offset: number, bytes: Uint8Array): Promise<PublicationBlobUploadStatus>;
    stageRuntimeArtifactChunk(session_id: string, offset: number, bytes: Uint8Array): Promise<RuntimeArtifactSessionStatus>;
    streamRecords(run_id: string, after: number, onEvent: (event: ObservationEvent) => void, signal: AbortSignal, options?: {
        settle_after_record_seq?: number;
        terminal_only?: boolean;
    }): Promise<void>;
    followRecords(run_id: string, options?: FollowRecordsOptions): AsyncGenerator<ObservationEvent, void, void>;
    streamProgress(run_id: string, onText: (text: string) => void, signal: AbortSignal): Promise<void>;
    private settles;
    private frames;
}
export interface FollowRecordsOptions {
    after?: number;
    signal?: AbortSignal;
    settle_after_record_seq?: number;
    terminal_only?: boolean;
    retry_budget_ms?: number;
    idle_timeout_ms?: number;
}
export interface EventStreamFrame {
    event: string;
    data: string;
    id: string | null;
}
export declare class EventStreamParser {
    private buffer;
    private data;
    private event;
    private lastId;
    push(text: string, final: boolean): EventStreamFrame[];
    private line;
}
