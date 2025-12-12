
from typing import Optional

def assign_task(agent_name: str, task: str, context: dict = None) -> dict:
    """
    Delegates a task to a specific agent in the swarm.
    
    Args:
        agent_name: Name of agent to delegate to (Marcus, Caleb, Sentinel)
        task: The task description
        context: Optional context dictionary with:
            - delegated_by: Who is delegating
            - original_request: Original user request
            - previous_results: Results from prior steps
            - notes: Additional notes
    
    Example: assign_task("Caleb", "Write the main.py file", {"delegated_by": "Marcus"})
    """
    # Import inside function to avoid circular dependency
    from .overseer import overseer
    
    if agent_name not in overseer.agents:
        return {"text": f"Error: Agent '{agent_name}' not found. Available: {list(overseer.agents.keys())}"}
    
    agent = overseer.agents[agent_name]
    result = agent.process_task(task, context=context)
    
    return {"text": f"Delegated to {agent_name}. Result: {result['text']}"}


def handoff_task(from_agent: str, to_agent: str, task: str, notes: str = None) -> dict:
    """
    Higher-level handoff that includes automatic context building.
    Use this when one agent needs to pass work to another.
    
    Args:
        from_agent: Name of agent handing off
        to_agent: Name of agent receiving
        task: The task to hand off
        notes: Optional notes to include
    
    Example: handoff_task("Marcus", "Caleb", "Implement the login feature", "Use JWT tokens")
    """
    from .overseer import overseer
    
    context = {
        "delegated_by": from_agent,
        "notes": notes
    }
    
    return overseer.handoff(from_agent, to_agent, task, context)
