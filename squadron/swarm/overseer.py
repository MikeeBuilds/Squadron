
import logging
import json
from datetime import datetime
from typing import Optional
from .agent import AgentNode

logger = logging.getLogger('Overseer')

class Overseer:
    def __init__(self):
        self.output_callback = print
        self.agents = {}
        self.task_queue = []  # Pending tasks
        self.delegation_chain = {}  # Track who delegated to whom
        self.activity_log = []  # Activity history for dashboard
        self.init_swarm()

    def init_swarm(self):
        """Initializes the Specialist Agents."""
        logger.info("🐝 Initializing The Hive...")
        
        # 1. Marcus (The Manager)
        self.agents["Marcus"] = AgentNode(
            name="Marcus",
            role="Product Manager",
            system_prompt="""You are Marcus, a seasoned Product Manager. 
Your job is to PLAN tasks using 'create_plan' and delegate complex work to specialists.
When you receive a task:
1. Break it into steps if complex
2. Delegate coding tasks to Caleb using 'assign_task'
3. Delegate security reviews to Sentinel using 'assign_task'
4. Summarize progress back to the user"""
        )
        
        # 2. Caleb (The Engineer)
        self.agents["Caleb"] = AgentNode(
            name="Caleb",
            role="Software Engineer",
            system_prompt="""You are Caleb, a skilled Full-Stack Developer.
Your job is to EXECUTE coding tasks using 'write_file', 'read_file', 'run_command'.
You write clean, well-documented code. You test your work.
If a task requires security review, delegate to Sentinel.
If you need clarification on requirements, ask Marcus."""
        )
        
        # 3. Sentinel (The Security Officer)
        self.agents["Sentinel"] = AgentNode(
            name="Sentinel",
            role="Security Engineer",
            system_prompt="""You are Sentinel, a Security Engineer.
Your job is to AUDIT code for vulnerabilities using 'read_file'.
Check for: injection attacks, exposed secrets, unsafe operations.
Approve or reject changes. Report findings clearly."""
        )
        
        logger.info(f"   ✅ Agents Online: {list(self.agents.keys())}")

    def get_router_model(self):
        """Get the routing model (lazy load to avoid circular imports)."""
        from squadron.services.model_factory import ModelFactory
        return ModelFactory.create("gemini-2.0-flash")

    def route_with_llm(self, user_input: str) -> str:
        """Use LLM to intelligently route tasks to the right agent."""
        router_prompt = f"""You are a task router. Given a user request, decide which agent should handle it.

AGENTS:
- Marcus: Product Manager. Handles planning, strategy, requirements, delegation, project management.
- Caleb: Software Engineer. Handles coding, debugging, file creation, running commands, implementation.
- Sentinel: Security Engineer. Handles security audits, code reviews, vulnerability checks.

USER REQUEST: {user_input}

Respond with ONLY the agent name (Marcus, Caleb, or Sentinel). Nothing else."""

        try:
            model = self.get_router_model()
            response = model.generate(prompt=router_prompt, max_tokens=10, temperature=0.1)
            agent_name = str(response).strip()
            
            # Validate response
            if agent_name in self.agents:
                return agent_name
            else:
                # Fallback: extract agent name from response
                for name in self.agents.keys():
                    if name.lower() in agent_name.lower():
                        return name
                return "Marcus"  # Default fallback
        except Exception as e:
            logger.warning(f"LLM Router failed: {e}, falling back to heuristic")
            return self.route_heuristic(user_input)

    def route_heuristic(self, user_input: str) -> str:
        """Fallback heuristic-based routing."""
        user_input_lower = user_input.lower()
        
        if "audit" in user_input_lower or "check" in user_input_lower or "security" in user_input_lower or "review" in user_input_lower:
            return "Sentinel"
        elif "code" in user_input_lower or "write" in user_input_lower or "fix" in user_input_lower or "implement" in user_input_lower or "create" in user_input_lower:
            return "Caleb"
        else:
            return "Marcus"

    def route(self, user_input: str, use_llm: bool = True) -> str:
        """
        Main routing method. Decides who handles the task.
        Returns the formatted response from the agent.
        """
        # Determine target agent
        if use_llm:
            target_agent = self.route_with_llm(user_input)
        else:
            target_agent = self.route_heuristic(user_input)
            
        logger.info(f"🔀 Routing to: {target_agent}")
        
        # Log activity
        self._log_activity("route", {
            "input": user_input[:100],
            "target": target_agent
        })
        
        # Execute
        agent = self.agents[target_agent]
        result = agent.process_task(user_input)
        
        return f"[{target_agent}]: {result['text']}"

    def handoff(self, from_agent: str, to_agent: str, task: str, context: dict = None) -> dict:
        """
        Transfer a task from one agent to another with context.
        Creates a delegation chain for tracking.
        """
        if to_agent not in self.agents:
            return {"text": f"Error: Agent '{to_agent}' not found.", "success": False}
        
        # Record delegation chain
        chain_id = f"{from_agent}->{to_agent}:{datetime.now().timestamp()}"
        self.delegation_chain[chain_id] = {
            "from": from_agent,
            "to": to_agent,
            "task": task,
            "context": context or {},
            "timestamp": datetime.now().isoformat(),
            "status": "pending"
        }
        
        logger.info(f"🔄 Handoff: {from_agent} → {to_agent}")
        logger.info(f"   Task: {task[:50]}...")
        
        # Log activity
        self._log_activity("handoff", {
            "from": from_agent,
            "to": to_agent,
            "task": task[:100]
        })
        
        # Execute with context
        agent = self.agents[to_agent]
        result = agent.process_task(task, context=context)
        
        # Update chain status
        self.delegation_chain[chain_id]["status"] = "complete"
        self.delegation_chain[chain_id]["result"] = result["text"][:200]
        
        return {
            "text": f"[Handoff {from_agent}→{to_agent}]: {result['text']}",
            "success": True,
            "chain_id": chain_id
        }

    def enqueue_task(self, task: str, priority: int = 5, assigned_to: str = None) -> dict:
        """Add a task to the queue for async processing."""
        task_entry = {
            "id": f"task-{len(self.task_queue)+1}",
            "task": task,
            "priority": priority,
            "assigned_to": assigned_to,
            "status": "backlog", # Kanban initial state
            "created": datetime.now().isoformat()
        }

        self.task_queue.append(task_entry)
        self.task_queue.sort(key=lambda x: x["priority"], reverse=True)
        
        logger.info(f"📥 Task queued: {task_entry['id']}")
        self._log_activity("enqueue", {"task_id": task_entry["id"], "task": task[:100]})
        
        return task_entry

    def process_queue(self) -> list:
        """Process all queued tasks."""
        results = []
        while self.task_queue:
            # Only process things in 'backlog' or 'planning'
            tasks_to_run = [t for t in self.task_queue if t["status"] in ["backlog", "planning"]]
            if not tasks_to_run:
                break
                
            task_entry = tasks_to_run.pop(0)
            self.task_queue.remove(task_entry)
            
            task_entry["status"] = "in_progress"
            
            logger.info(f"⚙️ Processing: {task_entry['id']}")

            
            # Route to assigned agent or auto-route
            if task_entry["assigned_to"]:
                agent = self.agents.get(task_entry["assigned_to"])
                if agent:
                    result = agent.process_task(task_entry["task"])
                else:
                    result = {"text": f"Agent {task_entry['assigned_to']} not found"}
            else:
                result_text = self.route(task_entry["task"])
                result = {"text": result_text}
            
            task_entry["status"] = "complete"
            task_entry["result"] = result["text"]
            results.append(task_entry)
        
        return results

    def get_queue_status(self) -> list:
        """Return current task queue for dashboard."""
        return self.task_queue.copy()

    def update_task_status(self, task_id: str, status: str) -> bool:
        """Update the status of a specific task (used by Kanban)."""
        valid_statuses = ["backlog", "planning", "in_progress", "review", "done"]
        if status not in valid_statuses:
            return False
            
        for task in self.task_queue:
            if task["id"] == task_id:
                old_status = task["status"]
                task["status"] = status
                logger.info(f"📋 Task {task_id} moved: {old_status} -> {status}")
                self._log_activity("status_change", {
                    "task_id": task_id,
                    "old_status": old_status,
                    "new_status": status
                })
                return True
        return False


    def get_activity_log(self, limit: int = 50) -> list:
        """Return recent activity for dashboard."""
        return self.activity_log[-limit:]

    def get_agent_status(self) -> list:
        """Return agent status for dashboard."""
        return [
            {
                "name": name,
                "role": agent.role,
                "status": "active" if hasattr(agent, '_current_task') else "idle"
            }
            for name, agent in self.agents.items()
        ]

    def _log_activity(self, event_type: str, data: dict):
        """Log activity for dashboard streaming."""
        entry = {
            "type": event_type,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.activity_log.append(entry)
        
        # Keep log bounded
        if len(self.activity_log) > 500:
            self.activity_log = self.activity_log[-500:]

# Singleton
overseer = Overseer()
