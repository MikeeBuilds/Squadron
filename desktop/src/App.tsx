import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Terminal,
  Activity,
  Map,
  Lightbulb,
  FileClock,
  Settings,
  Plus,
  Github,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getSystemStatus, getAgents, type SystemStatus, type Agent } from '@/lib/api'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskWizard } from '@/components/TaskWizard'
import { AgentCard } from '@/components/AgentCard'
import { ActivityFeed } from '@/components/ActivityFeed'

// Shadcn Sidebar Imports
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban')
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [kanbanKey, setKanbanKey] = useState(0)

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getSystemStatus()
      setSystemStatus(status)

      const latestAgents = await getAgents()
      setAgents(latestAgents)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleTaskCreated = () => {
    setKanbanKey(prev => prev + 1)
  }

  const navigate = (tab: string) => setActiveTab(tab)

  return (
    <SidebarProvider className="dark">
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="h-[64px] border-b border-zinc-800 flex flex-row items-center gap-2 px-3 drag-region shrink-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
          <div className="flex gap-2 shrink-0 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1.5 group-data-[collapsible=icon]:items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
          <span className="ml-2 font-bold text-sm text-zinc-400 group-data-[collapsible=icon]:hidden">Squadron</span>
        </SidebarHeader>

        <SidebarContent className="py-6 space-y-8 scrollbar-hide overflow-x-hidden">
          <SidebarGroup className="group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 group-data-[collapsible=icon]:hidden">Project</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'kanban'} onClick={() => navigate('kanban')} tooltip="Kanban Board">
                  <LayoutDashboard /> <span>Kanban Board</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'terminals'} onClick={() => navigate('terminals')} tooltip="Agent Terminals">
                  <Terminal /> <span>Agent Terminals</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'insights'} onClick={() => navigate('insights')} tooltip="Insights">
                  <Activity /> <span>Insights</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'roadmap'} onClick={() => navigate('roadmap')} tooltip="Roadmap">
                  <Map /> <span>Roadmap</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'ideation'} onClick={() => navigate('ideation')} tooltip="Ideation">
                  <Lightbulb /> <span>Ideation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === 'changelog'} onClick={() => navigate('changelog')} tooltip="Changelog">
                    <FileClock /> <span>Changelog</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className="group-data-[collapsible=icon]:px-0">
            <SidebarGroupLabel className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 group-data-[collapsible=icon]:hidden">Tools</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'github'} onClick={() => navigate('github')} tooltip="GitHub Issues">
                  <Github /> <span>GitHub Issues</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'worktrees'} onClick={() => navigate('worktrees')} tooltip="Worktrees">
                  <GitBranch /> <span>Worktrees</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-zinc-800 space-y-3 bg-zinc-900/10 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          <SidebarMenu className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenuItem className="group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
              <SidebarMenuButton isActive={activeTab === 'settings'} onClick={() => navigate('settings')} tooltip="Settings">
                <Settings /> <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.15)] active:scale-95 duration-200 py-2.5 px-4 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 overflow-hidden"
          >
            <Plus size={18} className="shrink-0" />
            <span className="text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden whitespace-nowrap">New Task</span>
          </button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-zinc-950 flex-1 overflow-hidden border-none relative flex flex-col">
        <main className="h-full overflow-auto p-8 sm:p-12 relative flex flex-col items-center custom-scrollbar">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />

          <header className="flex w-full justify-between items-center mb-12 max-w-[1400px] relative z-10 transition-all duration-300">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-zinc-500 hover:text-yellow-400" />
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-600">
                  {activeTab === 'kanban' ? 'Operation Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                </h1>
                <p className="text-zinc-500 text-[10px] flex items-center gap-4 mt-2 font-bold uppercase tracking-[0.2em]">
                  <span className={cn("flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border transition-all", systemStatus?.status === 'online' ? "text-green-500 border-green-500/20" : "text-red-500 border-red-500/20")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", systemStatus?.status === 'online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 animate-pulse")} />
                    {systemStatus?.status === 'online' ? 'System Active' : (systemStatus?.status || 'Connecting')}
                  </span>
                  {systemStatus && (
                    <>
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <Terminal size={10} className="text-yellow-400" />
                        <span className="text-zinc-200">{systemStatus.agents_online}</span> Agents
                      </span>
                      <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800">
                        <Plus size={10} className="text-blue-400" />
                        <span className="text-zinc-200">{systemStatus.missions_active}</span> Flights
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </header>

          <div className="w-full max-w-[1400px] relative z-10">
            {activeTab === 'kanban' && (
              <div className="space-y-16 animate-in fade-in duration-700">
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
      </SidebarInset>
    </SidebarProvider>
  )
}
