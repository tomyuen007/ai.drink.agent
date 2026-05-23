import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Local dev: set EXPO_PUBLIC_AGENT_URL in ui/.env
// Android emulator needs "http://10.0.2.2:8001"; physical device needs your machine IP
const AGENT_URL = process.env.EXPO_PUBLIC_AGENT_URL ?? "http://localhost:8001";

const SUGGESTIONS = [
  "What's the weather like today?",
  "Should I bring an umbrella?",
  "What should I wear today?",
  "Give me a 3-day forecast.",
  "Good for running outside?",
];

interface AskResponse {
  city: string;
  question: string;
  answer: string;
  error?: string;
}

export default function App() {
  const [city, setCity] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!city.trim() || !question.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(`${AGENT_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: city.trim(), question: question.trim() }),
      });
      const data: AskResponse = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `Server error: ${res.status}`);
      } else {
        setResult(data);
      }
    } catch {
      setError(`Could not reach agent at ${AGENT_URL}. Is it running?`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Weather AI</Text>
          <Text style={styles.subtitle}>Claude · MCP · RAG · Open-Meteo</Text>
        </View>

        {/* Inputs */}
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Toronto, Tokyo, London"
          placeholderTextColor="#9CA3AF"
          value={city}
          onChangeText={setCity}
          autoCorrect={false}
        />

        <Text style={styles.label}>Question</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Should I bring an umbrella?"
          placeholderTextColor="#9CA3AF"
          value={question}
          onChangeText={setQuestion}
        />

        {/* Suggestion chips */}
        <Text style={styles.suggestLabel}>Quick questions:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsRow}
        >
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.chip} onPress={() => setQuestion(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Submit */}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={ask}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ask Claude</Text>
          )}
        </Pressable>

        {/* Answer */}
        {result && (
          <View style={styles.answerBox}>
            <Text style={styles.answerCity}>{result.city}</Text>
            <Text style={styles.answerQuestion}>"{result.question}"</Text>
            <Text style={styles.answerText}>{result.answer}</Text>
          </View>
        )}

        {/* Error */}
        {error !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tech badges */}
        <View style={styles.badges}>
          {["MCP", "RAG", "Agent", "Claude"].map((b) => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E0F2FE" },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  header: { alignItems: "center", marginBottom: 28 },
  title: { fontSize: 28, fontWeight: "700", color: "#0369A1" },
  subtitle: { fontSize: 12, color: "#64748B", marginTop: 4 },

  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
  },

  suggestLabel: { fontSize: 12, color: "#64748B", marginBottom: 8 },
  chipsRow: { marginBottom: 20 },
  chip: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  chipText: { fontSize: 12, color: "#0369A1" },

  button: {
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  answerBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  answerCity: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16A34A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  answerQuestion: {
    fontSize: 13,
    color: "#4B5563",
    fontStyle: "italic",
    marginVertical: 6,
  },
  answerText: { fontSize: 15, color: "#111827", lineHeight: 23 },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: "#B91C1C", fontSize: 13 },

  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  badge: {
    backgroundColor: "#EDE9FE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, color: "#6D28D9", fontWeight: "600" },
});
