import { z } from 'zod';
import { StaticGrantSchema } from "./effects.js";
import { EFFECT_PLANE_MODES } from "./vocab.js";
const hash = z.string().regex(/^sha256:[0-9a-f]{64}$/, 'expected sha256:<64 hex>');
const runId = z.string().regex(/^run_[0-9a-f]{32}$/, 'expected a run id');
export const EffectTargetListSchema = z.strictObject({
    mode: z.enum(EFFECT_PLANE_MODES),
    targets: z.array(z.strictObject({
        target: z.string().min(1).max(128),
        version: z.string().min(1).max(64),
        operations: z.array(z.string().min(1).max(128)).max(256),
    })).max(1_000),
});
export const EffectGrantReissueRequestSchema = z.strictObject({
    superseded_grant_ref: hash,
    prior_run_id: runId,
    reason: z.string().min(1).max(1_000),
});
export const EffectGrantReissueOutcomeSchema = z.strictObject({
    run_id: runId,
    superseded_ref: hash,
    replacement_ref: hash,
    replacement_grant: StaticGrantSchema,
    identity_diff: z.array(z.string().min(1).max(300)),
    approver: z.string().min(1).max(256),
});
