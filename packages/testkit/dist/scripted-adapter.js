/**
 * The public deterministic model adapter for tests.
 *
 * Junior guide: test suites need a model that never calls a provider and
 * always gives the same answer for the same transcript. This file keeps that
 * adapter inside `@zero-ar/testkit`, so public test fixtures do not import a
 * private runtime package.
 */
import { setTimeout as sleep } from 'node:timers/promises';
import { approxTokens, assertRunOwnedModelRequest } from '@zero-ar/contracts';
export class ScriptedAdapter {
    name = 'scripted';
    version = '1.0.0';
    model_ref = 'scripted/deterministic';
    outbound_url = null;
    /** Total stream calls, so tests can assert reconstruction called nothing. */
    calls = 0;
    script;
    batch;
    corruptOnce;
    corruptAlways;
    failOnCall;
    failCalls;
    constructor(script, options = {}) {
        this.script = script ?? null;
        this.failCalls = new Set(options.fail_calls ?? []);
        this.batch = options.batch ?? 5;
        this.corruptOnce = new Set(options.corrupt_once ?? []);
        this.corruptAlways = new Set(options.corrupt_always ?? []);
        this.failOnCall = options.fail_on_call ?? null;
    }
    async *stream(request, signal) {
        assertRunOwnedModelRequest(request);
        this.calls += 1;
        if (this.failOnCall === this.calls || this.failCalls.has(this.calls)) {
            yield { type: 'usage', input_tokens: approxTokens(request.messages.map((message) => message.content).join('\n')), output_tokens: 0 };
            yield { type: 'provider_failure', code: 'rate_limit', message: 'the provider refused the request rate' };
            return;
        }
        const objective = request.messages.find((message) => message.role === 'user')?.content ?? '';
        const step = this.script
            ? (this.script[Math.min(this.calls - 1, this.script.length - 1)] ?? { propose: 'nothing scripted' })
            : this.defaultTurn(request, objective);
        const inputTokens = approxTokens(request.messages.map((message) => message.content).join('\n'));
        let streamed = '';
        for (const item of step.items ?? []) {
            if (signal.aborted)
                return;
            yield { type: 'item_result', item_id: item.item_id, output: item.output, ...(item.reads ? { reads: item.reads } : {}) };
        }
        if (step.sub_run)
            yield { type: 'sub_run', objective: step.sub_run.objective };
        if (step.tool)
            yield { type: 'tool_call', tool: step.tool.name, input: step.tool.input };
        const text = step.say ?? '';
        if (text) {
            const chunkCount = Math.max(1, step.chunks ?? 4);
            const size = Math.ceil(text.length / chunkCount);
            for (let i = 0; i < text.length; i += size) {
                if (signal.aborted)
                    return;
                if (step.delay_ms)
                    await sleep(step.delay_ms);
                if (signal.aborted)
                    return;
                const chunk = text.slice(i, i + size);
                streamed += chunk;
                yield { type: 'text_delta', text: chunk };
            }
        }
        if (signal.aborted)
            return;
        yield { type: 'usage', input_tokens: inputTokens, output_tokens: approxTokens(streamed + (step.propose ?? '')) };
        if (step.fail) {
            yield { type: 'provider_failure', code: step.fail.code, message: step.fail.message };
            return;
        }
        if (step.propose !== undefined) {
            yield { type: 'completion_proposal', artifact_text: step.propose };
            yield { type: 'stop', reason: 'completion_proposal' };
        }
        else {
            yield { type: 'stop', reason: 'end_turn' };
        }
    }
    defaultTurn(request, objective) {
        const system = request.messages.find((message) => message.role === 'system')?.content ?? '';
        const match = system.match(/remaining items: ([^(\n]+?)(?:\s*\(and \d+ more\))?\.\s/);
        if (match && match[1] && match[1].trim() !== 'none') {
            const ids = match[1].split(',').map((id) => id.trim()).filter(Boolean).slice(0, this.batch);
            const items = ids.map((item_id) => {
                const corrupt = this.corruptAlways.has(item_id) || this.corruptOnce.has(item_id);
                this.corruptOnce.delete(item_id);
                return { item_id, output: corrupt ? '' : `${item_id} normalised` };
            });
            return { items, say: `Worked ${items.length} items.` };
        }
        if (system.includes('remaining items: none')) {
            return { propose: `Every declared item is worked. Staged result for: ${objective.slice(0, 160)}` };
        }
        const turn = request.messages.filter((message) => message.role === 'assistant').length;
        if (turn === 0) {
            return { say: `Reading the objective and laying out the work: ${objective.slice(0, 120)}` };
        }
        return { propose: `Staged result for the objective: ${objective.slice(0, 200)}` };
    }
}
