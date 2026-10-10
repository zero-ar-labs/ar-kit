export interface ClassificationLattice {
    levels: readonly string[];
}
export declare function assertLevel(lattice: ClassificationLattice, level: string): number;
export declare function joinClassification(lattice: ClassificationLattice, levels: string[]): string;
export declare function classifiedDerivation(lattice: ClassificationLattice, sources: {
    classification: string;
}[], text: string): {
    text: string;
    classification: string;
};
export type AirlockField = {
    kind: 'enum';
    values: readonly string[];
} | {
    kind: 'number';
    min: number;
    max: number;
} | {
    kind: 'boolean';
};
export interface AirlockType {
    name: string;
    fields: Record<string, AirlockField>;
}
export declare function declareAirlockType(type: AirlockType): AirlockType;
export declare function conformAirlockValue(type: AirlockType, raw: Record<string, unknown>): Record<string, unknown>;
export declare function airlockExtract(args: {
    lattice: ClassificationLattice;
    type: AirlockType;
    spans: {
        bytes: string;
        classification: string;
    }[];
    extract: (bytes: string[]) => Record<string, unknown>;
}): {
    value: Record<string, unknown>;
    classification: string;
    consumed_spans: number;
};
