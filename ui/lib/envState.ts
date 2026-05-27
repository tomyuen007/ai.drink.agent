import type { AppDispatch } from "../store";
import { insertHistory } from "./db";
import { setUser, clearUser } from "../store/slices/userSlice";
import {
  setTheme, setNotifications, setDefaultCity, setDefaultPage,
  setOnline, setStateSync, setHistoryLog, setLlmProvider, resetSettings,
  setFontFamily, setFontSize, setFontWeight, setFontStyle,
} from "../store/slices/settingsSlice";
import { setCity, setQuestion, clearWeather } from "../store/slices/weatherSlice";
import { setItems } from "../store/slices/questionsSlice";
import type {
  DefaultPage, ISettings, LLMProvider,
  FontFamily, FontSizeScale, FontWeightSetting, FontStyleSetting,
} from "./Settings";

// ── Shared payload shape ──────────────────────────────────────────────────────
export interface SyncPayload {
  user?:      { email?: string; phone?: string };
  settings?:  Partial<{
    online:        boolean;
    stateSync:     boolean;
    historyLog:    0 | 1;
    llmProvider:   LLMProvider;
    theme:         ISettings["theme"];
    notifications: boolean;
    defaultCity:   string;
    defaultPage:   DefaultPage;
    fontFamily:    FontFamily;
    fontSize:      FontSizeScale;
    fontWeight:    FontWeightSetting;
    fontStyle:     FontStyleSetting;
  }>;
  weather?:   { city?: string; question?: string };
  questions?: { items?: string[] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseEnvJSON<T>(key: string): T | null {
  const raw = process.env[key];
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[envState] Cannot parse ${key} as JSON`);
    return null;
  }
}

// ── Core apply ────────────────────────────────────────────────────────────────
export function applyPayload(dispatch: AppDispatch, payload: SyncPayload): void {
  const { user, settings, weather, questions } = payload;

  if (user) dispatch(setUser(user));

  if (settings) {
    if (settings.online        !== undefined) dispatch(setOnline(settings.online));
    if (settings.stateSync     !== undefined) dispatch(setStateSync(settings.stateSync));
    if (settings.historyLog    !== undefined) dispatch(setHistoryLog(settings.historyLog));
    if (settings.llmProvider   !== undefined) dispatch(setLlmProvider(settings.llmProvider));
    if (settings.theme         !== undefined) dispatch(setTheme(settings.theme));
    if (settings.notifications !== undefined) dispatch(setNotifications(settings.notifications));
    if (settings.defaultCity   !== undefined) dispatch(setDefaultCity(settings.defaultCity));
    if (settings.defaultPage   !== undefined) dispatch(setDefaultPage(settings.defaultPage));
    if (settings.fontFamily    !== undefined) dispatch(setFontFamily(settings.fontFamily));
    if (settings.fontSize      !== undefined) dispatch(setFontSize(settings.fontSize));
    if (settings.fontWeight    !== undefined) dispatch(setFontWeight(settings.fontWeight));
    if (settings.fontStyle     !== undefined) dispatch(setFontStyle(settings.fontStyle));
  }

  if (weather) {
    if (weather.city     !== undefined) dispatch(setCity(weather.city));
    if (weather.question !== undefined) dispatch(setQuestion(weather.question));
  }

  if (questions?.items) dispatch(setItems(questions.items));
}

// ── Env checks ────────────────────────────────────────────────────────────────
export function isEnvStateAvailable(): boolean {
  return !!process.env.EXPO_PUBLIC_APP_STATES;
}

export function isSyncEnabled(): boolean {
  const v = (process.env.EXPO_PUBLIC_STATE_SYNC ?? "1").trim();
  return v !== "0";
}

export function isOnline(): boolean {
  const v = (process.env.EXPO_PUBLIC_ONLINE ?? "1").trim();
  return v !== "0";
}

// ── Clear all state ───────────────────────────────────────────────────────────
export function clearAllState(dispatch: AppDispatch): void {
  dispatch(clearUser());
  dispatch(resetSettings());
  dispatch(clearWeather());
  dispatch(setItems([]));
  insertHistory({ type: "state_cleared", label: "All state cleared" });
}

// ── Env sync ──────────────────────────────────────────────────────────────────
export function syncStateFromEnv(dispatch: AppDispatch): void {
  const payload = parseEnvJSON<SyncPayload>("EXPO_PUBLIC_APP_STATES");
  if (payload) {
    applyPayload(dispatch, payload);
    insertHistory({ type: "state_sync", label: "State synced from .env" });
  }
}
