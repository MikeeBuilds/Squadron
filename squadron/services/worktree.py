"""
Git Worktree Management for Squadron Agent Tasks

Each agent task gets its own isolated Git worktree to enable:
- Safe parallel execution (no conflicts between agents)
- Protected main branch (changes only via explicit merge)
- Easy discard of failed work
"""

import subprocess
import os
import logging
from typing import Optional, List, Dict
from pathlib import Path

logger = logging.getLogger('Worktree')

# Default worktree directory (relative to repo root)
WORKTREE_DIR = ".worktrees"


def get_repo_root() -> str:
    """Get the root directory of the current Git repository."""
    result = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise RuntimeError("Not in a Git repository")
    return result.stdout.strip()


def create_worktree(task_id: str, base_branch: str = "main") -> str:
    """
    Create an isolated Git worktree for a task.
    
    Args:
        task_id: Unique identifier for the task
        base_branch: Branch to base the worktree on (default: main)
    
    Returns:
        Absolute path to the worktree directory
    
    Example:
        worktree_path = create_worktree("task-123")
        # Creates: .worktrees/task-123/ with branch squadron/task-123
    """
    repo_root = get_repo_root()
    worktree_path = os.path.join(repo_root, WORKTREE_DIR, f"task-{task_id}")
    branch_name = f"squadron/task-{task_id}"
    
    # Ensure worktree directory exists
    os.makedirs(os.path.dirname(worktree_path), exist_ok=True)
    
    # Check if worktree already exists
    if os.path.exists(worktree_path):
        logger.warning(f"Worktree already exists: {worktree_path}")
        return worktree_path
    
    logger.info(f"Creating worktree: {worktree_path} (branch: {branch_name})")
    
    # Create the worktree with a new branch
    result = subprocess.run(
        ["git", "worktree", "add", worktree_path, "-b", branch_name, base_branch],
        capture_output=True,
        text=True,
        cwd=repo_root
    )
    
    if result.returncode != 0:
        raise RuntimeError(f"Failed to create worktree: {result.stderr}")
    
    logger.info(f"✅ Worktree created: {worktree_path}")
    return worktree_path


def cleanup_worktree(task_id: str, merge: bool = False, delete_branch: bool = True) -> bool:
    """
    Remove a worktree after task completion.
    
    Args:
        task_id: Unique identifier for the task
        merge: If True, merge the task branch into main before cleanup
        delete_branch: If True, delete the branch after removing worktree
    
    Returns:
        True if cleanup was successful
    """
    repo_root = get_repo_root()
    worktree_path = os.path.join(repo_root, WORKTREE_DIR, f"task-{task_id}")
    branch_name = f"squadron/task-{task_id}"
    
    if not os.path.exists(worktree_path):
        logger.warning(f"Worktree does not exist: {worktree_path}")
        return False
    
    # Optionally merge before cleanup
    if merge:
        logger.info(f"Merging branch {branch_name} into main...")
        
        # Checkout main first
        subprocess.run(["git", "checkout", "main"], cwd=repo_root, capture_output=True)
        
        # Merge the task branch
        result = subprocess.run(
            ["git", "merge", branch_name, "--no-ff", "-m", f"Merge task {task_id}"],
            capture_output=True,
            text=True,
            cwd=repo_root
        )
        
        if result.returncode != 0:
            logger.error(f"Merge failed: {result.stderr}")
            return False
        
        logger.info(f"✅ Merged {branch_name} into main")
    
    # Remove the worktree
    logger.info(f"Removing worktree: {worktree_path}")
    result = subprocess.run(
        ["git", "worktree", "remove", worktree_path, "--force"],
        capture_output=True,
        text=True,
        cwd=repo_root
    )
    
    if result.returncode != 0:
        logger.error(f"Failed to remove worktree: {result.stderr}")
        return False
    
    # Optionally delete the branch
    if delete_branch:
        subprocess.run(
            ["git", "branch", "-D", branch_name],
            capture_output=True,
            cwd=repo_root
        )
        logger.info(f"✅ Deleted branch {branch_name}")
    
    logger.info(f"✅ Worktree cleaned up: {task_id}")
    return True


def get_worktree_path(task_id: str) -> Optional[str]:
    """
    Get the worktree path for a task if it exists.
    
    Args:
        task_id: Unique identifier for the task
    
    Returns:
        Absolute path to worktree, or None if it doesn't exist
    """
    repo_root = get_repo_root()
    worktree_path = os.path.join(repo_root, WORKTREE_DIR, f"task-{task_id}")
    
    if os.path.exists(worktree_path):
        return worktree_path
    return None


def list_worktrees() -> List[Dict[str, str]]:
    """
    List all active worktrees.
    
    Returns:
        List of dicts with 'path', 'branch', and 'task_id' keys
    """
    repo_root = get_repo_root()
    
    result = subprocess.run(
        ["git", "worktree", "list", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=repo_root
    )
    
    worktrees = []
    current = {}
    
    for line in result.stdout.strip().split('\n'):
        if line.startswith('worktree '):
            if current:
                worktrees.append(current)
            current = {'path': line[9:]}
        elif line.startswith('branch '):
            branch = line[7:]
            current['branch'] = branch
            # Extract task_id from branch name
            if branch.startswith('refs/heads/squadron/task-'):
                current['task_id'] = branch.replace('refs/heads/squadron/task-', '')
    
    if current:
        worktrees.append(current)
    
    # Filter to only return Squadron task worktrees
    return [w for w in worktrees if w.get('task_id')]


def prune_stale_worktrees() -> int:
    """
    Remove stale worktree references (worktrees that were deleted manually).
    
    Returns:
        Number of stale worktrees pruned
    """
    repo_root = get_repo_root()
    
    result = subprocess.run(
        ["git", "worktree", "prune", "-v"],
        capture_output=True,
        text=True,
        cwd=repo_root
    )
    
    # Count pruned entries from verbose output
    pruned = result.stdout.count('Removing')
    if pruned:
        logger.info(f"Pruned {pruned} stale worktree(s)")
    
    return pruned
