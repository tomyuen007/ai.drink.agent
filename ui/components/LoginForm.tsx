import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { S } from "../lib/styles";
import { useUser, useAppSelector } from "../store/hooks";
import { TextEdit } from "../lib/TextEdit";
import { UserStore } from "../lib/UserStore";
import AppTextInput from "./AppTextInput";
import PasswordInput from "./PasswordInput";

export default function LoginForm() {
  const [field,      setField]      = useState(TextEdit.empty());
  const [password,   setPassword]   = useState(TextEdit.empty());
  const [formError,  setFormError]  = useState("");
  const { login }                   = useUser();
  const router                      = useRouter();
  const defaultPage                 = useAppSelector((s) => s.settings.defaultPage);

  const canSubmit =
    field.value.trim().length > 0 && field.error === "" &&
    password.value.trim().length > 0 && password.error === "";

  async function submit() {
    const trimmed = field.value.trim();
    const ok      = await UserStore.verify(trimmed, password.value);
    if (!ok) {
      setFormError("Invalid email, phone, or password.");
      return;
    }
    setFormError("");
    login(trimmed.includes("@") ? { email: trimmed } : { phone: trimmed });
    router.replace(defaultPage === "weather-ai" ? "/weather-ai" : "/home");
  }

  return (
    <View>
      <AppTextInput
        label="Email or Phone"
        placeholder="you@example.com or +1 555 000 0000"
        keyboardType="email-address"
        validationType="emailOrPhone"
        state={field}
        onChange={setField}
      />
      <PasswordInput
        label="Password"
        validateCriteria
        state={password}
        onChange={setPassword}
      />
      {formError !== "" && (
        <View className={S.errorBox} style={{ marginBottom: 8 }}>
          <Text className={S.errorText}>{formError}</Text>
        </View>
      )}
      {/* Outer View owns opacity so it never conflicts with Pressable's className */}
      <View style={{ opacity: canSubmit ? 1 : 0.45, marginBottom: 20 }}>
        <Pressable
          className={S.button}
          style={[
            { marginBottom: 0 },
            Platform.OS === "web" ? { cursor: canSubmit ? "pointer" : "default" } as any : null,
          ]}
          onPress={submit}
          disabled={!canSubmit}
        >
          <Text className={S.buttonText}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}
