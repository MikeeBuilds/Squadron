"""
Unit Tests for Tag Parser
=========================

Tests the agent tagging functionality including:
- Parsing @mentions from text
- Formatting agent comments
- Multiple tag handling
"""

import pytest


@pytest.mark.unit
class TestTagParserExtraction:
    """Tests for extracting agent mentions."""

    def test_extract_single_mention(self):
        """Should extract a single @mention."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        text = "Hey @Marcus can you review this?"
        mentions = parser.extract_mentions(text)
        
        assert "Marcus" in mentions

    def test_extract_multiple_mentions(self):
        """Should extract multiple @mentions."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        text = "@Marcus and @Caleb please collaborate on this"
        mentions = parser.extract_mentions(text)
        
        assert "Marcus" in mentions
        assert "Caleb" in mentions

    def test_extract_no_mentions(self):
        """Should return empty list when no mentions."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        text = "Just a regular comment without mentions"
        mentions = parser.extract_mentions(text)
        
        assert mentions == []

    def test_extract_case_insensitive(self):
        """Should handle different cases."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        text = "Hey @MARCUS and @marcus"
        mentions = parser.extract_mentions(text)
        
        # Should normalize to known agent names
        assert len(mentions) >= 1


@pytest.mark.unit
class TestTagParserFormatting:
    """Tests for formatting agent comments."""

    def test_format_agent_comment(self):
        """Should format comment with agent prefix."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        formatted = parser.format_agent_comment("Marcus", "I've reviewed the code")
        
        assert "Marcus" in formatted
        assert "reviewed" in formatted

    def test_format_agent_tag(self):
        """Should format an @mention tag."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        tag = parser.format_agent_tag("Caleb")
        
        assert "@" in tag
        assert "Caleb" in tag


@pytest.mark.unit
class TestTagParserValidation:
    """Tests for validating agent names."""

    def test_valid_agent_names(self):
        """Should recognize valid agent names."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        valid_agents = ["Marcus", "Caleb", "Sentinel"]
        
        for agent in valid_agents:
            assert parser.is_valid_agent(agent)

    def test_invalid_agent_name(self):
        """Should reject invalid agent names."""
        from squadron.services.tag_parser import TagParser
        parser = TagParser()
        
        assert not parser.is_valid_agent("RandomPerson")
        assert not parser.is_valid_agent("")
