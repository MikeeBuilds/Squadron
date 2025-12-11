import discord
import os
import asyncio
from rich.console import Console
from ...skills.discord_bridge.tool import DiscordTool
from ...cli import load_agent_config

console = Console()

class SquadronBot(discord.Client):
    def __init__(self):
        # We need Message Content Intent to read messages
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(intents=intents)
        
        self.webhook_tool = DiscordTool() # Used for replying as agents

    async def on_ready(self):
        console.print(f"[bold green]🤖 Squadron Bot Online![/bold green] Logged in as {self.user}")
        console.print(f"Invite Link: https://discord.com/api/oauth2/authorize?client_id={self.user.id}&permissions=8&scope=bot")

    async def on_message(self, message):
        # Don't let the bot reply to itself or webhooks
        if message.author == self.user or message.webhook_id:
            return

        content = message.content
        channel = message.channel
        
        console.print(f"[dim]📨 Received:[/dim] {message.author}: {content}")

        # Routing Logic
        # Check if an agent is mentioned by name (case-insensitive)
        # e.g. "Hey Marcus, what's up?"
        
        target_agent = None
        prompt = content

        if "marcus" in content.lower():
            target_agent = "Marcus"
        elif "caleb" in content.lower():
            target_agent = "Caleb"
        elif self.user in message.mentions:
            # If they mention @Squadron, default to Marcus for now
            target_agent = "Marcus"
        
        if target_agent:
            await self.handle_agent_reply(channel, target_agent, prompt)

    async def handle_agent_reply(self, channel, agent_name, prompt):
        """
        Simulates an agent reply.
        In the future, this is where we call the LLM.
        For now, we just echo back a confirmation.
        """
        console.print(f"[bold blue]⚡ Triggering Agent: {agent_name}[/bold blue]")
        
        # 1. Get Agent Identity
        real_name, avatar_url = load_agent_config(agent_name)
        
        if not real_name:
            real_name = agent_name
            
        # 2. Simulate "Thinking"
        async with channel.typing():
            await asyncio.sleep(1.5) # Fake thinking time
            
        # 3. Generate Response (Mocked for v0.4.0)
        # TODO: Hook up to Local LLM or OpenAI here
        response = f"I hear you! You said: '{prompt}'. (I'm still learning to think for myself!)"

        # 4. Reply via Webhook (so it looks like the agent)
        # Note: We use the broadcast tool which uses the webhook
        # Ideally we valid the channel has a webhook or we use the main one.
        # For simplicity in v0.4.0, we reply using the global webhook (msg appears in the configured channel)
        # OR we reply as the Bot itself if we can't use webhook specific to this channel.
        
        # Better approach for "Living Team": Use the Webhook to post in THIS channel.
        # But we only have one DISCORD_WEBHOOK_URL env var currently.
        # So we will just reply as the Bot for now, but use an Embed to show the "Face".
        
        # Option A: Webhook (Best aesthetics, but harder routing)
        # Option B: Embed Reply (Good compromise)
        
        embed = discord.Embed(description=response, color=0x00ff00)
        embed.set_author(name=real_name, icon_url=avatar_url)
        embed.set_footer(text="Squadron // Neural Link")
        
        await channel.send(embed=embed)

def start_discord_bot():
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        console.print("[bold red]❌ Error:[/bold red] DISCORD_BOT_TOKEN not found in .env")
        return
        
    client = SquadronBot()
    client.run(token)
