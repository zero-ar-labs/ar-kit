// packages/conformance/src/run-protocol.ts
import {
  RUN_BUNDLE_CANONICALIZATIONS,
  RUN_HEAD_FOLD_PROFILES as RUN_HEAD_FOLD_PROFILES2,
  RunMaterializationSchema,
  contentHash as contentHash7,
  recordVersionCatalogue as recordVersionCatalogue2,
  refuse as refuse3
} from "@zero-ar/contracts";

// packages/log/src/index.ts
import { contentHash as contentHash3 } from "@zero-ar/contracts";

// packages/log/src/bundle.ts
import {
  EntrySchema,
  PortableRecordEnvelopeSchema,
  RUN_BUNDLE_EXTENSION_FRAME_KINDS,
  RunBundleManifestSchema,
  activeRunBundleFormat,
  canonicalJson,
  contentHash,
  recordPayloadSchema,
  recordVersionCatalogue,
  receiptBindingMismatch,
  refuse,
  sha256Hex
} from "@zero-ar/contracts";
function readBundle(text) {
  const bodyText = text.endsWith("\n") ? text.slice(0, -1) : text;
  const lines = bodyText.split("\n");
  const last = bundleLine(lines[lines.length - 1]);
  if (last.kind !== "checksum") refuse({ code: "bundle.checksum.absent", message: "the bundle carries no checksum line and cannot be verified. Export the run again.", clause: "C-ARCH-LOG-CANONICAL-001" });
  const body = lines.slice(0, -1);
  if (sha256Hex(body.join("\n")) !== last.sha256) {
    refuse({ code: "bundle.checksum.mismatch", message: "the bundle checksum does not match its content. The bundle was altered or truncated in transit; import an unaltered export.", clause: "C-ARCH-LOG-CANONICAL-001" });
  }
  const manifestLine = bundleLine(body[0]);
  if (!isObject(manifestLine) || manifestLine["kind"] !== "manifest") {
    refuse({ code: "bundle.manifest.unsupported", message: "the first line is not a supported run bundle manifest. Use ramsden-run-bundle or zero-ar-run-bundle." });
  }
  const { kind: manifestKind, ...manifestInput } = manifestLine;
  void manifestKind;
  const parsedManifest = RunBundleManifestSchema.safeParse(manifestInput);
  if (!parsedManifest.success) {
    const version = manifestInput["format_version"];
    const format = manifestInput["format"];
    refuse({
      code: version !== 1 && version !== 2 ? "bundle.manifest.unsupported" : "bundle.manifest.invalid",
      message: `the first line is not a supported run bundle manifest. It names format ${String(format)} version ${String(version)}, or its fields are incomplete. Export the run again with a supported Zero-AR release.`
    });
  }
  const manifest = parsedManifest.data;
  if (manifest.format_version === 2) {
    for (const line of lines) {
      const value = bundleLine(line);
      if (line !== canonicalJson(value)) {
        refuse({
          code: "bundle.line.noncanonical",
          message: "a version 2 bundle line is not canonical JSON. The bundle cannot be identified consistently; import the exact bytes produced by the export route.",
          clause: "C-ARCH-LOG-CANONICAL-001"
        });
      }
    }
  }
  const entries = [];
  const records = [];
  let seq = 0;
  const { erased, kept } = erasedEntries(body.slice(1));
  for (const line of body.slice(1)) {
    const frame = bundleLine(line);
    if (!isObject(frame)) {
      refuse({ code: "bundle.frame.invalid", message: "a bundle frame is not an object. Export the run again." });
    }
    if (frame["kind"] === "entry") {
      const { kind, ...entryInput } = frame;
      void kind;
      const parsed = EntrySchema.safeParse(entryInput);
      if (!parsed.success) {
        refuse({ code: "bundle.entry.invalid", message: "a bundle entry does not match the public entry schema. Export the run again with a compatible release." });
      }
      const entry = parsed.data;
      if (entry.run_id !== manifest.run_id) {
        refuse({ code: "bundle.entry.run", message: `entry ${entry.entry_id} belongs to run ${entry.run_id}, not manifest run ${manifest.run_id}. Export one run per bundle.` });
      }
      const held = contentHash(entry.content);
      const tombstone = Object.keys(entry.content).length === 1 && typeof entry.content.text === "string" && entry.content.text.startsWith("erased: subject ");
      if (held !== entry.content_hash && !(tombstone && erased.has(entry.entry_id)) && !kept.get(entry.entry_id)?.has(held)) {
        refuse({ code: "bundle.entry.hash", message: `entry ${entry.entry_id} does not match its content hash. The entry was altered; import an unaltered export.` });
      }
      entries.push(entry);
    } else if (frame["kind"] === "record") {
      const { kind, ...recordInput } = frame;
      void kind;
      const parsed = PortableRecordEnvelopeSchema.safeParse(recordInput);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const field = issue?.path.length ? ` at ${issue.path.join(".")}` : "";
        const detail = issue?.message ? ` ${issue.message}` : "";
        refuse({ code: "bundle.record.invalid", message: `a bundle record does not match the public record envelope${field}.${detail} Export the run again with a compatible release.` });
      }
      const record = {
        ...parsed.data,
        payload: recordInput["payload"]
      };
      if (record.run_id !== manifest.run_id) {
        refuse({ code: "bundle.record.run", message: `record ${record.record_id} belongs to run ${record.run_id}, not manifest run ${manifest.run_id}. Export one run per bundle.` });
      }
      const payloadSchema = recordPayloadSchema(record.type, record.type_version);
      if (!payloadSchema) {
        refuse({
          code: "bundle.record.version",
          message: `record ${record.record_id} names unsupported ${record.type} payload version ${record.type_version}. Use a runtime that implements that record version or export with a compatible release.`
        });
      }
      const parsedPayload = payloadSchema.safeParse(record.payload);
      if (!parsedPayload.success) {
        const issue = parsedPayload.error.issues[0];
        const field = issue?.path.length ? ` at ${issue.path.join(".")}` : "";
        const detail = issue?.message ? ` ${issue.message}` : "";
        refuse({ code: "bundle.record.payload", message: `record ${record.record_id} carries a ${record.type} payload that does not match version ${record.type_version}${field}.${detail} Export the run again from its canonical store.` });
      }
      seq += 1;
      records.push({ ...record, seq });
    } else if (RUN_BUNDLE_EXTENSION_FRAME_KINDS.includes(String(frame["kind"]))) {
      continue;
    } else {
      refuse({
        code: "bundle.frame.unsupported",
        message: `the bundle carries unsupported frame kind ${String(frame["kind"])}. Nothing was imported; use a runtime that implements every frame or export the run again.`
      });
    }
  }
  if (manifest.entry_count !== entries.length || manifest.record_count !== records.length) {
    refuse({
      code: "bundle.manifest.count",
      message: `the manifest declares ${manifest.entry_count} entries and ${manifest.record_count} records, and the bundle carries ${entries.length} and ${records.length}. Export the run again.`
    });
  }
  if (records.length === 0) {
    refuse({ code: "bundle.run.empty", message: "the bundle carries no canonical run records. Export a run after intake has recorded its identity." });
  }
  assertEntryTree(entries);
  assertCausalSequence(records);
  const badSeq = verifyChain(records);
  if (badSeq !== null) {
    refuse({ code: "bundle.chain.broken", message: `the record chain breaks at position ${badSeq}. The history was altered; import an unaltered export.`, clause: "C-ARCH-LOG-CANONICAL-001" });
  }
  const actualHead = records.at(-1)?.chain_hash ?? null;
  if (actualHead !== manifest.chain_head) {
    refuse({ code: "bundle.chain.head", message: `the manifest chain head does not match the final record. The bundle was truncated or joined incorrectly; export the run again.`, clause: "C-ARCH-LOG-CANONICAL-001" });
  }
  assertReceiptsBind(records);
  return { manifest, entries, records };
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function assertEntryTree(entries) {
  const ids = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    if (ids.has(entry.entry_id)) {
      refuse({ code: "bundle.entry.duplicate", message: `entry ${entry.entry_id} occurs more than once. Export the run again from its canonical store.` });
    }
    ids.add(entry.entry_id);
  }
  for (const entry of entries) {
    if (entry.parent_id !== null && !ids.has(entry.parent_id)) {
      refuse({ code: "bundle.entry.parent", message: `entry ${entry.entry_id} names missing parent ${entry.parent_id}. Export a complete run bundle.` });
    }
  }
  const parents = new Map(entries.map((entry) => [entry.entry_id, entry.parent_id]));
  for (const entry of entries) {
    const path = /* @__PURE__ */ new Set();
    let cursor = entry.entry_id;
    while (cursor !== null) {
      if (path.has(cursor)) {
        refuse({ code: "bundle.entry.cycle", message: `entry ${entry.entry_id} belongs to a parent cycle. Export a run whose entry graph reaches a root.` });
      }
      path.add(cursor);
      cursor = parents.get(cursor) ?? null;
    }
  }
}
function assertCausalSequence(records) {
  let parent = null;
  let logicalClock = 0;
  const ids = /* @__PURE__ */ new Set();
  for (const record of records) {
    if (ids.has(record.record_id)) {
      refuse({ code: "bundle.record.duplicate", message: `record ${record.record_id} occurs more than once. Export the run again from its canonical store.` });
    }
    if (record.causal_parent !== parent || record.logical_clock !== logicalClock + 1) {
      refuse({
        code: "bundle.record.causal",
        message: `record ${record.record_id} does not continue the preceding record id and logical clock. Export the complete canonical history in order.`,
        clause: "C-ARCH-LOG-CANONICAL-001"
      });
    }
    ids.add(record.record_id);
    parent = record.record_id;
    logicalClock = record.logical_clock;
  }
}
function bundleLine(line) {
  try {
    return JSON.parse(line ?? "");
  } catch {
    refuse({ code: "bundle.line.malformed", message: "a bundle line is not JSON, so the bundle cannot be verified. Export the run again." });
  }
}
function assertReceiptsBind(records) {
  const descriptors = /* @__PURE__ */ new Map();
  for (const record of records) {
    if (record.type === "effect.prepared") {
      const descriptor2 = record.payload["descriptor"];
      if (descriptor2 && typeof descriptor2.effect_id === "string") descriptors.set(descriptor2.effect_id, descriptor2);
      continue;
    }
    if (record.type !== "effect.resolved" && record.type !== "effect.answer.late") continue;
    const receipt = record.payload["receipt"];
    if (!receipt) continue;
    const effect_id = String(record.payload["effect_id"]);
    const descriptor = descriptors.get(effect_id);
    const mismatch = descriptor ? receiptBindingMismatch(receipt, descriptor) : "effect_id";
    if (mismatch) {
      refuse({
        code: "effect.receipt.binding",
        message: descriptor ? `the bundle's ${record.type} record at position ${record.seq} carries a receipt whose ${mismatch} differs from effect ${effect_id}'s prepared descriptor, so it vouches for a different change. The history was altered; import an unaltered export.` : `the bundle's ${record.type} record at position ${record.seq} carries a receipt for effect ${effect_id} with no prepared descriptor before it, so nothing says what it vouches for. The history was altered; import an unaltered export.`,
        clause: "EFX-006"
      });
    }
  }
}
function erasedEntries(lines) {
  const ids = /* @__PURE__ */ new Set();
  const kept = /* @__PURE__ */ new Map();
  for (const line of lines) {
    if (!line.includes("subject.erasure.completed")) continue;
    let frame;
    try {
      frame = JSON.parse(line);
    } catch {
      continue;
    }
    if (!isObject(frame) || frame["kind"] !== "record" || frame["type"] !== "subject.erasure.completed") continue;
    const payload = frame["payload"];
    const entryIds = isObject(payload) ? payload["entry_ids"] : void 0;
    if (Array.isArray(entryIds)) {
      for (const id of entryIds) if (typeof id === "string") ids.add(id);
    }
    const keptEntries = isObject(payload) ? payload["kept_entries"] : void 0;
    for (const named of Array.isArray(keptEntries) ? keptEntries : []) {
      if (!isObject(named) || typeof named["entry_id"] !== "string" || typeof named["content_hash"] !== "string") continue;
      kept.set(named["entry_id"], (kept.get(named["entry_id"]) ?? /* @__PURE__ */ new Set()).add(named["content_hash"]));
    }
  }
  return { erased: ids, kept };
}

// packages/log/src/append.ts
import { RECORD_EVENT_MAP, RECORD_PAYLOADS, latestRecordPayloadVersion, makeId, refuse as refuse2 } from "@zero-ar/contracts";

// packages/log/src/integrity.ts
import { canonicalJson as canonicalJson2, contentHash as contentHash2, RecordEnvelopeSchema } from "@zero-ar/contracts";

// packages/log/src/index.ts
function chainHash(previous, record) {
  return contentHash3({ previous, record });
}
function verifyChain(rows, previous = null) {
  let prev = previous;
  for (const row of rows) {
    const { seq, chain_hash, ...fold } = row;
    if (chainHash(prev, fold) !== chain_hash) return seq;
    prev = chain_hash;
  }
  return null;
}

// packages/projections/src/index.ts
import { RUN_HEAD_FOLD_PROFILES, contentHash as contentHash6 } from "@zero-ar/contracts";

// packages/projections/src/run-head.ts
import { OPEN_GOAL_CONTRACT, OPEN_GOAL_CONTRACT_REF, RECEIPT_OUTCOMES, assertTransition, contentHash as contentHash4, effectRecordTransition } from "@zero-ar/contracts";
function emptyRunHead(run_id) {
  return {
    run_id,
    status: "created",
    completion_state: "working",
    terminal: null,
    suspend_reason: null,
    turn: 0,
    current_branch: null,
    head_entry_id: null,
    entry_count: 0,
    agent_name: "",
    model_ref: "",
    objective: "",
    created_at: null,
    correlation_id: null,
    publication_ref: null,
    completion_class: "working",
    pending_review_items: [],
    budgets: null,
    principals: null,
    contract: null,
    checkpoint_interval: null,
    checkpoint_phase_schedules: [],
    posture_ref: null,
    agent_ref: "",
    resolved_manifest: null,
    active_closure_epoch: 1,
    active_closure_ref: "",
    active_procedure_refs: [],
    pending_closure_epoch: null,
    pending_capability_admissions: {},
    effects_disabled: false,
    items_declared: 0,
    repair_attempts: 0,
    model_candidate: 0,
    checkpoints_passed: 0,
    usage: {},
    effects: {},
    verified_completion_reachable: false,
    artifact_entry_id: null,
    verdict: null,
    verdict_reason: null,
    pending_controls: [],
    pending_observations: [],
    tool_view: null,
    activated_tool_refs: [],
    inflight_closure_operations: {}
  };
}
var CLOSURE_ATTRIBUTED_RECORDS = /* @__PURE__ */ new Set([
  "context.assembled",
  "model.call.started",
  "model.call.finished",
  "model.call.failed",
  "model.fallback.switched",
  "turn.completed",
  "item.attempted",
  "tool.invoked",
  "tool.remote.pending",
  "tool.finished",
  "environment.prepare.requested",
  "environment.prepared",
  "environment.reused",
  "environment.job.submit.requested",
  "environment.job.submitted",
  "environment.job.observe.requested",
  "environment.job.observed",
  "environment.job.reconcile.requested",
  "environment.job.reconciled",
  "environment.job.cancel.requested",
  "environment.job.cancelled",
  "environment.artifact.collect.requested",
  "environment.artifact.collected",
  "artifact.committed",
  "environment.teardown.requested",
  "environment.teardown.recorded",
  "environment.abandon.requested",
  "environment.abandoned",
  "checkpoint.started",
  "checkpoint.passed",
  "checkpoint.rejected",
  "checkpoint.indeterminate",
  "completion.proposed",
  "verification.concluded",
  "run.finished"
]);
function assertClosureAttribution(state, record) {
  if (!CLOSURE_ATTRIBUTED_RECORDS.has(record.type)) return;
  const epoch = record.payload["closure_epoch"];
  const ref = record.payload["closure_ref"];
  const present = typeof epoch === "number" && typeof ref === "string";
  const absent = epoch === void 0 && ref === void 0;
  if (!present && !absent) throw new Error(`${record.type} must carry closure_epoch and closure_ref together`);
  const activeEpoch = state.active_closure_epoch ?? 1;
  const activeRef = state.active_closure_ref || (state.resolved_manifest ? contentHash4(state.resolved_manifest) : state.agent_ref);
  const continuationKey = closureContinuationKey(record);
  const initiating = continuationKey ? (state.inflight_closure_operations ?? {})[continuationKey] : void 0;
  const expectedEpoch = initiating?.closure_epoch ?? activeEpoch;
  const expectedRef = initiating?.closure_ref ?? activeRef;
  if (absent) {
    if (expectedEpoch > 1 || activeEpoch > 1) throw new Error(`${record.type} omitted closure attribution after epoch ${activeEpoch} activated`);
    return;
  }
  if (epoch !== expectedEpoch || ref !== expectedRef) {
    throw new Error(`${record.type} names closure epoch ${String(epoch)} / ${String(ref)}, but ${expectedEpoch} / ${expectedRef} governs this operation`);
  }
}
var ENVIRONMENT_RESULT_TO_REQUEST = {
  "environment.prepared": "environment.prepare.requested",
  "environment.job.submitted": "environment.job.submit.requested",
  "environment.job.observed": "environment.job.observe.requested",
  "environment.job.reconciled": "environment.job.reconcile.requested",
  "environment.job.cancelled": "environment.job.cancel.requested",
  "environment.artifact.collected": "environment.artifact.collect.requested",
  "environment.teardown.recorded": "environment.teardown.requested",
  "environment.abandoned": "environment.abandon.requested"
};
function closureInitiationKey(record) {
  const p = record.payload;
  if (record.type === "model.call.started") return `model:${String(p["turn"])}`;
  if (record.type === "tool.invoked") return `tool:${String(p["invoke_id"])}`;
  if (record.type.endsWith(".requested") && record.type.startsWith("environment.")) return `environment:${record.type}:${String(p["request_id"])}`;
  if (record.type === "checkpoint.started") return `checkpoint:${String(p["checkpoint_id"])}`;
  return null;
}
function closureContinuationKey(record) {
  const p = record.payload;
  if (["model.call.finished", "model.call.failed", "model.fallback.switched", "item.attempted", "turn.completed"].includes(record.type)) return `model:${String(p["turn"])}`;
  if (record.type === "tool.remote.pending" || record.type === "tool.finished") return `tool:${String(p["invoke_id"])}`;
  const requestType = ENVIRONMENT_RESULT_TO_REQUEST[record.type];
  if (requestType) return `environment:${requestType}:${String(p["request_id"])}`;
  if (["checkpoint.passed", "checkpoint.rejected", "checkpoint.indeterminate"].includes(record.type)) return `checkpoint:${String(p["checkpoint_id"])}`;
  return null;
}
function trackClosureOperation(state, record) {
  const initiationKey = closureInitiationKey(record);
  const continuationKey = closureContinuationKey(record);
  if (!initiationKey && !continuationKey) return state;
  const inflight = { ...state.inflight_closure_operations ?? {} };
  const refusedAtInvoke = record.type === "tool.invoked" && record.payload["refused"] === true;
  if (initiationKey && !refusedAtInvoke) {
    if (!inflight[initiationKey] && Object.keys(inflight).length >= 256) throw new Error("the bounded closure-operation projection is full");
    const activeEpoch = state.active_closure_epoch ?? 1;
    const activeRef = state.active_closure_ref || (state.resolved_manifest ? contentHash4(state.resolved_manifest) : state.agent_ref);
    inflight[initiationKey] = {
      closure_epoch: typeof record.payload["closure_epoch"] === "number" ? record.payload["closure_epoch"] : activeEpoch,
      closure_ref: typeof record.payload["closure_ref"] === "string" ? record.payload["closure_ref"] : activeRef
    };
  }
  const terminalContinuation = record.type === "tool.finished" || record.type === "model.call.failed" || record.type === "turn.completed" || Object.prototype.hasOwnProperty.call(ENVIRONMENT_RESULT_TO_REQUEST, record.type) || ["checkpoint.passed", "checkpoint.rejected", "checkpoint.indeterminate"].includes(record.type);
  if (continuationKey && terminalContinuation) delete inflight[continuationKey];
  return { ...state, inflight_closure_operations: inflight };
}
function withEvidenceBlockers(state, field, value) {
  if (Array.isArray(value) && value.length > 0) return { ...state, [field]: value };
  if (state[field] === void 0) return state;
  const next = { ...state };
  delete next[field];
  return next;
}
var foldRunHead = (state, record) => {
  const p = record.payload;
  assertClosureAttribution(state, record);
  state = trackClosureOperation(state, record);
  switch (record.type) {
    case "run.created": {
      const resolved = p["resolved"];
      const ref = p["task_contract_ref"];
      const manifest = resolved.manifest ?? null;
      return {
        ...state,
        objective: p["objective"],
        created_at: p["created_at"] ?? record.at,
        correlation_id: p["correlation_id"] ?? null,
        publication_ref: resolved.manifest?.agent.publication_ref ?? null,
        agent_name: p["agent_name"],
        agent_ref: p["agent_ref"],
        resolved_manifest: manifest,
        active_closure_epoch: 1,
        active_closure_ref: manifest ? contentHash4(manifest) : p["agent_ref"],
        active_procedure_refs: manifest?.procedures ?? [],
        model_ref: p["model_ref"],
        budgets: p["budgets"],
        principals: p["principals"],
        contract: ref && resolved.contract_name ? { name: resolved.contract_name, ref, repair_budget: resolved.repair_budget } : null,
        checkpoint_interval: resolved.checkpoint?.interval_items ?? null,
        checkpoint_phase_schedules: resolved.checkpoint?.phase_schedules ?? [],
        posture_ref: resolved.posture?.ref ?? null,
        items_declared: resolved.items_declared,
        verified_completion_reachable: resolved.verified_completion_reachable,
        ...typeof p["context_fence_nonce"] === "string" ? { context_fence_nonce: p["context_fence_nonce"] } : {}
      };
    }
    case "capability.admission.requested": {
      const request_id = p["request_id"];
      const pending = state.pending_capability_admissions ?? {};
      if (pending[request_id]) throw new Error("a capability admission request id may be recorded once");
      if (!pending[request_id] && Object.keys(pending).length >= 64) {
        throw new Error("a run may hold at most 64 pending capability admissions; settle or cancel one before requesting another");
      }
      return {
        ...state,
        pending_capability_admissions: {
          ...pending,
          [request_id]: {
            tenant: p["tenant"],
            status: "resolving",
            base_closure_epoch: p["base_closure_epoch"],
            base_closure_ref: p["base_closure_ref"],
            plan_ref: null,
            candidate_closure_ref: null,
            resolved_package_ref: null
          }
        }
      };
    }
    case "capability.admission.classified": {
      const request_id = p["request_id"];
      const plan = p["plan"];
      const pending = state.pending_capability_admissions ?? {};
      const request = pending[request_id];
      if (!request) throw new Error("a capability admission cannot be classified before it is requested");
      if (request.plan_ref) throw new Error("a capability admission may be classified once");
      if (request.base_closure_epoch !== plan.base_closure_epoch || request.base_closure_ref !== plan.base_closure_ref) {
        throw new Error("a capability admission plan must bind the base closure recorded by its request");
      }
      if (request.tenant !== p["tenant"] || request.tenant !== p["plan"].tenant) {
        throw new Error("a capability admission plan must retain the request tenant");
      }
      if (plan.status === "refused" || plan.status === "superseded") {
        const settled = { ...pending };
        delete settled[request_id];
        return { ...state, pending_capability_admissions: settled };
      }
      return {
        ...state,
        pending_capability_admissions: {
          ...pending,
          [request_id]: {
            tenant: request.tenant,
            status: plan.status,
            base_closure_epoch: plan.base_closure_epoch,
            base_closure_ref: plan.base_closure_ref,
            plan_ref: plan.plan_ref,
            candidate_closure_ref: plan.candidate_closure_ref,
            resolved_package_ref: p["plan"].resolved_package_ref
          }
        }
      };
    }
    case "capability.admission.decided": {
      const request_id = p["request_id"];
      const status = p["status"];
      const pending = { ...state.pending_capability_admissions ?? {} };
      const admission = pending[request_id];
      if (!admission?.plan_ref) throw new Error("a capability admission decision must name one pending classified plan");
      if (admission.status !== "awaiting-review") throw new Error("a capability admission decision cannot reopen a closed or already-decided plan");
      if (admission.plan_ref !== p["expected_plan_ref"]) throw new Error("a capability admission decision must bind the classified plan ref");
      if (admission.tenant !== p["tenant"]) throw new Error("a capability admission decision must retain the request tenant");
      if (status === "refused" || status === "superseded") delete pending[request_id];
      else if (pending[request_id]) pending[request_id] = { ...pending[request_id], status };
      return { ...state, pending_capability_admissions: pending };
    }
    case "capability.admission.cancelled": {
      const pending = { ...state.pending_capability_admissions ?? {} };
      const request_id = p["request_id"];
      if (!pending[request_id]) throw new Error("only one live pre-commit capability request may be cancelled");
      if (pending[request_id]?.tenant !== p["tenant"]) throw new Error("a capability admission cancellation must retain the request tenant");
      if (state.pending_closure_epoch?.request_id === request_id || pending[request_id]?.status === "committed") {
        throw new Error("a committed closure successor cannot be cancelled or erased");
      }
      delete pending[request_id];
      return { ...state, pending_capability_admissions: pending };
    }
    case "closure.epoch.committed": {
      const closure_epoch = p["closure_epoch"];
      const currentEpoch = state.active_closure_epoch ?? 1;
      const currentRef = state.active_closure_ref || (state.resolved_manifest ? contentHash4(state.resolved_manifest) : state.agent_ref);
      if (state.pending_closure_epoch) throw new Error("a closure successor is already committed and awaits activation");
      if (p["base_closure_epoch"] !== currentEpoch || p["base_closure_ref"] !== currentRef || closure_epoch !== currentEpoch + 1) {
        throw new Error("the committed closure epoch does not extend the current active closure exactly once");
      }
      const request_id = p["request_id"];
      const pending = { ...state.pending_capability_admissions ?? {} };
      const admission = pending[request_id];
      if (!admission || admission.status !== "approved") throw new Error("only an approved capability plan may commit a closure successor");
      if (admission.tenant !== p["tenant"]) throw new Error("a closure successor must retain the request tenant");
      if (admission.plan_ref !== p["plan_ref"] || admission.candidate_closure_ref !== p["closure_ref"]) {
        throw new Error("a committed closure successor must bind the approved plan and candidate closure");
      }
      const manifest = p["effective_manifest"];
      if (contentHash4(manifest) !== p["closure_ref"]) throw new Error("closure_ref must hash the exact committed effective manifest");
      const procedures = [...new Set(manifest.procedures)].sort();
      if (procedures.length > 256 || procedures.length !== manifest.procedures.length || procedures.some((ref, index) => ref !== manifest.procedures[index])) {
        throw new Error("DCA2 effective procedures must be canonical sorted unique and bounded to 256");
      }
      if (!state.resolved_manifest) throw new Error("DCA2 cannot amend a historical run without a reconstructable base manifest");
      const baseManifest = { ...state.resolved_manifest, procedures: state.active_procedure_refs ?? state.resolved_manifest.procedures };
      const { procedures: _baseProcedures, ...baseAuthority } = baseManifest;
      const { procedures: _nextProcedures, ...nextAuthority } = manifest;
      if (contentHash4(baseAuthority) !== contentHash4(nextAuthority)) {
        throw new Error("DCA2 closure commitment may change procedures only; model, tools, contract and authority remain immutable");
      }
      const baseProcedures = [...new Set(baseManifest.procedures)].sort();
      if (procedures.length !== baseProcedures.length + 1 || baseProcedures.some((ref) => !procedures.includes(ref))) {
        throw new Error("DCA2 closure commitment must add exactly one procedure and remove none");
      }
      const admittedPackageRef = p["admitted_package_ref"];
      const added = procedures.filter((ref) => !baseProcedures.includes(ref));
      if (admission.resolved_package_ref !== admittedPackageRef || added.length !== 1 || added[0] !== admittedPackageRef) {
        throw new Error("the DCA2 successor must add the exact package inspected by the approved plan");
      }
      pending[request_id] = { ...admission, status: "committed" };
      return {
        ...state,
        pending_capability_admissions: pending,
        pending_closure_epoch: {
          request_id,
          tenant: admission.tenant,
          closure_epoch,
          closure_ref: p["closure_ref"],
          plan_ref: p["plan_ref"],
          admitted_package_ref: admittedPackageRef,
          procedure_refs: procedures
        }
      };
    }
    case "closure.epoch.activated": {
      const pendingEpoch = state.pending_closure_epoch;
      if (!pendingEpoch || pendingEpoch.request_id !== p["request_id"] || pendingEpoch.closure_epoch !== p["closure_epoch"] || pendingEpoch.closure_ref !== p["closure_ref"]) {
        throw new Error("closure activation does not name the one committed successor");
      }
      if (state.status !== "running" || state.terminal) throw new Error("closure activation is legal only on a live run-loop safe boundary");
      if (pendingEpoch.plan_ref !== p["plan_ref"]) throw new Error("closure activation must bind the committed plan ref");
      if (pendingEpoch.tenant !== p["tenant"]) throw new Error("closure activation must retain the committed successor tenant");
      const pending = { ...state.pending_capability_admissions ?? {} };
      delete pending[pendingEpoch.request_id];
      return {
        ...state,
        active_closure_epoch: pendingEpoch.closure_epoch,
        active_closure_ref: pendingEpoch.closure_ref,
        active_procedure_refs: pendingEpoch.procedure_refs,
        pending_closure_epoch: null,
        pending_capability_admissions: pending
      };
    }
    case "run.started": {
      assertTransition("run", state.status, "running", "run.started", "runtime");
      return { ...state, status: "running", suspend_reason: null };
    }
    case "branch.created": {
      return { ...state, current_branch: p["branch_id"], head_entry_id: p["head_entry_id"] ?? null };
    }
    case "branch.head.moved": {
      return { ...state, head_entry_id: p["to_entry_id"] };
    }
    case "entry.appended": {
      const abandoned = p["abandoned"];
      return {
        ...state,
        entry_count: state.entry_count + 1,
        head_entry_id: abandoned ? state.head_entry_id : p["entry_id"]
      };
    }
    case "lease.opened": {
      const key = `${p["pool"]}.${p["denomination"]}`;
      if (state.usage[key]) return state;
      return { ...state, usage: { ...state.usage, [key]: { reserved: 0, consumed: 0 } } };
    }
    case "lease.reserved": {
      const key = `${p["pool"]}.${p["denomination"]}`;
      const u = state.usage[key] ?? { reserved: 0, consumed: 0 };
      return { ...state, usage: { ...state.usage, [key]: { ...u, reserved: u.reserved + p["amount"] } } };
    }
    case "lease.consumed": {
      const key = `${p["pool"]}.${p["denomination"]}`;
      const u = state.usage[key] ?? { reserved: 0, consumed: 0 };
      const overrun = (u.overrun ?? 0) + (p["overrun"] ?? 0);
      return {
        ...state,
        usage: {
          ...state.usage,
          [key]: {
            reserved: u.reserved - p["reserved"],
            consumed: u.consumed + p["amount"],
            ...overrun > 0 ? { overrun } : {}
          }
        }
      };
    }
    case "lease.released": {
      const key = `${p["pool"]}.${p["denomination"]}`;
      const u = state.usage[key] ?? { reserved: 0, consumed: 0 };
      return { ...state, usage: { ...state.usage, [key]: { ...u, reserved: Math.max(0, u.reserved - p["amount"]) } } };
    }
    case "turn.completed": {
      return { ...state, turn: p["turn"] + 1 };
    }
    case "control.received": {
      return {
        ...state,
        pending_controls: [...state.pending_controls, { control_id: p["control_id"], verb: p["verb"] }]
      };
    }
    case "control.applied": {
      const pending_controls = state.pending_controls.filter((c) => c.control_id !== p["control_id"]);
      return p["verb"] === "pause" && state.status === "suspended" ? { ...state, pending_controls, suspend_reason: "operator_pause" } : { ...state, pending_controls };
    }
    case "external.observation.received": {
      const observation_id = p["observation_id"];
      const pending = state.pending_observations ?? [];
      return pending.some((observation) => observation.observation_id === observation_id) ? state : {
        ...state,
        pending_observations: [
          ...pending,
          { observation_id, idempotency_key: p["idempotency_key"] }
        ]
      };
    }
    case "external.observation.applied": {
      return {
        ...state,
        pending_observations: (state.pending_observations ?? []).filter((observation) => observation.observation_id !== p["observation_id"])
      };
    }
    case "completion.proposed": {
      assertTransition("completion", state.completion_state, "completion_proposed", "completion.proposed", "model");
      return { ...state, completion_state: "completion_proposed", artifact_entry_id: p["artifact_entry_id"] };
    }
    case "verification.concluded": {
      const verdict = p["verdict"];
      if (state.completion_state !== "verifying") {
        assertTransition("completion", state.completion_state, "verifying", "verification.started", "runtime");
      }
      const next = verdict === "verified" ? "complete" : verdict === "rejected" ? "repair" : verdict === "indeterminate" ? "gap_open" : "unverified_artifact";
      const event = verdict === "verified" ? "verification.verified" : verdict === "rejected" ? "verification.rejected" : verdict === "indeterminate" ? "verification.indeterminate" : "verification.exhausted";
      assertTransition("completion", "verifying", next, event, verdict === "exhausted" ? "runtime" : "validator");
      return withEvidenceBlockers(
        { ...state, completion_state: next, verdict, verdict_reason: p["reason"] },
        "verdict_evidence_blockers",
        p["evidence_blockers"]
      );
    }
    case "run.suspended": {
      assertTransition("run", state.status, "suspended", "run.suspended", "runtime");
      return { ...state, status: "suspended", suspend_reason: p["reason"] };
    }
    case "run.resumed": {
      assertTransition("run", state.status, "running", "run.resumed", "runtime");
      return { ...state, status: "running", suspend_reason: null };
    }
    case "run.cancelled": {
      assertTransition("run", state.status, "cancelled", "run.cancelled", "caller");
      return {
        ...state,
        status: "cancelled",
        terminal: "cancelled",
        completion_class: "cancelled",
        pending_review_items: [],
        pending_closure_epoch: null,
        pending_capability_admissions: {}
      };
    }
    case "run.finished": {
      assertTransition("run", state.status, "finished", "run.finished", "runtime");
      const terminal = p["terminal"];
      const artifact = p["artifact_entry_id"] ?? null;
      if (terminal === "complete" && state.completion_state !== "complete") {
        throw new Error(
          `refusing to fold run.finished as complete while the completion state is ${state.completion_state}. Only a verification verdict reaches complete. Clause C-ARCH-VERIFIED-COMPLETION-005.`
        );
      }
      if (terminal === "unverified_artifact" && state.completion_state !== "unverified_artifact") {
        const event = state.completion_state === "gap_open" ? "gap.unsettled" : state.completion_state === "repair" ? "repair.exhausted" : "verification.exhausted";
        assertTransition("completion", state.completion_state, "unverified_artifact", event, "runtime");
      }
      const completionClass = terminal === "complete" && state.verdict === "verified" ? "verified" : state.verdict === "rejected" ? "rejected" : state.verdict === "indeterminate" ? "indeterminate" : state.verdict === "exhausted" ? "exhausted" : "unverified";
      return {
        ...state,
        status: "finished",
        terminal,
        completion_state: terminal === "unverified_artifact" ? "unverified_artifact" : state.completion_state,
        completion_class: completionClass,
        artifact_entry_id: artifact ?? state.artifact_entry_id,
        pending_closure_epoch: null,
        pending_capability_admissions: {}
      };
    }
    case "run.forked": {
      return { ...state, entry_count: state.entry_count + p["copied_entries"] };
    }
    case "reexecution.started": {
      return { ...state, entry_count: state.entry_count + p["copied_entries"], effects_disabled: true };
    }
    case "checkpoint.started": {
      assertTransition("completion", state.completion_state, "checkpoint_verifying", "checkpoint.started", "runtime");
      return { ...state, completion_state: "checkpoint_verifying" };
    }
    case "checkpoint.passed": {
      assertTransition("completion", state.completion_state, "working", "checkpoint.passed", "validator");
      return { ...state, completion_state: "working", checkpoints_passed: state.checkpoints_passed + 1 };
    }
    case "checkpoint.indeterminate": {
      assertTransition("completion", state.completion_state, "working", "checkpoint.indeterminate", "validator");
      return { ...state, completion_state: "working" };
    }
    case "checkpoint.rejected": {
      assertTransition("completion", state.completion_state, "repair", "checkpoint.rejected", "validator");
      return { ...state, completion_state: "repair" };
    }
    case "repair.started": {
      assertTransition("completion", state.completion_state, "working", "repair.started", "runtime");
      return { ...state, completion_state: "working", repair_attempts: p["attempt"] };
    }
    case "effect.prepared": {
      const descriptor = p["descriptor"];
      return {
        ...state,
        effects: {
          ...state.effects,
          [descriptor.effect_id]: { state: "prepared", target: descriptor.target, operation: descriptor.operation }
        }
      };
    }
    case "effect.dispatched":
    case "effect.resolved":
    case "effect.unreconcilable": {
      const effect_id = p["effect_id"];
      const existing = state.effects[effect_id];
      if (!existing) {
        throw new Error(`effect ${effect_id} moved without a prepared record, and the log is canonical. Rebuild from a complete history.`);
      }
      const move = effectRecordTransition(record.type, p, existing.state);
      assertTransition("effect", move.from, move.to, move.on, move.actor);
      const receipt = p["receipt"];
      const outcome = move.to === "committed" && RECEIPT_OUTCOMES.includes(receipt?.outcome) ? receipt?.outcome : void 0;
      return { ...state, effects: { ...state.effects, [effect_id]: { ...existing, state: move.to, ...outcome ? { outcome } : {} } } };
    }
    case "effect.answer.late": {
      const effect_id = p["effect_id"];
      if (!state.effects[effect_id]) {
        throw new Error(`effect ${effect_id} has a late owner answer without a prepared record, and the log is canonical. Rebuild from a complete history.`);
      }
      return state;
    }
    case "model.fallback.switched": {
      return { ...state, model_candidate: p["candidate"] };
    }
    case "model.call.started":
      return { ...state, tool_view: p["tool_view"] ?? state.tool_view };
    case "context.assembled": {
      const blockers = Array.isArray(p["evidence_blockers"]) ? p["evidence_blockers"].filter((blocker) => blocker.reason !== "token_budget") : void 0;
      return withEvidenceBlockers(state, "context_evidence_blockers", blockers);
    }
    case "model.call.finished":
    case "model.call.failed":
    case "item.attempted":
    case "item.invalidated":
    case "subrun.opened":
    case "subrun.finished":
    case "tool.invoked": {
      const activated = p["activated_contract_ref"];
      if (typeof activated !== "string" || state.activated_tool_refs.includes(activated)) return state;
      return { ...state, activated_tool_refs: [...state.activated_tool_refs, activated].sort() };
    }
    case "tool.remote.pending":
    case "tool.finished":
    case "artifact.committed":
    case "effect.authority.decision":
    case "effect.authority.invalidated":
    case "projection.rebuilt":
    case "run.lifecycle.command.accepted":
    case "state.closure.rehydrated":
    case "executor.continuation.accepted":
      return state;
    case "budgets.amended": {
      return { ...state, budgets: p["budgets"] };
    }
    case "plan.recorded": {
      const loosened = [.../* @__PURE__ */ new Set([...state.plan_loosened ?? [], ...p["loosened"]])].sort();
      return {
        ...state,
        contract: state.contract ?? { name: OPEN_GOAL_CONTRACT.name, ref: OPEN_GOAL_CONTRACT_REF, repair_budget: OPEN_GOAL_CONTRACT.repair_budget_attempts },
        items_declared: p["items"].length,
        plan_revision: p["revision"],
        ...loosened.length > 0 ? { plan_loosened: loosened } : {}
      };
    }
    case "item.parked": {
      const item = p["item_id"];
      return state.pending_review_items.includes(item) ? state : { ...state, pending_review_items: [...state.pending_review_items, item].sort((left, right) => left.localeCompare(right)) };
    }
    case "gap.settled":
    case "gap.dismissed": {
      const item = p["item_id"];
      return { ...state, pending_review_items: state.pending_review_items.filter((candidate) => candidate !== item) };
    }
    default: {
      return state;
    }
  }
};

// packages/projections/src/environment.ts
import {
  AbandonEnvironmentRequestSchema,
  AbandonEnvironmentResultSchema,
  CancelEnvironmentJobRequestSchema,
  CancelEnvironmentJobResultSchema,
  CollectEnvironmentArtifactRequestSchema,
  CollectEnvironmentArtifactResultSchema,
  EnvironmentReuseRecordSchema,
  ObserveEnvironmentJobRequestSchema,
  ObserveEnvironmentJobResultSchema,
  PrepareEnvironmentRequestSchema,
  PrepareEnvironmentResultSchema,
  ReconcileEnvironmentJobRequestSchema,
  ReconcileEnvironmentJobResultSchema,
  SubmitEnvironmentJobRequestSchema,
  SubmitEnvironmentJobResultSchema,
  TeardownEnvironmentRequestSchema,
  TeardownEnvironmentResultSchema,
  contentHash as contentHash5
} from "@zero-ar/contracts";

// packages/projections/src/index.ts
var RUN_HEAD_FOLD_VERSION = RUN_HEAD_FOLD_PROFILES[0];

// packages/conformance/src/run-protocol.ts
function materializeRunBundle(text) {
  const bundle = readBundle(text);
  const projection = bundle.records.reduce(foldRunHead, emptyRunHead(bundle.manifest.run_id));
  const stateHash = contentHash7(projection);
  if (stateHash !== bundle.manifest.head_projection_hash) {
    refuse3({
      code: "bundle.projection.mismatch",
      message: `the bundle declares projection ${bundle.manifest.head_projection_hash}, but its verified records materialize to ${stateHash}. Export the run again from its canonical store.`,
      clause: "C-ARCH-LOG-CANONICAL-001"
    });
  }
  const last = bundle.records.at(-1);
  return RunMaterializationSchema.parse({
    schema: "zero-ar-run-materialization/1",
    level: "materialize",
    run_id: bundle.manifest.run_id,
    format_version: bundle.manifest.format_version,
    canonicalization: bundle.manifest.format_version === 2 ? bundle.manifest.canonicalization : RUN_BUNDLE_CANONICALIZATIONS[0],
    record_catalogue_ref: bundle.manifest.format_version === 2 ? bundle.manifest.record_catalogue_ref : contentHash7(recordVersionCatalogue2()),
    projection_kind: "run-head",
    fold_profile: bundle.manifest.format_version === 2 ? bundle.manifest.fold_profile : RUN_HEAD_FOLD_VERSION,
    frontier: {
      record_count: bundle.records.length,
      logical_clock: last?.logical_clock ?? 0,
      record_id: last?.record_id ?? null,
      chain_head: bundle.manifest.chain_head
    },
    state_hash: stateHash,
    projection: { ...projection },
    diagnostics: []
  });
}
if (RUN_HEAD_FOLD_VERSION !== RUN_HEAD_FOLD_PROFILES2[0]) {
  throw new Error("the public materializer fold profile differs from the runtime fold profile. Release one profile from contracts and projections.");
}
export {
  materializeRunBundle
};
