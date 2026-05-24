export type HistoryType =
  | "weather_ask"
  | "weather_ask_error"
  | "weather_clear"
  | "user_login"
  | "user_logout"
  | "setting_change"
  | "navigation"
  | "state_sync"
  | "state_cleared";

export interface HistoryEntry {
  type:  HistoryType;
  label: string;
  data?: Record<string, unknown>;
}
