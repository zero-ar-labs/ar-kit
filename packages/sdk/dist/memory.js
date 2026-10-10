export class SubjectMemory {
    client;
    subject;
    constructor(client, subject) {
        this.client = client;
        this.subject = subject;
    }
    assert(input) {
        return this.client.writeMemoryAssertion({ subject: this.subject, ...input });
    }
    supersede(assertion_id, replacement) {
        return this.client.supersedeMemoryAssertion(assertion_id, { replacement: { subject: this.subject, ...replacement } });
    }
    history(predicate) {
        return this.client.readMemoryHistory({ subject: this.subject, predicate });
    }
    erase(by, reason) {
        return this.client.eraseMemorySubject({ subject: this.subject, by, reason });
    }
    exportTransfer() {
        return this.client.exportMemorySubject({ subject: this.subject });
    }
    importTransfer(bundle) {
        return this.client.importMemorySubject({ subject: this.subject, bundle });
    }
    readForRun(run_id, input) {
        return this.client.readRunMemory(run_id, { subject: this.subject, ...input });
    }
}
export function memoryFor(client, subject) {
    return new SubjectMemory(client, subject);
}
