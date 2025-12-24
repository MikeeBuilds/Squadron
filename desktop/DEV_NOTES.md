# Developer Notes - Desktop Stabilization

## Current Status (Dec 2025)
- **Runtime**: Stable. The application builds, launches, and renders the Dashboard/Wizard.
- **Build System**: valid. `npm run build` and `npm start` work correctly.
- **Frontend**: React + Vite + Tailwind are integrated and working.
- **Backend Connection**: The Python backend serves at `http://localhost:8000`, but full frontend integration is partial.

## Critical Tech Debt
1. **IPC Stubs (`electron/stubs.ts`)**
   - **Issue**: Most IPC calls (e.g., project management, git operations, file system) are mocked with static return values.
   - **Impact**: The app looks functional but cannot perform real persistent actions on the user's file system yet.
   - **Next Step**: Connect these stubs to real Node.js handlers or the Python backend.

2. **Vite Cache Fragility**
   - **Issue**: We encountered `504 (Outdated Optimize Dep)` errors requiring aggressive cache clearing.
   - **Workaround**: We have configured `vite.config.ts` (temporarily enabled `force: true` then removed) and manual cache clearing in the start script could be beneficial.

3. **Security Context**
   - **Issue**: `contextIsolation` is enabled, but the `electronAPI` exposes a very wide surface area via `preload.ts` without strict schema validation in the main process.
   - **Next Step**: Implement Zod validation for all IPC payloads.

4. **Hardcoded Values**
   - **Issue**: `stubs.ts` contains hardcoded API keys (`sk-mock-key`) and settings.
   - **Next Step**: Wire up `settings-store.ts` to actually read/write from `config.json`.

## Next Implementation Steps
1.  **Wire Settings**: Make `settings-store.ts` persistent.
2.  **Connect Python**: Ensure the React frontend can talk to the local- **IPC Return Type Inconsistency**: Some IPC handlers return raw values (`app.getVersion()`, `date.now()`) while others return `{ success: true, data: ... }` envelopes. This causes frontend crashes if mismatched. `electron/main.ts` is currently a mix. Future refactor should standardize on envelopes and use Zod schemas on frontend to validate.
- **Python Backend**: Runs on port 8000 but not fully integrated.
- **Mock Dialogs**: `dialog-select-folder` is real, but others might be mocked.ctron dialog.
