"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Zap,
    Activity,
    Users,
    LayoutDashboard,
    Terminal,
    Settings,
    ShieldAlert,
    Menu,
    RefreshCw,
    Loader2,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Play,
    History
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
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Mission {
    mission_id: string;
    status: string;
    started: string;
    completed?: string;
    source?: {
        type?: string;
        summary?: string;
        ticket_id?: string;
    };
    result?: string;
    error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function MissionsPage() {
    const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
    const [historyMissions, setHistoryMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newTask, setNewTask] = useState("");
    const [triggering, setTriggering] = useState(false);

    const fetchMissions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/missions`);
            const data = await res.json();
            setActiveMissions(data.active || []);
            setHistoryMissions(data.history || []);
        } catch (err) {
            console.error("Failed to fetch missions", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMissions();
        // Poll for updates
        const interval = setInterval(fetchMissions, 3000);
        return () => clearInterval(interval);
    }, [fetchMissions]);

    const triggerMission = async () => {
        if (!newTask.trim() || triggering) return;
        setTriggering(true);
        try {
            const res = await fetch(`${API_BASE}/wake`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ summary: newTask })
            });
            await res.json();
            setNewTask("");
            fetchMissions();
        } catch (err) {
            console.error("Failed to trigger mission", err);
        } finally {
            setTriggering(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "running":
                return <Badge className="gap-1 bg-blue-500"><Loader2 className="h-3 w-3 animate-spin" />Running</Badge>;
            case "completed":
                return <Badge className="gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
            case "failed":
                return <Badge className="gap-1 bg-red-500"><XCircle className="h-3 w-3" />Failed</Badge>;
            default:
                return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />{status}</Badge>;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

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
                    <Link href="/agents">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Users className="h-4 w-4" />
                            Agents
                        </Button>
                    </Link>
                    <Button variant="secondary" className="w-full justify-start gap-2">
                        <Zap className="h-4 w-4" />
                        Missions
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
                        <Zap className="h-5 w-5" />
                        Missions
                    </h1>
                    <div className="ml-auto">
                        <Button variant="outline" size="sm" onClick={fetchMissions} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2">Refresh</span>
                        </Button>
                    </div>
                </header>

                {/* Missions Content */}
                <div className="p-6 space-y-6">

                    {/* Trigger New Mission */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5" />
                                Trigger New Mission
                            </CardTitle>
                            <CardDescription>Start a new autonomous agent task via the Wake Protocol</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Describe the task..."
                                    value={newTask}
                                    onChange={(e) => setNewTask(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && triggerMission()}
                                    disabled={triggering}
                                    className="flex-1"
                                />
                                <Button onClick={triggerMission} disabled={triggering || !newTask.trim()}>
                                    {triggering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                    <span className="ml-2">Launch</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Missions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                Active Missions
                                {activeMissions.length > 0 && (
                                    <Badge variant="secondary">{activeMissions.length}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeMissions.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No active missions. Trigger one above!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeMissions.map((mission) => (
                                        <div key={mission.mission_id} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <code className="text-xs font-mono">{mission.mission_id}</code>
                                                {getStatusBadge(mission.status)}
                                            </div>
                                            <div className="text-sm">
                                                {mission.source?.summary || "No description"}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Started: {formatTime(mission.started)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Mission History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5" />
                                Mission History
                            </CardTitle>
                            <CardDescription>Recent completed and failed missions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {historyMissions.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No mission history yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historyMissions.map((mission) => (
                                        <div key={mission.mission_id} className="p-4 border rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <code className="text-xs font-mono">{mission.mission_id}</code>
                                                {getStatusBadge(mission.status)}
                                            </div>
                                            <div className="text-sm">
                                                {mission.source?.summary || "No description"}
                                            </div>
                                            {mission.result && (
                                                <div className="text-xs bg-muted p-2 rounded font-mono max-h-20 overflow-auto">
                                                    {mission.result.slice(0, 200)}
                                                    {mission.result.length > 200 && "..."}
                                                </div>
                                            )}
                                            {mission.error && (
                                                <div className="text-xs bg-red-500/10 text-red-500 p-2 rounded">
                                                    {mission.error}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground flex gap-4">
                                                <span>Started: {formatTime(mission.started)}</span>
                                                {mission.completed && <span>Completed: {formatTime(mission.completed)}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
