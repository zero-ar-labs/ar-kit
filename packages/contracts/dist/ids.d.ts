/**
 * Identifiers and content addressing.
 *
 * What this is: time-ordered unique ids for runs, records, entries, leases,
 * branches, and controls, plus the content hash used everywhere a value is
 * addressed by what it says rather than where it sits.
 *
 * How it fits: an id locates a thing and never authorizes anything (K-19).
 * Ids are UUIDv7 hex, so storage order and creation order agree without a
 * global counter. A content hash is sha256 over canonical bytes, so two
 * identical values have one identity (ADR-0003).
 */
import type { IdPrefix } from './vocab.js';
export type { IdPrefix } from './vocab.js';
/** UUIDv7 as 32 lowercase hex characters: 48 bits of milliseconds, then randomness. */
export declare function uuidv7(now?: number): string;
export declare function makeId(prefix: IdPrefix, now?: number): string;
export declare function isId(value: string, prefix?: IdPrefix): boolean;
/** The short display form the terminal shows. The full id remains the address. */
export declare function shortId(id: string): string;
/** sha256 over canonical bytes, prefixed so the algorithm is part of the value. */
export declare function contentHash(value: unknown): string;
export declare function sha256Hex(text: string): string;
