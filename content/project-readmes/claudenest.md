---
title: "ClaudeNest"
fetchedAt: 2026-07-12
sourceRepo: GordonBeeming/ClaudeNest
sourceBranch: main
---

# ClaudeNest

[![CI](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/ci.yml/badge.svg)](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/ci.yml)
[![Deploy](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/deploy.yml/badge.svg)](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/deploy.yml)
[![Agent Release](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/agent-release.yml/badge.svg)](https://github.com/gordonbeeming/ClaudeNest/actions/workflows/agent-release.yml)
[![License: FSL-1.1-MIT](https://img.shields.io/badge/License-FSL--1.1--MIT-blue.svg)](https://github.com/GordonBeeming/ClaudeNest/blob/main/LICENSE)
[![.NET 10](https://img.shields.io/badge/.NET-10-512BD4)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)

A nest for your Claude sessions — hatch them from anywhere.

ClaudeNest is a lightweight remote launcher for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) sessions. It lets you browse your dev folders from a web dashboard and spawn `claude remote-control` sessions on your machines — then interact with them through [claude.ai/code](https://claude.ai/code).

ClaudeNest does **not** stream terminal I/O. It leverages Anthropic's native `claude remote-control` feature to handle all interaction. ClaudeNest is purely the session manager and remote launcher.

## How It Works

```
  You (browser)              Cloud                     Your Machine
 ┌────────────┐        ┌──────────────┐            ┌──────────────┐
 │  Web App   │──API──▶│   Backend    │◀─SignalR──▶│  Local Agent  │
 │ (React)    │        │ (ASP.NET +   │            │ (.NET Worker) │
 └────────────┘        │  SignalR)    │            └──────┬───────┘
                       └──────────────┘                   │ spawns
                                                          ▼
                                                  claude remote-control
```

1. **Install the agent** on any dev machine you want to access remotely
2. **Log in** to the web dashboard and browse your agent's folders
3. **Launch a session** — the agent spawns `claude remote-control` with your chosen working directory
4. **Interact via claude.ai/code** — all Claude I/O goes through Anthropic's native channel

## Features

- **Remote session launching** — Start Claude Code sessions on any connected machine from anywhere
- **Folder browsing** — Navigate your dev machine's directory structure from the web
- **Multi-agent support** — Connect agents on multiple machines to a single account
- **Session management** — View, launch, and stop sessions from the dashboard
- **Cross-platform agent** — Native AOT binaries for Linux, macOS (Intel + Apple Silicon), and Windows
- **Auto-updating agent** — Agents self-update from GitHub Releases
- **Secure by design** — Agents connect outbound only; no inbound ports needed on your machine

## Architecture

Three-component system:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web Dashboard** | React 19, Vite, TypeScript, Tailwind CSS 4 | Login, browse folders, launch/stop sessions |
| **Cloud Backend** | ASP.NET Core 10, SignalR, EF Core, SQL Server | Stateless API that relays commands between web and agents |
| **Local Agent** | .NET 10 AOT Worker Service | Runs on dev machines, connects outbound to backend, spawns `claude remote-control` |

For detailed architecture documentation including infrastructure diagrams and deployment topology, see [docs/architecture.md](https://github.com/GordonBeeming/ClaudeNest/blob/main/docs/architecture.md).

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/get-started) (for SQL Server via Aspire)
- [Node.js](https://nodejs.org/) 20+ and npm (for the React frontend)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/gordonbeeming/ClaudeNest.git
cd ClaudeNest

# Start everything via .NET Aspire
aspire run
```

This launches the full stack locally:
- **SQL Server** in Docker (with automatic migrations and seed data)
- **Backend API** at `http://localhost:5180`
- **Web frontend** at `https://localhost:5173`
- **Local agent** connected and ready

Auth is bypassed in dev mode — no Auth0 or Stripe configuration needed to get started.

For advanced setup including Auth0, Stripe, and production-like configuration, see [docs/local-development.md](https://github.com/GordonBeeming/ClaudeNest/blob/main/docs/local-development.md).

## Project Structure

```
src/
  ClaudeNest.AppHost/         # .NET Aspire orchestrator (local dev)
  ClaudeNest.ServiceDefaults/ # Shared Aspire service configuration
  ClaudeNest.Shared/          # Shared DTOs and enums (Backend + Agent)
  ClaudeNest.Backend/         # ASP.NET Core API + SignalR Hub
  ClaudeNest.Agent/           # .NET 10 AOT Worker Service
  claudenest-web/             # React frontend (Vite + TypeScript)
tests/
  ClaudeNest.Backend.IntegrationTests/  # Integration tests with Testcontainers
docs/
  architecture.md             # System architecture and infrastructure
  local-development.md        # Detailed local dev setup guide
infra/                        # Azure Bicep infrastructure-as-code
```

## Build & Test

```bash
# Build all .NET projects
dotnet build

# Run integration tests (requires Docker for Testcontainers)
dotnet test

# Build the frontend
cd src/claudenest-web && npm install && npm run build
```

## Agent Installation

The agent runs on your dev machine and connects outbound to the ClaudeNest backend. Pre-built native binaries are available for:

| Platform | Binary |
|----------|--------|
| Linux x64 | `claudenest-agent-linux-x64` |
| macOS Apple Silicon | `claudenest-agent-osx-arm64` |
| macOS Intel | `claudenest-agent-osx-x64` |
| Windows x64 | `claudenest-agent-win-x64.exe` |

Download from [GitHub Releases](https://github.com/gordonbeeming/ClaudeNest/releases) or use the install scripts served by the backend (`/install.sh` for Linux/macOS, `/install.ps1` for Windows).

The agent stores its configuration in `~/.claudenest/`:
- `config.json` — allowed/denied paths, claude binary path, max sessions
- `credentials.json` — agent ID, secret, backend URL (generated during pairing)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, Tailwind CSS 4, SignalR client, Auth0 SPA SDK |
| Backend | ASP.NET Core 10, SignalR, EF Core, SQL Server |
| Agent | .NET 10 Worker Service, Native AOT, SignalR client |
| Auth | Auth0 (web users), custom hashed secrets (agents) |
| Payments | Stripe (subscriptions + billing) |
| Infrastructure | Azure Container Apps, Azure SQL Serverless, Azure SignalR Service, Cloudflare Tunnel |
| CI/CD | GitHub Actions |
| Local Dev | .NET Aspire, Docker |
| Observability | Application Insights, Log Analytics |

## Documentation

- [Local Development Guide](https://github.com/GordonBeeming/ClaudeNest/blob/main/docs/local-development.md) — Setup, Auth0, Stripe, database access
- [Architecture](https://github.com/GordonBeeming/ClaudeNest/blob/main/docs/architecture.md) — System overview, infrastructure, deployment

## Contributing

Contributions are welcome! Please open an issue to discuss your idea before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests (`dotnet test`)
5. Open a pull request

## License

This project is licensed under the [FSL-1.1-MIT](https://github.com/GordonBeeming/ClaudeNest/blob/main/LICENSE) (Functional Source License, Version 1.1, MIT Future License).

- **Now**: Free to use for any purpose except competing commercial use
- **After 2 years**: Each version automatically becomes MIT licensed

Copyright 2026 Gordon Beeming
