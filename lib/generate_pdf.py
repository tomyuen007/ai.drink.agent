"""
Generate the Weather AI architecture PDF.
Run from the project root:
    python lib/generate_pdf.py                                  # timestamped name
    python lib/generate_pdf.py weather_ai_architecture_XYZ.pdf # custom name
Output: docs/pdfs/<filename>
"""

import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable, Image, KeepTogether, PageBreak,
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT     = Path(__file__).parent.parent
DOCS_DIR = ROOT / "docs" / "pdfs"
TS       = datetime.now().strftime("%Y%m%d_%H%M%S")
_name    = sys.argv[1] if len(sys.argv) > 1 else f"weather_ai_architecture_{TS}.pdf"
OUTPUT   = DOCS_DIR / _name


# ── Shared drawing helpers ─────────────────────────────────────────────────────

PALETTE = {
    "ui":       ("#DBEAFE", "#1D4ED8"),
    "agent":    ("#DCFCE7", "#15803D"),
    "rag":      ("#FEF9C3", "#A16207"),
    "claude":   ("#FCE7F3", "#9D174D"),
    "mcp":      ("#EDE9FE", "#6D28D9"),
    "weather":  ("#CFFAFE", "#0E7490"),
    "duckdb":   ("#FFF7ED", "#C2410C"),
    "tf_mod":   ("#F1F5F9", "#475569"),
    "tf_root":  ("#FFF7ED", "#C2410C"),
    "tf_node":  ("#DBEAFE", "#1D4ED8"),
    "tf_state": ("#F0FDF4", "#15803D"),
}
ARROW = "#475569"


def _box(ax, cx, cy, w, h, key, lines):
    bg, border = PALETTE[key]
    ax.add_patch(FancyBboxPatch(
        (cx - w / 2, cy - h / 2), w, h,
        boxstyle="round,pad=0.1",
        facecolor=bg, edgecolor=border, linewidth=2.0, zorder=2,
    ))
    sizes   = [10.0, 8.0, 7.0]
    weights = ["bold", "normal", "normal"]
    clrs    = ["#111827", "#374151", "#6B7280"]
    styles  = ["normal", "normal", "italic"]
    n    = len(lines)
    step = min(h / (n + 1), 0.27)
    top  = cy + step * (n - 1) / 2
    for i, text in enumerate(lines):
        ax.text(cx, top - i * step, text,
                ha="center", va="center", zorder=3,
                fontsize=sizes[min(i, 2)], fontweight=weights[min(i, 2)],
                color=clrs[min(i, 2)], style=styles[min(i, 2)])


def _arrow(ax, x1, y1, x2, y2, label="", rad=0.0, dashed=False):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), zorder=1,
                arrowprops=dict(
                    arrowstyle="->", lw=1.6, color=ARROW,
                    linestyle="dashed" if dashed else "solid",
                    connectionstyle=f"arc3,rad={rad}",
                ))
    if label:
        mx = (x1 + x2) / 2 + (0.55 * rad if rad else 0)
        my = (y1 + y2) / 2 + (0.1 if rad else 0)
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=7.0, color="#475569", zorder=4,
                bbox=dict(facecolor="white", edgecolor="none", alpha=0.88, pad=2))


# ── Diagram 1 — Weather app data flow ─────────────────────────────────────────

def draw_app_diagram(path: str) -> None:
    fig, ax = plt.subplots(figsize=(11, 8))
    ax.set_xlim(0, 11); ax.set_ylim(0, 8); ax.axis("off")
    fig.patch.set_facecolor("#F0F9FF")

    _box(ax, 5.5, 7.1,  4.2, 0.70, "ui",
         ["[ UI ]  Expo (React Native)", "ui/App.tsx  |  iOS / Android / Web"])
    _box(ax, 5.5, 5.65, 4.6, 0.80, "agent",
         ["[ WEATHER AGENT ]  FastAPI :8001",
          "server/weather_agent.py"])
    _box(ax, 2.1, 4.0,  3.8, 1.05, "rag",
         ["[ RAG ]  Retrieval Layer",
          "ChromaDB + sentence-transformers",
          "rag/retriever.py  |  knowledge.json"])
    _box(ax, 8.9, 4.0,  3.8, 1.05, "claude",
         ["[ CLAUDE ]  claude-sonnet-4-6",
          "Anthropic API",
          "tool_use loop"])
    _box(ax, 8.9, 2.3,  3.8, 1.05, "mcp",
         ["[ MCP ]  FastMCP stdio",
          "mcp/weather_server.py",
          "get_current_weather / get_forecast"])
    _box(ax, 8.9, 0.75, 3.8, 0.70, "weather",
         ["[ OPEN-METEO ]  Free API", "No key  |  geocoding + forecast"])

    _arrow(ax, 5.5, 6.75, 5.5, 6.06, "POST /ask  {city, question}")
    _arrow(ax, 3.85, 5.25, 2.9, 4.53, "query")
    _arrow(ax, 3.05, 4.53, 4.2, 5.25, "context chunks", rad=-0.35, dashed=True)
    _arrow(ax, 7.15, 5.25, 7.7, 4.53, "prompt + context + tools")
    _arrow(ax, 8.9, 3.47, 8.9, 2.83, "tool_use call")
    _arrow(ax, 8.9, 1.77, 8.9, 1.11, "HTTP  (free)")

    ax.text(5.5, 7.72, "Weather AI  —  Application Data Flow",
            ha="center", va="center", fontsize=15, fontweight="bold", color="#0F172A")
    ax.text(5.5, 7.45, "Expo UI  →  Agent  →  RAG + Claude  →  MCP  →  Open-Meteo",
            ha="center", va="center", fontsize=9, color="#64748B")

    legend_items = [
        ("Expo UI (React Native)", "ui"),   ("Weather Agent (FastAPI)", "agent"),
        ("RAG Layer (ChromaDB)",   "rag"),  ("Claude API",              "claude"),
        ("MCP Server (stdio)",     "mcp"),  ("Open-Meteo (free)",       "weather"),
    ]
    for i, (label, key) in enumerate(legend_items):
        fc, ec = PALETTE[key]
        lx = 0.3 + (i % 3) * 3.6
        ly = 0.35 - (i // 3) * 0.25
        ax.add_patch(FancyBboxPatch((lx, ly), 0.35, 0.18,
                                    boxstyle="round,pad=0.03",
                                    facecolor=fc, edgecolor=ec, linewidth=1.2, zorder=2))
        ax.text(lx + 0.45, ly + 0.09, label,
                va="center", fontsize=7.5, color="#374151", zorder=3)

    plt.tight_layout(pad=0.2)
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"  app diagram   -> {path}")


# ── Diagram 2 — Terraform structure ───────────────────────────────────────────

def draw_terraform_diagram(path: str) -> None:
    fig, ax = plt.subplots(figsize=(13, 6.5))
    ax.set_xlim(0, 13); ax.set_ylim(0, 6.5); ax.axis("off")
    fig.patch.set_facecolor("#FFFBEB")

    # modules/ (shared)
    _box(ax, 6.5, 5.7, 12.0, 0.65, "tf_mod",
         ["[ MODULES ]  Shared Reusable Modules  —  never deployed directly",
          "modules/lambda_function/   |   modules/lambda_layer/"])

    # layers/ root
    _box(ax, 1.4, 3.6, 2.4, 1.0, "tf_root",
         ["[ LAYERS ]",
          "terrorform/layers/",
          "deps + shared layers"])

    # Python Lambda roots
    _box(ax, 4.2, 3.6, 2.2, 1.0, "tf_root",
         ["[ AGENT ]",
          "terrorform/agent/",
          "Weather Agent Lambda"])
    _box(ax, 6.6, 3.6, 2.2, 1.0, "tf_root",
         ["[ MCP ]",
          "terrorform/mcp/",
          "MCP Lambda"])
    _box(ax, 9.0, 3.6, 2.2, 1.0, "tf_root",
         ["[ DUCKDB ]",
          "terrorform/duckdb/",
          "DuckDB API Lambda"])

    # Node.js Lambda root (different style)
    _box(ax, 11.5, 3.6, 2.2, 1.0, "tf_node",
         ["[ UI ]",
          "terrorform/ui/",
          "Expo Web Lambda"])

    # S3 remote state
    _box(ax, 6.5, 1.55, 12.0, 0.70, "tf_state",
         ["[ S3 ]  Terraform Remote State  —  wine-liquor-tf-state",
          "Each root has its own key  |  states are fully independent"])

    # Docker build note
    ax.text(1.4, 2.2,
            "Docker null_resource\nbuilds inside Amazon Linux\nWindows / WSL / Mac -> Linux binaries",
            ha="center", va="center", fontsize=7.5, color="#92400E",
            bbox=dict(facecolor="#FEF9C3", edgecolor="#A16207",
                      boxstyle="round,pad=0.35", linewidth=1.2))

    # modules -> roots
    for rx in [1.4, 4.2, 6.6, 9.0]:
        _arrow(ax, 6.5, 5.38, rx, 4.10, "calls module")
    _arrow(ax, 6.5, 5.38, 11.5, 4.10, "own resources")

    # roots -> S3
    for rx in [1.4, 4.2, 6.6, 9.0, 11.5]:
        _arrow(ax, rx, 3.10, rx, 1.90, dashed=True)

    # layers -> Python roots (ARNs)
    for rx in [4.2, 6.6, 9.0]:
        _arrow(ax, 2.5, 3.2, rx - 0.5, 3.2, "layer ARNs", dashed=True)

    ax.text(6.5, 6.25, "Weather AI  —  Terraform Structure",
            ha="center", va="center", fontsize=15, fontweight="bold", color="#0F172A")
    ax.text(6.5, 5.98,
            "Each app is an independent root with its own S3 state  |  "
            "Python apps use shared modules  |  Always run from WSL",
            ha="center", va="center", fontsize=8.5, color="#64748B")

    legend = [
        ("Shared module (not deployable)", "tf_mod"),
        ("Python Lambda root",             "tf_root"),
        ("Node.js Lambda root",            "tf_node"),
        ("Remote state / S3",              "tf_state"),
    ]
    for i, (label, key) in enumerate(legend):
        fc, ec = PALETTE[key]
        lx = 0.4 + i * 3.1
        ly = 0.2
        ax.add_patch(FancyBboxPatch((lx, ly), 0.35, 0.18,
                                    boxstyle="round,pad=0.03",
                                    facecolor=fc, edgecolor=ec, linewidth=1.2, zorder=2))
        ax.text(lx + 0.45, ly + 0.09, label,
                va="center", fontsize=8, color="#374151", zorder=3)

    plt.tight_layout(pad=0.2)
    plt.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close()
    print(f"  tf  diagram   -> {path}")


# ── PDF assembly ───────────────────────────────────────────────────────────────

def build_pdf(app_diagram: str, tf_diagram: str) -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        topMargin=0.85 * inch,  bottomMargin=0.85 * inch,
        title="Weather AI — Architecture & Deployment Guide",
        author="Wine & Liquor AI Agent Project",
    )

    styles = getSampleStyleSheet()
    W = letter[0] - 1.7 * inch

    S_TITLE    = ParagraphStyle("DocTitle", parent=styles["Title"],
                                fontSize=24, spaceAfter=4,
                                textColor=colors.HexColor("#0369A1"),
                                alignment=TA_CENTER)
    S_SUB      = ParagraphStyle("DocSub", parent=styles["Normal"],
                                fontSize=11, spaceAfter=4,
                                textColor=colors.HexColor("#64748B"),
                                alignment=TA_CENTER)
    S_DATE     = ParagraphStyle("DocDate", parent=styles["Normal"],
                                fontSize=9, spaceAfter=22,
                                textColor=colors.HexColor("#94A3B8"),
                                alignment=TA_CENTER)
    S_H2       = ParagraphStyle("H2", parent=styles["Heading2"],
                                fontSize=13, spaceBefore=18, spaceAfter=6,
                                textColor=colors.HexColor("#0369A1"),
                                fontName="Helvetica-Bold")
    S_H3       = ParagraphStyle("H3", parent=styles["Heading3"],
                                fontSize=11, spaceBefore=12, spaceAfter=4,
                                textColor=colors.HexColor("#0F172A"),
                                fontName="Helvetica-Bold")
    S_BODY     = ParagraphStyle("Body", parent=styles["Normal"],
                                fontSize=10, leading=16, spaceAfter=6)
    S_CODE     = ParagraphStyle("Code", parent=styles["Code"],
                                fontSize=8.5, leading=13, fontName="Courier",
                                backColor=colors.HexColor("#F1F5F9"),
                                borderPad=6, spaceAfter=2, leftIndent=8)
    S_NOTE     = ParagraphStyle("Note", parent=styles["Normal"],
                                fontSize=8.5, leading=13,
                                textColor=colors.HexColor("#6B7280"),
                                leftIndent=10, spaceAfter=6)
    S_TAG      = ParagraphStyle("Tag", parent=styles["Normal"],
                                fontSize=9, spaceBefore=8, spaceAfter=2,
                                textColor=colors.HexColor("#6D28D9"),
                                fontName="Helvetica-Bold")

    HDR_BG  = colors.HexColor("#0369A1")
    ROW_ALT = colors.HexColor("#F0F9FF")
    GRID_C  = colors.HexColor("#BAE6FD")
    TF_HDR  = colors.HexColor("#C2410C")
    TF_ALT  = colors.HexColor("#FFF7ED")
    GR_HDR  = colors.HexColor("#15803D")
    GR_ALT  = colors.HexColor("#F0FDF4")

    def hr(c="#BAE6FD"):
        return HRFlowable(width="100%", thickness=1,
                          color=colors.HexColor(c), spaceAfter=8)

    def section(title, hr_color="#BAE6FD"):
        return [Paragraph(title, S_H2), hr(hr_color)]

    def subsection(title):
        return Paragraph(title, S_H3)

    def code_block(text):
        out = []
        for line in text.splitlines():
            safe = line.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            out.append(Paragraph(
                f'<font name="Courier" size="8.5">{safe or "&nbsp;"}</font>',
                S_CODE))
        return out

    def tbl(rows, col_props, hdr_bg=HDR_BG, alt=ROW_ALT, grid=GRID_C):
        col_w = [W * p for p in col_props]
        t = Table(rows, colWidths=col_w)
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0),  hdr_bg),
            ("TEXTCOLOR",     (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",      (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, 0),  9.5),
            ("TOPPADDING",    (0, 0), (-1, 0),  7),
            ("BOTTOMPADDING", (0, 0), (-1, 0),  7),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, alt]),
            ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
            ("FONTNAME",      (0, 1), (1, -1),  "Courier"),
            ("FONTSIZE",      (0, 1), (-1, -1), 8.5),
            ("TOPPADDING",    (0, 1), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
            ("GRID",          (0, 0), (-1, -1), 0.5, grid),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return t

    def app_card(name, desc, standalone_cmd, standalone_url,
                 lambda_cmd, lambda_output, docker_cmd=None, note=None):
        out = [subsection(name), Paragraph(desc, S_BODY)]
        out.append(Paragraph("Standalone", S_TAG))
        out += code_block(standalone_cmd)
        if standalone_url:
            out.append(Paragraph(
                f'<font name="Courier">{standalone_url}</font>', S_NOTE))
        if docker_cmd:
            out.append(Paragraph("Docker", S_TAG))
            out += code_block(docker_cmd)
        out.append(Paragraph("Lambda (AWS)", S_TAG))
        out += code_block(lambda_cmd)
        if lambda_output:
            out.append(Paragraph(lambda_output, S_NOTE))
        if note:
            out.append(Paragraph(f"Note: {note}", S_NOTE))
        out.append(Spacer(1, 0.08 * inch))
        return out

    story = []

    # ── Cover ─────────────────────────────────────────────────────────────────
    story += [
        Spacer(1, 0.2 * inch),
        Paragraph("Weather AI", S_TITLE),
        Paragraph("Architecture &amp; Deployment Guide", S_SUB),
        Paragraph(
            f"Expo UI  |  Weather Agent  |  DuckDB API  |  MCP  |  RAG  |  Claude  |  Terraform  |  "
            f"{datetime.now().strftime('%B %d, %Y  %H:%M')}",
            S_DATE),
    ]

    # ── App Architecture Diagram ───────────────────────────────────────────────
    story += section("Application Architecture — Weather Demo")
    story.append(Paragraph(
        "End-to-end data flow: Expo UI sends a question to the FastAPI weather agent. "
        "The agent enriches the prompt with RAG context, sends it to Claude with MCP tools available. "
        "Claude calls the MCP weather server (spawned as a stdio subprocess), "
        "which fetches live data from Open-Meteo (free, no API key).",
        S_BODY))
    story += [Image(app_diagram, width=W, height=W * (8 / 11)), Spacer(1, 0.1 * inch)]

    # ── Folder Layout ─────────────────────────────────────────────────────────
    story += section("Folder Layout")
    story.append(tbl(
        [["Folder", "Language", "Purpose"],
         ["lib/",         "Python",              "Shared library: llm_client, db, data_downloader, generate_pdf"],
         ["server/",      "Python only",         "Weather Agent FastAPI server — port 8001"],
         ["duckdb/",      "Python only",         "DuckDB REST API FastAPI server — port 8000"],
         ["mcp/",         "Python only",         "MCP server — get_current_weather, get_forecast (stdio)"],
         ["rag/",         "Python only",         "ChromaDB + sentence-transformers RAG retrieval"],
         ["agent/",       "Python only",         "Data cleaning + orchestration agents (future)"],
         ["ui/",          "Expo / React Native", "App.tsx — iOS, Android, Web via Expo"],
         ["terrorform/",  "Terraform (HCL)",     "One root module per app + modules/ for shared logic"],
         ["docker/",      "Dockerfile / SQL",    "Docker service configs + DB init scripts"],
         ["scripts/",     "Shell (.sh)",         "Download scripts and shell utilities"],
         ["samples/",     "(data)",              "Downloaded datasets — gitignored"],
         ["docs/pdfs/",   "(output)",            "Generated PDFs — gitignored, run lib/generate_pdf.py"]],
        (0.14, 0.20, 0.66)))

    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        "<b>Conventions:</b>  Shared Python library code lives in <font name='Courier'>lib/</font>.  "
        "Each FastAPI server has its own folder (<font name='Courier'>server/</font>, "
        "<font name='Courier'>duckdb/</font>).  "
        "<font name='Courier'>rag/</font>, <font name='Courier'>mcp/</font>, "
        "<font name='Courier'>agent/</font> are Python-only.  "
        "<font name='Courier'>ui/</font> is Expo (React Native) only — no plain HTML/CSS/JS.",
        S_BODY))

    # ── Environment Variables ──────────────────────────────────────────────────
    story.append(PageBreak())
    story += section("Environment Variables")
    story.append(Paragraph(
        "Edit <font name='Courier'>.env</font> at the project root.  "
        "<b>ANTHROPIC_API_KEY must only live in .env</b> — never as a system environment variable.  "
        "If set system-wide, the Claude CLI will consume it and burn API credits.",
        S_BODY))
    story += code_block("""\
# ── Anthropic ─────────────────────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
ANTHROPIC_MODEL=claude-sonnet-4-6

# ── LLM provider (lib/llm_client.py) ─────────────────────────────────────────
LLM_PROVIDER=claude          # or: ollama  (free, local, no credits burned)
CLAUDE_MODEL=claude-sonnet-4-6
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# ── DuckDB ────────────────────────────────────────────────────────────────────
DUCKDB_DATA_DIR=/data        # overridden to /tmp automatically in Lambda
SAMPLES_DIR=samples

# ── PostgreSQL ────────────────────────────────────────────────────────────────
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=wine_liquor
POSTGRES_USER=postgres
POSTGRES_PASSWORD=WineL1quor#2024""")

    # ── Prerequisites ─────────────────────────────────────────────────────────
    story += section("Prerequisites — First-Time Setup")
    story += code_block("""\
# 1. Create and activate the root Python virtual environment
python -m venv venv
source venv/bin/activate          # WSL / macOS / Linux
# venv\\Scripts\\activate.bat      # Windows cmd

# 2. Install per-app Python dependencies
pip install torch --index-url https://download.pytorch.org/whl/cpu   # CPU-only (skip 2 GB CUDA)
pip install -r rag/requirements.txt
pip install -r mcp/requirements.txt
pip install -r server/requirements.txt
pip install -r duckdb/requirements.txt

# 3. Install Expo UI dependencies
cd ui && npm install && cd ..

# 4. Copy .env and fill in your Anthropic API key
cp .env.example .env              # if .env.example exists
# then edit .env: ANTHROPIC_API_KEY=sk-ant-...""")

    # ── Standalone Deployment ──────────────────────────────────────────────────
    story.append(PageBreak())
    story += section("Standalone Deployment — All Apps", hr_color="#86EFAC")
    story.append(Paragraph(
        "Run each app locally from the project root using the venv. "
        "All apps read from <font name='Courier'>.env</font> at the project root. "
        "The MCP server is not run directly — it is spawned automatically by the weather agent.",
        S_BODY))

    story += app_card(
        "1. Weather Agent  (FastAPI — port 8001)",
        "Chains RAG retrieval + Claude tool_use loop + MCP weather calls. "
        "The MCP server (mcp/weather_server.py) is spawned automatically as a stdio subprocess "
        "on each request — no need to start it separately.",
        """\
source venv/bin/activate
python server/weather_agent.py
# or with hot-reload:
uvicorn server.weather_agent:app --reload --port 8001""",
        "http://localhost:8001   POST /ask  {\"city\": \"Tokyo\", \"question\": \"Rain today?\"}",
        """\
export TF_VAR_anthropic_api_key="sk-ant-..."
cd terrorform/agent && terraform init && terraform apply
terraform output agent_url   # copy this — needed for ui deploy""",
        "Outputs agent_url (Lambda Function URL — HTTPS, public)",
    )

    story += app_card(
        "2. DuckDB REST API  (FastAPI — port 8000)",
        "Exposes DuckDB via REST. Downloads Iowa Liquor Sales and LCBO datasets on demand. "
        "In Lambda, the database lives in /tmp (ephemeral per container). "
        "In Docker, data persists in a named volume.",
        """\
source venv/bin/activate
cd duckdb && python app.py
# or with hot-reload (run from duckdb/ folder):
uvicorn api:app --reload --port 8000""",
        "http://localhost:8000   GET /health  GET /tables  POST /query  GET /download?dataset=iowa-liquor-sales",
        """\
cd terrorform/duckdb && terraform init && terraform apply
terraform output duckdb_url""",
        "Outputs duckdb_url (Lambda Function URL — HTTPS, public)",
        docker_cmd="docker compose --profile duckdb up -d",
    )

    story += app_card(
        "3. MCP Weather Server  (FastMCP — stdio)",
        "Implements two MCP tools: get_current_weather(city) and get_forecast(city, days). "
        "Fetches live data from Open-Meteo (free, no API key). "
        "Uses stdio transport — it is spawned as a child process by the weather agent, "
        "not started independently.",
        """\
# Not run directly — spawned automatically by server/weather_agent.py
# To test the MCP server in isolation:
source venv/bin/activate
python mcp/weather_server.py""",
        None,
        "cd terrorform/mcp && terraform init && terraform apply",
        None,
        note="The Lambda deployment of the MCP server is for future serverless MCP hosting. "
             "In the current weather demo, MCP runs as a subprocess inside the agent Lambda.",
    )

    story += app_card(
        "4. Expo UI  (React Native — iOS / Android / Web)",
        "Weather chat UI. Sends POST /ask to the weather agent. "
        "AGENT_URL is read from EXPO_PUBLIC_AGENT_URL in ui/.env (local dev) "
        "or baked into the bundle at expo export time (Lambda deploy).",
        """\
cd ui
# Copy and edit ui/.env (see ui/.env.example)
cp .env.example .env    # set EXPO_PUBLIC_AGENT_URL=http://localhost:8001

npm start               # Expo dev menu — press w=web, a=Android, i=iOS
npm run android         # Android emulator directly
npm run ios             # iOS simulator directly (macOS only)
npm run web             # Web browser directly

# Local Lambda simulation (after npm run build:web):
npm run build:web       # expo export -p web -> ui/dist/
npm run serve:lambda    # node lambda-server.js -> http://localhost:3000""",
        "http://localhost:3000  (serve:lambda mode)  |  Expo QR code (npm start)",
        """\
# Requires agent_url from terrorform/agent output
export TF_VAR_agent_url="https://xxxx.lambda-url.us-east-1.on.aws/"
cd terrorform/ui && terraform init && terraform apply
terraform output ui_url""",
        "Outputs ui_url — public HTTPS URL for the weather chat web app",
    )

    # ── Lambda Deployment ──────────────────────────────────────────────────────
    story.append(PageBreak())
    story += section("Lambda Deployment — Full Pipeline", hr_color="#FED7AA")
    story.append(Paragraph(
        "Each app is an independent Terraform root with its own S3 state. "
        "Steps 1-3 can be run in any order. "
        "Step 4 (UI) must run last because it needs the agent URL from Step 2. "
        "<b>Always run terraform from WSL</b> — "
        "<font name='Courier'>local-exec</font> provisioners use bash.",
        S_BODY))

    story += code_block("""\
# ── Prerequisites ────────────────────────────────────────────────────────────
# AWS credentials configured (aws configure or AWS_* env vars)
# S3 bucket created: wine-liquor-tf-state  (see provider.tf in any root)
# Docker running (used by lambda_layer module to build Linux packages)

# ── Step 1: Build shared Lambda layers ───────────────────────────────────────
# Run once, or whenever any requirements.txt changes.
# Builds deps (duckdb, fastapi, anthropic, mangum, etc.) inside Amazon Linux.
cd terrorform/layers && terraform init && terraform apply

# ── Step 2: Deploy Python Lambdas (any order) ────────────────────────────────
export TF_VAR_anthropic_api_key="sk-ant-..."

cd terrorform/agent  && terraform init && terraform apply
cd terrorform/mcp    && terraform init && terraform apply
cd terrorform/duckdb && terraform init && terraform apply

# ── Step 3: Get the agent URL ────────────────────────────────────────────────
cd terrorform/agent
AGENT_URL=$(terraform output -raw agent_url)
echo $AGENT_URL
# e.g. https://abcd1234.lambda-url.us-east-1.on.aws/

# ── Step 4: Deploy UI (needs agent URL) ──────────────────────────────────────
# Terraform runs expo export -p web and bakes AGENT_URL into the JS bundle.
export TF_VAR_agent_url="$AGENT_URL"
cd terrorform/ui && terraform init && terraform apply

# Output: ui_url — open this in a browser
cd terrorform/ui && terraform output ui_url""")

    story.append(Spacer(1, 0.1 * inch))
    story += section("Lambda Outputs Reference", hr_color="#FED7AA")
    story.append(tbl(
        [["App", "Terraform Root", "Output Variable", "What it exposes"],
         ["Weather Agent", "terrorform/agent/",  "agent_url",  "POST /ask  {city, question}"],
         ["DuckDB API",    "terrorform/duckdb/", "duckdb_url", "GET /tables  POST /query  GET /download"],
         ["MCP Server",    "terrorform/mcp/",    "(none)",     "stdio subprocess — no HTTP endpoint"],
         ["Expo Web UI",   "terrorform/ui/",     "ui_url",     "Public URL for the weather chat web app"]],
        (0.18, 0.22, 0.20, 0.40),
        hdr_bg=TF_HDR, alt=TF_ALT, grid=colors.HexColor("#FED7AA")))

    story.append(Spacer(1, 0.1 * inch))
    story += section("Lambda Environment Variables", hr_color="#FED7AA")
    story.append(Paragraph(
        "Set these before running <font name='Courier'>terraform apply</font>. "
        "Never commit secrets to <font name='Courier'>.tfvars</font>.",
        S_BODY))
    story.append(tbl(
        [["Variable", "App", "How to set"],
         ["TF_VAR_anthropic_api_key", "agent",  "export TF_VAR_anthropic_api_key=\"sk-ant-...\""],
         ["TF_VAR_agent_url",         "ui",     "export TF_VAR_agent_url=\"$(cd terrorform/agent && terraform output -raw agent_url)\""],
         ["TF_VAR_postgres_host",     "agent",  "export TF_VAR_postgres_host=\"...\"  (future use)"],
         ["TF_VAR_postgres_password", "agent",  "export TF_VAR_postgres_password=\"...\"  (future use)"]],
        (0.32, 0.12, 0.56),
        hdr_bg=TF_HDR, alt=TF_ALT, grid=colors.HexColor("#FED7AA")))

    # ── Docker Services ────────────────────────────────────────────────────────
    story.append(PageBreak())
    story += section("Docker Services", hr_color="#86EFAC")
    story.append(Paragraph(
        "All services use named Docker volumes for persistence. "
        "Start individual services with their profile or use <font name='Courier'>all</font> "
        "to start everything.",
        S_BODY))
    story += code_block("""\
# Start a specific service
docker compose --profile postgresql up -d   # PostgreSQL 16 + pgvector  :5432
docker compose --profile duckdb     up -d   # DuckDB REST API            :8000
docker compose --profile mssql      up -d   # SQL Server 2022            :1433
docker compose --profile mysql      up -d   # MySQL 8.0                  :3306
docker compose --profile oracle     up -d   # Oracle XE 21c              :1521
docker compose --profile firebase   up -d   # Firebase Emulator Suite    :4000
docker compose --profile localstack up -d   # LocalStack (S3, SQS...)    :4566

# Start everything
docker compose --profile all up -d

# Stop and wipe a service's data
docker compose --profile duckdb down && docker volume rm wine_liquor_duckdb_data""")

    story.append(Spacer(1, 0.1 * inch))
    story.append(tbl(
        [["Profile",     "Image",                              "Port", "Data Volume"],
         ["postgresql",  "pgvector/pgvector:pg16",             "5432", "wine_liquor_postgres_data"],
         ["duckdb",      "python:3.12-slim (custom)",          "8000", "wine_liquor_duckdb_data"],
         ["mssql",       "mcr.microsoft.com/mssql/server:2022","1433", "wine_liquor_mssql_data"],
         ["mysql",       "mysql:8.0",                          "3306", "wine_liquor_mysql_data"],
         ["oracle",      "gvenzl/oracle-xe:21-slim",           "1521", "wine_liquor_oracle_data"],
         ["firebase",    "firebase emulator",                  "4000", "wine_liquor_firebase_data"],
         ["localstack",  "localstack/localstack",              "4566", "wine_liquor_localstack_data"]],
        (0.18, 0.36, 0.10, 0.36),
        hdr_bg=GR_HDR, alt=GR_ALT, grid=colors.HexColor("#86EFAC")))

    # ── Deployment Formats Summary ─────────────────────────────────────────────
    story.append(PageBreak())
    story += section("All Apps — Deployment Format Summary")
    story.append(tbl(
        [["App", "Standalone", "Docker", "Lambda"],
         ["Weather Agent\nserver/weather_agent.py",
          "python server/weather_agent.py\n:8001",
          "No profile\n(use standalone)",
          "terrorform/agent/\n-> agent_url"],
         ["DuckDB API\nduckdb/api.py",
          "cd duckdb && python app.py\n:8000",
          "docker compose\n--profile duckdb",
          "terrorform/duckdb/\n-> duckdb_url"],
         ["MCP Server\nmcp/weather_server.py",
          "Subprocess of agent\n(not run directly)",
          "No profile",
          "terrorform/mcp/\n(no HTTP output)"],
         ["Expo UI\nui/App.tsx",
          "cd ui && npm start\n(Expo dev server)",
          "No profile\n(serve:lambda for local test)",
          "terrorform/ui/\n-> ui_url"]],
        (0.22, 0.26, 0.26, 0.26)))

    # ── Terraform Structure ────────────────────────────────────────────────────
    story.append(PageBreak())
    story += section("Terraform Structure", hr_color="#FED7AA")
    story.append(Paragraph(
        "Each app has its own independent Terraform root with its own S3 state key. "
        "Python apps use the shared <font name='Courier'>modules/lambda_function</font> and "
        "<font name='Courier'>modules/lambda_layer</font> modules. "
        "The Node.js UI Lambda (<font name='Courier'>terrorform/ui/</font>) "
        "writes resources directly since the Python modules don't apply to Node.js. "
        "<b>Never flatten this structure.</b>",
        S_BODY))
    story += [Image(tf_diagram, width=W, height=W * (6.5 / 13)), Spacer(1, 0.1 * inch)]

    story += section("Terraform Folder Rules", hr_color="#FED7AA")
    story.append(tbl(
        [["Folder", "Type", "Rule"],
         ["terrorform/modules/lambda_function/", "Shared module",
          "Lambda + IAM — used by every Python app root"],
         ["terrorform/modules/lambda_layer/",    "Shared module",
          "Docker build + layer publish — called by layers/ only"],
         ["terrorform/layers/",                  "Root module",
          "Builds deps + shared layers, exports ARNs — deploy first"],
         ["terrorform/agent/",                   "Root module",
          "Weather Agent Lambda — handler: weather_agent.handler"],
         ["terrorform/mcp/",                     "Root module",
          "MCP Lambda — handler: weather_server.handler"],
         ["terrorform/duckdb/",                  "Root module",
          "DuckDB API Lambda — handler: api.handler"],
         ["terrorform/ui/",                      "Root module",
          "Expo Web Lambda (Node.js) — builds expo export, serves via Express"]],
        (0.34, 0.17, 0.49),
        hdr_bg=TF_HDR, alt=TF_ALT, grid=colors.HexColor("#FED7AA")))

    story.append(Spacer(1, 0.1 * inch))
    story += section("Hardware & OS Handling", hr_color="#FED7AA")
    story.append(Paragraph(
        "The <font name='Courier'>null_resource</font> in "
        "<font name='Courier'>modules/lambda_layer</font> "
        "builds all Python packages inside the exact Amazon Linux image Lambda uses. "
        "The dev OS (Windows, WSL, macOS) never touches compilation. "
        "One variable in <font name='Courier'>terraform.tfvars</font> controls everything:",
        S_BODY))
    story += code_block("""\
# terrorform/<app>/terraform.tfvars
lambda_arch    = "x86_64"    # or "arm64" (Graviton2, ~20% cheaper)
python_version = "python3.12"

# Changing lambda_arch automatically updates:
#   Docker --platform linux/amd64  (or linux/arm64)
#   aws_lambda_layer_version  compatible_architectures
#   aws_lambda_function       architectures""")

    story += [
        Spacer(1, 0.2 * inch),
        Paragraph(
            "Weather data: <b>Open-Meteo</b> (api.open-meteo.com) — free, no key, no rate limit.  "
            "PDF generated: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            S_NOTE),
    ]

    doc.build(story)
    print(f"  PDF           -> {OUTPUT}")


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    print(f"Generating {OUTPUT.name} ...")
    app_tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tf_tmp  = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    app_tmp.close()
    tf_tmp.close()
    try:
        draw_app_diagram(app_tmp.name)
        draw_terraform_diagram(tf_tmp.name)
        build_pdf(app_tmp.name, tf_tmp.name)
    finally:
        os.unlink(app_tmp.name)
        os.unlink(tf_tmp.name)
    print("Done.")


if __name__ == "__main__":
    main()
