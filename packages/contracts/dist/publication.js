/**
 * Publication contracts (hosted-publication appendix, phase HP0).
 *
 * What this is: the canonical shapes of a publication closure. A bundle
 * carries one root declaration, its complete dependency graph, and
 * content-addressed assets; a receipt names exactly what was admitted and
 * stored and what that does not establish. Names and versions are
 * discovery aids; runs pin content refs (PUB-004, PUB-005).
 *
 * How it fits: these shapes ride the operator-management contract family.
 * They add no runtime state machine and no execution authority. The SDK
 * compiles bundles, the server admits them, and both speak only these
 * generated contracts (PUB-014, PUB-024).
 */
import { z } from 'zod';
import { PRODUCT_IDENTITY_MIGRATION_IMPACTS, PRODUCT_SOURCE_API_VERSIONS, PUBLICATION_EDGE_KINDS, PUBLICATION_KINDS, SKILL_ACTIVATION_POLICIES, } from "./vocab.js";
import { contentHash } from "./ids.js";
import { spanHash } from "./claims.js";
import { refuse } from "./diagnostics.js";
const ref = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const name = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected lowercase dot-separated naming');
const version = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const identitySurface = z.string().min(1).max(160).regex(/^[A-Za-z0-9@._:/+-]+$/, 'expected a bounded surface label, not prose or secret material');
const decisionRef = z.string().min(1).max(256).regex(/^[A-Za-z0-9@._:/#+-]+$/, 'expected a bounded decision reference');
/** One compiled declaration in the closure, named for discovery, pinned by ref. */
export const PublicationDeclarationEntrySchema = z.strictObject({
    kind: z.enum(PUBLICATION_KINDS),
    name,
    version,
    content_ref: ref,
});
/** One content-addressed asset: exact bytes a declaration includes. */
export const PublicationAssetEntrySchema = z.strictObject({
    content_ref: ref,
    bytes: z.number().int().min(0),
    media_type: z.string().min(1).max(128),
    classification: z.string().min(1).max(64),
    role: z.string().min(1).max(64),
});
/** One typed edge; the closure is complete when every edge resolves inside the bundle. */
export const PublicationDependencyEdgeSchema = z.strictObject({
    from_ref: ref,
    to_ref: ref,
    kind: z.enum(PUBLICATION_EDGE_KINDS),
});
/**
 * The canonical bundle manifest. Sorted lists and relative paths keep it
 * deterministic: identical sources compile to an identical bundle_ref on
 * any supported machine (PUB-001, PUB-010).
 */
export const PublicationBundleManifestSchema = z.strictObject({
    format_version: z.literal('1.0.0'),
    root_kind: z.enum(PUBLICATION_KINDS),
    root_ref: ref,
    declarations: z.array(PublicationDeclarationEntrySchema),
    assets: z.array(PublicationAssetEntrySchema),
    edges: z.array(PublicationDependencyEdgeSchema),
    compiler: z.strictObject({ name: z.string().min(1), version, canonicalization: z.string().min(1) }),
    /** Relative diagnostic paths only; absolute host paths never publish (PUB-010). */
    source_maps: z.array(z.strictObject({
        content_ref: ref,
        path: z.string().min(1).max(512),
        source_content_ref: ref.optional(),
        source_format: z.enum(PRODUCT_SOURCE_API_VERSIONS).optional(),
    })),
    conformance: z.array(z.strictObject({ check: z.string().min(1).max(128), outcome: z.enum(['pass', 'refused']) })),
    claims: z.array(z.strictObject({ kind: z.string().min(1).max(64), text: z.string().min(1).max(2_000) })),
    requested_aliases: z.array(name),
    bundle_ref: ref,
});
/** The compiled procedure: exact resources, discovery metadata, and no executable capability (PUB-011). */
export const ProcedureManifestSchema = z.strictObject({
    kind: z.literal('procedure'),
    name,
    version,
    entry_ref: ref,
    description: z.string().min(1).max(2_000),
    discovery: z.strictObject({ topics: z.array(z.string().min(1).max(64)).max(16), summary: z.string().min(1).max(500) }),
    resources: z.array(z.strictObject({ path: z.string().min(1).max(512), content_ref: ref, bytes: z.number().int().min(0), media_type: z.string().min(1).max(128) })),
    executable: z.literal(false),
    /** Entry size, so a descriptor can state the cost of opening without reading it (DXI-007). */
    entry_bytes: z.number().int().min(0).optional(),
    /** Standard skill compatibility metadata. It states, and never grants, tool access (DXI-008). */
    allowed_tools: z.array(name).max(64).optional(),
    /**
     * When the entry enters a window (DXI-006). Newly compiled skills state
     * progressive; a manifest compiled before disclosure carries nothing,
     * and that absence is its historical eager behaviour (DXI-012).
     */
    activation: z.enum(SKILL_ACTIVATION_POLICIES).optional(),
});
/**
 * What a commit establishes: the named closure was admitted and stored,
 * immutably. It does not establish domain correctness, authorize effects,
 * or prove an external implementation benevolent (PUB-013).
 */
export const PublicationReceiptSchema = z.strictObject({
    publication_ref: ref,
    bundle_ref: ref,
    root_kind: z.enum(PUBLICATION_KINDS),
    root_ref: ref,
    agent_ref: ref.nullable(),
    tenant: z.string().min(1).max(128),
    accountable: z.string().min(1).max(256),
    compiler: z.strictObject({ name: z.string().min(1), version, canonicalization: z.string().min(1) }),
    counts: z.strictObject({ declarations: z.number().int().min(0), assets: z.number().int().min(0), total_bytes: z.number().int().min(0) }),
    closure_hash: ref,
    aliases: z.array(z.strictObject({ alias: name, outcome: z.enum(['set', 'refused']) })),
    committed_at: z.string().min(1),
    establishes: z.literal('admitted-and-stored-only'),
});
/**
 * Recompute everything a bundle claims: its own ref, every declaration
 * and asset hash, and every closure edge. A single changed byte or a
 * missing edge target refuses by name, before any commit (PUB-004).
 * Pure over the manifest and blobs, so the compiler, the registry, and
 * any future host all verify with the one implementation.
 */
export function verifyBundle(bundle, blobs) {
    const { bundle_ref, ...unsealed } = bundle;
    if (contentHash(unsealed) !== bundle_ref) {
        refuse({ code: 'publish.bundle.tampered', message: 'the bundle manifest does not hash to its own bundle_ref, so nothing in it can be trusted as declared.', clause: 'PUB-004' });
    }
    const known = new Set();
    for (const declaration of bundle.declarations) {
        const blob = blobs.get(declaration.content_ref);
        if (blob === undefined || contentHash(JSON.parse(blob)) !== declaration.content_ref) {
            refuse({
                code: 'publish.declaration.tampered',
                message: `declaration ${declaration.kind} ${declaration.name} ${declaration.version} does not hash to its declared ref; the closure refuses before commit.`,
                clause: 'PUB-004',
            });
        }
        known.add(declaration.content_ref);
    }
    for (const asset of bundle.assets) {
        const blob = blobs.get(asset.content_ref);
        if (blob === undefined || spanHash(blob) !== asset.content_ref || Buffer.byteLength(blob) !== asset.bytes) {
            refuse({ code: 'publish.asset.tampered', message: `asset ${asset.content_ref.slice(0, 20)} does not match its declared hash and length; the closure refuses before commit.`, clause: 'PUB-004' });
        }
        known.add(asset.content_ref);
    }
    if (!known.has(bundle.root_ref)) {
        refuse({ code: 'publish.closure.incomplete', message: 'the root declaration is not in the closure, so there is nothing to publish.', clause: 'PUB-002' });
    }
    for (const edge of bundle.edges) {
        if (!known.has(edge.from_ref) || !known.has(edge.to_ref)) {
            refuse({ code: 'publish.closure.incomplete', message: `edge ${edge.kind} from ${edge.from_ref.slice(0, 20)} to ${edge.to_ref.slice(0, 20)} leaves the closure; every dependency ships or nothing does.`, clause: 'PUB-002' });
        }
    }
}
/** Open an upload session over one compiled bundle; nothing becomes discoverable here (PUB-006). */
export const PublicationSessionRequestSchema = z.strictObject({ bundle: PublicationBundleManifestSchema });
export const PublicationSessionSchema = z.strictObject({
    session_id: z.string().regex(/^pub_[0-9a-f]{32}$/),
    /** Refs the tenant's store does not hold yet; the answer is tenant-scoped by construction. */
    missing_blobs: z.array(ref),
});
export const PublicationBlobFrameSchema = z.strictObject({ content_ref: ref, bytes: z.string().max(4_000_000) });
export const PublicationBlobAckSchema = z.strictObject({ content_ref: ref, staged: z.boolean() });
/** Resumable large-blob position. Chunks travel as bounded raw bytes, not JSON strings. */
export const PublicationBlobUploadStatusSchema = z.strictObject({ content_ref: ref, offset: z.number().int().min(0) });
export const PublicationBlobUploadFinishSchema = z.strictObject({ content_ref: ref, staged: z.literal(true), bytes: z.number().int().min(0) });
export const PublicationCommitRequestSchema = z.strictObject({});
export const PublicationViewSchema = z.strictObject({ receipt: PublicationReceiptSchema });
/** One authorized immutable declaration, with its lifecycle annotations. */
export const DeclarationViewSchema = z.strictObject({
    content_ref: ref,
    bytes: z.string(),
    deprecated: z.string().nullable(),
    quarantined: z.string().nullable(),
});
export const AliasMutationRequestSchema = z.strictObject({ alias: name, content_ref: ref });
export const AliasMutationResultSchema = z.strictObject({ alias: name, content_ref: ref, moved: z.literal(true) });
export const DeprecationRequestSchema = z.strictObject({ content_ref: ref, reason: z.string().min(1).max(500) });
export const QuarantineRequestSchema = z.strictObject({ content_ref: ref, reason: z.string().min(1).max(500) });
/** The shared outcome of an annotation act: recorded, durably, nothing rewritten. */
export const RegistryActOutcomeSchema = z.strictObject({ content_ref: ref, recorded: z.literal(true) });
/** One explicit operator/governance note that an identity migration changed a live surface. */
export const IdentityMigrationEventRequestSchema = z.strictObject({
    impact: z.enum(PRODUCT_IDENTITY_MIGRATION_IMPACTS),
    surface: identitySurface,
    decision_ref: decisionRef,
    source_ref: ref.optional(),
});
export const IdentityMigrationEventOutcomeSchema = z.strictObject({
    recorded: z.literal(true),
    action: z.literal('identity-migration.recorded'),
    impact: z.enum(PRODUCT_IDENTITY_MIGRATION_IMPACTS),
    surface: identitySurface,
    from_identity: z.string().min(1),
    to_identity: z.string().min(1),
    identity_source_ref: ref,
    decision_ref: decisionRef,
    source_ref: ref,
});
/** Cell intake drain: new admissions refuse while drained; running work continues (operator procedure). */
export const DrainRequestSchema = z.strictObject({ drained: z.boolean(), reason: z.string().min(1).max(500) });
export const DrainOutcomeSchema = z.strictObject({ drained: z.boolean(), recorded: z.literal(true) });
/** One reconciliation sweep over a run's open effects, through the dispatcher's ladder. */
export const ReconciliationOutcomeSchema = z.strictObject({
    reconciled: z.array(z.strictObject({ effect_id: z.string(), state: z.string() })),
});
/** The durable operator audit trail, newest last, read through the public surface alone. */
export const OperatorAuditPageSchema = z.strictObject({
    entries: z.array(z.strictObject({ seq: z.number().int(), action: z.string(), detail: z.string(), actor: z.string(), at: z.string() })),
});
