
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

    def replace_in_file(self, path: str, old_text: str, new_text: str) -> dict:
        """
        Replaces 'old_text' with 'new_text' in the file at 'path'.
        HAZARDOUS: Modifies file content.
        SCIENTIFIC: Verifies replacement.
        """
        try:
            if not os.path.exists(path):
                return {"text": f"Error: File not found: {path}"}
            
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if old_text not in content:
                return {"text": f"Error: 'old_text' not found in {path}"}
            
            # Experiment: Perform replacement
            new_content = content.replace(old_text, new_text)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            # Observation
            with open(path, 'r', encoding='utf-8') as f:
                read_back = f.read()
                
            if calculate_checksum(new_content) == calculate_checksum(read_back):
                 return {"text": f"✅ Successfully replaced text in {path}."}
            else:
                 return {"text": "❌ Verification Failed! Replacement mismatch."}

        except Exception as e:
            return {"text": f"Error replacing text: {e}"}

    def insert_into_file(self, path: str, line_number: int, text: str) -> dict:
        """
        Inserts 'text' at 'line_number' (1-indexed) in the file at 'path'.
        HAZARDOUS: Modifies file content.
        SCIENTIFIC: Verifies insertion.
        """
        try:
            if not os.path.exists(path):
                return {"text": f"Error: File not found: {path}"}

            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if line_number < 1 or line_number > len(lines) + 1:
                return {"text": f"Error: Line number {line_number} out of bounds (1-{len(lines)+1})"}
            
            # Experiment: Insert line
            # Adjust for 0-indexing
            lines.insert(line_number - 1, text + '\n')
            
            new_content = "".join(lines)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            # Observation
            with open(path, 'r', encoding='utf-8') as f:
                read_back = f.read()
            
            if calculate_checksum(new_content) == calculate_checksum(read_back):
                 return {"text": f"✅ Successfully inserted text at line {line_number} in {path}."}
            else:
                 return {"text": "❌ Verification Failed! Insertion mismatch."}

        except Exception as e:
            return {"text": f"Error inserting text: {e}"}

    def read_file_section(self, path: str, start_line: int, end_line: int) -> dict:
        """
        Reads lines from 'start_line' to 'end_line' (1-indexed).
        """
        try:
             if not os.path.exists(path):
                return {"text": f"Error: File not found: {path}"}
            
             with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
             if start_line < 1 or end_line > len(lines):
                 return {"text": f"Error: Line range {start_line}-{end_line} out of bounds (1-{len(lines)})"}
                 
             # Adjust for 0-indexing
             # start_line - 1 because we want to include the start line
             # end_line because slice is exclusive check logic
             # e.g. lines 1-2. lines[0:2] -> lines[0], lines[1]. Correct.
             
             section = lines[start_line-1:end_line]
             content = "".join(section)
             
             return {"text": content}
             
        except Exception as e:
            return {"text": f"Error reading file section: {e}"}

# Expose functions for the Brain
fs = FileSystemTool()
read_file = fs.read_file
list_dir = fs.list_dir
write_file = fs.write_file
replace_in_file = fs.replace_in_file
insert_into_file = fs.insert_into_file
read_file_section = fs.read_file_section
