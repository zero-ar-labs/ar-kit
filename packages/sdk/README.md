# `@zero-ar/sdk`

Attach durable Zero-AR work to an application and author the immutable
resources that define an agent. The SDK gives an application one configured
runtime handle, run handles that can be recreated by id, and builders for
agents, tools, validators, postures, domain packs and orchestrations.

The SDK is a client surface. It needs an already-running Zero-AR endpoint and
does not contain the kernel, database or model provider.

![A recorded Zero-AR run showing the durable work that an SDK run handle addresses.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-work-record.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/sdk
```

## First working example

Start one run, read its durable records and wait for its typed result.

```ts
import { createZeroAR } from '@zero-ar/sdk';

const zeroar = createZeroAR({
  endpoint: process.env.ZERO_AR_URL,
  apiKey: process.env.ZERO_AR_API_KEY,
});

const run = await zeroar.run({
  objective: 'Reconcile the supplier records and report what remains unverified.',
  items: ['supplier-001', 'supplier-002'],
});

console.log('run', run.id);

for await (const record of run.events()) {
  console.log(record.seq, record.type);
}

const result = await run.result();
console.log(result.verdict, result.not_established);
```

Another process can recreate the handle with `zeroar.attach(run.id)`. The
runtime owns the run and its history; the handle is a convenience over the
public API.

## Public surface

- `createZeroAR`, `ZeroAR` and `RunHandle` for application integration.
- Run control through steer, redirect, answer and cancel.
- Durable result, event and verification-plan reads.
- `defineAgent`, `defineTool`, `defineValidator` and `definePosture` builders.
- Project loading, locking, scaffolding and publication helpers.
- Domain-pack, orchestration and research-orchestration compilers.
- Publication-bound memory handles.

Use the generated client directly when the application needs a route that the
facade does not wrap.

## What this does not establish

The SDK does not decide what correct means. A verified result requires the
task contract's admitted validators or named people to pass. Creating a run
does not grant model, tool or effect authority, and the SDK never places a
provider credential in a manifest or model context.

## Where to go next

- Use [`@zero-ar/validator-kit`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/validator-kit)
  to define and exercise completion rules.
- Use [`@zero-ar/tool-kit`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/tool-kit)
  to define and host a tool.
- Use [`@zero-ar/client`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/client)
  for the complete native API.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
