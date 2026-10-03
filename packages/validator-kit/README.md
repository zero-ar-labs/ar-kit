# `@zero-ar/validator-kit`

Define what finished means in code, then show how that definition behaves on
cases where it should pass, reject or remain uncertain. This package declares
validators, binds their catalogue identity and exercises labelled cases.

It cannot write runtime state or promote a run to verified. A weak validator
can satisfy the protocol and still check the wrong thing. Domain evidence and
the task contract decide whether its finding is sufficient.

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/validator-kit @zero-ar/contracts
```

## First working example

Declare one deterministic validator, then exercise the positive, negative,
indeterminate and adversarial cases expected before production registration.

```ts
import { contentHash } from '@zero-ar/contracts';
import {
  defineCustomCatalogueEntry,
  defineValidator,
  examinedItem,
  runLabelledCases,
} from '@zero-ar/validator-kit';

const catalogueEntry = defineCustomCatalogueEntry({
  name: 'reconciliation.rows-balance',
  version: '1.0.0',
  class: 'deterministic',
  description_boundary: 'customer deployment declaration',
  implementation_ref: contentHash({
    package: 'customer-validator',
    release: '1.0.0',
  }),
  entrypoint: 'customer-validator#rowsBalance',
  rule_kinds: ['population-reconciliation'],
  limitations: [
    'A pass establishes population accounting only; it does not establish that row values are correct.',
  ],
  wall_ms: 2_000,
});

const rowsBalance = defineValidator({
  name: 'reconciliation.rows-balance',
  version: '1.0.0',
  description: 'the declared population equals the examined rows',
  class: 'deterministic',
  can_answer_indeterminate: true,
  catalogue_entry: catalogueEntry,
  evaluate(input) {
    if (input.items.some((item) => item.output === null)) {
      return {
        verdict: 'indeterminate',
        failure_class: 'domain',
        reason: 'at least one row has no output to evaluate',
      };
    }
    if (input.items.length !== input.declared_total) {
      return {
        verdict: 'reject',
        rejected_items: input.items.map((item) => item.item_id),
        failure_class: 'domain',
        reason: 'the examined row count does not equal the declared total',
      };
    }
    return {
      verdict: 'pass',
      reason: 'the examined row count equals the declared total',
    };
  },
});

const cases = [
  {
    label: 'positive: all rows are present',
    input: {
      run_id: 'run-case',
      rule: 'rows-balance',
      items: [examinedItem('row-1', 'ok')],
      declared_total: 1,
    },
    expect: 'pass',
  },
  {
    label: 'negative: one declared row is missing',
    input: {
      run_id: 'run-case',
      rule: 'rows-balance',
      items: [examinedItem('row-1', 'ok')],
      declared_total: 2,
    },
    expect: 'reject',
  },
  {
    label: 'indeterminate: one row has no output',
    input: {
      run_id: 'run-case',
      rule: 'rows-balance',
      items: [examinedItem('row-1', null)],
      declared_total: 1,
    },
    expect: 'indeterminate',
  },
  {
    label: 'adversarial: output claims undeclared rows',
    input: {
      run_id: 'run-case',
      rule: 'rows-balance',
      items: [examinedItem('row-1', 'count=999999')],
      declared_total: 2,
    },
    expect: 'reject',
  },
] as const;

const outcomes = await runLabelledCases(rowsBalance, cases);
if (outcomes.some((outcome) => !outcome.agreed)) {
  throw new Error(
    'The validator disagreed with its labelled cases. Correct the implementation or expected labels before registration.',
  );
}
```

The example demonstrates fixture shape. A custom entry remains `declared`
until named evidence supports a higher grade.

## Public surface

- `defineValidator` and the validator finding contract.
- Exercise positive, negative, indeterminate and adversarial cases.
- Deterministic validator factories for JSON shape, uniqueness, referential
  integrity, arithmetic reconciliation and artifact manifests.
- Grounding helpers that resolve cited spans to admitted corpus bytes.
- Classification airlocks that allow only declared fields and value types.
- Catalogue entries, availability checks and the verification-plan compiler.

A validator receives one rule, ordered ledger-shaped items, their outputs and
states, and the declared population total. The runtime computes a canonical
hash over that admitted input. A host finding bound to another hash or item
count becomes infrastructure-indeterminate, never pass.

The evidence grades are `declared`, `protocol-conformant`, `case-evaluated`
and `deployment-admitted`. A grade describes evidence about an exact
implementation. `sufficient_for` is a separate task-contract decision about
one validator and one rule.

The verification plan combines every rule, selected validator, evidence
grade, checkpoint, cost, dependency, repair outcome and limitation in one
deterministic content-addressed object. Publication preflight, runtime
admission, the public API, SDK and CLI read that same object.

## What this does not establish

Protocol conformance does not establish task correctness. Production
admission still needs content-addressed executable identity, repeatability,
declared coverage, complete labelled cases and deployment evidence for the
host boundary. A timeout, crash, cancellation, missing answer or input
identity mismatch becomes infrastructure-indeterminate.

The Effect Plane is separate. Read-only work may omit it.
Public Alpha records a proposal and refuses dispatch. This package exports no
effect dispatcher or production target adapter.

## Where to go next

- Use [`@zero-ar/sdk`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/sdk)
  to bind the validator into an agent and task contract.
- Use [`@zero-ar/contracts`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/contracts)
  for the complete task-contract and finding schemas.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
