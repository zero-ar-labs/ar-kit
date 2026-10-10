# `@zero-ar/testkit`

Build deterministic Zero-AR integration tests without a billable provider,
network dependency or wall-clock ordering assumption. The package supplies a
scripted model adapter, logical clock, seeded populations and scratch
directories outside the Git checkout.

Use it for protocol, lifecycle and reconstruction tests. Keep real-provider
and deployment acceptance as separate evidence.

![A recorded Zero-AR verification plan showing the contract evidence that deterministic tests can establish.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-verification-record.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install --save-dev @zero-ar/testkit
```

## First working example

Generate the same labelled population twice and give the test an isolated
scratch directory that removes itself when the process exits.

```ts
import assert from 'node:assert/strict';
import {
  LogicalClock,
  scratchDir,
  syntheticHazardPopulation,
} from '@zero-ar/testkit';

const first = syntheticHazardPopulation({
  seed: 42,
  items: 5_000,
  hazard_per_million: 40_000,
});
const second = syntheticHazardPopulation({
  seed: 42,
  items: 5_000,
  hazard_per_million: 40_000,
});

assert.deepEqual(first, second);

const clock = new LogicalClock();
assert.equal(clock.tick(), 1);
assert.equal(clock.tick(), 2);

console.log(first.generator, first.rejected, scratchDir('zero-ar-example-'));
```

The population records its generator version and seed so another run can
recreate the same ordering and rejection pattern.

## Public surface

- `ScriptedAdapter` for declared model turns and controlled corruption.
- `LogicalClock` for ordered instants without wall time.
- `seededGenerator` and `syntheticHazardPopulation`.
- `scratchDir` and `scratchRoot` for self-cleaning temporary workspaces.
- `noColorEnv` for a child process whose output a test parses: colour off,
  and no forced colour inherited from a test runner attached to a terminal.

## What this does not establish

A deterministic adapter proves the behavior of code around a declared model
response. It does not prove that a live provider account, model version or
network path behaves the same way. Record those results through the separate
live-provider and deployment campaigns.

## Where to go next

- Use [`@zero-ar/conformance`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/conformance)
  to check an environment adapter lifecycle.
- Use [`@zero-ar/validator-kit`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/validator-kit)
  to exercise labelled validator cases.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
