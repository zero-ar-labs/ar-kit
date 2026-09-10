/**
 * The public-alpha registry verifier.
 *
 * What this is: a bounded observer for npm's publish-time scan window.
 * How it fits: it proves that each immutable tarball became installable with
 * the alpha tag, npm's first-publication alias, and matching integrity and
 * provenance metadata.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const packages = [
  ['contracts', '@zero-ar/contracts'],
  ['client', '@zero-ar/client'],
  ['conformance', '@zero-ar/conformance'],
  ['testkit', '@zero-ar/testkit'],
  ['tool-kit', '@zero-ar/tool-kit'],
  ['validator-kit', '@zero-ar/validator-kit'],
  ['sdk', '@zero-ar/sdk'],
  ['cli', '@zero-ar/cli'],
  ['mcp', '@zero-ar/mcp'],
];
const scanTimeoutMs = parsePositiveInteger(process.env.ZERO_AR_NPM_SCAN_TIMEOUT_MS, 20 * 60 * 1_000);
const observationIntervalMs = parsePositiveInteger(process.env.ZERO_AR_NPM_SCAN_INTERVAL_MS, 15_000);
const deadline = Date.now() + scanTimeoutMs;

let metadata;
while (Date.now() <= deadline) {
  metadata = packages.map(([, name]) => registryMetadata(name));
  if (metadata.every((entry) => entry !== undefined)) break;
  const pending = packages.filter((_, index) => metadata[index] === undefined).map(([, name]) => name);
  console.log(`npm-alpha: ${pending.length} package${pending.length === 1 ? '' : 's'} still undergoing publish-time scanning.`);
  await new Promise((resolve) => setTimeout(resolve, observationIntervalMs));
}

assert.ok(metadata?.every((entry) => entry !== undefined), `npm-alpha: the public package set was not available within ${scanTimeoutMs}ms.`);
for (let index = 0; index < packages.length; index += 1) {
  const [slug, name] = packages[index];
  const entry = metadata[index];
  const tarball = readFileSync(`${root}/release/tarballs/zero-ar-${slug}-0.1.0.tgz`);
  const expectedIntegrity = `sha512-${createHash('sha512').update(tarball).digest('base64')}`;
  assert.equal(entry.version, '0.1.0', `${name} exposes an unexpected version.`);
  assert.equal(entry['dist-tags']?.alpha, '0.1.0', `${name} does not expose alpha at 0.1.0.`);
  assert.equal(entry['dist-tags']?.latest, '0.1.0', `${name} exposes an unrelated version as latest.`);
  assert.equal(entry['dist.integrity'], expectedIntegrity, `${name} does not match the source-bound tarball.`);
  assert.ok(entry['dist.attestations']?.provenance?.predicateType, `${name} has no provenance attestation.`);
}

console.log('npm-alpha: 9 public packages match the source-bound tarballs, registry tags and provenance requirements.');

function registryMetadata(name) {
  const result = spawnSync('npm', ['view', `${name}@0.1.0`, 'version', 'dist-tags', 'dist.integrity', 'dist.attestations', '--json', '--prefer-online'], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    if (/\bE404\b|Not Found/.test(result.stderr)) return undefined;
    throw new Error(`${name} registry observation failed: ${result.stderr.trim()}`);
  }
  return JSON.parse(result.stdout);
}

function parsePositiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  assert.ok(Number.isSafeInteger(parsed) && parsed > 0, `Expected a positive integer, received ${value}.`);
  return parsed;
}
