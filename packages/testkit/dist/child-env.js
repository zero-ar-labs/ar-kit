export function noColorEnv(extra = {}) {
    const { FORCE_COLOR: _forced, ...inherited } = process.env;
    return { ...inherited, NO_COLOR: '1', ...extra };
}
