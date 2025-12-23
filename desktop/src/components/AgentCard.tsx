import { Terminal, BrainCircuit, Activity, Cpu } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Agent } from '@/lib/api'

interface AgentCardProps {
    agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
    const isThinking = agent.status === 'active' && !agent.current_tool
    // const isExecuting = !!agent.current_tool // Reserved for future visual effects


    return (
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all group overflow-hidden relative">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        agent.status === 'active' ? "bg-cyan-400 text-black shadow-lg shadow-cyan-400/20" : "bg-zinc-900 text-zinc-500"
                    )}>
                        {agent.name === 'Marcus' && <Cpu size={20} />}
                        {agent.name === 'Caleb' && <Terminal size={20} />}
                        {agent.name === 'Sentinel' && <BrainCircuit size={20} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-100">{agent.name}</h3>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{agent.role}</p>
                    </div>
                </div>

                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    agent.status === 'active' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", agent.status === 'active' ? "bg-green-500 animate-pulse" : "bg-zinc-700")} />
                    {agent.status}
                </div>
            </div>

            <div className="space-y-3">
                {/* Thought / Status Area */}
                <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/50 min-h-[64px] flex flex-col justify-center">
                    {agent.status === 'active' ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400/70 uppercase tracking-widest">
                                <Activity size={10} className="animate-spin-slow" style={{ animationDuration: '3s' }} />
                                <span>{isThinking ? 'Thinking' : 'Executing'}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed italic line-clamp-2">
                                "{agent.current_thought || 'Processing task...'}"
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center opacity-30 gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Idle Standby</span>
                        </div>
                    )}
                </div>

                {/* Current Tool Indicator */}
                {agent.current_tool && (
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                        <Cpu size={12} className="text-blue-400" />
                        <span className="text-[10px] font-mono text-zinc-200">tool:</span>
                        <span className="text-[10px] font-mono text-blue-400 font-bold">{agent.current_tool}()</span>
                    </div>
                )}
            </div>

            {/* Decorative background pulse */}
            {agent.status === 'active' && (
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-400/5 blur-3xl rounded-full" />
            )}
        </div>
    )
}
