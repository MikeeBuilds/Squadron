# 🦅 Squadron Command Reference

This document serves as the master reference for all Squadron CLI commands.

---

## 🎮 Control Plane

### `squadron server`
Start the Control Plane API server for the dashboard.

**Usage:**
```bash
squadron server [options]
```

**Options:**
- `--host`: Host to bind to (default: "127.0.0.1")
- `--port`: Port to run on (default: 8000)

**Example:**
```bash
# Start the API server
squadron server

# Then in another terminal, run the dashboard
cd dashboard && npm run dev
```

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Server startup output -->
> **Screenshot needed:** Terminal showing `squadron server` startup with API endpoints listed

---

### `squadron wake`
Manually trigger the Wake Protocol to start autonomous agent execution.

**Usage:**
```bash
squadron wake --summary "TASK" [options]
```

**Options:**
- `--summary`: Description of the task to execute (Required)
- `--agent`: Specific agent to route to (optional, auto-routes if not specified)
- `--ticket`: Associated ticket ID

**Example:**
```bash
# Manual wake
squadron wake --summary "Deploy the hotfix to production"

# Wake specific agent with ticket context
squadron wake --summary "Review auth changes" --agent Atlas --ticket "KAN-42"
```

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Wake Protocol execution -->
> **Screenshot needed:** Terminal showing wake protocol flow: routing → execution → report

---

## 📡 Communication

### `squadron report`
Send status updates to your team's communication channels and issue trackers.

**Usage:**
```bash
squadron report --msg "TEXT" [options]
```

**Options:**
- `--msg`: The message content (Required)
- `--agent`: Identity to post as (e.g. "Atlas", "Sage")
- `--channel`: Slack channel to post to (default: "#general")
- `--ticket`: Jira Ticket ID to update (e.g. "KAN-123")
- `--linear`: Linear Issue Key to update (e.g. "PRO-456")
- `--status`: New status for the ticket/issue (e.g. "In Progress", "Done")

**Examples:**
```bash
# Simple update
squadron report --msg "Database migration complete" --agent Atlas

# Update Jira and Slack
squadron report --msg "Fixed auth bug" --ticket "KAN-99" --status "Done"

# Update Linear issue
squadron report --msg "Feature ready for review" --linear "PRO-123" --status "In Review"
```

---

### `squadron broadcast`
Send wide-reaching announcements to your Discord community.

**Usage:**
```bash
squadron broadcast --msg "TEXT" [options]
```

**Options:**
- `--msg`: The announcement text (Required)
- `--agent`: Identity to post as

**Example:**
```bash
squadron broadcast --msg "🚀 v2.0 is now live!" --agent Atlas
```

---

### `squadron listen`
Starts the "Ears" of the operation. Listens for @mentions.

**Usage:**
```bash
# Listen to Slack (Default)
squadron listen

# Listen to Discord (Neural Link)
squadron listen --discord
```

**Options:**
- `--discord`: Listen to Discord instead of Slack

*Note: This process runs continuously. Use `Ctrl+C` to stop.*

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Listener in action -->
> **Screenshot needed:** Terminal showing listener receiving and responding to @mentions

---

## 🛠️ Workflow Automation

### `squadron overseer`
A background daemon that watches Jira/Linear for new tickets assigned to you.

**Usage:**
```bash
squadron overseer [options]
```

**Options:**
- `--interval`: Seconds between checks (default: 30)
- `--exec`: Shell command to run when a ticket is found
- `--auto-wake`: Automatically trigger Wake Protocol for new tickets
- `--linear`: Watch Linear instead of Jira

**Examples:**
```bash
# Basic polling
squadron overseer --interval 60

# With auto-wake (autonomous mode)
squadron overseer --auto-wake --interval 30

# Monitor Linear
squadron overseer --linear --auto-wake
```

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Overseer detecting ticket -->
> **Screenshot needed:** Terminal showing Overseer detecting new ticket and waking agent

---

### `squadron plan`
Generates an implementation plan (`PLAN.md`) based on a Jira/Linear ticket's description.

**Usage:**
```bash
squadron plan --ticket "ID" [options]
```

**Options:**
- `--ticket`: Jira Ticket ID (Required)
- `--linear`: Use Linear instead of Jira
- `--output`: Output filename (default: "PLAN.md")

**Example:**
```bash
squadron plan --ticket "KAN-123" --output "docs/implementation_plan.md"
```

---

## 🐙 GitHub Integration

### `squadron pr`
Create a GitHub Pull Request programmatically.

**Usage:**
```bash
squadron pr --repo "user/repo" --title "TITLE" --head "BRANCH" [options]
```

**Options:**
- `--repo`: Repository name in `owner/repo` format
- `--title`: PR Title
- `--head`: Source branch name
- `--base`: Target branch name (default: "main")
- `--body`: PR description

**Example:**
```bash
squadron pr --repo "MikeeBuilds/Squadron" --title "Add Linear Integration" --head "feat-linear"
```

---

### `squadron issue`
Create a GitHub Issue.

**Usage:**
```bash
squadron issue --repo "user/repo" --title "TITLE" [options]
```

**Options:**
- `--repo`: Repository name
- `--title`: Issue Title
- `--body`: Issue description
- `--labels`: Comma-separated list of labels

---

## 🧠 Knowledge System

### `squadron ask`
Query the team's knowledge base (stored in `squadron/knowledge/`).

**Usage:**
```bash
squadron ask "QUESTION"
```

**Example:**
```bash
squadron ask "How do we handle API authentication?"
squadron ask "What is Atlas responsible for?"
```

---

### `squadron learn`
Scans your codebase to update the internal map of the project. Run this after adding significant new code.

**Usage:**
```bash
squadron learn
```

This generates or updates `knowledge/CODEBASE_MAP.md`.

---

## ⚙️ Setup

### `squadron init`
Initialize Squadron in a new project. Creates the `squadron/` folder structure and `.env` template.

**Usage:**
```bash
squadron init
```

This creates:
- `squadron/knowledge/TEAM.md`
- `squadron/knowledge/ROLES.md`
- `squadron/knowledge/WORKFLOW.md`
- `.env` template (if not exists)

---

## 🔧 Advanced Commands

### Environment Variables

All commands respect these environment variables:

```env
# LLM Provider (Required for Swarm routing)
GEMINI_API_KEY=your-key

# Jira
JIRA_SERVER=https://your-domain.atlassian.net
JIRA_EMAIL=your-email@example.com
JIRA_TOKEN=your-api-token

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_BOT_TOKEN=...

# GitHub
GITHUB_TOKEN=ghp_...

# Linear
LINEAR_API_KEY=lin_api_...
```

---

## 📊 Command Quick Reference

| Command | Purpose |
|---------|---------|
| `squadron init` | Setup Squadron in your project |
| `squadron learn` | Scan codebase and build knowledge |
| `squadron server` | Start Control Plane API |
| `squadron listen` | Listen for Slack @mentions |
| `squadron listen --discord` | Listen for Discord @mentions |
| `squadron overseer` | Watch for new tickets |
| `squadron overseer --auto-wake` | Auto-execute on new tickets |
| `squadron wake` | Manually trigger agent execution |
| `squadron report` | Send updates to Slack + tickets |
| `squadron broadcast` | Announce to Discord |
| `squadron pr` | Create GitHub PR |
| `squadron issue` | Create GitHub Issue |
| `squadron plan` | Generate implementation plan |
| `squadron ask` | Query knowledge base |
