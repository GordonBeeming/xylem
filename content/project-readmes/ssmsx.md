---
title: "SSMSx"
fetchedAt: 2026-10-21
sourceRepo: "GordonBeeming/SSMSx"
sourceBranch: "main"
visibility: public
---

# SSMSx

![SSMSx logo](/assets/projects/ssmsx/logo-lockup.svg)

**A fast, cross-platform SQL Server Management Studio for developers who are tired of waiting.**

SSMS is Windows-only. Azure Data Studio is nearing end-of-life. Neither feels fast. SSMSx is a modern desktop SQL Server client built around speed, dense information display, and native-feeling workflows.

## Why SSMSx

- **Cross-platform by design:** macOS, Windows, and Linux through Tauri.
- **Fast startup and low overhead:** native shell, React UI, and a focused C# sidecar instead of a heavyweight IDE runtime.
- **Real SQL Server connectivity:** `Microsoft.Data.SqlClient` with SQL Server auth and SqlClient interactive Entra auth.
- **Developer-first query workflow:** Monaco editor, tabs, IntelliSense, execution shortcuts, result-set tabs, messages, and clipboard-friendly grids.
- **Useful database navigation:** lazy Object Explorer for databases, tables, views, procedures, functions, columns, keys, indexes, users, and diagrams.
- **Quiet, dense UI:** light theme, cool grays, one blue accent, 1px borders, and no decorative chrome fighting the data.

## What Works Today

SSMSx already has the core workbench in place:

- Saved/recent connections with color-coded connection dots.
- SQL editor tabs with F5 execution and selection execution.
- Query results with selectable cells, keyboard navigation, and copy all with or without headers.
- Resizable Object Explorer with remembered width.
- Results split that opens at 50% and can be dragged per session.
- Database diagrams with saved views, auto layout, SQL output, and EF Core split configuration output.
- Native Tauri packaging, app icon, release workflow, and Homebrew tap automation.

## Built With

```text
Tauri v2 shell
React 19 + TypeScript frontend
C# .NET sidecar for SQL Server operations
Microsoft.Data.SqlClient
Monaco Editor
Zustand
Tailwind CSS v4
React Flow + Dagre
```

## App Identity

The product name is **SSMSx**: uppercase SSMS, lowercase trailing x. The repository slug and package names stay lowercase as `ssmsx`.

The app icon is the SSMSx data-stack mark: three white server bars on accent blue with green online dots.

## Development

Developer setup, local commands, architecture notes, and release mechanics live in [docs/DEVELOPMENT.md](https://github.com/GordonBeeming/SSMSx/blob/main/docs/DEVELOPMENT.md).

The broader product and implementation specification is in [docs/SPEC.md](https://github.com/GordonBeeming/SSMSx/blob/main/docs/SPEC.md).

## Releases

Published GitHub releases trigger the macOS signing, notarization, DMG creation, and Homebrew cask update workflow. The release helper skill lives at `.claude/skills/create-release` and is symlinked into `.agents/skills/create-release`.

## License

[FSL-1.1-MIT](https://github.com/GordonBeeming/SSMSx/blob/main/LICENSE): Functional Source License, Version 1.1, with MIT Future License.
