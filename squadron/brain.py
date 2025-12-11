
"""
The Brain 🧠
Central intelligence for Squadron agents.
Decides whether to reply with text or execute a tool.
"""
import logging
import json
from services.model_factory import ModelFactory
# Tool Imports
from squadron.skills.browser.tool import browse_website
from squadron.skills.ssh.tool import ssh_command

logger = logging.getLogger('SquadronBrain')

class SquadronBrain:
    def __init__(self):
        # We use the smart model for routing
        self.planner_model = ModelFactory.create("gpt-5.1") 
        self.tools = {}
        
        # Register Core Tools
        self.register_tool(
            "browse_website", 
            "Navigates to a URL and takes a screenshot. Useful for checking dashboards/UIs.", 
            browse_website
        )
        self.register_tool(
            "ssh_command",
            "Executes a command on a remote server. Useful for checking logs, restarting services.",
            ssh_command
        )

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
