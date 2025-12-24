import { ipcMain } from 'electron';

export function setupStubs() {
    // Custom handlers for Legacy/Basic methods (must be defined before generic loop or excluded)
    // These return raw values instead of IPCResult
    // Helper to safely register handlers
    const safeHandle = (channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>) => {
        try {
            ipcMain.handle(channel, handler);
        } catch (error) {
            // Ignore if already registered
            console.log(`[STUB] Skipped ${channel} (already processed)`);
        }
    };

    // Custom handlers for Legacy/Basic methods (must be defined before generic loop or excluded)
    // These return raw values instead of IPCResult
    safeHandle('settings-get-providers', async () => {
        console.log('[STUB] settings-get-providers');
        return ['openai', 'anthropic', 'ollama'];
    });

    safeHandle('settings-has-key', async (_, { provider }) => {
        console.log(`[STUB] settings-has-key: ${provider}`);
        return true; // Always return true for dev
    });

    safeHandle('settings-get-key', async (_, { provider }) => {
        console.log(`[STUB] settings-get-key: ${provider}`);
        return 'sk-mock-key';
    });

    safeHandle('settings-onboarding-complete', async () => {
        return { success: true, data: true };
    });

    const invokeChannels = [
        // Project
        'project-add', 'project-remove', 'project-get-all', 'project-update-settings',
        'project-initialize', 'project-update-autobuild', 'project-check-version',
        'project-get-tab-state', 'project-save-tab-state',

        // Task
        'task-get-all', 'task-create', 'task-delete', 'task-update', 'task-submit-review',
        'task-update-status', 'task-recover', 'task-check-running', 'task-archive', 'task-unarchive',

        // Worktree
        'worktree-get-status', 'worktree-get-diff', 'worktree-merge',
        'worktree-merge-preview', 'worktree-discard', 'worktree-list',

        // Terminal
        'terminal-create', 'terminal-destroy', 'terminal-generate-name', 'terminal-get-sessions',
        'terminal-restore-session', 'terminal-clear-sessions', 'terminal-get-session-dates',
        'terminal-get-sessions-date', 'terminal-restore-date', 'terminal-save-buffer',

        // Claude
        'claude-get-profiles', 'claude-save-profile', 'claude-delete-profile', 'claude-rename-profile',
        'claude-set-active-profile', 'claude-switch-profile', 'claude-init-profile', 'claude-set-token',
        'claude-get-autoswitch', 'claude-update-autoswitch', 'claude-fetch-usage',
        'claude-get-best-profile', 'claude-retry-profile',

        // Usage
        'usage-get',

        // Settings
        'settings-get-all', 'settings-save', 'settings-get-default-location', 'settings-save-key',
        'settings-delete-key', // 'settings-get-providers', 'settings-has-key', handled manually
        /* 'settings-onboarding-complete', handled manually */ 'settings-set-onboarding', 'settings-set-project',
        'settings-get-integrations', 'settings-export-env',

        // Dialog
        'dialog-select-folder',

        // App
        'app-get-version', 'app-check-update', 'app-download-update',

        // Roadmap
        'roadmap-get', 'roadmap-get-status', 'roadmap-save', 'roadmap-stop',
        'roadmap-update-feature', 'roadmap-convert-feature',

        // Context
        'context-get', 'context-refresh', 'memory-get-status', 'memory-search', 'memory-get-recent',

        // Env
        'env-get', 'env-update', 'env-check-auth', 'env-invoke-setup',

        // Infra
        'infra-get-status', 'infra-list-dbs', 'infra-test-conn', 'graphiti-validate-key', 'graphiti-test-conn',

        // Linear
        'linear-get-teams', 'linear-get-projects', 'linear-get-issues', 'linear-import-issues', 'linear-check-conn',

        // GitHub
        'github-get-repos', 'github-get-issues', 'github-get-issue', 'github-check-conn',
        'github-get-comments', 'github-import-issues', 'github-create-release', 'github-check-cli',
        'github-check-auth', 'github-start-auth', 'github-get-token', 'github-get-user',
        'github-list-user-repos', 'github-detect-repo', 'github-get-branches', 'github-create-repo',
        'github-add-remote', 'github-list-orgs',

        // Release
        'release-get-versions', 'release-preflight-check',

        // Ideation
        'ideation-get', 'ideation-stop', 'ideation-update-status', 'ideation-convert-task',
        'ideation-dismiss', 'ideation-dismiss-all', 'ideation-archive', 'ideation-delete', 'ideation-delete-multiple',

        // AutoBuild
        'autobuild-check-update', 'autobuild-get-version',

        // Shell
        'shell-open-external',

        // SourceEnv
        'source-get-env', 'source-update-env', 'source-check-token',

        // Changelog
        'changelog-get-done-tasks', 'changelog-load-specs', 'changelog-save', 'changelog-read-existing',
        'changelog-suggest-version', 'changelog-suggest-version-commits', 'changelog-get-branches',
        'changelog-get-tags', 'changelog-get-commits', 'changelog-save-image', 'changelog-read-local-image',

        // Insights
        'insights-get-session', 'insights-clear-session', 'insights-create-task', 'insights-list-sessions',
        'insights-new-session', 'insights-switch-session', 'insights-delete-session',
        'insights-rename-session', 'insights-update-config',

        // TaskLogs
        'task-get-logs', 'task-watch-logs', 'task-unwatch-logs',

        // File
        'file-list-directory',

        // Git
        'git-get-branches', 'git-get-current-branch', 'git-detect-main-branch', 'git-check-status', 'git-initialize',

        // Ollama
        'ollama-check-status', 'ollama-list-models', 'ollama-list-embedding-models', 'ollama-pull-model',

        // CLI
        'cli-check-installed', 'cli-install',

        // Knowledge
        'knowledge-get', 'insights-ask'
    ];

    const listenChannels = [
        'task-start', 'task-stop',
        'terminal-spawn', 'terminal-write', 'terminal-resize', 'terminal-kill', 'terminal-invoke-claude', 'terminal-resume-claude',
        'roadmap-generate', 'roadmap-refresh',
        'github-investigate-issue',
        'release-create',
        'ideation-generate', 'ideation-refresh',
        'autobuild-download-update',
        'app-install-update',
        'changelog-generate',
        'insights-send-message'
    ];

    invokeChannels.forEach(channel => {
        // Only add if not already handled (to allow main.ts to override specific ones if needed)
        // Note: ipcMain.handle throws if duplicate, so we should check or wrap in try/catch.
        // Since we don't have an easy "hasHandler" API in standard electron types properly exposed here without internal hacks,
        // we will just wrap in try catch.
        try {
            ipcMain.handle(channel, async () => {
                console.log(`[STUB] IPC Invoke: ${channel}`);
                return { success: true, data: [] }; // Generic safe return
            });
        } catch (e) {
            // Ignore if already registered
        }
    });

    listenChannels.forEach(channel => {
        try {
            ipcMain.on(channel, () => {
                console.log(`[STUB] IPC Event: ${channel}`);
            });
        } catch (e) {
            // Ignore
        }
    });
}
