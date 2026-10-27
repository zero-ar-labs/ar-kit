import { refuse } from "./diagnostics.js";
import { contentHash } from "./ids.js";
import { PRODUCT_IDENTITY_SOURCE_REF, SUCCESSOR_PRODUCT_IDENTITY } from "./product-identity.generated.js";
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
    packageRow('packages/environment-firecracker', 'environment-firecracker', 'conditional-hosted'),
    packageRow('packages/environment-kit', 'environment-kit', 'private-workspace'),
    packageRow('packages/environment-oci', 'environment-oci', 'private-workspace'),
    packageRow('packages/environment-process', 'environment-process', 'private-workspace'),
    packageRow('packages/environment-ssh', 'environment-ssh', 'conditional-hosted'),
    packageRow('packages/environment-openai-agents', 'environment-openai-agents', 'conditional-hosted'),
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
    const successorPackages = new Set();
    if (options.require_legacy_wrappers) {
        refuse({ code: 'identity.package.retired', message: 'legacy package wrappers are retired.', fix: 'use the current Zero-AR package graph.', clause: 'IDM-031' });
    }
    for (const node of normalized) {
        const classification = known.get(node.name);
        const implementation = node.implementation_identity ?? 'successor';
        if (!PRODUCT_PACKAGE_IMPLEMENTATION_IDENTITIES.includes(implementation)) {
            refuse({ code: 'identity.package.implementation', message: `${implementation} is not a package implementation identity.`, fix: 'use successor.', clause: 'IDM-032' });
        }
        if (implementation !== 'successor') {
            refuse({ code: 'identity.package.retired', message: 'legacy package implementations and wrappers are retired.', fix: 'use the current Zero-AR package graph.', clause: 'IDM-032' });
        }
        if (!classification && isProductScopedName(node.name)) {
            refuse({ code: 'identity.package.unknown', message: `${node.name} has no package-matrix row.`, fix: 'add the package to the matrix or remove it from the graph.', clause: 'IDM-032' });
        }
        if (classification)
            successorPackages.add(node.name);
    }
    const missingSuccessor = options.require_complete_release
        ? PRODUCT_PACKAGE_MATRIX.map((row) => row.successor_name).filter((name) => !successorPackages.has(name)) : [];
    if (missingSuccessor.length > 0) {
        refuse({ code: 'identity.package.partial-release', message: `the release graph omits ${missingSuccessor.join(', ')}, so partial scope migration is not a supported release.`, fix: 'build the complete Zero-AR package graph.', clause: 'IDM-030' });
    }
    return {
        ...productPackageGraphIdentity(), state: 'successor-compatible', product_package_count: successorPackages.size,
        legacy_packages: [], successor_packages: [...successorPackages].sort(), legacy_wrappers: [],
        missing_legacy_packages: [], missing_successor_packages: missingSuccessor,
    };
}
export function assertProductPackageGraph(input, options = {}) {
    return productPackageGraphReport(input, options);
}
function packageRow(workspace_path, basename, distribution) {
    return {
        workspace_path,
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
    return new Map(PRODUCT_PACKAGE_MATRIX.map((row) => [row.successor_name, row]));
}
function isProductScopedName(name) {
    return name.startsWith(`${SUCCESSOR_PRODUCT_IDENTITY.package_scope}/`);
}
