"""
Enhanced Hippocampus v2.0 🧠
Persistent semantic memory for Squadron agents.

Features:
- Agent-specific memory namespaces
- Conversation history tracking
- Semantic search with context
- Memory summaries and consolidation
- Ticket/task memory associations
"""
import os
import uuid
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

logger = logging.getLogger('Hippocampus')


class Hippocampus:
    """
    The Hippocampus is the agent's long-term memory system.
    Uses ChromaDB for semantic similarity search.
    """
    
    def __init__(self, persist_dir: str = None):
        if not persist_dir:
            persist_dir = os.path.join(os.getcwd(), ".squadron", "memory")
        
        os.makedirs(persist_dir, exist_ok=True)
        self.persist_dir = persist_dir
        
        logger.info(f"🧠 Initializing Memory at {persist_dir}")
        
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=persist_dir)
            self._chromadb_available = True
        except ImportError:
            logger.warning("ChromaDB not available, using JSON fallback")
            self._chromadb_available = False
            self._json_path = os.path.join(persist_dir, "memories.json")
            self._memories = self._load_json_memories()
        
        # Initialize collections per agent
        self.collections = {}
        self._init_collections()
    
    def _init_collections(self):
        """Initialize memory collections for each agent."""
        agents = ["Marcus", "Caleb", "Sentinel", "shared"]
        
        if self._chromadb_available:
            for agent in agents:
                self.collections[agent] = self.client.get_or_create_collection(
                    name=f"squadron_{agent.lower()}_memory"
                )
        else:
            for agent in agents:
                if agent not in self._memories:
                    self._memories[agent] = []
    
    def _load_json_memories(self) -> dict:
        """Load memories from JSON fallback."""
        if os.path.exists(self._json_path):
            try:
                with open(self._json_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {}
    
    def _save_json_memories(self):
        """Save memories to JSON fallback."""
        with open(self._json_path, 'w') as f:
            json.dump(self._memories, f, indent=2)
    
    def remember(
        self, 
        text: str, 
        agent: str = "shared",
        metadata: dict = None,
        memory_type: str = "general"
    ) -> str:
        """
        Store a memory.
        
        Args:
            text: The memory content
            agent: Which agent this memory belongs to (or "shared")
            metadata: Additional context (ticket_id, task, etc.)
            memory_type: "general" | "conversation" | "task" | "learning"
        
        Returns:
            Memory ID
        """
        if metadata is None:
            metadata = {}
        
        metadata["timestamp"] = datetime.now().isoformat()
        metadata["memory_type"] = memory_type
        metadata["agent"] = agent
        
        mem_id = str(uuid.uuid4())
        
        if self._chromadb_available:
            collection = self.collections.get(agent) or self.collections["shared"]
            try:
                collection.add(
                    documents=[text],
                    metadatas=[metadata],
                    ids=[mem_id]
                )
                logger.info(f"💾 [{agent}] Stored: '{text[:50]}...' ({mem_id})")
                return mem_id
            except Exception as e:
                logger.error(f"Memory store failed: {e}")
                return None
        else:
            # JSON fallback
            if agent not in self._memories:
                self._memories[agent] = []
            
            self._memories[agent].append({
                "id": mem_id,
                "text": text,
                "metadata": metadata
            })
            self._save_json_memories()
            logger.info(f"💾 [{agent}] Stored: '{text[:50]}...'")
            return mem_id
    
    def recall(
        self, 
        query: str, 
        agent: str = None,
        n_results: int = 5,
        memory_type: str = None,
        include_shared: bool = True
    ) -> List[Dict]:
        """
        Retrieve relevant memories using semantic search.
        
        Args:
            query: What to search for
            agent: Limit to specific agent's memories
            n_results: Max number of results
            memory_type: Filter by type
            include_shared: Also search shared memories
        
        Returns:
            List of memory dicts with content and metadata
        """
        if self._chromadb_available:
            return self._recall_chromadb(query, agent, n_results, memory_type, include_shared)
        else:
            return self._recall_json(query, agent, n_results, memory_type, include_shared)
    
    def _recall_chromadb(self, query, agent, n_results, memory_type, include_shared):
        """ChromaDB-based recall."""
        all_results = []
        
        # Build list of collections to search
        collections_to_search = []
        if agent and agent in self.collections:
            collections_to_search.append(self.collections[agent])
        if include_shared and "shared" in self.collections:
            collections_to_search.append(self.collections["shared"])
        if not agent:
            collections_to_search = list(self.collections.values())
        
        where_filter = None
        if memory_type:
            where_filter = {"memory_type": memory_type}
        
        for collection in collections_to_search:
            try:
                results = collection.query(
                    query_texts=[query],
                    n_results=n_results,
                    where=where_filter
                )
                
                if results["documents"]:
                    for i, doc in enumerate(results["documents"][0]):
                        meta = results["metadatas"][0][i] if results["metadatas"] else {}
                        distance = results["distances"][0][i] if "distances" in results else 0
                        all_results.append({
                            "content": doc,
                            "metadata": meta,
                            "relevance": 1 - distance  # Convert distance to relevance
                        })
            except Exception as e:
                logger.error(f"Recall error: {e}")
        
        # Sort by relevance and limit
        all_results.sort(key=lambda x: x.get("relevance", 0), reverse=True)
        return all_results[:n_results]
    
    def _recall_json(self, query, agent, n_results, memory_type, include_shared):
        """JSON fallback recall (simple keyword matching)."""
        all_results = []
        query_lower = query.lower()
        
        agents_to_search = []
        if agent:
            agents_to_search.append(agent)
        if include_shared:
            agents_to_search.append("shared")
        if not agent:
            agents_to_search = list(self._memories.keys())
        
        for agent_name in agents_to_search:
            for memory in self._memories.get(agent_name, []):
                # Simple keyword matching
                text = memory["text"].lower()
                if query_lower in text or any(word in text for word in query_lower.split()):
                    if memory_type and memory["metadata"].get("memory_type") != memory_type:
                        continue
                    all_results.append({
                        "content": memory["text"],
                        "metadata": memory["metadata"],
                        "relevance": 0.5  # Placeholder
                    })
        
        return all_results[:n_results]
    
    def remember_conversation(
        self, 
        agent: str, 
        user_message: str, 
        agent_response: str,
        ticket_id: str = None
    ):
        """Store a conversation turn."""
        text = f"User: {user_message}\n{agent}: {agent_response}"
        
        metadata = {
            "user_message": user_message[:500],
            "agent_response": agent_response[:500]
        }
        if ticket_id:
            metadata["ticket_id"] = ticket_id
        
        return self.remember(text, agent=agent, metadata=metadata, memory_type="conversation")
    
    def remember_task(self, agent: str, task: str, result: str, ticket_id: str = None):
        """Store a completed task."""
        text = f"Task: {task}\nResult: {result}"
        
        metadata = {"task": task[:200], "result": result[:500]}
        if ticket_id:
            metadata["ticket_id"] = ticket_id
        
        return self.remember(text, agent=agent, metadata=metadata, memory_type="task")
    
    def remember_learning(self, agent: str, learning: str, context: str = None):
        """Store something the agent learned."""
        text = f"Learning: {learning}"
        if context:
            text += f"\nContext: {context}"
        
        return self.remember(text, agent=agent, metadata={"context": context}, memory_type="learning")
    
    def get_context_for_task(self, task: str, agent: str = None, max_memories: int = 5) -> str:
        """
        Get relevant context from memory for a new task.
        Returns formatted string suitable for including in agent prompt.
        """
        memories = self.recall(task, agent=agent, n_results=max_memories)
        
        if not memories:
            return ""
        
        context_parts = ["## Relevant Memory Context"]
        for i, mem in enumerate(memories, 1):
            timestamp = mem["metadata"].get("timestamp", "unknown")
            context_parts.append(f"\n### Memory {i} ({timestamp[:10] if timestamp != 'unknown' else 'unknown'})")
            context_parts.append(mem["content"][:500])
        
        return "\n".join(context_parts)
    
    def get_agent_summary(self, agent: str) -> Dict:
        """Get summary statistics for an agent's memory."""
        if self._chromadb_available:
            collection = self.collections.get(agent)
            if collection:
                count = collection.count()
                return {"agent": agent, "memory_count": count}
        else:
            count = len(self._memories.get(agent, []))
            return {"agent": agent, "memory_count": count}
        
        return {"agent": agent, "memory_count": 0}
    
    def forget(self, mem_id: str, agent: str = "shared"):
        """Delete a memory by ID."""
        if self._chromadb_available:
            collection = self.collections.get(agent)
            if collection:
                collection.delete(ids=[mem_id])
        else:
            if agent in self._memories:
                self._memories[agent] = [m for m in self._memories[agent] if m["id"] != mem_id]
                self._save_json_memories()
    
    def clear_agent_memory(self, agent: str):
        """Clear all memories for an agent (use with caution!)."""
        if self._chromadb_available:
            if agent in self.collections:
                # Delete and recreate collection
                self.client.delete_collection(f"squadron_{agent.lower()}_memory")
                self.collections[agent] = self.client.get_or_create_collection(
                    name=f"squadron_{agent.lower()}_memory"
                )
        else:
            if agent in self._memories:
                self._memories[agent] = []
                self._save_json_memories()


# Singleton instance
memory_store = Hippocampus()

# Convenience functions
def remember(text: str, agent: str = "shared", **kwargs) -> str:
    return memory_store.remember(text, agent=agent, **kwargs)

def recall(query: str, agent: str = None, **kwargs) -> List[Dict]:
    return memory_store.recall(query, agent=agent, **kwargs)

def get_context_for_task(task: str, agent: str = None) -> str:
    return memory_store.get_context_for_task(task, agent=agent)

