/**
 * @zero-ar/conformance: harnesses a third party runs against its own build.
 *
 * What this is: the versioned conformance batteries an implementer uses to
 * check an adapter or a profile against the generated contracts. A harness
 * reports what an implementation did. It makes no claim about domain truth,
 * and it decides nothing about a run.
 *
 * How it fits: ERD 16.3 names conformance a supported public package. The
 * repository's own vector suite is a different thing and lives in
 * `@zero-ar/vectors`, because those vectors assert this build rather than
 * offering a harness anyone else can run.
 */
export { runEnvironmentAdapterConformance } from "./environment-adapter.js";
