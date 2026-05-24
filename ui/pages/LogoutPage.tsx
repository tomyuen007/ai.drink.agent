import React from "react";
import { Pressable, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { S } from "../lib/styles";
import Menu from "../components/Menu";
import { useUser, useNavigation } from "../store/hooks";

export default function LogoutPage() {
  const { email, phone, logout, isLoggedIn } = useUser();
  const { navigate }                         = useNavigation();

  function handleLogout() {
    logout();
    navigate("login");
  }

  return (
    <View className={S.container}>
      <StatusBar style="dark" />
      <View className={S.pageHeader}>
        <Menu />
        <Text className={S.pageHeaderTitle}>Account</Text>
        <View className={S.pageHeaderSpacer} />
      </View>

      <View className={S.authBody}>
        <View className={S.authCard}>
          <Text className={S.authTitle}>Your account</Text>
          <Text className={S.authSubtitle}>Logged in as</Text>

          {email !== "" && (
            <View className={S.userInfoBox}>
              <Text className={S.userInfoLabel}>Email</Text>
              <Text className={S.userInfoValue}>{email}</Text>
            </View>
          )}
          {phone !== "" && (
            <View className={S.userInfoBox}>
              <Text className={S.userInfoLabel}>Phone</Text>
              <Text className={S.userInfoValue}>{phone}</Text>
            </View>
          )}

          <Pressable
            className={`${S.logoutButton} ${!isLoggedIn ? S.buttonDisabled : ""}`}
            onPress={handleLogout}
            disabled={!isLoggedIn}
          >
            <Text className={S.logoutButtonText}>Log Out</Text>
          </Pressable>

          <Pressable className={S.linkButton} onPress={() => navigate("sign-up")}>
            <Text className={S.linkButtonText}>Create a new account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
