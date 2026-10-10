import type { InteropJson } from '@zero-ar/contracts';
export interface JsonSchemaLimits {
    schema_depth: number;
    string_bytes: number;
    list_items: number;
}
export declare function assertBoundedJsonSchema(schema: InteropJson, limits: JsonSchemaLimits): Record<string, unknown>;
