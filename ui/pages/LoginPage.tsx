import React from "react";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import LoginForm from "../components/LoginForm";
import { useNavigation } from "../store/hooks";

export default function LoginPage() {
  const { navigate } = useNavigation();

  return (
    <View className={S.container}>
      <StatusBar style="dark" />
      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Log In</Text>
        <View className={S.pageHeaderSpacer} />
      </View>
      <View className={S.authBody}>
        <View className={S.authCard}>
          <Text className={S.authTitle}>Welcome back</Text>
          <Text className={S.authSubtitle}>Log in to continue</Text>
          <LoginForm />
          <Pressable className={S.linkButton} onPress={() => navigate("sign-up")}>
            <Text className={S.linkButtonText}>Don't have an account? Sign up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
