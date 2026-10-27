import { createHash, createHmac } from 'node:crypto';
import { canonicalJson } from "./canonical.js";
import { decodeCompactJws, jwsSignatureValid } from "./compact-jws.js";
export const EFFECT_TARGET_TIMEOUT_MS = 30_000;
export const EFFECT_ANSWER_LIMIT = 4_096;
export function effectDispatchRequest(endpoint, route, wire, credential, descriptor, now_seconds) {
    const body = canonicalJson(descriptor.params);
    return {
        method: route.method ?? 'POST',
        url: routeUrl(endpoint, route.path),
        headers: {
            ...authentication(wire, credential, `msg_${descriptor.effect_id}`, body, now_seconds),
            'content-type': 'application/json',
            'content-digest': contentDigest(body),
            'idempotency-key': descriptor.idempotency_key,
            'x-zero-ar-effect-id': descriptor.effect_id,
            'x-zero-ar-operation': descriptor.operation,
            ...(descriptor.run_id ? { 'x-zero-ar-run-id': descriptor.run_id } : {}),
        },
        body,
    };
}
export function effectLookupRequest(endpoint, route, wire, credential, descriptor, now_seconds) {
    if (!route.reconcile_path)
        return null;
    const method = route.reconcile_method ?? 'GET';
    const url = routeUrl(endpoint, route.reconcile_path);
    const body = method === 'POST'
        ? canonicalJson({ effect_id: descriptor.effect_id, idempotency_key: descriptor.idempotency_key, operation: descriptor.operation, param_hash: descriptor.param_hash })
        : null;
    if (method === 'GET') {
        url.searchParams.set('idempotency_key', descriptor.idempotency_key);
        url.searchParams.set('effect_id', descriptor.effect_id);
    }
    return {
        method,
        url,
        headers: {
            ...authentication(wire, credential, `msg_${descriptor.effect_id}_reconcile`, body ?? '', now_seconds),
            ...(body !== null ? { 'content-type': 'application/json', 'content-digest': contentDigest(body) } : {}),
            'idempotency-key': descriptor.idempotency_key,
            'x-zero-ar-effect-id': descriptor.effect_id,
            ...(descriptor.run_id ? { 'x-zero-ar-run-id': descriptor.run_id } : {}),
        },
        body,
    };
}
function authentication(wire, credential, id, body, now_seconds = Math.floor(Date.now() / 1_000)) {
    return wire === 'standard' ? standardWebhookHeaders(credential, id, body, now_seconds) : { authorization: `Bearer ${credential}` };
}
function routeUrl(endpoint, path) {
    return new URL(path.replace(/^\/+/, ''), endpoint.href.endsWith('/') ? endpoint : `${endpoint.href}/`);
}
export function standardWebhookSecretBytes(secret) {
    return secret.startsWith('whsec_') ? Buffer.from(secret.slice('whsec_'.length), 'base64') : Buffer.from(secret, 'utf8');
}
export function standardWebhookHeaders(secret, id, body, now_seconds) {
    const key = standardWebhookSecretBytes(secret);
    const timestamp = String(now_seconds);
    const signature = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64');
    return { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}` };
}
export function contentDigest(body) {
    return `sha-256=:${createHash('sha256').update(body).digest('base64')}:`;
}
export function definiteRefusal(status) {
    return status >= 400 && status <= 499 && status !== 408 && status !== 425 && status !== 429;
}
export function readDispatchAnswer(wire, answer, subject) {
    if (wire === 'standard' && answer.status === 202) {
        return { unknown: `the owner accepted ${subject} for later (HTTP 202) without saying it applied it, so reconciliation reads the outcome` };
    }
    if (answer.status < 200 || answer.status > 299) {
        if (definiteRefusal(answer.status))
            return { outcome: 'refused', record: null };
        return {
            unknown: `the owner answered HTTP ${answer.status} to ${subject}, which does not say whether it applied the effect` +
                (answer.text ? `: ${answer.text.slice(0, 512)}` : ''),
        };
    }
    const record = parseRecord(answer.text);
    const outcome = record?.['outcome'] !== undefined ? ownerOutcome(record['outcome']) : wire === 'standard' ? 'applied' : null;
    if (!outcome)
        return { unknown: 'the owner answered without an explicit effect outcome. Return applied, already_applied, or refused.' };
    return { outcome, record };
}
export function readLookupAnswer(wire, answer, subject) {
    if (answer.status === 404)
        return { absent: true };
    if ((answer.status < 200 || answer.status > 299) && !definiteRefusal(answer.status)) {
        return { unknown: `the owner answered HTTP ${answer.status} to reconciliation of ${subject}, which says nothing about whether it applied the effect` };
    }
    const record = parseRecord(answer.text);
    if (answer.status > 299)
        return { unanswerable: answer.text || `HTTP ${answer.status}` };
    if (wire === 'standard' && answer.status !== 202 && (!record || (record['found'] === undefined && record['absent'] === undefined && record['unanswerable'] === undefined))) {
        const outcome = record?.['outcome'] !== undefined ? ownerOutcome(record['outcome']) : 'applied';
        if (!outcome)
            return { unanswerable: 'the owner reconciliation answer carried an outcome that is not applied, already_applied, or refused.' };
        return { found: outcome, record };
    }
    if (!record)
        return { unanswerable: answer.text || `HTTP ${answer.status}` };
    if (record['absent'] === true)
        return { absent: true };
    if (typeof record['unanswerable'] === 'string')
        return { unanswerable: record['unanswerable'] };
    const found = parseRecord(record['found']);
    const outcome = found ? ownerOutcome(found['outcome']) : null;
    if (!found || !outcome)
        return { unanswerable: 'the owner reconciliation answer did not carry a found outcome, absent, or unanswerable.' };
    return { found: outcome, record: { ...found, body: found['body'] ?? record['found'] } };
}
export function ownerReceiptFields(descriptor, outcome) {
    return {
        effect_id: descriptor.effect_id,
        idempotency_key: descriptor.idempotency_key,
        target: descriptor.target,
        operation: descriptor.operation,
        param_hash: descriptor.param_hash,
        outcome,
    };
}
export function ownerReceiptRefusal(jws, fields, key) {
    const decoded = decodeCompactJws(jws);
    if (!decoded)
        return 'it is not a compact JWS';
    if (decoded.header['alg'] !== 'EdDSA')
        return `its algorithm is ${String(decoded.header['alg'])}, not EdDSA`;
    if (canonicalJson(decoded.payload) !== canonicalJson(fields))
        return 'it signs fields other than this receipt\'s';
    if (!jwsSignatureValid('EdDSA', decoded.signing_input, decoded.signature, key))
        return 'the registered receipt key does not verify it';
    return null;
}
function ownerOutcome(value) {
    return value === 'applied' || value === 'already_applied' || value === 'refused' ? value : null;
}
function parseRecord(value) {
    if (typeof value === 'string') {
        try {
            return parseRecord(JSON.parse(value));
        }
        catch {
            return null;
        }
    }
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
