"""
Squadron Overseer v3.0 - The Autonomous Daemon 👀
Watches Jira/Linear for new tickets and auto-wakes agents.
Also monitors comments for @agent mentions.
"""

import time
import os
import sys
import threading
from datetime import datetime
from dotenv import load_dotenv
from rich.console import Console

console = Console()


class OverseerDaemon:
    """
    The Overseer Daemon watches for:
    1. New tickets assigned to agents
    2. Comments with @agent mentions
    
    When detected, it triggers the Wake Protocol to execute autonomously.
    """
    
    def __init__(
        self,
        check_interval: int = 30,
        auto_wake: bool = True,
        watch_comments: bool = True
    ):
        self.check_interval = check_interval
        self.auto_wake = auto_wake
        self.watch_comments = watch_comments
        
        self.running = False
        self.seen_tickets = set()
        self.seen_comments = {}  # ticket_id -> set of comment ids
        
        # Agent name to route mapping
        self.agent_keywords = {
            "Marcus": ["marcus", "strategy", "planning", "research", "design"],
            "Caleb": ["caleb", "development", "code", "implement", "build"],
            "Sentinel": ["sentinel", "security", "audit", "review", "compliance"]
        }
        
        load_dotenv()
    
    def start(self):
        """Start the overseer daemon."""
        self.running = True
        
        console.print("=" * 60)
        console.print("[bold cyan]👀 SQUADRON OVERSEER v3.0[/bold cyan]")
        console.print("=" * 60)
        console.print(f"   Auto-Wake: {'[green]ENABLED[/green]' if self.auto_wake else '[yellow]DISABLED[/yellow]'}")
        console.print(f"   Comment Watch: {'[green]ENABLED[/green]' if self.watch_comments else '[yellow]DISABLED[/yellow]'}")
        console.print(f"   Check Interval: {self.check_interval}s")
        console.print("=" * 60)
        console.print("")
        
        # Start watching in a loop
        while self.running:
            try:
                # Check Jira
                self._check_jira()
                
                # Check Linear
                self._check_linear()
                
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                console.print("\n[yellow]👋 Overseer shutting down...[/yellow]")
                break
            except Exception as e:
                console.print(f"[red]⚠️ Overseer error: {e}[/red]")
                time.sleep(self.check_interval)
    
    def stop(self):
        """Stop the overseer daemon."""
        self.running = False
    
    def _check_jira(self):
        """Check Jira for new tickets and comments."""
        server = os.getenv("JIRA_SERVER")
        email = os.getenv("JIRA_EMAIL")
        token = os.getenv("JIRA_TOKEN")
        
        if not all([server, email, token]):
            return
        
        try:
            from jira import JIRA
            jira = JIRA(server=server, basic_auth=(email, token))
            
            # Find new "To Do" tickets
            jql = 'status = "To Do" AND assignee = currentUser()'
            issues = jira.search_issues(jql)
            
            for issue in issues:
                if issue.key not in self.seen_tickets:
                    self.seen_tickets.add(issue.key)
                    self._handle_new_ticket(
                        ticket_id=issue.key,
                        summary=issue.fields.summary,
                        description=getattr(issue.fields, 'description', '') or '',
                        source="jira"
                    )
                
                # Check comments for @mentions
                if self.watch_comments:
                    self._check_jira_comments(jira, issue)
        
        except Exception as e:
            console.print(f"[dim]Jira check failed: {e}[/dim]")
    
    def _check_jira_comments(self, jira, issue):
        """Check a Jira issue for new comments with @mentions."""
        try:
            comments = jira.comments(issue)
            
            if issue.key not in self.seen_comments:
                self.seen_comments[issue.key] = set()
            
            for comment in comments:
                if comment.id not in self.seen_comments[issue.key]:
                    self.seen_comments[issue.key].add(comment.id)
                    
                    # Skip agent comments
                    if self._is_agent_comment(comment.body):
                        continue
                    
                    # Check for @mentions
                    self._check_for_mentions(
                        ticket_id=issue.key,
                        text=comment.body,
                        author=comment.author.displayName,
                        source="jira"
                    )
        
        except Exception as e:
            console.print(f"[dim]Jira comment check failed: {e}[/dim]")
    
    def _check_linear(self):
        """Check Linear for new issues and comments."""
        api_key = os.getenv("LINEAR_API_KEY")
        if not api_key:
            return
        
        try:
            import requests
            
            # Query for assigned issues
            query = """
            query {
                viewer {
                    assignedIssues(
                        filter: { state: { name: { eq: "Todo" } } }
                    ) {
                        nodes {
                            id
                            identifier
                            title
                            description
                            comments {
                                nodes {
                                    id
                                    body
                                    user {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
            """
            
            response = requests.post(
                "https://api.linear.app/graphql",
                json={"query": query},
                headers={"Authorization": api_key, "Content-Type": "application/json"}
            )
            
            data = response.json()
            
            if "data" not in data or not data["data"]["viewer"]:
                return
            
            for issue in data["data"]["viewer"]["assignedIssues"]["nodes"]:
                ticket_id = issue["identifier"]
                
                if ticket_id not in self.seen_tickets:
                    self.seen_tickets.add(ticket_id)
                    self._handle_new_ticket(
                        ticket_id=ticket_id,
                        summary=issue["title"],
                        description=issue.get("description", "") or "",
                        source="linear"
                    )
                
                # Check comments
                if self.watch_comments:
                    self._check_linear_comments(issue)
        
        except Exception as e:
            console.print(f"[dim]Linear check failed: {e}[/dim]")
    
    def _check_linear_comments(self, issue):
        """Check Linear issue comments for @mentions."""
        ticket_id = issue["identifier"]
        
        if ticket_id not in self.seen_comments:
            self.seen_comments[ticket_id] = set()
        
        for comment in issue.get("comments", {}).get("nodes", []):
            if comment["id"] not in self.seen_comments[ticket_id]:
                self.seen_comments[ticket_id].add(comment["id"])
                
                # Skip agent comments
                if self._is_agent_comment(comment["body"]):
                    continue
                
                # Check for @mentions
                author = comment.get("user", {}).get("name", "Unknown")
                self._check_for_mentions(
                    ticket_id=ticket_id,
                    text=comment["body"],
                    author=author,
                    source="linear"
                )
    
    def _handle_new_ticket(self, ticket_id: str, summary: str, description: str, source: str):
        """Handle a newly detected ticket."""
        console.print(f"\n[bold green]🔔 NEW TICKET DETECTED[/bold green]")
        console.print(f"   Source: {source.upper()}")
        console.print(f"   Ticket: {ticket_id}")
        console.print(f"   Summary: {summary}")
        
        if self.auto_wake:
            # Determine which agent should handle this
            agent = self._route_ticket(summary, description)
            console.print(f"   [cyan]⚡ Auto-waking {agent}...[/cyan]")
            
            self._trigger_wake(
                task=f"{summary}\n\n{description}",
                ticket_id=ticket_id,
                source=source,
                agent=agent
            )
        else:
            console.print("   [dim](Auto-wake disabled)[/dim]")
    
    def _check_for_mentions(self, ticket_id: str, text: str, author: str, source: str):
        """Check text for @agent mentions and trigger wakes."""
        from squadron.services.tag_parser import tag_parser
        
        mentions = tag_parser.parse_mentions(text)
        
        if not mentions:
            return
        
        console.print(f"\n[bold cyan]💬 @MENTION DETECTED[/bold cyan]")
        console.print(f"   Ticket: {ticket_id}")
        console.print(f"   Author: {author}")
        console.print(f"   Mentioned: {mentions}")
        
        # Trigger each mentioned agent
        for agent in mentions:
            task = tag_parser.extract_task(text, agent)
            console.print(f"   [cyan]⚡ Waking {agent}: {task[:50]}...[/cyan]")
            
            self._trigger_wake(
                task=task,
                ticket_id=ticket_id,
                source=source,
                agent=agent
            )
    
    def _trigger_wake(self, task: str, ticket_id: str, source: str, agent: str = None):
        """Trigger the Wake Protocol to execute a task."""
        try:
            from squadron.services.wake_protocol import trigger_wake
            
            result = trigger_wake(
                summary=task,
                source_type=source,
                ticket_id=ticket_id,
                target_agent=agent
            )
            
            if result.get("success"):
                console.print(f"   [green]✅ Wake completed: {result.get('summary', 'Done')[:50]}...[/green]")
                
                # Auto-reply to ticket
                self._reply_to_ticket(ticket_id, result, source, agent)
            else:
                console.print(f"   [red]❌ Wake failed: {result.get('error', 'Unknown')}[/red]")
        
        except Exception as e:
            console.print(f"   [red]❌ Wake trigger failed: {e}[/red]")
    
    def _reply_to_ticket(self, ticket_id: str, result: dict, source: str, agent: str):
        """Reply to the ticket with the result."""
        from squadron.services.tag_parser import tag_parser
        
        agent_name = agent or "Squadron"
        summary = result.get("summary", "Task completed")
        
        message = tag_parser.format_agent_comment(agent_name, summary)
        
        try:
            if source == "jira":
                self._post_jira_comment(ticket_id, message)
            elif source == "linear":
                self._post_linear_comment(ticket_id, message)
            
            console.print(f"   [dim]📝 Posted reply to {ticket_id}[/dim]")
        
        except Exception as e:
            console.print(f"   [dim]Failed to post reply: {e}[/dim]")
    
    def _post_jira_comment(self, ticket_id: str, message: str):
        """Post a comment to a Jira ticket."""
        from jira import JIRA
        
        server = os.getenv("JIRA_SERVER")
        email = os.getenv("JIRA_EMAIL")
        token = os.getenv("JIRA_TOKEN")
        
        if not all([server, email, token]):
            return
        
        jira = JIRA(server=server, basic_auth=(email, token))
        jira.add_comment(ticket_id, message)
    
    def _post_linear_comment(self, ticket_id: str, message: str):
        """Post a comment to a Linear issue."""
        import requests
        
        api_key = os.getenv("LINEAR_API_KEY")
        if not api_key:
            return
        
        # First get the issue ID from the identifier
        query = """
        query GetIssue($identifier: String!) {
            issue(id: $identifier) {
                id
            }
        }
        """
        
        response = requests.post(
            "https://api.linear.app/graphql",
            json={"query": query, "variables": {"identifier": ticket_id}},
            headers={"Authorization": api_key, "Content-Type": "application/json"}
        )
        
        data = response.json()
        if "data" not in data or not data["data"]["issue"]:
            return
        
        issue_id = data["data"]["issue"]["id"]
        
        # Create comment
        mutation = """
        mutation CreateComment($issueId: String!, $body: String!) {
            commentCreate(input: { issueId: $issueId, body: $body }) {
                success
            }
        }
        """
        
        requests.post(
            "https://api.linear.app/graphql",
            json={"query": mutation, "variables": {"issueId": issue_id, "body": message}},
            headers={"Authorization": api_key, "Content-Type": "application/json"}
        )
    
    def _route_ticket(self, summary: str, description: str) -> str:
        """Determine which agent should handle a ticket based on keywords."""
        text = f"{summary} {description}".lower()
        
        for agent, keywords in self.agent_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    return agent
        
        # Default to Marcus for strategic routing
        return "Marcus"
    
    def _is_agent_comment(self, text: str) -> bool:
        """Check if a comment was made by one of our agents."""
        if not text:
            return False
        agent_prefixes = ["[🤖 Marcus]", "[🤖 Caleb]", "[🤖 Sentinel]"]
        return any(text.startswith(prefix) for prefix in agent_prefixes)


# Legacy function for backward compatibility
def watch_tickets(check_interval=30, exec_command=None):
    """
    Watch Jira for new tickets assigned to the current user.
    
    Args:
        check_interval: Seconds between checks (default: 30)
        exec_command: DEPRECATED - now uses Wake Protocol
    """
    daemon = OverseerDaemon(
        check_interval=check_interval,
        auto_wake=True,
        watch_comments=True
    )
    daemon.start()


def main():
    """Entry point for the overseer command."""
    watch_tickets()


if __name__ == "__main__":
    main()
