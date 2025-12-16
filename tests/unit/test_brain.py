"""
Unit Tests for Squadron Brain
=============================

Tests the core brain functionality including:
- Tool registration
- Decision routing (reply vs tool)
- Safety interlocks
- Tool execution

All tests use mocked LLM to ensure fast, deterministic results.
"""

import pytest
import json
from unittest.mock import Mock, patch, MagicMock


@pytest.mark.unit
class TestBrainToolRegistration:
    """Tests for tool registration functionality."""

    def test_register_tool_basic(self):
        """Verify tools can be registered with the brain."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    
                    # Register a custom tool
                    brain.register_tool(
                        name="test_tool",
                        description="A test tool",
                        func=lambda x: f"got {x}",
                        hazardous=False
                    )
                    
                    assert "test_tool" in brain.tools
                    assert brain.tools["test_tool"]["description"] == "A test tool"
                    assert brain.tools["test_tool"]["hazardous"] is False

    def test_register_hazardous_tool(self):
        """Verify hazardous tools are marked correctly."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    
                    brain.register_tool(
                        name="dangerous_tool",
                        description="Deletes everything",
                        func=lambda: None,
                        hazardous=True
                    )
                    
                    assert brain.tools["dangerous_tool"]["hazardous"] is True


@pytest.mark.unit
class TestBrainThink:
    """Tests for the think() decision routing."""

    def test_think_returns_reply(self, mock_env):
        """Verify brain routes to reply for conversational input."""
        mock_llm = Mock()
        mock_llm.generate.return_value = json.dumps({
            "action": "reply",
            "content": "Hello! How can I help?"
        })
        
        with patch('squadron.services.model_factory.ModelFactory.create', return_value=mock_llm):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.planner_model = mock_llm
                    
                    result = brain.think("Hello!", agent_profile=None)
                    
                    assert result["action"] == "reply"
                    assert "Hello" in result["content"]

    def test_think_returns_tool_call(self, mock_env):
        """Verify brain routes to tool for actionable requests."""
        mock_llm = Mock()
        mock_llm.generate.return_value = json.dumps({
            "action": "tool",
            "tool_name": "read_file",
            "args": {"path": "/test/file.txt"}
        })
        
        with patch('squadron.services.model_factory.ModelFactory.create', return_value=mock_llm):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.planner_model = mock_llm
                    
                    result = brain.think("Read the config file", agent_profile=None)
                    
                    assert result["action"] == "tool"
                    assert result["tool_name"] == "read_file"

    def test_think_handles_malformed_json(self, mock_env):
        """Verify brain gracefully handles malformed LLM responses."""
        mock_llm = Mock()
        mock_llm.generate.return_value = "This is not JSON at all"
        
        with patch('squadron.services.model_factory.ModelFactory.create', return_value=mock_llm):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.planner_model = mock_llm
                    
                    result = brain.think("Hello", agent_profile=None)
                    
                    # Should fallback to reply with raw content
                    assert result["action"] == "reply"


@pytest.mark.unit
class TestBrainSafety:
    """Tests for safety interlock functionality."""

    def test_safety_allows_non_hazardous(self):
        """Non-hazardous tools should always be allowed."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.safety_mode = True
                    
                    # read_file is registered as non-hazardous
                    result = brain.check_safety("read_file", {"path": "/test"})
                    assert result is True

    def test_safety_blocks_hazardous(self):
        """Hazardous tools should be blocked when safety is on and no user input."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.safety_mode = True
                    
                    # Mock input to simulate user denial
                    with patch('builtins.input', return_value='n'):
                        result = brain.check_safety("run_command", {"command": "rm -rf /"})
                        assert result is False

    def test_god_mode_allows_hazardous(self):
        """Hazardous tools should be allowed when safety is off (god mode)."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.toggle_safety(False)  # Enable god mode
                    
                    result = brain.check_safety("run_command", {"command": "rm -rf /"})
                    assert result is True


@pytest.mark.unit
class TestBrainExecute:
    """Tests for tool execution."""

    def test_execute_reply_returns_text(self):
        """Reply actions should return text content."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    
                    decision = {"action": "reply", "content": "Test response"}
                    result = brain.execute(decision)
                    
                    assert result["text"] == "Test response"
                    assert result["files"] == []

    def test_execute_tool_not_found(self):
        """Missing tools should return an error."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    
                    decision = {
                        "action": "tool",
                        "tool_name": "nonexistent_tool",
                        "args": {}
                    }
                    result = brain.execute(decision)
                    
                    assert "not found" in result["text"].lower()

    def test_execute_tool_success(self):
        """Successful tool execution returns result."""
        with patch('squadron.services.model_factory.ModelFactory.create'):
            with patch('squadron.memory.hippocampus.Hippocampus'):
                with patch('squadron.clients.mcp_client.MCPBridge'):
                    from squadron.brain import SquadronBrain
                    brain = SquadronBrain()
                    brain.safety_mode = False  # Allow execution
                    
                    # Register a simple test tool
                    brain.register_tool(
                        "echo",
                        "Echoes input",
                        lambda msg: f"Echo: {msg}",
                        hazardous=False
                    )
                    
                    decision = {
                        "action": "tool",
                        "tool_name": "echo",
                        "args": {"msg": "hello"}
                    }
                    result = brain.execute(decision)
                    
                    assert "Echo: hello" in result["text"]
