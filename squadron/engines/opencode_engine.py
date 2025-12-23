"""
OpenCode Engine 🚀
==================

Wrapper around OpenCode SDK that provides Squadron's brain functionality.
This replaces the custom brain.py with OpenCode's proven agentic execution.

OpenCode provides:
- Multi-model support (Gemini, Claude, OpenAI, local)
- Built-in tool execution
- Session management
- MCP integration
"""

import logging
import json
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

logger = logging.getLogger('OpenCodeEngine')

# Try to import OpenCode SDK
try:
    from opencode_sdk import OpencodeClient
    OPENCODE_AVAILABLE = True
except ImportError:
    OPENCODE_AVAILABLE = False
    logger.warning("OpenCode SDK not installed. Run: pip install opencode-sdk")


@dataclass
class AgentProfile:
    """Represents an agent's configuration."""
    name: str
    system_prompt: str
    specialties: List[str] = field(default_factory=list)
    personality: str = "professional"


class OpenCodeEngine:
    """
    The new brain for Squadron, powered by OpenCode.
    
    This class wraps the OpenCode SDK client and provides a simple API
    for thinking and executing tasks.
    """
    
    def __init__(self, base_url: str = "http://localhost:8080"):
        """
        Initialize the OpenCode engine.
        
        Args:
            base_url: URL of the OpenCode server (runs separately)
        """
        self.base_url = base_url
        self.client: Optional[OpencodeClient] = None
        self.current_session: Optional[str] = None
        self.agent_profiles: Dict[str, AgentProfile] = {}
        
        # Define our agents
        self._setup_agents()
        
        # Initialize client
        if OPENCODE_AVAILABLE:
            try:
                self.client = OpencodeClient(base_url=base_url)
                logger.info(f"🔌 OpenCode Engine initialized (server: {base_url})")
            except Exception as e:
                logger.error(f"Failed to connect to OpenCode server: {e}")
                self.client = None
        else:
            logger.warning("OpenCode SDK not available, using mock mode")
    
    def _setup_agents(self):
        """Configure our agent personalities."""
        self.agent_profiles = {
            "Marcus": AgentProfile(
                name="Marcus",
                system_prompt="""You are Marcus, the Product Manager.
You excel at understanding requirements, breaking down tasks, creating plans,
and coordinating work. You're organized, strategic, and user-focused.
When given a task, you think about the big picture and create actionable plans.""",
                specialties=["planning", "requirements", "coordination", "documentation"],
                personality="strategic"
            ),
            "Caleb": AgentProfile(
                name="Caleb",
                system_prompt="""You are Caleb, the Software Engineer.
You're an expert coder who writes clean, efficient, and well-documented code.
You love solving technical problems and building features.
When given a task, you focus on implementation and code quality.""",
                specialties=["coding", "debugging", "implementation", "architecture"],
                personality="technical"
            )
        }
    
    async def create_session(self, agent_name: str = "Caleb") -> str:
        """
        Create a new OpenCode session for an agent.
        
        Args:
            agent_name: Which agent personality to use
            
        Returns:
            Session ID
        """
        if not self.client:
            return "mock-session"
        
        try:
            profile = self.agent_profiles.get(agent_name, self.agent_profiles["Caleb"])
            session = await self.client.create_session()
            self.current_session = session.get("id", session.get("session_id"))
            logger.info(f"📝 Created session {self.current_session} for {agent_name}")
            return self.current_session
        except Exception as e:
            logger.error(f"Failed to create session: {e}")
            return "error-session"
    
    async def think(self, user_input: str, agent_name: str = "Caleb") -> Dict[str, Any]:
        """
        Process a task using OpenCode.
        
        This is the main entry point for task processing.
        
        Args:
            user_input: The task to process
            agent_name: Which agent should handle this
            
        Returns:
            Dict with action details
        """
        profile = self.agent_profiles.get(agent_name, self.agent_profiles["Caleb"])
        
        if not self.client:
            # Mock response for testing without OpenCode server
            logger.info(f"🤖 [{agent_name}] Mock thinking about: {user_input[:50]}...")
            return {
                "action": "reply",
                "content": f"[Mock Mode] {agent_name} would process: {user_input}",
                "agent": agent_name
            }
        
        try:
            # Ensure we have a session
            if not self.current_session:
                await self.create_session(agent_name)
            
            # Format the message with agent context
            full_message = f"""[Agent: {agent_name}]
{profile.system_prompt}

Task: {user_input}

Please analyze this task and take appropriate action."""
            
            # Send to OpenCode
            logger.info(f"🧠 [{agent_name}] Thinking about: {user_input[:50]}...")
            response = await self.client.send_message(
                session_id=self.current_session,
                message=full_message
            )
            
            # Parse response
            result = {
                "action": "reply",
                "content": response.get("content", response.get("message", str(response))),
                "agent": agent_name,
                "raw": response
            }
            
            logger.info(f"✅ [{agent_name}] Completed thinking")
            return result
            
        except Exception as e:
            logger.error(f"OpenCode error: {e}")
            return {
                "action": "error",
                "content": f"Error processing task: {e}",
                "agent": agent_name
            }
    
    def think_sync(self, user_input: str, agent_name: str = "Caleb") -> Dict[str, Any]:
        """
        Synchronous version of think() for compatibility with existing code.
        """
        import asyncio
        
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If we're already in an async context, create a new task
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    future = pool.submit(
                        asyncio.run,
                        self.think(user_input, agent_name)
                    )
                    return future.result()
            else:
                return loop.run_until_complete(self.think(user_input, agent_name))
        except Exception as e:
            logger.error(f"Sync think error: {e}")
            return {
                "action": "error",
                "content": f"Error: {e}",
                "agent": agent_name
            }
    
    def get_agent_names(self) -> List[str]:
        """Return list of available agents."""
        return list(self.agent_profiles.keys())
    
    def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """Get status of an agent."""
        profile = self.agent_profiles.get(agent_name)
        if not profile:
            return {"status": "unknown", "agent": agent_name}
        
        return {
            "name": profile.name,
            "status": "idle",
            "specialties": profile.specialties,
            "personality": profile.personality
        }


# Singleton instance
_engine: Optional[OpenCodeEngine] = None


def get_engine() -> OpenCodeEngine:
    """Get or create the global OpenCode engine instance."""
    global _engine
    if _engine is None:
        _engine = OpenCodeEngine()
    return _engine


# Convenience function matching old brain API
def think(user_input: str, agent_profile=None) -> Dict[str, Any]:
    """
    Backward compatible think() function.
    
    Matches the signature of the old brain.think() method.
    """
    engine = get_engine()
    agent_name = "Caleb"
    if agent_profile:
        agent_name = getattr(agent_profile, 'name', 'Caleb')
    return engine.think_sync(user_input, agent_name)
