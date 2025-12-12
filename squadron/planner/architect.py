
import os
import logging
from datetime import datetime

logger = logging.getLogger('Planner')

class Planner:
    def __init__(self, plan_path="squadron_plan.md"):
        self.plan_path = plan_path

    def create_plan(self, goal: str) -> dict:
        """
        Creates a new plan file based on a high-level goal.
        In a real scenario, this would use an LLM to decompose the goal.
        For now, we will create a structured template.
        """
        try:
            timestamp = datetime.now().isoformat()
            
            # Template for the plan
            plan_content = f"""# 🗺️ Squadron Mission Plan
**Goal**: {goal}
**Created**: {timestamp}
**Status**: IN_PROGRESS

## Strategy
Break down the goal into executable steps.

## Execution Steps
- [ ] Analyze the requirements
- [ ] Create necessary files
- [ ] Verify implementation
- [ ] Mark mission as complete

## Context
- [ ] No specific context provided yet.
"""
            
            with open(self.plan_path, 'w', encoding='utf-8') as f:
                f.write(plan_content)
                
            logger.info(f"🗺️ Plan created at {self.plan_path}")
            return {"text": f"✅ Plan created: {self.plan_path}\nPlease edit it to add specific steps if needed."}
            
        except Exception as e:
            return {"text": f"Error creating plan: {e}"}

    def read_plan(self) -> dict:
        """Reads the current plan."""
        if not os.path.exists(self.plan_path):
            return {"text": "No active plan found. Use 'create_plan' to start one.", "exists": False}
        
        with open(self.plan_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        return {"text": content, "exists": True}

    def update_plan(self, content: str) -> dict:
        """Overwrite the plan with new content (e.g. checking off boxes)."""
        try:
            with open(self.plan_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return {"text": "✅ Plan updated."}
        except Exception as e:
            return {"text": f"Error updating plan: {e}"}

# Expose
planner = Planner()
create_plan = planner.create_plan
read_plan = planner.read_plan
update_plan = planner.update_plan
