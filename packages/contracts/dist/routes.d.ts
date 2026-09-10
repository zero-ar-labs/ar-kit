/**
 * The public route table.
 *
 * What this is: every route the server offers and every client speaks,
 * declared once with its method, path, transport kind, and the registry
 * names of its request and response shapes. The client module is generated
 * from this table, and the parity vector drives a live server through all
 * of it (XCV-003).
 *
 * How it fits: a surface that needs an operation absent from this table
 * blocks until the contract exists (ERD 9.1). Adding a row here and
 * regenerating is the whole procedure for a new route; a hand-edited
 * client drifts from this table and the drift check refuses it.
 */
import type { ApiMediaType, ApiQueryParameterType, ProductArea, ProductMutationIdempotencySource, RouteScope } from './vocab.js';
export { PRODUCT_AREAS, ROUTE_SCOPES } from './vocab.js';
export type { ProductArea, RouteScope } from './vocab.js';
export type ApiRouteAuthorization = {
    public: true;
    reason: string;
} | {
    scopes: readonly RouteScope[];
} | {
    control_verb: {
        default: RouteScope;
        cancel: RouteScope;
        answer_any_of: readonly RouteScope[];
    };
};
export interface ApiRouteQueryParameter {
    name: string;
    type: ApiQueryParameterType;
    required?: boolean;
    minimum?: number;
    maximum?: number;
    default?: string | number | boolean;
    enum?: readonly string[];
    format?: 'date-time';
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}
export interface ApiRouteHeaderParameter {
    name: string;
    argument: string;
    required?: boolean;
    description: string;
    maxLength?: number;
}
export interface ApiRoute {
    method: 'GET' | 'POST';
    path: string;
    /** json answers a body; bundle moves framed JSON lines; sse streams events. */
    kind: 'json' | 'bundle' | 'sse';
    /** SCHEMA_REGISTRY names for request bodies, responses, or stream events. */
    request?: string;
    response?: string;
    query?: readonly ApiRouteQueryParameter[];
    /** An optional SCHEMA_REGISTRY object type used by generated clients for a multi-field query. */
    query_request?: string;
    /** Extra typed request headers beyond the application Authorization credential. */
    headers?: readonly ApiRouteHeaderParameter[];
    /** JSON is the default. Binary, framed, and stream routes state their media explicitly. */
    request_media_type?: ApiMediaType;
    response_media_type?: ApiMediaType;
    /** Exactly one of the five primary product areas (LIF-031). The inventory derives from this field. */
    area: ProductArea;
    /** Public routes state why. Protected routes state their exact scope expression. */
    authorization: ApiRouteAuthorization;
    /** Present only for commands in the external-product mutation profile. */
    product_mutation?: {
        idempotency_source: ProductMutationIdempotencySource;
        changed_content_code: string;
    };
}
export declare const API_ROUTES: {
    readonly health: {
        readonly method: "GET";
        readonly path: "/v1/health";
        readonly kind: "json";
        readonly response: "HealthResponseSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly public: true;
            readonly reason: "Health reports component state and no tenant run data.";
        };
    };
    readonly databaseDoctor: {
        readonly method: "GET";
        readonly path: "/v1/database/doctor";
        readonly kind: "json";
        readonly response: "DatabaseDoctorResponseSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["operator:audit"];
        };
    };
    readonly listRuns: {
        readonly method: "GET";
        readonly path: "/v1/runs";
        readonly kind: "json";
        readonly query_request: "WorkQueryRequestSchema";
        readonly query: readonly [{
            readonly name: "cursor";
            readonly type: "string";
            readonly pattern: "^sha256:[0-9a-f]{64}$";
        }, {
            readonly name: "limit";
            readonly type: "integer";
            readonly minimum: 1;
            readonly maximum: 100;
            readonly default: 50;
        }, {
            readonly name: "lifecycle_state";
            readonly type: "string";
            readonly enum: readonly ["created", "running", "suspended", "cancelled", "finished"];
        }, {
            readonly name: "completion_class";
            readonly type: "string";
            readonly enum: readonly ["working", "verified", "unverified", "rejected", "indeterminate", "exhausted", "cancelled"];
        }, {
            readonly name: "review_state";
            readonly type: "string";
            readonly enum: readonly ["pending", "none"];
        }, {
            readonly name: "publication_ref";
            readonly type: "string";
            readonly pattern: "^sha256:[0-9a-f]{64}$";
        }, {
            readonly name: "created_from";
            readonly type: "string";
            readonly format: "date-time";
        }, {
            readonly name: "created_before";
            readonly type: "string";
            readonly format: "date-time";
        }, {
            readonly name: "correlation_id";
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 256;
        }];
        readonly response: "WorkQueryPageSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly createRun: {
        readonly method: "POST";
        readonly path: "/v1/runs";
        readonly kind: "json";
        readonly request: "IntakeRequestSchema";
        readonly response: "CreatedRunSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:create"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "intake.idempotency.reused";
        };
    };
    readonly createDeferredRun: {
        readonly method: "POST";
        readonly path: "/v1/runs/deferred";
        readonly kind: "json";
        readonly request: "IntakeRequestSchema";
        readonly response: "CreatedRunSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:create"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "intake.idempotency.reused";
        };
    };
    readonly snapshot: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id";
        readonly kind: "json";
        readonly response: "RunSnapshotSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly result: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id/result";
        readonly kind: "json";
        readonly response: "RunResultSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly records: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id/records";
        readonly kind: "json";
        readonly query: readonly [{
            readonly name: "after";
            readonly type: "integer";
            readonly minimum: 0;
            readonly default: 0;
        }];
        readonly response: "RecordsPageSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly control: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/controls";
        readonly kind: "json";
        readonly request: "ControlRequestSchema";
        readonly response: "ControlAcceptedSchema";
        readonly area: "run";
        readonly authorization: {
            readonly control_verb: {
                readonly default: "run:control";
                readonly cancel: "run:cancel";
                readonly answer_any_of: readonly ["review:answer", "run:control"];
            };
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-control-id";
            readonly changed_content_code: "control.reused";
        };
    };
    readonly recordExternalObservation: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/observations";
        readonly kind: "json";
        readonly request: "ExternalObservationRequestSchema";
        readonly response: "ExternalObservationAcceptedSchema";
        readonly headers: readonly [{
            readonly name: "X-Zero-AR-Participant-Token";
            readonly argument: "participant_token";
            readonly required: false;
            readonly maxLength: 16384;
            readonly description: "An optional JWT issued by the tenant's admitted participant identity provider. The application bearer key remains in Authorization.";
        }];
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["observation:write"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "observation.idempotency.reused";
        };
    };
    readonly decideEffect: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/effects/:effect_id/decisions";
        readonly kind: "json";
        readonly request: "EffectApprovalRequestSchema";
        readonly response: "EffectApprovalAcceptedSchema";
        readonly headers: readonly [{
            readonly name: "X-Zero-AR-Participant-Token";
            readonly argument: "participant_token";
            readonly required: true;
            readonly maxLength: 16384;
            readonly description: "A JWT from the tenant's admitted participant identity provider. The verified subject becomes the exact-effect approver.";
        }];
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["effect:approve"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "effect.approval.idempotency.reused";
        };
    };
    readonly fork: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/forks";
        readonly kind: "json";
        readonly request: "ForkRequestSchema";
        readonly response: "RunRefSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:fork"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "fork.idempotency.reused";
        };
    };
    readonly reexecute: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/reexecutions";
        readonly kind: "json";
        readonly request: "ReexecuteRequestSchema";
        readonly response: "RunRefSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:reexecute"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "reexecution.idempotency.reused";
        };
    };
    readonly start: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/start";
        readonly kind: "json";
        readonly request: "RunLifecycleCommandRequestSchema";
        readonly response: "StartAcceptedSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:start"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "run.lifecycle.idempotency.reused";
        };
    };
    readonly resume: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/resume";
        readonly kind: "json";
        readonly request: "RunLifecycleCommandRequestSchema";
        readonly response: "StartAcceptedSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:resume"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "run.lifecycle.idempotency.reused";
        };
    };
    readonly resumeDeferred: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/resume-deferred";
        readonly kind: "json";
        readonly request: "RunLifecycleCommandRequestSchema";
        readonly response: "StartAcceptedSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:resume"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "run.lifecycle.idempotency.reused";
        };
    };
    readonly createRuntimeArtifactSession: {
        readonly method: "POST";
        readonly path: "/v1/artifact-sessions";
        readonly kind: "json";
        readonly request: "RuntimeArtifactSessionRequestSchema";
        readonly response: "RuntimeArtifactSessionStatusSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["artifact:write"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "request-idempotency-key";
            readonly changed_content_code: "artifact.idempotency-conflict";
        };
    };
    readonly runtimeArtifactUploadStatus: {
        readonly method: "GET";
        readonly path: "/v1/artifact-sessions/:session_id";
        readonly kind: "json";
        readonly response: "RuntimeArtifactSessionStatusSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["artifact:write"];
        };
    };
    readonly stageRuntimeArtifactChunk: {
        readonly method: "POST";
        readonly path: "/v1/artifact-sessions/:session_id/chunks";
        readonly kind: "bundle";
        readonly request_media_type: "application/octet-stream";
        readonly response: "RuntimeArtifactSessionStatusSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["artifact:write"];
        };
    };
    readonly commitRuntimeArtifact: {
        readonly method: "POST";
        readonly path: "/v1/artifact-sessions/:session_id/commits";
        readonly kind: "json";
        readonly response: "RuntimeArtifactCommittedSessionSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["artifact:write"];
        };
        readonly product_mutation: {
            readonly idempotency_source: "artifact-session-key";
            readonly changed_content_code: "artifact.idempotency-conflict";
        };
    };
    readonly rebuildProjection: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/projection-rebuilds";
        readonly kind: "json";
        readonly response: "RebuildOutcomeSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["operator:rebuild"];
        };
    };
    readonly eraseSubject: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/erasures";
        readonly kind: "json";
        readonly request: "ErasureRequestSchema";
        readonly response: "ErasureOutcomeSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["operator:erase"];
        };
    };
    readonly exportRun: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id/export";
        readonly kind: "bundle";
        readonly response_media_type: "application/x-ndjson";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly importRun: {
        readonly method: "POST";
        readonly path: "/v1/imports";
        readonly kind: "bundle";
        readonly request_media_type: "application/x-ndjson";
        readonly response: "ImportOutcomeSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["operator:restore"];
        };
    };
    readonly streamRecords: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id/records/stream";
        readonly kind: "sse";
        readonly query: readonly [{
            readonly name: "after";
            readonly type: "integer";
            readonly minimum: 0;
            readonly default: 0;
        }];
        readonly response: "ObservationEventSchema";
        readonly response_media_type: "text/event-stream";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly streamProgress: {
        readonly method: "GET";
        readonly path: "/v1/runs/:run_id/progress/stream";
        readonly kind: "sse";
        readonly response: "ProgressEventSchema";
        readonly response_media_type: "text/event-stream";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["run:read"];
        };
    };
    readonly createPublicationSession: {
        readonly method: "POST";
        readonly path: "/v1/publication-sessions";
        readonly kind: "json";
        readonly request: "PublicationSessionRequestSchema";
        readonly response: "PublicationSessionSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly stagePublicationBlob: {
        readonly method: "POST";
        readonly path: "/v1/publication-sessions/:session_id/blobs";
        readonly kind: "json";
        readonly request: "PublicationBlobFrameSchema";
        readonly response: "PublicationBlobAckSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly publicationBlobUploadStatus: {
        readonly method: "GET";
        readonly path: "/v1/publication-sessions/:session_id/blobs/:content_ref";
        readonly kind: "json";
        readonly response: "PublicationBlobUploadStatusSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly stagePublicationBlobChunk: {
        readonly method: "POST";
        readonly path: "/v1/publication-sessions/:session_id/blobs/:content_ref/chunks";
        readonly kind: "bundle";
        readonly request_media_type: "application/octet-stream";
        readonly response: "PublicationBlobUploadStatusSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly finishPublicationBlobUpload: {
        readonly method: "POST";
        readonly path: "/v1/publication-sessions/:session_id/blobs/:content_ref/commits";
        readonly kind: "json";
        readonly response: "PublicationBlobUploadFinishSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly commitPublication: {
        readonly method: "POST";
        readonly path: "/v1/publication-sessions/:session_id/commits";
        readonly kind: "json";
        readonly request: "PublicationCommitRequestSchema";
        readonly response: "PublicationReceiptSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:create"];
        };
    };
    readonly getPublication: {
        readonly method: "GET";
        readonly path: "/v1/publications/:publication_ref";
        readonly kind: "json";
        readonly response: "PublicationViewSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:read"];
        };
    };
    readonly getDeclaration: {
        readonly method: "GET";
        readonly path: "/v1/declarations/:content_ref";
        readonly kind: "json";
        readonly response: "DeclarationViewSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["publication:read"];
        };
    };
    readonly setRegistryAlias: {
        readonly method: "POST";
        readonly path: "/v1/registry/aliases";
        readonly kind: "json";
        readonly request: "AliasMutationRequestSchema";
        readonly response: "AliasMutationResultSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["registry:alias"];
        };
    };
    readonly deprecateRef: {
        readonly method: "POST";
        readonly path: "/v1/registry/deprecations";
        readonly kind: "json";
        readonly request: "DeprecationRequestSchema";
        readonly response: "RegistryActOutcomeSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["registry:deprecate"];
        };
    };
    readonly quarantineRef: {
        readonly method: "POST";
        readonly path: "/v1/registry/quarantines";
        readonly kind: "json";
        readonly request: "QuarantineRequestSchema";
        readonly response: "RegistryActOutcomeSchema";
        readonly area: "build-and-publish";
        readonly authorization: {
            readonly scopes: readonly ["registry:quarantine"];
        };
    };
    readonly setIntakeDrain: {
        readonly method: "POST";
        readonly path: "/v1/intake-drains";
        readonly kind: "json";
        readonly request: "DrainRequestSchema";
        readonly response: "DrainOutcomeSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["operator:drain"];
        };
    };
    readonly recordIdentityMigrationEvent: {
        readonly method: "POST";
        readonly path: "/v1/product-identity/migration-events";
        readonly kind: "json";
        readonly request: "IdentityMigrationEventRequestSchema";
        readonly response: "IdentityMigrationEventOutcomeSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["operator:governance"];
        };
    };
    readonly reconcileEffects: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/reconciliations";
        readonly kind: "json";
        readonly response: "ReconciliationOutcomeSchema";
        readonly area: "review-and-authority";
        readonly authorization: {
            readonly scopes: readonly ["operator:reconcile"];
        };
    };
    readonly operatorAudit: {
        readonly method: "GET";
        readonly path: "/v1/operator-audit";
        readonly kind: "json";
        readonly response: "OperatorAuditPageSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["operator:audit"];
        };
    };
    readonly reviewInbox: {
        readonly method: "GET";
        readonly path: "/v1/reviews/pending";
        readonly kind: "json";
        readonly response: "ReviewInboxSchema";
        readonly area: "review-and-authority";
        readonly authorization: {
            readonly scopes: readonly ["review:read"];
        };
    };
    readonly admitModelAdapter: {
        readonly method: "POST";
        readonly path: "/v1/model-adapters";
        readonly kind: "json";
        readonly request: "AdmitModelAdapterRequestSchema";
        readonly response: "AdmittedModelAdapterSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["platform:adapter-admit"];
        };
    };
    readonly createExternalCredentialBinding: {
        readonly method: "POST";
        readonly path: "/v1/credential-bindings";
        readonly kind: "json";
        readonly request: "CreateExternalCredentialBindingRequestSchema";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:write"];
        };
    };
    readonly protectedCredentialIngest: {
        readonly method: "POST";
        readonly path: "/v1/credential-bindings/protected-ingest";
        readonly kind: "json";
        readonly request: "ProtectedCredentialIngestRequestSchema";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:write"];
        };
    };
    readonly inspectCredentialBinding: {
        readonly method: "GET";
        readonly path: "/v1/credential-bindings/:binding_ref";
        readonly kind: "json";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:read"];
        };
    };
    readonly rotateExternalCredential: {
        readonly method: "POST";
        readonly path: "/v1/credential-bindings/:binding_ref/rotations";
        readonly kind: "json";
        readonly request: "RotateExternalCredentialRequestSchema";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:rotate"];
        };
    };
    readonly rotateProtectedCredential: {
        readonly method: "POST";
        readonly path: "/v1/credential-bindings/:binding_ref/protected-rotations";
        readonly kind: "json";
        readonly request: "RotateProtectedCredentialRequestSchema";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:rotate"];
        };
    };
    readonly revokeCredentialBinding: {
        readonly method: "POST";
        readonly path: "/v1/credential-bindings/:binding_ref/revocations";
        readonly kind: "json";
        readonly request: "RevokeCredentialRequestSchema";
        readonly response: "CredentialBindingSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["credential:revoke"];
        };
    };
    readonly createProviderInstance: {
        readonly method: "POST";
        readonly path: "/v1/provider-instances";
        readonly kind: "json";
        readonly request: "CreateProviderInstanceRequestSchema";
        readonly response: "ProviderInstanceSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly listProviderInstances: {
        readonly method: "GET";
        readonly path: "/v1/provider-instances";
        readonly kind: "json";
        readonly response: "ProviderInstanceListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:read"];
        };
    };
    readonly syncProviderCatalogue: {
        readonly method: "POST";
        readonly path: "/v1/provider-instances/:instance_ref/catalogue-syncs";
        readonly kind: "json";
        readonly request: "SyncProviderCatalogueRequestSchema";
        readonly response: "ProviderCatalogueSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly providerCatalogue: {
        readonly method: "GET";
        readonly path: "/v1/provider-instances/:instance_ref/catalogue";
        readonly kind: "json";
        readonly response: "ProviderCatalogueSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:read"];
        };
    };
    readonly enableProviderModel: {
        readonly method: "POST";
        readonly path: "/v1/provider-instances/:instance_ref/model-enablement";
        readonly kind: "json";
        readonly request: "EnableProviderModelRequestSchema";
        readonly response: "ProviderModelEntrySchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly modelPool: {
        readonly method: "GET";
        readonly path: "/v1/model-pool";
        readonly kind: "json";
        readonly response: "TenantModelPoolSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:read"];
        };
    };
    readonly setModelAlias: {
        readonly method: "POST";
        readonly path: "/v1/model-pool/aliases";
        readonly kind: "json";
        readonly request: "SetModelAliasRequestSchema";
        readonly response: "TenantModelPoolSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly declareFallbackSet: {
        readonly method: "POST";
        readonly path: "/v1/model-pool/fallback-sets";
        readonly kind: "json";
        readonly request: "DeclareFallbackSetRequestSchema";
        readonly response: "TenantModelPoolSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly setDefaultModelAlias: {
        readonly method: "POST";
        readonly path: "/v1/model-pool/default-alias";
        readonly kind: "json";
        readonly request: "SetDefaultModelAliasRequestSchema";
        readonly response: "TenantModelPoolSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["provider:write"];
        };
    };
    readonly registerToolSource: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources";
        readonly kind: "json";
        readonly request: "RegisterToolSourceRequestSchema";
        readonly response: "ToolSourceSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:write"];
        };
    };
    readonly listToolSources: {
        readonly method: "GET";
        readonly path: "/v1/tool-sources";
        readonly kind: "json";
        readonly response: "ToolSourceListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:read"];
        };
    };
    readonly inspectToolSource: {
        readonly method: "GET";
        readonly path: "/v1/tool-sources/:source_ref";
        readonly kind: "json";
        readonly response: "ToolSourceSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:read"];
        };
    };
    readonly testToolSource: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources/:source_ref/tests";
        readonly kind: "json";
        readonly response: "ToolSourceTestResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:test"];
        };
    };
    readonly syncToolSourceCatalogue: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources/:source_ref/catalogue-syncs";
        readonly kind: "json";
        readonly request: "SyncToolSourceCatalogueRequestSchema";
        readonly response: "ToolSourceCatalogueSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:write"];
        };
    };
    readonly toolSourceCatalogue: {
        readonly method: "GET";
        readonly path: "/v1/tool-sources/:source_ref/catalogue";
        readonly kind: "json";
        readonly response: "ToolSourceCatalogueSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:read"];
        };
    };
    readonly enableToolSourceTools: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources/:source_ref/tool-enablement";
        readonly kind: "json";
        readonly request: "EnableToolSourceToolsRequestSchema";
        readonly response: "ToolSourceEnablementSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:write"];
        };
    };
    readonly disableToolSource: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources/:source_ref/disablement";
        readonly kind: "json";
        readonly request: "ToolSourceStateRequestSchema";
        readonly response: "ToolSourceEnablementSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:write"];
        };
    };
    readonly removeToolSource: {
        readonly method: "POST";
        readonly path: "/v1/tool-sources/:source_ref/removal";
        readonly kind: "json";
        readonly request: "ToolSourceStateRequestSchema";
        readonly response: "ToolSourceEnablementSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["tool-source:write"];
        };
    };
    readonly registerSource: {
        readonly method: "POST";
        readonly path: "/v1/sources";
        readonly kind: "json";
        readonly request: "RegisterSourceRequestSchema";
        readonly response: "SourceInstanceSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:write"];
        };
    };
    readonly listSources: {
        readonly method: "GET";
        readonly path: "/v1/sources";
        readonly kind: "json";
        readonly response: "SourceListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:read"];
        };
    };
    readonly inspectSource: {
        readonly method: "GET";
        readonly path: "/v1/sources/:source_ref";
        readonly kind: "json";
        readonly response: "SourceInstanceSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:read"];
        };
    };
    readonly snapshotSource: {
        readonly method: "POST";
        readonly path: "/v1/sources/:source_ref/snapshots";
        readonly kind: "json";
        readonly response: "SourceSnapshotSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:write"];
        };
    };
    readonly listSourceSnapshotMembers: {
        readonly method: "GET";
        readonly path: "/v1/sources/:source_ref/snapshot-members";
        readonly kind: "json";
        readonly query_request: "SourceSnapshotPageRequestSchema";
        readonly query: readonly [{
            readonly name: "cursor";
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 512;
        }, {
            readonly name: "limit";
            readonly type: "integer";
            readonly minimum: 1;
            readonly maximum: 100;
            readonly default: 50;
        }];
        readonly response: "SourceSnapshotPageSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:read"];
        };
    };
    readonly preflightSource: {
        readonly method: "POST";
        readonly path: "/v1/sources/:source_ref/preflight";
        readonly kind: "json";
        readonly response: "SourcePreflightSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["source:read"];
        };
    };
    readonly registerEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments";
        readonly kind: "json";
        readonly request: "RegisterEnvironmentRequestSchema";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly environmentCapabilities: {
        readonly method: "GET";
        readonly path: "/v1/environment-capabilities";
        readonly kind: "json";
        readonly response: "EnvironmentDeploymentCapabilityListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly publishEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/publications";
        readonly kind: "json";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly enableEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/enablement";
        readonly kind: "json";
        readonly request: "EnvironmentProfileStateRequestSchema";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly drainEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/drain";
        readonly kind: "json";
        readonly request: "EnvironmentProfileStateRequestSchema";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly disableEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/disablement";
        readonly kind: "json";
        readonly request: "EnvironmentProfileStateRequestSchema";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly rotateEnvironmentCredentials: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/credential-rotations";
        readonly kind: "json";
        readonly request: "EnvironmentCredentialRotationRequestSchema";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:write"];
        };
    };
    readonly listEnvironments: {
        readonly method: "GET";
        readonly path: "/v1/environments";
        readonly kind: "json";
        readonly response: "EnvironmentProfileListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly inspectEnvironment: {
        readonly method: "GET";
        readonly path: "/v1/environments/:profile_ref";
        readonly kind: "json";
        readonly response: "EnvironmentProfileRegistrationSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly doctorEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/doctor";
        readonly kind: "json";
        readonly request: "EnvironmentDoctorRequestSchema";
        readonly response: "EnvironmentDoctorResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly conformEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environments/:profile_ref/conformance";
        readonly kind: "json";
        readonly request: "EnvironmentConformanceRequestSchema";
        readonly response: "EnvironmentConformanceResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:conformance"];
        };
    };
    readonly listEnvironmentJobs: {
        readonly method: "GET";
        readonly path: "/v1/environment-jobs";
        readonly kind: "json";
        readonly response: "EnvironmentJobListSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly observeEnvironmentJob: {
        readonly method: "GET";
        readonly path: "/v1/environment-jobs/:job_id";
        readonly kind: "json";
        readonly response: "ObserveEnvironmentJobResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly cancelEnvironmentJob: {
        readonly method: "POST";
        readonly path: "/v1/environment-job-cancellations";
        readonly kind: "json";
        readonly request: "EnvironmentJobActionRequestSchema";
        readonly response: "CancelEnvironmentJobResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:cancel"];
        };
    };
    readonly reconcileEnvironmentJob: {
        readonly method: "POST";
        readonly path: "/v1/environment-job-reconciliations";
        readonly kind: "json";
        readonly request: "EnvironmentJobRefRequestSchema";
        readonly response: "ReconcileEnvironmentJobResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:reconcile"];
        };
    };
    readonly teardownEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environment-teardowns";
        readonly kind: "json";
        readonly request: "EnvironmentJobActionRequestSchema";
        readonly response: "TeardownEnvironmentResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:teardown"];
        };
    };
    readonly abandonEnvironment: {
        readonly method: "POST";
        readonly path: "/v1/environment-abandonments";
        readonly kind: "json";
        readonly request: "EnvironmentAbandonJobRequestSchema";
        readonly response: "AbandonEnvironmentResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:abandon"];
        };
    };
    readonly sweepEnvironments: {
        readonly method: "POST";
        readonly path: "/v1/environment-sweeps";
        readonly kind: "json";
        readonly request: "EnvironmentSweepRequestSchema";
        readonly response: "EnvironmentSweepResultSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:reconcile", "environment:teardown"];
        };
    };
    readonly environmentMetrics: {
        readonly method: "GET";
        readonly path: "/v1/environment-metrics";
        readonly kind: "json";
        readonly response: "EnvironmentMetricsSchema";
        readonly area: "administration";
        readonly authorization: {
            readonly scopes: readonly ["environment:read"];
        };
    };
    readonly writeMemoryAssertion: {
        readonly method: "POST";
        readonly path: "/v1/memory/assertions";
        readonly kind: "json";
        readonly request: "MemoryAssertionInputSchema";
        readonly response: "MemoryWriteOutcomeSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["memory:write"];
        };
    };
    readonly supersedeMemoryAssertion: {
        readonly method: "POST";
        readonly path: "/v1/memory/assertions/:assertion_id/supersessions";
        readonly kind: "json";
        readonly request: "MemorySupersedeRequestSchema";
        readonly response: "MemorySupersedeOutcomeSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["memory:write"];
        };
    };
    readonly readMemoryHistory: {
        readonly method: "POST";
        readonly path: "/v1/memory/history-reads";
        readonly kind: "json";
        readonly request: "MemoryHistoryRequestSchema";
        readonly response: "MemoryHistoryResponseSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["memory:read"];
        };
    };
    readonly eraseMemorySubject: {
        readonly method: "POST";
        readonly path: "/v1/memory/subject-erasures";
        readonly kind: "json";
        readonly request: "MemorySubjectErasureRequestSchema";
        readonly response: "MemorySubjectErasureOutcomeSchema";
        readonly area: "results-and-audit";
        readonly authorization: {
            readonly scopes: readonly ["memory:erase"];
        };
    };
    readonly readRunMemory: {
        readonly method: "POST";
        readonly path: "/v1/runs/:run_id/memory-reads";
        readonly kind: "json";
        readonly request: "MemoryReadRequestSchema";
        readonly response: "RunMemoryReadOutcomeSchema";
        readonly area: "run";
        readonly authorization: {
            readonly scopes: readonly ["memory:read"];
        };
    };
};
export type RouteName = keyof typeof API_ROUTES;
/** The :named parameters a route's path carries, in order. */
export declare function routeParams(path: string): string[];
/** Substitute parameters into a route path. A missing parameter throws by name. */
export declare function routePath(name: RouteName, params?: Record<string, string>): string;
