"""
Squadron Listener - The Ears of the Operation 👂
Listens for Slack events via Socket Mode and dispatches them to agents.
"""

import os
import re
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from squadron.cli import load_agent_config

def start_listening():
    """Start the Slack Socket Mode listener."""
    
    # 1. Credentials
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    app_token = os.getenv("SLACK_APP_TOKEN")

    if not bot_token or not app_token:
        print("❌ Error: Missing Slack Credentials for Listener.")
        print("   Required: SLACK_BOT_TOKEN (xoxb-...) AND SLACK_APP_TOKEN (xapp-...)")
        return

    # 2. Initialize Bolt App
    app = App(token=bot_token)

    # 3. Define Event Handlers
    @app.event("app_mention")
    def handle_mention(event, say):
        """Handle @Squadron mentions."""
        text = event["text"]
        user = event["user"]
        channel = event["channel"]
        
        print(f"👂 Heard mention from {user} in {channel}: {text}")

        # Detect Agent
        agent_name = None
        avatar_url = None
        
        # Simple keyword matching for agents defined in agents.yaml
        # (In v0.3 we can make this smarter with an LLM router)
        lower_text = text.lower()
        if "marcus" in lower_text:
            agent_name = "Marcus"
        elif "caleb" in lower_text:
            agent_name = "Caleb"
            
        # Load Identity
        if agent_name:
            _, avatar_url = load_agent_config(agent_name)
            response = f"👀 {agent_name} is listening... (Auto-response)"
        else:
            # Default Bot Response
            response = "👋 Squadron here. Mention an agent name (Marcus/Caleb) to route your request."
            agent_name = "Squadron"

        # Reply
        say(
            text=response,
            username=agent_name,
            icon_url=avatar_url
        )

    # 4. Start Socket Mode
    print("👂 Squadron Listener is active. Waiting for mentions...")
    handler = SocketModeHandler(app, app_token)
    handler.start()

if __name__ == "__main__":
    start_listening()
