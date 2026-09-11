# Provenance

The package payloads and machine contracts in this public tree are a generated
export. Their private source commit is
`30ea6e0b1b9ec8f9147a06c7e456a1ec516cc41d` in
`https://github.com/zero-ar-labs/zero-ar`. The package-set identity is
`sha256:c318c4e80931217fc82c424d89b1574400bd2c505060c876b431af8a8f8f8f1f`.
The public repository may add documentation and release-operation files after
that immutable export. Those additions do not change the package source
binding. The public manifest lists the byte count and SHA-256 digest of every
current file outside the manifest itself.

The public repository starts with fresh history. The private Git history is not copied or rewritten into it. The package tarballs were built, scanned, installed and exercised before export. The public check repeats the file verification and clean-consumer package exercise.

The export operation did not publish to npm. A later repository workflow
published the exact nine recorded tarballs as `@zero-ar/*@0.1.0` with npm
provenance, then installed and exercised them from clean consumers. npm's
first-publication behavior assigned both the `alpha` and `latest` tags to
`0.1.0`; consumers should pin `0.1.0` while it remains a prerelease.
