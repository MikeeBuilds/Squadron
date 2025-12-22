"""
Squadron Control Plane API 🎮
FastAPI backend for the Squadron dashboard.
Provides real-time agent status, activity streaming, and command interface.
"""
import os
import sys
import json
import asyncio
import uvicorn
from datetime import datetime

# Add current directory to path so relative imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir)) # Add parent for 'squadron' package resolution

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from rich.console import Console
import yaml

console = Console()

app = FastAPI(
    title="Squadron Control Plane",
    version="0.5.0",
    description="Real-time dashboard API for Squadron agent orchestration"
)

# CORS - Allow Next.js frontend to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Health check and system status."""
    return {
        "status": "online",
        "system": "Squadron Control Plane",
        "version": "0.5.0",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/agents")
def get_agents():
    """Return list of active agents with real data from swarm."""
    try:
        from squadron.swarm.overseer import overseer
        
        # Load agent config for avatars
        agent_config = {}
        config_paths = ["squadron/agents.yaml", "squadron/agents.local.yaml"]
        for path in config_paths:
            if os.path.exists(path):
                with open(path, 'r') as f:
                    agent_config = yaml.safe_load(f) or {}
                break
        
        agents = []
        for name, agent in overseer.agents.items():
            # Get config for this agent if available
            agent_cfg = agent_config.get("agents", {}).get(name, {})
            
            agents.append({
                "name": name,
                "role": agent.role,
                "status": "busy" if agent.is_busy() else "idle",
                "task": agent._current_task[:100] if agent._current_task else None,
                "avatar": agent_cfg.get("avatar", f"https://robohash.org/{name}?set=set4"),
                "color": agent_cfg.get("color", "gray"),
                "history_count": len(agent.task_history)
            })
        
        return {"agents": agents}
    
    except Exception as e:
        console.print(f"[red]Error fetching agents: {e}[/red]")
        return {"agents": [], "error": str(e)}


@app.get("/agents/{agent_name}/history")
def get_agent_history(agent_name: str, limit: int = 10):
    """Get task history for a specific agent."""
    try:
        from squadron.swarm.overseer import overseer
        
        if agent_name not in overseer.agents:
            return {"error": f"Agent '{agent_name}' not found"}
        
        agent = overseer.agents[agent_name]
        history = agent.get_history(limit=limit)
        
        return {
            "agent": agent_name,
            "history": history
        }
    
    except Exception as e:
        return {"error": str(e)}


@app.get("/tasks")
def get_tasks():
    """Return current task queue and recent completions."""
    try:
        from squadron.swarm.overseer import overseer
        
        return {
            "queued": overseer.get_queue_status(),
            "recent_activity": overseer.get_activity_log(limit=20)
        }
    
    except Exception as e:
        return {"queued": [], "recent_activity": [], "error": str(e)}


@app.get("/activity")
async def activity_stream():
    """
    Server-Sent Events (SSE) endpoint for real-time activity streaming.
    Connect via EventSource in browser.
    """
    from squadron.services.event_bus import event_bus
    
    async def generate():
        try:
            async for event in event_bus.subscribe():
                yield f"data: {json.dumps(event)}\n\n"
        except asyncio.CancelledError:
            pass
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/activity/history")
def get_activity_history(limit: int = 50):
    """Get recent activity history (for initial dashboard load)."""
    try:
        from squadron.services.event_bus import event_bus
        return {"events": event_bus.get_history(limit=limit)}
    except Exception as e:
        return {"events": [], "error": str(e)}


@app.post("/command")
async def send_command(request: Request):
    """
    Send a command to the Squadron system.
    
    Body:
    {
        "command": str,          # The task/instruction
        "agent": str (optional), # Specific agent to route to
        "priority": int (optional)
    }
    """
    try:
        body = await request.json()
        command = body.get("command", "")
        target_agent = body.get("agent")
        priority = body.get("priority", 5)
        
        if not command:
            return {"error": "No command provided", "success": False}
        
        from squadron.swarm.overseer import overseer
        from squadron.services.event_bus import event_bus
        
        # Log the command
        event_bus.publish({
            "type": "command_received",
            "agent": "dashboard",
            "data": {"command": command[:100], "target": target_agent}
        })
        
        # Route or assign
        if target_agent and target_agent in overseer.agents:
            agent = overseer.agents[target_agent]
            result = agent.process_task(command)
            response_text = f"[{target_agent}]: {result['text']}"
        else:
            response_text = overseer.route(command, use_llm=True)
        
        return {
            "success": True,
            "response": response_text
        }
    
    except Exception as e:
        return {"error": str(e), "success": False}


@app.get("/missions")
def get_missions():
    """Get active and recent missions from the Wake Protocol."""
    try:
        from squadron.services.wake_protocol import wake_protocol
        
        return {
            "active": wake_protocol.get_active_missions(),
            "history": wake_protocol.get_mission_history(limit=20)
        }
    
    except Exception as e:
        return {"active": [], "history": [], "error": str(e)}


@app.post("/wake")
async def trigger_wake(request: Request):
    """
    Manually trigger the Wake Protocol.
    
    Body:
    {
        "summary": str,           # What needs to be done
        "type": str (optional),   # "manual" | "ticket"
        "ticket_id": str (optional)
    }
    """
    try:
        body = await request.json()
        summary = body.get("summary", "")
        source_type = body.get("type", "manual")
        ticket_id = body.get("ticket_id")
        
        if not summary:
            return {"error": "No summary provided", "success": False}
        
        from squadron.services.wake_protocol import trigger_wake
        result = trigger_wake(summary, source_type, ticket_id)
        
        return result
    
    except Exception as e:
        return {"error": str(e), "success": False}


# =============================================================================
# MEMORY API 🧠
# =============================================================================

@app.get("/memory/stats")
def get_memory_stats():
    """Get memory statistics for all agents."""
    try:
        from squadron.memory import memory_store
        
        stats = []
        for agent in ["Marcus", "Caleb", "Sentinel", "shared"]:
            summary = memory_store.get_agent_summary(agent)
            stats.append(summary)
        
        return {"agents": stats}
    except Exception as e:
        return {"error": str(e), "agents": []}


@app.post("/memory/save")
async def save_memory(request: Request):
    """Save a memory."""
    try:
        from squadron.memory import memory_store
        
        body = await request.json()
        text = body.get("text", "")
        agent = body.get("agent", "shared")
        memory_type = body.get("type", "general")
        
        mem_id = memory_store.remember(text, agent=agent, memory_type=memory_type)
        return {"success": True, "memory_id": mem_id}
    except Exception as e:
        return {"error": str(e), "success": False}


@app.post("/memory/recall")
async def recall_memory(request: Request):
    """Search memory for relevant information."""
    try:
        from squadron.memory import memory_store
        
        body = await request.json()
        query = body.get("query", "")
        agent = body.get("agent")
        n_results = body.get("limit", 5)
        
        memories = memory_store.recall(query, agent=agent, n_results=n_results)
        return {"memories": memories, "count": len(memories)}
    except Exception as e:
        return {"error": str(e), "memories": []}


# =============================================================================
# INTEGRATIONS API 🔌
# =============================================================================

@app.get("/integrations/status")
def get_integrations_status():
    """Get status of all configured integrations."""
    integrations = []
    
    # Check Slack
    slack_token = os.getenv("SLACK_BOT_TOKEN")
    integrations.append({
        "name": "Slack",
        "icon": "💬",
        "configured": bool(slack_token),
        "status": "connected" if slack_token else "not configured"
    })
    
    # Check Discord
    discord_webhook = os.getenv("DISCORD_WEBHOOK_URL")
    discord_token = os.getenv("DISCORD_BOT_TOKEN")
    integrations.append({
        "name": "Discord",
        "icon": "🎮",
        "configured": bool(discord_webhook or discord_token),
        "status": "connected" if (discord_webhook or discord_token) else "not configured"
    })
    
    # Check Jira
    jira_server = os.getenv("JIRA_SERVER")
    jira_token = os.getenv("JIRA_TOKEN")
    integrations.append({
        "name": "Jira",
        "icon": "📋",
        "configured": bool(jira_server and jira_token),
        "status": "connected" if (jira_server and jira_token) else "not configured"
    })
    
    # Check GitHub
    github_token = os.getenv("GITHUB_TOKEN")
    integrations.append({
        "name": "GitHub",
        "icon": "🐙",
        "configured": bool(github_token),
        "status": "connected" if github_token else "not configured"
    })
    
    # Check Linear
    linear_key = os.getenv("LINEAR_API_KEY")
    integrations.append({
        "name": "Linear",
        "icon": "📐",
        "configured": bool(linear_key),
        "status": "connected" if linear_key else "not configured"
    })
    
    return {"integrations": integrations}


@app.post("/integrations/slack/send")
async def send_slack_message(request: Request):
    """Send a message to Slack."""
    try:
        body = await request.json()
        message = body.get("message", "")
        channel = body.get("channel", "#general")
        agent = body.get("agent")
        
        if not message:
            return {"success": False, "error": "No message provided"}
        
        from squadron.skills.slack_bridge.tool import SlackTool
        from squadron.cli import load_agent_config
        
        username, avatar_url = None, None
        if agent:
            username, avatar_url = load_agent_config(agent)
        
        slack = SlackTool()
        slack.send_alert(channel, message, username=username, icon_url=avatar_url)
        
        return {"success": True, "channel": channel}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/discord/broadcast")
async def send_discord_broadcast(request: Request):
    """Broadcast a message to Discord."""
    try:
        body = await request.json()
        message = body.get("message", "")
        agent = body.get("agent")
        
        if not message:
            return {"success": False, "error": "No message provided"}
        
        from squadron.skills.discord_bridge.tool import DiscordTool
        from squadron.cli import load_agent_config
        
        username, avatar_url = None, None
        if agent:
            username, avatar_url = load_agent_config(agent)
        
        discord = DiscordTool()
        discord.broadcast(message, username=username, avatar_url=avatar_url)
        
        return {"success": True}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/jira/comment")
async def add_jira_comment(request: Request):
    """Add a comment to a Jira ticket."""
    try:
        body = await request.json()
        ticket_id = body.get("ticket_id", "")
        comment = body.get("comment", "")
        status = body.get("status")
        
        if not ticket_id or not comment:
            return {"success": False, "error": "ticket_id and comment required"}
        
        from squadron.skills.jira_bridge.tool import JiraTool
        
        jira = JiraTool()
        jira.update_ticket(ticket_id, comment, status)
        
        return {"success": True, "ticket": ticket_id}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/github/pr")
async def create_github_pr(request: Request):
    """Create a GitHub Pull Request."""
    try:
        body = await request.json()
        repo = body.get("repo", "")
        title = body.get("title", "")
        body_text = body.get("body", "")
        head = body.get("head", "")
        base = body.get("base", "main")
        
        if not repo or not title or not head:
            return {"success": False, "error": "repo, title, and head required"}
        
        from squadron.skills.github_bridge.tool import GitHubTool
        
        github = GitHubTool()
        result = github.create_pr(repo, title, body_text, head, base)
        
        return {"success": True, "result": result}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/github/issue")
async def create_github_issue(request: Request):
    """Create a GitHub Issue."""
    try:
        body = await request.json()
        repo = body.get("repo", "")
        title = body.get("title", "")
        body_text = body.get("body", "")
        
        if not repo or not title:
            return {"success": False, "error": "repo and title required"}
        
        from squadron.skills.github_bridge.tool import GitHubTool
        
        github = GitHubTool()
        result = github.create_issue(repo, title, body_text)
        
        return {"success": True, "result": result}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/linear/update")
async def update_linear_issue(request: Request):
    """Update a Linear issue."""
    try:
        body = await request.json()
        issue_key = body.get("issue_key", "")
        comment = body.get("comment", "")
        status = body.get("status")
        
        if not issue_key:
            return {"success": False, "error": "issue_key required"}
        
        from squadron.skills.linear_bridge.tool import LinearTool
        
        linear = LinearTool()
        linear.update_issue(issue_key, comment, status)
        
        return {"success": True, "issue": issue_key}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/integrations/report")
async def send_report(request: Request):
    """Send a unified report to multiple integrations (like squadron report)."""
    try:
        body = await request.json()
        message = body.get("message", "")
        channel = body.get("channel", "#general")
        ticket = body.get("ticket")
        linear = body.get("linear")
        status = body.get("status")
        agent = body.get("agent")
        
        if not message:
            return {"success": False, "error": "No message provided"}
        
        from squadron.cli import load_agent_config
        
        results = {"slack": None, "jira": None, "linear": None}
        
        # Resolve agent identity
        username, avatar_url = None, None
        if agent:
            username, avatar_url = load_agent_config(agent)
        
        # Send to Slack
        try:
            from squadron.skills.slack_bridge.tool import SlackTool
            slack = SlackTool()
            slack.send_alert(channel, message, username=username, icon_url=avatar_url)
            results["slack"] = "sent"
        except Exception as e:
            results["slack"] = f"error: {e}"
        
        # Update Jira
        if ticket:
            try:
                from squadron.skills.jira_bridge.tool import JiraTool
                jira = JiraTool()
                jira.update_ticket(ticket, message, status)
                results["jira"] = "updated"
            except Exception as e:
                results["jira"] = f"error: {e}"
        
        # Update Linear
        if linear:
            try:
                from squadron.skills.linear_bridge.tool import LinearTool
                linear_tool = LinearTool()
                linear_tool.update_issue(linear, message, status)
                results["linear"] = "updated"
            except Exception as e:
                results["linear"] = f"error: {e}"
        
        return {"success": True, "results": results}
    
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.get("/system/status")
def get_system_status():
    """Get overall system status for dashboard header."""
    try:
        from squadron.swarm.overseer import overseer
        from squadron.services.wake_protocol import wake_protocol
        
        active_count = sum(1 for a in overseer.agents.values() if a.is_busy())
        queue_count = len(overseer.task_queue)
        mission_count = len(wake_protocol.get_active_missions())
        
        return {
            "agents_online": len(overseer.agents),
            "agents_active": active_count,
            "tasks_queued": queue_count,
            "missions_active": mission_count,
            "status": "operational"
        }
    
    except Exception as e:
        return {"status": "error", "error": str(e)}


def start_server(host: str = "127.0.0.1", port: int = 8000):
    """Launch the Uvicorn server."""
    console.print(f"[bold green]🚀 Squadron Control Plane online at http://{host}:{port}[/bold green]")
    console.print(f"[dim]   Dashboard: http://localhost:3000[/dim]")
    console.print(f"[dim]   API Docs: http://{host}:{port}/docs[/dim]")
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    start_server()
