
import subprocess
import os
import re

class GitTool:
    """
    Tool for local Git operations and Merge Conflict Resolution.
    Empowers agents to function as maintainers.
    """
    
    def run_git(self, args: list, cwd: str = ".") -> dict:
        """Runs a git command safely."""
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=False,
                encoding='utf-8',
                errors='replace' # Handle potential encoding issues in git output
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "exit_code": result.returncode
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def git_status(self, cwd: str = ".") -> dict:
        """Returns the current git status."""
        return self.run_git(["status"], cwd)

    def git_checkout(self, branch: str, create: bool = False, cwd: str = ".") -> dict:
        """Switches branches."""
        args = ["checkout"]
        if create:
            args.append("-b")
        args.append(branch)
        return self.run_git(args, cwd)

    def git_commit(self, message: str, cwd: str = ".") -> dict:
        """Commits staged changes."""
        return self.run_git(["commit", "-m", message], cwd)

    def git_push(self, remote: str = "origin", branch: str = "main", cwd: str = ".") -> dict:
        """Pushes to remote."""
        return self.run_git(["push", remote, branch], cwd)
        
    def git_pull(self, remote: str = "origin", branch: str = "main", cwd: str = ".") -> dict:
        """Pulls from remote."""
        return self.run_git(["pull", remote, branch], cwd)

    def get_merge_conflicts(self, file_path: str) -> dict:
        """
        Scans a file for git merge conflict markers.
        Returns the conflicting blocks for the AI to analyze.
        """
        if not os.path.exists(file_path):
            return {"error": "File not found"}
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Regex to find standard git conflict markers
            # <<<<<<< HEAD
            # (our content)
            # =======
            # (their content)
            # >>>>>>> branch_name
            
            pattern = re.compile(
                r'<<<<<<< (.*?)\n(.*?)=======\n(.*?)>>>>>>> (.*?)\n', 
                re.DOTALL
            )
            
            matches = pattern.findall(content)
            
            conflicts = []
            for match in matches:
                conflicts.append({
                    "current_branch": match[0].strip(),
                    "current_content": match[1], # Ours
                    "incoming_content": match[2], # Theirs
                    "incoming_branch": match[3].strip()
                })
                
            if conflicts:
                return {
                    "has_conflicts": True, 
                    "count": len(conflicts), 
                    "conflicts": conflicts,
                    "raw_content": content 
                }
            else:
                return {"has_conflicts": False}
                
        except Exception as e:
            return {"error": str(e)}

    def resolve_conflict(self, file_path: str, resolved_content: str) -> dict:
        """
        Writes the AI-resolved content to the file and stages it.
        """
        try:
             with open(file_path, 'w', encoding='utf-8') as f:
                 f.write(resolved_content)
                 
             # Stage the resolved file
             stage_res = self.run_git(["add", file_path])
             
             if stage_res["success"]:
                 return {"success": True, "message": f"Resolved and staged {file_path}"}
             else:
                 return {"success": False, "error": f"Written but failed to stage: {stage_res['stderr']}"}
                 
        except Exception as e:
            return {"success": False, "error": str(e)}

# Expose
git = GitTool()
git_status = git.git_status
git_checkout = git.git_checkout
git_commit = git.git_commit
git_push = git.git_push
git_pull = git.git_pull
get_merge_conflicts = git.get_merge_conflicts
resolve_conflict = git.resolve_conflict
