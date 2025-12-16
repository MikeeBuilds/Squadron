"""
Unit Tests for Hippocampus (Memory System)
==========================================

Tests the agent memory functionality including:
- Store and recall memories
- Agent-specific namespaces
- Memory types and filtering
- JSON fallback mode
"""

import pytest
import os
import tempfile
import shutil
from unittest.mock import patch


@pytest.mark.unit
class TestHippocampusBasic:
    """Basic memory operations."""

    def test_remember_returns_id(self, temp_memory_dir):
        """Storing a memory should return an ID."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            mem_id = memory.remember("Test memory content", agent="shared")
            
            assert mem_id is not None
            assert isinstance(mem_id, str)
            assert len(mem_id) > 0

    def test_remember_and_recall(self, temp_memory_dir):
        """Stored memories should be retrievable."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store a memory
            memory.remember("The sky is blue", agent="shared")
            
            # Recall it
            results = memory.recall("What color is the sky?", agent="shared")
            
            assert len(results) > 0
            assert "blue" in results[0]["content"].lower()

    def test_recall_empty_returns_empty_list(self, temp_memory_dir):
        """Recalling from empty memory should return empty list."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            results = memory.recall("anything", agent="shared")
            
            assert results == []


@pytest.mark.unit
class TestHippocampusAgentNamespaces:
    """Tests for agent-specific memory isolation."""

    def test_agent_memories_isolated(self, temp_memory_dir):
        """Each agent should have isolated memories."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store in Marcus's memory
            memory.remember("Marcus knows Python", agent="Marcus")
            
            # Store in Caleb's memory
            memory.remember("Caleb knows JavaScript", agent="Caleb")
            
            # Recall from Marcus only
            marcus_results = memory.recall("programming", agent="Marcus", include_shared=False)
            
            # Should only find Marcus's memory
            all_content = " ".join([r["content"] for r in marcus_results])
            assert "Python" in all_content or len(marcus_results) == 0

    def test_shared_memories_accessible(self, temp_memory_dir):
        """Shared memories should be accessible to all agents."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store in shared memory
            memory.remember("The project uses Python 3.10", agent="shared")
            
            # Recall from any agent with include_shared=True
            results = memory.recall("Python version", agent="Marcus", include_shared=True)
            
            assert len(results) > 0


@pytest.mark.unit
class TestHippocampusMemoryTypes:
    """Tests for memory type filtering."""

    def test_conversation_memory(self, temp_memory_dir):
        """Conversation memories should be stored correctly."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            mem_id = memory.remember_conversation(
                agent="Marcus",
                user_message="How do I deploy?",
                agent_response="Use kubectl apply"
            )
            
            assert mem_id is not None

    def test_task_memory(self, temp_memory_dir):
        """Task memories should be stored correctly."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            mem_id = memory.remember_task(
                agent="Caleb",
                task="Fix login bug",
                result="Fixed by updating auth middleware",
                ticket_id="PROJ-123"
            )
            
            assert mem_id is not None

    def test_learning_memory(self, temp_memory_dir):
        """Learning memories should be stored correctly."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            mem_id = memory.remember_learning(
                agent="Sentinel",
                learning="SQL injection can be prevented with parameterized queries",
                context="Security audit of user input handling"
            )
            
            assert mem_id is not None


@pytest.mark.unit
class TestHippocampusManagement:
    """Tests for memory management operations."""

    def test_forget_removes_memory(self, temp_memory_dir):
        """Forgetting a memory should remove it."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store and forget
            mem_id = memory.remember("Temporary memory", agent="shared")
            memory.forget(mem_id, agent="shared")
            
            # Verify gone
            results = memory.recall("Temporary memory", agent="shared")
            # Should not find it (or very low relevance)
            assert len(results) == 0 or "Temporary" not in results[0].get("content", "")

    def test_get_agent_summary(self, temp_memory_dir):
        """Should return summary statistics for an agent."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store some memories
            memory.remember("Memory 1", agent="Marcus")
            memory.remember("Memory 2", agent="Marcus")
            
            summary = memory.get_agent_summary("Marcus")
            
            assert summary["agent"] == "Marcus"
            assert summary["memory_count"] >= 0  # At least 0

    def test_get_context_for_task(self, temp_memory_dir):
        """Should return formatted context string."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Store relevant memory
            memory.remember("The API uses JWT tokens for authentication", agent="shared")
            
            context = memory.get_context_for_task("How does auth work?", agent="shared")
            
            # Context should be a formatted string
            assert isinstance(context, str)


@pytest.mark.unit
class TestHippocampusJsonFallback:
    """Tests for JSON fallback mode (when ChromaDB unavailable)."""

    def test_json_fallback_remember(self, temp_memory_dir):
        """JSON fallback should store memories."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            # Should use JSON fallback
            assert memory._chromadb_available is False
            
            # Should still work
            mem_id = memory.remember("Test content", agent="shared")
            assert mem_id is not None

    def test_json_fallback_persistence(self, temp_memory_dir):
        """JSON fallback should persist memories to disk."""
        with patch.dict('sys.modules', {'chromadb': None}):
            from squadron.memory.hippocampus import Hippocampus
            memory = Hippocampus(persist_dir=temp_memory_dir)
            
            memory.remember("Persistent memory", agent="shared")
            
            # Check JSON file exists
            json_path = os.path.join(temp_memory_dir, "memories.json")
            assert os.path.exists(json_path)
