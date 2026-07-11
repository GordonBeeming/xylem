---
title: "Claude Recall"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/claude-recall
sourceBranch: main
---

# claude-recall

Search and explore your Claude Code session history from the terminal.

[![CI](https://github.com/GordonBeeming/claude-recall/actions/workflows/ci.yml/badge.svg)](https://github.com/GordonBeeming/claude-recall/actions/workflows/ci.yml)
[![Release](https://github.com/GordonBeeming/claude-recall/actions/workflows/release.yml/badge.svg)](https://github.com/GordonBeeming/claude-recall/actions/workflows/release.yml)

## Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) -- claude-recall calls Claude by default to generate search terms and validate matches. Pass `--no-ai` if you don't have Claude installed or want to skip the AI features.

## Install

### Homebrew (macOS / Linux)

```bash
brew tap GordonBeeming/tap
brew install claude-recall
```

### Manual download

Grab a binary from the [latest release](https://github.com/GordonBeeming/claude-recall/releases/latest) and put it on your PATH.

### Build from source

```bash
./dev-build.sh
```

This publishes a native AOT binary for your platform and installs it to `~/.local/bin/claude-recall`.

## Usage

```bash
claude-recall <query> [options]
```

If no query is provided, you'll be prompted for one interactively.

### Options

| Flag | Description |
|------|-------------|
| `--regex` | Raw regex search, skips AI term generation |
| `--no-ai` | Skip all AI features (works without Claude installed) |
| `--all-projects` | Search all projects (default: current project only) |
| `--days N` | Search last N days (default: 7) |
| `--verbose` | Show detailed progress and debug info |
| `--help`, `-h` | Show help |
| `--version` | Show version |

### Examples

```bash
# Search current project sessions for "auth bug"
claude-recall "auth bug"

# Search across all projects
claude-recall "auth bug" --all-projects

# Exact regex search, no AI
claude-recall "fix.*login" --regex

# Works without Claude installed
claude-recall "database migration" --no-ai
```

## How it works

1. **Scan** -- reads session files from `~/.claude/projects/`
2. **Filter** -- scopes to the current project based on your working directory (pass `--all-projects` to widen)
3. **AI search terms** -- sends your query to Claude, which returns multiple regex patterns covering synonyms and variations
4. **Search** -- matches those patterns across session messages
5. **AI validation** -- Claude ranks results by relevance with a confidence score and short explanation
6. **Interactive TUI** -- browse the results tree, drill into sessions, resume them, or copy session IDs

Steps 3 and 5 are skipped with `--no-ai` or `--regex`.
