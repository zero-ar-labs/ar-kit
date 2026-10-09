# `@zero-ar/mcp`

Expose reviewed Zero-AR work to MCP clients without creating a second owner of
that work. The package also discovers MCP peers and compiles bounded tool or
resource imports for a separate admission decision.

The native Zero-AR API still owns every run, task, quality decision, effect,
artifact and cancellation. MCP discovery grants no capability, and a remote
peer's result remains a peer claim until native validators establish the local
result.

![A recorded Zero-AR run showing the durable state that remains behind an MCP entrypoint.](https://raw.githubusercontent.com/zero-ar-labs/ar-kit/main/assets/zero-ar-work-record.svg)

## Install

Node.js 24.11.0 through the Node 24 LTS line is required.

```bash
npm install @zero-ar/mcp @zero-ar/client @zero-ar/contracts
```

## First working example

Compile one published work entrypoint and mount the MCP handler behind an
authenticated application boundary. The request body cannot choose its tenant
or replace the tenant-bound native client.

```ts
import { ZeroARClient } from '@zero-ar/client';
import {
  compileMcpPublishedWorkEntrypoint,
  contentHash,
} from '@zero-ar/contracts';
import { createZeroARMcpServer } from '@zero-ar/mcp';

const entrypoint = compileMcpPublishedWorkEntrypoint({
  name: 'research-report',
  title: 'Research report',
  description: 'Produce a cited research report.',
  publication_ref: contentHash({ publication: 'research-agent-1.0.0' }),
  agent_ref: contentHash({ agent: 'research-agent-1.0.0' }),
  accountable_principal: 'operator:research',
  input_schema: {
    type: 'object',
    properties: {
      objective: { type: 'string', maxLength: 10_000 },
    },
    required: ['objective'],
    maxProperties: 1,
    additionalProperties: false,
  },
  output_schema: {
    type: 'object',
    properties: {},
    maxProperties: 8,
    additionalProperties: true,
  },
  default_budgets: {
    model_tokens: 50_000,
    tool_calls: 100,
    attention: 2,
    verification_reserve_fraction: 0.2,
    max_turns: 12,
  },
  mcp_visible: true,
  assurance_extension_required: true,
});

const native = new ZeroARClient(process.env.ZERO_AR_URL!, {
  headers: {
    authorization: `Bearer ${process.env.ZERO_AR_API_KEY}`,
  },
});

const mcp = createZeroARMcpServer({
  tenant: 'tenant-research',
  binding_ref: contentHash({ binding: 'research-mcp-v1' }),
  entrypoints: [entrypoint],
});

export async function handleMcpRequest(
  request: Request,
  principal: string,
): Promise<Response> {
  return mcp.fetch(request, {
    tenant: 'tenant-research',
    principal,
    native,
  });
}
```

Call `mcp.close()` when the surrounding server stops. The handler stores no
run state, so rebuilding it does not replace or lose a native task.

## Public surface

### Serve reviewed work

`createZeroARMcpServer` serves MCP `2026-07-28` and the Tasks extension. It
lists only the supplied published entrypoints. A tool call creates a deferred
native run with the caller's idempotency key. Task reads, answers,
cancellation, results and notifications resolve from the tenant-bound native
client.

### Discover and import peer capabilities

`discoverMcpPeer` requires two deployment-owned ports:

- A credential resolver that receives a `secret://` reference for each
  request and returns the current bearer value.
- An egress port that sends the bounded request through the deployment's
  network policy.

Discovery returns an immutable `McpPeerSnapshot`. Use
`compileMcpToolImport` or `compileMcpResourceImport` to create a dry-run native
publication plan. A reviewer chooses operation class and authority. Only
`admitMcpToolImport` or `admitMcpResourceImport` attaches an admission ref.

Prompt import is omitted. Peer prompts never become agent instructions or
skills.

## What this does not establish

MCP remains a bounded work-entrypoint adapter. It is not a second runtime and
does not grant effect authority. Product backends use the native API for
tenant administration, runtime artifact upload, external observations,
complete audit reads and effect decisions. A generic MCP task answer cannot
stand in for an independently authorized effect decision or dispatch receipt.

## Where to go next

- Use [`@zero-ar/client`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/client)
  for the complete native API.
- Use [`@zero-ar/tool-kit`](https://github.com/zero-ar-labs/ar-kit/tree/main/packages/tool-kit)
  for a native typed tool host.
- Read the [public package map](https://github.com/zero-ar-labs/ar-kit#choose-an-entry-point)
  to choose another surface.
