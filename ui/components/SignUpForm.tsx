import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { S } from "../lib/styles";
import { useUser, useNavigation, useAppSelector } from "../store/hooks";
import type { AppPage } from "../store/slices/navigationSlice";

export default function SignUpForm() {
  const [email, setEmail]   = useState("");
  const [phone, setPhone]   = useState("");
  const [error, setError]   = useState("");
  const { login }           = useUser();
  const { navigate }        = useNavigation();
  const defaultPage         = useAppSelector((s) => s.settings.defaultPage);

  function submit() {
    const e = email.trim();
    const p = phone.trim();
    if (!e && !p) {
      setError("Enter at least an email or phone number.");
      return;
    }
    login({ email: e, phone: p });
    navigate(defaultPage as AppPage);
  }

  return (
    <View>
      <Text className={S.label}>Email</Text>
      <TextInput
        className={S.input}
        placeholder="you@example.com"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={(v) => { setEmail(v); setError(""); }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <Text className={S.label}>Phone</Text>
      <TextInput
        className={S.input}
        placeholder="+1 555 000 0000"
        placeholderTextColor="#9CA3AF"
        value={phone}
        onChangeText={(v) => { setPhone(v); setError(""); }}
        keyboardType="phone-pad"
      />
      {error !== "" && (
        <View className={S.errorBox}>
          <Text className={S.errorText}>{error}</Text>
        </View>
      )}
      <Pressable className={S.button} onPress={submit}>
        <Text className={S.buttonText}>Sign Up</Text>
      </Pressable>
    </View>
  );
}
