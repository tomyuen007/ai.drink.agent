================================================================================
  Weather AI — UI (Expo / React Native)
  Expo SDK ~52  |  React Native 0.76  |  NativeWind 4
================================================================================


TABLE OF CONTENTS
-----------------
  1.  Prerequisites
  2.  Installation
  3.  Environment Variables (.env)
  4.  Running the App
       4a. Web
       4b. iOS
       4c. Android
  5.  VS Code Debugging
       5a. Required Extensions
       5b. Launch Configurations (.vscode/launch.json)
       5c. Debugging Web
       5d. Debugging iOS
       5e. Debugging Android
  6.  Shell Scripts Reference
  7.  Offline Mode (ONLINE=0)
  8.  LLM Provider Selection
  9.  Troubleshooting


================================================================================
1. PREREQUISITES
================================================================================

All platforms:
  - Node.js >= 18.x          https://nodejs.org
  - npm >= 10.x              (bundled with Node.js)
  - Expo CLI                 installed automatically via npx

Web:
  - Any modern browser (Chrome, Edge, Firefox)
  - Google Chrome or Microsoft Edge for VS Code debugging

iOS (macOS only):
  - macOS 13 (Ventura) or newer
  - Xcode 15+                https://developer.apple.com/xcode/
  - iOS Simulator (bundled with Xcode)
  - OR: Expo Go app on a physical iPhone
      App Store: https://apps.apple.com/app/expo-go/id982107779

Android:
  - Android Studio           https://developer.android.com/studio
  - Android SDK (API 31+)    installed via Android Studio SDK Manager
  - Android Emulator         created via Android Studio AVD Manager
  - OR: Expo Go app on a physical Android device
      Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent
  - ADB in PATH:             usually at ~/Android/Sdk/platform-tools/adb

VS Code (for debugging):
  - VS Code 1.85+            https://code.visualstudio.com


================================================================================
2. INSTALLATION
================================================================================

  cd ui/
  npm install

This installs all dependencies including:
  - expo, react-native, react
  - nativewind, tailwindcss
  - @reduxjs/toolkit, redux-persist
  - expo-sqlite
  - @react-native-picker/picker
  - @react-native-async-storage/async-storage


================================================================================
3. ENVIRONMENT VARIABLES (.env)
================================================================================

Copy .env.example to .env and edit as needed:

  cp .env.example .env

Key variables:

  EXPO_PUBLIC_AGENT_URL       URL of the backend agent server (default: http://localhost:8001)
  EXPO_PUBLIC_ONLINE          1 = live API calls, 0 = offline mode (default: 1)
  EXPO_PUBLIC_STATE_SYNC      1 = seed Redux from APP_STATES on launch, 0 = keep persisted state
  EXPO_PUBLIC_QUESTIONS_LIMIT Max saved questions (default: 10)
  EXPO_PUBLIC_APP_STATES      JSON blob seeding all Redux slices when STATE_SYNC=1

Example .env for offline development:

  EXPO_PUBLIC_AGENT_URL=http://localhost:8001
  EXPO_PUBLIC_ONLINE=0
  EXPO_PUBLIC_STATE_SYNC=1
  EXPO_PUBLIC_APP_STATES={"user":{"email":"dev@example.com","phone":""},"settings":{"online":false,"stateSync":true,"llmProvider":"env-default","theme":"system","notifications":true,"defaultCity":"Toronto","defaultPage":"home","fontFamily":"system","fontSize":"medium","fontWeight":"regular","fontStyle":"normal"},"weather":{"city":"Toronto","question":"Should I bring an umbrella?"},"questions":{"items":["Should I bring an umbrella?"]}}

Note: All EXPO_PUBLIC_* variables are bundled at build time and visible in the
browser bundle. Never put secrets (API keys, passwords) in EXPO_PUBLIC_* vars.


================================================================================
4. RUNNING THE APP
================================================================================

------------------------------------------------------------------------
4a. WEB
------------------------------------------------------------------------

  Start (interactive menu, choose 'w' for web):
    npx expo start

  Start directly in web mode:
    npx expo start --web

  Start with cleared cache (fix stale bundler issues):
    npx expo start --web --clear

  Export a production static build:
    npx expo export -p web

  The app opens at http://localhost:8081 in your default browser.
  Hot reload is enabled by default — save any file to trigger a refresh.

  Using the shell script:
    bash run-web.sh

  With offline mode:
    EXPO_PUBLIC_ONLINE=0 npx expo start --web

------------------------------------------------------------------------
4b. iOS  (macOS only)
------------------------------------------------------------------------

  Start directly in iOS Simulator:
    npx expo start --ios

  Target a specific simulator:
    npx expo start --ios --device "iPhone 16 Pro"

  List available simulators:
    xcrun simctl list devices available

  Start with cleared cache:
    npx expo start --ios --clear

  Using Expo Go on a physical iPhone:
    npx expo start
    Scan the QR code shown in the terminal with the iPhone Camera app.
    Expo Go opens and loads the app over your local network.

  Using the shell script:
    bash run-ios.sh

  Note: iOS Simulator requires macOS. If you are on Windows or Linux,
  use the Web or Android targets instead.

------------------------------------------------------------------------
4c. ANDROID
------------------------------------------------------------------------

  Start an Android emulator (from Android Studio or command line):
    emulator -avd Pixel_8_API_34     # adjust AVD name to yours

  Then start Expo:
    npx expo start --android

  Start with cleared cache:
    npx expo start --android --clear

  List connected devices/emulators:
    adb devices

  Using Expo Go on a physical Android device:
    Enable USB debugging on the device, connect via USB, then:
    npx expo start --android

  Using the shell script:
    bash run-android.sh


================================================================================
5. VS CODE DEBUGGING
================================================================================

------------------------------------------------------------------------
5a. REQUIRED EXTENSIONS
------------------------------------------------------------------------

Install all three from the VS Code Extensions panel (Ctrl+Shift+X):

  1. Expo Tools
       Publisher:  expo
       ID:         expo.vscode-expo-tools
       Purpose:    Expo-specific IntelliSense, app.json schema, file linking

  2. React Native Tools
       Publisher:  Microsoft
       ID:         msjsdiag.vscode-react-native
       Purpose:    iOS and Android debugger attachment (Hermes / CDP protocol)

  3. JavaScript Debugger (Nightly)  [optional, improves web source maps]
       Publisher:  Microsoft
       ID:         ms-vscode.js-debug-nightly
       Purpose:    Better source map support for web debugging

Install all via command line:
  code --install-extension expo.vscode-expo-tools
  code --install-extension msjsdiag.vscode-react-native
  code --install-extension ms-vscode.js-debug-nightly

------------------------------------------------------------------------
5b. LAUNCH CONFIGURATIONS (.vscode/launch.json)
------------------------------------------------------------------------

The file ui/.vscode/launch.json defines five debug configurations:

  1. "Debug: Web — Launch Chrome"
       Launches a new Chrome window with the debugger attached to
       http://localhost:8081. Start run-web.sh or debug-web.sh first,
       then hit F5 (or click the green play button) in VS Code.

  2. "Debug: Web — Attach Chrome"
       Attaches to an already-running Chrome instance started with
       remote debugging on port 9222. Useful when you want to keep
       your browser session alive across debug restarts.
       Start Chrome with: google-chrome --remote-debugging-port=9222

  3. "Debug: iOS — Hermes"
       Launches the iOS Simulator and attaches the Hermes/CDP debugger.
       Start debug-ios.sh first, wait for the simulator to open, then
       launch this configuration from VS Code.

  4. "Debug: Android — Hermes"
       Launches the Android Emulator and attaches the Hermes/CDP
       debugger. Start debug-android.sh first, wait for the emulator,
       then launch this configuration.

  5. "Debug: Attach to Running App"
       Attaches to any already-running React Native app (iOS or
       Android) that is in debug mode. Use this when the app is
       already open and you want to attach without relaunching.

------------------------------------------------------------------------
5c. DEBUGGING WEB — STEP BY STEP
------------------------------------------------------------------------

  Step 1: Start the dev server
    bash debug-web.sh
    # OR:
    npx expo start --web --dev

  Step 2: Wait for the bundler to print:
    "Web is waiting on http://localhost:8081"

  Step 3: In VS Code, open the Run & Debug panel (Ctrl+Shift+D)

  Step 4: Select "Debug: Web — Launch Chrome" from the dropdown

  Step 5: Press F5 (or click the green triangle)
    Chrome opens automatically at http://localhost:8081 with the
    VS Code debugger attached.

  Step 6: Set breakpoints in any .tsx / .ts file in the editor.
    Execution will pause at breakpoints and the VS Code debugger
    shows call stack, variables, and the watch panel.

  To stop: press the red square (Shift+F5) in VS Code.

  Tips:
    - Use "Reload" (Ctrl+R in browser) to re-trigger breakpoints
      after a code change without restarting the debug session.
    - Source maps are enabled by default in dev mode; breakpoints in
      TypeScript source files map to the running JS correctly.
    - The browser's DevTools (F12) still work alongside VS Code.

------------------------------------------------------------------------
5d. DEBUGGING iOS — STEP BY STEP
------------------------------------------------------------------------

  Prerequisites: macOS, Xcode installed, iOS Simulator available.

  Step 1: Start the dev server with iOS
    bash debug-ios.sh
    # OR:
    npx expo start --ios --dev

    Wait for the iOS Simulator to fully open and the app to load.

  Step 2: In VS Code, open Run & Debug (Ctrl+Shift+D)

  Step 3: Select "Debug: iOS — Hermes"

  Step 4: Press F5
    React Native Tools connects to the Hermes debugger running inside
    the simulator via the Chrome DevTools Protocol (CDP).

  Step 5: Set breakpoints in .tsx / .ts files and interact with the
    app in the simulator to trigger them.

  Tips:
    - If the debugger fails to connect, try shaking the simulator
      (Cmd+Ctrl+Z) to open the dev menu and tap "Open JS Debugger".
    - The Hermes debugger uses port 8081 for the bundler and a
      separate ephemeral CDP port. React Native Tools discovers it
      automatically.
    - On first run, VS Code may ask you to configure the packager
      port. Accept the default (8081).

------------------------------------------------------------------------
5e. DEBUGGING ANDROID — STEP BY STEP
------------------------------------------------------------------------

  Prerequisites: Android Studio installed, emulator running.

  Step 1: Start an Android emulator (if not already running)
    # From Android Studio: Tools > Device Manager > Start
    # Or from command line (adjust AVD name):
    $ANDROID_HOME/emulator/emulator -avd Pixel_8_API_34 &

  Step 2: Verify emulator is visible to ADB:
    adb devices
    # Should show: emulator-5554   device

  Step 3: Start the dev server with Android
    bash debug-android.sh
    # OR:
    npx expo start --android --dev

    Wait for the app to load in the emulator.

  Step 4: In VS Code, open Run & Debug (Ctrl+Shift+D)

  Step 5: Select "Debug: Android — Hermes"

  Step 6: Press F5
    React Native Tools connects via ADB to the Hermes CDP endpoint
    running on the emulator.

  Tips:
    - If breakpoints do not hit, press Ctrl+M (or Cmd+M) inside the
      emulator to open the dev menu and tap "Open JS Debugger".
    - ADB must be in your PATH. Add this to ~/.bashrc or ~/.zshrc:
        export ANDROID_HOME=$HOME/Android/Sdk
        export PATH=$PATH:$ANDROID_HOME/platform-tools
    - Physical Android device: enable USB debugging in Developer
      Options, connect via USB, confirm the ADB prompt on the device.


================================================================================
6. SHELL SCRIPTS REFERENCE
================================================================================

All scripts must be made executable before first use:
  chmod +x run-web.sh run-ios.sh run-android.sh
  chmod +x debug-web.sh debug-ios.sh debug-android.sh

------------------------------------------------------------------------
  Script            Platform   Mode       Description
------------------------------------------------------------------------
  run-web.sh        Web        Run        Start Expo web dev server
  run-ios.sh        iOS        Run        Start Expo iOS Simulator
  run-android.sh    Android    Run        Start Expo Android Emulator
  debug-web.sh      Web        Debug      Start web server for VS Code Chrome debugger
  debug-ios.sh      iOS        Debug      Start iOS server for VS Code Hermes debugger
  debug-android.sh  Android    Debug      Start Android server for VS Code Hermes debugger
------------------------------------------------------------------------

Difference between run-* and debug-* scripts:
  - run-*   scripts start Expo in standard dev mode (source maps on,
            hot reload on). Sufficient for normal development.
  - debug-* scripts additionally set EXPO_NO_DOTENV=0 (ensures .env is
            loaded), disable port conflicts, and print the CDP debugger
            URL so VS Code can attach reliably. Use these when you need
            to set breakpoints in VS Code.

Environment overrides (prepend to any script or command):

  Offline mode:          EXPO_PUBLIC_ONLINE=0 bash run-web.sh
  Force clear cache:     npx expo start --web --clear
  Custom agent URL:      EXPO_PUBLIC_AGENT_URL=http://192.168.1.5:8001 bash run-web.sh
  Custom port:           npx expo start --web --port 3000


================================================================================
7. OFFLINE MODE (ONLINE=0)
================================================================================

When ONLINE=0 (via .env or the Settings toggle in the app):

  - Login, Sign Up, Logout     work normally (local Redux state only)
  - Settings page              works normally (Redux + AsyncStorage)
  - History page               works normally (expo-sqlite on-device)
  - Weather AI chat            returns an offline message instead of
                               calling the backend; question and answer
                               are still saved to the history table

The offline chatbot reply:
  "I'm currently offline — no live weather data is available.
   Enable Online mode in Settings to get real weather information."

Toggle online/offline at runtime (no restart needed):
  Settings page -> Running Mode -> flip the Online switch


================================================================================
8. LLM PROVIDER SELECTION
================================================================================

In the app: Settings page -> Language Model -> LLM Provider picker.

Supported providers and their .env keys:

  Provider       .env key              Model key
  -----------    -------------------   --------------------------
  Server Default (reads LLM_PROVIDER from server/.env)
  Claude         ANTHROPIC_API_KEY     ANTHROPIC_MODEL
  OpenAI         OPENAI_API_KEY        OPENAI_MODEL
  Gemini         GOOGLE_API_KEY        GEMINI_MODEL
  Groq           GROQ_API_KEY          GROQ_MODEL
  Ollama         OLLAMA_BASE_URL       OLLAMA_MODEL       (local)
  AWS Bedrock    AWS credentials       BEDROCK_MODEL
  OAI Compatible OPENAI_COMPAT_API_KEY OPENAI_COMPAT_MODEL (local)

The app sends the selected provider with each chat request.
The server validates it and routes to the correct SDK client.


================================================================================
9. TROUBLESHOOTING
================================================================================

"Unable to resolve module" or module not found
  -> npm install
  -> npx expo start --clear

Port 8081 already in use
  -> lsof -i :8081 | grep LISTEN    # find the process
  -> kill -9 <PID>                  # kill it
  -> OR: npx expo start --port 8082

Metro bundler is stuck / not updating
  -> Press 'r' in the terminal running Expo to force reload
  -> npx expo start --clear         # clear bundler cache

iOS Simulator does not open
  -> Open Xcode, go to Xcode > Open Developer Tool > Simulator
  -> OR: open -a Simulator
  -> Ensure at least one iOS device is configured in Xcode

Android emulator not detected by ADB
  -> adb devices                    # should list emulator-5554
  -> adb kill-server && adb start-server
  -> Ensure ANDROID_HOME is set and platform-tools is in PATH

VS Code debugger says "Cannot connect to runtime process"
  -> Confirm the Expo dev server is running (run-web/ios/android.sh)
  -> For iOS/Android: shake the device (Cmd+Ctrl+Z / Ctrl+M) and
     tap "Open JS Debugger" in the Expo dev menu
  -> Restart VS Code and try again

NativeWind styles not applying
  -> npx expo start --clear
  -> Confirm global.css is imported in App.tsx (import "./global.css")
  -> Confirm tailwind.config.js content array includes all .tsx files

SQLite history not persisting on web
  -> Expo SDK 52 web uses OPFS (Origin Private File System) via WASM
  -> OPFS requires a secure context (https:// or localhost)
  -> Ensure browser supports OPFS: Chrome 102+, Edge 102+, Firefox 111+
  -> Private/incognito mode may block OPFS — use a normal window
