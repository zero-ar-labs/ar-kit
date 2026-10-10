import type { ProcedureManifest, PublicationReceipt } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
import type { CompiledBundle } from './publication.js';
export interface PublishedCapabilityCandidate {
    publication_ref: string;
    root_ref: string;
    procedure: ProcedureManifest;
    receipt: PublicationReceipt;
}
export declare function publishCapabilitySource(client: ZeroARClient, sourcePath: string): Promise<PublishedCapabilityCandidate>;
export declare function commitCompiledPublication(client: ZeroARClient, compiled: CompiledBundle): Promise<PublicationReceipt>;
