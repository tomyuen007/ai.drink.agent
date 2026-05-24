import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { S } from "../lib/styles";
import { useUser, useAppSelector } from "../store/hooks";

export default function LoginForm() {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState("");
  const { login }           = useUser();
  const router              = useRouter();
  const defaultPage         = useAppSelector((s) => s.settings.defaultPage);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter your email or phone number.");
      return;
    }
    const isEmail = trimmed.includes("@");
    login(isEmail ? { email: trimmed } : { phone: trimmed });
    router.replace(defaultPage === "weather-ai" ? "/weather-ai" : "/home");
  }

  return (
    <View>
      <Text className={S.label}>Email or Phone</Text>
      <TextInput
        className={S.input}
        placeholder="you@example.com or +1 555 000 0000"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={(v) => { setValue(v); setError(""); }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      {error !== "" && (
        <View className={S.errorBox}>
          <Text className={S.errorText}>{error}</Text>
        </View>
      )}
      <Pressable className={S.button} onPress={submit}>
        <Text className={S.buttonText}>Log In</Text>
      </Pressable>
    </View>
  );
}
