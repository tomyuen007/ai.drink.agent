"""Generate ui.docx — login & sign-up flow diagram."""

import io
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# ── colour palette ────────────────────────────────────────────────────────────
C_PAGE   = "#EFF6FF"   # page / screen box
C_STORE  = "#FEF9C3"   # storage box
C_DECIDE = "#FEF3C7"   # diamond decision
C_ACTION = "#F0FDF4"   # action / outcome
C_BORDER = "#1E40AF"
C_ARROW  = "#374151"
C_TEXT   = "#1E293B"

# ── helpers ───────────────────────────────────────────────────────────────────

def box(ax, x, y, w, h, label, sublabel="", color=C_PAGE, fontsize=9):
    rect = FancyBboxPatch(
        (x - w / 2, y - h / 2), w, h,
        boxstyle="round,pad=0.02",
        linewidth=1.4, edgecolor=C_BORDER, facecolor=color, zorder=3,
    )
    ax.add_patch(rect)
    dy = 0.07 if sublabel else 0
    ax.text(x, y + dy, label, ha="center", va="center",
            fontsize=fontsize, color=C_TEXT, fontweight="bold", zorder=4)
    if sublabel:
        ax.text(x, y - 0.18, sublabel, ha="center", va="center",
                fontsize=7.5, color="#64748B", zorder=4)


def diamond(ax, x, y, w, h, label, fontsize=8.5):
    dx, dy = w / 2, h / 2
    xs = [x,      x + dx, x,      x - dx, x]
    ys = [y + dy, y,      y - dy, y,      y + dy]
    ax.fill(xs, ys, color=C_DECIDE, zorder=3)
    ax.plot(xs, ys, color=C_BORDER, linewidth=1.4, zorder=4)
    ax.text(x, y, label, ha="center", va="center",
            fontsize=fontsize, color=C_TEXT, fontweight="bold", zorder=5)


def arrow(ax, x1, y1, x2, y2, label="", color=C_ARROW):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color,
                                lw=1.5, mutation_scale=14), zorder=2)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx + 0.05, my, label, fontsize=7.5, color="#64748B",
                va="center", zorder=5)


def label_side(ax, x, y, text, side="right"):
    ox = 0.1 if side == "right" else -0.1
    ha = "left" if side == "right" else "right"
    ax.text(x + ox, y, text, fontsize=7.5, color="#64748B",
            va="center", ha=ha, zorder=5)


# ── figure ────────────────────────────────────────────────────────────────────

fig, ax = plt.subplots(figsize=(13, 18))
ax.set_xlim(0, 13)
ax.set_ylim(0, 18)
ax.axis("off")
fig.patch.set_facecolor("white")

# ─────────────────────────────────────────────────────────────────────────────
# SIGN-UP column  (left)   x ~ 3.5
# LOGIN column    (right)  x ~ 9.5
# ─────────────────────────────────────────────────────────────────────────────

SX, LX = 3.5, 9.5

# column headers
ax.text(SX, 17.4, "SIGN-UP FLOW", ha="center", fontsize=11,
        fontweight="bold", color=C_BORDER)
ax.text(LX, 17.4, "LOGIN FLOW", ha="center", fontsize=11,
        fontweight="bold", color=C_BORDER)

# divider
ax.axvline(6.5, ymin=0.01, ymax=0.98, color="#CBD5E1", linewidth=1, linestyle="--", zorder=1)

# ── SIGN-UP ───────────────────────────────────────────────────────────────────
# 1. Sign-Up page
box(ax, SX, 16.6, 2.8, 0.6, "Sign-Up Page", color=C_PAGE)

# 2. User fills form
box(ax, SX, 15.6, 2.8, 0.7,
    "User fills form",
    "email/phone · password · confirm", color=C_PAGE)
arrow(ax, SX, 16.3, SX, 15.95)

# 3. Validate per-character
box(ax, SX, 14.5, 2.8, 0.7,
    "Per-character validation",
    "email · phone · password · match", color=C_ACTION)
arrow(ax, SX, 15.25, SX, 14.85)

# 4. canSubmit?
diamond(ax, SX, 13.3, 2.2, 0.65, "canSubmit?")
arrow(ax, SX, 14.15, SX, 13.63)

# No → button stays disabled
box(ax, 1.2, 13.3, 1.5, 0.5, "Button disabled", color="#FEE2E2")
arrow(ax, SX - 1.1, 13.3, 1.95, 13.3)
label_side(ax, SX - 1.1, 13.3, "No", "left")

# Yes → Sign Up pressed
arrow(ax, SX, 12.97, SX, 12.4)
label_side(ax, SX + 0.05, 12.68, "Yes")

# 5. UserStore.register()
box(ax, SX, 12.05, 2.8, 0.6,
    "UserStore.register()", color=C_STORE)
arrow(ax, SX, 12.37, SX, 12.35)

# 6. Already exists?
diamond(ax, SX, 10.9, 2.4, 0.7, "User exists?")
arrow(ax, SX, 11.75, SX, 11.25)

# Yes → redirect
box(ax, 1.2, 10.9, 1.5, 0.5, "redirect", color="#FEF9C3")
arrow(ax, SX - 1.2, 10.9, 1.95, 10.9)
label_side(ax, SX - 1.2, 10.9, "Yes", "left")

# No → save user
arrow(ax, SX, 10.55, SX, 10.0)
label_side(ax, SX + 0.05, 10.28, "No")
box(ax, SX, 9.7, 2.8, 0.55,
    "Save user to AsyncStorage", color=C_STORE)

# Both paths → login page
arrow(ax, SX, 9.42, SX, 8.85)
arrow(ax, 1.95, 10.9, 1.95, 8.6)   # "exists" path goes down
ax.annotate("", xy=(SX - 1.4, 8.6), xytext=(1.95, 8.6),
            arrowprops=dict(arrowstyle="-|>", color=C_ARROW, lw=1.5, mutation_scale=14), zorder=2)

box(ax, SX, 8.55, 2.8, 0.55, "Redirect → /login", color=C_ACTION)

# ── LOGIN ─────────────────────────────────────────────────────────────────────
# 1. Login page
box(ax, LX, 16.6, 2.8, 0.6, "Login Page", color=C_PAGE)

# 2. User fills form
box(ax, LX, 15.6, 2.8, 0.7,
    "User fills form",
    "email or phone · password", color=C_PAGE)
arrow(ax, LX, 16.3, LX, 15.95)

# 3. Validate per-character
box(ax, LX, 14.5, 2.8, 0.7,
    "Per-character validation",
    "emailOrPhone · password (≥6 chars)", color=C_ACTION)
arrow(ax, LX, 15.25, LX, 14.85)

# 4. canSubmit?
diamond(ax, LX, 13.3, 2.2, 0.65, "canSubmit?")
arrow(ax, LX, 14.15, LX, 13.63)

# No → disabled
box(ax, 11.4, 13.3, 1.5, 0.5, "Button disabled", color="#FEE2E2")
arrow(ax, LX + 1.1, 13.3, 11.4 + 0.75 - 0.01, 13.3)
label_side(ax, LX + 1.1, 13.3, "Yes ← No")

# Yes → Log In pressed
arrow(ax, LX, 12.97, LX, 12.4)
label_side(ax, LX + 0.05, 12.68, "Yes")

# 5. UserStore.verify()
box(ax, LX, 12.05, 2.8, 0.6,
    "UserStore.verify()", color=C_STORE)
arrow(ax, LX, 12.37, LX, 12.35)

# 6. Credentials valid?
diamond(ax, LX, 10.9, 2.4, 0.7, "Credentials\nvalid?")
arrow(ax, LX, 11.75, LX, 11.25)

# No → show error
box(ax, 11.4, 10.9, 1.7, 0.55,
    'Show "Invalid\ncredentials"', color="#FEE2E2")
arrow(ax, LX + 1.2, 10.9, 11.4 + 0.85 - 0.01, 10.9)
label_side(ax, LX + 1.2, 10.9, "No")

# Yes → login() + route
arrow(ax, LX, 10.55, LX, 10.0)
label_side(ax, LX + 0.05, 10.28, "Yes")
box(ax, LX, 9.7, 2.8, 0.55,
    "login() → Redux store", color=C_STORE)
arrow(ax, LX, 9.42, LX, 8.85)
box(ax, LX, 8.55, 2.8, 0.55,
    "Redirect → /home or /weather-ai", color=C_ACTION)

# ── UserStore (shared) ────────────────────────────────────────────────────────
box(ax, 6.5, 7.4, 5.8, 1.0,
    "AsyncStorage  (@wine_users)",
    "[ { email, phone, password } … ]",
    color=C_STORE, fontsize=9)

# arrows into store
arrow(ax, SX, 8.27, SX, 7.91)
arrow(ax, LX, 8.27, LX, 7.91)

ax.text(6.5, 6.7, "Persisted in browser (localStorage / AsyncStorage)",
        ha="center", fontsize=8, color="#64748B")

# ── legend ────────────────────────────────────────────────────────────────────
legend_items = [
    (C_PAGE,   "Page / UI"),
    (C_ACTION, "Action / outcome"),
    (C_STORE,  "Storage / Redux"),
    (C_DECIDE, "Decision"),
    ("#FEE2E2", "Error state"),
]
lx0, ly = 0.3, 6.0
for color, label in legend_items:
    r = FancyBboxPatch((lx0, ly - 0.15), 0.35, 0.3,
                       boxstyle="round,pad=0.02",
                       linewidth=1, edgecolor=C_BORDER, facecolor=color)
    ax.add_patch(r)
    ax.text(lx0 + 0.45, ly, label, fontsize=8, va="center", color=C_TEXT)
    ly -= 0.45

plt.tight_layout(pad=0.5)

# ── export PNG into memory ────────────────────────────────────────────────────
buf = io.BytesIO()
plt.savefig(buf, format="png", dpi=160, bbox_inches="tight", facecolor="white")
plt.close(fig)
buf.seek(0)

# ── build Word document ───────────────────────────────────────────────────────
doc_path = "/mnt/c/git/work/claude.code/ai.agent/wine.liquor/ui/docs/ui.docx"
doc = Document(doc_path)

# page break before new section
doc.add_page_break()

# title
title = doc.add_heading("Login & Sign-Up Flow", level=1)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.runs[0]
run.font.color.rgb = RGBColor(0x1E, 0x40, 0xAF)

# subtitle
sub = doc.add_paragraph("Authentication flow — Wine & Liquor AI Agent")
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
sub.runs[0].font.size = Pt(10)
sub.runs[0].font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

doc.add_paragraph()   # spacer

# diagram
doc.add_picture(buf, width=Inches(6.5))
last_para = doc.paragraphs[-1]
last_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph()

# ── summary table ─────────────────────────────────────────────────────────────
doc.add_heading("Flow Summary", level=2)

rows = [
    ("Step", "Sign-Up", "Login"),
    ("1", "User opens Sign-Up page", "User opens Login page"),
    ("2", "Fills email/phone + password + confirm", "Fills email or phone + password"),
    ("3", "Per-character validation (email · phone · password · match)", "Per-character validation (emailOrPhone · password ≥6 chars)"),
    ("4", "Button enabled only when all fields valid", "Button enabled only when all fields valid"),
    ("5", "UserStore.register() called", "UserStore.verify() called"),
    ("6", "If user exists → redirect to /login", 'If credentials invalid → show "Invalid credentials"'),
    ("7", "If new user → saved to AsyncStorage → redirect to /login", "If valid → login() dispatched to Redux → redirect to /home"),
]

table = doc.add_table(rows=len(rows), cols=3)
table.style = "Table Grid"

for i, (a, b, c) in enumerate(rows):
    cells = table.rows[i].cells
    cells[0].text = a
    cells[1].text = b
    cells[2].text = c
    for cell in cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)
        if i == 0:
            cell.paragraphs[0].runs[0].font.bold = True

# save
out = "/mnt/c/git/work/claude.code/ai.agent/wine.liquor/ui/docs/ui.docx"
doc.save(out)
print(f"Saved: {out}")
