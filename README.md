# 🚀 Squadron
**The Operating System for Autonomous Software Teams.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Architecture: MCP](https://img.shields.io/badge/Architecture-MCP%20Ready-purple)](https://modelcontextprotocol.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Built For: Agents](https://img.shields.io/badge/Built%20For-Agents-orange)](https://blackcircleterminal.com)

> **"Don't just build agents. Give them a job."**

Squadron is an open-source bridge that lets your local AI agents (living in **Google Antigravity**, **Cursor**, or **VS Code**) communicate and collaborate like real employees. 

Instead of trapping your agents in a chat window, Squadron gives them **Tools** and **Skills** to interact with Jira, Slack, Discord, and GitHub autonomously.

---

## ⚡️ The Problem
You are building with autonomous agents (like our lead engineers, **Marcus** and **Caleb**). They finish a complex coding task, but:
1. ❌ **You don't know they are done** unless you check the terminal.
2. ❌ **Your Jira tickets stay in "To Do"** forever because agents can't login.
3. ❌ **Your team is left in the dark** about what the AI is actually building.

## ✅ The Solution
Squadron provides a simple CLI that acts as the "voice" and "hands" for your agents.

**Your agent runs this:**
```bash
squadron report --msg "Refactored the RBI pipeline logic." --ticket "PROJ-101" --channel "#dev-updates"

** The Result:**
 * Jira ticket PROJ-101 is updated with a comment and moved to "In Progress".
 * Slack/Discord gets a real-time notification in #dev-updates.
 * You get a ping on your phone, allowing you to manage your AI team from anywhere.
📦 Installation
Currently in Alpha. Install from source:
git clone [https://github.com/MikeeBuilds/squadron.git](https://github.com/MikeeBuilds/squadron.git)
cd squadron
pip install -e .

(Coming soon to PyPI: pip install squadron-agents)
⚙️ Configuration
Create a .env file in your project root:
# Jira Configuration
JIRA_SERVER="[https://your-domain.atlassian.net](https://your-domain.atlassian.net)"
JIRA_EMAIL="user@example.com"
JIRA_TOKEN="your-api-token"

# Slack Configuration
SLACK_BOT_TOKEN="xoxb-your-token"
SLACK_CHANNEL_ID="C012345"

# Discord Configuration (Optional)
DISCORD_WEBHOOK_URL="[https://discord.com/api/webhooks/](https://discord.com/api/webhooks/)..."

🤖 How To Use (Agent Skills)
Squadron is built to support the Model Context Protocol (MCP). To give your agent this skill, add the following to your System Prompt or SKILL.md:
For "Builder" Agents (Cursor/Antigravity):
> Tool Capability: Squadron
> You have access to the squadron CLI tool.
>  * When you start a task, notify the team: squadron report --msg "Starting task..." --status "In Progress"
>  * When you finish a task, report results: squadron report --msg "Task complete. Output saved to /dist." --ticket "JIRA-123" --status "Done"
> 
For "Quant" Agents (BlackCircleTerminal):
> Tool Capability: RBI Pipeline
> You can trigger the Research-Backtest-Implement pipeline:
> squadron quant --rbi --url "https://youtube.com/..."
> 
🌟 The Origin Story
Squadron was born out of necessity.
We are building BlackCircleTerminal, a quantitative trading platform built and managed by "AI Agent Stars."
Our lead virtual developers, Marcus (Strategy & Dev) and Caleb (Data & Backtesting), needed a way to communicate with us when we were away from the keyboard. We realized that for agents to be truly useful, they needed to be integrated into our Agile Workflow, not just our code editor.
Squadron is the "nervous system" that connects our AI workforce to our human tools.
🗺 Roadmap
 * [x] Core Bridge: CLI interface for agents.
 * [x] Jira Integration: Update tickets, comments, and status.
 * [x] Slack Integration: Real-time notifications.
 * [ ] Discord Integration: Webhook support for community alerts.
 * [ ] "Overseer" Mode: A background daemon that wakes agents up when Jira tickets are assigned to them.
 * [ ] GitHub Skill: Allow agents to open and merge PRs.
🤝 Contributing
We are building the future of Agent-First Engineering. If you have ideas for new integrations (Linear, Trello, Asana), please open a PR!
 * Fork the repo
 * Create your feature branch (git checkout -b feature/amazing-skill)
 * Commit your changes (git commit -m 'Add new skill')
 * Push to the branch (git push origin feature/amazing-skill)
 * Open a Pull Request
License: MIT




