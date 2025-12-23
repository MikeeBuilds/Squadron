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
import { getAgents, type Agent } from '@/lib/api'
import { KanbanBoard } from '@/components/KanbanBoard'
import { TaskWizard } from '@/components/TaskWizard'
import { AgentCard } from '@/components/AgentCard'
import { TerminalHub } from '@/components/TerminalHub'
import { SettingsPanel } from '@/components/SettingsPanel'
import { OnboardingWizard } from '@/components/OnboardingWizard'

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
  const [agents, setAgents] = useState<Agent[]>([])
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [kanbanKey, setKanbanKey] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  const api = (window as any).electronAPI

  // Check if onboarding is needed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isComplete = await api.isOnboardingComplete()
        setShowOnboarding(!isComplete)
      } catch (err) {
        console.error('Failed to check onboarding:', err)
      } finally {
        setLoading(false)
      }
    }
    checkOnboarding()
  }, [])

  useEffect(() => {
    const fetchStatus = async () => {
      const latestAgents = await getAgents()
      setAgents(latestAgents)
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  // Show loading or onboarding
  if (loading) {
    return (
      <div className="dark h-full w-full flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
  }

  const navItems = [
    { id: 'kanban', label: 'Operations', icon: LayoutDashboard },
    { id: 'terminals', label: 'Terminal Hub', icon: Terminal },
    { id: 'network', label: 'Agent Network', icon: Activity },
    { id: 'roadmap', label: 'Flight Plan', icon: Map },
    { id: 'prompts', label: 'Command Library', icon: Lightbulb },
    { id: 'history', label: 'Mission Logs', icon: FileClock },
    { id: 'settings', label: 'System Config', icon: Settings },
  ]

  return (
    <div className="dark h-full w-full">
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon" className="border-r border-zinc-900 bg-zinc-950 backdrop-blur-xl">
          <SidebarHeader className="p-4 pt-6 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:pt-10">
            <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.3)] shrink-0">
                <span className="text-black font-black text-xs">S</span>
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
                <h2 className="text-sm font-black tracking-tight text-white leading-tight">SQUADRON</h2>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Agentic OS v2.0</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-6 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 group-data-[collapsible=icon]:hidden">
                Main Interface
              </SidebarGroupLabel>
              <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.id} className="mb-1">
                    <SidebarMenuButton
                      onClick={() => item.id === 'settings' ? setIsSettingsOpen(true) : setActiveTab(item.id)}
                      isActive={activeTab === item.id}
                      tooltip={item.label}
                      className={activeTab === item.id ? "bg-cyan-400 text-black font-bold" : "text-zinc-500 hover:text-white hover:bg-zinc-900"}
                    >
                      <item.icon className="shrink-0" size={18} />
                      <span className="font-bold tracking-tight">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel className="px-6 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-4 group-data-[collapsible=icon]:hidden">
                Deployment
              </SidebarGroupLabel>
              <SidebarMenu className="px-2 group-data-[collapsible=icon]:px-0">
                <SidebarMenuItem className="mb-1">
                  <SidebarMenuButton className="text-zinc-500 hover:text-white hover:bg-zinc-900">
                    <Github size={18} />
                    <span className="font-bold tracking-tight">Repository</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-zinc-500 hover:text-white hover:bg-zinc-900">
                    <GitBranch size={18} />
                    <span className="font-bold tracking-tight">Active Branch</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-zinc-900/50 group-data-[collapsible=icon]:p-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-3 px-2 py-3 bg-zinc-900/30 rounded-xl mb-4 group-data-[collapsible=icon]:hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-zinc-200 truncate">Commander Michael</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Session Active</span>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-500 text-black font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(250,204,21,0.15)] active:scale-95 duration-200 py-2.5 px-4 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0 overflow-hidden"
            >
              <Plus size={18} className="shrink-0" />
              <span className="text-xs uppercase tracking-wider group-data-[collapsible=icon]:hidden whitespace-nowrap">New Task</span>
            </button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-zinc-950 flex-1 overflow-hidden border-none relative flex flex-col">
          <main className="h-full overflow-hidden p-4 relative flex flex-col custom-scrollbar">
            {/* Subtle Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48" />

            <header className="flex w-full justify-between items-center mb-2 max-w-[1400px] relative z-10 transition-all duration-300 shrink-0">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-zinc-500 hover:text-cyan-400" />
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-black tracking-tight text-white/90">
                    {activeTab === 'kanban' ? 'Operation Dashboard' : 'Terminal Workbench'}
                  </h1>
                  <div className="h-4 w-px bg-zinc-800" />
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[8px] font-bold text-green-500 uppercase tracking-widest">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    Live System
                  </div>
                </div>
              </div>
            </header>

            <div className="w-full max-w-[1400px] flex-1 min-h-0 overflow-hidden relative z-10 flex flex-col">
              {activeTab === 'kanban' && (
                <div className="h-full overflow-auto scrollbar-hide">
                  <div className="space-y-16 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {agents.map(agent => (
                        <AgentCard key={agent.name} agent={agent} />
                      ))}
                    </div>

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xl font-black tracking-tight text-white">Project Flight Path</h3>
                        <div className="flex-1 h-px bg-zinc-900" />
                      </div>
                      <KanbanBoard key={kanbanKey} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terminals' && (
                <div className="flex-1 min-h-0 pb-4 animate-in fade-in zoom-in-95 duration-500">
                  <TerminalHub />
                </div>
              )}
            </div>
          </main>
        </SidebarInset>

        <TaskWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onTaskCreated={() => {
            setKanbanKey(prev => prev + 1)
          }}
        />

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </SidebarProvider>
    </div>
  )
}
