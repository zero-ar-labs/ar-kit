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
export { ScriptedAdapter } from "./scripted-adapter.js";
export { scratchDir, scratchRoot } from "./scratch.js";
/** Ordered instants without wall time, for fixtures that compare histories. */
export class LogicalClock {
    now = 0;
    tick() {
        this.now += 1;
        return this.now;
    }
    peek() {
        return this.now;
    }
}
/**
 * The recorded deterministic generator (MTH-014): mulberry32 over an
 * integer seed. Every synthetic population names its generator version,
 * seed, and ordering, so a sample replays exactly.
 */
export const GENERATOR_VERSION = 'mulberry32-v1';
export function seededGenerator(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let mixed = state;
        mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
        return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
}
/**
 * A synthetic hazard population for checkpoint fixtures: items with a
 * seeded rejection pattern at the declared rate, content stable for a
 * given seed. The population hash is the identity a decision records.
 */
export function syntheticHazardPopulation(args) {
    const next = seededGenerator(args.seed);
    const items = Array.from({ length: args.items }, (_, i) => ({
        item_id: `item-${String(i + 1).padStart(5, '0')}`,
        rejected: next() * 1_000_000 < args.hazard_per_million,
    }));
    return { generator: GENERATOR_VERSION, seed: args.seed, items, rejected: items.filter((item) => item.rejected).length };
}
