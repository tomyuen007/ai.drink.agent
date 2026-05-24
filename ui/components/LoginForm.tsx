import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { S } from "../lib/styles";
import { useUser, useNavigation, useAppSelector } from "../store/hooks";
import type { AppPage } from "../store/slices/navigationSlice";

export default function LoginForm() {
  const [value, setValue]   = useState("");
  const [error, setError]   = useState("");
  const { login }           = useUser();
  const { navigate }        = useNavigation();
  const defaultPage         = useAppSelector((s) => s.settings.defaultPage);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter your email or phone number.");
      return;
    }
    const isEmail = trimmed.includes("@");
    login(isEmail ? { email: trimmed } : { phone: trimmed });
    navigate(defaultPage as AppPage);
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
