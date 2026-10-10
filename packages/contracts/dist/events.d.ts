import type { DurableEvent, ProductEventFamily, RecordType } from './vocab.js';
export declare const RECORD_EVENT_MAP: Record<RecordType, DurableEvent | null>;
export declare const DURABLE_EVENT_FAMILY: Record<DurableEvent, ProductEventFamily>;
