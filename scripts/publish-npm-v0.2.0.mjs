/**
 * The one-release npm operator.
 *
 * What this is: publishes missing v0.2.0 tarballs and verifies the registry.
 * How it fits: the workflow pins the package bytes while this operator makes
 * partial publication resumable without accepting a mismatched package.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const version = '0.2.0';
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
].map(([slug, name]) => ({
  name,
  path: `release/tarballs/zero-ar-${slug}-${version}.tgz`,
}));
const planOnly = process.argv.includes('--plan');
const scanTimeoutMs = positiveInteger(process.env.ZERO_AR_NPM_SCAN_TIMEOUT_MS, 20 * 60 * 1_000);
const observationIntervalMs = positiveInteger(process.env.ZERO_AR_NPM_SCAN_INTERVAL_MS, 15_000);

if (!planOnly) {
  const identity = npm(['whoami']);
  assert.equal(identity.status, 0, `npm authentication failed: ${identity.stderr.trim()}`);
  console.log(`npm-release: authenticated as ${identity.stdout.trim()}.`);
}

for (const releasePackage of packages) {
  const expectedIntegrity = tarballIntegrity(releasePackage.path);
  const current = registryMetadata(releasePackage.name);
  if (current !== undefined) {
    assertPublishedPackage(releasePackage.name, current, expectedIntegrity, false);
    console.log(`npm-release: ${releasePackage.name}@${version} already matches the immutable tarball.`);
    continue;
  }

  if (planOnly) {
    console.log(`npm-release: ${releasePackage.name}@${version} requires publication.`);
    continue;
  }

  const publication = npm([
    'publish',
    releasePackage.path,
    '--access',
    'public',
    '--tag',
    'latest',
    '--provenance',
  ], 'inherit');
  assert.equal(publication.status, 0, `${releasePackage.name}@${version} publication failed.`);
  await observePublishedPackage(releasePackage.name, expectedIntegrity);
}

if (planOnly) {
  console.log('npm-release: plan complete. No package was published.');
  process.exit(0);
}

for (const releasePackage of packages) {
  const metadata = await observePublishedPackage(releasePackage.name, tarballIntegrity(releasePackage.path));
  assertPublishedPackage(releasePackage.name, metadata, tarballIntegrity(releasePackage.path), true);
}

console.log('npm-release: nine v0.2.0 packages match the immutable tarballs, latest tags and provenance requirements.');

async function observePublishedPackage(name, expectedIntegrity) {
  const deadline = Date.now() + scanTimeoutMs;
  while (Date.now() <= deadline) {
    const metadata = registryMetadata(name);
    if (metadata !== undefined) {
      try {
        assertPublishedPackage(name, metadata, expectedIntegrity, true);
        return metadata;
      } catch (error) {
        if (Date.now() + observationIntervalMs > deadline) throw error;
      }
    }
    console.log(`npm-release: ${name}@${version} is still undergoing publish-time scanning.`);
    await new Promise((resolve) => setTimeout(resolve, observationIntervalMs));
  }
  throw new Error(`${name}@${version} was not available within ${scanTimeoutMs}ms.`);
}

function assertPublishedPackage(name, metadata, expectedIntegrity, requireLatest) {
  assert.equal(metadata.version, version, `${name} exposes an unexpected version.`);
  assert.equal(metadata['dist.integrity'], expectedIntegrity, `${name} does not match the immutable tarball.`);
  assert.ok(metadata['dist.attestations']?.provenance?.predicateType, `${name} has no provenance attestation.`);
  if (requireLatest) {
    assert.equal(metadata['dist-tags']?.latest, version, `${name} does not expose latest at ${version}.`);
  }
}

function registryMetadata(name) {
  const result = npm([
    'view',
    `${name}@${version}`,
    'version',
    'dist-tags',
    'dist.integrity',
    'dist.attestations',
    '--json',
    '--prefer-online',
  ]);
  if (result.status !== 0) {
    if (/\bE404\b|Not Found|No match found/.test(result.stderr)) return undefined;
    throw new Error(`${name} registry observation failed: ${result.stderr.trim()}`);
  }
  return JSON.parse(result.stdout);
}

function tarballIntegrity(path) {
  return `sha512-${createHash('sha512').update(readFileSync(path)).digest('base64')}`;
}

function npm(args, stdio = 'pipe') {
  return spawnSync('npm', args, {
    encoding: 'utf8',
    stdio,
  });
}

function positiveInteger(value, fallback) {
  if (value === undefined) return fallback;
  const parsed = Number.parseInt(value, 10);
  assert.ok(Number.isSafeInteger(parsed) && parsed > 0, `Expected a positive integer, received ${value}.`);
  return parsed;
}
