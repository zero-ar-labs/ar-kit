import { z } from 'zod';
import { CONTROLLER_MODES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const count = z.number().int().nonnegative();
export const PinnedCheckpointDecisionSchema = z.strictObject({
    controller: z.string().min(1).max(200),
    interval_items: count,
    contract_ceiling: count,
    reason: z.string().min(1).max(1_000),
    fallback_used: z.boolean(),
    inputs_hash: hash,
});
export const ControllersViewSchema = z.strictObject({
    run_id: runId,
    canonical: z.strictObject({
        checkpoint: PinnedCheckpointDecisionSchema.nullable(),
        checkpoint_statistics_ref: hash.nullable(),
        context_selector: z.strictObject({
            selector: z.string().min(1).max(200),
            mode: z.enum(CONTROLLER_MODES),
            posture_ref: hash.nullable(),
        }).nullable(),
    }),
    telemetry: z.strictObject({
        label: z.literal('noncanonical-recommendation'),
        decisions: z.array(z.record(z.string(), z.unknown())).max(10_000),
    }),
    dispatcher: z.record(z.string(), z.unknown()).nullable(),
    context_cache: z.strictObject({ capacity: count, size: count, hits: count, misses: count }).nullable(),
});
