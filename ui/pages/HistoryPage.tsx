import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, SectionList, Share, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import AppText from "../components/AppText";
import { clearHistory, exportHistoryAsJSON, exportHistoryAsSQL, fetchHistory, type HistoryRow } from "../lib/db";

type ExportType = "sql" | "json";

interface Section {
  title: string;
  data:  HistoryRow[];
}

function groupByDate(rows: HistoryRow[]): Section[] {
  const map = new Map<string, HistoryRow[]>();
  for (const row of rows) {
    const bucket = map.get(row.date_text) ?? [];
    bucket.push(row);
    map.set(row.date_text, bucket);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

function parseLabel(json: string): string {
  try {
    const obj = JSON.parse(json) as { label?: string };
    return obj.label ?? json.slice(0, 80);
  } catch {
    return json.slice(0, 80);
  }
}

function prettyJson(json: string): string {
  try { return JSON.stringify(JSON.parse(json), null, 2); }
  catch { return json; }
}

function todayStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function triggerDownload(filename: string, content: string, mimeType: string) {
  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    await Share.share({ title: filename, message: content });
  }
}

function HistoryItem({ row }: { row: HistoryRow }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      style={{ paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: "#F3F4F6" }}
    >
      <View style={{ flexDirection: "row", gap: 10 }}>
        <AppText style={{ color: "#9CA3AF", fontSize: 11, width: 66, paddingTop: 1 }}>
          {row.time_text}
        </AppText>
        <AppText style={{ flex: 1, color: "#111827", fontSize: 13, lineHeight: 19 }}>
          {parseLabel(row.history_json)}
        </AppText>
      </View>
      {expanded && (
        <Text
          selectable
          style={{
            marginTop: 8,
            marginLeft: 76,
            fontSize: 11,
            color: "#6B7280",
            fontFamily: Platform.OS === "web" ? "monospace" : "Courier New",
            lineHeight: 16,
          }}
        >
          {prettyJson(row.history_json)}
        </Text>
      )}
    </Pressable>
  );
}

export default function HistoryPage() {
  const [sections,   setSections]   = useState<Section[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [exportType, setExportType] = useState<ExportType>("sql");
  const [exporting,  setExporting]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchHistory(500);
      setSections(groupByDate(rows));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function onClear() {
    const msg = "Drop and recreate the history table? All entries will be permanently deleted.";
    const doIt = () => clearHistory().then(() => setSections([]));
    if (Platform.OS === "web") {
      if (window.confirm(msg)) doIt();
    } else {
      Alert.alert("Reset History", msg, [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: doIt },
      ]);
    }
  }

  async function onExport() {
    setExporting(true);
    try {
      if (exportType === "sql") {
        const content = await exportHistoryAsSQL();
        await triggerDownload(`history_${todayStamp()}.sql`, content, "text/plain");
      } else {
        const content = await exportHistoryAsJSON();
        await triggerDownload(`history_${todayStamp()}.json`, content, "application/json");
      }
    } finally {
      setExporting(false);
    }
  }

  return (
    <View className={S.container}>
      <StatusBar style="dark" />

      {/* Main header */}
      <View className={S.pageHeader}>
        <Menu />
        <AppText className={S.pageHeaderTitle}>History</AppText>
        <Pressable onPress={onClear} style={{ width: 40, alignItems: "flex-end" }}>
          <AppText style={{ color: "#DC2626", fontSize: 13, fontWeight: "700" }}>Clear</AppText>
        </Pressable>
      </View>

      {/* Export toolbar */}
      <View style={{
        flexDirection:   "row",
        alignItems:      "center",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderColor:     "#E5E7EB",
        paddingHorizontal: 12,
        paddingVertical:  4,
      }}>
        <AppText style={{ fontSize: 12, color: "#6B7280", marginRight: 4 }}>Export as</AppText>
        <View style={{
          borderWidth:   1,
          borderColor:   "#D1D5DB",
          borderRadius:  8,
          overflow:      "hidden",
          flex:          1,
          maxWidth:      140,
        }}>
          <Picker
            selectedValue={exportType}
            onValueChange={(v) => setExportType(v as ExportType)}
            style={{ height: 36, color: "#111827" }}
          >
            <Picker.Item label="SQL  (UNION SELECT)" value="sql"  />
            <Picker.Item label="JSON (keyed by row)" value="json" />
          </Picker>
        </View>
        <Pressable
          onPress={onExport}
          disabled={exporting}
          style={{
            marginLeft:      10,
            backgroundColor: exporting ? "#BAE6FD" : "#0EA5E9",
            borderRadius:    8,
            paddingHorizontal: 16,
            paddingVertical:  7,
          }}
        >
          <AppText style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
            {exporting ? "Exporting…" : "Export"}
          </AppText>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#0EA5E9" />
      ) : sections.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <AppText style={{ color: "#9CA3AF", fontSize: 14 }}>No history yet</AppText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(row) => String(row.id)}
          renderItem={({ item }) => <HistoryItem row={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <View style={{
              backgroundColor: "#F0F9FF",
              paddingVertical:   6,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderColor:       "#BAE6FD",
            }}>
              <AppText style={{ fontSize: 11, fontWeight: "700", color: "#0369A1", letterSpacing: 0.5 }}>
                {title}
              </AppText>
            </View>
          )}
          stickySectionHeadersEnabled
        />
      )}
    </View>
  );
}
