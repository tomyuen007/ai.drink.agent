import React from "react";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import SignUpForm from "../components/SignUpForm";
import { useNavigation } from "../store/hooks";

export default function SignUpPage() {
  const { navigate } = useNavigation();

  return (
    <View className={S.container}>
      <StatusBar style="dark" />
      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Sign Up</Text>
        <View className={S.pageHeaderSpacer} />
      </View>
      <View className={S.authBody}>
        <View className={S.authCard}>
          <Text className={S.authTitle}>Create account</Text>
          <Text className={S.authSubtitle}>Enter your email or phone to get started</Text>
          <SignUpForm />
          <Pressable className={S.linkButton} onPress={() => navigate("login")}>
            <Text className={S.linkButtonText}>Already have an account? Log in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
