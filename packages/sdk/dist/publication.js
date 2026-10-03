/**
 * The publication compiler (hosted-publication appendix, phase HP0).
 *
 * What this is: compileProject turns one authored project, YAML or
 * TypeScript rooted, into a deterministic PublicationBundle: canonical
 * declarations, content-addressed assets, complete typed edges, and a
 * bundle ref that is a pure function of the source bytes. verifyBundle
 * recomputes every hash and closure edge, so tampering refuses before
 * any commit (PUB-001, PUB-002, PUB-004).
 *
 * How it fits: this is mechanism, not policy. Nothing here talks to a
 * server, executes a procedure, or grants authority; globs expand and
 * die here, paths stay relative, and a procedure compiles inert
 * (PUB-010, PUB-011).
 */
var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { existsSync, lstatSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BindingProfileSchema, DomainPackSchema, MACHINE_PREDICATE, MemoryBindingSchema, OPERATION_CLASSES, PostureSchema, TRUST_TIERS, TaskContractSchema, VALIDATOR_CLASSES, VALIDATOR_OUTCOMES, canonicalJson, contentHash, productSourceApiVersionReadable, refuse, spanHash, } from '@zero-ar/contracts';
import { ProcedureManifestSchema, PublicationBundleManifestSchema } from '@zero-ar/contracts';
import { admitCatalogueEntry, catalogueDefaults, compileVerificationPlan, defineCatalogueEntry, verificationCheckpointInputForContract } from '@zero-ar/validator-kit';
const COMPILER = { name: '@zero-ar/sdk', version: '0.2.0', canonicalization: 'canonical-json-1' };
/**
 * The YAML parser is an SDK authoring dependency, loaded only when a YAML
 * source actually compiles. Runtime workers consume compiled artifacts,
 * so the parser stays off the run path and out of the runtime image (PUB-020).
 */
async function parseYaml(text) {
    let parser;
    try {
        parser = await import('yaml');
    }
    catch {
        refuse({
            code: 'publish.parser.absent',
            message: 'the yaml authoring parser is not installed with the SDK. Reinstall @zero-ar/sdk with its runtime dependencies before compiling this source.',
            clause: 'PUB-020',
        });
    }
    return parser.parse(text);
}
const MEDIA = {
    '.md': 'text/markdown',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml',
    '.json': 'application/json',
    '.txt': 'text/plain',
    '.ts': 'text/typescript',
};
function mediaType(path) {
    const dot = path.lastIndexOf('.');
    return MEDIA[dot >= 0 ? path.slice(dot) : ''] ?? 'application/octet-stream';
}
/** Resolve inside the project only: escapes and symlinks refuse, whatever declared them (PUB-SEC-004). */
function contained(root, from, declared) {
    const path = resolve(dirname(from), declared);
    if (path !== root && !path.startsWith(root + '/')) {
        refuse({ code: 'publish.path.escape', message: `${declared} resolves outside the project root, and a closure carries only bytes it declares inside it.`, clause: 'PUB-010' });
    }
    if (lstatSync(path).isSymbolicLink()) {
        refuse({ code: 'publish.symlink', message: `${declared} is a symbolic link, which hides where bytes come from; declare the real file instead.`, clause: 'PUB-010' });
    }
    return path;
}
/** Expand one declared resource: a plain path, or dir/** for every file under it, sorted. */
function expand(root, from, declared) {
    if (declared.endsWith('/**')) {
        const base = contained(root, from, declared.slice(0, -3));
        const files = [];
        const walk = (dir) => {
            for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
                const path = join(dir, entry.name);
                if (lstatSync(path).isSymbolicLink()) {
                    refuse({ code: 'publish.symlink', message: `${relative(root, path)} is a symbolic link inside a declared resource tree; declare real files.`, clause: 'PUB-010' });
                }
                if (entry.isDirectory())
                    walk(path);
                else if (entry.isFile())
                    files.push(path);
            }
        };
        walk(base);
        return files;
    }
    return [contained(root, from, declared)];
}
/** Every regular skill file in stable relative-path order; adjacency confers no authority. */
function skillFiles(root) {
    const files = [];
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
            if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.DS_Store' || entry.name === 'zero-ar.skill-lock.json')
                continue;
            const path = join(dir, entry.name);
            if (lstatSync(path).isSymbolicLink()) {
                refuse({ code: 'publish.symlink', message: `${relative(root, path)} is a symbolic link inside an Agent Skill; publish real files.`, clause: 'PUB-010' });
            }
            if (entry.isDirectory())
                walk(path);
            else if (entry.isFile())
                files.push(path);
            else
                refuse({ code: 'publish.skill.file-kind', message: `${relative(root, path)} is not a regular file, so it cannot enter a portable Agent Skill.`, clause: 'PUB-031' });
        }
    };
    walk(root);
    return files;
}
/** Parse and validate the standard SKILL.md frontmatter without changing its bytes. */
async function skillSource(path, directory, selectedVersion) {
    const text = readFileSync(path, 'utf8');
    if (!text.startsWith('---\n')) {
        refuse({ code: 'publish.skill.frontmatter', message: 'SKILL.md needs YAML frontmatter beginning with ---. Add name and description before the Markdown body.', clause: 'PUB-031' });
    }
    const boundary = text.indexOf('\n---\n', 4);
    if (boundary < 0) {
        refuse({ code: 'publish.skill.frontmatter', message: 'SKILL.md frontmatter has no closing ---. Close it before the Markdown body.', clause: 'PUB-031' });
    }
    const parsed = (await parseYaml(text.slice(4, boundary)));
    const name = typeof parsed['name'] === 'string' ? parsed['name'] : '';
    const description = typeof parsed['description'] === 'string' ? parsed['description'] : '';
    if (!name || !description) {
        refuse({ code: 'publish.skill.required', message: 'SKILL.md needs non-empty name and description fields. Add both standard fields and retry.', clause: 'PUB-031' });
    }
    if (name !== basename(directory)) {
        refuse({ code: 'publish.skill.name', message: `skill name ${name} does not match its directory ${basename(directory)}. Make the standard package name and directory agree.`, clause: 'PUB-031' });
    }
    for (const field of ['license', 'compatibility']) {
        if (parsed[field] !== undefined && typeof parsed[field] !== 'string') {
            refuse({ code: 'publish.skill.frontmatter', message: `SKILL.md field ${field} must be a string when present.`, clause: 'PUB-031' });
        }
    }
    if (parsed['metadata'] !== undefined) {
        const metadata = parsed['metadata'];
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata) || Object.values(metadata).some((value) => typeof value !== 'string')) {
            refuse({ code: 'publish.skill.frontmatter', message: 'SKILL.md metadata must map string keys to string values.', clause: 'PUB-031' });
        }
    }
    const rawAllowed = parsed['allowed-tools'];
    if (rawAllowed !== undefined && typeof rawAllowed !== 'string' && (!Array.isArray(rawAllowed) || rawAllowed.some((value) => typeof value !== 'string'))) {
        refuse({ code: 'publish.skill.frontmatter', message: 'SKILL.md allowed-tools must be a string or a list of strings.', clause: 'PUB-034' });
    }
    const allowed_tools = typeof rawAllowed === 'string' ? rawAllowed.split(/\s+/).filter(Boolean) : (rawAllowed ?? []);
    const metadata = (parsed['metadata'] ?? {});
    return {
        name,
        description,
        version: selectedVersion ?? metadata['version'] ?? '0.0.0',
        allowed_tools,
        body: text.slice(boundary + 5),
    };
}
/** Parse YAML front matter once during authoring. Markdown bodies carry documentation only. */
async function frontmatterDocument(path) {
    const text = readFileSync(path, 'utf8');
    if (!text.startsWith('---\n')) {
        refuse({ code: 'publish.frontmatter.missing', message: `${path} needs YAML front matter beginning with ---. Add the structured declaration before the Markdown body.`, clause: 'ADX-001' });
    }
    const boundary = text.indexOf('\n---\n', 4);
    if (boundary < 0) {
        refuse({ code: 'publish.frontmatter.unclosed', message: `${path} has no closing --- for its structured declaration.`, clause: 'ADX-001' });
    }
    return (await parseYaml(text.slice(4, boundary)));
}
/** Parse the agent root from every supported authoring form into one source shape. */
async function agentSource(path) {
    if (path.endsWith('.yaml') || path.endsWith('.yml') || path.endsWith('.json') || path.endsWith('.md')) {
        const doc = path.endsWith('.json')
            ? JSON.parse(readFileSync(path, 'utf8'))
            : path.endsWith('.md')
                ? await frontmatterDocument(path)
                : (await parseYaml(readFileSync(path, 'utf8')));
        const source_format = requireSourceDocument(doc, 'Agent', path);
        return { name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...doc.spec, source_format };
    }
    if (path.endsWith('.ts')) {
        const stat = statSync(path);
        const module = (await import(__rewriteRelativeImportExtension(`${pathToFileURL(path).href}?c=${stat.mtimeMs}-${stat.size}`)));
        const declared = module.AGENT ?? module.default;
        if (!declared) {
            refuse({ code: 'publish.source.unknown', message: `${path} exports no AGENT declaration or default agent; export one typed definition.`, clause: 'PUB-001' });
        }
        const { name, version, instructions, model, tools, procedures, skills, task_contract, validators, posture, semantic_declarations, domain_pack, memory, binding_profiles, workspace, overrides, model_fallback_set } = declared;
        return {
            name,
            version,
            instructions,
            ...(model ? { model } : {}),
            ...(model_fallback_set ? { model_fallback_set } : {}),
            ...(tools ? { tools } : {}),
            ...(procedures ? { procedures } : {}),
            ...(skills ? { skills } : {}),
            ...(task_contract ? { task_contract } : {}),
            ...(validators ? { validators } : {}),
            ...(posture ? { posture } : {}),
            ...(semantic_declarations ? { semantic_declarations } : {}),
            ...(domain_pack ? { domain_pack } : {}),
            ...(memory ? { memory } : {}),
            ...(binding_profiles ? { binding_profiles } : {}),
            ...(workspace ? { workspace } : {}),
            ...(overrides ? { overrides } : {}),
        };
    }
    refuse({ code: 'publish.source.unknown', message: `${path} is not a supported authoring form; use YAML, JSON, Markdown front matter or TypeScript.`, clause: 'PUB-001' });
}
/** Parse one project declaration without carrying its source form into the bundle. */
async function declarationSource(path) {
    if (path.endsWith('.yaml') || path.endsWith('.yml'))
        return (await parseYaml(readFileSync(path, 'utf8')));
    if (path.endsWith('.json'))
        return JSON.parse(readFileSync(path, 'utf8'));
    if (path.endsWith('.md'))
        return frontmatterDocument(path);
    refuse({ code: 'publish.source.unknown', message: `${path} is not a supported declaration source. Use YAML, JSON or Markdown front matter.`, clause: 'PUB-001' });
}
function requireSourceDocument(doc, expectedKind, sourceName) {
    if (!productSourceApiVersionReadable(doc.apiVersion) || doc.kind !== expectedKind) {
        const versions = ['ramsden/v1', 'zero-ar/v1'].join(' or ');
        refuse({
            code: 'publish.source.unknown',
            message: `${sourceName} is not a supported ${expectedKind} source. Use apiVersion ${versions} and kind ${expectedKind}.`,
            clause: 'PUB-001',
        });
    }
    return doc.apiVersion;
}
/** Semantic declarations are inert data. Reject fields that would encode behaviour. */
function semanticData(value, path = 'spec') {
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
        return;
    if (Array.isArray(value)) {
        value.forEach((entry, index) => semanticData(entry, `${path}.${index}`));
        return;
    }
    if (!value || typeof value !== 'object') {
        refuse({ code: 'publish.semantic.non-data', message: `${path} is not serializable semantic data. Replace it with fields, types, relationships, time meaning, or mechanical conditions.`, clause: 'EXT-011' });
    }
    for (const [key, entry] of Object.entries(value)) {
        if (/prompt|instruction|weight|retrieval|script|code|executable/i.test(key)) {
            refuse({ code: 'publish.semantic.behaviour', message: `${path}.${key} would encode runtime behaviour. Semantic declarations may contain data meaning, never prompts, weights, retrieval rules, scripts, or code.`, clause: 'EXT-011' });
        }
        semanticData(entry, `${path}.${key}`);
    }
}
/** One asset writer for source files and deterministic authoring output. */
function assetWriter(blobs, assets) {
    const generated = (text, type, role) => {
        const ref = spanHash(text);
        const bytes = Buffer.byteLength(text);
        if (!blobs.has(ref)) {
            blobs.set(ref, text);
            assets.push({ content_ref: ref, bytes, media_type: type, classification: 'internal', role });
        }
        return { ref, bytes };
    };
    const add = ((path, role) => generated(readFileSync(path, 'utf8'), mediaType(path), role));
    add.generated = generated;
    return add;
}
/** Bundle one Tool Kit host into immutable JavaScript while the authoring dependencies are present. */
async function bundledToolHost(root, entryPath, hostPath, exported, addAsset) {
    let build;
    try {
        ({ build } = await import('esbuild'));
    }
    catch {
        refuse({
            code: 'publish.tool.bundler-absent',
            message: 'the SDK has no executable bundler, so it cannot produce the source-free Tool Host artifact. Reinstall @zero-ar/sdk with its runtime dependencies and compile again.',
            clause: 'ADX-019',
        });
    }
    const entry = relative(root, entryPath).replaceAll('\\', '/');
    const generatedHost = [
        "import { serveTools } from '@zero-ar/tool-kit';",
        `import { ${exported} as TOOL } from ${JSON.stringify(entry.startsWith('.') ? entry : `./${entry}`)};`,
        'await serveTools({ tools: [TOOL] }).stdio();',
        '',
    ].join('\n');
    try {
        const result = await build({
            absWorkingDir: root,
            ...(hostPath
                ? { entryPoints: [hostPath] }
                : { stdin: { contents: generatedHost, loader: 'ts', resolveDir: root, sourcefile: 'zero-ar-published-tool-host.ts' } }),
            bundle: true,
            write: false,
            platform: 'node',
            format: 'esm',
            target: 'node24',
            packages: 'bundle',
            minify: true,
            legalComments: 'none',
            sourcemap: false,
            treeShaking: true,
            charset: 'utf8',
            logLevel: 'silent',
        });
        if (result.outputFiles.length !== 1) {
            refuse({
                code: 'publish.tool.bundle-output',
                message: `the Tool Host build produced ${result.outputFiles.length} files instead of one self-contained JavaScript artifact. Remove code splitting and publish one process entry.`,
                clause: 'ADX-019',
            });
        }
        return addAsset.generated(result.outputFiles[0].text, 'text/javascript', 'tool-host-bundle');
    }
    catch (error) {
        if (error instanceof Error && error.name === 'DiagnosticError')
            throw error;
        refuse({
            code: 'publish.tool.bundle-failed',
            message: `the Tool Host could not be bundled from the pinned package (${error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500)}). Install the locked authoring dependencies and keep the host within one bundleable Node process.`,
            clause: 'ADX-019',
        });
    }
}
function executionAssetRefs(binding) {
    return binding
        ? [binding.entry_ref, binding.package_lock_ref, ...(binding.host_ref ? [binding.host_ref] : []), ...(binding.bundle_ref ? [binding.bundle_ref] : [])]
        : [];
}
/** Pin a local executable package and compare its public-kit manifest with the declaration. */
async function executableBinding(root, declarationPath, spec, addAsset, expected) {
    const raw = spec['binding'];
    if (raw === undefined)
        return null;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        refuse({ code: `publish.${expected.kind}.binding`, message: `${expected.kind} ${expected.name} has no structured execution binding. Declare a binding with exact package inputs.`, clause: 'ADX-008' });
    }
    const binding = raw;
    if (binding['kind'] !== 'process') {
        refuse({ code: `publish.${expected.kind}.binding-kind`, message: `${expected.kind} ${expected.name} declares binding kind ${String(binding['kind'])}. This compiler packages process bindings; register remote interfaces through their adapter.`, clause: 'ADX-011' });
    }
    if (typeof binding['entry'] !== 'string' || typeof binding['package_lock'] !== 'string') {
        refuse({ code: `publish.${expected.kind}.binding-incomplete`, message: `${expected.kind} ${expected.name} needs entry and package_lock paths so publication can pin its executable identity.`, clause: 'ADX-019' });
    }
    const entryPath = contained(root, declarationPath, binding['entry']);
    const lockPath = contained(root, declarationPath, binding['package_lock']);
    const entry = addAsset(entryPath, `${expected.kind}-executable`);
    const packageLock = addAsset(lockPath, `${expected.kind}-package-lock`);
    const exported = typeof binding['export'] === 'string' ? binding['export'] : expected.kind === 'tool' ? 'TOOL' : 'VALIDATOR';
    const stat = statSync(entryPath);
    const module = await import(__rewriteRelativeImportExtension(`${pathToFileURL(entryPath).href}?c=${stat.mtimeMs}-${stat.size}`));
    const implementation = module[exported];
    if (!implementation?.manifest) {
        refuse({ code: `publish.${expected.kind}.export`, message: `${binding['entry']} exports no ${exported} public-kit definition. Export the declared name from the pinned entry.`, clause: 'ADX-011' });
    }
    const actual = implementation.manifest;
    for (const [field, wanted] of Object.entries({ name: expected.name, version: expected.version, ...expected.fields })) {
        if (canonicalJson(actual[field]) !== canonicalJson(wanted)) {
            refuse({
                code: `publish.${expected.kind}.implementation-mismatch`,
                message: `${expected.kind} ${expected.name} declares ${field} as ${canonicalJson(wanted)}, but ${binding['entry']} exports ${canonicalJson(actual[field])}. Keep the declaration and implementation on one contract.`,
                clause: 'ADX-009',
            });
        }
    }
    const hostPath = typeof binding['host'] === 'string' ? contained(root, declarationPath, binding['host']) : null;
    const host = hostPath ? addAsset(hostPath, `${expected.kind}-host`) : null;
    const bundled = expected.kind === 'tool'
        ? await bundledToolHost(root, entryPath, hostPath, exported, addAsset)
        : null;
    const identity = {
        kind: 'process',
        entry_ref: entry.ref,
        export: exported,
        package_lock_ref: packageLock.ref,
        ...(host ? { host_ref: host.ref } : {}),
        ...(bundled ? { bundle_ref: bundled.ref, manifest_ref: contentHash(actual) } : {}),
    };
    return { ...identity, execution_ref: contentHash(identity) };
}
function compiledValidatorCatalogue(spec, identity, binding) {
    const description = spec['description'];
    const ruleKinds = spec['rule_kinds'];
    const limitations = spec['limitations'];
    const explicitImplementation = spec['implementation_ref'];
    const selectedCatalogueEntry = spec['catalogue_entry'];
    if (selectedCatalogueEntry !== undefined) {
        if (typeof description !== 'string' || !description.trim()) {
            refuse({
                code: 'publish.validator.catalogue-incomplete',
                message: `validator ${identity.name} needs a description alongside its selected catalogue entry.`,
                clause: 'VPC-014',
            });
        }
        const selected = admitCatalogueEntry(selectedCatalogueEntry);
        if (selected.identity.name !== identity.name
            || selected.identity.version !== identity.version
            || selected.finding_contract.class !== identity.class
            || selected.cost_envelope.wall_ms !== identity.cost_wall_ms
            || (binding !== null && selected.identity.implementation_ref !== binding.execution_ref)) {
            refuse({
                code: 'publish.validator.catalogue-mismatch',
                message: `validator ${identity.name} differs from its selected exact catalogue identity, class, cost or executable binding.`,
                clause: 'VPC-008',
            });
        }
        return selected;
    }
    if (typeof description !== 'string'
        || !description.trim()
        || !Array.isArray(ruleKinds)
        || ruleKinds.length === 0
        || ruleKinds.some((value) => typeof value !== 'string' || !value)
        || !Array.isArray(limitations)
        || limitations.length === 0
        || limitations.some((value) => typeof value !== 'string' || !value)
        || (!binding && (typeof explicitImplementation !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(explicitImplementation)))) {
        refuse({
            code: 'publish.validator.catalogue-incomplete',
            message: `validator ${identity.name} needs a description, rule_kinds, limitations and an exact executable binding or implementation_ref.`,
            clause: 'VPC-014',
        });
    }
    const defaults = catalogueDefaults();
    const evidence = spec['evidence'] === undefined ? defaults.evidence : spec['evidence'];
    const runtimeNeeds = spec['runtime_needs'] === undefined ? {} : spec['runtime_needs'];
    if (!runtimeNeeds || typeof runtimeNeeds !== 'object' || Array.isArray(runtimeNeeds)) {
        refuse({ code: 'publish.validator.runtime-needs', message: `validator ${identity.name} runtime_needs must be a structured object.`, clause: 'VPC-007' });
    }
    return defineCatalogueEntry({
        kind: 'custom',
        identity: {
            name: identity.name,
            version: identity.version,
            implementation_ref: binding?.execution_ref ?? explicitImplementation,
            factory_ref: typeof spec['factory_ref'] === 'string' ? spec['factory_ref'] : null,
            entrypoint: typeof spec['entrypoint'] === 'string' && spec['entrypoint']
                ? spec['entrypoint']
                : binding ? `${binding.entry_ref}#${binding.export}` : identity.name,
        },
        finding_contract: {
            ...defaults.finding_contract,
            class: identity.class,
        },
        input_contract: defaults.input_contract,
        coverage_capability: { rule_kinds: ruleKinds },
        cost_envelope: {
            ...defaults.cost_envelope,
            wall_ms: identity.cost_wall_ms,
            compute_ms: identity.cost_wall_ms,
        },
        evidence: evidence,
        runtime_needs: {
            ...defaults.runtime_needs,
            ...runtimeNeeds,
            bundle_ref: binding?.execution_ref
                ?? (typeof runtimeNeeds['bundle_ref'] === 'string'
                    ? runtimeNeeds['bundle_ref']
                    : null),
        },
        limitations: limitations,
    });
}
/** Normalize one tool contract and its optional executable binding. */
async function compiledTool(root, path, doc, addAsset) {
    const spec = doc.spec ?? {};
    const name = doc.metadata?.name ?? '';
    const version = doc.metadata?.version ?? '';
    const declaredClass = spec['operation_class'];
    const reviewed = typeof spec['reviewer'] === 'string' && spec['reviewer'].length > 0;
    const operationClass = OPERATION_CLASSES.includes(declaredClass) && (declaredClass === 'effect-proposal' || reviewed) ? declaredClass : 'effect-proposal';
    const isolation = TRUST_TIERS.includes(spec['isolation']) ? spec['isolation'] : 'process';
    const rawInputSchema = spec['input_schema'];
    const rawOutputSchema = spec['output_schema'];
    const rawDisclosure = spec['disclosure'];
    let disclosure = null;
    if (rawDisclosure !== undefined) {
        if (!rawDisclosure || typeof rawDisclosure !== 'object' || Array.isArray(rawDisclosure)) {
            refuse({ code: 'publish.tool.disclosure', message: `tool ${name} disclosure must be an object of compact selection hints.`, clause: 'DXI-064' });
        }
        const value = rawDisclosure;
        const classes = new Set(['small', 'medium', 'large', 'unknown']);
        for (const field of ['purpose', 'use_when', 'do_not_use_when']) {
            if (value[field] !== undefined && (typeof value[field] !== 'string' || value[field].trim().length === 0 || value[field].length > 500)) {
                refuse({ code: 'publish.tool.disclosure-text', message: `tool ${name} disclosure.${field} must be compact non-empty text of at most 500 characters.`, clause: 'DXI-064' });
            }
        }
        for (const field of ['cost', 'latency', 'result_size']) {
            if (value[field] !== undefined && !classes.has(value[field])) {
                refuse({ code: 'publish.tool.disclosure-class', message: `tool ${name} disclosure.${field} must be small, medium, large, or unknown.`, clause: 'DXI-064' });
            }
        }
        if (value['preactivate'] !== undefined && typeof value['preactivate'] !== 'boolean') {
            refuse({ code: 'publish.tool.disclosure-preactivate', message: `tool ${name} disclosure.preactivate must be boolean.`, clause: 'DXI-066' });
        }
        disclosure = JSON.parse(canonicalJson(value));
    }
    if (!rawInputSchema || typeof rawInputSchema !== 'object' || Array.isArray(rawInputSchema) || rawInputSchema['type'] !== 'object') {
        refuse({ code: 'publish.tool.schema-missing', message: `tool ${name || path} has no object input_schema. Add the authoritative JSON Schema object used by the model and host.`, clause: 'PUB-017' });
    }
    if (rawOutputSchema !== undefined && (!rawOutputSchema || typeof rawOutputSchema !== 'object' || Array.isArray(rawOutputSchema) || rawOutputSchema['type'] !== 'object')) {
        refuse({ code: 'publish.tool.output-schema', message: `tool ${name || path} has an invalid output_schema. Use one object JSON Schema for host validation and generated documentation.`, clause: 'ADX-009' });
    }
    const inputSchema = JSON.parse(canonicalJson(rawInputSchema));
    const outputSchema = rawOutputSchema ? JSON.parse(canonicalJson(rawOutputSchema)) : null;
    const rawMetering = spec['metering'];
    let metering = null;
    if (rawMetering !== undefined) {
        if (!rawMetering || typeof rawMetering !== 'object' || Array.isArray(rawMetering)) {
            refuse({ code: 'publish.tool.metering', message: `tool ${name} has no structured metering declaration. Use bounded with a positive maximum, or unmetered.`, clause: 'ADX-023' });
        }
        const value = rawMetering;
        if (value['mode'] === 'bounded') {
            if (!['bytes', 'compute_ms'].includes(value['denomination']) || !Number.isFinite(value['maximum']) || value['maximum'] <= 0) {
                refuse({ code: 'publish.tool.metering-bound', message: `tool ${name} cannot reserve its declared bound. Add bytes or compute_ms with a positive maximum before invocation.`, clause: 'ADX-023' });
            }
            metering = { mode: 'bounded', denomination: value['denomination'], maximum: value['maximum'], reserve: 'before-invocation' };
        }
        else if (value['mode'] === 'unmetered' || value['mode'] === 'declared-by-result') {
            metering = { mode: 'unmetered', hard_spend_bound: false };
        }
        else {
            refuse({ code: 'publish.tool.metering-mode', message: `tool ${name} has unknown metering mode ${String(value['mode'])}. Use bounded or unmetered.`, clause: 'ADX-023' });
        }
    }
    const binding = await executableBinding(root, path, spec, addAsset, {
        kind: 'tool',
        name,
        version,
        fields: {
            description: String(spec['description'] ?? ''),
            input_schema: inputSchema,
            ...(outputSchema ? { output_schema: outputSchema } : {}),
            operation_class: operationClass,
            isolation,
            cost: metering?.['mode'] === 'bounded' ? { denomination: metering['denomination'], enforced_max: metering['maximum'] } : null,
            ...(disclosure ? { disclosure } : {}),
        },
    });
    return {
        declaration: {
            kind: 'tool',
            name,
            version,
            description: String(spec['description'] ?? ''),
            input_schema: inputSchema,
            ...(outputSchema ? { output_schema: outputSchema } : {}),
            operation_class: operationClass,
            isolation,
            ...(metering ? { metering } : {}),
            ...(binding ? { binding } : {}),
            ...(typeof spec['target'] === 'string' ? { target: spec['target'] } : {}),
            ...(typeof spec['operation'] === 'string' ? { operation: spec['operation'] } : {}),
            ...(disclosure ? { disclosure } : {}),
            reviewer: reviewed && operationClass !== 'effect-proposal' ? spec['reviewer'] : null,
        },
        bindingRefs: executionAssetRefs(binding),
    };
}
/** Canonicalize published override bounds and refuse any source-time widening. */
function normalizedOverrides(agent, toolNames, workspace) {
    const requested = agent.overrides ?? {};
    const models = [...new Set(requested.models ?? [])].sort();
    const tools = [...new Set(requested.tools ?? [])].sort();
    const workspaceOperations = [...new Set(requested.workspace_operations ?? [])].sort();
    for (const model of models) {
        if (!model || /^https?:\/\//.test(model)) {
            refuse({ code: 'publish.override.model', message: `model override ${model || '<empty>'} is not an exact enabled model selector or alias. URLs do not select models.`, clause: 'ADX-006' });
        }
    }
    for (const tool of tools) {
        if (!toolNames.has(tool)) {
            refuse({ code: 'publish.override.tool-widening', message: `tool override ${tool} is outside the agent's published tool set. An override may choose or remove a tool, never add one.`, clause: 'ADX-020' });
        }
    }
    const publishedWorkspaceOperations = new Set(workspace.flatMap((mount) => mount.operations.map((operation) => operation.name)));
    for (const operation of workspaceOperations) {
        if (!publishedWorkspaceOperations.has(operation)) {
            refuse({ code: 'publish.override.workspace-widening', message: `workspace override ${operation} is outside the agent's published workspace operations. Narrow the override to a selected operation.`, clause: 'ADX-020' });
        }
    }
    return { models, tools, workspace_operations: workspaceOperations };
}
/** Compile one standard Agent Skill into the runtime's inert procedure envelope. */
async function compileStandardSkill(directory, admittedTools, addAsset, selectedVersion) {
    const source = join(directory, 'SKILL.md');
    if (!existsSync(source)) {
        refuse({ code: 'publish.skill.missing', message: `${relative(dirname(directory), source)} is missing. A standard Agent Skill starts with SKILL.md.`, clause: 'PUB-031' });
    }
    if (lstatSync(source).isSymbolicLink()) {
        refuse({ code: 'publish.symlink', message: 'SKILL.md is a symbolic link, which hides where the package bytes come from. Publish the real file.', clause: 'PUB-010' });
    }
    const parsed = await skillSource(source, directory, selectedVersion);
    const entry = addAsset(source, 'procedure-entry');
    const resources = [];
    for (const file of skillFiles(directory)) {
        if (file === source)
            continue;
        const added = addAsset(file, 'procedure-resource');
        resources.push({ path: relative(directory, file), content_ref: added.ref, bytes: added.bytes, media_type: mediaType(file) });
    }
    const compatibility = parsed.allowed_tools
        .filter((tool) => !admittedTools.has(tool))
        .map((tool) => `allowed-tool:${tool}`);
    for (const reference of parsed.body.matchAll(/(?:^|[\s`(])(?:\.\/)?(scripts\/[A-Za-z0-9._/-]+)/gm)) {
        const path = reference[1].replace(/[.,;:!?]+$/, '');
        if (!compatibility.includes(`script:${path}`))
            compatibility.push(`script:${path}`);
    }
    compatibility.sort();
    const manifest = ProcedureManifestSchema.parse({
        kind: 'procedure',
        name: parsed.name,
        version: parsed.version,
        entry_ref: entry.ref,
        description: parsed.description,
        discovery: { topics: [], summary: parsed.description.slice(0, 500) },
        resources,
        executable: false,
        entry_bytes: entry.bytes,
        allowed_tools: [...parsed.allowed_tools].sort(),
        // Newly compiled skills advertise and load on request. Selecting many
        // skills never means carrying many skill bodies (DXI-006).
        activation: 'progressive',
    });
    return { manifest, entry, resources, compatibility, source };
}
/**
 * Compile one project rooted at an agent source into its complete,
 * deterministic publication bundle. Identical source bytes give an
 * identical bundle_ref; nothing here reads a clock or an absolute path
 * into the output.
 */
export async function compileProject(sourcePath) {
    const source = resolve(sourcePath);
    const root = dirname(source);
    const agent = await agentSource(source);
    const blobs = new Map();
    const declarations = [];
    const assets = [];
    const edges = [];
    const sourceMaps = [];
    const addAsset = assetWriter(blobs, assets);
    const addDeclaration = (declaration, entry, from, sourceFormat) => {
        const ref = contentHash(declaration);
        const sourceText = readFileSync(from, 'utf8');
        blobs.set(ref, canonicalJson(declaration));
        declarations.push({ ...entry, content_ref: ref });
        sourceMaps.push({
            content_ref: ref,
            path: relative(root, from),
            source_content_ref: spanHash(sourceText),
            ...(sourceFormat ? { source_format: sourceFormat } : {}),
        });
        return ref;
    };
    // Validators are immutable declarations. A task contract may designate
    // sufficiency, while the implementation remains deployment-owned.
    const validatorRefs = [];
    const validators = new Map();
    for (const declared of agent.validators ?? []) {
        const path = contained(root, source, declared);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'Validator', declared);
        const spec = doc.spec ?? {};
        const validatorClass = spec['class'];
        const covers = spec['covers'];
        const verdicts = spec['verdicts'];
        const cost = spec['cost_wall_ms'];
        if (!VALIDATOR_CLASSES.includes(validatorClass)
            || !Array.isArray(covers)
            || covers.length === 0
            || covers.some((value) => typeof value !== 'string' || value.length === 0)
            || !Array.isArray(verdicts)
            || verdicts.some((value) => !VALIDATOR_OUTCOMES.includes(value))
            || !verdicts.includes('indeterminate')
            || !Number.isInteger(cost)
            || cost <= 0) {
            refuse({ code: 'publish.validator.invalid', message: `validator ${doc.metadata?.name ?? declared} needs a known class, non-empty coverage, all declared outcomes including indeterminate, and a positive cost_wall_ms.`, clause: 'PUB-017' });
        }
        const binding = await executableBinding(root, path, spec, addAsset, {
            kind: 'validator',
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            fields: { class: validatorClass, findings: ['pass', 'reject', 'indeterminate'] },
        });
        const identity = {
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            class: validatorClass,
            covers: [...covers].sort(),
            cost_wall_ms: cost,
        };
        const catalogue_entry = compiledValidatorCatalogue(spec, identity, binding);
        const declaration = {
            kind: 'validator',
            ...identity,
            description: spec['description'],
            verdicts: [...new Set(verdicts)].sort(),
            catalogue_entry,
            binding,
        };
        const ref = addDeclaration(declaration, { kind: 'validator', name: declaration.name, version: declaration.version }, path, sourceFormat);
        if (declaration.binding) {
            for (const bindingRef of executionAssetRefs(declaration.binding)) {
                edges.push({ from_ref: ref, to_ref: bindingRef, kind: 'includes' });
            }
        }
        const key = `${declaration.name}@${declaration.version}`;
        if (validators.has(key))
            refuse({ code: 'publish.validator.duplicate', message: `validator ${key} appears more than once in the agent closure. Keep one exact declaration.`, clause: 'PUB-002' });
        validators.set(key, { ref, name: declaration.name, version: declaration.version, class: declaration.class, covers: declaration.covers, catalogue_entry });
        validatorRefs.push(ref);
    }
    let taskContractRef = null;
    if (agent.task_contract) {
        const path = contained(root, source, agent.task_contract);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'TaskContract', agent.task_contract);
        const contract = TaskContractSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...(doc.spec ?? {}) });
        for (const binding of contract.validators) {
            const validator = validators.get(`${binding.name}@${binding.version}`);
            if (!validator || validator.class !== binding.class || binding.covers.some((rule) => !validator.covers.includes(rule))) {
                refuse({
                    code: 'publish.contract.validator-unresolved',
                    message: `task contract ${contract.name} requires ${binding.name}@${binding.version} with matching class and coverage, but the agent closure does not declare it. Add the exact validator source and republish.`,
                    clause: 'PUB-002',
                });
            }
            // The same sufficiency rules run admission applies (Q-7), so a closure
            // that could never create a run does not publish.
            if (binding.class === 'heuristic' && binding.sufficient_for.length > 0) {
                refuse({
                    code: 'publish.contract.sufficiency-heuristic',
                    message: `task contract ${contract.name} designates heuristic validator ${binding.name}@${binding.version} sufficient for ${binding.sufficient_for.join(', ')}, and a heuristic verdict cannot alone establish verified work. Designate a deterministic, sampled-oracle or named-human validator instead and republish.`,
                    clause: 'Q-7',
                });
            }
            const uncovered = [...new Set(binding.sufficient_for.filter((rule) => !binding.covers.includes(rule)))];
            if (uncovered.length > 0) {
                refuse({
                    code: 'publish.contract.sufficiency-uncovered',
                    message: `task contract ${contract.name} designates ${binding.name}@${binding.version} sufficient for ${uncovered.join(', ')}, which that binding does not cover, so it never evaluates the rule and cannot establish it. Add the rule to its covers or remove it from sufficient_for, then republish.`,
                    clause: 'Q-7',
                });
            }
        }
        taskContractRef = addDeclaration(contract, { kind: 'task-contract', name: contract.name, version: contract.version }, path, sourceFormat);
        for (const binding of contract.validators) {
            edges.push({ from_ref: taskContractRef, to_ref: validators.get(`${binding.name}@${binding.version}`).ref, kind: 'requires' });
        }
    }
    let postureRef = null;
    if (agent.posture) {
        const path = contained(root, source, agent.posture);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'Posture', agent.posture);
        const posture = PostureSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...(doc.spec ?? {}) });
        postureRef = addDeclaration(posture, { kind: 'posture', name: posture.name, version: posture.version }, path, sourceFormat);
    }
    const semanticDeclarationRefs = [];
    for (const declared of agent.semantic_declarations ?? []) {
        const path = contained(root, source, declared);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'SemanticDeclaration', declared);
        semanticData(doc.spec ?? {});
        const declaration = {
            kind: 'semantic',
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            spec: JSON.parse(canonicalJson(doc.spec ?? {})),
        };
        semanticDeclarationRefs.push(addDeclaration(declaration, { kind: 'semantic', name: declaration.name, version: declaration.version }, path, sourceFormat));
    }
    let domainPackRef = null;
    if (agent.domain_pack) {
        const path = contained(root, source, agent.domain_pack);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'DomainPack', agent.domain_pack);
        const { validators: _packValidators, ...packSpec } = doc.spec ?? {};
        const pack = DomainPackSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...packSpec });
        for (const claim of pack.claims) {
            if (!MACHINE_PREDICATE.test(claim.predicate) || !validators.has(`${claim.evidence.validator}@${claim.evidence.version}`)) {
                refuse({ code: 'publish.pack.claim-unresolved', message: `domain pack claim ${claim.predicate} has no machine predicate with exact validator evidence in this closure. Fix the predicate or add the named validator.`, clause: 'XCV-012' });
            }
        }
        domainPackRef = addDeclaration(pack, { kind: 'domain-pack', name: pack.name, version: pack.version }, path, sourceFormat);
        const evidenceRefs = new Set(pack.claims.map((claim) => validators.get(`${claim.evidence.validator}@${claim.evidence.version}`).ref));
        for (const evidenceRef of evidenceRefs)
            edges.push({ from_ref: domainPackRef, to_ref: evidenceRef, kind: 'requires' });
    }
    // Workspace is empty unless the agent selects a reviewed profile. A
    // selected profile materializes a distinct immutable tool per mount and
    // operation; intake may later attach only a compatible instance.
    const bindingProfileRefs = [];
    const bindingProfiles = new Map();
    for (const declared of agent.binding_profiles ?? []) {
        const path = contained(root, source, declared);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'BindingProfile', declared);
        const profile = BindingProfileSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...(doc.spec ?? {}) });
        const ref = addDeclaration(profile, { kind: 'binding-profile', name: profile.name, version: profile.version }, path, sourceFormat);
        const key = `${profile.name}@${profile.version}`;
        if (bindingProfiles.has(key))
            refuse({ code: 'publish.binding-profile.duplicate', message: `binding profile ${key} appears twice. Keep one exact declaration.`, clause: 'ADX-021' });
        bindingProfiles.set(key, { ref, profile });
        bindingProfileRefs.push(ref);
    }
    // Tools keep one contract while executable bytes remain a separately
    // pinned process binding.
    const toolRefs = [];
    const toolNames = new Set();
    const materializedWorkspace = [];
    for (const [mount, selection] of Object.entries(agent.workspace?.mounts ?? {}).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))) {
        if (!/^[a-z][a-z0-9-]*$/.test(mount)) {
            refuse({ code: 'publish.workspace.mount-name', message: `workspace mount ${mount} is not a lowercase mount name. Rename it before publication.`, clause: 'ADX-021' });
        }
        const selected = bindingProfiles.get(selection.binding_profile);
        if (!selected) {
            refuse({ code: 'publish.workspace.profile-unresolved', message: `workspace mount ${mount} selects ${selection.binding_profile}, but that exact binding profile is absent from the closure. Add its source to binding_profiles.`, clause: 'ADX-013' });
        }
        const operations = [];
        for (const operationName of [...new Set(selection.operations)].sort()) {
            const operation = selected.profile.operations.find((candidate) => candidate.name === operationName);
            if (!operation) {
                refuse({ code: 'publish.workspace.operation-unavailable', message: `workspace mount ${mount} requests ${operationName}, which profile ${selection.binding_profile} does not declare. Narrow the request to a declared operation.`, clause: 'ADX-020' });
            }
            const declaration = {
                kind: 'tool',
                name: `workspace.${mount}.${operation.name}`,
                version: selected.profile.version,
                description: `${operation.name} within the ${mount} workspace mount under its pinned binding profile.`,
                input_schema: { type: 'object', additionalProperties: false },
                operation_class: operation.operation_class,
                isolation: 'process',
                binding_profile_ref: selected.ref,
                mount,
                operation: operation.name,
            };
            const ref = addDeclaration(declaration, { kind: 'tool', name: declaration.name, version: declaration.version }, source);
            edges.push({ from_ref: ref, to_ref: selected.ref, kind: 'requires' });
            toolRefs.push(ref);
            toolNames.add(declaration.name);
            operations.push({ name: operation.name, tool_ref: ref, operation_class: operation.operation_class });
        }
        materializedWorkspace.push({ mount, binding_profile_ref: selected.ref, operations });
    }
    for (const declared of agent.tools ?? []) {
        const path = contained(root, source, declared);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'Tool', declared);
        const compiled = await compiledTool(root, path, doc, addAsset);
        const name = String(compiled.declaration['name']);
        const version = String(compiled.declaration['version']);
        const ref = addDeclaration(compiled.declaration, { kind: 'tool', name, version }, path, sourceFormat);
        for (const bindingRef of compiled.bindingRefs)
            edges.push({ from_ref: ref, to_ref: bindingRef, kind: 'includes' });
        toolRefs.push(ref);
        toolNames.add(name);
    }
    // Legacy procedure wrappers remain readable during the additive migration.
    const procedureRefs = [];
    for (const declared of agent.procedures ?? []) {
        const dir = contained(root, source, declared);
        const specPath = join(dir, 'procedure.yaml');
        const doc = (await parseYaml(readFileSync(specPath, 'utf8')));
        const sourceFormat = requireSourceDocument(doc, 'Procedure', declared);
        const spec = doc.spec ?? {};
        if (spec['executable'] !== false) {
            refuse({ code: 'publish.procedure.executable', message: `procedure ${doc.metadata?.name} does not declare executable false; a procedure is knowledge, never capability.`, clause: 'PUB-011' });
        }
        const entry = addAsset(contained(root, specPath, String(spec['entry'] ?? './SKILL.md')), 'procedure-entry');
        const resources = [];
        for (const resource of spec['resources'] ?? []) {
            for (const file of expand(root, specPath, resource)) {
                const added = addAsset(file, 'procedure-resource');
                resources.push({ path: relative(dir, file), content_ref: added.ref, bytes: added.bytes, media_type: mediaType(file) });
            }
        }
        resources.sort((a, b) => (a.path < b.path ? -1 : 1));
        const discovery = spec['discovery'] ?? { topics: [], summary: String(spec['description'] ?? 'undescribed') };
        const manifest = ProcedureManifestSchema.parse({
            kind: 'procedure',
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            entry_ref: entry.ref,
            description: String(spec['description'] ?? 'undescribed'),
            discovery,
            resources,
            executable: false,
        });
        const ref = addDeclaration(manifest, { kind: 'procedure', name: manifest.name, version: manifest.version }, specPath, sourceFormat);
        procedureRefs.push(ref);
        edges.push({ from_ref: ref, to_ref: entry.ref, kind: 'includes' });
        for (const resource of resources)
            edges.push({ from_ref: ref, to_ref: resource.content_ref, kind: 'includes' });
    }
    // Standard Agent Skills need no Zero-AR wrapper. Every regular package
    // file enters the closure, while scripts and allowed-tools remain inert
    // dependency metadata and any unresolved names stay visible.
    const skillCompatibility = [];
    for (const declared of agent.skills ?? []) {
        const dir = contained(root, source, declared);
        const compiled = await compileStandardSkill(dir, toolNames, addAsset);
        const ref = addDeclaration(compiled.manifest, { kind: 'procedure', name: compiled.manifest.name, version: compiled.manifest.version }, compiled.source);
        procedureRefs.push(ref);
        edges.push({ from_ref: ref, to_ref: compiled.entry.ref, kind: 'includes' });
        for (const resource of compiled.resources)
            edges.push({ from_ref: ref, to_ref: resource.content_ref, kind: 'includes' });
        skillCompatibility.push(...compiled.compatibility.map((limit) => `${compiled.manifest.name}:${limit}`));
    }
    const memoryBindings = (agent.memory ?? []).map((binding) => MemoryBindingSchema.parse(binding));
    const duplicateMemoryBindings = memoryBindings
        .map((binding) => binding.name)
        .filter((name, index, names) => names.indexOf(name) !== index);
    if (duplicateMemoryBindings.length > 0) {
        refuse({
            code: 'publish.memory.binding-duplicate',
            message: `memory binding ${[...new Set(duplicateMemoryBindings)].sort().join(', ')} appears more than once. Keep one immutable policy for each binding name.`,
            clause: 'MSH-002',
        });
    }
    // The agent root: instructions ride as an asset, dependencies as refs.
    const instructions = addAsset(contained(root, source, agent.instructions), 'instructions');
    const agentDeclaration = {
        kind: 'agent',
        name: agent.name,
        version: agent.version,
        instructions_ref: instructions.ref,
        model: agent.model ?? 'project-default',
        ...(agent.model_fallback_set ? { model_fallback_set: agent.model_fallback_set } : {}),
        tools: [...toolRefs].sort(),
        procedures: [...procedureRefs].sort(),
        task_contract_ref: taskContractRef,
        validator_refs: [...validatorRefs].sort(),
        posture_ref: postureRef,
        semantic_declarations: [...semanticDeclarationRefs].sort(),
        domain_pack_ref: domainPackRef,
        memory: memoryBindings.sort((left, right) => left.name.localeCompare(right.name)),
        binding_profile_refs: [...bindingProfileRefs].sort(),
        workspace: { mounts: materializedWorkspace },
        overrides: normalizedOverrides(agent, toolNames, materializedWorkspace),
    };
    const rootRef = addDeclaration(agentDeclaration, { kind: 'agent', name: agent.name, version: agent.version }, source, agent.source_format);
    edges.push({ from_ref: rootRef, to_ref: instructions.ref, kind: 'includes' });
    for (const ref of [
        ...toolRefs,
        ...procedureRefs,
        ...validatorRefs,
        ...semanticDeclarationRefs,
        ...(taskContractRef ? [taskContractRef] : []),
        ...(postureRef ? [postureRef] : []),
        ...(domainPackRef ? [domainPackRef] : []),
        ...bindingProfileRefs,
    ].sort())
        edges.push({ from_ref: rootRef, to_ref: ref, kind: 'requires' });
    declarations.sort((a, b) => (a.kind + a.name + a.version < b.kind + b.name + b.version ? -1 : 1));
    assets.sort((a, b) => (a.content_ref < b.content_ref ? -1 : 1));
    edges.sort((a, b) => (a.from_ref + a.to_ref + a.kind < b.from_ref + b.to_ref + b.kind ? -1 : 1));
    sourceMaps.sort((a, b) => (a.path < b.path ? -1 : 1));
    const unsealed = {
        format_version: '1.0.0',
        root_kind: 'agent',
        root_ref: rootRef,
        declarations,
        assets,
        edges,
        compiler: COMPILER,
        source_maps: sourceMaps,
        conformance: [
            { check: 'closure.complete', outcome: 'pass' },
            { check: 'procedures.inert', outcome: 'pass' },
            { check: 'paths.relative', outcome: 'pass' },
            ...skillCompatibility.map((limit) => ({ check: `skill.compatibility:${limit}`.slice(0, 128), outcome: 'refused' })),
        ],
        claims: [],
        requested_aliases: [],
    };
    const bundle = PublicationBundleManifestSchema.parse({ ...unsealed, bundle_ref: contentHash(unsealed) });
    return { bundle, blobs };
}
/** Compile an agent, standard skill or standalone public extension through one entry point. */
export async function compileAuthoringSource(sourcePath) {
    const source = resolve(sourcePath);
    if (existsSync(source) && statSync(source).isDirectory()) {
        if (existsSync(join(source, 'SKILL.md')))
            return compileSkill(source);
        const { loadProject } = await import("./project.js");
        return (await loadProject({ root: source })).compile();
    }
    if (!existsSync(source)) {
        refuse({ code: 'publish.source.missing', message: `${sourcePath} does not exist. Select an agent, extension declaration or Agent Skill directory.`, clause: 'ADX-002' });
    }
    if (basename(source) === 'SKILL.md')
        return compileSkill(dirname(source));
    const doc = source.endsWith('.ts') ? null : await declarationSource(source);
    if (doc?.kind === 'Agent' || source.endsWith('.ts'))
        return compileProject(source);
    if (!doc || !['Tool', 'Validator', 'DomainPack', 'BindingProfile'].includes(doc.kind ?? '')) {
        refuse({ code: 'publish.source.kind', message: `${sourcePath} is not a publishable agent, skill, tool, validator, domain pack or binding profile.`, clause: 'PUB-001' });
    }
    return compileStandaloneDeclaration(source, doc);
}
/** Build a one-root closure for a scaffolded extension. */
async function compileStandaloneDeclaration(source, doc) {
    const root = dirname(source);
    const blobs = new Map();
    const declarations = [];
    const assets = [];
    const edges = [];
    const sourceMaps = [];
    const addAsset = assetWriter(blobs, assets);
    const addDeclaration = (declaration, kind, name, version, from) => {
        const content_ref = contentHash(declaration);
        blobs.set(content_ref, canonicalJson(declaration));
        declarations.push({ kind, name, version, content_ref });
        sourceMaps.push({ content_ref, path: relative(root, from), source_content_ref: spanHash(readFileSync(from, 'utf8')), source_format: requireSourceDocument(doc, doc.kind ?? '', source) });
        return content_ref;
    };
    let rootRef = '';
    let rootKind;
    if (doc.kind === 'Tool') {
        const compiled = await compiledTool(root, source, doc, addAsset);
        const name = String(compiled.declaration['name']);
        const version = String(compiled.declaration['version']);
        rootKind = 'tool';
        rootRef = addDeclaration(compiled.declaration, rootKind, name, version, source);
        for (const ref of compiled.bindingRefs)
            edges.push({ from_ref: rootRef, to_ref: ref, kind: 'includes' });
    }
    else if (doc.kind === 'Validator') {
        const result = await standaloneValidator(root, source, doc, addAsset);
        rootKind = 'validator';
        rootRef = addDeclaration(result.declaration, rootKind, result.name, result.version, source);
        for (const ref of result.bindingRefs)
            edges.push({ from_ref: rootRef, to_ref: ref, kind: 'includes' });
    }
    else if (doc.kind === 'BindingProfile') {
        const profile = BindingProfileSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...(doc.spec ?? {}) });
        rootKind = 'binding-profile';
        rootRef = addDeclaration(profile, rootKind, profile.name, profile.version, source);
    }
    else {
        const rawSpec = doc.spec ?? {};
        const declaredValidators = rawSpec['validators'];
        if (declaredValidators !== undefined && (!Array.isArray(declaredValidators) || declaredValidators.some((value) => typeof value !== 'string'))) {
            refuse({ code: 'publish.pack.validators', message: `domain pack ${doc.metadata?.name ?? ''} must list validator declaration paths as strings.`, clause: 'ADX-022' });
        }
        const validators = new Map();
        for (const declared of (declaredValidators ?? [])) {
            const path = contained(root, source, declared);
            const validatorDoc = await declarationSource(path);
            requireSourceDocument(validatorDoc, 'Validator', declared);
            const result = await standaloneValidator(root, path, validatorDoc, addAsset);
            const ref = addDeclaration(result.declaration, 'validator', result.name, result.version, path);
            validators.set(`${result.name}@${result.version}`, ref);
            for (const bindingRef of result.bindingRefs)
                edges.push({ from_ref: ref, to_ref: bindingRef, kind: 'includes' });
        }
        const { validators: _validators, ...packSpec } = rawSpec;
        const pack = DomainPackSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...packSpec });
        for (const claim of pack.claims) {
            if (!MACHINE_PREDICATE.test(claim.predicate)) {
                refuse({ code: 'publish.pack.claim-prose', message: `domain pack claim ${claim.predicate} is not a versioned machine predicate. Move prose to notes.`, clause: 'ADX-022' });
            }
            if (!validators.has(`${claim.evidence.validator}@${claim.evidence.version}`)) {
                refuse({ code: 'publish.pack.claim-unpinned', message: `domain pack claim ${claim.predicate} has no exact validator evidence in this closure. Add ${claim.evidence.validator}@${claim.evidence.version}.`, clause: 'ADX-022' });
            }
        }
        rootKind = 'domain-pack';
        rootRef = addDeclaration(pack, rootKind, pack.name, pack.version, source);
        const evidenceRefs = new Set(pack.claims.map((claim) => validators.get(`${claim.evidence.validator}@${claim.evidence.version}`)));
        for (const evidenceRef of evidenceRefs)
            edges.push({ from_ref: rootRef, to_ref: evidenceRef, kind: 'requires' });
    }
    declarations.sort((left, right) => (left.kind + left.name + left.version < right.kind + right.name + right.version ? -1 : 1));
    assets.sort((left, right) => (left.content_ref < right.content_ref ? -1 : 1));
    edges.sort((left, right) => (left.from_ref + left.to_ref + left.kind < right.from_ref + right.to_ref + right.kind ? -1 : 1));
    sourceMaps.sort((left, right) => (left.path < right.path ? -1 : 1));
    const unsealed = {
        format_version: '1.0.0',
        root_kind: rootKind,
        root_ref: rootRef,
        declarations,
        assets,
        edges,
        compiler: COMPILER,
        source_maps: sourceMaps,
        conformance: [
            { check: 'closure.complete', outcome: 'pass' },
            { check: 'execution.identity-pinned', outcome: 'pass' },
            { check: 'paths.relative', outcome: 'pass' },
        ],
        claims: [],
        requested_aliases: [],
    };
    const bundle = PublicationBundleManifestSchema.parse({ ...unsealed, bundle_ref: contentHash(unsealed) });
    return { bundle, blobs };
}
async function standaloneValidator(root, path, doc, addAsset) {
    const spec = doc.spec ?? {};
    const name = doc.metadata?.name ?? '';
    const version = doc.metadata?.version ?? '';
    const validatorClass = spec['class'];
    const covers = spec['covers'];
    const verdicts = spec['verdicts'];
    const cost = spec['cost_wall_ms'];
    if (!VALIDATOR_CLASSES.includes(validatorClass) || !Array.isArray(covers) || covers.length === 0 || covers.some((value) => typeof value !== 'string' || !value) || !Array.isArray(verdicts) || verdicts.some((value) => !VALIDATOR_OUTCOMES.includes(value)) || !verdicts.includes('indeterminate') || !Number.isInteger(cost) || cost <= 0) {
        refuse({ code: 'publish.validator.invalid', message: `validator ${name || path} needs a known class, non-empty coverage, outcomes including indeterminate and a positive cost_wall_ms.`, clause: 'PUB-017' });
    }
    const binding = await executableBinding(root, path, spec, addAsset, { kind: 'validator', name, version, fields: { class: validatorClass, findings: ['pass', 'reject', 'indeterminate'] } });
    const identity = { name, version, class: validatorClass, covers: [...covers].sort(), cost_wall_ms: cost };
    const catalogue_entry = compiledValidatorCatalogue(spec, identity, binding);
    return {
        name,
        version,
        declaration: { kind: 'validator', ...identity, description: spec['description'], verdicts: [...new Set(verdicts)].sort(), catalogue_entry, binding },
        bindingRefs: executionAssetRefs(binding),
    };
}
/** Compile one reusable standard Agent Skill with no wrapper manifest. */
export async function compileSkill(directoryPath, selectedVersion) {
    const directory = resolve(directoryPath);
    if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) {
        refuse({ code: 'publish.skill.directory', message: `${directoryPath} is not a real Agent Skill directory. Select the directory that contains SKILL.md.`, clause: 'PUB-031' });
    }
    const blobs = new Map();
    const assets = [];
    const addAsset = assetWriter(blobs, assets);
    const skill = await compileStandardSkill(directory, new Set(), addAsset, selectedVersion);
    const rootRef = contentHash(skill.manifest);
    blobs.set(rootRef, canonicalJson(skill.manifest));
    const edges = [
        { from_ref: rootRef, to_ref: skill.entry.ref, kind: 'includes' },
        ...skill.resources.map((resource) => ({ from_ref: rootRef, to_ref: resource.content_ref, kind: 'includes' })),
    ].sort((a, b) => (a.from_ref + a.to_ref + a.kind < b.from_ref + b.to_ref + b.kind ? -1 : 1));
    assets.sort((a, b) => (a.content_ref < b.content_ref ? -1 : 1));
    const unsealed = {
        format_version: '1.0.0',
        root_kind: 'procedure',
        root_ref: rootRef,
        declarations: [{ kind: 'procedure', name: skill.manifest.name, version: skill.manifest.version, content_ref: rootRef }],
        assets,
        edges,
        compiler: COMPILER,
        source_maps: [{ content_ref: rootRef, path: 'SKILL.md' }],
        conformance: [
            { check: 'closure.complete', outcome: 'pass' },
            { check: 'procedures.inert', outcome: 'pass' },
            { check: 'paths.relative', outcome: 'pass' },
            ...skill.compatibility.map((limit) => ({ check: `skill.compatibility:${skill.manifest.name}:${limit}`.slice(0, 128), outcome: 'refused' })),
        ],
        claims: [],
        requested_aliases: [],
    };
    const bundle = PublicationBundleManifestSchema.parse({ ...unsealed, bundle_ref: contentHash(unsealed) });
    const compiled = { bundle, blobs };
    const lockPath = join(directory, 'zero-ar.skill-lock.json');
    if (existsSync(lockPath)) {
        const actual = JSON.parse(readFileSync(lockPath, 'utf8'));
        const expected = skillLock(compiled);
        if (canonicalJson(actual) !== canonicalJson(expected)) {
            refuse({ code: 'publish.skill.lock-stale', message: 'zero-ar.skill-lock.json does not match the current skill bytes. Review the change and regenerate the lock before publication.', clause: 'ADX-012' });
        }
    }
    return compiled;
}
/** Derive the source lock for one compiled Agent Skill. */
export function skillLock(compiled) {
    const raw = compiled.blobs.get(compiled.bundle.root_ref);
    if (!raw || compiled.bundle.root_kind !== 'procedure') {
        refuse({ code: 'publish.skill.lock-root', message: 'a skill lock can be generated only from a compiled Agent Skill root.', clause: 'ADX-012' });
    }
    const manifest = ProcedureManifestSchema.parse(JSON.parse(raw));
    return {
        schema: 'zero-ar-skill-lock/v1',
        procedure_ref: compiled.bundle.root_ref,
        activation: manifest.activation ?? 'always',
        files: [
            { path: 'SKILL.md', content_ref: manifest.entry_ref },
            ...manifest.resources.map((resource) => ({ path: resource.path, content_ref: resource.content_ref })),
        ].sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0)),
    };
}
/** Recover a standard Agent Skill directory from a publication archive without rewriting source bytes. */
export function exportAgentSkill(archive, procedureRef = archive.bundle.root_ref) {
    const blobs = archive.blobs instanceof Map ? archive.blobs : new Map(Object.entries(archive.blobs));
    const declaration = archive.bundle.declarations.find((candidate) => candidate.kind === 'procedure' && candidate.content_ref === procedureRef);
    const raw = blobs.get(procedureRef);
    if (!declaration || raw === undefined) {
        refuse({ code: 'publish.skill.unknown', message: `${procedureRef.slice(0, 20)} is not a procedure in this publication. Select an exact skill ref from the closure.`, clause: 'PUB-033' });
    }
    const manifest = ProcedureManifestSchema.parse(JSON.parse(raw));
    const entry = blobs.get(manifest.entry_ref);
    if (entry === undefined) {
        refuse({ code: 'publish.skill.incomplete', message: `skill ${manifest.name} has no stored SKILL.md bytes. Re-export the complete publication closure.`, clause: 'PUB-033' });
    }
    const files = new Map([['SKILL.md', entry]]);
    for (const resource of manifest.resources) {
        const bytes = blobs.get(resource.content_ref);
        if (bytes === undefined) {
            refuse({ code: 'publish.skill.incomplete', message: `skill ${manifest.name} is missing ${resource.path}. Re-export the complete publication closure.`, clause: 'PUB-033' });
        }
        files.set(resource.path, bytes);
    }
    return { name: manifest.name, version: manifest.version, package_ref: procedureRef, files };
}
export { verifyBundle } from '@zero-ar/contracts';
/** The readable dry-run plan: what would publish, and what that would not establish. */
export function renderPlan(compiled) {
    const { bundle } = compiled;
    const rootEntry = bundle.declarations.find((declaration) => declaration.content_ref === bundle.root_ref);
    const lines = [
        `root         ${rootEntry?.kind} ${rootEntry?.name} ${rootEntry?.version}`,
        `root_ref     ${bundle.root_ref}`,
        `bundle_ref   ${bundle.bundle_ref}`,
        ...bundle.declarations.map((declaration) => `declares     ${declaration.kind} ${declaration.name} ${declaration.version} ${declaration.content_ref.slice(0, 20)}`),
        `assets       ${bundle.assets.length}, ${bundle.assets.reduce((sum, asset) => sum + asset.bytes, 0)} bytes`,
        `edges        ${bundle.edges.length}, closure complete`,
        'establishes  compiled and verifiable only; publication is a separate authorized commit',
    ];
    return lines.join('\n');
}
/**
 * Publication preflight over exact caller-supplied deployment and budget
 * snapshots. It reads only the already-compiled closure and calls the same
 * pure compiler used at runtime.
 */
export function previewPublicationVerificationPlan(compiled, input) {
    const contractDeclaration = compiled.bundle.declarations.find((entry) => entry.kind === 'task-contract');
    const contract = contractDeclaration
        ? TaskContractSchema.parse(JSON.parse(compiled.blobs.get(contractDeclaration.content_ref) ?? 'null'))
        : null;
    const catalogue = compiled.bundle.declarations
        .filter((entry) => entry.kind === 'validator')
        .map((entry) => {
        const declaration = JSON.parse(compiled.blobs.get(entry.content_ref) ?? 'null');
        return declaration['catalogue_entry'];
    });
    const postureDeclaration = compiled.bundle.declarations.find((entry) => entry.kind === 'posture');
    const posture = input.posture ?? (postureDeclaration
        ? {
            ref: postureDeclaration.content_ref,
            configuration: PostureSchema.parse(JSON.parse(compiled.blobs.get(postureDeclaration.content_ref) ?? 'null')),
        }
        : null);
    const checkpoint = input.checkpoint ?? (contract ? verificationCheckpointInputForContract(contract, input.items_declared) : null);
    return compileVerificationPlan({
        schema: 'verification-plan-input/1',
        source: 'publication',
        task_contract_ref: contractDeclaration?.content_ref ?? null,
        task_contract: contract,
        resolved_manifest_ref: null,
        resolved_manifest: null,
        publication_ref: compiled.bundle.bundle_ref,
        catalogue,
        availability: input.availability,
        posture,
        budgets: input.budgets,
        budgets_ref: contentHash(input.budgets),
        checkpoint,
        dependency_projection_ref: contentHash({
            schema: 'verification-dependency-input/1',
            task_contract_ref: contractDeclaration?.content_ref ?? null,
            dependency_frontier: contract?.dependency_frontier ?? null,
        }),
        attention_enforcement: { mode: 'not-wired' },
        attention_capacity_snapshot: null,
        profile_manifest: input.profile_manifest,
        items_declared: input.items_declared,
    });
}
