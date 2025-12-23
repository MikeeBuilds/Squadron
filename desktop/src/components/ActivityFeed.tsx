import { useState, useEffect, useRef } from 'react'
import { Terminal, Lightbulb, Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Event {
    type: 'agent_start' | 'tool_call' | 'tool_result' | 'agent_thought' | 'agent_complete' | 'error'
    agent: string
    timestamp: string
    data: any
}

export function ActivityFeed() {
    const [events, setEvents] = useState<Event[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Connect to SSE endpoint
        const eventSource = new EventSource('http://127.0.0.1:8000/activity')

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                setEvents(prev => [...prev.slice(-49), data]) // Keep last 50 events
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
    }, [events])

    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex justify-between items-center">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Terminal size={12} className="text-cyan-400" />
                    Neural Activity Stream
                </h3>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] text-zinc-600 font-bold uppercase">Live</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
                        <Clock size={24} />
                        <span className="text-xs font-medium">Monitoring events...</span>
                    </div>
                ) : (
                    events.map((event, i) => (
                        <div key={i} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <div className={cn(
                                "mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                                event.type === 'agent_thought' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                                event.type === 'tool_call' && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                                event.type === 'agent_complete' && "bg-green-500/10 text-green-400 border-green-500/20",
                                event.type === 'error' && "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                                {event.type === 'agent_thought' && <Lightbulb size={12} />}
                                {event.type === 'tool_call' && <Zap size={12} />}
                                {event.type === 'agent_complete' && <CheckCircle2 size={12} />}
                                {event.type === 'error' && <AlertCircle size={12} />}
                                {(event.type === 'agent_start' || event.type === 'tool_result') && <Terminal size={12} className="text-zinc-500" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-bold text-zinc-300">{event.agent}</span>
                                    <span className="text-[8px] font-medium text-zinc-600 uppercase tabular-nums">
                                        {new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-400 leading-relaxed break-words">
                                    {event.type === 'agent_thought' && <span className="italic text-zinc-500">thought: </span>}
                                    {event.type === 'tool_call' && <span className="font-mono text-[10px] text-cyan-400/80">executing {event.data.tool}()...</span>}
                                    {event.type === 'tool_result' && <span className="font-mono text-[10px] text-zinc-500">tool result captured.</span>}
                                    {event.data.thought || event.data.task || event.data.summary || event.data.error || (event.type === 'tool_result' ? 'Success' : '')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
