"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Users,
  LayoutDashboard,
  Terminal,
  Settings,
  Activity,
  ShieldAlert,
  Menu,
  Send,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Radio,
  Loader2
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import IntegrationsPanel from "@/components/IntegrationsPanel";
import Link from "next/link";

interface Agent {
  name: string;
  role: string;
  status: string;
  task?: string;
  avatar?: string;
  color?: string;
  history_count?: number;
}

interface ActivityEvent {
  type: string;
  agent: string;
  timestamp: string;
  data: Record<string, unknown>;
}

interface SystemStatus {
  agents_online: number;
  agents_active: number;
  tasks_queued: number;
  missions_active: number;
  status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [command, setCommand] = useState("");
  const [sending, setSending] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const activityEndRef = useRef<HTMLDivElement>(null);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/agents`);
      const data = await res.json();
      setAgents(data.agents || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch agents", err);
      setLoading(false);
    }
  }, []);

  // Fetch system status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/system/status`);
      const data = await res.json();
      setSystemStatus(data);
    } catch (err) {
      console.error("Failed to fetch status", err);
    }
  }, []);

  // Fetch initial activity history
  const fetchActivityHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/activity/history?limit=30`);
      const data = await res.json();
      setActivities(data.events || []);
    } catch (err) {
      console.error("Failed to fetch activity history", err);
    }
  }, []);

  // SSE Connection for real-time activity
  useEffect(() => {
    fetchAgents();
    fetchStatus();
    fetchActivityHistory();

    // Setup SSE
    const eventSource = new EventSource(`${API_BASE}/activity`);

    eventSource.onopen = () => {
      setSseConnected(true);
      console.log("🔴 SSE Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const newEvent = JSON.parse(event.data);
        setActivities(prev => [...prev.slice(-99), newEvent]);

        // Refresh agents on relevant events
        if (["agent_start", "agent_complete", "tool_result"].includes(newEvent.type)) {
          fetchAgents();
          fetchStatus();
        }
      } catch (e) {
        console.error("Failed to parse SSE event", e);
      }
    };

    eventSource.onerror = () => {
      setSseConnected(false);
      console.log("🔴 SSE Disconnected");
    };

    // Poll status every 10s as backup
    const interval = setInterval(() => {
      fetchAgents();
      fetchStatus();
    }, 10000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [fetchAgents, fetchStatus, fetchActivityHistory]);

  // Auto-scroll activity feed
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activities]);

  // Send command
  const handleSendCommand = async () => {
    if (!command.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: command.trim() })
      });
      const data = await res.json();

      if (data.success) {
        setCommand("");
        fetchAgents();
        fetchStatus();
      } else {
        console.error("Command failed:", data.error);
      }
    } catch (err) {
      console.error("Failed to send command", err);
    } finally {
      setSending(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "agent_start": return <Zap className="h-3 w-3 text-yellow-500" />;
      case "agent_complete": return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case "tool_call": return <ArrowRight className="h-3 w-3 text-blue-500" />;
      case "tool_result": return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
      case "error": return <XCircle className="h-3 w-3 text-red-500" />;
      case "route": return <Radio className="h-3 w-3 text-purple-500" />;
      default: return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-6 flex items-center gap-2 font-bold text-xl">
        <Activity className="h-6 w-6 text-primary" />
        <span>Squadron</span>
      </div>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Mission Control
          </Button>
          <Link href="/agents">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="h-4 w-4" />
              Agents
            </Button>
          </Link>
          <Link href="/missions">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Zap className="h-4 w-4" />
              Missions
            </Button>
          </Link>
          <Link href="/console">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Terminal className="h-4 w-4" />
              Console
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
        <Separator className="my-4" />
        <div className="px-2 text-sm font-medium text-muted-foreground mb-2">
          Systems
        </div>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            Security (Active)
          </Button>
        </div>
      </ScrollArea>
      <div className="mt-auto px-6 pb-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/user.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">squadron@local</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row dark bg-background text-foreground">
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:w-64 lg:w-72">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg">Mission Control</h1>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={sseConnected ? "default" : "secondary"} className="gap-1">
              <div className={cn("h-2 w-2 rounded-full", sseConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500")} />
              {sseConnected ? "Live" : "Reconnecting..."}
            </Badge>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-8">
          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.agents_online || agents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus?.agents_active || 0} currently working
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tasks Queued</CardTitle>
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.tasks_queued || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStatus?.tasks_queued === 0 ? "System idle" : "Processing..."}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus?.missions_active || 0}</div>
                <p className="text-xs text-muted-foreground">Wake Protocol</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{systemStatus?.status || "Unknown"}</div>
                <p className="text-xs text-muted-foreground">All systems nominal</p>
              </CardContent>
            </Card>
          </div>

          {/* Command Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Command Center</CardTitle>
              <CardDescription>Send instructions to your agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a command for your agents..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
                  disabled={sending}
                  className="flex-1"
                />
                <Button onClick={handleSendCommand} disabled={sending || !command.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Integrations Panel */}
          <IntegrationsPanel apiBase={API_BASE} />

          {/* Two Column Layout: Agents + Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Agents Grid */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-4">Neural Link Status</h2>
              <div className="grid gap-4">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="gap-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  agents.map((agent) => (
                    <Card key={agent.name} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
                        <Avatar className="h-10 w-10 border">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 flex-1">
                          <CardTitle className="text-base">{agent.name}</CardTitle>
                          <CardDescription>{agent.role}</CardDescription>
                        </div>
                        <Badge
                          variant={agent.status === 'busy' ? 'default' : 'secondary'}
                          className="uppercase text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm space-y-2">
                          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                            Current Objective
                          </div>
                          <div className="p-2 bg-muted rounded-md font-mono text-xs border">
                            {agent.task || "Waiting for instructions..."}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Activity Feed */}
            <div>
              <h2 className="text-xl font-semibold tracking-tight mb-4">Activity Feed</h2>
              <Card className="h-[500px] flex flex-col">
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-2">
                      {activities.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          Waiting for agent activity...
                        </div>
                      ) : (
                        activities.map((event, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs py-1 border-b border-border/50 last:border-0">
                            {getActivityIcon(event.type)}
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-primary">[{event.agent}]</span>{" "}
                              <span className="text-muted-foreground">{event.type}</span>
                              {event.data && (
                                <div className="text-muted-foreground/70 truncate">
                                  {String(event.data.task || event.data.tool || event.data.summary || JSON.stringify(event.data).slice(0, 60))}
                                </div>
                              )}
                            </div>
                            <span className="text-muted-foreground/50 shrink-0">
                              {formatTime(event.timestamp)}
                            </span>
                          </div>
                        ))
                      )}
                      <div ref={activityEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
