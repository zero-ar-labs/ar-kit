/**
 * Authored orchestration (M7): a declared multi-run plan executed above
 * the runtime through the public client alone.
 *
 * What this is: defineOrchestration seals a named sequence of run steps
 * into an immutable, content-addressed plan, and runOrchestration walks
 * it, one real run per step, handing each step the artifacts of the
 * steps before it. The orchestrator holds no runtime authority: every
 * run is created, observed, and read through the generated client, and
 * a step that does not reach verified complete halts the plan when the
 * plan says so, with the step and reason named.
 *
 * What this deliberately is not: a workflow engine inside the kernel.
 * The runtime keeps one loop per run; sequencing lives up here, in
 * authored configuration, where a person can read it.
 */
import { contentHash, refuse } from '@zero-ar/contracts';
import { makeId } from '@zero-ar/contracts';
const STEP_NAME = /^[a-z][a-z0-9-]*$/;
const REFERENCE = /\{\{steps\.([a-z][a-z0-9-]*)\.artifact\}\}/g;
export function defineOrchestration(plan) {
    if (plan.steps.length === 0) {
        refuse({ code: 'orchestration.empty', message: `plan ${plan.name} declares no steps, so there is nothing to run.` });
    }
    const seen = new Set();
    for (const step of plan.steps) {
        if (!STEP_NAME.test(step.name)) {
            refuse({ code: 'orchestration.step.name', message: `step name ${step.name} does not fit lowercase slug naming.`, fix: 'a name like draft or review-sources' });
        }
        if (seen.has(step.name)) {
            refuse({ code: 'orchestration.step.duplicate', message: `step ${step.name} is declared twice, and a reference to it would be ambiguous.` });
        }
        for (const match of step.objective.matchAll(REFERENCE)) {
            if (!seen.has(match[1])) {
                refuse({
                    code: 'orchestration.reference.unresolved',
                    message: `step ${step.name} cites {{steps.${match[1]}.artifact}}, which no earlier step produces. Steps hand artifacts forward, never backward.`,
                });
            }
        }
        seen.add(step.name);
    }
    const body = { kind: 'orchestration', ...plan };
    return Object.freeze({ ...body, hash: contentHash(body) });
}
const DEFAULT_BUDGETS = { consumption: { model_tokens: 50_000 }, attention: 0, verification_reserve_fraction: 0.2, max_turns: 8 };
/**
 * Walk the plan: one real run per step, artifacts handed forward, every
 * observation through the public client. A cited step that produced no
 * artifact refuses before any model is called for the citing step.
 */
export async function runOrchestration(client, plan, options) {
    const artifacts = new Map();
    const outcome = { plan_ref: plan.hash, steps: [], halted: null };
    for (const step of plan.steps) {
        const objective = step.objective.replace(REFERENCE, (whole, cited) => {
            const artifact = artifacts.get(cited);
            if (artifact === undefined) {
                refuse({
                    code: 'orchestration.artifact.missing',
                    message: `step ${step.name} cites ${whole}, and step ${cited} finished without an artifact. Nothing is invented to fill the hole; the plan halts here.`,
                });
            }
            return artifact;
        });
        const created = await client.createRun({
            objective,
            principals: options.principals,
            budgets: step.budgets ?? DEFAULT_BUDGETS,
            idempotency_key: makeId('ctl'),
        });
        const abort = new AbortController();
        await client.streamRecords(created.run_id, 0, () => undefined, abort.signal);
        const result = await client.result(created.run_id);
        outcome.steps.push({
            name: step.name,
            run_id: created.run_id,
            terminal: result.terminal,
            verdict: result.verdict,
            artifact_entry: result.artifact?.entry_id ?? null,
        });
        if (result.artifact)
            artifacts.set(step.name, result.artifact.text);
        if (plan.on_unverified === 'stop' && result.terminal !== 'complete') {
            outcome.halted = { step: step.name, reason: `step ${step.name} ended as ${result.terminal ?? 'unfinished'}, and this plan does not build on unverified work` };
            break;
        }
    }
    return outcome;
}
