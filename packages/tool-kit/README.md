# `@zero-ar/tool-kit`

Define a typed tool once, derive its model-visible schema and serve the same
definition through the Zero-AR Tool Host protocol. The development host checks
input, output, cancellation and declared cost against that definition.

The handler remains in the tool host. It is not serialized into an agent
publication or imported into the runtime server.

![The Zero-AR runtime boundary showing replaceable tools outside the W0 Kernel and Quality Plane.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-runtime-shape.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/tool-kit @zero-ar/contracts
```

## First working example

Define an observation tool, invoke it through the development host and inspect
the same manifest that a publication pins.

```ts
import { makeId } from '@zero-ar/contracts';
import {
  defineTool,
  object,
  serveTools,
  string,
} from '@zero-ar/tool-kit';

const archiveSearch = defineTool({
  name: 'archive.search',
  version: '1.0.0',
  description: 'Search the admitted archive and return a source handle.',
  input: object({ query: string(), collection: string() }),
  output: object({ resultRef: string() }),
  operationClass: 'observation',
  isolation: 'process',
  cost: { denomination: 'bytes', maximum: 4_096 },
  execute(input) {
    return { resultRef: `handle:${input.collection}:${input.query}` };
  },
});

const host = serveTools({ tools: [archiveSearch] });
const answer = await host.invoke({
  invoke_id: makeId('ctl'),
  run_id: makeId('run'),
  tool: archiveSearch.name,
  input: { query: 'renewal date', collection: 'contracts-2026' },
});

console.log(archiveSearch.manifest_ref, answer);
```

An undeclared field or wrong type returns a typed failed answer. It does not
reach the handler.

## Lists, choices and optional fields

A tool that takes structured input declares it with typed builders, so the
model sees the schema and the host refuses a wrong value by its path.

```ts
import { array, boolean, enumOf, integer, nullable, object, optional, string } from '@zero-ar/tool-kit';

const stops = object({
  stop: enumOf(['pickup', 'delivery']),
  arrival: string(),
  minutes: integer({ minimum: 0, maximum: 1_440 }),
});

const input = object({
  load_id: string(),
  stops: array(stops, { minItems: 1 }),
  lumper_receipt: nullable(string()),
  lumper_allowed: boolean(),
  note: optional(string()),
});
```

`object` lists required fields in the order they are written, the order a
model sees and fills them, and leaves out each `optional` field. A
declaration may list its required fields in another order; publication
compares them as a set and publishes the declaration's order.

## Public surface

- `string`, `number`, `integer`, `boolean`, `enumOf`, `array`, `nullable`,
  `optional` and `object` schema builders.
- `defineTool` for one typed declaration and handler.
- `serveTools` for the development Tool Host protocol.
- `conformance` for positive and negative input fixtures.
- Manifest, request, response and host TypeScript types.

## What this does not establish

Defining or serving a tool does not register it with a tenant or grant it
authority to change another system. A run can call only an admitted manifest
through an admitted host, and only when its budget covers the declared cost. A
change to an outside system also needs the separate Effect Plane and a
matching grant.

## Where to go next

- Use [`@zero-ar/sdk`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/sdk)
  to compile a tool into an agent publication.
- Use [`@zero-ar/testkit`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/testkit)
  for deterministic integration fixtures.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
