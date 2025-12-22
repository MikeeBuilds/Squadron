import { useState, useEffect, useCallback, useRef } from 'react'
import { Terminal as TerminalIcon, X, ChevronDown, Link2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { XTermComponent } from './XTermComponent'
import { getTasks, type Task } from '@/lib/api'
import { PROVIDERS, getProviderById, getDefaultModel, type ProviderConfig } from '@/lib/providers'

declare global {
    interface Window {
        electronAPI: {
            spawnTerminal: (id: string, shell: string, args: string[], cwd: string, env?: Record<string, string>) => void
            writeTerminal: (id: string, data: string) => void
            resizeTerminal: (id: string, cols: number, rows: number) => void
            killTerminal: (id: string) => void
            onTerminalData: (id: string, callback: (data: string) => void) => () => void
            onTerminalExit: (id: string, callback: (code: number) => void) => () => void
            getApiKey: (provider: string) => Promise<string | null>
            hasApiKey: (provider: string) => Promise<boolean>
            getEnabledProviders: () => Promise<string[]>
        }
    }
}

interface TerminalSession {
    id: string
    title: string
    providerId: string
    modelId: string
    linkedTaskId?: string
    isActive: boolean
    needsRespawn: boolean
}

// Pre-spawn 6 terminals on load
const DEFAULT_SESSIONS: TerminalSession[] = [
    { id: 'term-1', title: 'Terminal 1', providerId: 'shell', modelId: 'default', isActive: true, needsRespawn: false },
    { id: 'term-2', title: 'Terminal 2', providerId: 'shell', modelId: 'default', isActive: false, needsRespawn: false },
    { id: 'term-3', title: 'Terminal 3', providerId: 'shell', modelId: 'default', isActive: false, needsRespawn: false },
    { id: 'term-4', title: 'Terminal 4', providerId: 'shell', modelId: 'default', isActive: false, needsRespawn: false },
    { id: 'term-5', title: 'Terminal 5', providerId: 'shell', modelId: 'default', isActive: false, needsRespawn: false },
    { id: 'term-6', title: 'Terminal 6', providerId: 'shell', modelId: 'default', isActive: false, needsRespawn: false },
]

export function TerminalHub() {
    const [sessions, setSessions] = useState<TerminalSession[]>(DEFAULT_SESSIONS)
    const [tasks, setTasks] = useState<Task[]>([])
    const [enabledProviders, setEnabledProviders] = useState<string[]>(['shell'])
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const [openModelDropdown, setOpenModelDropdown] = useState<string | null>(null)
    const [openTaskDropdown, setOpenTaskDropdown] = useState<string | null>(null)
    const respawnTriggersRef = useRef<Record<string, number>>({})

    // Fetch enabled providers on mount and periodically refresh
    useEffect(() => {
        const checkProviders = async () => {
            try {
                const providers = await window.electronAPI.getEnabledProviders()
                setEnabledProviders(['shell', ...providers.filter(p => p !== 'shell')])
            } catch (err) {
                console.error('Failed to get providers:', err)
            }
        }
        checkProviders()
        // Refresh every 2 seconds to pick up new API keys
        const interval = setInterval(checkProviders, 2000)
        return () => clearInterval(interval)
    }, [])

    // Fetch tasks for linking
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await getTasks()
                setTasks(data)
            } catch (err) {
                console.error('Failed to fetch tasks:', err)
            }
        }
        fetchTasks()
        const interval = setInterval(fetchTasks, 10000)
        return () => clearInterval(interval)
    }, [])

    const closeSession = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        window.electronAPI.killTerminal(id)
        setSessions((prev: TerminalSession[]) => prev.filter(s => s.id !== id))
        setOpenDropdown(null)
        setOpenModelDropdown(null)
        setOpenTaskDropdown(null)
    }

    const switchSession = (id: string) => {
        setSessions((prev: TerminalSession[]) => prev.map(s => ({
            ...s,
            isActive: s.id === id
        })))
    }

    // Change provider and trigger respawn
    const setProvider = useCallback(async (sessionId: string, providerId: string) => {
        const provider = getProviderById(providerId)
        if (!provider) return

        // Check if we have the API key for this provider
        if (providerId !== 'shell') {
            const hasKey = await window.electronAPI.hasApiKey(providerId)
            if (!hasKey) {
                console.warn(`No API key configured for ${providerId}`)
                // Could show a toast/notification here
            }
        }

        const modelId = getDefaultModel(providerId)

        // Mark for respawn
        respawnTriggersRef.current[sessionId] = (respawnTriggersRef.current[sessionId] || 0) + 1

        setSessions((prev: TerminalSession[]) => prev.map(s =>
            s.id === sessionId ? { ...s, providerId, modelId, needsRespawn: true } : s
        ))
        setOpenDropdown(null)
    }, [])

    // Change model and trigger respawn
    const setModel = useCallback((sessionId: string, modelId: string) => {
        respawnTriggersRef.current[sessionId] = (respawnTriggersRef.current[sessionId] || 0) + 1

        setSessions((prev: TerminalSession[]) => prev.map(s =>
            s.id === sessionId ? { ...s, modelId, needsRespawn: true } : s
        ))
        setOpenModelDropdown(null)
    }, [])

    // Link task to terminal
    const linkTask = useCallback((sessionId: string, taskId: string | undefined) => {
        setSessions((prev: TerminalSession[]) => prev.map(s =>
            s.id === sessionId ? { ...s, linkedTaskId: taskId } : s
        ))
        setOpenTaskDropdown(null)
    }, [])

    // Inject task context into terminal
    const injectTaskContext = useCallback((sessionId: string, task: Task) => {
        const contextText = `\n# ═══════════════════════════════════════════════════════════════\n# TASK CONTEXT INJECTED\n# ═══════════════════════════════════════════════════════════════\n# Task: ${task.task}\n# Priority: ${task.priority}\n# Status: ${task.status}\n# ═══════════════════════════════════════════════════════════════\n\n`
        window.electronAPI.writeTerminal(sessionId, contextText)
    }, [])

    const getProviderInfo = (providerId: string): ProviderConfig => {
        return getProviderById(providerId) || PROVIDERS.shell
    }

    const getLinkedTask = (taskId?: string) => {
        return tasks.find(t => t.id === taskId)
    }

    // Get respawn trigger for XTermComponent key
    const getRespawnTrigger = (id: string) => respawnTriggersRef.current[id] || 0

    return (
        <div className="flex flex-col h-full bg-[#050506] rounded-lg border border-zinc-900 overflow-hidden shadow-2xl">
            {/* 6-Terminal Grid: 3 columns x 2 rows */}
            <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-px bg-zinc-900 overflow-hidden">
                {sessions.map(s => {
                    const providerInfo = getProviderInfo(s.providerId)
                    const linkedTask = getLinkedTask(s.linkedTaskId)
                    const currentModel = providerInfo.models.find(m => m.id === s.modelId) || providerInfo.models[0]

                    return (
                        <div
                            key={s.id}
                            onClick={() => switchSession(s.id)}
                            className={cn(
                                "flex flex-col min-h-0 bg-[#050506] transition-all cursor-pointer relative",
                                s.isActive && "ring-1 ring-yellow-500/30"
                            )}
                        >
                            {/* Terminal header */}
                            <div className="px-2 py-1 bg-zinc-950/50 border-b border-zinc-900/50 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", s.isActive ? "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" : "bg-zinc-800")} />

                                    {/* Provider Toggle */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setOpenDropdown(openDropdown === s.id ? null : s.id)
                                                setOpenModelDropdown(null)
                                                setOpenTaskDropdown(null)
                                            }}
                                            className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider transition-all border",
                                                providerInfo.color,
                                                "bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                                            )}
                                        >
                                            {providerInfo.name}
                                            <ChevronDown size={8} />
                                        </button>

                                        {openDropdown === s.id && (
                                            <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 min-w-[80px]">
                                                {Object.values(PROVIDERS).filter(p => enabledProviders.includes(p.id) || p.id === 'shell').map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setProvider(s.id, p.id)
                                                        }}
                                                        className={cn(
                                                            "w-full px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider text-left hover:bg-zinc-800 transition-colors",
                                                            p.color,
                                                            s.providerId === p.id && "bg-zinc-800"
                                                        )}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Model Selector */}
                                    {s.providerId !== 'shell' && (
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenModelDropdown(openModelDropdown === s.id ? null : s.id)
                                                    setOpenDropdown(null)
                                                    setOpenTaskDropdown(null)
                                                }}
                                                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all border text-zinc-500 bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                                            >
                                                {currentModel?.name || 'Model'}
                                                <ChevronDown size={8} />
                                            </button>

                                            {openModelDropdown === s.id && (
                                                <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 min-w-[100px]">
                                                    {providerInfo.models.map(m => (
                                                        <button
                                                            key={m.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setModel(s.id, m.id)
                                                            }}
                                                            className={cn(
                                                                "w-full px-2 py-1.5 text-[8px] font-medium text-left hover:bg-zinc-800 transition-colors text-zinc-300",
                                                                s.modelId === m.id && "bg-zinc-800 text-yellow-400"
                                                            )}
                                                        >
                                                            <div>{m.name}</div>
                                                            {m.description && (
                                                                <div className="text-[6px] text-zinc-600">{m.description}</div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Task Link Button */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setOpenTaskDropdown(openTaskDropdown === s.id ? null : s.id)
                                                setOpenDropdown(null)
                                                setOpenModelDropdown(null)
                                            }}
                                            className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all border",
                                                linkedTask
                                                    ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
                                                    : "text-zinc-600 bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700"
                                            )}
                                        >
                                            <Link2 size={8} />
                                            {linkedTask ? 'Linked' : 'Task'}
                                        </button>

                                        {openTaskDropdown === s.id && (
                                            <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 min-w-[160px] max-h-[200px] overflow-auto scrollbar-hide">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        linkTask(s.id, undefined)
                                                    }}
                                                    className={cn(
                                                        "w-full px-2 py-1.5 text-[8px] font-bold uppercase tracking-wider text-left hover:bg-zinc-800 transition-colors text-zinc-500",
                                                        !s.linkedTaskId && "bg-zinc-800"
                                                    )}
                                                >
                                                    No Task
                                                </button>
                                                {tasks.map(t => (
                                                    <button
                                                        key={t.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            linkTask(s.id, t.id)
                                                            // Inject context when linking
                                                            injectTaskContext(s.id, t)
                                                        }}
                                                        className={cn(
                                                            "w-full px-2 py-1.5 text-[8px] font-medium text-left hover:bg-zinc-800 transition-colors text-zinc-300 truncate",
                                                            s.linkedTaskId === t.id && "bg-zinc-800 text-yellow-400"
                                                        )}
                                                    >
                                                        {t.task.slice(0, 30)}{t.task.length > 30 ? '...' : ''}
                                                    </button>
                                                ))}
                                                {tasks.length === 0 && (
                                                    <div className="px-2 py-2 text-[8px] text-zinc-600 italic">
                                                        No tasks available
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Inject Context Button (when task linked) */}
                                    {linkedTask && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                injectTaskContext(s.id, linkedTask)
                                            }}
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider transition-all border text-green-500 bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
                                            title="Inject task context into terminal"
                                        >
                                            <Zap size={8} />
                                            Inject
                                        </button>
                                    )}
                                </div>

                                <X
                                    size={8}
                                    className="text-zinc-800 hover:text-red-500 cursor-pointer transition-colors"
                                    onClick={(e) => closeSession(s.id, e)}
                                />
                            </div>

                            {/* Linked task indicator */}
                            {linkedTask && (
                                <div className="px-2 py-0.5 bg-yellow-500/5 border-b border-yellow-500/10 text-[7px] text-yellow-500/70 font-medium truncate">
                                    📋 {linkedTask.task.slice(0, 50)}{linkedTask.task.length > 50 ? '...' : ''}
                                </div>
                            )}

                            {/* Terminal content */}
                            <div className="flex-1 min-h-0 bg-transparent">
                                <XTermComponent
                                    key={`${s.id}-${getRespawnTrigger(s.id)}`}
                                    id={s.id}
                                    isActive={s.isActive}
                                    providerId={s.providerId}
                                    modelId={s.modelId}
                                />
                            </div>
                        </div>
                    )
                })}

                {/* Empty state */}
                {sessions.length === 0 && (
                    <div className="col-span-3 row-span-2 h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                        <TerminalIcon size={64} />
                        <span className="text-sm font-bold uppercase tracking-[0.3em] font-mono">NO TERMINALS</span>
                    </div>
                )}
            </div>
        </div>
    )
}
