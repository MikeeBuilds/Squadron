import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'Squadron-Repo'))

from squadron.brain import brain

print("🧠 Brain Loaded")
print(f"Tools: {list(brain.tools.keys())}")

# Try to init MCP (should handle empty config gracefully)
try:
    brain.initialize_mcp()
    print("✅ MCP Init success (empty/no config)")
except Exception as e:
    print(f"❌ MCP Init failed: {e}")
