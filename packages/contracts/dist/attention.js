/**
 * Attention capacity contracts.
 *
 * What this is: the operator surface for review capacity: an observe-only
 * calibration from the tenant's own log, a versioned capacity snapshot an
 * operator publishes, and a dashboard by attention class (MTH-AT-001 to
 * MTH-AT-010). Waits and service times stay separate; a person's handling
 * time is measured only where the reviewer reports it.
 *
 * How it fits: routes under /v1/attention. Publishing a snapshot is the act
 * that makes enforced admission possible; calibration persists nothing.
 * Each tenant calibrates from its own store, so classes never pool tenants.
 */
import { z } from 'zod';
import { ATTENTION_SNAPSHOT_STATES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const count = z.number().int().nonnegative();
const className = z.string().min(1).max(200);
const ppm = z.number().int().min(0).max(1_000_000);
export const AttentionDistributionSchema = z.strictObject({ min: count, p50: count, p90: count, max: count });
/** The calibrated model of one attention class, waits and service separated. */
export const AttentionClassModelSchema = z.strictObject({
    sample: count,
    missing_data: z.strictObject({ started_ms: count, finished_ms: count, invalid_time_order: count }),
    arrival_distribution_ms: AttentionDistributionSchema,
    service_distribution_ms: AttentionDistributionSchema,
    service_confidence_interval_ms: z.tuple([count, count]),
    model_fit: z.strictObject({ method: z.string().min(1), usable: z.boolean(), reason: z.string().min(1) }),
    arrivals_per_hour_milli: count,
    mean_service_ms: count,
    p90_service_ms: count,
    mean_wait_ms: count,
    /** Utilization in parts per million for the stated reviewer count; a million or more cannot stabilize. */
    rho_ppm: count,
});
/** What an operator supplies to calibrate. Everything else comes from the tenant's log. */
export const AttentionCalibrationRequestSchema = z.strictObject({
    reviewers: z.number().int().min(1).max(100_000),
    window_ms: z.number().int().min(1),
    planning_horizon_ms: z.number().int().min(1).optional(),
    confidence_posture: z.string().min(1).max(64).optional(),
    classes: z.array(className).max(64).optional(),
});
/** An observe-only calibration report. Nothing is persisted and nothing is admitted from it. */
export const AttentionCalibrationReportSchema = z.strictObject({
    version: z.literal('attention-littles-v1'),
    calibration_mode: z.literal('observe-only'),
    window_ms: count,
    planning_horizon_ms: count,
    confidence_posture: z.string().min(1).max(64),
    reviewers: z.number().int().min(1),
    classes: z.record(className, AttentionClassModelSchema),
    ref: hash,
});
/**
 * Publish the next capacity snapshot. The runtime recalibrates from the log;
 * a flat batch price needs evidence, and the drift tolerance registered here
 * decides when the snapshot stops admitting enforced intake (MTH-AT-007, MTH-AT-008).
 */
export const AttentionCapacitySnapshotPublishRequestSchema = AttentionCalibrationRequestSchema.extend({
    tolerance_ppm: ppm,
    batch_setup: z.array(z.strictObject({
        class: className,
        setup_ms: count,
        flat_batch_ms: count.optional(),
        evidence_ref: hash.optional(),
    })).max(64).optional(),
});
/** One published snapshot and its standing. Invalid names the prediction error that invalidated it. */
export const AttentionCapacitySnapshotSchema = z.strictObject({
    snapshot_ref: hash,
    version: z.number().int().min(1),
    state: z.enum(ATTENTION_SNAPSHOT_STATES),
    published_at: z.string().datetime(),
    published_by: z.string().min(1).max(256),
    tolerance_ppm: ppm,
    prediction_error_ppm: z.record(className, count).nullable(),
    invalid_reason: z.string().min(1).max(1_000).nullable(),
    calibration: AttentionCalibrationReportSchema,
});
/** The operator dashboard by class (MTH-AT-010). Without a snapshot the class set is empty and the reason says so. */
export const AttentionDashboardSchema = z.strictObject({
    measured_at: z.string().datetime(),
    snapshot_ref: hash.nullable(),
    snapshot_state: z.enum(ATTENTION_SNAPSHOT_STATES).nullable(),
    reason: z.string().min(1).max(1_000).nullable(),
    classes: z.record(className, z.strictObject({
        backlog: count,
        oldest_age_ms: count,
        arrivals: count,
        active_handling: count,
        throughput: count,
        utilization_ppm: count,
        abandonment: count,
        resubmission: count,
        prediction_interval_ms: z.tuple([count, count]),
        blocked_intake: count,
    })),
});
