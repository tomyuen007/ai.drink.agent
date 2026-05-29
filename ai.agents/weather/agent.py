import asyncio
import json
import os
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import BaseModel

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT / "rags" / "weather"))
sys.path.insert(0, str(ROOT))
from rag import retrieve          # noqa: E402
from lib.secrets import load_secrets  # noqa: E402

load_secrets(ROOT)
load_dotenv(ROOT / ".env")

# Default provider read from server .env (used when the app sends no override).
PROVIDER   = os.getenv("LLM_PROVIDER", "claude").lower()
MCP_SERVER = str(ROOT / "mcps" / "weather" / "mcp.py")

_OPENAI_SDK_PROVIDERS = {"openai", "groq", "ollama", "openai-compat"}
_VALID_PROVIDERS      = {"claude", "gemini", "bedrock"} | _OPENAI_SDK_PROVIDERS

# ── Lazy client cache (provider name → SDK client) ────────────────────────────
_clients: dict = {}


def _get_client(provider: str):
    """Return a cached SDK client for *provider*, creating it on first call."""
    if provider in _clients:
        return _clients[provider]

    if provider == "claude":
        import anthropic
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

    elif provider == "openai":
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    elif provider == "groq":
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=os.getenv("GROQ_API_KEY"),
            base_url="https://api.groq.com/openai/v1",
        )

    elif provider == "ollama":
        from openai import AsyncOpenAI
        port   = os.getenv("OLLAMA_PORT", "11434")
        base   = os.getenv("OLLAMA_BASE_URL", f"http://localhost:{port}")
        client = AsyncOpenAI(api_key="ollama", base_url=f"{base}/v1")

    elif provider == "openai-compat":
        from openai import AsyncOpenAI
        client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_COMPAT_API_KEY", "none"),
            base_url=os.getenv("OPENAI_COMPAT_BASE_URL", "http://localhost:1234/v1"),
        )

    elif provider == "gemini":
        from google import genai
        client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY", ""))

    elif provider == "bedrock":
        import boto3
        client = boto3.client(
            "bedrock-runtime",
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        )

    else:
        raise ValueError(
            f"Unknown provider {provider!r}. Valid: {', '.join(sorted(_VALID_PROVIDERS))}"
        )

    _clients[provider] = client
    return client


def _get_model(provider: str) -> str:
    return {
        "claude":        os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
        "openai":        os.getenv("OPENAI_MODEL",    "gpt-4o"),
        "groq":          os.getenv("GROQ_MODEL",      "llama-3.3-70b-versatile"),
        "ollama":        os.getenv("OLLAMA_MODEL",    "llama3.2"),
        "gemini":        os.getenv("GEMINI_MODEL",    "gemini-2.0-flash"),
        "bedrock":       os.getenv("BEDROCK_MODEL",   "anthropic.claude-3-5-sonnet-20241022-v2:0"),
        "openai-compat": os.getenv("OPENAI_COMPAT_MODEL", "local-model"),
    }.get(provider, os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"))


# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(title="Weather Agent API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    city:     str
    question: str
    provider: str | None = None  # app sends this to override the server's LLM_PROVIDER


# ── Agent entry point ─────────────────────────────────────────────────────────

async def _run_agent(city: str, question: str, provider: str) -> str:
    rag_chunks = retrieve(f"{city} {question}")
    context    = "\n".join(rag_chunks)
    system = (
        "You are a helpful weather assistant. "
        "Use the available tools to fetch real weather data, then give a clear, "
        "friendly answer in 2-4 sentences. Include practical advice when relevant."
    )
    if context:
        system += f"\n\nWeather knowledge reference:\n{context}"

    client = _get_client(provider)
    model  = _get_model(provider)

    server_params = StdioServerParameters(command=sys.executable, args=[MCP_SERVER])
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_list = await session.list_tools()

            if provider == "claude":
                return await _run_claude(session, tools_list, system, city, question, client, model)
            elif provider in _OPENAI_SDK_PROVIDERS:
                return await _run_openai_sdk(session, tools_list, system, city, question, client, model)
            elif provider == "gemini":
                return await _run_gemini(session, tools_list, system, city, question, client, model)
            elif provider == "bedrock":
                return await _run_bedrock(session, tools_list, system, city, question, client, model)


# ── Anthropic Claude tool-use loop ────────────────────────────────────────────

async def _run_claude(session, tools_list, system, city, question, client, model):
    tools = [
        {"name": t.name, "description": t.description or "", "input_schema": t.inputSchema}
        for t in tools_list.tools
    ]
    messages = [{"role": "user", "content": f"City: {city}\nQuestion: {question}"}]

    while True:
        response = client.messages.create(
            model=model, max_tokens=1024,
            system=system, tools=tools, messages=messages,
        )
        if response.stop_reason == "end_turn":
            return next((b.text for b in response.content if hasattr(b, "text")), "No response.")

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []
            for block in response.content:
                if block.type != "tool_use":
                    continue
                mcp_result   = await session.call_tool(block.name, block.input)
                content_text = "".join(
                    c.text for c in mcp_result.content if hasattr(c, "text")
                ) or "{}"
                tool_results.append({
                    "type": "tool_result", "tool_use_id": block.id, "content": content_text,
                })
            messages.append({"role": "user", "content": tool_results})
        else:
            return f"Unexpected stop reason: {response.stop_reason}"


# ── OpenAI-compatible tool-use loop ───────────────────────────────────────────
# Covers: openai, groq, ollama, openai-compat

async def _run_openai_sdk(session, tools_list, system, city, question, client, model):
    tools = [
        {
            "type": "function",
            "function": {
                "name":        t.name,
                "description": t.description or "",
                "parameters":  t.inputSchema,
            },
        }
        for t in tools_list.tools
    ]
    messages = [
        {"role": "system", "content": system},
        {"role": "user",   "content": f"City: {city}\nQuestion: {question}"},
    ]

    while True:
        response = await client.chat.completions.create(
            model=model, messages=messages, tools=tools,
        )
        choice = response.choices[0]
        msg    = choice.message

        if choice.finish_reason == "stop":
            return msg.content or "No response generated."

        if choice.finish_reason == "tool_calls":
            messages.append(msg)
            for tc in msg.tool_calls:
                mcp_result   = await session.call_tool(
                    tc.function.name, json.loads(tc.function.arguments)
                )
                content_text = "".join(
                    c.text for c in mcp_result.content if hasattr(c, "text")
                ) or "{}"
                messages.append({
                    "role": "tool", "tool_call_id": tc.id, "content": content_text,
                })
        else:
            return f"Unexpected finish reason: {choice.finish_reason}"


# ── Google Gemini tool-use loop ───────────────────────────────────────────────

async def _run_gemini(session, tools_list, system, city, question, client, model):
    from google.genai import types as gt
    declarations = [
        {"name": t.name, "description": t.description or "", "parameters": t.inputSchema}
        for t in tools_list.tools
    ]
    config   = gt.GenerateContentConfig(
        tools=[gt.Tool(function_declarations=declarations)],
        system_instruction=system,
    )
    contents = [gt.Content(role="user", parts=[gt.Part.from_text(f"City: {city}\nQuestion: {question}")])]

    while True:
        response  = await client.aio.models.generate_content(
            model=model, contents=contents, config=config,
        )
        candidate = response.candidates[0]
        parts     = candidate.content.parts or []
        fn_calls  = [p for p in parts if p.function_call]

        if not fn_calls:
            return (
                "".join(p.text for p in parts if hasattr(p, "text") and p.text)
                or "No response generated."
            )

        contents.append(candidate.content)
        fn_responses = []
        for part in fn_calls:
            fc     = part.function_call
            result = await session.call_tool(fc.name, dict(fc.args))
            text   = "".join(c.text for c in result.content if hasattr(c, "text")) or "{}"
            fn_responses.append(
                gt.Part.from_function_response(name=fc.name, response={"result": text})
            )
        contents.append(gt.Content(role="user", parts=fn_responses))


# ── AWS Bedrock Converse tool-use loop ────────────────────────────────────────

async def _run_bedrock(session, tools_list, system, city, question, client, model):
    tool_config = {
        "tools": [
            {
                "toolSpec": {
                    "name":        t.name,
                    "description": t.description or "",
                    "inputSchema": {"json": t.inputSchema},
                }
            }
            for t in tools_list.tools
        ]
    }
    messages   = [{"role": "user", "content": [{"text": f"City: {city}\nQuestion: {question}"}]}]
    sys_prompt = [{"text": system}] if system else []

    while True:
        response = await asyncio.to_thread(
            client.converse,
            modelId=model, messages=messages, system=sys_prompt, toolConfig=tool_config,
        )
        stop_reason = response["stopReason"]
        out_msg     = response["output"]["message"]

        if stop_reason == "end_turn":
            return (
                "".join(b["text"] for b in out_msg["content"] if "text" in b)
                or "No response generated."
            )

        if stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": out_msg["content"]})
            tool_results = []
            for block in out_msg["content"]:
                if "toolUse" not in block:
                    continue
                tu     = block["toolUse"]
                result = await session.call_tool(tu["name"], tu["input"])
                text   = "".join(c.text for c in result.content if hasattr(c, "text")) or "{}"
                tool_results.append({
                    "toolResult": {"toolUseId": tu["toolUseId"], "content": [{"text": text}]}
                })
            messages.append({"role": "user", "content": tool_results})
        else:
            return f"Unexpected stop reason: {stop_reason}"


# ── HTTP endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "default_provider": PROVIDER, "model": _get_model(PROVIDER)}


@app.post("/ask")
async def ask(req: AskRequest):
    try:
        provider = (req.provider or PROVIDER).lower()
        if provider not in _VALID_PROVIDERS:
            return JSONResponse(
                status_code=400,
                content={"error": f"Unknown provider {provider!r}. Valid: {', '.join(sorted(_VALID_PROVIDERS))}"},
            )
        answer = await _run_agent(req.city, req.question, provider)
        return {
            "city": req.city, "question": req.question,
            "answer": answer, "provider": provider,
        }
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})


if __name__ == "__main__":
    port = int(os.getenv("AGENT_PORT", 8001))
    uvicorn.run("agent:app", host="0.0.0.0", port=port, reload=True)
