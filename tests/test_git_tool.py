
import os
import shutil
from squadron.skills.git_tool import get_merge_conflicts, resolve_conflict, git_status

TEST_DIR = "test_git_tool"
TEST_FILE = os.path.join(TEST_DIR, "conflict.txt")

def setup():
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    os.makedirs(TEST_DIR)
    
    # Simulate a file with standard git conflict markers
    content = """Line 1: Shared content
<<<<<<< HEAD
Line 2: Change from current branch (OURS)
=======
Line 2: Change from incoming branch (THEIRS)
>>>>>>> feature/new-stuff
Line 3: More shared content
"""
    with open(TEST_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("Setup complete")

def test_conflict_detection():
    print("\n--- Testing get_merge_conflicts ---")
    res = get_merge_conflicts(TEST_FILE)
    
    if res.get("has_conflicts"):
        print("Conflict detected: YES")
        
        conflict = res["conflicts"][0]
        print(f"Current Branch: {conflict['current_branch']}")
        print(f"Incoming Branch: {conflict['incoming_branch']}")
        
        if "OURS" in conflict["current_content"] and "THEIRS" in conflict["incoming_content"]:
            print("Content parsing: PASSED")
        else:
            print("Content parsing: FAILED")
    else:
        print("Conflict detected: NO (Failed)")

def test_resolution():
    print("\n--- Testing resolve_conflict ---")
    
    # AI decides "Theirs" is better
    resolved_text = """Line 1: Shared content
Line 2: Change from incoming branch (THEIRS)
Line 3: More shared content
"""
    
    # Note: resolve_conflict attempts to run 'git add', which might fail if not in a git repo.
    # We expect the file write to succeed regardless.
    res = resolve_conflict(TEST_FILE, resolved_text)
    
    # Check file content
    with open(TEST_FILE, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "THEIRS" in content and "<<<<<<<" not in content:
        print("File resolution: PASSED")
    else:
        print("File resolution: FAILED")

    # We expect 'git add' to fail since this test dir isn't a git repo
    if not res["success"] and "fatal: not a git repository" in res.get("error", ""):
        print("Git add behavior: EXPECTED (Not a git repo)")
    elif res["success"]:
        print("Git add behavior: SURPRISING (Is this a git repo?)")

def cleanup():
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    print("\nCleanup complete")

if __name__ == "__main__":
    try:
        setup()
        test_conflict_detection()
        test_resolution()
    finally:
        cleanup()
