#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# debug-ios.sh  —  Start Weather AI iOS Simulator ready for VS Code debugging
#
# Requirements:
#   - macOS with Xcode 15+ and iOS Simulator
#   - VS Code extension: "React Native Tools" (msjsdiag.vscode-react-native)
#
# VS Code setup:
#   1. Run this script — wait for the iOS Simulator to fully open the app
#   2. Open VS Code Run & Debug panel (Ctrl+Shift+D)
#   3. Select "Debug: iOS — Hermes" and press F5
#
# React Native Tools connects via the Hermes/CDP protocol (port auto-detected).
# Set breakpoints in any .tsx/.ts file in VS Code.
#
# If the debugger fails to connect:
#   - In the simulator press Cmd+Ctrl+Z (shake gesture) to open the dev menu
#   - Tap "Open JS Debugger" and retry the VS Code launch configuration
#
# To target a specific simulator:
#   npx expo start --ios --device "iPhone 16 Pro"
#
# Usage:
#   bash debug-ios.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: iOS Simulator requires macOS. Use debug-android.sh or debug-web.sh instead."
  exit 1
fi

echo "Starting Weather AI — iOS Simulator (debug mode)"
echo ""
echo "VS Code steps (after the simulator opens the app):"
echo "  1. Open Run & Debug (Ctrl+Shift+D)"
echo "  2. Select 'Debug: iOS — Hermes' and press F5"
echo ""
echo "If debugger does not connect:"
echo "  Cmd+Ctrl+Z in simulator → 'Open JS Debugger' → retry F5"
echo ""
echo "Press Ctrl+C to stop."
echo ""

EXPO_NO_DOTENV=0 npx expo start --ios --dev
