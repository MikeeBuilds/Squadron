
import os
import shutil
from squadron.skills.fs_tool import replace_in_file, insert_into_file, read_file_section, write_file, read_file

TEST_DIR = "test_fs_v2"
TEST_FILE = os.path.join(TEST_DIR, "test.txt")

def setup():
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    os.makedirs(TEST_DIR)
    
    initial_content = """Line 1: Start
Line 2: Middle
Line 3: End
Line 4: Footer"""
    write_file(TEST_FILE, initial_content)
    print("Setup complete")

def test_replace():
    print("\n--- Testing replace_in_file ---")
    res = replace_in_file(TEST_FILE, "Line 2: Middle", "Line 2: CENTER")
    try:
        print(res["text"])
    except:
        print("Result received (output skipped due to encoding)")
    
    content = read_file(TEST_FILE)["text"]
    if "Line 2: CENTER" in content and "Line 2: Middle" not in content:
        print("Replacement verified")
    else:
        print("Replacement failed")

def test_insert():
    print("\n--- Testing insert_into_file ---")
    res = insert_into_file(TEST_FILE, 2, "Line 1.5: Inserted")
    try:
        print(res["text"])
    except:
        print("Result received")
    
    content = read_file(TEST_FILE)["text"]
    lines = content.splitlines()
    if lines[1] == "Line 1.5: Inserted":
        print("Insertion at line 2 verified")
        print(f"   Line 3 is now: {lines[2]}")
    else:
        print(f"Insertion failed. Line 2 is: {lines[1]}")

def test_read_section():
    print("\n--- Testing read_file_section ---")
    # File usage so far:
    # 1: Start
    # 2: Inserted
    # 3: CENTER (was Middle)
    # 4: End
    # 5: Footer
    
    res = read_file_section(TEST_FILE, 2, 4)
    expected = """Line 1.5: Inserted
Line 2: CENTER
Line 3: End
"""
    # Note: read_file_section returns exact lines joined, usually with \n from file
    # Our insert added \n, existing lines had \n implied by splitlines but content from file has it.
    
    try:
        print(f"Result:\n{res['text']}")
    except:
        print("Result content received")
    
    if "Inserted" in res['text'] and "End" in res['text'] and "Start" not in res['text']:
        print("Section read verified")
    else:
        print("Section read failed")

def cleanup():
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    print("\nCleanup complete")

if __name__ == "__main__":
    try:
        setup()
        test_replace()
        test_insert()
        test_read_section()
    finally:
        cleanup()
