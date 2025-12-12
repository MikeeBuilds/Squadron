import pytest
from squadron import cli

def test_load_agent_config_exists():
    """Verify that the load_agent_config function is accessible."""
    assert callable(cli.load_agent_config)

def test_main_function_exists():
    """Verify that the main function is accessible."""
    assert callable(cli.main)
