"""
Squadron Test Suite - Shared Fixtures
=====================================

This module provides reusable test fixtures for the Squadron test suite.
All fixtures use mocking to ensure fast, deterministic tests.

Usage:
    def test_something(mock_llm, temp_memory):
        # mock_llm is a pre-configured LLM mock
        # temp_memory is a temporary Hippocampus instance
        pass
"""

import pytest
import os
import sys
import json
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any


# =============================================================================
# Environment Fixtures
# =============================================================================

@pytest.fixture
def mock_env(monkeypatch):
    """
    Set up test environment variables.
    Prevents tests from using real API keys.
    """
    test_env = {
        "GEMINI_API_KEY": "test-gemini-key",
        "JIRA_SERVER": "https://test.atlassian.net",
        "JIRA_EMAIL": "test@example.com",
        "JIRA_TOKEN": "test-jira-token",
        "GITHUB_TOKEN": "test-github-token",
        "GITHUB_REPO": "TestOrg/TestRepo",
        "DISCORD_BOT_TOKEN": "test-discord-token",
        "SLACK_BOT_TOKEN": "test-slack-token",
    }
    for key, value in test_env.items():
        monkeypatch.setenv(key, value)
    return test_env


# =============================================================================
# LLM Fixtures
# =============================================================================

@pytest.fixture
def mock_llm():
    """
    Mock LLM that returns predictable responses.
    
    Usage:
        def test_brain_routing(mock_llm):
            mock_llm.generate.return_value = '{"action": "reply", "content": "Hello!"}'
    """
    mock = Mock()
    mock.generate.return_value = '{"action": "reply", "content": "Test response"}'
    return mock


@pytest.fixture
def mock_llm_tool_response():
    """Mock LLM configured to return a tool call."""
    mock = Mock()
    mock.generate.return_value = json.dumps({
        "action": "tool",
        "tool_name": "read_file",
        "args": {"path": "/test/file.txt"}
    })
    return mock


# =============================================================================
# Memory Fixtures
# =============================================================================

@pytest.fixture
def temp_memory_dir():
    """Create a temporary directory for memory storage."""
    temp_dir = tempfile.mkdtemp(prefix="squadron_test_")
    yield temp_dir
    # Cleanup after test
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def temp_memory(temp_memory_dir):
    """
    Temporary Hippocampus instance using JSON fallback.
    Automatically cleaned up after test.
    """
    # Force JSON fallback by patching chromadb import
    with patch.dict(sys.modules, {'chromadb': None}):
        from squadron.memory.hippocampus import Hippocampus
        memory = Hippocampus(persist_dir=temp_memory_dir)
        yield memory


# =============================================================================
# Brain Fixtures
# =============================================================================

@pytest.fixture
def mock_brain(mock_llm, temp_memory):
    """
    Brain instance with mocked LLM and temporary memory.
    Safe for testing without external API calls.
    """
    with patch('squadron.services.model_factory.ModelFactory.create', return_value=mock_llm):
        with patch('squadron.memory.hippocampus.Hippocampus', return_value=temp_memory):
            from squadron.brain import SquadronBrain
            brain = SquadronBrain()
            brain.planner_model = mock_llm
            brain.memory = temp_memory
            yield brain


# =============================================================================
# External Service Mocks
# =============================================================================

@pytest.fixture
def mock_jira():
    """Mock Jira client for testing integrations."""
    mock = Mock()
    mock.search_issues.return_value = []
    mock.issue.return_value = Mock(
        key="TEST-123",
        fields=Mock(
            summary="Test Issue",
            description="Test description",
            status=Mock(name="To Do")
        )
    )
    mock.add_comment.return_value = Mock(id="12345")
    return mock


@pytest.fixture
def mock_github():
    """Mock GitHub client for testing integrations."""
    mock = Mock()
    mock.get_repo.return_value = Mock(
        full_name="TestOrg/TestRepo",
        get_issues=Mock(return_value=[]),
        create_issue=Mock(return_value=Mock(number=1, html_url="https://github.com/TestOrg/TestRepo/issues/1"))
    )
    return mock


@pytest.fixture
def mock_discord():
    """Mock Discord bot for testing."""
    mock = Mock()
    mock.guilds = []
    mock.user = Mock(name="TestBot")
    return mock


# =============================================================================
# CLI Fixtures
# =============================================================================

@pytest.fixture
def cli_runner():
    """CLI test runner using subprocess."""
    import subprocess
    
    def run_cli(*args):
        cmd = [sys.executable, "-m", "squadron.cli"] + list(args)
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        return result
    
    return run_cli


# =============================================================================
# File System Fixtures
# =============================================================================

@pytest.fixture
def temp_project_dir():
    """
    Create a temporary project directory for testing squadron init.
    """
    temp_dir = tempfile.mkdtemp(prefix="squadron_project_")
    original_cwd = os.getcwd()
    os.chdir(temp_dir)
    yield temp_dir
    os.chdir(original_cwd)
    shutil.rmtree(temp_dir, ignore_errors=True)


@pytest.fixture
def sample_files(temp_project_dir):
    """Create sample files for testing file operations."""
    files = {
        "test.py": "print('hello')",
        "README.md": "# Test Project",
        "src/main.py": "def main(): pass",
    }
    for path, content in files.items():
        full_path = os.path.join(temp_project_dir, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
    return files
