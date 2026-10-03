/**
 * The cross-run memory operator command.
 *
 * What this is: local key-file setup and rotation preparation, plus the
 * public assertion, history, erasure, transfer, run-read and health journeys.
 * Key and transfer material is written once to a mode-0600 file and is never
 * printed.
 *
 * How it fits: local operations finish before a runtime starts. Every
 * service operation reaches only generated @zero-ar/client methods.
 */
import type { CliCommandModule } from './command.js';
export declare const memoryCommand: CliCommandModule;
