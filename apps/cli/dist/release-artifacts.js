import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { SUCCESSOR_PRODUCT_IDENTITY } from '@zero-ar/contracts';
import { CLI_COMMANDS, CLI_USAGE_ROWS } from "./identity.js";
export function cliReleaseArtifacts() {
    const successor = {
        target: 'successor',
        command: SUCCESSOR_PRODUCT_IDENTITY.command,
        display_name: SUCCESSOR_PRODUCT_IDENTITY.display_name,
        slug: SUCCESSOR_PRODUCT_IDENTITY.slug,
        environment_prefix: SUCCESSOR_PRODUCT_IDENTITY.environment_prefix,
    };
    return [
        artifact(`share/completions/${successor.command}.bash`, 'shell-completion', successor, false, renderBashCompletion(successor)),
        artifact(`share/man/man1/${successor.command}.1`, 'manpage', successor, false, renderManpage(successor)),
        artifact(`install/install-${successor.command}.sh`, 'install-script', successor, true, renderInstallScript(successor)),
        artifact(`systemd/${successor.command}-full-cell.service`, 'service-unit', successor, false, renderServiceUnit(successor)),
        artifact(`examples/${successor.command}-first-run.sh`, 'example', successor, true, renderExample(successor)),
    ].sort((a, b) => a.path.localeCompare(b.path));
}
export function writeCliReleaseArtifacts(root) {
    const artifacts = cliReleaseArtifacts();
    for (const releaseArtifact of artifacts) {
        const path = join(root, releaseArtifact.path);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, releaseArtifact.content, { mode: releaseArtifact.executable ? 0o755 : 0o644 });
    }
    return artifacts;
}
function artifact(path, kind, identity, executable, content) {
    return {
        path,
        kind,
        command: identity.command,
        target: identity.target,
        executable,
        sha256: createHash('sha256').update(content).digest('hex'),
        content,
    };
}
function renderBashCompletion(identity) {
    const commandList = CLI_COMMANDS.join(' ');
    return [
        `# ${identity.display_name} bash completion.`,
        '# Generated from apps/cli/src/identity.ts. Do not edit by hand.',
        `_${identity.command}_completion() {`,
        '  local current="${COMP_WORDS[COMP_CWORD]}"',
        `  local commands="${commandList}"`,
        '  if [ "${COMP_CWORD}" -eq 1 ]; then',
        '    COMPREPLY=( $(compgen -W "${commands}" -- "${current}") )',
        '    return 0',
        '  fi',
        '  COMPREPLY=()',
        '}',
        `complete -F _${identity.command}_completion ${identity.command}`,
        '',
    ].join('\n');
}
function renderManpage(identity) {
    const rows = CLI_USAGE_ROWS.flatMap((row) => [
        '.TP',
        `.B ${escapeRoff(`${identity.command} ${row.syntax}`)}`,
        escapeRoff(row.summary),
    ]);
    return [
        `.TH ${identity.command.toUpperCase()} 1 "2026-10-09" "${SUCCESSOR_PRODUCT_IDENTITY.display_name} 0.4.2" "${SUCCESSOR_PRODUCT_IDENTITY.display_name} user commands"`,
        '.SH NAME',
        `${identity.command} \\- ${identity.display_name} command`,
        '.SH SYNOPSIS',
        `.B ${identity.command}`,
        '.I command',
        '.RI [ arguments ]',
        '.SH DESCRIPTION',
        escapeRoff(`${SUCCESSOR_PRODUCT_IDENTITY.canonical_introduction} The ${identity.command} command speaks only to the public API.`),
        '.SH COMMANDS',
        ...rows,
        '.SH COMPATIBILITY',
        escapeRoff(compatibilityLine(identity)),
        '',
    ].join('\n');
}
export const RELEASE_KEY_FINGERPRINT = '7E5FE75754B236B53FDF5A1CA050DB8D0B817918';
function renderInstallScript(identity) {
    const slug = SUCCESSOR_PRODUCT_IDENTITY.slug;
    const prefix = identity.environment_prefix;
    return [
        '#!/usr/bin/env sh',
        `# ${identity.display_name} Local Lite installer. Generated release artifact.`,
        '#',
        `# usage: install-${identity.command}.sh install  <bundle.tar.gz> [<bundle.tar.gz.asc>]`,
        `#        install-${identity.command}.sh update   <bundle.tar.gz> [<bundle.tar.gz.asc>]`,
        `#        install-${identity.command}.sh rollback`,
        `#        install-${identity.command}.sh doctor`,
        `#        install-${identity.command}.sh uninstall`,
        '#',
        '# The signature is verified against the pinned release key before anything',
        '# is activated. The previous version stays for rollback, and the doctor runs',
        '# after every activation; a failing doctor restores the previous version.',
        `# PREFIX chooses the install prefix (default /usr/local); ${prefix}INSTALL_ROOT the`,
        `# version store; ${prefix}RELEASE_KEY the public key file; ${prefix}NODE the node binary.`,
        'set -eu',
        'prefix="${PREFIX:-/usr/local}"',
        `root="\${${prefix}INSTALL_ROOT:-\${prefix}/lib/${slug}}"`,
        `bin="\${prefix}/bin/${identity.command}"`,
        `key="\${${prefix}RELEASE_KEY:-}"`,
        `fingerprint="\${${prefix}RELEASE_KEY_FINGERPRINT:-${RELEASE_KEY_FINGERPRINT}}"`,
        `node_bin="\${${prefix}NODE:-node}"`,
        '',
        'fail() { echo "error install: $*" >&2; exit 1; }',
        'say() { echo "install: $*"; }',
        '',
        'verify() {',
        '  bundle="$1"; sig="${2:-}"',
        '  if [ -z "$sig" ]; then',
        `    if [ "\${${prefix}ALLOW_UNSIGNED:-0}" = "1" ]; then say "unsigned bundle admitted by ${prefix}ALLOW_UNSIGNED=1"; return 0; fi`,
        `    fail "no signature named for $bundle. Pass the detached signature, or set ${prefix}ALLOW_UNSIGNED=1 for a bundle you built yourself."`,
        '  fi',
        `  [ -n "$key" ] || fail "${prefix}RELEASE_KEY must name the release public key file to verify $sig."`,
        '  command -v gpg >/dev/null 2>&1 || fail "gpg is not on the path. Install GnuPG and run again."',
        '  home=$(mktemp -d)',
        '  ring="$home/release.kbx"',
        '  gpg --homedir "$home" --batch --no-tty --no-default-keyring --keyring "$ring" --import "$key" >/dev/null 2>&1 || { rm -rf "$home"; fail "the release key $key did not import."; }',
        '  if ! gpg --homedir "$home" --batch --no-tty --no-default-keyring --keyring "$ring" --with-colons --list-keys 2>/dev/null | grep -q "$fingerprint"; then',
        '    rm -rf "$home"; fail "the key file $key does not carry the pinned fingerprint $fingerprint."',
        '  fi',
        '  status=$(gpg --homedir "$home" --batch --no-tty --no-default-keyring --keyring "$ring" --status-fd 1 --verify "$sig" "$bundle" 2>/dev/null || true)',
        '  rm -rf "$home"',
        '  echo "$status" | grep -q "^\\[GNUPG:\\] VALIDSIG $fingerprint" || fail "the signature $sig does not verify against the pinned release key for $bundle. Nothing was activated."',
        '  say "signature verified against $fingerprint"',
        '}',
        '',
        'manifest_field() {',
        "  tar -xzOf \"$1\" local-lite-manifest.json | \"$node_bin\" -e 'let s=\"\";process.stdin.on(\"data\",d=>s+=d).on(\"end\",()=>{const m=JSON.parse(s);process.stdout.write(String(m[process.argv[1]]??\"\"))})' \"$2\"",
        '}',
        '',
        'checksums() {',
        "  \"$node_bin\" -e 'const c=require(\"node:crypto\"),f=require(\"node:fs\"),p=require(\"node:path\");const m=JSON.parse(f.readFileSync(p.join(process.argv[1],\"local-lite-manifest.json\"),\"utf8\"));for(const e of m.files){const h=c.createHash(\"sha256\").update(f.readFileSync(p.join(process.argv[1],e.path))).digest(\"hex\");if(h!==e.sha256){console.error(\"checksum mismatch \"+e.path);process.exit(1)}}' \"$1\"",
        '}',
        '',
        'activate() { ln -sfn "versions/$1" "$root/current"; }',
        '',
        'wrapper() {',
        '  mkdir -p "${prefix}/bin"',
        '  printf \'#!/usr/bin/env sh\\nexec "${%sNODE:-node}" "%s/current/dist/%s.mjs" "$@"\\n\' "' + prefix + '" "$root" "' + identity.command + '" > "$bin"',
        '  chmod 755 "$bin"',
        '}',
        '',
        'health() { "$bin" doctor --json > "$root/doctor-report.json" 2>/dev/null; }',
        '',
        'bad_version() {',
        '  fail "$1 names the version $2, which is not one plain release version such as 0.4.0. A version starts with a digit and holds only letters, digits, dots, plus signs and hyphens. Nothing was changed."',
        '}',
        '',
        'place() {',
        '  bundle="$1"; sig="${2:-}"',
        '  [ -f "$bundle" ] || fail "$bundle does not exist."',
        '  verify "$bundle" "$sig"',
        '  version=$(manifest_field "$bundle" version)',
        '  [ -n "$version" ] || fail "$bundle carries no local-lite-manifest.json version."',
        '  # The version names one directory under versions/: it starts with a digit',
        '  # and holds only letters, digits, dots, plus signs and hyphens, never a',
        '  # slash or two dots in a row, so the target cannot leave the version store.',
        '  case "$version" in [0-9]*) ;; *) bad_version "$bundle" "$version" ;; esac',
        '  case "$version" in *[!0-9A-Za-z.+-]*|*..*) bad_version "$bundle" "$version" ;; esac',
        '  target="$root/versions/$version"',
        '  [ "${target%/*}" = "$root/versions" ] || bad_version "$bundle" "$version"',
        '  # Unpack and check beside the store first, so a bundle that fails leaves',
        '  # every installed version as it was.',
        '  mkdir -p "$root/versions"',
        '  staging=$(mktemp -d "$root/versions/.incoming.XXXXXX") || fail "no staging directory could be made under $root/versions. Check that it is writable, and run again."',
        '  tar -xzf "$bundle" -C "$staging" || { rm -rf "$staging"; fail "$bundle did not unpack. Nothing was changed."; }',
        '  checksums "$staging" || { rm -rf "$staging"; fail "$bundle does not match its own manifest. Nothing was changed."; }',
        '  replaced=""',
        '  if [ -e "$target" ]; then replaced="$target.replaced"; rm -rf "$replaced"; mv "$target" "$replaced"; fi',
        '  mv "$staging" "$target"',
        '  previous=$(readlink "$root/current" 2>/dev/null || true)',
        '  if [ -n "$previous" ] && [ "$previous" != "versions/$version" ]; then ln -sfn "$previous" "$root/previous"; fi',
        '  activate "$version"',
        '  wrapper',
        '  if health; then',
        '    if [ -n "$replaced" ]; then rm -rf "$replaced"; fi',
        '    say "version $version active at $root/current; doctor report at $root/doctor-report.json"',
        '  else',
        '    if [ -n "$replaced" ]; then rm -rf "$target"; mv "$replaced" "$target"; fi',
        '    if [ -n "$previous" ] && [ "$previous" != "versions/$version" ]; then',
        '      ln -sfn "$previous" "$root/current"',
        '      fail "the doctor failed after activating $version; $previous is active again. See $root/doctor-report.json."',
        '    fi',
        '    if [ -n "$replaced" ]; then',
        '      fail "the doctor failed after reinstalling $version; the copy installed before is restored. See $root/doctor-report.json."',
        '    fi',
        '    rm -f "$root/current" "$bin"',
        '    fail "the doctor failed after activating $version and no previous version exists. See $root/doctor-report.json."',
        '  fi',
        '}',
        '',
        'case "${1:-}" in',
        '  install) place "${2:-}" "${3:-}" ;;',
        '  update)',
        '    [ -L "$root/current" ] || fail "nothing is installed under $root; run install first."',
        '    place "${2:-}" "${3:-}" ;;',
        '  rollback)',
        '    previous=$(readlink "$root/previous" 2>/dev/null || true)',
        '    [ -n "$previous" ] || fail "no previous version is kept under $root."',
        '    current=$(readlink "$root/current" 2>/dev/null || true)',
        '    ln -sfn "$previous" "$root/current"',
        '    [ -n "$current" ] && ln -sfn "$current" "$root/previous"',
        '    wrapper',
        '    health || fail "the doctor failed after rolling back to $previous. See $root/doctor-report.json."',
        '    say "rolled back to $previous" ;;',
        '  doctor)',
        '    health || { cat "$root/doctor-report.json" 2>/dev/null; fail "the doctor reports a failing installation."; }',
        '    cat "$root/doctor-report.json" ;;',
        '  uninstall)',
        '    rm -rf "$root" "$bin"',
        `    say "removed $root and $bin; profile data stays in ${SUCCESSOR_PRODUCT_IDENTITY.local_data_directory} under each project directory until you remove it" ;;`,
        `  *) fail "usage: install-${identity.command}.sh install|update <bundle.tar.gz> [<bundle.tar.gz.asc>] | rollback | doctor | uninstall" ;;`,
        'esac',
        '',
    ].join('\n');
}
function renderServiceUnit(identity) {
    return [
        '[Unit]',
        `Description=${SUCCESSOR_PRODUCT_IDENTITY.display_name} Full Cell (${identity.command})`,
        'After=network-online.target',
        'Wants=network-online.target',
        '',
        '[Service]',
        'Type=simple',
        `# DynamicUser allocates the ${identity.slug} user and group when the unit starts, so no install step`,
        `# creates an account. StateDirectory creates /var/lib/${identity.slug} owned by that user; under`,
        '# ProtectSystem=strict it is the only writable path besides the private /tmp. The hosted config',
        '# file must be readable by other users; systemd reads the environment file before the user is set.',
        '# --disable-sigusr1 keeps a SIGUSR1 from opening an inspector into the supervisor.',
        'DynamicUser=yes',
        `User=${identity.slug}`,
        `Group=${identity.slug}`,
        `StateDirectory=${identity.slug}`,
        'StateDirectoryMode=0750',
        'NoNewPrivileges=yes',
        'ProtectSystem=strict',
        'PrivateTmp=yes',
        `EnvironmentFile=-/etc/${identity.slug}/${identity.command}.env`,
        `Environment=${identity.environment_prefix}PROFILE=small-production`,
        `ExecStart=/usr/bin/node --disable-sigusr1 /opt/${SUCCESSOR_PRODUCT_IDENTITY.slug}/dist/full-cell.mjs`,
        'Restart=on-failure',
        'RestartSec=5s',
        '',
        '[Install]',
        'WantedBy=multi-user.target',
        '',
    ].join('\n');
}
function renderExample(identity) {
    return [
        '#!/usr/bin/env sh',
        `# ${identity.display_name} command example.`,
        '# Generated from the CLI command table so docs and artifacts stay aligned.',
        'set -eu',
        `${identity.command} profile --json`,
        `${identity.command} doctor --json`,
        `${identity.command} run "Summarise the objective"`,
        '',
    ].join('\n');
}
function compatibilityLine(identity) {
    return `${identity.command} is a compatibility shim for ${SUCCESSOR_PRODUCT_IDENTITY.command}. It invokes the same command implementation and emits a diagnostic notice outside stdout.`;
}
function escapeRoff(value) {
    return value.replace(/\\/g, '\\\\').replace(/-/g, '\\-');
}
