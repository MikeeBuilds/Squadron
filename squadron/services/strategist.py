"""
The Strategist ♟️
Proactive mission generator for Squadron.
Polls external systems (Jira, GitHub) for new work and triggers the Wake Protocol.
"""
import os
import json
import logging
import time
from datetime import datetime

from squadron.services.wake_protocol import wake_protocol
from squadron.skills.jira_bridge.tool import JiraTool
from squadron.skills.github_bridge.tool import GitHubTool

logger = logging.getLogger('Strategist')

STATE_FILE = ".squadron/state/strategist.json"

class Strategist:
    def __init__(self):
        self.processed_ids = set()
        self._load_state()
        self._github_warned = False
        
        # Initialize tools
        self.jira = JiraTool()
        self.github = GitHubTool()
        
    def _load_state(self):
        """Load processed IDs from disk."""
        if os.path.exists(STATE_FILE):
            try:
                with open(STATE_FILE, 'r') as f:
                    data = json.load(f)
                    self.processed_ids = set(data.get("processed_ids", []))
            except Exception as e:
                logger.warning(f"Failed to load Strategist state: {e}")
                self.processed_ids = set()
    
    def _save_state(self):
        """Save processed IDs to disk."""
        try:
            os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
            with open(STATE_FILE, 'w') as f:
                json.dump({
                    "processed_ids": list(self.processed_ids),
                    "last_updated": datetime.now().isoformat()
                }, f)
        except Exception as e:
            logger.error(f"Failed to save Strategist state: {e}")

    def run_cycle(self):
        """Check all sources for new missions."""
        logger.info("♟️ Strategist scanning for new objectives...")
        
        new_missions = 0
        new_missions += self._check_jira()
        new_missions += self._check_github()
        
        if new_missions > 0:
            logger.info(f"♟️ Strategist deployed {new_missions} new missions.")
            self._save_state()
        else:
            logger.info("♟️ No new objectives found.")

    def _check_jira(self) -> int:
        """Check for assigned Jira tickets."""
        count = 0
        issues = self.jira.get_assigned_issues()
        
        for issue in issues:
            key = issue["key"]
            if key in self.processed_ids:
                continue
            
            logger.info(f"♟️ Found new Jira Ticket: {key}")
            
            # Trigger Wake Protocol
            wake_protocol.trigger({
                "type": "ticket",
                "id": key,
                "summary": f"{issue['summary']}\n\n{issue['description']}",
                "priority": 5, # Default
                "source_link": issue["link"]
            })
            
            self.processed_ids.add(key)
            count += 1
            
        return count

    def _check_github(self) -> int:
        """Check for GitHub issues labeled 'squadron'."""
        if not os.getenv("GITHUB_REPO"):
            if not self._github_warned:
                logger.warning("♟️ GitHub repo not configured (GITHUB_REPO), skipping check.")
                self._github_warned = True
            return 0
            
        count = 0
        # Check default repo (from env) or skip
        issues = self.github.get_issues(labels=["squadron"])
        
        for issue in issues:
            uid = f"gh-{issue['number']}"
            if uid in self.processed_ids:
                continue
            
            logger.info(f"♟️ Found new GitHub Issue: #{issue['number']}")
            
            repo_name = os.getenv("GITHUB_REPO")
            token = os.getenv("GITHUB_TOKEN")
            
            # Construct Authenticated URL for agents
            if token and token.startswith("ghp_"):
                repo_url = f"https://oauth2:{token}@github.com/{repo_name}.git"
            else:
                repo_url = f"https://github.com/{repo_name}.git"
            
            # Truncate title for short summary
            summary_short = issue["title"][:50]
            
            # Trigger Wake Protocol
            wake_protocol.trigger({
                "type": "ticket", # Treat as ticket for reporting purposes
                "id": uid,
                "summary": f"GitHub Issue #{issue['number']} in {repo_name}: {issue['title']}\n\n{issue['body']}",
                "priority": 5,
                "source_link": issue["url"],
                "metadata": {
                    "repo_name": repo_name,
                    "repo_url": repo_url,
                    "issue_number": issue["number"],
                    "summary_short": summary_short,
                    "is_external_repo": True
                }
            })
            
            self.processed_ids.add(uid)
            count += 1
            
        return count

# Singleton
strategist = Strategist()
