"""
Wake Protocol ⏰
Orchestrates the full autonomous agent loop:
Trigger → Parse → Route → Execute → Report

This is the core of agent autonomy - it connects:
- Overseer (ticket watching)
- Swarm (agent routing)
- Brain (execution)
- Bridges (reporting)
"""
import logging
from datetime import datetime
from typing import Optional, Callable
from squadron.swarm.overseer import overseer
from squadron.services.event_bus import event_bus, emit_agent_start, emit_agent_complete, emit_error

logger = logging.getLogger('WakeProtocol')


class WakeProtocol:
    """
    The autonomous execution loop.
    Receives triggers from various sources and orchestrates agent responses.
    """
    
    def __init__(self):
        self.active_missions = {}  # Track ongoing work
        self.completed_missions = []  # History
        self.callbacks = {
            "on_start": [],
            "on_complete": [],
            "on_error": []
        }
    
    def trigger(self, source: dict) -> dict:
        """
        Main entry point. Triggers the wake-up protocol.
        
        Args:
            source: Dict describing the trigger, with keys:
                - type: "ticket" | "message" | "file" | "manual"
                - id: Unique identifier (ticket ID, message ID, etc.)
                - summary: Task description
                - priority: Optional priority level (1-10)
                - metadata: Optional additional context
        
        Returns:
            Dict with mission status and results
        """
        mission_id = f"mission-{datetime.now().strftime('%Y%m%d%H%M%S')}-{source.get('id', 'unknown')}"
        
        logger.info(f"⏰ WAKE PROTOCOL ACTIVATED")
        logger.info(f"   Mission: {mission_id}")
        logger.info(f"   Source: {source.get('type')} - {source.get('summary', 'No summary')[:50]}")
        
        # Record mission start
        mission = {
            "id": mission_id,
            "source": source,
            "status": "active",
            "started": datetime.now().isoformat(),
            "result": None
        }
        self.active_missions[mission_id] = mission
        
        # Emit event
        event_bus.publish({
            "type": "wake_protocol",
            "agent": "system",
            "data": {"mission_id": mission_id, "source": source["type"], "summary": source.get("summary", "")[:100]}
        })
        
        # Run callbacks
        for cb in self.callbacks["on_start"]:
            try:
                cb(mission)
            except Exception as e:
                logger.warning(f"Callback error: {e}")
        
        try:
            # 1. Parse the task
            task = self._parse_trigger(source)
            
            # 2. Route to appropriate agent (direct or LLM-routed)
            target_agent = source.get("target_agent")
            if target_agent:
                # Direct routing to specific agent
                from squadron.swarm.delegator import assign_task
                result = assign_task(target_agent, task)
                if isinstance(result, dict):
                    result = result.get("result", str(result))
            else:
                # LLM-powered routing
                result = overseer.route(task, use_llm=True)
            
            # 3. Record success
            mission["status"] = "complete"
            mission["completed"] = datetime.now().isoformat()
            mission["result"] = result
            
            # 4. Report back (if applicable)
            self._report_back(source, result)
            
            # Move to completed
            del self.active_missions[mission_id]
            self.completed_missions.append(mission)
            
            # Keep history bounded
            if len(self.completed_missions) > 100:
                self.completed_missions = self.completed_missions[-100:]
            
            # Run callbacks
            for cb in self.callbacks["on_complete"]:
                try:
                    cb(mission)
                except Exception as e:
                    logger.warning(f"Callback error: {e}")
            
            logger.info(f"   ✅ Mission Complete: {mission_id}")
            return {
                "success": True,
                "mission_id": mission_id,
                "result": result
            }
            
        except Exception as e:
            logger.error(f"   ❌ Mission Failed: {e}")
            mission["status"] = "failed"
            mission["error"] = str(e)
            
            emit_error("system", f"Mission {mission_id} failed: {e}")
            
            # Run error callbacks
            for cb in self.callbacks["on_error"]:
                try:
                    cb(mission, e)
                except Exception as cb_e:
                    logger.warning(f"Error callback failed: {cb_e}")
            
            return {
                "success": False,
                "mission_id": mission_id,
                "error": str(e)
            }
    
    def _parse_trigger(self, source: dict) -> str:
        """Convert a trigger source into a task string for the agents."""
        source_type = source.get("type", "unknown")
        summary = source.get("summary", "")
        
        if source_type == "ticket":
            ticket_id = source.get("id", "UNKNOWN")
            return f"[Ticket {ticket_id}] {summary}"
        elif source_type == "message":
            return summary
        elif source_type == "file":
            return f"TODO from file: {summary}"
        else:
            return summary
    
    def _report_back(self, source: dict, result: str):
        """Report results back to the source (ticket, message, etc.)."""
        source_type = source.get("type", "unknown")
        
        try:
            if source_type == "ticket":
                # Report to Jira
                ticket_id = source.get("id")
                if ticket_id:
                    from squadron.skills.jira_bridge.tool import add_jira_comment
                    add_jira_comment(ticket_id, f"🤖 Squadron Agent Report:\n\n{result[:1000]}")
                    logger.info(f"   📝 Reported to Jira: {ticket_id}")
            
            elif source_type == "message":
                # For now, just log. Could respond via Slack/Discord
                logger.info(f"   📝 Result logged (message response not implemented)")
            
            # Add more source types as needed
            
        except Exception as e:
            logger.warning(f"Failed to report back: {e}")
    
    def on_start(self, callback: Callable):
        """Register a callback for mission start."""
        self.callbacks["on_start"].append(callback)
    
    def on_complete(self, callback: Callable):
        """Register a callback for mission completion."""
        self.callbacks["on_complete"].append(callback)
    
    def on_error(self, callback: Callable):
        """Register a callback for mission errors."""
        self.callbacks["on_error"].append(callback)
    
    def get_active_missions(self) -> list:
        """Get list of currently active missions."""
        return list(self.active_missions.values())
    
    def get_mission_history(self, limit: int = 20) -> list:
        """Get recent completed missions."""
        return self.completed_missions[-limit:]


# Singleton
wake_protocol = WakeProtocol()


def trigger_wake(summary: str, source_type: str = "manual", ticket_id: str = None, target_agent: str = None) -> dict:
    """
    Convenience function to trigger the wake protocol.
    
    Args:
        summary: What needs to be done
        source_type: "manual" | "ticket" | "message" | "jira" | "linear"
        ticket_id: Optional ticket ID for reporting
        target_agent: Optional specific agent to route to (bypasses LLM routing)
    
    Returns:
        Mission result dict
    """
    source = {
        "type": source_type,
        "id": ticket_id or f"manual-{datetime.now().timestamp()}",
        "summary": summary,
        "target_agent": target_agent
    }
    return wake_protocol.trigger(source)

