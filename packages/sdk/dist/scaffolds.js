/**
 * Deterministic authoring scaffolds for projects and public extensions.
 *
 * What this is: byte-stable source templates using only public Zero-AR
 * packages. Each template names its package choices, immutable binding
 * inputs and validation command. The CLI writes these bytes without
 * adding timestamps, host paths or generated identifiers.
 *
 * How it fits: scaffolding is authoring-time work. Generated tools and
 * validators run through their public kits in child hosts; skills remain
 * inert data; domain packs compose public declarations only.
 */
import { AUTHORING_SCAFFOLD_KINDS, AUTHORING_SOURCE_FORMS, ProcedureManifestSchema, SUPPORTED_NODE_RUNTIME, canonicalJson, contentHash, refuse, spanHash, } from '@zero-ar/contracts';
const NAME = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const DIRECTORY_NAME = /^[a-z][a-z0-9-]*$/;
const VERSION = /^\d+\.\d+\.\d+$/;
const PUBLIC_VERSION = '0.2.1';
const TOOL_KIT = '@zero-ar/tool-kit';
const VALIDATOR_KIT = '@zero-ar/validator-kit';
function checked(kind, name, version = '1.0.0') {
    if (!AUTHORING_SCAFFOLD_KINDS.includes(kind)) {
        refuse({ code: 'scaffold.kind.unknown', message: `${kind} is not an authoring scaffold kind.`, alternatives: [...AUTHORING_SCAFFOLD_KINDS] });
    }
    const pattern = kind === 'skill' ? DIRECTORY_NAME : NAME;
    if (!pattern.test(name)) {
        refuse({ code: 'scaffold.name.invalid', message: `${name} is not a valid ${kind} name.`, fix: kind === 'skill' ? 'use a lowercase hyphenated directory name' : 'use a lowercase dot-separated name' });
    }
    if (!VERSION.test(version)) {
        refuse({ code: 'scaffold.version.invalid', message: `${version} is not a semantic version.`, fix: 'use a version like 1.0.0' });
    }
}
function finish(kind, name, files, next_steps) {
    const stableFiles = [...files].sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
    const body = { schema: 'zero-ar-authoring-scaffold/v1', kind, name, files: stableFiles, next_steps };
    return { ...body, scaffold_ref: contentHash(body) };
}
/** One minimal project. Its agent receives no ambient tools or workspace capabilities. */
export function scaffoldProject(options = {}) {
    const name = options.name ?? 'assistant';
    const version = options.version ?? '1.0.0';
    const form = options.form ?? 'yaml';
    checked('project', name, version);
    if (!AUTHORING_SOURCE_FORMS.includes(form)) {
        refuse({ code: 'scaffold.form.unknown', message: `${form} is not an authoring source form.`, alternatives: [...AUTHORING_SOURCE_FORMS] });
    }
    const entry = agentEntry(form);
    const agent = agentSource(form, name, version);
    const packageManifest = {
        name: `${name.replaceAll('.', '-')}-agent`,
        version,
        private: true,
        type: 'module',
        engines: { node: SUPPORTED_NODE_RUNTIME.engine },
        scripts: {
            check: `zeroar validate ${entry}`,
            publish: `zeroar publish ${entry}`,
        },
        devDependencies: form === 'typescript' ? { '@zero-ar/cli': PUBLIC_VERSION, '@zero-ar/sdk': PUBLIC_VERSION } : { '@zero-ar/cli': PUBLIC_VERSION },
    };
    const project = [
        'apiVersion: zero-ar/v1',
        'kind: Project',
        'metadata:',
        `  name: ${name}`,
        `  version: ${version}`,
        'entry: ' + entry,
        'defaults:',
        `  agent: ${name}`,
        'packages:',
        '  agentAuthoring: "@zero-ar/sdk"',
        '  runtimeClient: "@zero-ar/client"',
        'capabilities:',
        '  workspace: []',
        '',
    ].join('\n');
    const guide = [
        `# ${name}`,
        '',
        'This project compiles once into an immutable publication closure. The runtime reads that closure and does not parse these source files during a run.',
        '',
        'The starter has no tools, workspace mounts, shell, network capability or validator authority. Add each capability explicitly and validate again.',
        '',
        'Use `@zero-ar/sdk` for agent and publication authoring, `@zero-ar/client` for direct API calls, `@zero-ar/tool-kit` for executable tools, and `@zero-ar/validator-kit` for validators. Domain packs may depend on contracts and the public kits, never runtime internals.',
        '',
        'Run `npm run check`, publish the agent, configure its exact published ref as the project or tenant default, then start work with `zeroar run "<objective>"`.',
        '',
    ].join('\n');
    return finish('project', name, [
        { path: entry, content: agent },
        { path: 'AGENT.md', content: 'Work the objective directly. State what remains unresolved before proposing completion.\n' },
        { path: 'README.md', content: guide },
        { path: 'package.json', content: `${JSON.stringify(packageManifest, null, 2)}\n` },
        { path: 'zero-ar.project.yaml', content: project },
    ], [`npm install`, `npm run check`, `zeroar publish ${entry} --dry-run`]);
}
/** A standards-shaped Agent Skill with progressive disclosure and an immutable source lock. */
export function scaffoldSkill(name = 'source-review', version = '1.0.0') {
    checked('skill', name, version);
    const entry = [
        '---',
        `name: ${name}`,
        'description: Review source material and report unresolved evidence.',
        'metadata:',
        `  version: ${version}`,
        '---',
        '',
        `# ${title(name)}`,
        '',
        'Open this skill only when the objective needs source review. Read `references/checklist.md` as needed.',
        '',
    ].join('\n');
    const reference = '# Review checklist\n\n- Name the source.\n- Name the exact span used.\n- State any unresolved conflict.\n';
    const manifest = ProcedureManifestSchema.parse({
        kind: 'procedure',
        name,
        version,
        entry_ref: spanHash(entry),
        description: 'Review source material and report unresolved evidence.',
        discovery: { topics: [], summary: 'Review source material and report unresolved evidence.' },
        resources: [{ path: 'references/checklist.md', content_ref: spanHash(reference), bytes: Buffer.byteLength(reference), media_type: 'text/markdown' }],
        executable: false,
        entry_bytes: Buffer.byteLength(entry),
        allowed_tools: [],
        activation: 'progressive',
    });
    const lock = {
        schema: 'zero-ar-skill-lock/v1',
        procedure_ref: contentHash(manifest),
        activation: 'progressive',
        files: [
            { path: 'SKILL.md', content_ref: spanHash(entry) },
            { path: 'references/checklist.md', content_ref: spanHash(reference) },
        ],
    };
    return finish('skill', name, [
        { path: 'SKILL.md', content: entry },
        { path: 'references/checklist.md', content: reference },
        { path: 'zero-ar.skill-lock.json', content: `${JSON.stringify(lock, null, 2)}\n` },
    ], ['zeroar validate .', 'zeroar publish . --dry-run']);
}
/** A bounded typed tool and its out-of-process JSON-lines host. */
export function scaffoldTool(name = 'example.lookup', version = '1.0.0') {
    checked('tool', name, version);
    const packageName = name.replaceAll('.', '-');
    const declaration = [
        'apiVersion: zero-ar/v1',
        'kind: Tool',
        'metadata:',
        `  name: ${name}`,
        `  version: ${version}`,
        'spec:',
        '  description: Return one bounded observation from the configured data source.',
        '  operation_class: observation',
        '  reviewer: replace-with-reviewer',
        '  isolation: process',
        '  input_schema:',
        '    type: object',
        '    properties:',
        '      query: { type: string }',
        '    required: [query]',
        '    additionalProperties: false',
        '  output_schema:',
        '    type: object',
        '    properties:',
        '      value: { type: string }',
        '    required: [value]',
        '    additionalProperties: false',
        '  metering:',
        '    mode: bounded',
        '    denomination: compute_ms',
        '    maximum: 1000',
        '  binding:',
        '    kind: process',
        '    entry: ./src/tool.ts',
        '    export: TOOL',
        '    host: ./src/host.ts',
        '    package_lock: ./zero-ar.package-lock.json',
        '',
    ].join('\n');
    const tool = [
        `import { defineTool, object, string } from '${TOOL_KIT}';`,
        '',
        'export const TOOL = defineTool({',
        `  name: '${name}',`,
        `  version: '${version}',`,
        "  description: 'Return one bounded observation from the configured data source.',",
        "  operationClass: 'observation',",
        "  isolation: 'process',",
        "  cost: { denomination: 'compute_ms', maximum: 1000 },",
        '  input: object({ query: string() }),',
        '  output: object({ value: string() }),',
        '  async execute(input) {',
        '    return { value: input.query };',
        '  },',
        '});',
        '',
    ].join('\n');
    const host = `import { serveTools } from '${TOOL_KIT}';\nimport { TOOL } from './tool.ts';\n\nawait serveTools({ tools: [TOOL] }).stdio();\n`;
    const test = [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { conformance } from '${TOOL_KIT}';`,
        "import { TOOL } from './tool.ts';",
        '',
        "test('tool contract and handler conform', async () => {",
        "  const report = await conformance(TOOL, [{ input: { query: 'example' }, ok: true }, { input: {}, ok: false }]);",
        '  assert.equal(report.failed.length, 0);',
        '});',
        '',
    ].join('\n');
    return finish('tool', name, extensionFiles(packageName, version, TOOL_KIT, declaration, 'tool.yaml', [
        { path: 'src/tool.ts', content: tool },
        { path: 'src/host.ts', content: host },
        { path: 'src/tool.test.ts', content: test },
    ]), ['npm install --ignore-scripts', 'npm test', 'zeroar publish tool.yaml --dry-run']);
}
/** A typed validator with labelled cases and a process-host binding identity. */
export function scaffoldValidator(name = 'example.output-present', version = '1.0.0') {
    checked('validator', name, version);
    const packageName = name.replaceAll('.', '-');
    const declaration = [
        'apiVersion: zero-ar/v1',
        'kind: Validator',
        'metadata:',
        `  name: ${name}`,
        `  version: ${version}`,
        'spec:',
        '  description: Require every examined item to carry output.',
        '  class: deterministic',
        '  covers: [output-present]',
        '  rule_kinds: [output-presence]',
        '  limitations:',
        '    - A pass establishes output presence only; it does not establish correctness.',
        '  verdicts: [pass, reject, indeterminate]',
        '  cost_wall_ms: 1000',
        '  binding:',
        '    kind: process',
        '    entry: ./src/validator.ts',
        '    export: VALIDATOR',
        '    package_lock: ./zero-ar.package-lock.json',
        '',
    ].join('\n');
    const validator = [
        `import { defineCustomCatalogueEntry, defineValidator } from '${VALIDATOR_KIT}';`,
        '',
        'export const VALIDATOR = defineValidator({',
        `  name: '${name}',`,
        `  version: '${version}',`,
        "  description: 'Require every examined item to carry output.',",
        "  class: 'deterministic',",
        '  can_answer_indeterminate: true,',
        '  catalogue_entry: defineCustomCatalogueEntry({',
        `    name: '${name}',`,
        `    version: '${version}',`,
        "    class: 'deterministic',",
        "    description_boundary: 'labelled project cases; deployment admission is separate',",
        "    implementation_identity: { algorithm: 'output-present-v1' },",
        "    entrypoint: 'src/validator.ts#VALIDATOR',",
        "    rule_kinds: ['output-presence'],",
        "    limitations: ['A pass establishes output presence only; it does not establish correctness.'],",
        '    wall_ms: 1000,',
        '  }),',
        '  evaluate(input) {',
        "    if (input.items.length !== input.declared_total) return { verdict: 'indeterminate', reason: 'the validator received a partial population' };",
        '    const rejected = input.items.filter((item) => !item.output).map((item) => item.item_id);',
        "    return rejected.length > 0 ? { verdict: 'reject', reason: 'some items have no output', rejected_items: rejected, failure_class: 'shape' } : { verdict: 'pass', reason: 'every item has output' };",
        '  },',
        '});',
        '',
    ].join('\n');
    const test = [
        "import assert from 'node:assert/strict';",
        "import test from 'node:test';",
        `import { examinedItem, runLabelledCases } from '${VALIDATOR_KIT}';`,
        "import { VALIDATOR } from './validator.ts';",
        '',
        "test('validator agrees with labelled cases', async () => {",
        "  const base = { run_id: `run_${'1'.repeat(32)}`, declared_total: 1, rule: 'output-present' };",
        "  const report = await runLabelledCases(VALIDATOR, [{ label: 'present', input: { ...base, items: [examinedItem('one', 'value')] }, expect: 'pass' }, { label: 'missing', input: { ...base, items: [examinedItem('one', null)] }, expect: 'reject' }]);",
        '  assert.ok(report.every((item) => item.agreed));',
        '});',
        '',
    ].join('\n');
    return finish('validator', name, extensionFiles(packageName, version, VALIDATOR_KIT, declaration, 'validator.yaml', [
        { path: 'src/validator.ts', content: validator },
        { path: 'src/validator.test.ts', content: test },
    ]), ['npm install --ignore-scripts', 'npm test', 'zeroar publish validator.yaml --dry-run']);
}
/** A public-SDK domain pack declaring all five machine-claim categories. */
export function scaffoldDomainPack(name = 'example-pack', version = '1.0.0') {
    checked('domain-pack', name, version);
    const validator = `${name}.evidence`;
    const predicatePrefix = name.replaceAll('.', '-');
    const validatorImplementationRef = contentHash({
        schema: 'zero-ar-scaffold-validator-implementation/1',
        name: validator,
        version,
        algorithm: 'domain-pack-declared-evidence-v1',
    });
    const declaration = [
        'apiVersion: zero-ar/v1',
        'kind: DomainPack',
        'metadata:',
        `  name: ${name}`,
        `  version: ${version}`,
        'spec:',
        '  validators: [./validators/evidence.yaml]',
        '  claims:',
        ...['capability', 'coverage', 'limitation', 'requirement', 'omission'].flatMap((kind) => [
            `    - predicate: ${predicatePrefix}-${kind}`,
            `      kind: ${kind}`,
            `      evidence: { validator: ${validator}, version: ${version} }`,
        ]),
        '  notes:',
        '    - This sentence is informational and carries no machine authority.',
        '',
    ].join('\n');
    const validatorDeclaration = [
        'apiVersion: zero-ar/v1',
        'kind: Validator',
        'metadata:',
        `  name: ${validator}`,
        `  version: ${version}`,
        'spec:',
        '  description: Establish only the five declared domain-pack predicates.',
        '  class: deterministic',
        `  covers: [${predicatePrefix}-capability, ${predicatePrefix}-coverage, ${predicatePrefix}-limitation, ${predicatePrefix}-requirement, ${predicatePrefix}-omission]`,
        '  rule_kinds: [domain-pack-declared-evidence]',
        '  limitations:',
        '    - A pass establishes only the predicates named by this pack; deployment admission is separate.',
        '  verdicts: [pass, reject, indeterminate]',
        '  cost_wall_ms: 1000',
        `  implementation_ref: ${validatorImplementationRef}`,
        '',
    ].join('\n');
    const packageManifest = {
        name: `@example/${name}`,
        version,
        private: true,
        type: 'module',
        engines: { node: SUPPORTED_NODE_RUNTIME.engine },
        dependencies: { '@zero-ar/contracts': PUBLIC_VERSION, '@zero-ar/sdk': PUBLIC_VERSION, '@zero-ar/validator-kit': PUBLIC_VERSION },
    };
    return finish('domain-pack', name, [
        { path: 'package.json', content: `${JSON.stringify(packageManifest, null, 2)}\n` },
        { path: 'validators/evidence.yaml', content: validatorDeclaration },
        { path: 'zero-ar-pack.yaml', content: declaration },
        { path: 'README.md', content: `# ${title(name)}\n\nThis pack composes public contracts and validator evidence. It has no kernel import or runtime privilege.\n` },
    ], ['zeroar validate zero-ar-pack.yaml', 'zeroar publish zero-ar-pack.yaml --dry-run']);
}
/** A reviewed binding profile. No workspace capability is created until an agent selects it. */
export function scaffoldBindingProfile(name = 'workspace.scratch', version = '1.0.0') {
    checked('binding-profile', name, version);
    const declaration = [
        'apiVersion: zero-ar/v1',
        'kind: BindingProfile',
        'metadata:',
        `  name: ${name}`,
        `  version: ${version}`,
        'spec:',
        '  slot: runtime-scratch',
        '  path_prefix: /var/zero-ar/scratch/',
        '  operations:',
        '    - { name: read, operation_class: observation }',
        '    - { name: write, operation_class: run-internal }',
        '',
    ].join('\n');
    return finish('binding-profile', name, [{ path: 'binding-profile.yaml', content: declaration }], ['review the path prefix and per-operation classes', 'select this exact profile from an agent before publishing']);
}
/** Select a scaffold by its contracts-owned kind vocabulary. */
export function authoringScaffold(kind, name, options = {}) {
    switch (kind) {
        case 'project': return scaffoldProject({ ...(name ? { name } : {}), ...options });
        case 'skill': return scaffoldSkill(name ?? 'source-review', options.version ?? '1.0.0');
        case 'tool': return scaffoldTool(name ?? 'example.lookup', options.version ?? '1.0.0');
        case 'validator': return scaffoldValidator(name ?? 'example.output-present', options.version ?? '1.0.0');
        case 'domain-pack': return scaffoldDomainPack(name ?? 'example-pack', options.version ?? '1.0.0');
        case 'binding-profile': return scaffoldBindingProfile(name ?? 'workspace.scratch', options.version ?? '1.0.0');
    }
}
/** Canonical bytes make repeated generation directly comparable. */
export function scaffoldBytes(scaffold) {
    return canonicalJson(scaffold);
}
function agentEntry(form) {
    return form === 'markdown' ? 'agent.zeroar.md' : `agent.${form === 'typescript' ? 'ts' : form}`;
}
function agentSource(form, name, version) {
    const yaml = ['apiVersion: zero-ar/v1', 'kind: Agent', 'metadata:', `  name: ${name}`, `  version: ${version}`, 'spec:', '  instructions: ./AGENT.md', '  model: project-default', ''].join('\n');
    if (form === 'yaml')
        return yaml;
    if (form === 'json')
        return `${JSON.stringify({ apiVersion: 'zero-ar/v1', kind: 'Agent', metadata: { name, version }, spec: { instructions: './AGENT.md', model: 'project-default' } }, null, 2)}\n`;
    if (form === 'markdown')
        return `---\n${yaml}---\n\n# ${title(name)}\n\nThis body documents the agent. Structured front matter is authoritative.\n`;
    return [
        "import { defineAgent } from '@zero-ar/sdk';",
        '',
        'export const AGENT = defineAgent({',
        `  name: '${name}',`,
        `  version: '${version}',`,
        "  instructions: './AGENT.md',",
        "  model: 'project-default',",
        '});',
        '',
        'export default AGENT;',
        '',
    ].join('\n');
}
function extensionFiles(packageName, version, dependency, declaration, declarationPath, source) {
    const packageManifest = {
        name: `@example/${packageName}`,
        version,
        private: true,
        type: 'module',
        engines: { node: SUPPORTED_NODE_RUNTIME.engine },
        scripts: { test: 'node --test src/*.test.ts' },
        dependencies: { [dependency]: PUBLIC_VERSION },
    };
    const packageLock = { schema: 'zero-ar-executable-package-lock/v1', runtime: { node: SUPPORTED_NODE_RUNTIME.engine }, packages: { [dependency]: PUBLIC_VERSION } };
    return [
        { path: declarationPath, content: declaration },
        { path: 'package.json', content: `${JSON.stringify(packageManifest, null, 2)}\n` },
        { path: 'zero-ar.package-lock.json', content: `${JSON.stringify(packageLock, null, 2)}\n` },
        { path: 'README.md', content: `# ${title(packageName)}\n\nThe declaration is the model-visible contract. The content-addressed process binding runs through ${dependency} outside the Zero-AR server.\n` },
        ...source,
    ];
}
function title(value) {
    return value.split(/[.-]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
