/**
 * Controllers view contracts.
 *
 * What this is: one read of what the optimization controllers decided for a
 * run. Canonical decisions come from what the run pinned at admission;
 * telemetry is labelled a noncanonical recommendation because it lives in
 * process memory and a restart forgets it (MTH-002, MTH-004).
 *
 * How it fits: served at GET /v1/runs/{run_id}/controllers under the run
 * read scope and ZeroARClient.controllers(); the engine builds it from
 * run.created and its telemetry, and zeroar inspect prints it. The view
 * never feeds a decision back into the kernel.
 */
import { z } from 'zod';
import { CONTROLLER_MODES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const count = z.number().int().nonnegative();
/** The checkpoint schedule the run pinned in run.created. */
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
    /** The cell dispatcher's explanation for this tenant, where one is attached. */
    dispatcher: z.record(z.string(), z.unknown()).nullable(),
    context_cache: z.strictObject({ capacity: count, size: count, hits: count, misses: count }).nullable(),
});
