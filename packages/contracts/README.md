# `@zero-ar/contracts`

Use the same payloads, identifiers, state machines and closed vocabularies as
the Zero-AR runtime. This package is the public contract boundary for an
integration that constructs requests, reads results or persists references.

It does not connect to a runtime, authorize a model or tool call, or decide
whether work is correct. Schemas establish that a value has the declared
shape. Domain validators establish what the value means for a task.

![A recorded Zero-AR verification plan showing how public contracts bind acceptance rules to pinned validators and declared limits.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-verification-record.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/contracts
```

## First working example

Parse one intake request before it crosses an API boundary, then address its
canonical content.

```ts
import {
  IntakeRequestSchema,
  contentHash,
  makeId,
} from '@zero-ar/contracts';

const request = IntakeRequestSchema.parse({
  objective: 'Reconcile the supplier records.',
  principals: {
    executing: 'svc:reconciliation',
    originating: 'supplier-import',
    accountable: 'operations-owner',
  },
  budgets: {
    consumption: { model_tokens: 50_000 },
    attention: 0,
    verification_reserve_fraction: 0.2,
    max_turns: 12,
  },
  inputs: { items: ['supplier-001', 'supplier-002'] },
  idempotency_key: makeId('ctl'),
});

console.log(contentHash(request));
```

The printed `sha256:` value is stable for the same canonical request. It is a
content identity, not an authorization token.

## Public surface

- Zod schemas and inferred TypeScript types for every public API payload.
- Run, item, effect, budget and environment state vocabularies.
- State transition tables and assertion helpers.
- Time-ordered ids and canonical content hashes.
- Route definitions shared by the generated client and OpenAPI document.
- Publication, provider, source and interoperability contracts.
- Typed diagnostics that state the problem, reason and required change.

Import from the package root. Closed vocabularies are exported from that root
and are not duplicated by the client, SDK or command.

## What this does not establish

A parsed payload is structurally valid. It is not necessarily authorized,
reachable, affordable or correct for a domain. A content hash proves which
bytes were addressed. It does not prove who produced them or whether a
validator should pass them.

## Where to go next

- Use [`@zero-ar/client`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/client)
  for exact native API calls and durable event streams.
- Use [`@zero-ar/sdk`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/sdk)
  for run handles and agent authoring.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
