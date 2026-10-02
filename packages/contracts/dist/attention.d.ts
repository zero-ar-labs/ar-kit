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
export declare const AttentionDistributionSchema: z.ZodObject<{
    min: z.ZodNumber;
    p50: z.ZodNumber;
    p90: z.ZodNumber;
    max: z.ZodNumber;
}, z.core.$strict>;
export type AttentionDistribution = z.infer<typeof AttentionDistributionSchema>;
/** The calibrated model of one attention class, waits and service separated. */
export declare const AttentionClassModelSchema: z.ZodObject<{
    sample: z.ZodNumber;
    missing_data: z.ZodObject<{
        started_ms: z.ZodNumber;
        finished_ms: z.ZodNumber;
        invalid_time_order: z.ZodNumber;
    }, z.core.$strict>;
    arrival_distribution_ms: z.ZodObject<{
        min: z.ZodNumber;
        p50: z.ZodNumber;
        p90: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>;
    service_distribution_ms: z.ZodObject<{
        min: z.ZodNumber;
        p50: z.ZodNumber;
        p90: z.ZodNumber;
        max: z.ZodNumber;
    }, z.core.$strict>;
    service_confidence_interval_ms: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    model_fit: z.ZodObject<{
        method: z.ZodString;
        usable: z.ZodBoolean;
        reason: z.ZodString;
    }, z.core.$strict>;
    arrivals_per_hour_milli: z.ZodNumber;
    mean_service_ms: z.ZodNumber;
    p90_service_ms: z.ZodNumber;
    mean_wait_ms: z.ZodNumber;
    rho_ppm: z.ZodNumber;
}, z.core.$strict>;
export type AttentionClassModel = z.infer<typeof AttentionClassModelSchema>;
/** What an operator supplies to calibrate. Everything else comes from the tenant's log. */
export declare const AttentionCalibrationRequestSchema: z.ZodObject<{
    reviewers: z.ZodNumber;
    window_ms: z.ZodNumber;
    planning_horizon_ms: z.ZodOptional<z.ZodNumber>;
    confidence_posture: z.ZodOptional<z.ZodString>;
    classes: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
export type AttentionCalibrationRequest = z.infer<typeof AttentionCalibrationRequestSchema>;
/** An observe-only calibration report. Nothing is persisted and nothing is admitted from it. */
export declare const AttentionCalibrationReportSchema: z.ZodObject<{
    version: z.ZodLiteral<"attention-littles-v1">;
    calibration_mode: z.ZodLiteral<"observe-only">;
    window_ms: z.ZodNumber;
    planning_horizon_ms: z.ZodNumber;
    confidence_posture: z.ZodString;
    reviewers: z.ZodNumber;
    classes: z.ZodRecord<z.ZodString, z.ZodObject<{
        sample: z.ZodNumber;
        missing_data: z.ZodObject<{
            started_ms: z.ZodNumber;
            finished_ms: z.ZodNumber;
            invalid_time_order: z.ZodNumber;
        }, z.core.$strict>;
        arrival_distribution_ms: z.ZodObject<{
            min: z.ZodNumber;
            p50: z.ZodNumber;
            p90: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>;
        service_distribution_ms: z.ZodObject<{
            min: z.ZodNumber;
            p50: z.ZodNumber;
            p90: z.ZodNumber;
            max: z.ZodNumber;
        }, z.core.$strict>;
        service_confidence_interval_ms: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        model_fit: z.ZodObject<{
            method: z.ZodString;
            usable: z.ZodBoolean;
            reason: z.ZodString;
        }, z.core.$strict>;
        arrivals_per_hour_milli: z.ZodNumber;
        mean_service_ms: z.ZodNumber;
        p90_service_ms: z.ZodNumber;
        mean_wait_ms: z.ZodNumber;
        rho_ppm: z.ZodNumber;
    }, z.core.$strict>>;
    ref: z.ZodString;
}, z.core.$strict>;
export type AttentionCalibrationReport = z.infer<typeof AttentionCalibrationReportSchema>;
/**
 * Publish the next capacity snapshot. The runtime recalibrates from the log;
 * a flat batch price needs evidence, and the drift tolerance registered here
 * decides when the snapshot stops admitting enforced intake (MTH-AT-007, MTH-AT-008).
 */
export declare const AttentionCapacitySnapshotPublishRequestSchema: z.ZodObject<{
    reviewers: z.ZodNumber;
    window_ms: z.ZodNumber;
    planning_horizon_ms: z.ZodOptional<z.ZodNumber>;
    confidence_posture: z.ZodOptional<z.ZodString>;
    classes: z.ZodOptional<z.ZodArray<z.ZodString>>;
    tolerance_ppm: z.ZodNumber;
    batch_setup: z.ZodOptional<z.ZodArray<z.ZodObject<{
        class: z.ZodString;
        setup_ms: z.ZodNumber;
        flat_batch_ms: z.ZodOptional<z.ZodNumber>;
        evidence_ref: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>>;
}, z.core.$strict>;
export type AttentionCapacitySnapshotPublishRequest = z.infer<typeof AttentionCapacitySnapshotPublishRequestSchema>;
/** One published snapshot and its standing. Invalid names the prediction error that invalidated it. */
export declare const AttentionCapacitySnapshotSchema: z.ZodObject<{
    snapshot_ref: z.ZodString;
    version: z.ZodNumber;
    state: z.ZodEnum<{
        superseded: "superseded";
        current: "current";
        invalid: "invalid";
    }>;
    published_at: z.ZodString;
    published_by: z.ZodString;
    tolerance_ppm: z.ZodNumber;
    prediction_error_ppm: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    invalid_reason: z.ZodNullable<z.ZodString>;
    calibration: z.ZodObject<{
        version: z.ZodLiteral<"attention-littles-v1">;
        calibration_mode: z.ZodLiteral<"observe-only">;
        window_ms: z.ZodNumber;
        planning_horizon_ms: z.ZodNumber;
        confidence_posture: z.ZodString;
        reviewers: z.ZodNumber;
        classes: z.ZodRecord<z.ZodString, z.ZodObject<{
            sample: z.ZodNumber;
            missing_data: z.ZodObject<{
                started_ms: z.ZodNumber;
                finished_ms: z.ZodNumber;
                invalid_time_order: z.ZodNumber;
            }, z.core.$strict>;
            arrival_distribution_ms: z.ZodObject<{
                min: z.ZodNumber;
                p50: z.ZodNumber;
                p90: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            service_distribution_ms: z.ZodObject<{
                min: z.ZodNumber;
                p50: z.ZodNumber;
                p90: z.ZodNumber;
                max: z.ZodNumber;
            }, z.core.$strict>;
            service_confidence_interval_ms: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
            model_fit: z.ZodObject<{
                method: z.ZodString;
                usable: z.ZodBoolean;
                reason: z.ZodString;
            }, z.core.$strict>;
            arrivals_per_hour_milli: z.ZodNumber;
            mean_service_ms: z.ZodNumber;
            p90_service_ms: z.ZodNumber;
            mean_wait_ms: z.ZodNumber;
            rho_ppm: z.ZodNumber;
        }, z.core.$strict>>;
        ref: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
export type AttentionCapacitySnapshot = z.infer<typeof AttentionCapacitySnapshotSchema>;
/** The operator dashboard by class (MTH-AT-010). Without a snapshot the class set is empty and the reason says so. */
export declare const AttentionDashboardSchema: z.ZodObject<{
    measured_at: z.ZodString;
    snapshot_ref: z.ZodNullable<z.ZodString>;
    snapshot_state: z.ZodNullable<z.ZodEnum<{
        superseded: "superseded";
        current: "current";
        invalid: "invalid";
    }>>;
    reason: z.ZodNullable<z.ZodString>;
    classes: z.ZodRecord<z.ZodString, z.ZodObject<{
        backlog: z.ZodNumber;
        oldest_age_ms: z.ZodNumber;
        arrivals: z.ZodNumber;
        active_handling: z.ZodNumber;
        throughput: z.ZodNumber;
        utilization_ppm: z.ZodNumber;
        abandonment: z.ZodNumber;
        resubmission: z.ZodNumber;
        prediction_interval_ms: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
        blocked_intake: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AttentionDashboard = z.infer<typeof AttentionDashboardSchema>;
