import React from "react";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import { useNavigation } from "../store/hooks";
import Menu from "../components/Menu";

export default function HomePage() {
  const { navigate } = useNavigation();

  return (
    <View className={S.container}>
      <StatusBar style="dark" />

      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Home</Text>
        <View className={S.pageHeaderSpacer} />
      </View>

      <View className={S.mainBody}>
        <Text className={S.mainWelcome}>Weather AI</Text>
        <Text className={S.mainTagline}>
          Ask Claude about the weather anywhere in the world,{"\n"}
          powered by MCP, RAG, and Open-Meteo.
        </Text>
        <Pressable className={S.mainCTA} onPress={() => navigate("weather-ai")}>
          <Text className={S.mainCTAText}>Open Weather AI</Text>
        </Pressable>
      </View>
    </View>
  );
}
