import os
import sys
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

class SlackTool:
    def __init__(self):
        self.token = os.getenv("SLACK_BOT_TOKEN")
        if not self.token:
            print("❌ Error: SLACK_BOT_TOKEN not found in .env")
            return
            
        self.client = WebClient(token=self.token)

    def send_alert(self, channel, message, header="Agent Report"):
        """Sends a formatted message to Slack"""
        if not self.token:
            return

        # Create a professional "Block" layout
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🤖 {header}"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message
                }
            },
            {
                "type": "divider"
            }
        ]

        try:
            self.client.chat_postMessage(channel=channel, blocks=blocks, text=message)
            print(f"✅ Slack: Message sent to {channel}")
        except SlackApiError as e:
            print(f"❌ Slack Error: {e.response['error']}")
