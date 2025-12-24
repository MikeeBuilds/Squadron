
class MockModel:
    def generate(self, prompt, max_tokens, temperature):
        # Determine intent based on prompt for testing purposes
        # This is a stub for the real LLM service
        
        # If testing safety, we might see specific inputs
        if "test_safety.txt" in prompt:
             return '{"action": "tool", "tool_name": "write_file", "args": {"path": "test_safety.txt", "content": "This is a test of the safety system."}}'
             
        # Hive Test Candidates (Stricter matching to avoid context pollution)
        if "USER: We need a plan to launch" in prompt:
             return '{"action": "tool", "tool_name": "create_plan", "args": {"goal": "Launch the application"}}'
             
        if "USER: Write a python script called hello.py" in prompt:
             return '{"action": "tool", "tool_name": "write_file", "args": {"path": "hello.py", "content": "print(\'Hello World\')"}}'
             
        if "USER: Audit this code for bugs" in prompt:
             return '{"action": "reply", "content": "Auditing code... No vulnerabilities found."}'

        if "list_dir" in prompt or "list files" in prompt:
             return '{"action": "tool", "tool_name": "list_dir", "args": {"path": "."}}'

        return '{"action": "reply", "content": "I am a mocked brain. I cannot think yet."}'


class ModelFactory:
    @staticmethod
    def create(model_name: str = "auto"):
        import os
        from dotenv import load_dotenv
        
        # Ensure env vars are loaded
        load_dotenv()
        
        openrouter_key = os.getenv("OPENROUTER_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")
        
        # 1. OpenRouter (Explicit or Generic)
        # If model name implies non-Gemini (like 'gpt', 'claude') OR if we only have OpenRouter key
        is_openrouter_model = any(k in model_name.lower() for k in ['gpt', 'claude', 'openai', 'anthropic', 'mistral'])
        
        if openrouter_key and (is_openrouter_model or not gemini_key):
            from squadron.services.llm.openrouter import OpenRouterProvider
            return OpenRouterProvider(openrouter_key, model_name if model_name != "auto" else "openai/gpt-4o")
            
        # 2. Google Gemini
        if gemini_key:
            from squadron.services.llm.gemini import GeminiProvider
            target_model = model_name if "gemini" in model_name.lower() else "gemini-2.0-flash-exp"
            return GeminiProvider(gemini_key, target_model)
            
        # 3. Fallback to OpenRouter if key exists (catch-all)
        if openrouter_key:
            from squadron.services.llm.openrouter import OpenRouterProvider
            return OpenRouterProvider(openrouter_key, "openai/gpt-4o")

        # 🤡 Fallback to Mock
        print(f"⚠️  Warning: No API keys found (GEMINI_API_KEY or OPENROUTER_API_KEY). Using Mock Brain.")
        return MockModel()

