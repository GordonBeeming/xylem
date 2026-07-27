---
title: "MyTerm"
fetchedAt: 2026-07-26
sourceRepo: "GordonBeeming/myterm"
sourceBranch: "main"
visibility: public
---

# MyTerm

<p align="center">
  <img src="/assets/projects/myterm/MyTermIcon.png" width="144" alt="MyTerm app icon">
</p>

MyTerm is an opinionated native macOS terminal for people who keep several projects open all day. It puts long-lived terminal sessions and WebKit browser tabs inside named workspaces, with fast pane splitting and very little surrounding UI.

It is not a terminal framework, an agent dashboard, a cross-platform Electron app, or a browser with a terminal bolted on. The first release deliberately focuses on the small part of cmux that its author uses every day.

## Requirements

- macOS 14 or later
- Apple silicon for the current downloadable release
- Xcode's Swift toolchain when building from source

## Install

Homebrew is the primary installation path:

```bash
brew install --cask gordonbeeming/tap/myterm
open -a myterm
```

The cask installs the signed, notarized, and stapled Apple silicon release. MyTerm quits when its last window closes; launching it again restores the saved workspace layout.

When MyTerm upgrades legacy workspace state, it keeps the original file in an adjacent v1 backup before writing the migrated layout. If recovery has to discard a malformed element, it likewise preserves the original bytes in an adjacent recovery backup before committing the repaired state.

## The workflow

- **Workspaces** have a title, can be pinned and reordered, and live inside collapsible color-coded folders.
- **Pane groups** own their own terminal and browser tabs. Every group keeps an independent selected tab, and browser tabs keep their URL, cookies, and website data across app restarts.
- **Panes** split right with <kbd>⌘D</kbd> and down with <kbd>⇧⌘D</kbd>. Their dividers can be dragged, and the saved proportions restore on the next launch.
- **One app instance** handles launch requests. Opening a folder, script, SSH link, or web URL reuses the existing window instead of creating another app process.
- **Compact native UI** keeps workspace and tab chrome out of the way. There is no agent-status layer or ornamental terminal dashboard.

### Terminal links stay with the work

Command-click any valid HTTP or HTTPS link in a terminal and MyTerm opens it as a browser pane beside that exact terminal. This works for localhost and remote sites alike.

Tabs can be dragged to reorder within a pane group, dropped into another group, or dropped on a pane edge to make a new group. Moving the final tab out closes the now-empty pane.

Every terminal process also receives a `BROWSER` launcher and a narrow `open` shim inside the app bundle. Tools such as Codex, Claude, Plannotator, and `ide browse` send their HTTP and HTTPS links back beside the originating pane, even if another workspace has since become active. MyTerm does not become the macOS default browser.

A tool that explicitly invokes `/usr/bin/open` bypasses MyTerm and can still open externally. Non-web `open` requests retain their normal system handling. Terminal links to configured text files use the scoped **Open text files with** command in Browser Settings, which defaults to `ide browse {file}`. Use suffix patterns such as `*.json` for Markdown, JSON, source, and config files; literal names such as `README`, `Dockerfile`, and `.gitignore` match exactly. Unsupported files and failed or empty text-file commands open in their macOS application instead of MyTerm's browser.

## Browser sessions and passkeys

New browser tabs can remember cookies and website data at one of four scopes, selected in Settings:

- **Across all workspaces** uses one profile for the active app channel.
- **Per MyTerm folder** shares a profile between every workspace in the same sidebar folder. Workspaces that aren't in a folder share one profile of their own.
- **Per workspace** isolates each workspace and is the default.
- **Per project directory** shares a profile for terminals rooted in the same Git repository or directory.

Existing tabs keep their assigned profile when this setting changes. MyTerm stores browser profile identifiers and WebKit stores the website data; MyTerm never stores passkeys.

WebAuthn requests are passed to macOS and the user's chosen credential provider, such as Apple Passwords or 1Password. Apple's managed browser passkey entitlement is intentionally absent until Apple approves it for the signing team, so local and current distribution builds report that capability as unavailable.

## Everyday shortcuts

| Action | Shortcut |
| --- | --- |
| New workspace | <kbd>⌘N</kbd> |
| New folder | <kbd>⇧⌘N</kbd> |
| Rename workspace | <kbd>⇧⌘R</kbd> |
| Zoom out browser / decrease terminal font size | <kbd>⌘-</kbd> |
| Zoom in browser / increase terminal font size | <kbd>⌘=</kbd> |
| Reset browser zoom | <kbd>⌘0</kbd> |
| Reload selected browser tab | <kbd>⌘R</kbd> |
| Focus selected browser tab's address | <kbd>⌘L</kbd> |
| Browser back / forward | <kbd>⌘[</kbd> / <kbd>⌘]</kbd> |
| Find in selected browser tab | <kbd>⌘F</kbd> |
| New terminal tab | <kbd>⌘T</kbd> |
| New browser tab | <kbd>⇧⌘L</kbd> |
| Previous / next tab in focused pane | <kbd>⌃⇧Tab</kbd> / <kbd>⌃Tab</kbd> |
| Move selected tab to previous / next pane | <kbd>⇧⌥⌘←</kbd> / <kbd>⇧⌥⌘→</kbd> |
| Split focused pane right | <kbd>⌘D</kbd> |
| Split focused pane down | <kbd>⇧⌘D</kbd> |
| Close focused pane or tab | <kbd>⌘W</kbd> |
| Toggle workspace sidebar | <kbd>⌘B</kbd> |

[docs/SHORTCUTS.md](https://github.com/GordonBeeming/myterm/blob/main/docs/SHORTCUTS.md) lists every supported shortcut and its native menu path.

## Default terminal integration

In Settings, choose **Make MyTerm the Default** to register MyTerm for `.command` and `.tool` scripts, UNIX executables, and `ssh://` links. It does not register MyTerm as the default HTTP or HTTPS browser.

Folders open a terminal tab in that folder. Scripts and executables run from their containing folder. SSH URLs are parsed into a normal `ssh` command with user and port support.

## Development channels

Run the development channel from the repository:

```bash
./run.sh
```

This builds and launches `myterm-dev`. It has its own bundle identifier, browser settings, website-data profiles, and workspace state, so it can live beside production `myterm`.

```bash
./run.sh --prod
./run.sh --verify
swift test --parallel
```

`./run.sh` also supports `--bundle`, `--debug`, `--logs`, and `--telemetry`. The app uses SwiftTerm for native terminal rendering and WebKit for the built-in browser. Chromium is intentionally not bundled; [docs/BROWSER_ENGINES.md](https://github.com/GordonBeeming/myterm/blob/main/docs/BROWSER_ENGINES.md) describes the boundary for a separately downloaded engine later.

## Release trust chain

The source commits for the release are SSH-signed. The GitHub release workflow then:

1. builds the arm64 application;
2. signs `myterm.app` with a Developer ID Application certificate, hardened runtime, and secure timestamp;
3. notarizes and staples the app;
4. creates the DMG, then signs, notarizes, staples, and validates the DMG separately; and
5. updates the Homebrew cask with an SSH-signed `myterm-release[bot]` commit.

The app and its disk image therefore each have their own validated distribution signature and notarization ticket. [docs/RELEASING.md](https://github.com/GordonBeeming/myterm/blob/main/docs/RELEASING.md) documents the checks and required GitHub environment secrets.

## Current boundaries

- macOS only; downloadable builds are Apple silicon only.
- One main window and one built-in WebKit engine.
- Terminal and browser panes share the same persistent split layout.
- Chromium remains an optional future download so the main app stays small.
- Passkey pass-through requires Apple's managed entitlement before it can be enabled in distribution.
