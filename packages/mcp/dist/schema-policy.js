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
import { refuse } from '@zero-ar/contracts';
function objectValue(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : null;
}
function requireBoundedNode(node, limits, depth, path) {
    if (depth > limits.schema_depth) {
        refuse({
            code: 'interop.mcp.schema.depth',
            message: `the remote schema passes the ${limits.schema_depth}-level schema limit at ${path}. Publish a shallower schema or raise the reviewed binding limit.`,
            path,
            clause: 'IOP-026',
        });
    }
    if (Array.isArray(node)) {
        if (node.length > limits.list_items) {
            refuse({
                code: 'interop.mcp.schema.list',
                message: `the remote schema contains ${node.length} entries at ${path}, above the ${limits.list_items}-entry limit. Reduce the schema before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
        node.forEach((value, index) => requireBoundedNode(value, limits, depth + 1, `${path}/${index}`));
        return;
    }
    const object = objectValue(node);
    if (!object) {
        if (typeof node === 'string' && Buffer.byteLength(node) > limits.string_bytes) {
            refuse({
                code: 'interop.mcp.schema.string',
                message: `the remote schema string at ${path} exceeds the ${limits.string_bytes}-byte limit. Shorten it before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
        return;
    }
    if ('$ref' in object || '$dynamicRef' in object) {
        refuse({
            code: 'interop.mcp.schema.reference',
            message: `the remote schema uses a reference at ${path}. Inline the referenced schema before publication because this release does not resolve remote or recursive references.`,
            path,
            clause: 'IOP-026',
        });
    }
    const type = object['type'];
    if (type === 'string') {
        const maxLength = object['maxLength'];
        if (!Number.isSafeInteger(maxLength) || maxLength < 0 || maxLength > limits.string_bytes) {
            refuse({
                code: 'interop.mcp.schema.string-unbounded',
                message: `the string at ${path} lacks a maxLength within ${limits.string_bytes}. Add a reviewed maximum before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
    }
    if (type === 'array') {
        const maxItems = object['maxItems'];
        if (!Number.isSafeInteger(maxItems) || maxItems < 0 || maxItems > limits.list_items) {
            refuse({
                code: 'interop.mcp.schema.array-unbounded',
                message: `the array at ${path} lacks a maxItems within ${limits.list_items}. Add a reviewed maximum before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
    }
    if (type === 'object') {
        const maxProperties = object['maxProperties'];
        if (!Number.isSafeInteger(maxProperties) || maxProperties < 0 || maxProperties > limits.list_items) {
            refuse({
                code: 'interop.mcp.schema.object-unbounded',
                message: `the object at ${path} lacks a maxProperties within ${limits.list_items}. Add a reviewed maximum before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
        if (object['additionalProperties'] !== false && object['unevaluatedProperties'] !== false) {
            refuse({
                code: 'interop.mcp.schema.properties-unbounded',
                message: `the object at ${path} accepts undeclared properties. Close the object before publication.`,
                path,
                clause: 'IOP-026',
            });
        }
    }
    for (const [key, value] of Object.entries(object)) {
        requireBoundedNode(value, limits, depth + 1, `${path}/${key}`);
    }
}
export function assertBoundedJsonSchema(schema, limits) {
    const root = objectValue(schema);
    if (!root || root['type'] !== 'object') {
        refuse({
            code: 'interop.mcp.schema.root',
            message: 'an imported MCP tool schema must have an object root. Publish an object-shaped input contract.',
            clause: 'IOP-026',
        });
    }
    requireBoundedNode(schema, limits, 0, '$');
    return root;
}
