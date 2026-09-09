/**
 * The versioned external-product repository template.
 *
 * Junior guide: this module writes application code, not runtime code. Both
 * reference products share the native Zero-AR boundary while keeping their
 * channel, language and projection files different. Dependency overrides let
 * conformance install one exact set of packed release artifacts.
 */
export const EXTERNAL_PRODUCT_SCAFFOLD_VERSION = '1.0.0';
export const EXTERNAL_PRODUCT_API_VERSION = 'v1';
export const EXTERNAL_PRODUCT_PACKAGE_VERSION = '0.1.0';
const FIXTURES = {
    'facilities-operations': {
        package_name: 'zero-ar-facilities-operations',
        display_name: 'Facilities operations',
        channel: 'text-and-voice',
        source_name: 'facilities-desk',
        verified: 'Work order verified',
        unresolved: 'Work order needs attention',
        objective: 'Assess the reported facilities condition and prepare the next accountable action.',
        projection_label: 'service_case',
    },
    'large-corpus-review': {
        package_name: 'zero-ar-large-corpus-review',
        display_name: 'Large corpus review',
        channel: 'web-artifact',
        source_name: 'corpus-review-portal',
        verified: 'Review finding verified',
        unresolved: 'Review finding needs evidence',
        objective: 'Review the committed corpus and return findings with stated evidence limits.',
        projection_label: 'review_matter',
    },
};
const ALLOWED_PACKAGES = ['@zero-ar/contracts', '@zero-ar/client', '@zero-ar/sdk'];
/** Render one complete external repository without touching the filesystem. */
export function externalProductTemplate(options) {
    const copy = FIXTURES[options.fixture];
    const packageSpecs = Object.fromEntries(ALLOWED_PACKAGES.map((name) => [name, packageSpec(name, options.package_specs?.[name])]));
    const files = [
        file('package.json', 'configuration', packageJson(copy, packageSpecs)),
        file('zero-ar.scaffold.json', 'configuration', scaffoldManifest(options, packageSpecs)),
        file('tsconfig.json', 'configuration', tsconfig()),
        file('.env.example', 'configuration', environmentExample(copy)),
        file('README.md', 'documentation', readme(copy)),
        file('domain/agent.yaml', 'domain', agentYaml(options.fixture)),
        file('domain/AGENT.md', 'domain', agentInstructions(copy)),
        file('domain/zero-ar.project.yaml', 'domain', projectYaml()),
        file('src/identity/customer-identity.ts', 'adapter', identityAdapter()),
        file('src/channels/channel.ts', 'adapter', channelBoundary()),
        file('src/channels/product-channel.ts', 'adapter', productChannel(options.fixture, copy)),
        file('src/zero-ar/compatibility.ts', 'boundary', compatibility()),
        file('src/zero-ar/client.ts', 'boundary', productClient()),
        file('src/zero-ar/artifacts.ts', 'boundary', artifacts()),
        file('src/zero-ar/events.ts', 'boundary', events()),
        file('src/zero-ar/publications.ts', 'boundary', publications()),
        file('src/zero-ar/projections.ts', 'projection', projections()),
        file('src/presentation/result.ts', 'presentation', presentation(copy)),
        file('src/product/projection.ts', 'projection', productProjection(copy)),
        file('src/retirement.ts', 'boundary', retirement()),
        file('tests/contract/native-boundary.test.ts', 'test', nativeBoundaryTest(copy)),
        file('tests/journeys/presentation.test.ts', 'test', presentationTest()),
    ];
    return { schema: 'zero-ar-external-product-template/v1', scaffold_version: EXTERNAL_PRODUCT_SCAFFOLD_VERSION, fixture: options.fixture, files };
}
function packageSpec(name, candidate) {
    if (!candidate)
        return EXTERNAL_PRODUCT_PACKAGE_VERSION;
    if (/^\d+\.\d+\.\d+$/.test(candidate) || /^file:[^\0]+\.tgz$/.test(candidate))
        return candidate;
    throw new Error(`${name} uses ${candidate}. Pin one exact version or one packed .tgz artifact.`);
}
function file(path, role, content) {
    return { path, role, content: content.endsWith('\n') ? content : `${content}\n` };
}
function packageJson(copy, dependencies) {
    return JSON.stringify({
        name: copy.package_name,
        version: '0.1.0',
        private: true,
        type: 'module',
        description: `${copy.display_name} reference product over the public Zero-AR API.`,
        engines: { node: '>=23.6' },
        scripts: {
            test: 'node --disable-warning=ExperimentalWarning --test tests/contract/*.test.ts tests/journeys/*.test.ts',
        },
        dependencies,
    }, null, 2);
}
function scaffoldManifest(options, packageSpecs) {
    return JSON.stringify({
        schema: 'zero-ar-external-product-scaffold/v1',
        scaffold_version: EXTERNAL_PRODUCT_SCAFFOLD_VERSION,
        fixture: options.fixture,
        compatibility: {
            native_api: EXTERNAL_PRODUCT_API_VERSION,
            openapi: {
                export: '@zero-ar/client/openapi',
                contract_version: EXTERNAL_PRODUCT_API_VERSION,
                package_version: EXTERNAL_PRODUCT_PACKAGE_VERSION,
            },
            packages: Object.fromEntries(Object.entries(packageSpecs).map(([name]) => [name, EXTERNAL_PRODUCT_PACKAGE_VERSION])),
        },
        release: {
            source_commit: options.source_commit ?? null,
            manifest_ref: options.release_manifest_ref ?? null,
        },
    }, null, 2);
}
function tsconfig() {
    return JSON.stringify({
        compilerOptions: {
            target: 'ES2024',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            strict: true,
            noEmit: true,
            allowImportingTsExtensions: true,
            skipLibCheck: true,
        },
        include: ['src/**/*.ts', 'tests/**/*.ts'],
    }, null, 2);
}
function environmentExample(copy) {
    return [
        '# References name deployment bindings. Put secret values in the deployment secret store.',
        'ZERO_AR_URL=http://127.0.0.1:4319',
        `ZERO_AR_APPLICATION_BINDING=${copy.source_name}-application`,
        `PRODUCT_IDENTITY_BINDING=${copy.source_name}-identity`,
        `PRODUCT_CHANNEL_BINDING=${copy.source_name}-channel`,
        '',
    ].join('\n');
}
function readme(copy) {
    return [
        `# ${copy.display_name}`,
        '',
        'This repository is an external product over the versioned Zero-AR native API.',
        'It owns product authentication, channel credentials, language and disposable read models.',
        'Zero-AR owns provider credentials, tool credentials, effect authority, evidence and run history.',
        '',
        'Run `npm install`, then `npm test`. Configure the references in `.env.example` through the deployment system.',
        'Do not add provider keys, tool keys, owner-receipt keys or effect grants to this repository.',
        '',
    ].join('\n');
}
function agentYaml(fixture) {
    return [
        'apiVersion: zero-ar/v1',
        'kind: Agent',
        'metadata:',
        `  name: reference.${fixture}`,
        '  version: 1.0.0',
        'spec:',
        '  instructions: ./AGENT.md',
        '  model: project-default',
        '',
    ].join('\n');
}
function agentInstructions(copy) {
    return [
        copy.objective,
        'Use only admitted tools and committed artifacts. State evidence gaps plainly.',
        'Propose completion only after the requested work is present.',
        '',
    ].join('\n');
}
function projectYaml() {
    return [
        'apiVersion: zero-ar/v1',
        'kind: Project',
        'metadata:',
        '  product: zero-ar',
        'defaults:',
        '  agent: reference',
        '',
    ].join('\n');
}
function identityAdapter() {
    return `/**
 * Customer identity enters through this replaceable product adapter.
 *
 * Junior guide: the application identity authenticates the backend to
 * Zero-AR. A represented person is a separate signed credential. Display
 * names and caller-supplied principal strings never become authority.
 */

export interface RepresentedActorSession {
  principal: string;
  participant_token: string;
}

export interface AuthenticatedProductSession {
  product_session_id: string;
  application_principal: string;
  accountable_principal: string;
  represented_actor: RepresentedActorSession | null;
}

export interface CustomerIdentityAdapter<Request> {
  authenticate(request: Request): Promise<AuthenticatedProductSession>;
}
`;
}
function channelBoundary() {
    return `/**
 * Product channels normalize transport-specific input at one boundary.
 *
 * Junior guide: voice, text and upload gateways may be replaced without
 * changing the native client. The normalized value contains references and
 * content, never provider or tool credential bytes.
 */

export interface ProductChannelInput {
  event_id: string;
  participant_text: string;
  artifact_refs: Array<{ artifact_ref: string; content_hash: string }>;
}

export interface NormalizedProductCommand {
  source_name: string;
  source_channel: string;
  event_id: string;
  objective: string;
  artifacts: Array<{ artifact_ref: string; content_hash: string }>;
}

export interface ProductChannelAdapter<Input extends ProductChannelInput = ProductChannelInput> {
  normalize(input: Input): NormalizedProductCommand;
}
`;
}
function productChannel(fixture, copy) {
    const body = fixture === 'facilities-operations'
        ? `const location = input.participant_text.trim();
    if (!location) throw new Error('the facilities report is empty. Supply the observed condition and location.');
    return {
      source_name: '${copy.source_name}',
      source_channel: 'voice-or-text',
      event_id: input.event_id,
      objective: 'Assess this facilities report and prepare an accountable work order: ' + location,
      artifacts: input.artifact_refs,
    };`
        : `if (input.artifact_refs.length === 0) throw new Error('the corpus review has no committed artifact. Upload and commit the corpus first.');
    return {
      source_name: '${copy.source_name}',
      source_channel: 'web-artifact',
      event_id: input.event_id,
      objective: 'Review the committed corpus for this question: ' + input.participant_text.trim(),
      artifacts: input.artifact_refs,
    };`;
    return `/**
 * The ${copy.display_name.toLowerCase()} channel adapter.
 *
 * Junior guide: this is product-specific code. It translates channel input
 * into the shared command shape and may change without editing Zero-AR or the
 * shared product client.
 */

import type { ProductChannelAdapter, ProductChannelInput, NormalizedProductCommand } from './channel.ts';

export class ProductChannel implements ProductChannelAdapter {
  normalize(input: ProductChannelInput): NormalizedProductCommand {
    ${body}
  }
}
`;
}
function compatibility() {
    return `/**
 * The scaffold compatibility check runs before product work is admitted.
 *
 * Junior guide: package installation pins code, while this check pins the
 * remote contract. A different API version or unready runtime produces one
 * diagnostic before a run can be created.
 */

import type { HealthResponse } from '@zero-ar/contracts';

export const SUPPORTED_ZERO_AR_API = 'v1';
export const SUPPORTED_ZERO_AR_PACKAGES = '0.1.0';

export function assertCompatibleRuntime(health: HealthResponse): void {
  if (health.product !== 'zero-ar') {
    throw new Error('the configured endpoint is not Zero-AR. Point ZERO_AR_URL at a Zero-AR native API.');
  }
  if (health.contract_version !== SUPPORTED_ZERO_AR_API) {
    throw new Error('the server contract is ' + health.contract_version + ', but this scaffold supports ' + SUPPORTED_ZERO_AR_API + '. Run scaffold conformance against the new release before accepting product work.');
  }
  if (health.readiness !== 'ready') {
    throw new Error('the Zero-AR runtime is unready. Restore the required components before accepting product work.');
  }
}
`;
}
function productClient() {
    return `/**
 * The product backend boundary over the generated Zero-AR client.
 *
 * Junior guide: one submit call creates durable work and returns its id while
 * execution continues in Zero-AR. Application and represented-human identity
 * remain separate, and every retry carries a caller-owned idempotency key.
 */

import { ZeroARClient } from '@zero-ar/client';
import type { EffectApprovalRequest, ExternalObservationRequest, IntakeRequest, RunResult, WorkQueryPage, WorkQueryRequest } from '@zero-ar/contracts';
import type { AuthenticatedProductSession } from '../identity/customer-identity.ts';
import type { NormalizedProductCommand } from '../channels/channel.ts';
import { assertCompatibleRuntime } from './compatibility.ts';

export type NativeProductPort = Pick<ZeroARClient,
  'health' | 'createDeferredRun' | 'listRuns' | 'recordExternalObservation' |
  'control' | 'decideEffect' | 'result' | 'setIntakeDrain'
>;

export interface ApplicationCredentialSource {
  server_url: string;
  application_principal: string;
  authorizationHeader(): Promise<string>;
}

export async function openProductClient(binding: ApplicationCredentialSource): Promise<ZeroARClient> {
  const authorization = await binding.authorizationHeader();
  if (!authorization.startsWith('Bearer ') || authorization.length <= 'Bearer '.length) {
    throw new Error('the application binding returned no bearer credential. Restore or rotate that deployment binding.');
  }
  return new ZeroARClient(binding.server_url, { headers: { authorization } });
}

export interface SubmitWorkOptions {
  idempotency_key: string;
  correlation_id: string;
  agent_ref?: string;
  task_contract_ref?: string;
  model_tokens?: number;
  max_turns?: number;
}

export class ExternalProductBackend {
  readonly native: NativeProductPort;
  constructor(native: NativeProductPort) {
    this.native = native;
  }

  async submit(session: AuthenticatedProductSession, command: NormalizedProductCommand, options: SubmitWorkOptions): Promise<{ work_id: string; created: boolean; event_cursor: number }> {
    assertApplication(session, command);
    assertCompatibleRuntime(await this.native.health());
    const request: IntakeRequest = {
      objective: command.objective,
      ...(options.agent_ref ? { agent_ref: options.agent_ref } : {}),
      principals: {
        executing: session.application_principal,
        originating: command.source_name,
        accountable: session.accountable_principal,
      },
      budgets: {
        consumption: { model_tokens: options.model_tokens ?? 100_000 },
        attention: 2,
        verification_reserve_fraction: 0.2,
        max_turns: options.max_turns ?? 20,
      },
      ...(options.task_contract_ref ? { task_contract_ref: options.task_contract_ref } : {}),
      ...(command.artifacts.length > 0 ? { inputs: { artifacts: command.artifacts } } : {}),
      idempotency_key: options.idempotency_key,
      correlation_id: options.correlation_id,
    };
    const created = await this.native.createDeferredRun(request);
    return { work_id: created.run_id, created: created.created, event_cursor: 0 };
  }

  query(query: WorkQueryRequest = {}): Promise<WorkQueryPage> {
    return this.native.listRuns(query);
  }

  observe(session: AuthenticatedProductSession, run_id: string, request: ExternalObservationRequest) {
    return this.native.recordExternalObservation(run_id, request, session.represented_actor?.participant_token);
  }

  answerReview(run_id: string, input: { control_id: string; item_id: string; text?: string; reason?: string }) {
    return this.native.control(run_id, {
      verb: 'answer',
      control_id: input.control_id,
      handle: input.item_id,
      ...(input.text ? { text: input.text } : {}),
      ...(input.reason ? { reason: input.reason } : {}),
    });
  }

  decideExactEffect(session: AuthenticatedProductSession, run_id: string, effect_id: string, decision: EffectApprovalRequest) {
    const token = session.represented_actor?.participant_token;
    if (!token) throw new Error('this effect decision has no represented participant credential. Re-authenticate the deciding person.');
    return this.native.decideEffect(run_id, effect_id, decision, token);
  }

  cancel(run_id: string, control_id: string, reason: string) {
    return this.native.control(run_id, { verb: 'cancel', control_id, reason });
  }

  result(run_id: string): Promise<RunResult> {
    return this.native.result(run_id);
  }
}

function assertApplication(session: AuthenticatedProductSession, command: NormalizedProductCommand): void {
  if (!session.application_principal.startsWith('application:')) {
    throw new Error('the authenticated session has no application principal. Fix the customer identity adapter before creating work.');
  }
  const credentialField = findCredentialField(command);
  if (credentialField) throw new Error('the product command carries the credential-shaped field ' + credentialField + '. Send only content and committed artifact references.');
}

function findCredentialField(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    if (/api[_-]?key|authorization|bearer|private[_-]?key|owner[_-]?receipt/i.test(key)) return key;
    const nested = findCredentialField(child);
    if (nested) return nested;
  }
  return null;
}
`;
}
function artifacts() {
    return `/**
 * Runtime artifact upload keeps evidence bytes on the native ingest path.
 *
 * Junior guide: bytes are hashed before the session opens, transferred in
 * bounded chunks and committed before their reference enters work. Publication
 * upload is a different boundary and is not reused here.
 */

import { createHash } from 'node:crypto';
import type { ZeroARClient } from '@zero-ar/client';
import type { RuntimeArtifactCommittedSession } from '@zero-ar/contracts';

export type ArtifactProductPort = Pick<ZeroARClient, 'createRuntimeArtifactSession' | 'stageRuntimeArtifactChunk' | 'commitRuntimeArtifact'>;

export async function uploadRunEvidence(port: ArtifactProductPort, input: {
  run_id: string;
  idempotency_key: string;
  bytes: Uint8Array;
  media_type: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  source: string;
}): Promise<RuntimeArtifactCommittedSession> {
  const hash = 'sha256:' + createHash('sha256').update(input.bytes).digest('hex');
  const opened = await port.createRuntimeArtifactSession({
    idempotency_key: input.idempotency_key,
    expected_content_hash: hash,
    expected_bytes: input.bytes.byteLength,
    media_type: input.media_type,
    classification: input.classification,
    evidence_grade: 'original',
    provenance: { source: input.source },
    intended_use: { kind: 'run', run_id: input.run_id },
  });
  if (opened.status === 'committed') return opened;
  let offset = opened.offset;
  while (offset < input.bytes.byteLength) {
    const end = Math.min(offset + 256 * 1024, input.bytes.byteLength);
    const next = await port.stageRuntimeArtifactChunk(opened.session_id, offset, input.bytes.subarray(offset, end));
    offset = next.offset;
  }
  return port.commitRuntimeArtifact(opened.session_id);
}
`;
}
function events() {
    return `/**
 * Durable event cursors survive backend restarts and channel disconnects.
 *
 * Junior guide: the checkpoint is only a delivery position. Zero-AR remains
 * the source of record. Saving each observed sequence lets a new process ask
 * for events strictly after the last applied one.
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { ZeroARClient } from '@zero-ar/client';
import type { ObservationEvent } from '@zero-ar/contracts';

export interface CursorCheckpointStore {
  read(run_id: string): Promise<number>;
  write(run_id: string, after: number): Promise<void>;
}

export class FileCursorCheckpointStore implements CursorCheckpointStore {
  readonly directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }
  async read(run_id: string): Promise<number> {
    try {
      const parsed = JSON.parse(await readFile(this.path(run_id), 'utf8')) as { after?: unknown };
      return Number.isSafeInteger(parsed.after) && Number(parsed.after) >= 0 ? Number(parsed.after) : 0;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return 0;
      throw error;
    }
  }
  async write(run_id: string, after: number): Promise<void> {
    if (!Number.isSafeInteger(after) || after < 0) throw new Error('the product event cursor must be a non-negative integer.');
    const path = this.path(run_id);
    await mkdir(dirname(path), { recursive: true });
    const temporary = path + '.' + process.pid + '.tmp';
    await writeFile(temporary, JSON.stringify({ run_id, after }) + '\\n', { mode: 0o600 });
    await rename(temporary, path);
  }
  private path(run_id: string): string {
    if (!/^run_[0-9a-f]{32}$/.test(run_id)) throw new Error('the cursor key is not a Zero-AR run id.');
    return join(this.directory, run_id + '.json');
  }
}

export async function followProductEvents(
  client: Pick<ZeroARClient, 'streamRecords'>,
  checkpoint: CursorCheckpointStore,
  run_id: string,
  apply: (event: ObservationEvent) => void,
  signal: AbortSignal,
): Promise<number> {
  let cursor = await checkpoint.read(run_id);
  let writes = Promise.resolve();
  await client.streamRecords(run_id, cursor, (event) => {
    apply(event);
    cursor = event.seq;
    writes = writes.then(() => checkpoint.write(run_id, cursor));
  }, signal);
  await writes;
  return cursor;
}
`;
}
function publications() {
    return `/**
 * Domain publication uses the public SDK and native publication session.
 *
 * Junior guide: compilation produces a content-addressed bundle and blobs.
 * The backend uploads only missing blobs, then commits the session. No registry
 * table or private runtime package is available to this repository.
 */

import type { ZeroARClient } from '@zero-ar/client';
import type { PublicationBundleManifest, PublicationReceipt } from '@zero-ar/contracts';
import { compileProject, verifyBundle } from '@zero-ar/sdk';

export type PublicationProductPort = Pick<ZeroARClient, 'createPublicationSession' | 'stagePublicationBlob' | 'commitPublication'>;

export async function publishDomainProject(port: PublicationProductPort, agent_path: string): Promise<PublicationReceipt> {
  const compiled = await compileProject(agent_path);
  verifyBundle(compiled.bundle, compiled.blobs);
  return publishCompiledBundle(port, compiled.bundle, compiled.blobs);
}

export async function publishCompiledBundle(
  port: PublicationProductPort,
  bundle: PublicationBundleManifest,
  blobs: ReadonlyMap<string, string>,
): Promise<PublicationReceipt> {
  const session = await port.createPublicationSession({ bundle });
  for (const content_ref of session.missing_blobs) {
    const bytes = blobs.get(content_ref);
    if (bytes === undefined) throw new Error('the compiled publication does not contain ' + content_ref + '. Recompile the complete project.');
    if (Buffer.byteLength(bytes) > 4_000_000) throw new Error('a publication blob exceeds the scaffold JSON transfer bound. Use the native chunk route before committing.');
    await port.stagePublicationBlob(session.session_id, { content_ref, bytes });
  }
  return port.commitPublication(session.session_id, {});
}
`;
}
function projections() {
    return `/**
 * Product projections are disposable views rebuilt from native reads.
 *
 * Junior guide: deleting this store loses convenience, not history. Rebuild
 * pages through the tenant work query and fetches each structured result. No
 * product database becomes a second recovery path for a run.
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ZeroARClient } from '@zero-ar/client';
import type { RunResult, WorkQueryItem } from '@zero-ar/contracts';

export interface ProductProjection<Body = unknown> {
  run_id: string;
  native: WorkQueryItem;
  result: RunResult;
  body: Body;
}

export interface ProductProjectionStore<Body = unknown> {
  replace(rows: ProductProjection<Body>[]): Promise<void>;
  readAll(): Promise<ProductProjection<Body>[]>;
  destroy(): Promise<void>;
}

export class FileProductProjectionStore<Body = unknown> implements ProductProjectionStore<Body> {
  readonly directory: string;
  constructor(directory: string) {
    this.directory = directory;
  }
  async replace(rows: ProductProjection<Body>[]): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, 'projection.json'), JSON.stringify(rows, null, 2) + '\\n', { mode: 0o600 });
  }
  async readAll(): Promise<ProductProjection<Body>[]> {
    try {
      return JSON.parse(await readFile(join(this.directory, 'projection.json'), 'utf8')) as ProductProjection<Body>[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }
  destroy(): Promise<void> {
    return rm(this.directory, { recursive: true, force: true });
  }
}

export async function rebuildProductProjection<Body>(
  client: Pick<ZeroARClient, 'listRuns' | 'result'>,
  store: ProductProjectionStore<Body>,
  map: (work: WorkQueryItem, result: RunResult) => Body,
): Promise<ProductProjection<Body>[]> {
  const rows: ProductProjection<Body>[] = [];
  let cursor: string | undefined;
  do {
    const page = await client.listRuns({ limit: 100, ...(cursor ? { cursor } : {}) });
    for (const work of page.items) {
      const result = await client.result(work.run_id);
      rows.push({ run_id: work.run_id, native: work, result, body: map(work, result) });
    }
    cursor = page.next_cursor ?? undefined;
  } while (cursor);
  await store.replace(rows);
  return rows;
}
`;
}
function presentation(copy) {
    return `/**
 * Product language preserves every native completion and effect distinction.
 *
 * Junior guide: only a verified terminal with no gap or unresolved effect may
 * use the verified headline. Mutation tests keep rejected, cancelled,
 * indeterminate, unverified and unreconcilable results visible to the user.
 */

import { assuranceEnvelopeFromRunResult } from '@zero-ar/contracts';
import type { AssuranceCompletionClass, AssuranceEffectDisposition, RunResult } from '@zero-ar/contracts';

export interface PresentedResult {
  verified: boolean;
  state: AssuranceCompletionClass;
  effect_state: AssuranceEffectDisposition;
  headline: string;
  detail: string;
  gaps: string[];
}

export function presentResult(result: RunResult): PresentedResult {
  const assurance = assuranceEnvelopeFromRunResult({ result, canonical_position: 0, generated_at: new Date(0).toISOString() });
  const unresolvedEffect = ['open', 'outcome-unknown', 'unreconcilable'].includes(assurance.effect_disposition);
  const verified = assurance.completion_class === 'verified' && assurance.gaps.length === 0 && !unresolvedEffect;
  if (verified) {
    return { verified: true, state: 'verified', effect_state: assurance.effect_disposition, headline: '${copy.verified}', detail: 'The native result is verified and carries no open operational outcome.', gaps: [] };
  }
  const state = assurance.completion_class === 'verified' ? 'indeterminate' : assurance.completion_class;
  const effect = assurance.effect_disposition === 'unreconcilable' ? ' An external effect is unreconcilable.'
    : assurance.effect_disposition === 'outcome-unknown' ? ' An external effect may have occurred and its outcome is unknown.'
      : assurance.effect_disposition === 'open' ? ' An external effect remains open.' : '';
  return {
    verified: false,
    state,
    effect_state: assurance.effect_disposition,
    headline: '${copy.unresolved}',
    detail: 'The native result is explicitly ' + state + '.' + effect,
    gaps: assurance.gaps,
  };
}
`;
}
function productProjection(copy) {
    return `/**
 * The ${copy.display_name.toLowerCase()} read model owns product vocabulary.
 *
 * Junior guide: this mapper is intentionally outside the shared Zero-AR
 * boundary. Another product can replace every field and label while consuming
 * the same native work and result contracts.
 */

import type { RunResult, WorkQueryItem } from '@zero-ar/contracts';
import { presentResult } from '../presentation/result.ts';

export interface ProductRow {
  ${copy.projection_label}_id: string;
  product_status: string;
  summary: string;
}

export function mapProductProjection(work: WorkQueryItem, result: RunResult): ProductRow {
  const presented = presentResult(result);
  return {
    ${copy.projection_label}_id: work.correlation_id ?? work.run_id,
    product_status: presented.state,
    summary: presented.headline,
  };
}
`;
}
function retirement() {
    return `/**
 * Product retirement coordinates access, intake, active work and projection.
 *
 * Junior guide: revoking the application prevents new access. Tenant intake
 * drains before each active work item is resolved or transferred. The local
 * projection is then disposable; authorized Zero-AR history remains available.
 */

import type { ZeroARClient } from '@zero-ar/client';

export interface ApplicationAccessAdmin {
  revoke(): Promise<void>;
}

export interface RetirementWorkItem {
  run_id: string;
  disposition: 'resolve' | 'transfer';
}

export async function retireExternalProduct(input: {
  operator: Pick<ZeroARClient, 'setIntakeDrain'>;
  application_access: ApplicationAccessAdmin;
  active_work: RetirementWorkItem[];
  resolve: (run_id: string) => Promise<void>;
  transfer: (run_id: string) => Promise<void>;
  destroy_projection: () => Promise<void>;
  reason: string;
}): Promise<void> {
  await input.application_access.revoke();
  await input.operator.setIntakeDrain({ drained: true, reason: input.reason });
  for (const work of input.active_work) {
    if (work.disposition === 'resolve') await input.resolve(work.run_id);
    else await input.transfer(work.run_id);
  }
  await input.destroy_projection();
}
`;
}
function nativeBoundaryTest(copy) {
    return `/**
 * Contract tests exercise the scaffold through one fake native port.
 *
 * Junior guide: the fake records typed public calls. It proves the backend
 * checks compatibility before creating work, keeps identity distinct, carries
 * idempotency, and offers publication, evidence, observation, review and result.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import type { NativeProductPort } from '../../src/zero-ar/client.ts';
import { ExternalProductBackend } from '../../src/zero-ar/client.ts';
import { ProductChannel } from '../../src/channels/product-channel.ts';
import { uploadRunEvidence } from '../../src/zero-ar/artifacts.ts';
import { publishDomainProject } from '../../src/zero-ar/publications.ts';

test('the backend creates durable work through the compatible native boundary', async () => {
  const calls: Array<{ name: string; body?: unknown }> = [];
  const run_id = 'run_' + '1'.repeat(32);
  const port = {
    health: async () => ({ product: 'zero-ar', contract_version: 'v1', readiness: 'ready' }),
    createDeferredRun: async (body: unknown) => {
      calls.push({ name: 'create', body });
      return { run_id, created: true, snapshot: {} };
    },
    listRuns: async () => ({ items: [], next_cursor: null }),
    recordExternalObservation: async (_run: string, body: unknown, token?: string) => {
      calls.push({ name: 'observe', body: { body, token } });
      return { run_id, accepted: true, repeated: false, record_seq: 1 };
    },
    control: async (_run: string, body: unknown) => {
      calls.push({ name: 'review', body });
      return { accepted: true };
    },
    decideEffect: async (_run: string, _effect: string, body: unknown, token: string) => {
      calls.push({ name: 'effect', body: { body, token } });
      return { accepted: true };
    },
    result: async () => ({ run_id, status: 'finished', terminal: 'complete', completion_state: 'complete', verdict: 'verified', verdict_reason: null, artifact: null, items: null, effects: { prepared: 0, dispatched: 0, committed: 0, withdrawn: 0, outcome_unknown: 0, unreconcilable: 0 }, blocking_operational_outcomes: [], not_established: [], handover: [] }),
    setIntakeDrain: async () => ({ drained: true, recorded: true }),
  } as unknown as NativeProductPort;
  const backend = new ExternalProductBackend(port);
  const session = { product_session_id: 'session-1', application_principal: 'application:${copy.source_name}', accountable_principal: 'person:accountable', represented_actor: { principal: 'person:reviewer', participant_token: 'signed-participant-token' } };
  const channel = new ProductChannel();
  const command = channel.normalize({ event_id: 'event-1', participant_text: '${copy.objective}', artifact_refs: ${copy.channel === 'web-artifact' ? `[{ artifact_ref: 'sha256:' + '2'.repeat(64), content_hash: 'sha256:' + '2'.repeat(64) }]` : '[]'} });
  const created = await backend.submit(session, command, { idempotency_key: 'product-create-1', correlation_id: 'customer-work-1' });
  assert.deepEqual(created, { work_id: run_id, created: true, event_cursor: 0 });
  const intake = calls[0]?.body as { principals: Record<string, string>; idempotency_key: string };
  assert.equal(intake.principals.executing, session.application_principal);
  assert.equal(intake.principals.accountable, session.accountable_principal);
  assert.equal(intake.idempotency_key, 'product-create-1');
  assert.doesNotMatch(JSON.stringify(intake), /signed-participant-token/);
  await assert.rejects(
    backend.submit(session, { ...command, provider_api_key: 'seeded-provider-secret' } as never, { idempotency_key: 'secret-attempt', correlation_id: 'secret-attempt' }),
    /credential-shaped field provider_api_key/,
  );
  await backend.observe(session, run_id, { idempotency_key: 'observation-1', source: { channel: 'web', event_id: 'event-1' }, observed_at: new Date(0).toISOString(), content: { kind: 'text', text: 'new evidence arrived' }, artifacts: [], classification: 'internal', provenance: { source: '${copy.source_name}' } });
  await backend.answerReview(run_id, { control_id: 'review-1', item_id: 'item-1', text: 'reviewed output' });
  await backend.decideExactEffect(session, run_id, 'eff_' + '3'.repeat(32), {
    idempotency_key: 'effect-1',
    target: 'work-orders',
    operation: 'create',
    param_hash: 'sha256:' + '4'.repeat(64),
    magnitude: 1,
    expires_at: '2030-01-01T00:00:00.000Z',
    decision: 'approve',
    reason: 'the represented reviewer approved this exact work-order effect',
  });
  assert.equal((calls.find((call) => call.name === 'observe')?.body as { token: string }).token, 'signed-participant-token');
  assert.equal((calls.find((call) => call.name === 'effect')?.body as { token: string }).token, 'signed-participant-token');
  assert.equal((await backend.result(run_id)).verdict, 'verified');
  assert.deepEqual(await backend.query(), { items: [], next_cursor: null });

  const artifactCalls: unknown[] = [];
  const evidence = await uploadRunEvidence({
    createRuntimeArtifactSession: async (body) => {
      artifactCalls.push(body);
      return { session_id: 'artw_' + '5'.repeat(32), status: 'ready', offset: 0, expected_bytes: body.expected_bytes, expected_content_hash: body.expected_content_hash, max_chunk_bytes: 262144, application_principal: session.application_principal, intended_use: body.intended_use };
    },
    stageRuntimeArtifactChunk: async (session_id, _offset, bytes) => ({ session_id, status: 'ready', offset: bytes.byteLength, expected_bytes: bytes.byteLength, expected_content_hash: 'sha256:' + '6'.repeat(64), max_chunk_bytes: 262144, application_principal: session.application_principal, intended_use: { kind: 'run', run_id } }),
    commitRuntimeArtifact: async (session_id) => ({ session_id, status: 'committed', artifact: { artifact_ref: 'artifact://tenant/' + run_id + '/source', manifest_ref: 'sha256:' + '7'.repeat(64), backend: 'filesystem', content_hash: 'sha256:' + '8'.repeat(64), bytes: 8, media_type: 'text/plain', classification: 'internal', evidence_grade: 'original', application_principal: session.application_principal, intended_use: { kind: 'run', run_id }, provenance: { source: '${copy.source_name}' }, created_at: new Date(0).toISOString(), retention_expires_at: null } }),
  }, { run_id, idempotency_key: 'evidence-1', bytes: Buffer.from('evidence'), media_type: 'text/plain', classification: 'internal', source: '${copy.source_name}' });
  assert.equal(evidence.status, 'committed');
  assert.equal(artifactCalls.length, 1);

  let published = false;
  const receipt = await publishDomainProject({
    createPublicationSession: async ({ bundle }) => ({ session_id: 'pubs_' + '9'.repeat(32), missing_blobs: [bundle.root_ref], expires_at: '2030-01-01T00:00:00.000Z' }),
    stagePublicationBlob: async () => ({ accepted: true }),
    commitPublication: async () => {
      published = true;
      return { publication_ref: 'sha256:' + 'a'.repeat(64), root_ref: 'sha256:' + 'b'.repeat(64), counts: { declarations: 1, assets: 0, total_bytes: 1 }, establishes: 'reference product fixture' };
    },
  }, new URL('../../domain/agent.yaml', import.meta.url).pathname);
  assert.equal(published, true);
  assert.match(receipt.publication_ref, /^sha256:/);
});

test('an incompatible server refuses before product work is created', async () => {
  let createCalls = 0;
  const port = {
    health: async () => ({ product: 'zero-ar', contract_version: 'v2', readiness: 'ready' }),
    createDeferredRun: async () => { createCalls += 1; throw new Error('create must not be reached'); },
  } as unknown as NativeProductPort;
  const backend = new ExternalProductBackend(port);
  await assert.rejects(
    backend.submit(
      { product_session_id: 'session-incompatible', application_principal: 'application:${copy.source_name}', accountable_principal: 'person:accountable', represented_actor: null },
      { source_name: '${copy.source_name}', source_channel: '${copy.channel}', event_id: 'event-incompatible', objective: '${copy.objective}', artifacts: [] },
      { idempotency_key: 'incompatible-create', correlation_id: 'incompatible-create' },
    ),
    /server contract is v2.*supports v1/,
  );
  assert.equal(createCalls, 0);
});
`;
}
function presentationTest() {
    return `/**
 * Journey tests keep product presentation honest under native state changes.
 *
 * Junior guide: the verified fixture is mutated one field family at a time.
 * Every incomplete, refused, cancelled or uncertain result must remain visible
 * instead of collapsing into a generic success message.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import type { RunResult } from '@zero-ar/contracts';
import { presentResult } from '../../src/presentation/result.ts';

const base: RunResult = {
  run_id: 'run_' + '1'.repeat(32), status: 'finished', terminal: 'complete', completion_state: 'complete', verdict: 'verified', verdict_reason: null,
  artifact: null, items: null,
  effects: { prepared: 0, dispatched: 0, committed: 0, withdrawn: 0, outcome_unknown: 0, unreconcilable: 0 },
  blocking_operational_outcomes: [], not_established: [], handover: [],
};

test('only an unconstrained verified terminal uses verified product language', () => {
  assert.equal(presentResult(base).verified, true);
  const mutations: RunResult[] = [
    { ...base, terminal: 'unverified_artifact', completion_state: 'unverified_artifact', verdict: 'exhausted' },
    { ...base, verdict: 'rejected' },
    { ...base, verdict: 'indeterminate' },
    { ...base, status: 'cancelled', terminal: 'cancelled', completion_state: 'working', verdict: null },
    { ...base, not_established: ['the requested coverage was not established'] },
    { ...base, effects: { ...base.effects, outcome_unknown: 1 } },
    { ...base, effects: { ...base.effects, unreconcilable: 1 } },
  ];
  for (const mutation of mutations) {
    const shown = presentResult(mutation);
    assert.equal(shown.verified, false);
    assert.notEqual(shown.headline, presentResult(base).headline);
    assert.match(shown.detail, /explicitly|effect/i);
  }
});
`;
}
