import type { Middleware } from "@reduxjs/toolkit";
import { insertHistory } from "../../lib/db";
import type { HistoryEntry, HistoryType } from "../../lib/HistoryEntry";

const TRACKED = new Set([
  "weather/ask/fulfilled",
  "weather/ask/rejected",
  "weather/clearWeather",
  "user/setUser",
  "user/clearUser",
  "settings/setLlmProvider",
  "settings/setOnline",
  "settings/setStateSync",
  "settings/setTheme",
  "settings/setNotifications",
  "settings/setDefaultPage",
  "settings/setDefaultCity",
  "settings/setFontFamily",
  "settings/setFontSize",
  "settings/setFontWeight",
  "settings/setFontStyle",
  "settings/resetSettings",
]);

function buildEntry(type: string, payload: unknown): HistoryEntry {
  switch (type) {
    case "weather/ask/fulfilled": {
      const p = payload as { city: string; question: string };
      return {
        type: "weather_ask",
        label: `Weather: ${p.city} — ${p.question}`,
        data: { city: p.city, question: p.question },
      };
    }
    case "weather/ask/rejected":
      return {
        type: "weather_ask_error",
        label: `Weather error: ${String(payload)}`,
        data: { error: String(payload) },
      };
    case "weather/clearWeather":
      return { type: "weather_clear", label: "Weather cleared" };
    case "user/setUser": {
      const p = payload as { email?: string };
      return {
        type: "user_login",
        label: `User: ${p.email ?? "unknown"}`,
        data: { email: p.email },
      };
    }
    case "user/clearUser":
      return { type: "user_logout", label: "User logged out" };
    case "settings/resetSettings":
      return { type: "setting_change", label: "Settings reset to defaults" };
    default: {
      const key = type.replace("settings/set", "");
      return {
        type: "setting_change" as HistoryType,
        label: `Setting: ${key} → ${JSON.stringify(payload)}`,
        data: { key, value: payload as Record<string, unknown> },
      };
    }
  }
}

export const historyMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  const a = action as { type: string; payload?: unknown };
  if (TRACKED.has(a.type)) {
    const entry = buildEntry(a.type, a.payload);
    insertHistory(entry as Record<string, unknown>);
  }
  return result;
};
