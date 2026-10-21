---
title: "ide"
fetchedAt: 2026-10-21
sourceRepo: "GordonBeeming/ide"
sourceBranch: "main"
visibility: public
---

<h1 align="center">
  <img src="/assets/projects/ide/icon-animated.svg" alt="ide — a fast, lightweight, cross-platform code editor" width="160">
</h1>

A lean, fast code editor built for local control and agent-friendly context. Tauri shell, Rust backend, CodeMirror editor: it opens fast, stays light, and stays out of your way.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/assets/projects/ide/app-dark.png">
    <img src="/assets/projects/ide/app-light.png" alt="The ide app — file tree, editor with git attribution, and commit info" width="800">
  </picture>
</p>

This isn't a VS Code rebuild. It's a focused editor shell: open a folder, read and change code, commit, and give your AI tools real editor context — without extensions, background indexing surprises, or a plugin marketplace.

## What you get

**A shell that stays simple.** An activity rail switches between Files, Search, and Source control. Quick open and a command palette cover the keyboard paths, IntelliJ-style shortcuts work out of the box, and a searchable key-bindings dialog shows what's available.

**Search that's honest.** One panel, two scopes: file `names` or file `contents`. Results are bounded by limits you control in Settings, and the UI tells you when a cap truncated the results instead of pretending the list is complete.

**Git without leaving the editor.** Tick the files you want and commit from the sidebar. Fetch, pull, and push with a Sync button that walks you through merge conflicts as you resolve them. See who last touched the current file inline, and click the status bar for the full commit card — message, author with avatar, and an Open in GitHub link when the repo has a remote. Both git features are on by default and can be switched off in Settings.

**A real editor.** CodeMirror 6 with syntax highlighting for around 25 languages, from Rust and TypeScript to SQL and Dockerfiles. Install a language server (`rust-analyzer`, `typescript-language-server`, a C# LSP) and you get go-to-definition, find references, rename, hover, and a diagnostics panel — all optional, per language.

**Your look.** Light, dark, or follow-the-system themes with a one-click toggle on the rail. Pick the code font (IBM Plex Mono or your system mono). Right-click menus are tailored to each surface — tree, tabs, editor, search, commit panel.

**Built for agents.** This is the differentiator: the editor exposes its context to AI coding tools running next to it.

- Claude Code discovers a running ide through `/ide` — no config needed.
- Codex (and any MCP client) can read editor context through a local, token-protected MCP endpoint. Copy the config from the app's integrations panel into `~/.codex/config.toml`:

  ```toml
  [mcp_servers.ide]
  url = "http://127.0.0.1:17877/mcp"
  http_headers = { Authorization = "Bearer paste-token-from-ide" }
  ```

**A native citizen.** File associations for common code and text files, a macOS Finder Quick Action (right-click → Open in ide), and one app process with per-workspace windows so the Dock stays tidy.

## Get started

Grab a packaged build from [Releases](https://github.com/GordonBeeming/ide/releases), or build from source with the steps in [docs/development.md](https://github.com/GordonBeeming/ide/blob/main/docs/development.md).

Once installed, the `ide` command opens or focuses a workspace without holding your terminal:

```bash
ide .                 # open the current folder
ide src/App.tsx       # open a file (its folder becomes the workspace)
```

On macOS you can also right-click any file or folder in Finder: Quick Actions → Open in ide.

## Learn more

- [Development](https://github.com/GordonBeeming/ide/blob/main/docs/development.md) — running from source, building, testing, architecture, and the full capability inventory.
- [Security](https://github.com/GordonBeeming/ide/blob/main/docs/security.md) — the guardrails around local file access and the loopback API.
- [Research](https://github.com/GordonBeeming/ide/blob/main/docs/research.md) — source-backed notes on the protocols and technology choices.
