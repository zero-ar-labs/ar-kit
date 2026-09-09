/**
 * Scratch directories that remove themselves.
 *
 * What this is: every fixture tree a test builds lives under one root per
 * test process. The root goes away when that process exits, and a root whose
 * process is gone is swept by the next run, so an interrupted or killed
 * runner still leaves nothing behind.
 *
 * How it fits: the suite builds hundreds of fixture trees per run. Left in
 * place they fill the disk, and the next run then fails for a reason that
 * has nothing to do with the code under test.
 */
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SUITE_ROOT = join(tmpdir(), 'zero-ar-suite');
const PROCESS_ROOT = join(SUITE_ROOT, String(process.pid));
let prepared = false;
/** True when a process still holds the pid, so its root is not ours to remove. */
function holds(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        return error.code === 'EPERM';
    }
}
/** Drop roots left by runs whose process no longer holds the pid. */
function sweep() {
    let names;
    try {
        names = readdirSync(SUITE_ROOT);
    }
    catch {
        return;
    }
    for (const name of names) {
        const pid = Number(name);
        if (!Number.isInteger(pid) || pid <= 0 || pid === process.pid || holds(pid))
            continue;
        rmSync(join(SUITE_ROOT, name), { recursive: true, force: true });
    }
}
function prepare() {
    if (prepared)
        return;
    prepared = true;
    mkdirSync(PROCESS_ROOT, { recursive: true });
    process.on('exit', () => rmSync(PROCESS_ROOT, { recursive: true, force: true }));
    sweep();
}
/**
 * One fixture directory, removed when this process exits. The prefix names
 * the fixture so a root under inspection mid-run reads as what made it.
 */
export function scratchDir(prefix) {
    prepare();
    return mkdtempSync(join(PROCESS_ROOT, prefix));
}
/** The per-process root, for a test that asserts on cleanup itself. */
export function scratchRoot() {
    return PROCESS_ROOT;
}
