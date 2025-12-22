import { useState, useEffect } from 'react'
import { X, Key, Check, AlertCircle, Eye, EyeOff, Trash2, Folder, FolderOpen, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

// Integration configuration matching settings-store.ts
const INTEGRATIONS = {
    ai: {
        label: 'AI Providers',
        icon: '🤖',
        items: [
            { id: 'anthropic', label: 'Claude (Anthropic)', envKey: 'ANTHROPIC_API_KEY', color: 'text-orange-400' },
            { id: 'google', label: 'Gemini (Google)', envKey: 'GOOGLE_API_KEY', color: 'text-blue-400' },
            { id: 'openai', label: 'OpenAI (Codex)', envKey: 'OPENAI_API_KEY', color: 'text-green-400' },
        ]
    },
    communication: {
        label: 'Communication',
        icon: '💬',
        items: [
            { id: 'slack_token', label: 'Slack Bot Token', envKey: 'SLACK_BOT_TOKEN', color: 'text-purple-400', placeholder: 'xoxb-...' },
            { id: 'discord_webhook', label: 'Discord Webhook', envKey: 'DISCORD_WEBHOOK_URL', color: 'text-indigo-400', placeholder: 'https://discord.com/api/webhooks/...' },
            { id: 'discord_token', label: 'Discord Bot Token', envKey: 'DISCORD_BOT_TOKEN', color: 'text-indigo-400' },
        ]
    },
    project: {
        label: 'Project Management',
        icon: '📋',
        items: [
            { id: 'jira_server', label: 'Jira Server URL', envKey: 'JIRA_SERVER', color: 'text-blue-500', placeholder: 'https://your-domain.atlassian.net' },
            { id: 'jira_email', label: 'Jira Email', envKey: 'JIRA_EMAIL', color: 'text-blue-500', placeholder: 'your-email@example.com' },
            { id: 'jira_token', label: 'Jira API Token', envKey: 'JIRA_TOKEN', color: 'text-blue-500' },
            { id: 'linear', label: 'Linear API Key', envKey: 'LINEAR_API_KEY', color: 'text-violet-400', placeholder: 'lin_api_...' },
        ]
    },
    development: {
        label: 'Development',
        icon: '🔧',
        items: [
            { id: 'github', label: 'GitHub Token', envKey: 'GITHUB_TOKEN', color: 'text-gray-300', placeholder: 'ghp_...' },
        ]
    }
}

interface SettingsPanelProps {
    isOpen: boolean
    onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
    const [hasKeys, setHasKeys] = useState<Record<string, boolean>>({})
    const [showKey, setShowKey] = useState<Record<string, boolean>>({})
    const [saving, setSaving] = useState<string | null>(null)
    const [saved, setSaved] = useState<string | null>(null)
    const [projectPath, setProjectPath] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState('ai')

    const api = (window as any).electronAPI

    // Load existing key status on mount
    useEffect(() => {
        if (!isOpen) return

        const loadKeyStatus = async () => {
            const settings = await api.getSettings()
            setHasKeys(settings.hasKeys || {})
            setProjectPath(settings.projectPath)
        }
        loadKeyStatus()
    }, [isOpen])

    const handleSaveKey = async (integrationId: string) => {
        const key = apiKeys[integrationId]
        if (!key?.trim()) return

        setSaving(integrationId)
        try {
            await api.saveApiKey(integrationId, key.trim())
            setHasKeys(prev => ({ ...prev, [integrationId]: true }))
            setApiKeys(prev => ({ ...prev, [integrationId]: '' }))
            setSaved(integrationId)
            setTimeout(() => setSaved(null), 2000)
        } catch (err) {
            console.error(`Failed to save key for ${integrationId}:`, err)
        } finally {
            setSaving(null)
        }
    }

    const handleDeleteKey = async (integrationId: string) => {
        try {
            await api.deleteApiKey(integrationId)
            setHasKeys(prev => ({ ...prev, [integrationId]: false }))
        } catch (err) {
            console.error(`Failed to delete key for ${integrationId}:`, err)
        }
    }

    const handleSelectFolder = async () => {
        const folder = await api.selectFolder()
        if (folder) {
            await api.setProjectPath(folder)
            setProjectPath(folder)
        }
    }

    const handleExportEnv = async () => {
        if (!projectPath) return
        const success = await api.exportEnvFile(projectPath)
        if (success) {
            setSaved('env-export')
            setTimeout(() => setSaved(null), 2000)
        }
    }

    if (!isOpen) return null

    const sections = Object.entries(INTEGRATIONS)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Key className="text-yellow-400" size={18} />
                        Settings & Integrations
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-zinc-800 p-2 bg-zinc-950/50">
                        {sections.map(([key, section]) => (
                            <button
                                key={key}
                                onClick={() => setActiveSection(key)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                    activeSection === key
                                        ? "bg-yellow-400/10 text-yellow-400"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                )}
                            >
                                <span>{section.icon}</span>
                                {section.label}
                            </button>
                        ))}
                        <div className="border-t border-zinc-800 my-2"></div>
                        <button
                            onClick={() => setActiveSection('project-folder')}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                activeSection === 'project-folder'
                                    ? "bg-yellow-400/10 text-yellow-400"
                                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            )}
                        >
                            <FolderOpen size={14} />
                            Project
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 max-h-[60vh] overflow-auto">
                        {activeSection === 'project-folder' ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-300">Project Folder</h3>
                                <p className="text-xs text-zinc-500">
                                    Select your Squadron project folder. Integration keys will be exported to a .env file here.
                                </p>

                                <div className="flex gap-2">
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-400 truncate">
                                        {projectPath || 'No project folder selected'}
                                    </div>
                                    <button
                                        onClick={handleSelectFolder}
                                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                                    >
                                        <Folder size={14} />
                                        Browse
                                    </button>
                                </div>

                                {projectPath && (
                                    <button
                                        onClick={handleExportEnv}
                                        className={cn(
                                            "w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                            saved === 'env-export'
                                                ? "bg-green-500 text-black"
                                                : "bg-yellow-400 hover:bg-yellow-500 text-black"
                                        )}
                                    >
                                        {saved === 'env-export' ? (
                                            <>
                                                <Check size={16} />
                                                Exported!
                                            </>
                                        ) : (
                                            <>
                                                <Download size={16} />
                                                Export .env File
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-300">
                                    {INTEGRATIONS[activeSection as keyof typeof INTEGRATIONS]?.label}
                                </h3>

                                {INTEGRATIONS[activeSection as keyof typeof INTEGRATIONS]?.items.map(item => (
                                    <div key={item.id} className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className={cn("text-xs font-bold", item.color)}>
                                                {item.label}
                                            </label>
                                            {hasKeys[item.id] && (
                                                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                                    <Check size={10} />
                                                    Set
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <input
                                                    type={showKey[item.id] ? 'text' : 'password'}
                                                    placeholder={hasKeys[item.id] ? '••••••••••••••••' : ((item as any).placeholder || `Enter ${item.label}`)}
                                                    value={apiKeys[item.id] || ''}
                                                    onChange={(e) => setApiKeys(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors pr-8"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowKey(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                                >
                                                    {showKey[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleSaveKey(item.id)}
                                                disabled={!apiKeys[item.id]?.trim() || saving === item.id}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg font-bold text-xs transition-all",
                                                    saved === item.id
                                                        ? "bg-green-500 text-black"
                                                        : "bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                                                )}
                                            >
                                                {saving === item.id ? '...' : saved === item.id ? <Check size={14} /> : 'Save'}
                                            </button>

                                            {hasKeys[item.id] && (
                                                <button
                                                    onClick={() => handleDeleteKey(item.id)}
                                                    className="px-2 py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-[10px] text-zinc-600">
                                            <code className="bg-zinc-800 px-1 py-0.5 rounded">{item.envKey}</code>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Security notice */}
                        <div className="mt-6 flex items-start gap-2 p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                            <AlertCircle size={14} className="text-yellow-500 shrink-0 mt-0.5" />
                            <div className="text-[10px] text-zinc-500">
                                <strong className="text-zinc-400">Security:</strong> Keys are encrypted using your OS secure storage.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all text-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
