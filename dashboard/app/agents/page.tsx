"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Users,
    Activity,
    LayoutDashboard,
    Terminal,
    Settings,
    ShieldAlert,
    Menu,
    RefreshCw,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Zap,
    Brain,
    Code,
    Shield
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Agent metadata with more details
const AGENT_META: Record<string, { icon: React.ReactNode; specialty: string; description: string; color: string }> = {
    "Marcus": {
        icon: <Brain className="h-5 w-5" />,
        specialty: "Research & Strategy",
        description: "Senior strategic thinker. Handles complex analysis, planning, research, and high-level decision making.",
        color: "from-blue-500 to-purple-600"
    },
    "Caleb": {
        icon: <Code className="h-5 w-5" />,
        specialty: "Development & Execution",
        description: "Expert developer. Writes code, executes tasks, manages files, and handles technical implementation.",
        color: "from-green-500 to-emerald-600"
    },
    "Sentinel": {
        icon: <Shield className="h-5 w-5" />,
        specialty: "Security & Compliance",
        description: "Security specialist. Reviews code for vulnerabilities, audits systems, and ensures compliance.",
        color: "from-orange-500 to-red-600"
    }
};

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchAgents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/agents`);
            const data = await res.json();
            setAgents(data.agents || []);
        } catch (err) {
            console.error("Failed to fetch agents", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgents();
        // Poll for updates
        const interval = setInterval(fetchAgents, 5000);
        return () => clearInterval(interval);
    }, [fetchAgents]);

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4 py-4">
            <div className="px-6 flex items-center gap-2 font-bold text-xl">
                <Activity className="h-6 w-6 text-primary" />
                <span>Squadron</span>
            </div>
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-1">
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Mission Control
                        </Button>
                    </Link>
                    <Button variant="secondary" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Agents
                    </Button>
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
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Agent Roster
                    </h1>
                    <div className="ml-auto">
                        <Button variant="outline" size="sm" onClick={fetchAgents} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2">Refresh</span>
                        </Button>
                    </div>
                </header>

                {/* Agents Content */}
                <div className="p-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {loading && agents.length === 0 ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardHeader>
                                        <div className="h-6 bg-muted rounded w-1/2" />
                                        <div className="h-4 bg-muted rounded w-1/3 mt-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-20 bg-muted rounded" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            agents.map((agent) => {
                                const meta = AGENT_META[agent.name] || {
                                    icon: <Users className="h-5 w-5" />,
                                    specialty: "General",
                                    description: "Squadron agent",
                                    color: "from-gray-500 to-gray-600"
                                };

                                return (
                                    <Card key={agent.name} className="overflow-hidden">
                                        {/* Gradient Header */}
                                        <div className={cn("h-2 bg-gradient-to-r", meta.color)} />

                                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                            <Avatar className="h-14 w-14 border-2">
                                                <AvatarImage src={agent.avatar} />
                                                <AvatarFallback className={cn("bg-gradient-to-br text-white", meta.color)}>
                                                    {meta.icon}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                                                    <Badge
                                                        variant={agent.status === "busy" ? "default" : "secondary"}
                                                        className="gap-1"
                                                    >
                                                        {agent.status === "busy" ? (
                                                            <Zap className="h-3 w-3" />
                                                        ) : (
                                                            <Clock className="h-3 w-3" />
                                                        )}
                                                        {agent.status}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="mt-1">{meta.specialty}</CardDescription>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {meta.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Current Objective
                                                </div>
                                                <div className="p-3 bg-muted rounded-lg font-mono text-xs border">
                                                    {agent.task || "Awaiting instructions..."}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>{agent.history_count || 0} tasks completed</span>
                                                </div>
                                                <Link href={`/console?agent=${agent.name}`}>
                                                    <Button variant="outline" size="sm">
                                                        Chat
                                                    </Button>
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>

                    {/* Agent Capabilities Legend */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="text-base">Agent Capabilities</CardTitle>
                            <CardDescription>What each agent specializes in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Brain className="h-4 w-4 text-blue-500" />
                                        Marcus
                                    </div>
                                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                                        <li>• Strategic planning</li>
                                        <li>• Research & analysis</li>
                                        <li>• Web browsing</li>
                                        <li>• Decision making</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Code className="h-4 w-4 text-green-500" />
                                        Caleb
                                    </div>
                                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                                        <li>• Code generation</li>
                                        <li>• File operations</li>
                                        <li>• Shell commands</li>
                                        <li>• SSH access</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Shield className="h-4 w-4 text-orange-500" />
                                        Sentinel
                                    </div>
                                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                                        <li>• Security audits</li>
                                        <li>• Code review</li>
                                        <li>• Vulnerability scanning</li>
                                        <li>• Compliance checks</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
