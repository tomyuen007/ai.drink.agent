#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-web.sh  —  Start the Weather AI Expo app in Web mode
#
# Usage:
#   bash run-web.sh
#   EXPO_PUBLIC_ONLINE=0 bash run-web.sh   # offline mode
#
# The app opens at http://localhost:8081
# Hot reload is active; save any .tsx/.ts file to refresh the browser.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found — running npm install..."
  npm install
  echo ""
fi

echo "Starting Weather AI — Web"
echo "URL: http://localhost:8081"
echo "Press Ctrl+C to stop."
echo ""

npx expo start --web
