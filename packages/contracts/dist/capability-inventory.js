import { compileProfileCapabilityManifest, profileCapabilitySummary } from "./capability-profile.js";
import { refuse } from "./diagnostics.js";
import { CAPABILITY_MECHANISMS, PROFILE_CAPABILITIES } from "./vocab.js";
export const CAPABILITY_MECHANISM_MAP = {
    'hosted-postgresql-service': ['canonical-log-store', 'postgres-tenancy'],
    'local-lite': ['run-transfer'],
    'transformation-volume-reference-pack': ['transformation-validators'],
    'provider-openai': ['model-adapter-openai'],
    'provider-anthropic': ['model-adapter-anthropic'],
    'provider-openrouter': ['model-adapter-openrouter'],
    'provider-together': ['model-adapter-together'],
    'provider-fireworks': ['model-adapter-fireworks'],
    'aggregator-composio-observation': ['aggregator-composio'],
    'aggregator-merge-observation': ['aggregator-merge'],
    'restricted-effect-plane-attachment': ['effect-plane'],
    'environment-process': ['process-environment'],
    'environment-oci': ['oci-environment'],
    'environment-ssh': ['environment-ssh'],
    'environment-firecracker': ['environment-firecracker'],
    'environment-openai-agents': ['environment-openai-agents'],
    'environment-apptainer': ['environment-apptainer'],
    'full-cell-docker-linux': ['full-cell-supervisor'],
    'canonical-log': ['canonical-log-store', 'run-engine'],
    'quality-plane': ['run-engine'],
    artifacts: ['artifact-port'],
    suspension: ['run-engine'],
    'honest-completion': ['run-engine'],
    'published-skills': ['publication-registry'],
    'runtime-local-tools': ['run-engine'],
    'author-defined-tools': ['published-tool-host'],
    'progressive-tool-disclosure': ['run-engine'],
    'effect-proposal-tools': ['effect-plane'],
    'unattended-aggregator-mutations': ['unattended-aggregator-dispatch'],
    'dynamic-authority': ['effect-authority-service'],
    'production-effect-dispatch': ['production-effect-dispatcher'],
    'host-target-effect-dispatch': ['effect-plane', 'effect-authority-service'],
    'research-reference-pack': ['research-validators'],
    'video-reference-pack': ['video-pack'],
    'native-packaged-self-hosting': ['native-package'],
    'classification-airlocks': ['classification-airlock'],
    'regulated-workloads': ['regulated-composition'],
    'cross-run-memory': ['cross-run-memory'],
    'authored-orchestration': ['run-engine'],
    'mcp-work-entrypoints': ['mcp-listener'],
    'mcp-imported-tools': ['mcp-client'],
    'source-local-read-only': ['source-service'],
    'document-pdf-extraction': ['source-service', 'process-tool-host'],
    'fair-cell-scheduling': ['fair-dispatch-scheduler'],
    'sequential-sampled-validation': ['sampled-validator'],
    'context-feature-cache': ['context-feature-cache'],
    'content-defined-chunking': ['content-defined-chunker'],
    'attention-admission': ['attention-admission'],
    'gateway-signed-webhook': ['gateway-host'],
    'gateway-interactive-messaging': ['gateway-host'],
    'workspace-binding-profiles': ['workspace-instance-attachment'],
    'automatic-run-recovery': ['run-engine', 'durable-wake-scheduler'],
    'open-goal-execution': ['run-engine'],
    'operator-pause-and-budget': ['run-engine'],
    'run-fork': ['run-engine'],
    'model-image-input': ['run-engine'],
    'workspace-exec': ['workspace-exec'],
    'browser-workspace': ['workspace-exec', 'browser-workspace'],
    'hierarchical-context': ['run-engine', 'runtime-artifact-store'],
    'reversible-http-effect-dispatch': ['effect-plane', 'http-effect-target'],
    'web-search': ['web-tools'],
    'several-cells-one-database': ['postgres-tenancy', 'cell-run-ownership'],
};
export const FULL_CELL_RELEASE_PROFILE = 'full-cell';
export function capabilityInventory(constructed) {
    const built = new Set(constructed);
    return {
        mechanisms: CAPABILITY_MECHANISMS.filter((mechanism) => built.has(mechanism)),
        implemented: PROFILE_CAPABILITIES.filter((capability) => CAPABILITY_MECHANISM_MAP[capability].every((mechanism) => built.has(mechanism))),
    };
}
export function compileCapabilityInventory(manifest, constructed, composition) {
    const checked = compileProfileCapabilityManifest(manifest);
    const inventory = capabilityInventory(constructed);
    const built = new Set(inventory.mechanisms);
    const unbacked = checked.capabilities
        .filter((entry) => entry.state === 'supported' && !inventory.implemented.includes(entry.capability))
        .map((entry) => `${entry.capability} (needs ${CAPABILITY_MECHANISM_MAP[entry.capability].filter((mechanism) => !built.has(mechanism)).join(', ')})`);
    if (unbacked.length > 0) {
        refuse({
            code: 'capability-profile.unimplemented',
            message: `the ${checked.manifest_id} manifest marks ${unbacked.join('; ')} as supported, but ${composition} did not construct what ${unbacked.length === 1 ? 'it rests' : 'they rest'} on, so it would claim what it cannot do. ` +
                'Wire each named mechanism into this composition, or mark the capability conditional or excluded at the boundary that refuses it.',
            clause: 'X-6',
        });
    }
    const compiled = compileProfileCapabilityManifest(checked, { implemented_capabilities: inventory.implemented });
    return { manifest: compiled, summary: profileCapabilitySummary(compiled), inventory };
}
