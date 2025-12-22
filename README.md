<div align="center">
  <a href="https://github.com/MikeeBuilds/Squadron">
    <img src="assets/logo.png" alt="Squadron Logo" width="200" height="200">
  </a>

  <h1>Squadron</h1>

  <p>
    <strong>The AI Agent Command Center for Your Desktop</strong>
  </p>

  <p>
    Run Claude, Gemini, Codex, and more — all in one native app.<br/>
    6 terminals. Any AI Provider. Complete control.
  </p>

  <br/>

  <p>
    <a href="#-install"><strong>Download →</strong></a>
    &nbsp;&nbsp;
    <a href="#-features">Features</a>
    &nbsp;&nbsp;
    <a href="#-quick-start">Quick Start</a>
    &nbsp;&nbsp;
    <a href="#-architecture">Architecture</a>
  </p>
</div>

<p align="center">
  <a href="https://github.com/MikeeBuilds/Squadron/releases"><img src="https://img.shields.io/github/v/release/MikeeBuilds/Squadron?color=blue&label=Desktop%20App" alt="Release"></a>
  <a href="https://pypi.org/project/squadron-agents/"><img src="https://img.shields.io/pypi/v/squadron-agents?color=blue&label=PyPI" alt="PyPI"></a>
  <a href="https://github.com/MikeeBuilds/Squadron/actions/workflows/test.yml"><img src="https://github.com/MikeeBuilds/Squadron/actions/workflows/test.yml/badge.svg" alt="Tests"></a>
  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3"></a>
</p>

<p align="center">
  <img src="assets/banner.png" alt="Squadron Desktop App" width="100%">
</p>

---

## 🔥 What's New in v2.0

| Feature | Description |
|:---|:---|
| **🖥️ Native Desktop App** | One-click install — no terminal required |
| **🤖 Multi-Provider Support** | Claude, Gemini, Codex, OpenCode, Cursor |
| **📺 6-Terminal Grid** | Run 6 AI agents simultaneously |
| **🔐 Secure API Keys** | Encrypted storage with Electron safeStorage |
| **🌳 Git Worktrees** | Safe parallel execution per task |
| **📋 Kanban Board** | Drag-and-drop task management |

---

## ✨ Features

### 🤖 Multi-Provider AI Terminal

Run any AI coding assistant directly in Squadron's terminal grid:

| Provider | CLI | Status |
|----------|-----|--------|
| **Claude** | Sonnet 4, Opus 4, Haiku | ✅ Auto-install |
| **Gemini** | 2.5 Pro, 2.5 Flash | ✅ Auto-install |
| **OpenAI Codex** | GPT-4o, o1, o3-mini | ✅ Auto-install |
| **OpenCode** | Multi-model | ✅ Auto-install |
| **Cursor** | GPT-5, Claude 4 | ✅ Auto-install |

> **Auto-Install**: CLIs are downloaded automatically when you first select a provider. No manual setup required.

### 📺 6-Terminal Grid

Inspired by Auto-Claude's high-density workspace:
- **3x2 Grid Layout** — See all agents at once
- **Per-Terminal Provider Selection** — Different AI per terminal
- **Task Linking** — Connect terminals to Kanban tasks
- **Context Injection** — Task details auto-sent to AI

### 🌳 Git Worktree Isolation

Each agent task gets its own isolated workspace:

```
Task Created → .worktrees/task-XXX created → Agent executes in isolation
                                                    ↓
                                        Merge or Discard via Dashboard
```

**Benefits:**
- ✅ Agents work in parallel without conflicts
- ✅ Main branch stays protected
- ✅ Easy to discard failed work
- ✅ Each task gets its own branch for review

### 📋 Kanban Board

Visual task management with drag-and-drop:
- **Columns**: Backlog → Planning → In Progress → Review → Done
- **Real-time Updates** via Server-Sent Events
- **Task Wizard** for creating new tasks
- **Agent Assignment** per task

### 🔐 Secure API Key Management

- **Encrypted at Rest** using Electron safeStorage
- **Never Transmitted** — keys stay local
- **Per-Provider Storage** — separate keys for each AI
- **Settings UI** — easy configuration

---

## 📦 Install

### Desktop App (Recommended)

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| **Windows** | [Squadron-Setup.exe](https://github.com/MikeeBuilds/Squadron/releases) |
| **macOS** | [Squadron.dmg](https://github.com/MikeeBuilds/Squadron/releases) |
| **Linux** | [Squadron.AppImage](https://github.com/MikeeBuilds/Squadron/releases) |

### From Source (Developers)

```bash
# Clone the repo
git clone https://github.com/MikeeBuilds/Squadron.git
cd Squadron/desktop

# Install dependencies
npm install

# Run in development mode
npm run electron:dev
```

### Python Backend (Optional)

```bash
pip install squadron-agents
```

---

## 🚀 Quick Start

### 1. Launch Squadron

Double-click the app icon. No terminal needed.

### 2. Add Your API Keys

**Settings → System Config** → Enter your keys:

- `ANTHROPIC_API_KEY` for Claude
- `GOOGLE_API_KEY` for Gemini  
- `OPENAI_API_KEY` for Codex

### 3. Select a Provider

Click the provider dropdown in any terminal header:
- Choose **Claude**, **Gemini**, **Codex**, etc.
- CLI auto-downloads if needed
- API key auto-injected

### 4. Start Coding

Type your prompt and watch the AI work!

---

## 🏗️ Architecture

Squadron is a **hybrid desktop application**:

```
┌─────────────────────────────────────────────────────────┐
│                    ELECTRON SHELL                       │
│  ┌─────────────────┐  ┌────────────────────────────────┐│
│  │   React + Vite  │  │       Main Process             ││
│  │   ─────────────  │  │    ────────────────            ││
│  │   • 6-Terminal  │  │    • PTY Management           ││
│  │   • Kanban UI   │◄─┤    • API Key Storage          ││
│  │   • Settings    │  │    • CLI Auto-Install         ││
│  │   • Activity    │  │    • Process Manager          ││
│  └─────────────────┘  └────────────────────────────────┘│
│           ▲                        ▲                    │
│           │ IPC                    │ Spawn              │
│           ▼                        ▼                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │              TERMINAL SESSIONS                       ││
│  │   ┌─────────┐ ┌─────────┐ ┌─────────┐              ││
│  │   │ Claude  │ │ Gemini  │ │ Codex   │              ││
│  │   │   PTY   │ │   PTY   │ │   PTY   │ ...         ││
│  │   └─────────┘ └─────────┘ └─────────┘              ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
             │
             │ HTTP API (Port 8000)
             ▼
┌─────────────────────────────────────────────────────────┐
│                  PYTHON BACKEND                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Overseer   │  │    Swarm     │  │   Worktrees   │ │
│  │  ──────────  │  │  ──────────  │  │  ───────────  │ │
│  │  • Routing   │  │  • Agents    │  │  • Isolation  │ │
│  │  • Queue     │  │  • Handoffs  │  │  • Merge      │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │    Memory    │  │    Skills    │  │   Integrations│ │
│  │  ──────────  │  │  ──────────  │  │  ───────────  │ │
│  │  • ChromaDB  │  │  • Jira      │  │  • Slack      │ │
│  │  • Context   │  │  • GitHub    │  │  • Discord    │ │
│  └──────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Key Files

```
Squadron/
├── desktop/                    # 🖥️ ELECTRON APPLICATION
│   ├── electron/
│   │   ├── main.ts            # Main process (PTY, IPC)
│   │   ├── preload.ts         # IPC bridge
│   │   └── settings-store.ts  # Encrypted key storage
│   ├── src/
│   │   ├── App.tsx            # Main React app
│   │   ├── components/
│   │   │   ├── TerminalHub.tsx    # 6-terminal grid
│   │   │   ├── XTermComponent.tsx # xterm.js wrapper
│   │   │   ├── SettingsPanel.tsx  # API key management
│   │   │   └── KanbanBoard.tsx    # Task management
│   │   └── lib/
│   │       └── providers.ts   # AI provider configs
│
├── squadron/                   # 🐍 PYTHON BACKEND
│   ├── server.py              # FastAPI Control Plane
│   ├── swarm/
│   │   ├── agent.py           # Agent execution
│   │   └── overseer.py        # Task routing
│   └── services/
│       └── worktree.py        # Git worktree management
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root for the Python backend:

```env
# Required: LLM Provider for Backend
GEMINI_API_KEY=your-gemini-key

# Integrations (Optional)
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-api-token
SLACK_BOT_TOKEN=xoxb-your-bot-token
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
GITHUB_TOKEN=ghp_your-token
LINEAR_API_KEY=lin_api_...
```

### Provider Configuration

Providers are configured in `desktop/src/lib/providers.ts`:

```typescript
export const PROVIDERS = {
    anthropic: {
        name: 'Claude',
        cli: 'claude',
        envKey: 'ANTHROPIC_API_KEY',
        models: ['claude-sonnet-4', 'claude-opus-4', 'claude-haiku']
    },
    // ... more providers
}
```

---

## 🔌 API Reference

The Python backend exposes a REST API on port 8000:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/agents` | GET | List all agents |
| `/tasks` | GET | Get task queue |
| `/tasks` | POST | Create new task |
| `/tasks/{id}` | PATCH | Update task status |
| `/tasks/{id}/finalize` | POST | Merge or discard worktree |
| `/worktrees` | GET | List active worktrees |
| `/activity` | GET (SSE) | Real-time activity stream |

---

## 🗺️ Roadmap

### Completed ✅

- [x] **Electron Desktop App** — Native cross-platform experience
- [x] **6-Terminal Grid** — Multi-agent workspace
- [x] **Multi-Provider Support** — Claude, Gemini, Codex, OpenCode, Cursor
- [x] **Auto-Install CLIs** — Zero setup for users
- [x] **Secure API Keys** — Encrypted local storage
- [x] **Git Worktree Isolation** — Safe parallel execution
- [x] **Kanban Board** — Visual task management
- [x] **Task Wizard** — Easy task creation
- [x] **Real-time Updates** — SSE activity streams
- [x] **Python Backend** — Swarm orchestration

### Coming Soon 🚧

- [ ] **Onboarding Wizard** — First-launch setup flow
- [ ] **Dark/Light Theme Toggle** — User preference
- [ ] **File Diff Viewer** — See agent changes
- [ ] **Merge Preview** — Review before merging
- [ ] **Auto-Updates** — In-app updates

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Setup

```bash
# Frontend (Electron + React)
cd desktop
npm install
npm run electron:dev

# Backend (Python)
pip install -e .
python -m squadron.server
```

---

## 📜 License

AGPL-3.0 © [MikeeBuilds](https://github.com/MikeeBuilds)

---

<p align="center">
  <strong>Command your AI agents. Ship faster.</strong>
</p>

<p align="center">
  <a href="https://github.com/MikeeBuilds/squadron">⭐ Star this repo</a> •
  <a href="https://github.com/MikeeBuilds/squadron/releases">📦 Download</a> •
  <a href="https://github.com/MikeeBuilds/squadron/issues">🐛 Report Bug</a>
</p>
