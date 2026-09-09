/**
 * The generated public-export verifier.
 *
 * What this is: it rehashes every public file and checks the source binding.
 * How it fits: a clone can verify the export without the private repository.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'public-export-manifest.json'), 'utf8'));
const release = JSON.parse(readFileSync(join(root, 'release/package-release-manifest.json'), 'utf8'));
const identity = JSON.parse(readFileSync(join(root, 'release/package-release-identity-report.json'), 'utf8'));
const exercise = JSON.parse(readFileSync(join(root, 'release/package-release-exercise-report.json'), 'utf8'));
const files = walk(root).filter((path) => relative(root, path) !== 'public-export-manifest.json').map((path) => ({
  path: relative(root, path),
  bytes: statSync(path).size,
  sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
})).sort((left, right) => left.path.localeCompare(right.path));
assert.equal(manifest.schema, 'zero-ar-public-developer-kit/v1');
assert.equal(manifest.source.commit, readFileSync(join(root, 'SOURCE_COMMIT'), 'utf8').trim());
assert.equal(manifest.source.commit, release.source.commit);
assert.equal(manifest.source.package_set_ref, release.package_set_ref);
assert.equal(manifest.source.commit, identity.source_commit);
assert.equal(manifest.source.package_set_ref, identity.release_manifest_ref);
const { package_set_ref: releaseRef, ...unsignedRelease } = release;
assert.equal(releaseRef, 'sha256:' + createHash('sha256').update(canonical(unsignedRelease)).digest('hex'));
const { report_ref: identityRef, ...unsignedIdentity } = identity;
assert.equal(identityRef, 'sha256:' + createHash('sha256').update(canonical(unsignedIdentity)).digest('hex'));
const { report_ref: exerciseRef, ...unsignedExercise } = exercise;
assert.equal(exerciseRef, 'sha256:' + createHash('sha256').update(canonical(unsignedExercise)).digest('hex'));
assert.equal(exerciseRef, manifest.source.package_exercise_ref);
assert.equal(exercise.release_manifest_ref, manifest.source.package_set_ref);
assert.deepEqual(exercise.refusals, []);
assert.equal(exercise.consumer.outside_workspace, true);
assert.equal(exercise.consumer.isolated, true);
assert.equal(exercise.consumer.emitted_javascript_only, true);
assert.equal(exercise.consumer.openapi_contract_ok, true);
assert.equal(exercise.consumer.command_help_ok, true);
assert.equal(exercise.consumer.declarations_ok, true);
assert.equal(manifest.destination.repository, 'https://github.com/zero-ar-labs/ar-kit');
assert.equal(manifest.destination.history, 'fresh');
assert.equal(manifest.distribution.npm_publication, 'not-performed');
assert.equal(manifest.distribution.package_count, 9);
assert.deepEqual(manifest.files, files);
const { export_ref: ignored, ...unsigned } = manifest;
assert.equal(manifest.export_ref, 'sha256:' + createHash('sha256').update(canonical(unsigned)).digest('hex'));
for (const entry of manifest.packages) {
  const packageManifest = JSON.parse(readFileSync(contained(entry.workspace_path + '/package.json'), 'utf8'));
  assert.equal(packageManifest.name, entry.name);
  assert.equal(packageManifest.version, entry.version);
  assert.equal(packageManifest.repository.url, 'git+https://github.com/zero-ar-labs/ar-kit.git');
  assert.equal(entry.manifest_ref, 'sha256:' + createHash('sha256').update(canonical(packageManifest)).digest('hex'));
  assert.equal(createHash('sha256').update(readFileSync(contained(entry.tarball_path))).digest('hex'), entry.tarball_sha256);
  const exercised = exercise.packages.find((candidate) => candidate.name === entry.name);
  assert.equal(exercised.tarball_path, entry.tarball_path);
  assert.equal(exercised.sha256, entry.tarball_sha256);
}
for (const file of files) {
  assert.ok(!file.path.endsWith('.ts') || file.path.endsWith('.d.ts'), file.path + ' carries TypeScript implementation source.');
  assert.ok(!file.path.includes('.test.') && !file.path.startsWith('docs/sessions/') && !['fixtures', 'fixture', 'governance'].some((part) => file.path.split('/').includes(part)), file.path + ' carries an internal test or record.');
  if (/\.(?:d\.ts|js|json|md|mjs|ya?ml)$/.test(file.path) || ['LICENSE', 'NOTICE', 'SOURCE_COMMIT', '.gitignore'].includes(file.path)) {
    const text = readFileSync(contained(file.path), 'utf8');
    const machineRoots = ['/' + 'Users/', '/home/' + 'runner/', '/private/' + 'tmp/'];
    assert.ok(!machineRoots.some((part) => text.includes(part)), file.path + ' carries a build-machine path.');
    assert.ok(!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text), file.path + ' carries private key material.');
    assert.ok(!/\bsk-[A-Za-z0-9_-]{12,}\b/.test(text), file.path + ' carries credential-shaped text.');
  }
}
console.log('public-export: 9 packages and ' + files.length + ' files match ' + manifest.source.commit + '.');

function walk(path) {
  const found = [];
  for (const name of readdirSync(path)) {
    if (name === '.git' || name === 'node_modules') continue;
    const entry = join(path, name);
    if (statSync(entry).isDirectory()) found.push(...walk(entry));
    else found.push(entry);
  }
  return found;
}

function contained(path) {
  const target = resolve(root, path);
  assert.ok(target === resolve(root) || target.startsWith(resolve(root) + '/'), path + ' escapes the public export root.');
  return target;
}

function canonical(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map((entry) => canonical(entry === undefined ? null : entry)).join(',') + ']';
  return '{' + Object.keys(value).filter((key) => value[key] !== undefined).sort().map((key) => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}';
}
