
import os
import logging
import json
from google import genai
from google.genai import types

logger = logging.getLogger('GeminiProvider')

class GeminiProvider:
    def __init__(self, api_key: str, model_name: str = "gemini-2.0-flash-exp"):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name
        logger.info(f"✨ Gemini Provider Initialized ({self.model_name}) [Google Gen AI SDK v1.0]")

    def generate(self, prompt, max_tokens: int = 4096, temperature: float = 0.7) -> str:
        """
        Generates content using Gemini 2.0 via new SDK.
        """
        try:
            # Prepare content
            # The new SDK handles strings and lists gracefully
            contents = prompt
            if isinstance(prompt, list):
                # Ensure parts are correctly formatted formatted if mixed
                contents = prompt 

            # Configure generation
            config = types.GenerateContentConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                # Disable safety for agentic freedom (User requested)
                safety_settings=[
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold=types.HarmBlockThreshold.BLOCK_NONE
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold=types.HarmBlockThreshold.BLOCK_NONE
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold=types.HarmBlockThreshold.BLOCK_NONE
                    ),
                    types.SafetySetting(
                        category=types.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold=types.HarmBlockThreshold.BLOCK_NONE
                    ),
                ]
            )

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=config
            )

            if response.text:
                return response.text
            else:
                logger.warning("Gemini returned empty text.")
                return json.dumps({"action": "reply", "content": "Empty response from Gemini."})

        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            return json.dumps({
                "action": "reply",
                "content": f"Gemini Error: {str(e)}"
            })
