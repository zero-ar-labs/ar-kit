/**
 * Signed environment adapter release contracts.
 *
 * A junior developer uses the body to describe one exact adapter package,
 * source revision, dependency inventory, runtime artifacts, and supported
 * hosts. Release tooling signs that body. Runtime admission verifies the
 * signature and compares it with the adapter descriptor before enablement.
 */
import { z } from 'zod';
import { EnvironmentAdapterDescriptorSchema } from "./environment.js";
import { ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
export const EnvironmentAdapterCompatibilitySchema = z.strictObject({
    contract: z.literal('environment-adapter/1'),
    node: z.string().min(1),
    operating_systems: z.array(z.string().min(1)).min(1),
    architectures: z.array(z.string().min(1)).min(1),
    provider_runtime: z.string().min(1).nullable(),
    provider_runtime_version: z.string().min(1).nullable(),
});
export const EnvironmentAdapterReleaseBodySchema = z.strictObject({
    format: z.literal('zero-ar-environment-adapter-release/1'),
    descriptor: EnvironmentAdapterDescriptorSchema,
    descriptor_ref: hash,
    source_revision: z.string().regex(/^[0-9a-f]{40,64}$/, 'expected an exact hexadecimal source revision'),
    package_integrity: z.string().regex(/^(sha256:[0-9a-f]{64}|sha512-[A-Za-z0-9+/]+={0,2})$/, 'expected sha256 content identity or npm sha512 integrity'),
    dependency_inventory_ref: hash,
    runtime_artifact_refs: z.array(hash).min(1),
    workload_artifact_refs: z.array(hash),
    compatibility: EnvironmentAdapterCompatibilitySchema,
    signing_key_ref: hash,
});
export const EnvironmentAdapterReleaseManifestSchema = EnvironmentAdapterReleaseBodySchema.extend({
    signature_algorithm: z.enum(ENVIRONMENT_RELEASE_SIGNATURE_ALGORITHMS),
    signature: z.string().regex(/^[A-Za-z0-9+/]+={0,2}$/, 'expected a base64 release signature'),
});
