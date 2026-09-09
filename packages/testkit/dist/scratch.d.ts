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
/**
 * One fixture directory, removed when this process exits. The prefix names
 * the fixture so a root under inspection mid-run reads as what made it.
 */
export declare function scratchDir(prefix: string): string;
/** The per-process root, for a test that asserts on cleanup itself. */
export declare function scratchRoot(): string;
