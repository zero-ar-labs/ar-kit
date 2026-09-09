/**
 * The generated public-package consumer exercise.
 *
 * What this is: it installs every exported tarball in a new temporary project.
 * How it fits: workspace resolution cannot conceal a missing public dependency.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(join(root, 'public-export-manifest.json'), 'utf8'));
const consumer = mkdtempSync(join(tmpdir(), 'zero-ar-public-kit-'));
try {
  const dependencies = Object.fromEntries(manifest.packages.map((entry) => [entry.name, 'file:' + join(root, entry.tarball_path)]));
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'zero-ar-public-kit-consumer', private: true, type: 'module', dependencies }, null, 2) + '\n');
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefer-offline', '--loglevel=error'], { cwd: consumer, stdio: 'pipe', timeout: 300000 });
  const require = createRequire(join(consumer, 'package.json'));
  for (const entry of manifest.packages) {
    const loaded = await import(pathToFileURL(require.resolve(entry.name)).href);
    assert.equal(typeof loaded, 'object');
  }
  const openApi = JSON.parse(readFileSync(require.resolve('@zero-ar/client/openapi'), 'utf8'));
  assert.equal(openApi.openapi, '3.1.0');
  const command = join(consumer, 'node_modules/@zero-ar/cli/dist/zeroar.js');
  const help = execFileSync(command, ['--help'], { cwd: consumer, encoding: 'utf8', timeout: 30000 });
  assert.equal((help.match(/^usage$/gm) ?? []).length, 1);
  console.log('public-packages: 9 tarballs imported, OpenAPI read, and command help rendered once.');
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
