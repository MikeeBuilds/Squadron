"""
Squadron Overseer - The Background Daemon
Watches Jira for new tickets and wakes up agents when work is assigned.
"""

import time
import os
import sys
from dotenv import load_dotenv

try:
    from jira import JIRA
except ImportError:
    print("❌ Error: 'jira' package not installed. Run: pip install jira")
    sys.exit(1)


def watch_tickets(check_interval=30):
    """
    Watch Jira for new tickets assigned to the current user.
    
    Args:
        check_interval: Seconds between checks (default: 30)
    """
    # Load environment variables
    load_dotenv()

    server = os.getenv("JIRA_SERVER")
    email = os.getenv("JIRA_EMAIL")
    token = os.getenv("JIRA_TOKEN")

    if not all([server, email, token]):
        print("❌ Error: Missing Jira credentials in .env")
        print("   Required: JIRA_SERVER, JIRA_EMAIL, JIRA_TOKEN")
        return

    try:
        jira = JIRA(server=server, basic_auth=(email, token))
    except Exception as e:
        print(f"❌ Jira Connection Failed: {e}")
        return

    # JQL query: Find "To Do" tickets assigned to the API user
    jql = 'status = "To Do" AND assignee = currentUser()'

    print("=" * 50)
    print("👀 SQUADRON OVERSEER")
    print("=" * 50)
    print(f"   Server: {server}")
    print(f"   Watching for: {jql}")
    print(f"   Check interval: {check_interval}s")
    print("=" * 50)
    print("")

    seen_tickets = set()

    while True:
        try:
            issues = jira.search_issues(jql)

            for issue in issues:
                if issue.key not in seen_tickets:
                    seen_tickets.add(issue.key)
                    print(f"🔔 NEW TASK DETECTED!")
                    print(f"   Ticket: {issue.key}")
                    print(f"   Summary: {issue.fields.summary}")
                    print(f"   Priority: {issue.fields.priority}")
                    print("")
                    print("   🤖 (Agent trigger logic goes here)")
                    print("-" * 40)
                    # TODO: Trigger agent API or subprocess here

            time.sleep(check_interval)

        except KeyboardInterrupt:
            print("\n👋 Overseer shutting down...")
            break
        except Exception as e:
            print(f"⚠️ Error during check: {e}")
            time.sleep(check_interval)


def main():
    """Entry point for the overseer command."""
    watch_tickets()


if __name__ == "__main__":
    main()
