/**
 * Public browser declaration builders.
 *
 * These functions author and verify immutable contract values. They do not
 * launch a browser or import the conditional implementation package.
 */
import { BrowserDestinationDecisionSchema, BrowserDestinationProposalSchema, applyBrowserDestinationDecision, browserToolDeclarations, compileBrowserBinding, deriveBrowserBindingRef, deriveBrowserDestinationDecisionRef, deriveBrowserDestinationProposalRef, } from '@zero-ar/contracts';
export function defineBrowserBinding(spec) {
    const material = {
        ...spec,
        destinations: [...spec.destinations]
            .map((destination) => ({
            ...destination,
            methods: [...destination.methods].sort(),
            resource_types: [...destination.resource_types].sort(),
            path_prefixes: [...destination.path_prefixes].sort(),
            resolved_addresses: [...destination.resolved_addresses].sort(),
            sensitive_query_fields: [...destination.sensitive_query_fields].sort(),
        }))
            .sort((left, right) => left.origin.localeCompare(right.origin)),
        credentials: [...spec.credentials]
            .map((credential) => ({ ...credential, origins: [...credential.origins].sort() }))
            .sort((left, right) => `${left.scope}:${left.credential_ref}`.localeCompare(`${right.scope}:${right.credential_ref}`)),
        effect_policies: [...spec.effect_policies]
            .map((policy) => ({ ...policy, selectors: [...policy.selectors].sort() }))
            .sort((left, right) => left.operation.localeCompare(right.operation)),
    };
    return compileBrowserBinding({ ...material, binding_ref: deriveBrowserBindingRef(material) });
}
export function proposeBrowserDestination(spec) {
    const proposal = BrowserDestinationProposalSchema.parse({ ...spec, proposal_ref: deriveBrowserDestinationProposalRef(spec) });
    return Object.freeze(proposal);
}
export function recordBrowserDestinationDecision(spec) {
    const decision = BrowserDestinationDecisionSchema.parse({ ...spec, decision_ref: deriveBrowserDestinationDecisionRef(spec) });
    return Object.freeze(decision);
}
export function authorizeBrowserDestination(binding, proposal, decision) {
    return applyBrowserDestinationDecision(binding, proposal, decision);
}
export function declareBrowserTools(binding) {
    return browserToolDeclarations(compileBrowserBinding(binding));
}
