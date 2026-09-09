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
import { refuse } from '@zero-ar/contracts';
export function assertLevel(lattice, level) {
    const index = lattice.levels.indexOf(level);
    if (index < 0) {
        refuse({
            code: 'classification.unknown',
            message: `classification ${level} is not a level of the declared lattice.`,
            alternatives: [...lattice.levels],
            clause: 'CLS-001',
        });
    }
    return index;
}
/** The join: derived data takes the worst of its sources (CLS-001, CTX-008). */
export function joinClassification(lattice, levels) {
    let worst = 0;
    for (const level of levels)
        worst = Math.max(worst, assertLevel(lattice, level));
    return lattice.levels[worst];
}
/** A derivation, a summary included, keeps what it read (CLS-006, ECV-007). */
export function classifiedDerivation(lattice, sources, text) {
    return { text, classification: joinClassification(lattice, sources.map((s) => s.classification)) };
}
const ENUM_VALUE_CAP = 32;
const ENUM_LENGTH_CAP = 64;
/**
 * The capacity review at declaration (CLS-007): every field's information
 * capacity is enumerable and small, so widening a domain is a new security
 * decision, taken here, not at extraction time.
 */
export function declareAirlockType(type) {
    for (const [name, field] of Object.entries(type.fields)) {
        if (field.kind === 'enum') {
            if (field.values.length === 0 || field.values.length > ENUM_VALUE_CAP) {
                refuse({
                    code: 'airlock.capacity',
                    message: `field ${name} declares ${field.values.length} values against the reviewed cap of ${ENUM_VALUE_CAP}. A wider domain is a new security decision.`,
                    clause: 'CLS-007',
                });
            }
            if (field.values.some((value) => value.length > ENUM_LENGTH_CAP)) {
                refuse({
                    code: 'airlock.capacity',
                    message: `field ${name} carries a value longer than ${ENUM_LENGTH_CAP} characters, which starts to look like a sentence.`,
                    clause: 'CLS-007',
                });
            }
        }
        if (field.kind === 'number' && (!Number.isFinite(field.min) || !Number.isFinite(field.max) || field.min > field.max)) {
            refuse({ code: 'airlock.capacity', message: `field ${name} needs a finite ordered range.`, clause: 'CLS-007' });
        }
    }
    return type;
}
/**
 * Conform one raw value to a declared airlock type: every declared field
 * present and inside its domain, no undeclared field at all. This is the
 * shape rule the airlock enforces, exposed on its own so a validator can
 * check an output that already left an airlock without re-extracting it
 * (CLS-004).
 */
export function conformAirlockValue(type, raw) {
    const value = {};
    for (const [name, field] of Object.entries(type.fields)) {
        const candidate = raw[name];
        if (field.kind === 'enum') {
            if (typeof candidate !== 'string' || !field.values.includes(candidate)) {
                refuse({
                    code: 'airlock.shape',
                    message: `field ${name} must be one of the declared ${field.values.length} values; free text does not leave an airlock.`,
                    clause: 'CLS-004',
                });
            }
        }
        else if (field.kind === 'number') {
            if (typeof candidate !== 'number' || !Number.isFinite(candidate) || candidate < field.min || candidate > field.max) {
                refuse({ code: 'airlock.shape', message: `field ${name} must be a finite number inside [${field.min}, ${field.max}].`, clause: 'CLS-004' });
            }
        }
        else if (typeof candidate !== 'boolean') {
            refuse({ code: 'airlock.shape', message: `field ${name} must be a boolean.`, clause: 'CLS-004' });
        }
        value[name] = candidate;
    }
    for (const name of Object.keys(raw)) {
        if (!(name in type.fields)) {
            refuse({
                code: 'airlock.shape',
                message: `field ${name} is not part of the declared type ${type.name}, and an undeclared field is a channel.`,
                clause: 'CLS-004',
            });
        }
    }
    return value;
}
/**
 * Extract through the airlock: the output must match the declared type
 * exactly, field for field, and comes out at the lattice baseline. The
 * extractor sees copies and nothing it touches is retained (CLS-005).
 */
export function airlockExtract(args) {
    for (const span of args.spans)
        assertLevel(args.lattice, span.classification);
    const raw = args.extract(args.spans.map((span) => span.bytes));
    const value = conformAirlockValue(args.type, raw);
    return { value, classification: args.lattice.levels[0], consumed_spans: args.spans.length };
}
