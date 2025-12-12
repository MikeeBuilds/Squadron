"""
Tag Parser Service 🏷️
Parses @agent mentions from ticket comments, Slack messages, and other text sources.
"""
import re
from typing import List, Tuple, Optional


class TagParser:
    """Parse @agent mentions and extract tasks."""
    
    # Known agent names
    AGENTS = ["Marcus", "Caleb", "Sentinel"]
    
    # Regex pattern for @mentions
    MENTION_PATTERN = re.compile(r'@(\w+)', re.IGNORECASE)
    
    def parse_mentions(self, text: str) -> List[str]:
        """
        Extract @agent mentions from text.
        Returns list of matched agent names (normalized).
        
        Example:
            "@marcus please help" -> ["Marcus"]
            "@Caleb @Sentinel review this" -> ["Caleb", "Sentinel"]
        """
        if not text:
            return []
        
        matches = self.MENTION_PATTERN.findall(text)
        agents = []
        
        for match in matches:
            # Normalize to proper case
            for agent in self.AGENTS:
                if match.lower() == agent.lower():
                    agents.append(agent)
                    break
        
        return agents
    
    def extract_task(self, text: str, mentioned_agent: str) -> str:
        """
        Extract the task description after the @mention.
        
        Example:
            "@Caleb please implement the auth module" -> "please implement the auth module"
        """
        if not text or not mentioned_agent:
            return text
        
        # Find the mention and extract everything after it
        pattern = re.compile(rf'@{mentioned_agent}\s*', re.IGNORECASE)
        result = pattern.sub('', text, count=1).strip()
        
        return result
    
    def parse_with_tasks(self, text: str) -> List[Tuple[str, str]]:
        """
        Parse text and return list of (agent, task) tuples.
        
        Example:
            "@Marcus design the system @Caleb implement it" -> 
            [("Marcus", "design the system"), ("Caleb", "implement it")]
        """
        if not text:
            return []
        
        results = []
        agents = self.parse_mentions(text)
        
        if not agents:
            return []
        
        # If only one agent, the whole message (minus mention) is the task
        if len(agents) == 1:
            task = self.extract_task(text, agents[0])
            return [(agents[0], task)]
        
        # Multiple agents - split by mentions
        # This is a simplified approach; could be more sophisticated
        parts = re.split(r'@\w+', text)
        
        for i, agent in enumerate(agents):
            if i + 1 < len(parts):
                task = parts[i + 1].strip()
                results.append((agent, task))
            else:
                results.append((agent, ""))
        
        return results
    
    def is_agent_mention(self, text: str, agent_name: str) -> bool:
        """Check if a specific agent is mentioned in the text."""
        mentions = self.parse_mentions(text)
        return agent_name in mentions
    
    def format_agent_comment(self, agent_name: str, message: str) -> str:
        """
        Format a comment from an agent with proper prefix.
        
        Example:
            format_agent_comment("Marcus", "Done!") -> "[🤖 Marcus] Done!"
        """
        return f"[🤖 {agent_name}] {message}"
    
    def format_agent_tag(self, agent_name: str) -> str:
        """Format an @mention for an agent."""
        return f"@{agent_name}"


# Singleton instance
tag_parser = TagParser()
