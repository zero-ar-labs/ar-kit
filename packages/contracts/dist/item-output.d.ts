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
export type ItemOutputJson = null | boolean | number | string | ItemOutputJson[] | {
    [key: string]: ItemOutputJson;
};
/** One provider-strict object schema accepted for task item outputs. */
export declare const ItemOutputJsonSchemaSchema: z.ZodType<ItemOutputJson, unknown, z.core.$ZodTypeInternals<ItemOutputJson, unknown>>;
export type ItemOutputJsonSchema = z.infer<typeof ItemOutputJsonSchemaSchema>;
/** The most item output schema bindings one task contract may publish. */
export declare const ITEM_OUTPUT_SCHEMA_BINDINGS_MAX = 64;
/**
 * The most control operations one model call may carry: one item operation
 * per binding, one for plain-text items, the question operation and the
 * completion operation.
 */
export declare const MODEL_CONTROL_OPERATIONS_MAX: number;
/** One schema binding. Exactly one selector is present. */
export declare const ItemOutputSchemaBindingSchema: z.ZodObject<{
    item_kind: z.ZodString;
    item_id: z.ZodOptional<z.ZodString>;
    item_id_prefix: z.ZodOptional<z.ZodString>;
    output_schema: z.ZodType<ItemOutputJson, unknown, z.core.$ZodTypeInternals<ItemOutputJson, unknown>>;
}, z.core.$strict>;
export type ItemOutputSchemaBinding = z.infer<typeof ItemOutputSchemaBindingSchema>;
export interface ItemOutputSchemaContract {
    item_output_schemas?: readonly ItemOutputSchemaBinding[] | undefined;
}
/** The one schema the task contract binds to an item, or null when the item remains plain text. */
export declare function itemOutputSchemaFor(contract: ItemOutputSchemaContract | null, item_id: string): ItemOutputJsonSchema | null;
/**
 * A model-facing copy of a schema whose properties follow its required list.
 * Publication stores schemas as canonical JSON, which sorts object keys, so
 * the required list is the only authored order left. Providers that decode
 * strictly write fields in property order, so a field that depends on others
 * keeps its authored place after them. Properties outside the list follow in
 * their existing order. Validation never depends on this order.
 */
export declare function authoredPropertyOrder(schema: Record<string, unknown>): Record<string, unknown>;
/** The unique object schemas a model-facing item operation may submit. */
export declare function compileItemOutputSchema(contract: ItemOutputSchemaContract | null): Record<string, unknown> | null;
export interface ItemOutputAdmission {
    ok: boolean;
    output?: string;
    reason?: string;
    item_kind?: string;
}
/** One structural control operation, kept independent of provider adapters. */
export interface CompiledControlOperation {
    kind: 'completion_proposal' | 'item_result' | 'question';
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
    strict: true;
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
export declare function compileItemResultControlOperations(contract: ItemOutputSchemaContract | null, itemIds: readonly string[]): CompiledControlOperation[];
/** The completion operation supplied only after the kernel finds it eligible. */
export declare function completionProposalControlOperation(): CompiledControlOperation;
/** The bounds of one agent question (GAP-008). */
export declare const AGENT_QUESTION_LIMITS: Readonly<{
    question_chars: 500;
    why_chars: 300;
    choices_min: 2;
    choices_max: 8;
    choice_chars: 120;
}>;
/** The question cap a contract that states none allows (GAP-008). */
export declare const DEFAULT_MAX_AGENT_QUESTIONS = 3;
/**
 * The question operation, offered only when the run can ask: on the items a
 * question may bear on, which are untouched or invalidated and not parked.
 * Strict decoding needs every field listed, so the optional ones are
 * nullable, and the kernel enforces the length bounds when it admits one.
 */
export declare function questionProposalControlOperation(itemIds: readonly string[]): CompiledControlOperation;
/** One admitted question's fields, normalized. */
export interface AgentQuestion {
    item_id: string;
    question: string;
    choices: string[] | null;
    allow_other: boolean;
    why: string;
}
/**
 * Read a proposed question against its bounds. A problem names the bound and
 * what to send instead, since it reaches the model as the refusal reason.
 */
export declare function parseAgentQuestion(input: Record<string, unknown>): {
    question: AgentQuestion;
} | {
    problem: string;
};
/** Validate and canonicalize one model item result without changing the ledger. */
export declare function admitItemOutput(contract: ItemOutputSchemaContract | null, item_id: string, value: unknown): ItemOutputAdmission;
