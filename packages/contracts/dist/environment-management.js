/**
 * Public environment administration contracts.
 *
 * This file is the shared language used by the server, generated client, SDK,
 * and CLI. A junior developer should add an operation here and to the route
 * table before adding transport code. The runtime implementation sits behind
 * EnvironmentManagementPort, so public surfaces never import an adapter.
 */
import { z } from 'zod';
import { AbandonEnvironmentResultSchema, CancelEnvironmentJobResultSchema, EnvironmentAdapterDescriptorSchema, EnvironmentJobHandleSchema, EnvironmentProfileRegistrationSchema, EnvironmentProfileSchema, EnvironmentStatusSchema, ObserveEnvironmentJobResultSchema, ReconcileEnvironmentJobResultSchema, TeardownEnvironmentResultSchema, } from "./environment.js";
import { ENVIRONMENT_BACKENDS, ENVIRONMENT_ISOLATIONS, ENVIRONMENT_MEASUREMENT_PHASES, ENVIRONMENT_MEASUREMENT_UNITS, ENVIRONMENT_PROFILE_STATES, OPERATION_CLASSES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const profileRef = z.strictObject({ profile_ref: hash });
const jobRef = z.strictObject({ job_id: z.string().regex(/^job_[0-9a-f]{32}$/) });
export const RegisterEnvironmentRequestSchema = z.strictObject({
    profile: EnvironmentProfileSchema,
    secret_issuance_epoch: z.number().int().positive(),
});
export const EnvironmentProfileRefRequestSchema = profileRef;
export const EnvironmentProfileStateRequestSchema = z.strictObject({
    state: z.enum(ENVIRONMENT_PROFILE_STATES),
    reason: z.string().min(1).max(2_000),
});
export const EnvironmentCredentialRotationRequestSchema = z.strictObject({
    secret_issuance_epoch: z.number().int().positive(),
    reason: z.string().min(1).max(2_000),
});
export const EnvironmentProfileListSchema = z.strictObject({
    profiles: z.array(EnvironmentProfileRegistrationSchema),
});
export const EnvironmentDoctorRequestSchema = z.strictObject({
    active_check: z.boolean(),
});
export const EnvironmentDoctorResultSchema = z.strictObject({
    profile_ref: hash,
    ready: z.boolean(),
    adapter: EnvironmentAdapterDescriptorSchema,
    checks: z.array(z.strictObject({ name: z.string().min(1), passed: z.boolean(), detail: z.string().min(1) })),
    checked_at: z.string().datetime(),
});
export const EnvironmentConformanceRequestSchema = z.strictObject({
    real_provider: z.boolean(),
});
export const EnvironmentConformanceResultSchema = z.strictObject({
    profile_ref: hash,
    adapter_digest: hash,
    passed: z.boolean(),
    real_provider: z.boolean(),
    evidence_refs: z.array(hash),
    omissions: z.array(z.string().min(1)),
    diagnostic: z.string().nullable(),
});
export const EnvironmentJobListSchema = z.strictObject({
    jobs: z.array(EnvironmentJobHandleSchema),
});
export const EnvironmentJobRefRequestSchema = jobRef;
export const EnvironmentJobActionRequestSchema = z.strictObject({
    job_id: jobRef.shape.job_id,
    reason: z.string().min(1).max(2_000),
});
export const EnvironmentAbandonJobRequestSchema = z.strictObject({
    job_id: jobRef.shape.job_id,
    reason: z.string().min(1).max(4_096),
    remaining_uncertainty: z.array(z.string().min(1)).min(1),
    known_cost: z.record(z.string(), z.number().int().nonnegative()),
});
export const EnvironmentSweepRequestSchema = z.strictObject({
    adapter_digest: hash.nullable(),
    profile_ref: hash.nullable(),
    limit: z.number().int().min(1).max(1_000),
    teardown_terminal: z.boolean(),
    inspect_provider_resources: z.boolean(),
    remove_confirmed_orphans: z.boolean(),
    orphan_grace_ms: z.number().int().nonnegative(),
    reason: z.string().min(1).max(2_000),
});
export const EnvironmentSweepResultSchema = z.strictObject({
    inspected: z.number().int().nonnegative(),
    reconciled_job_ids: z.array(jobRef.shape.job_id),
    torn_down_job_ids: z.array(jobRef.shape.job_id),
    unresolved: z.array(z.strictObject({
        job_id: jobRef.shape.job_id,
        status: EnvironmentStatusSchema,
        diagnostic: z.string().min(1),
    })),
    provider_inventory_available: z.boolean(),
    suspected_provider_handles: z.array(z.string().min(1)),
    removed_provider_handles: z.array(z.string().min(1)),
    unresolved_provider_resources: z.array(z.strictObject({
        provider_handle: z.string().min(1),
        diagnostic: z.string().min(1),
    })),
    truncated: z.boolean(),
});
export const EnvironmentMeasurementSummarySchema = z.strictObject({
    phase: z.enum(ENVIRONMENT_MEASUREMENT_PHASES),
    unit: z.enum(ENVIRONMENT_MEASUREMENT_UNITS),
    count: z.number().int().nonnegative(),
    sample_window: z.number().int().nonnegative(),
    minimum: z.number().nonnegative(),
    p50: z.number().nonnegative(),
    p95: z.number().nonnegative(),
    p99: z.number().nonnegative(),
    maximum: z.number().nonnegative(),
    mean: z.number().nonnegative(),
});
export const EnvironmentMetricsSchema = z.strictObject({
    tenant: z.string().min(1),
    by_adapter: z.record(z.string(), z.strictObject({
        active: z.number().int().nonnegative(),
        outcome_unknown: z.number().int().nonnegative(),
        cancel_requested: z.number().int().nonnegative(),
        teardown_pending: z.number().int().nonnegative(),
        torn_down: z.number().int().nonnegative(),
        abandoned: z.number().int().nonnegative(),
    })),
    measurements_by_adapter: z.record(z.string(), z.array(EnvironmentMeasurementSummarySchema)),
    cost_by_adapter: z.record(z.string(), z.record(z.string(), z.number().nonnegative())),
});
/** Published tool requirements plus operator preference, never model input. */
export const EnvironmentResolutionRequestSchema = z.strictObject({
    operation_class: z.enum(OPERATION_CLASSES).refine((value) => value !== 'effect-proposal', 'effect proposals do not resolve through environments'),
    acceptable_backends: z.array(z.enum(ENVIRONMENT_BACKENDS)).min(1),
    acceptable_isolations: z.array(z.enum(ENVIRONMENT_ISOLATIONS)).min(1),
    minimum_limits: z.strictObject({
        cpu_millis: z.number().int().nonnegative(),
        memory_mib: z.number().int().nonnegative(),
        disk_mib: z.number().int().nonnegative(),
        gpu_count: z.number().int().nonnegative(),
        wall_time_ms: z.number().int().nonnegative(),
        process_count: z.number().int().nonnegative(),
        output_bytes: z.number().int().nonnegative(),
    }),
    required_destinations: z.array(z.string().url()),
    region: z.string().min(1).nullable(),
    classification: z.string().min(1),
    preference_order: z.array(hash).min(1),
    pinned_profile_ref: hash.nullable(),
});
export const EnvironmentResolutionResultSchema = z.strictObject({
    profile: EnvironmentProfileSchema,
    considered_profile_refs: z.array(hash),
});
