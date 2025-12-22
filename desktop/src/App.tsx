import { useState, useEffect } from 'react'
import { LayoutDashboard, Terminal, Activity, Map, Lightbulb, FileClock, Settings, Plus, Github, GitBranch, ChevronLeft, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSystemStatus, getAgents, type SystemStatus, type Agent } from '@/lib/api'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskWizard } from '@/components/TaskWizard'
import { AgentCard } from '@/components/AgentCard'
import { ActivityFeed } from '@/components/ActivityFeed'

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban')
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [kanbanKey, setKanbanKey] = useState(0)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getSystemStatus()
      setSystemStatus(status)

      const latestAgents = await getAgents()
      setAgents(latestAgents)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000) // Poll faster (3s) for agent status
    return () => clearInterval(interval)
  }, [])

  const handleTaskCreated = () => {
    setKanbanKey(prev => prev + 1)
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out relative bg-zinc-950/50 backdrop-blur-xl z-20",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-20 bg-zinc-900 border border-zinc-800 rounded-full p-1 text-zinc-500 hover:text-yellow-400 z-50 transition-all hover:scale-110 active:scale-95 shadow-lg shadow-black/50"
        >
          <div className={cn("transition-transform duration-500", isSidebarCollapsed ? "rotate-180" : "rotate-0")}>
            <ChevronLeft size={12} />
          </div>
        </button>

        <div className="p-4 h-[60px] border-b border-zinc-800 flex items-center gap-2 drag-region overflow-hidden">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
          </div>
          {!isSidebarCollapsed && (
            <span className="ml-2 font-bold text-sm text-zinc-400 animate-in fade-in slide-in-from-left-2 duration-300">Squadron</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-hide">
          {/* Project Section */}
          <div>
            {!isSidebarCollapsed && (
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 animate-in fade-in duration-500">Project</h3>
            )}
            <div className="space-y-1">
              <SidebarItem icon={<LayoutDashboard size={18} />} label="Kanban Board" isActive={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<Terminal size={18} />} label="Agent Terminals" isActive={activeTab === 'terminals'} onClick={() => setActiveTab('terminals')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<Activity size={18} />} label="Insights" isActive={activeTab === 'insights'} onClick={() => setActiveTab('insights')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<Map size={18} />} label="Roadmap" isActive={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<Lightbulb size={18} />} label="Ideation" isActive={activeTab === 'ideation'} onClick={() => setActiveTab('ideation')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<FileClock size={18} />} label="Changelog" isActive={activeTab === 'changelog'} onClick={() => setActiveTab('changelog')} isCollapsed={isSidebarCollapsed} />
            </div>
          </div>

          {/* Tools Section */}
          <div>
            {!isSidebarCollapsed && (
              <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 animate-in fade-in duration-500">Tools</h3>
            )}
            <div className="space-y-1">
              <SidebarItem icon={<Github size={18} />} label="GitHub Issues" isActive={activeTab === 'github'} onClick={() => setActiveTab('github')} isCollapsed={isSidebarCollapsed} />
              <SidebarItem icon={<GitBranch size={18} />} label="Worktrees" isActive={activeTab === 'worktrees'} onClick={() => setActiveTab('worktrees')} isCollapsed={isSidebarCollapsed} />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-3 bg-zinc-900/20">
          <SidebarItem icon={<Settings size={18} />} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isCollapsed={isSidebarCollapsed} />
          <button
            onClick={() => setIsWizardOpen(true)}
            className={cn(
              "flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.15)] active:scale-95 duration-200",
              isSidebarCollapsed ? "w-10 h-10 p-0 mx-auto" : "w-full py-2.5 px-4"
            )}
          >
            <Plus size={18} />
            {!isSidebarCollapsed && <span className="text-xs uppercase tracking-wider">New Task</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-950 p-8 sm:p-12 relative">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />

        <header className="flex justify-between items-center mb-12 max-w-[1400px] mx-auto relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-600">
              {activeTab === 'kanban' ? 'Operation Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
            </h1>
            <p className="text-zinc-500 text-xs flex items-center gap-4 mt-3 font-bold uppercase tracking-widest">
              <span className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border", systemStatus?.status === 'online' ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20")}>
                <span className={cn("w-1.5 h-1.5 rounded-full", systemStatus?.status === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 animate-pulse")} />
                {systemStatus?.status === 'online' ? 'System Active' : (systemStatus?.status || 'Connecting')}
              </span>
              {systemStatus && (
                <>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                    <Terminal size={12} className="text-yellow-400" />
                    <span className="text-zinc-200">{systemStatus.agents_online}</span> Agents
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-zinc-800">
                    <Plus size={12} className="text-blue-400" />
                    <span className="text-zinc-200">{systemStatus.missions_active}</span> Flights
                  </span>
                </>
              )}
            </p>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto relative z-10">
          {activeTab === 'kanban' && (
            <div className="space-y-16 animate-in fade-in duration-700">
              {/* Agent Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {agents.map(agent => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>

              <KanbanBoard key={kanbanKey} />
            </div>
          )}

          {activeTab === 'terminals' && (
            <div className="h-[calc(100vh-260px)] animate-in slide-in-from-right-8 duration-700">
              <ActivityFeed />
            </div>
          )}
        </div>

        <TaskWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      </main>
    </div>
  )
}

interface SidebarItemProps {
  icon: any
  label: string
  isActive?: boolean
  onClick: () => void
  isCollapsed?: boolean
}

function SidebarItem({ icon, label, isActive, onClick, isCollapsed }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200",
        isCollapsed ? "w-11 h-11 justify-center mx-auto" : "w-full px-4 py-2.5",
        isActive
          ? "bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[1.02]"
          : "text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900"
      )}
    >
      <div className={cn("shrink-0 transition-transform duration-300", isActive && "scale-110")}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="animate-in fade-in slide-in-from-left-2 duration-300 truncate">
          {label}
        </span>
      )}
    </button>
  )
}


