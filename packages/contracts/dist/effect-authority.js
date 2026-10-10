import { z } from 'zod';
import { EFFECT_PLANE_MODES } from "./vocab.js";
export const EffectTargetListSchema = z.strictObject({
    mode: z.enum(EFFECT_PLANE_MODES),
    targets: z.array(z.strictObject({
        target: z.string().min(1).max(128),
        version: z.string().min(1).max(64),
        operations: z.array(z.string().min(1).max(128)).max(256),
    })).max(1_000),
});
