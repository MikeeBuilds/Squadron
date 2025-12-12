import pytest
from unittest.mock import patch, MagicMock
import sys
from squadron import cli

def test_report_command():
    """Verify that the 'report' command calls the correct handler."""
    with patch('squadron.cli.handle_report') as mock_handle_report:
        # Simulate the command-line arguments for the 'report' command
        test_args = ['squadron', 'report', '--msg', 'Test message']
        with patch.object(sys, 'argv', test_args):
            cli.main()
        
        # Assert that handle_report was called once
        mock_handle_report.assert_called_once()
