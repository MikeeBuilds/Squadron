
"""
SSH Tool 💻
Allows agents (Caleb) to execute commands on remote servers.
Using Paramiko.
"""
import logging
import paramiko
import os

logger = logging.getLogger('SSHTool')

class SSHTool:
    def execute(self, host: str, command: str, user: str = "root") -> str:
        """
        Executes a command on a remote server via SSH.
        Requires SSH keys to be set up or password in env (not recommended for prod, using key-based assumed).
        """
        logger.info(f"💻 SSHing into {user}@{host}: {command}")
        
        # Security check: Prevent dangerous commands (rm -rf /, etc)
        # In a real agent, we might give full power, but for now let's be safe-ish
        if "rm -rf" in command:
            return "Command blocked: Too dangerous."

        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            # Assumes the user has their SSH keys in ~/.ssh/id_rsa
            key_path = os.path.expanduser("~/.ssh/id_rsa")
            
            # If explicit key path needed, or password, we'd add it here.
            # trying default key connect
            client.connect(host, username=user, key_filename=key_path, timeout=10)
            
            stdin, stdout, stderr = client.exec_command(command)
            output = stdout.read().decode().strip()
            errors = stderr.read().decode().strip()
            
            client.close()
            
            if errors:
                return f"Output: {output}\nErrors: {errors}"
            return output
            
        except Exception as e:
            logger.error(f"SSH error: {e}")
            return f"Failed to SSH: {e}"

# Standalone function for the Brain to call
def ssh_command(host: str, command: str):
    tool = SSHTool()
    return tool.execute(host, command)
