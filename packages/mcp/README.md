# `@zero-ar/mcp`

This package exposes published Zero-AR work through MCP `2026-07-28` and
imports reviewed MCP tools and resources through immutable discovery
snapshots. It is an adapter over the native API. It owns no run, task,
quality, effect, artifact or cancellation state.

See the [package guide](../../docs/npm-packages.md) for where it fits in the
public package set.

## Server path

`createZeroARMcpServer` receives one tenant, one immutable binding ref and a
bounded list of published work entrypoints. The caller supplies a tenant-bound
native client after authenticating the channel. Discovery lists those
entrypoints only. Tool calls create deferred native runs with the caller's
idempotency key. Task reads, answers, cancellation, results and notifications
all resolve from the native client.

The hosted Full Cell mounts this handler only when the tenant configuration
sets `mcp.enabled` to `true` and startup verifies the binding, scopes and exact
agent publications. A disabled tenant has no MCP route and no polling loop.

## Client path

`discoverMcpPeer` uses the official MCP client with the exact modern revision.
It requires two deployment-owned ports:

- a credential resolver that receives a `secret://` reference before each
  request and returns the current bearer value; and
- an egress port that receives the immutable destination ref and sends the
  already bounded request through the deployment's network policy.

The function follows no redirect and retains no credential. It bounds request
and response bytes, headers, JSON depth, strings, collections, compression
expansion and validation time. Its result is a content-addressed
`McpPeerSnapshot`. Discovery is not admission.

Use `compileMcpToolImport` or `compileMcpResourceImport` to make a dry-run
native publication plan. A reviewer chooses operation class and authority.
Remote names, descriptions and annotations grant nothing. Only
`admitMcpToolImport` or `admitMcpResourceImport` attaches a separate admission
ref. Active work pins both the snapshot and execution binding.

Prompt import is omitted. Peer prompts never become agent instructions or
skills. Remote MCP results remain peer claims until native validators establish
the local result.

## Native-only product operations

MCP remains a bounded work-entrypoint adapter. Product backends use the
generated native client for tenant administration, runtime artifact upload,
external observations, steer and redirect, complete audit reads and effect
authority. In particular, do not translate a generic MCP task answer into an
effect approval. Address the prepared effect through
`ZeroARClient.decideEffect`, repeat its exact descriptor fields and supply the
independently issued participant credential required by the native route.

Keeping this operation native preserves the two identities involved. The
tenant bearer authorizes the application, while the participant credential
identifies the approver. The resulting authority decision is durable before
the existing effect dispatcher may cross the owner boundary. Its response says
only that the decision was recorded; dispatch outcome and receipt remain on
the native record and result surfaces.
