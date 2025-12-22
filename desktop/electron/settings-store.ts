import { safeStorage } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

const SETTINGS_FILE = 'squadron-settings.json'

interface Settings {
    apiKeys: Record<string, string> // encrypted keys
    enabledProviders: string[]
    defaultProvider: string
    defaultModel: string
}

const getSettingsPath = (): string => {
    return path.join(app.getPath('userData'), SETTINGS_FILE)
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
        defaultModel: 'default'
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
        if (!safeStorage.isEncryptionAvailable()) {
            console.warn('[Settings] Encryption not available, storing in plain text')
            const settings = loadSettings()
            settings.apiKeys[provider] = key
            if (!settings.enabledProviders.includes(provider)) {
                settings.enabledProviders.push(provider)
            }
            saveSettings(settings)
            return true
        }

        const encrypted = safeStorage.encryptString(key).toString('base64')
        const settings = loadSettings()
        settings.apiKeys[provider] = encrypted
        if (!settings.enabledProviders.includes(provider)) {
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

        if (!safeStorage.isEncryptionAvailable()) {
            return stored // plain text fallback
        }

        const buffer = Buffer.from(stored, 'base64')
        return safeStorage.decryptString(buffer)
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
