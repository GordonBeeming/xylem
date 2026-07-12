---
title: "HardPhase Tracker"
fetchedAt: 2026-07-11
sourceRepo: GordonBeeming/HardPhaseTracker
sourceBranch: main
---

# HardPhase Tracker

NOTE: This app is nearly 100% vibe coded. 1 day I may clean up the codebase and add proper documentation.

A minimalist fasting tracker for iPhone + iPad.

> **Status:** early build (actively changing).

## What’s in the app today

- **Eating window schedules**
  - Built-in fasting templates (e.g. 16/8, 18/6, 20/4, OMAD, 5:2, ADF, etc.)
  - Custom schedules you can create and edit
  - Editing a built-in schedule prompts to save as a copy (cancel = no changes)
- **Meal templates (Named Meals)**
  - Create reusable meal templates (name + components)
- **Meal logging**
  - Log a meal from a template
  - Pick an explicit meal date/time (defaults to “now”)
  - Timezone is captured with each meal
- **Dashboard**
  - Weight trend graph (last 7 days) + latest weight (when connected to Apple Health)
  - “Get started” onboarding when no eating window is selected
  - Shows inside/outside eating window state
  - Shows electrolyte checklist (optional)
  - Shows recent meals (configurable count)
- **Log tab**
  - Calendar + list grouped by day
  - Tap meals to view details (and edit/delete)
- **Settings**
  - Dashboard settings (Log Meal button visibility rules, meal list count)
  - Meal time display settings (captured vs device timezone; shows a small timezone badge when they differ)

## Not implemented yet (planned)

- Advanced analysis and charts (coming soon)

## Roadmap

- Execution plan: `docs/inital app build.md`
- Requirements: `docs/00-Initial-Requirements.md`

## Tech stack

- Swift / SwiftUI
- SwiftData
- Unit tests: Swift Testing (`HardPhaseTrackerTests`)

## Requirements

- Xcode 26.2+
- iOS 26.2+ / iPadOS 26.2+ (deployment target is currently set to 26.2)

## Run

1. Open `HardPhaseTracker.xcodeproj` in Xcode.
2. Select an iPhone or iPad simulator.
3. Run.

## Contributing

For now this is a personal project; contribution guidelines will be added once the first public release stabilizes.

## Testing

- Run unit tests: Product → Test (or `⌘U`).

## Architecture

We aim to keep changes **small and reviewable** using **Vertical Slice Architecture (VSA)**:

- Organize by feature (e.g. `Features/Dashboard`, `Features/Meals`, `Features/Schedule`, `Features/Settings`).
- Prefer small files and testable domain/policy types for business rules.

## Development workflow

- Create a branch for each change set.
- Finish one logical slice, run tests, then **squash merge to `main`**.
- After first release (or when we want more rigor) we’ll push branches to GitHub and merge via PR (still squash).

## SwiftData schema changes (dev note)

⚠️⚠️⚠️ If you make a non-optional SwiftData model change (new required property, changed enum storage, etc.), you may need to **delete the app from the simulator/device** to reset the local store during early development.

## License

This project is licensed under **Functional Source License, Version 1.1 — MIT Future License** (`FSL-1.1-MIT`).
See [LICENSE](https://github.com/GordonBeeming/HardPhaseTracker/blob/main/LICENSE) for full terms (it converts to MIT after the specified period).
