import { VerificationCheckpointInputBodySchema, VerificationCheckpointInputSchema, VerificationAttentionCapacitySnapshotBodySchema, VerificationAttentionCapacitySnapshotSchema, VerificationPlanBodySchema, VerificationPlanInputSchema, VerificationPlanSchema, canonicalJson, contentHash, } from '@zero-ar/contracts';
import { admitAvailabilitySnapshot, admitCatalogueEntry } from "./catalogue.js";
export const ATTENTION_NOT_EVALUATED = 'attention feasibility not evaluated';
export function defineVerificationCheckpointInput(source) {
    const body = VerificationCheckpointInputBodySchema.parse({
        schema: 'verification-checkpoint-input/1',
        ...source,
        phase_schedules: [...source.phase_schedules].sort((left, right) => left.starts_after_items - right.starts_after_items || left.phase.localeCompare(right.phase)),
        mandatory_boundaries: [...new Set(source.mandatory_boundaries)].sort(),
    });
    return VerificationCheckpointInputSchema.parse({ ...body, snapshot_ref: contentHash(body) });
}
export function defineVerificationAttentionCapacitySnapshot(source) {
    const body = VerificationAttentionCapacitySnapshotBodySchema.parse({
        schema: 'verification-attention-capacity-snapshot/1',
        classes: [...source.classes].sort((left, right) => left.name.localeCompare(right.name)),
    });
    return VerificationAttentionCapacitySnapshotSchema.parse({ ...body, snapshot_ref: contentHash(body) });
}
function normalizeInput(input) {
    const parsed = VerificationPlanInputSchema.parse(input);
    return VerificationPlanInputSchema.parse({
        ...parsed,
        catalogue: parsed.catalogue.map(admitCatalogueEntry).sort((left, right) => left.identity.name.localeCompare(right.identity.name)
            || left.identity.version.localeCompare(right.identity.version)
            || left.identity.implementation_ref.localeCompare(right.identity.implementation_ref)),
        availability: admitAvailabilitySnapshot(parsed.availability),
        attention_capacity_snapshot: parsed.attention_capacity_snapshot
            ? {
                ...parsed.attention_capacity_snapshot,
                classes: [...parsed.attention_capacity_snapshot.classes].sort((left, right) => left.name.localeCompare(right.name)),
            }
            : null,
    });
}
function refusal(code, message, fields = {}) {
    return {
        code,
        rule: fields.rule ?? null,
        validator: fields.validator ?? null,
        dependency: fields.dependency ?? null,
        message,
    };
}
function refusalOrder(left, right) {
    return left.code.localeCompare(right.code)
        || (left.rule ?? '').localeCompare(right.rule ?? '')
        || (left.validator ?? '').localeCompare(right.validator ?? '')
        || (left.dependency ?? '').localeCompare(right.dependency ?? '')
        || left.message.localeCompare(right.message);
}
function bindingEntry(catalogue, binding) {
    return catalogue.find((entry) => entry.identity.name === binding.name
        && entry.identity.version === binding.version
        && entry.finding_contract.class === binding.class) ?? null;
}
function availabilityEntry(availability, entry) {
    return availability.entries.find((candidate) => candidate.name === entry.identity.name
        && candidate.version === entry.identity.version
        && candidate.class === entry.finding_contract.class) ?? null;
}
function deferredClass(validatorClass) {
    return validatorClass === 'heuristic' || validatorClass === 'sampled-oracle';
}
export function selectValidatorInvocations(contract, rules) {
    const identities = new Map();
    contract.validators.forEach((binding, position) => {
        const identity = `${binding.name}\u0000${binding.version}\u0000${binding.class}`;
        let indexed = identities.get(identity);
        if (!indexed) {
            indexed = { first: new Map(), sufficient: new Set() };
            identities.set(identity, indexed);
        }
        const covers = new Set(binding.covers);
        for (const rule of covers)
            if (!indexed.first.has(rule))
                indexed.first.set(rule, position);
        for (const rule of binding.sufficient_for)
            if (covers.has(rule))
                indexed.sufficient.add(rule);
    });
    const wanted = new Set(rules);
    const invocations = [];
    for (const indexed of identities.values()) {
        for (const [rule, binding_position] of indexed.first) {
            if (!wanted.has(rule))
                continue;
            const binding = contract.validators[binding_position];
            invocations.push({
                rule,
                binding_position,
                binding,
                sufficient: indexed.sufficient.has(rule),
                deferred: deferredClass(binding.class),
            });
        }
    }
    return invocations.sort((left, right) => Number(left.deferred) - Number(right.deferred)
        || left.rule.localeCompare(right.rule)
        || left.binding_position - right.binding_position);
}
function invocationCost(invocations) {
    return invocations.reduce((sum, invocation) => sum + invocation.binding.cost_wall_ms, 0);
}
export function selectedValidatorCost(contract, rules) {
    return invocationCost(selectValidatorInvocations(contract, rules));
}
function fixedCost(contract, items, interval) {
    const perCheckpoint = selectedValidatorCost(contract, contract.invariants);
    const acceptance = selectedValidatorCost(contract, contract.acceptance_rules);
    const checkpoints = Math.max(1, Math.ceil(items / interval));
    return { perCheckpoint, acceptance, checkpoints, projected: checkpoints * perCheckpoint + acceptance };
}
export function verificationCheckpointInputForContract(contract, items, controlled = null) {
    if (controlled) {
        return defineVerificationCheckpointInput({
            mode: 'controlled',
            interval_items: controlled.interval_items,
            contract_ceiling: controlled.contract_ceiling,
            controller: controlled.controller,
            controller_version: controlled.controller_version,
            controller_inputs_ref: controlled.inputs_hash,
            fallback: { used: controlled.fallback_used, reason: controlled.reason },
            phase_schedules: controlled.phase_schedules,
            mandatory_boundaries: ['task-contract', 'effect-staging', 'completion', 'validator-coverage'],
            projected_checkpoints: controlled.projected_checkpoints,
            projected_cost_ms: controlled.projected_cost_ms,
        });
    }
    const phases = (contract.checkpoint_phase_boundaries ?? []).map((phase) => ({
        phase: phase.phase,
        starts_after_items: phase.starts_after_items,
        interval_items: Math.min(phase.checkpoint_every_items, contract.checkpoint_every_items),
        contract_ceiling: phase.checkpoint_every_items,
        inputs_hash: contentHash({ schema: 'fixed-checkpoint-phase-input/1', phase }),
        recorded_before_position: 0,
    }));
    const projectionInterval = Math.min(contract.checkpoint_every_items, ...phases.map((phase) => phase.interval_items));
    const costs = fixedCost(contract, items, projectionInterval);
    const controllerInputsRef = contentHash({
        schema: 'fixed-checkpoint-controller-input/1',
        checkpoint_every_items: contract.checkpoint_every_items,
        items,
        phases,
    });
    return defineVerificationCheckpointInput({
        mode: 'fixed',
        interval_items: contract.checkpoint_every_items,
        contract_ceiling: contract.checkpoint_every_items,
        controller: 'task-contract-fixed-v1',
        controller_version: '1.0.0',
        controller_inputs_ref: controllerInputsRef,
        fallback: { used: false, reason: 'task contract fixed cadence' },
        phase_schedules: phases,
        mandatory_boundaries: ['task-contract', 'effect-staging', 'completion', 'validator-coverage'],
        projected_checkpoints: costs.checkpoints,
        projected_cost_ms: costs.projected,
    });
}
export function compileVerificationPlan(raw) {
    const input = normalizeInput(raw);
    const inputRef = contentHash(input);
    const refusals = [];
    const contract = input.task_contract;
    if ((contract === null) !== (input.task_contract_ref === null)) {
        refusals.push(refusal('authority-conflict', 'task contract bytes and task contract ref must either both be present or both be absent.'));
    }
    if (contract && input.task_contract_ref !== contentHash(contract)) {
        refusals.push(refusal('authority-conflict', 'the task contract ref does not match the canonical task contract bytes.'));
    }
    if ((input.resolved_manifest === null) !== (input.resolved_manifest_ref === null)) {
        refusals.push(refusal('authority-conflict', 'resolved manifest bytes and ref must either both be present or both be absent.'));
    }
    if (input.resolved_manifest && input.resolved_manifest_ref !== contentHash(input.resolved_manifest)) {
        refusals.push(refusal('authority-conflict', 'the resolved manifest ref does not match the canonical resolved manifest bytes.'));
    }
    if (input.posture && input.posture.ref !== contentHash(input.posture.configuration)) {
        refusals.push(refusal('authority-conflict', 'the posture ref does not match the canonical posture bytes.'));
    }
    if (input.budgets_ref !== contentHash(input.budgets)) {
        refusals.push(refusal('authority-conflict', 'the budget ref does not match the canonical budget bytes.'));
    }
    if (input.checkpoint) {
        const { snapshot_ref, ...checkpointBody } = input.checkpoint;
        if (snapshot_ref !== contentHash(checkpointBody)) {
            refusals.push(refusal('authority-conflict', 'the checkpoint snapshot ref does not match its canonical bytes.'));
        }
    }
    if (input.attention_capacity_snapshot) {
        const { snapshot_ref, ...attentionBody } = input.attention_capacity_snapshot;
        if (snapshot_ref !== contentHash(attentionBody)) {
            refusals.push(refusal('authority-conflict', 'the attention-capacity snapshot ref does not match its canonical bytes.'));
        }
    }
    if (!contract)
        refusals.push(refusal('contract-absent', 'no task contract declares acceptance coverage.'));
    const catalogueKeys = new Map();
    for (const entry of input.catalogue) {
        const key = `${entry.identity.name}\u0000${entry.identity.version}\u0000${entry.finding_contract.class}`;
        catalogueKeys.set(key, [...(catalogueKeys.get(key) ?? []), entry]);
    }
    for (const entries of catalogueKeys.values()) {
        if (entries.length > 1) {
            const first = entries[0];
            refusals.push(refusal('authority-conflict', `multiple catalogue entries assign different execution identity to ${first.identity.name}@${first.identity.version}.`, { validator: first.identity.name }));
        }
    }
    const runtimeBindings = [];
    const bindingEntries = new Map();
    const sampledGuarantees = [];
    for (const [position, binding] of (contract?.validators ?? []).entries()) {
        const entry = bindingEntry(input.catalogue, binding);
        if (!entry) {
            refusals.push(refusal('catalogue-entry-missing', `no catalogue entry matches ${binding.name}@${binding.version} (${binding.class}).`, { validator: binding.name }));
            runtimeBindings.push({
                binding_position: position,
                name: binding.name,
                version: binding.version,
                class: binding.class,
                implementation_ref: null,
                catalogue_entry_ref: null,
                host_boundary: null,
                bundle_ref: null,
                available: false,
                unmet_dependencies: ['catalogue entry missing'],
            });
            continue;
        }
        bindingEntries.set(position, entry);
        const available = availabilityEntry(input.availability, entry);
        const mismatched = available && (available.implementation_ref !== entry.identity.implementation_ref
            || available.catalogue_entry_ref !== entry.catalogue_entry_ref);
        if (mismatched) {
            refusals.push(refusal('catalogue-identity-mismatch', `deployment identity for ${binding.name} differs from the catalogue implementation or entry ref.`, { validator: binding.name }));
        }
        const hostMismatch = available && available.host_protocol !== entry.runtime_needs.host_protocol;
        if (hostMismatch) {
            refusals.push(refusal('host-unavailable', `deployment host protocol ${available.host_protocol} cannot run ${binding.name}, which requires ${entry.runtime_needs.host_protocol}.`, { validator: binding.name, dependency: entry.runtime_needs.host_protocol }));
        }
        const bundleMismatch = available && entry.runtime_needs.bundle_ref !== null && available.bundle_ref !== entry.runtime_needs.bundle_ref;
        if (bundleMismatch) {
            refusals.push(refusal('catalogue-identity-mismatch', `deployment bundle identity for ${binding.name} differs from its exact catalogue bundle ref.`, { validator: binding.name, dependency: 'bundle-ref' }));
        }
        if (!available || !available.available) {
            refusals.push(refusal('validator-unavailable', `${binding.name}@${binding.version} is unavailable at the pinned deployment snapshot.`, { validator: binding.name, dependency: available?.unmet_dependencies[0] ?? 'registered validator' }));
        }
        if (entry.runtime_needs.artifact_reader && available?.artifact_reader_available !== true) {
            refusals.push(refusal('artifact-reader-unavailable', `${binding.name} requires an admitted artifact reader that is absent from the availability snapshot.`, { validator: binding.name, dependency: 'artifact-reader' }));
        }
        if (entry.input_contract.population === 'sampled' || binding.class === 'sampled-oracle') {
            if (entry.input_contract.population !== 'sampled') {
                refusals.push(refusal('sample-frame-unpinned', `${binding.name} is bound as sampled-oracle, and its catalogue entry declares a full population, so it states no sampled frame or guarantee.`, { validator: binding.name, dependency: 'sampling-frame' }));
            }
            if (!entry.runtime_needs.oracle_ref || available?.oracle_ref !== entry.runtime_needs.oracle_ref) {
                refusals.push(refusal('oracle-unavailable', `${binding.name} has no matching pinned domain oracle at this deployment boundary.`, { validator: binding.name, dependency: 'domain-oracle' }));
            }
            const pinnedFrame = entry.runtime_needs.sampling_frame_ref ?? available?.sampling_frame_ref ?? null;
            if (!pinnedFrame || !entry.runtime_needs.sampling_assumption) {
                refusals.push(refusal('sample-frame-unpinned', `${binding.name} lacks a pinned sampling frame or assumption.`, { validator: binding.name, dependency: 'sampling-frame' }));
            }
            if (entry.runtime_needs.sampling_frame_ref && available?.sampling_frame_ref !== entry.runtime_needs.sampling_frame_ref) {
                refusals.push(refusal('sample-frame-unpinned', `${binding.name} deployment sampling frame differs from the configured frame.`, { validator: binding.name, dependency: 'sampling-frame' }));
            }
            const atCheckpoints = (contract?.invariants ?? []).filter((rule) => binding.covers.includes(rule));
            const atCompletion = (contract?.acceptance_rules ?? []).filter((rule) => binding.covers.includes(rule));
            sampledGuarantees.push(`sampled check ${binding.name}@${binding.version} (${binding.class}): oracle ${entry.runtime_needs.oracle_ref ?? 'unpinned'}, ` +
                `admitted population ${pinnedFrame ?? 'unpinned'}, runs at checkpoints for ${atCheckpoints.join(', ') || 'no rule'} ` +
                `and at completion for ${atCompletion.join(', ') || 'no rule'}; each invocation samples only the worked items it is handed ` +
                '(a checkpoint\'s covered items, or every item at completion) and records that frame\'s hash; ' +
                `assumption ${entry.runtime_needs.sampling_assumption ?? 'undeclared'}, ` +
                `at most ${binding.cost_wall_ms} ms per invocation, sufficient for ${binding.sufficient_for.filter((rule) => binding.covers.includes(rule)).join(', ') || 'no rule'}; ` +
                'a capped or drifted sample is indeterminate, never a pass');
        }
        if (entry.finding_contract.class === 'deterministic'
            && input.profile_manifest.profile !== 'local-lite'
            && entry.evidence.repeatability.length === 0) {
            refusals.push(refusal('evidence-missing', `${binding.name} is deterministic but has no repeatability evidence at the ${input.profile_manifest.profile} production boundary.`, { validator: binding.name, dependency: 'repeatability-evidence' }));
        }
        runtimeBindings.push({
            binding_position: position,
            name: binding.name,
            version: binding.version,
            class: binding.class,
            implementation_ref: entry.identity.implementation_ref,
            catalogue_entry_ref: entry.catalogue_entry_ref,
            host_boundary: available?.host_boundary ?? null,
            bundle_ref: available?.bundle_ref ?? null,
            available: Boolean(available?.available && !mismatched && !hostMismatch && !bundleMismatch),
            unmet_dependencies: [...(available?.unmet_dependencies ?? ['availability entry missing'])].sort(),
        });
        if (binding.class === 'heuristic' && binding.sufficient_for.length > 0) {
            refusals.push(refusal('heuristic-sufficiency', `heuristic validator ${binding.name} cannot be sufficient for ${binding.sufficient_for.join(', ')}.`, { validator: binding.name }));
        }
    }
    for (const binding of contract?.validators ?? []) {
        for (const rule of new Set(binding.sufficient_for)) {
            if (binding.covers.includes(rule))
                continue;
            refusals.push(refusal('sufficiency-missing', `${binding.name} is designated sufficient for rule ${rule}, which it does not cover, so it never evaluates that rule and cannot establish it. Add the rule to its covers or remove it from sufficient_for.`, { rule, validator: binding.name }));
        }
    }
    const rules = [];
    const execution = [];
    const declaredStages = contract
        ? [
            { stage: 'invariant', names: contract.invariants },
            { stage: 'acceptance', names: contract.acceptance_rules },
        ]
        : [];
    const sufficientPositionsByRule = new Map();
    (contract?.validators ?? []).forEach((binding, position) => {
        for (const rule of new Set(binding.sufficient_for)) {
            if (!binding.covers.includes(rule))
                continue;
            sufficientPositionsByRule.set(rule, [...(sufficientPositionsByRule.get(rule) ?? []), position]);
        }
    });
    for (const stage of declaredStages) {
        const invocations = contract ? selectValidatorInvocations(contract, stage.names) : [];
        const coveringByRule = new Map();
        for (const invocation of invocations) {
            coveringByRule.set(invocation.rule, [...(coveringByRule.get(invocation.rule) ?? []), invocation]);
        }
        for (const rule of [...new Set(stage.names)].sort((left, right) => left.localeCompare(right))) {
            const covering = [...(coveringByRule.get(rule) ?? [])]
                .sort((left, right) => left.binding_position - right.binding_position);
            const sufficientPositions = sufficientPositionsByRule.get(rule) ?? [];
            if (covering.length === 0) {
                refusals.push(refusal('rule-uncovered', `rule ${rule} has no covering validator.`, { rule }));
                rules.push({
                    stage: stage.stage,
                    rule,
                    selected_binding_position: null,
                    selected_validator: null,
                    sufficient_binding_positions: sufficientPositions,
                    skipped_overlapping_binding_positions: [],
                    skip_condition: null,
                });
            }
            if (stage.stage === 'acceptance' && !covering.some((invocation) => invocation.sufficient)) {
                refusals.push(refusal('sufficiency-missing', `acceptance rule ${rule} has no covering binding the task contract designates sufficient.`, { rule }));
            }
            for (const invocation of covering) {
                const entry = bindingEntries.get(invocation.binding_position) ?? null;
                const runtimeBinding = runtimeBindings.find((candidate) => candidate.binding_position === invocation.binding_position) ?? null;
                rules.push({
                    stage: stage.stage,
                    rule,
                    selected_binding_position: invocation.binding_position,
                    selected_validator: {
                        name: invocation.binding.name,
                        version: invocation.binding.version,
                        class: invocation.binding.class,
                        implementation_ref: entry?.identity.implementation_ref ?? null,
                        catalogue_entry_ref: entry?.catalogue_entry_ref ?? null,
                        evidence_grade: entry?.evidence_grade ?? null,
                        coverage: true,
                        sufficient_for_rule: invocation.sufficient,
                        available: Boolean(runtimeBinding?.available),
                        cost_wall_ms: invocation.binding.cost_wall_ms,
                        limitations: entry?.limitations ?? [],
                    },
                    sufficient_binding_positions: sufficientPositions,
                    skipped_overlapping_binding_positions: [],
                    skip_condition: invocation.deferred
                        ? 'skipped when a deterministic or named-human validator rejects at the same decision stage'
                        : null,
                });
            }
        }
        execution.push(...invocations.map((invocation) => ({
            stage: stage.stage,
            rule: invocation.rule,
            binding_position: invocation.binding_position,
            validator: invocation.binding.name,
            group: invocation.deferred ? 'deferred-after-rejection' : 'authority-first',
            concurrency_group: invocation.deferred
                ? null
                : contract?.validator_concurrency_groups?.find((group) => group.rules.includes(invocation.rule))?.name ?? null,
        })));
    }
    const concurrencyGroups = contract?.validator_concurrency_groups ?? [];
    const duplicateGroupNames = new Set(concurrencyGroups.filter((group, index) => concurrencyGroups.findIndex((candidate) => candidate.name === group.name) !== index).map((group) => group.name));
    const multiplyGroupedRules = new Set(concurrencyGroups.flatMap((group) => group.rules).filter((rule, _index, all) => all.indexOf(rule) !== all.lastIndexOf(rule)));
    for (const group of concurrencyGroups) {
        const selected = execution.filter((item) => group.rules.includes(item.rule));
        const selectedByStage = ['invariant', 'acceptance']
            .map((stage) => selected.filter((item) => item.stage === stage))
            .filter((items) => items.length > 0);
        if (duplicateGroupNames.has(group.name)
            || group.rules.some((rule) => multiplyGroupedRules.has(rule))
            || new Set(group.rules).size !== group.rules.length
            || selectedByStage.length === 0
            || selectedByStage.some((items) => group.rules.some((rule) => !items.some((item) => item.rule === rule && item.group === 'authority-first')))) {
            refusals.push(refusal('authority-conflict', `concurrency group ${group.name} must have a unique name and contain distinct, singly-grouped rules that each have a selected deterministic or named-human validator at every decision stage where it applies.`, { dependency: group.name }));
        }
    }
    const interval = input.checkpoint?.interval_items ?? contract?.checkpoint_every_items ?? 1;
    const fixed = contract ? fixedCost(contract, input.items_declared, interval) : { perCheckpoint: 0, acceptance: 0, checkpoints: 0, projected: 0 };
    const reserve = input.budgets.consumption.compute_ms ?? 60_000;
    const projected = input.checkpoint?.projected_cost_ms ?? fixed.projected;
    if (contract && !input.checkpoint) {
        refusals.push(refusal('schedule-infeasible', 'a task contract has no pinned checkpoint input.'));
    }
    if (projected > reserve) {
        refusals.push(refusal('lease-unavailable', `the plan projects ${projected} compute_ms against a ${reserve} compute_ms verification pool.`, { dependency: 'verification.compute_ms' }));
    }
    const namedHuman = [...new Set((contract?.validators ?? []).filter((binding) => binding.class === 'named-human').map((binding) => bindingEntries.get(contract?.validators.indexOf(binding) ?? -1)?.runtime_needs.named_human_class ?? binding.name))].sort();
    let attention;
    if (namedHuman.length === 0) {
        attention = {
            status: 'not-applicable',
            statement: 'no named-human validator is selected',
            classes: [],
            budget: input.budgets.attention,
            capacity_snapshot_ref: null,
            requirements: [],
        };
    }
    else if (input.attention_enforcement.mode === 'not-wired') {
        attention = {
            status: 'not-evaluated',
            statement: ATTENTION_NOT_EVALUATED,
            classes: namedHuman,
            budget: input.budgets.attention,
            capacity_snapshot_ref: null,
            requirements: namedHuman.map((name) => ({
                class: name,
                expected_handling_ms: null,
                available: null,
                admission_result: 'not-evaluated',
            })),
        };
    }
    else {
        const snapshot = input.attention_capacity_snapshot;
        const requirements = namedHuman.map((name) => {
            const capacity = snapshot?.classes.find((entry) => entry.name === name) ?? null;
            const admitted = Boolean(capacity && capacity.available > 0 && input.budgets.attention > 0);
            if (!admitted) {
                refusals.push(refusal('attention-capacity-unavailable', `named-human class ${name} lacks pinned available capacity or attention budget.`, { validator: name, dependency: 'attention-capacity' }));
            }
            return {
                class: name,
                expected_handling_ms: capacity?.expected_handling_ms ?? null,
                available: capacity?.available ?? null,
                admission_result: admitted ? 'admitted' : 'refused',
            };
        });
        attention = {
            status: 'evaluated',
            statement: requirements.every((entry) => entry.admission_result === 'admitted')
                ? 'attention feasibility admitted from the pinned capacity snapshot'
                : 'attention feasibility refused from the pinned capacity snapshot',
            classes: namedHuman,
            budget: input.budgets.attention,
            capacity_snapshot_ref: snapshot?.snapshot_ref ?? null,
            requirements,
        };
    }
    const limits = [...new Set([
            ...(input.catalogue.flatMap((entry) => entry.limitations)),
            'A compiled verification plan has not executed any validator and does not establish that work is correct.',
            'coverage-MMR is context selection, not truth.',
            'Young-Daly cadence and dependency closure are planner inputs, not validators.',
            ...sampledGuarantees,
            ...(namedHuman.length > 0 ? [ATTENTION_NOT_EVALUATED] : []),
        ])].sort();
    const uniqueRefusals = [...new Map(refusals.sort(refusalOrder).map((item) => [canonicalJson(item), item])).values()];
    const body = VerificationPlanBodySchema.parse({
        schema: 'verification-plan/1',
        identity: {
            input_ref: inputRef,
            task_contract_ref: input.task_contract_ref,
            resolved_manifest_ref: input.resolved_manifest_ref,
            publication_ref: input.publication_ref,
            catalogue_entry_refs: input.catalogue.map((entry) => entry.catalogue_entry_ref).sort(),
            availability_snapshot_ref: input.availability.snapshot_ref,
            budgets_ref: input.budgets_ref,
            posture_ref: input.posture?.ref ?? null,
            checkpoint_snapshot_ref: input.checkpoint?.snapshot_ref ?? null,
            dependency_projection_ref: input.dependency_projection_ref,
            profile_manifest_ref: input.profile_manifest.manifest_ref,
            attention_capacity_snapshot_ref: input.attention_capacity_snapshot?.snapshot_ref ?? null,
        },
        reachability: {
            verified_completion_reachable: contract !== null && uniqueRefusals.length === 0,
            refusals: uniqueRefusals,
        },
        rules: rules.sort((left, right) => Number(left.stage === 'acceptance') - Number(right.stage === 'acceptance')
            || left.rule.localeCompare(right.rule)
            || (left.selected_binding_position ?? -1) - (right.selected_binding_position ?? -1)),
        runtime_bindings: runtimeBindings.sort((left, right) => left.binding_position - right.binding_position),
        execution_order: execution.map((item, position) => ({ ...item, position })),
        checkpoints: input.checkpoint,
        cost: {
            pool: 'verification',
            denomination: 'compute_ms',
            validator_upper_bounds: (contract?.validators ?? []).map((binding, position) => ({
                binding_position: position,
                validator: binding.name,
                wall_ms: binding.cost_wall_ms,
            })),
            per_checkpoint_ms: fixed.perCheckpoint,
            acceptance_ms: fixed.acceptance,
            projected_cost_ms: projected,
            reserve_ms: reserve,
            feasible: projected <= reserve,
            infeasibility: projected <= reserve ? null : `${projected} compute_ms exceeds the ${reserve} compute_ms verification pool`,
        },
        repair: {
            dependency_frontier: contract?.dependency_frontier ?? null,
            dependency_projection_ref: input.dependency_projection_ref,
            widening: contract?.dependency_frontier === 'independent-items'
                ? 'repair only rejected items'
                : contract?.dependency_frontier === 'declared-dependencies'
                    ? 'compute the declared dependency closure and widen to run start if the closure is incomplete'
                    : 'widen repair to run start',
            repair_limit: contract?.repair_budget_attempts ?? 0,
            terminal_after_exhaustion: 'unverified_artifact',
        },
        attention,
        active_mechanisms: [
            'validator-catalogue',
            'verification-plan',
            ...(input.checkpoint?.mode === 'controlled' ? ['young-daly-checkpoint-input'] : []),
            ...(contract?.dependency_frontier === 'declared-dependencies' ? ['dependency-closure-input'] : []),
            ...(input.resolved_manifest_ref ? ['coverage-mmr-context-input'] : []),
        ].sort(),
        deferred_mechanisms: [
            ...(namedHuman.length > 0 ? ['attention capacity enforcement is not engine-wired'] : []),
            'DRF/DRR, timing wheels, prefix snapshots, ARC and chunking are not active verification-plan capabilities',
        ].sort(),
        limits,
    });
    return VerificationPlanSchema.parse({ ...body, plan_ref: contentHash(body) });
}
export function renderVerificationPlan(plan) {
    const status = plan.reachability.verified_completion_reachable ? 'reachable' : 'unreachable';
    const lines = [
        `verification plan  ${plan.plan_ref}`,
        `verified completion ${status}`,
        `contract           ${plan.identity.task_contract_ref ?? 'none'}`,
        `availability       ${plan.identity.availability_snapshot_ref}`,
        `verification cost  ${plan.cost.projected_cost_ms} of ${plan.cost.reserve_ms} compute_ms`,
        `attention          ${plan.attention.statement}`,
    ];
    for (const rule of plan.rules) {
        const selected = rule.selected_validator;
        lines.push(`${rule.stage.padEnd(18)} ${rule.rule}: ${selected ? `${selected.name}@${selected.version} (${selected.class}), coverage yes, sufficient ${selected.sufficient_for_rule ? 'yes' : 'no'}, ${selected.evidence_grade}, ${selected.available ? 'available' : 'unavailable'}${rule.skip_condition ? `, ${rule.skip_condition}` : ''}` : 'no covering validator'}`);
    }
    for (const item of plan.reachability.refusals)
        lines.push(`refusal            ${item.code}: ${item.message}`);
    for (const limit of plan.limits)
        lines.push(`limit              ${limit}`);
    return lines.join('\n');
}
