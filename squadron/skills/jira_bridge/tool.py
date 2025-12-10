import os
from jira import JIRA

class JiraTool:
    def __init__(self):
        self.server = os.getenv("JIRA_SERVER")
        self.email = os.getenv("JIRA_EMAIL")
        self.token = os.getenv("JIRA_TOKEN")
        self.jira = None

        if self.server and self.email and self.token:
            try:
                self.jira = JIRA(
                    server=self.server,
                    basic_auth=(self.email, self.token)
                )
            except Exception as e:
                print(f"❌ Jira Connection Failed: {e}")

    def update_ticket(self, ticket_id, comment, status=None):
        """Adds a comment and optionally moves status"""
        if not self.jira:
            print("⚠️ Jira not configured. Skipping ticket update.")
            return

        try:
            # 1. Add Comment
            issue = self.jira.issue(ticket_id)
            self.jira.add_comment(issue, f"🤖 Agent Update: {comment}")
            print(f"✅ Jira: Comment added to {ticket_id}")

            # 2. Transition Status (Optional)
            if status:
                # Simple transition logic - loops through available transitions
                transitions = self.jira.transitions(issue)
                for t in transitions:
                    if t['name'].lower() == status.lower():
                        self.jira.transition_issue(issue, t['id'])
                        print(f"✅ Jira: {ticket_id} moved to '{status}'")
                        return
                print(f"⚠️ Jira: Status '{status}' not found for this ticket.")

        except Exception as e:
            print(f"❌ Jira Error: {e}")
