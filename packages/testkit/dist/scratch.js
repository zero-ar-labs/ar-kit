import { mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const SUITE_ROOT = join(tmpdir(), 'zero-ar-suite');
const PROCESS_ROOT = join(SUITE_ROOT, String(process.pid));
let prepared = false;
function holds(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        return error.code === 'EPERM';
    }
}
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
export function scratchDir(prefix) {
    prepare();
    return mkdtempSync(join(PROCESS_ROOT, prefix));
}
export function scratchRoot() {
    return PROCESS_ROOT;
}
