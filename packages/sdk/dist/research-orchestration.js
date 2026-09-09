/**
 * Research orchestration runs authored attempts and graph nodes.
 *
 * What this is: an SDK layer over the public runtime client. It creates
 * independent runs, observes durable records, scores attempts with an
 * external check, merges structured research artifacts, and submits one
 * final disposition run after blocking gaps are resolved.
 *
 * How it fits: the kernel still owns each run. This file never appends
 * records or reads projections directly.
 */
import { contentHash, makeId, refuse } from '@zero-ar/contracts';
const GRAPH_NAME = /^[a-z][a-z0-9-]*$/;
const NODE_ARTIFACT = /\{\{nodes\.([a-z][a-z0-9-]*)\.artifact\}\}/g;
const PROMOTED_ARTIFACT = /\{\{promoted_attempt\.artifact\}\}/g;
const DEFAULT_ATTEMPT_BUDGETS = {
    consumption: { model_tokens: 40_000 },
    attention: 0,
    verification_reserve_fraction: 0.2,
    max_turns: 4,
};
const DEFAULT_NODE_BUDGETS = {
    consumption: { model_tokens: 60_000 },
    attention: 1,
    verification_reserve_fraction: 0.2,
    max_turns: 6,
};
const DEFAULT_DISPOSITION_BUDGETS = {
    consumption: { model_tokens: 60_000, tool_calls: 2 },
    attention: 0,
    verification_reserve_fraction: 0.2,
    max_turns: 4,
};
export function defineResearchOrchestration(plan) {
    if (plan.attempts.length === 0) {
        refuse({ code: 'orchestration.attempts.empty', message: `research orchestration ${plan.name} declares no attempts.` });
    }
    if (plan.graph.length === 0) {
        refuse({ code: 'orchestration.graph.empty', message: `research orchestration ${plan.name} declares no graph nodes.` });
    }
    const attemptNames = new Set();
    for (const attempt of plan.attempts) {
        checkName('attempt', attempt.name);
        if (attemptNames.has(attempt.name)) {
            refuse({ code: 'orchestration.attempt.duplicate', message: `attempt ${attempt.name} is declared twice, so promotion would be ambiguous.` });
        }
        attemptNames.add(attempt.name);
    }
    const seenNodes = new Set();
    for (const node of plan.graph) {
        checkName('node', node.name);
        if (seenNodes.has(node.name)) {
            refuse({ code: 'orchestration.node.duplicate', message: `node ${node.name} is declared twice, so reattachment would be ambiguous.` });
        }
        for (const parent of node.after ?? []) {
            if (!seenNodes.has(parent)) {
                refuse({ code: 'orchestration.node.forward-reference', message: `node ${node.name} waits on ${parent}, which is not an earlier authored node.` });
            }
        }
        for (const match of node.objective.matchAll(NODE_ARTIFACT)) {
            if (!seenNodes.has(match[1])) {
                refuse({ code: 'orchestration.node.artifact-reference', message: `node ${node.name} cites ${match[0]}, but only earlier node artifacts can be cited.` });
            }
        }
        seenNodes.add(node.name);
    }
    const body = { kind: 'research-orchestration', ...plan };
    return Object.freeze({ ...body, hash: contentHash(body) });
}
export async function runResearchOrchestration(client, plan, options) {
    if (options.acceptance.ref !== plan.acceptance.check_ref) {
        refuse({
            code: 'orchestration.acceptance.check-mismatch',
            message: `plan ${plan.name} requires acceptance check ${plan.acceptance.check_ref}, but ${options.acceptance.ref} arrived.`,
        });
    }
    if (options.resume_state && options.resume_state.plan_ref !== plan.hash) {
        refuse({
            code: 'orchestration.resume.plan-mismatch',
            message: `resume state belongs to ${options.resume_state.plan_ref}, not ${plan.hash}. Reattach only to the authored graph that created the state.`,
        });
    }
    const attemptRuns = new Map((options.resume_state?.attempts ?? []).map((run) => [run.name, run]));
    const nodeRuns = new Map((options.resume_state?.nodes ?? []).map((run) => [run.name, run]));
    const resolved = options.resolved_gaps ?? [];
    const resolvedIds = new Set(resolved.map((gap) => gap.gap_id));
    const attempts = await Promise.all(plan.attempts.map(async (attempt) => {
        const settled = await settleRun(client, {
            name: attempt.name,
            objective: attempt.objective,
            principals: options.principals,
            budgets: attempt.budgets ?? DEFAULT_ATTEMPT_BUDGETS,
            existing: attemptRuns.get(attempt.name) ?? null,
            controls: [],
        });
        if (!settled.summary.reserved_before_spend) {
            refuse({ code: 'orchestration.attempt.unreserved', message: `attempt ${attempt.name} reached model spend before a visible work lease.` });
        }
        if (settled.summary.effect_records > 0) {
            refuse({ code: 'orchestration.attempt.effect', message: `attempt ${attempt.name} recorded effect work. Attempts are pure proposals and cannot mutate outside systems.` });
        }
        const score = await options.acceptance.score({ attempt, result: settled.result, records: settled.records });
        const accepted = score.accepted && score.score >= plan.acceptance.minimum_score;
        return {
            ...settled.summary,
            score: score.score,
            accepted,
            scored_by: options.acceptance.ref,
            score_reason: score.reason,
        };
    }));
    const promoted = selectPromotedAttempt(attempts);
    const nodeArtifacts = new Map();
    const nodes = [];
    const nodePayloads = [];
    for (const node of plan.graph) {
        const objective = materializeNodeObjective(node, promoted, nodeArtifacts);
        const settled = await settleRun(client, {
            name: node.name,
            objective,
            principals: options.principals,
            budgets: node.budgets ?? DEFAULT_NODE_BUDGETS,
            existing: nodeRuns.get(node.name) ?? null,
            controls: node.control_answers ?? [],
        });
        nodes.push(settled.summary);
        if (settled.summary.artifact_text) {
            nodeArtifacts.set(node.name, settled.summary.artifact_text);
            nodePayloads.push({ node: node.name, artifact: parseResearchNodeArtifact(node.name, settled.summary.artifact_text) });
        }
        else {
            nodePayloads.push({
                node: node.name,
                artifact: {
                    schema: 'decomposed-research-node/1',
                    assertions: [],
                    gaps: [{ gap_id: `${node.name}-artifact-missing`, description: `node ${node.name} finished without a structured artifact`, blocking: true }],
                },
            });
        }
    }
    const merge = mergeResearchPayloads(nodePayloads, resolved);
    const openGaps = merge.blocking_gaps.filter((gap) => !resolvedIds.has(gap.gap_id));
    const baseResumeState = {
        plan_ref: plan.hash,
        attempts: attempts.map((attempt) => ({ name: attempt.name, run_id: attempt.run_id, sequence_cursor: attempt.sequence_cursor })),
        nodes: nodes.map((node) => ({ name: node.name, run_id: node.run_id, sequence_cursor: node.sequence_cursor })),
        disposition: options.resume_state?.disposition ?? null,
    };
    if (openGaps.length > 0) {
        return {
            plan_ref: plan.hash,
            attempts,
            promoted_attempt: promoted,
            nodes,
            merge,
            disposition: null,
            halted: { reason: 'blocking research gaps remain open', gaps: openGaps.map((gap) => gap.gap_id) },
            resume_state: baseResumeState,
        };
    }
    const dispositionObjective = plan.disposition.objective
        .replace(PROMOTED_ARTIFACT, promoted.artifact_text ?? '')
        .replace('{{research.merge}}', JSON.stringify({ assertions: merge.assertions, conflicts: merge.conflicts, gaps: merge.gaps, resolved_gaps: merge.resolved_gaps }));
    const disposition = await settleRun(client, {
        name: 'disposition',
        objective: dispositionObjective,
        principals: options.principals,
        budgets: plan.disposition.budgets ?? DEFAULT_DISPOSITION_BUDGETS,
        existing: options.resume_state?.disposition ? { name: 'disposition', ...options.resume_state.disposition } : null,
        controls: [],
    });
    const requiredEffects = plan.disposition.required_effects ?? 1;
    if (disposition.summary.effect_dispositions !== requiredEffects) {
        refuse({
            code: 'orchestration.disposition.effect-count',
            message: `the checked disposition recorded ${disposition.summary.effect_dispositions} effect dispositions, but the plan requires ${requiredEffects}.`,
        });
    }
    return {
        plan_ref: plan.hash,
        attempts,
        promoted_attempt: promoted,
        nodes,
        merge,
        disposition: disposition.summary,
        halted: null,
        resume_state: { ...baseResumeState, disposition: { run_id: disposition.summary.run_id, sequence_cursor: disposition.summary.sequence_cursor } },
    };
}
function checkName(kind, name) {
    if (!GRAPH_NAME.test(name)) {
        refuse({ code: `orchestration.${kind}.name`, message: `${kind} name ${name} does not fit lowercase slug naming.`, fix: 'use a name like source-map' });
    }
}
function selectPromotedAttempt(attempts) {
    const accepted = attempts.filter((attempt) => attempt.accepted).sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name));
    if (accepted.length === 0) {
        refuse({ code: 'orchestration.acceptance.none', message: 'no attempt passed the external acceptance check, so nothing can promote.' });
    }
    if (accepted.length > 1 && accepted[0]?.score === accepted[1]?.score) {
        refuse({ code: 'orchestration.acceptance.tie', message: 'the external acceptance check produced a tie, so promotion would be arbitrary.' });
    }
    return accepted[0];
}
function materializeNodeObjective(node, promoted, nodeArtifacts) {
    return node.objective
        .replace(PROMOTED_ARTIFACT, promoted.artifact_text ?? '')
        .replace(NODE_ARTIFACT, (whole, name) => {
        const artifact = nodeArtifacts.get(name);
        if (artifact === undefined) {
            refuse({ code: 'orchestration.node.artifact-missing', message: `node ${node.name} cites ${whole}, but ${name} produced no artifact.` });
        }
        return artifact;
    });
}
async function settleRun(client, input) {
    const created = input.existing
        ? { run_id: input.existing.run_id }
        : await client.createRun({
            objective: input.objective,
            principals: input.principals,
            budgets: input.budgets,
            idempotency_key: makeId('ctl'),
        });
    const reattachedFrom = input.existing?.sequence_cursor ?? null;
    const observed = [];
    if (input.existing) {
        observed.push(...(await client.records(created.run_id, input.existing.sequence_cursor)).records);
    }
    else {
        const abort = new AbortController();
        await client.streamRecords(created.run_id, 0, (event) => observed.push(observationEventRecord(event)), abort.signal);
    }
    let result = await client.result(created.run_id);
    let controlsApplied = 0;
    if (result.status === 'suspended' && input.controls.length > 0) {
        for (const answer of input.controls) {
            const control = {
                verb: 'answer',
                control_id: makeId('ctl'),
                handle: answer.handle,
                ...(answer.text ? { text: answer.text } : {}),
                ...(answer.reason ? { reason: answer.reason } : {}),
            };
            await client.control(created.run_id, control);
            controlsApplied += 1;
        }
        await client.resume(created.run_id, {
            idempotency_key: contentHash({ run_id: created.run_id, controls: input.controls }),
            reason: 'resume after the declared research controls',
        });
        const abort = new AbortController();
        await client.streamRecords(created.run_id, input.existing?.sequence_cursor ?? latestSeq(observed), (event) => observed.push(observationEventRecord(event)), abort.signal);
        result = await client.result(created.run_id);
    }
    const allRecords = (await client.records(created.run_id, 0)).records;
    const cursor = latestSeq(allRecords);
    const effectRecords = allRecords.filter((record) => record.type.startsWith('effect.')).length;
    const effectDispositions = allRecords.filter((record) => record.type === 'effect.resolved' || record.type === 'effect.unreconcilable').length;
    return {
        records: allRecords,
        result,
        summary: {
            name: input.name,
            run_id: created.run_id,
            terminal: result.terminal,
            verdict: result.verdict,
            artifact_entry: result.artifact?.entry_id ?? null,
            artifact_text: result.artifact?.text ?? null,
            sequence_cursor: cursor,
            reserved_before_spend: reservedBeforeSpend(allRecords),
            effect_records: effectRecords,
            effect_dispositions: effectDispositions,
            controls_applied: controlsApplied,
            reattached_from_seq: reattachedFrom,
        },
    };
}
function parseResearchNodeArtifact(node, text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return {
            schema: 'decomposed-research-node/1',
            assertions: [],
            gaps: [{ gap_id: `${node}-artifact-prose`, description: `node ${node} returned prose instead of decomposed-research-node/1 JSON`, blocking: true }],
        };
    }
    const body = parsed;
    if (body.schema !== 'decomposed-research-node/1') {
        return {
            schema: 'decomposed-research-node/1',
            assertions: [],
            gaps: [{ gap_id: `${node}-artifact-schema`, description: `node ${node} returned a research artifact with the wrong schema`, blocking: true }],
        };
    }
    return {
        schema: 'decomposed-research-node/1',
        assertions: Array.isArray(body.assertions) ? body.assertions.map((assertion, index) => parseAssertion(node, assertion, index)) : [],
        gaps: Array.isArray(body.gaps) ? body.gaps.map((gap, index) => parseGap(node, gap, index)) : [],
    };
}
function parseAssertion(node, value, index) {
    const assertion = value;
    if (typeof assertion.subject !== 'string' ||
        typeof assertion.predicate !== 'string' ||
        typeof assertion.object !== 'string' ||
        !Array.isArray(assertion.citations)) {
        refuse({ code: 'orchestration.assertion.invalid', message: `node ${node} assertion ${index} is not a structured assertion.` });
    }
    return {
        subject: assertion.subject,
        predicate: assertion.predicate,
        object: assertion.object,
        citations: assertion.citations,
    };
}
function parseGap(node, value, index) {
    const gap = value;
    if (typeof gap.gap_id !== 'string' || typeof gap.description !== 'string' || typeof gap.blocking !== 'boolean') {
        refuse({ code: 'orchestration.gap.invalid', message: `node ${node} gap ${index} is not a structured gap.` });
    }
    return { gap_id: gap.gap_id, description: gap.description, blocking: gap.blocking };
}
function mergeResearchPayloads(payloads, resolved) {
    const assertions = new Map();
    const evidence = new Map();
    const gaps = new Map();
    for (const payload of payloads) {
        for (const assertion of payload.artifact.assertions) {
            const assertion_id = contentHash({ subject: assertion.subject, predicate: assertion.predicate, object: assertion.object, citations: assertion.citations });
            assertions.set(assertion_id, { ...assertion, assertion_id, writer: payload.node });
            for (const citation of assertion.citations)
                evidence.set(citationKey(citation), citation);
        }
        for (const gap of payload.artifact.gaps)
            gaps.set(gap.gap_id, gap);
    }
    const conflicts = [];
    const bySlot = new Map();
    for (const assertion of assertions.values()) {
        const slot = `${assertion.subject}\u0000${assertion.predicate}`;
        bySlot.set(slot, [...(bySlot.get(slot) ?? []), assertion]);
    }
    for (const grouped of bySlot.values()) {
        const objects = [...new Set(grouped.map((assertion) => assertion.object))].sort();
        if (objects.length <= 1)
            continue;
        const first = grouped[0];
        conflicts.push({
            conflict_id: contentHash({ subject: first.subject, predicate: first.predicate, objects }),
            subject: first.subject,
            predicate: first.predicate,
            objects,
            assertion_ids: grouped.map((assertion) => assertion.assertion_id).sort(),
        });
    }
    const resolvedIds = new Set(resolved.map((gap) => gap.gap_id));
    const allGaps = [...gaps.values()].sort((a, b) => a.gap_id.localeCompare(b.gap_id));
    return {
        assertions: [...assertions.values()].sort((a, b) => a.assertion_id.localeCompare(b.assertion_id)),
        unique_evidence: [...evidence.values()].sort((a, b) => citationKey(a).localeCompare(citationKey(b))),
        conflicts: conflicts.sort((a, b) => a.conflict_id.localeCompare(b.conflict_id)),
        gaps: allGaps,
        blocking_gaps: allGaps.filter((gap) => gap.blocking && !resolvedIds.has(gap.gap_id)),
        resolved_gaps: resolved,
    };
}
function reservedBeforeSpend(records) {
    const started = records.find((record) => record.type === 'model.call.started');
    if (!started)
        return false;
    const leaseId = String(started.payload['lease_id'] ?? '');
    return records.some((record) => record.type === 'lease.reserved' &&
        record.payload['lease_id'] === leaseId &&
        seqOf(record) < seqOf(started));
}
function latestSeq(records) {
    return records.reduce((max, record) => Math.max(max, seqOf(record)), 0);
}
function seqOf(record) {
    return Number(record.seq ?? 0);
}
function citationKey(citation) {
    return `${citation.source_id}\u0000${citation.span_hash}`;
}
function observationEventRecord(event) {
    return { ...event, type: event.event };
}
