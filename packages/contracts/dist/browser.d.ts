/**
 * First-party browser contracts.
 *
 * These shapes bind a run to one browser profile, finite resource limits and
 * exact destinations. They are implementation-neutral: Playwright lives in
 * the conditional browser package, while authority stays in the runtime.
 */
import { z } from 'zod';
import type { BrowserIsolation } from './vocab.js';
export declare const BrowserLimitsSchema: z.ZodObject<{
    max_processes: z.ZodNumber;
    max_contexts_per_process: z.ZodNumber;
    max_pages_per_context: z.ZodLiteral<1>;
    max_active_sessions: z.ZodNumber;
    max_queued_sessions: z.ZodNumber;
    max_navigations_per_session: z.ZodNumber;
    max_requests_per_session: z.ZodNumber;
    max_redirects: z.ZodNumber;
    max_response_bytes: z.ZodNumber;
    max_network_bytes: z.ZodNumber;
    max_artifact_bytes: z.ZodNumber;
    max_downloads_per_session: z.ZodNumber;
    max_observation_retries: z.ZodNumber;
    navigation_timeout_ms: z.ZodNumber;
    idle_timeout_ms: z.ZodNumber;
    wall_time_ms: z.ZodNumber;
    cpu_time_ms: z.ZodNumber;
    memory_mib: z.ZodNumber;
    process_count: z.ZodNumber;
}, z.core.$strict>;
export type BrowserLimits = z.infer<typeof BrowserLimitsSchema>;
export declare const BrowserDestinationSchema: z.ZodObject<{
    origin: z.ZodString;
    methods: z.ZodArray<z.ZodEnum<{
        GET: "GET";
        HEAD: "HEAD";
        POST: "POST";
        PUT: "PUT";
        PATCH: "PATCH";
        DELETE: "DELETE";
    }>>;
    resource_types: z.ZodArray<z.ZodEnum<{
        document: "document";
        stylesheet: "stylesheet";
        image: "image";
        media: "media";
        font: "font";
        script: "script";
        texttrack: "texttrack";
        xhr: "xhr";
        fetch: "fetch";
        eventsource: "eventsource";
        websocket: "websocket";
        manifest: "manifest";
        other: "other";
    }>>;
    path_prefixes: z.ZodArray<z.ZodString>;
    resolved_addresses: z.ZodArray<z.ZodString>;
    credential_scope: z.ZodNullable<z.ZodString>;
    sensitive_query_fields: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type BrowserDestination = z.infer<typeof BrowserDestinationSchema>;
export declare const BrowserCredentialBindingSchema: z.ZodObject<{
    credential_ref: z.ZodString;
    epoch: z.ZodNumber;
    scope: z.ZodString;
    origins: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type BrowserCredentialBinding = z.infer<typeof BrowserCredentialBindingSchema>;
export declare const BrowserEffectPolicySchema: z.ZodObject<{
    operation: z.ZodString;
    origin: z.ZodString;
    action: z.ZodEnum<{
        click: "click";
        submit: "submit";
        upload: "upload";
        unknown: "unknown";
    }>;
    selectors: z.ZodArray<z.ZodString>;
    idempotency_strategy: z.ZodEnum<{
        "provider-key": "provider-key";
        "natural-reference": "natural-reference";
    }>;
    reconciliation_url_template: z.ZodString;
    found_selector: z.ZodString;
    absent_selector: z.ZodString;
    receipt_selector: z.ZodString;
}, z.core.$strict>;
export type BrowserEffectPolicy = z.infer<typeof BrowserEffectPolicySchema>;
export declare const BrowserAdapterDescriptorSchema: z.ZodObject<{
    name: z.ZodLiteral<"zero-ar.playwright-chromium">;
    version: z.ZodString;
    engine: z.ZodEnum<{
        "playwright-chromium": "playwright-chromium";
    }>;
    playwright_version: z.ZodString;
    chromium_revision: z.ZodString;
    executable_ref: z.ZodString;
    conformance_refs: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
export type BrowserAdapterDescriptor = z.infer<typeof BrowserAdapterDescriptorSchema>;
export declare const BrowserBindingSchema: z.ZodObject<{
    contract: z.ZodLiteral<"zero-ar-browser-binding/1">;
    binding_ref: z.ZodString;
    run_id: z.ZodString;
    tenant: z.ZodString;
    profile_ref: z.ZodString;
    adapter: z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.playwright-chromium">;
        version: z.ZodString;
        engine: z.ZodEnum<{
            "playwright-chromium": "playwright-chromium";
        }>;
        playwright_version: z.ZodString;
        chromium_revision: z.ZodString;
        executable_ref: z.ZodString;
        conformance_refs: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    isolation: z.ZodEnum<{
        process: "process";
        container: "container";
    }>;
    limit_enforcement: z.ZodEnum<{
        "observed-process": "observed-process";
        "cgroup-v2": "cgroup-v2";
    }>;
    network_mode: z.ZodEnum<{
        "public-only": "public-only";
        "loopback-test-only": "loopback-test-only";
    }>;
    destinations: z.ZodArray<z.ZodObject<{
        origin: z.ZodString;
        methods: z.ZodArray<z.ZodEnum<{
            GET: "GET";
            HEAD: "HEAD";
            POST: "POST";
            PUT: "PUT";
            PATCH: "PATCH";
            DELETE: "DELETE";
        }>>;
        resource_types: z.ZodArray<z.ZodEnum<{
            document: "document";
            stylesheet: "stylesheet";
            image: "image";
            media: "media";
            font: "font";
            script: "script";
            texttrack: "texttrack";
            xhr: "xhr";
            fetch: "fetch";
            eventsource: "eventsource";
            websocket: "websocket";
            manifest: "manifest";
            other: "other";
        }>>;
        path_prefixes: z.ZodArray<z.ZodString>;
        resolved_addresses: z.ZodArray<z.ZodString>;
        credential_scope: z.ZodNullable<z.ZodString>;
        sensitive_query_fields: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    credentials: z.ZodArray<z.ZodObject<{
        credential_ref: z.ZodString;
        epoch: z.ZodNumber;
        scope: z.ZodString;
        origins: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    effect_policies: z.ZodArray<z.ZodObject<{
        operation: z.ZodString;
        origin: z.ZodString;
        action: z.ZodEnum<{
            click: "click";
            submit: "submit";
            upload: "upload";
            unknown: "unknown";
        }>;
        selectors: z.ZodArray<z.ZodString>;
        idempotency_strategy: z.ZodEnum<{
            "provider-key": "provider-key";
            "natural-reference": "natural-reference";
        }>;
        reconciliation_url_template: z.ZodString;
        found_selector: z.ZodString;
        absent_selector: z.ZodString;
        receipt_selector: z.ZodString;
    }, z.core.$strict>>;
    limits: z.ZodObject<{
        max_processes: z.ZodNumber;
        max_contexts_per_process: z.ZodNumber;
        max_pages_per_context: z.ZodLiteral<1>;
        max_active_sessions: z.ZodNumber;
        max_queued_sessions: z.ZodNumber;
        max_navigations_per_session: z.ZodNumber;
        max_requests_per_session: z.ZodNumber;
        max_redirects: z.ZodNumber;
        max_response_bytes: z.ZodNumber;
        max_network_bytes: z.ZodNumber;
        max_artifact_bytes: z.ZodNumber;
        max_downloads_per_session: z.ZodNumber;
        max_observation_retries: z.ZodNumber;
        navigation_timeout_ms: z.ZodNumber;
        idle_timeout_ms: z.ZodNumber;
        wall_time_ms: z.ZodNumber;
        cpu_time_ms: z.ZodNumber;
        memory_mib: z.ZodNumber;
        process_count: z.ZodNumber;
    }, z.core.$strict>;
    supersedes_binding_ref: z.ZodNullable<z.ZodString>;
    destination_decision_ref: z.ZodNullable<z.ZodString>;
    created_by: z.ZodString;
    reviewed_by: z.ZodString;
    created_at: z.ZodString;
}, z.core.$strict>;
export type BrowserBinding = z.infer<typeof BrowserBindingSchema>;
export declare function deriveBrowserBindingRef(binding: Omit<BrowserBinding, 'binding_ref'>): string;
export declare function compileBrowserBinding(value: unknown): BrowserBinding;
/**
 * A reviewed browser binding template from deployment configuration. Intake
 * names a template; the kernel pins the template ref into identity and
 * materializes the run-scoped binding after the run id exists, so identity
 * never depends on one run and the kernel injects binding_ref (BRC-001).
 */
export declare const BrowserBindingTemplateSchema: z.ZodObject<{
    contract: z.ZodLiteral<"zero-ar-browser-binding-template/1">;
    name: z.ZodString;
    version: z.ZodString;
    profile_ref: z.ZodString;
    adapter: z.ZodObject<{
        name: z.ZodLiteral<"zero-ar.playwright-chromium">;
        version: z.ZodString;
        engine: z.ZodEnum<{
            "playwright-chromium": "playwright-chromium";
        }>;
        playwright_version: z.ZodString;
        chromium_revision: z.ZodString;
        executable_ref: z.ZodString;
        conformance_refs: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    isolation: z.ZodEnum<{
        process: "process";
        container: "container";
    }>;
    limit_enforcement: z.ZodEnum<{
        "observed-process": "observed-process";
        "cgroup-v2": "cgroup-v2";
    }>;
    network_mode: z.ZodEnum<{
        "public-only": "public-only";
        "loopback-test-only": "loopback-test-only";
    }>;
    destinations: z.ZodArray<z.ZodObject<{
        origin: z.ZodString;
        methods: z.ZodArray<z.ZodEnum<{
            GET: "GET";
            HEAD: "HEAD";
            POST: "POST";
            PUT: "PUT";
            PATCH: "PATCH";
            DELETE: "DELETE";
        }>>;
        resource_types: z.ZodArray<z.ZodEnum<{
            document: "document";
            stylesheet: "stylesheet";
            image: "image";
            media: "media";
            font: "font";
            script: "script";
            texttrack: "texttrack";
            xhr: "xhr";
            fetch: "fetch";
            eventsource: "eventsource";
            websocket: "websocket";
            manifest: "manifest";
            other: "other";
        }>>;
        path_prefixes: z.ZodArray<z.ZodString>;
        resolved_addresses: z.ZodArray<z.ZodString>;
        credential_scope: z.ZodNullable<z.ZodString>;
        sensitive_query_fields: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    credentials: z.ZodArray<z.ZodObject<{
        credential_ref: z.ZodString;
        epoch: z.ZodNumber;
        scope: z.ZodString;
        origins: z.ZodArray<z.ZodString>;
    }, z.core.$strict>>;
    effect_policies: z.ZodArray<z.ZodObject<{
        operation: z.ZodString;
        origin: z.ZodString;
        action: z.ZodEnum<{
            click: "click";
            submit: "submit";
            upload: "upload";
            unknown: "unknown";
        }>;
        selectors: z.ZodArray<z.ZodString>;
        idempotency_strategy: z.ZodEnum<{
            "provider-key": "provider-key";
            "natural-reference": "natural-reference";
        }>;
        reconciliation_url_template: z.ZodString;
        found_selector: z.ZodString;
        absent_selector: z.ZodString;
        receipt_selector: z.ZodString;
    }, z.core.$strict>>;
    limits: z.ZodObject<{
        max_processes: z.ZodNumber;
        max_contexts_per_process: z.ZodNumber;
        max_pages_per_context: z.ZodLiteral<1>;
        max_active_sessions: z.ZodNumber;
        max_queued_sessions: z.ZodNumber;
        max_navigations_per_session: z.ZodNumber;
        max_requests_per_session: z.ZodNumber;
        max_redirects: z.ZodNumber;
        max_response_bytes: z.ZodNumber;
        max_network_bytes: z.ZodNumber;
        max_artifact_bytes: z.ZodNumber;
        max_downloads_per_session: z.ZodNumber;
        max_observation_retries: z.ZodNumber;
        navigation_timeout_ms: z.ZodNumber;
        idle_timeout_ms: z.ZodNumber;
        wall_time_ms: z.ZodNumber;
        cpu_time_ms: z.ZodNumber;
        memory_mib: z.ZodNumber;
        process_count: z.ZodNumber;
    }, z.core.$strict>;
    reviewed_by: z.ZodString;
}, z.core.$strict>;
export type BrowserBindingTemplate = z.infer<typeof BrowserBindingTemplateSchema>;
/** The browser input a run asks for: one reviewed template, by name. */
export declare const BrowserIntakeInputSchema: z.ZodObject<{
    template: z.ZodString;
}, z.core.$strict>;
export type BrowserIntakeInput = z.infer<typeof BrowserIntakeInputSchema>;
/** What a resolved run manifest pins about its browser: the template, never the per-run binding. */
export declare const ResolvedBrowserTemplateSchema: z.ZodObject<{
    template: z.ZodString;
    template_ref: z.ZodString;
}, z.core.$strict>;
export type ResolvedBrowserTemplate = z.infer<typeof ResolvedBrowserTemplateSchema>;
/** A request to widen one run's destinations. The proposer comes from authentication, never the body (BRC-012). */
export declare const BrowserDestinationProposalRequestSchema: z.ZodObject<{
    requested_destination: z.ZodObject<{
        origin: z.ZodString;
        methods: z.ZodArray<z.ZodEnum<{
            GET: "GET";
            HEAD: "HEAD";
            POST: "POST";
            PUT: "PUT";
            PATCH: "PATCH";
            DELETE: "DELETE";
        }>>;
        resource_types: z.ZodArray<z.ZodEnum<{
            document: "document";
            stylesheet: "stylesheet";
            image: "image";
            media: "media";
            font: "font";
            script: "script";
            texttrack: "texttrack";
            xhr: "xhr";
            fetch: "fetch";
            eventsource: "eventsource";
            websocket: "websocket";
            manifest: "manifest";
            other: "other";
        }>>;
        path_prefixes: z.ZodArray<z.ZodString>;
        resolved_addresses: z.ZodArray<z.ZodString>;
        credential_scope: z.ZodNullable<z.ZodString>;
        sensitive_query_fields: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    reason: z.ZodString;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type BrowserDestinationProposalRequest = z.infer<typeof BrowserDestinationProposalRequestSchema>;
/** A disposition on one proposal. The approver is the verified participant, never the body (BRC-013). */
export declare const BrowserDestinationDecisionRequestSchema: z.ZodObject<{
    disposition: z.ZodEnum<{
        approved: "approved";
        refused: "refused";
    }>;
    reason: z.ZodString;
    idempotency_key: z.ZodString;
}, z.core.$strict>;
export type BrowserDestinationDecisionRequest = z.infer<typeof BrowserDestinationDecisionRequestSchema>;
export declare const BrowserDestinationProposalSchema: z.ZodObject<{
    proposal_ref: z.ZodString;
    run_id: z.ZodString;
    tenant: z.ZodString;
    participant: z.ZodString;
    current_binding_ref: z.ZodString;
    requested_destination: z.ZodObject<{
        origin: z.ZodString;
        methods: z.ZodArray<z.ZodEnum<{
            GET: "GET";
            HEAD: "HEAD";
            POST: "POST";
            PUT: "PUT";
            PATCH: "PATCH";
            DELETE: "DELETE";
        }>>;
        resource_types: z.ZodArray<z.ZodEnum<{
            document: "document";
            stylesheet: "stylesheet";
            image: "image";
            media: "media";
            font: "font";
            script: "script";
            texttrack: "texttrack";
            xhr: "xhr";
            fetch: "fetch";
            eventsource: "eventsource";
            websocket: "websocket";
            manifest: "manifest";
            other: "other";
        }>>;
        path_prefixes: z.ZodArray<z.ZodString>;
        resolved_addresses: z.ZodArray<z.ZodString>;
        credential_scope: z.ZodNullable<z.ZodString>;
        sensitive_query_fields: z.ZodArray<z.ZodString>;
    }, z.core.$strict>;
    reason: z.ZodString;
    proposed_at: z.ZodString;
}, z.core.$strict>;
export type BrowserDestinationProposal = z.infer<typeof BrowserDestinationProposalSchema>;
export declare function deriveBrowserDestinationProposalRef(proposal: Omit<BrowserDestinationProposal, 'proposal_ref'>): string;
export declare const BrowserDestinationDecisionSchema: z.ZodObject<{
    decision_ref: z.ZodString;
    proposal_ref: z.ZodString;
    run_id: z.ZodString;
    current_binding_ref: z.ZodString;
    disposition: z.ZodEnum<{
        approved: "approved";
        refused: "refused";
    }>;
    approver: z.ZodString;
    authentication_ref: z.ZodString;
    authority_epoch: z.ZodNumber;
    reason: z.ZodString;
    decided_at: z.ZodString;
}, z.core.$strict>;
export type BrowserDestinationDecision = z.infer<typeof BrowserDestinationDecisionSchema>;
export declare function deriveBrowserDestinationDecisionRef(decision: Omit<BrowserDestinationDecision, 'decision_ref'>): string;
export declare function applyBrowserDestinationDecision(bindingInput: unknown, proposalInput: unknown, decisionInput: unknown): BrowserBinding;
export declare const BrowserRequestProvenanceSchema: z.ZodObject<{
    url: z.ZodString;
    redacted_url: z.ZodString;
    method: z.ZodString;
    resource_type: z.ZodEnum<{
        document: "document";
        stylesheet: "stylesheet";
        image: "image";
        media: "media";
        font: "font";
        script: "script";
        texttrack: "texttrack";
        xhr: "xhr";
        fetch: "fetch";
        eventsource: "eventsource";
        websocket: "websocket";
        manifest: "manifest";
        other: "other";
    }>;
    resolved_address: z.ZodNullable<z.ZodString>;
    decision: z.ZodEnum<{
        refused: "refused";
        allowed: "allowed";
    }>;
    response_status: z.ZodNullable<z.ZodNumber>;
    response_bytes: z.ZodNumber;
}, z.core.$strict>;
export type BrowserRequestProvenance = z.infer<typeof BrowserRequestProvenanceSchema>;
export declare const BrowserProvenanceSchema: z.ZodObject<{
    schema: z.ZodLiteral<"zero-ar-browser-provenance/1">;
    run_id: z.ZodString;
    invoke_id: z.ZodString;
    binding_ref: z.ZodString;
    profile_ref: z.ZodString;
    observation: z.ZodEnum<{
        text: "text";
        dom: "dom";
        screenshot: "screenshot";
        download: "download";
    }>;
    requested_url: z.ZodString;
    final_url: z.ZodString;
    redirects: z.ZodArray<z.ZodString>;
    requests: z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        redacted_url: z.ZodString;
        method: z.ZodString;
        resource_type: z.ZodEnum<{
            document: "document";
            stylesheet: "stylesheet";
            image: "image";
            media: "media";
            font: "font";
            script: "script";
            texttrack: "texttrack";
            xhr: "xhr";
            fetch: "fetch";
            eventsource: "eventsource";
            websocket: "websocket";
            manifest: "manifest";
            other: "other";
        }>;
        resolved_address: z.ZodNullable<z.ZodString>;
        decision: z.ZodEnum<{
            refused: "refused";
            allowed: "allowed";
        }>;
        response_status: z.ZodNullable<z.ZodNumber>;
        response_bytes: z.ZodNumber;
    }, z.core.$strict>>;
    content_hash: z.ZodString;
    artifact_ref: z.ZodNullable<z.ZodString>;
    artifact_manifest_ref: z.ZodNullable<z.ZodString>;
    source_binding_ref: z.ZodNullable<z.ZodString>;
    browser_engine: z.ZodEnum<{
        "playwright-chromium": "playwright-chromium";
    }>;
    browser_revision: z.ZodString;
    captured_at: z.ZodString;
    content_label: z.ZodEnum<{
        "untrusted-external-content": "untrusted-external-content";
    }>;
    instruction_authority: z.ZodEnum<{
        none: "none";
    }>;
}, z.core.$strict>;
export type BrowserProvenance = z.infer<typeof BrowserProvenanceSchema>;
export declare const BrowserObservationResultSchema: z.ZodObject<{
    observation: z.ZodEnum<{
        text: "text";
        dom: "dom";
        screenshot: "screenshot";
        download: "download";
    }>;
    text: z.ZodNullable<z.ZodString>;
    truncated: z.ZodBoolean;
    bytes: z.ZodNumber;
    artifact_ref: z.ZodNullable<z.ZodString>;
    source_binding_ref: z.ZodNullable<z.ZodString>;
    content_label: z.ZodEnum<{
        "untrusted-external-content": "untrusted-external-content";
    }>;
    instruction_authority: z.ZodEnum<{
        none: "none";
    }>;
    provenance: z.ZodObject<{
        schema: z.ZodLiteral<"zero-ar-browser-provenance/1">;
        run_id: z.ZodString;
        invoke_id: z.ZodString;
        binding_ref: z.ZodString;
        profile_ref: z.ZodString;
        observation: z.ZodEnum<{
            text: "text";
            dom: "dom";
            screenshot: "screenshot";
            download: "download";
        }>;
        requested_url: z.ZodString;
        final_url: z.ZodString;
        redirects: z.ZodArray<z.ZodString>;
        requests: z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            redacted_url: z.ZodString;
            method: z.ZodString;
            resource_type: z.ZodEnum<{
                document: "document";
                stylesheet: "stylesheet";
                image: "image";
                media: "media";
                font: "font";
                script: "script";
                texttrack: "texttrack";
                xhr: "xhr";
                fetch: "fetch";
                eventsource: "eventsource";
                websocket: "websocket";
                manifest: "manifest";
                other: "other";
            }>;
            resolved_address: z.ZodNullable<z.ZodString>;
            decision: z.ZodEnum<{
                refused: "refused";
                allowed: "allowed";
            }>;
            response_status: z.ZodNullable<z.ZodNumber>;
            response_bytes: z.ZodNumber;
        }, z.core.$strict>>;
        content_hash: z.ZodString;
        artifact_ref: z.ZodNullable<z.ZodString>;
        artifact_manifest_ref: z.ZodNullable<z.ZodString>;
        source_binding_ref: z.ZodNullable<z.ZodString>;
        browser_engine: z.ZodEnum<{
            "playwright-chromium": "playwright-chromium";
        }>;
        browser_revision: z.ZodString;
        captured_at: z.ZodString;
        content_label: z.ZodEnum<{
            "untrusted-external-content": "untrusted-external-content";
        }>;
        instruction_authority: z.ZodEnum<{
            none: "none";
        }>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type BrowserObservationResult = z.infer<typeof BrowserObservationResultSchema>;
export declare const BrowserEffectParametersSchema: z.ZodObject<{
    binding_ref: z.ZodString;
    action: z.ZodEnum<{
        click: "click";
        submit: "submit";
        upload: "upload";
        unknown: "unknown";
    }>;
    url: z.ZodString;
    selector: z.ZodString;
    fields: z.ZodRecord<z.ZodString, z.ZodString>;
    artifact_ref: z.ZodNullable<z.ZodString>;
    artifact_hash: z.ZodNullable<z.ZodString>;
    idempotency_strategy: z.ZodEnum<{
        "provider-key": "provider-key";
        "natural-reference": "natural-reference";
    }>;
    natural_reference: z.ZodNullable<z.ZodString>;
}, z.core.$strict>;
export type BrowserEffectParameters = z.infer<typeof BrowserEffectParametersSchema>;
export declare const BrowserProfileHealthSchema: z.ZodObject<{
    profile_ref: z.ZodString;
    state: z.ZodEnum<{
        disabled: "disabled";
        installed: "installed";
        healthy: "healthy";
        admitted: "admitted";
    }>;
    engine_revision: z.ZodString;
    executable_ref: z.ZodString;
    proxy_ready: z.ZodBoolean;
    limit_enforcement: z.ZodEnum<{
        "observed-process": "observed-process";
        "cgroup-v2": "cgroup-v2";
    }>;
    checked_at: z.ZodString;
    reason: z.ZodString;
}, z.core.$strict>;
export type BrowserProfileHealth = z.infer<typeof BrowserProfileHealthSchema>;
export declare const BrowserLatencySummarySchema: z.ZodObject<{
    samples: z.ZodNumber;
    min_ms: z.ZodNumber;
    p50_ms: z.ZodNumber;
    p95_ms: z.ZodNumber;
    max_ms: z.ZodNumber;
}, z.core.$strict>;
export type BrowserLatencySummary = z.infer<typeof BrowserLatencySummarySchema>;
export declare const BrowserMeasurementReportSchema: z.ZodObject<{
    format: z.ZodLiteral<"zero-ar-browser-measurement/1">;
    source_commit: z.ZodString;
    generated_at: z.ZodString;
    platform: z.ZodString;
    architecture: z.ZodString;
    node_version: z.ZodString;
    playwright_version: z.ZodString;
    chromium_revision: z.ZodString;
    executable_ref: z.ZodString;
    topology_ref: z.ZodString;
    fixture_ref: z.ZodString;
    samples: z.ZodNumber;
    concurrency: z.ZodNumber;
    limits: z.ZodObject<{
        max_processes: z.ZodNumber;
        max_contexts_per_process: z.ZodNumber;
        max_pages_per_context: z.ZodLiteral<1>;
        max_active_sessions: z.ZodNumber;
        max_queued_sessions: z.ZodNumber;
        max_navigations_per_session: z.ZodNumber;
        max_requests_per_session: z.ZodNumber;
        max_redirects: z.ZodNumber;
        max_response_bytes: z.ZodNumber;
        max_network_bytes: z.ZodNumber;
        max_artifact_bytes: z.ZodNumber;
        max_downloads_per_session: z.ZodNumber;
        max_observation_retries: z.ZodNumber;
        navigation_timeout_ms: z.ZodNumber;
        idle_timeout_ms: z.ZodNumber;
        wall_time_ms: z.ZodNumber;
        cpu_time_ms: z.ZodNumber;
        memory_mib: z.ZodNumber;
        process_count: z.ZodNumber;
    }, z.core.$strict>;
    latency: z.ZodObject<{
        cold_process_context: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        warm_context: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        navigation: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        text_extraction: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        screenshot_artifact_commit: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        cancellation_teardown: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
        context_teardown: z.ZodObject<{
            samples: z.ZodNumber;
            min_ms: z.ZodNumber;
            p50_ms: z.ZodNumber;
            p95_ms: z.ZodNumber;
            max_ms: z.ZodNumber;
        }, z.core.$strict>;
    }, z.core.$strict>;
    peak_process_tree: z.ZodObject<{
        memory_mib: z.ZodNumber;
        process_count: z.ZodNumber;
        cpu_time_ms: z.ZodNumber;
    }, z.core.$strict>;
    errors: z.ZodArray<z.ZodString>;
    publishable: z.ZodLiteral<true>;
    unavailable_reason: z.ZodNull;
}, z.core.$strict>;
export type BrowserMeasurementReport = z.infer<typeof BrowserMeasurementReportSchema>;
export interface BrowserToolDeclaration {
    name: string;
    version: string;
    description: string;
    input_schema: Record<string, unknown>;
    contract_ref: string;
    operation_class: 'observation' | 'effect-proposal';
    isolation: BrowserIsolation;
    timeout_ms: number;
    target?: string;
    operation?: string;
    output_classification: 'internal';
    cost: {
        denomination: 'bytes' | 'compute_ms';
        enforced_max: number;
    };
}
export declare function browserToolDeclarations(binding: BrowserBinding): BrowserToolDeclaration[];
