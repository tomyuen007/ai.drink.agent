import * as SQLite from "expo-sqlite";

let _db: SQLite.SQLiteDatabase | null = null;

export async function initDb(): Promise<void> {
  if (_db) return;
  const db = await SQLite.openDatabaseAsync("app.db");
  await db.execAsync("PRAGMA journal_mode = WAL;");
  // UTF-8 is SQLite's default encoding; this PRAGMA is a no-op on existing DBs
  // but documents intent for any reader who checks the schema.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_history (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      date_text    TEXT NOT NULL,
      time_text    TEXT NOT NULL,
      history_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_h_date        ON user_history (date_text);
    CREATE INDEX IF NOT EXISTS idx_h_time        ON user_history (time_text);
    CREATE INDEX IF NOT EXISTS idx_h_json_prefix ON user_history (SUBSTR(history_json, 1, 50));
  `);
  _db = db;
}

function getDb(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error("DB not ready");
  return _db;
}

export interface HistoryRow {
  id:           number;
  date_text:    string;
  time_text:    string;
  history_json: string;
}

function nowParts(): { dateText: string; timeText: string } {
  const now = new Date();
  const p   = (n: number) => String(n).padStart(2, "0");
  return {
    dateText: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`,
    timeText: `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`,
  };
}

export async function insertHistory(entry: Record<string, unknown>): Promise<void> {
  try {
    const { dateText, timeText } = nowParts();
    await getDb().runAsync(
      "INSERT INTO user_history (date_text, time_text, history_json) VALUES (?, ?, ?)",
      [dateText, timeText, JSON.stringify(entry)],
    );
  } catch (err) {
    console.warn("[db] insertHistory:", err);
  }
}

export async function fetchHistory(limit = 500): Promise<HistoryRow[]> {
  return getDb().getAllAsync<HistoryRow>(
    "SELECT id, date_text, time_text, history_json FROM user_history ORDER BY date_text DESC, time_text DESC LIMIT ?",
    [limit],
  );
}

async function fetchAllForExport(): Promise<HistoryRow[]> {
  return getDb().getAllAsync<HistoryRow>(
    "SELECT id, date_text, time_text, history_json FROM user_history ORDER BY date_text ASC, time_text ASC, id ASC",
  );
}

export async function clearHistory(): Promise<void> {
  const db = getDb();
  await db.execAsync("DROP TABLE IF EXISTS user_history;");
  await db.execAsync(`
    CREATE TABLE user_history (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      date_text    TEXT NOT NULL,
      time_text    TEXT NOT NULL,
      history_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_h_date        ON user_history (date_text);
    CREATE INDEX IF NOT EXISTS idx_h_time        ON user_history (time_text);
    CREATE INDEX IF NOT EXISTS idx_h_json_prefix ON user_history (SUBSTR(history_json, 1, 50));
  `);
}

export async function exportHistoryAsSQL(): Promise<string> {
  const rows = await fetchAllForExport();
  if (rows.length === 0) return "-- No history entries\n";
  const esc = (s: string) => s.replace(/'/g, "''");
  const selects = rows.map((row, i) =>
    `SELECT ${i + 1} AS row_num, '${esc(row.date_text)}' AS date_text, '${esc(row.time_text)}' AS time_text, '${esc(row.history_json)}' AS history_json`
  );
  return selects.join("\nUNION ALL\n") + "\n;\n";
}

export async function exportHistoryAsJSON(): Promise<string> {
  const rows = await fetchAllForExport();
  const out: Record<string, unknown> = {};
  rows.forEach((row, i) => {
    let parsed: unknown;
    try { parsed = JSON.parse(row.history_json); } catch { parsed = row.history_json; }
    out[String(i + 1)] = {
      id:           row.id,
      date_text:    row.date_text,
      time_text:    row.time_text,
      history_json: parsed,
    };
  });
  return JSON.stringify(out, null, 2);
}
