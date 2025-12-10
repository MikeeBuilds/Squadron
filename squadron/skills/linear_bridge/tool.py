import os
import requests
import json


class LinearTool:
    """Tool for interacting with Linear (linear.app) via GraphQL API."""

    def __init__(self):
        self.api_key = os.getenv("LINEAR_API_KEY")
        self.api_url = "https://api.linear.app/graphql"

    def _query(self, query, variables=None):
        """Helper to send GraphQL queries."""
        if not self.api_key:
            return None

        headers = {
            "Content-Type": "application/json",
            "Authorization": self.api_key
        }
        
        try:
            response = requests.post(
                self.api_url, 
                json={"query": query, "variables": variables}, 
                headers=headers
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Linear API Error: {e}")
            return None

    def get_issue_id(self, issue_key):
        """Find the internal UUID for a human-readable issue key (e.g., LIN-123)."""
        query = """
        query Issue($key: String!) {
            issue(id: $key) {
                id
                identifier
                title
            }
        }
        """
        result = self._query(query, {"key": issue_key})
        
        if result and result.get("data") and result["data"].get("issue"):
            return result["data"]["issue"]["id"]
        
        print(f"⚠️ Linear: Could not find issue {issue_key} (or API error occurred)")
        if result and result.get("errors"):
             print(f"   API Error: {result['errors'][0].get('message')}")
        return None

    def update_issue(self, issue_key: str, comment: str = None, status: str = None):
        """
        Update a Linear issue with a real comment.
        """
        if not self.api_key:
            print("❌ Linear Error: LINEAR_API_KEY not found in .env")
            return

        print(f"🔄 Linear: Connecting to {issue_key}...")

        # 1. Get the real internal ID (UUID)
        issue_id = self.get_issue_id(issue_key)
        if not issue_id:
            return

        # 2. Add Comment (if provided)
        if comment:
            mutation = """
            mutation CommentCreate($issueId: String!, $body: String!) {
                commentCreate(input: {issueId: $issueId, body: $body}) {
                    success
                    comment {
                        id
                        body
                    }
                }
            }
            """
            result = self._query(mutation, {"issueId": issue_id, "body": comment})
            
            if result and "data" in result and result["data"].get("commentCreate", {}).get("success"):
                print(f"✅ Linear: Comment posted to {issue_key}")
            else:
                print(f"❌ Linear: Failed to post comment. {result}")

        # 3. Update Status (Not implemented in this version due to workflow complexity)
        if status:
             print(f"⚠️ Linear Status update skipped (Requires workflow state ID lookup). Comment was posted.")
