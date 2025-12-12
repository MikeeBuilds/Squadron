"""
Skill Registry 🧬
Persistent registry for evolved (dynamically created) skills.
Tracks versioning, quality scores, and audit trails.
"""
import os
import json
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger('SkillRegistry')

REGISTRY_FILE = "squadron/skills/dynamic/registry.json"


class SkillRegistry:
    """
    Persistent storage for skill metadata.
    Tracks versions, success/failure rates, and authorship.
    """
    
    def __init__(self, registry_path: str = REGISTRY_FILE):
        self.registry_path = registry_path
        self.skills = {}
        self._load()
    
    def _load(self):
        """Load registry from disk."""
        if os.path.exists(self.registry_path):
            try:
                with open(self.registry_path, 'r') as f:
                    self.skills = json.load(f)
                logger.info(f"📖 Loaded {len(self.skills)} skills from registry")
            except Exception as e:
                logger.warning(f"Failed to load registry: {e}")
                self.skills = {}
        else:
            self.skills = {}
    
    def _save(self):
        """Persist registry to disk."""
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.registry_path), exist_ok=True)
            with open(self.registry_path, 'w') as f:
                json.dump(self.skills, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save registry: {e}")
    
    def register(self, name: str, description: str, author: str = "agent", version: int = None) -> dict:
        """
        Register a new skill or update an existing one.
        
        Args:
            name: Skill name (e.g., "magic_math")
            description: What the skill does
            author: Who created it
            version: Explicit version number, or auto-increment
        
        Returns:
            The skill entry
        """
        now = datetime.now().isoformat()
        
        if name in self.skills:
            # Increment version
            existing = self.skills[name]
            new_version = version or (existing.get("version", 1) + 1)
            
            # Store previous version in history
            if "history" not in existing:
                existing["history"] = []
            existing["history"].append({
                "version": existing["version"],
                "description": existing["description"],
                "archived": now
            })
            
            existing["version"] = new_version
            existing["description"] = description
            existing["updated"] = now
            existing["updated_by"] = author
            
            logger.info(f"📝 Updated skill '{name}' to v{new_version}")
            entry = existing
        else:
            # New skill
            entry = {
                "name": name,
                "version": version or 1,
                "description": description,
                "author": author,
                "created": now,
                "updated": now,
                "success_count": 0,
                "failure_count": 0,
                "quality_score": 1.0,  # Start with perfect score
                "status": "active",
                "history": []
            }
            self.skills[name] = entry
            logger.info(f"✨ Registered new skill '{name}' v1")
        
        self._save()
        return entry
    
    def increment_success(self, name: str):
        """Record a successful execution of a skill."""
        if name in self.skills:
            self.skills[name]["success_count"] += 1
            self._update_quality_score(name)
            self._save()
    
    def increment_failure(self, name: str):
        """Record a failed execution of a skill."""
        if name in self.skills:
            self.skills[name]["failure_count"] += 1
            self._update_quality_score(name)
            self._save()
    
    def _update_quality_score(self, name: str):
        """Recalculate quality score based on success/failure ratio."""
        skill = self.skills[name]
        total = skill["success_count"] + skill["failure_count"]
        if total > 0:
            skill["quality_score"] = round(skill["success_count"] / total, 3)
    
    def get_quality_score(self, name: str) -> float:
        """Get the quality score for a skill (0.0 - 1.0)."""
        if name in self.skills:
            return self.skills[name].get("quality_score", 0.0)
        return 0.0
    
    def get(self, name: str) -> Optional[dict]:
        """Get skill metadata by name."""
        return self.skills.get(name)
    
    def get_all(self) -> list:
        """Get all registered skills."""
        return list(self.skills.values())
    
    def get_active(self) -> list:
        """Get only active skills."""
        return [s for s in self.skills.values() if s.get("status") == "active"]
    
    def deactivate(self, name: str, reason: str = None) -> bool:
        """Deactivate a skill (soft delete)."""
        if name in self.skills:
            self.skills[name]["status"] = "inactive"
            self.skills[name]["deactivated"] = datetime.now().isoformat()
            self.skills[name]["deactivate_reason"] = reason
            self._save()
            logger.info(f"🚫 Deactivated skill '{name}': {reason}")
            return True
        return False
    
    def rollback(self, name: str, to_version: int = None) -> bool:
        """
        Rollback a skill to a previous version.
        
        Args:
            name: Skill name
            to_version: Target version (or previous version if None)
        
        Returns:
            True if rollback succeeded
        """
        if name not in self.skills:
            logger.warning(f"Skill '{name}' not found for rollback")
            return False
        
        skill = self.skills[name]
        history = skill.get("history", [])
        
        if not history:
            logger.warning(f"No version history for '{name}'")
            return False
        
        if to_version:
            # Find specific version
            target = next((h for h in history if h["version"] == to_version), None)
        else:
            # Get most recent previous version
            target = history[-1]
        
        if not target:
            logger.warning(f"Version {to_version} not found for '{name}'")
            return False
        
        # Rollback
        skill["version"] = target["version"]
        skill["description"] = target["description"]
        skill["updated"] = datetime.now().isoformat()
        skill["updated_by"] = "rollback"
        
        self._save()
        logger.info(f"⏪ Rolled back '{name}' to v{target['version']}")
        return True
    
    def get_low_quality_skills(self, threshold: float = 0.5) -> list:
        """Get skills below a quality threshold for review."""
        return [
            s for s in self.skills.values()
            if s.get("quality_score", 1.0) < threshold and s.get("status") == "active"
        ]


# Singleton
skill_registry = SkillRegistry()
