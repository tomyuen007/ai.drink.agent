import React from "react";
import { KeyboardTypeOptions, Platform, Text, TextInput, View } from "react-native";
import { TextEdit } from "../lib/TextEdit";
import { EmailPhoneValidation } from "../lib/EmailPhoneValidation";
import { S } from "../lib/styles";

export type ValidationMode = "email" | "phone" | "emailOrPhone";

export interface AppTextInputProps {
  label:           string;
  placeholder?:    string;
  keyboardType?:   KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
  // Built-in validation type — used when cb is not provided
  validationType?: ValidationMode;
  // Custom validator: receives trimmed value, returns error message or null if valid
  cb?:             (value: string) => string | null;
  state:           TextEdit;
  onChange:        (next: TextEdit) => void;
}

function runValidation(
  text: string,
  validationType?: ValidationMode,
  cb?: (v: string) => string | null,
): string {
  const trimmed = text.trim();
  if (!trimmed) return "";  // empty → neutral; no error until user types something
  if (cb) return cb(trimmed) ?? "";
  if (validationType === "emailOrPhone") {
    const r = EmailPhoneValidation.validate(trimmed);
    return r.valid ? "" : r.error;
  }
  if (validationType === "email")
    return EmailPhoneValidation.validateEmail(trimmed) ?? "";
  if (validationType === "phone")
    return EmailPhoneValidation.validatePhone(trimmed) ?? "";
  return "";
}

export default function AppTextInput({
  label,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
  secureTextEntry,
  validationType,
  cb,
  state,
  onChange,
}: AppTextInputProps) {
  function handleChange(text: string) {
    const error = runValidation(text, validationType, cb);
    onChange(new TextEdit(text, error));
  }

  const hasError = state.error !== "";
  const borderColor = hasError ? "#F87171" : state.isValid ? "#4ADE80" : "#D1D5DB";

  const baseClass = Platform.OS === "web"
    ? "bg-white rounded-xl px-3.5 py-[11px] text-[15px] text-gray-900 focus:outline-none"
    : "bg-white rounded-xl px-3.5 py-[11px] text-[15px] text-gray-900";

  return (
    <View style={{ marginBottom: 4 }}>
      <Text className={S.label}>{label}</Text>
      <TextInput
        className={baseClass}
        style={{ borderWidth: 1.5, borderColor, borderRadius: 12, marginBottom: 4 }}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={state.value}
        onChangeText={handleChange}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {hasError && (
        <View className={S.errorBox} style={{ marginBottom: 8 }}>
          <Text className={S.errorText}>{state.error}</Text>
        </View>
      )}
      {!hasError && <View style={{ marginBottom: hasError ? 0 : 8 }} />}
    </View>
  );
}
