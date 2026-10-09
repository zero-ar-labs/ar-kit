# `@zero-ar/client`

Call the native Zero-AR API with generated TypeScript methods, typed
diagnostics and a durable event stream that resumes from a record cursor. Use
this package when an application needs exact control over runs, publications,
sources, artifacts or administration.

The client needs an already-running Zero-AR endpoint. It does not contain the
runtime server, start Local Lite or retain a second copy of run state.

![A recorded Zero-AR run showing the durable state that the client can inspect and stream.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-work-record.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/client
```

## First working example

Inspect an existing run, then follow durable records from the beginning. A
hosted endpoint expects an application bearer key. That key is separate from
model, tool and effect credentials.

```ts
import { ZeroARClient } from '@zero-ar/client';

const client = new ZeroARClient(process.env.ZERO_AR_URL!, {
  headers: {
    authorization: `Bearer ${process.env.ZERO_AR_API_KEY}`,
  },
});

const runId = process.argv[2];
if (!runId) throw new Error('Pass a run id as the first argument.');

const snapshot = await client.snapshot(runId);
console.log(snapshot.status, snapshot.completion_state);

for await (const event of client.followRecords(runId, { after: 0 })) {
  console.log(event.seq, event.event, event.record_seq);
}
```

The stream reconnects from its last cursor after a dropped connection. It ends
at a terminal record or at a suspension that still needs an outside act.

## Public surface

- `ZeroARClient` for every generated JSON route.
- Durable record streaming through `followRecords` and `streamRecords`.
- Checksummed run and publication export and import.
- Resumable publication-blob and runtime-artifact upload.
- `DiagnosticError` responses produced by the runtime contract.
- The OpenAPI 3.1 document at `@zero-ar/client/openapi`.

```ts
import openapi from '@zero-ar/client/openapi' with { type: 'json' };

console.log(openapi.info.title, openapi.info.version);
```

## What this does not establish

The client transports commands and returns the runtime's recorded answer. It
does not grade an artifact, infer that a run completed correctly or retry a
typed refusal. Selecting a hosted target never falls back to a local runtime
after a missing key or failed connection.

## Where to go next

- Use [`@zero-ar/sdk`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/sdk)
  when a durable `RunHandle` is more useful than route-level calls.
- Use [`@zero-ar/contracts`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/contracts)
  to parse payloads at another boundary.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
