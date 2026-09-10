/**
 * The one-release npm-workflow verifier.
 *
 * What this is: checks the public-alpha publisher before it can run.
 * How it fits: the operational commit may add publication plumbing, while the
 * package bytes remain fixed at the already verified public-export commit.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const workflow = readFileSync(`${root}/.github/workflows/publish-alpha-v0.1.0.yml`, 'utf8');
const packages = ['contracts', 'client', 'conformance', 'testkit', 'tool-kit', 'validator-kit', 'sdk', 'cli', 'mcp'];

assert.match(workflow, /branches: \[codex\/publish-alpha-v0\.1\.0\]/);
assert.match(workflow, /ZERO_AR_SOURCE_COMMIT: 30ea6e0b1b9ec8f9147a06c7e456a1ec516cc41d/);
assert.match(workflow, /ZERO_AR_PUBLIC_KIT_COMMIT: 1a93ee8295b4a6bcadac46a475bb8c0c89061e99/);
assert.match(workflow, /ref: 1a93ee8295b4a6bcadac46a475bb8c0c89061e99/);
assert.match(workflow, /contents: read/);
assert.match(workflow, /id-token: write/);
assert.doesNotMatch(workflow, /contents: write|packages: write|workflow_dispatch:|--tag latest/);
assert.equal((workflow.match(/npm publish /g) ?? []).length, packages.length);
assert.equal((workflow.match(/--tag alpha --provenance/g) ?? []).length, packages.length);
assert.match(workflow, /npm run check/);
assert.match(workflow, /NODE_AUTH_TOKEN: \$\{\{ secrets\.NPM_TOKEN \}\}/);

let previous = -1;
for (const name of packages) {
  const marker = `npm publish ./release/tarballs/zero-ar-${name}-0.1.0.tgz`;
  const index = workflow.indexOf(marker);
  assert.ok(index > previous, `${name} must publish once in dependency order.`);
  previous = index;
}

console.log('npm-publication-workflow: nine v0.1.0 tarballs remain source-bound, alpha-only and provenance-required.');
