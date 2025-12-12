"use client";

import { useState, useCallback } from "react";
import {
    MessageSquare,
    Send,
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Integration {
    name: string;
    icon: string;
    configured: boolean;
    status: string;
}

interface IntegrationsPanelProps {
    apiBase: string;
}

export default function IntegrationsPanel({ apiBase }: IntegrationsPanelProps) {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Form states
    const [slackMessage, setSlackMessage] = useState("");
    const [slackChannel, setSlackChannel] = useState("#general");
    const [discordMessage, setDiscordMessage] = useState("");
    const [jiraTicket, setJiraTicket] = useState("");
    const [jiraComment, setJiraComment] = useState("");
    const [reportMessage, setReportMessage] = useState("");
    const [reportTicket, setReportTicket] = useState("");

    // GitHub states
    const [ghRepo, setGhRepo] = useState("");
    const [ghIssueTitle, setGhIssueTitle] = useState("");
    const [ghIssueBody, setGhIssueBody] = useState("");
    const [ghPrTitle, setGhPrTitle] = useState("");
    const [ghPrHead, setGhPrHead] = useState("");
    const [ghPrBase, setGhPrBase] = useState("main");

    // Result states
    const [results, setResults] = useState<Record<string, { success: boolean; message: string } | null>>({});
    const [sending, setSending] = useState<string | null>(null);

    const fetchIntegrations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/integrations/status`);
            const data = await res.json();
            setIntegrations(data.integrations || []);
        } catch (err) {
            console.error("Failed to fetch integrations", err);
        } finally {
            setLoading(false);
        }
    }, [apiBase]);

    // Load integrations on expand
    const handleExpand = () => {
        if (!expanded) {
            fetchIntegrations();
        }
        setExpanded(!expanded);
    };

    const sendSlack = async () => {
        if (!slackMessage.trim()) return;
        setSending("slack");
        try {
            const res = await fetch(`${apiBase}/integrations/slack/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: slackMessage, channel: slackChannel })
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, slack: { success: data.success, message: data.success ? `Sent to ${slackChannel}` : data.error } }));
            if (data.success) setSlackMessage("");
        } catch (err) {
            setResults(prev => ({ ...prev, slack: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const sendDiscord = async () => {
        if (!discordMessage.trim()) return;
        setSending("discord");
        try {
            const res = await fetch(`${apiBase}/integrations/discord/broadcast`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: discordMessage })
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, discord: { success: data.success, message: data.success ? "Broadcast sent" : data.error } }));
            if (data.success) setDiscordMessage("");
        } catch (err) {
            setResults(prev => ({ ...prev, discord: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const sendJira = async () => {
        if (!jiraTicket.trim() || !jiraComment.trim()) return;
        setSending("jira");
        try {
            const res = await fetch(`${apiBase}/integrations/jira/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticket_id: jiraTicket, comment: jiraComment })
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, jira: { success: data.success, message: data.success ? `Updated ${jiraTicket}` : data.error } }));
            if (data.success) setJiraComment("");
        } catch (err) {
            setResults(prev => ({ ...prev, jira: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const sendReport = async () => {
        if (!reportMessage.trim()) return;
        setSending("report");
        try {
            const res = await fetch(`${apiBase}/integrations/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: reportMessage,
                    ticket: reportTicket || undefined,
                    channel: "#general"
                })
            });
            const data = await res.json();
            setResults(prev => ({
                ...prev, report: {
                    success: data.success,
                    message: data.success ? `Sent: ${JSON.stringify(data.results)}` : data.error
                }
            }));
            if (data.success) {
                setReportMessage("");
                setReportTicket("");
            }
        } catch (err) {
            setResults(prev => ({ ...prev, report: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const createGhIssue = async () => {
        if (!ghRepo.trim() || !ghIssueTitle.trim()) return;
        setSending("ghissue");
        try {
            const res = await fetch(`${apiBase}/integrations/github/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo: ghRepo, title: ghIssueTitle, body: ghIssueBody })
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, ghissue: { success: data.success, message: data.success ? "Issue created" : data.error } }));
            if (data.success) {
                setGhIssueTitle("");
                setGhIssueBody("");
            }
        } catch (err) {
            setResults(prev => ({ ...prev, ghissue: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const createGhPr = async () => {
        if (!ghRepo.trim() || !ghPrTitle.trim() || !ghPrHead.trim()) return;
        setSending("ghpr");
        try {
            const res = await fetch(`${apiBase}/integrations/github/pr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repo: ghRepo, title: ghPrTitle, head: ghPrHead, base: ghPrBase })
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, ghpr: { success: data.success, message: data.success ? "PR created" : data.error } }));
            if (data.success) {
                setGhPrTitle("");
                setGhPrHead("");
            }
        } catch (err) {
            setResults(prev => ({ ...prev, ghpr: { success: false, message: String(err) } }));
        } finally {
            setSending(null);
        }
    };

    const ResultBadge = ({ id }: { id: string }) => {
        const result = results[id];
        if (!result) return null;
        const message = result.message || (result.success ? "Success" : "Failed");
        return (
            <Badge variant={result.success ? "default" : "destructive"} className="gap-1 text-xs">
                {result.success ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {message.slice(0, 30)}
            </Badge>
        );
    };

    return (
        <Card>
            <CardHeader
                className="cursor-pointer flex flex-row items-center justify-between py-3"
                onClick={handleExpand}
            >
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Integrations
                    </CardTitle>
                    <CardDescription>Slack, Discord, Jira, GitHub, Linear</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </CardHeader>

            {expanded && (
                <CardContent className="space-y-4 pt-0">
                    {/* Integration Status Pills */}
                    {loading ? (
                        <div className="flex gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {integrations.map((int) => (
                                <Badge
                                    key={int.name}
                                    variant={int.configured ? "default" : "secondary"}
                                    className="gap-1"
                                >
                                    <span>{int.icon}</span>
                                    {int.name}
                                    {int.configured && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Unified Report */}
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                        <div className="text-sm font-medium">📢 Send Report (All Channels)</div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Message..."
                                value={reportMessage}
                                onChange={(e) => setReportMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Ticket (optional)"
                                value={reportTicket}
                                onChange={(e) => setReportTicket(e.target.value)}
                                className="w-32"
                            />
                            <Button onClick={sendReport} disabled={sending === "report" || !reportMessage.trim()} size="sm">
                                {sending === "report" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                        <ResultBadge id="report" />
                    </div>

                    {/* Slack */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">💬 Slack</div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Channel"
                                value={slackChannel}
                                onChange={(e) => setSlackChannel(e.target.value)}
                                className="w-28"
                            />
                            <Input
                                placeholder="Message..."
                                value={slackMessage}
                                onChange={(e) => setSlackMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={sendSlack} disabled={sending === "slack" || !slackMessage.trim()} size="sm">
                                {sending === "slack" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                        <ResultBadge id="slack" />
                    </div>

                    {/* Discord */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">🎮 Discord</div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Broadcast message..."
                                value={discordMessage}
                                onChange={(e) => setDiscordMessage(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={sendDiscord} disabled={sending === "discord" || !discordMessage.trim()} size="sm">
                                {sending === "discord" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                        <ResultBadge id="discord" />
                    </div>

                    {/* Jira */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">📋 Jira</div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ticket ID"
                                value={jiraTicket}
                                onChange={(e) => setJiraTicket(e.target.value)}
                                className="w-28"
                            />
                            <Input
                                placeholder="Comment..."
                                value={jiraComment}
                                onChange={(e) => setJiraComment(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={sendJira} disabled={sending === "jira" || !jiraTicket.trim() || !jiraComment.trim()} size="sm">
                                {sending === "jira" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                        <ResultBadge id="jira" />
                    </div>

                    {/* GitHub */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">🐙 GitHub</div>

                        {/* Repo input (shared) */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="owner/repo"
                                value={ghRepo}
                                onChange={(e) => setGhRepo(e.target.value)}
                                className="w-40"
                            />
                            <span className="text-xs text-muted-foreground self-center">Repository for Issue/PR</span>
                        </div>

                        {/* Issue */}
                        <div className="flex gap-2 pl-2 border-l-2 border-muted">
                            <Input
                                placeholder="Issue title"
                                value={ghIssueTitle}
                                onChange={(e) => setGhIssueTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={createGhIssue} disabled={sending === "ghissue" || !ghRepo.trim() || !ghIssueTitle.trim()} size="sm" variant="outline">
                                {sending === "ghissue" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Issue"}
                            </Button>
                        </div>
                        <ResultBadge id="ghissue" />

                        {/* PR */}
                        <div className="flex gap-2 pl-2 border-l-2 border-muted">
                            <Input
                                placeholder="PR title"
                                value={ghPrTitle}
                                onChange={(e) => setGhPrTitle(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="head"
                                value={ghPrHead}
                                onChange={(e) => setGhPrHead(e.target.value)}
                                className="w-24"
                            />
                            <Input
                                placeholder="base"
                                value={ghPrBase}
                                onChange={(e) => setGhPrBase(e.target.value)}
                                className="w-20"
                            />
                            <Button onClick={createGhPr} disabled={sending === "ghpr" || !ghRepo.trim() || !ghPrTitle.trim() || !ghPrHead.trim()} size="sm" variant="outline">
                                {sending === "ghpr" ? <Loader2 className="h-4 w-4 animate-spin" /> : "PR"}
                            </Button>
                        </div>
                        <ResultBadge id="ghpr" />
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
