# Using Zero-AR v0.1.0

## The release in one minute

Zero-AR holds a piece of long-running model and tool work under one run ID. It
keeps the objective, history, limits, interventions and checks together until
the run finishes, stops, or waits for a person.

For an executive, the operating model is:

1. Define the objective and what the result must satisfy.
2. Give the run approved models, tools and source material.
3. Start the work and keep the run ID.
4. Let people and applications observe, steer or answer gaps without replacing
   the history.
5. Retrieve a result that says what passed, what did not and what remains
   unresolved.

The Public Alpha has two distribution halves:

- The public `ar-kit` repository and npm packages are the integration surface.
- Local Lite and Full Cell are runtime distributions supplied separately to
  approved alpha operators.

The packages do not contain the server. A team needs a Local Lite installation,
a Full Cell deployment, or a Zero-AR endpoint before the SDK and CLI can run
work.

## Choose the operating profile

| Profile | Best for | Storage and shape | Current access |
| --- | --- | --- | --- |
| Local Lite | Evaluation, development and work on one machine | SQLite, loopback server, one local installation | Signed release bundle supplied to approved operators |
| Full Cell | A self-hosted pilot with tenant isolation | Container image, PostgreSQL and supervised child hosts | Container package supplied to approved operators |
| Hosted | A managed endpoint | Operated service | Not available in v0.1.0 |

Local Lite and Full Cell use the same public run and result contracts. Moving
an application between them changes the endpoint configuration, not the run
control API.

## Path A: evaluate on one machine

Ask the release operator for these v0.1.0 files:

- `zero-ar-local-lite-0.1.0.tar.gz`
- `zero-ar-local-lite-0.1.0.tar.gz.asc`
- `install-zeroar.sh`
- `install-zeroar.sh.asc`
- `SHA256SUMS`

The public verification key is
[`release/zero-ar-release-key.asc`](../release/zero-ar-release-key.asc). Its
fingerprint is:

```text
7E5F E757 54B2 36B5 3FDF 5A1C A050 DB8D 0B81 7918
```

Import the key and verify the installer before running it:

```bash
gpg --import release/zero-ar-release-key.asc
gpg --verify install-zeroar.sh.asc install-zeroar.sh
```

Install into a directory you own:

```bash
PREFIX="$PWD/.zero-ar-install" \
ZERO_AR_RELEASE_KEY=release/zero-ar-release-key.asc \
sh install-zeroar.sh install \
  zero-ar-local-lite-0.1.0.tar.gz \
  zero-ar-local-lite-0.1.0.tar.gz.asc
```

Check the profile, then start a deterministic first run. It needs no model
credential or network call:

```bash
./.zero-ar-install/bin/zeroar profile
./.zero-ar-install/bin/zeroar doctor
./.zero-ar-install/bin/zeroar run \
  "Reconcile the open items and report what remains unverified"
```

The command prints a run ID. Keep it:

```bash
./.zero-ar-install/bin/zeroar inspect run_<id>
./.zero-ar-install/bin/zeroar records run_<id>
./.zero-ar-install/bin/zeroar result run_<id> --json
```

Local project state stays in `.zero-ar`. Export a run before moving or
removing the installation:

```bash
./.zero-ar-install/bin/zeroar export run_<id> --out run-bundle.ndjson
```

## Path B: connect an application

Install the SDK:

```bash
npm install @zero-ar/sdk@0.1.0
```

Configure the endpoint outside source code:

```bash
export ZERO_AR_URL=https://your-zero-ar.example
export ZERO_AR_API_KEY=your-application-key
```

Create and retain a run ID:

```js
import { createZeroAR } from '@zero-ar/sdk';

const zeroar = createZeroAR({
  endpoint: process.env.ZERO_AR_URL,
  apiKey: process.env.ZERO_AR_API_KEY,
});

const run = await zeroar.run({
  objective: 'Examine the records, investigate anomalies and stop only when the totals balance.',
  items: ['record-001', 'record-002', 'record-003'],
});

console.log(run.id);
console.log(await run.result({ wait: true }));
```

Another process can later attach with only the endpoint, application
credential and run ID:

```js
const previousRun = zeroar.attach(savedRunId);
await previousRun.steer('Prioritize the discrepancy in batch 42.');
console.log(await previousRun.result({ wait: true }));
```

The application process does not hold the durable run state. Restarting it
does not create a new objective or erase the record.

## Path C: operate through the terminal

Use the npm CLI when the runtime already exists elsewhere:

```bash
npm install --global @zero-ar/cli@0.1.0
export ZERO_AR_URL=https://your-zero-ar.example
export ZERO_AR_API_KEY=your-application-key

zeroar run "Review the registered source and identify unresolved anomalies" --detach
zeroar attach run_<id>
zeroar steer run_<id> "Check the duplicate-payment cluster first"
zeroar result run_<id> --json
```

The CLI uses an explicit `--url` first, then `ZERO_AR_URL`, then bundled Local
Lite when the installed distribution contains it. A selected hosted target
never falls back to a different local run.

## Path D: prepare a Full Cell pilot

The release image is:

```text
ghcr.io/zero-ar-labs/zero-ar/full-cell:v0.1.0
```

An operator with package access must also provide PostgreSQL 15, tenant
configuration, writable volumes, application authentication, provider and
tool credential bindings, artifact storage and health monitoring. The image
is one installation boundary, not a complete tenant configuration.

Before admitting real work, record:

- the exact image digest, not only the mutable tag;
- the database and backup owner;
- the tenant and application credential owner;
- the enabled model and tool bindings;
- the task contract and validator versions;
- the artifact store and retention rule;
- the operator responsible for unresolved effects and parked gaps.

The v0.1.0 image was released with source revision
`30ea6e0b1b9ec8f9147a06c7e456a1ec516cc41d`. The release manifest and SBOM
are supplied beside the runtime artifacts.

## Implement one real workflow

Start with a read-only objective. Avoid outside writes until the team has
reviewed the work, validators and operating record.

### 1. Name the objective

Write one outcome that a reviewer can recognize:

```text
Examine these records, investigate anomalies, produce a reconciled result and
stop only when the totals balance.
```

### 2. Define done

Turn "totals balance" into explicit rules. For example:

- every declared record is accounted for;
- opening balance plus movements equals closing balance;
- every anomaly has a source reference and disposition;
- the final artifact contains no unresolved duplicate IDs.

Assign a named validator to every required rule. A model opinion may help find
problems, but it should not be the only check for arithmetic or population
coverage.

### 3. Register source material

Local Lite can register a read-only directory and freeze a content-addressed
snapshot before the model reads it:

```bash
zeroar source add ./records --name reconciliation-input --profile local-read-only
zeroar source list
zeroar source snapshot source_<id>
zeroar source preflight source_<id>
```

Use the returned source reference in the run rather than placing raw file
paths in a prompt. The snapshot records what the run was allowed to read.

### 4. Start and observe

Create the run with the published agent, source bindings, budgets and task
contract selected by the deployment. Keep the run ID in the calling system.
Observe durable records, not only transient progress text.

### 5. Intervene without replacing the history

Use `steer` to queue guidance, `redirect` to replace only the in-flight model
request, `answer` to settle a parked gap, and `cancel` to stop cooperatively.
Each control becomes part of the run record.

### 6. Read the result by status

Do not reduce the result to "the agent replied." Read the verdict, artifact,
validator findings, parked items, unresolved gaps and any effect proposals.
Only downstream systems that understand those fields should automate the next
step.

## What v0.1.0 will refuse or leave manual

- A hosted Zero-AR account does not exist yet.
- The public npm packages cannot start the source-free runtime by themselves.
- Consequential actions are recorded as proposals. The Public Alpha does not
  dispatch them.
- A missing or uncertain validator result cannot become verified completion.
- The runtime cannot make a weak domain validator correct.
- Optional environments and provider families outside the admitted profile
  refuse rather than silently change execution.

## A practical adoption sequence

| Stage | Goal | Exit condition |
| --- | --- | --- |
| 1. Local evaluation | Learn the run, intervention and result model | A deterministic run can stop, resume and export |
| 2. Read-only workflow | Connect real source material without outside writes | The result identifies passed, rejected and unresolved work |
| 3. Validator hardening | Exercise positive, negative, uncertain and adversarial cases | Reviewers accept the task contract and measured limits |
| 4. Full Cell pilot | Run in an owned deployment with PostgreSQL and operator controls | Backup, restore, health and credential ownership are exercised |
| 5. Consequential workflow | Prepare outside actions | Keep human dispatch outside v0.1.0 |

## Release verification

The Local Lite installer verifies its detached signature and every file in the
bundle before activation. It retains the previous version for rollback and
runs `zeroar doctor` after installation.

The public npm packages were installed and exercised from clean consumers.
Their registry publication carries npm provenance. The source-bound package
tarballs remain under [`release/tarballs`](../release/tarballs) for independent
comparison.

See [PROVENANCE.md](../PROVENANCE.md), the [package guide](./npm-packages.md)
and the [OpenAPI contract](../packages/client/openapi/zero-ar-v1.openapi.json)
for the machine-facing release boundary.
