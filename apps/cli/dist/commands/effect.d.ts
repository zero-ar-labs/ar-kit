/**
 * The effect command.
 *
 * What this is: the terminal home of effect authority acts. effect targets
 * lists the targets the runtime's effect plane can dispatch to, through the
 * client, and says absent where no effect plane is attached. Grant re-issue
 * and grant revocation retired with their routes under the autonomy plan,
 * rule 2.
 *
 * How it fits: runCli asks this module before its built-in dispatch, so
 * effect targets reaches the runtime the command targets, bundled or hosted.
 */
import type { CliCommandModule } from './command.js';
export declare const effectCommand: CliCommandModule;
