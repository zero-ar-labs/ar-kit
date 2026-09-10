/**
 * The command's identity and its usage table.
 *
 * What this is: the one table that drives help, completions, manpages and
 * release artifacts, and the identity report that help, doctor and version
 * print: product, command, runtime build, contract version. Every surface
 * reads these so the command never describes itself by hand.
 */
import { CONTRACT_VERSION, SUCCESSOR_PRODUCT_IDENTITY } from '@zero-ar/contracts';
export const CLI_USAGE_ROWS = [
    { command: 'run', syntax: 'run "<objective>" [--items-from manifest.ndjson] [--source alias=ref] [--contract name] [--detach]', summary: 'start a run' },
    { command: 'attach', syntax: 'attach <run> [--after seq]', summary: 'follow durable events from a cursor' },
    { command: 'inspect', syntax: 'inspect <run>', summary: 'snapshot, budgets, usage, and state' },
    { command: 'records', syntax: 'records <run>', summary: 'the canonical record stream' },
    { command: 'result', syntax: 'result <run> [--json]', summary: 'artifact, verdict, and handover' },
    { command: 'steer', syntax: 'steer <run> <text>', summary: 'queue guidance without breaking the turn' },
    { command: 'redirect', syntax: 'redirect <run> <text>', summary: 'replace only the in-flight request' },
    { command: 'cancel', syntax: 'cancel <run> [reason]', summary: 'stop cooperatively, transcript preserved' },
    { command: 'answer', syntax: 'answer <run> <item> --output "..."', summary: 'settle a parked gap; the validator decides' },
    { command: 'answer', syntax: 'answer <run> <item> --dismiss "..."', summary: 'record that nobody cares about this hole' },
    { command: 'resume', syntax: 'resume <run>', summary: 'reconstruct position and continue' },
    { command: 'fork', syntax: 'fork <run> --at <entry>', summary: 'continue history under a new identity' },
    { command: 'replay', syntax: 'replay <run>', summary: 're-execute the saved inputs, models called again' },
    { command: 'rebuild', syntax: 'rebuild <run>', summary: 'refold the head projection from the log' },
    { command: 'export', syntax: 'export <run> [--out f]', summary: 'the canonical history as a checksummed bundle' },
    { command: 'import', syntax: 'import <file>', summary: 'land a bundle in a fresh namespace and compare' },
    { command: 'publish', syntax: 'publish <source> [--dry-run] [--url u] [--json]', summary: 'compile locally, or commit through hosted publication' },
    { command: 'doctor', syntax: 'doctor [--database] [--url u] [--json]', summary: 'check the installation or hosted database' },
    { command: 'profile', syntax: 'profile [--json]', summary: 'what this installation is, where its data lives, what it excludes' },
    { command: 'environment', syntax: 'environment <operation>', summary: 'administer profiles and environment jobs' },
    { command: 'provider', syntax: 'provider <operation> --url u', summary: 'administer provider adapters, credentials, instances, catalogues, and model policy' },
    { command: 'tool-source', syntax: 'tool-source <operation>', summary: 'administer Composio and Merge sources' },
    { command: 'source', syntax: 'source add|list|inspect|snapshot|preflight', summary: 'administer read-only content sources' },
    { command: 'init', syntax: 'init [dir] [--kind agent|external-product] [--fixture name]', summary: 'scaffold an agent or external product' },
    { command: 'version', syntax: 'version', summary: 'print product identity, runtime build, and contract version' },
    { command: 'help', syntax: 'help', summary: 'print this command guide' },
];
export const CLI_COMMANDS = [...new Set(CLI_USAGE_ROWS.map((row) => row.command))].sort();
/** Commands whose work can run against bundled or hosted Zero-AR. */
export const CLI_REMOTE_CAPABLE_COMMANDS = [
    'run',
    'attach',
    'inspect',
    'records',
    'result',
    'steer',
    'redirect',
    'cancel',
    'answer',
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
    'source',
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
        contract_version: CONTRACT_VERSION,
    };
}
function runtimeBuild() {
    return typeof ZERO_AR_RELEASE_BUNDLE !== 'undefined' && ZERO_AR_RELEASE_BUNDLE ? 'production-bundle' : 'development-typescript';
}
