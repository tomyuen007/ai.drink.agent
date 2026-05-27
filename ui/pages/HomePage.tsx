import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import { useAppSelector } from "../store/hooks";

const AGENT_URL = process.env.EXPO_PUBLIC_AGENT_URL ?? "http://localhost:8001";

interface ChatMsg {
  id:    string;
  role:  "user" | "assistant" | "error";
  text:  string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id:   "welcome",
      role: "assistant",
      text: "Hi! I'm your Wine & Liquor AI assistant. Ask me anything about wines, spirits, cocktails, or pairings.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef             = useRef<ScrollView>(null);
  const online                = useAppSelector((s) => s.settings.online);
  const llmProvider           = useAppSelector((s) => s.settings.llmProvider);

  const canSend = input.trim().length > 0 && !loading;

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMsg = { id: makeId(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (!online) {
      setMessages((prev) => [
        ...prev,
        {
          id:   makeId(),
          role: "assistant",
          text: "I'm currently offline. Enable Online mode in Settings to get live responses.",
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const provider = llmProvider !== "env-default" ? llmProvider : undefined;
      const history  = messages.map((m) => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch(`${AGENT_URL}/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          message: text,
          history,
          ...(provider ? { provider } : {}),
        }),
      });
      const raw = await res.json();
      if (!res.ok || raw.error) throw new Error(raw.error ?? `Server error ${res.status}`);
      setMessages((prev) => [
        ...prev,
        {
          id:   makeId(),
          role: "assistant",
          text: raw.answer ?? raw.message ?? raw.response ?? JSON.stringify(raw),
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "error", text: e.message },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: any) {
    // Submit on Enter (web), but allow Shift+Enter for newlines
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
      e.preventDefault?.();
      send();
    }
  }

  return (
    <KeyboardAvoidingView
      className={S.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />

      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Wine & Liquor AI</Text>
        <View className={S.pageHeaderSpacer} />
      </View>

      <ScrollView
        ref={scrollRef}
        className={S.chatMessages}
        contentContainerClassName={S.chatMsgList}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={
              msg.role === "user"
                ? S.chatBubbleUser
                : msg.role === "error"
                ? S.chatBubbleErr
                : S.chatBubbleBot
            }
          >
            <Text
              className={
                msg.role === "user"
                  ? S.chatTextUser
                  : msg.role === "error"
                  ? S.chatTextErr
                  : S.chatTextBot
              }
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {loading && (
          <View className={S.chatBubbleBot} style={{ paddingVertical: 14 }}>
            <ActivityIndicator size="small" color="#0EA5E9" />
          </View>
        )}
      </ScrollView>

      <View className={S.chatInputRow}>
        <TextInput
          className={S.chatInput}
          placeholder="Ask about wines, spirits, cocktails…"
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          onKeyPress={handleKeyPress}
          multiline
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <Pressable
          className={canSend ? S.chatSend : S.chatSendDisabled}
          onPress={send}
          disabled={!canSend}
          style={Platform.OS === "web" && !canSend ? { cursor: "default" } as any : undefined}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
