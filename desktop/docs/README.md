# Squadron Desktop Documentation

This folder contains documentation for the Squadron Desktop v2.0 application.

## 📚 Contents

| Document | Description |
|----------|-------------|
| [FEATURE_PARITY.md](./FEATURE_PARITY.md) | Master tracking for Auto-Claude feature parity |
| [pages/](./pages/) | Page-specific documentation |

## 🏗️ Architecture

```
Squadron Desktop (Electron + React)
├── Renderer (Vite + React + TypeScript)
│   ├── components/     # UI components
│   ├── lib/            # Utilities and API
│   └── App.tsx         # Main application
├── Main Process (Electron)
│   ├── main.ts         # IPC handlers, window management
│   └── preload.ts      # Context bridge
└── Python Backend
    └── squadron/       # CLI and agent framework
```

## 🔑 Key Components

### Task Management
- `TaskWizard.tsx` - Create new tasks (Draft, Images, Model selector)

### Terminals
- `TerminalHub.tsx` - Multi-tab terminal management
- `XTermComponent.tsx` - Individual terminal with xterm.js + node-pty

### AI Features
- `InsightsPanel.tsx` - Chat interface for codebase queries
- `ContextViewer.tsx` - Display CODEBASE_MAP.md knowledge

### Onboarding
- `OnboardingWizard.tsx` - First-run setup flow

## 🔗 Related

- [CHANGELOG.md](/CHANGELOG.md) - Version history
- [README.md](/README.md) - Project overview
- [Auto-Claude Reference](https://github.com/AndyMik90/Auto-Claude) - Feature source

---

*Last Updated: 2025-12-22*
