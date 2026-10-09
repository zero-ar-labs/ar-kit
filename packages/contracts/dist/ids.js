/**
 * Identifiers and content addressing.
 *
 * What this is: time-ordered unique ids for runs, records, entries, leases,
 * branches, and controls, plus the content hash used everywhere a value is
 * addressed by what it says rather than where it sits.
 *
 * How it fits: an id locates a thing and never authorizes anything (K-19).
 * Ids are UUIDv7 hex, so storage order and creation order agree without a
 * global counter: across milliseconds by the timestamp, and inside one
 * process within a millisecond by a counter, so entries one transaction
 * lands sort in the order it landed them. A content hash is sha256 over
 * canonical bytes, so two identical values have one identity (ADR-0003).
 */
import { createHash, randomBytes } from 'node:crypto';
import { canonicalJson } from "./canonical.js";
import { ID_PREFIXES } from "./vocab.js";
let lastMs = -1;
let lastCounter = 0;
/**
 * UUIDv7 as 32 lowercase hex characters: 48 bits of milliseconds, then
 * randomness. On the process clock, the 12 bits after the version hold a
 * counter that rises within one millisecond and moves the timestamp forward
 * one millisecond when it would wrap, so ids this process mints sort in the
 * order it minted them (RFC 9562, method 1). An explicit time keeps the
 * random form.
 */
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
            // Start in the lower half, so a busy millisecond has room to rise.
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
/** The short display form the terminal shows. The full id remains the address. */
export function shortId(id) {
    const body = id.slice(id.indexOf('_') + 1);
    return body.slice(0, 8);
}
/** sha256 over canonical bytes, prefixed so the algorithm is part of the value. */
export function contentHash(value) {
    return 'sha256:' + createHash('sha256').update(canonicalJson(value)).digest('hex');
}
export function sha256Hex(text) {
    return createHash('sha256').update(text).digest('hex');
}
