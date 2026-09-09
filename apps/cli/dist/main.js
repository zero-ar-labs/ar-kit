/**
 * The Zero-AR command implementation.
 *
 * What this is: the human surface over the public API and nothing else.
 * The `zeroar` entrypoint calls this file, so command behaviour has one
 * source.
 *
 * Commands in this surface include run control, replay, export, import,
 * local checks, hosted diagnostics, publication dry runs, environment
 * administration, provider administration, and tool-source administration.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTRACT_VERSION, DiagnosticError, AdmitModelAdapterRequestSchema, CreateExternalCredentialBindingRequestSchema, CreateProviderInstanceRequestSchema, DeclareFallbackSetRequestSchema, EnableProviderModelRequestSchema, EnableToolSourceToolsRequestSchema, ProtectedCredentialIngestRequestSchema, RegisterEnvironmentRequestSchema, RegisterToolSourceRequestSchema, RevokeCredentialRequestSchema, RotateExternalCredentialRequestSchema, RotateProtectedCredentialRequestSchema, SetDefaultModelAliasRequestSchema, SetModelAliasRequestSchema, SyncProviderCatalogueRequestSchema, SyncToolSourceCatalogueRequestSchema, ToolSourceStateRequestSchema, canonicalJson, makeId, productEnvironmentNames, productEnvironmentValue, productProjectTemplate, profileCapabilitySummaryFor, resolveCommandTarget, renderDiagnostic, shortId, SUCCESSOR_PRODUCT_IDENTITY, productLocalDataDirectory, } from '@zero-ar/contracts';
import { connectRuntimeTarget, ZeroARClient } from '@zero-ar/client';
import { compileProject, renderPlan, verifyBundle } from '@zero-ar/sdk';
import { CLI_USAGE_ROWS, cliIdentityReport, createCliContext, isRemoteCapableCommand, } from "./identity.js";
import { externalProductTemplate } from "./external-product-template.js";
import { Terminal, neutralize, neutralizeDeep, stateFor } from "./terminal.js";
const t = new Terminal();
export async function runCli(options = {}) {
    const context = createCliContext();
    const [command, ...rest] = options.argv ?? process.argv.slice(2);
    if (!command || command === 'help' || command === '--help') {
        console.log(helpText(context));
        return 0;
    }
    if (command === 'version' || command === '--version') {
        console.log(versionText(context));
        return 0;
    }
    if (command === 'init')
        return init(rest, context);
    if (command === 'profile')
        return profile(rest, context);
    if (command === 'doctor' && !rest.includes('--database'))
        return doctor(rest, context);
    if (command === 'publish' && rest.includes('--dry-run'))
        return publish(null, rest, context);
    if (!isRemoteCapableCommand(command)) {
        console.error(`error: ${command} is not a command. Run ${context.command} help for the list.`);
        return 1;
    }
    const resolved = resolveCommandTarget({ arguments: rest, environment: process.env });
    const connection = await connectRuntimeTarget({
        target: resolved.target,
        environment: process.env,
        start_bundled: startServer,
    });
    const client = connection.client;
    const commandArguments = resolved.command_arguments;
    try {
        switch (command) {
            case 'run':
                return await run(client, commandArguments, context);
            case 'attach':
                return await attach(client, need(commandArguments[0], 'run id'));
            case 'inspect':
                return await inspect(client, need(commandArguments[0], 'run id'));
            case 'records':
                return await records(client, need(commandArguments[0], 'run id'));
            case 'result':
                return await showResult(client, need(commandArguments[0], 'run id'), commandArguments.includes('--json'));
            case 'steer':
            case 'redirect':
                await client.control(need(commandArguments[0], 'run id'), {
                    verb: command,
                    control_id: makeId('ctl'),
                    text: need(commandArguments.slice(1).join(' ') || undefined, 'text'),
                });
                console.log(`${command} accepted; it applies without breaking the turn`);
                return 0;
            case 'cancel':
                await client.control(need(commandArguments[0], 'run id'), {
                    verb: 'cancel',
                    control_id: makeId('ctl'),
                    reason: commandArguments.slice(1).join(' ') || 'cancelled from the terminal',
                });
                console.log('cancel accepted; in-flight work resolves first and the transcript is kept');
                return 0;
            case 'answer': {
                const run_id = need(commandArguments[0], 'run id');
                const item = need(commandArguments[1], 'a parked item id');
                const output = argValue(commandArguments, '--output');
                const dismiss = argValue(commandArguments, '--dismiss');
                const control_id = makeId('ctl');
                await client.control(run_id, {
                    verb: 'answer',
                    control_id,
                    handle: item,
                    ...(output ? { text: output } : {}),
                    ...(dismiss ? { reason: dismiss } : {}),
                });
                const after = await client.snapshot(run_id);
                const parked = after.items?.parked ?? 0;
                if (output)
                    console.log(`gap settled for ${item}; the validator decides at the next checkpoint`);
                else
                    console.log(`gap dismissed for ${item}; dismissed work never verifies`);
                if (after.suspend_reason === 'awaiting_answer' && parked === 0) {
                    console.log('every gap is answered; resuming');
                    await client.resume(run_id, { idempotency_key: `${control_id}:resume`, reason: 'resume after the accepted answer' });
                    return await attach(client, run_id);
                }
                if (parked > 0)
                    console.log(`${parked} parked items remain`);
                return 0;
            }
            case 'resume': {
                const run_id = need(commandArguments[0], 'run id');
                await client.resume(run_id, {
                    idempotency_key: argValue(commandArguments, '--idempotency-key') ?? makeId('ctl'),
                    reason: 'terminal resume command',
                });
                return await attach(client, run_id);
            }
            case 'fork': {
                const run_id = need(commandArguments[0], 'run id');
                const at = need(argValue(commandArguments, '--at'), 'an entry id after --at');
                const fork = await client.fork(run_id, { at_entry_id: at, idempotency_key: makeId('ctl'), reason: 'terminal fork' });
                console.log(`forked: ${fork.run_id}`);
                console.log(`continue it: ${context.command} resume ${fork.run_id}`);
                return 0;
            }
            case 'replay': {
                const run_id = need(commandArguments[0], 'run id');
                const replay = await client.reexecute(run_id, { idempotency_key: makeId('ctl'), reason: 'terminal replay' });
                console.log(`re-execution created: ${replay.run_id}`);
                console.log('models will be called again under a new pinned identity');
                await client.resume(replay.run_id, { idempotency_key: `${replay.run_id}:first-resume`, reason: 'start the new re-execution' });
                return await attach(client, replay.run_id);
            }
            case 'environment':
                return await environment(client, commandArguments);
            case 'provider':
                return await provider(client, commandArguments);
            case 'tool-source':
                return await toolSource(client, commandArguments);
            case 'rebuild': {
                const outcome = await client.rebuildProjection(need(commandArguments[0], 'run id'));
                console.log(outcome.equal
                    ? 'rebuilt: the stored head already matched the log, byte for byte'
                    : 'rebuilt: the head was restored from the log and now matches it');
                return 0;
            }
            case 'export': {
                const run_id = need(commandArguments[0], 'run id');
                const bundle = await client.exportRun(run_id);
                const out = argValue(commandArguments, '--out') ?? `${run_id}${SUCCESSOR_PRODUCT_IDENTITY.run_bundle_suffix}`;
                writeFileSync(out, bundle);
                console.log(`exported ${bundle.split('\n').length - 1} lines to ${out}, checksummed and chain verified on import`);
                return 0;
            }
            case 'import': {
                const file = need(commandArguments[0], 'a bundle file');
                const outcome = await client.importRun(readFileSync(file, 'utf8'));
                console.log(outcome.head_equal
                    ? `imported ${outcome.run_id}: ${outcome.records} records, and the refolded head matches the manifest`
                    : `imported ${outcome.run_id}, and the refolded head does not match the manifest. Do not promote this import.`);
                return outcome.head_equal ? 0 : 1;
            }
            case 'publish':
                return await publish(client, commandArguments, context);
            case 'doctor':
                return await databaseDoctor(client, commandArguments, connection.target);
        }
    }
    finally {
        await connection.close();
    }
}
export function runCliAndExit(options = {}) {
    runCli(options).then((code) => process.exit(code), (error) => {
        if (error instanceof DiagnosticError)
            console.error(renderDiagnostic(error.diagnostic));
        else
            console.error('defect:', error);
        process.exit(1);
    });
}
function helpText(context) {
    const commandWidth = Math.max(...CLI_USAGE_ROWS.map((row) => `${context.command} ${row.syntax}`.length));
    const rows = CLI_USAGE_ROWS
        .map((row) => `  ${`${context.command} ${row.syntax}`.padEnd(commandWidth)}  ${row.summary}`)
        .join('\n');
    const identity = cliIdentityReport(context);
    return `${t.label(context.command)} a log-native runtime for long-horizon agent work

usage
${rows}

identity
  product ${identity.product}
  runtime build ${identity.runtime_build}

The deterministic adapter is the default: a first run needs no credential,
no database server, and no network.

target
  Remote-capable commands use --url, then ZERO_AR_URL, then bundled Local Lite when this distribution carries it.
  Hosted authentication is read only from ZERO_AR_API_KEY. A selected hosted
  target refuses in place and never falls back to bundled execution.`;
}
function versionText(context) {
    const identity = cliIdentityReport(context);
    return [
        `${identity.product} command ${identity.command}`,
        `runtime build: ${identity.runtime_build}`,
        `contract: ${identity.contract_version}`,
    ].join('\n');
}
// ---- commands ----
/**
 * Environment administration stays on generated client methods. The command
 * only parses human arguments and renders JSON; policy and lifecycle behavior
 * remain in the tenant management service.
 */
async function environment(client, args) {
    const operation = need(args[0], 'an environment operation');
    const handlers = {
        capabilities: () => client.environmentCapabilities(),
        register: () => {
            const file = need(args[1], 'a JSON profile file');
            return client.registerEnvironment(RegisterEnvironmentRequestSchema.parse(JSON.parse(readFileSync(file, 'utf8'))));
        },
        publish: () => client.publishEnvironment(need(args[1], 'a profile reference')),
        enable: () => client.enableEnvironment(need(args[1], 'a profile reference'), { state: 'enabled', reason: args.slice(2).join(' ') || 'enabled from the terminal' }),
        drain: () => client.drainEnvironment(need(args[1], 'a profile reference'), { state: 'draining', reason: args.slice(2).join(' ') || 'drained from the terminal' }),
        disable: () => client.disableEnvironment(need(args[1], 'a profile reference'), { state: 'disabled', reason: args.slice(2).join(' ') || 'disabled from the terminal' }),
        'rotate-credentials': () => client.rotateEnvironmentCredentials(need(args[1], 'a profile reference'), {
            secret_issuance_epoch: Number(need(args[2], 'a positive credential issuance epoch')),
            reason: args.slice(3).join(' ') || 'rotated from the terminal',
        }),
        list: () => client.listEnvironments(),
        inspect: () => client.inspectEnvironment(need(args[1], 'a profile reference')),
        doctor: () => client.doctorEnvironment(need(args[1], 'a profile reference'), { active_check: args.includes('--active') }),
        conformance: () => client.conformEnvironment(need(args[1], 'a profile reference'), { real_provider: args.includes('--real-provider') }),
        jobs: () => client.listEnvironmentJobs(),
        observe: () => client.observeEnvironmentJob(need(args[1], 'a job id')),
        cancel: () => client.cancelEnvironmentJob({ job_id: need(args[1], 'a job id'), reason: args.slice(2).join(' ') || 'cancelled from the terminal' }),
        reconcile: () => client.reconcileEnvironmentJob({ job_id: need(args[1], 'a job id') }),
        teardown: () => client.teardownEnvironment({ job_id: need(args[1], 'a job id'), reason: args.slice(2).join(' ') || 'torn down from the terminal' }),
        abandon: () => client.abandonEnvironment({
            job_id: need(args[1], 'a job id'),
            reason: args.slice(2).join(' ') || 'the operator accepted the named unresolved provider state',
            remaining_uncertainty: ['the provider no longer offers a stronger disposition'],
            known_cost: {},
        }),
        sweep: () => client.sweepEnvironments({
            adapter_digest: argValue(args, '--adapter') ?? null,
            profile_ref: argValue(args, '--profile') ?? null,
            limit: Number(argValue(args, '--limit') ?? 100),
            teardown_terminal: !args.includes('--reconcile-only'),
            inspect_provider_resources: args.includes('--provider-inventory'),
            remove_confirmed_orphans: args.includes('--remove-confirmed-orphans'),
            orphan_grace_ms: Number(argValue(args, '--orphan-grace-ms') ?? 300_000),
            reason: 'the operator requested a bounded environment reconciliation sweep',
        }),
        metrics: () => client.environmentMetrics(),
    };
    const handler = handlers[operation];
    if (!handler) {
        console.error('error: environment needs capabilities, register, publish, enable, drain, disable, rotate-credentials, list, inspect, doctor, conformance, jobs, observe, cancel, reconcile, teardown, abandon, sweep, or metrics.');
        return 1;
    }
    const result = await handler();
    console.log(JSON.stringify(result, null, 2));
    return 0;
}
/**
 * Tool-source administration mirrors the public API. The command reads
 * JSON request files, prints JSON responses, and leaves provider policy to
 * the registry and hosted runtime.
 */
async function toolSource(client, args) {
    const operation = need(args[0], 'a tool-source operation');
    const handlers = {
        register: () => {
            const file = need(args[1], 'a JSON tool-source file');
            return client.registerToolSource(RegisterToolSourceRequestSchema.parse(JSON.parse(readFileSync(file, 'utf8'))));
        },
        list: () => client.listToolSources(),
        inspect: () => client.inspectToolSource(need(args[1], 'a source reference')),
        test: () => client.testToolSource(need(args[1], 'a source reference')),
        sync: () => {
            const sourceRef = need(args[1], 'a source reference');
            const file = need(args[2], 'a JSON catalogue-sync file');
            return client.syncToolSourceCatalogue(sourceRef, SyncToolSourceCatalogueRequestSchema.parse(JSON.parse(readFileSync(file, 'utf8'))));
        },
        catalogue: () => client.toolSourceCatalogue(need(args[1], 'a source reference')),
        enable: () => {
            const sourceRef = need(args[1], 'a source reference');
            const file = need(args[2], 'a JSON enablement file');
            return client.enableToolSourceTools(sourceRef, EnableToolSourceToolsRequestSchema.parse(JSON.parse(readFileSync(file, 'utf8'))));
        },
        disable: () => client.disableToolSource(need(args[1], 'a source reference'), ToolSourceStateRequestSchema.parse({ reason: args.slice(2).join(' ') || 'disabled from the terminal' })),
        remove: () => client.removeToolSource(need(args[1], 'a source reference'), ToolSourceStateRequestSchema.parse({ reason: args.slice(2).join(' ') || 'removed from the terminal' })),
    };
    const handler = handlers[operation];
    if (!handler) {
        console.error('error: tool-source needs register, list, inspect, test, sync, catalogue, enable, disable, or remove.');
        return 1;
    }
    const result = await handler();
    console.log(JSON.stringify(result, null, 2));
    return 0;
}
/**
 * Provider administration is a remote control-plane surface. Request files
 * use the generated public schemas, and protected credential bytes are read
 * from a file without entering command arguments or response rendering.
 */
async function provider(client, args) {
    const operation = need(args[0], 'a provider operation');
    const jsonRequest = (index, label, parse) => {
        const file = need(args[index], label);
        return parse(JSON.parse(readFileSync(file, 'utf8')));
    };
    const handlers = {
        'adapter-admit': () => client.admitModelAdapter(jsonRequest(1, 'an adapter admission JSON file', (value) => AdmitModelAdapterRequestSchema.parse(value))),
        'credential-external': () => client.createExternalCredentialBinding(jsonRequest(1, 'an external credential JSON file', (value) => CreateExternalCredentialBindingRequestSchema.parse(value))),
        'credential-protected': () => client.protectedCredentialIngest(jsonRequest(1, 'a protected credential JSON file', (value) => ProtectedCredentialIngestRequestSchema.parse(value))),
        'credential-inspect': () => client.inspectCredentialBinding(need(args[1], 'a credential binding reference')),
        'credential-rotate-external': () => client.rotateExternalCredential(need(args[1], 'a credential binding reference'), jsonRequest(2, 'an external rotation JSON file', (value) => RotateExternalCredentialRequestSchema.parse(value))),
        'credential-rotate-protected': () => client.rotateProtectedCredential(need(args[1], 'a credential binding reference'), jsonRequest(2, 'a protected rotation JSON file', (value) => RotateProtectedCredentialRequestSchema.parse(value))),
        'credential-revoke': () => client.revokeCredentialBinding(need(args[1], 'a credential binding reference'), RevokeCredentialRequestSchema.parse({ reason: args.slice(2).filter((argument) => argument !== '--url' && argument !== argValue(args, '--url')).join(' ') || 'revoked from the terminal' })),
        'instance-create': () => client.createProviderInstance(jsonRequest(1, 'a provider instance JSON file', (value) => CreateProviderInstanceRequestSchema.parse(value))),
        instances: () => client.listProviderInstances(),
        'catalogue-sync': () => client.syncProviderCatalogue(need(args[1], 'a provider instance reference'), jsonRequest(2, 'a catalogue JSON file', (value) => SyncProviderCatalogueRequestSchema.parse(value))),
        catalogue: () => client.providerCatalogue(need(args[1], 'a provider instance reference')),
        'model-enable': () => client.enableProviderModel(need(args[1], 'a provider instance reference'), EnableProviderModelRequestSchema.parse({ catalogue_entry_ref: need(args[2], 'a catalogue entry reference') })),
        pool: () => client.modelPool(),
        'alias-set': () => client.setModelAlias(jsonRequest(1, 'a model alias JSON file', (value) => SetModelAliasRequestSchema.parse(value))),
        'fallback-set': () => client.declareFallbackSet(jsonRequest(1, 'a fallback-set JSON file', (value) => DeclareFallbackSetRequestSchema.parse(value))),
        'default-set': () => client.setDefaultModelAlias(SetDefaultModelAliasRequestSchema.parse({ alias: need(args[1], 'a model alias') })),
    };
    const handler = handlers[operation];
    if (!handler) {
        console.error('error: provider needs adapter-admit, credential-external, credential-protected, credential-inspect, credential-rotate-external, credential-rotate-protected, credential-revoke, instance-create, instances, catalogue-sync, catalogue, model-enable, pool, alias-set, fallback-set, or default-set.');
        return 1;
    }
    const result = await handler();
    console.log(JSON.stringify(result, null, 2));
    return 0;
}
async function run(client, args, context) {
    const objective = args.filter((a) => !a.startsWith('--') && !isValueOf(args, a)).join(' ').trim();
    if (!objective) {
        console.error(`error: run needs an objective. Example: ${context.command} run "Summarise the brief"`);
        return 1;
    }
    const items = (argValue(args, '--items') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    let contractRef;
    const contractName = argValue(args, '--contract') ?? (items.length > 0 ? 'transform.items' : undefined);
    if (contractName) {
        const health = await client.health();
        const found = health.task_contracts.find((c) => c.name === contractName);
        if (!found) {
            console.error(`error: contract ${contractName} is not registered. Registered: ${health.task_contracts.map((c) => c.name).join(', ') || 'none'}.`);
            return 1;
        }
        contractRef = found.ref;
    }
    const created = await client.createRun({
        objective,
        principals: {
            executing: 'application:zeroar-cli',
            originating: process.env['USER'] ?? 'terminal',
            accountable: envValue('OWNER') ?? process.env['USER'] ?? 'local-operator',
        },
        budgets: {
            consumption: { model_tokens: Number(argValue(args, '--tokens') ?? 50_000), compute_ms: 600_000 },
            attention: Number(argValue(args, '--attention') ?? 0),
            verification_reserve_fraction: 0.2,
            max_turns: Number(argValue(args, '--max-turns') ?? (items.length > 0 ? Math.ceil(items.length / 2) + 12 : 12)),
        },
        ...(contractRef ? { task_contract_ref: contractRef } : {}),
        ...(items.length > 0 ? { inputs: { items } } : {}),
        idempotency_key: makeId('ctl'),
    });
    const snapshot = created.snapshot;
    console.log(t.label(`run ${shortId(created.run_id)}`) + ' ' + t.dim(created.run_id));
    const resolved = await client.records(created.run_id, 0);
    const createdRecord = resolved.records.find((r) => r.type === 'run.created');
    const narration = createdRecord?.payload['resolved']?.narration ?? [];
    for (const line of narration)
        console.log('  ' + t.dim(neutralize(line)));
    console.log('');
    void snapshot;
    return attach(client, created.run_id);
}
async function attach(client, run_id) {
    const abort = new AbortController();
    const progress = client.streamProgress(run_id, (text) => process.stdout.write(t.dim(neutralize(text))), abort.signal).catch(() => undefined);
    let sawDelta = false;
    await client.streamRecords(run_id, 0, (event) => {
        if (!sawDelta)
            sawDelta = true;
        renderEvent(event);
    }, abort.signal);
    abort.abort();
    await progress;
    console.log('');
    return showResult(client, run_id);
}
function renderEvent(raw) {
    // Everything in a payload arrived from a run, so it neutralizes before
    // it touches the terminal (XCV-009).
    const event = neutralizeDeep(raw);
    const at = t.dim(event.at.slice(11, 19));
    switch (event.event) {
        case 'run.started':
            console.log(`${at}  ${t.label('run started')}`);
            return;
        case 'turn.completed':
            console.log(`${at}  turn ${String(event.payload['turn'])} completed`);
            return;
        case 'lease.reserved':
            console.log(`${at}  ${t.dim(`lease reserved ${String(event.payload['amount'])} ${String(event.payload['denomination'])}`)}`);
            return;
        case 'lease.consumed':
            console.log(`${at}  ${t.dim(`lease settled ${String(event.payload['amount'])} of ${String(event.payload['reserved'])}`)}`);
            return;
        case 'lease.released':
            return; // the settle line already carries the numbers
        case 'checkpoint.started':
            console.log(`${at}  ${t.dim(`checkpoint over ${event.payload['covered_items'].length} items`)}`);
            return;
        case 'checkpoint.passed': {
            const n = event.payload['covered_items'].length;
            console.log(`${at}  ${t.state('verified')} checkpoint: ${n} items promoted by ${event.payload['validator_versions'].join(', ')}`);
            return;
        }
        case 'checkpoint.rejected': {
            const rejected = event.payload['rejected_items'];
            console.log(`${at}  ${t.state('rejected')} checkpoint: ${t.dim(String(event.payload['reason']))}`);
            console.log(`${at}  repair forks from the last passing checkpoint; ${rejected.length} items invalidated`);
            return;
        }
        case 'checkpoint.indeterminate':
            console.log(`${at}  ${t.state('indeterminate')} checkpoint: ${t.dim(String(event.payload['reason']))}`);
            return;
        case 'item.parked':
            console.log(`${at}  ${t.state('parked')} ${String(event.payload['item_id'])}: ${t.dim(String(event.payload['reason']))}`);
            return;
        case 'gap.settled':
            console.log(`${at}  gap settled for ${String(event.payload['item_id'])} by ${String(event.payload['resolver'])}; the validator decides next`);
            return;
        case 'gap.dismissed':
            console.log(`${at}  gap dismissed for ${String(event.payload['item_id'])} by ${String(event.payload['resolver'])}: ${t.dim(String(event.payload['reason']))}`);
            return;
        case 'item.invalidated':
            return; // the checkpoint line already carries the count
        case 'completion.proposed':
            console.log(`${at}  completion proposed; the claim now meets verification`);
            return;
        case 'verification.concluded': {
            const verdict = String(event.payload['verdict']);
            const name = verdict === 'verified' ? 'verified' : verdict === 'rejected' ? 'rejected' : 'indeterminate';
            console.log(`${at}  ${t.state(name)} ${t.dim(String(event.payload['reason']))}`);
            return;
        }
        case 'run.suspended':
            console.log(`${at}  ${t.state('parked', 'suspended')} ${t.dim(String(event.payload['detail'] ?? event.payload['reason']))}`);
            return;
        case 'run.cancelled':
            console.log(`${at}  cancelled: ${t.dim(String(event.payload['reason']))}`);
            return;
        case 'run.finished': {
            const terminal = String(event.payload['terminal']);
            const mark = terminal === 'complete' ? t.state('verified', 'complete') : t.state('unverified', 'unverified artifact');
            console.log(`${at}  run finished as ${mark}`);
            return;
        }
        default:
            console.log(`${at}  ${t.dim(event.event)}`);
    }
}
async function showResult(client, run_id, asJson = false) {
    const result = await client.result(run_id);
    // The typed payload, canonical bytes: what the SDK and the HTTP route
    // return, unchanged, for pipelines and cross-surface comparison.
    if (asJson) {
        console.log(canonicalJson(result));
        return 0;
    }
    const mark = stateFor(result.terminal, result.verdict);
    console.log(t.label('result') + '  ' + t.state(mark, result.terminal === 'unverified_artifact' ? 'unverified artifact' : (result.terminal ?? result.status)));
    if (result.artifact) {
        console.log('');
        console.log(neutralize(result.artifact.text));
    }
    if (result.not_established.length > 0) {
        console.log('');
        console.log(t.label('what was not established'));
        for (const line of result.not_established)
            console.log(`  ${neutralize(line)}`);
    }
    console.log('');
    console.log(t.label('handover'));
    for (const line of result.handover)
        console.log(`  ${neutralize(line)}`);
    return result.terminal === 'complete' || result.terminal === 'unverified_artifact' ? 0 : result.status === 'suspended' ? 2 : 0;
}
async function inspect(client, run_id) {
    const s = await client.snapshot(run_id);
    const rows = [
        ['state', s.status + (s.terminal ? `, ${s.terminal}` : '') + (s.suspend_reason ? `, ${s.suspend_reason}` : '')],
        ['completion', s.completion_state],
        ['agent', `${s.agent_name} on ${s.model_ref}`],
        ['objective', s.objective.length > 80 ? s.objective.slice(0, 77) + '...' : s.objective],
        ['turns', String(s.turn)],
        ['entries', String(s.entry_count)],
        ['verified completion', s.verified_completion_reachable ? 'reachable' : 'unreachable, no validator coverage'],
    ];
    if (s.items) {
        const parts = Object.entries(s.items)
            .filter(([, n]) => n > 0)
            .map(([state, n]) => `${n} ${state.replace('_', ' ')}`);
        rows.push(['items', parts.join(', ') || 'none']);
    }
    if (s.contract) {
        rows.push(['contract', `${s.contract.name}, repair ${s.contract.repair_attempts_used} of ${s.contract.repair_budget} attempts used`]);
    }
    for (const [key, use] of Object.entries(s.usage)) {
        rows.push([key, `${use.consumed} consumed, ${use.reserved} outstanding`]);
    }
    rows.push(['snapshot version', String(s.snapshot_version)]);
    console.log(t.label(`run ${shortId(run_id)}`) + ' ' + t.dim(run_id));
    console.log(t.table(rows.map(([k, v]) => ['  ' + (k ?? ''), v ?? ''])));
    return 0;
}
async function records(client, run_id) {
    const { records: rows } = await client.records(run_id, 0);
    console.log(t.table(rows.map((r) => [String(r.seq), t.dim(r.at.slice(11, 19)), r.type, t.dim(shortId(r.record_id))])));
    return 0;
}
async function doctor(rest = [], context) {
    const [major, minor] = process.versions.node.split('.').map(Number);
    const serverEntry = serverEntrypointPath();
    const identity = cliIdentityReport(context);
    const home = resolveLocalDataHome(process.cwd());
    const checks = [
        ['product identity', true, `${identity.product}, command ${identity.command}`],
        ['runtime build', true, identity.runtime_build],
        ['node 23.6 or later', (major ?? 0) > 23 || ((major ?? 0) === 23 && (minor ?? 0) >= 6), `found ${process.versions.node}`],
        ['server entrypoint present', existsSync(serverEntry), serverEntry],
        ['data directory writable', canWrite(home), `${home} under the working directory`],
        ['offline first run', true, 'the deterministic adapter answers with no provider account'],
    ];
    const failed = checks.filter(([, ok]) => !ok).length;
    // A stable machine-readable report for an installer or an operator
    // (DXI-027). The words and the shape both stay stable across versions.
    if (rest.includes('--json')) {
        console.log(canonicalJson({
            schema: 'zero-ar-doctor/1',
            ok: failed === 0,
            identity,
            profile: 'local-lite',
            versions: { node: process.versions.node, contract: CONTRACT_VERSION },
            release: installedRelease(serverEntry),
            data_home: home,
            checks: checks.map(([name, ok, detail]) => ({ name, ok, detail })),
        }));
        return failed === 0 ? 0 : 1;
    }
    for (const [name, ok, detail] of checks) {
        console.log(`${ok ? t.state('verified', 'ok') : t.state('rejected', 'failing')}  ${name}  ${t.dim(detail)}`);
    }
    return failed === 0 ? 0 : 1;
}
/** The Local Lite manifest beside an installed bundle, when there is one (DXI-027). */
function installedRelease(serverEntry) {
    const manifest = resolve(serverEntry, '..', '..', 'local-lite-manifest.json');
    if (!existsSync(manifest))
        return null;
    try {
        const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
        return {
            version: parsed.version ?? 'unknown',
            source_revision: parsed.source_revision ?? 'unknown',
            signature_identity: parsed.signature_identity ?? 'unknown',
            release_key_fingerprint: parsed.release_key_fingerprint ?? 'unknown',
        };
    }
    catch {
        return null;
    }
}
async function databaseDoctor(client, rest, target) {
    const report = await client.databaseDoctor();
    const commandTarget = { mode: target.mode, source: target.source };
    if (rest.includes('--json')) {
        console.log(canonicalJson({ ...report, command_target: commandTarget }));
        return report.ok ? 0 : 1;
    }
    renderDatabaseDoctor(report, target);
    return report.ok ? 0 : 1;
}
function renderDatabaseDoctor(report, target) {
    console.log(`${report.ok ? t.state('verified', 'ok') : t.state('rejected', 'attention')}  database ${report.mode}`);
    const rows = [
        ['target mode', target.mode],
        ['target source', target.source],
        ['mode', report.mode],
        ['reachable', report.database.reachable ? 'yes' : 'no'],
        ['database', report.database.name ?? 'unknown'],
        ['server', report.database.server_version ?? 'unknown'],
        ['network RTT', ms(report.latency.rtt_ms)],
        ['round trips', String(report.latency.critical_path_round_trips)],
        ['run samples', String(report.latency.observed_run_transition_samples)],
        ['observation samples', String(report.latency.observed_observation_samples)],
        ['expected added latency', ms(report.latency.expected_additive_run_latency_ms)],
        ['reference targets', report.latency.meets_ratified_reference_targets ? 'met' : 'not met'],
        ['pool', `${report.connection_pool.total}/${report.connection_pool.max} connections, ${report.connection_pool.waiting} waiting`],
        ['forced RLS', report.forced_rls.ok ? 'ok' : report.forced_rls.failures.join('; ')],
    ];
    for (const role of report.roles)
        rows.push([`${role.purpose} role`, `${role.role}: ${role.ok ? 'ok' : role.checks.join('; ')}`]);
    const headlineMetrics = [
        'append_latency_ms',
        'lease_reservation_latency_ms',
        'lease_settlement_latency_ms',
        'projection_fold_latency_ms',
        'committed_record_to_observation_latency_ms',
        'connection_pool_wait_ms',
    ];
    for (const name of headlineMetrics) {
        const metric = report.metrics.find((entry) => entry.name === name);
        if (metric)
            rows.push([name, `p50 ${ms(metric.p50)}, p95 ${ms(metric.p95)}, p99 ${ms(metric.p99)}`]);
    }
    console.log(t.table(rows.map(([left, right]) => ['  ' + left, right])));
    if (report.latency.warning)
        console.log(`warning: ${report.latency.warning}`);
}
function ms(value) {
    return value === null ? 'unknown' : `${value.toFixed(1)} ms`;
}
function profile(rest, context) {
    const home = resolveLocalDataHome(process.cwd());
    const keySource = envValue('KEY_SOURCE');
    const capabilityManifest = profileCapabilitySummaryFor('local-lite');
    const capabilityManifestView = {
        manifest_id: capabilityManifest.manifest_id,
        manifest_ref: capabilityManifest.manifest_ref,
        profile: capabilityManifest.profile,
        version: capabilityManifest.version,
        supported: capabilityManifest.supported.length,
        conditional: capabilityManifest.conditional.length,
        excluded: capabilityManifest.excluded.length,
        required_components: capabilityManifest.required_components,
        health_probes: capabilityManifest.health_probes,
    };
    const report = {
        schema: 'zero-ar-profile/1',
        identity: cliIdentityReport(context),
        profile: 'local-lite',
        capability_manifest: capabilityManifestView,
        data_home: home,
        database: resolve(envValue('DB') ?? `${home}/local.db`),
        versions: { contract: CONTRACT_VERSION, node: process.versions.node },
        // A provider account is optional after the offline run; the source is
        // classified, never the value (DXI-028).
        credential_source: keySource === 'stdin'
            ? 'protected-stdin'
            : keySource === 'keychain'
                ? 'os-keychain'
                : process.env['ANTHROPIC_API_KEY']
                    ? 'environment'
                    : null,
        exclusions: capabilityManifest.excluded.map((entry) => `${entry.capability}: ${entry.summary}`),
        uninstall: `remove ${home} to erase local profile state; published closures live in the hosted registry`,
    };
    if (rest.includes('--json')) {
        console.log(canonicalJson(report));
        return 0;
    }
    console.log(t.label('profile') + '  ' + report.profile);
    console.log(t.label('manifest') + '  ' + report.capability_manifest.manifest_ref);
    console.log(t.label('data home') + '  ' + report.data_home);
    console.log(t.label('versions') + '  ' + `contract ${report.versions.contract}, node ${report.versions.node}`);
    console.log(t.label('credential') + '  ' + (report.credential_source ?? 'none bound; the offline run needs none'));
    for (const line of report.exclusions)
        console.log(t.label('excludes') + '  ' + line);
    console.log(t.label('uninstall') + '  ' + report.uninstall);
    return 0;
}
/**
 * Local publication work: compile the closure, verify every hash and edge,
 * and either explain the plan or commit it through the hosted session API.
 */
async function publish(client, rest, context) {
    const source = rest.find((argument) => !argument.startsWith('--'));
    if (!source) {
        console.error(`publish needs a source, like ${context.command} publish ./agent.yaml --dry-run`);
        return 1;
    }
    const compiled = await compileProject(source);
    verifyBundle(compiled.bundle, compiled.blobs);
    if (rest.includes('--dry-run')) {
        console.log(rest.includes('--json') ? JSON.stringify(compiled.bundle, null, 2) : neutralize(renderPlan(compiled)));
        return 0;
    }
    if (!client) {
        throw new Error('publication reached its remote phase without a resolved runtime target. This is a command composition defect.');
    }
    const receipt = await commitHostedPublication(client, compiled);
    if (rest.includes('--json'))
        console.log(canonicalJson(receipt));
    else {
        console.log(`${t.label('published')}  ${shortId(receipt.publication_ref)} from ${shortId(receipt.root_ref)}`);
        console.log(`${t.label('stored')}     ${receipt.counts.declarations} declarations, ${receipt.counts.assets} assets, ${receipt.counts.total_bytes} bytes`);
        console.log(`${t.label('establishes')} ${receipt.establishes}`);
    }
    return 0;
}
async function commitHostedPublication(client, compiled) {
    const session = await client.createPublicationSession({ bundle: compiled.bundle });
    const assets = new Set(compiled.bundle.assets.map((asset) => asset.content_ref));
    for (const ref of session.missing_blobs) {
        const bytes = compiled.blobs.get(ref);
        if (bytes === undefined)
            throw new Error(`the compiled bundle does not hold ${ref}, so it cannot be staged.`);
        const byteBuffer = Buffer.from(bytes, 'utf8');
        if (assets.has(ref) && byteBuffer.byteLength > 4_000_000) {
            await stagePublicationAssetByChunks(client, session.session_id, ref, byteBuffer);
            continue;
        }
        if (bytes.length > 4_000_000) {
            throw new Error(`declaration ${ref.slice(0, 20)} is too large for the JSON publication frame. Split the declaration before publishing.`);
        }
        await client.stagePublicationBlob(session.session_id, { content_ref: ref, bytes });
    }
    return client.commitPublication(session.session_id, {});
}
async function stagePublicationAssetByChunks(client, session_id, content_ref, bytes) {
    let offset = (await client.publicationBlobUploadStatus(session_id, content_ref)).offset;
    while (offset < bytes.byteLength) {
        const end = Math.min(offset + 256 * 1024, bytes.byteLength);
        offset = (await client.stagePublicationBlobChunk(session_id, content_ref, offset, bytes.subarray(offset, end))).offset;
    }
    await client.finishPublicationBlobUpload(session_id, content_ref);
}
function init(rest, context) {
    const optionValues = new Set();
    for (const option of ['--kind', '--fixture']) {
        const index = rest.indexOf(option);
        if (index >= 0)
            optionValues.add(index + 1);
    }
    const dir = rest.find((argument, index) => !argument.startsWith('--') && !optionValues.has(index)) ?? '.';
    const kind = argValue(rest, '--kind') ?? 'agent';
    mkdirSync(dir, { recursive: true });
    if (kind === 'external-product')
        return initExternalProduct(dir, rest, context);
    if (kind !== 'agent') {
        console.error(`init kind ${kind} is unknown. Use agent or external-product.`);
        return 1;
    }
    const template = productProjectTemplate();
    const write = (name, content) => {
        const path = `${dir}/${name}`;
        if (existsSync(path)) {
            console.log(t.dim(`kept existing ${name}`));
            return;
        }
        writeFileSync(path, content);
        console.log(`wrote ${name}`);
    };
    for (const file of template.files)
        write(file.path, file.content);
    console.log('');
    console.log(`start a run: ${context.command} run "Summarise the objective"`);
    return 0;
}
/** Write one versioned external repository while preserving existing files. */
function initExternalProduct(dir, rest, context) {
    const fixture = (argValue(rest, '--fixture') ?? 'facilities-operations');
    if (!['facilities-operations', 'large-corpus-review'].includes(fixture)) {
        console.error(`external-product fixture ${fixture} is unknown. Use facilities-operations or large-corpus-review.`);
        return 1;
    }
    const template = externalProductTemplate({ fixture });
    for (const file of template.files)
        writeTemplateFile(dir, file);
    console.log('');
    console.log(`external product ${fixture} uses Zero-AR API v1; run npm install, then npm test`);
    console.log(`publish its agent: ${context.command} publish ${resolve(dir, 'domain/agent.yaml')} --url <cell>`);
    return 0;
}
function writeTemplateFile(root, file) {
    const path = resolve(root, file.path);
    mkdirSync(dirname(path), { recursive: true });
    if (existsSync(path)) {
        console.log(t.dim(`kept existing ${file.path}`));
        return;
    }
    writeFileSync(path, file.content);
    console.log(`wrote ${file.path}`);
}
function startServer() {
    const entry = serverEntrypointPath();
    const childEnvironment = { ...process.env };
    delete childEnvironment[productEnvironmentNames('API_KEY').name];
    const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', entry], {
        stdio: ['ignore', 'pipe', 'inherit'],
        env: childEnvironment,
    });
    return new Promise((resolve, reject) => {
        const lines = createInterface({ input: child.stdout });
        lines.once('line', (line) => {
            try {
                const ready = JSON.parse(line);
                resolve({ base_url: ready.url, stop: () => child.kill('SIGTERM') });
            }
            catch {
                reject(new Error(`the server did not print a ready line. It said: ${line}`));
            }
        });
        child.once('exit', (code) => reject(new Error(`the server exited with ${code} before it was ready.`)));
    });
}
function serverEntrypointPath() {
    if (typeof ZERO_AR_RELEASE_BUNDLE !== 'undefined' && ZERO_AR_RELEASE_BUNDLE) {
        return new URL('./zero-ar-server.mjs', import.meta.url).pathname;
    }
    const developmentEntrypoint = `${new URL('../../zero-ar-server/src/main', import.meta.url).pathname}.ts`;
    if (existsSync(developmentEntrypoint))
        return developmentEntrypoint;
    const bundledEntrypoint = new URL('./zero-ar-server.mjs', import.meta.url).pathname;
    if (existsSync(bundledEntrypoint))
        return bundledEntrypoint;
    throw new Error('local run commands need a server entrypoint, but this package carries only the public CLI files. Use the source-free release bundle, or select a hosted endpoint with --url or ZERO_AR_URL.');
}
// ---- small helpers ----
function resolveLocalDataHome(cwd) {
    return resolve(cwd, productLocalDataDirectory());
}
function need(value, what) {
    if (value === undefined || value === '') {
        console.error(`error: ${what} is required.`);
        process.exit(1);
    }
    return value;
}
function canWrite(dir) {
    try {
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/.doctor-probe`, 'ok');
        return true;
    }
    catch {
        return false;
    }
}
function argValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}
function isValueOf(args, value) {
    const index = args.indexOf(value);
    return index > 0 && (args[index - 1]?.startsWith('--') ?? false);
}
function envValue(suffix, fallback) {
    return productEnvironmentValue(suffix, process.env, fallback);
}
function isDirectEntrypoint(metaUrl, argvEntry) {
    return argvEntry !== undefined && pathToFileURL(resolve(argvEntry)).href === metaUrl;
}
// Development convenience only: running this module directly behaves like
// the successor command. A release bundle inlines this module into the
// command entrypoints, whose own call is the only invocation there; a second
// one here would render help twice and spawn a second server on one
// database, so the bundle flag turns this off at build time.
if (typeof ZERO_AR_RELEASE_BUNDLE === 'undefined' && isDirectEntrypoint(import.meta.url, process.argv[1]))
    runCliAndExit();
