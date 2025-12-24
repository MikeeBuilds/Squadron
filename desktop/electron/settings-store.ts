import * as fs from 'fs'
import * as path from 'path'

// Lazy-load electron APIs to avoid undefined at module load time
const getElectronApp = () => require('electron').app;
const getSafeStorage = () => require('electron').safeStorage;

const SETTINGS_FILE = 'squadron-settings.json'

// All configurable integration keys
export const INTEGRATION_KEYS = {
    // AI Providers
    anthropic: { label: 'Claude (Anthropic)', envKey: 'ANTHROPIC_API_KEY', category: 'ai' },
    google: { label: 'Gemini (Google)', envKey: 'GEMINI_API_KEY', category: 'ai' },
    openai: { label: 'OpenAI (Codex)', envKey: 'OPENAI_API_KEY', category: 'ai' },

    // Communication
    slack_token: { label: 'Slack Bot Token', envKey: 'SLACK_BOT_TOKEN', category: 'communication' },
    discord_webhook: { label: 'Discord Webhook URL', envKey: 'DISCORD_WEBHOOK_URL', category: 'communication' },
    discord_token: { label: 'Discord Bot Token', envKey: 'DISCORD_BOT_TOKEN', category: 'communication' },

    // Project Management
    jira_server: { label: 'Jira Server URL', envKey: 'JIRA_SERVER', category: 'project', placeholder: 'https://your-domain.atlassian.net' },
    jira_email: { label: 'Jira Email', envKey: 'JIRA_EMAIL', category: 'project', placeholder: 'your-email@example.com' },
    jira_token: { label: 'Jira API Token', envKey: 'JIRA_TOKEN', category: 'project' },
    linear: { label: 'Linear API Key', envKey: 'LINEAR_API_KEY', category: 'project' },

    // Development
    github: { label: 'GitHub Token', envKey: 'GITHUB_TOKEN', category: 'development', placeholder: 'ghp_...' },
} as const

export type IntegrationKey = keyof typeof INTEGRATION_KEYS

interface Settings {
    apiKeys: Record<string, string> // encrypted keys
    enabledProviders: string[]
    defaultProvider: string
    defaultModel: string
    onboardingComplete: boolean
    projectPath: string | null
}

const getSettingsPath = (): string => {
    return path.join(getElectronApp().getPath('userData'), SETTINGS_FILE)
}

const loadSettings = (): Settings => {
    try {
        const settingsPath = getSettingsPath()
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf-8')
            return JSON.parse(data)
        }
    } catch (err) {
        console.error('[Settings] Failed to load settings:', err)
    }
    return {
        apiKeys: {},
        enabledProviders: ['shell'],
        defaultProvider: 'shell',
        defaultModel: 'default',
        onboardingComplete: false,
        projectPath: null
    }
}

const saveSettings = (settings: Settings): void => {
    try {
        const settingsPath = getSettingsPath()
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
    } catch (err) {
        console.error('[Settings] Failed to save settings:', err)
    }
}

// API Key Management (encrypted)
export const saveApiKey = (provider: string, key: string): boolean => {
    try {
        if (!getSafeStorage().isEncryptionAvailable()) {
            console.warn('[Settings] Encryption not available, storing in plain text')
            const settings = loadSettings()
            settings.apiKeys[provider] = key
            if (!settings.enabledProviders.includes(provider) && ['anthropic', 'google', 'openai'].includes(provider)) {
                settings.enabledProviders.push(provider)
            }
            saveSettings(settings)
            return true
        }

        const encrypted = getSafeStorage().encryptString(key).toString('base64')
        const settings = loadSettings()
        settings.apiKeys[provider] = encrypted
        if (!settings.enabledProviders.includes(provider) && ['anthropic', 'google', 'openai'].includes(provider)) {
            settings.enabledProviders.push(provider)
        }
        saveSettings(settings)
        return true
    } catch (err) {
        console.error('[Settings] Failed to save API key:', err)
        return false
    }
}

export const getApiKey = (provider: string): string | null => {
    try {
        const settings = loadSettings()
        const stored = settings.apiKeys[provider]
        if (!stored) return null

        if (!getSafeStorage().isEncryptionAvailable()) {
            return stored // plain text fallback
        }

        const buffer = Buffer.from(stored, 'base64')
        return getSafeStorage().decryptString(buffer)
    } catch (err) {
        console.error('[Settings] Failed to get API key:', err)
        return null
    }
}

export const deleteApiKey = (provider: string): boolean => {
    try {
        const settings = loadSettings()
        delete settings.apiKeys[provider]
        settings.enabledProviders = settings.enabledProviders.filter(p => p !== provider)
        saveSettings(settings)
        return true
    } catch (err) {
        console.error('[Settings] Failed to delete API key:', err)
        return false
    }
}

export const getEnabledProviders = (): string[] => {
    const settings = loadSettings()
    return settings.enabledProviders
}

export const hasApiKey = (provider: string): boolean => {
    const settings = loadSettings()
    return !!settings.apiKeys[provider]
}

export const getAllSettings = (): Omit<Settings, 'apiKeys'> & { hasKeys: Record<string, boolean> } => {
    const settings = loadSettings()
    return {
        enabledProviders: settings.enabledProviders,
        defaultProvider: settings.defaultProvider,
        defaultModel: settings.defaultModel,
        onboardingComplete: settings.onboardingComplete,
        projectPath: settings.projectPath,
        hasKeys: Object.fromEntries(
            Object.keys(settings.apiKeys).map(k => [k, true])
        )
    }
}

export const setDefaultProvider = (provider: string, model: string): void => {
    const settings = loadSettings()
    settings.defaultProvider = provider
    settings.defaultModel = model
    saveSettings(settings)
}

export const setOnboardingComplete = (complete: boolean): void => {
    const settings = loadSettings()
    settings.onboardingComplete = complete
    saveSettings(settings)
}

export const setProjectPath = (projectPath: string | null): void => {
    const settings = loadSettings()
    settings.projectPath = projectPath
    saveSettings(settings)
}

export const isOnboardingComplete = (): boolean => {
    const settings = loadSettings()
    return settings.onboardingComplete
}

// Export settings to .env file for Python backend
export const exportToEnvFile = (targetPath: string): boolean => {
    try {
        const settings = loadSettings()
        const envLines: string[] = ['# Generated by Squadron Desktop App', '']

        for (const [key, config] of Object.entries(INTEGRATION_KEYS)) {
            const stored = settings.apiKeys[key]
            if (stored) {
                let value = stored
                // Decrypt if encrypted
                if (getSafeStorage().isEncryptionAvailable()) {
                    try {
                        const buffer = Buffer.from(stored, 'base64')
                        value = getSafeStorage().decryptString(buffer)
                    } catch { /* use as-is */ }
                }
                envLines.push(`${config.envKey}=${value}`)
            }
        }

        const envPath = path.join(targetPath, '.env')
        fs.writeFileSync(envPath, envLines.join('\n'))
        console.log(`[Settings] Exported .env to ${envPath}`)
        return true
    } catch (err) {
        console.error('[Settings] Failed to export .env:', err)
        return false
    }
}

// Get integration config for UI
export const getIntegrationConfig = () => INTEGRATION_KEYS
