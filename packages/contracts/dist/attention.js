import { z } from 'zod';
import { ATTENTION_SNAPSHOT_STATES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const count = z.number().int().nonnegative();
const className = z.string().min(1).max(200);
const ppm = z.number().int().min(0).max(1_000_000);
export const AttentionDistributionSchema = z.strictObject({ min: count, p50: count, p90: count, max: count });
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
    rho_ppm: count,
});
export const AttentionCalibrationRequestSchema = z.strictObject({
    reviewers: z.number().int().min(1).max(100_000),
    window_ms: z.number().int().min(1),
    planning_horizon_ms: z.number().int().min(1).optional(),
    confidence_posture: z.string().min(1).max(64).optional(),
    classes: z.array(className).max(64).optional(),
});
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
export const AttentionCapacitySnapshotPublishRequestSchema = AttentionCalibrationRequestSchema.extend({
    tolerance_ppm: ppm,
    batch_setup: z.array(z.strictObject({
        class: className,
        setup_ms: count,
        flat_batch_ms: count.optional(),
        evidence_ref: hash.optional(),
    })).max(64).optional(),
});
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
