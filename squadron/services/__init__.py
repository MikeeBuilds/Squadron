"""
Squadron Services 🔧
Core service modules for autonomous agent operation.

NOTE: Imports are lazy to avoid circular dependencies with swarm/brain.
"""

# Lazy imports - access via function calls
def get_event_bus():
    from squadron.services.event_bus import event_bus
    return event_bus

def get_wake_protocol():
    from squadron.services.wake_protocol import wake_protocol
    return wake_protocol

def get_trigger_wake():
    from squadron.services.wake_protocol import trigger_wake
    return trigger_wake

def get_tag_parser():
    from squadron.services.tag_parser import tag_parser
    return tag_parser

def get_comment_watcher():
    from squadron.services.comment_watcher import comment_watcher
    return comment_watcher

__all__ = [
    "get_event_bus",
    "get_wake_protocol", 
    "get_trigger_wake",
    "get_tag_parser",
    "get_comment_watcher"
]
