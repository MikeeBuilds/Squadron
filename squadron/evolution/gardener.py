"""
The Gardener 🌿
Automated maintenance service for Squadron.
Monitors skill health, attempts auto-repair of broken skills,
and prunes dead code.
"""
import logging
import time
from typing import List, Dict

from squadron.evolution.skill_registry import skill_registry
from squadron.evolution.improver import Improver
from squadron.services.model_factory import ModelFactory

logger = logging.getLogger('Gardener')

class Gardener:
    def __init__(self):
        self.improver = Improver()
        self.llm = ModelFactory.create("gpt-5.1") # Use smart model for coding
    
    def run_cycle(self):
        """Run a full maintenance cycle."""
        logger.info("🌿 Gardener starting maintenance cycle...")
        
        # 1. Identify sick plants
        sick_skills = skill_registry.get_low_quality_skills(threshold=0.6)
        
        if not sick_skills:
            logger.info("🌿 Garden is healthy. No action needed.")
            return
        
        logger.info(f"🌿 Found {len(sick_skills)} ailing skills: {[s['name'] for s in sick_skills]}")
        
        for skill in sick_skills:
            self.cultivate(skill)
            
    def cultivate(self, skill: Dict):
        """Attempt to fix a specific skill."""
        name = skill["name"]
        logger.info(f"🌿 Cultivating '{name}'...")
        
        # Get path and load code
        # Currently the registry doesn't store path directly in all cases, 
        # so we rely on Improver finding it or standard path
        skill_path = os.path.join("squadron/skills/dynamic", f"{name}.py")
        
        if not os.path.exists(skill_path):
            logger.error(f"🌿 Could not find file for '{name}' at {skill_path}")
            return
            
        try:
            with open(skill_path, 'r') as f:
                current_code = f.read()
        except Exception as e:
            logger.error(f"🌿 Failed to read code: {e}")
            return
            
        # Get diagnostic info
        last_error = skill.get("last_error", "Unknown error")
        error_history = skill.get("error_history", [])
        
        prompt = f"""
You are an expert Python developer fixing a broken tool for an AI agent.

TOOL NAME: {name}
CURRENT CODE:
```python
{current_code}
```

RECENT ERROR:
{last_error}

ERROR HISTORY:
{json.dumps(error_history, indent=2)}

INSTRUCTIONS:
1. Analyze the error and the code.
2. Rewrite the code to fix the bug.
3. Ensure the function signature remains compatible if possible.
4. Keep the code clean and idiomatic.
5. Return ONLY the python code, no markdown, no explanation.
"""

        try:
            # Generate fix
            response = self.llm.generate(prompt)
            
            # Clean response (strip markdown)
            fixed_code = response.replace("```python", "").replace("```", "").strip()
            
            if "def " not in fixed_code:
                logger.warning(f"🌿 LLM produced invalid code for {name}")
                return
                
            # Apply fix
            result = self.improver.create_skill(name, fixed_code, author="Gardener")
            
            if result["success"]:
                logger.info(f"🌿 Successfully patched '{name}'")
                skill_registry.reset_stats(name)
            else:
                logger.error(f"🌿 Failed to save patch: {result.get('error')}")
                
        except Exception as e:
            logger.error(f"🌿 Cultivation failed: {e}")

# Singleton
gardener = Gardener()

if __name__ == "__main__":
    # Test run
    import os, json
    # Mocking logging setup for standalone run
    logging.basicConfig(level=logging.INFO)
    gardener.run_cycle()
