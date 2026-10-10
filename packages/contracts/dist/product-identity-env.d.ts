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
