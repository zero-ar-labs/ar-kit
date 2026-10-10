import { z } from 'zod';
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
const wakeId = z.string().regex(/^wak_[0-9a-f]{32}$/, 'expected a wake id');
const count = z.number().int().nonnegative();
const wakeCounts = {
    due: count,
    promoted: count,
    claimed: count,
    late: count,
    cancelled: count,
    stale: count,
    duplicate_suppressed: count,
    backlogged: count,
};
export const WakeSchedulerDeclarationSchema = z.strictObject({
    levels: z.array(z.strictObject({
        name: z.string().min(1).max(64),
        bucket_width_ms: count,
        buckets: z.union([count, z.literal('unbounded')]),
        horizon_ms: z.union([count, z.literal('unbounded')]),
    })),
    bucket_widths_ms: z.array(count),
    horizon_ms: count,
    tick_cadence_ms: count,
    maximum_bucket_size: count,
    claim_lease_ms: count,
    late_wake_objective_ms: count,
    overflow_behavior: z.string().min(1).max(200),
    fallback_behavior: z.string().min(1).max(200),
    scheduler_connection_limit: count,
    clock_mapping: z.string().min(1).max(200),
    backward_wall_clock_policy: z.string().min(1).max(200),
});
export const WakeClockDiagnosticSchema = z.strictObject({
    previous_wall_ms: count.nullable(),
    current_wall_ms: count,
    wall_delta_ms: z.number().int().nullable(),
    monotonic_ms: z.number().nonnegative().nullable(),
    mapped_wall_ms: count,
    backward_wall_clock: z.boolean(),
    far_future_jump: z.boolean(),
});
export const WakeSchedulerReportSchema = z.strictObject({
    running: z.boolean(),
    declaration: WakeSchedulerDeclarationSchema,
    last_tick: z.strictObject({ at: z.string().datetime(), clock: WakeClockDiagnosticSchema, ...wakeCounts }).nullable(),
    classes: z.array(z.strictObject({ class: z.string().min(1).max(200), ...wakeCounts })),
    backlog: count,
    max_bucket_size_exceeded: z.boolean(),
    recent_failures: z.array(z.strictObject({
        run_id: runId,
        wake_id: wakeId,
        code: z.string().min(1).max(128),
        message: z.string().min(1).max(1_000),
        at: z.string().datetime(),
    })).max(100),
});
