/**
 * @zero-ar/testkit: the deterministic kit.
 *
 * What this is: what a test needs to run the product with no network, no
 * credential, and no wall-clock surprises. The scripted adapter is local to
 * this package; the logical clock hands out ordered instants; the corruption
 * options give validators something concrete to reject.
 *
 * How it fits: no test of a core guarantee may require a billable model or
 * an external service (ERD 11.6).
 */
export { ScriptedAdapter } from './scripted-adapter.js';
export type { ScriptTurn, ScriptedOptions } from './scripted-adapter.js';
export { scratchDir, scratchRoot } from './scratch.js';
/** Ordered instants without wall time, for fixtures that compare histories. */
export declare class LogicalClock {
    private now;
    tick(): number;
    peek(): number;
}
/**
 * The recorded deterministic generator (MTH-014): mulberry32 over an
 * integer seed. Every synthetic population names its generator version,
 * seed, and ordering, so a sample replays exactly.
 */
export declare const GENERATOR_VERSION = "mulberry32-v1";
export declare function seededGenerator(seed: number): () => number;
/**
 * A synthetic hazard population for checkpoint fixtures: items with a
 * seeded rejection pattern at the declared rate, content stable for a
 * given seed. The population hash is the identity a decision records.
 */
export declare function syntheticHazardPopulation(args: {
    seed: number;
    items: number;
    hazard_per_million: number;
}): {
    generator: typeof GENERATOR_VERSION;
    seed: number;
    items: {
        item_id: string;
        rejected: boolean;
    }[];
    rejected: number;
};
