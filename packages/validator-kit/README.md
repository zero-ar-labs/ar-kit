# `@zero-ar/validator-kit`

Define what finished means in code, then show how that definition behaves on
cases where it should pass, reject or remain uncertain. This package declares
validators and exercises labelled cases. It cannot write runtime state or
promote a run to verified.

## The boundary in plain language

Zero-AR makes the definition of done explicit before work begins. The task contract maps each acceptance rule to a named validator. Missing coverage, rejection, failure, timeout or uncertainty cannot become verified.

You define what done means. Zero-AR checks that every rule has a registered validator with the pinned name, version and class, that a heuristic is not treated as sufficient, and that every required finding passes before verified completion. This enforcement cannot turn a weak rule into a good rule. A validator that always returns pass can be protocol-conformant and still provide little value.

A validator receives one rule, the ordered ledger-shaped items selected for that rule, their outputs and states, and the declared population total. The runtime computes a canonical hash over that complete admitted input and records which items it contains before the validator runs, then hands the validator its own copy. A child report with another hash or item count becomes infrastructure-indeterminate.

A finding must be well formed. The verdict is `pass`, `reject` or `indeterminate`. The `reason` is a non-empty string. A `failure_class`, when present, is one of the closed failure classes. A `reject` names at least one rejected item, a `pass` names none, and every named item must be one the validator received. The runtime records any other finding as infrastructure-indeterminate, never pass. `defineValidator` and `runLabelledCases` refuse the same findings with a named code through the shared `validatorFindingProblem(...)` check, so a labelled case cannot agree with a finding the runtime would quarantine.

The current development host runs validators in a separate child process with a registry-local working directory and a minimal environment. A timeout, crash, cancellation, missing answer or input-identity mismatch becomes infrastructure-indeterminate, never pass. The catalogue binds content-addressed executable identity through an exact implementation or factory ref. The development child is still not a general production sidecar: authenticated local IPC, read-only inputs and enforced CPU, memory and PID isolation remain deployment admissions rather than catalogue promises.

The Effect Plane is separate. Read-only work may omit it. A consequential outside mutation requires an attached admitted plane. Public Alpha records a proposal and refuses dispatch; this package does not export effect dispatch.

## What the first-party catalogue means

The first-party catalogue describes each exact implementation or factory, its
accepted input, findings, class, cost, runtime dependencies, separately named
evidence and limitations. It is an inert library in this package and the
domain-pack boundary, not a registry service. The compact catalogue includes the
focused domain-pack validators plus general structured-shape, uniqueness,
referential-integrity, arithmetic-reconciliation and artifact-manifest factories.
A non-empty output may still be wrong, balanced totals may contain wrong values,
and a citation that resolves to original bytes may not support its claim.

The evidence grades are `declared`, `protocol-conformant`,
`case-evaluated` and `deployment-admitted`. A grade describes evidence about an
exact implementation at a named boundary. `sufficient_for` stays a separate
task-contract decision about one validator and one rule.

## What a verification plan will show

`compileVerificationPlan(...)` turns the pinned task contract, resolved identity,
posture, availability, budget, checkpoint and dependency inputs into one
deterministic content-addressed report. Publication preflight, runtime admission,
the public API, SDK explain and CLI all use that canonical object.

The report shows each condition, the exact validator that covers it, the
evidence grade and limitation, when it runs, what lease pays for it, and what
happens after rejection or an indeterminate finding. Reading it cannot append a
record, reserve budget or call a model, tool or validator.

The current coordinator evaluates every declared binding whose `covers` list
contains a rule, once per rule, unless an earlier deterministic or named-human
rejection skips a heuristic or sampled-oracle check. It uses that coverage for
checkpoint evaluation, while terminal completion separately requires a pass
from a binding whose `sufficient_for` names the rule. A binding may be
designated sufficient only for a rule it covers, and publication and run
admission refuse anything else. The plan shows one row per stage, rule and
evaluated validator, and `selectValidatorInvocations` is the one selection both
the plan and the coordinator read. The attention calibration helpers in the
Quality Plane are not engine-wired, so the plan must report
`attention feasibility not evaluated` until that caller exists.

Checkpoint cadence is part of both quality and performance planning. A shorter
interval can find defects earlier but costs more verification work. A longer
interval can save checking cost but increase the work invalidated after a defect.
The task contract's mandatory boundaries always win over an optimization.

See the public [validator catalogue and verification plan](../../docs/validator-catalogue-and-verification-plan.md)
and the [requirements appendix](../../docs/agent-runtime-validator-catalogue-and-verification-plan-appendix.md).

## Declare a validator

```ts
import { contentHash } from '@zero-ar/contracts';
import { defineCustomCatalogueEntry, defineValidator } from '@zero-ar/validator-kit';

const catalogueEntry = defineCustomCatalogueEntry({
  name: 'reconciliation.rows-balance',
  version: '1.0.0',
  class: 'deterministic',
  description_boundary: 'customer deployment declaration',
  implementation_ref: contentHash({ package: 'customer-validator', release: '1.0.0' }),
  entrypoint: 'customer-validator#rowsBalance',
  rule_kinds: ['population-reconciliation'],
  limitations: ['A pass establishes population accounting only; it does not establish that row values are correct.'],
  wall_ms: 2_000,
});

export const rowsBalance = defineValidator({
  name: 'reconciliation.rows-balance',
  version: '1.0.0',
  description: 'the declared population equals the worked and parked rows',
  class: 'deterministic',
  can_answer_indeterminate: true,
  catalogue_entry: catalogueEntry,
  evaluate(input) {
    if (input.items.some((item) => item.output === null)) {
      return { verdict: 'indeterminate', failure_class: 'domain', reason: 'at least one row has no output to evaluate' };
    }
    if (input.items.length !== input.declared_total) {
      return {
        verdict: 'reject',
        rejected_items: input.items.map((item) => item.item_id),
        failure_class: 'domain',
        reason: 'the examined row count does not equal the declared total',
      };
    }
    return { verdict: 'pass', reason: 'the examined row count equals the declared total' };
  },
});
```

## Exercise the four admission cases

First-party deterministic production registration requires positive, negative, indeterminate and adversarial cases plus protocol, repeatability and deployment evidence. `runLabelledCases` provides the fixture helper; custom entries remain honestly `declared` until their named evidence supports a higher grade.

```ts
import { examinedItem, runLabelledCases } from '@zero-ar/validator-kit';
import { rowsBalance } from './rows-balance.js';

const cases = [
  {
    label: 'positive: all rows are present',
    input: { run_id: 'run-case', rule: 'rows-balance', items: [examinedItem('row-1', 'ok')], declared_total: 1 },
    expect: 'pass',
  },
  {
    label: 'negative: one declared row is missing',
    input: { run_id: 'run-case', rule: 'rows-balance', items: [examinedItem('row-1', 'ok')], declared_total: 2 },
    expect: 'reject',
  },
  {
    label: 'indeterminate: one row has no output to evaluate',
    input: { run_id: 'run-case', rule: 'rows-balance', items: [examinedItem('row-1', null)], declared_total: 1 },
    expect: 'indeterminate',
  },
  {
    label: 'adversarial: an output claims extra rows exist',
    input: { run_id: 'run-case', rule: 'rows-balance', items: [examinedItem('row-1', 'count=999999')], declared_total: 2 },
    expect: 'reject',
  },
] as const;

const outcomes = await runLabelledCases(rowsBalance, cases);
if (outcomes.some((outcome) => !outcome.agreed)) {
  throw new Error('the validator disagreed with its labelled cases. Correct the implementation or the expected labels before registration.');
}
```

The template demonstrates fixture shape, not production admission. Measure domain false-pass and false-rejection rates separately from protocol conformance.
