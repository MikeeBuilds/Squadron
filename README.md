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
  <a href="#-control-plane-dashboard">Dashboard</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-skills">Skills</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🔥 New in v0.5.0

| Feature | Description |
|:---|:---|
| **🎮 Control Plane Dashboard** | Real-time web UI for managing agents via `squadron server` |
| **🐝 Swarm 2.0** | LLM-powered intelligent routing with agent-to-agent handoffs |
| **💬 Agent Communication** | Agents can @mention each other and comment on tickets |
| **🧠 Persistent Memory** | Semantic memory with ChromaDB - agents remember past work |
| **🧬 Evolution Layer** | Self-improving skills with version control and rollback |
| **⏰ Wake Protocol** | Autonomous execution: trigger → route → execute → report |

---

<p align="center">
  <img src="assets/banner.png" alt="Squadron Banner" width="100%">
</p>

## ⚡ Install

```bash
pip install squadron-agents
```

That's it. You're ready.

---

## 🎮 Control Plane Dashboard

Squadron now includes a full **Control Plane Dashboard** for real-time agent management.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Dashboard Overview -->
<!-- TODO: Add screenshot showing the main dashboard with agent cards and activity feed -->
> **Screenshot needed:** Main dashboard showing agent status cards, activity stream, and system stats

### Features

- **📡 Live Activity Stream** — Real-time SSE updates of agent actions
- **🤖 Agent Cards** — View status, current objectives, and capabilities
- **💬 Console** — Direct REPL-style chat with any agent
- **🚀 Missions** — Track active/completed missions, trigger new ones
- **🔌 Integrations Panel** — Send to Slack, Discord, Jira, GitHub from the UI
- **⚙️ Settings** — System status and configuration reference

### Running the Dashboard

```bash
# Start the API server
squadron server

# In another terminal, start the frontend
cd dashboard
npm run dev
```

Open `http://localhost:3000` to access the dashboard.

<!-- 🎥 RECORDING PLACEHOLDER: Dashboard Demo -->
<!-- TODO: Add screen recording showing navigation through dashboard pages -->
> **Recording needed:** Walkthrough of dashboard pages - Home → Agents → Console → Missions → Settings

---

## 🐝 Swarm 2.0 — Multi-Agent Orchestration

Squadron's Swarm system enables intelligent, autonomous agent coordination.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Swarm routing in action -->
<!-- TODO: Add screenshot/recording showing task routing between agents -->
> **Screenshot needed:** Dashboard showing a task being routed from user → Overseer → Agent

### Key Features

- **🧠 LLM-Powered Routing** — Gemini decides which agent handles each task
- **🤝 Agent Handoffs** — Agents can delegate tasks to each other with context
- **📋 Task Queue** — Priority-based task management
- **🔗 Delegation Chain** — Full tracking of task ownership

```python
# Example: Intelligent task routing
from squadron.swarm import route_task

result = route_task("Analyze the API performance and deploy the fix")
# Swarm routes to the best agent for each subtask
```

---

## 💬 Agent Communication

Agents can now communicate with each other through your ticket system.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Agent-to-Agent Communication -->
<!-- TODO: Add screenshot of ticket with agent @mentions and responses -->
> **Screenshot needed:** Jira/Linear ticket with agent comments showing @mentions

### Features

- **@Mention Support** — Tag agents in ticket comments to request help
- **`reply_to_ticket()`** — Agents post updates directly on tickets
- **`tag_agent()`** — Request help from specific agents
- **Auto-Wake** — Overseer wakes agents when tickets are assigned

```bash
# Overseer monitors and auto-wakes agents
squadron overseer --auto-wake

# Example ticket comment that triggers an agent:
# "@YourAgent please review the authentication changes"
```

---

## 🧠 Persistent Memory (Hippocampus)

Agents now have long-term memory powered by ChromaDB semantic search.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Memory in action -->
<!-- TODO: Add screenshot of agent recalling past context in conversation -->
> **Screenshot needed:** Console showing agent recalling relevant past conversations

### Memory Types

| Type | Description |
|------|-------------|
| **Conversation** | Past chat history with context |
| **Task** | Completed tasks and their outcomes |
| **Learning** | Insights and knowledge gained |
| **General** | Miscellaneous memories |

### API

```python
from squadron.memory import remember, recall, get_context_for_task

# Store a memory
remember("User prefers TypeScript over JavaScript", agent="Atlas")

# Recall relevant memories
memories = recall("coding preferences", agent="Atlas")

# Get context for a new task
context = get_context_for_task("Set up the new frontend", agent="Atlas")
```

---

## 🧬 Evolution Layer

Squadron agents can evolve and improve their skills over time.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Skill Registry -->
<!-- TODO: Add screenshot of skill evolution/registry view -->
> **Screenshot needed:** Dashboard showing skill registry with versions and quality scores

### Features

- **Skill Registry** — Track all skills with version history
- **Quality Scoring** — Success/failure rate tracking
- **Version Control** — Rollback to previous skill versions
- **Skill Creation** — Agents can propose new skills

---

## ⏰ Wake Protocol

The Wake Protocol orchestrates autonomous agent execution.

<!-- 🎥 RECORDING PLACEHOLDER: Wake Protocol Demo -->
<!-- TODO: Add recording showing ticket detection → agent wake → task execution → report -->
> **Recording needed:** Full flow of Overseer detecting ticket → waking agent → executing → reporting back

```bash
# Manually trigger the Wake Protocol
squadron wake --summary "Deploy the hotfix to production"

# Auto-wake runs automatically with overseer
squadron overseer --auto-wake --interval 30
```

### Flow

1. **Trigger** — New ticket detected or manual wake command
2. **Route** — Swarm selects the best agent for the task
3. **Execute** — Agent completes the work
4. **Report** — Results posted back to the ticket

---

## 🎬 See It In Action

```bash
$ squadron report --msg "Refactored the auth module." --ticket "KAN-1"

🚀 Squadron Bridge Activated...
✅ Slack: Message sent to #general
✅ Jira: Comment added to KAN-1
```

**One command. Multiple integrations. Zero context switching.**

<!-- 🎥 RECORDING PLACEHOLDER: CLI Demo -->
<!-- TODO: Add recording showing squadron report, broadcast, and pr commands -->
> **Recording needed:** Terminal showing `squadron report`, `squadron broadcast`, and `squadron pr` commands

---

## 😤 The Problem

You're building with AI agents. They're powerful. They can write code, refactor systems, and solve complex problems.

But here's the frustrating reality:

| What You Want | What Actually Happens |
|--------------|----------------------|
| Agent finishes a task | You don't know unless you check the terminal |
| Jira ticket should update | It stays in "To Do" forever |
| Team needs visibility | They have no idea what the AI is building |
| Agent A needs Agent B's help | They can't communicate |
| Agent worked on this before | It doesn't remember |

**Your agents are trapped in a chat window.** They can think, but they can't *act* in your team's workflow.

---

## ✨ The Solution

Squadron is a **bridge** that connects your local AI agents to your team's real tools.

```
┌─────────────────┐         ┌─────────────────┐
│   AI AGENTS     │         │   YOUR TEAM     │
│  (Your Agents)  │         │                 │
│                 │         │  📋 Jira/Linear │
│  "Task done!"   │────────▶│  💬 Slack       │
│                 │Squadron │  🔔 Discord     │
│  🧠 Memory      │ Bridge  │  🐙 GitHub      │
│  🔄 Handoffs    │         │  🎮 Dashboard   │
└─────────────────┘         └─────────────────┘
```

**Squadron gives your agents:**
- 🗣️ **A Voice** — Post updates to Slack/Discord
- ✋ **Hands** — Update Jira tickets, create GitHub PRs
- 👀 **Awareness** — Overseer watches for new assignments
- 🧠 **Memory** — Remember past work and context
- 🤝 **Collaboration** — Hand off tasks to each other
- 🎮 **Control** — Real-time dashboard for management

---

## 🚀 Quick Start

### 1. Install

```bash
pip install squadron-agents
```

### 2. Configure

Create a `.env` file in your project root:

```env
# Required: LLM Provider
GEMINI_API_KEY=your-gemini-key

# Jira
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-api-token

# Slack
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=your-bot-token

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

### Core Commands

| Command | Description |
|---------|-------------|
| `squadron init` | Initialize Squadron in your project |
| `squadron learn` | Scan codebase and update knowledge |
| `squadron server` | Start the Control Plane API |
| `squadron listen` | Listen for @mentions in Slack |
| `squadron listen --discord` | Listen for @mentions in Discord |
| `squadron overseer` | Watch for new ticket assignments |
| `squadron wake` | Manually trigger the Wake Protocol |

### Communication Commands

| Command | Description |
|---------|-------------|
| `squadron report` | Send updates to Slack + update tickets |
| `squadron broadcast` | Announce to Discord |
| `squadron pr` | Create GitHub Pull Request |
| `squadron issue` | Create GitHub Issue |

See [COMMANDS.md](COMMANDS.md) for full documentation.

---

## 🏗️ Architecture

Squadron uses a **Skill-Based Architecture** inspired by the [Model Context Protocol (MCP)](https://modelcontextprotocol.io).

```
squadron/
├── cli.py                 # 🎯 The Router (entry point)
├── server.py              # 🎮 Control Plane API
├── overseer.py            # 👀 Background ticket watcher
├── brain.py               # 🧠 Intelligence router (LLM decisions)
│
├── swarm/                 # 🐝 ORCHESTRATION LAYER
│   ├── agent.py           # Base agent class
│   ├── delegator.py       # Task handoff logic
│   └── overseer.py        # LLM-powered routing
│
├── memory/                # 🧠 MEMORY LAYER
│   └── hippocampus.py     # Semantic memory (ChromaDB)
│
├── evolution/             # 🧬 EVOLUTION LAYER
│   ├── skill_registry.py  # Skill tracking & versioning
│   ├── improver.py        # Self-improvement engine
│   └── watcher.py         # Performance monitoring
│
├── skills/                # 🛠️ ACTION LAYER (The Hands)
│   ├── jira_bridge/       # Jira API integration
│   ├── slack_bridge/      # Slack API integration
│   ├── discord_bridge/    # Discord webhooks + bot
│   ├── github_bridge/     # GitHub API integration
│   ├── linear_bridge/     # Linear API integration
│   ├── ssh_skill/         # Remote command execution
│   └── browser_skill/     # Web navigation & screenshots
│
├── services/              # 🔧 SERVICE LAYER
│   └── llm/               # LLM providers (Gemini)
│
└── knowledge/             # 📚 CONTEXT LAYER (The Brain)
    ├── TEAM.md            # Who is on the team?
    ├── WORKFLOW.md        # How does work flow?
    └── ROLES.md           # What does each agent do?
```

### Why This Structure?

| Layer | Purpose | Example |
|-------|---------|---------|
| **Swarm** | Task routing & handoffs | Route task to best agent |
| **Memory** | Long-term context | Remember past conversations |
| **Evolution** | Self-improvement | Track skill performance |
| **Skills** | Executable actions | `JiraTool.update_ticket()` |
| **Knowledge** | Context for decisions | "Move to Done only after tests pass" |

---

## 🔌 Skills

| Skill | Status | What It Does |
|-------|--------|--------------|
| **Jira Bridge** | ✅ Live | Update tickets, add comments, transition status |
| **Slack Bridge** | ✅ Live | Send formatted messages to channels |
| **Discord Bridge** | ✅ Live | Broadcast via webhooks & Reply via Bot |
| **GitHub Bridge** | ✅ Live | Create PRs and Issues |
| **Linear Bridge** | ✅ Live | Update Linear issues |
| **Overseer** | ✅ Live | Watch Jira/Linear for new assignments |
| **SSH Skill** | ✅ Live | Execute remote commands |
| **Browser Skill** | ✅ Live | Navigate & Screenshot Web |

---

## 📝 Customizing for Your Team

After running `squadron init`, you'll have example templates to customize:

| File | What to Customize |
|------|-------------------|
| `squadron/agents.yaml` | Define your agent personas (names, roles, avatars) |
| `squadron/knowledge/TEAM.md` | Your team members (human and AI) |
| `squadron/knowledge/ROLES.md` | Agent specializations for task routing |
| `squadron/knowledge/WORKFLOW.md` | Your team's development process |

The templates include example agents (**Atlas** and **Sage**) — replace them with your own!

```bash
# Customize your agents
code squadron/agents.yaml
code squadron/knowledge/ROLES.md
```

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
- To hand off work to another agent

### Commands:
- Start task: `squadron report --msg "Starting auth work" --ticket "KAN-1" --status "In Progress"`
- Complete task: `squadron report --msg "Auth complete" --ticket "KAN-1" --status "Done"`
- Announce: `squadron broadcast --msg "Shipped new feature!"`
- Hand off: Tag another agent in the ticket comment with @AgentName
```

---

## 🗺️ Roadmap

### Completed ✅

- [x] **Core CLI** — `squadron report` command
- [x] **Jira Integration** — Comments + status transitions
- [x] **Slack Integration** — Rich block messages
- [x] **Discord Integration** — Webhook broadcasts + Bot
- [x] **GitHub Integration** — PRs and Issues
- [x] **Linear Integration** — Issue management
- [x] **Overseer Mode** — Background ticket watcher
- [x] **PyPI Release** — `pip install squadron-agents`
- [x] **Control Plane Dashboard** — Real-time web UI
- [x] **Swarm 2.0** — LLM-powered intelligent routing
- [x] **Agent Communication** — @mentions and ticket comments
- [x] **Persistent Memory** — Hippocampus with ChromaDB
- [x] **Evolution Layer** — Skill versioning and quality tracking
- [x] **Wake Protocol** — Autonomous agent execution

### Coming Soon 🚧

- [ ] **Active Inference** — Predictive agent behavior
- [ ] **Hive Mind** — Collective intelligence layer
- [ ] **Multi-LLM Support** — OpenAI, Anthropic, local models
- [ ] **Email Notifications** — SMTP integration
- [ ] **Calendar Integration** — Scheduling and reminders

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
- Trello / Asana integrations
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
