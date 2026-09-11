# `@zero-ar/validator-kit`

This package helps you declare a validator and exercise it against labelled cases. It does not decide whether a run is complete and cannot write runtime state.

See the [package guide](../../docs/npm-packages.md) for where it fits in the
public package set.

## The boundary in plain language

Zero-AR makes the definition of done explicit before work begins. The task contract maps each acceptance rule to a named validator. Missing coverage, rejection, failure, timeout or uncertainty cannot become verified.

You define what done means. Zero-AR checks that every rule has a registered validator with the pinned name, version and class, that a heuristic is not treated as sufficient, and that every required finding passes before verified completion. This enforcement cannot turn a weak rule into a good rule. A validator that always returns pass can be protocol-conformant and still provide little value.

A validator receives one rule, the ordered ledger-shaped items selected for that rule, their outputs and states, and the declared population total. The runtime computes a canonical hash over that complete admitted input. A child report with another hash or item count becomes infrastructure-indeterminate.

The current development host runs validators in a separate child process with a registry-local working directory and a minimal environment. A timeout, crash, cancellation, missing answer or input-identity mismatch becomes infrastructure-indeterminate, never pass. The child process is not the production sidecar. Production still requires content-addressed executable identity, enforced repeatability, explicit coverage modes, complete case admission, authenticated local IPC, read-only inputs, network denial and CPU, memory and PID limits.

The Effect Plane is separate. Read-only work may omit it. A consequential outside mutation requires an attached admitted plane. Public Alpha records a proposal and refuses dispatch; this package does not export effect dispatch.

## Declare a validator

```ts
import { defineValidator } from '@zero-ar/validator-kit';

export const rowsBalance = defineValidator({
  name: 'reconciliation.rows-balance',
  version: '1.0.0',
  description: 'the declared population equals the worked and parked rows',
  class: 'deterministic',
  can_answer_indeterminate: true,
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

Production admission will require positive, negative, indeterminate and adversarial cases. `runLabelledCases` provides the current fixture helper, but the runtime does not yet require the complete set at registration.

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
