<p align="center">
  <img src="https://img.shields.io/badge/🚀-SQUADRON-black?style=for-the-badge&labelColor=000" alt="Squadron" />
</p>

<h1 align="center">Squadron</h1>
<h3 align="center">The Operating System for Autonomous Software Teams</h3>

<p align="center">
  <strong>Give your AI agents a job. Not just a prompt.</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.10+-blue.svg" alt="Python 3.10+"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/Architecture-MCP%20Ready-purple" alt="MCP Ready"></a>
  <a href="#"><img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen" alt="Status"></a>
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-the-solution">Solution</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🎬 See It In Action

```bash
$ squadron report --msg "Refactored the auth module." --ticket "KAN-1"

🚀 Squadron Bridge Activated...
✅ Slack: Message sent to #dev-updates
✅ Jira: Comment added to KAN-1
```

**One command. Two integrations. Zero context switching.**

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
- ✋ **Hands** — Update Jira tickets, change statuses
- 🧠 **Context** — Knowledge files that define your workflow

---

## 🚀 Quick Start

### 1. Install

```bash
git clone https://github.com/MikeeBuilds/squadron.git
cd squadron
pip install -e .
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
```

### 3. Test

```bash
squadron report --msg "Hello from Squadron!" --channel "#general"
```

If you see `✅ Slack: Message sent` — you're live! 🎉

---

## 📖 Usage

### Basic Report (Slack Only)
```bash
squadron report --msg "Starting the database migration"
```

### Report + Jira Update
```bash
squadron report --msg "Fixed the login bug" --ticket "PROJ-101"
```

### Report + Jira Status Transition
```bash
squadron report --msg "Feature complete" --ticket "PROJ-101" --status "Done"
```

### Full Command
```bash
squadron report \
  --msg "Refactored RBI pipeline logic" \
  --ticket "KAN-42" \
  --channel "#dev-updates" \
  --status "In Review"
```

---

## 🏗️ Architecture

Squadron uses a **Skill-Based Architecture** inspired by the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

```
squadron/
├── cli.py                 # 🎯 The Router (entry point)
│
├── skills/                # 🛠️ ACTION LAYER (The Hands)
│   ├── jira_bridge/
│   │   ├── tool.py        # Jira API integration
│   │   └── SKILL.md       # Instructions for agents
│   └── slack_bridge/
│       ├── tool.py        # Slack API integration
│       └── SKILL.md       # Instructions for agents
│
└── knowledge/             # 🧠 CONTEXT LAYER (The Brain)
    ├── TEAM.md            # Who is on the team?
    ├── WORKFLOW.md        # How does work flow?
    └── ROLES.md           # What does each agent do?
```

### Why This Structure?

| Layer | Purpose | Example |
|-------|---------|---------|
| **Skills** | Executable actions | `JiraTool.update_ticket()` |
| **Knowledge** | Context for decisions | "Move to Done only after tests pass" |

**Skills = Hands. Knowledge = Brain.**

---

## 🤖 Teaching Your Agents

Add this to your agent's system prompt or `SKILL.md`:

```markdown
## Tool: Squadron

You have access to the `squadron` CLI for team communication.

### When to use:
- After completing a coding task
- When you hit a blocker and need help
- To update ticket status

### Commands:
- Start task: `squadron report --msg "Starting work on auth" --ticket "KAN-1" --status "In Progress"`
- Complete task: `squadron report --msg "Auth module complete" --ticket "KAN-1" --status "Done"`
- Report blocker: `squadron report --msg "Blocked: Need API keys" --ticket "KAN-1"`
```

---

## 🗺️ Roadmap

- [x] **Core CLI** — `squadron report` command
- [x] **Jira Integration** — Comments + status transitions
- [x] **Slack Integration** — Rich block messages
- [ ] **Discord Integration** — Webhook support
- [ ] **GitHub Skill** — Open PRs, merge branches
- [ ] **Overseer Mode** — Wake agents when tickets are assigned
- [ ] **PyPI Release** — `pip install squadron-agents`

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

MIT © [MikeeBuilds](https://github.com/MikeeBuilds)

---

<p align="center">
  <strong>Don't just build agents. Give them a job.</strong>
</p>

<p align="center">
  <a href="https://github.com/MikeeBuilds/squadron">⭐ Star this repo</a> •
  <a href="https://github.com/MikeeBuilds/squadron/issues">🐛 Report Bug</a> •
  <a href="https://github.com/MikeeBuilds/squadron/issues">💡 Request Feature</a>
</p>
