#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# debug-web.sh  —  Start Weather AI web server ready for VS Code debugging
#
# VS Code setup:
#   1. Install extension: "React Native Tools" (msjsdiag.vscode-react-native)
#      Optional: "JavaScript Debugger Nightly" (ms-vscode.js-debug-nightly)
#   2. Run this script — wait for "Web is waiting on http://localhost:8081"
#   3. Open VS Code Run & Debug panel (Ctrl+Shift+D)
#   4. Select "Debug: Web — Launch Chrome" and press F5
#
# The Chrome debugger attaches to http://localhost:8081.
# Set breakpoints in any .tsx/.ts file in VS Code.
#
# Alternative (attach to existing Chrome):
#   Start Chrome with:  google-chrome --remote-debugging-port=9222
#   Then use "Debug: Web — Attach Chrome" launch configuration.
#
# Usage:
#   bash debug-web.sh
#   EXPO_PUBLIC_ONLINE=0 bash debug-web.sh   # debug in offline mode
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found — running npm install..."
  npm install
  echo ""
fi

echo "Starting Weather AI — Web (debug mode)"
echo "Bundler URL:  http://localhost:8081"
echo ""
echo "VS Code steps:"
echo "  1. Wait for 'Web is waiting on http://localhost:8081'"
echo "  2. Open Run & Debug (Ctrl+Shift+D)"
echo "  3. Select 'Debug: Web — Launch Chrome' and press F5"
echo ""
echo "Press Ctrl+C to stop."
echo ""

# --dev is default in Expo; made explicit here to document the intent.
# Source maps and hot reload are enabled.
EXPO_NO_DOTENV=0 npx expo start --web --dev
