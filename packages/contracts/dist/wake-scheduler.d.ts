/**
 * Wake scheduler report contracts.
 *
 * What this is: the operator view of one tenant's timing wheel: the
 * declared configuration, the last tick, running totals per condition
 * family, the durable backlog and recent resume failures (MTH-TW-010).
 *
 * How it fits: served at GET /v1/scheduler/wakes with operator:audit and
 * answered per tenant, so one tenant's report never names another tenant's
 * wakes. The wake records in the log stay canonical; this is a projection.
 */
import { z } from 'zod';
/** The wheel configuration as declared at startup (MTH-TW-002). */
export declare const WakeSchedulerDeclarationSchema: z.ZodObject<{
    levels: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        bucket_width_ms: z.ZodNumber;
        buckets: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unbounded">]>;
        horizon_ms: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unbounded">]>;
    }, z.core.$strict>>;
    bucket_widths_ms: z.ZodArray<z.ZodNumber>;
    horizon_ms: z.ZodNumber;
    tick_cadence_ms: z.ZodNumber;
    maximum_bucket_size: z.ZodNumber;
    claim_lease_ms: z.ZodNumber;
    late_wake_objective_ms: z.ZodNumber;
    overflow_behavior: z.ZodString;
    fallback_behavior: z.ZodString;
    scheduler_connection_limit: z.ZodNumber;
    clock_mapping: z.ZodString;
    backward_wall_clock_policy: z.ZodString;
}, z.core.$strict>;
export type WakeSchedulerDeclaration = z.infer<typeof WakeSchedulerDeclarationSchema>;
/** How one tick mapped wall and monotonic time (MTH-TW-009). */
export declare const WakeClockDiagnosticSchema: z.ZodObject<{
    previous_wall_ms: z.ZodNullable<z.ZodNumber>;
    current_wall_ms: z.ZodNumber;
    wall_delta_ms: z.ZodNullable<z.ZodNumber>;
    monotonic_ms: z.ZodNullable<z.ZodNumber>;
    mapped_wall_ms: z.ZodNumber;
    backward_wall_clock: z.ZodBoolean;
    far_future_jump: z.ZodBoolean;
}, z.core.$strict>;
export type WakeClockDiagnostic = z.infer<typeof WakeClockDiagnosticSchema>;
export declare const WakeSchedulerReportSchema: z.ZodObject<{
    running: z.ZodBoolean;
    declaration: z.ZodObject<{
        levels: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            bucket_width_ms: z.ZodNumber;
            buckets: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unbounded">]>;
            horizon_ms: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"unbounded">]>;
        }, z.core.$strict>>;
        bucket_widths_ms: z.ZodArray<z.ZodNumber>;
        horizon_ms: z.ZodNumber;
        tick_cadence_ms: z.ZodNumber;
        maximum_bucket_size: z.ZodNumber;
        claim_lease_ms: z.ZodNumber;
        late_wake_objective_ms: z.ZodNumber;
        overflow_behavior: z.ZodString;
        fallback_behavior: z.ZodString;
        scheduler_connection_limit: z.ZodNumber;
        clock_mapping: z.ZodString;
        backward_wall_clock_policy: z.ZodString;
    }, z.core.$strict>;
    last_tick: z.ZodNullable<z.ZodObject<{
        due: z.ZodNumber;
        promoted: z.ZodNumber;
        claimed: z.ZodNumber;
        late: z.ZodNumber;
        cancelled: z.ZodNumber;
        stale: z.ZodNumber;
        duplicate_suppressed: z.ZodNumber;
        backlogged: z.ZodNumber;
        at: z.ZodString;
        clock: z.ZodObject<{
            previous_wall_ms: z.ZodNullable<z.ZodNumber>;
            current_wall_ms: z.ZodNumber;
            wall_delta_ms: z.ZodNullable<z.ZodNumber>;
            monotonic_ms: z.ZodNullable<z.ZodNumber>;
            mapped_wall_ms: z.ZodNumber;
            backward_wall_clock: z.ZodBoolean;
            far_future_jump: z.ZodBoolean;
        }, z.core.$strict>;
    }, z.core.$strict>>;
    classes: z.ZodArray<z.ZodObject<{
        due: z.ZodNumber;
        promoted: z.ZodNumber;
        claimed: z.ZodNumber;
        late: z.ZodNumber;
        cancelled: z.ZodNumber;
        stale: z.ZodNumber;
        duplicate_suppressed: z.ZodNumber;
        backlogged: z.ZodNumber;
        class: z.ZodString;
    }, z.core.$strict>>;
    backlog: z.ZodNumber;
    max_bucket_size_exceeded: z.ZodBoolean;
    recent_failures: z.ZodArray<z.ZodObject<{
        run_id: z.ZodString;
        wake_id: z.ZodString;
        code: z.ZodString;
        message: z.ZodString;
        at: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type WakeSchedulerReport = z.infer<typeof WakeSchedulerReportSchema>;
