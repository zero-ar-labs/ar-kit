/**
 * Subject-scoped helpers for the public memory routes.
 *
 * What this is: a small SDK journey that binds one operator-selected subject
 * once, then delegates assertion, history, erasure and run-read operations to
 * the generated client. It adds no memory store and holds no key material.
 *
 * How it fits: applications use the same public routes as the CLI. Runtime
 * publication bindings still govern every model-visible memory operation.
 */
export class SubjectMemory {
    client;
    subject;
    constructor(client, subject) {
        this.client = client;
        this.subject = subject;
    }
    /** Admit one cited assertion for this subject through the public service. */
    assert(input) {
        return this.client.writeMemoryAssertion({ subject: this.subject, ...input });
    }
    /** Replace one current assertion while preserving both identities in history. */
    supersede(assertion_id, replacement) {
        return this.client.supersedeMemoryAssertion(assertion_id, { replacement: { subject: this.subject, ...replacement } });
    }
    /** Read the subject's durable history for one predicate. */
    history(predicate) {
        return this.client.readMemoryHistory({ subject: this.subject, predicate });
    }
    /** Erase the subject stream under the caller's already-authorized route. */
    erase(by, reason) {
        return this.client.eraseMemorySubject({ subject: this.subject, by, reason });
    }
    /** Export this subject's canonical encrypted stream and permitted wrapped custody rows. */
    exportTransfer() {
        return this.client.exportMemorySubject({ subject: this.subject });
    }
    /** Import one verified transfer for this subject into a fresh compatible custody. */
    importTransfer(bundle) {
        return this.client.importMemorySubject({ subject: this.subject, bundle });
    }
    /** Ask one run to perform its recorded memory read for this subject. */
    readForRun(run_id, input) {
        return this.client.readRunMemory(run_id, { subject: this.subject, ...input });
    }
}
/** Bind one subject to an SDK helper without creating a second service plane. */
export function memoryFor(client, subject) {
    return new SubjectMemory(client, subject);
}
