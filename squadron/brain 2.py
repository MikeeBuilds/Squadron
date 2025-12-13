
"""
The Brain 🧠
Central intelligence for Squadron agents.
Decides whether to reply with text or execute a tool.
"""
import logging
import json
import yaml
import os
import asyncio
from services.model_factory import ModelFactory
# Tool Imports
from squadron.skills.browser.tool import browse_website
from squadron.clients.mcp_client import MCPBridge

logger = logging.getLogger('SquadronBrain')

class SquadronBrain:
    def __init__(self):
        # We use the smart model for routing
        self.planner_model = ModelFactory.create("gpt-5.1")
        from squadron.skills.ssh.tool import ssh_command
        from squadron.skills.quant.tool import research_strategy, run_backtest, get_market_data, find_strategy_videos
        self.tools = {
            "plan_ticket": {
                "func": plan_ticket,
                "description": "Create an implementation plan for a Linear ticket. Args: ticket_id (str)"
            },
            "browse_website": {
                "func": browse_website,
                "description": "Visit a URL and capture a screenshot. Args: url (str)"
            },
            "ssh_command": {
                "func": ssh_command,
                "description": "Run a shell command on the server. Args: command (str)"
            },
            "find_strategy_videos": {
                "func": find_strategy_videos,
                "description": "Search YouTube for trading strategy videos. Args: topic (str)"
            },
            "research_strategy": {
                "func": research_strategy,
                "description": "Research a trading strategy from a URL (YouTube/PDF) or text. Args: topic_or_url (str)"
            },
            "run_backtest": {
                "func": run_backtest,
                "description": "Run or modify a backtest for a named strategy. Args: strategy_name (str), code_override (Optional[str])"
            },
            "get_market_data": {
                "func": get_market_data,
                "description": "Fetch market data for a ticker using Alpaca. Args: ticker (str), limit (int)"
            }
        }
        
        # MCP Bridge
        self.mcp_bridge = MCPBridge()
        self.mcp_initialized = False

    def initialize_mcp(self):
        """Loads MCP servers from config and registers tools."""
        if self.mcp_initialized:
            return
            
        config_path = os.path.join(os.path.dirname(__file__), "mcp_servers.yaml")
        if not os.path.exists(config_path):
            return

        try:
            with open(config_path, "r") as f:
                config = yaml.safe_load(f)
            
            servers = config.get("servers", {})
            loop = asyncio.get_event_loop()
            
            for name, srv_config in servers.items():
                if not srv_config: continue
                # List tools (JIT connection)
                tools = loop.run_until_complete(self.mcp_bridge.list_tools(name, srv_config))
                
                for tool in tools:
                    # Create a callable wrapper for the tool
                    wrapper = self._make_tool_wrapper(tool_name=tool["tool_name"])  # Pass tool_name explicitly or by closure
                    # Wait, in loop variable capture is easier if we use a factory or partial.
                    # Actually _make_tool_wrapper handles closure.
                    
                    self.tools[tool["tool_name"]] = {
                        "func": wrapper,
                        "description": f"[{name}] {tool.get('description', '')}"
                    }
            
            self.mcp_initialized = True
            logger.info(f"✅ MCP Bridge Initialized. Total tools: {len(self.tools)}")
            
        except Exception as e:
            logger.error(f"Failed to init MCP: {e}")

    def _make_tool_wrapper(self, tool_name):
        """Creates a synchronous wrapper for an async MCP tool call."""
        def wrapper(**kwargs):
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # Call tool
                result = loop.run_until_complete(self.mcp_bridge.call_tool(tool_name, kwargs))
                
                # Format output
                text_content = []
                # Check if result corresponds to expected SDK output
                # The SDK result likely has a 'content' field which is a list of TextContent or ImageContent equivalent
                if hasattr(result, 'content'):
                    for content in result.content:
                        if hasattr(content, 'text'):
                            text_content.append(content.text)
                        elif hasattr(content, 'type') and content.type == 'text':
                             text_content.append(content.text)
                        else:
                             text_content.append(str(content))
                else:
                    text_content.append(str(result))
                
                return "\n".join(text_content)
            finally:
                loop.close()
        return wrapper

    def register_tool(self, name, description, func):
        self.tools[name] = {
            "description": description,
            "func": func
        }

    def think(self, user_input: str, agent_profile) -> dict:
        """
        Decides the next action.
        Returns a dict: {"action": "reply"|"tool", "content": str, "tool_name": str, "tool_args": dict}
        """
        # Ensure MCP tools are loaded
        if not self.mcp_initialized:
             # We might need to be careful about loops here.
             # If think is called from async context, we shouldn't use run_until_complete inside init.
             # But init uses loop.run_until_complete which is blocking.
             # For MVP, let's try.
             try:
                self.initialize_mcp()
             except Exception as e:
                logger.warning(f"MCP Init deferred/failed: {e}")

        # Construct a prompt that explains available tools
        tool_desc = "\n".join([f"- {name}: {info['description']}" for name, info in self.tools.items()])
        
        system_instructions = f"""
{agent_profile.system_prompt}

You have access to the following tools:
{tool_desc}

INSTRUCTIONS:
- If the user asks for something that requires a tool, output JSON: {{"action": "tool", "tool_name": "...", "args": {{...}}}}
- If the user just wants to chat, output JSON: {{"action": "reply", "content": "..."}}
- Be concise.
"""
        
        try:
            # We force JSON format for the tool decision
            response = self.planner_model.generate(
                prompt=f"{system_instructions}\nUSER: {user_input}\nRESPONSE (JSON):",
                max_tokens=1000,
                temperature=0.3
            )
            
            # Simple clean up of code blocks
            clean_json = response.strip().replace("```json", "").replace("```", "")
            return json.loads(clean_json)
            
        except Exception as e:
            logger.error(f"Brain freeze: {e}")
            return {"action": "reply", "content": "I'm having trouble thinking clearly right now."}

    def execute(self, decision: dict) -> dict:
        """
        Executes the tool and returns a dict: {"text": str, "files": [str]}
        """
        if decision["action"] == "reply":
            return {"text": decision["content"], "files": []}
        
        elif decision["action"] == "tool":
            tool_name = decision.get("tool_name")
            tool_info = self.tools.get(tool_name)
            
            if not tool_info:
                return {"text": f"Error: Tool '{tool_name}' not found.", "files": []}
            
            try:
                logger.info(f"🔧 Executing {tool_name} with {decision.get('args')}")
                result = tool_info["func"](**decision.get("args", {}))
                
                # Handle structured tool output (dict) vs legacy simple string
                if isinstance(result, dict) and "text" in result:
                    return result
                else:
                    return {"text": f"Tool Output: {result}", "files": []}
                    
            except Exception as e:
                return {"text": f"Tool Error: {e}", "files": []}
        
        return {"text": "Unknown action.", "files": []}

# Singleton instance
brain = SquadronBrain()
