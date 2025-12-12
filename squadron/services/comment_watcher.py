"""
Comment Watcher Service 👀
Watches for new comments on Jira/Linear tickets and triggers agents when @mentioned.
"""
import os
import time
import threading
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Callable
from rich.console import Console

console = Console()


class CommentWatcher:
    """
    Watch for new comments on tickets and trigger agents when @mentioned.
    Supports both Jira and Linear.
    """
    
    def __init__(self):
        self.watching = False
        self.watched_tickets: Dict[str, datetime] = {}  # ticket_id -> last_checked
        self.callbacks: List[Callable] = []
        self._thread: Optional[threading.Thread] = None
        self.poll_interval = 30  # seconds
    
    def register_callback(self, callback: Callable[[str, str, str], None]):
        """
        Register a callback for new comments.
        Callback signature: (ticket_id, comment_text, author) -> None
        """
        self.callbacks.append(callback)
    
    def watch_ticket(self, ticket_id: str):
        """Add a ticket to the watch list."""
        if ticket_id not in self.watched_tickets:
            self.watched_tickets[ticket_id] = datetime.now()
            console.print(f"[dim]👀 Watching ticket: {ticket_id}[/dim]")
    
    def unwatch_ticket(self, ticket_id: str):
        """Remove a ticket from the watch list."""
        if ticket_id in self.watched_tickets:
            del self.watched_tickets[ticket_id]
    
    def start(self):
        """Start the comment watcher in a background thread."""
        if self.watching:
            return
        
        self.watching = True
        self._thread = threading.Thread(target=self._watch_loop, daemon=True)
        self._thread.start()
        console.print("[green]👀 Comment Watcher started[/green]")
    
    def stop(self):
        """Stop the comment watcher."""
        self.watching = False
        if self._thread:
            self._thread.join(timeout=5)
        console.print("[yellow]👀 Comment Watcher stopped[/yellow]")
    
    def _watch_loop(self):
        """Main watch loop - polls tickets for new comments."""
        while self.watching:
            try:
                for ticket_id, last_checked in list(self.watched_tickets.items()):
                    new_comments = self._get_new_comments(ticket_id, last_checked)
                    
                    for comment in new_comments:
                        self._process_comment(ticket_id, comment)
                    
                    # Update last checked time
                    self.watched_tickets[ticket_id] = datetime.now()
                
            except Exception as e:
                console.print(f"[red]Comment watcher error: {e}[/red]")
            
            time.sleep(self.poll_interval)
    
    def _get_new_comments(self, ticket_id: str, since: datetime) -> List[dict]:
        """
        Get new comments from a ticket since the given time.
        Tries Jira first, then Linear.
        """
        comments = []
        
        # Try Jira
        if ticket_id.startswith(('KAN-', 'PROJ-')) or '-' in ticket_id:
            comments = self._get_jira_comments(ticket_id, since)
        
        # Try Linear if no Jira comments
        if not comments:
            comments = self._get_linear_comments(ticket_id, since)
        
        return comments
    
    def _get_jira_comments(self, ticket_id: str, since: datetime) -> List[dict]:
        """Fetch new comments from Jira."""
        try:
            from jira import JIRA
            
            server = os.getenv("JIRA_SERVER")
            email = os.getenv("JIRA_EMAIL")
            token = os.getenv("JIRA_TOKEN")
            
            if not all([server, email, token]):
                return []
            
            jira = JIRA(server=server, basic_auth=(email, token))
            issue = jira.issue(ticket_id, expand='changelog')
            
            new_comments = []
            for comment in jira.comments(issue):
                # Parse comment created time
                created = datetime.fromisoformat(comment.created.replace('Z', '+00:00'))
                
                # Check if it's after our last check
                if created.replace(tzinfo=None) > since:
                    # Skip comments from our agents
                    if not self._is_agent_comment(comment.body):
                        new_comments.append({
                            "id": comment.id,
                            "body": comment.body,
                            "author": comment.author.displayName,
                            "created": created
                        })
            
            return new_comments
            
        except Exception as e:
            console.print(f"[dim]Jira comment fetch error: {e}[/dim]")
            return []
    
    def _get_linear_comments(self, ticket_id: str, since: datetime) -> List[dict]:
        """Fetch new comments from Linear."""
        try:
            import requests
            
            api_key = os.getenv("LINEAR_API_KEY")
            if not api_key:
                return []
            
            # GraphQL query for issue comments
            query = """
            query GetComments($issueId: String!) {
                issue(id: $issueId) {
                    comments {
                        nodes {
                            id
                            body
                            user {
                                name
                            }
                            createdAt
                        }
                    }
                }
            }
            """
            
            response = requests.post(
                "https://api.linear.app/graphql",
                json={"query": query, "variables": {"issueId": ticket_id}},
                headers={"Authorization": api_key, "Content-Type": "application/json"}
            )
            
            data = response.json()
            
            if "data" not in data or not data["data"]["issue"]:
                return []
            
            new_comments = []
            for comment in data["data"]["issue"]["comments"]["nodes"]:
                created = datetime.fromisoformat(comment["createdAt"].replace('Z', '+00:00'))
                
                if created.replace(tzinfo=None) > since:
                    if not self._is_agent_comment(comment["body"]):
                        new_comments.append({
                            "id": comment["id"],
                            "body": comment["body"],
                            "author": comment["user"]["name"] if comment["user"] else "Unknown",
                            "created": created
                        })
            
            return new_comments
            
        except Exception as e:
            console.print(f"[dim]Linear comment fetch error: {e}[/dim]")
            return []
    
    def _is_agent_comment(self, text: str) -> bool:
        """Check if a comment was made by one of our agents."""
        agent_prefixes = ["[🤖 Marcus]", "[🤖 Caleb]", "[🤖 Sentinel]"]
        return any(text.startswith(prefix) for prefix in agent_prefixes)
    
    def _process_comment(self, ticket_id: str, comment: dict):
        """Process a new comment - check for @mentions and trigger callbacks."""
        from squadron.services.tag_parser import tag_parser
        
        body = comment["body"]
        author = comment["author"]
        
        # Check for agent mentions
        mentions = tag_parser.parse_mentions(body)
        
        if mentions:
            console.print(f"[cyan]💬 New comment on {ticket_id} mentions: {mentions}[/cyan]")
            
            # Trigger callbacks
            for callback in self.callbacks:
                try:
                    callback(ticket_id, body, author)
                except Exception as e:
                    console.print(f"[red]Callback error: {e}[/red]")


# Singleton instance
comment_watcher = CommentWatcher()
