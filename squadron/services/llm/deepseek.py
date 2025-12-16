import os
import logging
import json
from openai import OpenAI

logger = logging.getLogger('DeepSeekProvider')

class DeepSeekProvider:
    def __init__(self, api_key: str, model_name: str = "deepseek-reasoner", **kwargs):
        self.base_url = "https://api.deepseek.com/v3.2_speciale_expires_on_20251215"
        self.api_key = api_key
        # Ensure we use the model name the user requested or default
        self.model_name = model_name if model_name else "deepseek-reasoner"
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
        logger.info(f"🚀 DeepSeek Provider Initialized ({self.model_name}) @ {self.base_url}")

    def generate(self, prompt, max_tokens: int = 4000, temperature: float = 0.7) -> str:
        try:
            if isinstance(prompt, str):
                messages = [{"role": "user", "content": prompt}]
            elif isinstance(prompt, list):
                text_content = ""
                for part in prompt:
                    if isinstance(part, str):
                        text_content += part + "\n"
                messages = [{"role": "user", "content": text_content}]
            else:
                messages = [{"role": "user", "content": str(prompt)}]

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                stream=False
            )

            # DEBUG: Print the raw response
            print(f"\n[DeepSeek Raw Response]: {response}")

            content = response.choices[0].message.content
            
            # Check for reasoning content if main content is empty
            if not content and hasattr(response.choices[0].message, 'reasoning_content'):
                 # DeepSeek R1/Reasoning models might put output here?
                 # Or maybe we just need to wait? 
                 # Usually content should be populated.
                 pass

            if not content:
                logger.warning("DeepSeek returned empty content!")
                return json.dumps({"action": "reply", "content": "The oracle (DeepSeek) remained silent."})

            return content

        except Exception as e:
            logger.error(f"DeepSeek API Error: {e}")
            return json.dumps({
                "action": "reply",
                "content": f"I encountered an error connecting to my brain (DeepSeek): {str(e)}"
            })
