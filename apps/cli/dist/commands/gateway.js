/**
 * The gateway command.
 *
 * What this is: zeroar gateway serve <config.json> runs the channel gateway
 * host, which turns signed webhooks and team messages into public run
 * operations, and zeroar gateway test <config.json> checks its secret
 * references and endpoint without creating a run or calling a model.
 *
 * How it fits: the gateway host ships as its own release entry, which this
 * command spawns and waits on (decision J-1), so the command keeps importing
 * only the contracts and the client. The host receives only the environment
 * variables its configuration names, and its output and exit code are the
 * command's own.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { refuseCommand } from "./command.js";
export const gatewayCommand = {
    command: 'gateway',
    state: 'wired',
    local: (args, context) => gateway(args, context),
};
async function gateway(args, context) {
    const [operation, config, ...extra] = args;
    if ((operation !== 'serve' && operation !== 'test') || !config || extra.length > 0) {
        return refuseCommand({
            severity: 'error',
            code: 'gateway.usage',
            message: `${context.command} gateway takes serve or test and one configuration file. Run ${context.command} gateway serve <config.json> to start the host, or ${context.command} gateway test <config.json> to check it.`,
        });
    }
    const entry = gatewayHostEntrypoint();
    if (!entry) {
        return refuseCommand({
            severity: 'error',
            code: 'gateway.host.unavailable',
            message: `${context.command} gateway spawns the gateway host, and this package carries only the public command files. Use the release bundle, which ships the gateway host beside the command.`,
        });
    }
    const configPath = resolve(config);
    const child = spawn(process.execPath, ['--disable-sigusr1', '--disable-warning=ExperimentalWarning', entry, operation, configPath], {
        stdio: 'inherit',
        env: gatewayEnvironment(configPath),
    });
    const forward = (signal) => {
        child.kill(signal);
    };
    process.on('SIGINT', forward);
    process.on('SIGTERM', forward);
    try {
        return await new Promise((done, reject) => {
            child.once('error', reject);
            child.once('exit', (code, signal) => done(code ?? (signal ? 1 : 0)));
        });
    }
    finally {
        process.off('SIGINT', forward);
        process.off('SIGTERM', forward);
    }
}
/** Variables the host's own runtime may need, besides the references its configuration names. */
const HOST_RUNTIME_VARIABLES = ['NODE_EXTRA_CA_CERTS', 'TZ'];
/**
 * The host's environment: only the variables its configuration names through
 * env: references, so no other deployment secret in this shell reaches it. A
 * configuration this command cannot read hands over nothing, and the host
 * refuses it with the reason.
 */
function gatewayEnvironment(configPath) {
    const names = new Set(HOST_RUNTIME_VARIABLES);
    try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        for (const adapter of Array.isArray(config.adapters) ? config.adapters : []) {
            for (const ref of Array.isArray(adapter?.secret_refs) ? adapter.secret_refs : []) {
                const name = typeof ref === 'string' ? /^env:([A-Za-z_][A-Za-z0-9_]{0,127})$/.exec(ref)?.[1] : undefined;
                if (name)
                    names.add(name);
            }
        }
    }
    catch {
        // The host reads the same file and refuses it with the reason.
    }
    const environment = {};
    for (const name of names) {
        const value = process.env[name];
        if (value !== undefined)
            environment[name] = value;
    }
    return environment;
}
/** The bundled host beside the command, else the source entrypoint in a development checkout. */
function gatewayHostEntrypoint() {
    const bundled = new URL('./gateway-host.mjs', import.meta.url).pathname;
    if (typeof ZERO_AR_RELEASE_BUNDLE !== 'undefined' && ZERO_AR_RELEASE_BUNDLE)
        return existsSync(bundled) ? bundled : null;
    const development = `${new URL('../../../../packages/gateways/src/main', import.meta.url).pathname}.ts`;
    if (existsSync(development))
        return development;
    return existsSync(bundled) ? bundled : null;
}
