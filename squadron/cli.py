import argparse
import os
from dotenv import load_dotenv

# Import our new Skills
from squadron.skills.slack_bridge.tool import SlackTool
from squadron.skills.jira_bridge.tool import JiraTool

def main():
    # 1. Load Environment Variables
    load_dotenv()
    
    # 2. Setup Arguments
    parser = argparse.ArgumentParser(description="Squadron: AI Team Interface")
    subparsers = parser.add_subparsers(dest="command")

    # Command: 'report'
    report_parser = subparsers.add_parser("report", help="Report status to the team")
    report_parser.add_argument("--msg", required=True, help="Message to send")
    report_parser.add_argument("--ticket", help="Jira Ticket ID (e.g. PROJ-101)")
    report_parser.add_argument("--channel", default="#general", help="Slack Channel")
    report_parser.add_argument("--status", help="New Jira Status (e.g. 'Done')")

    args = parser.parse_args()

    # 3. Execution Logic
    if args.command == "report":
        print("🚀 Squadron Bridge Activated...")
        
        # A. Fire Slack
        slack = SlackTool()
        slack.send_alert(args.channel, args.msg)

        # B. Fire Jira (if ticket provided)
        if args.ticket:
            jira = JiraTool()
            jira.update_ticket(args.ticket, args.msg, args.status)
            
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
