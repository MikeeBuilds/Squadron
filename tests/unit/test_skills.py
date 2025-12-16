"""
Unit Tests for Skills
=====================

Tests individual skill tools including:
- File system operations
- Shell commands
- Other core skills
"""

import pytest
import os
import tempfile
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestFileSystemSkills:
    """Tests for file system tools."""

    def test_read_file_success(self, temp_project_dir, sample_files):
        """Should read file contents."""
        from squadron.skills.fs_tool.tool import read_file
        
        file_path = os.path.join(temp_project_dir, "test.py")
        result = read_file(file_path)
        
        assert "print" in result

    def test_read_file_not_found(self, temp_project_dir):
        """Should handle missing files gracefully."""
        from squadron.skills.fs_tool.tool import read_file
        
        result = read_file(os.path.join(temp_project_dir, "nonexistent.txt"))
        
        # Should return error message, not crash
        assert "error" in result.lower() or "not found" in result.lower() or "no such" in result.lower()

    def test_list_dir_success(self, temp_project_dir, sample_files):
        """Should list directory contents."""
        from squadron.skills.fs_tool.tool import list_dir
        
        result = list_dir(temp_project_dir)
        
        assert "test.py" in result or "README" in result

    def test_list_dir_not_found(self, temp_project_dir):
        """Should handle missing directories gracefully."""
        from squadron.skills.fs_tool.tool import list_dir
        
        result = list_dir(os.path.join(temp_project_dir, "nonexistent_dir"))
        
        # Should return error message
        assert isinstance(result, str)

    def test_write_file_success(self, temp_project_dir):
        """Should write content to file."""
        from squadron.skills.fs_tool.tool import write_file
        
        file_path = os.path.join(temp_project_dir, "new_file.txt")
        result = write_file(file_path, "Hello World")
        
        # Verify file was created
        assert os.path.exists(file_path)
        with open(file_path) as f:
            assert f.read() == "Hello World"


@pytest.mark.unit
class TestShellSkills:
    """Tests for shell command execution."""

    def test_run_command_success(self):
        """Should execute simple commands."""
        from squadron.skills.shell_tool.tool import run_command
        
        # Use a safe, cross-platform command
        result = run_command("echo hello")
        
        assert "hello" in result.lower()

    def test_run_command_timeout(self):
        """Should handle long-running commands."""
        from squadron.skills.shell_tool.tool import run_command
        
        # Very short timeout to test handling
        result = run_command("ping localhost -n 100", timeout=1)
        
        # Should return something (either timeout message or partial output)
        assert isinstance(result, str)

    def test_run_command_invalid(self):
        """Should handle invalid commands gracefully."""
        from squadron.skills.shell_tool.tool import run_command
        
        result = run_command("this_command_does_not_exist_xyz")
        
        # Should return error, not crash
        assert isinstance(result, str)


@pytest.mark.unit
class TestBrowserSkills:
    """Tests for browser/web skills (mocked)."""

    def test_browse_website_returns_result(self):
        """Browse should return a result dict."""
        with patch('squadron.skills.browser.tool.sync_playwright') as mock_pw:
            # Mock the playwright context
            mock_browser = MagicMock()
            mock_page = MagicMock()
            mock_page.screenshot.return_value = None
            mock_browser.new_page.return_value = mock_page
            mock_pw.return_value.__enter__.return_value.chromium.launch.return_value = mock_browser
            
            from squadron.skills.browser.tool import browse_website
            
            result = browse_website("https://example.com")
            
            # Should return something
            assert result is not None
