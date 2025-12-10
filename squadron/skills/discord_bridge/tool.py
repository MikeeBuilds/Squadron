import os
import requests


class DiscordTool:
    """Tool for broadcasting messages to Discord via webhooks."""

    def __init__(self):
        self.webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

    def broadcast(self, message, header="Agent Update"):
        """
        Broadcast a message to Discord via webhook.
        
        Args:
            message: The message content to send
            header: Header text for the message
        """
        if not self.webhook_url:
            print("❌ Error: DISCORD_WEBHOOK_URL not found in .env")
            return False

        payload = {
            "embeds": [
                {
                    "title": f"🤖 {header}",
                    "description": message,
                    "color": 5814783,  # Purple color
                }
            ]
        }

        try:
            response = requests.post(self.webhook_url, json=payload)
            if response.status_code == 204:
                print("✅ Discord: Broadcast sent.")
                return True
            else:
                print(f"❌ Discord Error: Status {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Discord Connection Error: {e}")
            return False
