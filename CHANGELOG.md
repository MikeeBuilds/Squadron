# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-22 (Desktop App)
### Added
- **🖥️ Electron Desktop App**: Full rewrite as a native desktop application
  - React + Vite + TypeScript frontend with shadcn/ui components
  - Integrated PTY terminals (node-pty) for real terminal emulation
  - Session persistence for terminal tabs across restarts
- **📋 TaskWizard Enhancements** (Auto-Claude Parity):
  - **Draft Persistence**: Form state saved to localStorage on close, restored on open
  - **Image Paste**: Ctrl+V screenshots into description with thumbnail preview
  - **Model Selector**: Choose between Auto, GPT-4o, Claude Sonnet, Gemini Pro
  - **Enhanced Review**: Shows priority, assignee, model, and image count badges
- **💬 Insights Panel**: Chat interface for querying codebases with AI
- **📖 Context Viewer**: Display `CODEBASE_MAP.md` knowledge map
- **🛠️ Surgical File Editing (fs_tool v2)**:
  - `replace_in_file()`: Pattern-based replacement with checksum verification
  - `insert_into_file()`: Line-specific insertion
  - `read_file_section()`: Read specific line ranges
- **🔀 Git Tool with AI Merge**:
  - `get_conflicts()`: Parse merge conflict markers
  - `resolve_conflicts()`: AI-powered conflict resolution
  - `commit()`, `push()`, `create_pr()`: Full Git workflow

### Changed
- **Architecture**: Shifted from pure Python CLI to Electron + Python backend hybrid
- **UI Framework**: Dark theme with glassmorphism, micro-animations, premium feel

## [0.5.1] - 2025-12-16
### Added
- **🧪 Comprehensive Test Suite**: Full pytest coverage with mocked dependencies
  - Unit tests for Brain, Hippocampus, ModelFactory, Delegator, TagParser, Skills
  - Integration tests for CLI commands and Wake Protocol
  - Shared fixtures for fast, deterministic testing
  - `tests/README.md` documentation for contributors
- **🔄 GitHub Actions CI/CD**: Automated testing on Python 3.10, 3.11, 3.12
- **📊 README Badges**: Tests, Coverage, Downloads, Last Commit, Issues

### Fixed
- Resolved git merge conflict markers in `brain.py` and `hippocampus.py`
- Removed duplicate dependencies in `setup.py` and `requirements.txt`
- Fixed 408 lines of duplicate code in `hippocampus.py`

## [0.6.0] - 2025-12-13
### Added
- **🎮 Control Plane Dashboard**: Real-time web UI via `squadron server`
  - Live SSE activity streaming
  - Command input to send tasks to agents
  - Agent status cards with current objectives
  - System statistics (active agents, task queue, missions)
  - **Integrations Panel**: Send to Slack, Discord, Jira, GitHub directly from UI
  - GitHub PR/Issue creation from dashboard
  - **Agents Page**: Detailed agent profiles with capabilities
  - **Missions Page**: Active/history view with mission trigger
  - **Console Page**: Direct REPL-style chat with agents
  - **Settings Page**: System status and env configuration reference
- **🐝 Swarm 2.0**: Enhanced multi-agent orchestration
  - LLM-powered intelligent routing (replaces keyword heuristics)
  - `handoff_task()` for agent-to-agent delegation with context
  - Delegation chain tracking
  - Task queue with priority support
- **🧬 Evolution Layer**: Self-improvement system
  - `skill_registry.py` for tracking evolved skills
  - Version control with rollback support
  - Quality scoring based on success/failure rates
  - Skill creation, validation, and archival
- **⏰ Wake Protocol**: Autonomous agent execution
  - `wake_protocol.py` orchestrates trigger → route → execute → report
  - `squadron wake` CLI command for manual triggering
  - Automatic ticket reporting after task completion
- **📡 Event Bus**: Central pub/sub for real-time activity
  - Powers dashboard SSE streaming
  - Tracks agent starts, tool calls, completions, errors
- **💬 Agent Communication**: Agents can talk to each other via tickets
  - **Overseer v3.0**: Auto-wakes agents when Jira/Linear tickets assigned
  - **@Mention Support**: Tag agents in ticket comments to trigger them
  - `reply_to_ticket()` tool for agents to comment on tickets
  - `tag_agent()` tool to request help from other agents
  - Autonomous handoffs with context through ticket system
- **🧠 Persistent Memory**: Agents remember past work
  - **Hippocampus v2.0**: Agent-specific semantic memory with ChromaDB
  - `save_memory()`, `recall_memory()`, `get_memory_context()` tools
  - Conversation and task history tracking
  - Memory API endpoints for dashboard integration
- **GCP Migration**:
  - Full deployment to Google Cloud Compute Engine
  - `health_check.py` for remote diagnostics

### Changed
- **Swarm Overseer**: Now uses Gemini for intelligent routing
- **Dashboard Frontend**: Complete rewrite with shadcn/ui components
- **CLI**: Added `wake` command for autonomous execution

## [0.5.0] - 2025-12-11
*(Caleb - 02:45 AM EST)*
### Added
- **Autonomous Quant Skills**:
    - `find_strategy_videos`: Agent autonomously searches YouTube for new alpha.
    - `run_backtest`: Agent runs Python backtests validation.
    - `get_market_data`: Agent checks Alpaca price feeds.
- **Intelligent Auditor**:
    - **Smart EOD (3:30 PM)**: Switched from "Close All" to "Swing vs Cut" decision logic based on PnL/Charts/Time.
    - **Daily Optimizer (4:30 PM)**: Auto-triggers research if daily win rate is < 50%.

> [!NOTE]
> **Notes for Marcus**:
> 1. **Dashboard UI**: The backend now supports a `SWING` status for signals. Please ensure the frontend `LedgerPage` and `OpenSignals` components correctly display/filter trades with `status="SWING"`. They might currently disappear if the query blindly filters for `OPEN`.
> 2. **Reporting**: The Daily Optimizer posts reports to Slack/Discord. You might want to pipe these into a "Strategy Lab" view on the dashboard eventually.

## [0.4.1] - 2025-12-11
### Added
- **MCP Client**: Universal bridge for MCP servers.

## [0.4.0] - 2025-12-11
*(Caleb - 01:25 AM EST)*
### Added
- **The Brain**: Centralized intelligence router (`brain.py`) that decides between conversational replies and tool execution.
- **Discord Bot**: Full `discord.py` integration with "Neural Link" personas.
- **Browser Skill**: `BrowserTool` allows agents (Marcus) to visit websites and capture screenshots.
- **SSH Skill**: `SSHTool` allows agents (Caleb) to execute safe remote commands.
- **File Uploads**: Bridge and Listeners now support attaching files generated by tools (e.g., screenshots).
- **Masquerading Fix**: Resolved "Limited Mode" by ensuring webhooks are used correctly with custom avatars.
- **Unified Entry Point**: `main.py` now launches Discord Bot, Slack Listener, and Jira Overseer concurrently.

## [0.3.0] - 2025-12-10
### Added
- **Planner Skill**: `squadron plan --ticket <ID>` generates a structured `PLAN.md` file.
- **Artifacts**: New templates for Implementation Plans.

## [0.2.6] - 2025-12-10
### Changed
- **Release Fix**: Version bump to resolve PyPI collision.

## [0.2.5] - 2025-12-10
### Added
- **Local Agent Config**: `squadron init` now creates a local `squadron/agents.yaml`.
- **Packaging Fix**: Included `agents.yaml` and `knowledge/*.md` templates in PyPI package via `MANIFEST.in`.

### Changed
- **Privacy**: Default package avatars are now generic Robohash avatars. Users can override them in their local `agents.yaml`.
- **CLI Logic**: Prioritizes local configuration files over package defaults for both Knowledge and Agents.

## [0.2.4] - 2025-12-10
### Changed
- **Documentation**: Synced `README.md` on PyPI to reflect v0.2.3 features (Init/Learn/AGPL).

## [0.2.3] - 2025-12-10
### Added
- **Init Command (`squadron init`)**: Scaffolds a local `squadron/knowledge/` directory and `.env` file for new projects.
- **Local Knowledge Overlay**: `squadron ask` now prioritizes the local `knowledge/` folder over the package defaults, allowing per-project customization.

## [0.2.2] - 2025-12-10
### Added
- **Librarian Skill (`squadron learn`)**: Auto-generates `CODEBASE_MAP.md` by scanning the repository structure.

### Changed
- **License**: Switched from MIT to **AGPL-3.0** to enforce open-source reciprocity for network deployments.

## [0.2.1] - 2025-12-10
### Added
- **Listener Service (`squadron listen`)**: New command utilizing Slack Socket Mode to allow agents to "hear" and reply to @mentions in real-time.
- **Dependency**: Added `slack_bolt` for event handling.

## [0.2.0] - 2025-12-10
### Added
- **Dynamic Agent Identities**: Agents can now have custom names and avatars (e.g., Marcus, Caleb) supported in Slack and Discord using `assets/` and `agents.yaml`.
- **Linear Integration**: Full support for Linear issues via `--linear` flag (create, comment, update status).
- **RAG-Lite (`squadron ask`)**: New memory module allowing agents to query the `knowledge/` directory for team context.
- **Overseer 2.0 (`--exec`)**: The Overseer can now execute arbitrary shell commands when new tickets are detected, enabling "Wake Up" protocols.
- **Avatars**: Hosted assets for Marcus and Caleb.

### Changed
- **CLI Architecture**: Refactored to support sub-commands more robustly.
- **Documentation**: Major updates to `README.md` and intro of `UPDATE.md` for team onboarding.

## [0.1.0] - 2025-12-09
### Added
- **Core CLI**: Basic `squadron report` command.
- **Bridges**: Initial support for Jira, Slack, Discord, and GitHub.
- **Overseer 1.0**: Basic polling for new Jira tickets.
- **Package**: Initial PyPI release structure.
