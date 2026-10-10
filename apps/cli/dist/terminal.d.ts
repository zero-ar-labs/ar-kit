export type Tier = '256' | '16' | 'none';
export declare function detectTier(env?: NodeJS.ProcessEnv, isTty?: boolean, noColor?: boolean): Tier;
export declare function detectAscii(env?: NodeJS.ProcessEnv): boolean;
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
    state(name: StateName, word?: string): string;
    label(text: string): string;
    bold(text: string): string;
    dim(text: string): string;
    mono(text: string): string;
    table(rows: string[][]): string;
}
export declare function neutralize(text: string): string;
export declare function neutralizeDeep<T>(value: T): T;
export declare function stateFor(terminal: string | null, verdict: string | null): StateName;
export {};
