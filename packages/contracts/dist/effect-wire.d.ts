import type { KeyObject } from 'node:crypto';
export type EffectTargetWire = 'zero-ar-json' | 'standard';
export type EffectOwnerOutcome = 'applied' | 'already_applied' | 'refused';
export declare const EFFECT_TARGET_TIMEOUT_MS = 30000;
export declare const EFFECT_ANSWER_LIMIT = 4096;
export interface EffectTargetAnswer {
    status: number;
    text: string;
}
export type EffectDispatchReading = {
    outcome: EffectOwnerOutcome;
    record: Record<string, unknown> | null;
} | {
    unknown: string;
};
export type EffectLookupReading = {
    found: EffectOwnerOutcome;
    record: Record<string, unknown> | null;
} | {
    absent: true;
} | {
    unanswerable: string;
} | {
    unknown: string;
};
export interface EffectTargetRoute {
    path: string;
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    reconcile_path?: string;
    reconcile_method?: 'GET' | 'POST';
}
export interface EffectTargetRequest {
    method: string;
    url: URL;
    headers: Record<string, string>;
    body: string | null;
}
export interface EffectCallDescriptor {
    effect_id: string;
    idempotency_key: string;
    operation: string;
    params: Record<string, unknown>;
    run_id?: string;
}
export declare function effectDispatchRequest(endpoint: URL, route: EffectTargetRoute, wire: EffectTargetWire, credential: string, descriptor: EffectCallDescriptor, now_seconds?: number): EffectTargetRequest;
export declare function effectLookupRequest(endpoint: URL, route: EffectTargetRoute, wire: EffectTargetWire, credential: string, descriptor: Omit<EffectCallDescriptor, 'params'> & {
    param_hash: string;
}, now_seconds?: number): EffectTargetRequest | null;
export declare function standardWebhookSecretBytes(secret: string): Buffer;
export declare function standardWebhookHeaders(secret: string, id: string, body: string, now_seconds: number): Record<string, string>;
export declare function contentDigest(body: string): string;
export declare function definiteRefusal(status: number): boolean;
export declare function readDispatchAnswer(wire: EffectTargetWire, answer: EffectTargetAnswer, subject: string): EffectDispatchReading;
export declare function readLookupAnswer(wire: EffectTargetWire, answer: EffectTargetAnswer, subject: string): EffectLookupReading;
export declare function ownerReceiptFields(descriptor: {
    effect_id: string;
    idempotency_key: string;
    target: string;
    operation: string;
    param_hash: string;
}, outcome: EffectOwnerOutcome): Record<string, string>;
export declare function ownerReceiptRefusal(jws: string, fields: Record<string, string>, key: KeyObject): string | null;
