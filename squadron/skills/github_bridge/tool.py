import os
from github import Github


class GitHubTool:
    """Tool for interacting with GitHub - creating PRs, managing issues."""

    def __init__(self):
        self.token = os.getenv("GITHUB_TOKEN")
        self.client = None

        if self.token:
            try:
                self.client = Github(self.token)
            except Exception as e:
                print(f"❌ GitHub Connection Failed: {e}")

    def create_pr(self, repo_name, title, body, head_branch, base_branch="main"):
        """
        Create a Pull Request.
        
        Args:
            repo_name: Full repo name (e.g., "MikeeBuilds/squadron")
            title: PR title
            body: PR description
            head_branch: Branch with changes
            base_branch: Target branch (default: main)
        
        Returns:
            PR URL if successful
        """
        if not self.client:
            print("⚠️ GitHub not configured. Skipping PR creation.")
            return None

        try:
            repo = self.client.get_repo(repo_name)
            pr = repo.create_pull(
                title=title,
                body=body,
                head=head_branch,
                base=base_branch
            )
            print(f"✅ GitHub: PR created - {pr.html_url}")
            return pr.html_url
        except Exception as e:
            print(f"❌ GitHub Error: {e}")
            return None

    def create_issue(self, repo_name, title, body, labels=None):
        """
        Create a GitHub Issue.
        
        Args:
            repo_name: Full repo name
            title: Issue title
            body: Issue description
            labels: List of label names
        
        Returns:
            Issue URL if successful
        """
        if not self.client:
            print("⚠️ GitHub not configured. Skipping issue creation.")
            return None

        try:
            repo = self.client.get_repo(repo_name)
            issue = repo.create_issue(
                title=title,
                body=body,
                labels=labels or []
            )
            print(f"✅ GitHub: Issue created - {issue.html_url}")
            return issue.html_url
        except Exception as e:
            print(f"❌ GitHub Error: {e}")
            return None
