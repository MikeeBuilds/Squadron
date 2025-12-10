# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
