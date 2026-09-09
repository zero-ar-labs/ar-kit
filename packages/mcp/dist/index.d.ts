/**
 * @zero-ar/mcp public entrypoint.
 *
 * This package projects published work through MCP and compiles reviewed MCP
 * discoveries into immutable native publication plans. It owns no run state;
 * every task and result resolves through the native Zero-AR API.
 */
export * from './constants.js';
export * from './client.js';
export * from './executor.js';
export * from './import.js';
export * from './schema-policy.js';
export * from './server.js';
