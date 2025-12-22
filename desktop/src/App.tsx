import { useState, useEffect } from 'react'
import { LayoutDashboard, Terminal, Activity, Map, Lightbulb, FileClock, Settings, Plus, Github, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSystemStatus, type SystemStatus } from '@/lib/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban')
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getSystemStatus()
      setSystemStatus(status)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2 drag-region">
          <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
          <span className="ml-2 font-bold text-sm text-zinc-400">Squadron</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

          {/* Project Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Project</h3>
            <div className="space-y-1">
              <SidebarItem icon={<LayoutDashboard size={16} />} label="Kanban Board" isActive={activeTab === 'kanban'} onClick={() => setActiveTab('kanban')} />
              <SidebarItem icon={<Terminal size={16} />} label="Agent Terminals" isActive={activeTab === 'terminals'} onClick={() => setActiveTab('terminals')} />
              <SidebarItem icon={<Activity size={16} />} label="Insights" isActive={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
              <SidebarItem icon={<Map size={16} />} label="Roadmap" isActive={activeTab === 'roadmap'} onClick={() => setActiveTab('roadmap')} />
              <SidebarItem icon={<Lightbulb size={16} />} label="Ideation" isActive={activeTab === 'ideation'} onClick={() => setActiveTab('ideation')} />
              <SidebarItem icon={<FileClock size={16} />} label="Changelog" isActive={activeTab === 'changelog'} onClick={() => setActiveTab('changelog')} />
            </div>
          </div>

          {/* Tools Section */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Tools</h3>
            <div className="space-y-1">
              <SidebarItem icon={<Github size={16} />} label="GitHub Issues" isActive={activeTab === 'github'} onClick={() => setActiveTab('github')} />
              <SidebarItem icon={<GitBranch size={16} />} label="Worktrees" isActive={activeTab === 'worktrees'} onClick={() => setActiveTab('worktrees')} />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <SidebarItem icon={<Settings size={16} />} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <button className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition-colors text-sm">
            <Plus size={16} /> New Task
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-900/50 p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h1>
            <p className="text-zinc-500 text-sm flex items-center gap-4 mt-1">
              <span className={cn("flex items-center gap-1.5", systemStatus?.status === 'online' ? "text-green-500" : "text-red-500")}>
                <span className={cn("w-2 h-2 rounded-full", systemStatus?.status === 'online' ? "bg-green-500" : "bg-red-500 animate-pulse")} />
                {systemStatus?.status === 'online' ? 'System Online' : (systemStatus?.status || 'Connecting...')}
              </span>
              {systemStatus && (
                <>
                  <span>•</span>
                  <span>{systemStatus.agents_online} Agents Online</span>
                  <span>•</span>
                  <span>{systemStatus.missions_active} Active Missions</span>
                </>
              )}
            </p>
          </div>
        </header>

        {activeTab === 'kanban' && <KanbanView />}
        {activeTab === 'terminals' && <div className="text-zinc-500">Agent Terminals Placeholder</div>}


      </main>
    </div>
  )
}

function SidebarItem({ icon, label, isActive, onClick }: { icon: any, label: string, isActive?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-zinc-800 text-yellow-400"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function KanbanView() {
  return (
    <div className="grid grid-cols-4 gap-4 h-full">
      <KanbanColumn title="Planning" count={1} status="neutral">
        <KanbanCard title="Add Electron debugging" time="1h ago" tag="Pending" />
      </KanbanColumn>
      <KanbanColumn title="In Progress" count={0} status="blue" />
      <KanbanColumn title="Review" count={0} status="yellow" />
      <KanbanColumn title="Done" count={1} status="green">
        <KanbanCard title="Implement virtualization" time="3h ago" tag="Complete" />
      </KanbanColumn>
    </div>
  )
}

function KanbanColumn({ title, count, status, children }: { title: string, count: number, status: 'neutral' | 'blue' | 'yellow' | 'green', children?: React.ReactNode }) {
  const statusColor = {
    neutral: 'border-zinc-700',
    blue: 'border-blue-500/50',
    yellow: 'border-yellow-500/50',
    green: 'border-green-500/50'
  }[status]

  return (
    <div className={cn("flex flex-col h-full bg-zinc-900 rounded-xl border overflow-hidden", statusColor)}>
      <div className={cn("p-3 border-b border-zinc-800 flex justify-between items-center")}>
        <h4 className="font-semibold text-sm">{title} <span className="text-zinc-600 ml-1">{count}</span></h4>
        {title === 'Planning' && <Plus size={14} className="text-zinc-500 cursor-pointer hover:text-white" />}
      </div>
      <div className="p-3 space-y-3 flex-1 bg-zinc-900/50">
        {children ? children : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-lg opacity-50">
            <span className="text-xs text-zinc-600">Empty</span>
          </div>
        )}
      </div>
    </div>
  )
}

function KanbanCard({ title, time, tag }: { title: string, time: string, tag: string }) {
  return (
    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 hover:border-zinc-600 cursor-pointer transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors line-clamp-2 leading-snug">{title}</span>
        <span className="text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded">{tag}</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-zinc-600 mt-3">
        <FileClock size={10} />
        {time}
      </div>
    </div>
  )
}
