export const SUPPORTED_NODE_RUNTIME = Object.freeze({
    release_line: '24.x',
    minimum: '24.11.0',
    engine: '>=24.11.0 <25',
    production_version: '24.11.1',
    production_image: 'docker.io/library/node:24.11.1-slim@sha256:48abc13a19400ca3985071e287bd405a1d99306770eb81d61202fb6b65cf0b57',
    production_substrate: 'compiled-javascript',
});
export function isSupportedNodeRuntime(version) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
    if (!match)
        return false;
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    if (major !== 24)
        return false;
    return minor > 11 || (minor === 11 && patch >= 0);
}
