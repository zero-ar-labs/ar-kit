import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { MemoryAssertionInputSchema, MemorySubjectTransferBundleSchema, canonicalJson, refuse } from '@zero-ar/contracts';
const OPERATIONS = ['setup', 'prepare-rotation', 'status', 'assert', 'supersede', 'history', 'erase', 'export', 'import', 'read'];
export const memoryCommand = {
    command: 'memory',
    state: 'wired',
    local: (args, context) => {
        const operation = args[0];
        if (!OPERATIONS.includes(operation))
            return usage(context, `memory needs ${OPERATIONS.join(', ')}, and ${operation ? `"${operation}" is none of them` : 'none was given'}`);
        if (operation === 'setup') {
            const path = flagValue(args, '--key-file');
            if (!path)
                return usage(context, 'memory setup needs --key-file <path> outside the Local Lite data directory');
            writeNewKey(path);
            console.log([
                `created a mode-0600 wrapping key at ${resolve(path)}`,
                'configure the Local Lite process with:',
                '  export ZERO_AR_MEMORY=durable',
                '  export ZERO_AR_MEMORY_KEY_SOURCE=key-file',
                `  export ZERO_AR_MEMORY_KEY_FILE=${shellQuote(resolve(path))}`,
            ].join('\n'));
            return 0;
        }
        if (operation === 'prepare-rotation') {
            const current = flagValue(args, '--current');
            const next = flagValue(args, '--next');
            if (!current || !next)
                return usage(context, 'memory prepare-rotation needs --current <old-key-file> and --next <new-key-file>');
            if (resolve(current) === resolve(next))
                return usage(context, 'memory prepare-rotation needs different current and next key files');
            writeNewKey(next);
            console.log([
                `created a mode-0600 replacement wrapping key at ${resolve(next)}`,
                'start Local Lite once with:',
                '  export ZERO_AR_MEMORY=durable',
                '  export ZERO_AR_MEMORY_KEY_SOURCE=key-file',
                `  export ZERO_AR_MEMORY_PREVIOUS_KEY_FILE=${shellQuote(resolve(current))}`,
                `  export ZERO_AR_MEMORY_KEY_FILE=${shellQuote(resolve(next))}`,
                `after memory status reports ready, unset ZERO_AR_MEMORY_PREVIOUS_KEY_FILE and retire ${resolve(current)}`,
            ].join('\n'));
            return 0;
        }
        const problem = validateRemote(operation, args);
        if (problem)
            return usage(context, problem);
        if (operation === 'assert')
            assertionFile(args[1]);
        if (operation === 'supersede')
            assertionFile(args[2]);
        if (operation === 'import')
            transferFile(args[2]);
        return null;
    },
    remote: async (client, args) => {
        const operation = args[0];
        const json = args.includes('--json');
        if (operation === 'status') {
            const health = await client.health();
            const components = Object.fromEntries(Object.entries(health.components).filter(([name]) => name === 'memory' || name.startsWith('memory_')));
            const result = { status: health.status, readiness: health.readiness, components };
            print(json, result, [
                `memory: ${Object.keys(components).length === 0 ? 'not attached' : health.readiness}`,
                ...Object.entries(components).sort(([left], [right]) => left.localeCompare(right)).map(([name, state]) => `  ${name}: ${state}`),
            ]);
            if (Object.keys(components).length === 0)
                return 1;
            return health.required_components.some((name) => (name === 'memory' || name.startsWith('memory_')) && health.components[name] !== 'ready') ? 1 : 0;
        }
        if (operation === 'assert') {
            const result = await client.writeMemoryAssertion(assertionFile(args[1]));
            print(json, result, [`admitted assertion ${result.assertion_id}`, `  watermark ${result.watermark.sequence}, supports ${result.supports_recorded}`]);
            return 0;
        }
        if (operation === 'supersede') {
            const result = await client.supersedeMemoryAssertion(args[1], { replacement: assertionFile(args[2]) });
            print(json, result, [`superseded ${result.superseded_assertion_id} with ${result.replacement_assertion_id}`, `  watermark ${result.watermark.sequence}`]);
            return 0;
        }
        if (operation === 'history') {
            const result = await client.readMemoryHistory({ subject: args[1], predicate: args[2] });
            print(json, result, [
                `memory history for ${result.subject} / ${result.predicate}: ${result.erased ? 'erased' : `${result.assertions.length} assertions`}`,
                `  watermark ${result.watermark.sequence}`,
                ...result.assertions.map((assertion) => `  ${assertion.assertion_id} ${assertion.state} ${assertion.classification}`),
                ...result.redacted_records.map((record) => `  redacted ${record.kind} at ${record.at}`),
            ]);
            return 0;
        }
        if (operation === 'erase') {
            const result = await client.eraseMemorySubject({ subject: args[1], by: flagValue(args, '--by') ?? 'operator:cli', reason: flagValue(args, '--reason') });
            print(json, result, [`erased ${result.subject_ref}: ${result.records_redacted} records redacted`]);
            return 0;
        }
        if (operation === 'export') {
            const result = await client.exportMemorySubject({ subject: args[1] });
            const path = flagValue(args, '--out');
            writeNewTransfer(path, result);
            print(json, { content_ref: result.content_ref, subject_ref: result.subject_ref, stream_id: result.stream_id, watermark: result.watermark, records: result.record_count, path: resolve(path) }, [
                `exported memory subject ${result.subject_ref} to ${resolve(path)}`,
                `  content ${result.content_ref}, watermark ${result.watermark.sequence}, records ${result.record_count}`,
            ]);
            return 0;
        }
        if (operation === 'import') {
            const result = await client.importMemorySubject({ subject: args[1], bundle: transferFile(args[2]) });
            print(json, result, [
                `imported memory subject ${result.subject_ref}`,
                `  content ${result.content_ref}, watermark ${result.watermark.sequence}, records ${result.records}`,
            ]);
            return 0;
        }
        const result = await client.readRunMemory(args[1], {
            subject: args[2],
            predicate: args[3],
            valid_at: flagValue(args, '--at'),
            ...(integerFlag(args, '--minimum-watermark') !== undefined ? { minimum_watermark: integerFlag(args, '--minimum-watermark') } : {}),
        });
        print(json, result, [
            `run ${result.run_id} memory: ${result.status}, scope ${result.scope}`,
            ...(result.reason ? [`  ${result.reason}`] : []),
            ...(result.read ? [`  watermark ${result.read.watermark.sequence}, assertions ${result.read.current.length}, conflicts ${result.read.conflicts.length}`] : []),
        ]);
        return 0;
    },
};
function validateRemote(operation, args) {
    if (operation === 'status')
        return null;
    if (operation === 'assert' && positional(args).length !== 2)
        return 'memory assert needs one assertion JSON file';
    if (operation === 'supersede' && positional(args).length !== 3)
        return 'memory supersede needs an assertion id and one replacement assertion JSON file';
    if (operation === 'history' && positional(args).length !== 3)
        return 'memory history needs a subject and predicate';
    if (operation === 'erase') {
        if (positional(args).length !== 2)
            return 'memory erase needs one subject';
        if (!flagValue(args, '--reason'))
            return 'memory erase needs --reason <text> for the audit record';
    }
    if (operation === 'export') {
        if (positional(args).length !== 2)
            return 'memory export needs one subject';
        if (!flagValue(args, '--out'))
            return 'memory export needs --out <new-file>';
    }
    if (operation === 'import' && positional(args).length !== 3)
        return 'memory import needs one subject and one transfer JSON file';
    if (operation === 'read') {
        if (positional(args).length !== 4)
            return 'memory read needs a run id, subject and predicate';
        const at = flagValue(args, '--at');
        if (!at || Number.isNaN(Date.parse(at)))
            return 'memory read needs --at <ISO timestamp>';
        if (args.includes('--minimum-watermark') && integerFlag(args, '--minimum-watermark') === undefined)
            return '--minimum-watermark must be a non-negative whole number';
    }
    return null;
}
function writeNewKey(path) {
    const absolute = resolve(path);
    mkdirSync(dirname(absolute), { recursive: true, mode: 0o700 });
    try {
        writeFileSync(absolute, `${randomBytes(32).toString('hex')}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    }
    catch (error) {
        refuse({
            code: 'memory.key.create-refused',
            message: `the wrapping-key file could not be created at ${absolute}: ${error instanceof Error ? error.message : String(error)}. Choose a new writable path; an existing key file is never overwritten.`,
            clause: 'MSH-004',
        });
    }
}
function assertionFile(path) {
    try {
        const value = JSON.parse(readFileSync(path, 'utf8'));
        const parsed = MemoryAssertionInputSchema.safeParse(value);
        if (!parsed.success)
            throw new Error(parsed.error.issues.map((issue) => issue.message).join('; '));
        return parsed.data;
    }
    catch (error) {
        refuse({ code: 'memory.input.invalid', message: `${path} is not a readable JSON object: ${error instanceof Error ? error.message : String(error)}. Correct the file and retry the same operation.` });
    }
}
function transferFile(path) {
    try {
        const value = JSON.parse(readFileSync(path, 'utf8'));
        const parsed = MemorySubjectTransferBundleSchema.safeParse(value);
        if (!parsed.success)
            throw new Error(parsed.error.issues.map((issue) => issue.message).join('; '));
        return parsed.data;
    }
    catch (error) {
        refuse({ code: 'memory.transfer.input-invalid', message: `${path} is not a readable memory transfer: ${error instanceof Error ? error.message : String(error)}. Export the subject again and import that unchanged file.`, clause: 'MSH-015' });
    }
}
function writeNewTransfer(path, bundle) {
    const absolute = resolve(path);
    mkdirSync(dirname(absolute), { recursive: true, mode: 0o700 });
    try {
        writeFileSync(absolute, `${canonicalJson(bundle)}\n`, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    }
    catch (error) {
        refuse({
            code: 'memory.transfer.file-refused',
            message: `the memory transfer could not be written at ${absolute}: ${error instanceof Error ? error.message : String(error)}. Choose a new writable path; an existing transfer is never overwritten.`,
            clause: 'MSH-015',
        });
    }
}
function usage(context, problem) {
    console.error(`error: ${problem}. Run ${context.command} help for the memory syntax.`);
    return 1;
}
function positional(args) {
    const values = [];
    for (let index = 0; index < args.length; index += 1) {
        const value = args[index];
        if (value.startsWith('--')) {
            if (value !== '--json')
                index += 1;
        }
        else
            values.push(value);
    }
    return values;
}
function flagValue(args, flag) {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
}
function integerFlag(args, flag) {
    const raw = flagValue(args, flag);
    if (raw === undefined || !/^\d+$/.test(raw))
        return undefined;
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : undefined;
}
function print(json, value, lines) {
    console.log(json ? canonicalJson(value) : lines.join('\n'));
}
function shellQuote(value) {
    return `'${value.replaceAll("'", "'\\''")}'`;
}
