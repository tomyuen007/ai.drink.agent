import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { S } from "../lib/styles";
import { useUser } from "../store/hooks";

interface MenuItem {
  label: string;
  href:  string;
}

const LOGGED_IN_ITEMS: MenuItem[] = [
  { label: "Home",       href: "/home"       },
  { label: "Weather AI", href: "/weather-ai" },
  { label: "History",    href: "/history"    },
  { label: "Settings",   href: "/settings"   },
  { label: "Account",    href: "/logout"     },
];

const LOGGED_OUT_ITEMS: MenuItem[] = [
  { label: "Log In",  href: "/login"    },
  { label: "Sign Up", href: "/sign-up"  },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const router          = useRouter();
  const { isLoggedIn }  = useUser();
  const items           = isLoggedIn ? LOGGED_IN_ITEMS : LOGGED_OUT_ITEMS;

  function go(href: string) {
    setOpen(false);
    router.push(href);
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
              <Pressable key={item.href} className={S.menuItem} onPress={() => go(item.href)}>
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
