import os
import requests


class DiscordTool:
    """Tool for broadcasting messages to Discord via webhooks."""

    def __init__(self):
        self.webhook_url = os.getenv("DISCORD_WEBHOOK_URL")

    def broadcast(self, message, channel_name="general", username=None, avatar_url=None):
        """
        Broadcast a message to Discord via webhook.
        
        Args:
            message: The message content to send
            channel_name: Display name for footer context
            username: Override default bot name
            avatar_url: Override default bot avatar
        """
        if not self.webhook_url:
            print("⚠️ Discord Webhook URL not found. Skipping.")
            return False

        # Create a nice embed for the agent
        payload = {
            "username": username or "Squadron Agent",
            "avatar_url": avatar_url or "https://i.imgur.com/4M34hi2.png",
            "embeds": [{
                "title": f"📢 {username or 'Agent'} Update",
                "description": message,
                "color": 5763719,  # Greenish/Blue
                "footer": {"text": f"via Squadron • #{channel_name}"}
            }]
        }

        try:
            response = requests.post(self.webhook_url, json=payload)
            if response.status_code == 204:
                print("✅ Discord: Broadcast sent.")
                return True
            else:
                print(f"❌ Discord Error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Discord Connection Error: {e}")
            return False
