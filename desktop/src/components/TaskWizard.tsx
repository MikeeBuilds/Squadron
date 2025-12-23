import { useState, useEffect, useCallback } from 'react'
import { X, Zap, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Agent, getAgents, createTask } from '@/lib/api'

const DRAFT_KEY = 'squadron_task_draft'

interface TaskDraft {
    taskName: string
    priority: number
    assignedTo?: string
    savedAt: Date
}

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

    // Load draft or reset when opening
    useEffect(() => {
        if (isOpen) {
            getAgents().then(setAgents).catch(console.error)

            const draft = loadDraft()
            if (draft && !isDraftEmpty(draft)) {
                setTaskName(draft.taskName)
                setPriority(draft.priority)
                setAssignedTo(draft.assignedTo)
                setIsDraftRestored(true)
            } else {
                setStep(1)
                setTaskName('')
                setPriority(3)
                setAssignedTo(undefined)
                setIsDraftRestored(false)
            }
        }
    }, [isOpen])

    // Get current draft state
    const getCurrentDraft = useCallback((): TaskDraft => ({
        taskName,
        priority,
        assignedTo,
        savedAt: new Date()
    }), [taskName, priority, assignedTo])

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
        setIsDraftRestored(false)
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
                                <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">What needs to be done?</span>
                                <textarea
                                    autoFocus
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none h-32"
                                    placeholder="e.g. Implement a security audit tool for the SSH skill..."
                                    value={taskName}
                                    onChange={e => setTaskName(e.target.value)}
                                />
                            </label>
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

                            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-2">
                                <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Review Mission</div>
                                <div className="text-sm text-zinc-300 italic">"{taskName || 'No task defined'}"</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                        Priority {priority}
                                    </div>
                                    <div className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                        Assignee: {assignedTo || 'Auto'}
                                    </div>
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
