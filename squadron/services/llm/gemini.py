
import os
import google.generativeai as genai
import logging
import json

logger = logging.getLogger('GeminiProvider')

class GeminiProvider:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        # Using Gemini 3 Flash (Dec 2025) - best for agentic workflows
        self.model_name = "gemini-3-flash" 
        
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

    def generate(self, prompt, max_tokens: int = 4096, temperature: float = 0.7) -> str:
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
            
            # Check if response is valid before accessing .text
            if not response or not response.parts:
                # Check if response was blocked
                if hasattr(response, 'prompt_feedback'):
                    feedback = response.prompt_feedback
                    if hasattr(feedback, 'block_reason') and feedback.block_reason:
                        logger.warning(f"Gemini blocked response: {feedback.block_reason}")
                        return json.dumps({
                            "action": "reply",
                            "content": f"My response was blocked. Reason: {feedback.block_reason}"
                        })
                
                # Check finish reason for candidates
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    finish_reason = getattr(candidate, 'finish_reason', None)
                    if finish_reason and finish_reason != 1:  # 1 = STOP (normal)
                        logger.warning(f"Gemini finish_reason: {finish_reason}")
                        return json.dumps({
                            "action": "reply",
                            "content": f"I couldn't complete my response (reason: {finish_reason}). Please try rephrasing your request."
                        })
                
                # Generic fallback
                logger.warning("Gemini returned empty response")
                return json.dumps({
                    "action": "reply",
                    "content": "I received an empty response from my LLM. Please try again."
                })
            
            # Extract text
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            # Fallback for reliability during development
            return json.dumps({
                "action": "reply", 
                "content": f"I encountered an error connecting to my brain: {str(e)}"
            })
