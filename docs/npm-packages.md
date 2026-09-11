# The Zero-AR npm packages

You do not need nine packages to use Zero-AR.

The package set separates application code, operator tools, public contracts,
extensions and test helpers. This keeps a production application from pulling
in MCP libraries, development fixtures or adapter test batteries it does not
use. Install the package that matches your job. npm installs its required
dependencies.

All packages in the Public Alpha are version `0.1.0`, require Node.js 23.6 or
later, use ES modules and carry Apache-2.0 licensing. npm currently resolves
both the `alpha` and `latest` tags to `0.1.0`. Pin `0.1.0` while the release is
a prerelease.

## Pick one starting point

| I want to... | Install | Why |
| --- | --- | --- |
| Start and follow work from my TypeScript application | `@zero-ar/sdk` | Highest-level application API and durable run handles |
| Run commands in a terminal or CI job | `@zero-ar/cli` | Start, inspect, steer, resume, export and administer work |
| Call every native route directly | `@zero-ar/client` | Generated typed client, event streaming and OpenAPI 3.1 |
| Connect Zero-AR and an MCP host | `@zero-ar/mcp` | Bounded work entrypoints and reviewed capability import |
| Build a callable tool | `@zero-ar/tool-kit` | One typed definition for schema, manifest, host and fixtures |
| Build a task validator | `@zero-ar/validator-kit` | Validator declaration, input identity and labelled cases |
| Implement an execution-environment adapter | `@zero-ar/conformance` | Public adapter conformance battery |
| Test my integration without provider spend | `@zero-ar/testkit` | Scripted adapters, logical time, seeded data and scratch state |
| Generate a custom binding or inspect protocol types | `@zero-ar/contracts` | Canonical schemas, IDs, vocabulary and state machines |

## How the packages relate

```text
@zero-ar/contracts
├── @zero-ar/client
│   ├── @zero-ar/sdk
│   │   └── @zero-ar/cli
│   └── @zero-ar/mcp
├── @zero-ar/conformance
├── @zero-ar/testkit
├── @zero-ar/tool-kit
│   └── @zero-ar/mcp
└── @zero-ar/validator-kit
```

This is a dependency map, not a setup checklist. An application that installs
`@zero-ar/sdk` receives `client` and `contracts` automatically.

## Application and operator packages

### `@zero-ar/sdk`

The default package for a TypeScript application.

It creates a configured Zero-AR handle, starts or attaches to runs, streams
durable events and retrieves typed results. It also exports builders for agent,
tool, validator and posture declarations, plus authored sequential and research
orchestration helpers.

```bash
npm install @zero-ar/sdk@0.1.0
```

It does not open PostgreSQL, own a model loop or keep another copy of run
state. Every operation goes through the public client to a running endpoint.

### `@zero-ar/cli`

The terminal surface for operators, developers and automation.

It can start, attach, inspect, steer, redirect, answer, resume, cancel, fork,
re-execute, rebuild, export and import work. It also exposes publication,
source, provider, tool-source and environment administration.

```bash
npm install --global @zero-ar/cli@0.1.0
zeroar help
```

The npm package is an API client. It needs `--url`, `ZERO_AR_URL`, or an
already installed distribution that carries bundled Local Lite. Installing
the npm CLI by itself does not install the runtime server.

### `@zero-ar/client`

The low-level TypeScript client generated from the native route table.

Use it when you need exact control over public routes, cursored event streams,
artifact upload, run export and import, or administration. A refused request
throws the same structured diagnostic the server produced.

```bash
npm install @zero-ar/client@0.1.0
```

The same package exports the OpenAPI 3.1 document at
`@zero-ar/client/openapi`. Teams using Python, Go, Java or another language can
generate a client from that contract without adopting the TypeScript SDK.

### `@zero-ar/mcp`

An adapter between MCP and the native Zero-AR API.

The server side exposes a bounded set of published work entrypoints. The
client side discovers external MCP tools and resources, freezes discovery into
an immutable snapshot and requires a separate admission decision before use.
MCP does not own run, quality, effect, artifact or cancellation state.

Install it only when MCP is part of the integration:

```bash
npm install @zero-ar/mcp@0.1.0
```

## Extension packages

### `@zero-ar/tool-kit`

For authors of tools Zero-AR may call.

One definition supplies the input and output schemas, manifest, handler types,
development host and conformance fixtures. Tool handlers run outside the
runtime process. A tool can observe or propose an effect according to its
declared operation class, but the package grants no effect authority.

```bash
npm install @zero-ar/tool-kit@0.1.0
```

### `@zero-ar/validator-kit`

For authors who define how a result is checked.

It supplies typed validator declarations, a content-addressed manifest of the
input examined by a validator, grounding and classification helpers and a
runner for labelled positive, negative, indeterminate and adversarial cases.

```bash
npm install @zero-ar/validator-kit@0.1.0
```

A validator reports a finding. It cannot promote a run, write runtime state or
dispatch an effect. The Quality Plane admits the finding and decides whether
the task contract is satisfied.

## Foundation and test packages

### `@zero-ar/contracts`

The canonical public schemas, identifiers, vocabulary, routes, state machines
and diagnostic envelopes.

Most application developers receive this package through `sdk` or `client`.
Install it directly when implementing a custom binding, adapter or protocol
consumer that must use the exact Zero-AR payloads.

### `@zero-ar/testkit`

Deterministic fixtures for integration tests. It includes a scripted adapter,
logical clock, seeded populations and self-cleaning scratch directories. It
lets a test exercise failure and recovery paths without a provider credential,
network call or wall-clock dependency.

It is development support, not a production runtime.

### `@zero-ar/conformance`

The public conformance battery for third-party execution-environment adapters.
It reports whether an adapter follows the declared protocol and lifecycle.

Conformance is not domain correctness. Passing it does not say that an agent's
answer is correct or that an environment meets a security certification.

## Common combinations

### Add durable work to an application

```bash
npm install @zero-ar/sdk@0.1.0
```

Nothing else is required directly.

### Build and test a custom tool

```bash
npm install @zero-ar/tool-kit@0.1.0
npm install --save-dev @zero-ar/testkit@0.1.0
```

### Build and exercise a validator

```bash
npm install @zero-ar/validator-kit@0.1.0
npm install --save-dev @zero-ar/testkit@0.1.0
```

### Generate a non-TypeScript client

Use [`packages/client/openapi/zero-ar-v1.openapi.json`](../packages/client/openapi/zero-ar-v1.openapi.json)
directly, or install `@zero-ar/client` and resolve the
`@zero-ar/client/openapi` export.

## Why not one large package?

The boundaries carry meaning:

- Application code does not need development fixtures or adapter batteries.
- A tool host does not need run-control or provider-administration code.
- A validator cannot gain runtime write access by importing its authoring kit.
- MCP stays an optional protocol adapter rather than a second runtime API.
- Third parties can implement or test one extension surface without importing
  the private server.

The public experience should still feel like one product. That is why the SDK
and CLI are the documented starting points and the remaining packages appear
only when a team extends or tests a boundary.
