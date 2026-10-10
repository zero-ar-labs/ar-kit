export declare const SUPPORTED_NODE_RUNTIME: Readonly<{
    readonly release_line: "24.x";
    readonly minimum: "24.11.0";
    readonly engine: ">=24.11.0 <25";
    readonly production_version: "24.11.1";
    readonly production_image: "docker.io/library/node:24.11.1-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57";
    readonly production_substrate: "compiled-javascript";
}>;
export declare function isSupportedNodeRuntime(version: string): boolean;
