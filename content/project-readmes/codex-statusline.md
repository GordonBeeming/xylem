---
title: "Codex Statusline"
fetchedAt: 2026-10-21
sourceRepo: "GordonBeeming/codex-statusline"
sourceBranch: "main"
visibility: public
---

# codex-statusline

A genuine command-backed, multiline status line for the native Codex CLI.

```text
📂 codex-statusline · 🤖 GPT-5.6 Sol · ⚡ high · Working · 2/5 tasks
🔀 gb/native-statusline
⏱️ ████░░░░░░ 42% 5h · 📅 █░░░░░░░░░ 18% weekly
💭 ███░░░░░░░ 31% ctx · 🧠 89.0k in / 14.0k out
```

This project mirrors the layout and extension model of
[`claude-statusline`](https://github.com/GordonBeeming/claude-statusline), but it renders inside
Codex's Ratatui interface rather than faking a footer through terminal output or tmux.

## Why a patched build?

Official Codex currently accepts only built-in identifiers in `tui.status_line`. It does not invoke
user commands, and its released footer deliberately stays on one line. The native patch in this
repository adds both missing capabilities:

- `[tui.status_line_command]` executes a user-level argv command asynchronously.
- Codex sends a versioned JSON session snapshot on stdin.
- Up to eight ANSI-SGR styled output lines can be rendered as fixed footer rows.
- Slow or failing commands keep the last successful output and never block drawing.
- Command output is capped and strips OSC, control, and bidirectional override sequences.
- Project-local `.codex/config.toml` files cannot register a status command.

The related upstream requests are
[`openai/codex#17827`](https://github.com/openai/codex/issues/17827) and
[`openai/codex#21653`](https://github.com/openai/codex/issues/21653). OpenAI's repository does not
accept external pull requests, so this project ships a reviewable patch against one pinned upstream
commit instead of maintaining a full source fork.

## Install and keep up to date

On Apple Silicon macOS, install Python 3.12+ and `jq`, clone this repository, then run:

```bash
./install.sh --auto-update
```

The installer downloads the latest tested public package, verifies its SHA-256 checksum and CLI
version, and configures the renderer. The optional `--auto-update` flag installs a user LaunchAgent
that checks every six hours and at login. Updates take effect in new CLI sessions; running sessions
continue using their current binary. Downloads and failed checks leave the installed release intact.

To update immediately or disable background checks:

```bash
python3 scripts/update.py
python3 scripts/auto-update.py disable
```

Update logs are in `~/.local/share/codex-statusline/update.log` and `update-error.log`. The `previous`
symlink records the preceding installation. The official `codex` command remains available.
Older packages are retained so you can launch `previous/bin/codex` from the share directory for
rollback. Remove unused release directories when you no longer need them; never remove `current`
or a package still used by a running session. Each release also carries the updater for future checks.
Automatic updates trust packages published by this repository; checksums detect damaged downloads,
but are not an independent signature. Packages are currently neither signed nor notarized.

## Build from source

Requirements:

- macOS on Apple Silicon for the currently tested package
- Git, Rustup, Python 3.12+, DotSlash, and `jq`
- Enough free disk space for a Codex release build

Run:

```bash
./install.sh --source
```

The builder:

1. Verifies the patch checksum and exact upstream commit in `upstream.lock`.
2. Clones that commit into a temporary directory.
3. Checks and applies `patches/native-statusline.patch`.
4. Uses Codex's canonical package builder, including the code-mode host and bundled resources.
5. Installs a versioned package under `~/.local/share/codex-statusline/releases/`.
6. Creates the separate `~/.local/bin/codex-statusline` launcher.

The official npm-managed `codex` command is left untouched as a rollback path.

The default is a release-profile build. For a faster, much larger local trial build, run
`CODEX_STATUSLINE_CARGO_PROFILE=dev ./install.sh --source`.

## Configure Codex

Add this user-level configuration to `~/.codex/config.toml`:

```toml
[tui]
status_line = []
terminal_title = ["spinner", "project"]

[tui.status_line_command]
command = ["/Users/YOU/.local/share/codex-statusline/current/renderer/statusline.sh"]
refresh_interval_ms = 1000
timeout_ms = 1000
max_lines = 4
```

Then launch:

```bash
codex-statusline
```

The patched binary deliberately ignores `tui.status_line_command` in repository configuration.
Only user, system, managed, or explicit runtime configuration may register an executable command.

## JSON contract

The renderer receives `schema_version: 1` with these groups:

- Thread identity, name, model, reasoning effort, and current run state
- Active working directory
- Canonical context used/remaining percentages and token totals
- Five-hour and weekly rate-limit windows when available
- Backend-provided thread cost/credits when the account exposes them
- Current task progress and terminal width

Unavailable fields are `null` or omitted by the corresponding nested value. Scripts should ignore
unknown fields so the payload can grow without breaking existing renderers.

## Cost semantics

Codex is included in ChatGPT plans, so token pricing is not a subscription invoice. The renderer
shows a session cost only when the backend provides a non-zero thread estimate. It does not derive
one from token counts because model switches, long-context rates, and cache semantics can make that
estimate misleading.

The renderer does not invent a daily monetary total. Codex currently provides rate-limit usage, not
a trustworthy daily ChatGPT subscription spend figure.

## Validate

Fast repository checks:

```bash
./scripts/verify.sh
```

The native patch has also been validated against the pinned Codex source with:

```bash
cd codex-rs
just fmt
cargo check -p codex-tui
just test -p codex-tui
```

For the 0.160.0 port, 1,166 TUI tests covering the release gate passed locally, including the
command renderer, bottom pane, and multiline footer. Public builds use the focused gate defined in
`scripts/build-native.sh`. The full upstream suite is outside this gate; its version-sensitive
snapshots and terminal/editor tests need separate validation.

Pull requests also run the focused native gate and canonical package build on Apple Silicon
macOS against both the checked-in baseline and the latest stable release candidate. These checks
never publish or activate a package. This catches upstream drift and native regressions before a
patch update is merged.

## Updating upstream

The `Track Codex releases` GitHub Actions workflow checks the latest stable OpenAI release every
six hours, on pushes to `main`, and on manual dispatch. It resolves the release to an exact commit,
applies the patch, runs the status-line TUI tests, and builds the canonical package. Only successful
builds are published. Each release includes the resolved `upstream.lock`, patch, package, and checksum
manifest. The checked-in lock remains the baseline for reproducible source builds.

The TUI tests use the upstream development profile because their command snapshots and recovery
checks expect debug-only commands. Published packages still use the optimized release profile.

When an upstream change conflicts with the patch or fails its tests, the workflow fails and retains
the last public release. A maintainer must port the patch, update its checksum and baseline lock,
and push the fix before updates resume. Enable GitHub Actions failure notifications to catch these
breaks. Automation cannot guarantee compatibility with arbitrary upstream source changes.

Scheduled workflows run from the default branch, so changes to the automation must be merged there
before public updates start. GitHub may disable schedules after 60 days without repository activity;
re-enable the workflow in Actions if that happens. Local checks require a published package and an
active macOS login session. They do not compile Rust on your machine.

## License and attribution

Licensed under Apache-2.0. OpenAI Codex's NOTICE and the credited source implementations are under
`THIRD_PARTY_NOTICES/`.
