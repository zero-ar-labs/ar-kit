/**
 * The product package graph for the Zero-AR migration.
 *
 * Junior guide: package names are part of runtime identity. This file is
 * the manifest that says which `@zero-ar/*` package maps to which
 * `@zero-ar/*` package. The guard below catches half-renamed graphs before
 * an SDK handle starts work.
 */
import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { LEGACY_PRODUCT_IDENTITY, PRODUCT_IDENTITY_SOURCE_REF, SUCCESSOR_PRODUCT_IDENTITY } from "./product-identity.generated.js";
import { PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES } from "./vocab.js";
export const PRODUCT_PACKAGE_GRAPH_PROTOCOL = 'product-package-graph/v1';
export const PRODUCT_PACKAGE_MATRIX = [
    packageRow('packages/aggregator', 'aggregator', 'private-workspace'),
    packageRow('packages/artifacts', 'artifacts', 'private-workspace'),
    packageRow('apps/authority-host', 'authority-host', 'private-workspace'),
    packageRow('packages/client', 'client', 'public-npm'),
    packageRow('apps/cli', 'cli', 'public-npm'),
    packageRow('packages/conformance', 'conformance', 'public-npm'),
    packageRow('packages/vectors', 'vectors', 'private-workspace'),
    packageRow('packages/context', 'context', 'private-workspace'),
    packageRow('packages/contracts', 'contracts', 'public-npm'),
    packageRow('domain-packs/classification', 'domain-pack-classification', 'private-workspace'),
    packageRow('domain-packs/research', 'domain-pack-research', 'private-workspace'),
    packageRow('domain-packs/transformation', 'domain-pack-transformation', 'private-workspace'),
    packageRow('packages/effects', 'effects', 'private-workspace'),
    packageRow('packages/evidence', 'evidence', 'private-workspace'),
    packageRow('packages/environment-apptainer', 'environment-apptainer', 'conditional-hosted'),
    packageRow('packages/environment-cloudflare-sandbox', 'environment-cloudflare-sandbox', 'future-optional'),
    packageRow('packages/environment-daytona', 'environment-daytona', 'future-optional'),
    packageRow('packages/environment-firecracker', 'environment-firecracker', 'conditional-hosted'),
    packageRow('packages/environment-kit', 'environment-kit', 'private-workspace'),
    packageRow('packages/environment-modal', 'environment-modal', 'future-optional'),
    packageRow('packages/environment-oci', 'environment-oci', 'private-workspace'),
    packageRow('packages/environment-process', 'environment-process', 'private-workspace'),
    packageRow('packages/environment-ssh', 'environment-ssh', 'conditional-hosted'),
    packageRow('packages/environment-vercel-sandbox', 'environment-vercel-sandbox', 'future-optional'),
    packageRow('packages/gateways', 'gateways', 'private-workspace'),
    packageRow('apps/zero-ar-hosted', 'hosted', 'signed-distribution'),
    packageRow('packages/kernel', 'kernel', 'private-workspace'),
    packageRow('packages/leases', 'leases', 'private-workspace'),
    packageRow('packages/log', 'log', 'private-workspace'),
    packageRow('packages/mcp', 'mcp', 'public-npm'),
    packageRow('packages/model-adapters', 'model-adapters', 'private-workspace'),
    packageRow('packages/projections', 'projections', 'private-workspace'),
    packageRow('packages/quality', 'quality', 'private-workspace'),
    packageRow('packages/registry', 'registry', 'private-workspace'),
    packageRow('packages/sdk', 'sdk', 'public-npm'),
    packageRow('packages/secrets', 'secrets', 'private-workspace'),
    packageRow('apps/zero-ar-server', 'server', 'signed-distribution'),
    packageRow('packages/storage-postgres', 'storage-postgres', 'private-workspace'),
    packageRow('packages/storage-sqlite', 'storage-sqlite', 'private-workspace'),
    packageRow('packages/testkit', 'testkit', 'public-npm'),
    packageRow('apps/tool-host', 'tool-host', 'private-workspace'),
    packageRow('packages/tool-kit', 'tool-kit', 'public-npm'),
    packageRow('apps/validator-host', 'validator-host', 'private-workspace'),
    packageRow('packages/validator-kit', 'validator-kit', 'public-npm'),
];
export function productPackageMatrix() {
    return PRODUCT_PACKAGE_MATRIX.map((row) => ({ ...row }));
}
export function productPackageGraphIdentity() {
    return {
        protocol: PRODUCT_PACKAGE_GRAPH_PROTOCOL,
        source_ref: PRODUCT_IDENTITY_SOURCE_REF,
        graph_ref: contentHash({ protocol: PRODUCT_PACKAGE_GRAPH_PROTOCOL, source_ref: PRODUCT_IDENTITY_SOURCE_REF, packages: PRODUCT_PACKAGE_MATRIX }),
    };
}
export function productPackageGraphReport(input, options = {}) {
    const normalized = normalizeNodes(input);
    const known = packageLookup();
    const legacyPackages = new Set();
    const successorPackages = new Set();
    const legacyWrappers = new Set();
    for (const node of normalized) {
        const classification = known.get(node.name);
        if (!classification && isProductScopedName(node.name)) {
            refuse({
                code: 'identity.package.unknown',
                message: `${node.name} uses a product package scope but has no package-matrix row, so the graph cannot classify it.`,
                fix: 'add the package to productPackageMatrix or remove it from the runtime package graph.',
                clause: 'IDM-032',
            });
        }
        if (!classification)
            continue;
        const implementation = node.implementation_identity ?? classification.default_identity;
        if (!PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES.includes(implementation)) {
            refuse({
                code: 'identity.package.implementation',
                message: `${implementation} is not a package implementation identity, so the graph cannot decide whether it is legacy, successor or wrapper.`,
                alternatives: [...PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES],
                fix: 'use legacy, successor or legacy-wrapper.',
                clause: 'IDM-032',
            });
        }
        if (classification.scope === 'legacy' && implementation === 'successor') {
            refuse({
                code: 'identity.package.scope-mismatch',
                message: `${node.name} is a legacy-scoped package but declares successor implementation identity. A package cannot speak a different product identity than its scope without being a wrapper.`,
                fix: `use ${classification.row.successor_name}, or mark ${node.name} as legacy-wrapper when it re-exports the successor package.`,
                clause: 'IDM-032',
            });
        }
        if (classification.scope === 'successor' && implementation !== 'successor') {
            refuse({
                code: 'identity.package.scope-mismatch',
                message: `${node.name} is a successor-scoped package but declares ${implementation} implementation identity. That makes the package graph ambiguous.`,
                fix: `use ${classification.row.legacy_name} for legacy identity, or declare ${node.name} as successor.`,
                clause: 'IDM-032',
            });
        }
        if (implementation === 'legacy')
            legacyPackages.add(node.name);
        if (implementation === 'successor')
            successorPackages.add(node.name);
        if (implementation === 'legacy-wrapper')
            legacyWrappers.add(node.name);
    }
    if (legacyPackages.size > 0 && successorPackages.size > 0) {
        refuse({
            code: 'identity.package.mixed-graph',
            message: 'the package graph contains legacy implementations and successor implementations in one runtime closure, so one run could speak two product protocols.',
            alternatives: ['all legacy implementation packages', 'all successor packages with legacy names marked as wrappers'],
            fix: 'use one implementation identity before starting the run.',
            clause: 'IDM-032',
        });
    }
    if (legacyWrappers.size > 0 && successorPackages.size === 0) {
        refuse({
            code: 'identity.package.wrapper-without-successor',
            message: 'the package graph contains legacy wrappers but no successor implementation package for them to wrap.',
            fix: 'include the successor packages, or load the legacy implementation packages instead.',
            clause: 'IDM-031',
        });
    }
    const missingLegacy = options.require_complete_release && successorPackages.size === 0 ? missingNames('legacy', legacyPackages) : [];
    const missingSuccessor = options.require_complete_release && successorPackages.size > 0 ? missingNames('successor', successorPackages) : [];
    const missingWrappers = options.require_legacy_wrappers && successorPackages.size > 0 ? missingNames('legacy', legacyWrappers) : [];
    if (missingLegacy.length > 0) {
        refuse({
            code: 'identity.package.partial-release',
            message: `the legacy release graph omits ${missingLegacy.join(', ')}, so it is not the complete product package graph.`,
            fix: 'build the release from the package matrix in one pass.',
            clause: 'IDM-030',
        });
    }
    if (missingSuccessor.length > 0) {
        refuse({
            code: 'identity.package.partial-release',
            message: `the successor release graph omits ${missingSuccessor.join(', ')}, so partial scope migration is not a supported release.`,
            fix: 'publish the complete successor graph from one release manifest.',
            clause: 'IDM-030',
        });
    }
    if (missingWrappers.length > 0) {
        refuse({
            code: 'identity.package.missing-wrapper',
            message: `the successor release graph omits legacy compatibility wrappers for ${missingWrappers.join(', ')}.`,
            fix: 'publish legacy wrappers or dist-tags for every package named by the compatibility window.',
            clause: 'IDM-031',
        });
    }
    return {
        ...productPackageGraphIdentity(),
        state: successorPackages.size > 0 ? 'successor-compatible' : 'legacy-compatible',
        product_package_count: legacyPackages.size + successorPackages.size + legacyWrappers.size,
        legacy_packages: [...legacyPackages].sort(),
        successor_packages: [...successorPackages].sort(),
        legacy_wrappers: [...legacyWrappers].sort(),
        missing_legacy_packages: missingLegacy,
        missing_successor_packages: missingSuccessor,
    };
}
export function assertProductPackageGraph(input, options = {}) {
    return productPackageGraphReport(input, options);
}
function packageRow(workspace_path, basename, distribution) {
    return {
        workspace_path,
        legacy_name: `${LEGACY_PRODUCT_IDENTITY.package_scope}/${basename}`,
        successor_name: `${SUCCESSOR_PRODUCT_IDENTITY.package_scope}/${basename}`,
        distribution,
    };
}
function normalizeNodes(input) {
    const seen = new Map();
    const out = [];
    for (const entry of input) {
        const node = typeof entry === 'string' ? { name: entry } : entry;
        const prior = seen.get(node.name);
        if (seen.has(node.name) && prior !== node.implementation_identity) {
            refuse({
                code: 'identity.package.duplicate',
                message: `${node.name} appears with two implementation identities, so the package graph has no single meaning.`,
                fix: 'list each product package once with one implementation identity.',
                clause: 'IDM-032',
            });
        }
        if (!seen.has(node.name))
            out.push(node);
        seen.set(node.name, node.implementation_identity);
    }
    return out;
}
function packageLookup() {
    const map = new Map();
    for (const row of PRODUCT_PACKAGE_MATRIX) {
        map.set(row.legacy_name, { row, scope: 'legacy', default_identity: 'legacy' });
        map.set(row.successor_name, { row, scope: 'successor', default_identity: 'successor' });
    }
    return map;
}
function isProductScopedName(name) {
    return name.startsWith(`${LEGACY_PRODUCT_IDENTITY.package_scope}/`) || name.startsWith(`${SUCCESSOR_PRODUCT_IDENTITY.package_scope}/`);
}
function missingNames(kind, present) {
    return PRODUCT_PACKAGE_MATRIX.map((row) => (kind === 'legacy' ? row.legacy_name : row.successor_name)).filter((name) => !present.has(name));
}
