"""
OpenRouter Provider 🌐
Interface for OpenRouter's unified LLM API.
"""
import os
import openai
import logging
import json

logger = logging.getLogger('OpenRouterProvider')

class OpenRouterProvider:
    def __init__(self, api_key: str, model_name: str = "openai/gpt-4o"):
        self.client = openai.OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            default_headers={
                "HTTP-Referer": "https://squadron.dev",  # Optional: For rankings
                "X-Title": "Squadron Desktop"           # Optional: For rankings
            }
        )
        self.model_name = model_name
        logger.info(f"✨ OpenRouter Provider Initialized ({self.model_name})")

    def generate(self, prompt, max_tokens: int = 4096, temperature: float = 0.7) -> str:
        """
        Generates content using OpenRouter API.
        """
        messages = []
        if isinstance(prompt, str):
            messages = [{"role": "user", "content": prompt}]
        elif isinstance(prompt, list):
            if prompt and isinstance(prompt[0], str):
                joined_prompt = "\n".join(prompt)
                messages = [{"role": "user", "content": joined_prompt}]
            else:
                messages = prompt
        else:
            raise ValueError("Prompt must be a string or a list.")

        try:
            # Check if JSON mode requested
            response_format = None
            json_expected = False
            last_msg = messages[-1].get("content", "").lower() if messages and isinstance(messages[-1], dict) else str(messages).lower()
            
            if "response (json):" in last_msg:
                response_format = {"type": "json_object"}

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                response_format=response_format
            )
            
            if response.choices:
                return response.choices[0].message.content
            else:
                return json.dumps({"action": "reply", "content": "OpenRouter returned empty response"})

        except Exception as e:
            logger.error(f"OpenRouter Error: {e}")
            return json.dumps({
                "action": "reply",
                "content": f"OpenRouter Error: {str(e)}"
            })
