import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initDb, clearHistory } from "../lib/db";

// Developer utility route — opened by clear-web.sh
// Wipes all redux-persist state (AsyncStorage/localStorage) and SQLite history,
// then reloads to the root so the store re-initialises from blank storage.
// Only meaningful on web; on native it still clears but does not reload.
export default function ClearData() {
  const [status, setStatus] = useState("Clearing all data…");

  useEffect(() => {
    async function run() {
      try {
        setStatus("Clearing activity history…");
        await initDb();          // no-op if already open; required before clearHistory
        await clearHistory();    // DROP + recreate user_history table in SQLite / OPFS

        setStatus("Clearing settings, user, and weather data…");
        await AsyncStorage.clear(); // removes all redux-persist keys from localStorage

        setStatus("Done — reloading…");
        if (Platform.OS === "web") {
          window.location.href = "/"; // full reload so Redux store re-initialises
        }
      } catch (err) {
        setStatus(`Error: ${String(err)}`);
      }
    }
    run();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <ActivityIndicator size="large" color="#0EA5E9" />
      <Text style={{ color: "#6B7280", fontSize: 15 }}>{status}</Text>
    </View>
  );
}
