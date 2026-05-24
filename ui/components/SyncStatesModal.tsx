import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { S } from "../lib/styles";
import type { IComponentBase } from "../lib/ComponentBase";
import type { ISyncStates } from "../lib/SyncStates";
import { useAppDispatch } from "../store/hooks";
import { applyPayload, clearAllState, isEnvStateAvailable, syncStateFromEnv, type SyncPayload } from "../lib/envState";

export interface ISyncStatesProps extends IComponentBase {}

const PLACEHOLDER = JSON.stringify(
  {
    user:      { email: "", phone: "" },
    settings:  {
      online: true, stateSync: true, llmProvider: "env-default",
      theme: "system", notifications: true,
      defaultCity: "", defaultPage: "home",
      fontFamily: "system", fontSize: "medium",
      fontWeight: "regular", fontStyle: "normal",
    },
    weather:   { city: "", question: "" },
    questions: { items: [] },
  },
  null,
  2
);

const SyncStatesModal = forwardRef<ISyncStates, ISyncStatesProps>(
  ({ id, tag, callback }, ref) => {
    const dispatch          = useAppDispatch();
    const [visible, setVisible] = useState(false);
    const [json, setJson]   = useState("");
    const [error, setError] = useState("");
    const envAvailable      = isEnvStateAvailable();

    useImperativeHandle(ref, () => ({
      id,
      tag,
      callback(): typeof this { callback?.(); return this; },
      describe: () => `[${tag}] ${id}`,
      open:  () => { setJson(""); setError(""); setVisible(true); },
      close: () => setVisible(false),
    }));

    function applyDefaults() {
      syncStateFromEnv(dispatch);
      setVisible(false);
    }

    function clearSettings() {
      clearAllState(dispatch);
      setJson("");
      setError("");
    }

    function apply() {
      const trimmed = json.trim();
      if (!trimmed) {
        setError("Paste a JSON object first.");
        return;
      }
      let payload: SyncPayload;
      try {
        payload = JSON.parse(trimmed) as SyncPayload;
      } catch {
        setError("Invalid JSON — check formatting and try again.");
        return;
      }
      applyPayload(dispatch, payload);
      setVisible(false);
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className={S.modalOverlay}>
          <View className={S.modalSheet}>
            <Text className={S.modalTitle}>Sync State</Text>
            <Text className={S.modalBody}>
              No .env state vars found. Paste a JSON object below to seed the app state.
            </Text>

            <Pressable
              className={`${S.outlineButton} ${!envAvailable ? S.buttonDisabled : ""}`}
              style={{ marginTop: 12, marginBottom: 0 }}
              onPress={applyDefaults}
              disabled={!envAvailable}
            >
              <Text className={S.outlineButtonText}>Default Settings</Text>
            </Pressable>

            <Pressable
              className={S.outlineButton}
              style={{ marginTop: 8, marginBottom: 0, borderColor: "#FCA5A5" }}
              onPress={clearSettings}
            >
              <Text className={S.outlineButtonText} style={{ color: "#DC2626" }}>Clear Settings</Text>
            </Pressable>

            <TextInput
              value={json}
              onChangeText={(v) => { setJson(v); setError(""); }}
              placeholder={PLACEHOLDER}
              placeholderTextColor="#9CA3AF"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                marginTop: 12,
                borderWidth: 1.5,
                borderColor: error ? "#FCA5A5" : "#D1D5DB",
                borderRadius: 10,
                padding: 10,
                minHeight: 180,
                fontSize: 12,
                fontFamily: Platform.OS === "web" ? "monospace" : undefined,
                color: "#111827",
                backgroundColor: "#F9FAFB",
                textAlignVertical: "top",
              }}
            />

            {error !== "" && (
              <View className={S.errorBox} style={{ marginTop: 8 }}>
                <Text className={S.errorText}>{error}</Text>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <Pressable
                style={{ flex: 1 }}
                className={S.modalClose}
                onPress={() => setVisible(false)}
              >
                <Text className={S.modalCloseText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1 }}
                className={S.button}
                onPress={apply}
              >
                <Text className={S.buttonText}>Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

SyncStatesModal.displayName = "SyncStatesModal";
export default SyncStatesModal;
