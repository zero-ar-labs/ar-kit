export function detectTier(env = process.env, isTty = process.stdout.isTTY ?? false, noColor = false) {
    if (!isTty || noColor || (env['NO_COLOR'] !== undefined && env['NO_COLOR'] !== '') || env['TERM'] === 'dumb')
        return 'none';
    const term = env['TERM'] ?? '';
    if (term.includes('256color') || env['COLORTERM'])
        return '256';
    return '16';
}
export function detectAscii(env = process.env) {
    const locale = env['LC_ALL'] ?? env['LC_CTYPE'] ?? env['LANG'] ?? '';
    return locale !== '' && !/utf-?8/i.test(locale);
}
const GLYPHS = {
    verified: { glyph: '●', ascii: '*', colour: 'verified' },
    rejected: { glyph: '✕', ascii: 'x', colour: 'rejected' },
    indeterminate: { glyph: '○', ascii: 'o', colour: 'muted' },
    unverified: { glyph: '◌', ascii: '.', colour: 'muted' },
    parked: { glyph: '⊖', ascii: '-', colour: 'muted' },
    unreconcilable: { glyph: '⊘', ascii: '/', colour: 'bold' },
};
const SGR_256 = {
    brass: '[38;5;137m',
    brassDeep: '[38;5;94m',
    verified: '[38;5;108m',
    rejected: '[38;5;174m',
    muted: '[38;5;242m',
    faint: '[38;5;246m',
};
const SGR_16 = {
    brass: '[33m',
    brassDeep: '[33m',
    verified: '[32m',
    rejected: '[31m',
    muted: '[90m',
    faint: '[90m',
};
const RESET = '[0m';
const BOLD = '[1m';
const DIM = '[2m';
export class Terminal {
    tier;
    ascii;
    constructor(tier = detectTier(), ascii = detectAscii()) {
        this.tier = tier;
        this.ascii = ascii;
    }
    colour(token, text) {
        if (this.tier === 'none')
            return text;
        if (token === 'bold')
            return `${BOLD}${text}${RESET}`;
        const table = this.tier === '256' ? SGR_256 : SGR_16;
        const code = table[token];
        return code ? `${code}${text}${RESET}` : text;
    }
    state(name, word) {
        const entry = GLYPHS[name];
        const mark = this.ascii ? entry.ascii : entry.glyph;
        const label = word ?? (name === 'unverified' ? 'unverified' : name);
        return `${this.colour(entry.colour, mark)} ${label}`;
    }
    label(text) {
        const tick = this.ascii ? '|' : '▏';
        return `${this.colour('brass', tick)} ${this.bold(text)}`;
    }
    bold(text) {
        return this.tier === 'none' ? text : `${BOLD}${text}${RESET}`;
    }
    dim(text) {
        return this.tier === 'none' ? text : `${DIM}${text}${RESET}`;
    }
    mono(text) {
        return text;
    }
    table(rows) {
        const widths = [];
        for (const row of rows) {
            row.forEach((cell, i) => {
                widths[i] = Math.max(widths[i] ?? 0, visible(cell).length);
            });
        }
        return rows
            .map((row) => row.map((cell, i) => cell + ' '.repeat((widths[i] ?? 0) - visible(cell).length)).join('  ').trimEnd())
            .join('\n');
    }
}
function visible(text) {
    return text.replace(/\[[0-9;]*m/g, '');
}
const STEERING = new RegExp('[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F\\u200B-\\u200F\\u202A-\\u202E\\u2066-\\u2069\\uFEFF]', 'g');
export function neutralize(text) {
    return text.replace(STEERING, (c) => `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}`);
}
export function neutralizeDeep(value) {
    if (typeof value === 'string')
        return neutralize(value);
    if (Array.isArray(value))
        return value.map((item) => neutralizeDeep(item));
    if (value !== null && typeof value === 'object') {
        const out = {};
        for (const [key, entry] of Object.entries(value))
            out[neutralize(key)] = neutralizeDeep(entry);
        return out;
    }
    return value;
}
export function stateFor(terminal, verdict) {
    if (terminal === 'complete' || verdict === 'verified')
        return 'verified';
    if (verdict === 'rejected')
        return 'rejected';
    if (terminal === 'unverified_artifact')
        return 'unverified';
    if (verdict === 'indeterminate')
        return 'indeterminate';
    return 'indeterminate';
}
