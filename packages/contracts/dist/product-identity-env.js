import { SUCCESSOR_PRODUCT_IDENTITY } from "./product-identity.generated.js";
export function productEnvironmentNames(suffix) {
    if (!/^[A-Z][A-Z0-9_]*$/.test(suffix)) {
        throw new Error(`error identity.env.name: ${suffix} is not a product environment suffix. Use capital letters, numbers, and underscores.`);
    }
    return { suffix, name: `${SUCCESSOR_PRODUCT_IDENTITY.environment_prefix}${suffix}` };
}
export function resolveProductEnvironment(suffix, env, defaultValue) {
    const names = productEnvironmentNames(suffix);
    const value = env[names.name];
    if (value !== undefined)
        return { ...names, source: 'set', value };
    if (defaultValue !== undefined)
        return { ...names, source: 'default', value: defaultValue };
    return { ...names, source: 'absent' };
}
export function productEnvironmentValue(suffix, env, defaultValue) {
    return resolveProductEnvironment(suffix, env, defaultValue).value;
}
