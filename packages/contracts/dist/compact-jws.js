import { createHmac, sign, timingSafeEqual, verify } from 'node:crypto';
import { JWS_ALGORITHMS } from "./vocab.js";
export const COMPACT_JWS_MAX_LENGTH = 16_384;
export function decodeCompactJws(value) {
    if (typeof value !== 'string' || value.length === 0 || value.length > COMPACT_JWS_MAX_LENGTH)
        return null;
    const parts = value.split('.');
    if (parts.length !== 3)
        return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const header = jsonObject(canonicalBase64Url(encodedHeader));
    const payload = jsonObject(canonicalBase64Url(encodedPayload));
    const signature = canonicalBase64Url(encodedSignature);
    if (!header || !payload || !signature || signature.byteLength === 0)
        return null;
    return { header, payload, signing_input: `${encodedHeader}.${encodedPayload}`, signature };
}
export function isJwsAlgorithm(value) {
    return typeof value === 'string' && JWS_ALGORITHMS.includes(value);
}
export function jwsKeyMatches(alg, key) {
    switch (alg) {
        case 'RS256':
            return key.type !== 'secret' && key.asymmetricKeyType === 'rsa';
        case 'ES256':
            return key.type !== 'secret' && key.asymmetricKeyType === 'ec' && key.asymmetricKeyDetails?.namedCurve === 'prime256v1';
        case 'EdDSA':
            return key.type !== 'secret' && key.asymmetricKeyType === 'ed25519';
        case 'HS256':
            return key.type === 'secret' && (key.symmetricKeySize ?? 0) >= 32;
    }
}
export function jwsSignatureValid(alg, signing_input, signature, key) {
    if (!jwsKeyMatches(alg, key))
        return false;
    const data = Buffer.from(signing_input);
    try {
        switch (alg) {
            case 'RS256':
                return verify('RSA-SHA256', data, key, signature);
            case 'ES256':
                return signature.byteLength === 64 && verify('sha256', data, { key, dsaEncoding: 'ieee-p1363' }, signature);
            case 'EdDSA':
                return verify(null, data, key, signature);
            case 'HS256': {
                const expected = createHmac('sha256', key).update(data).digest();
                return expected.byteLength === signature.byteLength && timingSafeEqual(expected, signature);
            }
        }
    }
    catch {
        return false;
    }
}
export function signCompactJws(header, payload, key) {
    if (!isJwsAlgorithm(header.alg))
        throw new Error(`the JWS algorithm ${String(header.alg)} is not one this runtime signs. Use ${JWS_ALGORITHMS.join(', ')}.`);
    if (!jwsKeyMatches(header.alg, key)) {
        throw new Error(`the signing key does not suit ${header.alg}. RS256 takes an RSA key, ES256 a P-256 key, EdDSA an Ed25519 key and HS256 a secret of at least 32 bytes.`);
    }
    const input = `${Buffer.from(JSON.stringify(header)).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
    const data = Buffer.from(input);
    const signature = header.alg === 'RS256'
        ? sign('RSA-SHA256', data, key)
        : header.alg === 'ES256'
            ? sign('sha256', data, { key, dsaEncoding: 'ieee-p1363' })
            : header.alg === 'EdDSA'
                ? sign(null, data, key)
                : createHmac('sha256', key).update(data).digest();
    return `${input}.${signature.toString('base64url')}`;
}
function canonicalBase64Url(value) {
    if (!/^[A-Za-z0-9_-]+$/.test(value))
        return null;
    const bytes = Buffer.from(value, 'base64url');
    return bytes.toString('base64url') === value ? bytes : null;
}
function jsonObject(bytes) {
    if (!bytes)
        return null;
    try {
        const parsed = JSON.parse(bytes.toString('utf8'));
        return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
