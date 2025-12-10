<p align="center">
  <img src="https://img.shields.io/badge/🚀-SQUADRON-black?style=for-the-badge&labelColor=000" alt="Squadron" />
</p>

<h1 align="center">Squadron</h1>
<h3 align="center">The Operating System for Autonomous Software Teams</h3>

<p align="center">
  <strong>Give your AI agents a job. Not just a prompt.</strong>
</p>

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

## 🔥 New in v0.2.1
| Feature | Description |
|:---|:---|
| **🎭 Dynamic Identity** | Agents now have custom names & avatars in Slack/Discord |
| **👂 The Ears** | Agents can listen & reply to `@mentions` in Slack |
| **🧠 RAG-Lite** | Query your team knowledge base with `squadron ask` |
| **⚡ Overseer 2.0** | Trigger scripts automatically when Jira tickets are assigned |

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
```

### 3. Test

```bash
squadron report --msg "Hello from Squadron!" --channel "#general"
```

If you see `✅ Slack: Message sent` — you're live! 🎉

---

## 📖 Commands

### `squadron listen` — The Ears 👂
Starts the listener service to hear @mentions in Slack.
```bash
squadron listen
# Now type "@Squadron hello!" in Slack
```

### `squadron ask` — The Brain 🧠
Query the team's knowledge base.
```bash
squadron ask "What is our deployment workflow?"
```

### `squadron report` — Team Updates
Send updates as a specific agent with a custom avatar.
```bash
squadron report --agent "Marcus" --msg "I finished the analysis." --linear "LIN-123"
```

### `squadron overseer` — The Eyes 👁️
Watch for new tickets and **wake up** an agent script.
```bash
squadron overseer --exec "python agents/marcus.py --task '{summary}'"
```

---

## 🔌 Skills

| Skill | Status | What It Does |
|-------|--------|--------------|
| **Listener** | ✅ Live | **NEW:** Hear and reply to Slack mentions |
| **Identity** | ✅ Live | **NEW:** Dynamic Avatars (Marcus/Caleb) |
| **Linear** | ✅ Live | **NEW:** Full Issue tracking integration |
| **Memory** | ✅ Live | **NEW:** RAG-Lite knowledge querying |
| **Jira** | ✅ Live | Update tickets, add comments |
| **Slack** | ✅ Live | Rich messages & Socket Mode |
| **Discord** | ✅ Live | Webhook broadcasts |
| **GitHub** | ✅ Live | Create PRs and Issues |

---

## 🗺️ Roadmap
See [CHANGELOG.md](CHANGELOG.md) for version history.

- [x] **Core CLI** — `squadron report` command
- [x] **Agent Avatars** — Dynamic identities
- [x] **Listener Service** — Slack Socket Mode
- [x] **Linear Support** — GraphQL Integration
- [x] **Agent Wake-up** — Overseer `--exec` trigger
- [x] **Memory System** — RAG-Lite (`ask`)
- [ ] **Linear App OAuth** — "Bot" user identity
- [ ] **Web Dashboard** — Local UI for agent status
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
