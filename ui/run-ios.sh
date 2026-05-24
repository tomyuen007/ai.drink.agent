#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-ios.sh  —  Start the Weather AI Expo app in iOS Simulator
#
# Requirements:
#   - macOS with Xcode 15+ installed
#   - At least one iOS Simulator configured in Xcode
#
# Usage:
#   bash run-ios.sh
#   EXPO_PUBLIC_ONLINE=0 bash run-ios.sh    # offline mode
#
# To target a specific simulator:
#   npx expo start --ios --device "iPhone 16 Pro"
#
# List available simulators:
#   xcrun simctl list devices available
#
# For Expo Go on a physical iPhone: scan the QR code with the Camera app.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

if [[ "$(uname)" != "Darwin" ]]; then
  echo "ERROR: iOS Simulator requires macOS. Use run-android.sh or run-web.sh instead."
  exit 1
fi

echo "Starting Weather AI — iOS Simulator"
echo "Requires macOS + Xcode. Press Ctrl+C to stop."
echo ""

npx expo start --ios
