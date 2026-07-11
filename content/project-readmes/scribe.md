---
title: "Scribe"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/Scribe
sourceBranch: main
---

# Scribe

[![Build, Test & Deploy](https://github.com/gordonbeeming/scribe/actions/workflows/deploy.yml/badge.svg)](https://github.com/gordonbeeming/scribe/actions/workflows/deploy.yml)
[![PR Verification](https://github.com/gordonbeeming/scribe/actions/workflows/pr-verification.yml/badge.svg)](https://github.com/gordonbeeming/scribe/actions/workflows/pr-verification.yml)
[![Swift 6](https://img.shields.io/badge/Swift-6-F05138?logo=swift&logoColor=white)](https://swift.org)
[![Platform iOS](https://img.shields.io/badge/Platform-iOS%20%7C%20iPadOS-blue?logo=apple)](https://developer.apple.com/ios/)
[![Platform watchOS](https://img.shields.io/badge/Platform-watchOS-blue?logo=apple)](https://developer.apple.com/watchos/)
[![License FSL-1.1-MIT](https://img.shields.io/badge/License-FSL--1.1--MIT-yellow)](LICENSE)
[![XcodeGen](https://img.shields.io/badge/XcodeGen-Generated-blue)](https://github.com/yonaskolb/XcodeGen)
[![CloudKit](https://img.shields.io/badge/CloudKit-Sync-brightgreen?logo=icloud&logoColor=white)](https://developer.apple.com/icloud/cloudkit/)

A family budget management app for iOS, iPadOS, and watchOS built with SwiftUI and Liquid Glass design.

## Features

- **Recurring Budget Items** — Track income and expenses with flexible frequencies (weekly, fortnightly, monthly, irregular, etc.)
- **Multi-Currency Support** — Handle budgets across different currencies with AUD as default
- **Family Sharing** — Share budgets with family members via CloudKit sharing
- **CloudKit Sync** — Seamless data sync across devices using CKSyncEngine
- **Widgets** — Home screen widgets with configurable budget views
- **watchOS Companion** — View budget summaries on Apple Watch
- **Variable Spending** — Track discretionary spending with category budgets
- **Amount Overrides** — Track amount changes over time for recurring items

## Requirements

- iOS / iPadOS 26.0+
- watchOS 26.0+
- Xcode 26.2+
- Swift 6

## Getting Started

This project uses [XcodeGen](https://github.com/yonaskolb/XcodeGen) to generate the Xcode project.

```bash
# Install XcodeGen (if not already installed)
brew install xcodegen

# Generate the Xcode project
xcodegen generate

# Open in Xcode
open Scribe.xcodeproj
```

## Architecture

- **SwiftUI** — Declarative UI with Liquid Glass design language
- **SwiftData** — Local persistence
- **CKSyncEngine** — CloudKit sync with last-writer-wins conflict resolution
- **WidgetKit** — Home screen widgets with AppIntent configuration
- **App Groups** — Shared data between app and widget extensions

## Project Structure

| Target | Description |
|---|---|
| `Scribe` | Main iOS/iPadOS app |
| `ScribeWidgetExtension` | Home screen widget |
| `ScribeWatch` | watchOS companion app |
| `ScribeWatchWidgetExtension` | watchOS widget |
| `ScribeTests` | Unit tests |

## License

This project is licensed under the [Functional Source License, Version 1.1, MIT Future License](https://github.com/GordonBeeming/Scribe/blob/main/LICENSE).
