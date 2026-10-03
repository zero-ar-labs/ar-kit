/**
 * The attention command.
 *
 * What this is: the terminal home of attention capacity. calibrate prints
 * an observe-only measurement of review capacity from the runtime's log,
 * publish records the next versioned capacity snapshot, current reads the
 * standing one, and dashboard prints the operator view by class.
 *
 * How it fits: every operation goes through the generated client, against
 * the bundled Local Lite server or the runtime --url names. Usage is
 * checked before any runtime starts, so a mistyped operation starts none.
 */
import type { CliCommandModule } from './command.js';
export declare const attentionCommand: CliCommandModule;
