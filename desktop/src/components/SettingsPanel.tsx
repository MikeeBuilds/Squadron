import { useState, useEffect } from 'react'
import { X, Key, Check, AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROVIDERS } from '@/lib/providers'

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

    const api = (window as any).electronAPI

    // Load existing key status on mount
    useEffect(() => {
        if (!isOpen) return

        const loadKeyStatus = async () => {
            const status: Record<string, boolean> = {}
            for (const providerId of Object.keys(PROVIDERS)) {
                if (providerId === 'shell') continue
                try {
                    status[providerId] = await api.hasApiKey(providerId)
                } catch {
                    status[providerId] = false
                }
            }
            setHasKeys(status)
        }
        loadKeyStatus()
    }, [isOpen])

    const handleSaveKey = async (providerId: string) => {
        const key = apiKeys[providerId]
        if (!key?.trim()) return

        setSaving(providerId)
        try {
            await api.saveApiKey(providerId, key.trim())
            setHasKeys(prev => ({ ...prev, [providerId]: true }))
            setApiKeys(prev => ({ ...prev, [providerId]: '' }))
            setSaved(providerId)
            setTimeout(() => setSaved(null), 2000)
        } catch (err) {
            console.error(`Failed to save API key for ${providerId}:`, err)
        } finally {
            setSaving(null)
        }
    }

    const handleDeleteKey = async (providerId: string) => {
        try {
            await api.deleteApiKey(providerId)
            setHasKeys(prev => ({ ...prev, [providerId]: false }))
        } catch (err) {
            console.error(`Failed to delete API key for ${providerId}:`, err)
        }
    }

    if (!isOpen) return null

    const providerList = Object.values(PROVIDERS).filter(p => p.id !== 'shell')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Key className="text-yellow-400" size={18} />
                        API Configuration
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
                    <p className="text-sm text-zinc-500">
                        Configure API keys for AI providers. Keys are encrypted and stored securely on your device.
                    </p>

                    {providerList.map(provider => (
                        <div key={provider.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className={cn("text-sm font-bold", provider.color)}>
                                    {provider.name}
                                </label>
                                {hasKeys[provider.id] && (
                                    <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                        <Check size={12} />
                                        Configured
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type={showKey[provider.id] ? 'text' : 'password'}
                                        placeholder={hasKeys[provider.id] ? '••••••••••••••••' : `Enter ${provider.name} API Key`}
                                        value={apiKeys[provider.id] || ''}
                                        onChange={(e) => setApiKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50 transition-colors pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                    >
                                        {showKey[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleSaveKey(provider.id)}
                                    disabled={!apiKeys[provider.id]?.trim() || saving === provider.id}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                                        saved === provider.id
                                            ? "bg-green-500 text-black"
                                            : "bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-black"
                                    )}
                                >
                                    {saving === provider.id ? '...' : saved === provider.id ? <Check size={16} /> : 'Save'}
                                </button>

                                {hasKeys[provider.id] && (
                                    <button
                                        onClick={() => handleDeleteKey(provider.id)}
                                        className="px-3 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                                        title="Delete API key"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <p className="text-[10px] text-zinc-600">
                                Environment variable: <code className="bg-zinc-800 px-1 py-0.5 rounded">{provider.envKey}</code>
                            </p>
                        </div>
                    ))}

                    {/* Security notice */}
                    <div className="flex items-start gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                        <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-zinc-500">
                            <strong className="text-zinc-400">Security:</strong> API keys are encrypted using your operating system's secure storage (Windows DPAPI / macOS Keychain) and never leave your device.
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
