import React, { useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import HistoryModal from "../components/HistoryModal";
import type { IHistoryModalHandle } from "../components/HistoryModalHandle";
import Menu from "../components/Menu";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { askWeather, setCity, setQuestion } from "../store/slices/weatherSlice";

const BADGE_INFO: Record<string, { label: string; description: string }> = {
  MCP: {
    label: "Model Context Protocol",
    description:
      "MCP is an open protocol by Anthropic that lets Claude call external tools. " +
      "This app uses a FastMCP stdio server (mcp/weather_server.py) that exposes " +
      "get_current_weather and get_forecast tools backed by Open-Meteo.",
  },
  RAG: {
    label: "Retrieval-Augmented Generation",
    description:
      "Before each Claude call, relevant chunks are fetched from a ChromaDB vector " +
      "store (rag/retriever.py) using all-MiniLM-L6-v2 embeddings. The top results " +
      "are injected into the system prompt as grounding context.",
  },
  Agent: {
    label: "Weather Agent",
    description:
      "A FastAPI server (server/weather_agent.py) running on port 8001. It orchestrates " +
      "the full pipeline: RAG retrieval → Claude tool_use loop → MCP weather call → " +
      "final answer. Supports both Anthropic and Ollama via LLM_PROVIDER in .env.",
  },
  Claude: {
    label: "Claude by Anthropic",
    description:
      "The LLM powering the answers. Defaults to claude-sonnet-4-6 via the Anthropic API. " +
      "Switch to a local Ollama model for free offline inference by setting " +
      "LLM_PROVIDER=ollama in .env.",
  },
};

export default function WeatherAI() {
  const dispatch     = useAppDispatch();
  const historyRef   = useRef<IHistoryModalHandle>(null);

  const city             = useAppSelector((s) => s.weather.city);
  const question         = useAppSelector((s) => s.weather.question);
  const result           = useAppSelector((s) => s.weather.result);
  const error            = useAppSelector((s) => s.weather.error);
  const loading          = useAppSelector((s) => s.weather.loading);
  const history          = useAppSelector((s) => s.weather.history);
  const questions = useAppSelector((s) => s.questions.items);

  function ask() {
    if (!city.trim() || !question.trim()) return;
    dispatch(askWeather({ city: city.trim(), question: question.trim() }));
  }

  function onBadgePress(badge: string) {
    const info = BADGE_INFO[badge];
    if (Platform.OS === "web") {
      alert(`${info.label}\n\n${info.description}`);
    } else {
      Alert.alert(info.label, info.description, [{ text: "Got it" }]);
    }
  }

  return (
    <KeyboardAvoidingView
      className={S.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Weather AI</Text>
        <View className={S.pageHeaderSpacer} />
      </View>

      <ScrollView
        contentContainerClassName={S.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View className={S.contentWrapper}>
          <Text className={S.subtitle}>Claude · MCP · RAG · Open-Meteo</Text>

          <Text className={S.label}>City</Text>
          <TextInput
            className={S.input}
            placeholder="e.g. Toronto, Tokyo, London"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={(v) => dispatch(setCity(v))}
            autoCorrect={false}
          />

          <Text className={S.label}>Question</Text>
          <TextInput
            className={S.input}
            placeholder="e.g. Should I bring an umbrella?"
            placeholderTextColor="#9CA3AF"
            value={question}
            onChangeText={(v) => dispatch(setQuestion(v))}
          />

          <Text className={S.pickerLabel}>Quick questions</Text>
          <View className={S.pickerContainer}>
            <Picker
              selectedValue={question}
              onValueChange={(v) => { if (v) dispatch(setQuestion(v)); }}
              style={{ color: "#111827" }}
            >
              <Picker.Item label="Select a question…" value="" color="#9CA3AF" />
              {questions.map((q) => (
                <Picker.Item key={q} label={q} value={q} />
              ))}
            </Picker>
          </View>

          <Pressable
            className={`${S.button} ${loading ? S.buttonDisabled : ""}`}
            onPress={ask}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text className={S.buttonText}>Ask Claude</Text>
            }
          </Pressable>

          {result && (
            <View className={S.answerBox}>
              <Text className={S.answerCity}>{result.city}</Text>
              <Text className={S.answerQuestion}>"{result.question}"</Text>
              <Text className={S.answerText}>{result.answer}</Text>
            </View>
          )}

          {error !== "" && (
            <View className={S.errorBox}>
              <Text className={S.errorText}>{error}</Text>
            </View>
          )}

          <View className={S.groupBox}>
            <View className={S.groupCaption}>
              <Text className={S.groupCaptionText}>Interactive</Text>
            </View>
            <View className={S.badgeRow}>
              {Object.keys(BADGE_INFO).map((b) => (
                <Pressable key={b} className={S.badge} onPress={() => onBadgePress(b)}>
                  <Text className={S.badgeText}>{b}</Text>
                </Pressable>
              ))}
              <Pressable className={S.historyBadge} onPress={() => historyRef.current?.open()}>
                <Text className={S.historyBadgeText}>
                  History{history.length > 0 ? ` (${history.length})` : ""}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <HistoryModal
        ref={historyRef}
        items={history}
        id="history-modal"
        tag="modal"
        callback={() => historyRef.current?.close()}
      />
    </KeyboardAvoidingView>
  );
}
