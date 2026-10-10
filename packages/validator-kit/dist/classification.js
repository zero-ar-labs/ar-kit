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
export function joinClassification(lattice, levels) {
    let worst = 0;
    for (const level of levels)
        worst = Math.max(worst, assertLevel(lattice, level));
    return lattice.levels[worst];
}
export function classifiedDerivation(lattice, sources, text) {
    return { text, classification: joinClassification(lattice, sources.map((s) => s.classification)) };
}
const ENUM_VALUE_CAP = 32;
const ENUM_LENGTH_CAP = 64;
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
export function airlockExtract(args) {
    for (const span of args.spans)
        assertLevel(args.lattice, span.classification);
    const raw = args.extract(args.spans.map((span) => span.bytes));
    const value = conformAirlockValue(args.type, raw);
    return { value, classification: args.lattice.levels[0], consumed_spans: args.spans.length };
}
