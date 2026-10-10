import { z } from 'zod';
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
