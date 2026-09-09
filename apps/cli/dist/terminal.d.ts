/**
 * The terminal variant of the brand, fixed here and imported everywhere.
 *
 * What this is: the state glyphs, colour tiers, tick, and emphasis rules
 * from the style guide's terminal section, decided once per the guide's own
 * instruction that they are not re-chosen per command.
 *
 * The rules that bind this file: the word is the carrier and colour and
 * glyph are redundancy, so every line survives colour being stripped.
 * NO_COLOR is honoured, non-terminal output drops to the no-colour tier,
 * sixteen-colour terminals map by meaning rather than nearest hue, no
 * background is ever set, and underline, blink, reverse, and italic do not
 * appear. Brass carries identity and interaction, never a state.
 */
export type Tier = '256' | '16' | 'none';
export declare function detectTier(env?: NodeJS.ProcessEnv, isTty?: boolean): Tier;
export declare function detectAscii(env?: NodeJS.ProcessEnv): boolean;
/** The six states: filled, crossed, open, dotted, barred, slashed. */
declare const GLYPHS: {
    readonly verified: {
        readonly glyph: "●";
        readonly ascii: "*";
        readonly colour: "verified";
    };
    readonly rejected: {
        readonly glyph: "✕";
        readonly ascii: "x";
        readonly colour: "rejected";
    };
    readonly indeterminate: {
        readonly glyph: "○";
        readonly ascii: "o";
        readonly colour: "muted";
    };
    readonly unverified: {
        readonly glyph: "◌";
        readonly ascii: ".";
        readonly colour: "muted";
    };
    readonly parked: {
        readonly glyph: "⊖";
        readonly ascii: "-";
        readonly colour: "muted";
    };
    readonly unreconcilable: {
        readonly glyph: "⊘";
        readonly ascii: "/";
        readonly colour: "bold";
    };
};
export type StateName = keyof typeof GLYPHS;
export declare class Terminal {
    readonly tier: Tier;
    readonly ascii: boolean;
    constructor(tier?: Tier, ascii?: boolean);
    private colour;
    /** A mark never travels without its word. */
    state(name: StateName, word?: string): string;
    /** The tick: a left one-eighth block in brass, one space before the label. Identity, never a state. */
    label(text: string): string;
    bold(text: string): string;
    /** Secondary values and timestamps. Never for anything a reader must act on. */
    dim(text: string): string;
    mono(text: string): string;
    /** Alignment is the terminal's typography: columns computed, not padded by eye. */
    table(rows: string[][]): string;
}
export declare function neutralize(text: string): string;
/** neutralize applied to every string inside a payload, arrays and objects included. */
export declare function neutralizeDeep<T>(value: T): T;
/** Map a run terminal or verdict to its state rendering. */
export declare function stateFor(terminal: string | null, verdict: string | null): StateName;
export {};
