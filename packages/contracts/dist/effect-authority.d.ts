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
/** The effect plane this tenant runs under and the targets it can dispatch to. */
export declare const EffectTargetListSchema: z.ZodObject<{
    mode: z.ZodEnum<{
        "dynamic-authority": "dynamic-authority";
        absent: "absent";
        "restricted-attachment": "restricted-attachment";
    }>;
    targets: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        version: z.ZodString;
        operations: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type EffectTargetList = z.infer<typeof EffectTargetListSchema>;
