/**
 * The deterministic project loader (developer-integration appendix, DXI-1C).
 *
 * What this is: build-time discovery of declared source kinds under one
 * root, with an explicit order, a lock of exactly what resolved, and
 * diagnostics that say what was found, why it was included, what it
 * compiled to, and what shadowed it (DXI-022, DXI-023).
 *
 * How it fits: discovery happens at development, test, or publication
 * time only. Production run workers consume immutable refs from the
 * published closure and never reach this code. Nothing here executes a
 * tool, calls a model, resolves a credential, or infers an operation
 * class; a user-global directory, a parent directory, a live network
 * catalogue, and a mutable alias are all outside the build unless the
 * project pins them (DXI-024).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { canonicalJson, contentHash, refuse } from '@zero-ar/contracts';
import { compileProject } from "./publication.js";
/** The declared source kinds a project may carry. Nothing else is discovered. */
export const SOURCE_KINDS = ['agent', 'instructions', 'skill', 'tool', 'validator', 'task-contract', 'posture', 'domain-pack', 'context'];
const KIND_BY_SUFFIX = [
    { match: (path) => /(^|\/)SKILL\.md$/.test(path), kind: 'skill' },
    { match: (path) => /(^|\/)AGENT\.md$/.test(path), kind: 'instructions' },
    { match: (path) => /(^|\/)agent\.(yaml|yml|ts)$/.test(path), kind: 'agent' },
    { match: (path) => /(^|\/)tools\//.test(path), kind: 'tool' },
    { match: (path) => /(^|\/)validators\//.test(path), kind: 'validator' },
    { match: (path) => /(^|\/)contracts\//.test(path), kind: 'task-contract' },
    { match: (path) => /(^|\/)postures\//.test(path), kind: 'posture' },
    { match: (path) => /(^|\/)packs\//.test(path), kind: 'domain-pack' },
];
function kindOf(relativePath) {
    return KIND_BY_SUFFIX.find((candidate) => candidate.match(relativePath))?.kind ?? 'context';
}
/** Files under one directory, in a stable order, skipping nothing silently. */
function walk(root, directory, out) {
    for (const name of readdirSync(directory).sort()) {
        if (name === 'node_modules' || name.startsWith('.'))
            continue;
        const path = join(directory, name);
        if (statSync(path).isDirectory())
            walk(root, path, out);
        else
            out.push(path);
    }
}
/**
 * Load one project deterministically. Resolution order is: explicit
 * loader options, paths the entry declares, the project lock, then
 * explicit overlays. Nothing outside the root participates.
 */
export async function loadProject(options) {
    const root = resolve(options.root);
    const entryName = options.entry ?? 'agent.yaml';
    const entry = isAbsolute(entryName) ? entryName : join(root, entryName);
    if (!existsSync(entry)) {
        refuse({
            code: 'project.entry.missing',
            message: `${relative(root, entry)} does not exist under ${root}, and a project is loaded from a declared entry, never from a search.`,
            fix: 'pass entry with the path to your agent source, or create agent.yaml at the project root',
        });
    }
    if (!resolve(entry).startsWith(root)) {
        refuse({
            code: 'project.entry.outside-root',
            message: `${entry} sits outside the project root ${root}. A parent directory is not part of a build unless the project pins it.`,
            clause: 'DXI-024',
        });
    }
    const diagnostics = [];
    const overlays = new Map((options.overlays ?? []).map((overlay) => [resolve(root, overlay.path), overlay.content]));
    const files = [];
    walk(root, root, files);
    const byPath = new Map();
    for (const file of files) {
        const relativePath = relative(root, file);
        const overlay = overlays.get(file);
        const bytes = overlay ?? readFileSync(file, 'utf8');
        const resource = {
            kind: kindOf(relativePath),
            path: relativePath,
            content_ref: contentHash({ bytes }),
            bytes: Buffer.byteLength(bytes),
            source: overlay !== undefined ? 'overlay' : file === entry ? 'loader-option' : 'entry-declaration',
        };
        const shadowed = byPath.get(relativePath);
        if (shadowed) {
            diagnostics.push({
                severity: 'error',
                code: 'project.shadowed',
                message: `${relativePath} resolves twice, from ${shadowed.source} and ${resource.source}. Silent precedence is not a build.`,
                path: relativePath,
                fix: 'remove one source, or rename the file so each path resolves once',
            });
        }
        byPath.set(relativePath, resource);
        if (overlay !== undefined) {
            diagnostics.push({
                severity: 'note',
                code: 'project.overlay',
                message: `${relativePath} came from an explicit overlay, not the file on disk. The lock records the overlay bytes.`,
                path: relativePath,
                fix: null,
            });
        }
    }
    // An overlay for a path that does not exist is still explicit source.
    for (const [path, content] of overlays) {
        const relativePath = relative(root, path);
        if (byPath.has(relativePath))
            continue;
        byPath.set(relativePath, { kind: kindOf(relativePath), path: relativePath, content_ref: contentHash({ bytes: content }), bytes: Buffer.byteLength(content), source: 'overlay' });
        diagnostics.push({ severity: 'note', code: 'project.overlay', message: `${relativePath} exists only as an overlay for this build.`, path: relativePath, fix: null });
    }
    const resources = [...byPath.values()].sort((left, right) => left.path.localeCompare(right.path));
    const lockBody = {
        entry: relative(root, entry),
        resources: resources.map((resource) => ({ path: resource.path, kind: resource.kind, content_ref: resource.content_ref })),
    };
    const lock = { ...lockBody, lock_ref: contentHash(lockBody) };
    if (!resources.some((resource) => resource.kind === 'agent')) {
        diagnostics.push({
            severity: 'error',
            code: 'project.agent.missing',
            message: 'no agent source was discovered under the project root, so there is nothing to compile.',
            path: null,
            fix: 'add agent.yaml or agent.ts at the root',
        });
    }
    const project = {
        root,
        entry,
        resources: () => resources,
        diagnostics: () => diagnostics,
        lock: () => lock,
        async compile() {
            const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error');
            if (errors.length > 0) {
                refuse({
                    code: 'project.incomplete',
                    message: `${errors.length} project diagnostics must be resolved before compilation: ${errors.map((error) => error.message).join(' ')}`,
                    clause: 'DXI-023',
                });
            }
            if (overlays.size > 0) {
                refuse({
                    code: 'project.overlay.compile',
                    message: 'this project carries in-memory overlays, which belong to tests and development. Compile from the files a publication can pin.',
                    clause: 'DXI-022',
                });
            }
            return compileProject(entry);
        },
        reload: () => loadProject(options),
    };
    return project;
}
/** Render the loader's answer for a terminal, one line per finding. */
export function renderDiagnostics(project) {
    const lines = project.diagnostics().map((diagnostic) => `${diagnostic.severity} ${diagnostic.code}: ${diagnostic.message}${diagnostic.fix ? ` fix: ${diagnostic.fix}` : ''}`);
    const lock = project.lock();
    lines.push(`lock ${lock.lock_ref} over ${lock.resources.length} discovered sources from ${lock.entry}`);
    return lines.join('\n');
}
/** The canonical bytes of a lock, for comparing two machines' builds. */
export function lockBytes(project) {
    return canonicalJson(project.lock());
}
/** The directory a path belongs to, for diagnostics that name a location. */
export function projectRootOf(path) {
    return dirname(resolve(path));
}
