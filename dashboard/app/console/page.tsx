"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Terminal,
    Activity,
    Users,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    Menu,
    Send,
    Loader2,
    ArrowLeft,
    Bot,
    User
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Message {
    role: "user" | "agent";
    agent?: string;
    content: string;
    timestamp: Date;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ConsolePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [targetAgent, setTargetAgent] = useState<string>("auto");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setSending(true);

        try {
            const res = await fetch(`${API_BASE}/command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    command: input,
                    target_agent: targetAgent === "auto" ? undefined : targetAgent
                })
            });
            const data = await res.json();

            const agentMessage: Message = {
                role: "agent",
                agent: data.agent || targetAgent,
                content: data.response || data.error || "No response",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, agentMessage]);
        } catch (err) {
            const errorMessage: Message = {
                role: "agent",
                agent: "System",
                content: `Error: ${err}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setSending(false);
        }
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
                    <Button variant="ghost" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Agents
                    </Button>
                    <Button variant="secondary" className="w-full justify-start gap-2">
                        <Terminal className="h-4 w-4" />
                        Console
                    </Button>
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
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 shrink-0">
                    <Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="font-semibold text-lg flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        Agent Console
                    </h1>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-12">
                                <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Agent Console</p>
                                <p className="text-sm">Send commands directly to your Squadron agents</p>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-3",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === "agent" && (
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-4 py-2",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    )}
                                >
                                    {msg.role === "agent" && msg.agent && (
                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                            [{msg.agent}]
                                        </div>
                                    )}
                                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                    <div className="text-xs opacity-50 mt-1">
                                        {msg.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                                {msg.role === "user" && (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {sending && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                                <div className="bg-muted rounded-lg px-4 py-2">
                                    <div className="text-sm text-muted-foreground">Thinking...</div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="border-t bg-background p-4 shrink-0">
                    <div className="max-w-3xl mx-auto flex gap-2">
                        <Select value={targetAgent} onValueChange={setTargetAgent}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Agent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="auto">Auto Route</SelectItem>
                                <SelectItem value="Marcus">Marcus</SelectItem>
                                <SelectItem value="Caleb">Caleb</SelectItem>
                                <SelectItem value="Sentinel">Sentinel</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Type a command..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            disabled={sending}
                            className="flex-1"
                        />
                        <Button onClick={sendMessage} disabled={sending || !input.trim()}>
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
