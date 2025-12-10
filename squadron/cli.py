"""
Squadron CLI - The Main Router
Command-line interface for AI agents to communicate with the team.
"""

import argparse
import os
from dotenv import load_dotenv

# Import Skills
from squadron.skills.slack_bridge.tool import SlackTool
from squadron.skills.jira_bridge.tool import JiraTool
from squadron.skills.discord_bridge.tool import DiscordTool
from squadron.skills.github_bridge.tool import GitHubTool
from squadron.skills.linear_bridge.tool import LinearTool
from squadron.knowledge.reader import KnowledgeBase


import yaml

def load_agent_config(agent_name):
    """Load agent details from agents.yaml if it exists."""
    config_path = os.path.join(os.getcwd(), "squadron", "agents.yaml")
    if not os.path.exists(config_path):
        return None, None
        
    try:
        with open(config_path, "r") as f:
            data = yaml.safe_load(f)
            if data and "agents" in data and agent_name.lower() in data["agents"]:
                agent = data["agents"][agent_name.lower()]
                return agent.get("name"), agent.get("avatar_url")
    except Exception as e:
        print(f"⚠️ Error loading agents.yaml: {e}")
    
    return None, None


def main():
    # 1. Load Environment Variables
    load_dotenv()

    # 2. Setup Arguments
    parser = argparse.ArgumentParser(
        description="Squadron: The Operating System for Autonomous Software Teams"
    )
    subparsers = parser.add_subparsers(dest="command")

    # Command: 'report' - Main communication command
    report_parser = subparsers.add_parser("report", help="Report status to Slack, Jira & Linear")
    report_parser.add_argument("--msg", required=True, help="Message to send")
    report_parser.add_argument("--ticket", help="Jira Ticket ID (e.g. PROJ-101)")
    report_parser.add_argument("--linear", help="Linear Issue Key (e.g. PRO-123)")
    report_parser.add_argument("--channel", default="#general", help="Slack Channel")
    report_parser.add_argument("--status", help="New Status (e.g. 'Done')")
    report_parser.add_argument("--agent", help="Agent identity (e.g. 'Marcus')")

    # Command: 'broadcast' - Discord community updates
    broadcast_parser = subparsers.add_parser("broadcast", help="Broadcast to Discord")
    broadcast_parser.add_argument("--msg", required=True, help="Message to broadcast")
    broadcast_parser.add_argument("--agent", help="Agent identity (e.g. 'Marcus')")

    # Command: 'ask' - Query Knowledge Base
    ask_parser = subparsers.add_parser("ask", help="Query the team knowledge base")
    ask_parser.add_argument("query", help="What do you want to know?")

    # Command: 'pr' - Create GitHub Pull Request
    pr_parser = subparsers.add_parser("pr", help="Create a GitHub Pull Request")
    pr_parser.add_argument("--repo", required=True, help="Repository (e.g. user/repo)")
    pr_parser.add_argument("--title", required=True, help="PR title")
    pr_parser.add_argument("--body", default="", help="PR description")
    pr_parser.add_argument("--head", required=True, help="Head branch (with changes)")
    pr_parser.add_argument("--base", default="main", help="Base branch (target)")

    # Command: 'issue' - Create GitHub Issue
    issue_parser = subparsers.add_parser("issue", help="Create a GitHub Issue")
    issue_parser.add_argument("--repo", required=True, help="Repository (e.g. user/repo)")
    issue_parser.add_argument("--title", required=True, help="Issue title")
    issue_parser.add_argument("--body", default="", help="Issue description")
    
    # Command: 'overseer' - Start the background watcher
    overseer_parser = subparsers.add_parser("overseer", help="Start Jira ticket watcher")
    overseer_parser.add_argument("--interval", type=int, default=30, help="Check interval (seconds)")
    overseer_parser.add_argument("--exec", help="Command to run when ticket found (use {key} {summary})")

    # Command: 'listen' - Start the Slack listener
    listen_parser = subparsers.add_parser("listen", help="Start Slack listener (The Ears)")

    args = parser.parse_args()

    # 3. Execution Logic
    if args.command == "report":
        handle_report(args)
    elif args.command == "broadcast":
        handle_broadcast(args)
    elif args.command == "ask":
        handle_ask(args)
    elif args.command == "pr":
        handle_pr(args)
    elif args.command == "issue":
        handle_issue(args)
    elif args.command == "overseer":
        handle_overseer(args)
    elif args.command == "listen":
        handle_listen(args)
    else:
        parser.print_help()



def handle_report(args):
    """Handle the 'report' command - send updates to all integrated tools."""
    print("🚀 Squadron Reporting...")
    
    # Resolve Agent Identity
    username, avatar_url = None, None
    if args.agent:
        username, avatar_url = load_agent_config(args.agent)
        if username:
            print(f"👤 Posting as: {username}")

    # A. Fire Slack
    slack = SlackTool()
    slack.send_alert(args.channel, args.msg, username=username, icon_url=avatar_url)

    # B. Fire Jira (if ticket provided)
    if args.ticket:
        jira = JiraTool()
        jira.update_ticket(args.ticket, args.msg, args.status)
        
    # C. Fire Linear (if issue provided)
    if args.linear:
        linear = LinearTool()
        linear.update_issue(args.linear, args.msg, args.status)


def handle_broadcast(args):
    """Handle the 'broadcast' command - send to Discord."""
    print("📢 Squadron Broadcasting...")
    
    # Resolve Agent Identity
    username, avatar_url = None, None
    if args.agent:
        username, avatar_url = load_agent_config(args.agent)
        if username:
            print(f"👤 Broadcasting as: {username}")
            
    discord = DiscordTool()
    discord.broadcast(args.msg, username=username, avatar_url=avatar_url)


def handle_ask(args):
    """Handle the 'ask' command - query knowledge base."""
    print(f"🧠 Asking the Knowledge Base: '{args.query}'")
    kb = KnowledgeBase()
    results = kb.search(args.query)
    
    if results:
        print(f"\nFound {len(results)} matches:")
        for res in results:
            print(f"\n--- {res['source']} (Line {res['line']}) ---")
            print(res['snippet'].strip())
    else:
        print("❌ No matches found in knowledge base.")


def handle_pr(args):
    """Handle the 'pr' command - create GitHub PR."""
    print("🐙 Creating Pull Request...")
    github = GitHubTool()
    github.create_pr(
        repo_name=args.repo,
        title=args.title,
        body=args.body,
        head_branch=args.head,
        base_branch=args.base
    )


def handle_issue(args):
    """Handle the 'issue' command - create GitHub Issue."""
    print("🐛 Creating Issue...")
    github = GitHubTool()
    github.create_issue(
        repo_name=args.repo,
        title=args.title,
        body=args.body
    )


def handle_overseer(args):
    """Handle the 'overseer' command - start Jira watcher."""
    from squadron.overseer import watch_tickets
    watch_tickets(check_interval=args.interval, exec_command=args.exec)


def handle_listen(args):
    """Handle the 'listen' command - start Slack listener."""
    from squadron.listener import start_listening
    start_listening()


if __name__ == "__main__":
    main()
