# Squadron Desktop v2.0 - Feature Parity Tracker

This document tracks our progress in porting features from [Auto-Claude](https://github.com/AndyMik90/Auto-Claude) to Squadron Desktop.

> **Reference**: Auto-Claude cloned to `C:\Users\mludl\Documents\Dev\Auto-Claude`

---

## 🎯 Overall Progress

| Category | Auto-Claude Components | Squadron Status | % Complete |
|----------|------------------------|-----------------|------------|
| Task Management | 5 | 1 | 20% |
| Terminals | 2 | 2 | 100% |
| Insights | 3 | 1 | 33% |
| Context | 1 | 1 | 100% |
| Git/GitHub | 4 | 0 | 0% |
| Roadmap | 4 | 0 | 0% |
| Agent Config | 4 | 0 | 0% |
| UI/Nav | 4 | 2 | 50% |

---

## 📋 Page 1: Task Management

### TaskCreationWizard → TaskWizard ✅
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| Draft Persistence | localStorage save/restore | ✅ Implemented | Done |
| Image Paste | Ctrl+V screenshots | ✅ Implemented | Done |
| Image Drag-Drop | Drop files on textarea | ❌ Not yet | TODO |
| Model Selector | Claude/GPT selection | ✅ Implemented | Done |
| @Mention Files | Type @filename | ❌ Not yet | TODO |
| File Explorer Drawer | Browse project files | ❌ Not yet | TODO |
| Git Branch Selector | Choose base branch | ❌ Not yet | TODO |
| Agent Profile Selector | Fast/Balanced/Quality | ❌ Not yet | TODO |

### TaskEditDialog ❌
- Not implemented yet
- Auto-Claude: 757 lines with same patterns as creation

### TaskCard 🔄
- Basic implementation exists
- Missing: Stuck detection, auto-recovery, phase progress

### KanbanBoard ❌
- Not implemented yet
- Auto-Claude: dnd-kit drag-drop, column filters, archive toggle

---

## 🖥️ Page 2: Terminals

### TerminalGrid → TerminalHub ✅
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| Tab Management | Multi-tab terminals | ✅ Implemented | Done |
| PTY Integration | node-pty backend | ✅ Implemented | Done |
| Session Persistence | localStorage | ✅ Implemented | Done |
| Kill on Close | Cleanup processes | ✅ Implemented | Done |

### Terminal → XTermComponent ✅
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| xterm.js rendering | Terminal emulation | ✅ Implemented | Done |
| Fit addon | Auto-resize | ✅ Implemented | Done |
| Focus handling | Click to focus | ✅ Implemented | Done |

---

## 💬 Page 3: Insights

### Insights → InsightsPanel ✅
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| Chat Interface | Message bubbles | ✅ Implemented | Done |
| OpenAI Integration | GPT-4o calls | ✅ Implemented | Done |
| Context Injection | Codebase map | ✅ Implemented | Done |
| Model Selector | Choose model | ❌ Not yet | TODO |
| Chat History | Sidebar list | ❌ Not yet | TODO |

### ChatHistorySidebar ❌
- Not implemented yet
- Auto-Claude: 10KB component with history persistence

---

## 📖 Page 4: Context

### Context → ContextViewer ✅
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| Display CODEBASE_MAP | Read knowledge file | ✅ Implemented | Done |
| Syntax Highlighting | Markdown rendering | ❌ Basic only | TODO |
| File Links | Clickable paths | ❌ Not yet | TODO |

---

## 🔀 Page 5: Git Integration

### GitHubSetupModal ❌
- Not implemented (34KB in Auto-Claude!)
- Features: GitHub auth, repo selection, token storage

### GitSetupModal ❌
- Not implemented yet
- Features: Init repo, initial commit, branch detection

### Worktrees ❌
- Not implemented (18KB in Auto-Claude)
- Features: Create/switch/merge git worktrees per task

---

## 🗺️ Page 6: Roadmap & Ideation

### Roadmap ❌
- Not implemented yet
- Features: Visual roadmap with features, AI generation

### RoadmapKanbanView ❌
- Not implemented yet
- Features: Drag-drop feature prioritization

### Ideation ❌
- Not implemented yet
- Features: Brainstorm ideas, AI suggestions

---

## ⚙️ Page 7: Agent & Model Config

### AgentProfileSelector ❌
- Not implemented (15KB)
- Features: Fast/Balanced/Quality profiles, per-phase models

### EnvConfigModal ❌
- Not implemented (23KB)
- Features: API keys, provider settings, custom models

---

## 🧭 Page 8: UI/Navigation

### Sidebar 🔄
| Feature | Auto-Claude | Squadron | Status |
|---------|-------------|----------|--------|
| Navigation | Multiple views | ✅ Basic | Partial |
| Keyboard Shortcuts | K/A/N/etc | ❌ Not yet | TODO |
| Rate Limit Indicator | API status | ❌ Not yet | TODO |
| Project Switcher | Multi-project | ❌ Not yet | TODO |

### OnboardingWizard ✅
- Squadron has custom onboarding flow

---

## 🚀 Implementation Priority

### Phase 1 (Current) ✅
1. ✅ Draft Persistence
2. ✅ Image Paste
3. ✅ Model Selector
4. ✅ Terminal Sessions
5. ✅ Insights Chat
6. ✅ Context Viewer

### Phase 2 (Next)
1. 🎯 @Mention File References
2. 🎯 Task Edit Dialog
3. 🎯 Chat History Sidebar
4. 🎯 Enhanced TaskCard

### Phase 3 (Future)
1. Kanban Board
2. Git Integration
3. Worktrees
4. Roadmap

---

## 📁 File Reference

### Auto-Claude Component Locations
```
Auto-Claude/auto-claude-ui/src/renderer/components/
├── TaskCreationWizard.tsx (45KB, 1167 lines)
├── TaskEditDialog.tsx (29KB, 757 lines)
├── TaskCard.tsx (14KB, 402 lines)
├── KanbanBoard.tsx (13KB, 396 lines)
├── Sidebar.tsx (16KB, 476 lines)
├── Insights.tsx (20KB)
├── GitHubSetupModal.tsx (34KB!)
├── AgentProfileSelector.tsx (15KB)
└── Worktrees.tsx (18KB)
```

### Squadron Component Locations
```
Squadron/desktop/src/components/
├── TaskWizard.tsx (Draft, Images, Model)
├── TerminalHub.tsx (Tab management)
├── XTermComponent.tsx (PTY terminal)
├── InsightsPanel.tsx (Chat interface)
├── ContextViewer.tsx (Knowledge map)
└── OnboardingWizard.tsx (Setup flow)
```

---

*Last Updated: 2025-12-22*
