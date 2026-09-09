/**
 * The development hot-reload loop (developer-integration appendix 7.4,
 * DXI-025).
 *
 * What this is: recompile changed project source into a new publication
 * candidate, run the conformance that candidate answers for itself, and
 * move one development-namespace alias only when nothing failed.
 *
 * How it fits: an alias move changes later intake and nothing else. A run
 * that already pinned a closure keeps every ref it pinned, so this loop
 * never reaches active work. The candidate is the ordinary compiled
 * bundle a hosted commit carries, so hot reload bypasses no publication
 * identity. A namespace prefixes the alias, because an alias is a
 * lowercase dot-separated name: namespace development and agent assistant
 * make the alias development.assistant.
 */
import { refuse, verifyBundle } from '@zero-ar/contracts';
const NAMESPACE = /^[a-z][a-z0-9-]*$/;
/**
 * Open a hot-reload loop over one project. The loop carries the ref it
 * last published, so each pass can say what changed and what did not.
 */
export function developmentLoop(options) {
    if (!NAMESPACE.test(options.namespace)) {
        refuse({
            code: 'development.namespace.invalid',
            message: `${options.namespace} is not a namespace. A namespace prefixes an alias, so it fits the same lowercase naming an alias does.`,
            fix: 'a namespace like development or preview',
            clause: 'DXI-025',
        });
    }
    let published = null;
    return {
        namespace: options.namespace,
        current: () => published,
        async reload() {
            const outcome = await pass(options, published);
            if (outcome.published)
                published = outcome.candidate_ref;
            return outcome;
        },
    };
}
async function pass(options, previous_ref) {
    const reloaded = await options.project.reload();
    const compiled = await reloaded.compile();
    const root = compiled.bundle.declarations.find((declaration) => declaration.content_ref === compiled.bundle.root_ref);
    if (!root) {
        refuse({
            code: 'development.candidate.rootless',
            message: 'the compiled candidate names a root ref its own declaration list does not carry, so there is nothing to name.',
            clause: 'DXI-025',
        });
    }
    const alias = `${options.namespace}.${root.name}`;
    const outcome = await runConformance(compiled, options.conformance);
    const narration = [
        `compiled ${root.kind} ${root.name} ${root.version} into candidate ${compiled.bundle.root_ref.slice(0, 20)}`,
        `conformance ${outcome.passed} passed, ${outcome.failures.length} failed`,
    ];
    const answer = {
        namespace: options.namespace,
        alias,
        candidate_ref: compiled.bundle.root_ref,
        bundle_ref: compiled.bundle.bundle_ref,
        previous_ref,
        conformance: outcome,
        narration,
    };
    if (outcome.failures.length > 0) {
        narration.push(...outcome.failures.map((failure) => `  ${failure}`));
        narration.push(previous_ref
            ? `${alias} did not move. Later runs still resolve it to ${previous_ref.slice(0, 20)}.`
            : `${alias} was not created, so no later run resolves it yet.`);
        narration.push('active runs are untouched either way. Each pinned its closure at intake.');
        return { ...answer, published: false };
    }
    if (previous_ref === compiled.bundle.root_ref) {
        narration.push(`the source did not change, so ${alias} still points at ${previous_ref.slice(0, 20)} and nothing was published.`);
        return { ...answer, published: false };
    }
    verifyBundle(compiled.bundle, compiled.blobs);
    await publishCandidate(options.client, compiled);
    await options.client.setRegistryAlias({ alias, content_ref: compiled.bundle.root_ref });
    narration.push(`published ${compiled.bundle.bundle_ref.slice(0, 20)} and moved ${alias} to ${compiled.bundle.root_ref.slice(0, 20)}`);
    narration.push(`runs created after this moment that select ${alias} use the new ref.`);
    narration.push(previous_ref
        ? `runs already admitted keep ${previous_ref.slice(0, 20)}. A closure pinned at intake never moves.`
        : 'runs already admitted keep whatever they pinned. A closure pinned at intake never moves.');
    return { ...answer, published: true };
}
/** The closure check every candidate answers, plus whatever the caller adds. */
async function runConformance(compiled, extra) {
    const failures = [];
    let passed = 0;
    try {
        verifyBundle(compiled.bundle, compiled.blobs);
        passed += 1;
    }
    catch (error) {
        failures.push(`closure: ${error.message}`);
    }
    if (extra) {
        const supplied = await extra(compiled);
        passed += supplied.passed;
        failures.push(...supplied.failures);
    }
    return { passed, failures };
}
/** The ordinary staged publication: a session, the missing bytes, one commit. */
async function publishCandidate(client, compiled) {
    const session = await client.createPublicationSession({ bundle: compiled.bundle });
    for (const content_ref of session.missing_blobs) {
        const bytes = compiled.blobs.get(content_ref);
        if (bytes === undefined) {
            refuse({
                code: 'development.candidate.incomplete',
                message: `the candidate does not carry the bytes for ${content_ref.slice(0, 20)}, which the session asked for. A partial closure does not publish.`,
                clause: 'DXI-025',
            });
        }
        await client.stagePublicationBlob(session.session_id, { content_ref, bytes });
    }
    await client.commitPublication(session.session_id, {});
}
