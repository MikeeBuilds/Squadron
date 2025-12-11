<div align="center">
  <a href="https://github.com/MikeeBuilds/Squadron">
    <img src="assets/logo.png" alt="Squadron Logo" width="200" height="200">
  </a>

  <h3 align="center">Squadron</h3>

  <p align="center">
    Autonomous Agent Orchestration for your local machine.
    <br />
    <a href="#getting-started"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/MikeeBuilds/Squadron/issues">Report Bug</a>
    ·
    <a href="https://github.com/MikeeBuilds/Squadron/issues">Request Feature</a>
  </p>
</div>

<p align="center">
  <a href="https://pypi.org/project/squadron-agents/"><img src="https://img.shields.io/pypi/v/squadron-agents?color=blue&label=PyPI" alt="PyPI"></a>
  <a href="https://www.gnu.org/licenses/agpl-3.0"><img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.10+-blue.svg" alt="Python 3.10+"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/Architecture-MCP%20Ready-purple" alt="MCP Ready"></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-skills">Skills</a> •
  <a href="#-roadmap">Roadmap</a>
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🔥 New in v0.2.3
| Feature | Description |
|:---|:---|
| **📁 Init Command** | `squadron init` scaffolds your local environment |
| **🧠 Librarian** | `squadron learn` auto-maps your codebase structure |
| **🎭 Dynamic Identity** | Custom names & avatars in Slack/Discord |
| **👂 The Ears** | Agents can listen & reply to `@mentions` |
| **⚖️ AGPL-3.0** | Now protected by the AGPL license |

---

## ⚡ Install

```bash
pip install squadron-agents
```

That's it. You're ready.

---

## 🎬 See It In Action

```bash
$ squadron report --msg "Refactored the auth module." --ticket "KAN-1"

🚀 Squadron Bridge Activated...
✅ Slack: Message sent to #general
✅ Jira: Comment added to KAN-1
```

**One command. Multiple integrations. Zero context switching.**

---

## 😤 The Problem

You're building with AI agents. They're powerful. They can write code, refactor systems, and solve complex problems.

But here's the frustrating reality:

| What You Want | What Actually Happens |
|--------------|----------------------|
| Agent finishes a task | You don't know unless you check the terminal |
| Jira ticket should update | It stays in "To Do" forever |
| Team needs visibility | They have no idea what the AI is building |

**Your agents are trapped in a chat window.** They can think, but they can't *act* in your team's workflow.

---

## ✨ The Solution

Squadron is a **bridge** that connects your local AI agents to your team's real tools.

```
┌─────────────────┐         ┌─────────────────┐
│   AI AGENT      │         │   YOUR TEAM     │
│  (Cursor, etc)  │         │                 │
│                 │         │  📋 Jira        │
│  "Task done!"   │────────▶│  💬 Slack       │
│                 │Squadron │  🔔 Discord     │
│                 │ Bridge  │  🐙 GitHub      │
└─────────────────┘         └─────────────────┘
```

**Squadron gives your agents:**
- 🗣️ **A Voice** — Post updates to Slack/Discord
- ✋ **Hands** — Update Jira tickets, create GitHub PRs
- 👀 **Awareness** — Overseer watches for new assignments
- 🧠 **Context** — Knowledge files that define your workflow

---

## 🚀 Quick Start

### 1. Install

```bash
pip install squadron-agents
```

### 2. Configure

Create a `.env` file in your project root:

```env
# Jira
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-api-token

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# GitHub (optional)
GITHUB_TOKEN=ghp_your-token
# Linear (optional)
LINEAR_API_KEY=lin_api_...
```

### 3. Initialize

```bash
squadron init
```
This creates a `squadron/knowledge/` folder in your project. Customize `TEAM.md` and `ROLES.md` here.

### 4. Learn

```bash
squadron learn
```
This scans your code and builds a map for the agent to use.

### 5. Test

```bash
squadron report --msg "Hello from Squadron!" --channel "#general"
```

If you see `✅ Slack: Message sent` — you're live! 🎉

---

## 📖 Commands

### `squadron init` — Setup 📁
Scaffolds the Squadron files in your local project.
```bash
squadron init
```

### `squadron learn` — The Librarian 🧠
Scans your codebase and generates `knowledge/CODEBASE_MAP.md`.
```bash
squadron learn
```

### `squadron listen` — The Ears 👂
Starts the listener to hear @mentions in Slack.
```bash
squadron listen
```

### `squadron report` — Team Updates
Send updates to Slack and optionally update Jira tickets.

```bash
# Basic Slack message
squadron report --msg "Starting the database migration"

# With Jira ticket update
squadron report --msg "Fixed the login bug" --ticket "PROJ-101"

# With status transition
squadron report --msg "Feature complete" --ticket "PROJ-101" --status "Done"
```

### `squadron broadcast` — Discord Announcements
Broadcast updates to your Discord community.

```bash
squadron broadcast --msg "🚀 Just shipped v2.0!"
```

### `squadron pr` — GitHub Pull Requests
Create PRs programmatically.

```bash
squadron pr --repo "user/repo" --title "Add auth module" --head "feature-auth"
```

### `squadron issue` — GitHub Issues
Create issues from the command line.

```bash
squadron issue --repo "user/repo" --title "Bug: Login fails on mobile"
```

### `squadron overseer` — Background Watcher
Start a daemon that watches Jira for new tickets assigned to you.

```bash
squadron overseer --interval 30
```

When a new ticket appears:
```
🔔 NEW TASK DETECTED!
   Ticket: KAN-42
   Summary: Implement user authentication
```

---

## 🏗️ Architecture

Squadron uses a **Skill-Based Architecture** inspired by the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

```
squadron/
├── cli.py                 # 🎯 The Router (entry point)
├── overseer.py            # 👀 Background ticket watcher
│
├── skills/                # 🛠️ ACTION LAYER (The Hands)
│   ├── jira_bridge/       # Jira API integration
│   ├── slack_bridge/      # Slack API integration
│   ├── discord_bridge/    # Discord webhooks
│   └── github_bridge/     # GitHub API integration
│
└── knowledge/             # 🧠 CONTEXT LAYER (The Brain)
    ├── TEAM.md            # Who is on the team?
    ├── WORKFLOW.md        # How does work flow?
    └── ROLES.md           # What does each agent do?
```

### Why This Structure?

| Layer | Purpose | Example |
|-------|---------|---------
| **Skills** | Executable actions | `JiraTool.update_ticket()` |
| **Knowledge** | Context for decisions | "Move to Done only after tests pass" |

**Skills = Hands. Knowledge = Brain.**

---

## 📝 Customizing for Your Team

The `knowledge/` folder contains example files that you should customize for your own team:

| File | What to Customize |
|------|-------------------|
| `TEAM.md` | Replace with your team members (human and AI) |
| `ROLES.md` | Define your agent personas and responsibilities |
| `WORKFLOW.md` | Set your team's development process and rules |

These files provide **context** that helps your agents understand your workflow. The examples show our agents (Marcus & Caleb) — replace them with your own!

```bash
# Example: Edit the roles file
code squadron/knowledge/ROLES.md
```

---

## 🔌 Skills

| Skill | Status | What It Does |
|-------|--------|--------------|
| **Jira Bridge** | ✅ Live | Update tickets, add comments, transition status |
| **Slack Bridge** | ✅ Live | Send formatted messages to channels |
| **Discord Bridge** | ✅ Live | Broadcast via webhooks |
| **GitHub Bridge** | ✅ Live | Create PRs and Issues |
| **Overseer** | ✅ Live | Watch Jira for new assignments |

---

## 🤖 Teaching Your Agents

Add this to your agent's system prompt:

```markdown
## Tool: Squadron

You have access to the `squadron` CLI for team communication.

### When to use:
- After completing a coding task
- When you hit a blocker and need help
- To update ticket status

### Commands:
- Start task: `squadron report --msg "Starting auth work" --ticket "KAN-1" --status "In Progress"`
- Complete task: `squadron report --msg "Auth complete" --ticket "KAN-1" --status "Done"`
- Announce: `squadron broadcast --msg "Shipped new feature!"`
```

---

## 🗺️ Roadmap

- [x] **Core CLI** — `squadron report` command
- [x] **Jira Integration** — Comments + status transitions
- [x] **Slack Integration** — Rich block messages
- [x] **Discord Integration** — Webhook broadcasts
- [x] **GitHub Integration** — PRs and Issues
- [x] **Overseer Mode** — Background ticket watcher
- [x] **PyPI Release** — `pip install squadron-agents`
- [ ] **Agent Wake-up** — Trigger agents when Overseer detects tickets
- [ ] **Linear/Trello Support** — Alternative project management tools
- [ ] **Email Notifications** — SMTP integration

---

## 🌟 The Origin Story

Squadron was born out of necessity.

We're building [BlackCircleTerminal](https://blackcircleterminal.com), a quantitative trading platform managed by AI agents. Our virtual developers — **Marcus** (Strategy) and **Caleb** (Data) — needed a way to communicate with us when we weren't at the keyboard.

We realized that for agents to be truly useful, they need to be part of the **workflow**, not just the **code editor**.

Squadron is the nervous system that connects our AI workforce to our human tools.

---

## 🤝 Contributing

We're building the future of **Agent-First Development**. Want to add a new skill?

1. Fork the repo
2. Create a skill in `squadron/skills/your_skill/`
3. Add `tool.py` (logic) and `SKILL.md` (instructions)
4. Open a PR!

**Ideas for new skills:**
- Linear / Trello / Asana integrations
- Email notifications
- CI/CD triggers
- Calendar scheduling

---

## 📜 License

AGPL-3.0 © [MikeeBuilds](https://github.com/MikeeBuilds)

---

<p align="center">
  <strong>Don't just build agents. Give them a job.</strong>
</p>

<p align="center">
  <a href="https://github.com/MikeeBuilds/squadron">⭐ Star this repo</a> •
  <a href="https://pypi.org/project/squadron-agents/">📦 PyPI</a> •
  <a href="https://github.com/MikeeBuilds/squadron/issues">🐛 Report Bug</a>
</p>
