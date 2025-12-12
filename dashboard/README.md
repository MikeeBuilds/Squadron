# 🎮 Squadron Control Plane Dashboard

The real-time web UI for managing your Squadron agents.

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Dashboard Home -->
> **Screenshot needed:** Full dashboard overview with agent cards, activity stream, and stats

## Quick Start

### Prerequisites

1. Start the Squadron API server:
```bash
squadron server
```

2. Install dashboard dependencies (first time only):
```bash
npm install
```

3. Run the dashboard:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

---

## Pages

### 🏠 Home (Dashboard)
The main control center showing:
- **Agent Status Cards** — Real-time status of each agent
- **Activity Stream** — Live SSE feed of agent actions
- **System Stats** — Active agents, task queue, memory usage
- **Quick Actions** — Send commands, trigger missions

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Home Page -->
> **Screenshot needed:** Dashboard home page with all widgets visible

---

### 🤖 Agents
Detailed agent profiles including:
- **Capabilities** — What each agent can do
- **Current Task** — What they're working on
- **Task History** — Recent completions
- **Memory Stats** — How much they remember

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Agents Page -->
> **Screenshot needed:** Agents page showing Marcus and Caleb profiles with their capabilities

---

### 💬 Console
Direct REPL-style communication with agents:
- **Chat Interface** — Send messages to any agent
- **Response Streaming** — Watch agents think in real-time
- **Tool Calls** — See when agents use their skills
- **Memory Context** — Agents pull from past conversations

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Console Page -->
> **Screenshot needed:** Console showing a conversation with Marcus, including tool calls

<!-- 🎥 RECORDING PLACEHOLDER: Console Demo -->
> **Recording needed:** Full conversation flow in the Console - sending task → agent thinking → using tools → responding

---

### 🚀 Missions
Track and trigger agent missions:
- **Active Missions** — Currently running tasks
- **Mission History** — Completed and failed missions
- **Trigger New Mission** — Start a new autonomous task
- **Mission Details** — View full execution logs

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Missions Page -->
> **Screenshot needed:** Missions page showing active and completed missions

---

### 🔌 Integrations (Sidebar Panel)
Quick access to all integrations:
- **Slack** — Send messages to channels
- **Discord** — Broadcast announcements
- **Jira** — Comment on tickets
- **GitHub** — Create PRs and Issues
- **Linear** — Update issues

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Integrations Panel -->
> **Screenshot needed:** Integrations panel expanded showing all available platforms

---

### ⚙️ Settings
System configuration and status:
- **Environment Check** — Which integrations are configured
- **API Status** — Backend health check
- **Agent Configuration** — View/edit agent definitions
- **Memory Management** — Clear agent memories

<!-- 🖼️ SCREENSHOT PLACEHOLDER: Settings Page -->
> **Screenshot needed:** Settings page showing environment status and configuration

---

## Architecture

```
dashboard/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home/Dashboard
│   ├── agents/page.tsx     # Agent profiles
│   ├── console/page.tsx    # Agent REPL
│   ├── missions/page.tsx   # Mission tracking
│   └── settings/page.tsx   # Configuration
│
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   ├── Navbar.tsx          # Top navigation
│   ├── Sidebar.tsx         # Side navigation
│   └── ...
│
├── lib/                    # Utilities
│   └── utils.ts
│
└── public/                 # Static assets
    └── logo.png
```

## API Endpoints

The dashboard connects to the Squadron Control Plane API (`squadron server`):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/agents` | GET | List all agents |
| `/agents/{name}/history` | GET | Agent task history |
| `/tasks` | GET | Current task queue |
| `/activity/stream` | GET (SSE) | Real-time activity |
| `/command` | POST | Send command to agents |
| `/missions` | GET | List missions |
| `/wake` | POST | Trigger Wake Protocol |
| `/memory/stats` | GET | Memory statistics |
| `/integrations/status` | GET | Integration status |
| `/slack/send` | POST | Send Slack message |
| `/discord/broadcast` | POST | Discord broadcast |
| `/jira/comment` | POST | Add Jira comment |
| `/github/pr` | POST | Create GitHub PR |
| `/github/issue` | POST | Create GitHub Issue |
| `/linear/update` | POST | Update Linear issue |

## Tech Stack

- **Next.js 15** — React framework with App Router
- **Tailwind CSS** — Styling
- **shadcn/ui** — Component library
- **Server-Sent Events** — Real-time updates
- **TypeScript** — Type safety

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment

The dashboard expects the API to be running at `http://localhost:8000`. This is configured in the fetch calls throughout the app.

To change the API URL, update the fetch calls or add an environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
