import { CONTRACT_VERSION, SUCCESSOR_PRODUCT_IDENTITY, SUPPORTED_NODE_RUNTIME } from '@zero-ar/contracts';
export const CLI_USAGE_ROWS = [
    { command: 'run', syntax: 'run "<objective>" [--items-from manifest.ndjson] [--source alias=ref] [--contract name] [--attention n] [--idempotency-key key] [--detach]', summary: 'start a run' },
    { command: 'attach', syntax: 'attach <run> [--after seq]', summary: 'follow durable events from a cursor' },
    { command: 'inspect', syntax: 'inspect <run>', summary: 'snapshot, budgets, usage, and state' },
    { command: 'verification-plan', syntax: 'verification-plan <run> [--json]', summary: 'the canonical checks, costs, limits, and reachability' },
    { command: 'records', syntax: 'records <run>', summary: 'the canonical record stream' },
    { command: 'context', syntax: 'context <run> <turn> [--json]', summary: 'rebuild one turn\'s model window and resolve its spans' },
    { command: 'result', syntax: 'result <run> [--json]', summary: 'artifact, verdict, and handover' },
    { command: 'steer', syntax: 'steer <run> <text>', summary: 'queue guidance without breaking the turn' },
    { command: 'redirect', syntax: 'redirect <run> <text>', summary: 'replace only the in-flight request' },
    { command: 'pause', syntax: 'pause <run> [reason]', summary: 'suspend at the next turn boundary until resume' },
    { command: 'budget', syntax: 'budget <run> [--model-tokens n] [--tool-calls n] [--bytes n] [--compute-ms n] [--attention n] [--turns n] [--reason text]', summary: 'add budget to a run that has not ended' },
    { command: 'cancel', syntax: 'cancel <run> [reason]', summary: 'stop cooperatively, transcript preserved' },
    { command: 'answer', syntax: 'answer <run> <item> --output "..."', summary: 'settle a parked gap; the validator decides' },
    { command: 'answer', syntax: 'answer <run> <item> --choice "..."', summary: 'answer an agent\'s question with one of its choices' },
    { command: 'answer', syntax: 'answer <run> <item> --dismiss "..."', summary: 'record that nobody cares about this hole' },
    { command: 'attention', syntax: 'attention calibrate --reviewers n --window-ms ms [--horizon-ms ms] [--confidence p] [--class name] [--json]', summary: 'measure review capacity from the log, observe-only' },
    { command: 'attention', syntax: 'attention publish --reviewers n --window-ms ms --tolerance-ppm n [--class name] [--json]', summary: 'publish the next versioned capacity snapshot' },
    { command: 'attention', syntax: 'attention current|dashboard [--json]', summary: 'the standing capacity snapshot, or review load by class' },
    { command: 'resume', syntax: 'resume <run>', summary: 'reconstruct position and continue' },
    { command: 'fork', syntax: 'fork <run> --at <entry>', summary: 'continue history under a new identity' },
    { command: 'replay', syntax: 'replay <run>', summary: 're-execute the saved inputs, models called again' },
    { command: 'rebuild', syntax: 'rebuild <run>', summary: 'refold the head projection from the log' },
    { command: 'export', syntax: 'export <run> [--out f] [--handoff-to destination] [--json]', summary: 'seal canonical history and report each portability level; --handoff-to signs the run over to one other cell first' },
    { command: 'import', syntax: 'import <file> [--executor declaration.json] [--continue] [--json]', summary: 'verify, materialize, rehydrate, then optionally admit an executor' },
    { command: 'import', syntax: 'import --destination [--json]', summary: 'name this cell for a source to hand a run to' },
    { command: 'publish', syntax: 'publish <source> [--dry-run] [--verification-input file] [--url u] [--json]', summary: 'compile locally, preview verification, or commit through hosted publication' },
    { command: 'publication', syntax: 'publication export <publication-ref> [--out f]', summary: 'one published closure as checksummed lines, with no alias or credential' },
    { command: 'publication', syntax: 'publication import <file> [--json]', summary: 'commit an exported closure here with identical refs and a new receipt' },
    { command: 'registry', syntax: 'registry rebuild [--json]', summary: 'refold publication names from the immutable publication records' },
    { command: 'registry', syntax: 'registry alias-history <alias> [--json]', summary: 'list each move of one alias, oldest first' },
    { command: 'artifact', syntax: 'artifact sweep [--older-than seconds] --reason <text> [--json]', summary: 'remove runtime artifact uploads that never committed, never younger than the retention floor' },
    { command: 'memory', syntax: 'memory setup --key-file <path>', summary: 'create durable Local Lite wrapping-key custody' },
    { command: 'memory', syntax: 'memory prepare-rotation --current <path> --next <path>', summary: 'create the next wrapping key and print the rotating start settings' },
    { command: 'memory', syntax: 'memory status|assert|supersede|history|erase|export|import|read [arguments] [--json]', summary: 'administer cross-run memory through the public API' },
    { command: 'doctor', syntax: 'doctor [--database] [--url u] [--json]', summary: 'check the installation, run portability surfaces, or hosted database' },
    { command: 'profile', syntax: 'profile [--json]', summary: 'what this installation is, where its data lives, what it excludes' },
    { command: 'environment', syntax: 'environment <operation>', summary: 'administer profiles and environment jobs' },
    { command: 'provider', syntax: 'provider <operation> --url u', summary: 'administer provider adapters, credentials, instances, catalogues, and model policy' },
    { command: 'tool-source', syntax: 'tool-source <operation>', summary: 'administer Composio and Merge sources' },
    { command: 'effect', syntax: 'effect targets', summary: 'list the effect targets this runtime can dispatch to' },
    { command: 'source', syntax: 'source add|list|inspect|snapshot|preflight', summary: 'administer read-only content sources' },
    { command: 'capability', syntax: 'capability request <run> <skill-dir> --reason <text> [--expected-epoch n]', summary: 'publish and request one local Agent Skill' },
    { command: 'capability', syntax: 'capability request <run> --publication <ref> --content-hash <ref> --package-kind procedure --capability <name> --reason <text>', summary: 'request one exact published capability' },
    { command: 'capability', syntax: 'capability inspect <run> [request] [--cursor id] [--limit 1..100] [--json]', summary: 'list requests or inspect one immutable plan' },
    { command: 'capability', syntax: 'capability approve|refuse <run> <request> --plan <ref> [--reason <text>]', summary: 'decide the exact inspected plan' },
    { command: 'capability', syntax: 'capability cancel <run> <request> [--reason <text>]', summary: 'cancel live pre-commit admission work' },
    { command: 'gateway', syntax: 'gateway serve|test <config.json>', summary: 'run the channel gateway host, or check its secrets and endpoint' },
    { command: 'init', syntax: 'init [dir] [--form yaml|json|markdown|typescript] [--kind agent|external-product]', summary: 'scaffold and lock an agent project' },
    { command: 'scaffold', syntax: 'scaffold skill|tool|validator|domain-pack|binding-profile <name> [dir]', summary: 'generate one public extension package' },
    { command: 'validate', syntax: 'validate [source|dir] [--write-lock]', summary: 'compile, verify and check authoring locks' },
    { command: 'version', syntax: 'version', summary: 'print product identity, runtime build, and contract version' },
    { command: 'help', syntax: 'help', summary: 'print this command guide' },
];
export const CLI_COMMANDS = [...new Set(CLI_USAGE_ROWS.map((row) => row.command))].sort();
export const CLI_COMMAND_EXAMPLES = {
    init: ['init documentary-agent --form yaml'],
    validate: ['validate documentary-agent'],
    publish: ['publish documentary-agent --dry-run'],
    run: ['run "Summarise the objective"'],
    inspect: ['inspect <run-id>'],
    result: ['result <run-id>', 'result <run-id> --json'],
    doctor: ['doctor', 'doctor --json'],
};
export const CLI_HELP_SECTIONS = [
    { title: 'get started', commands: ['init', 'scaffold', 'validate', 'run', 'attach', 'inspect', 'result'] },
    { title: 'guide and control runs', commands: ['records', 'context', 'verification-plan', 'steer', 'redirect', 'pause', 'budget', 'answer', 'resume', 'fork', 'replay', 'cancel'] },
    { title: 'publish and integrate', commands: ['publish', 'publication', 'source', 'capability', 'gateway'] },
    { title: 'operate', commands: ['doctor', 'profile', 'rebuild', 'export', 'import', 'registry', 'artifact', 'memory', 'attention'] },
    { title: 'administer hosted runtime', commands: ['environment', 'provider', 'tool-source', 'effect'] },
    { title: 'reference', commands: ['version', 'help'] },
];
export const CLI_REMOTE_CAPABLE_COMMANDS = [
    'run',
    'attach',
    'inspect',
    'verification-plan',
    'records',
    'context',
    'result',
    'steer',
    'redirect',
    'pause',
    'budget',
    'cancel',
    'answer',
    'attention',
    'resume',
    'fork',
    'replay',
    'rebuild',
    'export',
    'import',
    'publish',
    'doctor',
    'environment',
    'provider',
    'tool-source',
    'effect',
    'source',
    'capability',
    'publication',
    'registry',
    'artifact',
    'memory',
];
export function isRemoteCapableCommand(command) {
    return CLI_REMOTE_CAPABLE_COMMANDS.includes(command);
}
export function createCliContext() {
    return { command: SUCCESSOR_PRODUCT_IDENTITY.command };
}
export function cliIdentityReport(context) {
    return {
        product: SUCCESSOR_PRODUCT_IDENTITY.display_name,
        wordmark: SUCCESSOR_PRODUCT_IDENTITY.wordmark,
        command: context.command,
        runtime_build: runtimeBuild(),
        execution_substrate: productionBundle() ? SUPPORTED_NODE_RUNTIME.production_substrate : 'development-typescript',
        contract_version: CONTRACT_VERSION,
    };
}
function runtimeBuild() {
    return productionBundle() ? 'production-bundle' : 'development-typescript';
}
function productionBundle() {
    return typeof ZERO_AR_RELEASE_BUNDLE !== 'undefined' && ZERO_AR_RELEASE_BUNDLE;
}
