export { ScriptedAdapter } from "./scripted-adapter.js";
export { scratchDir, scratchRoot } from "./scratch.js";
export { noColorEnv } from "./child-env.js";
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
export function syntheticHazardPopulation(args) {
    const next = seededGenerator(args.seed);
    const items = Array.from({ length: args.items }, (_, i) => ({
        item_id: `item-${String(i + 1).padStart(5, '0')}`,
        rejected: next() * 1_000_000 < args.hazard_per_million,
    }));
    return { generator: GENERATOR_VERSION, seed: args.seed, items, rejected: items.filter((item) => item.rejected).length };
}
