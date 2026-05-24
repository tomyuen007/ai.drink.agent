#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-android.sh  —  Start the Weather AI Expo app in Android Emulator
#
# Requirements:
#   - Android Studio with an AVD (Android Virtual Device) configured
#   - ADB in PATH:  export ANDROID_HOME=$HOME/Android/Sdk
#                   export PATH=$PATH:$ANDROID_HOME/platform-tools
#
# Usage:
#   bash run-android.sh
#   EXPO_PUBLIC_ONLINE=0 bash run-android.sh   # offline mode
#
# Start the emulator manually before running this script, or let Expo
# open one automatically if Android Studio is installed.
#
# Verify emulator is visible:  adb devices
#
# For Expo Go on a physical Android device:
#   Enable USB Debugging in Developer Options, connect via USB,
#   confirm the ADB prompt on the device, then run this script.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "$0")"

echo "Starting Weather AI — Android Emulator"
echo "Ensure an emulator is running:  adb devices"
echo "Press Ctrl+C to stop."
echo ""

npx expo start --android
