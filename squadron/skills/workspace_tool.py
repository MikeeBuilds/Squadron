"""
Workspace Tool 🗄️
Handles initialization and cleanup of local working directories for agents.
"""
import os
import subprocess
import logging
import shutil
import stat

logger = logging.getLogger('WorkspaceTool')

def on_rm_error(func, path, exc_info):
    """
    Error handler for shutil.rmtree.
    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.
    If the error is for another reason it re-raises the error.
    Usage : shutil.rmtree(path, onerror=on_rm_error)
    """
    # Is the error an access error?
    os.chmod(path, stat.S_IWRITE)
    try:
        func(path)
    except Exception as e:
        logger.warning(f"Failed to delete {path} even after chmod: {e}")

def init_workspace(repo_url: str, repo_name: str) -> dict:   
    """
    Ensures a workspace exists and clones a repository into it.
    Args:
        repo_url: The full URL of the repository to clone
        repo_name: The name of the repository (e.g., user/repo)
    Returns:
        Dict with success status and message.
    """
    base_workspace_dir = os.path.join(os.getcwd(), ".squadron", "workspace")
    repo_workspace_dir = os.path.join(base_workspace_dir, repo_name)

    try:
        # 1. Ensure base workspace directory exists
        os.makedirs(base_workspace_dir, exist_ok=True)       
        logger.info(f"Workspace base directory ensured: {base_workspace_dir}")

        # 2. Check if repository already exists in workspace 
        if os.path.exists(repo_workspace_dir):
            logger.info(f"Repository '{repo_name}' already exists at {repo_workspace_dir}. Skipping clone.")
            return {"success": True, "text": f"Workspace ready, repo '{repo_name}' already present."}

        # 3. Clone the repository
        logger.info(f"Cloning '{repo_url}' into {repo_workspace_dir}...")

        # Clone
        clone_command = ["git", "clone", repo_url, repo_workspace_dir]

        result = subprocess.run(
            clone_command,
            capture_output=True,
            text=True,
            check=True
        )

        logger.info(f"Git clone stdout: {result.stdout}")    
        if result.stderr:
            logger.warning(f"Git clone stderr: {result.stderr}")

        return {"success": True, "text": f"Successfully cloned '{repo_name}' to workspace."}

    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to clone repository '{repo_name}': {e.stderr}")
        return {"success": False, "text": f"Failed to clone repository: {e.stderr}"}
    except Exception as e:
        logger.error(f"Error initializing workspace for '{repo_name}': {e}")
        return {"success": False, "text": f"Error initializing workspace: {e}"}

def cleanup_workspace(repo_name: str) -> dict:
    """
    Removes a specific repository's workspace directory.     
    Args:
        repo_name: The name of the repository to clean up.   
    Returns:
        Dict with success status and message.
    """
    repo_workspace_dir = os.path.join(os.getcwd(), ".squadron", "workspace", repo_name)
    try:
        if os.path.exists(repo_workspace_dir):
            # Use error handler for Windows read-only files (.git objects)
            shutil.rmtree(repo_workspace_dir, onerror=on_rm_error)
            logger.info(f"Cleaned up workspace for '{repo_name}': {repo_workspace_dir}")
            return {"success": True, "text": f"Successfully cleaned up workspace for '{repo_name}'."}
        else:
            return {"success": True, "text": f"Workspace for '{repo_name}' not found, no cleanup needed."}
    except Exception as e:
        logger.error(f"Error cleaning up workspace for '{repo_name}': {e}")
        # Even if it fails, we return Success so the agent doesn't loop infinitely on cleanup.
        # It's not critical for mission success.
        return {"success": True, "text": f"Warning: Cleanup failed ({e}), but proceeding."}
