/**
 * The public, stateless run-bundle materializer.
 *
 * What this is: a small supported wrapper around the canonical bundle reader
 * and the exact run-head fold the runtime uses. It verifies portable bytes,
 * refolds the history and compares the declared projection hash.
 *
 * How it fits: release packaging bundles these pure implementation modules
 * into this public entrypoint. A consumer needs contracts and bundle bytes,
 * not a server, database, kernel or storage adapter.
 */
import type { RunMaterialization } from '@zero-ar/contracts';
/** Verify and materialize one run bundle without opening runtime state. */
export declare function materializeRunBundle(text: string): RunMaterialization;
