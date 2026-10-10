import type { IdPrefix } from './vocab.js';
export type { IdPrefix } from './vocab.js';
export declare function uuidv7(now?: number): string;
export declare function makeId(prefix: IdPrefix, now?: number): string;
export declare function isId(value: string, prefix?: IdPrefix): boolean;
export declare function shortId(id: string): string;
export declare function contentHash(value: unknown): string;
export declare function sha256Hex(text: string): string;
