import { createPublicKey, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { EFFECT_ANSWER_LIMIT, EFFECT_TARGET_TIMEOUT_MS, canonicalJson, contentHash, effectDispatchRequest, effectLookupRequest, ownerReceiptFields, ownerReceiptRefusal, readDispatchAnswer, readLookupAnswer, } from '@zero-ar/contracts';
import { refuseCommand } from "./command.js";
export const targetCommand = {
    command: 'target',
    state: 'wired',
    local: (args, context) => target(args, context),
};
const LABELS = {
    'endpoint': 'endpoint',
    'signed-call': 'call',
    'repeated-key': 'repeated key',
    'other-secret': 'other secret',
    'stale-call': 'stale call',
    'refused-call': 'refused call',
    'lookup-applied': 'lookup, applied key',
    'lookup-unknown-key': 'lookup, unknown key',
};
async function target(args, context) {
    const usage = `Run ${context.command} target check <target.json> --operation <name> --params <json|@file> [--refuse-params <json|@file>] [--secret-env NAME] [--json].`;
    const [operation, file] = args;
    const name = flagValue(args, '--operation');
    const params = flagValue(args, '--params');
    if (operation !== 'check' || !file || file.startsWith('--') || !name || !params) {
        return refuseCommand({ severity: 'error', code: 'target.usage', message: `${context.command} target check needs a target file, an operation and sample parameters. ${usage}` });
    }
    const secretEnv = flagValue(args, '--secret-env') ?? 'ZEROAR_TARGET_SECRET';
    const secret = process.env[secretEnv];
    if (!secret) {
        return refuseCommand({ severity: 'error', code: 'target.secret.missing', message: `${context.command} target check reads the target's secret from ${secretEnv}, and it is not set. Export the secret the target verifies calls with, or name another variable with --secret-env.` });
    }
    let entry;
    let sample;
    let refuse;
    try {
        entry = targetEntry(JSON.parse(readFileSync(file, 'utf8')));
        sample = jsonObject(params, '--params');
        const refuseFlag = flagValue(args, '--refuse-params');
        refuse = refuseFlag === undefined ? undefined : jsonObject(refuseFlag, '--refuse-params');
    }
    catch (error) {
        return refuseCommand({ severity: 'error', code: 'target.input.invalid', message: error.message });
    }
    let report;
    try {
        report = await checkTarget(entry, { operation: name, params: sample, ...(refuse ? { refuse_params: refuse } : {}), secret });
    }
    catch (error) {
        return refuseCommand({ severity: 'error', code: 'target.check.refused', message: error.message });
    }
    if (args.includes('--json'))
        console.log(JSON.stringify(report, null, 2));
    else
        console.log(renderTargetCheck(report));
    return report.passed ? 0 : 1;
}
export async function checkTarget(entry, options) {
    const route = entry.operations[options.operation];
    if (!route)
        throw new Error(`target ${entry.target} does not list operation ${options.operation}. Name one of: ${Object.keys(entry.operations).join(', ')}.`);
    const endpoint = new URL(entry.endpoint);
    const wire = entry.wire ?? 'standard';
    const receiptKey = entry.receipt_key_pem ? ed25519Key(entry.target, entry.receipt_key_pem) : null;
    const fetchImpl = options.fetch_impl ?? fetch;
    const timeout = options.timeout_ms ?? EFFECT_TARGET_TIMEOUT_MS;
    const subject = `${entry.target}.${options.operation}`;
    const checks = [];
    const line = (id, result, detail) => {
        checks.push({ id, result, detail });
    };
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
    if (endpoint.protocol === 'https:')
        line('endpoint', 'pass', 'HTTPS');
    else if (endpoint.protocol === 'http:' && loopback)
        line('endpoint', 'warn', 'plain HTTP on this machine. The runtime dispatches over HTTPS only, so check the HTTPS endpoint again before you register it.');
    else
        throw new Error(`target ${entry.target} has endpoint ${entry.endpoint}, and the runtime dispatches over HTTPS only. Give the HTTPS endpoint, or plain HTTP on localhost while you build.`);
    const run_id = `run_${randomBytes(16).toString('hex')}`;
    const effect = (params) => {
        const effect_id = `eff_${randomBytes(16).toString('hex')}`;
        return { effect_id, idempotency_key: contentHash({ check: effect_id }), target: entry.target, operation: options.operation, params, param_hash: contentHash(params), run_id };
    };
    const exchange = async (request) => {
        const started = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetchImpl(request.url, {
                method: request.method,
                headers: { ...entry.headers, ...request.headers },
                ...(request.body !== null ? { body: request.body } : {}),
                signal: controller.signal,
            });
            const text = (await response.text()).slice(0, EFFECT_ANSWER_LIMIT);
            return { answer: { status: response.status, text }, ms: Date.now() - started };
        }
        catch (error) {
            return { failure: controller.signal.aborted ? `no answer within ${timeout} ms, so the outcome would stay unknown` : `the call failed before an answer arrived (${error.message}), so the outcome would stay unknown` };
        }
        finally {
            clearTimeout(timer);
        }
    };
    const dispatch = async (descriptor, secret = options.secret, now) => {
        const sent = await exchange(effectDispatchRequest(endpoint, route, wire, secret, descriptor, now));
        if ('failure' in sent)
            return { ok: false, failure: sent.failure };
        return { ok: true, ...sent, reading: readDispatchAnswer(wire, sent.answer, subject) };
    };
    const signatureNote = (descriptor, outcome, record) => {
        const signature = typeof record?.['owner_signature'] === 'string' ? record['owner_signature'] : null;
        if (signature && receiptKey) {
            const refusal = ownerReceiptRefusal(signature, ownerReceiptFields(descriptor, outcome), receiptKey);
            return refusal ? { fail: `its owner_signature does not verify: ${refusal}. The dispatcher would leave the outcome unknown.` } : { note: 'with an owner-signed receipt that verifies' };
        }
        if (signature)
            return { warn: 'it carries an owner_signature and the entry registers no receipt_key_pem, so the receipt would keep a signature nobody verifies. Register the key or leave the signature out.' };
        if (receiptKey)
            return { warn: 'the entry registers a receipt key and this answer carries no owner_signature, so its receipt is attested by the runtime alone.' };
        return {};
    };
    const first = effect(options.params);
    const call = await dispatch(first);
    let applied = null;
    if (!call.ok)
        line('signed-call', 'fail', call.failure);
    else if ('unknown' in call.reading)
        line('signed-call', 'fail', `${call.reading.unknown}. The dispatcher would leave the outcome unknown.`);
    else if (call.reading.outcome === 'refused')
        line('signed-call', 'fail', `it refused the sample parameters (HTTP ${call.answer.status}). Give --params the target accepts.`);
    else {
        applied = { outcome: call.reading.outcome, text: call.answer.text };
        const signature = signatureNote(first, call.reading.outcome, call.reading.record);
        const slow = call.ms > timeout / 2 ? ` That is more than half the ${timeout} ms the dispatcher waits.` : '';
        const detail = `${call.reading.outcome} (HTTP ${call.answer.status}) in ${call.ms} ms${signature.note ? `, ${signature.note}` : ''}.${slow}`;
        if (signature.fail)
            line('signed-call', 'fail', signature.fail);
        else if (signature.warn || slow)
            line('signed-call', 'warn', `${detail}${signature.warn ? ` ${signature.warn}` : ''}`);
        else
            line('signed-call', 'pass', detail);
    }
    if (!applied)
        line('repeated-key', 'skip', 'needs an applied call first.');
    else {
        const again = await dispatch(first);
        if (!again.ok)
            line('repeated-key', 'fail', again.failure);
        else if ('unknown' in again.reading)
            line('repeated-key', 'fail', `${again.reading.unknown}. A repeated Idempotency-Key must get the first answer again.`);
        else if (again.reading.outcome === 'refused')
            line('repeated-key', 'fail', `it refused a key it had applied (HTTP ${again.answer.status}). Return the first answer, or already_applied.`);
        else if (again.reading.outcome === 'already_applied' || again.answer.text === applied.text)
            line('repeated-key', 'pass', again.reading.outcome === 'already_applied' ? 'already_applied.' : 'it returned the first answer.');
        else
            line('repeated-key', 'fail', 'the second answer differs from the first, which reads as applying the call twice. Keep the first answer for each Idempotency-Key and return it.');
    }
    const forged = await dispatch(effect(options.params), wire === 'standard' ? `whsec_${randomBytes(24).toString('base64')}` : randomBytes(24).toString('hex'));
    const authName = wire === 'standard' ? 'webhook-signature' : 'the bearer';
    if (!forged.ok)
        line('other-secret', 'warn', forged.failure);
    else if ('unknown' in forged.reading)
        line('other-secret', 'warn', `HTTP ${forged.answer.status}. Answer 401 so the refusal reads as one.`);
    else if (forged.reading.outcome === 'refused')
        line('other-secret', 'pass', `refused (HTTP ${forged.answer.status}).`);
    else
        line('other-secret', 'fail', `it applied a call made with another secret. Check ${authName} before acting on a call.`);
    if (wire !== 'standard')
        line('stale-call', 'skip', 'the legacy bearer wire carries no timestamp, and the target receives its standing secret on every call. Move it to the standard wire.');
    else {
        const stale = await dispatch(effect(options.params), options.secret, Math.floor(Date.now() / 1_000) - 600);
        if (!stale.ok)
            line('stale-call', 'warn', stale.failure);
        else if ('unknown' in stale.reading)
            line('stale-call', 'warn', `HTTP ${stale.answer.status}. Answer 401 so the refusal reads as one.`);
        else if (stale.reading.outcome === 'refused')
            line('stale-call', 'pass', `refused (HTTP ${stale.answer.status}).`);
        else
            line('stale-call', 'fail', 'it applied a call signed ten minutes ago. Refuse a webhook-timestamp more than five minutes away, as Standard Webhooks libraries do, so a captured call cannot be replayed.');
    }
    if (!options.refuse_params)
        line('refused-call', 'skip', 'give --refuse-params to check that the target\'s refusal reads as one.');
    else {
        const declined = await dispatch(effect(options.refuse_params));
        if (!declined.ok)
            line('refused-call', 'fail', declined.failure);
        else if ('unknown' in declined.reading)
            line('refused-call', 'fail', `${declined.reading.unknown}. Answer a definite 4xx, such as 422 with Problem Details, when the app declines.`);
        else if (declined.reading.outcome === 'refused')
            line('refused-call', 'pass', `refused (HTTP ${declined.answer.status}).`);
        else
            line('refused-call', 'fail', `it answered ${declined.reading.outcome} to parameters it should refuse.`);
    }
    const lookup = async (descriptor) => {
        const request = effectLookupRequest(endpoint, route, wire, options.secret, descriptor);
        if (!request)
            return null;
        const sent = await exchange(request);
        return 'failure' in sent ? { unknown: sent.failure } : readLookupAnswer(wire, sent.answer, subject);
    };
    if (!route.reconcile_path) {
        line('lookup-applied', 'warn', 'the operation has no reconcile_path, so an outcome a timeout or a 5xx leaves unknown stays unknown until a person settles it.');
        line('lookup-unknown-key', 'skip', 'the operation has no reconcile_path.');
    }
    else {
        if (!applied)
            line('lookup-applied', 'skip', 'needs an applied call first.');
        else {
            const found = await lookup(first);
            if (!found || 'unknown' in found)
                line('lookup-applied', 'fail', found?.unknown ?? 'no lookup request');
            else if ('absent' in found)
                line('lookup-applied', 'fail', 'it says a key it applied was never applied, so a lost answer would read as nothing sent and the agent could act again.');
            else if ('unanswerable' in found)
                line('lookup-applied', 'fail', `it could not say: ${found.unanswerable.slice(0, 200).replace(/\.$/, '')}. An outcome left unknown would stay unknown.`);
            else {
                const signature = signatureNote(first, found.found, found.record);
                line('lookup-applied', signature.fail ? 'fail' : 'pass', signature.fail ?? `found ${found.found}.`);
            }
        }
        const never = await lookup(effect(options.params));
        if (!never || 'unknown' in never)
            line('lookup-unknown-key', 'fail', never?.unknown ?? 'no lookup request');
        else if ('absent' in never)
            line('lookup-unknown-key', 'pass', 'absent (HTTP 404).');
        else if ('unanswerable' in never)
            line('lookup-unknown-key', 'warn', `it could not say: ${never.unanswerable.slice(0, 200).replace(/\.$/, '')}. Answer 404 for a key it never saw.`);
        else
            line('lookup-unknown-key', 'fail', `it reports a key it never received as ${never.found}. Answer 404 for a key it never saw.`);
    }
    return {
        check: 'zero-ar.target-check',
        version: 1,
        target: entry.target,
        target_version: entry.version,
        endpoint: entry.endpoint,
        operation: options.operation,
        wire,
        checked_at: new Date().toISOString(),
        passed: checks.every((check) => check.result !== 'fail'),
        checks,
    };
}
export function renderTargetCheck(report) {
    const failed = report.checks.filter((check) => check.result === 'fail').length;
    return [
        `${report.target}.${report.operation} at ${report.endpoint}, ${report.wire} wire`,
        ...report.checks.map((check) => `  ${check.result.padEnd(4)}  ${LABELS[check.id].padEnd(19)}  ${check.detail}`),
        report.passed
            ? 'passed: the runtime reads every answer this target gave.'
            : `failed: ${failed} ${failed === 1 ? 'answer' : 'answers'} would leave an outcome unknown or wrong.`,
    ].join('\n');
}
function targetEntry(value) {
    const entry = value;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry))
        throw new Error('the target file must hold one JSON object shaped like an effect_plane.http_targets entry.');
    for (const field of ['target', 'version', 'endpoint']) {
        if (typeof entry[field] !== 'string' || entry[field] === '')
            throw new Error(`the target file needs ${field} as a string, as an effect_plane.http_targets entry has it.`);
    }
    if (!entry.operations || typeof entry.operations !== 'object' || Object.keys(entry.operations).length === 0)
        throw new Error('the target file needs operations, each with a path.');
    for (const [name, route] of Object.entries(entry.operations)) {
        if (typeof route?.path !== 'string' || !route.path.startsWith('/'))
            throw new Error(`operation ${name} needs an absolute path under the endpoint.`);
        if (route.reconcile_path !== undefined && (typeof route.reconcile_path !== 'string' || !route.reconcile_path.startsWith('/')))
            throw new Error(`operation ${name} needs an absolute reconcile_path.`);
    }
    if (entry.wire !== undefined && entry.wire !== 'standard' && entry.wire !== 'zero-ar-json')
        throw new Error(`wire is ${String(entry.wire)}, and a target's wire is standard or zero-ar-json.`);
    return entry;
}
function ed25519Key(target, pem) {
    const key = createPublicKey(pem);
    if (key.asymmetricKeyType !== 'ed25519')
        throw new Error(`target ${target} registers a ${String(key.asymmetricKeyType)} receipt key, and owner receipts verify with Ed25519 keys.`);
    return key;
}
function jsonObject(raw, flag) {
    const text = raw.startsWith('@') ? readFileSync(raw.slice(1), 'utf8') : raw;
    let value;
    try {
        value = JSON.parse(text);
    }
    catch {
        throw new Error(`${flag} must be a JSON object or @file holding one.`);
    }
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`${flag} must be a JSON object, the operation's parameters.`);
    return JSON.parse(canonicalJson(value));
}
function flagValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}
