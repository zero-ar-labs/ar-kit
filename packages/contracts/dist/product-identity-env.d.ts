/**
 * Product environment variables.
 *
 * What this is: the one place that turns a configuration suffix into the
 * environment variable name the product reads, `ZERO_AR_<SUFFIX>`, and
 * reads it. Every process resolves configuration through here, so a
 * variable name is never spelled by hand and a rename is one edit.
 *
 * How it fits: the identity cutover left one prefix. There is no legacy
 * prefix to consult and no conflict to refuse, so a missing value is
 * simply absent or defaulted.
 */
export type ProductEnvironmentSource = 'set' | 'default' | 'absent';
export interface ProductEnvironmentNames {
    suffix: string;
    name: string;
}
export interface ProductEnvironmentResolution extends ProductEnvironmentNames {
    source: ProductEnvironmentSource;
    value?: string;
}
export declare function productEnvironmentNames(suffix: string): ProductEnvironmentNames;
export declare function resolveProductEnvironment(suffix: string, env: Record<string, string | undefined>, defaultValue?: string): ProductEnvironmentResolution;
export declare function productEnvironmentValue(suffix: string, env: Record<string, string | undefined>, defaultValue?: string): string | undefined;
