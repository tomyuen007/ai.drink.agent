import os
import anthropic
import requests
from dotenv import load_dotenv

load_dotenv()


class LLMClient:
    def __init__(self, provider: str = None, model: str = None):
        self.provider = (provider or os.getenv("LLM_PROVIDER", "ollama")).lower()
        if self.provider == "claude":
            self.model = model or os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
            self._client = anthropic.Anthropic()
        elif self.provider == "ollama":
            self.model = model or os.getenv("OLLAMA_MODEL", "llama3.2")
            self._base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        else:
            raise ValueError(f"Unknown provider: {self.provider!r}. Use 'claude' or 'ollama'.")

    def chat(self, prompt: str, system: str = None) -> str:
        if self.provider == "claude":
            return self._claude_chat(prompt, system)
        return self._ollama_chat(prompt, system)

    def _claude_chat(self, prompt: str, system: str = None) -> str:
        kwargs = {
            "model": self.model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system
        response = self._client.messages.create(**kwargs)
        return response.content[0].text

    def _ollama_chat(self, prompt: str, system: str = None) -> str:
        payload = {"model": self.model, "prompt": prompt, "stream": False}
        if system:
            payload["system"] = system
        response = requests.post(f"{self._base_url}/api/generate", json=payload)
        response.raise_for_status()
        return response.json()["response"]

    def __repr__(self) -> str:
        return f"LLMClient(provider={self.provider!r}, model={self.model!r})"
