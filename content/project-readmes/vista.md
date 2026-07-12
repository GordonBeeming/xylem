---
title: "Vista"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/vista
sourceBranch: main
---

# vista

A macOS-only, standalone replacement for Raycast's Search Screenshots. OCRs your screenshots with the Vision framework, then lets you find them by typing.

## What it does

- Watches your screenshot folder(s) and OCRs every image with Apple's on-device Vision framework.
- Summon with a user-set global hotkey. A floating panel appears with a grid of thumbnails.
- Search by filename, OCR text, or date (`name:`, `text:`, `date:yesterday`, and so on), or just type and it searches everywhere.
- Pick a result, hit enter, and it runs your chosen primary action: copy to clipboard, paste to the front app, open in Finder, or copy the OCR text.
- Pin the ones you keep coming back to. Choose your own panel size so the thumbnails are as big as you want.

Everything runs on-device. No cloud, no account, no sync. Your screenshots stay where they are.

## Install

```bash
brew install --cask gordonbeeming/tap/vista
```

Requires macOS 14 (Sonoma) or later.

## Build from source

For iterating locally, run `./Scripts/dev-run.sh`:

```bash
./Scripts/dev-run.sh               # build, launch as Vista.app, tail the log
./Scripts/dev-run.sh --no-tail     # skip the log tail for scripted runs
```

That script does a debug build, wraps the binary in `Distribution/Vista.app` with a proper `Info.plist` (LSUIElement, icon, usage descriptions, the same `com.gordonbeeming.vista` bundle id the brew-installed copy uses), ad-hoc signs with a stable identifier so macOS's TCC keeps Automation and Full Disk Access grants across rebuilds, then `open`s it. Logs tail from `~/Library/Logs/Vista/vista.log`.

Matching the brew bundle id means dev and prod share TCC + `UserDefaults`, so a single permission grant carries across. The script `pkills` both any running brew copy and any previous dev process first. Never run both at once.

For a proper signed + notarised release build (what CI does), see `Scripts/build-release.sh`.

## License

Licensed under [FSL-1.1-MIT](https://github.com/GordonBeeming/vista/blob/main/LICENSE). Converts to MIT two years after each release.
