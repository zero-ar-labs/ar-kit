export { ScriptedAdapter } from './scripted-adapter.js';
export type { ScriptTurn, ScriptedOptions } from './scripted-adapter.js';
export { scratchDir, scratchRoot } from './scratch.js';
export { noColorEnv } from './child-env.js';
export declare class LogicalClock {
    private now;
    tick(): number;
    peek(): number;
}
export declare const GENERATOR_VERSION = "mulberry32-v1";
export declare function seededGenerator(seed: number): () => number;
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
