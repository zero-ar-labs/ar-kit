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
