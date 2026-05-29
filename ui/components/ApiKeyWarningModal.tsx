import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ApiKeyWarningModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}>
        <View style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 16,
        }}>

          {/* Header */}
          <View style={{
            backgroundColor: "#DC2626",
            paddingVertical: 20,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}>
            <Ionicons name="warning" size={28} color="#fff" />
            <Text style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: "700",
              flex: 1,
            }}>
              Anthropic API Key Required
            </Text>
          </View>

          {/* Body */}
          <View style={{
            backgroundColor: "#FFF1F1",
            paddingVertical: 24,
            paddingHorizontal: 24,
            gap: 16,
          }}>
            <Text style={{ fontSize: 15, color: "#1F2937", lineHeight: 22 }}>
              The Anthropic API key is set to the placeholder value{" "}
              <Text style={{ fontFamily: "monospace", fontWeight: "600", color: "#DC2626" }}>
                sk-ant-your-key-here
              </Text>
              . The AI will not respond until a valid key is provided.
            </Text>

            <View style={{
              backgroundColor: "#FEE2E2",
              borderLeftWidth: 4,
              borderLeftColor: "#DC2626",
              borderRadius: 6,
              padding: 14,
              gap: 8,
            }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#991B1B" }}>
                How to fix:
              </Text>
              <Text style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 20 }}>
                1. Copy{" "}
                <Text style={{ fontFamily: "monospace" }}>sample.do.not.share.json</Text>
                {" "}to{" "}
                <Text style={{ fontFamily: "monospace" }}>do.not.share.json</Text>
                {" "}in the project root.
              </Text>
              <Text style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 20 }}>
                2. Replace{" "}
                <Text style={{ fontFamily: "monospace" }}>sk-ant-your-key-here</Text>
                {" "}with your real Anthropic API key.
              </Text>
              <Text style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 20 }}>
                3. Restart the Python agent.
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: "#6B7280", lineHeight: 18 }}>
              Get your key at{" "}
              <Text style={{ color: "#DC2626", fontWeight: "600" }}>
                console.anthropic.com
              </Text>
              . Never commit{" "}
              <Text style={{ fontFamily: "monospace" }}>do.not.share.json</Text>
              {" "}— it is gitignored.
            </Text>
          </View>

          {/* Footer */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#B91C1C" : "#DC2626",
              paddingVertical: 14,
              alignItems: "center",
            })}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              Dismiss
            </Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}
