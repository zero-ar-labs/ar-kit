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
export declare function canonicalJson(value: unknown): string;
