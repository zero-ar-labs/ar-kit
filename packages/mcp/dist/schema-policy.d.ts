/**
 * Bounded JSON Schema checks for MCP publication and invocation.
 *
 * What this is: a deliberately small structural walk over an imported JSON
 * Schema 2020-12 document. It rejects remote references and every collection
 * or string position that lacks an explicit ceiling.
 *
 * How it fits: discovery stays observational. A remote schema reaches a tool
 * manifest only after this policy proves it can be validated within the
 * binding's declared depth and collection limits.
 */
import type { InteropJson } from '@zero-ar/contracts';
export interface JsonSchemaLimits {
    schema_depth: number;
    string_bytes: number;
    list_items: number;
}
export declare function assertBoundedJsonSchema(schema: InteropJson, limits: JsonSchemaLimits): Record<string, unknown>;
