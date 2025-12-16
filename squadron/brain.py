
"""
The Brain 🧠
Central intelligence for Squadron agents.
Decides whether to reply with text or execute a tool.
"""
import logging
import json
from squadron.services.model_factory import ModelFactory
import PIL.Image
import yaml
import os
import asyncio
# Tool Imports
from squadron.skills.browser.tool import browse_website
from squadron.skills.ssh.tool import ssh_command
from squadron.skills.fs_tool.tool import read_file, write_file, list_dir
from squadron.skills.shell_tool.tool import run_command
from squadron.memory.hippocampus import Hippocampus, remember
from squadron.planner.architect import create_plan, read_plan, update_plan
from squadron.skills.quant.tool import research_strategy, run_backtest, get_market_data, find_strategy_videos
from squadron.clients.mcp_client import MCPBridge
# Note: dynamic import for delegator to avoid circular dependency
# from squadron.swarm.delegator import assign_task (Done inside function/execution to be safe)

logger = logging.getLogger('SquadronBrain')

class SquadronBrain:
    def __init__(self):
        # We use the smart model for routing
        self.planner_model = ModelFactory.create("gemini-3-pro") 
        self.tools = {}
        self.safety_mode = True  # Default: Safety Interlocks ENGAGED
        
        # Initialize Memory
        try:
            self.memory = Hippocampus()
        except Exception as e:
            logger.warning(f"Failed to initialize Memory: {e}")
            self.memory = None
        
        # MCP Bridge
        self.mcp_bridge = MCPBridge()
        self.mcp_initialized = False

        # Register Core Tools
        self.register_tool(
            "browse_website", 
            "browse_website(url: str): Navigates to a URL and takes a screenshot.", 
            browse_website,
            hazardous=False
        )
        self.register_tool(
            "ssh_command",
            "ssh_command(command: str): Executes a command on a remote server.",
            ssh_command,
            hazardous=True  # SSH is powerful
        )
        
        # --- The Motor Cortex (Hands & Feet) ---
        self.register_tool(
            "read_file",
            "read_file(path: str): Reads the content of a local file.",
            read_file,
            hazardous=False
        )
        self.register_tool(
            "list_dir",
            "list_dir(path: str): Lists files in a directory.",
            list_dir,
            hazardous=False
        )
        self.register_tool(
            "write_file",
            "write_file(path: str, content: str): Writes content to a file (HAZARDOUS: Overwrites existing).",
            write_file,
            hazardous=True
        )
        self.register_tool(
            "run_command",
            "run_command(command: str, timeout: int = 30): Executes a shell command (HAZARDOUS: Can modify system).",
            run_command,
            hazardous=True
        )
        
        # --- The Hippocampus (Memory) ---
        self.register_tool(
            "save_memory",
            "save_memory(text: str, memory_type: str = 'general'): Saves a fact, learning, or context to long-term memory. Types: 'general', 'learning', 'task'",
            lambda text, memory_type="general": self._save_memory(text, memory_type),
            hazardous=False
        )
        self.register_tool(
            "recall_memory",
            "recall_memory(query: str, n_results: int = 3): Searches memory for relevant past information.",
            lambda query, n_results=3: self._recall_memory(query, n_results),
            hazardous=False
        )
        self.register_tool(
            "get_memory_context",
            "get_memory_context(task: str): Gets relevant context from memory for a task. Returns formatted string for inclusion in reasoning.",
            lambda task: self._get_memory_context(task),
            hazardous=False
        )
        
        # --- The Frontal Cortex (Planner) ---
        self.register_tool(
            "create_plan",
            "create_plan(goal: str): Creates a mission plan (squadron_plan.md) for a complex goal.",
            create_plan,
            hazardous=False
        )
        self.register_tool(
            "read_plan",
            "read_plan(): Reads the current mission plan.",
            read_plan,
            hazardous=False
        )
        self.register_tool(
            "update_plan",
            "update_plan(content: str): Updates the mission plan (e.g. marking steps as complete).",
            update_plan,
            hazardous=False
        )
        
        # --- The Hive (Swarm) ---
        # Late import to prevent circular dependency
        from squadron.swarm.delegator import assign_task, handoff_task
        self.register_tool(
            "assign_task",
            "assign_task(agent_name: str, task: str, context: dict = None): Delegates a task to a specialist (Marcus=PM, Caleb=Dev, Sentinel=Sec).",
            assign_task,
            hazardous=False # Delegation itself is safe, the delegatee has their own safety checks
        )
        self.register_tool(
            "handoff_task",
            "handoff_task(from_agent: str, to_agent: str, task: str, notes: str = None): Transfer work between agents with context.",
            handoff_task,
            hazardous=False
        )
        
        # --- Agent Communication Tools ---
        self.register_tool(
            "reply_to_ticket",
            "reply_to_ticket(ticket_id: str, message: str, tag_agent: str = None): Reply to a Jira/Linear ticket with your response. Optionally @tag another agent.",
            self._reply_to_ticket,
            hazardous=False
        )
        self.register_tool(
            "tag_agent",
            "tag_agent(agent_name: str, task: str, ticket_id: str = None): Tag another agent for help or handoff. They will be automatically woken up.",
            self._tag_agent,
            hazardous=False
        )

        # --- Quant Skills (From Remote) ---
        def plan_ticket(ticket_id: str):
             # Stub or import if needed, assuming plan_ticket logic is handled by new planner
             return "Please use create_plan instead."

        self.register_tool("find_strategy_videos", "Search YouTube for trading videos.", find_strategy_videos, hazardous=False)
        self.register_tool("research_strategy", "Research strategy from URL/Text.", research_strategy, hazardous=False)
        self.register_tool("run_backtest", "Run backtest for strategy.", run_backtest, hazardous=False)
        self.register_tool("get_market_data", "Fetch market data.", get_market_data, hazardous=False)


        # --- Level 6: Evolution ---
        from squadron.evolution.improver import Improver
        self.improver = Improver("squadron/skills/dynamic")
        self.register_tool(
            "refresh_skills",
            "refresh_skills(): Scans 'squadron/skills/dynamic' for new tools and loads them.",
            lambda: self._refresh_skills_impl(),
            hazardous=False
        )
        
        # --- Level 8: Vision ---
        import PIL.Image
        from squadron.skills.vision_tool import capture_screen, click_at, type_text, get_screen_size
        self.register_tool("capture_screen", "capture_screen(): Captures screenshot.", capture_screen, hazardous=False)
        self.register_tool("click_at", "click_at(x: int, y: int): Clicks mouse.", click_at, hazardous=False)
        self.register_tool("type_text", "type_text(text: str): Types keys.", type_text, hazardous=False)
        self.register_tool("get_screen_size", "get_screen_size(): Returns WxH.", get_screen_size, hazardous=False)

        self.last_files = [] # Stores file paths from last tool run

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
            
            servers = config.get("servers") or {}
            
            # Handle Event Loop (Main Thread vs Executor Thread)
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            for name, srv_config in servers.items():
                if not srv_config: continue
                # List tools (JIT connection)
                # If loop is running (Main Thread), we can't use run_until_complete
                if loop.is_running():
                     # This is tricky. For now, skip if we are in main loop active 
                     # (Should verify_mcp.py/main.py call this separately?)
                     logger.warning("Cannot init MCP context inside active loop without async.")
                     continue
                
                tools = loop.run_until_complete(self.mcp_bridge.list_tools(name, srv_config))
                
                for tool in tools:
                    # Create a callable wrapper for the tool
                    wrapper = self._make_tool_wrapper(tool_name=tool["tool_name"])  
                    
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
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

            # If loop running, we might be in trouble if we block.
            # But the executor thread usually has no loop running.
            
            # Call tool
            result = loop.run_until_complete(self.mcp_bridge.call_tool(tool_name, kwargs))
            
            # Format output
            text_content = []
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
        return wrapper

    def _refresh_skills_impl(self):
        new_skills = self.improver.discover_skills()
        count = 0
        for skill in new_skills:
            self.register_tool(
                skill["name"], 
                skill["description"], 
                skill["func"], 
                skill["hazardous"]
            )
            count += 1
        return f"Loaded {count} skills: {[s['name'] for s in new_skills]}"

    def _reply_to_ticket(self, ticket_id: str, message: str, tag_agent: str = None) -> str:
        """Reply to a Jira/Linear ticket."""
        from squadron.services.tag_parser import tag_parser
        import os
        
        # Format the message with agent prefix
        formatted_message = tag_parser.format_agent_comment(
            self.current_agent or "Squadron", 
            message
        )
        
        # Add @tag if specified
        if tag_agent:
            formatted_message += f"\n\n{tag_parser.format_agent_tag(tag_agent)}"
        
        # Try Jira first
        if ticket_id and ('-' in ticket_id):
            try:
                from jira import JIRA
                server = os.getenv("JIRA_SERVER")
                email = os.getenv("JIRA_EMAIL")
                token = os.getenv("JIRA_TOKEN")
                
                if all([server, email, token]):
                    jira = JIRA(server=server, basic_auth=(email, token))
                    jira.add_comment(ticket_id, formatted_message)
                    return f"✅ Posted comment to {ticket_id}"
            except Exception as e:
                pass  # Try Linear
        
        # Try Linear
        try:
            import requests
            api_key = os.getenv("LINEAR_API_KEY")
            if api_key:
                # Get issue ID first
                query = """
                query GetIssue($id: String!) {
                    issue(id: $id) { id }
                }
                """
                response = requests.post(
                    "https://api.linear.app/graphql",
                    json={"query": query, "variables": {"id": ticket_id}},
                    headers={"Authorization": api_key, "Content-Type": "application/json"}
                )
                data = response.json()
                
                if data.get("data", {}).get("issue"):
                    issue_id = data["data"]["issue"]["id"]
                    
                    mutation = """
                    mutation CreateComment($issueId: String!, $body: String!) {
                        commentCreate(input: { issueId: $issueId, body: $body }) {
                            success
                        }
                    }
                    """
                    requests.post(
                        "https://api.linear.app/graphql",
                        json={"query": mutation, "variables": {"issueId": issue_id, "body": formatted_message}},
                        headers={"Authorization": api_key, "Content-Type": "application/json"}
                    )
                    return f"✅ Posted comment to {ticket_id}"
        except Exception as e:
            return f"❌ Failed to post comment: {e}"
        
        return f"❌ Could not find ticket {ticket_id}"

    def _tag_agent(self, agent_name: str, task: str, ticket_id: str = None) -> str:
        """Tag another agent for help or handoff."""
        from squadron.services.tag_parser import tag_parser
        from squadron.services.wake_protocol import trigger_wake
        
        # Validate agent name
        valid_agents = ["Marcus", "Caleb", "Sentinel"]
        if agent_name not in valid_agents:
            return f"❌ Unknown agent: {agent_name}. Valid: {valid_agents}"
        
        # If we have a ticket, post a comment first
        if ticket_id:
            tag_message = f"{tag_parser.format_agent_tag(agent_name)} {task}"
            self._reply_to_ticket(ticket_id, tag_message)
        
        # Trigger the wake protocol for the tagged agent
        result = trigger_wake(
            summary=task,
            source_type="tag" if not ticket_id else "ticket",
            ticket_id=ticket_id,
            target_agent=agent_name
        )
        
        if result.get("success"):
            return f"✅ Tagged {agent_name} - they are now working on: {task[:50]}..."
        else:
            return f"⚠️ Tagged {agent_name} but wake failed: {result.get('error', 'Unknown')}"

    def _save_memory(self, text: str, memory_type: str = "general") -> str:
        """Save to agent-specific memory."""
        if not self.memory:
            return "❌ Memory system not available"
        
        agent = getattr(self, 'current_agent', 'shared')
        mem_id = self.memory.remember(text, agent=agent, memory_type=memory_type)
        return f"✅ Saved to memory ({memory_type}): {text[:50]}..."
    
    def _recall_memory(self, query: str, n_results: int = 3) -> str:
        """Recall relevant memories."""
        if not self.memory:
            return "❌ Memory system not available"
        
        agent = getattr(self, 'current_agent', None)
        memories = self.memory.recall(query, agent=agent, n_results=n_results)
        
        if not memories:
            return "No relevant memories found."
        
        result = f"Found {len(memories)} relevant memories:\n"
        for i, mem in enumerate(memories, 1):
            content = mem["content"][:200]
            timestamp = mem["metadata"].get("timestamp", "unknown")[:10]
            result += f"\n{i}. [{timestamp}] {content}...\n"
        
        return result
    
    def _get_memory_context(self, task: str) -> str:
        """Get formatted context from memory for a task."""
        if not self.memory:
            return ""
        
        agent = getattr(self, 'current_agent', None)
        return self.memory.get_context_for_task(task, agent=agent)


    def register_tool(self, name, description, func, hazardous=False):
        self.tools[name] = {
            "description": description,
            "func": func,
            "hazardous": hazardous
        }

    def toggle_safety(self, enabled: bool):
        """Toggle the safety interlocks on or off."""
        self.safety_mode = enabled
        status = "ENGAGED" if enabled else "DISENGAGED (GOD MODE)"
        print(f"🛡️ Safety Interlocks: {status}")

    def check_safety(self, tool_name: str, args: dict) -> bool:
        """
        Verifies if an action is safe to proceed.
        Returns True if safe (or approved), False if denied.
        """
        tool_info = self.tools.get(tool_name)
        if not tool_info:
            return False
            
        # If not hazardous, just go
        if not tool_info.get("hazardous", False):
            return True
            
        # If hazardous but safety is OFF (God Mode)
        if not self.safety_mode:
            logger.warning(f"⚠️ Executing HAZARDOUS tool '{tool_name}' (Safety OFF)")
            return True
            
        # Hazardous + Safety ON -> Prompt User
        msg = f"\n⚠️  [SAFETY INTERLOCK] Agent wants to execute: {tool_name}"
        print(msg)
        print(f"   Args: {json.dumps(args, indent=2)}")
        
        try:
            user_in = input("   Allow this action? (y/N): ")
            if user_in.lower().startswith('y'):
                logger.info("   ✅ User APPROVED action.")
                return True
            else:
                logger.info("   ❌ User DENIED action.")
                print("   Action aborted.")
                return False
        except EOFError:
            # Handle non-interactive environments
            return False

    def think(self, user_input: str, agent_profile=None) -> dict:
        """
        Decides the next action.
        Returns a dict: {"action": "reply"|"tool", "content": str, "tool_name": str, "tool_args": dict}
        """
        # --- MEMORY RECALL ---
        memory_context = ""
        if self.memory:
            try:
                memories = self.memory.recall(user_input, n_results=3)
                if memories:
                    memory_context = "\n🧠 RELEVANT MEMORIES:\n"
                    for mem in memories:
                        memory_context += f"- {mem['content']} (Time: {mem['metadata'].get('timestamp')})\n"
            except Exception as e:
                logger.warning(f"Memory Recall Failed: {e}")
        # ---------------------
        
        # --- PLAN CONTEXT ---
        plan_context = ""
        try:
            plan_data = read_plan()
            if plan_data.get("exists"):
                plan_context = f"\n🗺️ CURRENT MISSION PLAN:\n{plan_data['text']}\n"
        except Exception as e:
            logger.warning(f"Plan Read Failed: {e}")
        # --------------------

        # Ensure MCP tools are loaded
        if not self.mcp_initialized:
             try:
                self.initialize_mcp()
             except Exception as e:
                logger.warning(f"MCP Init deferred/failed: {e}")

        # Construct a prompt that explains available tools
        tool_desc = "\n".join([f"- {name}: {info['description']}" for name, info in self.tools.items()])
        
        # Default Profile if None
        system_prompt = agent_profile.system_prompt if agent_profile else "You are a helpful AI assistant. Use tools if needed."
        
        system_instructions = f"""
{system_prompt}

{memory_context}

{plan_context}

You have access to the following tools:
{tool_desc}

INSTRUCTIONS:
- If the user asks for something that requires a tool, output JSON: {{"action": "tool", "tool_name": "...", "args": {{...}}}}
- If the user just wants to chat, output JSON: {{"action": "reply", "content": "..."}}
- If you learn a new important fact, use 'save_memory'.
- If the user gives a complex goal, use 'create_plan'.
- **SELF-EVOLUTION**: To build a NEW tool, write a Python file to `squadron/skills/dynamic/NAME.py` containing a function `def NAME(...)`. Then call `refresh_skills`.
- Be concise.
"""
        
        try:
            # --- MULTIMODAL PROMPT CONSTRUCTION ---
            prompt_parts = [f"{system_instructions}\nUSER: {user_input}\nRESPONSE (JSON):"]
            
            # If we have recent images from tool execution, show them to the brain
            if hasattr(self, 'last_files') and self.last_files:
                for fpath in self.last_files:
                    if fpath.endswith('.png') or fpath.endswith('.jpg'):
                        try:
                            logger.info(f"👁️ Looking at image: {fpath}")
                            img = PIL.Image.open(fpath)
                            prompt_parts.append(img)
                            prompt_parts.append(f"\n[Image: {fpath}]")
                        except Exception as img_err:
                            logger.error(f"Failed to load image {fpath}: {img_err}")
                
                # Clear after seeing them once? Or keep for conversation?
                # For now, clear to prevent token bloat
                self.last_files = [] 
            # ------------------------------------

            # We force JSON format for the tool decision
            response = self.planner_model.generate(
                prompt=prompt_parts if len(prompt_parts) > 1 else prompt_parts[0],
                max_tokens=4096,
                temperature=0.3
            )
            
            # Simple clean up of code blocks
            clean_json = str(response).strip().replace("```json", "").replace("```", "")
            try:
                return json.loads(clean_json)
            except json.JSONDecodeError:
                logger.warning(f"LLM did not return JSON. Raw: {response}")
                # Fallback: Treat entire response as a reply
                return {"action": "reply", "content": str(response)}
            
        except Exception as e:
            logger.error(f"Brain freeze: {e}")
            return {"action": "reply", "content": f"I'm having trouble thinking clearly right now. Error: {e}"}

    def execute(self, decision: dict) -> dict:
        """
        Executes the tool and returns a dict: {"text": str, "files": [str]}
        """
        action = decision.get("action", "").lower()
        
        # Handle reply action
        if action == "reply":
            content = decision.get("content", decision.get("text", decision.get("response", "No response")))
            return {"text": str(content), "files": []}
        
        # Handle tool action
        elif action == "tool":
            tool_name = decision.get("tool_name", decision.get("tool", decision.get("name")))
            tool_info = self.tools.get(tool_name)
            args = decision.get("args", decision.get("arguments", decision.get("parameters", {})))
            
            if not tool_info:
                return {"text": f"Error: Tool '{tool_name}' not found.", "files": []}
            
            # --- SAFETY CHECK ---
            if not self.check_safety(tool_name, args):
                return {"text": "⛔ Action denied by safety interlock.", "files": []}
            # --------------------

            try:
                logger.info(f"🔧 Executing {tool_name} with {args}")
                result = tool_info["func"](**args)
                
                # Handle structured tool output (dict) vs legacy simple string
                if isinstance(result, dict) and "text" in result:
                    # Capture files for next turn
                    if "files" in result:
                        self.last_files = result["files"]
                    return result
                else:
                    return {"text": f"Tool Output: {result}", "files": []}
                    
            except Exception as e:
                return {"text": f"Tool Error: {e}", "files": []}
        
        # Fallback: Try to extract any text-like content from the decision
        fallback_content = (
            decision.get("content") or 
            decision.get("text") or 
            decision.get("response") or 
            decision.get("message") or
            str(decision)
        )
        logger.warning(f"Unknown action '{action}', using fallback: {fallback_content[:100]}")
        return {"text": str(fallback_content), "files": []}

# Singleton instance
brain = SquadronBrain()
