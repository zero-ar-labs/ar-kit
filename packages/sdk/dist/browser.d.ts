/**
 * Public browser declaration builders.
 *
 * These functions author and verify immutable contract values. They do not
 * launch a browser or import the conditional implementation package.
 */
import type { BrowserBinding, BrowserDestinationDecision, BrowserDestinationProposal, BrowserToolDeclaration } from '@zero-ar/contracts';
export declare function defineBrowserBinding(spec: Omit<BrowserBinding, 'binding_ref'>): BrowserBinding;
export declare function proposeBrowserDestination(spec: Omit<BrowserDestinationProposal, 'proposal_ref'>): BrowserDestinationProposal;
export declare function recordBrowserDestinationDecision(spec: Omit<BrowserDestinationDecision, 'decision_ref'>): BrowserDestinationDecision;
export declare function authorizeBrowserDestination(binding: BrowserBinding, proposal: BrowserDestinationProposal, decision: BrowserDestinationDecision): BrowserBinding;
export declare function declareBrowserTools(binding: BrowserBinding): BrowserToolDeclaration[];
