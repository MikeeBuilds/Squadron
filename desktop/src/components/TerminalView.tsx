import { useState, useEffect, useRef } from 'react'
import { Terminal as TerminalIcon, Shield, Search, Zap, Trash2, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogEntry {
    id: string
    timestamp: string
    agent: string
    message: string
    type: 'info' | 'warn' | 'error' | 'success' | 'cmd'
}

export function TerminalView() {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [filter, setFilter] = useState<string>('')
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const eventSource = new EventSource('http://127.0.0.1:8000/activity')

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Convert activity events to terminal logs
                let logType: LogEntry['type'] = 'info'
                let messageValue = ''

                if (data.type === 'tool_call') {
                    logType = 'cmd'
                    messageValue = `> Executing tool: ${data.data.tool}(${JSON.stringify(data.data.arguments || {})})`
                } else if (data.type === 'tool_result') {
                    logType = 'success'
                    messageValue = `✓ Tool result: ${typeof data.data.result === 'string' ? data.data.result.substring(0, 100) : 'Success'}`
                } else if (data.type === 'agent_thought') {
                    logType = 'info'
                    messageValue = `🧠 Thought: ${data.data.thought}`
                } else if (data.type === 'error') {
                    logType = 'error'
                    messageValue = `!! Error: ${data.data.error}`
                } else {
                    return // Skip other event types for now
                }

                const newEntry: LogEntry = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: data.timestamp,
                    agent: data.agent,
                    message: messageValue,
                    type: logType
                }

                setLogs(prev => [...prev.slice(-199), newEntry])
            } catch (err) {
                console.error('Failed to parse event:', err)
            }
        }

        return () => eventSource.close()
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const filteredLogs = logs.filter(log => {
        const matchesAgent = selectedAgent ? log.agent === selectedAgent : true
        const matchesSearch = log.message.toLowerCase().includes(filter.toLowerCase()) ||
            log.agent.toLowerCase().includes(filter.toLowerCase())
        return matchesAgent && matchesSearch
    })

    const agents = Array.from(new Set(logs.map(l => l.agent)))

    return (
        <div className="flex flex-col h-full bg-[#09090b] rounded-2xl border border-zinc-800/50 overflow-hidden shadow-2xl">
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 px-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    </div>
                    <div className="h-4 w-px bg-zinc-800 mx-2" />
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                        <Cpu size={12} className="text-yellow-400" />
                        Autonomous System Logs
                    </h3>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600" size={12} />
                        <input
                            type="text"
                            placeholder="Filter logs..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg py-1 pl-8 pr-3 text-[10px] text-zinc-300 focus:outline-none focus:border-yellow-500/50 transition-colors w-48"
                        />
                    </div>
                    <button
                        onClick={() => setLogs([])}
                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                        title="Clear Logs"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Agent Filter Tabs */}
            <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-800/30 flex gap-2">
                <button
                    onClick={() => setSelectedAgent(null)}
                    className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all border",
                        !selectedAgent ? "bg-yellow-400/10 text-yellow-500 border-yellow-500/20" : "bg-transparent text-zinc-600 border-transparent hover:text-zinc-400"
                    )}
                >
                    All Agents
                </button>
                {agents.map(agent => (
                    <button
                        key={agent}
                        onClick={() => setSelectedAgent(agent)}
                        className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all border",
                            selectedAgent === agent ? "bg-blue-400/10 text-blue-400 border-blue-400/20" : "bg-transparent text-zinc-600 border-transparent hover:text-zinc-400"
                        )}
                    >
                        {agent}
                    </button>
                ))}
            </div>

            {/* Log Stream */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-[11px] leading-relaxed selection:bg-yellow-500/20 selection:text-yellow-200 custom-scrollbar"
            >
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                        <TerminalIcon size={48} />
                        <span className="text-sm font-bold uppercase tracking-[0.3em]">No Process Logs Found</span>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div key={log.id} className="flex gap-4 group py-0.5 hover:bg-white/[0.02] -mx-4 px-4 transition-colors">
                            <span className="text-zinc-600 shrink-0 w-[70px] tabular-nums">
                                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                            </span>
                            <span className={cn(
                                "shrink-0 w-[80px] font-bold",
                                log.agent === 'Marcus' && "text-blue-400",
                                log.agent === 'Caleb' && "text-yellow-400",
                                log.agent === 'Sentinel' && "text-purple-400"
                            )}>
                                {log.agent.padEnd(8)}
                            </span>
                            <span className={cn(
                                "flex-1 break-words",
                                log.type === 'cmd' && "text-white",
                                log.type === 'success' && "text-green-400",
                                log.type === 'warn' && "text-orange-400",
                                log.type === 'error' && "text-red-400",
                                log.type === 'info' && "text-zinc-400 italic"
                            )}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-2 bg-zinc-900/20 border-t border-zinc-800/50 flex justify-between items-center">
                <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase">
                    <span className="flex items-center gap-1.5">
                        <Shield size={10} className="text-blue-500" /> SSL Secured
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Zap size={10} className="text-yellow-500" /> SSE Live
                    </span>
                </div>
                <div className="text-[9px] font-bold text-zinc-600 uppercase">
                    {filteredLogs.length} Lines Displayed
                </div>
            </div>
        </div>
    )
}
