"""
Watcher 👀
File-based trigger system for Squadron agents.
Watches for TODO: lines in files and executes them via the Wake Protocol.
"""
import time
import os
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

logger = logging.getLogger('Watcher')


class InstructionHandler(FileSystemEventHandler):
    """Handles file change events and triggers agent execution."""
    
    def __init__(self, watch_file: str):
        self.watch_file = os.path.abspath(watch_file)
        self.last_hash = ""  # Deduplication

    def on_modified(self, event):
        if event.is_directory:
            return
            
        if os.path.abspath(event.src_path) == self.watch_file:
            print(f"⚡ Detected change in: {event.src_path}")
            self.process_instruction()

    def process_instruction(self):
        try:
            with open(self.watch_file, 'r') as f:
                content = f.read().strip()
            
            # Simple debounce / preventing loops
            current_hash = hash(content)
            if current_hash == self.last_hash:
                return
            self.last_hash = current_hash

            # Look for lines starting with "TODO:"
            lines = content.split('\n')
            last_line = lines[-1]
            
            if last_line.startswith("TODO:"):
                command = last_line[5:].strip()
                print(f"🤖 Processing Command: {command}")
                
                # Use Wake Protocol instead of direct brain access
                # (Lazy import to avoid circular dependency)
                from squadron.services.wake_protocol import trigger_wake
                
                result = trigger_wake(
                    summary=command,
                    source_type="file",
                    ticket_id=self.watch_file
                )
                
                # Append result to file
                with open(self.watch_file, 'a') as f:
                    if result.get('success'):
                        f.write(f"\n\n🤖 SQUADRON: {result.get('result', 'Done.')}\n")
                    else:
                        f.write(f"\n\n❌ SQUADRON ERROR: {result.get('error', 'Unknown error')}\n")
                    
        except Exception as e:
            print(f"Error processing instruction: {e}")
            logger.error(f"Watcher error: {e}")


def start_watcher(path: str = "INSTRUCTIONS.md"):
    """
    Start watching a file for TODO: lines.
    
    Args:
        path: Path to the file to watch (default: INSTRUCTIONS.md)
    """
    print(f"👀 Watching {path} for 'TODO:' lines...")
    print("   Add a line starting with 'TODO:' to trigger an agent.")
    
    # Create file if not exists
    if not os.path.exists(path):
        with open(path, 'w') as f:
            f.write("# Instructions\n")
            f.write("Add a line starting with 'TODO:' to trigger the Squadron agent.\n\n")
            f.write("Example:\n")
            f.write("TODO: Create a hello world script\n")

    # Start filesystem watcher
    event_handler = InstructionHandler(path)
    observer = Observer()
    
    watch_dir = os.path.dirname(os.path.abspath(path))
    if not watch_dir:
        watch_dir = "."
    
    observer.schedule(event_handler, path=watch_dir, recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Watcher stopped.")
        observer.stop()
    observer.join()


if __name__ == "__main__":
    start_watcher()
