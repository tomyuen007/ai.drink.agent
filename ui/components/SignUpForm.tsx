import React, { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { S } from "../lib/styles";
import { TextEdit } from "../lib/TextEdit";
import { UserStore } from "../lib/UserStore";
import AppTextInput from "./AppTextInput";
import PasswordInput from "./PasswordInput";

export default function SignUpForm() {
  const [emailField,  setEmailField]  = useState(TextEdit.empty());
  const [phoneField,  setPhoneField]  = useState(TextEdit.empty());
  const [password,    setPassword]    = useState(TextEdit.empty());
  const [confirmPass, setConfirmPass] = useState(TextEdit.empty());
  const router                        = useRouter();

  // Re-validate confirm whenever the original password changes
  useEffect(() => {
    if (confirmPass.value.trim().length > 0) {
      const error = confirmPass.value === password.value ? "" : "Passwords do not match.";
      setConfirmPass(new TextEdit(confirmPass.value, error));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password.value]);

  const emailEmpty = emailField.value.trim().length === 0;
  const phoneEmpty = phoneField.value.trim().length === 0;

  const canSubmit =
    (!emailEmpty || !phoneEmpty) &&
    (emailEmpty || (emailField.value.trim().length > 0 && emailField.error === "")) &&
    (phoneEmpty || (phoneField.value.trim().length > 0 && phoneField.error === "")) &&
    password.value.trim().length > 0 && password.error === "" &&
    confirmPass.value.trim().length > 0 && confirmPass.error === "" &&
    confirmPass.value === password.value;

  async function submit() {
    await UserStore.register(
      emailField.value.trim(),
      phoneField.value.trim(),
      password.value,
    );
    // Both new and existing users → login page
    router.replace("/login");
  }

  return (
    <View>
      <AppTextInput
        label="Email"
        placeholder="you@example.com"
        keyboardType="email-address"
        validationType="email"
        state={emailField}
        onChange={setEmailField}
      />
      <AppTextInput
        label="Phone"
        placeholder="+1 555 000 0000"
        keyboardType="phone-pad"
        validationType="phone"
        state={phoneField}
        onChange={setPhoneField}
      />
      <PasswordInput
        label="Password"
        validateCriteria
        state={password}
        onChange={setPassword}
      />
      <PasswordInput
        label="Confirm Password"
        placeholder="Re-enter password"
        matchTarget={password.value}
        state={confirmPass}
        onChange={setConfirmPass}
      />
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
          <Text className={S.buttonText}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}
