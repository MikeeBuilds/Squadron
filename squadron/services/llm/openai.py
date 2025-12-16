"""
OpenAI Provider 🤖
Interface for OpenAI's LLM services.
"""
import os
import openai
import logging
import json

logger = logging.getLogger('OpenAIProvider')

class OpenAIProvider:
    def __init__(self, api_key: str, model_name: str = "gpt-4-turbo"):
        openai.api_key = api_key
        self.model_name = model_name
        logger.info(f"✨ OpenAI Provider Initialized ({self.model_name})")

    def generate(self, prompt, max_tokens: int = 4269, temperature: float = 0.7) -> str:
        """
        Generates content using OpenAI's API.
        Prompt can be str, list of strings (joined), or list of message dictionaries.
        """
        if isinstance(prompt, str):
            messages = [{"role": "user", "content": prompt}]
        elif isinstance(prompt, list):
            # Check if it's a list of strings (legacy/gemini style) or message dicts
            if prompt and isinstance(prompt[0], str):
                joined_prompt = "\n".join(prompt)
                messages = [{"role": "user", "content": joined_prompt}]
            else:
                # Assume it's already in OpenAI message format
                messages = prompt
        else:
            raise ValueError("Prompt must be a string or a list.")

        try:
            # Build API arguments
            api_args = {
                "model": self.model_name,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }

            # Conditionally add response_format if prompt indicates JSON expectation
            # Check the actual system message for the JSON instruction
            json_expected = False
            if isinstance(messages, list) and len(messages) > 0:
                # Assuming the last message (user input) will contain the "RESPONSE (JSON):" instruction
                last_message_content = messages[-1].get("content", "").lower() if isinstance(messages[-1], dict) else str(messages[-1]).lower()
                if "json" in last_message_content and "response (json):" in last_message_content:
                    json_expected = True
            elif isinstance(messages, str):
                if "json" in messages.lower() and "response (json):" in messages.lower():
                    json_expected = True

            if json_expected:
                api_args["response_format"] = {"type": "json_object"}
                logger.debug("OpenAI: Using JSON response_format.")
            
            response = openai.chat.completions.create(**api_args)
            
            # OpenAI's API might return multiple choices, take the first one
            if response.choices and response.choices[0].message:
                return response.choices[0].message.content
            else:
                logger.warning("OpenAI returned no content.")
                return json.dumps({
                    "action": "reply",
                    "content": "OpenAI returned no content."
                })
        except openai.APIError as e:
            logger.error(f"OpenAI API Error: {e}")
            return json.dumps({
                "action": "reply",
                "content": f"I encountered an OpenAI API error: {str(e)}"
            })
        except Exception as e:
            logger.error(f"OpenAI General Error: {e}")
            return json.dumps({
                "action": "reply",
                "content": f"I encountered a general OpenAI error: {str(e)}"
            })

