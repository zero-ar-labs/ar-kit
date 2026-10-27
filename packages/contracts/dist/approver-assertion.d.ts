import type { KeyObject } from 'node:crypto';
import type { VerifiedRepresentedActor } from './external-observations.js';
import type { ApproverAssertionAlgorithm } from './vocab.js';
export declare const APPROVER_ASSERTION_TYPE = "zero-ar-approver+jwt";
export declare const APPROVER_ASSERTION_MAX_LIFETIME_SECONDS = 600;
export declare const APPROVER_ASSERTION_MAX_CLOCK_SKEW_SECONDS = 300;
export declare const APPROVER_ASSERTION_USE_RETENTION_SECONDS: number;
export declare const APPLICATION_ATTESTED_ISSUER_PREFIX = "urn:zero-ar:application:";
export declare function applicationAttestedIssuer(application_principal: string): string;
export declare function isApplicationAttestedIssuer(issuer: string): boolean;
export declare function approverAssertionAlgorithm(key: KeyObject): ApproverAssertionAlgorithm | null;
export interface ApproverAssertionInput {
    subject: string;
    audience: string;
    tenant: string;
    key_id: string;
    lifetime_seconds?: number;
    credential_id?: string;
    now?: Date;
}
export declare function signApproverAssertion(input: ApproverAssertionInput, key: KeyObject): string;
export interface ApproverAssertionUse {
    use_ref: string;
    request_binding: string;
    expires_at: string;
    now: string;
}
export declare function approverAssertionUse(actor: Pick<VerifiedRepresentedActor, 'issuer' | 'credential_id'> | null, request_binding: string, now_ms: number): ApproverAssertionUse | null;
export declare function recordApproverAssertionUse(claim: ((use: ApproverAssertionUse) => Promise<boolean>) | undefined, use: ApproverAssertionUse | null): Promise<void>;
