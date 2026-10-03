/**
 * Public capability-admission publication helpers.
 *
 * Junior guide: a local skill path ends in this file. The compiler turns
 * it into immutable bytes, the public client stages those bytes, and only
 * content hashes cross the runtime boundary. Run admission still happens
 * through the generated API and the server's policy checks.
 */
import type { ProcedureManifest, PublicationReceipt } from '@zero-ar/contracts';
import type { ZeroARClient } from '@zero-ar/client';
import type { CompiledBundle } from './publication.js';
export interface PublishedCapabilityCandidate {
    publication_ref: string;
    root_ref: string;
    procedure: ProcedureManifest;
    receipt: PublicationReceipt;
}
/** Compile and publish one local Agent Skill without sending its local path. */
export declare function publishCapabilitySource(client: ZeroARClient, sourcePath: string): Promise<PublishedCapabilityCandidate>;
/** Commit one verified compiled closure through resumable public routes. */
export declare function commitCompiledPublication(client: ZeroARClient, compiled: CompiledBundle): Promise<PublicationReceipt>;
