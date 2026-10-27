import type { KeyObject } from 'node:crypto';
import type { JwsAlgorithm } from './vocab.js';
export declare const COMPACT_JWS_MAX_LENGTH = 16384;
export interface DecodedCompactJws {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signing_input: string;
    signature: Buffer;
}
export declare function decodeCompactJws(value: string): DecodedCompactJws | null;
export declare function isJwsAlgorithm(value: unknown): value is JwsAlgorithm;
export declare function jwsKeyMatches(alg: JwsAlgorithm, key: KeyObject): boolean;
export declare function jwsSignatureValid(alg: JwsAlgorithm, signing_input: string, signature: Uint8Array, key: KeyObject): boolean;
export declare function signCompactJws(header: Record<string, unknown> & {
    alg: JwsAlgorithm;
}, payload: Record<string, unknown>, key: KeyObject): string;
