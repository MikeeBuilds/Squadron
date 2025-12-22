
import logging
from typing import Optional
from squadron.brain import SquadronBrain
from squadron.services.model_factory import ModelFactory
from squadron.services.event_bus import emit_agent_start, emit_agent_thought, emit_agent_complete


logger = logging.getLogger('SwarmAgent')

class AgentNode:
    def __init__(self, name: str, role: str, system_prompt: str, tools: list = None):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt
        self.task_history = []  # Track past tasks
        self._current_task = None  # Current task being processed
        self._current_thought = None
        self._current_tool = None

        
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
        
        emit_agent_start(self.name, task)
        
        # 1. Think
        # We might want to capture thoughts more granularly in the future
        self._current_thought = f"Analyzing task: {task[:50]}..."
        emit_agent_thought(self.name, self._current_thought)
        
        decision = self.brain.think(task, profile)
        
        # Update thought based on decision
        if decision.get("action") == "tool":
            self._current_thought = f"Decided to use {decision.get('tool_name')}"
            self._current_tool = decision.get("tool_name")
        else:
            self._current_thought = "Formulating response..."
            self._current_tool = None
            
        emit_agent_thought(self.name, self._current_thought)
        
        # 2. Execute
        # Note: brain.execute will now handle tool_call/result emission if we update it
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
        
        emit_agent_complete(self.name, result["text"][:200])
        
        self._current_task = None
        self._current_thought = None
        self._current_tool = None
        
        logger.info(f"   [{self.name}] Result: {result['text'][:50]}...")
        return result

    def get_status(self) -> dict:
        """Returns the current status of the agent."""
        return {
            "name": self.name,
            "role": self.role,
            "status": "active" if self._current_task else "idle",
            "current_task": self._current_task,
            "current_thought": self._current_thought,
            "current_tool": self._current_tool
        }


    def get_history(self, limit: int = 10) -> list:
        """Get recent task history for this agent."""
        return self.task_history[-limit:]
    
    def is_busy(self) -> bool:
        """Check if agent is currently processing a task."""
        return self._current_task is not None
