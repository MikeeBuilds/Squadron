"""
Event Bus 📡
Central pub/sub system for agent activity broadcasting.
Used by the Dashboard to stream real-time updates via SSE.
"""
import asyncio
import logging
from datetime import datetime
from typing import AsyncGenerator, Callable, Optional
from collections import deque

logger = logging.getLogger('EventBus')


class EventBus:
    """
    Async event bus for broadcasting agent activity to multiple subscribers.
    Supports both sync publishing and async consumption.
    """
    
    def __init__(self, max_history: int = 100):
        self._subscribers: list[asyncio.Queue] = []
        self._history: deque = deque(maxlen=max_history)
        self._lock = asyncio.Lock()
    
    def publish(self, event: dict):
        """
        Publish an event to all subscribers.
        Thread-safe, can be called from sync code.
        
        Event format:
        {
            "type": "agent_start" | "tool_call" | "tool_result" | "agent_complete" | "error",
            "agent": str,
            "timestamp": str (ISO format),
            "data": dict
        }
        """
        # Add timestamp if not present
        if "timestamp" not in event:
            event["timestamp"] = datetime.now().isoformat()
        
        # Store in history
        self._history.append(event)
        
        logger.debug(f"📡 Publishing: {event['type']} - {event.get('agent', 'system')}")
        
        # Push to all subscribers (non-blocking)
        for queue in self._subscribers:
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                # Skip if queue is full (slow consumer)
                logger.warning("Subscriber queue full, dropping event")
    
    async def subscribe(self) -> AsyncGenerator[dict, None]:
        """
        Subscribe to events. Returns an async generator that yields events.
        Use this in SSE endpoints.
        
        Usage:
            async for event in event_bus.subscribe():
                yield f"data: {json.dumps(event)}\\n\\n"
        """
        queue = asyncio.Queue(maxsize=50)
        
        async with self._lock:
            self._subscribers.append(queue)
        
        try:
            # First, yield any recent history
            for event in self._history:
                yield event
            
            # Then yield new events as they come
            while True:
                event = await queue.get()
                yield event
        finally:
            async with self._lock:
                self._subscribers.remove(queue)
    
    def get_history(self, limit: int = 50) -> list:
        """Get recent events for initial dashboard load."""
        return list(self._history)[-limit:]
    
    def clear_history(self):
        """Clear event history."""
        self._history.clear()


# Global singleton
event_bus = EventBus()


# Convenience functions for common event types
def emit_agent_start(agent: str, task: str):
    """Emit when an agent starts working on a task."""
    event_bus.publish({
        "type": "agent_start",
        "agent": agent,
        "data": {"task": task[:200]}
    })


def emit_tool_call(agent: str, tool_name: str, args: dict):
    """Emit when an agent is about to call a tool."""
    # Truncate args for safety
    safe_args = {k: str(v)[:100] for k, v in (args or {}).items()}
    event_bus.publish({
        "type": "tool_call",
        "agent": agent,
        "data": {"tool": tool_name, "args": safe_args}
    })


def emit_tool_result(agent: str, tool_name: str, result: str, success: bool = True):
    """Emit after a tool finishes executing."""
    event_bus.publish({
        "type": "tool_result",
        "agent": agent,
        "data": {
            "tool": tool_name,
            "result": result[:300] if result else "",
            "success": success
        }
    })


def emit_agent_complete(agent: str, summary: str):
    """Emit when an agent finishes its task."""
    event_bus.publish({
        "type": "agent_complete",
        "agent": agent,
        "data": {"summary": summary[:200]}
    })


def emit_error(agent: str, error: str):
    """Emit when an error occurs."""
    event_bus.publish({
        "type": "error",
        "agent": agent,
        "data": {"error": str(error)[:300]}
    })
