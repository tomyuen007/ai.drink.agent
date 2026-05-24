import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import type { TextStyle } from "react-native";
import { useAppSelector } from "../store/hooks";
import type { FontFamily, FontSizeScale, FontWeightSetting, FontStyleSetting } from "./Settings";

// ── Resolved pixel sizes per scale setting ────────────────────────────────────
export const FONT_SIZE_PX: Record<FontSizeScale, number> = {
  small:  13,
  medium: 15,
  large:  17,
  xl:     19,
};

const FAMILY_MAP = Platform.select<Record<FontFamily, string | undefined>>({
  ios:     { system: undefined, serif: "Georgia",        monospace: "Courier New" },
  android: { system: undefined, serif: "serif",          monospace: "monospace"   },
  default: { system: undefined, serif: "Georgia, serif", monospace: "monospace"   },
})!;

const WEIGHT_MAP: Record<FontWeightSetting, TextStyle["fontWeight"]> = {
  light:   "300",
  regular: "400",
  medium:  "500",
  bold:    "700",
};

// ── Context shape ─────────────────────────────────────────────────────────────
interface FontContextValue {
  textStyle: TextStyle;  // fontFamily + fontWeight + fontStyle resolved
  fontSize:  number;     // resolved base px value (use explicitly where needed)
}

const FontContext = createContext<FontContextValue>({
  textStyle: {},
  fontSize:  15,
});

// ── Provider (reads from Redux; place inside PersistGate) ─────────────────────
export function FontProvider({ children }: { children: React.ReactNode }) {
  const fontFamily = useAppSelector((s) => s.settings.fontFamily as FontFamily);
  const fontSize   = useAppSelector((s) => s.settings.fontSize   as FontSizeScale);
  const fontWeight = useAppSelector((s) => s.settings.fontWeight as FontWeightSetting);
  const fontStyle  = useAppSelector((s) => s.settings.fontStyle  as FontStyleSetting);

  const resolvedFamily = FAMILY_MAP[fontFamily];
  const resolvedWeight = WEIGHT_MAP[fontWeight];
  const resolvedSize   = FONT_SIZE_PX[fontSize] ?? 15;

  const textStyle: TextStyle = {
    fontWeight: resolvedWeight,
    fontStyle:  fontStyle as TextStyle["fontStyle"],
  };
  if (resolvedFamily !== undefined) textStyle.fontFamily = resolvedFamily;

  return (
    <FontContext.Provider value={{ textStyle, fontSize: resolvedSize }}>
      {children}
    </FontContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFontStyle(): FontContextValue {
  return useContext(FontContext);
}
