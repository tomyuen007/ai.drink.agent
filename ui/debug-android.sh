#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# debug-android.sh  —  Start Weather AI Android Emulator for VS Code debugging
#
# Requirements:
#   - Android Studio + AVD configured
#   - ADB in PATH:  export ANDROID_HOME=$HOME/Android/Sdk
#                   export PATH=$PATH:$ANDROID_HOME/platform-tools
#   - VS Code extension: "React Native Tools" (msjsdiag.vscode-react-native)
#
# VS Code setup:
#   1. Start an Android emulator (Android Studio → Device Manager → Start)
#      OR from terminal:  $ANDROID_HOME/emulator/emulator -avd <AVD_NAME> &
#   2. Verify:  adb devices   (should list emulator-5554   device)
#   3. Run this script — wait for the app to load in the emulator
#   4. Open VS Code Run & Debug panel (Ctrl+Shift+D)
#   5. Select "Debug: Android — Hermes" and press F5
#
# React Native Tools connects via ADB to the Hermes/CDP endpoint.
# Set breakpoints in any .tsx/.ts file in VS Code.
#
# If the debugger fails to connect:
#   - In the emulator press Ctrl+M to open the dev menu
#   - Tap "Open JS Debugger" and retry the VS Code launch configuration
#
# Usage:
#   bash debug-android.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

echo "Starting Weather AI — Android Emulator (debug mode)"
echo ""
echo "Pre-flight:"
echo "  adb devices   should show: emulator-5554   device"
echo ""
echo "VS Code steps (after the app loads in the emulator):"
echo "  1. Open Run & Debug (Ctrl+Shift+D)"
echo "  2. Select 'Debug: Android — Hermes' and press F5"
echo ""
echo "If debugger does not connect:"
echo "  Ctrl+M in emulator → 'Open JS Debugger' → retry F5"
echo ""
echo "Press Ctrl+C to stop."
echo ""

EXPO_NO_DOTENV=0 npx expo start --android --dev
