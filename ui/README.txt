================================================================================
  Weather AI — UI (Expo / React Native)
  Expo SDK ~56  |  React Native 0.85  |  NativeWind 4  |  expo-router
================================================================================


TABLE OF CONTENTS
-----------------
  1.  Prerequisites
       1a. All Platforms
       1b. Web
       1c. iOS (macOS only)
       1d. Android
       1e. VS Code (for debugging)
  2.  Installation
  3.  Environment Variables (.env)
  4.  Running the App
       4a. Web
       4b. iOS
       4c. Android
  5.  VS Code Debugging
       5a. Required Extensions
       5b. Launch Configurations (.vscode/launch.json)
       5c. Debugging Web — Step by Step
       5d. Debugging iOS — Step by Step
       5e. Debugging Android — Step by Step
  6.  Shell Scripts Reference
  7.  Offline Mode (ONLINE=0)
  8.  LLM Provider Selection
  9.  Troubleshooting
 10.  UI Design Docs (ui/docs/)


================================================================================
1. PREREQUISITES
================================================================================

------------------------------------------------------------------------
1a. ALL PLATFORMS
------------------------------------------------------------------------

Node.js 18 or newer is required. npm 10 comes bundled with it.

  Install Node.js:
    https://nodejs.org  →  download the LTS installer for your OS

  Verify after installing:
    node --version    # must print v18.x.x or higher
    npm --version     # must print 10.x.x or higher

  Expo CLI is NOT installed globally — it is invoked through npx, which
  uses the local project copy. No global install is needed.


------------------------------------------------------------------------
1b. WEB
------------------------------------------------------------------------

  - Any modern browser: Chrome, Edge, or Firefox.
  - For VS Code debugging specifically: Google Chrome (preferred) or
    Microsoft Edge. Firefox is not supported by the Chrome debugger
    protocol used in launch.json.

  No additional software installation is needed for web beyond Node.js.


------------------------------------------------------------------------
1c. iOS  (macOS only)
------------------------------------------------------------------------

iOS Simulator runs only on macOS. If you are on Windows or Linux,
use the Web or Android targets instead.

  Step 1 — Verify your macOS version:
    sw_vers
    # ProductVersion must be 13.0 (Ventura) or higher

  Step 2 — Install Xcode from the Mac App Store:
    https://apps.apple.com/app/xcode/id497799835
    File size is ~10 GB. This takes 20-40 minutes on a typical connection.

  Step 3 — Open Xcode for the first time after installing:
    Open Xcode from /Applications.
    It will prompt "Install additional required components?" — click Install.
    This downloads the iOS SDK and Simulator runtimes (~5-10 min).
    Do NOT skip this step; the simulator will not work without it.

  Step 4 — Accept the Xcode licence (if prompted in terminal):
    sudo xcodebuild -license accept

  Step 5 — Install Xcode command-line tools:
    xcode-select --install
    A dialog box will appear — click "Install".
    Verify: xcode-select -p
    Expected output: /Applications/Xcode.app/Contents/Developer

  Step 6 — Verify at least one Simulator is configured:
    xcrun simctl list devices available
    You should see a list like:
      == Devices ==
      -- iOS 17.5 --
          iPhone 16 (XXXXXXXX-...) (Shutdown)
          iPhone 16 Pro (XXXXXXXX-...) (Shutdown)

    If the list is empty:
      Open Xcode → menu bar: Window > Devices and Simulators
      Click the "+" at the bottom left → choose a device type and iOS version
      Click "Download Simulator" if prompted, then wait for the download.

  Option: Expo Go on a physical iPhone (no Simulator needed):
    Install the Expo Go app from the App Store:
      https://apps.apple.com/app/expo-go/id982107779
    Your iPhone and your Mac must be on the same Wi-Fi network.
    See Section 4b for usage.


------------------------------------------------------------------------
1d. ANDROID
------------------------------------------------------------------------

  Step 1 — Install Android Studio:
    https://developer.android.com/studio
    Run the installer and follow the setup wizard.
    On the "Install Type" screen choose "Standard" — this installs the
    Android SDK, emulator, and a default AVD automatically.

  Step 2 — Verify the Android SDK was installed:
    Open Android Studio → menu: Tools > SDK Manager
    Under "SDK Platforms" tab: ensure "Android 14.0 (API 34)" or higher
    is checked. If not, check it and click Apply.
    Under "SDK Tools" tab: ensure these are checked:
      - Android SDK Build-Tools
      - Android Emulator
      - Android SDK Platform-Tools

  Step 3 — Create an AVD (Android Virtual Device) if none exists:
    Open Android Studio → menu: Tools > Device Manager
    Click the "+" icon (Create Virtual Device).
    Pick a device: "Pixel 8" is a good choice.
    Click Next, pick a system image: "API 34" (Android 14). Download if needed.
    Click Next, then Finish.
    The new AVD appears in the Device Manager list.

  Step 4 — Add ADB and the emulator binary to your PATH:
    ADB (Android Debug Bridge) must be reachable from your terminal.
    Add these lines to ~/.bashrc (bash) or ~/.zshrc (zsh):

      export ANDROID_HOME=$HOME/Android/Sdk
      export PATH=$PATH:$ANDROID_HOME/platform-tools
      export PATH=$PATH:$ANDROID_HOME/emulator

    Then reload your shell:
      source ~/.bashrc     # or: source ~/.zshrc

    Verify:
      adb --version
      # Expected: Android Debug Bridge version 1.0.xx
      emulator -list-avds
      # Expected: Pixel_8_API_34  (or your AVD name)

  Step 5 — Test that the emulator launches:
    emulator -avd Pixel_8_API_34 &
    Wait 30-60 seconds for it to fully boot (first launch is slowest).
    Then: adb devices
    Expected output:
      List of devices attached
      emulator-5554   device
    The status must be "device", NOT "offline". If it says "offline",
    wait another 30 seconds and run adb devices again.

  Option: Expo Go on a physical Android device (no Emulator needed):
    Install Expo Go from the Play Store:
      https://play.google.com/store/apps/details?id=host.exp.exponent
    On the phone: Settings > About Phone > tap "Build Number" 7 times
      to enable Developer Options.
    Settings > Developer Options > enable "USB Debugging".
    Connect the phone to your computer via USB.
    Accept the "Allow USB Debugging?" prompt on the phone.
    Verify: adb devices  (phone should appear with status "device")


------------------------------------------------------------------------
1e. VS CODE  (for debugging only — not needed to run the app)
------------------------------------------------------------------------

  Download and install VS Code 1.85 or newer:
    https://code.visualstudio.com

  Verify after installing:
    code --version
    # Expected: 1.85.x or higher

  Required extensions are listed in Section 5a.


================================================================================
2. INSTALLATION
================================================================================

ONE command installs everything — web, iOS, and Android.

VERSION POLICY: This project always matches npx create-expo-app@latest.
  Expo SDK 56  |  React 19.2.3  |  React Native 0.85.3
  React and React Native versions are exact pins set by Expo SDK —
  never bump them independently. See README.md for the upgrade guide.

------------------------------------------------------------------------
First-time install (fresh clone)
------------------------------------------------------------------------

  cd ui/
  npm install

------------------------------------------------------------------------
After an Expo SDK upgrade (existing node_modules present)
------------------------------------------------------------------------

  When upgrading to a new Expo SDK, always delete node_modules first.
  Skipping this causes ERESOLVE peer-dependency conflicts because npm
  sees stale packages from the old SDK alongside the new version pins.

  rm -rf node_modules package-lock.json
  npm install

  Then re-pin any Expo-managed project packages to the new SDK version:
    npx expo install expo-sqlite @react-native-async-storage/async-storage

  WHY npx create-expo-app never needs this: it always starts from an
  empty folder — no stale node_modules, no conflicts, no flags needed.

------------------------------------------------------------------------
What npm install installs (complete package list)
------------------------------------------------------------------------

Runtime dependencies  (package.json → "dependencies"):

  Core framework  (Expo SDK 56 / React 19 / React Native 0.85):
    expo ~56.0.4                              Expo SDK and toolchain
    react 19.2.3                              React core
    react-native 0.85.3                       React Native runtime
    expo-status-bar ~56.0.4                   Status bar component
    expo-constants ~56.0.15                   App constants (appVersion, etc.)
    expo-device ~56.0.4                       Device info (model, OS version)
    expo-font ~56.0.5                         Custom font loading
    expo-splash-screen ~56.0.10               Splash screen control
    expo-system-ui ~56.0.5                    System UI theming (root bg color)
    expo-linking ~56.0.11                     Deep link handling

  Navigation and routing:
    expo-router ~56.2.6                       File-based routing
    react-native-screens 4.25.2               Native screen containers
    react-native-safe-area-context ~5.7.0     Safe area insets
    react-native-gesture-handler ~2.31.1      Gesture recognition
    expo-web-browser ~56.0.5                  In-app browser for OAuth flows

  Animation:
    react-native-reanimated 4.3.1             Animation library (worklets, no Babel plugin needed)
    react-native-worklets 0.8.3               Worklet runtime for reanimated

  UI and styling:
    @expo/ui ~56.0.13                         Expo native UI components
    expo-image ~56.0.9                        Optimised image component
    expo-symbols ~56.0.5                      SF Symbols icons (iOS)
    expo-glass-effect ~56.0.4                 Glass blur effect component
    nativewind 4.2.4                          Tailwind CSS for React Native (v4, stable)

  State management:
    @reduxjs/toolkit ^2.3.0                   Redux Toolkit
    react-redux ^9.1.0                        React bindings for Redux
    redux-persist ^6.0.0                      Persist Redux state to storage

  Storage and native components:
    expo-sqlite ~56.0.4                       On-device SQLite database
    @react-native-async-storage/async-storage ^3.1.0  Key-value storage
    @react-native-picker/picker 2.11.4        Dropdown picker component

  Web support  (Expo-managed, pinned for SDK 56 compatibility):
    react-dom 19.2.3                          React DOM renderer for web
    react-native-web ~0.21.0                  React Native components on web

  Lambda server  (used by "npm run serve:lambda" only):
    express ^4.18.0                           HTTP server for Lambda wrapper
    serverless-http ^3.2.0                    Wraps Express for Lambda

Dev dependencies  (package.json → "devDependencies"):

    @babel/core ^7.25.0                       Babel compiler core
    babel-preset-expo ~56.0.12                Expo Babel preset for SDK 56 (babel.config.js)
    @types/react ~19.2.15                     TypeScript types for React 19
    tailwindcss ^3.4.0                        Tailwind CSS (required by NativeWind v4 at build time)
    typescript ^5.3.0                         TypeScript compiler

The web packages (react-dom, react-native-web) are declared in package.json,
so npm install handles them automatically. No extra command needed.
@expo/metro-runtime is NOT a direct dependency — it is pulled in automatically
as a transitive dependency of expo-router. Do not add it to package.json.

The run-web.sh and debug-web.sh scripts check that node_modules/ exists
and run npm install automatically if it is missing.

------------------------------------------------------------------------
Entry point — how expo-router takes over
------------------------------------------------------------------------

The app uses expo-router for file-based routing. The key setting in
package.json is:

  "main": "expo-router/entry"

This tells Metro to start from expo-router's entry file instead of a
custom App.tsx. expo-router then discovers routes automatically from the
app/ directory.

Routes defined under app/:

  app/_layout.tsx           Root layout — sets up Redux, PersistGate,
                            FontProvider, AppInit (db init + state sync),
                            then renders <Slot /> for child routes
  app/index.tsx             Root redirect — sends logged-in users to
                            their default page, logged-out users to /login
  app/(auth)/_layout.tsx    Auth guard — redirects logged-in users away
                            from login/sign-up back to their default page
  app/(auth)/login.tsx      /login route
  app/(auth)/sign-up.tsx    /sign-up route
  app/(app)/_layout.tsx     App guard — redirects non-logged-in users to /login
  app/(app)/home.tsx        /home route
  app/(app)/weather-ai.tsx  /weather-ai route
  app/(app)/history.tsx     /history route
  app/(app)/settings.tsx    /settings route
  app/(app)/logout.tsx      /logout route  (Account page)

Route groups (auth) and (app) are organizational — they do NOT appear in
the URL path. /login and /home are the actual paths, not /(auth)/login.

The page components themselves live in pages/ (for the complex ones) and
the route files are thin re-exports:
  export { default } from "../../pages/WeatherAI";

Navigation inside pages and components uses expo-router's useRouter():
  const router = useRouter();
  router.push("/weather-ai");     // push a new screen onto the stack
  router.replace("/login");       // replace current screen (no back button)

------------------------------------------------------------------------
npm run scripts (shortcuts defined in package.json)
------------------------------------------------------------------------

  npm run start         Start Expo dev server (interactive menu)
  npm run web           Start Expo web dev server  (= npx expo start --web)
  npm run ios           Start Expo iOS Simulator    (= npx expo start --ios)
  npm run android       Start Expo Android Emulator (= npx expo start --android)
  npm run build:web     Export a production web bundle (= npx expo export -p web)
  npm run serve:lambda  Run the Lambda server wrapper locally (node lambda-server.js)

The shell scripts (run-web.sh, run-ios.sh, run-android.sh, debug-*.sh)
are preferred for development because they add safety checks, environment
variable handling, and debug-mode flags. The npm run scripts are equivalent
bare commands with no extras.

------------------------------------------------------------------------
When to use "npx expo install" vs "npm install"
------------------------------------------------------------------------

This matters when ADDING a new package to the project in the future.

  npx expo install <package>   Use for any Expo SDK or React Native
                               package. Expo picks the version compatible
                               with your SDK, writes it to package.json,
                               and runs npm install automatically. Future
                               developers only need npm install after that.
                               Examples:
                                 npx expo install expo-camera
                                 npx expo install expo-notifications

  npm install <package>        Use for non-Expo packages (Redux,
                               NativeWind, plain JS utilities, etc.)
                               that have no Expo SDK version constraint.

WHY this distinction matters:
  A fresh Expo project created with "npx create-expo-app" does NOT
  include react-dom or react-native-web by default.
  Running "npx expo install react-dom react-native-web" writes those
  packages into package.json permanently. After that, all future
  developers only need "npm install" — no extra step. That one-time
  command has already been run for this project.

  Note: @expo/metro-runtime is NOT installed separately — it is bundled
  as a transitive dependency of expo-router. Do not add it manually.


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
4a. WEB — STEP BY STEP
------------------------------------------------------------------------

Prerequisites: Node.js installed, npm install completed (Section 2).

  Step 1 — Open a terminal and navigate to the ui/ folder:
    cd /path/to/wine.liquor/ui

  Step 2 — Start the Expo web dev server using the shell script:
    bash run-web.sh
    The script checks for missing web packages and installs them
    automatically if needed, then starts the server.

    Alternatively, run directly without the script:
    npx expo start --web
    OR: npm run web

  Step 3 — Wait for the terminal to print:
    Web is waiting on http://localhost:8081

  Step 4 — The browser opens automatically at http://localhost:8081.
    If the browser does not open automatically, open it yourself and
    navigate to: http://localhost:8081

  Step 5 — Verify the app loaded correctly:
    The Weather AI home screen appears with a city input field and
    question buttons.

  Step 6 — Hot reload is active.
    Edit any .tsx or .ts file and save — the browser refreshes
    automatically within 1-2 seconds without needing to restart the server.

  Step 7 — To stop: press Ctrl+C in the terminal.

  Useful variants:
    Clear the Metro bundler cache (fixes stale module issues):
      npx expo start --web --clear

    Run in offline mode (no backend calls):
      EXPO_PUBLIC_ONLINE=0 bash run-web.sh

    Use a different port (if 8081 is taken):
      npx expo start --web --port 8082
      Then open http://localhost:8082

    Build a production static bundle:
      npx expo export -p web
      OR: npm run build:web
      Output goes to: ui/dist/


------------------------------------------------------------------------
4b. iOS — STEP BY STEP  (macOS only)
------------------------------------------------------------------------

Prerequisites: macOS 13+, Xcode 15+ installed and configured (Section 1c).
If you are on Windows or Linux, use Section 4a (Web) or 4c (Android).

  Step 1 — Confirm Xcode command-line tools are active:
    xcode-select -p
    Expected output: /Applications/Xcode.app/Contents/Developer
    If you see an error, run: xcode-select --install

  Step 2 — List available simulators to confirm at least one exists:
    xcrun simctl list devices available
    Look for a section like:
      -- iOS 17.x --
          iPhone 16 (XXXXXXXX) (Shutdown)
    If the list is empty, go back to Section 1c Step 6 to add a simulator.

  Step 3 — Open a terminal and navigate to the ui/ folder:
    cd /path/to/wine.liquor/ui

  Step 4 — Start the app in the iOS Simulator:
    bash run-ios.sh

    Alternatively, run directly:
    npx expo start --ios
    OR: npm run ios

    To target a specific simulator by name:
    npx expo start --ios --device "iPhone 16 Pro"
    (Use the exact name from xcrun simctl list devices available)

  Step 5 — Watch the terminal output. You will see:
    - "Starting Metro Bundler" — the JavaScript bundler is starting
    - "Opening on iOS..." — Expo is launching the Simulator
    - A percentage progress bar as the JS bundle compiles (first run
      takes 30-60 seconds; subsequent runs are much faster)
    - "Finished building JavaScript bundle in Xms"

  Step 6 — The iOS Simulator window opens automatically.
    The app icon appears on the home screen and the app launches.
    Wait for the Weather AI home screen to fully load.

  Step 7 — Interact with the app using your mouse or trackpad.
    The Simulator responds to clicks as taps.

  Step 8 — Hot reload is active.
    Save any .tsx or .ts file and the app reloads automatically.
    You can also press 'r' in the terminal to force a manual reload.

  Step 9 — To stop: press Ctrl+C in the terminal.
    The Simulator stays open but the dev server stops. Close the
    Simulator from its menu bar: Simulator > Quit Simulator.

  Using Expo Go on a physical iPhone (alternative to Simulator):
    Your iPhone and Mac must be on the same Wi-Fi network.
    Install Expo Go on the iPhone:
      https://apps.apple.com/app/expo-go/id982107779
    Run: npx expo start  (no --ios flag)
    A QR code is displayed in the terminal and in the browser at
    http://localhost:8081.
    Open the iPhone Camera app, point it at the QR code, and tap
    the notification that appears. Expo Go opens and loads the app.

  Useful variants:
    Clear Metro cache:
      npx expo start --ios --clear

    Run in offline mode:
      EXPO_PUBLIC_ONLINE=0 bash run-ios.sh


------------------------------------------------------------------------
4c. ANDROID — STEP BY STEP
------------------------------------------------------------------------

Prerequisites: Android Studio installed, AVD configured, ADB in PATH
(Section 1d). Complete all steps in Section 1d before continuing.

  Step 1 — Verify ADB is in PATH and works:
    adb --version
    Expected: Android Debug Bridge version 1.0.xx
    If you get "command not found", add ADB to PATH (Section 1d Step 4).

  Step 2 — Start the Android Emulator.
    Choose one of the following methods:

    Method A — From Android Studio:
      Open Android Studio.
      Click "Device Manager" (right-side toolbar or Tools > Device Manager).
      Find your AVD in the list (e.g., "Pixel 8 API 34").
      Click the green triangle (play icon) next to it.
      The emulator window opens. Wait for it to fully boot to the
      Android home screen (30-60 seconds on first launch).

    Method B — From the command line:
      List your AVDs to get the exact name:
        emulator -list-avds
      Start the emulator (run in background with &):
        emulator -avd Pixel_8_API_34 &
      Replace "Pixel_8_API_34" with your actual AVD name from the list.
      Wait 30-60 seconds for the emulator to finish booting.

    Method C — Physical Android device:
      Connect the phone to your computer via USB.
      If prompted on the phone: tap "Allow USB Debugging".

  Step 3 — Verify the emulator or device is ready:
    adb devices
    Expected output:
      List of devices attached
      emulator-5554   device

    The status must be "device". Common problems:
      - "offline" → emulator is still booting; wait and try again
      - nothing listed → ADB is not in PATH, or emulator did not start
      - "unauthorized" → physical device: accept the USB debugging prompt

  Step 4 — Open a terminal and navigate to the ui/ folder:
    cd /path/to/wine.liquor/ui

  Step 5 — Start the app in the emulator:
    bash run-android.sh

    Alternatively, run directly:
    npx expo start --android
    OR: npm run android

  Step 6 — Watch the terminal output:
    - "Starting Metro Bundler"
    - "Opening on Android..."
    - Progress percentage as the JS bundle compiles
    - "Finished building JavaScript bundle in Xms"
    The app installs itself on the emulator and launches automatically.

  Step 7 — Wait for the Weather AI home screen to appear in the
    emulator (30-60 seconds on first install; faster on subsequent runs).

  Step 8 — Interact with the app by clicking in the emulator window.
    The emulator responds to mouse clicks as taps.

  Step 9 — Hot reload is active.
    Save any .tsx or .ts file and the app reloads automatically.
    Press 'r' in the terminal to force a manual reload.

  Step 10 — To stop: press Ctrl+C in the terminal.
    The emulator stays open. Close it from its title bar × button
    or run: adb emu kill

  Using Expo Go on a physical Android device (alternative to Emulator):
    Install Expo Go from the Play Store:
      https://play.google.com/store/apps/details?id=host.exp.exponent
    Run: npx expo start  (no --android flag)
    A QR code is displayed in the terminal.
    Open the Expo Go app on the phone and tap "Scan QR Code".
    Point the camera at the QR code in the terminal.
    The app loads on your device over the local network.

  Useful variants:
    Clear Metro cache:
      npx expo start --android --clear

    Run in offline mode:
      EXPO_PUBLIC_ONLINE=0 bash run-android.sh


================================================================================
5. VS CODE DEBUGGING
================================================================================

VS Code debugging lets you set breakpoints in TypeScript source files and
pause execution to inspect variables, the call stack, and component state.
This section assumes the app is already running (Section 4).

------------------------------------------------------------------------
5a. REQUIRED EXTENSIONS
------------------------------------------------------------------------

Install all extensions before attempting to debug. Missing extensions
cause silent failures (debugger attaches but breakpoints never hit).

  AUTOMATIC PROMPT (recommended):
    The file ui/.vscode/extensions.json lists all three extensions as
    recommendations. When you open the ui/ folder in VS Code for the
    first time, VS Code shows a notification in the bottom-right corner:
      "Do you want to install the recommended extensions for this
       repository?"
    Click "Install All" and VS Code installs all three automatically.
    If you dismissed the prompt, trigger it again:
      Ctrl+Shift+X → type "@recommended" in the search box →
      click the cloud/download icon next to each extension.

  MANUAL INSTALL (if the prompt did not appear):
    Open the Extensions panel: Ctrl+Shift+X

    1. Expo Tools
         Publisher:  expo
         Extension ID: expo.vscode-expo-tools
         Purpose:  Expo-specific IntelliSense, app.json schema validation,
                   and file linking. Also needed for launch.json to work.
         Install via command line:
           code --install-extension expo.vscode-expo-tools

    2. React Native Tools
         Publisher:  Microsoft
         Extension ID: msjsdiag.vscode-react-native
         Purpose:  Provides the "reactnativedirect" debug type used by the
                   iOS and Android launch configurations. Connects VS Code
                   to the Hermes/CDP debugger inside the simulator or device.
         Install via command line:
           code --install-extension msjsdiag.vscode-react-native

    3. JavaScript Debugger (Nightly)  [recommended for web, improves source maps]
         Publisher:  Microsoft
         Extension ID: ms-vscode.js-debug-nightly
         Purpose:  Better source map resolution for web debugging. Without
                   this, TypeScript breakpoints on web may miss by one line.
         Install via command line:
           code --install-extension ms-vscode.js-debug-nightly

  Verify installation:
    Open the Extensions panel (Ctrl+Shift+X), search for each extension
    by its ID, and confirm "Installed" appears under its name.


------------------------------------------------------------------------
5b. LAUNCH CONFIGURATIONS (.vscode/launch.json)
------------------------------------------------------------------------

The file ui/.vscode/launch.json defines five debug configurations.
All of them are pre-configured — you do not need to edit the file.

  IMPORTANT: VS Code must be opened at the ui/ folder, not the root
  wine.liquor/ folder, for launch.json to be discovered. Open VS Code
  with: code /path/to/wine.liquor/ui  OR  cd ui && code .

  Configurations defined:

  1. "Debug: Web — Launch Chrome"
       Starts a new Chrome window pointing at http://localhost:8081
       with the Chrome DevTools Protocol debugger attached.
       Use for web debugging. Requires debug-web.sh to be running first.

  2. "Debug: Web — Attach Chrome"
       Attaches to an already-running Chrome instance started with
       the remote debugging flag on port 9222:
         google-chrome --remote-debugging-port=9222
       Use when you want to keep the same Chrome session alive across
       multiple debug restarts.

  3. "Debug: iOS — Hermes"
       Attaches the VS Code debugger to the Hermes JS engine running
       inside the iOS Simulator via the Chrome DevTools Protocol.
       Requires debug-ios.sh to be running and the app loaded first.

  4. "Debug: Android — Hermes"
       Attaches the VS Code debugger to the Hermes JS engine in the
       Android Emulator via ADB + CDP.
       Requires debug-android.sh running and the app loaded first.

  5. "Debug: Attach to Running App"
       Generic attach for any already-running React Native app in dev
       mode. Use when the app is open and you want to connect without
       relaunching the simulator or emulator.


------------------------------------------------------------------------
5c. DEBUGGING WEB — STEP BY STEP
------------------------------------------------------------------------

What you need before starting:
  - Node.js installed (Section 1a)
  - npm install and web deps installed (Section 2)
  - VS Code 1.85+ (Section 1e)
  - "Expo Tools" and "React Native Tools" extensions installed (Section 5a)
  - Google Chrome or Microsoft Edge installed

  Step 1 — Open VS Code at the ui/ folder:
    cd /path/to/wine.liquor/ui
    code .
    VS Code opens. Confirm the Explorer panel shows the app/ directory
    and package.json at the root of the file tree.

  Step 2 — Open a terminal inside VS Code:
    Press Ctrl+`  (backtick)  OR  menu: View > Terminal
    A terminal panel appears at the bottom of VS Code.

  Step 3 — Start the web dev server in debug mode:
    In the VS Code terminal, type:
      bash debug-web.sh
    The script starts the Expo Metro bundler.

  Step 4 — Wait for the server to be ready:
    Watch the terminal output. When you see:
      Web is waiting on http://localhost:8081
    the server is ready. This takes 15-30 seconds on first run.
    Do NOT proceed to Step 5 until this line appears.

  Step 5 — Open the Run & Debug panel in VS Code:
    Press Ctrl+Shift+D
    OR click the bug+play icon in the left sidebar (Activity Bar).

  Step 6 — Select the web launch configuration:
    At the top of the Run & Debug panel there is a dropdown.
    Click the dropdown and select: "Debug: Web — Launch Chrome"

  Step 7 — Start the debug session:
    Press F5
    OR click the green triangle (play) button next to the dropdown.

  Step 8 — Chrome opens automatically:
    A new Chrome window opens at http://localhost:8081.
    The Weather AI home screen loads.
    In VS Code, the status bar at the bottom turns orange —
    this confirms the debug session is active and attached.

  Step 9 — Set a breakpoint:
    In VS Code, open any .tsx file (e.g., app/_layout.tsx or a component file).
    Click in the gutter to the left of a line number.
    A solid red dot appears — this is your breakpoint.
    Example: set a breakpoint on the line that calls the backend API.

  Step 10 — Trigger the breakpoint:
    In the Chrome window, interact with the app (e.g., type a city name
    and ask a question).
    When execution reaches your breakpoint, VS Code comes to the
    foreground and highlights the paused line in yellow.

  Step 11 — Inspect the paused state:
    Variables panel (left): shows local variables and their values.
    Call Stack panel (left): shows the chain of function calls.
    Watch panel (left): add expressions to monitor (e.g., response.data).
    Debug console (bottom): type JavaScript expressions to evaluate them.

  Step 12 — Step through code:
    F5            Continue — run until next breakpoint
    F10           Step Over — run the current line, stay in this function
    F11           Step Into — enter the function being called
    Shift+F11     Step Out  — run to the end of the current function

  Step 13 — Stop the debug session:
    Press Shift+F5
    OR click the red square in the debug toolbar.
    Then press Ctrl+C in the terminal to stop the dev server.

  Tips:
    - After editing code, save the file. Hot reload updates the browser
      automatically. You do NOT need to restart the debug session —
      breakpoints keep working.
    - Chrome's own DevTools (F12 in Chrome) work alongside VS Code.
      Use Chrome DevTools for network inspection and VS Code for
      TypeScript breakpoints.
    - If breakpoints show a hollow circle (unverified), it usually means
      source maps failed to load. Try: npx expo start --web --clear
      then restart the debug session.


------------------------------------------------------------------------
5d. DEBUGGING iOS — STEP BY STEP
------------------------------------------------------------------------

What you need before starting:
  - macOS 13+ with Xcode 15+ fully configured (Section 1c)
  - At least one iOS Simulator configured (Section 1c Step 6)
  - VS Code 1.85+ (Section 1e)
  - "Expo Tools" and "React Native Tools" extensions installed (Section 5a)

  Step 1 — Open VS Code at the ui/ folder:
    cd /path/to/wine.liquor/ui
    code .
    VS Code opens. Confirm the Explorer panel shows the app/ directory
    and package.json at the root of the file tree.

  Step 2 — Open a terminal inside VS Code:
    Press Ctrl+`  OR  menu: View > Terminal

  Step 3 — Start the iOS dev server in debug mode:
    In the VS Code terminal, type:
      bash debug-ios.sh
    The script starts Metro bundler and launches the iOS Simulator.

  Step 4 — Watch the terminal for progress:
    You will see several lines of output. Key messages to watch for:
      "Starting Metro Bundler"          — bundler is initializing
      "Opening on iOS..."               — Simulator is being launched
      A progress bar (0% to 100%)       — JavaScript bundle is compiling
      "Finished building JavaScript
       bundle in Xms"                   — bundle is ready

  Step 5 — Wait for the iOS Simulator to fully open:
    The Xcode Simulator window appears on screen.
    Inside the Simulator, the app loads (first install can take
    30-60 seconds — you'll see a progress bar on the app icon).
    Wait until the Weather AI home screen is fully visible with the
    city input field and question buttons showing.
    DO NOT proceed to Step 6 until the app is fully loaded.

  Step 6 — Open the Run & Debug panel in VS Code:
    Press Ctrl+Shift+D
    OR click the bug+play icon in the Activity Bar (left sidebar).

  Step 7 — Select the iOS launch configuration:
    Click the dropdown at the top of the Run & Debug panel.
    Select: "Debug: iOS — Hermes"

  Step 8 — Start the debug session:
    Press F5.
    VS Code shows "Connecting to runtime..." in the debug console.
    Wait 5-15 seconds for the connection to establish.

  Step 9 — Confirm the debugger is connected:
    The VS Code status bar at the bottom turns orange.
    The debug toolbar (Continue, Step Over, etc.) appears at the top.
    The debug console shows: "Hermes runtime ready."

  Step 10 — Set a breakpoint:
    In VS Code, open any .tsx file.
    Click in the gutter to the left of a line number.
    A red dot appears on that line.

  Step 11 — Trigger the breakpoint:
    Click and interact with the app inside the iOS Simulator.
    When execution reaches the breakpoint, VS Code pauses and
    highlights the line in yellow.

  Step 12 — Inspect and step through code (same controls as web):
    F5  Continue  |  F10  Step Over  |  F11  Step Into  |  Shift+F11  Step Out
    Variables and Call Stack panels show the current state.

  Step 13 — Stop the debug session:
    Press Shift+F5  OR  click the red square.
    Press Ctrl+C in the terminal to stop the dev server.

  If the debugger fails to connect (F5 starts but VS Code stays on
  "Connecting..." and never turns orange):
    a. In the Simulator, press Cmd+Ctrl+Z (simulates shake gesture).
       The Expo dev menu opens.
    b. Tap "Open JS Debugger".
       The Hermes inspector endpoint is activated.
    c. Back in VS Code, press F5 again.
    d. If it still fails, stop and restart debug-ios.sh, wait for the
       app to reload, then try F5 again.

  If VS Code asks "Which packager port?" during first setup:
    Accept the default: 8081.


------------------------------------------------------------------------
5e. DEBUGGING ANDROID — STEP BY STEP
------------------------------------------------------------------------

What you need before starting:
  - Android Studio installed with an AVD configured (Section 1d)
  - ADB in PATH and verified working (Section 1d Steps 4-5)
  - VS Code 1.85+ (Section 1e)
  - "Expo Tools" and "React Native Tools" extensions installed (Section 5a)

  Step 1 — Start the Android Emulator BEFORE opening the dev server.
    The emulator must be fully booted and at the Android home screen
    before you run debug-android.sh.

    Method A — From Android Studio:
      Open Android Studio.
      Go to Tools > Device Manager  (or click Device Manager in the toolbar).
      Find your AVD in the list (e.g., "Pixel 8 API 34").
      Click the green triangle (play icon) to the right of the AVD name.
      The emulator window opens. Wait for the Android home screen to appear.
      First launch: 60-90 seconds. Subsequent launches: 20-30 seconds.

    Method B — From the command line:
      First, find your AVD name:
        emulator -list-avds
        # Prints e.g.: Pixel_8_API_34
      Start it (the & sends it to the background so the terminal stays free):
        emulator -avd Pixel_8_API_34 &
      Wait 30-60 seconds for it to finish booting.

  Step 2 — Verify the emulator is fully ready:
    adb devices
    Required output:
      List of devices attached
      emulator-5554   device

    The word "device" at the end is required. If you see:
      "offline"      → wait 30 more seconds and run adb devices again
      "unauthorized" → physical device only: accept the USB debugging prompt
      nothing listed → emulator did not start; go back to Step 1

  Step 3 — Open VS Code at the ui/ folder:
    cd /path/to/wine.liquor/ui
    code .

  Step 4 — Open a terminal inside VS Code:
    Press Ctrl+`  OR  View > Terminal

  Step 5 — Start the Android dev server in debug mode:
    In the VS Code terminal, type:
      bash debug-android.sh
    The script prints pre-flight reminders, then starts Metro bundler.

  Step 6 — Watch the terminal for progress:
    Key messages to look for:
      "Starting Metro Bundler"          — bundler is initializing
      "Opening on Android..."           — app is being installed
      A progress bar (0% to 100%)       — JavaScript bundle compiling
      "Finished building JavaScript
       bundle in Xms"                   — bundle ready

  Step 7 — Wait for the app to load in the emulator:
    In the emulator window you will see the app icon appear and
    then the app opens automatically.
    Wait until the Weather AI home screen is fully visible.
    First install: 30-60 seconds. Subsequent runs: 5-10 seconds.
    DO NOT proceed to Step 8 until the app home screen is visible.

  Step 8 — Open the Run & Debug panel in VS Code:
    Press Ctrl+Shift+D
    OR click the bug+play icon in the Activity Bar.

  Step 9 — Select the Android launch configuration:
    Click the dropdown at the top of the Run & Debug panel.
    Select: "Debug: Android — Hermes"

  Step 10 — Start the debug session:
    Press F5.
    VS Code shows "Connecting to runtime..." in the debug console.
    React Native Tools connects via ADB to the Hermes CDP endpoint.
    Wait 5-15 seconds.

  Step 11 — Confirm the debugger is connected:
    The VS Code status bar at the bottom turns orange.
    The debug toolbar appears at the top of the screen.
    The debug console shows "Hermes runtime ready."

  Step 12 — Set a breakpoint:
    Open any .tsx file in VS Code.
    Click in the gutter to the left of a line number — a red dot appears.

  Step 13 — Trigger the breakpoint:
    Click and interact with the app in the emulator window.
    VS Code pauses and highlights the paused line in yellow.

  Step 14 — Inspect and step through code:
    F5  Continue  |  F10  Step Over  |  F11  Step Into  |  Shift+F11  Step Out
    Variables, Call Stack, and Watch panels are in the left Run & Debug panel.

  Step 15 — Stop the debug session:
    Press Shift+F5  OR  click the red square in the debug toolbar.
    Press Ctrl+C in the terminal to stop the dev server.

  If the debugger fails to connect (stays on "Connecting..."):
    a. Click inside the emulator window to make sure it is focused.
    b. Press Ctrl+M  (this opens the Expo dev menu inside the emulator).
       If Ctrl+M does not work, try: adb shell input keyevent 82
    c. In the dev menu, tap "Open JS Debugger".
    d. Back in VS Code, press F5 again.
    e. If still failing, stop debug-android.sh (Ctrl+C), restart it,
       wait for the app to reload in the emulator, then retry F5.

  If adb devices shows the device but Expo cannot deploy:
    Reverse the port so the emulator can reach the Metro server:
      adb reverse tcp:8081 tcp:8081
    Then shake to reload the app (Ctrl+M > "Reload").


================================================================================
6. SHELL SCRIPTS REFERENCE
================================================================================

All scripts live in the ui/ folder and must be made executable before
first use. Run this once from the ui/ folder:
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

npm ERESOLVE / "could not resolve dependency" during Expo SDK upgrade
  -> Delete node_modules and package-lock.json, then reinstall clean:
       rm -rf node_modules package-lock.json
       npm install
  Cause: Upgrading an existing project leaves stale packages from the
  old SDK in node_modules. npm 7+'s strict peer-dep resolver sees them
  and refuses. A clean install gives npm the same empty slate that
  npx create-expo-app starts from — no conflict, no flags needed.
  Do NOT use --legacy-peer-deps as a permanent fix; it masks real
  conflicts. The clean install is the correct procedure.

"CommandError: web support ... required dependencies not installed"
  -> npm install      (react-dom and react-native-web are in package.json;
                       running npm install is all that is needed)
  -> If npm install was already run and the error persists:
       npx expo install react-dom react-native-web
  This error should not appear in normal usage because react-dom and
  react-native-web are declared in package.json and installed automatically
  by npm install. DO NOT install @expo/metro-runtime separately — it is a
  transitive dependency of expo-router and must not appear in package.json
  directly (doing so can cause version conflicts).

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
  -> Confirm Xcode is installed: xcode-select -p
  -> Open Xcode manually from /Applications, accept licence, install components
  -> List simulators: xcrun simctl list devices available
  -> If list is empty: Xcode > Window > Devices and Simulators > + to add one
  -> Try opening the Simulator manually: open -a Simulator

iOS app stuck on splash screen / white screen
  -> Press Ctrl+C to stop the dev server
  -> npx expo start --ios --clear   (clears bundler cache)
  -> In Simulator: Device > Erase All Content and Settings, then retry

Android emulator not detected by ADB
  -> adb devices                    # should list emulator-5554   device
  -> If "offline": wait 30 seconds and try again (emulator still booting)
  -> If empty: adb kill-server && adb start-server
  -> Confirm ANDROID_HOME and platform-tools are in PATH (Section 1d Step 4)

Android app crashes on launch
  -> adb logcat -s ReactNativeJS   # shows JS-layer errors from the emulator
  -> npx expo start --android --clear

VS Code debugger says "Cannot connect to runtime process"
  -> Confirm the Expo dev server is running first (debug-web/ios/android.sh)
  -> The app must be loaded and showing the home screen BEFORE pressing F5
  -> For iOS: Cmd+Ctrl+Z in Simulator → tap "Open JS Debugger" → retry F5
  -> For Android: Ctrl+M in Emulator → tap "Open JS Debugger" → retry F5
  -> Restart VS Code and try the full sequence again from Step 1

VS Code breakpoints show a hollow circle (unverified / not bound)
  -> Source maps failed to load
  -> Stop the dev server, run: npx expo start --web --clear (or --ios/--android)
  -> Confirm VS Code is opened at the ui/ folder, not the root project folder
  -> Reinstall extensions: expo.vscode-expo-tools, msjsdiag.vscode-react-native

NativeWind styles not applying
  -> npx expo start --clear
  -> Confirm global.css is imported in app/_layout.tsx (import "../global.css")
  -> Confirm tailwind.config.js content array includes:
       app/**/*.{js,jsx,ts,tsx}
       pages/**/*.{js,jsx,ts,tsx}
       components/**/*.{js,jsx,ts,tsx}
       lib/**/*.{js,jsx,ts,tsx}

SQLite history not persisting on web
  -> Expo SDK 56 web uses OPFS (Origin Private File System) via WASM
  -> OPFS requires a secure context (https:// or localhost)
  -> Ensure browser supports OPFS: Chrome 102+, Edge 102+, Firefox 111+
  -> Private/incognito mode may block OPFS — use a normal window


================================================================================
10. UI DESIGN DOCS  (ui/docs/)
================================================================================

All UI design documents and static page renders live in ui/docs/.
This folder is tracked in git. Do not place design files loose in ui/ root.

------------------------------------------------------------------------
Current files
------------------------------------------------------------------------

  ui/docs/ui.docx
    Word document — screen layouts, component specs, and design decisions
    for the Weather AI Expo app.

  ui/docs/_preview.html
    Static HTML render of the Weather AI main screen.
    Uses Tailwind CSS via CDN — open in any browser, no build step needed.
    Open it with:
      open ui/docs/_preview.html          # macOS
      start ui/docs/_preview.html         # Windows
      xdg-open ui/docs/_preview.html      # Linux / WSL

------------------------------------------------------------------------
Adding a new page render
------------------------------------------------------------------------

When designing a new screen, create a static HTML mockup here before
building the Expo component. This gives a fast, no-build preview loop.

  Step 1 — Create a new file in ui/docs/:
    ui/docs/<screen-name>.html

  Step 2 — Use this starter template:

    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-sky-100 min-h-screen">
      <!-- screen mockup here -->
    </body>
    </html>

  Step 3 — Open in a browser to iterate on the layout.
    No server, no build, no install — just open the file.

  Step 4 — When you are satisfied with the layout, translate it to an
    Expo screen using the corresponding Tailwind class names.
    The NativeWind class names in the Expo screen should match the
    Tailwind class names used in the HTML mockup.

  Step 5 — Commit the HTML file alongside the Expo screen changes.

------------------------------------------------------------------------
What belongs in ui/docs/ vs elsewhere
------------------------------------------------------------------------

  ui/docs/           Design docs, HTML mockups, screenshots, wireframes
                     (tracked in git)

  docs/pdfs/         Auto-generated project architecture PDFs
                     (gitignored — run lib/generate_pdf.py to regenerate)

  ui/                Expo source code only — no design files at the root
