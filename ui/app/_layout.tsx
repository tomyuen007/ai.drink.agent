import "../global.css";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { syncStateFromEnv, isEnvStateAvailable } from "../lib/envState";
import SyncStatesModal from "../components/SyncStatesModal";
import type { ISyncStates } from "../lib/SyncStates";
import { FontProvider } from "../lib/FontContext";
import { initDb } from "../lib/db";

function AppInit() {
  const dispatch  = useAppDispatch();
  const stateSync  = useAppSelector((s) => s.settings.stateSync);
  const theme      = useAppSelector((s) => s.settings.theme);
  const online     = useAppSelector((s) => s.settings.online);
  const historyLog = useAppSelector((s) => s.settings.historyLog);
  const modalRef   = useRef<ISyncStates>(null);

  // Append online/offline status to browser tab title on web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.title = `Weather AI — ${online ? "Online" : "Offline"}`;
  }, [online]);

  // Apply dark class to <html> so NativeWind class-mode dark mode works on web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const html = document.documentElement;
    if (theme === "dark") { html.classList.add("dark"); return; }
    if (theme === "light") { html.classList.remove("dark"); return; }
    // "system" — mirror prefers-color-scheme
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) html.classList.add("dark");
      else html.classList.remove("dark");
    };
    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    async function init() {
      if (historyLog === 1) await initDb();
      if (!stateSync) return;
      if (isEnvStateAvailable()) {
        syncStateFromEnv(dispatch);
      } else {
        modalRef.current?.open();
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLog]);

  return (
    <SyncStatesModal
      ref={modalRef}
      id="app-sync-states"
      tag="modal"
      callback={() => modalRef.current?.close()}
    />
  );
}

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#0EA5E9" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <FontProvider>
          <AppInit />
          <Slot />
        </FontProvider>
      </PersistGate>
    </Provider>
  );
}
