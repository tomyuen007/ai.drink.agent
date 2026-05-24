import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { S } from "../lib/styles";
import { useNavigation, useUser } from "../store/hooks";
import type { AppPage } from "../store/slices/navigationSlice";

interface MenuItem {
  label: string;
  page:  AppPage;
}

const LOGGED_IN_ITEMS: MenuItem[] = [
  { label: "Home",       page: "home" },
  { label: "Weather AI", page: "weather-ai" },
  { label: "History",    page: "history" },
  { label: "Settings",   page: "settings" },
  { label: "Account",    page: "logout" },
];

const LOGGED_OUT_ITEMS: MenuItem[] = [
  { label: "Log In",  page: "login" },
  { label: "Sign Up", page: "sign-up" },
];

export default function Menu() {
  const [open, setOpen]    = useState(false);
  const { navigate }       = useNavigation();
  const { isLoggedIn }     = useUser();
  const items              = isLoggedIn ? LOGGED_IN_ITEMS : LOGGED_OUT_ITEMS;

  function go(page: AppPage) {
    setOpen(false);
    navigate(page);
  }

  return (
    <>
      <Pressable className={S.menuButton} onPress={() => setOpen(true)}>
        <Text className={S.menuIcon}>☰</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className={S.menuOverlay}>
          <View className={S.menuDrawer}>
            <Pressable className={S.menuCloseBtn} onPress={() => setOpen(false)}>
              <Text className={S.menuCloseBtnText}>✕</Text>
            </Pressable>
            <Text className={S.menuHeading}>Menu</Text>
            {items.map((item) => (
              <Pressable key={item.page} className={S.menuItem} onPress={() => go(item.page)}>
                <Text className={S.menuItemText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
        </View>
      </Modal>
    </>
  );
}
