/**
 * Task-contract item output schemas.
 *
 * What this is: the bounded JSON Schema subset a task contract may bind to
 * exact item ids or item-id prefixes, plus compilation and admission helpers.
 *
 * How it fits: model adapters receive the compiled object schemas, one item
 * operation per published schema so each item id travels with its own shape,
 * while the kernel validates one structured result against its item's schema
 * and stores the accepted value as canonical JSON in the existing string ledger.
 */
import { z } from 'zod';
import { canonicalJson } from "./canonical.js";
const JsonValueSchema = z.lazy(() => z.union([
    z.null(),
    z.boolean(),
    z.number().finite(),
    z.string().max(100_000),
    z.array(JsonValueSchema).max(10_000),
    z.record(z.string().max(256), JsonValueSchema),
]));
const OBJECT_TYPES = new Set(['object', 'array', 'string', 'number', 'integer', 'boolean', 'null']);
const SUPPORTED_KEYS = new Set([
    'type',
    'description',
    'properties',
    'required',
    'additionalProperties',
    'items',
    'anyOf',
    'enum',
    'const',
    'minimum',
    'maximum',
    'minLength',
    'maxLength',
    'pattern',
    'minItems',
    'maxItems',
]);
function objectValue(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
function schemaProblem(value, path = '$', depth = 0) {
    if (depth > 32)
        return `${path} passes the 32-level schema depth limit`;
    const node = objectValue(value);
    if (!node)
        return `${path} must be one JSON Schema object`;
    const unknown = Object.keys(node).filter((key) => !SUPPORTED_KEYS.has(key));
    if (unknown.length > 0)
        return `${path} uses unsupported keyword ${unknown[0]}`;
    if (!('type' in node) && !('anyOf' in node))
        return `${path} must declare type or anyOf`;
    if ('type' in node) {
        const types = Array.isArray(node['type']) ? node['type'] : [node['type']];
        if (types.length === 0 || types.some((type) => typeof type !== 'string' || !OBJECT_TYPES.has(type))) {
            return `${path}.type must name the supported JSON types`;
        }
    }
    if ('anyOf' in node) {
        if (!Array.isArray(node['anyOf']) || node['anyOf'].length < 1 || node['anyOf'].length > 32)
            return `${path}.anyOf must contain between 1 and 32 schemas`;
        for (const [index, child] of node['anyOf'].entries()) {
            const problem = schemaProblem(child, `${path}.anyOf[${index}]`, depth + 1);
            if (problem)
                return problem;
        }
    }
    const types = Array.isArray(node['type']) ? node['type'] : [node['type']];
    if (types.includes('object')) {
        const properties = objectValue(node['properties'] ?? null);
        if (!properties)
            return `${path}.properties must describe the object's fields`;
        if (Object.keys(properties).length > 128)
            return `${path}.properties exceeds 128 fields`;
        if (node['additionalProperties'] !== false)
            return `${path}.additionalProperties must be false`;
        if (!Array.isArray(node['required']) || node['required'].some((entry) => typeof entry !== 'string'))
            return `${path}.required must list every property`;
        const propertyNames = Object.keys(properties).sort();
        const required = [...new Set(node['required'])].sort();
        if (canonicalJson(propertyNames) !== canonicalJson(required))
            return `${path}.required must list every property exactly once`;
        for (const [name, child] of Object.entries(properties)) {
            const problem = schemaProblem(child, `${path}.properties.${name}`, depth + 1);
            if (problem)
                return problem;
        }
    }
    if (types.includes('array')) {
        if (!('items' in node))
            return `${path}.items must describe each array member`;
        const problem = schemaProblem(node['items'], `${path}.items`, depth + 1);
        if (problem)
            return problem;
    }
    if ('enum' in node && (!Array.isArray(node['enum']) || node['enum'].length < 1 || node['enum'].length > 128))
        return `${path}.enum must contain between 1 and 128 values`;
    if ('pattern' in node) {
        if (typeof node['pattern'] !== 'string' || node['pattern'].length > 256)
            return `${path}.pattern must be a string of at most 256 characters`;
        try {
            new RegExp(node['pattern']);
        }
        catch {
            return `${path}.pattern must be a valid regular expression`;
        }
    }
    return null;
}
/** One provider-strict object schema accepted for task item outputs. */
export const ItemOutputJsonSchemaSchema = JsonValueSchema.superRefine((value, context) => {
    const root = objectValue(value);
    if (!root || root['type'] !== 'object') {
        context.addIssue({ code: 'custom', message: 'an item output schema must have an object root' });
        return;
    }
    const problem = schemaProblem(value);
    if (problem)
        context.addIssue({ code: 'custom', message: problem });
});
/** The most item output schema bindings one task contract may publish. */
export const ITEM_OUTPUT_SCHEMA_BINDINGS_MAX = 64;
/**
 * The most control operations one model call may carry: one item operation
 * per binding, one for plain-text items, the question operation and the
 * completion operation.
 */
export const MODEL_CONTROL_OPERATIONS_MAX = ITEM_OUTPUT_SCHEMA_BINDINGS_MAX + 3;
/** One schema binding. Exactly one selector is present. */
export const ItemOutputSchemaBindingSchema = z.strictObject({
    item_kind: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
    item_id: z.string().min(1).max(512).optional(),
    item_id_prefix: z.string().min(1).max(128).optional(),
    output_schema: ItemOutputJsonSchemaSchema,
}).superRefine((binding, context) => {
    if ((binding.item_id === undefined) === (binding.item_id_prefix === undefined)) {
        context.addIssue({ code: 'custom', message: 'an item output schema binding needs exactly one of item_id or item_id_prefix' });
    }
});
function matches(binding, item_id) {
    return binding.item_id !== undefined ? binding.item_id === item_id : item_id.startsWith(binding.item_id_prefix);
}
function bindingFor(contract, item_id) {
    const matched = (contract?.item_output_schemas ?? []).filter((binding) => matches(binding, item_id));
    if (matched.length > 1)
        throw new Error(`item ${item_id} matches more than one item output schema. Publish disjoint exact ids or prefixes.`);
    return matched[0] ?? null;
}
/** The one schema the task contract binds to an item, or null when the item remains plain text. */
export function itemOutputSchemaFor(contract, item_id) {
    return bindingFor(contract, item_id)?.output_schema ?? null;
}
/**
 * A model-facing copy of a schema whose properties follow its required list.
 * Publication stores schemas as canonical JSON, which sorts object keys, so
 * the required list is the only authored order left. Providers that decode
 * strictly write fields in property order, so a field that depends on others
 * keeps its authored place after them. Properties outside the list follow in
 * their existing order. Validation never depends on this order.
 */
export function authoredPropertyOrder(schema) {
    const copy = { ...schema };
    const properties = schema['properties'];
    if (properties !== null && typeof properties === 'object' && !Array.isArray(properties)) {
        const source = properties;
        const required = Array.isArray(schema['required']) ? schema['required'].filter((name) => typeof name === 'string' && name in source) : [];
        const names = [...new Set([...required, ...Object.keys(source)])];
        copy['properties'] = Object.fromEntries(names.map((name) => [name, childOrder(source[name])]));
    }
    if ('items' in schema)
        copy['items'] = childOrder(schema['items']);
    if (Array.isArray(schema['anyOf']))
        copy['anyOf'] = schema['anyOf'].map(childOrder);
    return copy;
}
function childOrder(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? authoredPropertyOrder(value) : value;
}
/** The unique object schemas a model-facing item operation may submit. */
export function compileItemOutputSchema(contract) {
    const schemas = new Map();
    for (const binding of contract?.item_output_schemas ?? [])
        schemas.set(canonicalJson(binding.output_schema), binding.output_schema);
    if (schemas.size === 0)
        return null;
    if (schemas.size === 1)
        return [...schemas.values()][0];
    return { anyOf: [...schemas.values()] };
}
const SINGLE_ITEM_OPERATION = 'emit_item_result';
const TEXT_ITEM_OPERATION = 'emit_text_result';
function itemIdSchema(itemIds) {
    return itemIds.length <= 256
        ? { type: 'string', enum: [...new Set(itemIds)] }
        : { type: 'string', minLength: 1, maxLength: 512 };
}
function itemOperation(name, description, itemIds, output) {
    return {
        kind: 'item_result',
        name,
        description,
        input_schema: {
            type: 'object',
            properties: { item_id: itemIdSchema(itemIds), output },
            required: ['item_id', 'output'],
            additionalProperties: false,
        },
        strict: true,
    };
}
/**
 * One operation name per published item kind and schema, fixed by the
 * contract rather than by which items remain, so names hold for a whole run.
 * Provider tool names allow 64 characters, and a repeated name gains a suffix.
 */
function itemOperationGroups(contract) {
    const groups = new Map();
    const names = new Set([SINGLE_ITEM_OPERATION, TEXT_ITEM_OPERATION]);
    for (const binding of contract?.item_output_schemas ?? []) {
        const key = `${binding.item_kind}\n${canonicalJson(binding.output_schema)}`;
        if (groups.has(key))
            continue;
        const base = `emit_${binding.item_kind.replaceAll('-', '_').slice(0, 48)}_result`;
        let name = base;
        for (let suffix = 2; names.has(name); suffix += 1)
            name = `${base}_${suffix}`;
        names.add(name);
        groups.set(key, { name, item_kind: binding.item_kind, schema: binding.output_schema });
    }
    return groups;
}
/**
 * Compile the provider-neutral item operations for the untouched item set.
 *
 * A contract that publishes at most one output schema keeps the one
 * emit_item_result operation. A contract that publishes more gets one
 * operation per item kind and schema, each listing only its own item ids and
 * carrying only its own schema, so strict decoding can never pair an item id
 * with another item's shape. Items without a schema share emit_text_result.
 */
export function compileItemResultControlOperations(contract, itemIds) {
    if (itemIds.length === 0)
        return [];
    const published = new Set((contract?.item_output_schemas ?? []).map((binding) => canonicalJson(binding.output_schema)));
    if (published.size <= 1) {
        const schemas = new Map();
        let acceptsText = false;
        for (const itemId of itemIds) {
            const schema = itemOutputSchemaFor(contract, itemId);
            if (!schema) {
                acceptsText = true;
                continue;
            }
            schemas.set(canonicalJson(schema), authoredPropertyOrder(schema));
        }
        const alternatives = [...schemas.values()];
        if (acceptsText)
            alternatives.push({ type: 'string' });
        const output = alternatives.length === 1 ? alternatives[0] : { anyOf: alternatives };
        return [itemOperation(SINGLE_ITEM_OPERATION, 'Record one declared work item result. Submit a structured output object when its task contract publishes one; otherwise submit text.', itemIds, output)];
    }
    const groups = itemOperationGroups(contract);
    const members = new Map();
    const text = [];
    for (const itemId of itemIds) {
        const binding = bindingFor(contract, itemId);
        if (!binding) {
            text.push(itemId);
            continue;
        }
        const key = `${binding.item_kind}\n${canonicalJson(binding.output_schema)}`;
        members.set(key, [...(members.get(key) ?? []), itemId]);
    }
    const operations = [...groups.entries()]
        .filter(([key]) => members.has(key))
        .map(([key, group]) => itemOperation(group.name, `Record one declared ${group.item_kind} item result. Submit output as one object with this operation's fields; another kind of item uses its own operation.`, members.get(key), authoredPropertyOrder(group.schema)));
    if (text.length > 0) {
        operations.push(itemOperation(TEXT_ITEM_OPERATION, 'Record one declared work item result that has no published output schema. Submit the output as text.', text, { type: 'string' }));
    }
    return operations;
}
/** The completion operation supplied only after the kernel finds it eligible. */
export function completionProposalControlOperation() {
    return {
        kind: 'completion_proposal',
        name: 'propose_completion',
        description: 'Propose the final staged artifact after every required item is eligible. Validators decide whether it completes the run.',
        input_schema: {
            type: 'object',
            properties: { artifact: { type: 'string', description: 'The complete staged result.' } },
            required: ['artifact'],
            additionalProperties: false,
        },
        strict: true,
    };
}
/** The bounds of one agent question (GAP-008). */
export const AGENT_QUESTION_LIMITS = Object.freeze({
    question_chars: 500,
    why_chars: 300,
    choices_min: 2,
    choices_max: 8,
    choice_chars: 120,
});
/** The question cap a contract that states none allows (GAP-008). */
export const DEFAULT_MAX_AGENT_QUESTIONS = 3;
/**
 * The question operation, offered only when the run can ask: on the items a
 * question may bear on, which are untouched or invalidated and not parked.
 * Strict decoding needs every field listed, so the optional ones are
 * nullable, and the kernel enforces the length bounds when it admits one.
 */
export function questionProposalControlOperation(itemIds) {
    return {
        kind: 'question',
        name: 'propose_question',
        description: 'Ask a person one question about one item before you work it, when only a person can answer. ' +
            `Keep the question under ${AGENT_QUESTION_LIMITS.question_chars} characters and why under ${AGENT_QUESTION_LIMITS.why_chars}. ` +
            `Offer ${AGENT_QUESTION_LIMITS.choices_min} to ${AGENT_QUESTION_LIMITS.choices_max} short choices when the answer is one of a few, or null. ` +
            'The runtime decides whether and when a person is asked, and the answer arrives in a later turn.',
        input_schema: {
            type: 'object',
            properties: {
                item_id: itemIdSchema(itemIds),
                question: { type: 'string' },
                choices: { type: ['array', 'null'], items: { type: 'string' } },
                allow_other: { type: ['boolean', 'null'] },
                why: { type: 'string' },
            },
            required: ['item_id', 'question', 'choices', 'allow_other', 'why'],
            additionalProperties: false,
        },
        strict: true,
    };
}
/**
 * Read a proposed question against its bounds. A problem names the bound and
 * what to send instead, since it reaches the model as the refusal reason.
 */
export function parseAgentQuestion(input) {
    const limits = AGENT_QUESTION_LIMITS;
    const item_id = input['item_id'];
    const question = typeof input['question'] === 'string' ? input['question'].trim() : '';
    const why = typeof input['why'] === 'string' ? input['why'].trim() : '';
    const rawChoices = input['choices'];
    if (typeof item_id !== 'string' || item_id.length === 0)
        return { problem: 'the question names no item. Name the one item it bears on.' };
    if (question.length === 0 || question.length > limits.question_chars) {
        return { problem: `the question is ${question.length} characters, and it must be 1 to ${limits.question_chars}. Ask it in fewer words.` };
    }
    if (why.length === 0 || why.length > limits.why_chars) {
        return { problem: `why is ${why.length} characters, and it must be 1 to ${limits.why_chars}. Say briefly why only a person can answer.` };
    }
    let choices = null;
    if (rawChoices !== null && rawChoices !== undefined) {
        if (!Array.isArray(rawChoices) || !rawChoices.every((choice) => typeof choice === 'string')) {
            return { problem: 'choices must be a list of text, or null. Send the choices as strings.' };
        }
        const trimmed = rawChoices.map((choice) => choice.trim());
        if (trimmed.length < limits.choices_min || trimmed.length > limits.choices_max) {
            return { problem: `there are ${trimmed.length} choices, and a question offers ${limits.choices_min} to ${limits.choices_max}, or null for none.` };
        }
        if (trimmed.some((choice) => choice.length === 0 || choice.length > limits.choice_chars)) {
            return { problem: `each choice must be 1 to ${limits.choice_chars} characters. Shorten the long ones.` };
        }
        if (new Set(trimmed).size !== trimmed.length)
            return { problem: 'two choices are the same. Offer distinct choices.' };
        choices = trimmed;
    }
    return { question: { item_id, question, choices, allow_other: choices !== null && input['allow_other'] === true, why } };
}
function valueProblem(value, schema, path = 'output') {
    if (Array.isArray(schema['anyOf'])) {
        const problems = schema['anyOf'].map((child) => valueProblem(value, child, path));
        return problems.some((problem) => problem === null) ? null : `${path} matches none of the admitted shapes: ${problems.join('; ')}`;
    }
    if ('const' in schema && canonicalJson(value) !== canonicalJson(schema['const']))
        return `${path} must equal ${canonicalJson(schema['const'])}`;
    if (Array.isArray(schema['enum']) && !schema['enum'].some((entry) => canonicalJson(entry) === canonicalJson(value))) {
        return `${path} must be one of ${canonicalJson(schema['enum'])}`;
    }
    const types = Array.isArray(schema['type']) ? schema['type'] : [schema['type']];
    const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;
    if (!types.includes(actual) && !(actual === 'integer' && types.includes('number')))
        return `${path} must be ${types.join(' or ')}, and ${actual} arrived`;
    if (actual === 'object') {
        const source = value;
        const properties = schema['properties'];
        const unknown = Object.keys(source).filter((key) => !(key in properties));
        if (unknown.length > 0 && schema['additionalProperties'] === false)
            return `${path} carries undeclared field ${unknown[0]}`;
        for (const required of schema['required'] ?? [])
            if (!(required in source))
                return `${path}.${required} is required`;
        for (const [key, child] of Object.entries(properties ?? {})) {
            if (!(key in source))
                continue;
            const problem = valueProblem(source[key], child, `${path}.${key}`);
            if (problem)
                return problem;
        }
    }
    else if (actual === 'array') {
        const array = value;
        if (typeof schema['minItems'] === 'number' && array.length < schema['minItems'])
            return `${path} needs at least ${schema['minItems']} items`;
        if (typeof schema['maxItems'] === 'number' && array.length > schema['maxItems'])
            return `${path} allows at most ${schema['maxItems']} items`;
        for (const [index, member] of array.entries()) {
            const problem = valueProblem(member, schema['items'], `${path}[${index}]`);
            if (problem)
                return problem;
        }
    }
    else if (actual === 'string') {
        const text = value;
        if (typeof schema['minLength'] === 'number' && text.length < schema['minLength'])
            return `${path} needs at least ${schema['minLength']} characters`;
        if (typeof schema['maxLength'] === 'number' && text.length > schema['maxLength'])
            return `${path} allows at most ${schema['maxLength']} characters`;
        if (typeof schema['pattern'] === 'string' && !new RegExp(schema['pattern']).test(text))
            return `${path} does not match ${schema['pattern']}`;
    }
    else if (actual === 'number' || actual === 'integer') {
        const number = value;
        if (typeof schema['minimum'] === 'number' && number < schema['minimum'])
            return `${path} must be at least ${schema['minimum']}`;
        if (typeof schema['maximum'] === 'number' && number > schema['maximum'])
            return `${path} must be at most ${schema['maximum']}`;
    }
    return null;
}
/** Validate and canonicalize one model item result without changing the ledger. */
export function admitItemOutput(contract, item_id, value) {
    let schema;
    try {
        schema = itemOutputSchemaFor(contract, item_id);
    }
    catch (error) {
        return { ok: false, reason: error.message };
    }
    if (!schema) {
        return typeof value === 'string'
            ? { ok: true, output: value }
            : { ok: false, reason: `item ${item_id} has no structured output schema. Submit its output as text.` };
    }
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { ok: false, reason: `item ${item_id} uses a structured output schema. Submit output as one object, not JSON encoded inside a string.` };
    }
    const json = JsonValueSchema.safeParse(value);
    if (!json.success)
        return { ok: false, reason: `item ${item_id} was not recorded because output is not bounded JSON. Emit one JSON object with the published fields.` };
    const problem = valueProblem(json.data, schema);
    if (problem)
        return { ok: false, reason: `item ${item_id} (${(contract?.item_output_schemas ?? []).find((binding) => matches(binding, item_id))?.item_kind ?? 'structured'}) was not recorded: ${problem}. Change that field and emit the item again.` };
    const itemKind = (contract?.item_output_schemas ?? []).find((binding) => matches(binding, item_id))?.item_kind;
    return {
        ok: true,
        output: canonicalJson(json.data),
        ...(itemKind ? { item_kind: itemKind } : {}),
    };
}
