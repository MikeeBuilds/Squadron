import { useState } from 'react'
import { Rocket, Key, FolderOpen, ChevronRight, ChevronLeft, Check, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
    onComplete: () => void
}

const AI_PROVIDERS = [
    { id: 'anthropic', name: 'Claude', description: 'Anthropic Claude 4 Sonnet/Opus', color: 'from-orange-600 to-orange-400', envKey: 'ANTHROPIC_API_KEY' },
    { id: 'google', name: 'Gemini', description: 'Google Gemini 2.5 Pro/Flash', color: 'from-blue-600 to-blue-400', envKey: 'GOOGLE_API_KEY' },
    { id: 'openai', name: 'Codex', description: 'OpenAI GPT-4o / o1 / o3', color: 'from-green-600 to-green-400', envKey: 'OPENAI_API_KEY' },
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1)
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
    const [apiKey, setApiKey] = useState('')
    const [saving, setSaving] = useState(false)
    const [projectPath, setProjectPath] = useState<string | null>(null)

    const api = (window as any).electronAPI

    const totalSteps = 3

    const handleNext = async () => {
        if (step === 2 && apiKey && selectedProvider) {
            setSaving(true)
            await api.saveApiKey(selectedProvider, apiKey)
            setSaving(false)
        }

        if (step === 3 && projectPath) {
            await api.setProjectPath(projectPath)
            await api.exportEnvFile(projectPath)
        }

        if (step < totalSteps) {
            setStep(step + 1)
        } else {
            await api.setOnboardingComplete(true)
            onComplete()
        }
    }

    const handleSkip = async () => {
        await api.setOnboardingComplete(true)
        onComplete()
    }

    const handleSelectFolder = async () => {
        const folder = await api.selectFolder()
        if (folder) {
            setProjectPath(folder)
        }
    }

    const canProceed = () => {
        if (step === 1) return !!selectedProvider
        if (step === 2) return !!apiKey.trim()
        return true // Step 3 is optional
    }

    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 mb-4">
                        <Rocket className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome to Squadron</h1>
                    <p className="text-sm text-zinc-500 mt-1">Let's get you set up in under a minute</p>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2 mb-8 max-w-xs mx-auto">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={cn(
                                "flex-1 h-1.5 rounded-full transition-all",
                                i <= step ? "bg-cyan-400" : "bg-zinc-800"
                            )}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-6">
                        {/* Step 1: Choose Provider */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                                    <Key size={16} className="text-cyan-400" />
                                    Step 1: Choose Your AI Provider
                                </div>

                                <div className="space-y-2">
                                    {AI_PROVIDERS.map(provider => (
                                        <button
                                            key={provider.id}
                                            onClick={() => setSelectedProvider(provider.id)}
                                            className={cn(
                                                "w-full p-4 rounded-xl border-2 text-left transition-all",
                                                selectedProvider === provider.id
                                                    ? "border-cyan-400 bg-cyan-400/5"
                                                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold", provider.color)}>
                                                    {provider.name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white">{provider.name}</div>
                                                    <div className="text-xs text-zinc-500">{provider.description}</div>
                                                </div>
                                                {selectedProvider === provider.id && (
                                                    <Check className="ml-auto text-cyan-400" size={20} />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Enter API Key */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                                    <Key size={16} className="text-cyan-400" />
                                    Step 2: Enter Your API Key
                                </div>

                                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                                        {AI_PROVIDERS.find(p => p.id === selectedProvider)?.name} API Key
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter your API key..."
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-transparent border-0 text-white text-lg focus:outline-none placeholder:text-zinc-600"
                                        autoFocus
                                    />
                                </div>

                                <p className="text-[11px] text-zinc-500">
                                    Your key is encrypted and stored securely on your device. It never leaves your machine.
                                </p>
                            </div>
                        )}

                        {/* Step 3: Project Folder (Optional) */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-zinc-400">
                                    <FolderOpen size={16} className="text-cyan-400" />
                                    Step 3: Select Project Folder <span className="text-xs font-normal">(Optional)</span>
                                </div>

                                <p className="text-sm text-zinc-500">
                                    Choose a project folder to export your settings as a .env file for the Python backend.
                                </p>

                                <div className="flex gap-2">
                                    <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-400 truncate">
                                        {projectPath || 'No folder selected'}
                                    </div>
                                    <button
                                        onClick={handleSelectFolder}
                                        className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm transition-colors"
                                    >
                                        Browse
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex justify-between">
                        <button
                            onClick={handleSkip}
                            className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <SkipForward size={14} />
                            Skip Setup
                        </button>

                        <div className="flex gap-2">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm flex items-center gap-1 transition-colors"
                                >
                                    <ChevronLeft size={14} />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || saving}
                                className="px-6 py-2 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl font-bold text-sm flex items-center gap-1 transition-colors"
                            >
                                {saving ? 'Saving...' : step === totalSteps ? 'Finish' : 'Continue'}
                                {!saving && <ChevronRight size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="text-center mt-4 text-xs text-zinc-600">
                    Step {step} of {totalSteps}
                </div>
            </div>
        </div>
    )
}
