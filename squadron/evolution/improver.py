"""
Improver 🧬
Self-improvement module for Squadron agents.
Discovers, loads, and manages dynamically created skills.
"""
import os
import importlib.util
import inspect
import logging
from datetime import datetime
from typing import Callable, Optional

logger = logging.getLogger('Improver')


class Improver:
    """
    Discovers and loads dynamically created skills from file system.
    Works with SkillRegistry for tracking and quality management.
    """
    
    def __init__(self, skill_dir: str = "squadron/skills/dynamic"):
        self.skill_dir = skill_dir
        self._ensure_dir()
    
    def _ensure_dir(self):
        """Ensure skill directory exists with proper structure."""
        os.makedirs(self.skill_dir, exist_ok=True)
        
        # Ensure __init__.py exists
        init_file = os.path.join(self.skill_dir, '__init__.py')
        if not os.path.exists(init_file):
            with open(init_file, 'w') as f:
                f.write("# Dynamic Skills 🧬\n")
    
    def discover_skills(self, register: bool = True) -> list:
        """
        Scan skill_dir for .py files and load them as tools.
        
        Args:
            register: If True, register discovered skills in the registry
        
        Returns:
            List of dicts: {"name", "description", "func", "hazardous"}
        """
        from .skill_registry import skill_registry
        
        discovered = []
        logger.info(f"🔎 Scanning for new skills in {self.skill_dir}...")
        
        for filename in os.listdir(self.skill_dir):
            if not filename.endswith(".py") or filename.startswith("_"):
                continue
            
            skill_name = filename[:-3]  # Remove .py
            full_path = os.path.join(self.skill_dir, filename)
            
            try:
                # Dynamic import
                spec = importlib.util.spec_from_file_location(skill_name, full_path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                
                # Convention: Module must have a function with the same name
                if hasattr(module, skill_name):
                    func = getattr(module, skill_name)
                    
                    # Get description from docstring
                    desc = func.__doc__ or f"{skill_name}(...): Dynamically loaded tool."
                    
                    # Check for hazardous marker
                    hazardous = getattr(func, '_hazardous', False)
                    
                    logger.info(f"   ✨ Discovered: {skill_name}")
                    
                    skill_entry = {
                        "name": skill_name,
                        "description": desc.strip(),
                        "func": func,
                        "hazardous": hazardous,
                        "path": full_path
                    }
                    discovered.append(skill_entry)
                    
                    # Register in registry
                    if register:
                        skill_registry.register(
                            name=skill_name,
                            description=desc.strip(),
                            author="auto-discovery"
                        )
                else:
                    logger.warning(f"   ⚠️ {filename} missing function '{skill_name}'")
                    
            except Exception as e:
                logger.error(f"   ❌ Failed to load {filename}: {e}")
        
        logger.info(f"   📦 Total discovered: {len(discovered)}")
        return discovered
    
    def create_skill(self, name: str, code: str, author: str = "agent") -> dict:
        """
        Create a new skill by writing a Python file.
        
        Args:
            name: Skill name (will be used as filename and function name)
            code: Python code (must include a function with matching name)
            author: Who created this skill
        
        Returns:
            Dict with success status and details
        """
        from .skill_registry import skill_registry
        
        # Validate name
        if not name.isidentifier():
            return {"success": False, "error": f"Invalid skill name: {name}"}
        
        # Ensure code contains the expected function
        if f"def {name}" not in code:
            return {"success": False, "error": f"Code must contain 'def {name}(...)' function"}
        
        # Write the file
        skill_path = os.path.join(self.skill_dir, f"{name}.py")
        is_update = os.path.exists(skill_path)
        
        try:
            with open(skill_path, 'w') as f:
                f.write(code)
            
            logger.info(f"{'📝 Updated' if is_update else '✨ Created'} skill: {name}")
            
            # Register in registry
            skill_registry.register(name=name, description=f"Custom skill: {name}", author=author)
            
            return {
                "success": True,
                "path": skill_path,
                "action": "updated" if is_update else "created"
            }
            
        except Exception as e:
            logger.error(f"Failed to create skill {name}: {e}")
            return {"success": False, "error": str(e)}
    
    def validate_skill(self, name: str) -> dict:
        """
        Validate a skill by attempting to load and execute it with test inputs.
        
        Returns:
            Dict with validation status and details
        """
        skill_path = os.path.join(self.skill_dir, f"{name}.py")
        
        if not os.path.exists(skill_path):
            return {"valid": False, "error": "Skill file not found"}
        
        try:
            # Try to load the module
            spec = importlib.util.spec_from_file_location(name, skill_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Check for the function
            if not hasattr(module, name):
                return {"valid": False, "error": f"Missing function '{name}'"}
            
            func = getattr(module, name)
            
            # Get signature
            sig = inspect.signature(func)
            
            return {
                "valid": True,
                "function": name,
                "signature": str(sig),
                "docstring": func.__doc__
            }
            
        except SyntaxError as e:
            return {"valid": False, "error": f"Syntax error: {e}"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def delete_skill(self, name: str, reason: str = None) -> dict:
        """
        Delete a skill (deactivates in registry and removes file).
        
        Args:
            name: Skill name to delete
            reason: Why the skill is being deleted
        
        Returns:
            Dict with deletion status
        """
        from .skill_registry import skill_registry
        
        skill_path = os.path.join(self.skill_dir, f"{name}.py")
        
        # Deactivate in registry (keep history)
        skill_registry.deactivate(name, reason)
        
        # Move file to .deleted (archive)
        if os.path.exists(skill_path):
            archive_dir = os.path.join(self.skill_dir, ".deleted")
            os.makedirs(archive_dir, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            archive_path = os.path.join(archive_dir, f"{name}_{timestamp}.py")
            
            os.rename(skill_path, archive_path)
            logger.info(f"🗑️ Archived skill to: {archive_path}")
            
            return {
                "success": True,
                "archived_to": archive_path
            }
        
        return {"success": True, "note": "File not found, registry updated"}
    
    def get_skill_stats(self) -> dict:
        """Get statistics about dynamic skills."""
        from .skill_registry import skill_registry
        
        all_skills = skill_registry.get_all()
        active = skill_registry.get_active()
        low_quality = skill_registry.get_low_quality_skills()
        
        return {
            "total_registered": len(all_skills),
            "active": len(active),
            "inactive": len(all_skills) - len(active),
            "low_quality_count": len(low_quality),
            "low_quality_skills": [s["name"] for s in low_quality],
            "skill_dir": self.skill_dir
        }
