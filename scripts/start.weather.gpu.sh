#!/usr/bin/env bash
# Weather AI startup — GPU / CUDA (requires NVIDIA GPU with CUDA 11.8 or 12.x)
# Covers: venv creation, PyTorch CUDA install, all Python packages, npm, agent + Expo
#
# Usage:
#   bash scripts/start-weather-gpu.sh              # setup + start
#   bash scripts/start-weather-gpu.sh --setup-only # setup only, do not start servers
#
# PyTorch wheel selection:
#   CUDA 12.x → cu121 (default)
#   CUDA 11.8 → cu118
#   Run  nvidia-smi  to check your CUDA version before first use.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV="$ROOT/venv"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${GREEN}▶${NC}  $*"; }
warn()    { echo -e "${YELLOW}⚠${NC}   $*"; }
error()   { echo -e "${RED}✗${NC}   $*" >&2; }
section() { echo -e "\n${BOLD}── $* ──${NC}"; }

SETUP_ONLY=false
for arg in "$@"; do [[ "$arg" == "--setup-only" ]] && SETUP_ONLY=true; done

echo -e "\n${BOLD}Weather AI — GPU (CUDA) startup${NC}"
echo "Project root: $ROOT"

# ── 1. Check prerequisites ─────────────────────────────────────────────────────
section "Prerequisites"

# Python 3.12+
if ! command -v python3 &>/dev/null; then
  error "python3 not found — install Python 3.12 or newer"
  exit 1
fi
PY_VER=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$(echo "$PY_VER" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VER" | cut -d. -f2)
if [[ "$PY_MAJOR" -lt 3 || ( "$PY_MAJOR" -eq 3 && "$PY_MINOR" -lt 12 ) ]]; then
  error "Python 3.12+ required (found $PY_VER)"
  exit 1
fi
info "Python $PY_VER"

# Node 18+
if ! command -v node &>/dev/null; then
  error "node not found — install Node.js 18 or newer"
  exit 1
fi
NODE_VER=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  error "Node.js 18+ required (found $NODE_VER)"
  exit 1
fi
info "Node.js $NODE_VER"

# GPU / nvidia-smi
if ! command -v nvidia-smi &>/dev/null; then
  warn "nvidia-smi not found — no NVIDIA GPU detected"
  warn "Use scripts/start-weather-nogpu.sh for CPU-only machines"
  # Not a hard exit — let the user proceed if they know what they're doing
fi

# Detect CUDA version and pick wheel
TORCH_INDEX_URL="https://download.pytorch.org/whl/cu121"
if command -v nvidia-smi &>/dev/null; then
  CUDA_VER=$(nvidia-smi 2>/dev/null | grep -oP 'CUDA Version: \K[0-9]+' | head -1 || echo "12")
  if [[ "$CUDA_VER" -le 11 ]]; then
    TORCH_INDEX_URL="https://download.pytorch.org/whl/cu118"
    info "CUDA $CUDA_VER detected → using cu118 wheel"
  else
    info "CUDA $CUDA_VER detected → using cu121 wheel"
  fi
else
  info "No GPU detected — defaulting to cu121 wheel"
fi

# .env check
if [[ ! -f "$ROOT/.env" ]]; then
  error ".env not found at $ROOT/.env"
  error "Copy .env.example to .env and fill in ANTHROPIC_API_KEY"
  exit 1
fi
if ! grep -q "^ANTHROPIC_API_KEY=sk-ant-" "$ROOT/.env" 2>/dev/null; then
  warn "ANTHROPIC_API_KEY may not be set in .env — agent will fail at runtime if LLM_PROVIDER=claude"
fi
info ".env found"

# ── 2. Python virtualenv ───────────────────────────────────────────────────────
section "Python virtualenv"

if [[ ! -d "$VENV" ]]; then
  info "Creating venv at $VENV"
  python3 -m venv "$VENV"
else
  info "venv exists at $VENV"
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"
info "venv activated"

# ── 3. PyTorch — CUDA (must come before requirements.txt) ─────────────────────
section "PyTorch (CUDA)"

if python -c "import torch; assert torch.cuda.is_available()" 2>/dev/null; then
  TORCH_VER=$(python -c "import torch; print(torch.__version__)")
  info "torch $TORCH_VER with CUDA already installed"
else
  info "Installing torch CUDA build (~2 GB from $TORCH_INDEX_URL)..."
  pip install torch torchvision torchaudio --index-url "$TORCH_INDEX_URL"
fi

# ── 4. Python packages ─────────────────────────────────────────────────────────
section "Python packages"

info "ai.agents/weather/requirements.txt"
pip install --quiet -r "$ROOT/ai.agents/weather/requirements.txt"

info "rags/weather/requirements.txt"
pip install --quiet -r "$ROOT/rags/weather/requirements.txt"

info "mcps/weather/requirements.txt"
pip install --quiet -r "$ROOT/mcps/weather/requirements.txt"

# Verify
python -c "import fastapi, anthropic, chromadb, mcp; print('OK')" \
  && info "Core packages verified" \
  || { error "Package verification failed"; exit 1; }

# ── 5. Node packages ───────────────────────────────────────────────────────────
section "Node packages (ui/)"

if [[ ! -d "$ROOT/ui/node_modules" ]]; then
  info "Running npm install in ui/"
  npm --prefix "$ROOT/ui" install
else
  info "node_modules already present"
fi

# ── Setup-only exit point ──────────────────────────────────────────────────────
if [[ "$SETUP_ONLY" == true ]]; then
  echo -e "\n${GREEN}Setup complete.${NC}"
  echo "To start the system, run: bash scripts/start-weather-gpu.sh"
  exit 0
fi

# ── 6. Start Python agent ──────────────────────────────────────────────────────
section "Starting Python agent (port 8001)"

AGENT_PID=""
cleanup() {
  echo ""
  if [[ -n "$AGENT_PID" ]] && kill -0 "$AGENT_PID" 2>/dev/null; then
    info "Stopping agent (PID $AGENT_PID)..."
    kill "$AGENT_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

python "$ROOT/ai.agents/weather/agent.py" &
AGENT_PID=$!
info "Agent started (PID $AGENT_PID)"

info "Waiting for agent to be ready..."
READY=false
for i in $(seq 1 30); do
  if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    READY=true
    break
  fi
  sleep 1
done

if [[ "$READY" != true ]]; then
  error "Agent did not respond at http://localhost:8001/health after 30s"
  exit 1
fi

HEALTH=$(curl -s http://localhost:8001/health)
info "Agent ready → $HEALTH"

# ── 7. Start Expo UI ───────────────────────────────────────────────────────────
section "Starting Expo UI (port 8081)"
info "Press Ctrl+C to stop both the UI and the agent."
echo ""

cd "$ROOT/ui"
npx expo start --web
