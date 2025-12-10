"""
Squadron Overseer - The Background Daemon
Watches Jira for new tickets and wakes up agents when work is assigned.
"""

import time
import os
import sys
import subprocess
import shlex
from dotenv import load_dotenv

try:
    from jira import JIRA
except ImportError:
    print("❌ Error: 'jira' package not installed. Run: pip install jira")
    sys.exit(1)


def watch_tickets(check_interval=30, exec_command=None):
    """
    Watch Jira for new tickets assigned to the current user.
    
    Args:
        check_interval: Seconds between checks (default: 30)
        exec_command: Command string to execute when a ticket is found.
                      Use {key} and {summary} as placeholders.
                      Example: "python agent.py --task '{summary}'"
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
    print("👀 SQUADRON OVERSEER v2.0")
    print("=" * 50)
    print(f"   Server: {server}")
    print(f"   Watching for: {jql}")
    print(f"   Check interval: {check_interval}s")
    if exec_command:
        print(f"   Wake-up Command: {exec_command}")
    else:
        print("   Mode: Passive (Notification only)")
    print("=" * 50)
    print("")

    seen_tickets = set()

    while True:
        try:
            issues = jira.search_issues(jql)

            for issue in issues:
                if issue.key not in seen_tickets:
                    seen_tickets.add(issue.key)
                    
                    summary = issue.fields.summary
                    priority = issue.fields.priority.name if hasattr(issue.fields, 'priority') and issue.fields.priority else "None"
                    
                    print(f"🔔 NEW TASK DETECTED: [{issue.key}] {summary}")
                    
                    if exec_command:
                        # Format the command with ticket details
                        cmd_str = exec_command.replace("{key}", issue.key).replace("{summary}", summary)
                        print(f"⚡ Waking up agent with: {cmd_str}")
                        
                        # Execute the command
                        try:
                            # Use shell=True for flexibility, but be careful with inputs
                            subprocess.Popen(cmd_str, shell=True)
                            print(f"✅ Agent process started for {issue.key}")
                        except Exception as e:
                            print(f"❌ Failed to start agent: {e}")
                    else:
                        print("   (Pasive mode: use --exec to trigger an agent)")
                        
                    print("-" * 40)

            time.sleep(check_interval)

        except KeyboardInterrupt:
            print("\n👋 Overseer shutting down...")
            break
        except Exception as e:
            print(f"⚠️ Error during check: {e}")
            time.sleep(check_interval)


def main():
    """Entry point for the overseer command."""
    # This is handled by cli.py usually, but for standalone testing:
    watch_tickets()


if __name__ == "__main__":
    main()
