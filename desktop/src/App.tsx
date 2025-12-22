import { useState, useEffect } from 'react'
import { LayoutDashboard, Terminal, Activity, Map, Lightbulb, FileClock, Settings, Plus, Github, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSystemStatus, type SystemStatus } from '@/lib/api'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskWizard } from '@/components/TaskWizard'

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban')
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [kanbanKey, setKanbanKey] = useState(0) // Used to force refresh Kanban after creation

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getSystemStatus()
      setSystemStatus(status)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [])

  const handleTaskCreated = () => {
    setKanbanKey(prev => prev + 1)
  }

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
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition-colors text-sm shadow-lg shadow-yellow-400/10 active:scale-95 duration-100"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-zinc-900/10 p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h1>
            <p className="text-zinc-500 text-sm flex items-center gap-4 mt-1">
              <span className={cn("flex items-center gap-1.5", systemStatus?.status === 'online' ? "text-green-500" : "text-red-500")}>
                <span className={cn("w-2 h-2 rounded-full", systemStatus?.status === 'online' ? "bg-green-500" : "bg-red-500 animate-pulse")} />
                {systemStatus?.status === 'online' ? 'System Online' : (systemStatus?.status || 'Connecting...')}
              </span>
              {systemStatus && (
                <>
                  <span className="opacity-20">|</span>
                  <span className="flex items-center gap-1"><Terminal size={12} className="opacity-50" /> {systemStatus.agents_online} Agents Online</span>
                  <span className="opacity-20">|</span>
                  <span className="flex items-center gap-1"><Plus size={12} className="opacity-50" /> {systemStatus.missions_active} Active Missions</span>
                </>
              )}
            </p>
          </div>
        </header>

        {activeTab === 'kanban' && <KanbanBoard key={kanbanKey} />}
        {activeTab === 'terminals' && <div className="text-zinc-500 bg-zinc-900/50 p-12 rounded-2xl border border-dashed border-zinc-800 text-center">Agent Terminals placeholder - Coming soon in Issue 7</div>}

        <TaskWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
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

