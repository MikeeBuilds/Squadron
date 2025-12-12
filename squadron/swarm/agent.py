
import logging
from typing import Optional
from squadron.brain import SquadronBrain
from squadron.services.model_factory import ModelFactory

logger = logging.getLogger('SwarmAgent')

class AgentNode:
    def __init__(self, name: str, role: str, system_prompt: str, tools: list = None):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.task_history = []  # Track past tasks
        self._current_task = None  # Current task being processed
        
        # Each Agent gets its own Brain
        self.brain = SquadronBrain()
        
        # Customizing the Brain for this specialist
        # (In a real implementation, we would filter self.brain.tools based on 'tools' list)
        # For now, we assume all agents have all tools, but their PROMPT defines their behavior.

    def process_task(self, task: str, context: dict = None) -> dict:
        """
        Processes a task using the Agent's Brain.
        
        Args:
            task: The task description
            context: Optional context from a delegating agent, may include:
                - delegated_by: Name of agent who handed off this task
                - original_request: The original user request
                - previous_results: Results from prior steps
                - notes: Any additional context
        """
        self._current_task = task
        
        logger.info(f"🤖 [{self.name}] Processing task: {task}")
        if context:
            logger.info(f"   📋 Context from: {context.get('delegated_by', 'unknown')}")
        
        # Create a temporary profile object to pass to think()
        # effectively mocking the 'agent_profile' argument used in the CLI
        class AgentProfile:
            def __init__(self, name, prompt, ctx=None):
                self.name = name
                # Inject context into system prompt if available
                if ctx:
                    context_block = self._build_context_block(ctx)
                    self.system_prompt = f"{prompt}\n\n{context_block}"
                else:
                    self.system_prompt = prompt
            
            def _build_context_block(self, ctx):
                lines = ["## Delegation Context"]
                if ctx.get("delegated_by"):
                    lines.append(f"- **Delegated By**: {ctx['delegated_by']}")
                if ctx.get("original_request"):
                    lines.append(f"- **Original Request**: {ctx['original_request']}")
                if ctx.get("previous_results"):
                    lines.append(f"- **Previous Results**: {ctx['previous_results']}")
                if ctx.get("notes"):
                    lines.append(f"- **Notes**: {ctx['notes']}")
                return "\n".join(lines)
        
        profile = AgentProfile(self.name, self.system_prompt, context)
        
        # 1. Think
        decision = self.brain.think(task, profile)
        
        # 2. Execute
        result = self.brain.execute(decision)
        
        # 3. Log to history
        self.task_history.append({
            "task": task,
            "context": context,
            "result": result["text"][:500],  # Truncate for storage
            "timestamp": __import__("datetime").datetime.now().isoformat()
        })
        
        # Keep history bounded
        if len(self.task_history) > 100:
            self.task_history = self.task_history[-100:]
        
        self._current_task = None
        logger.info(f"   [{self.name}] Result: {result['text'][:50]}...")
        return result

    def get_history(self, limit: int = 10) -> list:
        """Get recent task history for this agent."""
        return self.task_history[-limit:]
    
    def is_busy(self) -> bool:
        """Check if agent is currently processing a task."""
        return self._current_task is not None
