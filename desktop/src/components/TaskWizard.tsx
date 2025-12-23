import { useState, useEffect, useCallback, useRef, type ClipboardEvent } from 'react'
import { X, Zap, RotateCcw, Image as ImageIcon, Sparkles, Cpu, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Agent, getAgents, createTask } from '@/lib/api'

const DRAFT_KEY = 'squadron_task_draft'

interface TaskDraft {
    taskName: string
    priority: number
    assignedTo?: string
    model: string
    images: ImageAttachment[]
    savedAt: Date
}

interface ImageAttachment {
    id: string
    filename: string
    data: string // base64
    thumbnail: string
}

const MODEL_OPTIONS = [
    { id: 'auto', label: 'Auto', icon: Sparkles, desc: 'Best model for the task' },
    { id: 'gpt-4o', label: 'GPT-4o', icon: Cpu, desc: 'OpenAI - Balanced' },
    { id: 'claude-sonnet', label: 'Claude Sonnet', icon: Rocket, desc: 'Anthropic - Fast' },
    { id: 'gemini-pro', label: 'Gemini Pro', icon: Sparkles, desc: 'Google - Smart' },
]

function saveDraft(draft: TaskDraft) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

function loadDraft(): TaskDraft | null {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
}

function isDraftEmpty(draft: TaskDraft | null): boolean {
    if (!draft) return true
    return !draft.taskName.trim()
}

interface TaskWizardProps {
    isOpen: boolean
    onClose: () => void
    onTaskCreated: () => void
}

export function TaskWizard({ isOpen, onClose, onTaskCreated }: TaskWizardProps) {
    const [step, setStep] = useState(1)
    const [taskName, setTaskName] = useState('')
    const [priority, setPriority] = useState(3)
    const [assignedTo, setAssignedTo] = useState<string | undefined>()
    const [agents, setAgents] = useState<Agent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDraftRestored, setIsDraftRestored] = useState(false)
    const [selectedModel, setSelectedModel] = useState('auto')
    const [images, setImages] = useState<ImageAttachment[]>([])
    const [pasteSuccess, setPasteSuccess] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Load draft or reset when opening
    useEffect(() => {
        if (isOpen) {
            getAgents().then(setAgents).catch(console.error)

            const draft = loadDraft()
            if (draft && !isDraftEmpty(draft)) {
                setTaskName(draft.taskName)
                setPriority(draft.priority)
                setAssignedTo(draft.assignedTo)
                setSelectedModel(draft.model || 'auto')
                setImages(draft.images || [])
                setIsDraftRestored(true)
            } else {
                setStep(1)
                setTaskName('')
                setPriority(3)
                setAssignedTo(undefined)
                setSelectedModel('auto')
                setImages([])
                setIsDraftRestored(false)
            }
        }
    }, [isOpen])

    // Get current draft state
    const getCurrentDraft = useCallback((): TaskDraft => ({
        taskName,
        priority,
        assignedTo,
        model: selectedModel,
        images,
        savedAt: new Date()
    }), [taskName, priority, assignedTo, selectedModel, images])

    // Handle close - save draft if content exists
    const handleClose = useCallback(() => {
        const draft = getCurrentDraft()
        if (!isDraftEmpty(draft)) {
            saveDraft(draft)
        } else {
            clearDraft()
        }
        onClose()
    }, [getCurrentDraft, onClose])

    // Discard draft and start fresh
    const handleDiscardDraft = () => {
        clearDraft()
        setStep(1)
        setTaskName('')
        setPriority(3)
        setAssignedTo(undefined)
        setSelectedModel('auto')
        setImages([])
        setIsDraftRestored(false)
    }

    // Handle image paste
    const handlePaste = useCallback(async (e: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.type.startsWith('image/')) {
                e.preventDefault()
                const file = item.getAsFile()
                if (!file) continue

                const reader = new FileReader()
                reader.onload = (ev) => {
                    const data = ev.target?.result as string
                    const newImage: ImageAttachment = {
                        id: crypto.randomUUID(),
                        filename: `screenshot-${Date.now()}.png`,
                        data: data.split(',')[1],
                        thumbnail: data
                    }
                    setImages(prev => [...prev, newImage])
                    setPasteSuccess(true)
                    setTimeout(() => setPasteSuccess(false), 2000)
                }
                reader.readAsDataURL(file)
                break
            }
        }
    }, [])

    // Remove image
    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id))
    }

    if (!isOpen) return null

    const handleCreate = async () => {
        setIsLoading(true)
        try {
            await createTask(taskName, priority, assignedTo)
            clearDraft() // Clear draft on successful creation
            onTaskCreated()
            onClose()
        } catch (err) {
            console.error('Failed to create task:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Zap className="text-cyan-400" size={18} />
                            New Mission
                        </h2>
                        {isDraftRestored && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-teal-500/20 text-teal-400 px-2 py-1 rounded-md">Draft restored</span>
                                <button
                                    onClick={handleDiscardDraft}
                                    className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <RotateCcw size={12} />
                                    Fresh
                                </button>
                            </div>
                        )}
                    </div>
                    <button onClick={handleClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={cn("h-1 flex-1 rounded-full bg-zinc-800 transition-colors", step >= s && "bg-cyan-400")} />
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <label className="block space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">What needs to be done?</span>
                                    {pasteSuccess && (
                                        <span className="text-xs text-teal-400 flex items-center gap-1 animate-in fade-in">
                                            <ImageIcon size={12} /> Image added!
                                        </span>
                                    )}
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    autoFocus
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none h-32"
                                    placeholder="Paste screenshots with Ctrl+V. Type @filename to reference files..."
                                    value={taskName}
                                    onChange={e => setTaskName(e.target.value)}
                                    onPaste={handlePaste}
                                />
                            </label>

                            {/* Image Thumbnails */}
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {images.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img
                                                src={img.thumbnail}
                                                alt={img.filename}
                                                className="w-16 h-16 object-cover rounded-lg border border-zinc-700"
                                            />
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Assign to Specialist (Optional)</span>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => setAssignedTo(undefined)}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                        !assignedTo ? "bg-cyan-400/5 border-cyan-400/50 text-cyan-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Zap size={14} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">Auto-Route</div>
                                        <div className="text-[10px] opacity-60">Overseer decides the best agent</div>
                                    </div>
                                </button>
                                {agents.map(agent => (
                                    <button
                                        key={agent.name}
                                        onClick={() => setAssignedTo(agent.name)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                            assignedTo === agent.name ? "bg-cyan-400/5 border-cyan-400/50 text-cyan-400" : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold uppercase">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold">{agent.name}</div>
                                            <div className="text-[10px] opacity-60">{agent.role}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Priority Level</span>
                                <div className="flex justify-between gap-2">
                                    {[1, 2, 3, 4, 5].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border text-sm font-bold transition-all",
                                                priority === p ? "bg-cyan-400 text-black border-cyan-400" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                            )}
                                        >
                                            P{p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Model Selector */}
                            <div className="space-y-2">
                                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">AI Model</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {MODEL_OPTIONS.map(model => {
                                        const Icon = model.icon
                                        return (
                                            <button
                                                key={model.id}
                                                onClick={() => setSelectedModel(model.id)}
                                                className={cn(
                                                    "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                                                    selectedModel === model.id
                                                        ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                                                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                                                )}
                                            >
                                                <Icon size={14} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold truncate">{model.label}</div>
                                                    <div className="text-[9px] opacity-60 truncate">{model.desc}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Review Section */}
                            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-2">
                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Review Mission</div>
                                <div className="text-sm text-zinc-300 italic line-clamp-2">"{taskName || 'No task defined'}"</div>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                        P{priority}
                                    </div>
                                    <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                        {assignedTo || 'Auto-Route'}
                                    </div>
                                    <div className="text-[10px] bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded text-purple-400">
                                        {MODEL_OPTIONS.find(m => m.id === selectedModel)?.label || 'Auto'}
                                    </div>
                                    {images.length > 0 && (
                                        <div className="text-[10px] bg-teal-500/20 border border-teal-500/30 px-1.5 py-0.5 rounded text-teal-400 flex items-center gap-1">
                                            <ImageIcon size={10} /> {images.length}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex gap-3">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex-1 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => step < 3 ? setStep(s => s + 1) : handleCreate()}
                        disabled={step === 1 && !taskName.trim() || isLoading}
                        className="flex-[2] py-2.5 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        {isLoading ? "Creating..." : step === 3 ? "Launch Mission" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    )
}
