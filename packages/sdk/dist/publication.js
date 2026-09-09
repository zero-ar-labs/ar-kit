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
import { DomainPackSchema, MACHINE_PREDICATE, OPERATION_CLASSES, PostureSchema, TRUST_TIERS, TaskContractSchema, VALIDATOR_CLASSES, VALIDATOR_OUTCOMES, canonicalJson, contentHash, productSourceApiVersionReadable, refuse, spanHash, } from '@zero-ar/contracts';
import { ProcedureManifestSchema, PublicationBundleManifestSchema } from '@zero-ar/contracts';
const COMPILER = { name: '@zero-ar/sdk', version: '0.1.0', canonicalization: 'canonical-json-1' };
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
            if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.DS_Store')
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
/** Parse the agent root from its YAML or TypeScript authoring form; both feed one canonicalization. */
async function agentSource(path) {
    if (path.endsWith('.yaml') || path.endsWith('.yml')) {
        const doc = (await parseYaml(readFileSync(path, 'utf8')));
        const source_format = requireSourceDocument(doc, 'Agent', path);
        return { name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...doc.spec, source_format };
    }
    if (path.endsWith('.ts')) {
        const stat = statSync(path);
        const module = (await import(__rewriteRelativeImportExtension(`${pathToFileURL(path).href}?c=${stat.mtimeMs}-${stat.size}`)));
        if (!module.AGENT) {
            refuse({ code: 'publish.source.unknown', message: `${path} exports no AGENT declaration; a TypeScript root exports one const AGENT.`, clause: 'PUB-001' });
        }
        return module.AGENT;
    }
    refuse({ code: 'publish.source.unknown', message: `${path} is not a supported authoring form; use agent.yaml or agent.ts.`, clause: 'PUB-001' });
}
/** Parse one project declaration without carrying its source form into the bundle. */
async function declarationSource(path) {
    if (path.endsWith('.yaml') || path.endsWith('.yml'))
        return (await parseYaml(readFileSync(path, 'utf8')));
    if (path.endsWith('.json'))
        return JSON.parse(readFileSync(path, 'utf8'));
    refuse({ code: 'publish.source.unknown', message: `${path} is not a supported declaration source. Use YAML or JSON data.`, clause: 'PUB-001' });
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
    const addAsset = (path, role) => {
        const text = readFileSync(path, 'utf8');
        const ref = spanHash(text);
        if (!blobs.has(ref)) {
            blobs.set(ref, text);
            assets.push({ content_ref: ref, bytes: Buffer.byteLength(text), media_type: mediaType(path), classification: 'internal', role });
        }
        return { ref, bytes: Buffer.byteLength(text) };
    };
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
        const declaration = {
            kind: 'validator',
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            class: validatorClass,
            covers: [...covers].sort(),
            verdicts: [...new Set(verdicts)].sort(),
            cost_wall_ms: cost,
        };
        const ref = addDeclaration(declaration, { kind: 'validator', name: declaration.name, version: declaration.version }, path, sourceFormat);
        const key = `${declaration.name}@${declaration.version}`;
        if (validators.has(key))
            refuse({ code: 'publish.validator.duplicate', message: `validator ${key} appears more than once in the agent closure. Keep one exact declaration.`, clause: 'PUB-002' });
        validators.set(key, { ref, name: declaration.name, version: declaration.version, class: declaration.class, covers: declaration.covers });
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
        const pack = DomainPackSchema.parse({ name: doc.metadata?.name ?? '', version: doc.metadata?.version ?? '', ...(doc.spec ?? {}) });
        for (const claim of pack.claims) {
            if (!MACHINE_PREDICATE.test(claim.predicate) || !validators.has(`${claim.evidence.validator}@${claim.evidence.version}`)) {
                refuse({ code: 'publish.pack.claim-unresolved', message: `domain pack claim ${claim.predicate} has no machine predicate with exact validator evidence in this closure. Fix the predicate or add the named validator.`, clause: 'XCV-012' });
            }
        }
        domainPackRef = addDeclaration(pack, { kind: 'domain-pack', name: pack.name, version: pack.version }, path, sourceFormat);
        for (const claim of pack.claims) {
            edges.push({ from_ref: domainPackRef, to_ref: validators.get(`${claim.evidence.validator}@${claim.evidence.version}`).ref, kind: 'requires' });
        }
    }
    // Tools: the declared class stands only when it is one the vocabulary
    // names; anything absent or unknown is consequential by default.
    const toolRefs = [];
    const toolNames = new Set();
    for (const declared of agent.tools ?? []) {
        const path = contained(root, source, declared);
        const doc = await declarationSource(path);
        const sourceFormat = requireSourceDocument(doc, 'Tool', declared);
        const spec = doc.spec ?? {};
        // A declared class stands only when the vocabulary names it and a
        // reviewer vouches for it; anything else compiles consequential, and
        // no HTTP method, name, or annotation ever infers safety (PUB-012).
        const declaredClass = spec['operation_class'];
        const reviewed = typeof spec['reviewer'] === 'string' && spec['reviewer'].length > 0;
        const operationClass = OPERATION_CLASSES.includes(declaredClass) && (declaredClass === 'effect-proposal' || reviewed) ? declaredClass : 'effect-proposal';
        const isolation = TRUST_TIERS.includes(spec['isolation']) ? spec['isolation'] : 'process';
        const rawInputSchema = spec['input_schema'];
        if (!rawInputSchema || typeof rawInputSchema !== 'object' || Array.isArray(rawInputSchema) || rawInputSchema['type'] !== 'object') {
            refuse({
                code: 'publish.tool.schema-missing',
                message: `tool ${doc.metadata?.name ?? declared} has no object input_schema, so a model and tool host cannot share one input contract. Add the authoritative JSON Schema object and republish.`,
                clause: 'PUB-017',
            });
        }
        const inputSchema = JSON.parse(canonicalJson(rawInputSchema));
        const declaration = {
            kind: 'tool',
            name: doc.metadata?.name ?? '',
            version: doc.metadata?.version ?? '',
            description: String(spec['description'] ?? ''),
            input_schema: inputSchema,
            operation_class: operationClass,
            isolation,
            ...(typeof spec['target'] === 'string' ? { target: spec['target'] } : {}),
            ...(typeof spec['operation'] === 'string' ? { operation: spec['operation'] } : {}),
            reviewer: reviewed && operationClass !== 'effect-proposal' ? spec['reviewer'] : null,
        };
        toolRefs.push(addDeclaration(declaration, { kind: 'tool', name: declaration.name, version: declaration.version }, path, sourceFormat));
        toolNames.add(declaration.name);
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
/** Compile one reusable standard Agent Skill with no wrapper manifest. */
export async function compileSkill(directoryPath, selectedVersion) {
    const directory = resolve(directoryPath);
    if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) {
        refuse({ code: 'publish.skill.directory', message: `${directoryPath} is not a real Agent Skill directory. Select the directory that contains SKILL.md.`, clause: 'PUB-031' });
    }
    const blobs = new Map();
    const assets = [];
    const addAsset = (path, role) => {
        const text = readFileSync(path, 'utf8');
        const ref = spanHash(text);
        if (!blobs.has(ref)) {
            blobs.set(ref, text);
            assets.push({ content_ref: ref, bytes: Buffer.byteLength(text), media_type: mediaType(path), classification: 'internal', role });
        }
        return { ref, bytes: Buffer.byteLength(text) };
    };
    const compiled = await compileStandardSkill(directory, new Set(), addAsset, selectedVersion);
    const rootRef = contentHash(compiled.manifest);
    blobs.set(rootRef, canonicalJson(compiled.manifest));
    const edges = [
        { from_ref: rootRef, to_ref: compiled.entry.ref, kind: 'includes' },
        ...compiled.resources.map((resource) => ({ from_ref: rootRef, to_ref: resource.content_ref, kind: 'includes' })),
    ].sort((a, b) => (a.from_ref + a.to_ref + a.kind < b.from_ref + b.to_ref + b.kind ? -1 : 1));
    assets.sort((a, b) => (a.content_ref < b.content_ref ? -1 : 1));
    const unsealed = {
        format_version: '1.0.0',
        root_kind: 'procedure',
        root_ref: rootRef,
        declarations: [{ kind: 'procedure', name: compiled.manifest.name, version: compiled.manifest.version, content_ref: rootRef }],
        assets,
        edges,
        compiler: COMPILER,
        source_maps: [{ content_ref: rootRef, path: 'SKILL.md' }],
        conformance: [
            { check: 'closure.complete', outcome: 'pass' },
            { check: 'procedures.inert', outcome: 'pass' },
            { check: 'paths.relative', outcome: 'pass' },
            ...compiled.compatibility.map((limit) => ({ check: `skill.compatibility:${compiled.manifest.name}:${limit}`.slice(0, 128), outcome: 'refused' })),
        ],
        claims: [],
        requested_aliases: [],
    };
    const bundle = PublicationBundleManifestSchema.parse({ ...unsealed, bundle_ref: contentHash(unsealed) });
    return { bundle, blobs };
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
