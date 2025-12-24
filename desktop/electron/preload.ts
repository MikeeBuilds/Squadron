import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: string, data: any) => ipcRenderer.send(channel, data),
    onMessage: (channel: string, func: (...args: any[]) => void) => {
        const subscription = (event: any, ...args: any[]) => func(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },

    // Project operations
    addProject: (path: string) => ipcRenderer.invoke('project-add', { path }),
    removeProject: (projectId: string) => ipcRenderer.invoke('project-remove', { projectId }),
    getProjects: () => ipcRenderer.invoke('project-get-all'),
    updateProjectSettings: (projectId: string, settings: any) => ipcRenderer.invoke('project-update-settings', { projectId, settings }),
    initializeProject: (projectId: string) => ipcRenderer.invoke('project-initialize', { projectId }),
    updateProjectAutoBuild: (projectId: string) => ipcRenderer.invoke('project-update-autobuild', { projectId }),
    checkProjectVersion: (projectId: string) => ipcRenderer.invoke('project-check-version', { projectId }),

    // Tab State
    getTabState: () => ipcRenderer.invoke('project-get-tab-state'),
    saveTabState: (state: any) => ipcRenderer.invoke('project-save-tab-state', { state }),

    // Task operations
    getTasks: (projectId: string) => ipcRenderer.invoke('task-get-all', { projectId }),
    createTask: (projectId: string, title: string, description: string, metadata?: any) => ipcRenderer.invoke('task-create', { projectId, title, description, metadata }),
    deleteTask: (taskId: string) => ipcRenderer.invoke('task-delete', { taskId }),
    updateTask: (taskId: string, updates: any) => ipcRenderer.invoke('task-update', { taskId, updates }),
    startTask: (taskId: string, options?: any) => ipcRenderer.send('task-start', { taskId, options }),
    stopTask: (taskId: string) => ipcRenderer.send('task-stop', { taskId }),
    submitReview: (taskId: string, approved: boolean, feedback?: string) => ipcRenderer.invoke('task-submit-review', { taskId, approved, feedback }),
    updateTaskStatus: (taskId: string, status: string) => ipcRenderer.invoke('task-update-status', { taskId, status }),
    recoverStuckTask: (taskId: string, options: any) => ipcRenderer.invoke('task-recover', { taskId, options }),
    checkTaskRunning: (taskId: string) => ipcRenderer.invoke('task-check-running', { taskId }),

    // Workspace management
    getWorktreeStatus: (taskId: string) => ipcRenderer.invoke('worktree-get-status', { taskId }),
    getWorktreeDiff: (taskId: string) => ipcRenderer.invoke('worktree-get-diff', { taskId }),
    mergeWorktree: (taskId: string, options?: any) => ipcRenderer.invoke('worktree-merge', { taskId, options }),
    mergeWorktreePreview: (taskId: string) => ipcRenderer.invoke('worktree-merge-preview', { taskId }),
    discardWorktree: (taskId: string) => ipcRenderer.invoke('worktree-discard', { taskId }),
    listWorktrees: (projectId: string) => ipcRenderer.invoke('worktree-list', { projectId }),

    // Task archive operations
    archiveTasks: (projectId: string, taskIds: string[], version?: string) => ipcRenderer.invoke('task-archive', { projectId, taskIds, version }),
    unarchiveTasks: (projectId: string, taskIds: string[]) => ipcRenderer.invoke('task-unarchive', { projectId, taskIds }),

    // Event listeners
    onTaskProgress: (callback: any) => {
        const sub = (_: any, ...args: any[]) => callback(...args);
        ipcRenderer.on('task-progress', sub);
        return () => ipcRenderer.removeListener('task-progress', sub);
    },
    onTaskError: (callback: any) => {
        const sub = (_: any, ...args: any[]) => callback(...args);
        ipcRenderer.on('task-error', sub);
        return () => ipcRenderer.removeListener('task-error', sub);
    },
    onTaskLog: (callback: any) => {
        const sub = (_: any, ...args: any[]) => callback(...args);
        ipcRenderer.on('task-log', sub);
        return () => ipcRenderer.removeListener('task-log', sub);
    },
    onTaskStatusChange: (callback: any) => {
        const sub = (_: any, ...args: any[]) => callback(...args);
        ipcRenderer.on('task-status-change', sub);
        return () => ipcRenderer.removeListener('task-status-change', sub);
    },
    onTaskExecutionProgress: (callback: any) => {
        const sub = (_: any, ...args: any[]) => callback(...args);
        ipcRenderer.on('task-execution-progress', sub);
        return () => ipcRenderer.removeListener('task-execution-progress', sub);
    },

    // Terminal operations
    createTerminal: (options: any) => ipcRenderer.invoke('terminal-create', options),
    destroyTerminal: (id: string) => ipcRenderer.invoke('terminal-destroy', id), // Changed to invoke to match interface promise
    sendTerminalInput: (id: string, data: string) => ipcRenderer.send('terminal-write', { id, data }),
    resizeTerminal: (id: string, cols: number, rows: number) => ipcRenderer.send('terminal-resize', { id, cols, rows }),
    invokeClaudeInTerminal: (id: string, cwd?: string) => ipcRenderer.send('terminal-invoke-claude', { id, cwd }),
    generateTerminalName: (command: string, cwd?: string) => ipcRenderer.invoke('terminal-generate-name', { command, cwd }),

    // Terminal session management
    getTerminalSessions: (projectPath: string) => ipcRenderer.invoke('terminal-get-sessions', { projectPath }),
    restoreTerminalSession: (session: any, cols?: number, rows?: number) => ipcRenderer.invoke('terminal-restore-session', { session, cols, rows }),
    clearTerminalSessions: (projectPath: string) => ipcRenderer.invoke('terminal-clear-sessions', { projectPath }),
    resumeClaudeInTerminal: (id: string, sessionId?: string) => ipcRenderer.send('terminal-resume-claude', { id, sessionId }),
    getTerminalSessionDates: (projectPath?: string) => ipcRenderer.invoke('terminal-get-session-dates', { projectPath }),
    getTerminalSessionsForDate: (date: string, projectPath: string) => ipcRenderer.invoke('terminal-get-sessions-date', { date, projectPath }),
    restoreTerminalSessionsFromDate: (date: string, projectPath: string, cols?: number, rows?: number) => ipcRenderer.invoke('terminal-restore-date', { date, projectPath, cols, rows }),
    saveTerminalBuffer: (terminalId: string, serialized: string) => ipcRenderer.invoke('terminal-save-buffer', { terminalId, serialized }),

    // Terminal event listeners
    onTerminalOutput: (callback: (id: string, data: string) => void) => {
        const sub = (_: any, id: string, data: string) => callback(id, data);
        ipcRenderer.on('terminal-output', sub);
        return () => ipcRenderer.removeListener('terminal-output', sub);
    },
    onTerminalExit: (callback: (id: string, exitCode: number) => void) => {
        const sub = (_: any, id: string, exitCode: number) => callback(id, exitCode);
        ipcRenderer.on('terminal-exit', sub);
        return () => ipcRenderer.removeListener('terminal-exit', sub);
    },
    onTerminalTitleChange: (callback: (id: string, title: string) => void) => {
        const sub = (_: any, id: string, title: string) => callback(id, title);
        ipcRenderer.on('terminal-title-change', sub);
        return () => ipcRenderer.removeListener('terminal-title-change', sub);
    },
    onTerminalClaudeSession: (callback: (id: string, sessionId: string) => void) => {
        const sub = (_: any, id: string, sessionId: string) => callback(id, sessionId);
        ipcRenderer.on('terminal-claude-session', sub);
        return () => ipcRenderer.removeListener('terminal-claude-session', sub);
    },
    onTerminalRateLimit: (callback: (info: any) => void) => {
        const sub = (_: any, info: any) => callback(info);
        ipcRenderer.on('terminal-rate-limit', sub);
        return () => ipcRenderer.removeListener('terminal-rate-limit', sub);
    },
    onTerminalOAuthToken: (callback: (info: any) => void) => {
        const sub = (_: any, info: any) => callback(info);
        ipcRenderer.on('terminal-oauth-token', sub);
        return () => ipcRenderer.removeListener('terminal-oauth-token', sub);
    },

    // Claude profile management
    getClaudeProfiles: () => ipcRenderer.invoke('claude-get-profiles'),
    saveClaudeProfile: (profile: any) => ipcRenderer.invoke('claude-save-profile', { profile }),
    deleteClaudeProfile: (profileId: string) => ipcRenderer.invoke('claude-delete-profile', { profileId }),
    renameClaudeProfile: (profileId: string, newName: string) => ipcRenderer.invoke('claude-rename-profile', { profileId, newName }),
    setActiveClaudeProfile: (profileId: string) => ipcRenderer.invoke('claude-set-active-profile', { profileId }),
    switchClaudeProfile: (terminalId: string, profileId: string) => ipcRenderer.invoke('claude-switch-profile', { terminalId, profileId }),
    initializeClaudeProfile: (profileId: string) => ipcRenderer.invoke('claude-init-profile', { profileId }),
    setClaudeProfileToken: (profileId: string, token: string, email?: string) => ipcRenderer.invoke('claude-set-token', { profileId, token, email }),
    getAutoSwitchSettings: () => ipcRenderer.invoke('claude-get-autoswitch'),
    updateAutoSwitchSettings: (settings: any) => ipcRenderer.invoke('claude-update-autoswitch', { settings }),
    fetchClaudeUsage: (terminalId: string) => ipcRenderer.invoke('claude-fetch-usage', { terminalId }),
    getBestAvailableProfile: (excludeProfileId?: string) => ipcRenderer.invoke('claude-get-best-profile', { excludeProfileId }),
    onSDKRateLimit: (callback: (info: any) => void) => {
        const sub = (_: any, info: any) => callback(info);
        ipcRenderer.on('sdk-rate-limit', sub);
        return () => ipcRenderer.removeListener('sdk-rate-limit', sub);
    },
    retryWithProfile: (request: any) => ipcRenderer.invoke('claude-retry-profile', { request }),

    // Usage Monitoring
    requestUsageUpdate: () => ipcRenderer.invoke('usage-get'),
    onUsageUpdated: (callback: (usage: any) => void) => {
        const sub = (_: any, usage: any) => callback(usage);
        ipcRenderer.on('usage-updated', sub);
        return () => ipcRenderer.removeListener('usage-updated', sub);
    },
    onProactiveSwapNotification: (callback: (notification: any) => void) => {
        const sub = (_: any, notification: any) => callback(notification);
        ipcRenderer.on('proactive-swap', sub);
        return () => ipcRenderer.removeListener('proactive-swap', sub);
    },

    // App settings
    getSettings: () => ipcRenderer.invoke('settings-get-all'),
    saveSettings: (settings: any) => ipcRenderer.invoke('settings-save', { settings }),

    // Dialog operations
    selectDirectory: () => ipcRenderer.invoke('dialog-select-folder'),
    createProjectFolder: (location: string, name: string, initGit: boolean) => ipcRenderer.invoke('project-create-folder', { location, name, initGit }),
    getDefaultProjectLocation: () => ipcRenderer.invoke('settings-get-default-location'),

    // App info
    getAppVersion: () => ipcRenderer.invoke('app-get-version'),

    // Roadmap operations
    getRoadmap: (projectId: string) => ipcRenderer.invoke('roadmap-get', { projectId }),
    getRoadmapStatus: (projectId: string) => ipcRenderer.invoke('roadmap-get-status', { projectId }),
    saveRoadmap: (projectId: string, roadmap: any) => ipcRenderer.invoke('roadmap-save', { projectId, roadmap }),
    generateRoadmap: (projectId: string, enableCompetitorAnalysis?: boolean, refreshCompetitorAnalysis?: boolean) => ipcRenderer.send('roadmap-generate', { projectId, enableCompetitorAnalysis, refreshCompetitorAnalysis }),
    refreshRoadmap: (projectId: string, enableCompetitorAnalysis?: boolean, refreshCompetitorAnalysis?: boolean) => ipcRenderer.send('roadmap-refresh', { projectId, enableCompetitorAnalysis, refreshCompetitorAnalysis }),
    stopRoadmap: (projectId: string) => ipcRenderer.invoke('roadmap-stop', { projectId }),
    updateFeatureStatus: (projectId: string, featureId: string, status: any) => ipcRenderer.invoke('roadmap-update-feature', { projectId, featureId, status }),
    convertFeatureToSpec: (projectId: string, featureId: string) => ipcRenderer.invoke('roadmap-convert-feature', { projectId, featureId }),

    // Roadmap event listeners
    onRoadmapProgress: (callback: any) => {
        const sub = (_: any, projectId: string, status: any) => callback(projectId, status);
        ipcRenderer.on('roadmap-progress', sub);
        return () => ipcRenderer.removeListener('roadmap-progress', sub);
    },
    onRoadmapComplete: (callback: any) => {
        const sub = (_: any, projectId: string, roadmap: any) => callback(projectId, roadmap);
        ipcRenderer.on('roadmap-complete', sub);
        return () => ipcRenderer.removeListener('roadmap-complete', sub);
    },
    onRoadmapError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('roadmap-error', sub);
        return () => ipcRenderer.removeListener('roadmap-error', sub);
    },
    onRoadmapStopped: (callback: any) => {
        const sub = (_: any, projectId: string) => callback(projectId);
        ipcRenderer.on('roadmap-stopped', sub);
        return () => ipcRenderer.removeListener('roadmap-stopped', sub);
    },

    // Context operations
    getProjectContext: (projectId: string) => ipcRenderer.invoke('context-get', { projectId }),
    refreshProjectIndex: (projectId: string) => ipcRenderer.invoke('context-refresh', { projectId }),
    getMemoryStatus: (projectId: string) => ipcRenderer.invoke('memory-get-status', { projectId }),
    searchMemories: (projectId: string, query: string) => ipcRenderer.invoke('memory-search', { projectId, query }),
    getRecentMemories: (projectId: string, limit?: number) => ipcRenderer.invoke('memory-get-recent', { projectId, limit }),

    // Environment configuration
    getProjectEnv: (projectId: string) => ipcRenderer.invoke('env-get', { projectId }),
    updateProjectEnv: (projectId: string, config: any) => ipcRenderer.invoke('env-update', { projectId, config }),
    checkClaudeAuth: (projectId: string) => ipcRenderer.invoke('env-check-auth', { projectId }),
    invokeClaudeSetup: (projectId: string) => ipcRenderer.invoke('env-invoke-setup', { projectId }),

    // Memory Infrastructure
    getMemoryInfrastructureStatus: (dbPath?: string) => ipcRenderer.invoke('infra-get-status', { dbPath }),
    listMemoryDatabases: (dbPath?: string) => ipcRenderer.invoke('infra-list-dbs', { dbPath }),
    testMemoryConnection: (dbPath?: string, database?: string) => ipcRenderer.invoke('infra-test-conn', { dbPath, database }),

    // Graphiti validation
    validateLLMApiKey: (provider: string, apiKey: string) => ipcRenderer.invoke('graphiti-validate-key', { provider, apiKey }),
    testGraphitiConnection: (config: any) => ipcRenderer.invoke('graphiti-test-conn', { config }),

    // Linear integration
    getLinearTeams: (projectId: string) => ipcRenderer.invoke('linear-get-teams', { projectId }),
    getLinearProjects: (projectId: string, teamId: string) => ipcRenderer.invoke('linear-get-projects', { projectId, teamId }),
    getLinearIssues: (projectId: string, teamId?: string, projectId_?: string) => ipcRenderer.invoke('linear-get-issues', { projectId, teamId, projectId_ }),
    importLinearIssues: (projectId: string, issueIds: string[]) => ipcRenderer.invoke('linear-import-issues', { projectId, issueIds }),
    checkLinearConnection: (projectId: string) => ipcRenderer.invoke('linear-check-conn', { projectId }),

    // GitHub integration
    getGitHubRepositories: (projectId: string) => ipcRenderer.invoke('github-get-repos', { projectId }),
    getGitHubIssues: (projectId: string, state?: string) => ipcRenderer.invoke('github-get-issues', { projectId, state }),
    getGitHubIssue: (projectId: string, issueNumber: number) => ipcRenderer.invoke('github-get-issue', { projectId, issueNumber }),
    checkGitHubConnection: (projectId: string) => ipcRenderer.invoke('github-check-conn', { projectId }),
    investigateGitHubIssue: (projectId: string, issueNumber: number, selectedCommentIds?: number[]) => ipcRenderer.send('github-investigate-issue', { projectId, issueNumber, selectedCommentIds }),
    getIssueComments: (projectId: string, issueNumber: number) => ipcRenderer.invoke('github-get-comments', { projectId, issueNumber }),
    importGitHubIssues: (projectId: string, issueNumbers: number[]) => ipcRenderer.invoke('github-import-issues', { projectId, issueNumbers }),
    createGitHubRelease: (projectId: string, version: string, releaseNotes: string, options?: any) => ipcRenderer.invoke('github-create-release', { projectId, version, releaseNotes, options }),

    // GitHub OAuth
    checkGitHubCli: () => ipcRenderer.invoke('github-check-cli'),
    checkGitHubAuth: () => ipcRenderer.invoke('github-check-auth'),
    startGitHubAuth: () => ipcRenderer.invoke('github-start-auth'),
    getGitHubToken: () => ipcRenderer.invoke('github-get-token'),
    getGitHubUser: () => ipcRenderer.invoke('github-get-user'),
    listGitHubUserRepos: () => ipcRenderer.invoke('github-list-user-repos'),
    detectGitHubRepo: (projectPath: string) => ipcRenderer.invoke('github-detect-repo', { projectPath }),
    getGitHubBranches: (repo: string, token: string) => ipcRenderer.invoke('github-get-branches', { repo, token }),
    createGitHubRepo: (repoName: string, options: any) => ipcRenderer.invoke('github-create-repo', { repoName, options }),
    addGitRemote: (projectPath: string, repoFullName: string) => ipcRenderer.invoke('github-add-remote', { projectPath, repoFullName }),
    listGitHubOrgs: () => ipcRenderer.invoke('github-list-orgs'),

    // GitHub event listeners
    onGitHubInvestigationProgress: (callback: any) => {
        const sub = (_: any, projectId: string, status: any) => callback(projectId, status);
        ipcRenderer.on('github-investigation-progress', sub);
        return () => ipcRenderer.removeListener('github-investigation-progress', sub);
    },
    onGitHubInvestigationComplete: (callback: any) => {
        const sub = (_: any, projectId: string, result: any) => callback(projectId, result);
        ipcRenderer.on('github-investigation-complete', sub);
        return () => ipcRenderer.removeListener('github-investigation-complete', sub);
    },
    onGitHubInvestigationError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('github-investigation-error', sub);
        return () => ipcRenderer.removeListener('github-investigation-error', sub);
    },

    // Release operations
    getReleaseableVersions: (projectId: string) => ipcRenderer.invoke('release-get-versions', { projectId }),
    runReleasePreflightCheck: (projectId: string, version: string) => ipcRenderer.invoke('release-preflight-check', { projectId, version }),
    createRelease: (request: any) => ipcRenderer.send('release-create', request),

    // Release event listeners
    onReleaseProgress: (callback: any) => {
        const sub = (_: any, projectId: string, progress: any) => callback(projectId, progress);
        ipcRenderer.on('release-progress', sub);
        return () => ipcRenderer.removeListener('release-progress', sub);
    },
    onReleaseComplete: (callback: any) => {
        const sub = (_: any, projectId: string, result: any) => callback(projectId, result);
        ipcRenderer.on('release-complete', sub);
        return () => ipcRenderer.removeListener('release-complete', sub);
    },
    onReleaseError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('release-error', sub);
        return () => ipcRenderer.removeListener('release-error', sub);
    },

    // Ideation operations
    getIdeation: (projectId: string) => ipcRenderer.invoke('ideation-get', { projectId }),
    generateIdeation: (projectId: string, config: any) => ipcRenderer.send('ideation-generate', { projectId, config }),
    refreshIdeation: (projectId: string, config: any) => ipcRenderer.send('ideation-refresh', { projectId, config }),
    stopIdeation: (projectId: string) => ipcRenderer.invoke('ideation-stop', { projectId }),
    updateIdeaStatus: (projectId: string, ideaId: string, status: any) => ipcRenderer.invoke('ideation-update-status', { projectId, ideaId, status }),
    convertIdeaToTask: (projectId: string, ideaId: string) => ipcRenderer.invoke('ideation-convert-task', { projectId, ideaId }),
    dismissIdea: (projectId: string, ideaId: string) => ipcRenderer.invoke('ideation-dismiss', { projectId, ideaId }),
    dismissAllIdeas: (projectId: string) => ipcRenderer.invoke('ideation-dismiss-all', { projectId }),
    archiveIdea: (projectId: string, ideaId: string) => ipcRenderer.invoke('ideation-archive', { projectId, ideaId }),
    deleteIdea: (projectId: string, ideaId: string) => ipcRenderer.invoke('ideation-delete', { projectId, ideaId }),
    deleteMultipleIdeas: (projectId: string, ideaIds: string[]) => ipcRenderer.invoke('ideation-delete-multiple', { projectId, ideaIds }),

    // Ideation event listeners
    onIdeationProgress: (callback: any) => {
        const sub = (_: any, projectId: string, status: any) => callback(projectId, status);
        ipcRenderer.on('ideation-progress', sub);
        return () => ipcRenderer.removeListener('ideation-progress', sub);
    },
    onIdeationLog: (callback: any) => {
        const sub = (_: any, projectId: string, log: string) => callback(projectId, log);
        ipcRenderer.on('ideation-log', sub);
        return () => ipcRenderer.removeListener('ideation-log', sub);
    },
    onIdeationComplete: (callback: any) => {
        const sub = (_: any, projectId: string, session: any) => callback(projectId, session);
        ipcRenderer.on('ideation-complete', sub);
        return () => ipcRenderer.removeListener('ideation-complete', sub);
    },
    onIdeationError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('ideation-error', sub);
        return () => ipcRenderer.removeListener('ideation-error', sub);
    },
    onIdeationStopped: (callback: any) => {
        const sub = (_: any, projectId: string) => callback(projectId);
        ipcRenderer.on('ideation-stopped', sub);
        return () => ipcRenderer.removeListener('ideation-stopped', sub);
    },
    onIdeationTypeComplete: (callback: any) => {
        const sub = (_: any, projectId: string, type: string, ideas: any[]) => callback(projectId, type, ideas);
        ipcRenderer.on('ideation-type-complete', sub);
        return () => ipcRenderer.removeListener('ideation-type-complete', sub);
    },
    onIdeationTypeFailed: (callback: any) => {
        const sub = (_: any, projectId: string, type: string) => callback(projectId, type);
        ipcRenderer.on('ideation-type-failed', sub);
        return () => ipcRenderer.removeListener('ideation-type-failed', sub);
    },

    // Auto Claude source update
    checkAutoBuildSourceUpdate: () => ipcRenderer.invoke('autobuild-check-update'),
    downloadAutoBuildSourceUpdate: () => ipcRenderer.send('autobuild-download-update'),
    getAutoBuildSourceVersion: () => ipcRenderer.invoke('autobuild-get-version'),
    onAutoBuildSourceUpdateProgress: (callback: any) => {
        const sub = (_: any, progress: any) => callback(progress);
        ipcRenderer.on('autobuild-update-progress', sub);
        return () => ipcRenderer.removeListener('autobuild-update-progress', sub);
    },

    // Electron app update
    checkAppUpdate: () => ipcRenderer.invoke('app-check-update'),
    downloadAppUpdate: () => ipcRenderer.invoke('app-download-update'),
    installAppUpdate: () => ipcRenderer.send('app-install-update'),
    onAppUpdateAvailable: (callback: any) => {
        const sub = (_: any, info: any) => callback(info);
        ipcRenderer.on('app-update-available', sub);
        return () => ipcRenderer.removeListener('app-update-available', sub);
    },
    onAppUpdateDownloaded: (callback: any) => {
        const sub = (_: any, info: any) => callback(info);
        ipcRenderer.on('app-update-downloaded', sub);
        return () => ipcRenderer.removeListener('app-update-downloaded', sub);
    },
    onAppUpdateProgress: (callback: any) => {
        const sub = (_: any, progress: any) => callback(progress);
        ipcRenderer.on('app-update-progress', sub);
        return () => ipcRenderer.removeListener('app-update-progress', sub);
    },

    // Shell operations
    openExternal: (url: string) => ipcRenderer.invoke('shell-open-external', { url }),

    // Auto Claude source environment
    getSourceEnv: () => ipcRenderer.invoke('source-get-env'),
    updateSourceEnv: (config: any) => ipcRenderer.invoke('source-update-env', { config }),
    checkSourceToken: () => ipcRenderer.invoke('source-check-token'),

    // Changelog operations
    getChangelogDoneTasks: (projectId: string, tasks?: any[]) => ipcRenderer.invoke('changelog-get-done-tasks', { projectId, tasks }),
    loadTaskSpecs: (projectId: string, taskIds: string[]) => ipcRenderer.invoke('changelog-load-specs', { projectId, taskIds }),
    generateChangelog: (request: any) => ipcRenderer.send('changelog-generate', request),
    saveChangelog: (request: any) => ipcRenderer.invoke('changelog-save', request),
    readExistingChangelog: (projectId: string) => ipcRenderer.invoke('changelog-read-existing', { projectId }),
    suggestChangelogVersion: (projectId: string, taskIds: string[]) => ipcRenderer.invoke('changelog-suggest-version', { projectId, taskIds }),
    suggestChangelogVersionFromCommits: (projectId: string, commits: any[]) => ipcRenderer.invoke('changelog-suggest-version-commits', { projectId, commits }),

    // Changelog git operations
    getChangelogBranches: (projectId: string) => ipcRenderer.invoke('changelog-get-branches', { projectId }),
    getChangelogTags: (projectId: string) => ipcRenderer.invoke('changelog-get-tags', { projectId }),
    getChangelogCommitsPreview: (projectId: string, options: any, mode: any) => ipcRenderer.invoke('changelog-get-commits', { projectId, options, mode }),
    saveChangelogImage: (projectId: string, imageData: string, filename: string) => ipcRenderer.invoke('changelog-save-image', { projectId, imageData, filename }),
    readLocalImage: (projectPath: string, relativePath: string) => ipcRenderer.invoke('changelog-read-local-image', { projectPath, relativePath }),

    // Changelog event listeners
    onChangelogGenerationProgress: (callback: any) => {
        const sub = (_: any, projectId: string, progress: any) => callback(projectId, progress);
        ipcRenderer.on('changelog-progress', sub);
        return () => ipcRenderer.removeListener('changelog-progress', sub);
    },
    onChangelogGenerationComplete: (callback: any) => {
        const sub = (_: any, projectId: string, result: any) => callback(projectId, result);
        ipcRenderer.on('changelog-complete', sub);
        return () => ipcRenderer.removeListener('changelog-complete', sub);
    },
    onChangelogGenerationError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('changelog-error', sub);
        return () => ipcRenderer.removeListener('changelog-error', sub);
    },

    // Insights operations
    getInsightsSession: (projectId: string) => ipcRenderer.invoke('insights-get-session', { projectId }),
    sendInsightsMessage: (projectId: string, message: string, modelConfig?: any) => ipcRenderer.send('insights-send-message', { projectId, message, modelConfig }),
    clearInsightsSession: (projectId: string) => ipcRenderer.invoke('insights-clear-session', { projectId }),
    createTaskFromInsights: (projectId: string, title: string, description: string, metadata?: any) => ipcRenderer.invoke('insights-create-task', { projectId, title, description, metadata }),
    listInsightsSessions: (projectId: string) => ipcRenderer.invoke('insights-list-sessions', { projectId }),
    newInsightsSession: (projectId: string) => ipcRenderer.invoke('insights-new-session', { projectId }),
    switchInsightsSession: (projectId: string, sessionId: string) => ipcRenderer.invoke('insights-switch-session', { projectId, sessionId }),
    deleteInsightsSession: (projectId: string, sessionId: string) => ipcRenderer.invoke('insights-delete-session', { projectId, sessionId }),
    renameInsightsSession: (projectId: string, sessionId: string, newTitle: string) => ipcRenderer.invoke('insights-rename-session', { projectId, sessionId, newTitle }),
    updateInsightsModelConfig: (projectId: string, sessionId: string, modelConfig: any) => ipcRenderer.invoke('insights-update-config', { projectId, sessionId, modelConfig }),

    // Insights event listeners
    onInsightsStreamChunk: (callback: any) => {
        const sub = (_: any, projectId: string, chunk: any) => callback(projectId, chunk);
        ipcRenderer.on('insights-stream-chunk', sub);
        return () => ipcRenderer.removeListener('insights-stream-chunk', sub);
    },
    onInsightsStatus: (callback: any) => {
        const sub = (_: any, projectId: string, status: any) => callback(projectId, status);
        ipcRenderer.on('insights-status', sub);
        return () => ipcRenderer.removeListener('insights-status', sub);
    },
    onInsightsError: (callback: any) => {
        const sub = (_: any, projectId: string, error: string) => callback(projectId, error);
        ipcRenderer.on('insights-error', sub);
        return () => ipcRenderer.removeListener('insights-error', sub);
    },

    // Task logs operations
    getTaskLogs: (projectId: string, specId: string) => ipcRenderer.invoke('task-get-logs', { projectId, specId }),
    watchTaskLogs: (projectId: string, specId: string) => ipcRenderer.invoke('task-watch-logs', { projectId, specId }),
    unwatchTaskLogs: (specId: string) => ipcRenderer.invoke('task-unwatch-logs', { specId }),

    // Task logs event listeners
    onTaskLogsChanged: (callback: any) => {
        const sub = (_: any, specId: string, logs: any) => callback(specId, logs);
        ipcRenderer.on('task-logs-changed', sub);
        return () => ipcRenderer.removeListener('task-logs-changed', sub);
    },
    onTaskLogsStream: (callback: any) => {
        const sub = (_: any, specId: string, chunk: any) => callback(specId, chunk);
        ipcRenderer.on('task-logs-stream', sub);
        return () => ipcRenderer.removeListener('task-logs-stream', sub);
    },

    // File explorer
    listDirectory: (dirPath: string) => ipcRenderer.invoke('file-list-directory', { dirPath }),

    // Git operations
    getGitBranches: (projectPath: string) => ipcRenderer.invoke('git-get-branches', { projectPath }),
    getCurrentGitBranch: (projectPath: string) => ipcRenderer.invoke('git-get-current-branch', { projectPath }),
    detectMainBranch: (projectPath: string) => ipcRenderer.invoke('git-detect-main-branch', { projectPath }),
    checkGitStatus: (projectPath: string) => ipcRenderer.invoke('git-check-status', { projectPath }),
    initializeGit: (projectPath: string) => ipcRenderer.invoke('git-initialize', { projectPath }),

    // Ollama operations
    checkOllamaStatus: (baseUrl?: string) => ipcRenderer.invoke('ollama-check-status', { baseUrl }),
    listOllamaModels: (baseUrl?: string) => ipcRenderer.invoke('ollama-list-models', { baseUrl }),
    listOllamaEmbeddingModels: (baseUrl?: string) => ipcRenderer.invoke('ollama-list-embedding-models', { baseUrl }),
    pullOllamaModel: (modelName: string, baseUrl?: string) => ipcRenderer.invoke('ollama-pull-model', { modelName, baseUrl }),

    // Legacy/Basic
    askInsights: (query: string) => ipcRenderer.invoke('insights-ask', { query }),
    getKnowledgeMap: () => ipcRenderer.invoke('knowledge-get'),
    saveApiKey: (provider: string, key: string) => ipcRenderer.invoke('settings-save-key', { provider, key }),
    getApiKey: (provider: string) => ipcRenderer.invoke('settings-get-key', { provider }),
    deleteApiKey: (provider: string) => ipcRenderer.invoke('settings-delete-key', { provider }),
    getEnabledProviders: () => ipcRenderer.invoke('settings-get-providers'),
    hasApiKey: (provider: string) => ipcRenderer.invoke('settings-has-key', { provider }),
    checkCliInstalled: (cli: string) => ipcRenderer.invoke('cli-check-installed', { cli }),
    installCli: (installCommand: string) => ipcRenderer.invoke('cli-install', { installCommand }),
    isOnboardingComplete: () => ipcRenderer.invoke('settings-onboarding-complete'),
    setOnboardingComplete: (complete: boolean) => ipcRenderer.invoke('settings-set-onboarding', { complete }),
    setProjectPath: (projectPath: string) => ipcRenderer.invoke('settings-set-project', { projectPath }),
    getIntegrationConfig: () => ipcRenderer.invoke('settings-get-integrations'),
    exportEnvFile: (targetPath: string) => ipcRenderer.invoke('settings-export-env', { targetPath }),
    spawnTerminal: (id: string, shell: string, args: string[], cwd: string, env?: Record<string, string>) =>
        ipcRenderer.send('terminal-spawn', { id, shell, args, cwd, env }),
    writeTerminal: (id: string, data: string) => ipcRenderer.send('terminal-write', { id, data }),
    killTerminal: (id: string) => ipcRenderer.send('terminal-kill', { id }),
    onTerminalData: (id: string, callback: (data: string) => void) => {
        const channel = `terminal-data-${id}`;
        const subscription = (_: any, data: string) => callback(data);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    },
});
