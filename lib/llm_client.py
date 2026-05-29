import os
from pathlib import Path
from dotenv import load_dotenv
from lib.secrets import load_secrets

load_secrets()
load_dotenv()


class LLMClient:
    """
    Unified LLM client — switch providers via LLM_PROVIDER in .env.
    Lazy-imports the provider SDK so unused SDKs don't need to be installed.

    Supported values for LLM_PROVIDER:
        claude        Anthropic Claude API
        ollama        Ollama local server (native /api/generate)
        openai        OpenAI API
        gemini        Google Gemini API
        groq          Groq API  (OpenAI-compatible, uses openai SDK)
        bedrock       AWS Bedrock Converse API
        openai-compat Any OpenAI-compatible endpoint (LM Studio, vLLM, Together AI, Azure …)

    Required .env keys per provider:
        claude        ANTHROPIC_API_KEY, CLAUDE_MODEL (default: claude-sonnet-4-6)
        ollama        OLLAMA_BASE_URL (default: http://localhost:11434), OLLAMA_MODEL
        openai        OPENAI_API_KEY, OPENAI_MODEL (default: gpt-4o)
        gemini        GOOGLE_API_KEY, GEMINI_MODEL (default: gemini-2.0-flash)
        groq          GROQ_API_KEY, GROQ_MODEL (default: llama-3.3-70b-versatile)
        bedrock       AWS_DEFAULT_REGION + AWS credentials via env/profile/role
                      BEDROCK_MODEL (default: anthropic.claude-3-5-sonnet-20241022-v2:0)
        openai-compat OPENAI_COMPAT_BASE_URL, OPENAI_COMPAT_API_KEY, OPENAI_COMPAT_MODEL
    """

    _VALID = "claude, ollama, openai, gemini, groq, bedrock, openai-compat"

    def __init__(self, provider: str = None, model: str = None):
        self.provider = (provider or os.getenv("LLM_PROVIDER", "claude")).lower()
        self._setup(model)

    # ── Provider initialisation ────────────────────────────────────────────────

    def _setup(self, model: str = None):
        p = self.provider

        if p == "claude":
            import anthropic
            self.model   = model or os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
            self._client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        elif p == "ollama":
            import requests as _r
            self._requests = _r
            self.model     = model or os.getenv("OLLAMA_MODEL", "llama3.2")
            port           = os.getenv("OLLAMA_PORT", "11434")
            self._base_url = os.getenv("OLLAMA_BASE_URL", f"http://localhost:{port}")

        elif p in ("openai", "groq", "openai-compat"):
            from openai import OpenAI
            if p == "openai":
                self.model   = model or os.getenv("OPENAI_MODEL", "gpt-4o")
                self._client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            elif p == "groq":
                self.model   = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
                self._client = OpenAI(
                    api_key=os.getenv("GROQ_API_KEY"),
                    base_url="https://api.groq.com/openai/v1",
                )
            else:  # openai-compat
                self.model   = model or os.getenv("OPENAI_COMPAT_MODEL", "local-model")
                self._client = OpenAI(
                    api_key=os.getenv("OPENAI_COMPAT_API_KEY", "none"),
                    base_url=os.getenv("OPENAI_COMPAT_BASE_URL", "http://localhost:1234/v1"),
                )

        elif p == "gemini":
            from google import genai
            self.model   = model or os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
            self._client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

        elif p == "bedrock":
            import boto3
            self.model   = model or os.getenv(
                "BEDROCK_MODEL", "anthropic.claude-3-5-sonnet-20241022-v2:0"
            )
            self._client = boto3.client(
                "bedrock-runtime",
                region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            )

        else:
            raise ValueError(
                f"Unknown LLM_PROVIDER={self.provider!r}. Valid: {self._VALID}"
            )

    # ── Public interface ───────────────────────────────────────────────────────

    def chat(self, prompt: str, system: str = None) -> str:
        p = self.provider
        if p == "claude":
            return self._chat_claude(prompt, system)
        if p == "ollama":
            return self._chat_ollama(prompt, system)
        if p in ("openai", "groq", "openai-compat"):
            return self._chat_openai_sdk(prompt, system)
        if p == "gemini":
            return self._chat_gemini(prompt, system)
        if p == "bedrock":
            return self._chat_bedrock(prompt, system)

    # ── Anthropic Claude ──────────────────────────────────────────────────────

    def _chat_claude(self, prompt: str, system: str = None) -> str:
        kwargs = {
            "model": self.model,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system:
            kwargs["system"] = system
        return self._client.messages.create(**kwargs).content[0].text

    # ── Ollama (native /api/generate) ─────────────────────────────────────────

    def _chat_ollama(self, prompt: str, system: str = None) -> str:
        payload = {"model": self.model, "prompt": prompt, "stream": False}
        if system:
            payload["system"] = system
        r = self._requests.post(f"{self._base_url}/api/generate", json=payload)
        r.raise_for_status()
        return r.json()["response"]

    # ── OpenAI / Groq / openai-compat (chat.completions) ─────────────────────

    def _chat_openai_sdk(self, prompt: str, system: str = None) -> str:
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
        )
        return response.choices[0].message.content

    # ── Google Gemini ─────────────────────────────────────────────────────────

    def _chat_gemini(self, prompt: str, system: str = None) -> str:
        from google.genai import types
        config = types.GenerateContentConfig(system_instruction=system) if system else None
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config,
        )
        return response.text

    # ── AWS Bedrock Converse API ───────────────────────────────────────────────

    def _chat_bedrock(self, prompt: str, system: str = None) -> str:
        kwargs = {
            "modelId": self.model,
            "messages": [{"role": "user", "content": [{"text": prompt}]}],
        }
        if system:
            kwargs["system"] = [{"text": system}]
        response = self._client.converse(**kwargs)
        blocks   = response["output"]["message"]["content"]
        return "".join(b["text"] for b in blocks if "text" in b)

    # ─────────────────────────────────────────────────────────────────────────

    def __repr__(self) -> str:
        return f"LLMClient(provider={self.provider!r}, model={self.model!r})"
