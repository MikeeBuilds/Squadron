"""
Unit Tests for Model Factory
============================

Tests the LLM provider factory including:
- Provider creation
- Model switching
- Error handling
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.mark.unit
class TestModelFactory:
    """Tests for ModelFactory."""

    def test_create_gemini_provider(self, mock_env):
        """Should create Gemini provider correctly."""
        with patch('google.generativeai.GenerativeModel') as mock_model:
            mock_model.return_value = MagicMock()
            
            from squadron.services.model_factory import ModelFactory
            model = ModelFactory.create("gemini-2.0-flash")
            
            assert model is not None

    def test_create_with_alias(self, mock_env):
        """Should handle model aliases."""
        with patch('google.generativeai.GenerativeModel') as mock_model:
            mock_model.return_value = MagicMock()
            
            from squadron.services.model_factory import ModelFactory
            
            # These should all work
            model1 = ModelFactory.create("gemini-flash")
            model2 = ModelFactory.create("gemini-2.0-flash")
            
            assert model1 is not None
            assert model2 is not None

    def test_create_unknown_model_fallback(self, mock_env):
        """Unknown model names should fallback gracefully."""
        with patch('google.generativeai.GenerativeModel') as mock_model:
            mock_model.return_value = MagicMock()
            
            from squadron.services.model_factory import ModelFactory
            
            # Should not crash, should fallback
            model = ModelFactory.create("unknown-model-xyz")
            # Factory should handle gracefully (either return something or None)
            # This test just ensures no exception is raised


@pytest.mark.unit
class TestModelGeneration:
    """Tests for model generation with mocks."""

    def test_generate_returns_string(self, mock_env):
        """Generate should return a string response."""
        mock_gen_model = MagicMock()
        mock_gen_model.generate_content.return_value = MagicMock(text="Test response")
        
        with patch('google.generativeai.GenerativeModel', return_value=mock_gen_model):
            from squadron.services.model_factory import ModelFactory
            model = ModelFactory.create("gemini-flash")
            
            if hasattr(model, 'generate'):
                result = model.generate("Hello")
                assert isinstance(result, str)
