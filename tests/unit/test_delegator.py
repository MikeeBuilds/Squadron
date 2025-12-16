"""
Unit Tests for Delegator (Task Assignment)
==========================================

Tests the swarm delegator functionality including:
- Task assignment to agents
- Task handoff between agents
- Error handling for unknown agents
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestDelegatorAssignment:
    """Tests for task assignment."""

    def test_assign_task_valid_agent(self):
        """Should successfully assign task to valid agent."""
        with patch('squadron.swarm.delegator.SquadronBrain') as mock_brain:
            mock_brain_instance = MagicMock()
            mock_brain_instance.think.return_value = {"action": "reply", "content": "Task completed"}
            mock_brain_instance.execute.return_value = {"text": "Done", "files": []}
            mock_brain.return_value = mock_brain_instance
            
            from squadron.swarm.delegator import assign_task
            
            result = assign_task(
                agent_name="Caleb",
                task="Fix the login bug",
                context={"ticket_id": "PROJ-123"}
            )
            
            assert result is not None
            assert isinstance(result, (str, dict))

    def test_assign_task_unknown_agent(self):
        """Should handle unknown agent gracefully."""
        from squadron.swarm.delegator import assign_task
        
        result = assign_task(
            agent_name="NonExistentAgent",
            task="Do something",
            context=None
        )
        
        # Should return error message, not crash
        assert result is not None


@pytest.mark.unit
class TestDelegatorHandoff:
    """Tests for task handoff between agents."""

    def test_handoff_task(self):
        """Should transfer task between agents."""
        with patch('squadron.swarm.delegator.SquadronBrain') as mock_brain:
            mock_brain_instance = MagicMock()
            mock_brain_instance.think.return_value = {"action": "reply", "content": "Received"}
            mock_brain_instance.execute.return_value = {"text": "Done", "files": []}
            mock_brain.return_value = mock_brain_instance
            
            from squadron.swarm.delegator import handoff_task
            
            result = handoff_task(
                from_agent="Marcus",
                to_agent="Caleb",
                task="Continue implementation",
                notes="I've planned it, you code it"
            )
            
            assert result is not None
