import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  ISettings, DefaultPage, LLMProvider,
  FontFamily, FontSizeScale, FontWeightSetting, FontStyleSetting,
} from "../../lib/Settings";

type Theme = ISettings["theme"];

interface SettingsState {
  online:        boolean;
  stateSync:     boolean;
  llmProvider:   LLMProvider;
  theme:         Theme;
  notifications: boolean;
  defaultCity:   string;
  defaultPage:   DefaultPage;
  fontFamily:    FontFamily;
  fontSize:      FontSizeScale;
  fontWeight:    FontWeightSetting;
  fontStyle:     FontStyleSetting;
  historyLog:    0 | 1;
}

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    online:        (process.env.EXPO_PUBLIC_ONLINE       ?? "1") !== "0",
    stateSync:     (process.env.EXPO_PUBLIC_STATE_SYNC   ?? "1") !== "0",
    historyLog:    (process.env.EXPO_PUBLIC_HISTORY_LOG  ?? "0") === "1" ? 1 : 0,
    llmProvider:   "env-default",
    theme:         "system",
    notifications: true,
    defaultCity:   "",
    defaultPage:   "home",
    fontFamily:    "system",
    fontSize:      "medium",
    fontWeight:    "regular",
    fontStyle:     "normal",
  } as SettingsState,
  reducers: {
    setOnline(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
    setStateSync(state, action: PayloadAction<boolean>) {
      state.stateSync = action.payload;
    },
    setHistoryLog(state, action: PayloadAction<0 | 1>) {
      state.historyLog = action.payload;
    },
    setLlmProvider(state, action: PayloadAction<LLMProvider>) {
      state.llmProvider = action.payload;
    },
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
    },
    setNotifications(state, action: PayloadAction<boolean>) {
      state.notifications = action.payload;
    },
    setDefaultCity(state, action: PayloadAction<string>) {
      state.defaultCity = action.payload;
    },
    setDefaultPage(state, action: PayloadAction<DefaultPage>) {
      state.defaultPage = action.payload;
    },
    setFontFamily(state, action: PayloadAction<FontFamily>) {
      state.fontFamily = action.payload;
    },
    setFontSize(state, action: PayloadAction<FontSizeScale>) {
      state.fontSize = action.payload;
    },
    setFontWeight(state, action: PayloadAction<FontWeightSetting>) {
      state.fontWeight = action.payload;
    },
    setFontStyle(state, action: PayloadAction<FontStyleSetting>) {
      state.fontStyle = action.payload;
    },
    resetSettings(state) {
      state.theme         = "system";
      state.notifications = true;
      state.defaultCity   = "";
      state.defaultPage   = "home";
      state.llmProvider   = "env-default";
      state.fontFamily    = "system";
      state.fontSize      = "medium";
      state.fontWeight    = "regular";
      state.fontStyle     = "normal";
      state.online        = (process.env.EXPO_PUBLIC_ONLINE      ?? "1") !== "0";
      state.stateSync     = (process.env.EXPO_PUBLIC_STATE_SYNC  ?? "1") !== "0";
      state.historyLog    = (process.env.EXPO_PUBLIC_HISTORY_LOG ?? "0") === "1" ? 1 : 0;
    },
  },
});

export const {
  setOnline, setStateSync, setHistoryLog, setLlmProvider,
  setTheme, setNotifications, setDefaultCity, setDefaultPage,
  setFontFamily, setFontSize, setFontWeight, setFontStyle,
  resetSettings,
} = settingsSlice.actions;
export default settingsSlice.reducer;
