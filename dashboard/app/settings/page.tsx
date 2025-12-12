"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Settings,
    Activity,
    Users,
    LayoutDashboard,
    Terminal,
    ShieldAlert,
    Menu,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Key,
    Server,
    Loader2,
    ArrowLeft
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

interface Integration {
    name: string;
    icon: string;
    configured: boolean;
    status: string;
}

interface SystemStatus {
    agents_online: number;
    agents_active: number;
    tasks_queued: number;
    missions_active: number;
    status: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SettingsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [intRes, statusRes] = await Promise.all([
                fetch(`${API_BASE}/integrations/status`),
                fetch(`${API_BASE}/system/status`)
            ]);

            const intData = await intRes.json();
            const statusData = await statusRes.json();

            setIntegrations(intData.integrations || []);
            setSystemStatus(statusData);
        } catch (err) {
            console.error("Failed to fetch settings data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Agents
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <Terminal className="h-4 w-4" />
                        Console
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
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
                    <h1 className="font-semibold text-lg">Settings</h1>
                    <div className="ml-auto">
                        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            <span className="ml-2">Refresh</span>
                        </Button>
                    </div>
                </header>

                {/* Settings Content */}
                <div className="p-6 space-y-6">

                    {/* System Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                System Status
                            </CardTitle>
                            <CardDescription>Current state of the Squadron system</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">Status</div>
                                        <div className="text-xl font-bold capitalize flex items-center gap-2">
                                            {systemStatus?.status === "operational" ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-500" />
                                            )}
                                            {systemStatus?.status || "Unknown"}
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">Agents Online</div>
                                        <div className="text-xl font-bold">{systemStatus?.agents_online || 0}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">Active Tasks</div>
                                        <div className="text-xl font-bold">{systemStatus?.agents_active || 0}</div>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-muted-foreground">API Endpoint</div>
                                        <div className="text-sm font-mono">{API_BASE}</div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Integrations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Integrations
                            </CardTitle>
                            <CardDescription>
                                Configure integrations in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {integrations.map((int) => (
                                        <div key={int.name} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{int.icon}</span>
                                                <div>
                                                    <div className="font-medium">{int.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {int.configured ? "Connected and ready" : "Not configured - add credentials to .env"}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={int.configured ? "default" : "secondary"} className="gap-1">
                                                {int.configured ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Connected
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3 w-3" />
                                                        Not Configured
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Environment Variables Reference */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration Reference</CardTitle>
                            <CardDescription>Required environment variables for each integration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">💬 Slack</div>
                                    <code className="text-xs block bg-muted p-2 rounded">SLACK_BOT_TOKEN=xoxb-...</code>
                                    <code className="text-xs block bg-muted p-2 rounded">SLACK_APP_TOKEN=xapp-...</code>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">🎮 Discord</div>
                                    <code className="text-xs block bg-muted p-2 rounded">DISCORD_WEBHOOK_URL=https://...</code>
                                    <code className="text-xs block bg-muted p-2 rounded">DISCORD_BOT_TOKEN=...</code>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">📋 Jira</div>
                                    <code className="text-xs block bg-muted p-2 rounded">JIRA_SERVER=https://your.atlassian.net</code>
                                    <code className="text-xs block bg-muted p-2 rounded">JIRA_EMAIL=you@email.com</code>
                                    <code className="text-xs block bg-muted p-2 rounded">JIRA_TOKEN=...</code>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">🐙 GitHub</div>
                                    <code className="text-xs block bg-muted p-2 rounded">GITHUB_TOKEN=ghp_...</code>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">📐 Linear</div>
                                    <code className="text-xs block bg-muted p-2 rounded">LINEAR_API_KEY=lin_api_...</code>
                                </div>
                                <div className="p-4 border rounded-lg space-y-2">
                                    <div className="font-medium">🧠 AI Models</div>
                                    <code className="text-xs block bg-muted p-2 rounded">GOOGLE_API_KEY=...</code>
                                    <code className="text-xs block bg-muted p-2 rounded">OPENAI_API_KEY=...</code>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
