/**
 * Which records publish as durable observation events.
 *
 * What this is: the one mapping from a runtime record type to the durable
 * event name clients subscribe to, or null for records that stay internal to
 * the log. The outbox writes exactly what this map says.
 *
 * How it fits: durable observation is a projection of the log (X-2), and the
 * projection's vocabulary is closed. Internal records still reconstruct runs;
 * they simply are not events a client resumes on.
 */
import type { DurableEvent, ProductEventFamily, RecordType } from './vocab.js';
export declare const RECORD_EVENT_MAP: Record<RecordType, DurableEvent | null>;
/** One stable product family for every resumable event name. */
export declare const DURABLE_EVENT_FAMILY: Record<DurableEvent, ProductEventFamily>;
