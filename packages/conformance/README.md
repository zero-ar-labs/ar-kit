# `@zero-ar/conformance`

Check an execution-environment adapter against the public Zero-AR lifecycle,
or check and rebuild an exported run without a server or database.
The adapter harness drives prepare, submit, observe, reconcile, collect,
cancel, teardown and abandon through the adapter an implementer supplies.

Run it against an isolated test account or local fixture. The harness creates
work, collects declared outputs and removes the environment it prepared.

![A recorded Zero-AR verification plan showing each rule, its pinned validator, coverage, cost and stated limits.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-verification-record.svg)

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
- `materializeRunBundle(text)` from `@zero-ar/conformance/run-protocol`.
- `EnvironmentAdapterConformanceInput`.
- `EnvironmentAdapterConformanceReport`.

The harness is a function rather than a base class. An adapter package keeps
its own construction, credentials and test runner.

## Check and rebuild an exported run

```ts
import { readFile } from 'node:fs/promises';
import { materializeRunBundle } from '@zero-ar/conformance/run-protocol';

const result = materializeRunBundle(await readFile('run.zero-ar.jsonl', 'utf8'));
console.log(result.run_id);
console.log(result.frontier.record_count);
console.log(result.state_hash);
```

An auditor can check an exported run and rebuild its current state without
the Zero-AR server, its database or a model call. The function refuses an
export that is incomplete, altered or out of order, and it says why. It opens
no network, database or runtime process, and it never continues the run.

The package also carries one language-neutral reference run at
`@zero-ar/conformance/vectors/open-durable-execution.jsonl` and its expected
result at
`@zero-ar/conformance/vectors/open-durable-execution.expected.json`. Read the
JSONL as text, pass it to `materializeRunBundle`, and compare the returned
state with the expected JSON. The reference run needs no model credential and
covers model calls, tool output, controls, budgets, validation, artifacts,
workspace state and a reconciled effect.

The campaign pins the Local Lite capability profile manifest it was recorded
under, which is now an earlier manifest. Materializing it does not depend on
that. Continuing it does: a destination accepts the pinned manifest only
while its current Local Lite manifest extends it, meaning every capability
entry of the pinned manifest appears unchanged and new entries may be added.
`compatibleProfileManifestRefs('local-lite')` from `@zero-ar/contracts`
returns the manifest refs a destination can list as `profile` bindings.

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
