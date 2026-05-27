import React, { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextEdit } from "../lib/TextEdit";
import { PasswordValidation } from "../lib/PasswordValidation";
import { S } from "../lib/styles";

export interface PasswordInputProps {
  label:            string;
  placeholder?:     string;
  state:            TextEdit;
  onChange:         (next: TextEdit) => void;
  // Validate the full password criteria (sign-up password field)
  validateCriteria?: boolean;
  // Validate that this field matches another value (confirm password field)
  matchTarget?:     string;
}

function runValidation(
  text:             string,
  validateCriteria: boolean,
  matchTarget?:     string,
): string {
  if (!text) return "";
  if (matchTarget !== undefined)
    return text === matchTarget ? "" : "Passwords do not match.";
  if (validateCriteria)
    return PasswordValidation.validate(text) ?? "";
  return "";
}

export default function PasswordInput({
  label,
  placeholder = "Password",
  state,
  onChange,
  validateCriteria = false,
  matchTarget,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  function handleChange(text: string) {
    const error = runValidation(text, validateCriteria, matchTarget);
    onChange(new TextEdit(text, error));
  }

  const hasError    = state.error !== "";
  const borderColor = hasError      ? "#F87171"
                    : state.isValid ? "#4ADE80"
                    :                 "#D1D5DB";

  const baseClass = Platform.OS === "web"
    ? "bg-white rounded-xl px-3.5 py-[11px] text-[15px] text-gray-900 focus:outline-none flex-1"
    : "bg-white rounded-xl px-3.5 py-[11px] text-[15px] text-gray-900 flex-1";

  return (
    <View style={{ marginBottom: 4 }}>
      <Text className={S.label}>{label}</Text>

      <View style={{
        flexDirection:   "row",
        alignItems:      "center",
        borderWidth:     1.5,
        borderColor,
        borderRadius:    12,
        backgroundColor: "#fff",
        marginBottom:    4,
        overflow:        "hidden",
      }}>
        <TextInput
          className={baseClass}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={state.value}
          onChangeText={handleChange}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={!visible}
          keyboardType="default"
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          style={{ paddingHorizontal: 12, paddingVertical: 11 }}
          accessibilityLabel={visible ? "Hide password" : "Show password"}
        >
          <Ionicons
            name={visible ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#9CA3AF"
          />
        </Pressable>
      </View>

      {hasError && (
        <View className={S.errorBox} style={{ marginBottom: 8 }}>
          <Text className={S.errorText}>{state.error}</Text>
        </View>
      )}
      {!hasError && <View style={{ marginBottom: 8 }} />}
    </View>
  );
}
