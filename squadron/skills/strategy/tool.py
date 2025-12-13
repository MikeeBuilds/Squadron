
"""
Strategy Tool 🧠
Allows the agent to manage its own trading strategies.
Can save winning parameters to the database and retrieve the current config.
"""
import logging
import os
import asyncio
from services.api import DashboardClient

logger = logging.getLogger('StrategyTool')

class StrategyTool:
    def __init__(self):
        self.dash_url = os.getenv('DASH_API_URL', 'http://localhost:3000')
        self.secret = os.getenv('BCT_API_SECRET_KEY', 'dev_secret')
        # We need a userId to save strategies. 
        # In a real app, this might come from the message context or a fixed 'Bot' ID.
        self.admin_user_id = os.getenv('ADMIN_USER_ID', '') 

        self.client = DashboardClient(self.dash_url, self.secret)

    def save_strategy(self, name: str, config: dict, description: str = "AI Generated") -> str:
        """
        Saves a strategy to the database.
        Returns success message.
        """
        if not self.admin_user_id and not self.secret:
             return "Error: ADMIN_USER_ID or BCT_API_SECRET_KEY required to save strategy."

        logger.info(f"💾 Saving Strategy: {name}")
        
        async def _save():
            return await self.client.save_strategy(name, config, description, self.admin_user_id)

        try:
             # run sync wrapper
             loop = asyncio.new_event_loop()
             asyncio.set_event_loop(loop)
             result = loop.run_until_complete(_save())
             loop.close()
             
             if result.get('success'):
                 return f"✅ Strategy '{name}' saved successfully (ID: {result.get('strategyId')})"
             else:
                 return f"❌ Failed to save: {result.get('error')}"

        except Exception as e:
            return f"Error saving strategy: {e}"

    def get_active_strategy(self) -> str:
        """
        Gets the current active strategy config.
        """
        async def _get():
            return await self.client.get_active_strategy()

        try:
             loop = asyncio.new_event_loop()
             asyncio.set_event_loop(loop)
             data = loop.run_until_complete(_get())
             loop.close()
             
             if not data or 'error' in data:
                 return f"Error fetching strategy: {data.get('error')}"
             
             config = data.get('config')
             name = data.get('name')
             
             if not config:
                 return "No active strategy found in DB. Using defaults."
                 
             return f"📜 Active Strategy: {name}\nConfig: {config}"

        except Exception as e:
            return f"Error getting strategy: {e}"

# Standalone functions for Brain
def save_strategy(name: str, config: dict, description: str = "AI Generated"):
    tool = StrategyTool()
    return tool.save_strategy(name, config, description)

def get_active_strategy():
    tool = StrategyTool()
    return tool.get_active_strategy()
