#!/usr/bin/env node
/**
 * The command entrypoint.
 *
 * Junior guide: this is the command a person types. It hands all behaviour
 * to main.ts; in a release bundle this call is the only invocation.
 */
import { runCliAndExit } from "./main.js";
runCliAndExit();
