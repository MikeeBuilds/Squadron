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
        lower_text = text.lower()
        if "marcus" in lower_text:
            agent_name = "Marcus"
        elif "caleb" in lower_text:
            agent_name = "Caleb"
            
        # Load Identity
        if agent_name:
            _, avatar_url = load_agent_config(agent_name)
            
            # --- BRAIN INTEGRATION ---
            try:
                # We need an object with .system_prompt for the brain.
                # Since we are in Squadron-Repo context, we mock/load it from yaml or use a simple struct.
                # Ideally we share AgentService, but for now let's construct a compatible object.
                from services.agent_service import AgentService
                agent = AgentService.get_agent(agent_name)
            except ImportError:
                # Fallback if not running from consolidated main.py
                print("⚠️  AgentService not found, using minimal fallback profile.")
                from dataclasses import dataclass
                @dataclass
                class MinimalProfile:
                    system_prompt: str
                agent = MinimalProfile(system_prompt=f"You are {agent_name}. Act helpful.")

            from squadron.brain import brain
            
            # 1. Think
            try:
                decision = brain.think(text, agent)
                
                # 2. Act
                if decision["action"] == "tool":
                    # Notify we are working...
                    say(f"🛠️ {agent_name} is working on that...", username=agent_name, icon_url=avatar_url)
                    result_dict = brain.execute(decision)
                    response_text = f"Done.\n{result_dict.get('text', '')}"
                    files = result_dict.get("files", [])
                else:
                    response_text = decision.get("content", "...")
                    files = []
                    
            except Exception as e:
                response_text = f"Brain error: {e}"
                files = []
            # -------------------------
            
        else:
            # Default Bot Response
            response_text = "👋 Squadron here. Mention an agent name (Marcus/Caleb) to route your request."
            agent_name = "Squadron"
            files = []

        # Reply with Files if needed
        if files:
            # Use the WebClient from the app
            # Note: 'say' is a shortcut, for files we might need app.client.files_upload_v2
            # However, 'say' doesn't support files directly in Bolt usually, check docs or use client.
            # We can access client via app? Listener structure is strict.
            # We can get client from context if we had it, but here we can't easily access 'app' inside the function scope 
            # unless we make 'app' global or pass it?
            # 'say' is wrapper around chat.postMessage.
            # Let's inspect 'say' args or just print file path for now to be safe, 
            # or try to use a global client if available.
            # Correction: We instantiated 'app' inside start_listening.
            # We can just use the token from env again to make a temp client or Refactor.
            # Quick hack: reply with text, then upload file separately.
            
            say(
                text=response_text,
                username=agent_name,
                icon_url=avatar_url
            )
            
            # Upload files
            from slack_sdk import WebClient
            client = WebClient(token=os.getenv("SLACK_BOT_TOKEN"))
            for fpath in files:
                try:
                    client.files_upload_v2(
                        channel=channel,
                        file=fpath,
                        title=os.path.basename(fpath),
                        initial_comment=f"📸 Upload from {agent_name}"
                    )
                except Exception as e:
                    say(f"⚠️ Failed to upload file: {e}")
        else:
            # Normal Reply
            say(
                text=response_text,
                username=agent_name,
                icon_url=avatar_url
            )

    # 4. Start Socket Mode
    print("👂 Squadron Listener is active. Waiting for mentions...")
    handler = SocketModeHandler(app, app_token)
    handler.start()

if __name__ == "__main__":
    start_listening()
