/**
 * Sequential sampled validation (appendix MTH, algorithm 3).
 *
 * What this is: Wald's sequential probability ratio test as a validator
 * factory over pinned hypotheses, error bounds, cap, ordering, sampling
 * model and domain oracle. The exact rational ratio updates once per item,
 * so a crossing decides the same everywhere (MTH-007), and a finding records
 * the frame, each oracle answer, the trace, the stop reason and the label.
 *
 * How it fits: domain packs ship sampled validators through the public kit,
 * and the quality runner checks each record against the input it admitted.
 * Evaluation is synchronous, so the cap, not the wall clock, bounds it.
 */
import { SequentialSamplingRecordSchema, contentHash, refuse } from '@zero-ar/contracts';
import { defineFirstPartyCatalogueEntry } from "./catalogue.js";
/**
 * The most items one sampled check may examine. In-process evaluation is
 * synchronous and the ratio's digits grow with every item, so the declared
 * wall clock cannot interrupt a long sample. At this bound the slowest
 * measured case, a Bernoulli sample that never crosses, took about a quarter
 * of a second; the domain oracle's own cost per item comes on top.
 */
export const SEQUENTIAL_MAX_SAMPLE = 10_000;
const MILLION = 1000000n;
export function sequentialErrorGuarantee(config, population_size) {
    const sampling_model = config.sampling_model ?? 'bernoulli-independent';
    const base = {
        p0_ppm: config.p0_ppm,
        p1_ppm: config.p1_ppm,
        alpha_ppm: config.alpha_ppm,
        beta_ppm: config.beta_ppm,
        sampling_model,
        assumption: assumptionFor(sampling_model),
        measured_false_pass_rate: 'deployment-metric:QLT-010',
        measured_false_rejection_rate: 'deployment-metric:QLT-010',
    };
    if (sampling_model !== 'finite-population-without-replacement' || population_size === undefined)
        return base;
    const { acceptable_defects, bad_defects } = finitePopulationDefectBounds(population_size, config);
    return { ...base, population_size, acceptable_defects, bad_defects };
}
export function sequentialBoundaryTrace(config, examined, defects, population_size) {
    validateConfig(config);
    if (!Number.isInteger(examined) || examined < 0) {
        refuse({ code: 'validator.sample.invalid', message: `examined must be a non-negative integer; got ${examined}.`, clause: 'MTH-SV-003' });
    }
    if (!Number.isInteger(defects) || defects < 0 || defects > examined) {
        refuse({ code: 'validator.sample.invalid', message: `defects must be an integer between zero and examined; got ${defects} for ${examined}.`, clause: 'MTH-SV-003' });
    }
    const sampling_model = config.sampling_model ?? 'bernoulli-independent';
    const ratio = sampling_model === 'finite-population-without-replacement'
        ? finitePopulationRatio(population_size ?? examined, config, examined, defects)
        : bernoulliRatio(config, examined, defects);
    const boundaries = boundaryFractions(config);
    const decision = crossesReject(ratio, boundaries.rejectNum, boundaries.rejectDen)
        ? 'reject'
        : crossesAccept(ratio, boundaries.acceptNum, boundaries.acceptDen)
            ? 'accept'
            : 'continue';
    const label = sequentialErrorGuarantee(config, sampling_model === 'finite-population-without-replacement' ? (population_size ?? examined) : undefined);
    const trace = {
        sampling_model,
        assumption: label.assumption,
        examined,
        defects,
        likelihood_ratio_num: ratio.num.toString(),
        likelihood_ratio_den: ratio.den.toString(),
        reject_boundary_num: boundaries.rejectNum.toString(),
        reject_boundary_den: boundaries.rejectDen.toString(),
        accept_boundary_num: boundaries.acceptNum.toString(),
        accept_boundary_den: boundaries.acceptDen.toString(),
        decision,
    };
    if (label.population_size !== undefined)
        trace.population_size = label.population_size;
    if (label.acceptable_defects !== undefined)
        trace.acceptable_defects = label.acceptable_defects;
    if (label.bad_defects !== undefined)
        trace.bad_defects = label.bad_defects;
    return trace;
}
/** The worked rows a sequential check samples, in the pinned order. */
export function sequentialSamplingFrame(items) {
    return items
        .filter((item) => item.state === 'completed_unverified' || item.state === 'verified')
        .sort((a, b) => (a.item_id < b.item_id ? -1 : a.item_id > b.item_id ? 1 : 0));
}
/** The content identity of a sampling frame: the sorted worked item ids. */
export function sequentialFrameHash(items) {
    return contentHash(sequentialSamplingFrame(items).map((item) => item.item_id));
}
/** The guarantee a configuration states, as one line a verification plan can show. */
export function sequentialGuaranteeStatement(config) {
    const label = sequentialErrorGuarantee(config);
    return `sampled guarantee of ${config.name}@${config.version}: defect rate at most ${config.p0_ppm} ppm is good and at least ${config.p1_ppm} ppm is bad, ` +
        `false rejection at most ${config.alpha_ppm} ppm and false pass at most ${config.beta_ppm} ppm under ${label.assumption}, ` +
        `at most ${config.max_sample} samples in ${config.ordering} order over the pinned oracle ${config.oracle_ref}; ` +
        'measured false-pass and false-rejection rates are deployment metrics under QLT-010';
}
export function sequentialSampledValidator(config, klass = 'sampled-oracle') {
    validateConfig(config);
    const samplingModel = config.sampling_model ?? 'bernoulli-independent';
    return {
        name: config.name,
        version: config.version,
        class: klass,
        catalogue_entry: defineFirstPartyCatalogueEntry({
            name: config.name,
            version: config.version,
            class: klass,
            entrypoint: '@zero-ar/validator-kit#sequentialSampledValidator',
            implementation_identity: {
                algorithm: 'exact-rational-sequential-boundary-v1',
                p0_ppm: config.p0_ppm,
                p1_ppm: config.p1_ppm,
                alpha_ppm: config.alpha_ppm,
                beta_ppm: config.beta_ppm,
                max_sample: config.max_sample,
                ordering: config.ordering,
                sampling_model: samplingModel,
                oracle_ref: config.oracle_ref,
                expected_frame_hash: config.expected_frame_hash ?? null,
            },
            factory_identity: { algorithm: 'sequential-sampled-validator-factory-v1' },
            rule_kinds: ['sampled-domain-judgement'],
            population: 'sampled',
            dependencies: ['domain-oracle'],
            oracle_ref: config.oracle_ref,
            sampling_frame_ref: config.expected_frame_hash ?? null,
            sampling_assumption: assumptionFor(samplingModel),
            limitations: [
                'A pass establishes only the configured sampled hypothesis under the pinned frame, ordering, assumptions and domain oracle.',
                'A capped or drifted sample is indeterminate, never a pass.',
                sequentialGuaranteeStatement(config),
            ],
        }),
        evaluate(input) {
            const frame = sequentialSamplingFrame(input.items);
            const frame_hash = contentHash(frame.map((item) => item.item_id));
            if (config.expected_frame_hash && config.expected_frame_hash !== frame_hash) {
                return {
                    verdict: 'indeterminate',
                    failure_class: 'infrastructure',
                    reason: `the sampling frame drifted from the pinned ${config.expected_frame_hash.slice(0, 20)}; a drifted population restarts under a new recorded invocation, it never passes`,
                };
            }
            const sampling_model = config.sampling_model ?? 'bernoulli-independent';
            if (sampling_model === 'finite-population-without-replacement' && input.declared_total !== frame.length) {
                return {
                    verdict: 'indeterminate',
                    failure_class: 'infrastructure',
                    reason: `finite-population validation saw ${frame.length} completed rows but the declared frame is ${input.declared_total}; ` +
                        'the exact correction needs the whole frame and unresolved rows never pass',
                };
            }
            if (frame.length === 0) {
                return {
                    verdict: 'indeterminate',
                    reason: 'there is no worked item to sample, and an empty sample is never a pass',
                };
            }
            const examinedItems = [];
            const defects = [];
            const label = sequentialErrorGuarantee(config, sampling_model === 'finite-population-without-replacement' ? frame.length : undefined);
            // The recorded trace is the full recomputation an auditor would run, so
            // its digits match sequentialBoundaryTrace exactly; it runs once, at stop.
            const record = (stop_reason) => ({
                oracle_ref: config.oracle_ref,
                frame_hash,
                population: frame.length,
                examined: examinedItems.length,
                defects: defects.length,
                stop_reason,
                items: examinedItems.map((item) => ({ ...item })),
                trace: { ...sequentialBoundaryTrace(config, examinedItems.length, defects.length, frame.length) },
                guarantee: { ...label },
            });
            // Exact rational SPRT: ratio as num/den, boundaries as fractions. Each
            // examined item multiplies one factor into each side, the same value a
            // full recomputation gives, so a check costs one update per item.
            const boundaries = boundaryFractions(config);
            const step = ratioStepper(config, sampling_model, frame.length);
            let ratio = { num: 1n, den: 1n };
            for (const item of frame) {
                if (examinedItems.length >= config.max_sample)
                    break;
                let call;
                try {
                    call = config.oracle(item);
                }
                catch (error) {
                    return {
                        verdict: 'indeterminate',
                        failure_class: 'infrastructure',
                        reason: `the oracle could not judge ${item.item_id}: ${error.message}. Missing coverage samples nothing into a pass`,
                    };
                }
                if (call !== 'good' && call !== 'defect') {
                    return {
                        verdict: 'indeterminate',
                        failure_class: 'infrastructure',
                        reason: `the oracle answered ${String(call).slice(0, 40)} for ${item.item_id}, outside good and defect, so the sample cannot count it`,
                    };
                }
                ratio = step(ratio, call, examinedItems.length, defects.length);
                examinedItems.push({ item_id: item.item_id, outcome: call });
                if (call === 'defect')
                    defects.push(item.item_id);
                if (crossesReject(ratio, boundaries.rejectNum, boundaries.rejectDen)) {
                    return {
                        verdict: 'reject',
                        rejected_items: [...defects],
                        failure_class: 'domain',
                        reason: `sequential reject after ${examinedItems.length} of ${frame.length}: the likelihood ratio crossed the reject boundary with ${defects.length} defects ` +
                            `(frame ${frame_hash.slice(0, 20)}, ordering ${config.ordering}, assumption ${label.assumption}; ` +
                            'measured false-pass and false-rejection rates are deployment metrics under QLT-010)',
                        sampling: record('reject-boundary'),
                    };
                }
                if (crossesAccept(ratio, boundaries.acceptNum, boundaries.acceptDen)) {
                    return {
                        verdict: 'pass',
                        reason: `sequential accept after ${examinedItems.length} of ${frame.length} samples with ${defects.length} defects ` +
                            `(frame ${frame_hash.slice(0, 20)}, ordering ${config.ordering}, assumption ${label.assumption}; ` +
                            'measured false-pass and false-rejection rates are deployment metrics under QLT-010)',
                        sampling: record('accept-boundary'),
                    };
                }
            }
            const stoppedBy = examinedItems.length >= config.max_sample
                ? `at the declared cap of ${config.max_sample}`
                : `when the frame of ${frame.length} ran out below the declared cap of ${config.max_sample}`;
            return {
                verdict: 'indeterminate',
                reason: `${examinedItems.length} samples of ${frame.length} ended without a boundary crossing ${stoppedBy}, ` +
                    `and a cap is never a pass (assumption ${label.assumption}; measured false-pass and false-rejection rates are deployment metrics under QLT-010)`,
                // The stop reason vocabulary has no frame-exhausted value yet, so a
                // frame that runs out below the cap records sample-cap; the reason
                // and examined equal to population tell the two apart.
                sampling: record('sample-cap'),
            };
        },
    };
}
/**
 * Name what makes a finding's sampling record unusable against the input the
 * runtime admitted, or null when the record is sound or none is needed. A
 * sampled-oracle pass or reject needs one; an indeterminate finding and any
 * other class may carry none. The record must parse, name the registered
 * oracle (a sampled-oracle validator must have one pinned), cover exactly
 * the admitted frame, count what it lists, and stop for the reason its
 * verdict implies.
 */
export function sampledFindingProblem(finding, context) {
    if (finding.sampling === undefined) {
        if (context.class === 'sampled-oracle' && (finding.verdict === 'pass' || finding.verdict === 'reject')) {
            return `a sampled-oracle ${finding.verdict} carries no sampling record, so nothing shows which items it examined, what the oracle answered or why it stopped (MTH-SV-006)`;
        }
        return null;
    }
    if (context.class !== 'sampled-oracle' && context.class !== 'heuristic') {
        return `a ${context.class} validator returned a sampling record, and only a sampled-oracle or heuristic check samples`;
    }
    const parsed = SequentialSamplingRecordSchema.safeParse(finding.sampling);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return `the sampling record does not validate at ${issue?.path.join('.') || 'its root'}: ${issue?.message ?? 'shape mismatch'}`;
    }
    const record = parsed.data;
    if (context.oracle_ref === null && context.class === 'sampled-oracle') {
        return `the sampled-oracle validator is registered without a pinned oracle, so its record's oracle ${record.oracle_ref} has nothing to match`;
    }
    if (context.oracle_ref !== null && record.oracle_ref !== context.oracle_ref) {
        return `the sampling record names oracle ${record.oracle_ref}, not the registered ${context.oracle_ref}`;
    }
    const frame = sequentialSamplingFrame(context.items).map((item) => item.item_id);
    if (record.frame_hash !== contentHash(frame)) {
        return 'the sampling frame differs from the worked items the runtime admitted, and a drifted frame never counts (MTH-SV-005)';
    }
    if (record.population !== frame.length) {
        return `the sampling record counts a population of ${record.population}, and the admitted frame holds ${frame.length}`;
    }
    if (record.examined !== record.items.length || record.examined > record.population) {
        return `the sampling record says it examined ${record.examined} items, lists ${record.items.length}, and the frame holds ${record.population}`;
    }
    const inFrame = new Set(frame);
    const seen = new Set();
    for (const item of record.items) {
        if (!inFrame.has(item.item_id))
            return `the sampling record lists ${item.item_id}, which is outside the admitted frame`;
        if (seen.has(item.item_id))
            return `the sampling record lists ${item.item_id} twice, and a sample without replacement examines an item once`;
        seen.add(item.item_id);
    }
    const defects = new Set(record.items.filter((item) => item.outcome === 'defect').map((item) => item.item_id));
    if (record.defects !== defects.size) {
        return `the sampling record counts ${record.defects} defects and lists ${defects.size}`;
    }
    const expected = {
        pass: ['accept-boundary'],
        reject: ['reject-boundary'],
        indeterminate: ['sample-cap', 'lease-exhausted'],
    };
    const allowed = expected[String(finding.verdict)] ?? [];
    if (!allowed.includes(record.stop_reason)) {
        return `a ${String(finding.verdict)} finding stopped for ${record.stop_reason}, which that verdict cannot follow from`;
    }
    const unexamined = (finding.rejected_items ?? []).filter((item) => !defects.has(item));
    if (unexamined.length > 0) {
        return `the reject names ${unexamined.slice(0, 5).join(', ')}, which the sample did not examine as defects`;
    }
    return null;
}
function validateConfig(config) {
    if (!/^sha256:[0-9a-f]{64}$/.test(config.oracle_ref)) {
        refuse({
            code: 'validator.oracle.identity-missing',
            message: 'sequential sampled validation needs an explicitly supplied sha256 domain oracle ref; an unpinned function cannot carry sampled-oracle authority.',
            clause: 'VPC-030',
        });
    }
    if (!(config.p1_ppm > config.p0_ppm) || config.p0_ppm <= 0 || config.p1_ppm >= 1_000_000) {
        refuse({
            code: 'validator.hypotheses.invalid',
            message: `the hypotheses need 0 < p0 < p1 < one million ppm; got ${config.p0_ppm} and ${config.p1_ppm}.`,
            clause: 'MTH-SV-003',
        });
    }
    if (config.alpha_ppm <= 0 || config.beta_ppm <= 0 || config.alpha_ppm >= 1_000_000 || config.beta_ppm >= 1_000_000) {
        refuse({ code: 'validator.bounds.invalid', message: 'both error bounds live strictly between zero and one million ppm.', clause: 'MTH-SV-003' });
    }
    if (!Number.isInteger(config.max_sample) || config.max_sample < 1 || config.max_sample > SEQUENTIAL_MAX_SAMPLE) {
        refuse({
            code: 'validator.sample.cap-invalid',
            message: `the sample cap must be an integer from 1 to ${SEQUENTIAL_MAX_SAMPLE}; got ${String(config.max_sample)}. Without a finite cap a sample that never crosses a boundary would never stop.`,
            clause: 'MTH-SV-003',
        });
    }
    if (config.sampling_model && config.sampling_model !== 'bernoulli-independent' && config.sampling_model !== 'finite-population-without-replacement') {
        refuse({ code: 'validator.sampling_model.invalid', message: `the sampling model ${config.sampling_model} is not supported.`, clause: 'MTH-SV-003' });
    }
}
function assumptionFor(model) {
    return model === 'finite-population-without-replacement'
        ? 'hypergeometric-without-replacement-fixed-frame-v1'
        : 'bernoulli-independent-fixed-order-v1';
}
function boundaryFractions(config) {
    return {
        rejectNum: MILLION - BigInt(config.beta_ppm),
        rejectDen: BigInt(config.alpha_ppm),
        acceptNum: BigInt(config.beta_ppm),
        acceptDen: MILLION - BigInt(config.alpha_ppm),
    };
}
function bernoulliRatio(config, examined, defects) {
    const p0 = BigInt(config.p0_ppm);
    const p1 = BigInt(config.p1_ppm);
    let num = 1n;
    let den = 1n;
    for (let index = 0; index < defects; index += 1) {
        num *= p1;
        den *= p0;
    }
    for (let index = defects; index < examined; index += 1) {
        num *= MILLION - p1;
        den *= MILLION - p0;
    }
    return { num, den };
}
/**
 * The one-item update of the exact likelihood ratio. Bernoulli multiplies in
 * p1 over p0 for a defect and its complement for a good item. The finite
 * model multiplies in the ratio of consecutive binomial coefficients with the
 * shared divisor cancelled, so the value equals the full hypergeometric ratio
 * and a factor that reaches zero keeps that side at zero, as the full count
 * does. examined and defects are the counts before this item.
 */
function ratioStepper(config, sampling_model, population_size) {
    if (sampling_model === 'finite-population-without-replacement') {
        const { acceptable_defects, bad_defects } = finitePopulationDefectBounds(population_size, config);
        const factor = (value) => BigInt(Math.max(0, value));
        return (ratio, call, examined, defects) => {
            const goods = examined - defects;
            return call === 'defect'
                ? { num: ratio.num * factor(bad_defects - defects), den: ratio.den * factor(acceptable_defects - defects) }
                : { num: ratio.num * factor(population_size - bad_defects - goods), den: ratio.den * factor(population_size - acceptable_defects - goods) };
        };
    }
    const p0 = BigInt(config.p0_ppm);
    const p1 = BigInt(config.p1_ppm);
    return (ratio, call) => call === 'defect'
        ? { num: ratio.num * p1, den: ratio.den * p0 }
        : { num: ratio.num * (MILLION - p1), den: ratio.den * (MILLION - p0) };
}
function finitePopulationRatio(population_size, config, examined, defects) {
    if (!Number.isInteger(population_size) || population_size <= 0) {
        refuse({ code: 'validator.population.invalid', message: `population size must be a positive integer; got ${population_size}.`, clause: 'MTH-SV-008' });
    }
    if (examined > population_size) {
        refuse({
            code: 'validator.population.invalid',
            message: `examined sample ${examined} cannot exceed population size ${population_size}.`,
            clause: 'MTH-SV-008',
        });
    }
    const { acceptable_defects, bad_defects } = finitePopulationDefectBounds(population_size, config);
    const numerator = combinations(bad_defects, defects) * combinations(population_size - bad_defects, examined - defects);
    const denominator = combinations(acceptable_defects, defects) * combinations(population_size - acceptable_defects, examined - defects);
    return { num: numerator, den: denominator };
}
function finitePopulationDefectBounds(population_size, config) {
    const size = BigInt(population_size);
    const acceptable_defects = Number((size * BigInt(config.p0_ppm)) / MILLION);
    const bad_defects = Number((size * BigInt(config.p1_ppm) + MILLION - 1n) / MILLION);
    if (bad_defects <= acceptable_defects) {
        refuse({
            code: 'validator.population.bounds.invalid',
            message: `population size ${population_size} maps p0 and p1 to overlapping defect counts ` +
                `${acceptable_defects} and ${bad_defects}; a larger frame or wider hypotheses would separate them.`,
            clause: 'MTH-SV-008',
        });
    }
    return { acceptable_defects, bad_defects };
}
function combinations(n, k) {
    if (k < 0 || k > n)
        return 0n;
    const width = Math.min(k, n - k);
    let out = 1n;
    for (let step = 1; step <= width; step += 1) {
        out = (out * BigInt(n - width + step)) / BigInt(step);
    }
    return out;
}
function crossesReject(ratio, boundaryNum, boundaryDen) {
    if (ratio.den === 0n)
        return ratio.num > 0n;
    return ratio.num * boundaryDen >= boundaryNum * ratio.den;
}
function crossesAccept(ratio, boundaryNum, boundaryDen) {
    if (ratio.den === 0n)
        return false;
    return ratio.num * boundaryDen <= boundaryNum * ratio.den;
}
