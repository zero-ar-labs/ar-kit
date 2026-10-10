import { z } from 'zod';
export declare const PinnedCheckpointDecisionSchema: z.ZodObject<{
    controller: z.ZodString;
    interval_items: z.ZodNumber;
    contract_ceiling: z.ZodNumber;
    reason: z.ZodString;
    fallback_used: z.ZodBoolean;
    inputs_hash: z.ZodString;
}, z.core.$strict>;
export type PinnedCheckpointDecision = z.infer<typeof PinnedCheckpointDecisionSchema>;
export declare const ControllersViewSchema: z.ZodObject<{
    run_id: z.ZodString;
    canonical: z.ZodObject<{
        checkpoint: z.ZodNullable<z.ZodObject<{
            controller: z.ZodString;
            interval_items: z.ZodNumber;
            contract_ceiling: z.ZodNumber;
            reason: z.ZodString;
            fallback_used: z.ZodBoolean;
            inputs_hash: z.ZodString;
        }, z.core.$strict>>;
        checkpoint_statistics_ref: z.ZodNullable<z.ZodString>;
        context_selector: z.ZodNullable<z.ZodObject<{
            selector: z.ZodString;
            mode: z.ZodEnum<{
                off: "off";
                observe: "observe";
                enforce: "enforce";
            }>;
            posture_ref: z.ZodNullable<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    telemetry: z.ZodObject<{
        label: z.ZodLiteral<"noncanonical-recommendation">;
        decisions: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.core.$strict>;
    dispatcher: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    context_cache: z.ZodNullable<z.ZodObject<{
        capacity: z.ZodNumber;
        size: z.ZodNumber;
        hits: z.ZodNumber;
        misses: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ControllersView = z.infer<typeof ControllersViewSchema>;
