import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONTRACT_VERSION, AUTHORING_SCAFFOLD_KINDS, CapabilityAdmissionRequestSchema, DiagnosticError, AdmitModelAdapterRequestSchema, CreateExternalCredentialBindingRequestSchema, CreateProviderInstanceRequestSchema, DeclareFallbackSetRequestSchema, EnableProviderModelRequestSchema, EnableToolSourceToolsRequestSchema, ProtectedCredentialIngestRequestSchema, RegisterEnvironmentRequestSchema, RegisterSourceRequestSchema, RegisterToolSourceRequestSchema, RunContinuationDeclarationSchema, RUN_PORTABILITY_LEVELS, RevokeCredentialRequestSchema, RotateExternalCredentialRequestSchema, RotateProtectedCredentialRequestSchema, SetDefaultModelAliasRequestSchema, SetModelAliasRequestSchema, SyncProviderCatalogueRequestSchema, SyncToolSourceCatalogueRequestSchema, ToolSourceStateRequestSchema, canonicalJson, makeId, turnCeilingForBudget, productEnvironmentNames, productEnvironmentValue, profileCapabilitySummaryFor, resolveCommandTarget, renderDiagnostic, shortId, SUCCESSOR_PRODUCT_IDENTITY, SUPPORTED_NODE_RUNTIME, isSupportedNodeRuntime, productLocalDataDirectory, } from '@zero-ar/contracts';
import { connectRuntimeTarget, ZeroARClient } from '@zero-ar/client';
import { authoringScaffold, compileAuthoringSource, loadProject, lockBytes, publishCapabilitySource, previewPublicationVerificationPlan, renderPlan, renderVerificationPlan, scaffoldProject, verifyBundle, } from '@zero-ar/sdk';
import { CLI_COMMANDS, CLI_COMMAND_EXAMPLES, CLI_HELP_SECTIONS, CLI_USAGE_ROWS, cliIdentityReport, createCliContext, isRemoteCapableCommand, } from "./identity.js";
import { CLI_COMMAND_MODULES } from "./commands/index.js";
import { exportedArtifactsNote } from "./commands/artifact.js";
import { externalProductTemplate } from "./external-product-template.js";
import { Terminal, detectAscii, detectTier, neutralize, neutralizeDeep, stateFor } from "./terminal.js";
let t = new Terminal();
export async function runCli(options = {}) {
    const context = createCliContext();
    const parsed = globalCliArguments(options.argv ?? process.argv.slice(2));
    t = new Terminal(detectTier(process.env, process.stdout.isTTY ?? false, parsed.no_color), detectAscii(process.env));
    const [command, ...rest] = parsed.arguments;
    if (!command) {
        console.log(conciseHelpText(context));
        return 0;
    }
    if (command === 'help' || command === '--help' || command === '-h') {
        const requested = command === 'help' ? rest[0] : undefined;
        if (requested)
            return printCommandHelp(requested, context);
        console.log(helpText(context));
        return 0;
    }
    if (rest.includes('--help') || rest.includes('-h'))
        return printCommandHelp(command, context);
    if (command === 'version' || command === '--version') {
        console.log(versionText(context));
        return 0;
    }
    if (command === 'init')
        return init(rest, context);
    if (command === 'scaffold')
        return scaffold(rest, context);
    if (command === 'validate')
        return validate(rest);
    if (command === 'profile')
        return profile(rest, context);
    if (command === 'doctor' && !rest.includes('--database'))
        return doctor(rest, context);
    if (command === 'publish' && rest.includes('--dry-run'))
        return publish(null, rest, context);
    const commandModule = CLI_COMMAND_MODULES.get(command);
    const answeredLocally = await commandModule?.local?.(rest, context);
    if (answeredLocally !== undefined && answeredLocally !== null)
        return answeredLocally;
    if (!isRemoteCapableCommand(command)) {
        return unknownCommand(command, context);
    }
    const resolved = resolveCommandTarget({ arguments: rest, environment: process.env });
    const connection = await connectRuntimeTarget({
        target: resolved.target,
        environment: process.env,
        start_bundled: () => startServer(localRecoveryScope(command, resolved.command_arguments)),
    });
    const client = connection.client;
    const commandArguments = resolved.command_arguments;
    try {
        const answeredRemotely = await commandModule?.remote?.(client, commandArguments, context);
        if (answeredRemotely !== undefined && answeredRemotely !== null)
            return answeredRemotely;
        switch (command) {
            case 'run':
                return await run(client, commandArguments, context);
            case 'attach':
                return await attach(client, need(commandArguments[0], 'run id'), { command: context.command, after: cursorValue(commandArguments, '--after') });
            case 'inspect':
                return await inspect(client, need(commandArguments[0], 'run id'));
            case 'verification-plan':
                return await verificationPlan(client, need(commandArguments[0], 'run id'), commandArguments.includes('--json'));
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
            case 'pause':
                await client.control(need(commandArguments[0], 'run id'), {
                    verb: 'pause',
                    control_id: makeId('ctl'),
                    ...(commandArguments.length > 1 ? { reason: commandArguments.slice(1).join(' ') } : {}),
                });
                console.log('pause accepted; the run suspends at its next turn boundary, or now if it is already suspended, and resume continues it');
                return 0;
            case 'budget': {
                const run_id = need(commandArguments[0], 'run id');
                const add = {};
                for (const [flag, field] of [['--model-tokens', 'model_tokens'], ['--tool-calls', 'tool_calls'], ['--bytes', 'bytes'], ['--compute-ms', 'compute_ms'], ['--attention', 'attention'], ['--turns', 'max_turns']]) {
                    const value = argValue(commandArguments, flag);
                    if (value !== undefined)
                        add[field] = Number(value);
                }
                const reason = argValue(commandArguments, '--reason');
                const amended = await client.amendBudgets(run_id, { idempotency_key: argValue(commandArguments, '--idempotency-key') ?? makeId('ctl'), add, ...(reason ? { reason } : {}) });
                console.log(`budget amended; the run now has ${amended.budgets.consumption.model_tokens} model tokens and ${amended.budgets.max_turns} turns, and a suspended run continues after resume`);
                return 0;
            }
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
                const choice = argValue(commandArguments, '--choice');
                const dismiss = argValue(commandArguments, '--dismiss');
                const control_id = makeId('ctl');
                const accepted = await client.control(run_id, {
                    verb: 'answer',
                    control_id,
                    handle: item,
                    ...(output ? { text: output } : {}),
                    ...(choice ? { choice } : {}),
                    ...(dismiss ? { reason: dismiss } : {}),
                });
                const after = await client.snapshot(run_id);
                const parked = after.items?.parked ?? 0;
                if (output || choice)
                    console.log(`answered ${item}; a check's item goes to its validator at the next checkpoint, and an agent's question returns to the agent`);
                else
                    console.log(`gap dismissed for ${item}; dismissed work never verifies`);
                if (parked === 0 && (after.suspend_reason === 'awaiting_answer' || after.status === 'running')) {
                    console.log('every gap is answered; the run wakes on its own');
                    return await attach(client, run_id, { command: context.command, settle_after_record_seq: accepted.accepted_seq });
                }
                if (parked > 0)
                    console.log(`${parked} parked items remain`);
                return 0;
            }
            case 'attention':
                throw new Error('the attention command module returned without answering. This is a defect in apps/cli/src/commands/attention.ts.');
            case 'resume': {
                const run_id = need(commandArguments[0], 'run id');
                const accepted = await client.resume(run_id, {
                    idempotency_key: argValue(commandArguments, '--idempotency-key') ?? makeId('ctl'),
                    reason: 'terminal resume command',
                });
                return await attach(client, run_id, { command: context.command, settle_after_record_seq: accepted.accepted_seq });
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
                const accepted = await client.resume(replay.run_id, { idempotency_key: `${replay.run_id}:first-resume`, reason: 'start the new re-execution' });
                return await attach(client, replay.run_id, { command: context.command, settle_after_record_seq: accepted.accepted_seq });
            }
            case 'environment':
                return await environment(client, commandArguments);
            case 'provider':
                return await provider(client, commandArguments);
            case 'tool-source':
                return await toolSource(client, commandArguments);
            case 'effect':
                console.error(`error: ${context.command} effect needs targets.`);
                return 1;
            case 'source':
                return await source(client, commandArguments);
            case 'capability':
                return await capability(client, commandArguments);
            case 'rebuild': {
                const outcome = await client.rebuildProjection(need(commandArguments[0], 'run id'));
                console.log(outcome.equal
                    ? 'rebuilt: the stored head already matched the log, byte for byte'
                    : 'rebuilt: the head was restored from the log and now matches it');
                return 0;
            }
            case 'export': {
                const run_id = need(commandArguments[0], 'run id');
                const handoffTo = argValue(commandArguments, '--handoff-to');
                const handoff = handoffTo
                    ? await client.handoffRun(run_id, { destination_ref: handoffTo, idempotency_key: `handoff:${run_id}:${handoffTo}` })
                    : null;
                const bundle = await client.exportRun(run_id);
                const out = argValue(commandArguments, '--out') ?? `${run_id}${SUCCESSOR_PRODUCT_IDENTITY.run_bundle_suffix}`;
                writeFileSync(out, bundle);
                const portability = exportedRunPortability(bundle);
                if (commandArguments.includes('--json')) {
                    console.log(canonicalJson({ run_id, file: out, lines: bundle.split('\n').length - 1, portability, ...(handoff ? { handoff } : {}) }));
                }
                else {
                    if (handoff)
                        console.log(`handed off to ${handoff.destination_ref}, signed by key ${handoff.signing_key_ref}; this cell no longer resumes the run`);
                    console.log(`exported ${bundle.split('\n').length - 1} lines to ${out}, checksummed and chain verified on import${exportedArtifactsNote(bundle)}`);
                    renderRunPortability(portability);
                }
                return 0;
            }
            case 'import': {
                if (commandArguments[0] === '--destination') {
                    const identity = await client.continuationDestination();
                    if (commandArguments.includes('--json'))
                        console.log(canonicalJson(identity));
                    else
                        console.log(`destination ${identity.destination_ref}\nname it on the source cell with export <run> --handoff-to ${identity.destination_ref}`);
                    return 0;
                }
                const file = need(commandArguments[0], 'a bundle file');
                const declaration = continuationDeclaration(commandArguments);
                const outcome = await client.importRun(readFileSync(file, 'utf8'));
                const compatibility = declaration && outcome.continuation
                    ? await client.checkRunContinuation(outcome.run_id, declaration)
                    : null;
                const continueRequested = commandArguments.includes('--continue');
                const continued = continueRequested && compatibility?.compatible
                    ? await client.continueImportedRun(outcome.run_id, {
                        idempotency_key: argValue(commandArguments, '--idempotency-key') ?? makeId('ctl'),
                        declaration: need(declaration ?? undefined, 'an executor declaration after --executor when --continue is set'),
                    })
                    : null;
                const portability = importedRunPortability(outcome, compatibility, continued?.accepted ?? false);
                if (commandArguments.includes('--json')) {
                    console.log(canonicalJson({ ...outcome, portability, ...(compatibility ? { compatibility } : {}), ...(continued ? { continued } : {}) }));
                }
                else {
                    console.log(outcome.head_equal
                        ? `imported ${outcome.run_id}: ${outcome.records} records, and the refolded head matches the manifest`
                        : `imported ${outcome.run_id}, and the refolded head does not match the manifest. Do not promote this import.`);
                    if (outcome.artifacts) {
                        const reasons = [...new Set(outcome.artifacts.not_transferred.map((omission) => omission.reason))].sort();
                        console.log(`artifacts: ${outcome.artifacts.imported.length} restored, ${outcome.artifacts.not_transferred.length} named but not transferred` +
                            (reasons.length > 0 ? ` (${reasons.join(', ')})` : ''));
                    }
                    renderRunPortability(portability);
                }
                const compatibilityPassed = !declaration || compatibility?.compatible === true;
                const continuationPassed = !continueRequested || continued?.accepted === true;
                return outcome.head_equal && compatibilityPassed && continuationPassed ? 0 : 1;
            }
            case 'publish':
                return await publish(client, commandArguments, context);
            case 'doctor':
                return await databaseDoctor(client, commandArguments, connection.target);
            case 'context':
                throw new Error('the context command module returned without answering. This is a defect in apps/cli/src/commands/context.ts.');
            case 'publication':
            case 'registry':
            case 'artifact':
            case 'memory':
                throw new Error(`${command} reached the built-in dispatch, but its command module answers every ${command} operation. Check the command table.`);
        }
    }
    finally {
        await connection.close();
    }
}
export function runCliAndExit(options = {}) {
    runCli(options).then((code) => process.exit(code), (error) => {
        console.error(renderCliFailure(error));
        process.exit(1);
    });
}
export function renderCliFailure(error, options = {}) {
    if (error instanceof DiagnosticError)
        return renderDiagnostic(error.diagnostic);
    const command = options.command ?? createCliContext().command;
    const debugName = productEnvironmentNames('DEBUG').name;
    const debug = options.debug ?? productEnvironmentValue('DEBUG', process.env) === '1';
    const reason = cleanFailureText(error instanceof Error ? error.message : String(error), false);
    const lines = [
        'error cli.command.failed: the command stopped before it finished.',
        `reason: ${reason || 'the command returned an error without a reason'}`,
        `next: run ${command} doctor to check the installation and selected runtime target`,
    ];
    if (debug && error instanceof Error && error.stack) {
        lines.push('debug details:', cleanFailureText(error.stack, true));
    }
    else {
        lines.push(`debug: rerun with ${debugName}=1 to include stack details in a problem report`);
    }
    return lines.join('\n');
}
function cleanFailureText(value, preserveLines) {
    const redacted = neutralize(value)
        .replace(/\bBearer\s+[^\s,;]+/gi, 'Bearer [redacted]')
        .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, '[redacted]')
        .replace(/([?&][^=&#\s]+)=([^&#\s]*)/g, '$1=[redacted]')
        .slice(0, 8_000);
    return preserveLines ? redacted : redacted.replace(/\s+/g, ' ').trim();
}
function helpText(context) {
    const identity = cliIdentityReport(context);
    const sections = CLI_HELP_SECTIONS.map((section) => {
        const rows = CLI_USAGE_ROWS.filter((row) => section.commands.includes(row.command));
        return `${section.title}\n${usageRows(rows, context)}`;
    }).join('\n\n');
    return `${t.label(context.command)} a log-native runtime for long-horizon agent work

usage
  ${context.command} <command> [options]

examples
  ${context.command} init my-agent
  ${context.command} run "Summarise the objective"

${sections}

global options
  -h, --help       show the full guide or help for one command
  --version        show product, runtime, and contract versions
  --no-color       never write terminal colour sequences
  --url <url>      use a hosted runtime for remote-capable commands

identity
  product ${identity.product}
  runtime build ${identity.runtime_build}
  execution substrate ${identity.execution_substrate}

The deterministic adapter is the default: a first run needs no credential,
no database server, and no network.

target
  Remote-capable commands use --url, then ZERO_AR_URL, then bundled Local Lite when this distribution carries it.
  Hosted authentication is read only from ZERO_AR_API_KEY. A selected hosted
  target refuses in place and never falls back to bundled execution.

docs
  https://github.com/zero-ar-labs/zero-ar#readme
  Report a problem: https://github.com/zero-ar-labs/zero-ar/issues`;
}
function conciseHelpText(context) {
    return `${t.label(context.command)} a log-native runtime for long-horizon agent work

usage
  ${context.command} <command> [options]

examples
  ${context.command} init my-agent
  ${context.command} run "Summarise the objective"

common commands
  run       start a run
  inspect   view a run's state, budgets, and usage
  result    read the artifact, verdict, and handover
  doctor    check this installation or a hosted database

Run ${context.command} help for every command.
Run ${context.command} help <command> for command details.`;
}
function printCommandHelp(command, context) {
    if (!CLI_COMMANDS.includes(command))
        return unknownCommand(command, context);
    const rows = CLI_USAGE_ROWS.filter((row) => row.command === command);
    const examples = CLI_COMMAND_EXAMPLES[command] ?? [];
    console.log(`${t.label(`${context.command} ${command}`)} ${rows[0]?.summary ?? 'command reference'}

${examples.length > 0 ? `examples\n${examples.map((example) => `  ${context.command} ${example}`).join('\n')}\n\n` : ''}usage
${usageRows(rows, context)}

Run ${context.command} help for every command.
Docs: https://github.com/zero-ar-labs/zero-ar#readme`);
    return 0;
}
function usageRows(rows, context) {
    const commands = rows.map((row) => `${context.command} ${row.syntax}`);
    const width = Math.max(...commands.map((command) => command.length));
    return rows.map((row, index) => `  ${commands[index].padEnd(width)}  ${row.summary}`).join('\n');
}
function unknownCommand(command, context) {
    const suggestion = closestCommand(command);
    console.error(`error: ${command} is not a command.`);
    if (suggestion)
        console.error(`Did you mean ${context.command} ${suggestion}?`);
    console.error(`Run ${context.command} help for every command.`);
    return 1;
}
function closestCommand(input) {
    const ranked = CLI_COMMANDS.map((command) => ({ command, distance: editDistance(input, command) }))
        .sort((left, right) => left.distance - right.distance || left.command.localeCompare(right.command));
    const best = ranked[0];
    if (!best)
        return undefined;
    return best.distance <= Math.max(2, Math.floor(best.command.length / 3)) ? best.command : undefined;
}
function editDistance(left, right) {
    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        const current = [leftIndex];
        for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
            current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1));
        }
        previous.splice(0, previous.length, ...current);
    }
    return previous[right.length];
}
function versionText(context) {
    const identity = cliIdentityReport(context);
    return [
        `${identity.product} command ${identity.command}`,
        `runtime build: ${identity.runtime_build}`,
        `execution substrate: ${identity.execution_substrate}`,
        `contract: ${identity.contract_version}`,
    ].join('\n');
}
export function globalCliArguments(args) {
    return {
        arguments: args.filter((argument) => argument !== '--no-color'),
        no_color: args.includes('--no-color'),
    };
}
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
async function source(client, args) {
    const operation = need(args[0], 'a source operation');
    const handlers = {
        add: () => client.registerSource(RegisterSourceRequestSchema.parse({
            name: need(argValue(args, '--name'), 'a source name after --name'),
            profile: argValue(args, '--profile') ?? 'local-read-only',
            locator: { kind: 'local-directory', path: resolve(need(args[1], 'a source directory')) },
        })),
        list: () => client.listSources(),
        inspect: () => client.inspectSource(need(args[1], 'a source reference')),
        snapshot: () => client.snapshotSource(need(args[1], 'a source reference')),
        preflight: () => client.preflightSource(need(args[1], 'a source reference')),
    };
    const handler = handlers[operation];
    if (!handler) {
        console.error('error: source needs add, list, inspect, snapshot, or preflight.');
        return 1;
    }
    console.log(JSON.stringify(await handler(), null, 2));
    return 0;
}
async function capability(client, args) {
    const operation = need(args[0], 'a capability operation');
    const runId = need(args[1], 'a run id');
    const asJson = args.includes('--json');
    if (operation === 'request') {
        const reason = need(argValue(args, '--reason'), 'a reason after --reason');
        const publicationRef = argValue(args, '--publication');
        const positionalSource = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
        if (publicationRef && positionalSource) {
            throw new DiagnosticError({
                severity: 'error',
                code: 'cli.capability.source-conflict',
                message: 'the capability request names both a local skill directory and --publication. Choose one candidate source so the request has one immutable identity.',
                clause: 'DCA-004',
                fix: 'Remove the path to request the exact publication, or remove --publication to compile and publish the local Agent Skill.',
            });
        }
        let request;
        if (publicationRef) {
            const requestedCapabilities = argValues(args, '--capability');
            if (requestedCapabilities.length === 0) {
                throw new DiagnosticError({
                    severity: 'error',
                    code: 'cli.capability.requested-capability-required',
                    message: 'the exact publication request names no requested capability, so DCA2 cannot compare the requested authority with the inspected package.',
                    clause: 'DCA-003',
                    fix: 'Add --capability <exact-procedure-name> and repeat --capability for each existing observation tool named by that procedure.',
                });
            }
            request = {
                kind: 'add',
                candidate_locator: publicationRef,
                ...(argValue(args, '--content-hash') ? { expected_content_hash: argValue(args, '--content-hash') } : {}),
                declared_package_kind: argValue(args, '--package-kind') ?? 'procedure',
                requested_capabilities: requestedCapabilities,
                reason,
                requested_activation_mode: 'next-safe-boundary',
                ...(argValue(args, '--expected-epoch') ? { expected_active_epoch: Number(argValue(args, '--expected-epoch')) } : {}),
                idempotency_key: argValue(args, '--idempotency-key') ?? makeId('ctl'),
            };
        }
        else {
            const sourcePath = need(positionalSource, 'an Agent Skill directory or --publication <ref>');
            const candidate = await publishCapabilitySource(client, resolve(sourcePath));
            request = {
                kind: 'add',
                candidate_locator: candidate.publication_ref,
                expected_content_hash: candidate.root_ref,
                declared_package_kind: 'procedure',
                requested_capabilities: [...new Set([candidate.procedure.name, ...(candidate.procedure.allowed_tools ?? [])])].sort(),
                reason,
                requested_activation_mode: 'next-safe-boundary',
                ...(argValue(args, '--expected-epoch') ? { expected_active_epoch: Number(argValue(args, '--expected-epoch')) } : {}),
                idempotency_key: argValue(args, '--idempotency-key') ?? makeId('ctl'),
            };
        }
        const accepted = await client.requestCapabilityAdmission(runId, CapabilityAdmissionRequestSchema.parse(request));
        if (asJson)
            console.log(canonicalJson(accepted));
        else {
            console.log(accepted.repeated ? 'the exact request was already recorded' : 'capability request recorded');
            renderCapabilityAdmission(accepted.admission);
        }
        return 0;
    }
    if (operation === 'inspect') {
        const positionalRequest = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
        if (positionalRequest && !/^cap_[0-9a-f]{32}$/.test(positionalRequest)) {
            throw new DiagnosticError({
                severity: 'error',
                code: 'cli.capability.request-id-invalid',
                message: `${positionalRequest} is not a capability admission id, so the command cannot decide whether to list or inspect.`,
                clause: 'DCA-024',
                fix: 'Use cap_<32 lowercase hex characters>, or omit the request id to list a bounded page.',
            });
        }
        const requestId = positionalRequest;
        if (requestId) {
            const admission = await client.inspectCapabilityAdmission(runId, requestId);
            if (asJson)
                console.log(canonicalJson(admission));
            else
                renderCapabilityAdmission(admission);
            return 0;
        }
        const page = await client.listCapabilityAdmissions(runId, {
            ...(argValue(args, '--cursor') ? { cursor: argValue(args, '--cursor') } : {}),
            limit: Number(argValue(args, '--limit') ?? 20),
        });
        if (asJson)
            console.log(canonicalJson(page));
        else {
            console.log(t.label(`capability admissions for ${shortId(runId)}`));
            for (const admission of page.admissions) {
                const candidate = admission.plan?.candidate;
                const untrustedCandidate = candidate ? `${candidate.kind} ${candidate.name}@${candidate.version}` : 'classification pending';
                const candidateLine = neutralize(untrustedCandidate)
                    .replaceAll('\r', '\\r')
                    .replaceAll('\n', '\\n')
                    .replaceAll('\t', '\\t');
                console.log(`  ${admission.request_id}  ${admission.status}  ${candidateLine}`);
            }
            if (page.next_cursor)
                console.log(`next cursor: ${page.next_cursor}`);
        }
        return 0;
    }
    if (operation === 'approve' || operation === 'refuse') {
        const requestId = need(args[2], 'a capability request id');
        const expectedPlanRef = need(argValue(args, '--plan'), 'the inspected plan ref after --plan');
        const accepted = await client.decideCapabilityAdmission(runId, requestId, {
            decision: operation,
            expected_plan_ref: expectedPlanRef,
            reason: argValue(args, '--reason') ?? `${operation}d from the terminal after inspecting the exact plan`,
            idempotency_key: argValue(args, '--idempotency-key') ?? makeId('ctl'),
        });
        if (asJson)
            console.log(canonicalJson(accepted));
        else
            renderCapabilityAdmission(accepted.admission);
        return 0;
    }
    if (operation === 'cancel') {
        const requestId = need(args[2], 'a capability request id');
        const accepted = await client.cancelCapabilityAdmission(runId, requestId, {
            reason: argValue(args, '--reason') ?? 'cancelled from the terminal before capability activation',
            idempotency_key: argValue(args, '--idempotency-key') ?? makeId('ctl'),
        });
        if (asJson)
            console.log(canonicalJson(accepted));
        else
            renderCapabilityAdmission(accepted.admission);
        return 0;
    }
    console.error('error: capability needs request, inspect, approve, refuse, or cancel.');
    return 1;
}
function renderCapabilityAdmission(admission) {
    const rows = [
        ['request', admission.request_id],
        ['status', admission.status],
        ['active closure', `epoch ${admission.active_closure_epoch}, ${admission.active_closure_ref}`],
    ];
    if (admission.plan) {
        const plan = admission.plan;
        rows.push(['candidate', `${plan.candidate.kind} ${plan.candidate.name}@${plan.candidate.version}`]);
        rows.push(['plan', plan.plan_ref]);
        rows.push(['candidate closure', plan.candidate_closure_ref]);
        rows.push(['manifest-visible capability delta', `${plan.consequence_diff.procedures.added.length} procedure added, ${plan.consequence_diff.tools.added.length} tools added, ${plan.consequence_diff.tools.required_existing.length} existing observation tools reachable`]);
        rows.push(['budget', `${plan.required_budget.bytes} bytes, ${plan.required_budget.compute_ms} compute ms, ${plan.required_budget.attention} attention`]);
    }
    else {
        rows.push(['candidate', 'classification pending']);
    }
    if (admission.pending_successor)
        rows.push(['pending successor', `epoch ${admission.pending_successor.closure_epoch} at the next run-loop boundary`]);
    console.log(t.table(rows.map(([left, right]) => ['  ' + left, neutralize(right)])));
    for (const blocker of admission.plan?.blockers ?? [])
        console.log(`blocker: ${neutralize(blocker.message)}`);
    for (const action of admission.next_actions)
        console.log(`next: ${action.action}, ${neutralize(action.reason)}`);
    console.log(t.dim('The delta describes the admitted candidate and manifest-visible capability change. It is not the entire model-visible tool closure, and runtime-reserved operations are not represented here.'));
}
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
    const inlineItems = (argValue(args, '--items') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const manifestPath = argValue(args, '--items-from');
    const items = [...inlineItems, ...(manifestPath ? itemsFromManifest(manifestPath) : [])];
    const sources = argValues(args, '--source').map((binding) => {
        const separator = binding.indexOf('=');
        if (separator <= 0 || separator === binding.length - 1) {
            throw new DiagnosticError({
                severity: 'error',
                code: 'cli.source.binding-invalid',
                message: `source binding ${binding} must use alias=source-binding-ref syntax. Use the binding_ref printed by ${context.command} source snapshot.`,
                clause: 'SRC-025',
            });
        }
        return { alias: binding.slice(0, separator), binding_ref: binding.slice(separator + 1), required_for_completion: true };
    });
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
    const detached = args.includes('--detach');
    const request = {
        objective,
        principals: {
            executing: 'application:zeroar-cli',
            originating: process.env['USER'] ?? 'terminal',
            accountable: envValue('OWNER') ?? process.env['USER'] ?? 'local-operator',
        },
        budgets: {
            consumption: {
                model_tokens: Number(argValue(args, '--tokens') ?? 50_000),
                compute_ms: Number(argValue(args, '--compute-ms') ?? 600_000),
                tool_calls: Number(argValue(args, '--tool-calls') ?? 64),
                bytes: Number(argValue(args, '--bytes') ?? 64 * 1_048_576),
            },
            attention: Number(argValue(args, '--attention') ?? 0),
            verification_reserve_fraction: 0.2,
            max_turns: Number(argValue(args, '--max-turns') ?? turnCeilingForBudget(Number(argValue(args, '--tokens') ?? 50_000), items.length)),
        },
        ...(contractRef ? { task_contract_ref: contractRef } : {}),
        ...(items.length > 0 || sources.length > 0 ? { inputs: {
                ...(items.length > 0 ? { items } : {}),
                ...(sources.length > 0 ? { sources } : {}),
            } } : {}),
        idempotency_key: argValue(args, '--idempotency-key') ?? makeId('ctl'),
    };
    const created = detached
        ? await client.createDeferredRun(request)
        : await client.createRun(request);
    const snapshot = created.snapshot;
    console.log(t.label(`run ${shortId(created.run_id)}`) + ' ' + t.dim(created.run_id));
    if (detached) {
        console.log('');
        console.log(`attach later: ${context.command} attach ${created.run_id} --after 0`);
        return 0;
    }
    const resolved = await client.records(created.run_id, 0);
    const createdRecord = resolved.records.find((r) => r.type === 'run.created');
    const narration = createdRecord?.payload['resolved']?.narration ?? [];
    for (const line of narration)
        console.log('  ' + t.dim(neutralize(line)));
    console.log('');
    void snapshot;
    return attach(client, created.run_id, { command: context.command });
}
async function attach(client, run_id, options) {
    const abort = new AbortController();
    const progress = client.streamProgress(run_id, (text) => process.stdout.write(t.dim(neutralize(text))), abort.signal).catch(() => undefined);
    let cursor = options.after ?? 0;
    let detached = false;
    const detach = () => {
        detached = true;
        abort.abort();
    };
    process.once('SIGINT', detach);
    try {
        for await (const event of client.followRecords(run_id, {
            after: cursor,
            signal: abort.signal,
            ...(options.settle_after_record_seq ? { settle_after_record_seq: options.settle_after_record_seq } : {}),
        })) {
            cursor = event.seq;
            renderEvent(event);
        }
    }
    catch (error) {
        abort.abort();
        await progress;
        if (error instanceof DiagnosticError && (error.diagnostic.code === 'client.stream.unavailable' || error.diagnostic.code === 'client.stream.unreadable')) {
            console.error(renderDiagnostic(error.diagnostic));
            console.error(`attach later: ${options.command} attach ${run_id} --after ${cursor}`);
            return 1;
        }
        throw error;
    }
    finally {
        process.removeListener('SIGINT', detach);
    }
    abort.abort();
    await progress;
    console.log('');
    if (detached) {
        console.log('detached; the run keeps its durable state. A hosted runtime keeps running it, and a local run continues once you attach to it again');
        console.log(`attach later: ${options.command} attach ${run_id} --after ${cursor}`);
        console.log(`cancel it: ${options.command} cancel ${run_id}`);
        return 130;
    }
    return showResult(client, run_id);
}
function cursorValue(args, flag) {
    const raw = argValue(args, flag);
    if (raw === undefined)
        return 0;
    if (!/^[0-9]+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
        throw new DiagnosticError({
            severity: 'error',
            code: 'cli.cursor.invalid',
            message: `${flag} needs a non-negative integer sequence. Use the last durable sequence you processed, or zero for the beginning.`,
        });
    }
    return Number(raw);
}
function renderEvent(raw) {
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
            console.log(`${at}  ${t.dim(`lease settled ${String(event.payload['amount'])} of ${String(event.payload['reserved'])}${event.payload['overrun'] ? `, ${String(event.payload['overrun'])} over the reservation` : ''}`)}`);
            return;
        case 'lease.released':
            return;
        case 'checkpoint.started':
            console.log(`${at}  ${t.dim(`checkpoint over ${event.payload['covered_items'].length} items`)}`);
            return;
        case 'checkpoint.passed': {
            const n = event.payload['covered_items'].length;
            const sampling = event.payload['sampling'];
            const sampled = sampling ? `, on a sample of ${sampling.examined} of ${sampling.population}` : '';
            console.log(`${at}  ${t.state('verified')} checkpoint: ${n} items promoted by ${event.payload['validator_versions'].join(', ')}${sampled}`);
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
            return;
        case 'completion.proposed':
            console.log(`${at}  completion proposed; checking the claim against the verification plan`);
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
    console.log('');
    console.log(t.label('next'));
    console.log(`  inspect: ${createCliContext().command} inspect ${run_id}`);
    console.log(`  records: ${createCliContext().command} records ${run_id}`);
    return result.terminal === 'complete' || result.terminal === 'unverified_artifact' ? 0 : result.status === 'suspended' ? 2 : 0;
}
async function inspect(client, run_id) {
    const s = await client.snapshot(run_id);
    const plan = await client.verificationPlan(run_id);
    const rows = [
        ['state', s.status + (s.terminal ? `, ${s.terminal}` : '') + (s.suspend_reason ? `, ${s.suspend_reason}` : '')],
        ['completion', s.completion_state],
        ['agent', `${s.agent_name} on ${s.model_ref}`],
        ['objective', s.objective.length > 80 ? s.objective.slice(0, 77) + '...' : s.objective],
        ['turns', String(s.turn)],
        ['entries', String(s.entry_count)],
        ['active closure', s.active_closure_epoch === undefined ? 'legacy epoch 1' : `epoch ${s.active_closure_epoch}, ${s.active_closure_ref}`],
        ['pending capability admissions', String(s.pending_capability_admission_count ?? 0)],
        ['verified completion', plan.reachability.verified_completion_reachable
                ? 'reachable'
                : plan.reachability.refusals.some((refusal) => refusal.code === 'contract-absent')
                    ? 'unreachable, no validator coverage'
                    : `unreachable, ${plan.reachability.refusals.length} refusal(s)`],
        ['verification plan', plan.plan_ref],
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
    if (s.tool_view) {
        rows.push(['tool closure', `${s.tool_view.closure_size} pinned, ${s.tool_view.hidden} hidden`]);
        rows.push(['tool view', `${s.tool_view.visible.length} visible, ${s.tool_view.used.schema_tokens}/${s.tool_view.budget.schema_tokens} schema tokens, ${s.tool_view.used.schema_bytes}/${s.tool_view.budget.schema_bytes} bytes`]);
        rows.push(['visible tools', s.tool_view.visible.map((entry) => `${entry.name} (${entry.reason})`).join(', ') || 'none']);
        if (s.tool_view.refusals.length > 0)
            rows.push(['tool refusals', s.tool_view.refusals.map((entry) => `${entry.code}: ${entry.message}`).join('; ')]);
    }
    else {
        rows.push(['tool view', 'legacy v0: complete pinned closure visible']);
    }
    for (const [key, use] of Object.entries(s.usage)) {
        rows.push([key, `${use.consumed} consumed, ${use.reserved} outstanding${use.overrun ? `, ${use.overrun} past reservations` : ''}`]);
    }
    rows.push(...controllerRows(await controllersView(client, run_id)));
    rows.push(['snapshot version', String(s.snapshot_version)]);
    console.log(t.label(`run ${shortId(run_id)}`) + ' ' + t.dim(run_id));
    console.log(t.table(rows.map(([k, v]) => ['  ' + (k ?? ''), v ?? ''])));
    console.log('');
    console.log(neutralize(renderVerificationPlan(plan)));
    return 0;
}
async function controllersView(client, run_id) {
    try {
        return await client.controllers(run_id);
    }
    catch (error) {
        if (error instanceof DiagnosticError && (error.diagnostic.code === 'controllers.view.unwired' || error.diagnostic.code === 'route.unknown'))
            return null;
        throw error;
    }
}
function controllerRows(view) {
    if (!view)
        return [['controllers', 'not wired on this server']];
    const checkpoint = view.canonical.checkpoint;
    const rows = [[
            'checkpoint controller',
            checkpoint
                ? `${checkpoint.controller}, every ${checkpoint.interval_items} items under a contract ceiling of ${checkpoint.contract_ceiling}` +
                    `${checkpoint.fallback_used ? ', pinned fallback' : ''}, canonical`
                : 'none pinned',
        ]];
    const selector = view.canonical.context_selector;
    if (selector) {
        rows.push(['context selector', `${selector.selector} ${selector.mode}${selector.posture_ref ? `, pinned by posture ${selector.posture_ref.slice(0, 15)}` : ''}, canonical`]);
    }
    const recommendations = view.telemetry.decisions.length;
    rows.push(['controller telemetry', `${recommendations} noncanonical recommendation${recommendations === 1 ? '' : 's'}`]);
    return rows;
}
async function verificationPlan(client, run_id, asJson) {
    const plan = await client.verificationPlan(run_id);
    console.log(asJson ? canonicalJson(plan) : neutralize(renderVerificationPlan(plan)));
    return 0;
}
async function records(client, run_id) {
    const { records: rows } = await client.records(run_id, 0);
    console.log(t.table(rows.map((r) => [String(r.seq), t.dim(r.at.slice(11, 19)), r.type, t.dim(shortId(r.record_id))])));
    return 0;
}
async function doctor(rest = [], context) {
    const serverEntry = serverEntrypointPath();
    const identity = cliIdentityReport(context);
    const home = resolveLocalDataHome(process.cwd());
    const checks = [
        ['product identity', true, `${identity.product}, command ${identity.command}`],
        ['runtime build', true, identity.runtime_build],
        ['execution substrate', true, identity.execution_substrate],
        [`node ${SUPPORTED_NODE_RUNTIME.minimum} through ${SUPPORTED_NODE_RUNTIME.release_line}`, isSupportedNodeRuntime(process.versions.node), `found ${process.versions.node}`],
        ['server entrypoint present', existsSync(serverEntry), serverEntry],
        ['data directory writable', canWrite(home), `${home} under the working directory`],
        ['offline first run', true, 'the deterministic adapter answers with no provider account'],
        ['run portability levels', true, 'export seals, import verifies and refolds, referenced state rehydrates separately, and executor compatibility is explicit'],
    ];
    const failed = checks.filter(([, ok]) => !ok).length;
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
function exportedRunPortability(bundle) {
    const frames = bundle.trim().split('\n').map((line) => JSON.parse(line));
    const manifest = frames.find((frame) => frame['kind'] === 'manifest');
    const closure = frames.find((frame) => frame['kind'] === 'state-closure');
    const capsule = frames.find((frame) => frame['kind'] === 'continuation-capsule');
    const stateHash = typeof manifest?.['head_projection_hash'] === 'string' ? manifest['head_projection_hash'] : 'not declared';
    return {
        verify: { status: 'sealed-at-source', detail: 'the source wrote the canonical checksum and record chain; the destination verifies the exact bytes before import' },
        materialize: { status: 'declared', detail: `the manifest binds the expected run-head state hash ${stateHash}` },
        rehydrate: closure
            ? { status: 'required-at-destination', detail: 'the bundle carries a referenced-state closure; only the importing destination can establish it' }
            : { status: 'not-carried', detail: 'this export has no referenced-state closure' },
        continue: capsule
            ? { status: 'requires-admission', detail: 'the bundle carries a continuation capsule; a destination executor must declare compatibility and take the execution claim' }
            : { status: 'unavailable', detail: 'this export has no continuation capsule' },
    };
}
function importedRunPortability(outcome, compatibility, continued) {
    const rehydration = outcome.state_closure;
    const refused = compatibility?.checks.filter((check) => check.status === 'refused').map((check) => check.message) ?? [];
    return {
        verify: { status: 'passed', detail: 'the bundle schemas, checksum, content hashes, causal links and record chain passed before import' },
        materialize: outcome.head_equal
            ? { status: 'passed', detail: 'the imported records refold to the run-head hash declared by the manifest' }
            : { status: 'refused', detail: 'the imported records do not refold to the declared run-head hash' },
        rehydrate: rehydration
            ? {
                status: rehydration.rehydrated ? 'passed' : 'refused',
                detail: rehydration.rehydrated
                    ? `every required member of ${rehydration.closure_ref} is present`
                    : `${rehydration.members.filter((member) => member.required && member.status !== 'rehydrated' && member.status !== 'present-inline').length} required referenced-state member(s) remain unavailable`,
            }
            : { status: 'not-carried', detail: 'the bundle did not declare a referenced-state closure' },
        continue: continued
            ? { status: 'accepted', detail: 'the destination recorded executor identity and the exact frontier before starting the next operation' }
            : compatibility
                ? compatibility.compatible
                    ? { status: 'ready', detail: 'the declared executor passed every compatibility check; add --continue to take the execution claim' }
                    : { status: 'refused', detail: refused.join(' ') }
                : outcome.continuation
                    ? { status: 'not-checked', detail: 'pass --executor <declaration.json> to check the destination without spending or taking a claim' }
                    : { status: 'unavailable', detail: 'the bundle did not carry a continuation capsule' },
    };
}
export function renderRunPortability(status) {
    for (const level of RUN_PORTABILITY_LEVELS) {
        console.log(neutralize(`${level}: ${status[level].status} (${status[level].detail})`));
    }
}
function continuationDeclaration(args) {
    const path = argValue(args, '--executor');
    if (!path) {
        if (args.includes('--executor'))
            need(undefined, 'a declaration file after --executor');
        if (args.includes('--continue'))
            need(undefined, 'an executor declaration after --executor when --continue is set');
        return null;
    }
    return RunContinuationDeclarationSchema.parse(JSON.parse(readFileSync(path, 'utf8')));
}
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
async function publish(client, rest, context) {
    const source = rest.find((argument) => !argument.startsWith('--'));
    if (!source) {
        console.error(`publish needs a source, like ${context.command} publish ./agent.yaml --dry-run`);
        return 1;
    }
    const compiled = await compileAuthoringSource(source);
    verifyBundle(compiled.bundle, compiled.blobs);
    if (rest.includes('--dry-run')) {
        const verificationInput = argValue(rest, '--verification-input');
        if (verificationInput) {
            const input = JSON.parse(readFileSync(verificationInput, 'utf8'));
            const plan = previewPublicationVerificationPlan(compiled, input);
            console.log(rest.includes('--json') ? canonicalJson(plan) : neutralize(renderVerificationPlan(plan)));
        }
        else {
            console.log(rest.includes('--json') ? JSON.stringify(compiled.bundle, null, 2) : neutralize(renderPlan(compiled)));
        }
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
async function init(rest, context) {
    const optionValues = new Set();
    for (const option of ['--kind', '--fixture', '--form']) {
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
    const form = (argValue(rest, '--form') ?? 'yaml');
    const template = scaffoldProject({ form });
    writeAuthoringScaffold(dir, template.files);
    const lockPath = resolve(dir, 'zero-ar.lock.json');
    const project = await loadProject({ root: resolve(dir), ...(existsSync(lockPath) ? {} : { ignore_lock: true }) });
    if (!existsSync(lockPath)) {
        writeFileSync(lockPath, `${lockBytes(project)}\n`);
        console.log('wrote zero-ar.lock.json');
    }
    else {
        console.log(t.dim('kept existing zero-ar.lock.json'));
        await project.compile();
    }
    console.log('');
    console.log(`start a run: ${context.command} run "Summarise the objective"`);
    return 0;
}
function scaffold(rest, context) {
    const kind = rest[0];
    const name = rest[1];
    if (!kind || kind === 'project') {
        console.error(`scaffold needs skill, tool, validator, domain-pack or binding-profile. Use ${context.command} init for a project.`);
        return 1;
    }
    if (!AUTHORING_SCAFFOLD_KINDS.includes(kind)) {
        console.error(`scaffold kind ${kind} is unknown. Use skill, tool, validator, domain-pack or binding-profile.`);
        return 1;
    }
    const optionValues = new Set();
    for (const option of ['--version', '--form']) {
        const index = rest.indexOf(option);
        if (index >= 0)
            optionValues.add(index + 1);
    }
    const selectedDirectory = rest.find((argument, index) => index > 1 && !argument.startsWith('--') && !optionValues.has(index)) ?? name ?? '.';
    const dir = name && basename(resolve(selectedDirectory)) !== name ? join(selectedDirectory, name) : selectedDirectory;
    const version = argValue(rest, '--version');
    const form = argValue(rest, '--form');
    const generated = authoringScaffold(kind, name, {
        ...(version ? { version } : {}),
        ...(form ? { form: form } : {}),
    });
    writeAuthoringScaffold(dir, generated.files);
    console.log('');
    for (const step of generated.next_steps)
        console.log(`next: ${step}`);
    return 0;
}
async function validate(rest) {
    const selected = rest.find((argument) => !argument.startsWith('--')) ?? '.';
    const path = resolve(selected);
    if (existsSync(path) && statSync(path).isDirectory() && existsSync(resolve(path, 'SKILL.md'))) {
        const compiled = await compileAuthoringSource(path);
        verifyBundle(compiled.bundle, compiled.blobs);
        console.log(`valid skill ${compiled.bundle.root_ref}; ${compiled.bundle.assets.length} immutable assets`);
        return 0;
    }
    if (existsSync(path) && statSync(path).isDirectory()) {
        const project = await loadProject({ root: path, ignore_lock: rest.includes('--write-lock') });
        if (rest.includes('--write-lock')) {
            writeFileSync(resolve(path, 'zero-ar.lock.json'), `${lockBytes(project)}\n`);
            console.log('wrote zero-ar.lock.json');
        }
        const compiled = await project.compile();
        verifyBundle(compiled.bundle, compiled.blobs);
        console.log(`valid project ${compiled.bundle.root_ref}; lock ${project.lock().lock_ref}`);
        return 0;
    }
    const compiled = await compileAuthoringSource(path);
    verifyBundle(compiled.bundle, compiled.blobs);
    console.log(`valid ${compiled.bundle.root_kind} ${compiled.bundle.root_ref}; bundle ${compiled.bundle.bundle_ref}`);
    return 0;
}
function writeAuthoringScaffold(root, files) {
    mkdirSync(root, { recursive: true });
    for (const file of files) {
        const path = resolve(root, file.path);
        mkdirSync(dirname(path), { recursive: true });
        if (existsSync(path)) {
            console.log(t.dim(`kept existing ${file.path}`));
            continue;
        }
        writeFileSync(path, file.content);
        console.log(`wrote ${file.path}`);
    }
}
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
function localRecoveryScope(command, args) {
    return command === 'attach' && args[0] ? `runs:${args[0]}` : 'none';
}
function startServer(recovery) {
    const entry = serverEntrypointPath();
    const childEnvironment = { ...process.env };
    delete childEnvironment[productEnvironmentNames('API_KEY').name];
    const recoveryName = productEnvironmentNames('RECOVERY').name;
    childEnvironment[recoveryName] ??= recovery;
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
function argValues(args, flag) {
    const values = [];
    for (let index = 0; index < args.length; index += 1) {
        if (args[index] === flag && args[index + 1])
            values.push(args[index + 1]);
    }
    return values;
}
function itemsFromManifest(path) {
    const text = readFileSync(path, 'utf8');
    const trimmed = text.trim();
    if (!trimmed)
        return [];
    const values = trimmed.startsWith('[')
        ? JSON.parse(trimmed)
        : trimmed.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    if (!Array.isArray(values) || values.length > 100_000) {
        throw new DiagnosticError({
            severity: 'error',
            code: 'cli.items.manifest-invalid',
            message: 'the item manifest must be a JSON array or NDJSON with no more than 100000 entries.',
            clause: 'SRC-025',
        });
    }
    return values.map((value, index) => {
        const item = typeof value === 'string'
            ? value
            : value && typeof value === 'object'
                ? String(value['item_id'] ?? value['id'] ?? '')
                : '';
        if (!item || item.length > 200) {
            throw new DiagnosticError({
                severity: 'error',
                code: 'cli.items.manifest-invalid',
                message: `item manifest entry ${index + 1} needs a string, item_id, or id no longer than 200 characters.`,
                clause: 'SRC-025',
            });
        }
        return item;
    });
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
if (typeof ZERO_AR_RELEASE_BUNDLE === 'undefined' && isDirectEntrypoint(import.meta.url, process.argv[1]))
    runCliAndExit();
