/**
 * Conditional environment deployment and acceptance contracts.
 *
 * What this is: the public, non-secret account of whether an adapter exists,
 * is installed, is configured, passed its host checks, is admitted, and can
 * be selected. It also defines the retained real-host acceptance record.
 *
 * How it fits: hosted composition compiles these states before serving work,
 * while the native API and generated client expose the same facts to operators.
 */
import { z } from 'zod';
import { contentHash } from "./ids.js";
import { refuse } from "./diagnostics.js";
import { EnvironmentAdapterDescriptorSchema, EnvironmentBackendSchema, EnvironmentProfileSchema } from "./environment.js";
import { CONDITIONAL_ENVIRONMENT_BACKENDS, ENVIRONMENT_ACCEPTANCE_STATES, ENVIRONMENT_PRODUCT_STATES, } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const sourceRevision = z.string().regex(/^[0-9a-f]{40,64}$/, 'expected an exact hexadecimal source revision');
export const EnvironmentPrerequisiteObservationSchema = z.strictObject({
    name: z.string().min(1).max(200),
    version: z.string().min(1).max(200),
    ready: z.boolean(),
    detail: z.string().min(1).max(2_000),
});
export const EnvironmentHostObservationSchema = z.strictObject({
    host_class: z.string().min(1).max(200),
    host_identity_ref: hash,
    prerequisites: z.array(EnvironmentPrerequisiteObservationSchema).min(1).max(64),
});
export const EnvironmentAcceptanceLifecycleSchema = z.strictObject({
    prepare: z.boolean(),
    submit: z.boolean(),
    workload_identity: z.boolean(),
    observe: z.boolean(),
    cancel: z.boolean(),
    reconcile: z.boolean(),
    collect: z.boolean(),
    teardown: z.boolean(),
    capacity_release: z.boolean(),
});
const acceptanceReportBodySchema = z.strictObject({
    format: z.literal('zero-ar-environment-acceptance/1'),
    vector_id: z.string().regex(/^ENV-CV-\d{3}$/, 'expected an ENV-CV vector id'),
    source_commit: sourceRevision,
    backend: EnvironmentBackendSchema,
    adapter: EnvironmentAdapterDescriptorSchema,
    profile_ref: hash,
    configuration_ref: hash,
    host: EnvironmentHostObservationSchema,
    workload_identity_ref: hash,
    lifecycle: EnvironmentAcceptanceLifecycleSchema,
    started_at: z.string().datetime(),
    finished_at: z.string().datetime(),
    omissions: z.array(z.string().min(1).max(2_000)).max(128),
});
function checkAcceptanceBody(body, context) {
    if (body.adapter.backend !== body.backend) {
        context.addIssue({ code: 'custom', path: ['adapter', 'backend'], message: 'the adapter backend must match the acceptance backend.' });
    }
    if (Date.parse(body.finished_at) < Date.parse(body.started_at)) {
        context.addIssue({ code: 'custom', path: ['finished_at'], message: 'the acceptance finish must not precede its start.' });
    }
}
export const EnvironmentAcceptanceReportBodySchema = acceptanceReportBodySchema.superRefine(checkAcceptanceBody);
export const EnvironmentAcceptanceReportSchema = acceptanceReportBodySchema.extend({ report_ref: hash }).superRefine(checkAcceptanceBody);
export const EnvironmentDeploymentCapabilitySchema = z.strictObject({
    backend: EnvironmentBackendSchema,
    package: z.string().min(1).max(200),
    adapter_name: z.string().min(1).max(200).nullable(),
    adapter_version: z.string().min(1).max(200).nullable(),
    adapter_digest: hash.nullable(),
    profile_ref: hash.nullable(),
    product_state: z.enum(ENVIRONMENT_PRODUCT_STATES),
    implemented: z.boolean(),
    installed: z.boolean(),
    configured: z.boolean(),
    healthy: z.boolean(),
    admitted: z.boolean(),
    selectable: z.boolean(),
    acceptance_state: z.enum(ENVIRONMENT_ACCEPTANCE_STATES),
    acceptance_report_ref: hash.nullable(),
    diagnostic_code: z.string().min(1).max(200).nullable(),
    detail: z.string().min(1).max(2_000),
    corrective_action: z.string().min(1).max(2_000),
}).superRefine((state, context) => {
    const ordered = [state.implemented, state.installed, state.configured, state.healthy, state.admitted, state.selectable];
    const orderedNames = ['implemented', 'installed', 'configured', 'healthy', 'admitted', 'selectable'];
    for (let index = 1; index < ordered.length; index += 1) {
        if (ordered[index] && !ordered[index - 1]) {
            context.addIssue({ code: 'custom', path: [orderedNames[index]], message: 'a later deployment state cannot hold before the preceding state.' });
        }
    }
    if (state.product_state === 'conditional-supported' && state.selectable && state.acceptance_state !== 'current') {
        context.addIssue({ code: 'custom', path: ['acceptance_state'], message: 'a selectable conditional adapter requires current real-host acceptance.' });
    }
    if (state.acceptance_state === 'current' && state.acceptance_report_ref === null) {
        context.addIssue({ code: 'custom', path: ['acceptance_report_ref'], message: 'current acceptance requires a retained report reference.' });
    }
});
export const EnvironmentDeploymentCapabilityListSchema = z.strictObject({
    capabilities: z.array(EnvironmentDeploymentCapabilitySchema),
});
export function compileEnvironmentAcceptanceReport(input) {
    const body = EnvironmentAcceptanceReportBodySchema.parse(input);
    return EnvironmentAcceptanceReportSchema.parse({ ...body, report_ref: contentHash(body) });
}
export function environmentAcceptanceReportHasValidRef(input) {
    const parsed = EnvironmentAcceptanceReportSchema.safeParse(input);
    if (!parsed.success)
        return false;
    const { report_ref, ...body } = parsed.data;
    return report_ref === contentHash(EnvironmentAcceptanceReportBodySchema.parse(body));
}
export function assertCurrentEnvironmentAcceptance(input) {
    const report = EnvironmentAcceptanceReportSchema.parse(input.report);
    const incomplete = Object.entries(report.lifecycle).filter(([, passed]) => !passed).map(([operation]) => operation);
    const mismatches = [
        !environmentAcceptanceReportHasValidRef(report) ? 'report identity' : null,
        report.source_commit !== input.source_commit ? 'source commit' : null,
        report.backend !== input.backend ? 'backend' : null,
        report.adapter.name !== input.adapter_name ? 'adapter name' : null,
        report.adapter.version !== input.adapter_version ? 'adapter version' : null,
        report.adapter.adapter_digest !== input.adapter_digest ? 'adapter digest' : null,
        report.profile_ref !== input.profile_ref ? 'profile' : null,
        report.configuration_ref !== input.configuration_ref ? 'configuration' : null,
        report.host.host_identity_ref !== input.host_identity_ref ? 'host identity' : null,
        incomplete.length > 0 ? `lifecycle checks ${incomplete.join(', ')}` : null,
    ].filter((value) => value !== null);
    if (mismatches.length > 0) {
        refuse({
            code: 'environment.acceptance.mismatch',
            message: `the conditional environment acceptance differs at ${mismatches.join(', ')}. Run the matching real-host vector again and retain its exact report.`,
            clause: 'ENV-043',
        });
    }
    const age = input.now.getTime() - Date.parse(report.finished_at);
    if (!Number.isFinite(age) || age < 0 || age > input.max_age_ms) {
        refuse({
            code: 'environment.acceptance.expired',
            message: `the conditional environment acceptance is ${Number.isFinite(age) ? Math.max(0, age) : 'an unknown number of'} milliseconds old against a ${input.max_age_ms} millisecond limit. Rerun the real-host vector on the configured host.`,
            clause: 'ENV-043',
        });
    }
    return report;
}
