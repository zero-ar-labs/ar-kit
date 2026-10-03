# `@zero-ar/conformance`

Check an execution-environment adapter against the public Zero-AR lifecycle.
The harness drives prepare, submit, observe, reconcile, collect, cancel,
teardown and abandon through the adapter an implementer supplies.

Run it against an isolated test account or local fixture. The harness creates
work, collects declared outputs and removes the environment it prepared.

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/conformance @zero-ar/contracts
```

## First working example

Export the adapter, immutable profile and admitted binding from the package
being checked, then pass them to the common harness.

```ts
import { runEnvironmentAdapterConformance } from '@zero-ar/conformance';
import { adapter, binding, profile } from './environment-fixture.js';

const report = await runEnvironmentAdapterConformance({
  adapter,
  profile,
  binding,
  argv: ['/usr/bin/env'],
  working_directory: '/workspace',
  maximum_observations: 16,
});

console.log(report.adapter_digest);
console.log(report.operations.join(', '));
console.log(report.collected_artifact_refs);
```

A passing report names the exact adapter digest, stable environment and job
handles, observation count, collected artifacts and lifecycle operations.

## Public surface

- `runEnvironmentAdapterConformance(input)`.
- `EnvironmentAdapterConformanceInput`.
- `EnvironmentAdapterConformanceReport`.

The harness is a function rather than a base class. An adapter package keeps
its own construction, credentials and test runner.

## What this does not establish

Conformance establishes that the adapter answered the declared lifecycle with
the required shapes and stable handles. It does not prove a provider account,
network policy, billing record or workload result outside the environment that
was tested. Run deployment acceptance separately for each admitted profile.

## Where to go next

- Use [`@zero-ar/contracts`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/contracts)
  for the `EnvironmentAdapter`, profile and binding contracts.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
