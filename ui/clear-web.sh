#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# clear-web.sh  —  Completely erase all settings and history in web mode
#
# What it clears:
#   - All Redux-persist state: settings, user, weather, questions
#     (stored in browser localStorage via AsyncStorage)
#   - Full SQLite activity history
#     (stored in browser OPFS via expo-sqlite WASM)
#
# How it works:
#   1. Checks if the Expo web server is already running on port 8081.
#   2. If not, starts it and waits up to 120 seconds for it to be ready.
#   3. Opens http://localhost:8081/clear in the browser.
#   4. The /clear route (app/clear.tsx) wipes both storage systems,
#      then redirects to / so the app starts completely fresh.
#
# Usage:
#   bash clear-web.sh                # auto-start server if needed, then clear
#   bash clear-web.sh --no-server    # open /clear only — server must already be running
#   EXPO_PUBLIC_ONLINE=0 bash clear-web.sh   # start in offline mode before clearing
#
# After clearing, use run-web.sh to start a clean session:
#   bash run-web.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

NO_SERVER=0
for arg in "$@"; do
  [[ "$arg" == "--no-server" ]] && NO_SERVER=1
done

CLEAR_URL="http://localhost:8081/clear"
PORT=8081

# ── Helper: open a URL in the system browser ──────────────────────────────────
open_url() {
  local url="$1"
  if command -v xdg-open &>/dev/null; then
    xdg-open "$url" 2>/dev/null &
  elif command -v open &>/dev/null; then        # macOS
    open "$url"
  elif [[ -f "/mnt/c/Windows/System32/cmd.exe" ]]; then  # WSL
    "/mnt/c/Windows/System32/cmd.exe" /c "start $url" 2>/dev/null
  else
    echo ""
    echo "  Could not detect a browser opener."
    echo "  Open this URL manually: $url"
  fi
}

# ── Helper: check if the server is accepting connections ─────────────────────
server_ready() {
  nc -z localhost "$PORT" 2>/dev/null
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

if server_ready; then
  echo "Expo web server is already running on port $PORT."
else
  if [[ $NO_SERVER -eq 1 ]]; then
    echo "ERROR: Expo web server is not running on port $PORT."
    echo "Start it first with:  bash run-web.sh"
    echo "Or remove --no-server to let this script start it automatically."
    exit 1
  fi

  if [[ ! -d node_modules ]]; then
    echo "node_modules not found — running npm install..."
    npm install
    echo ""
  fi

  echo "Starting Expo web server..."
  npx expo start --web &
  SERVER_PID=$!

  echo "Waiting for server on http://localhost:$PORT (up to 120 s)..."
  WAITED=0
  until server_ready; do
    sleep 2
    WAITED=$((WAITED + 2))
    if [[ $WAITED -ge 120 ]]; then
      echo "ERROR: Server did not start within 120 seconds."
      kill "$SERVER_PID" 2>/dev/null || true
      exit 1
    fi
  done
  echo "Server ready (${WAITED}s)."
fi

echo ""
echo "Opening: $CLEAR_URL"
echo ""
echo "  This will erase ALL of the following from the web app:"
echo "    • Settings (theme, font, default page, LLM provider, etc.)"
echo "    • User account (email / phone)"
echo "    • Weather city, question, and result"
echo "    • Saved questions list"
echo "    • Complete activity history (SQLite)"
echo ""
echo "  After clearing the browser will redirect to the login screen."
echo ""

open_url "$CLEAR_URL"
