import React, { useRef } from "react";
import { Alert, Platform, Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import AppText from "../components/AppText";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setOnline, setStateSync, setHistoryLog, setLlmProvider,
  setDefaultCity, setDefaultPage, setNotifications, setTheme,
  setFontFamily, setFontSize, setFontWeight, setFontStyle,
} from "../store/slices/settingsSlice";
import type {
  DefaultPage, ISettings, LLMProvider,
  FontFamily, FontSizeScale, FontWeightSetting, FontStyleSetting,
} from "../lib/Settings";
import { isEnvStateAvailable, syncStateFromEnv } from "../lib/envState";
import { useFontStyle } from "../lib/FontContext";
import SyncStatesModal from "../components/SyncStatesModal";
import type { ISyncStates } from "../lib/SyncStates";

type Theme = ISettings["theme"];

export default function SettingsPage() {
  const dispatch      = useAppDispatch();
  const online        = useAppSelector((s) => s.settings.online);
  const stateSync     = useAppSelector((s) => s.settings.stateSync);
  const theme         = useAppSelector((s) => s.settings.theme);
  const notifications = useAppSelector((s) => s.settings.notifications);
  const defaultCity   = useAppSelector((s) => s.settings.defaultCity);
  const defaultPage   = useAppSelector((s) => s.settings.defaultPage);
  const historyLog    = useAppSelector((s) => s.settings.historyLog);
  const llmProvider   = useAppSelector((s) => s.settings.llmProvider as LLMProvider);
  const fontFamily    = useAppSelector((s) => s.settings.fontFamily as FontFamily);
  const fontSize      = useAppSelector((s) => s.settings.fontSize   as FontSizeScale);
  const fontWeight    = useAppSelector((s) => s.settings.fontWeight as FontWeightSetting);
  const fontStyle     = useAppSelector((s) => s.settings.fontStyle  as FontStyleSetting);

  const { fontSize: resolvedFontSize } = useFontStyle();

  const userEmail      = useAppSelector((s) => s.user.email);
  const userPhone      = useAppSelector((s) => s.user.phone);
  const savedQuestions = useAppSelector((s) => s.questions.items);
  const weatherCity    = useAppSelector((s) => s.weather.city);

  const envAvailable  = isEnvStateAvailable();
  const pasteModalRef = useRef<ISyncStates>(null);

  function onEnableHistoryLog() {
    const msg =
      "SQLite history logging uses OPFS, which only allows one browser tab at a time. " +
      "Opening the app in a second tab while this is enabled will crash with an OPFS error.\n\n" +
      "Enable SQLite history logging?";
    if (Platform.OS === "web") {
      if (window.confirm(msg)) dispatch(setHistoryLog(1));
    } else {
      Alert.alert("One Tab Only", msg, [
        { text: "Cancel", style: "cancel" },
        { text: "Enable", onPress: () => dispatch(setHistoryLog(1)) },
      ]);
    }
  }

  function hasExistingData(): boolean {
    return !!(userEmail || userPhone || savedQuestions.length > 0 || weatherCity);
  }

  function applyDefaults() {
    syncStateFromEnv(dispatch);
  }

  function onDefaultSettings() {
    if (!envAvailable) return;
    if (!hasExistingData()) { applyDefaults(); return; }
    const msg = "This will overwrite your current settings and data with the defaults from .env. Continue?";
    if (Platform.OS === "web") {
      if (window.confirm(msg)) applyDefaults();
    } else {
      Alert.alert("Overwrite Settings?", msg, [
        { text: "Cancel", style: "cancel" },
        { text: "Overwrite", style: "destructive", onPress: applyDefaults },
      ]);
    }
  }

  return (
    <View className={S.container}>
      <StatusBar style="dark" />

      <View className={S.pageHeader}>
        <Menu />
        <AppText className={S.pageHeaderTitle}>Settings</AppText>
        <View className={S.pageHeaderSpacer} />
      </View>

      <ScrollView contentContainerClassName={S.settingsScroll}>

        {/* 1 ── Running Mode ──────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Running Mode</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>
                {online ? "Online  (ONLINE=1)" : "Offline  (ONLINE=0)"}
              </AppText>
              <AppText className={S.settingsHint}>
                {online
                  ? "Makes live API calls to fetch weather data"
                  : "Input only from .env; no external API calls"}
              </AppText>
            </View>
            <Switch
              value={online}
              onValueChange={(v) => dispatch(setOnline(v))}
              trackColor={{ false: "#D1D5DB", true: "#38BDF8" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 2 ── State Sync ────────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>State Sync</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>
                {stateSync ? "Enabled  (STATE_SYNC=1)" : "Disabled  (STATE_SYNC=0)"}
              </AppText>
              <AppText className={S.settingsHint}>
                {stateSync
                  ? "App state is seeded from .env on each launch"
                  : "Persisted state is preserved across restarts"}
              </AppText>
            </View>
            <Switch
              value={stateSync}
              onValueChange={(v) => dispatch(setStateSync(v))}
              trackColor={{ false: "#D1D5DB", true: "#38BDF8" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 3 ── History Logging ───────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>History Logging</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>
                {historyLog === 1 ? "SQLite  (HISTORY_LOG=1)" : "Console  (HISTORY_LOG=0)"}
              </AppText>
              <AppText className={S.settingsHint}>
                {historyLog === 1
                  ? "Activity saved to SQLite/OPFS — one browser tab only"
                  : "Activity logged to the browser console only"}
              </AppText>
            </View>
            <Switch
              value={historyLog === 1}
              onValueChange={(v) => v ? onEnableHistoryLog() : dispatch(setHistoryLog(0))}
              trackColor={{ false: "#D1D5DB", true: "#38BDF8" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 4 ── Language Model ────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Language Model</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>LLM Provider</AppText>
              <AppText className={S.settingsHint}>AI model used by the Weather chatbot</AppText>
            </View>
            <Picker
              selectedValue={llmProvider}
              onValueChange={(v) => dispatch(setLlmProvider(v as LLMProvider))}
              style={{ width: 160, color: "#111827" }}
            >
              <Picker.Item label="Server Default"  value="env-default"   />
              <Picker.Item label="Claude"           value="claude"        />
              <Picker.Item label="OpenAI"           value="openai"        />
              <Picker.Item label="Gemini"           value="gemini"        />
              <Picker.Item label="Groq"             value="groq"          />
              <Picker.Item label="Ollama (Local)"   value="ollama"        />
              <Picker.Item label="AWS Bedrock"      value="bedrock"       />
              <Picker.Item label="OAI Compatible"   value="openai-compat" />
            </Picker>
          </View>
        </View>

        {/* 4 ── Appearance ────────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Appearance</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Theme</AppText>
            </View>
            <Picker
              selectedValue={theme}
              onValueChange={(v) => dispatch(setTheme(v as Theme))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="System" value="system" />
              <Picker.Item label="Light"  value="light"  />
              <Picker.Item label="Dark"   value="dark"   />
            </Picker>
          </View>
        </View>

        {/* 5 ── Navigation ────────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Navigation</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Default page</AppText>
              <AppText className={S.settingsHint}>Page shown on app launch and after login</AppText>
            </View>
            <Picker
              selectedValue={defaultPage}
              onValueChange={(v) => dispatch(setDefaultPage(v as DefaultPage))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="Home"       value="home"       />
              <Picker.Item label="Weather AI" value="weather-ai" />
            </Picker>
          </View>
        </View>

        {/* 6 ── Notifications ─────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Notifications</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Enable notifications</AppText>
              <AppText className={S.settingsHint}>Receive weather alerts and updates</AppText>
            </View>
            <Switch
              value={notifications}
              onValueChange={(v) => dispatch(setNotifications(v))}
              trackColor={{ false: "#D1D5DB", true: "#38BDF8" }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* 7 ── Weather ───────────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Weather</AppText>

          <View className={S.settingsRowLast}>
            <View className="flex-1 mr-4">
              <AppText className={S.settingsLabel}>Default city</AppText>
              <AppText className={S.settingsHint}>Pre-fills the city field in Weather AI</AppText>
            </View>
            <TextInput
              value={defaultCity}
              onChangeText={(v) => dispatch(setDefaultCity(v))}
              placeholder="e.g. Toronto"
              placeholderTextColor="#9CA3AF"
              autoCorrect={false}
              style={{
                width: 130,
                borderWidth: 1.5,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 8,
                fontSize: 14,
                color: "#111827",
                backgroundColor: "#fff",
              }}
            />
          </View>
        </View>

        {/* 8 ── Typography ────────────────────────────────────────────────── */}
        <View className={S.settingsSection}>
          <AppText className={S.settingsSectionTitle}>Typography</AppText>

          <View className={S.settingsRow}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Font Family</AppText>
            </View>
            <Picker
              selectedValue={fontFamily}
              onValueChange={(v) => dispatch(setFontFamily(v as FontFamily))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="System"    value="system"    />
              <Picker.Item label="Serif"     value="serif"     />
              <Picker.Item label="Monospace" value="monospace" />
            </Picker>
          </View>

          <View className={S.settingsRow}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Font Size</AppText>
            </View>
            <Picker
              selectedValue={fontSize}
              onValueChange={(v) => dispatch(setFontSize(v as FontSizeScale))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="Small"       value="small"  />
              <Picker.Item label="Medium"      value="medium" />
              <Picker.Item label="Large"       value="large"  />
              <Picker.Item label="Extra Large" value="xl"     />
            </Picker>
          </View>

          <View className={S.settingsRow}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Font Weight</AppText>
            </View>
            <Picker
              selectedValue={fontWeight}
              onValueChange={(v) => dispatch(setFontWeight(v as FontWeightSetting))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="Light"   value="light"   />
              <Picker.Item label="Regular" value="regular" />
              <Picker.Item label="Medium"  value="medium"  />
              <Picker.Item label="Bold"    value="bold"    />
            </Picker>
          </View>

          <View className={S.settingsRow}>
            <View className="flex-1">
              <AppText className={S.settingsLabel}>Font Style</AppText>
            </View>
            <Picker
              selectedValue={fontStyle}
              onValueChange={(v) => dispatch(setFontStyle(v as FontStyleSetting))}
              style={{ width: 140, color: "#111827" }}
            >
              <Picker.Item label="Normal" value="normal" />
              <Picker.Item label="Italic" value="italic" />
            </Picker>
          </View>

          {/* Live preview — explicit fontSize from context so size changes are visible */}
          <View style={{
            borderTopWidth: 1,
            borderColor: "#F3F4F6",
            paddingVertical: 14,
            paddingHorizontal: 4,
          }}>
            <AppText style={{
              fontSize: resolvedFontSize,
              color: "#374151",
              lineHeight: resolvedFontSize * 1.6,
            }}>
              The quick brown fox jumps over the lazy dog.{"\n"}Aa Bb Cc Dd 0 1 2 3
            </AppText>
          </View>
        </View>

        {/* 9 ── Default Settings ──────────────────────────────────────────── */}
        <View className="w-full max-w-lg mb-2">
          <Pressable
            className={`${S.outlineButton} ${!envAvailable ? S.buttonDisabled : ""}`}
            onPress={onDefaultSettings}
            disabled={!envAvailable}
          >
            <AppText className={S.outlineButtonText}>Default Settings</AppText>
          </Pressable>
          {!envAvailable && (
            <AppText className={S.settingsHint + " text-center"}>
              No EXPO_PUBLIC_APP_STATES found in .env
            </AppText>
          )}
        </View>

        {/* 10 ── Clear Settings ───────────────────────────────────────────── */}
        <View className="w-full max-w-lg mb-4">
          <Pressable
            className={S.outlineButton}
            onPress={() => pasteModalRef.current?.open()}
          >
            <AppText className={S.outlineButtonText}>Clear Settings</AppText>
          </Pressable>
          <AppText className={S.settingsHint + " text-center"}>
            Paste a JSON object to replace all current states
          </AppText>
        </View>

      </ScrollView>

      <SyncStatesModal
        ref={pasteModalRef}
        id="settings-clear"
        tag="modal"
        callback={() => pasteModalRef.current?.close()}
      />
    </View>
  );
}
