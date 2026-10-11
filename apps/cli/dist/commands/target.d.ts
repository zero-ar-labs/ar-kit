import type { EffectTargetRoute, EffectTargetWire } from '@zero-ar/contracts';
import type { CliCommandModule } from './command.js';
export declare const targetCommand: CliCommandModule;
export interface TargetCheckEntry {
    target: string;
    version: string;
    endpoint: string;
    operations: Record<string, EffectTargetRoute>;
    wire?: EffectTargetWire;
    receipt_key_pem?: string;
    headers?: Record<string, string>;
}
export interface TargetCheckOptions {
    operation: string;
    params: Record<string, unknown>;
    refuse_params?: Record<string, unknown>;
    secret: string;
    fetch_impl?: typeof fetch;
    timeout_ms?: number;
}
export type TargetCheckResult = 'pass' | 'warn' | 'fail' | 'skip';
export interface TargetCheckLine {
    id: 'endpoint' | 'signed-call' | 'repeated-key' | 'other-secret' | 'stale-call' | 'refused-call' | 'lookup-applied' | 'lookup-unknown-key';
    result: TargetCheckResult;
    detail: string;
}
export interface TargetCheckReport {
    check: 'zero-ar.target-check';
    version: 1;
    target: string;
    target_version: string;
    endpoint: string;
    operation: string;
    wire: EffectTargetWire;
    checked_at: string;
    passed: boolean;
    checks: TargetCheckLine[];
}
export declare function checkTarget(entry: TargetCheckEntry, options: TargetCheckOptions): Promise<TargetCheckReport>;
export declare function renderTargetCheck(report: TargetCheckReport): string;
