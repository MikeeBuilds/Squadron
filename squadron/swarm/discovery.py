"""
Discovery Service 🔭
Service Registry for the Swarm Mesh.
Allows agents to find each other based on capabilities rather than hardcoded names.
"""
import logging
from typing import List, Dict, Optional

logger = logging.getLogger('DiscoveryService')

class DiscoveryService:
    """
    Central registry for agent capabilities.
    In a distributed mesh, this would be backed by Redis or Consul.
    """
    
    def __init__(self):
        self._capabilities = {}  # {capability: [agent_names]}
        self._agents = {}        # {agent_name: metadata}
    
    def register(self, agent_name: str, capabilities: List[str], metadata: Dict = None):
        """Register an agent and its capabilities."""
        self._agents[agent_name] = metadata or {}
        
        for cap in capabilities:
            if cap not in self._capabilities:
                self._capabilities[cap] = []
            
            if agent_name not in self._capabilities[cap]:
                self._capabilities[cap].append(agent_name)
                
        logger.info(f"🔭 Registered {agent_name} for: {capabilities}")

    def find_agents(self, capability: str) -> List[str]:
        """Find agents that possess a specific capability."""
        return self._capabilities.get(capability, [])

    def get_agent_details(self, agent_name: str) -> Optional[Dict]:
        """Get metadata for a specific agent."""
        return self._agents.get(agent_name)

    def get_all_agents(self) -> List[str]:
        """Get list of all registered agents."""
        return list(self._agents.keys())

    def list_capabilities(self) -> List[str]:
        """Get list of all known capabilities."""
        return list(self._capabilities.keys())

# Singleton
discovery = DiscoveryService()
