/**
 * The public command target resolver.
 *
 * What this is: the one pure decision that chooses an explicit hosted URL,
 * the ZERO_AR_URL environment value, or bundled Local Lite in that order.
 *
 * How it fits: the client opens the selected target. This file never reads a
 * secret, starts a process, opens a socket, or falls back after selection.
 * Junior guide: add connection syntax here, then prove its precedence before
 * teaching any command about it.
 */
import { refuse } from "./diagnostics.js";
import { resolveProductEnvironment } from "./product-identity-env.js";
const HOSTED_AUTH_ARGUMENTS = ['--api-key', '--tenant-api-key', '--authorization'];
/** Resolve one target and remove only its connection argument from command input. */
export function resolveCommandTarget(input) {
    refuseHostedAuthArguments(input.arguments);
    const explicit = explicitUrl(input.arguments);
    const command_arguments = withoutUrlArgument(input.arguments);
    if (explicit !== undefined) {
        return {
            target: { mode: 'hosted', source: 'explicit-url', base_url: normalizeBaseUrl(explicit, '--url') },
            command_arguments,
        };
    }
    const configured = resolveProductEnvironment('URL', input.environment);
    if (configured.value?.trim()) {
        return {
            target: { mode: 'hosted', source: 'environment-url', base_url: normalizeBaseUrl(configured.value, configured.name) },
            command_arguments,
        };
    }
    return {
        target: { mode: 'bundled', source: 'bundled-default', base_url: null },
        command_arguments,
    };
}
function refuseHostedAuthArguments(args) {
    const forbidden = HOSTED_AUTH_ARGUMENTS.find((name) => args.some((argument) => argument === name || argument.startsWith(`${name}=`)));
    if (!forbidden)
        return;
    refuse({
        code: 'cli.target.auth.argument-forbidden',
        message: `hosted authentication cannot be read from ${forbidden}. Set ZERO_AR_API_KEY in the invoking process instead.`,
        path: forbidden,
        alternatives: ['ZERO_AR_API_KEY'],
        clause: 'DXI-038',
    });
}
function explicitUrl(args) {
    const positions = args.flatMap((value, index) => value === '--url' ? [index] : []);
    if (positions.length > 1) {
        refuse({
            code: 'cli.target.url.repeated',
            message: 'the command declares more than one --url target. Keep one explicit target so routing is unambiguous.',
            path: '--url',
            clause: 'DXI-037',
        });
    }
    const position = positions[0];
    if (position === undefined)
        return undefined;
    const value = args[position + 1];
    if (!value || value.startsWith('--')) {
        refuse({
            code: 'cli.target.url.missing',
            message: '--url has no endpoint. Pass one HTTP or HTTPS base URL, or remove --url to use ZERO_AR_URL or bundled Local Lite.',
            path: '--url',
            alternatives: ['--url https://cell.example', 'ZERO_AR_URL', 'bundled Local Lite'],
            clause: 'DXI-037',
        });
    }
    return value;
}
function withoutUrlArgument(args) {
    const position = args.indexOf('--url');
    if (position < 0)
        return [...args];
    return args.filter((_, index) => index !== position && index !== position + 1);
}
function normalizeBaseUrl(value, path) {
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        refuse({
            code: 'cli.target.url.invalid',
            message: `${path} is not an absolute URL. Pass an HTTP or HTTPS base URL.`,
            path,
            alternatives: ['https://cell.example'],
            clause: 'DXI-037',
        });
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
        refuse({
            code: 'cli.target.url.unsupported',
            message: `${path} must be an HTTP or HTTPS base URL without credentials, query parameters, or a fragment.`,
            path,
            alternatives: ['https://cell.example'],
            clause: 'DXI-037',
        });
    }
    return parsed.href.replace(/\/$/, '');
}
