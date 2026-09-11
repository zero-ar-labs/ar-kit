# ZERO-AR

### The runtime beneath long-horizon work.

One objective. Many participants. One accountable result. History preserved.

Zero-AR keeps an objective, its execution position, evidence, limits, controls
and verification state together while models, tools and people do the work.
A process may exit. A person may answer a gap hours later. Another application
may attach with the run ID. The work continues from the same record.

> **The unit is work, not the conversation.**

The application defines what done means. Zero-AR records what happened and
does not report verified completion until the declared validators pass. A
missing check, rejected item, timeout or uncertain answer stays visible in the
result.

## What shipped in v0.1.0

| Surface | What it gives you | Availability |
| --- | --- | --- |
| Public developer kit | Emitted JavaScript, TypeScript declarations, OpenAPI 3.1 and tested package tarballs | Public in this repository |
| npm packages | Nine independently installable integration and extension packages | Public as `@zero-ar/*@0.1.0` |
| Local Lite | A signed single-machine runtime bundle using SQLite | Distributed separately to approved alpha operators |
| Full Cell | A source-free container image using PostgreSQL and supervised child hosts | Distributed separately to approved alpha operators |
| Hosted service | A managed Zero-AR endpoint | Not operated in this release |

The runtime implementation and private repository history are not in this
repository. The npm packages connect to a Zero-AR endpoint or help you define
public extensions. They do not contain the runtime server.

## Start here

| You want to | Start with |
| --- | --- |
| Understand or evaluate the release | [Using Zero-AR v0.1.0](./docs/using-zero-ar-v0.1.0.md) |
| Add Zero-AR to a TypeScript application | [`@zero-ar/sdk`](https://www.npmjs.com/package/@zero-ar/sdk) |
| Operate a run from the terminal | [`@zero-ar/cli`](https://www.npmjs.com/package/@zero-ar/cli) |
| Generate a client in another language | [OpenAPI 3.1](./packages/client/openapi/zero-ar-v1.openapi.json) |
| Connect published work through MCP | [`@zero-ar/mcp`](./packages/mcp) |
| Choose among the nine packages | [Package guide](./docs/npm-packages.md) |

Most teams install one entry package, not all nine. Its dependencies are
installed automatically.

## Connect an application

Node.js 23.6 or later is required.

```bash
npm install @zero-ar/sdk@0.1.0
```

```js
import { createZeroAR } from '@zero-ar/sdk';

const zeroar = createZeroAR({
  endpoint: process.env.ZERO_AR_URL,
  apiKey: process.env.ZERO_AR_API_KEY,
});

const run = await zeroar.run({
  objective: 'Examine these records, investigate anomalies and stop only when the totals balance.',
  items: ['record-001', 'record-002', 'record-003'],
});

console.log('run id:', run.id);

for await (const record of run.events()) {
  console.log(record.seq, record.type);
}

const result = await run.result();
console.log(result.verdict, result.artifact, result.not_established);
```

The handle is a convenience, not a second store. Another process can recreate
it later with `zeroar.attach(runId)` and continue against the same durable run.

## Use the command

The npm CLI controls a running endpoint:

```bash
npm install --global @zero-ar/cli@0.1.0
export ZERO_AR_URL=https://your-zero-ar.example
export ZERO_AR_API_KEY=your-application-key

zeroar run "Reconcile the open items and report what remains unverified"
zeroar inspect run_<id>
zeroar result run_<id> --json
```

An explicit `--url` wins, then `ZERO_AR_URL`, then bundled Local Lite when the
installed distribution contains it. Once a hosted target is selected, a
connection or authentication failure refuses there. It never creates a
different local run as a fallback.

The npm CLI does not contain Local Lite. Install the signed Local Lite release
bundle when you want the command and the runtime on one machine.

## The nine packages

| Package | Role | Install it directly when |
| --- | --- | --- |
| [`@zero-ar/sdk`](./packages/sdk) | Application facade and authoring builders | Your application starts, attaches to or controls work |
| [`@zero-ar/cli`](./apps/cli) | Terminal client | A person or script operates work from a shell |
| [`@zero-ar/mcp`](./packages/mcp) | MCP adapter | You expose published work or review MCP capabilities for import |
| [`@zero-ar/client`](./packages/client) | Exact typed HTTP and event client | You need route-level control or the OpenAPI contract |
| [`@zero-ar/tool-kit`](./packages/tool-kit) | Typed tool definition and development host | You build a tool Zero-AR may call |
| [`@zero-ar/validator-kit`](./packages/validator-kit) | Validator declarations and labelled cases | You define how a task result is checked |
| [`@zero-ar/contracts`](./packages/contracts) | Shared schemas, IDs and state machines | You build a custom binding or public adapter |
| [`@zero-ar/testkit`](./packages/testkit) | Deterministic integration fixtures | You test without a model account or network |
| [`@zero-ar/conformance`](./packages/conformance) | Adapter conformance battery | You implement an execution-environment adapter |

See the [package guide](./docs/npm-packages.md) for the dependency map,
recommended combinations and the boundary of every package.

## Runtime shape

![Zero-AR architecture showing the W0 Kernel, Quality Plane, optional Effect Plane and public adapter boundaries.](./assets/zero-ar-architecture.svg)

The W0 Kernel owns the canonical work log, execution position, budgets, leases
and reconstruction. The Quality Plane evaluates the work against the task
contract. Models, tools, validators and execution environments connect through
public contracts.

The Public Alpha Effect Plane records consequential-action proposals and
refuses dispatch. Production authority, dispatch and reconciliation are not a
claim of this release.

## What Zero-AR does not decide

Zero-AR does not invent correctness. A weak validator can consistently check
the wrong thing. Validator authors still need positive, negative,
indeterminate and adversarial cases, plus domain evidence about false passes
and false rejections.

Zero-AR also does not become a model host, chat interface, workflow graph or
general domain oracle. Applications supply objectives and task contracts.
Deployments supply models, tools, credentials, validators and any authority to
affect another system.

## Verify this public kit

Every emitted package is bound to private source commit
`30ea6e0b1b9ec8f9147a06c7e456a1ec516cc41d`. The public manifest records every
exported file and package tarball.

```bash
npm run verify
npm run exercise
```

`verify` checks the byte inventory and source binding. `exercise` installs all
nine recorded tarballs in an isolated consumer, imports their public
entrypoints, reads the OpenAPI contract and runs the packaged command. See
[PROVENANCE.md](./PROVENANCE.md) for the release boundary.

## Public Alpha limits

- The hosted service is not operated yet.
- Runtime bundles and images require separate operator access.
- Consequential effects stop at a recorded proposal. Dispatch is excluded.
- OpenAI and Anthropic have account-backed evidence. OpenRouter, Together AI
  and Fireworks AI remain deferred for live-account acceptance.
- This release requires Node.js 23.6 or later.

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
