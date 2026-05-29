"""
Generate docs/pdfs/system.flow.pdf — Weather AI system flow diagram.
Run from the project root (venv must be active):
    python gen.system.flow.py
"""

import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable, Image, PageBreak,
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT     = Path(__file__).parent
DOCS_DIR = ROOT / "docs" / "pdfs"
OUTPUT   = DOCS_DIR / "system.flow.pdf"

# ── Colour palette ─────────────────────────────────────────────────────────────
P = {
    "user":    ("#E0F2FE", "#0284C7"),
    "ui":      ("#DBEAFE", "#1D4ED8"),
    "agent":   ("#DCFCE7", "#15803D"),
    "rag":     ("#FEF9C3", "#A16207"),
    "claude":  ("#FCE7F3", "#9D174D"),
    "mcp":     ("#EDE9FE", "#6D28D9"),
    "meteo":   ("#CFFAFE", "#0E7490"),
}
ARROW_C = "#475569"
BG      = "#F8FAFC"


# ── Drawing helpers ────────────────────────────────────────────────────────────

def box(ax, cx, cy, w, h, key, lines):
    bg, border = P[key]
    ax.add_patch(FancyBboxPatch(
        (cx - w / 2, cy - h / 2), w, h,
        boxstyle="round,pad=0.12",
        facecolor=bg, edgecolor=border, linewidth=2.2, zorder=2,
    ))
    sizes   = [9.5, 7.5, 6.5]
    weights = ["bold", "normal", "normal"]
    tcolors = ["#111827", "#374151", "#6B7280"]
    styles  = ["normal", "normal", "italic"]
    n    = len(lines)
    step = min(h / (n + 1), 0.24)
    top  = cy + step * (n - 1) / 2
    for i, text in enumerate(lines):
        ax.text(cx, top - i * step, text,
                ha="center", va="center", zorder=3,
                fontsize=sizes[min(i, 2)], fontweight=weights[min(i, 2)],
                color=tcolors[min(i, 2)], style=styles[min(i, 2)])


def arrow(ax, x1, y1, x2, y2, label="", rad=0.0, dashed=False, col=ARROW_C):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1), zorder=1,
                arrowprops=dict(
                    arrowstyle="->", lw=1.7, color=col,
                    linestyle="dashed" if dashed else "solid",
                    connectionstyle=f"arc3,rad={rad}",
                ))
    if label:
        mx = (x1 + x2) / 2 + (0.45 * rad if rad else 0)
        my = (y1 + y2) / 2 + (0.08 if not dashed else 0)
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=6.8, color="#374151", zorder=4,
                bbox=dict(facecolor="white", edgecolor="none", alpha=0.90, pad=2))


def step_badge(ax, cx, cy, n):
    ax.add_patch(plt.Circle((cx, cy), 0.19, color="#0369A1", zorder=5))
    ax.text(cx, cy, str(n), ha="center", va="center",
            fontsize=8, fontweight="bold", color="white", zorder=6)


# ── Diagram ────────────────────────────────────────────────────────────────────

def draw_flow(path: str) -> None:
    fig, ax = plt.subplots(figsize=(13, 9))
    ax.set_xlim(0, 13); ax.set_ylim(0, 9); ax.axis("off")
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(BG)

    # ── Title ──────────────────────────────────────────────────────────────────
    ax.text(6.5, 8.65, "Weather AI — System Flow",
            ha="center", va="center", fontsize=16, fontweight="bold",
            color="#0F172A")
    ax.text(6.5, 8.35, "Single request cycle: User question → answer",
            ha="center", va="center", fontsize=9.5, color="#64748B")

    # ── Boxes ──────────────────────────────────────────────────────────────────
    #                   cx    cy    w     h
    box(ax,  1.5,  7.3, 2.4,  0.75, "user",
        ["User  (browser)", "http://localhost:8081"])

    box(ax,  1.5,  5.7, 2.4,  0.85, "ui",
        ["Expo Web UI", "ui/pages/HomePage.tsx",
         "POST /chat → :8001"])

    box(ax,  6.5,  5.7, 3.0,  0.95, "agent",
        ["Python Agent  (FastAPI :8001)",
         "ai.agents/weather/agent.py",
         "orchestrates RAG + Claude + MCP"])

    box(ax,  3.5,  3.5, 2.8,  1.05, "rag",
        ["RAG Layer",
         "rags/weather/rag.py",
         "ChromaDB + all-MiniLM-L6-v2"])

    box(ax,  9.5,  5.7, 2.8,  0.95, "claude",
        ["Claude API",
         "claude-sonnet-4-6",
         "tool_use loop"])

    box(ax,  9.5,  3.5, 2.8,  1.05, "mcp",
        ["MCP Server  (subprocess)",
         "mcps/weather/mcp.py",
         "get_current_weather / get_forecast"])

    box(ax,  9.5,  1.4, 2.8,  0.85, "meteo",
        ["Open-Meteo  (free, no key)",
         "api.open-meteo.com",
         "geocoding + forecast"])

    # ── Arrows + step badges ───────────────────────────────────────────────────
    # 1  User → UI
    arrow(ax, 1.5, 6.92, 1.5, 6.13, "types question")
    step_badge(ax, 1.5, 6.52, 1)

    # 2  UI → Agent
    arrow(ax, 2.72, 5.7, 5.0, 5.7, "POST /chat  {message}")
    step_badge(ax, 3.86, 5.7, 2)

    # 3  Agent → RAG
    arrow(ax, 5.45, 5.25, 4.35, 4.03, "query string")
    step_badge(ax, 4.75, 4.75, 3)

    # 4  RAG → Agent  (dashed = return)
    arrow(ax, 4.4, 4.03, 5.5, 5.25, "knowledge chunks", rad=-0.35, dashed=True,
          col="#A16207")
    step_badge(ax, 4.72, 4.42, 4)

    # 5  Agent → Claude
    arrow(ax, 8.0, 5.7, 8.1, 5.7, "prompt + context + tools")
    step_badge(ax, 8.05, 5.85, 5)

    # 6  Claude → MCP
    arrow(ax, 9.5, 5.22, 9.5, 4.03, "tool_use call")
    step_badge(ax, 9.72, 4.62, 6)

    # 7  MCP → Open-Meteo
    arrow(ax, 9.5, 2.97, 9.5, 1.83, "HTTP request  (city)")
    step_badge(ax, 9.72, 2.40, 7)

    # 8  Open-Meteo → MCP  (dashed)
    arrow(ax, 10.51, 1.83, 10.51, 2.97, "weather JSON", dashed=True,
          col="#0E7490")
    step_badge(ax, 10.73, 2.40, 8)

    # 9  MCP → Claude  (dashed)
    arrow(ax, 10.5, 4.03, 10.5, 5.22, "tool result", dashed=True,
          col="#6D28D9")
    step_badge(ax, 10.72, 4.62, 9)

    # 10 Claude → Agent  (dashed)
    arrow(ax, 8.1, 5.55, 8.0, 5.55, "final answer", rad=0.3, dashed=True,
          col="#9D174D")
    step_badge(ax, 8.05, 5.40, 10)

    # 11 Agent → UI  (dashed)
    arrow(ax, 5.0, 5.55, 2.72, 5.55, "JSON  {answer}", dashed=True,
          col="#15803D")
    step_badge(ax, 3.86, 5.40, 11)

    # 12 UI → User  (dashed)
    arrow(ax, 1.5, 6.13, 1.5, 6.92, "chat bubble", dashed=True,
          col="#1D4ED8")
    step_badge(ax, 1.5, 6.52, 12)

    # ── Legend ─────────────────────────────────────────────────────────────────
    legend = [
        ("User / Browser",          "user"),
        ("Expo Web UI",             "ui"),
        ("Python Agent (FastAPI)",  "agent"),
        ("RAG (ChromaDB)",          "rag"),
        ("Claude API",              "claude"),
        ("MCP Server (subprocess)", "mcp"),
        ("Open-Meteo (free API)",   "meteo"),
    ]
    for i, (label, key) in enumerate(legend):
        fc, ec = P[key]
        col_i  = i % 4
        row_i  = i // 4
        lx = 0.3 + col_i * 3.15
        ly = 0.55 - row_i * 0.28
        ax.add_patch(FancyBboxPatch((lx, ly), 0.32, 0.17,
                                    boxstyle="round,pad=0.03",
                                    facecolor=fc, edgecolor=ec,
                                    linewidth=1.3, zorder=2))
        ax.text(lx + 0.42, ly + 0.085, label,
                va="center", fontsize=7.2, color="#374151", zorder=3)

    ax.text(0.3, 0.14,
            "Solid arrows = request  |  Dashed arrows = response  |  "
            "Numbered badges = step order",
            fontsize=7.5, color="#94A3B8")

    plt.tight_layout(pad=0.3)
    plt.savefig(path, dpi=160, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close()
    print(f"  flow diagram  -> {path}")


# ── PDF assembly ───────────────────────────────────────────────────────────────

def build_pdf(diagram_path: str) -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.85 * inch, rightMargin=0.85 * inch,
        topMargin=0.85 * inch,  bottomMargin=0.85 * inch,
        title="Weather AI — System Flow",
        author="Wine & Liquor AI Agent Project",
    )

    styles = getSampleStyleSheet()
    W = letter[0] - 1.7 * inch

    S_TITLE = ParagraphStyle("T",  parent=styles["Title"],
                             fontSize=24, spaceAfter=4,
                             textColor=colors.HexColor("#0369A1"),
                             alignment=TA_CENTER)
    S_SUB   = ParagraphStyle("S",  parent=styles["Normal"],
                             fontSize=11, spaceAfter=4,
                             textColor=colors.HexColor("#64748B"),
                             alignment=TA_CENTER)
    S_DATE  = ParagraphStyle("D",  parent=styles["Normal"],
                             fontSize=9, spaceAfter=18,
                             textColor=colors.HexColor("#94A3B8"),
                             alignment=TA_CENTER)
    S_H2    = ParagraphStyle("H2", parent=styles["Heading2"],
                             fontSize=13, spaceBefore=16, spaceAfter=6,
                             textColor=colors.HexColor("#0369A1"),
                             fontName="Helvetica-Bold")
    S_BODY  = ParagraphStyle("B",  parent=styles["Normal"],
                             fontSize=10, leading=16, spaceAfter=6)
    S_NOTE  = ParagraphStyle("N",  parent=styles["Normal"],
                             fontSize=8.5, leading=13,
                             textColor=colors.HexColor("#6B7280"),
                             spaceAfter=4)

    HDR = colors.HexColor("#0369A1")
    ALT = colors.HexColor("#F0F9FF")
    GRD = colors.HexColor("#BAE6FD")

    def hr():
        return HRFlowable(width="100%", thickness=1,
                          color=colors.HexColor("#BAE6FD"), spaceAfter=8)

    def section(title):
        return [Paragraph(title, S_H2), hr()]

    def tbl(rows, col_props, hdr_bg=HDR, alt=ALT, grid=GRD):
        col_w = [W * p for p in col_props]
        t = Table(rows, colWidths=col_w)
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), hdr_bg),
            ("TEXTCOLOR",     (0, 0), (-1, 0), colors.white),
            ("FONTNAME",      (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",      (0, 0), (-1, 0), 9.5),
            ("TOPPADDING",    (0, 0), (-1, 0), 7),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [colors.white, alt]),
            ("FONTNAME",      (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE",      (0, 1), (-1, -1), 8.5),
            ("TOPPADDING",    (0, 1), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
            ("GRID",          (0, 0), (-1, -1), 0.5, grid),
            ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return t

    story = []

    # ── Cover ──────────────────────────────────────────────────────────────────
    story += [
        Spacer(1, 0.15 * inch),
        Paragraph("Weather AI", S_TITLE),
        Paragraph("System Flow", S_SUB),
        Paragraph(
            f"Expo UI  ·  FastAPI Agent  ·  RAG  ·  Claude  ·  MCP  ·  Open-Meteo  ·  "
            f"{datetime.now().strftime('%B %d, %Y')}",
            S_DATE),
    ]

    # ── Flow Diagram ───────────────────────────────────────────────────────────
    story += section("System Flow Diagram")
    story.append(Paragraph(
        "Each numbered step corresponds to one hop in the request/response cycle. "
        "Solid arrows are outbound requests; dashed arrows are responses.",
        S_BODY))
    story.append(Image(diagram_path, width=W, height=W * (9 / 13)))
    story.append(Spacer(1, 0.1 * inch))

    # ── Step-by-step table ─────────────────────────────────────────────────────
    story += section("Step-by-Step Flow")
    story.append(tbl(
        [["Step", "From", "To", "Data / Action"],
         ["1",  "User",          "Expo Web UI",   "Types a question; browser sends to UI component"],
         ["2",  "Expo Web UI",   "Python Agent",  "POST /chat  { message, history, provider? }"],
         ["3",  "Python Agent",  "RAG Layer",     "Query string passed to retrieve()"],
         ["4",  "RAG Layer",     "Python Agent",  "Top-3 knowledge chunks from ChromaDB (dashed)"],
         ["5",  "Python Agent",  "Claude API",    "System prompt + RAG context + user message + MCP tool definitions"],
         ["6",  "Claude API",    "MCP Server",    "tool_use block: get_current_weather(city) or get_forecast(city, days)"],
         ["7",  "MCP Server",    "Open-Meteo",    "HTTP GET geocoding + forecast (free, no key)"],
         ["8",  "Open-Meteo",    "MCP Server",    "Weather JSON (temperature, wind, WMO code)  (dashed)"],
         ["9",  "MCP Server",    "Claude API",    "tool_result block with weather data  (dashed)"],
         ["10", "Claude API",    "Python Agent",  "Final text answer (stop_reason: end_turn)  (dashed)"],
         ["11", "Python Agent",  "Expo Web UI",   "JSON  { answer }  (dashed)"],
         ["12", "Expo Web UI",   "User",          "Answer rendered as assistant chat bubble  (dashed)"]],
        (0.06, 0.18, 0.18, 0.58)))

    story.append(Spacer(1, 0.1 * inch))

    # ── Component table ────────────────────────────────────────────────────────
    story += section("Components")
    story.append(tbl(
        [["Component", "File", "Port / Transport", "Role"],
         ["Expo Web UI",    "ui/pages/HomePage.tsx",            ":8081 (Metro)",   "Chat UI — sends POST /chat, renders bubbles"],
         ["Python Agent",   "ai.agents/weather/agent.py",       ":8001 (HTTP)",    "FastAPI — orchestrates RAG, Claude, MCP"],
         ["RAG Layer",      "rags/weather/rag.py",              "in-process",      "ChromaDB + all-MiniLM-L6-v2; retrieve(query, n=3)"],
         ["Knowledge Base", "rags/weather/knowledge.json",      "—",               "10 chunks: WMO codes, UV, humidity, wind, clothing"],
         ["Claude API",     "claude-sonnet-4-6",                "HTTPS (ext)",     "LLM — tool_use loop; reads ANTHROPIC_API_KEY"],
         ["MCP Server",     "mcps/weather/mcp.py",              "stdio (sub-proc)","FastMCP; spawned per-request via sys.executable"],
         ["Open-Meteo",     "api.open-meteo.com",               "HTTPS (ext)",     "Free weather API — geocoding + 7-day forecast"]],
        (0.16, 0.28, 0.18, 0.38)))

    story.append(Spacer(1, 0.1 * inch))

    # ── Key files table ────────────────────────────────────────────────────────
    story += section("Key Files")
    story.append(tbl(
        [["File", "Description"],
         ["ai.agents/weather/agent.py",     "FastAPI app — /health, /chat endpoints; runs RAG + Claude loop"],
         ["ai.agents/weather/requirements.txt", "anthropic, fastapi, uvicorn, mcp, openai, google-genai, boto3, mangum"],
         ["rags/weather/rag.py",            "ChromaDB collection; sentence-transformers embed; retrieve() function"],
         ["rags/weather/knowledge.json",    "Static weather knowledge — WMO codes, UV index, humidity, clothing tips"],
         ["rags/weather/requirements.txt",  "chromadb, sentence-transformers  (install CPU torch first)"],
         ["mcps/weather/mcp.py",            "FastMCP stdio server — get_current_weather, get_forecast tools"],
         ["mcps/weather/requirements.txt",  "mcp, requests"],
         ["ui/pages/HomePage.tsx",          "Chat UI — message bubbles, input bar, POST /chat, auto-scroll"],
         [".env",                           "ANTHROPIC_API_KEY, LLM_PROVIDER, AGENT_PORT, EXPO_PUBLIC_AGENT_URL"]],
        (0.38, 0.62)))

    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(
        f"Generated {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ·  "
        "Weather data: Open-Meteo (free, no API key)  ·  "
        "LLM: Anthropic Claude claude-sonnet-4-6",
        S_NOTE))

    doc.build(story)
    print(f"  PDF           -> {OUTPUT}")


# ── Entry point ────────────────────────────────────────────────────────────────

def main():
    print(f"Generating {OUTPUT} ...")
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    tmp.close()
    try:
        draw_flow(tmp.name)
        build_pdf(tmp.name)
    finally:
        os.unlink(tmp.name)
    print("Done.")


if __name__ == "__main__":
    main()
