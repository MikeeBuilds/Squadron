
import subprocess
import time

class ShellTool:
    def run_command(self, command: str, timeout: int = 30) -> dict:
        """
        Executes a shell command.
        HAZARDOUS: Can modify system state.
        """
        try:
            # Scientific Logging
            start_time = time.time()
            
            # Experiment: Run the process
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=timeout
            )
            
            duration = round(time.time() - start_time, 2)
            
            # Observation
            output = f"Exit Code: {result.returncode}\n"
            output += f"Duration: {duration}s\n"
            output += f"--- STDOUT ---\n{result.stdout}\n"
            if result.stderr:
                output += f"--- STDERR ---\n{result.stderr}\n"
            
            status = "✅ Success" if result.returncode == 0 else "❌ Failed"
            
            return {
                "text": f"{status}\n{output}",
                "exit_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.TimeoutExpired:
            return {"text": f"❌ Error: Command timed out after {timeout} seconds."}
        except Exception as e:
            return {"text": f"❌ Error executing shell command: {e}"}

# Expose
shell = ShellTool()
run_command = shell.run_command
