/**
 * Canonical JSON serialization.
 *
 * What this is: the one function that turns a value into bytes for hashing,
 * chaining, and byte-equality comparison. Object keys sort, numbers must be
 * finite, undefined properties are omitted, and nothing else is accepted.
 *
 * How it fits: content hashes, the record chain, and the projection equality
 * test (KCV-001) all compare canonical bytes. Two serializations would be two
 * opinions about identity, so there is exactly one (X-7, one implementation).
 */
export function canonicalJson(value) {
    const out = [];
    writeValue(value, out, '$');
    return out.join('');
}
function writeValue(value, out, path) {
    if (value === null) {
        out.push('null');
        return;
    }
    switch (typeof value) {
        case 'boolean':
            out.push(value ? 'true' : 'false');
            return;
        case 'number':
            if (!Number.isFinite(value)) {
                throw new Error(`canonical json refuses a non-finite number at ${path}. Store the value as a string or omit it.`);
            }
            out.push(JSON.stringify(value));
            return;
        case 'string':
            out.push(JSON.stringify(value));
            return;
        case 'object':
            break;
        default:
            throw new Error(`canonical json refuses a ${typeof value} at ${path}. Only null, boolean, finite number, string, array, and plain object serialize.`);
    }
    if (Array.isArray(value)) {
        out.push('[');
        for (let i = 0; i < value.length; i++) {
            if (i > 0)
                out.push(',');
            writeValue(value[i] === undefined ? null : value[i], out, `${path}[${i}]`);
        }
        out.push(']');
        return;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) {
        throw new Error(`canonical json refuses a class instance at ${path}. Convert it to a plain object first.`);
    }
    const record = value;
    const keys = Object.keys(record).filter((k) => record[k] !== undefined).sort();
    out.push('{');
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i > 0)
            out.push(',');
        out.push(JSON.stringify(key), ':');
        writeValue(record[key], out, `${path}.${key}`);
    }
    out.push('}');
}
