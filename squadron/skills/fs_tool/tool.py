
import os
import hashlib

def calculate_checksum(content: str) -> str:
    return hashlib.md5(content.encode('utf-8')).hexdigest()

class FileSystemTool:
    def read_file(self, path: str) -> dict:
        """Reads a file and returns its content."""
        try:
            if not os.path.exists(path):
                return {"text": f"Error: File not found: {path}"}
            
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            return {"text": content}
        except Exception as e:
            return {"text": f"Error reading file: {e}"}

    def list_dir(self, path: str = ".") -> dict:
        """Lists files in a directory."""
        try:
            files = os.listdir(path)
            return {"text": "\n".join(files)}
        except Exception as e:
            return {"text": f"Error listing directory: {e}"}

    def write_file(self, path: str, content: str) -> dict:
        """
        Writes content to a file. 
        HAZARDOUS: This creates or overwrites files.
        SCIENTIFIC: It verifies the write by reading it back.
        """
        try:
            # 1. Hypothesis: We can write to this path
            directory = os.path.dirname(path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory)
            
            # 2. Experiment: Write the file
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            # 3. Observation (Scientific Verification)
            with open(path, 'r', encoding='utf-8') as f:
                read_back = f.read()
            
            original_hash = calculate_checksum(content)
            new_hash = calculate_checksum(read_back)
            
            if original_hash == new_hash:
                return {"text": f"✅ Successfully wrote to {path} (Verified {len(content)} bytes)."}
            else:
                return {"text": f"❌ Verification Failed! Written content does not match."}
                
        except Exception as e:
            return {"text": f"Error writing file: {e}"}

# Expose functions for the Brain
fs = FileSystemTool()
read_file = fs.read_file
list_dir = fs.list_dir
write_file = fs.write_file
