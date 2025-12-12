
import os
import google.generativeai as genai
import logging
import json

logger = logging.getLogger('GeminiProvider')

class GeminiProvider:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Switching to 2.5-flash (Available and fast)
        self.model_name = "gemini-2.5-flash" 
        
        # Configure Safety Settings using explicit types
        from google.generativeai.types import HarmCategory, HarmBlockThreshold
        
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
        
        self.model = genai.GenerativeModel(self.model_name, safety_settings=self.safety_settings)
        logger.info(f"✨ Gemini Provider Initialized ({self.model_name}) - Safety Filters: OFF")

    def generate(self, prompt, max_tokens: int = 1000, temperature: float = 0.7) -> str:
        """
        Generates content using Gemini. Prompt can be str or list of parts.
        """
        try:
            # Configure generation config
            config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature
            )
            
            # Generate (supports list of [text, image])
            response = self.model.generate_content(prompt, generation_config=config)
            
            # Extract text
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            # Fallback for reliability during development
            return json.dumps({
                "action": "reply", 
                "content": f"I encountered an error connecting to my brain: {str(e)}"
            })
