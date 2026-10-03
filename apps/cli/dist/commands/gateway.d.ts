/**
 * The gateway command.
 *
 * What this is: zeroar gateway serve <config.json> runs the channel gateway
 * host, which turns signed webhooks and team messages into public run
 * operations, and zeroar gateway test <config.json> checks its secret
 * references and endpoint without creating a run or calling a model.
 *
 * How it fits: the gateway host ships as its own release entry, which this
 * command spawns and waits on (decision J-1), so the command keeps importing
 * only the contracts and the client. The host receives only the environment
 * variables its configuration names, and its output and exit code are the
 * command's own.
 */
import type { CliCommandModule } from './command.js';
export declare const gatewayCommand: CliCommandModule;
