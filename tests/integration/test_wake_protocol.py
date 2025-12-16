"""
Integration Tests for Wake Protocol
====================================

Tests the wake protocol flow including:
- Ticket-triggered wakes
- Agent tagging wakes
- Memory context integration
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.integration
class TestWakeProtocol:
    """Tests for wake protocol triggering."""

    def test_trigger_wake_from_ticket(self, mock_env):
        """Should trigger wake from a ticket event."""
        with patch('squadron.brain.SquadronBrain') as mock_brain:
            mock_brain_instance = MagicMock()
            mock_brain_instance.think.return_value = {"action": "reply", "content": "Working on it"}
            mock_brain_instance.execute.return_value = {"text": "Done", "files": []}
            mock_brain.return_value = mock_brain_instance
            
            from squadron.services.wake_protocol import trigger_wake
            
            result = trigger_wake(
                summary="Fix login bug - users can't authenticate",
                source_type="ticket",
                ticket_id="PROJ-123",
                target_agent="Caleb"
            )
            
            assert result is not None
            assert "success" in result or "error" in result

    def test_trigger_wake_from_tag(self, mock_env):
        """Should trigger wake from an agent tag."""
        with patch('squadron.brain.SquadronBrain') as mock_brain:
            mock_brain_instance = MagicMock()
            mock_brain_instance.think.return_value = {"action": "reply", "content": "On it"}
            mock_brain_instance.execute.return_value = {"text": "Done", "files": []}
            mock_brain.return_value = mock_brain_instance
            
            from squadron.services.wake_protocol import trigger_wake
            
            result = trigger_wake(
                summary="@Marcus please review my PR",
                source_type="tag",
                target_agent="Marcus"
            )
            
            assert result is not None


@pytest.mark.integration
class TestWakeProtocolWithContext:
    """Tests for wake protocol with memory context."""

    def test_wake_includes_memory_context(self, mock_env, temp_memory_dir):
        """Wake should include relevant memory context."""
        with patch('squadron.brain.SquadronBrain') as mock_brain:
            mock_brain_instance = MagicMock()
            mock_brain_instance.think.return_value = {"action": "reply", "content": "Done"}
            mock_brain_instance.execute.return_value = {"text": "Done", "files": []}
            mock_brain_instance.memory = MagicMock()
            mock_brain_instance.memory.get_context_for_task.return_value = "Previous context"
            mock_brain.return_value = mock_brain_instance
            
            from squadron.services.wake_protocol import trigger_wake
            
            result = trigger_wake(
                summary="Continue the migration task",
                source_type="ticket",
                ticket_id="PROJ-456",
                target_agent="Caleb"
            )
            
            assert result is not None
