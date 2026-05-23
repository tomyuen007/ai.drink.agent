import json
import os
import sys
from pathlib import Path

import anthropic
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "rag"))
from retriever import retrieve  # noqa: E402

load_dotenv(ROOT / ".env")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL   = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")
MCP_SERVER        = str(ROOT / "mcp" / "weather_server.py")

app = FastAPI(title="Weather Agent API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


async def _run_agent(city: str, question: str) -> str:
    rag_chunks = retrieve(f"{city} {question}")
    context    = "\n".join(rag_chunks)

    system = (
        "You are a helpful weather assistant. "
        "Use the available tools to fetch real weather data, then give a clear, "
        "friendly answer in 2-4 sentences. Include practical advice when relevant."
    )
    if context:
        system += f"\n\nWeather knowledge reference:\n{context}"

    server_params = StdioServerParameters(command=sys.executable, args=[MCP_SERVER])

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_list = await session.list_tools()
            tools = [
                {"name": t.name, "description": t.description or "",
                 "input_schema": t.inputSchema}
                for t in tools_list.tools
            ]

            client   = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            messages = [{"role": "user", "content": f"City: {city}\nQuestion: {question}"}]

            while True:
                response = client.messages.create(
                    model=ANTHROPIC_MODEL, max_tokens=1024,
                    system=system, tools=tools, messages=messages,
                )

                if response.stop_reason == "end_turn":
                    for block in response.content:
                        if hasattr(block, "text"):
                            return block.text
                    return "No response generated."

                if response.stop_reason == "tool_use":
                    messages.append({"role": "assistant", "content": response.content})
                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            mcp_result   = await session.call_tool(block.name, block.input)
                            content_text = "".join(
                                c.text for c in mcp_result.content if hasattr(c, "text")
                            ) or "{}"
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": content_text,
                            })
                    messages.append({"role": "user", "content": tool_results})
                else:
                    return f"Unexpected stop reason: {response.stop_reason}"


@app.get("/health")
def health():
    return {"status": "ok", "model": ANTHROPIC_MODEL}


@app.post("/ask")
async def ask(body: dict):
    city     = (body.get("city") or "").strip()
    question = (body.get("question") or "").strip()
    if not city or not question:
        return JSONResponse({"error": "city and question are required"}, status_code=400)
    try:
        answer = await _run_agent(city, question)
        return {"city": city, "question": question, "answer": answer}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# Lambda handler — Mangum adapts ASGI → Lambda event/context
try:
    from mangum import Mangum
    handler = Mangum(app)
except ImportError:
    handler = None  # not running in Lambda

if __name__ == "__main__":
    uvicorn.run("weather_agent:app", host="0.0.0.0", port=8001, reload=False)
