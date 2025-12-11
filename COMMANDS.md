# 🦅 Squadron Command Reference

This document serves as the master reference for all Squadron CLI commands. As the system grows, add new commands and options here.

## 📡 Communication

### `squadron report`
Send status updates to your team's communication channels and issue trackers.

**Usage:**
```bash
squadron report --msg "TEXT" [options]
```

**Options:**
- `--msg`: The message content (Required).
- `--agent`: Identity to post as (e.g. "Marcus", "Caleb").
- `--channel`: Slack channel to post to (default: "#general").
- `--ticket`: Jira Ticket ID to update (e.g. "KAN-123").
- `--linear`: Linear Issue Key to update (e.g. "PRO-456").
- `--status`: New status for the ticket/issue (e.g. "In Progress", "Done").

**Examples:**
```bash
# Simple update
squadron report --msg "Database migration complete" --agent Marcus

# Update Jira and Slack
squadron report --msg "Fixed auth bug" --ticket "KAN-99" --status "Done"
```

---

### `squadron broadcast`
Send wide-reaching announcements to your Discord community.

**Usage:**
```bash
squadron broadcast --msg "TEXT" [options]
```

**Options:**
- `--msg`: The announcement text (Required).
- `--agent`: Identity to post as.

**Example:**
```bash
squadron broadcast --msg "🚀 v2.0 is now live!" --agent Marcus
```

---

### `squadron listen`
Starts the "Ears" of the operation. Listens for `@Squadron` mentions in Slack and auto-replies.

**Usage:**
```bash
squadron listen
```
*Note: This process runs continuously. Use `Ctrl+C` to stop.*

---

## 🛠️ Workflow Automation

### `squadron overseer`
A background daemon that watches Jira for new tickets assigned to you.

**Usage:**
```bash
squadron overseer [options]
```

**Options:**
- `--interval`: Seconds between checks (default: 30).
- `--exec`: Shell command to run when a ticket is found.

**Example:**
```bash
squadron overseer --interval 60
```

---

### `squadron plan`
Generates an implementation plan (`PLAN.md`) based on a Jira ticket's description.

**Usage:**
```bash
squadron plan --ticket "ID" [options]
```

**Options:**
- `--ticket`: Jira Ticket ID (Required).
- `--output`: Output filename (default: "PLAN.md").

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
- `--repo`: Repository name in `owner/repo` format.
- `--title`: PR Title.
- `--head`: Source branch name.
- `--base`: Target branch name (default: "main").
- `--body`: PR description.

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
- `--repo`: Repository name.
- `--title`: Issue Title.
- `--body`: Issue description.

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
```

---

### `squadron learn`
Scans your codebase to update the internal map of the project. Run this after adding significant new code.

**Usage:**
```bash
squadron learn
```

---

## ⚙️ Setup

### `squadron init`
Initialize Squadron in a new project. Creates the `squadron/` folder structure and `.env` template.

**Usage:**
```bash
squadron init
```
