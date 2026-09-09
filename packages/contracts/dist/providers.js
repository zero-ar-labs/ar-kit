/**
 * Provider control-plane contracts.
 *
 * What this is: admitted adapter metadata, tenant provider instances,
 * discovered catalogue entries, explicit enablement, and the exact model
 * selection the kernel pins. Credential bytes have no field here.
 *
 * How it fits: administrators configure and enable models through these
 * generated contracts. Only a run-owned adapter call consumes a selection;
 * no contract in this file is an inference request.
 */
import { z } from 'zod';
import { CREDENTIAL_BINDING_STATES, MODEL_CATALOGUE_SOURCES, MODEL_COMPATIBILITY_STATES, MODEL_CREDENTIAL_MODES, MODEL_PROTOCOL_ADAPTERS, MODEL_PROVIDERS, MODEL_PROVIDER_PROFILES, MODEL_USAGE_MEASUREMENTS, PROVIDER_CREDENTIAL_PURPOSES, PROVIDER_INSTANCE_STATES, PROVIDER_MODEL_STATES, } from "./vocab.js";
import { contentHash } from "./ids.js";
const ref = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const name = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/, 'expected lowercase dot-separated naming');
const version = z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semantic versioning');
const secretRef = z.string().regex(/^secret:\/\/[A-Za-z0-9._/-]+$/, 'expected a secret:// reference, never credential bytes');
const externalSecretRef = z.string().regex(/^[a-z][a-z0-9+.-]*:\/\/[A-Za-z0-9._~:?#\[\]@!$&'()*+,;=%\/-]+$/, 'expected an approved external secret reference');
const secretMaterial = z.string().min(1).max(65_536);
const adapterAdmissionShape = {
    provider: z.enum(MODEL_PROVIDERS),
    protocol_adapter: z.enum(MODEL_PROTOCOL_ADAPTERS),
    protocol_version: version,
    name,
    version,
    provenance_ref: ref,
    conformance_ref: ref,
};
function checkAdapterProtocol(adapter, ctx) {
    const expected = adapter.provider === 'scripted'
        ? 'scripted'
        : adapter.provider === 'anthropic'
            ? 'anthropic-messages'
            : 'openai-chat-completions';
    if (adapter.protocol_adapter !== expected) {
        ctx.addIssue({ code: 'custom', path: ['protocol_adapter'], message: `${adapter.provider} requires the ${expected} protocol adapter.` });
    }
}
const ModelAdapterIdentitySchema = z.strictObject(adapterAdmissionShape).superRefine(checkAdapterProtocol);
export const AdmitModelAdapterRequestSchema = z.strictObject({
    ...adapterAdmissionShape,
    signature: z.string().regex(/^[0-9a-f]{64}$/, 'expected a lowercase sha256 admission signature'),
}).superRefine(checkAdapterProtocol);
/** Exact signed adapter body, shared by the platform signer and admission verifier. */
export function modelAdapterIdentity(request) {
    const { signature: _signature, ...identity } = request;
    return ModelAdapterIdentitySchema.parse(identity);
}
export function modelAdapterRef(request) {
    return contentHash(modelAdapterIdentity(request));
}
export const AdmittedModelAdapterSchema = z.strictObject({
    ...adapterAdmissionShape,
    adapter_ref: ref,
    signature_ref: ref,
    admitted_by: z.string().min(1).max(256),
}).superRefine(checkAdapterProtocol);
export const CredentialBindingSchema = z.strictObject({
    binding_ref: secretRef,
    name,
    tenant: z.string().min(1).max(256),
    owner: z.string().min(1).max(256),
    purpose: z.enum(PROVIDER_CREDENTIAL_PURPOSES),
    status: z.enum(CREDENTIAL_BINDING_STATES),
    epoch: z.number().int().min(1),
});
export const CreateExternalCredentialBindingRequestSchema = z.strictObject({
    name,
    purpose: z.enum(PROVIDER_CREDENTIAL_PURPOSES),
    external_ref: externalSecretRef,
});
/** The only public JSON shape that may carry provider secret bytes. */
export const ProtectedCredentialIngestRequestSchema = z.strictObject({
    name,
    purpose: z.enum(PROVIDER_CREDENTIAL_PURPOSES),
    secret: secretMaterial,
});
export const RotateExternalCredentialRequestSchema = z.strictObject({ external_ref: externalSecretRef });
/** Rotation counterpart to protected ingest. The secret is never returned. */
export const RotateProtectedCredentialRequestSchema = z.strictObject({ secret: secretMaterial });
export const RevokeCredentialRequestSchema = z.strictObject({ reason: z.string().min(1).max(500) });
/** Exact compatible behavior one tenant admits for a configured endpoint. */
export const ProviderCompatibilitySchema = z.strictObject({
    streaming: z.enum(MODEL_COMPATIBILITY_STATES),
    tools: z.enum(MODEL_COMPATIBILITY_STATES),
    cancellation: z.enum(MODEL_COMPATIBILITY_STATES),
    context_limits: z.enum(MODEL_COMPATIBILITY_STATES),
    usage: z.enum(MODEL_USAGE_MEASUREMENTS).exclude(['estimated']),
    upstream_attestation_ref: ref.nullable(),
    notes: z.array(z.string().min(1).max(500)).max(16),
});
/** Content identity for the admitted compatibility statement. */
export function modelCompatibilityRef(compatibility) {
    return contentHash(ProviderCompatibilitySchema.parse(compatibility));
}
/** The wire adapter one provider profile is allowed to use. */
export function providerProfileProtocol(profile) {
    if (profile === 'scripted')
        return 'scripted';
    if (profile === 'anthropic')
        return 'anthropic-messages';
    return 'openai-chat-completions';
}
/** The provider family a profile belongs to without collapsing profile identity. */
export function providerProfileFamily(profile) {
    if (profile === 'generic-openai-compatible' || profile === 'litellm' || profile === 'ollama')
        return 'openai-compatible';
    return profile;
}
/** Conservative compatibility defaults for each tested profile. */
export function providerProfileCompatibility(profile) {
    const full = {
        streaming: 'supported',
        tools: 'supported',
        cancellation: 'supported',
        context_limits: 'supported',
        usage: 'reported',
        upstream_attestation_ref: null,
        notes: [],
    };
    if (profile === 'generic-openai-compatible') {
        return {
            streaming: 'unknown',
            tools: 'unknown',
            cancellation: 'unknown',
            context_limits: 'unknown',
            usage: 'absent',
            upstream_attestation_ref: null,
            notes: ['No compatible behavior is inferred from an endpoint URL or model name.'],
        };
    }
    if (profile === 'litellm') {
        return {
            ...full,
            usage: 'untrusted',
            notes: ['The configured LiteLLM upstream is opaque without a separate admitted attestation.'],
        };
    }
    if (profile === 'ollama') {
        return {
            ...full,
            usage: 'untrusted',
            notes: ['The tested Ollama profile uses explicit no-auth mode.'],
        };
    }
    return full;
}
export const CreateProviderInstanceRequestSchema = z.strictObject({
    name,
    adapter_ref: ref,
    protocol_adapter: z.enum(MODEL_PROTOCOL_ADAPTERS),
    protocol_version: version,
    profile: z.enum(MODEL_PROVIDER_PROFILES),
    profile_version: version,
    endpoint: z.string().url().max(2_048),
    destination: z.string().url().max(2_048),
    endpoint_policy_ref: ref,
    catalogue_source: z.enum(MODEL_CATALOGUE_SOURCES),
    compatibility: ProviderCompatibilitySchema,
    credential_mode: z.enum(MODEL_CREDENTIAL_MODES),
    credential_binding_ref: secretRef.nullable(),
}).superRefine((instance, ctx) => {
    if (!URL.canParse(instance.endpoint) || !URL.canParse(instance.destination))
        return;
    const endpoint = new URL(instance.endpoint);
    const destination = new URL(instance.destination);
    const expectedProtocol = providerProfileProtocol(instance.profile);
    if (!['http:', 'https:'].includes(endpoint.protocol)) {
        ctx.addIssue({ code: 'custom', path: ['endpoint'], message: 'the provider endpoint must use HTTP or HTTPS.' });
    }
    if (!['http:', 'https:'].includes(destination.protocol)) {
        ctx.addIssue({ code: 'custom', path: ['destination'], message: 'the provider destination must use HTTP or HTTPS.' });
    }
    if (instance.protocol_adapter !== expectedProtocol) {
        ctx.addIssue({ code: 'custom', path: ['protocol_adapter'], message: `${instance.profile} requires the ${expectedProtocol} protocol adapter.` });
    }
    if (destination.pathname !== '/' || destination.search || destination.hash || destination.username || destination.password) {
        ctx.addIssue({ code: 'custom', path: ['destination'], message: 'the destination must be an origin with no path, credential, query, or fragment.' });
    }
    if (endpoint.origin !== destination.origin) {
        ctx.addIssue({ code: 'custom', path: ['destination'], message: 'the destination origin must match the endpoint origin.' });
    }
    if (instance.credential_mode === 'binding' && !instance.credential_binding_ref) {
        ctx.addIssue({ code: 'custom', path: ['credential_binding_ref'], message: 'credential mode binding requires one secret:// reference.' });
    }
    if (instance.credential_mode === 'none' && instance.credential_binding_ref !== null) {
        ctx.addIssue({ code: 'custom', path: ['credential_binding_ref'], message: 'credential mode none requires a null credential binding reference.' });
    }
    if (instance.profile === 'ollama' && instance.credential_mode !== 'none') {
        ctx.addIssue({ code: 'custom', path: ['credential_mode'], message: 'the ollama profile declares explicit no-auth mode.' });
    }
});
/** Build the explicit profile fields used by the SDK, CLI examples, and tests. */
export function providerInstanceProfile(profile, endpoint, credential, options = {}) {
    const complete = CreateProviderInstanceRequestSchema.parse({
        name: 'profile.defaults',
        adapter_ref: `sha256:${'0'.repeat(64)}`,
        endpoint_policy_ref: `sha256:${'0'.repeat(64)}`,
        protocol_adapter: providerProfileProtocol(profile),
        protocol_version: options.protocol_version ?? '1.0.0',
        profile,
        profile_version: options.profile_version ?? '1.0.0',
        endpoint,
        destination: new URL(endpoint).origin,
        catalogue_source: options.catalogue_source ?? 'declared',
        compatibility: options.compatibility ?? providerProfileCompatibility(profile),
        credential_mode: credential.mode,
        credential_binding_ref: credential.mode === 'binding' ? credential.binding_ref : null,
    });
    const { name: _name, adapter_ref: _adapterRef, endpoint_policy_ref: _endpointPolicyRef, ...fields } = complete;
    return fields;
}
export const ProviderInstanceSchema = z.strictObject({
    name,
    adapter_ref: ref,
    protocol_adapter: z.enum(MODEL_PROTOCOL_ADAPTERS),
    protocol_version: version,
    profile: z.enum(MODEL_PROVIDER_PROFILES),
    profile_version: version,
    endpoint: z.string().url().max(2_048),
    destination: z.string().url().max(2_048),
    endpoint_policy_ref: ref,
    catalogue_source: z.enum(MODEL_CATALOGUE_SOURCES),
    compatibility: ProviderCompatibilitySchema,
    credential_mode: z.enum(MODEL_CREDENTIAL_MODES),
    credential_binding_ref: secretRef.nullable(),
    instance_ref: ref,
    provider: z.enum(MODEL_PROVIDERS),
    state: z.enum(PROVIDER_INSTANCE_STATES),
    compatibility_ref: ref,
    credential_epoch: z.number().int().min(1).nullable(),
});
export const ProviderInstanceListSchema = z.strictObject({ instances: z.array(ProviderInstanceSchema) });
export const DiscoveredProviderModelSchema = z.strictObject({
    provider_model_id: z.string().min(1).max(256),
    provider_model_revision: z.string().min(1).max(256),
    context_window: z.number().int().min(1),
    max_output_tokens: z.number().int().min(1),
    assurance_facts_ref: ref.nullable(),
});
export const SyncProviderCatalogueRequestSchema = z.strictObject({
    models: z.array(DiscoveredProviderModelSchema).max(10_000),
});
export const ProviderModelEntrySchema = DiscoveredProviderModelSchema.extend({
    catalogue_entry_ref: ref,
    instance_ref: ref,
    adapter_ref: ref,
    model_ref: z.string().min(1).max(512),
    state: z.enum(PROVIDER_MODEL_STATES),
});
export const ProviderCatalogueSchema = z.strictObject({
    instance_ref: ref,
    snapshot_ref: ref,
    entries: z.array(ProviderModelEntrySchema),
});
export const EnableProviderModelRequestSchema = z.strictObject({ catalogue_entry_ref: ref });
export const ModelSelectionSchema = z.strictObject({
    model_ref: z.string().min(1).max(512),
    provider_model_id: z.string().min(1).max(256),
    provider: z.enum(MODEL_PROVIDERS),
    protocol_adapter: z.enum(MODEL_PROTOCOL_ADAPTERS),
    protocol_version: version,
    profile: z.enum(MODEL_PROVIDER_PROFILES),
    profile_version: version,
    provider_instance_ref: ref,
    adapter_ref: ref,
    endpoint: z.string().url().max(2_048),
    destination: z.string().url().max(2_048),
    endpoint_policy_ref: ref,
    catalogue_source: z.enum(MODEL_CATALOGUE_SOURCES),
    compatibility: ProviderCompatibilitySchema,
    compatibility_ref: ref,
    credential_mode: z.enum(MODEL_CREDENTIAL_MODES),
    credential_binding_ref: secretRef.nullable(),
    catalogue_entry_ref: ref,
    provider_model_revision: z.string().min(1).max(256),
    assurance_facts_ref: ref.nullable(),
    credential_epoch: z.number().int().min(1).nullable(),
});
