import React from "react";
import { Text } from "react-native";
import type { TextProps } from "react-native";
import { useFontStyle } from "../lib/FontContext";

// Drop-in replacement for RN Text.
// Applies font context (family, weight, style) as the base; per-component
// className/style props merge on top so explicit overrides are preserved.
export default function AppText({ style, ...props }: TextProps) {
  const { textStyle } = useFontStyle();
  return <Text style={[textStyle, style]} {...props} />;
}
