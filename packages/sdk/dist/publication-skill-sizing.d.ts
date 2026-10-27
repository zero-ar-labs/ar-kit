import type { Diagnostic } from '@zero-ar/contracts';
import type { CompiledBundle } from './publication.js';
export interface PublicationSkillSizingOptions {
    context_budget_tokens?: number;
}
export declare function publicationSkillWarnings(compiled: CompiledBundle, options?: PublicationSkillSizingOptions): Diagnostic[];
