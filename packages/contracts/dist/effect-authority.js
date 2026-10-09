/**
 * Effect authority operator contract.
 *
 * What this is: the listing of the registered effect targets, with the
 * effect plane mode this tenant runs under. The re-issue, revoke and epoch
 * advance acts retired with their routes under the autonomy plan, rule 2.
 *
 * How it fits: the target list needs effect:read. A deployment with no
 * dynamic authority answers mode absent or refuses with a typed diagnostic.
 */
import { z } from 'zod';
import { EFFECT_PLANE_MODES } from "./vocab.js";
/** The effect plane this tenant runs under and the targets it can dispatch to. */
export const EffectTargetListSchema = z.strictObject({
    mode: z.enum(EFFECT_PLANE_MODES),
    targets: z.array(z.strictObject({
        target: z.string().min(1).max(128),
        version: z.string().min(1).max(64),
        operations: z.array(z.string().min(1).max(128)).max(256),
    })).max(1_000),
});
