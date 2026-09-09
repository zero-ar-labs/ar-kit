/**
 * The product identity project-template policy.
 *
 * Junior guide: a generated project is a writer, and writers emit the
 * successor identity now that the cutover is complete. Keeping the template
 * in contracts lets the CLI, SDK fixtures and release checks agree, and the
 * legacy-surface diagnostic still explains what an old project carries.
 */
import { refuse } from "./diagnostics.js";
import { activeSourceApiVersion, LEGACY_SOURCE_API_VERSION, SUCCESSOR_SOURCE_API_VERSION, } from "./product-identity-formats.js";
import { LEGACY_PRODUCT_IDENTITY, PRODUCT_IDENTITY_MIGRATION, SUCCESSOR_PRODUCT_IDENTITY, } from "./product-identity.generated.js";
const AGENT_NAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const SEMVER = /^\d+\.\d+\.\d+$/;
/** Build the starter project files from the writer policy in one place. */
export function productProjectTemplate(options = {}) {
    const agentName = options.agent_name ?? 'assistant';
    const agentVersion = options.agent_version ?? '1.0.0';
    if (!AGENT_NAME.test(agentName)) {
        refuse({
            code: 'identity.template.agent-name',
            message: `${agentName} is not a starter agent name. Project templates use lowercase dot-separated names so aliases stay stable.`,
            fix: 'use a name like assistant or research.assistant',
            clause: 'IDM-076',
        });
    }
    if (!SEMVER.test(agentVersion)) {
        refuse({
            code: 'identity.template.agent-version',
            message: `${agentVersion} is not a starter agent version. Project templates use semantic versions so publications sort clearly.`,
            fix: 'use a version like 1.0.0',
            clause: 'IDM-076',
        });
    }
    const sourceApiVersion = activeSourceApiVersion();
    const identity = 'successor';
    const product = SUCCESSOR_PRODUCT_IDENTITY;
    const projectFile = `${product.slug}.project.yaml`;
    const command = SUCCESSOR_PRODUCT_IDENTITY.command;
    const files = [
        {
            path: 'agent.yaml',
            role: 'agent-source',
            identity,
            content: [
                `apiVersion: ${sourceApiVersion}`,
                'kind: Agent',
                'metadata:',
                `  name: ${agentName}`,
                `  version: ${agentVersion}`,
                'spec:',
                '  instructions: ./AGENT.md',
                '  model: project-default',
                '',
            ].join('\n'),
        },
        {
            path: 'AGENT.md',
            role: 'instructions',
            identity,
            content: [
                'Work the objective directly and plainly. Propose completion when the work',
                'is done; the proposal is judged, not believed.',
                '',
            ].join('\n'),
        },
        {
            path: projectFile,
            role: 'project-manifest',
            identity,
            content: [
                `apiVersion: ${sourceApiVersion}`,
                'kind: Project',
                'metadata:',
                `  product: ${product.slug}`,
                'defaults:',
                `  agent: ${agentName}`,
                '',
            ].join('\n'),
        },
    ];
    return {
        identity,
        source_api_version: sourceApiVersion,
        command,
        environment_prefix: product.environment_prefix,
        local_data_directory: product.local_data_directory,
        project_file: projectFile,
        start_command: `${command} run "Summarise the objective"`,
        files,
    };
}
/** Explain a legacy surface without hiding whether it still works. */
export function legacyProductSurfaceDiagnostic(options) {
    const supportEnds = options.support_ends ?? PRODUCT_IDENTITY_MIGRATION.legacy_support_ends;
    const stillWorks = options.still_works ?? true;
    const migrationAction = options.migration_action ?? migrationActionFor(options.surface, options.found);
    return {
        code: 'identity.legacy-surface',
        severity: 'error',
        message: [
            `legacy surface found: ${options.found}`,
            `surface: ${options.surface}`,
            `still works: ${stillWorks ? 'yes' : 'no'}`,
            `support ends: ${supportEnds ?? 'not scheduled'}`,
            `migration action: ${migrationAction}`,
        ].join('. '),
        received: options.found,
        fix: migrationAction,
        clause: 'IDM-078',
    };
}
function migrationActionFor(surface, found) {
    switch (surface) {
        case 'command':
            return `use ${SUCCESSOR_PRODUCT_IDENTITY.command} for new command invocations; keep ${found} only where a compatibility script still calls it`;
        case 'package':
            return `replace the legacy package name with ${found.replace(LEGACY_PRODUCT_IDENTITY.package_scope, SUCCESSOR_PRODUCT_IDENTITY.package_scope)}`;
        case 'environment':
            return `set ${found.replace(LEGACY_PRODUCT_IDENTITY.environment_prefix, SUCCESSOR_PRODUCT_IDENTITY.environment_prefix)} after checking there is no conflicting legacy value`;
        case 'local-data':
            return `export any run worth keeping with ${SUCCESSOR_PRODUCT_IDENTITY.command} export, then start fresh under ${SUCCESSOR_PRODUCT_IDENTITY.local_data_directory}; nothing shipped under the retired identity, so no migration command exists`;
        case 'source-api':
            return `keep reading ${LEGACY_SOURCE_API_VERSION}; new writers use ${SUCCESSOR_SOURCE_API_VERSION}`;
        case 'run-bundle':
            return 'import the bundle with the compatibility reader and re-export it in the successor format';
        case 'sbom':
            return 'verify the legacy SBOM with historical verification material and sign a successor SBOM for new releases';
        case 'project-manifest':
            return `generate a fresh project with ${SUCCESSOR_PRODUCT_IDENTITY.command} init, or rename the manifest to ${SUCCESSOR_PRODUCT_IDENTITY.slug}.project.yaml when its apiVersion is ${SUCCESSOR_SOURCE_API_VERSION}`;
        case 'deployment-identifier':
            return 'leave existing operator-owned identifiers configured as they are, and use successor defaults only for new installations';
        case 'egress-destination':
            return 'add the exact destination to reviewed egress configuration; a similar spelling does not admit it';
        case 'telemetry':
            return 'emit one successor telemetry event for new measurements and query legacy history through the dashboard union';
    }
}
