# Zero-AR Developer Kit

Zero-AR is a log-native runtime for long-horizon agent work. This repository is the generated public package boundary for applications, authoring tools, conformance harnesses and MCP integrations. It contains emitted JavaScript, TypeScript declarations and the versioned OpenAPI contract. It contains no runtime server, storage implementation, private package or private repository history.

## Source binding

This tree was exported from private source commit `38a5b2d0c216ecf58ac5ac597a70f2e5fec63b12`. Verify every byte and that binding with:

```bash
npm run verify
```

Install and execute all nine package tarballs in a temporary consumer with:

```bash
npm run exercise
```

Neither command publishes a package. npm publication remains a separate owner action.

## Packages

- `@zero-ar/contracts`
- `@zero-ar/client`
- `@zero-ar/sdk`
- `@zero-ar/cli`
- `@zero-ar/conformance`
- `@zero-ar/tool-kit`
- `@zero-ar/mcp`
- `@zero-ar/testkit`
- `@zero-ar/validator-kit`

The packaged command is a public API client. Use `--url` or `ZERO_AR_URL` with `ZERO_AR_API_KEY` for hosted work. Bundled Local Lite is distributed separately because its runtime server is not part of this public package tree.

## License

Apache-2.0. See `LICENSE` and `NOTICE`.
