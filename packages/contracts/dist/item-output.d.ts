import { z } from 'zod';
export type ItemOutputJson = null | boolean | number | string | ItemOutputJson[] | {
    [key: string]: ItemOutputJson;
};
export declare const ItemOutputJsonSchemaSchema: z.ZodType<ItemOutputJson, unknown, z.core.$ZodTypeInternals<ItemOutputJson, unknown>>;
export type ItemOutputJsonSchema = z.infer<typeof ItemOutputJsonSchemaSchema>;
export declare const ITEM_OUTPUT_SCHEMA_BINDINGS_MAX = 64;
export declare const MODEL_CONTROL_OPERATIONS_MAX: number;
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
export declare function itemOutputSchemaFor(contract: ItemOutputSchemaContract | null, item_id: string): ItemOutputJsonSchema | null;
export declare function authoredPropertyOrder(schema: Record<string, unknown>): Record<string, unknown>;
export declare function compileItemOutputSchema(contract: ItemOutputSchemaContract | null): Record<string, unknown> | null;
export interface ItemOutputAdmission {
    ok: boolean;
    output?: string;
    reason?: string;
    item_kind?: string;
}
export interface CompiledControlOperation {
    kind: 'completion_proposal' | 'item_result' | 'question';
    name: string;
    description: string;
    input_schema: Record<string, unknown>;
    strict: true;
}
export declare function compileItemResultControlOperations(contract: ItemOutputSchemaContract | null, itemIds: readonly string[]): CompiledControlOperation[];
export declare function completionProposalControlOperation(): CompiledControlOperation;
export declare const AGENT_QUESTION_LIMITS: Readonly<{
    question_chars: 500;
    why_chars: 300;
    choices_min: 2;
    choices_max: 8;
    choice_chars: 120;
}>;
export declare const DEFAULT_MAX_AGENT_QUESTIONS = 3;
export declare function questionProposalControlOperation(itemIds: readonly string[]): CompiledControlOperation;
export interface AgentQuestion {
    item_id: string;
    question: string;
    choices: string[] | null;
    allow_other: boolean;
    why: string;
}
export declare function parseAgentQuestion(input: Record<string, unknown>): {
    question: AgentQuestion;
} | {
    problem: string;
};
export declare function admitItemOutput(contract: ItemOutputSchemaContract | null, item_id: string, value: unknown): ItemOutputAdmission;
