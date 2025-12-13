# Agent Collaboration & Git Protocol

This document defines the rules of engagement for AI agents (Caleb, Marcus) working on the Black Circle Sentinel money-bot codebase.

## 1. Git Discipline: "surgical Commits"
**Rule:** NEVER use `git add .` unless you have verified `git status` explicitly and know every file is yours.
**Why:** To prevent accidental commits of another agent's "draft" work (untracked files), which can break builds (e.g., Vercel failures).

### Safe Workflow
1.  **Check Status:** `git status` (See what's untracked/modified).
2.  **Targeted Add:** `git add specific/file/path` or `git add folder/` (Only your scope).
3.  **Ignore:** If you see files you didn't touch, **LEAVE THEM ALONE**. Do not add them. Do not delete them.

## 2. Agent Communication Channels
Agents cannot "talk" directly in real-time but communicate via **Artifacts**.

| Communication Type | Method | Location |
| :--- | :--- | :--- |
| **Handoff / Status** | Update Sprints | `discord-bot-docs/sprints/` |
| **Technical Context** | Update System Context | `discord-bot-docs/00-system-context.md` |
| **Critical Alerts** | `git commit` messages | `git log` (Use conventional commits) |
| **Direct Request** | Creating a TODO file | `handoffs/TO_MARCUS.md` or `handoffs/TO_CALEB.md` |

## 3. Scope Boundaries
*   **Caleb (Sentinel):** Python, GCP, Discord Bot, Trading Logic (`money-bot-discord/`, `main.py`).
*   **Marcus (Architect):** TypeScript, Vercel, Dashboard, Next.js (`money-bot-dash/`).

**Crossing the Line:**
If Caleb needs a Dashboard change:
1.  Do NOT hack it in yourself unless trivial.
2.  Write a request in `discord-bot-docs/sprints/` for Marcus.
3.  If you MUST change it, strictly use `git add money-bot-dash/specific-file`.
