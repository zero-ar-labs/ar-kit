import { FAILURE_CLASSES, VALIDATOR_OUTCOMES, ValidatorAvailabilitySnapshotBodySchema, ValidatorAvailabilitySnapshotSchema, ValidatorCatalogueEntryBodySchema, ValidatorCatalogueEntrySchema, canonicalJson, contentHash, refuse, } from '@zero-ar/contracts';
export function deriveValidatorEvidenceGrade(entry) {
    const evidence = entry.evidence;
    const protocol = evidence.protocol_conformance.length > 0;
    const cases = Object.values(evidence.labelled_cases).every((refs) => refs.length > 0);
    const repeatable = entry.finding_contract.class !== 'deterministic' || evidence.repeatability.length > 0;
    if (protocol && cases && repeatable && evidence.deployment_admission.length > 0)
        return 'deployment-admitted';
    if (protocol && cases && repeatable)
        return 'case-evaluated';
    if (protocol)
        return 'protocol-conformant';
    return 'declared';
}
function entryBody(source) {
    if ('sufficient_for' in source) {
        refuse({
            code: 'validator.catalogue.authority',
            message: 'a catalogue entry cannot declare sufficient_for; only a task-contract binding may designate sufficiency for one rule.',
            clause: 'VPC-009',
        });
    }
    const ungraded = {
        schema: 'validator-catalogue-entry/1',
        ...source,
        finding_contract: {
            ...source.finding_contract,
            supported_verdicts: [...new Set(source.finding_contract.supported_verdicts)].sort(),
            supported_failure_classes: [...new Set(source.finding_contract.supported_failure_classes)].sort(),
        },
        input_contract: {
            ...source.input_contract,
            required_item_fields: [...new Set(source.input_contract.required_item_fields)].sort(),
            dependencies: [...new Set(source.input_contract.dependencies)].sort(),
        },
        coverage_capability: { rule_kinds: [...new Set(source.coverage_capability.rule_kinds)].sort() },
        evidence: {
            ...source.evidence,
            protocol_conformance: [...new Set(source.evidence.protocol_conformance)].sort(),
            labelled_cases: Object.fromEntries(Object.entries(source.evidence.labelled_cases).map(([kind, refs]) => [kind, [...new Set(refs)].sort()])),
            repeatability: [...new Set(source.evidence.repeatability)].sort(),
            calibration: [...new Set(source.evidence.calibration)].sort(),
            deployment_admission: [...new Set(source.evidence.deployment_admission)].sort(),
        },
        limitations: [...new Set(source.limitations)].sort(),
    };
    return ValidatorCatalogueEntryBodySchema.parse({
        ...ungraded,
        evidence_grade: deriveValidatorEvidenceGrade(ungraded),
    });
}
export function defineCatalogueEntry(source) {
    const body = entryBody(source);
    return ValidatorCatalogueEntrySchema.parse({ ...body, catalogue_entry_ref: contentHash(body) });
}
export function admitCatalogueEntry(input) {
    const parsed = ValidatorCatalogueEntrySchema.safeParse(input);
    if (!parsed.success) {
        refuse({
            code: 'validator.catalogue.invalid',
            message: `the validator catalogue entry is incomplete: ${parsed.error.issues[0]?.message ?? 'shape mismatch'}.`,
            clause: 'VPC-007',
        });
    }
    const { catalogue_entry_ref, ...body } = parsed.data;
    const derived = deriveValidatorEvidenceGrade(body);
    if (body.evidence_grade !== derived) {
        refuse({
            code: 'validator.catalogue.grade-mismatch',
            message: `the entry asserts evidence grade ${body.evidence_grade}, but its named evidence derives ${derived}.`,
            clause: 'VPC-010',
        });
    }
    const expected = contentHash(body);
    if (catalogue_entry_ref !== expected) {
        refuse({
            code: 'validator.catalogue.ref-mismatch',
            message: `the catalogue entry ref does not match its canonical content; expected ${expected}.`,
            clause: 'VPC-008',
        });
    }
    return parsed.data;
}
export function defineAvailabilitySnapshot(deployment, inputs) {
    const body = ValidatorAvailabilitySnapshotBodySchema.parse({
        schema: 'validator-availability-snapshot/1',
        deployment,
        entries: inputs
            .map((input) => ({
            name: input.entry.identity.name,
            version: input.entry.identity.version,
            class: input.entry.finding_contract.class,
            implementation_ref: input.entry.identity.implementation_ref,
            catalogue_entry_ref: input.entry.catalogue_entry_ref,
            available: input.available,
            host_boundary: input.host_boundary,
            host_protocol: input.host_protocol ?? input.entry.runtime_needs.host_protocol,
            bundle_ref: input.bundle_ref ?? input.entry.runtime_needs.bundle_ref,
            artifact_reader_available: input.artifact_reader_available ?? !input.entry.runtime_needs.artifact_reader,
            oracle_ref: input.oracle_ref ?? input.entry.runtime_needs.oracle_ref,
            sampling_frame_ref: input.sampling_frame_ref ?? input.entry.runtime_needs.sampling_frame_ref,
            unmet_dependencies: [...new Set(input.unmet_dependencies ?? [])].sort(),
        }))
            .sort((left, right) => left.name.localeCompare(right.name)
            || left.version.localeCompare(right.version)
            || left.implementation_ref.localeCompare(right.implementation_ref)),
    });
    return ValidatorAvailabilitySnapshotSchema.parse({ ...body, snapshot_ref: contentHash(body) });
}
export function admitAvailabilitySnapshot(input) {
    const parsed = ValidatorAvailabilitySnapshotSchema.parse(input);
    const { snapshot_ref, ...body } = parsed;
    if (snapshot_ref !== contentHash(body)) {
        refuse({
            code: 'validator.availability.ref-mismatch',
            message: 'the availability snapshot ref does not match its canonical content.',
            clause: 'VPC-017',
        });
    }
    const normalizedBody = ValidatorAvailabilitySnapshotBodySchema.parse({
        ...body,
        entries: body.entries
            .map((entry) => ({ ...entry, unmet_dependencies: [...new Set(entry.unmet_dependencies)].sort() }))
            .sort((left, right) => left.name.localeCompare(right.name)
            || left.version.localeCompare(right.version)
            || left.implementation_ref.localeCompare(right.implementation_ref)),
    });
    return ValidatorAvailabilitySnapshotSchema.parse({
        ...normalizedBody,
        snapshot_ref: contentHash(normalizedBody),
    });
}
export function catalogueDefaults() {
    return {
        finding_contract: {
            class: 'deterministic',
            supported_verdicts: [...VALIDATOR_OUTCOMES],
            supported_failure_classes: [...FAILURE_CLASSES],
            indeterminate_supported: true,
        },
        input_contract: {
            representation: 'validator-case-input/1',
            required_item_fields: ['attempts', 'item_id', 'output', 'state'],
            population: 'full',
            dependencies: [],
            maximum_items: 100_000,
        },
        cost_envelope: {
            wall_ms: 2_000,
            denomination: 'compute_ms',
            compute_ms: 2_000,
            cpu_millis: null,
            memory_bytes: null,
            pids: null,
        },
        evidence: {
            protocol_conformance: [],
            labelled_cases: { positive: [], negative: [], indeterminate: [], adversarial: [] },
            repeatability: [],
            calibration: [],
            deployment_admission: [],
            boundary: 'declared only; no production admission evidence supplied',
        },
        runtime_needs: {
            host_protocol: 'validator-runner/1',
            package_ref: null,
            bundle_ref: null,
            artifact_reader: false,
            network_policy: 'denied',
            named_human_class: null,
            oracle_ref: null,
            sampling_frame_ref: null,
            sampling_assumption: null,
        },
    };
}
export function catalogueEvidenceRef(entrypoint, evidence) {
    return contentHash({ schema: 'validator-catalogue-evidence/1', entrypoint, evidence });
}
export function defineCustomCatalogueEntry(input) {
    const defaults = catalogueDefaults();
    if (!input.description_boundary.trim()) {
        refuse({
            code: 'validator.catalogue.invalid',
            message: 'a custom validator needs a plain description of its declared evidence boundary.',
            clause: 'VPC-014',
        });
    }
    if ((input.implementation_ref ? 1 : 0) + (input.implementation_identity ? 1 : 0) !== 1) {
        refuse({
            code: 'validator.catalogue.implementation-identity',
            message: 'a custom validator needs exactly one explicit implementation_ref or content-addressed implementation_identity.',
            clause: 'VPC-008',
        });
    }
    return defineCatalogueEntry({
        kind: 'custom',
        identity: {
            name: input.name,
            version: input.version,
            implementation_ref: input.implementation_ref ?? contentHash({
                schema: 'custom-validator-implementation/1',
                entrypoint: input.entrypoint,
                implementation: input.implementation_identity,
            }),
            factory_ref: input.factory_ref ?? null,
            entrypoint: input.entrypoint,
        },
        finding_contract: { ...defaults.finding_contract, class: input.class },
        input_contract: defaults.input_contract,
        coverage_capability: { rule_kinds: input.rule_kinds },
        cost_envelope: { ...defaults.cost_envelope, wall_ms: input.wall_ms, compute_ms: input.wall_ms },
        evidence: input.evidence ?? { ...defaults.evidence, boundary: input.description_boundary },
        runtime_needs: { ...defaults.runtime_needs, ...(input.runtime_needs ?? {}) },
        limitations: input.limitations,
    });
}
export function defineFirstPartyCatalogueEntry(input) {
    const defaults = catalogueDefaults();
    const klass = input.class ?? 'deterministic';
    const evidence = (kind) => catalogueEvidenceRef(input.entrypoint, kind);
    return defineCatalogueEntry({
        kind: 'first-party',
        identity: {
            name: input.name,
            version: input.version,
            implementation_ref: contentHash({
                schema: 'validator-implementation/1',
                entrypoint: input.entrypoint,
                implementation: input.implementation_identity,
            }),
            factory_ref: input.factory_identity
                ? contentHash({ schema: 'validator-factory/1', entrypoint: input.entrypoint, factory: input.factory_identity })
                : null,
            entrypoint: input.entrypoint,
        },
        finding_contract: { ...defaults.finding_contract, class: klass },
        input_contract: {
            ...defaults.input_contract,
            population: input.population ?? defaults.input_contract.population,
            dependencies: input.dependencies ?? defaults.input_contract.dependencies,
        },
        coverage_capability: { rule_kinds: input.rule_kinds },
        cost_envelope: {
            ...defaults.cost_envelope,
            wall_ms: input.wall_ms ?? defaults.cost_envelope.wall_ms,
            compute_ms: input.wall_ms ?? defaults.cost_envelope.compute_ms,
        },
        evidence: {
            protocol_conformance: [evidence('protocol-conformance:VPC-CV-003')],
            labelled_cases: {
                positive: [evidence('positive-case:VPC-CV-004')],
                negative: [evidence('negative-case:VPC-CV-004')],
                indeterminate: [evidence('indeterminate-case:VPC-CV-004')],
                adversarial: [evidence('adversarial-case:VPC-CV-004')],
            },
            repeatability: klass === 'deterministic' ? [evidence('repeatability:VPC-CV-004')] : [],
            calibration: klass === 'sampled-oracle' ? [evidence('calibration:MTH-CV-030')] : [],
            deployment_admission: [evidence('deployment-registration:VPC-CV-004')],
            boundary: input.evidence_boundary ?? 'repository conformance and in-process deployment registration',
        },
        runtime_needs: {
            ...defaults.runtime_needs,
            artifact_reader: input.artifact_reader ?? false,
            named_human_class: input.named_human_class ?? null,
            oracle_ref: input.oracle_ref ?? null,
            sampling_frame_ref: input.sampling_frame_ref ?? null,
            sampling_assumption: input.sampling_assumption ?? null,
        },
        limitations: input.limitations,
    });
}
export function canonicalCatalogueEntry(entry) {
    return canonicalJson(admitCatalogueEntry(entry));
}
