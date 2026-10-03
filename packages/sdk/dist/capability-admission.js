/**
 * Public capability-admission publication helpers.
 *
 * Junior guide: a local skill path ends in this file. The compiler turns
 * it into immutable bytes, the public client stages those bytes, and only
 * content hashes cross the runtime boundary. Run admission still happens
 * through the generated API and the server's policy checks.
 */
import { ProcedureManifestSchema, refuse, verifyBundle } from '@zero-ar/contracts';
import { compileAuthoringSource } from "./publication.js";
const PUBLICATION_CHUNK_BYTES = 256 * 1024;
const MAX_JSON_PUBLICATION_BYTES = 4_000_000;
/** Compile and publish one local Agent Skill without sending its local path. */
export async function publishCapabilitySource(client, sourcePath) {
    const compiled = await compileAuthoringSource(sourcePath);
    verifyBundle(compiled.bundle, compiled.blobs);
    if (compiled.bundle.root_kind !== 'procedure') {
        refuse({
            code: 'sdk.capability.source-kind',
            message: `the local capability source compiled as ${compiled.bundle.root_kind}, not an Agent Skill. Select the directory containing SKILL.md.`,
            clause: 'DCA-004',
        });
    }
    const rootBytes = compiled.blobs.get(compiled.bundle.root_ref);
    const procedure = ProcedureManifestSchema.safeParse(rootBytes ? JSON.parse(rootBytes) : null);
    if (!procedure.success) {
        refuse({
            code: 'sdk.capability.skill-invalid',
            message: 'the compiled skill root is missing or does not satisfy the procedure manifest. Fix the Agent Skill and compile it again.',
            clause: 'DCA-004',
        });
    }
    const receipt = await commitCompiledPublication(client, compiled);
    return {
        publication_ref: receipt.publication_ref,
        root_ref: compiled.bundle.root_ref,
        procedure: procedure.data,
        receipt,
    };
}
/** Commit one verified compiled closure through resumable public routes. */
export async function commitCompiledPublication(client, compiled) {
    verifyBundle(compiled.bundle, compiled.blobs);
    const session = await client.createPublicationSession({ bundle: compiled.bundle });
    const assets = new Set(compiled.bundle.assets.map((asset) => asset.content_ref));
    for (const contentRef of session.missing_blobs) {
        const bytes = compiled.blobs.get(contentRef);
        if (bytes === undefined) {
            refuse({
                code: 'sdk.publication.blob-missing',
                message: `the compiled closure does not contain ${contentRef}, so publication cannot continue. Compile the complete source again.`,
                clause: 'PUB-008',
            });
        }
        const encoded = Buffer.from(bytes, 'utf8');
        if (assets.has(contentRef) && encoded.byteLength > MAX_JSON_PUBLICATION_BYTES) {
            await stageAsset(client, session.session_id, contentRef, encoded);
            continue;
        }
        if (encoded.byteLength > MAX_JSON_PUBLICATION_BYTES) {
            refuse({
                code: 'sdk.publication.declaration-limit',
                message: `declaration ${contentRef.slice(0, 20)} exceeds the bounded JSON publication frame. Split the declaration before publishing.`,
                clause: 'PUB-NFR-002',
            });
        }
        await client.stagePublicationBlob(session.session_id, { content_ref: contentRef, bytes });
    }
    return client.commitPublication(session.session_id, {});
}
async function stageAsset(client, sessionId, contentRef, bytes) {
    let offset = (await client.publicationBlobUploadStatus(sessionId, contentRef)).offset;
    while (offset < bytes.byteLength) {
        const end = Math.min(offset + PUBLICATION_CHUNK_BYTES, bytes.byteLength);
        offset = (await client.stagePublicationBlobChunk(sessionId, contentRef, offset, bytes.subarray(offset, end))).offset;
    }
    await client.finishPublicationBlobUpload(sessionId, contentRef);
}
