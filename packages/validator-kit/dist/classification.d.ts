/**
 * Classification propagation and the declassification airlock.
 *
 * What this is: the mechanism half of classification. The application
 * declares an ordered lattice; the runtime propagates the join through
 * derivation and never labels anything itself (CLS-001). Prose derived
 * from classified material stays at the source classification (CLS-006).
 * Declassification happens only through an airlock type whose fields are
 * bounded by construction, enumerations and finite numbers and booleans,
 * so free text cannot carry classified bytes out (CLS-003, CLS-004), and
 * every type passes a capacity review at declaration (CLS-007).
 *
 * What this deliberately does not do: run the airlock inside an ephemeral
 * egress-free sub-run, or classify by model. Those arrive with the audit
 * phase; the shapes here are what they will enforce.
 */
/** Ordered, application-declared. Index zero is the baseline; higher is worse. */
export interface ClassificationLattice {
    levels: readonly string[];
}
export declare function assertLevel(lattice: ClassificationLattice, level: string): number;
/** The join: derived data takes the worst of its sources (CLS-001, CTX-008). */
export declare function joinClassification(lattice: ClassificationLattice, levels: string[]): string;
/** A derivation, a summary included, keeps what it read (CLS-006, ECV-007). */
export declare function classifiedDerivation(lattice: ClassificationLattice, sources: {
    classification: string;
}[], text: string): {
    text: string;
    classification: string;
};
/** Bounded fields only. Free text is not a kind, which is the whole point. */
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
/**
 * The capacity review at declaration (CLS-007): every field's information
 * capacity is enumerable and small, so widening a domain is a new security
 * decision, taken here, not at extraction time.
 */
export declare function declareAirlockType(type: AirlockType): AirlockType;
/**
 * Conform one raw value to a declared airlock type: every declared field
 * present and inside its domain, no undeclared field at all. This is the
 * shape rule the airlock enforces, exposed on its own so a validator can
 * check an output that already left an airlock without re-extracting it
 * (CLS-004).
 */
export declare function conformAirlockValue(type: AirlockType, raw: Record<string, unknown>): Record<string, unknown>;
/**
 * Extract through the airlock: the output must match the declared type
 * exactly, field for field, and comes out at the lattice baseline. The
 * extractor sees copies and nothing it touches is retained (CLS-005).
 */
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
