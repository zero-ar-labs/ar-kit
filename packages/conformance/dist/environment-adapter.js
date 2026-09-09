/**
 * Reusable EnvironmentAdapter lifecycle conformance harness.
 *
 * Junior developers pass an adapter, its immutable profile, and one admitted
 * binding. The harness drives generated request and result types through every
 * operation, checks idempotent stable handles, and returns a small report. It
 * is a function rather than a base class, so provider packages keep their own
 * composition and test framework.
 */
import { AbandonEnvironmentResultSchema, CancelEnvironmentJobResultSchema, CollectEnvironmentArtifactResultSchema, ENVIRONMENT_LIFECYCLE_OPERATIONS, EnvironmentAdapterDescriptorSchema, ObserveEnvironmentJobResultSchema, PrepareEnvironmentResultSchema, ReconcileEnvironmentJobResultSchema, SubmitEnvironmentJobResultSchema, TeardownEnvironmentResultSchema, makeId, } from '@zero-ar/contracts';
export async function runEnvironmentAdapterConformance(input) {
    const descriptor = EnvironmentAdapterDescriptorSchema.parse(await input.adapter.descriptor());
    requireConformance(descriptor.adapter_digest === input.profile.adapter.adapter_digest, 'the adapter digest differs from the immutable profile');
    requireConformance(input.binding.adapter_digest === descriptor.adapter_digest, 'the admitted binding names another adapter digest');
    requireConformance(input.binding.profile_ref === input.profile.profile_ref, 'the admitted binding names another profile');
    for (const operation of ENVIRONMENT_LIFECYCLE_OPERATIONS) {
        requireConformance(descriptor.operations.includes(operation), `the descriptor omits ${operation}`);
    }
    const prepareKey = `conformance-prepare-${input.binding.run_id}`;
    const prepareRequestId = makeId('ctl');
    const prepared = PrepareEnvironmentResultSchema.parse(await input.adapter.prepare({
        request_id: prepareRequestId, binding: input.binding, idempotency_key: prepareKey, profile: input.profile,
    }));
    requireConformance(prepared.environment !== null && prepared.status === 'ready', 'prepare did not return a ready environment');
    const duplicatePrepare = PrepareEnvironmentResultSchema.parse(await input.adapter.prepare({
        request_id: prepareRequestId, binding: input.binding, idempotency_key: prepareKey, profile: input.profile,
    }));
    requireConformance(duplicatePrepare.environment?.environment_id === prepared.environment.environment_id, 'repeated prepare changed the stable environment handle');
    const submission = {
        binding: input.binding,
        idempotency_key: `conformance-submit-${input.binding.run_id}`,
        environment: prepared.environment,
        argv: input.argv ?? ['/usr/bin/env'],
        working_directory: input.working_directory ?? input.profile.mounts[0]?.target ?? '/workspace',
        environment_variables: {},
        operation_input: null,
        outputs: input.profile.outputs,
    };
    const submitRequestId = makeId('ctl');
    const submitted = SubmitEnvironmentJobResultSchema.parse(await input.adapter.submit({ request_id: submitRequestId, ...submission }));
    requireConformance(submitted.job !== null, 'submit returned no stable job handle');
    const duplicateSubmit = SubmitEnvironmentJobResultSchema.parse(await input.adapter.submit({ request_id: submitRequestId, ...submission }));
    requireConformance(duplicateSubmit.job?.job_id === submitted.job.job_id, 'repeated submit changed the stable job handle');
    let job = submitted.job;
    let observations = 0;
    const maximum = input.maximum_observations ?? 16;
    while (job.status !== 'collectible' && observations < maximum) {
        const observed = ObserveEnvironmentJobResultSchema.parse(await input.adapter.observe({
            request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: prepared.environment, job,
        }));
        job = observed.job;
        observations += 1;
        requireConformance(job.status !== 'failed' && job.status !== 'outcome-unknown', `observation reached ${job.status}`);
    }
    requireConformance(job.status === 'collectible', `the job did not become collectible inside ${maximum} observations`);
    const reconciled = ReconcileEnvironmentJobResultSchema.parse(await input.adapter.reconcile({
        request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: prepared.environment,
        job, original_request_id: submitted.request_id, original_idempotency_key: submission.idempotency_key,
    }));
    requireConformance(reconciled.job?.job_id === job.job_id, 'reconciliation did not return the original stable job');
    const collectedArtifactRefs = [];
    for (const output of input.profile.outputs.filter((candidate) => candidate.required)) {
        const collected = CollectEnvironmentArtifactResultSchema.parse(await input.adapter.collect({
            request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: prepared.environment, job,
            source_path: output.path, expected_hash: null, expected_bytes: null, max_bytes: output.max_bytes,
            classification: output.classification, artifact_destination_ref: input.artifact_destination_ref ?? 'artifact://environment-conformance',
        }));
        requireConformance(collected.status === 'collected' && collected.artifact !== null, `required output ${output.path} was not collected`);
        collectedArtifactRefs.push(collected.artifact.artifact_ref);
    }
    const cancelled = CancelEnvironmentJobResultSchema.parse(await input.adapter.cancel({
        request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: prepared.environment,
        job, reason: 'the common conformance lifecycle has collected its declared outputs',
    }));
    requireConformance(cancelled.status === 'cancelled' && cancelled.cannot_continue, 'cancellation did not prove the job cannot continue');
    const tornDown = TeardownEnvironmentResultSchema.parse(await input.adapter.teardown({
        request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: prepared.environment,
        reason: 'the common conformance lifecycle is complete',
    }));
    requireConformance(tornDown.status === 'torn-down', 'teardown did not confirm resource removal');
    const abandonmentFixture = PrepareEnvironmentResultSchema.parse(await input.adapter.prepare({
        request_id: makeId('ctl'), binding: input.binding,
        idempotency_key: `conformance-abandon-${input.binding.run_id}`, profile: input.profile,
    }));
    requireConformance(abandonmentFixture.environment !== null, 'the abandonment fixture did not prepare an environment');
    const abandoned = AbandonEnvironmentResultSchema.parse(await input.adapter.abandon({
        request_id: makeId('ctl'), binding: input.binding, idempotency_key: makeId('ctl'), environment: abandonmentFixture.environment,
        job: null, actor: 'operator:environment-conformance', reason: 'the harness proves the explicit abandonment answer shape',
        known_cost: {}, remaining_uncertainty: ['provider audit records may follow the declared retention policy'],
        affected_artifacts: [], blocks_verified_completion: false,
    }));
    requireConformance(abandoned.status === 'abandoned', 'abandonment did not return its explicit terminal disposition');
    return {
        adapter_digest: descriptor.adapter_digest,
        environment_id: prepared.environment.environment_id,
        job_id: job.job_id,
        observation_count: observations,
        collected_artifact_refs: collectedArtifactRefs,
        operations: [...ENVIRONMENT_LIFECYCLE_OPERATIONS],
    };
}
function requireConformance(condition, problem) {
    if (!condition)
        throw new Error(`environment adapter conformance failed because ${problem}. Repair the adapter or its immutable profile before publication.`);
}
