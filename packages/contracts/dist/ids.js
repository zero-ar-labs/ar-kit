import { createHash, randomBytes } from 'node:crypto';
import { canonicalJson } from "./canonical.js";
import { ID_PREFIXES } from "./vocab.js";
let lastMs = -1;
let lastCounter = 0;
export function uuidv7(now) {
    const bytes = randomBytes(16);
    let ms;
    if (now === undefined) {
        ms = Date.now();
        if (ms <= lastMs) {
            ms = lastMs;
            lastCounter += 1;
            if (lastCounter > 0xfff) {
                ms = lastMs + 1;
                lastCounter = 0;
            }
        }
        else {
            lastCounter = (bytes[6] << 8 | bytes[7]) & 0x7ff;
        }
        lastMs = ms;
        bytes[6] = 0x70 | ((lastCounter >> 8) & 0x0f);
        bytes[7] = lastCounter & 0xff;
    }
    else {
        ms = now;
        bytes[6] = 0x70 | (bytes[6] & 0x0f);
    }
    bytes[0] = (ms / 0x10000000000) & 0xff;
    bytes[1] = (ms / 0x100000000) & 0xff;
    bytes[2] = (ms / 0x1000000) & 0xff;
    bytes[3] = (ms / 0x10000) & 0xff;
    bytes[4] = (ms / 0x100) & 0xff;
    bytes[5] = ms & 0xff;
    bytes[8] = 0x80 | (bytes[8] & 0x3f);
    return bytes.toString('hex');
}
export function makeId(prefix, now) {
    return `${prefix}_${uuidv7(now)}`;
}
const ID_PATTERN = new RegExp(`^(${ID_PREFIXES.join('|')})_[0-9a-f]{32}$`);
export function isId(value, prefix) {
    if (!ID_PATTERN.test(value))
        return false;
    return prefix === undefined || value.startsWith(`${prefix}_`);
}
export function shortId(id) {
    const body = id.slice(id.indexOf('_') + 1);
    return body.slice(0, 8);
}
export function contentHash(value) {
    return 'sha256:' + createHash('sha256').update(canonicalJson(value)).digest('hex');
}
export function sha256Hex(text) {
    return createHash('sha256').update(text).digest('hex');
}
